-- ============================================================================
-- Supabase Schema: Retinal Screening Booking System
-- Tables: screening_centers, screening_slots, appointments, screening_center_staff
-- Enforces Row Level Security (RLS), Status constraints, and granular access
-- ============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCREENING CENTERS TABLE
CREATE TABLE IF NOT EXISTS public.screening_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'clinic', -- 'clinic', 'hospital', 'camp', 'mobile_van'
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_km_ref NUMERIC(5, 2) DEFAULT 0.0,
  operating_hours TEXT NOT NULL DEFAULT '09:00 AM - 05:00 PM',
  services TEXT[] NOT NULL DEFAULT ARRAY['Non-Mydriatic Fundus Photography', 'Automated AI Risk Triage'],
  equipment TEXT[] DEFAULT ARRAY['Topcon NW400', 'Remidio Fundus On Phone'],
  is_camp_active BOOLEAN NOT NULL DEFAULT FALSE,
  camp_dates TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SCREENING CENTER STAFF (For Provider Role-Based Center Authorization)
CREATE TABLE IF NOT EXISTS public.screening_center_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES public.screening_centers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users(id) in Supabase Auth
  role TEXT NOT NULL CHECK (role IN ('center_admin', 'screening_technician', 'reading_ophthalmologist')),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(center_id, user_id)
);

-- 3. SCREENING SLOTS TABLE (Scalable slot capacity & availability)
CREATE TABLE IF NOT EXISTS public.screening_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES public.screening_centers(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'Fundus Photography (5-min quick screening)',
  capacity INT NOT NULL DEFAULT 4,
  booked_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_capacity CHECK (capacity >= 1),
  CONSTRAINT chk_booked_count CHECK (booked_count >= 0 AND booked_count <= capacity)
);

-- 4. APPOINTMENTS TABLE
-- Exact Statuses: 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_code TEXT UNIQUE NOT NULL, -- E.g., 'BR-20260923-8821'
  center_id UUID NOT NULL REFERENCES public.screening_centers(id) ON DELETE RESTRICT,
  slot_id UUID REFERENCES public.screening_slots(id) ON DELETE SET NULL,
  patient_user_id UUID, -- references auth.users(id) when logged in, null for anonymous walk-ins
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  patient_age INT,
  diabetes_type TEXT DEFAULT 'Type 2',
  diabetes_duration_years INT,
  service_type TEXT NOT NULL DEFAULT 'Comprehensive Retinal Screening + Fundus Camera',
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'No Show')
  ) DEFAULT 'Confirmed',
  notes TEXT,
  reminder_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_sent_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  rescheduled_from_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_screening_centers_city ON public.screening_centers(city);
CREATE INDEX IF NOT EXISTS idx_screening_slots_center_date ON public.screening_slots(center_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_center_date ON public.appointments(center_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON public.appointments(reference_code);
CREATE INDEX IF NOT EXISTS idx_staff_user ON public.screening_center_staff(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.screening_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_center_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- SCREENING CENTERS POLICIES:
-- 1. Public / Patients can view all active screening centers
CREATE POLICY "Public can view active screening centers"
  ON public.screening_centers
  FOR SELECT
  USING (is_active = true);

-- 2. Staff can view their own center details
CREATE POLICY "Staff can view assigned centers"
  ON public.screening_centers
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.screening_center_staff WHERE center_id = public.screening_centers.id
    )
  );

-- SCREENING SLOTS POLICIES:
-- 1. Anyone (Patients / Public) can view active slots with available capacity
CREATE POLICY "Anyone can view available screening slots"
  ON public.screening_slots
  FOR SELECT
  USING (is_active = true);

-- 2. Providers can only manage available slots for their authorized screening center
CREATE POLICY "Providers can manage slots for authorized screening center"
  ON public.screening_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.screening_center_staff staff
      WHERE staff.center_id = public.screening_slots.center_id
        AND staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.screening_center_staff staff
      WHERE staff.center_id = public.screening_slots.center_id
        AND staff.user_id = auth.uid()
    )
  );

-- APPOINTMENTS POLICIES:
-- 1. Patients can ONLY see their own appointments
CREATE POLICY "Patients can only see their own appointments"
  ON public.appointments
  FOR SELECT
  USING (
    auth.uid() = patient_user_id
  );

-- 2. Patients can create an appointment for themselves
CREATE POLICY "Patients can book their own appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_user_id OR patient_user_id IS NULL
  );

-- 3. Patients can cancel or update their own appointments
CREATE POLICY "Patients can update their own appointments"
  ON public.appointments
  FOR UPDATE
  USING (
    auth.uid() = patient_user_id
  )
  WITH CHECK (
    auth.uid() = patient_user_id
  );

-- 4. Providers can ONLY view & manage appointments belonging to their authorized screening center
CREATE POLICY "Providers can view appointments for authorized center"
  ON public.appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.screening_center_staff staff
      WHERE staff.center_id = public.appointments.center_id
        AND staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can manage appointments for authorized center"
  ON public.appointments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.screening_center_staff staff
      WHERE staff.center_id = public.appointments.center_id
        AND staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.screening_center_staff staff
      WHERE staff.center_id = public.appointments.center_id
        AND staff.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SAMPLE INITIAL DATA (For local setup and demonstration)
-- ============================================================================

INSERT INTO public.screening_centers (id, name, slug, address, city, state, pin_code, phone, email, operating_hours, services, is_camp_active, camp_dates)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'South Bengaluru Community Eye Clinic', 'south-bengaluru-clinic', '42, 9th Main Road, Jayanagar 4th Block', 'Bengaluru', 'Karnataka', '560011', '+91 80 2663 4100', 'jayanagar.screening@retinaguard.org', '09:00 AM - 05:30 PM', ARRAY['Non-Mydriatic Fundus Photography', 'Macular OCT Scan', 'Automated AI Risk Triage', 'Optometry Consultation'], false, null),
  ('a2222222-2222-2222-2222-222222222222', 'Indiranagar Urban Health Centre', 'indiranagar-uhc', '100 Feet Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', 'Karnataka', '560038', '+91 80 2521 8890', 'indiranagar@retinaguard.org', '08:30 AM - 04:30 PM', ARRAY['Non-Mydriatic Fundus Photography', 'Automated AI Risk Triage', 'Diabetic Educator Counseling'], true, 'Sept 23 - Sept 30, 2026'),
  ('a3333333-3333-3333-3333-333333333333', 'Dharavi Community Retinal Outreach Hub', 'dharavi-hub', 'Near 90 Feet Road, Dharavi', 'Mumbai', 'Maharashtra', '400017', '+91 22 2407 1234', 'dharavi.camp@retinaguard.org', '09:00 AM - 06:00 PM', ARRAY['Rapid Fundus Screening', 'Automated AI Risk Triage', 'Point-of-Care HbA1c Test'], true, 'Oct 01 - Oct 15, 2026')
ON CONFLICT (id) DO NOTHING;
