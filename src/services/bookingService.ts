import { Appointment, AppointmentStatus, BookingFormInput, ScreeningCenterLocation, ScreeningSlot } from '../types/booking';
import { isLiveSupabaseConnected, supabase } from './supabaseClient';

// Baseline centers available in the directory
export const DEFAULT_SCREENING_CENTERS: ScreeningCenterLocation[] = [
  {
    id: 'center-blr-jayanagar',
    name: 'South Bengaluru Community Eye Clinic',
    slug: 'south-bengaluru-clinic',
    category: 'clinic',
    address: '42, 9th Main Road, Jayanagar 4th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560011',
    phone: '+91 80 2663 4100',
    email: 'jayanagar.screening@retinaguard.org',
    operatingHours: '09:00 AM - 05:30 PM (Mon - Sat)',
    services: [
      'Comprehensive Retinal Fundus Screening',
      'High-Resolution Macular OCT Scan',
      'Automated AI Retinal Microvascular Triage',
      'Optometry & Visual Acuity Exam',
    ],
    equipment: ['Topcon NW400 Non-Mydriatic Camera', 'Heidelberg Spectralis OCT'],
    distanceKm: 3.2,
    isCampActive: false,
    languagesSupported: ['English', 'Kannada', 'Hindi'],
  },
  {
    id: 'center-blr-indiranagar',
    name: 'Indiranagar Urban Health & Vision Centre',
    slug: 'indiranagar-uhc',
    category: 'camp',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560038',
    phone: '+91 80 2521 8890',
    email: 'indiranagar.camp@retinaguard.org',
    operatingHours: '08:30 AM - 04:30 PM (Daily)',
    services: [
      'Community Mobile Fundus Screening',
      'Automated AI Retinal Microvascular Triage',
      'Point-of-Care HbA1c Blood Glucose Test',
      'Diabetic Educator Dietary Guidance',
    ],
    equipment: ['Remidio Fundus on Phone (FOP) Portable Camera'],
    distanceKm: 5.8,
    isCampActive: true,
    campDates: 'Active Outreach: Sept 23 - Sept 30, 2026',
    languagesSupported: ['English', 'Kannada', 'Tamil', 'Hindi'],
  },
  {
    id: 'center-mum-dharavi',
    name: 'Dharavi Community Retinal Outreach Hub',
    slug: 'dharavi-hub',
    category: 'camp',
    address: 'Near 90 Feet Road, Transit Camp Sector 3, Dharavi',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400017',
    phone: '+91 22 2407 1234',
    email: 'dharavi.camp@retinaguard.org',
    operatingHours: '09:00 AM - 06:00 PM (Daily)',
    services: [
      'Rapid Walk-in Fundus Camera Screening',
      'Automated AI Retinal Microvascular Triage',
      'Free Specialist Tele-Ophthalmology Referral',
    ],
    equipment: ['Remidio NM-FOP Camera', 'Cloud AI Edge Processor'],
    distanceKm: 1.4,
    isCampActive: true,
    campDates: 'Active Outreach: Oct 01 - Oct 15, 2026',
    languagesSupported: ['Hindi', 'Marathi', 'Tamil', 'English'],
  },
  {
    id: 'center-del-aiims',
    name: 'Dr. R.P. Centre Community Vision Extension',
    slug: 'rp-centre-extension',
    category: 'hospital',
    address: 'Ansari Nagar, Ring Road, Near Gate 1',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110029',
    phone: '+91 11 2658 8500',
    email: 'rpcentre.outreach@retinaguard.org',
    operatingHours: '08:30 AM - 04:00 PM (Mon - Fri)',
    services: [
      'Comprehensive Retinal Fundus Screening',
      'High-Resolution Macular OCT Scan',
      'Automated AI Retinal Microvascular Triage',
      'Fluorescein Angiography Consultations',
    ],
    equipment: ['Zeiss Clarus 500 Ultra-Widefield', 'Cirrus HD-OCT 5000'],
    distanceKm: 6.1,
    isCampActive: false,
    languagesSupported: ['Hindi', 'English', 'Punjabi'],
  },
  {
    id: 'center-che-egmore',
    name: 'Regional Institute of Ophthalmology Extension',
    slug: 'egmore-rio-extension',
    category: 'hospital',
    address: 'Egmore High Road, Egmore',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600008',
    phone: '+91 44 2819 1944',
    email: 'rio.chennai@retinaguard.org',
    operatingHours: '09:00 AM - 04:30 PM (Mon - Sat)',
    services: [
      'Comprehensive Retinal Fundus Screening',
      'Macular OCT Scan',
      'Automated AI Retinal Microvascular Triage',
    ],
    equipment: ['Canon CR-2 AF Non-Mydriatic Camera'],
    distanceKm: 4.5,
    isCampActive: false,
    languagesSupported: ['Tamil', 'English'],
  },
  {
    id: 'center-hyd-lvpei',
    name: 'Kallam Anji Reddy Eye Health Centre',
    slug: 'lvpei-centre',
    category: 'hospital',
    address: 'Road No. 2, Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pinCode: '500034',
    phone: '+91 40 3061 2345',
    email: 'appointments@retinaguard.org',
    operatingHours: '08:30 AM - 05:00 PM (Mon - Sat)',
    services: [
      'Comprehensive Retinal Fundus Screening',
      'High-Resolution Macular OCT Scan',
      'Automated AI Retinal Microvascular Triage',
      'Diabetic Retinopathy Laser Clinic',
    ],
    equipment: ['Topcon Triton Swept-Source OCT', 'Canon CR-2 Plus'],
    distanceKm: 7.2,
    isCampActive: false,
    languagesSupported: ['Telugu', 'English', 'Hindi', 'Urdu'],
  },
];

// Helper to format ISO date to YYYY-MM-DD
function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Generate deterministic demo slots for a center across the next 14 days
function generateDemoSlotsForCenter(centerId: string): ScreeningSlot[] {
  const slots: ScreeningSlot[] = [];
  const baseDate = new Date(); // anchor to current runtime
  
  const timeWindows = [
    { start: '09:00 AM', end: '09:30 AM' },
    { start: '09:30 AM', end: '10:00 AM' },
    { start: '10:00 AM', end: '10:30 AM' },
    { start: '10:30 AM', end: '11:00 AM' },
    { start: '11:30 AM', end: '12:00 PM' },
    { start: '02:00 PM', end: '02:30 PM' },
    { start: '02:30 PM', end: '03:00 PM' },
    { start: '03:30 PM', end: '04:00 PM' },
    { start: '04:00 PM', end: '04:30 PM' },
  ];

  // Next 10 days (excluding Sundays for clinics)
  for (let i = 1; i <= 10; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    
    // Skip Sunday (0) for non-camp clinics
    if (d.getDay() === 0 && !centerId.includes('camp') && !centerId.includes('indiranagar')) {
      continue;
    }

    const dateStr = toIsoDate(d);

    timeWindows.forEach((tw, index) => {
      // Create some variance in capacity and booked count
      const capacity = 4;
      // deterministic pseudo-booked count based on day & slot index
      const pseudoBooked = (i * 3 + index) % 4;
      
      slots.push({
        id: `slot-${centerId}-${dateStr}-${index}`,
        centerId,
        date: dateStr,
        startTime: tw.start,
        endTime: tw.end,
        serviceType: 'Comprehensive Retinal Fundus Screening',
        capacity,
        bookedCount: Math.min(pseudoBooked, capacity - 1), // always leave at least 1 open
        isActive: true,
        isDemo: true,
      });
    });
  }

  return slots;
}

// Local Storage Keys
const STORAGE_KEY_APPOINTMENTS = 'retinaguard_appointments_v1';
const STORAGE_KEY_SLOTS = 'retinaguard_slots_v1';

class BookingService {
  private centers: ScreeningCenterLocation[] = DEFAULT_SCREENING_CENTERS;
  private slots: Map<string, ScreeningSlot[]> = new Map();
  private appointments: Appointment[] = [];

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    // Load custom slots
    try {
      const storedSlots = localStorage.getItem(STORAGE_KEY_SLOTS);
      if (storedSlots) {
        const parsed: ScreeningSlot[] = JSON.parse(storedSlots);
        parsed.forEach((s) => {
          const list = this.slots.get(s.centerId) || [];
          list.push(s);
          this.slots.set(s.centerId, list);
        });
      }
    } catch {
      // ignore storage errors
    }

    // Load appointments
    try {
      const storedAppts = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
      if (storedAppts) {
        this.appointments = JSON.parse(storedAppts);
      } else {
        // Seed initial sample appointments for provider dashboard demo
        this.seedInitialAppointments();
      }
    } catch {
      this.seedInitialAppointments();
    }
  }

  private persistAppointments() {
    try {
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(this.appointments));
    } catch (e) {
      console.warn('Failed to persist appointments to localStorage', e);
    }
  }

  private persistSlots() {
    try {
      const allSlots: ScreeningSlot[] = [];
      this.slots.forEach((slots) => allSlots.push(...slots));
      localStorage.setItem(STORAGE_KEY_SLOTS, JSON.stringify(allSlots));
    } catch (e) {
      console.warn('Failed to persist slots to localStorage', e);
    }
  }

  private seedInitialAppointments() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    this.appointments = [
      {
        id: 'seed-appt-01',
        referenceCode: 'BR-20260924-1048',
        centerId: 'center-blr-jayanagar',
        centerName: 'South Bengaluru Community Eye Clinic',
        centerAddress: '42, 9th Main Road, Jayanagar 4th Block',
        centerCity: 'Bengaluru',
        centerPhone: '+91 80 2663 4100',
        patientName: 'Ramesh Sundaram',
        patientPhone: '+91 98450 12345',
        patientEmail: 'ramesh.s@example.com',
        patientAge: 58,
        diabetesType: 'Type 2 (12 yrs duration)',
        serviceType: 'Comprehensive Retinal Fundus Screening',
        appointmentDate: toIsoDate(tomorrow),
        appointmentTime: '09:30 AM - 10:00 AM',
        status: 'Confirmed',
        notes: 'Referred after routine screening identified moderate microaneurysms.',
        reminderOptIn: true,
        reminderMethod: 'both',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: true,
      },
      {
        id: 'seed-appt-02',
        referenceCode: 'BR-20260924-2190',
        centerId: 'center-blr-jayanagar',
        centerName: 'South Bengaluru Community Eye Clinic',
        centerAddress: '42, 9th Main Road, Jayanagar 4th Block',
        centerCity: 'Bengaluru',
        centerPhone: '+91 80 2663 4100',
        patientName: 'Kavitha Narayanan',
        patientPhone: '+91 97401 56789',
        patientEmail: 'kavitha.n@example.com',
        patientAge: 49,
        diabetesType: 'Type 2 (6 yrs duration)',
        serviceType: 'High-Resolution Macular OCT Scan',
        appointmentDate: toIsoDate(tomorrow),
        appointmentTime: '10:30 AM - 11:00 AM',
        status: 'Confirmed',
        notes: 'Follow up scan for macular edema monitoring.',
        reminderOptIn: true,
        reminderMethod: 'sms',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: true,
      },
      {
        id: 'seed-appt-03',
        referenceCode: 'BR-20260925-3411',
        centerId: 'center-blr-indiranagar',
        centerName: 'Indiranagar Urban Health & Vision Centre',
        centerAddress: '100 Feet Road, HAL 2nd Stage, Indiranagar',
        centerCity: 'Bengaluru',
        centerPhone: '+91 80 2521 8890',
        patientName: 'Abdul Hameed',
        patientPhone: '+91 99001 88231',
        patientEmail: 'abdul.h@example.com',
        patientAge: 63,
        diabetesType: 'Type 2 (15 yrs duration)',
        serviceType: 'Community Mobile Fundus Screening',
        appointmentDate: toIsoDate(dayAfter),
        appointmentTime: '11:30 AM - 12:00 PM',
        status: 'Pending',
        notes: 'Screening camp walk-in pre-registration.',
        reminderOptIn: true,
        reminderMethod: 'sms',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: true,
      },
      {
        id: 'seed-appt-04',
        referenceCode: 'BR-20260922-8114',
        centerId: 'center-blr-jayanagar',
        centerName: 'South Bengaluru Community Eye Clinic',
        centerAddress: '42, 9th Main Road, Jayanagar 4th Block',
        centerCity: 'Bengaluru',
        centerPhone: '+91 80 2663 4100',
        patientName: 'Sunita Mehra',
        patientPhone: '+91 98800 44321',
        patientAge: 52,
        diabetesType: 'Type 1 (20 yrs duration)',
        serviceType: 'Comprehensive Retinal Fundus Screening',
        appointmentDate: toIsoDate(yesterday),
        appointmentTime: '02:00 PM - 02:30 PM',
        status: 'Completed',
        notes: 'Graded: Grade 1 Mild Non-Proliferative DR. Routine recheck scheduled in 6 months.',
        reminderOptIn: true,
        reminderMethod: 'both',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: true,
      },
      {
        id: 'seed-appt-05',
        referenceCode: 'BR-20260922-9902',
        centerId: 'center-blr-jayanagar',
        centerName: 'South Bengaluru Community Eye Clinic',
        centerAddress: '42, 9th Main Road, Jayanagar 4th Block',
        centerCity: 'Bengaluru',
        centerPhone: '+91 80 2663 4100',
        patientName: 'Venkatesh Rao',
        patientPhone: '+91 94480 33219',
        patientAge: 67,
        diabetesType: 'Type 2 (8 yrs duration)',
        serviceType: 'Comprehensive Retinal Fundus Screening',
        appointmentDate: toIsoDate(yesterday),
        appointmentTime: '03:30 PM - 04:00 PM',
        status: 'No Show',
        notes: 'Patient did not arrive. Outreach coordinator to follow up via SMS.',
        reminderOptIn: true,
        reminderMethod: 'sms',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemo: true,
      },
    ];

    this.persistAppointments();
  }

  // Check whether backend real-time database is available
  public isBackendLive(): boolean {
    return isLiveSupabaseConnected;
  }

  public getDemoDisclaimer(): string {
    return 'DEMO DATA: Backend real-time clinic scheduling system is running in demonstration mode. Availability, dates, and slots shown are sample demonstration data (DEMO DATA) and do not reflect live hospital scheduling.';
  }

  // Get list of centers with optional city and query filtering
  public async getCenters(city: string = 'All', query: string = ''): Promise<ScreeningCenterLocation[]> {
    if (this.isBackendLive() && supabase) {
      try {
        let q = supabase.from('screening_centers').select('*').eq('is_active', true);
        if (city && city !== 'All') {
          q = q.eq('city', city);
        }
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            category: c.category,
            address: c.address,
            city: c.city,
            state: c.state,
            pinCode: c.pin_code,
            phone: c.phone,
            email: c.email,
            operatingHours: c.operating_hours,
            services: c.services || [],
            equipment: c.equipment || [],
            isCampActive: c.is_camp_active,
            campDates: c.camp_dates,
            languagesSupported: c.languages_supported || ['English'],
          }));
        }
      } catch (e) {
        console.warn('Supabase query failed, falling back to local centers', e);
      }
    }

    // Local fallback
    const qLower = query.toLowerCase().trim();
    return this.centers.filter((c) => {
      const matchCity = city === 'All' || c.city === city;
      const matchQuery =
        !qLower ||
        c.name.toLowerCase().includes(qLower) ||
        c.address.toLowerCase().includes(qLower) ||
        c.pinCode.includes(qLower) ||
        c.city.toLowerCase().includes(qLower);
      return matchCity && matchQuery;
    });
  }

  public async getCenterById(id: string): Promise<ScreeningCenterLocation | null> {
    const centers = await this.getCenters('All');
    return centers.find((c) => c.id === id) || null;
  }

  // Get available dates for a center
  public async getAvailableDates(centerId: string): Promise<{ date: string; slotsCount: number }[]> {
    let centerSlots = this.slots.get(centerId);
    if (!centerSlots || centerSlots.length === 0) {
      centerSlots = generateDemoSlotsForCenter(centerId);
      this.slots.set(centerId, centerSlots);
      this.persistSlots();
    }

    const dateMap = new Map<string, number>();
    centerSlots.forEach((slot) => {
      if (slot.isActive && slot.bookedCount < slot.capacity) {
        const current = dateMap.get(slot.date) || 0;
        dateMap.set(slot.date, current + (slot.capacity - slot.bookedCount));
      }
    });

    const result: { date: string; slotsCount: number }[] = [];
    dateMap.forEach((slotsCount, date) => {
      result.push({ date, slotsCount });
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Get available slots for a specific date and center
  public async getSlotsForDate(centerId: string, date: string): Promise<ScreeningSlot[]> {
    let centerSlots = this.slots.get(centerId);
    if (!centerSlots || centerSlots.length === 0) {
      centerSlots = generateDemoSlotsForCenter(centerId);
      this.slots.set(centerId, centerSlots);
      this.persistSlots();
    }

    return centerSlots
      .filter((s) => s.date === date && s.isActive)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // Book an appointment
  public async bookAppointment(input: BookingFormInput): Promise<Appointment> {
    const center = await this.getCenterById(input.centerId);
    if (!center) {
      throw new Error('Screening center not found');
    }

    // Generate unique human-readable booking reference
    const dateFormatted = input.date.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `BR-${dateFormatted}-${randomSuffix}`;

    const newAppointment: Appointment = {
      id: `appt-${Date.now()}-${randomSuffix}`,
      referenceCode,
      centerId: center.id,
      centerName: center.name,
      centerAddress: center.address,
      centerCity: center.city,
      centerPhone: center.phone,
      slotId: input.slotId,
      patientName: input.patientName,
      patientPhone: input.patientPhone,
      patientEmail: input.patientEmail,
      patientAge: input.patientAge,
      diabetesType: input.diabetesType,
      serviceType: input.serviceType,
      appointmentDate: input.date,
      appointmentTime: input.timeSlot,
      status: 'Confirmed',
      notes: input.notes,
      reminderOptIn: input.reminderOptIn,
      reminderMethod: input.reminderMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: !this.isBackendLive(),
    };

    // Increment booked count on slot if found
    const centerSlots = this.slots.get(input.centerId);
    if (centerSlots) {
      const slot = centerSlots.find((s) => s.id === input.slotId);
      if (slot) {
        slot.bookedCount = Math.min(slot.capacity, slot.bookedCount + 1);
        this.persistSlots();
      }
    }

    this.appointments.unshift(newAppointment);
    this.persistAppointments();

    return newAppointment;
  }

  // Reschedule an appointment
  public async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTimeSlot: string,
    newSlotId?: string
  ): Promise<Appointment> {
    const appt = this.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      throw new Error('Appointment not found');
    }

    appt.appointmentDate = newDate;
    appt.appointmentTime = newTimeSlot;
    if (newSlotId) {
      appt.slotId = newSlotId;
    }
    appt.status = 'Rescheduled';
    appt.updatedAt = new Date().toISOString();

    this.persistAppointments();
    return appt;
  }

  // Cancel an appointment
  public async cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
    const appt = this.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      throw new Error('Appointment not found');
    }

    appt.status = 'Cancelled';
    if (reason) {
      appt.notes = appt.notes ? `${appt.notes} | Cancel reason: ${reason}` : `Cancel reason: ${reason}`;
    }
    appt.updatedAt = new Date().toISOString();

    // Release slot count if slot exists
    if (appt.slotId && appt.centerId) {
      const centerSlots = this.slots.get(appt.centerId);
      if (centerSlots) {
        const slot = centerSlots.find((s) => s.id === appt.slotId);
        if (slot && slot.bookedCount > 0) {
          slot.bookedCount -= 1;
          this.persistSlots();
        }
      }
    }

    this.persistAppointments();
    return appt;
  }

  // Update appointment status (Pending, Confirmed, Completed, Cancelled, Rescheduled, No Show)
  public async updateStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
    const appt = this.appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      throw new Error('Appointment not found');
    }

    appt.status = status;
    appt.updatedAt = new Date().toISOString();
    this.persistAppointments();
    return appt;
  }

  // Get appointments for a patient
  public async getPatientAppointments(queryParam?: string): Promise<Appointment[]> {
    if (!queryParam) {
      return this.appointments;
    }
    const q = queryParam.toLowerCase().trim();
    return this.appointments.filter(
      (a) =>
        a.referenceCode.toLowerCase().includes(q) ||
        a.patientPhone.includes(q) ||
        (a.patientEmail && a.patientEmail.toLowerCase().includes(q)) ||
        a.patientName.toLowerCase().includes(q)
    );
  }

  // Get appointments for a center (Provider View)
  public async getCenterAppointments(centerId?: string): Promise<Appointment[]> {
    if (!centerId || centerId === 'all') {
      return this.appointments;
    }
    return this.appointments.filter((a) => a.centerId === centerId);
  }

  // Provider: Add a custom slot
  public async addSlot(
    centerId: string,
    date: string,
    startTime: string,
    endTime: string,
    serviceType: string,
    capacity: number = 4
  ): Promise<ScreeningSlot> {
    let centerSlots = this.slots.get(centerId) || [];
    const newSlot: ScreeningSlot = {
      id: `custom-slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      centerId,
      date,
      startTime,
      endTime,
      serviceType,
      capacity,
      bookedCount: 0,
      isActive: true,
      isDemo: !this.isBackendLive(),
    };

    centerSlots.push(newSlot);
    this.slots.set(centerId, centerSlots);
    this.persistSlots();
    return newSlot;
  }

  // Provider: Toggle slot active/inactive
  public async toggleSlot(centerId: string, slotId: string): Promise<boolean> {
    const centerSlots = this.slots.get(centerId);
    if (!centerSlots) return false;
    const slot = centerSlots.find((s) => s.id === slotId);
    if (!slot) return false;

    slot.isActive = !slot.isActive;
    this.persistSlots();
    return slot.isActive;
  }

  // Generate .ics calendar download
  public generateIcsFile(appointment: Appointment) {
    const startDateClean = appointment.appointmentDate.replace(/-/g, '');
    const title = `Eye Screening: ${appointment.serviceType} at ${appointment.centerName}`;
    const description = `RetinaGuard Retinal Screening Appointment\\nReference Code: ${appointment.referenceCode}\\nPatient: ${appointment.patientName}\\nLocation: ${appointment.centerAddress}, ${appointment.centerCity}\\nContact: ${appointment.centerPhone}\\n\\nNotice: AI-assisted screening support. Please bring your reading glasses and list of medications.`;
    const location = `${appointment.centerName}, ${appointment.centerAddress}, ${appointment.centerCity}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RetinaGuard//Screening Booking System//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${appointment.referenceCode}@retinaguard.org`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateClean}T043000Z`, // Default morning UTC
      `DTEND:${startDateClean}T053000Z`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Retinal Screening Tomorrow',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Screening_${appointment.referenceCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate Google Calendar Link
  public getGoogleCalendarUrl(appointment: Appointment): string {
    const startDateClean = appointment.appointmentDate.replace(/-/g, '');
    const title = encodeURIComponent(`Eye Screening: ${appointment.serviceType}`);
    const details = encodeURIComponent(
      `RetinaGuard Retinal Screening Appointment\nReference Code: ${appointment.referenceCode}\nPatient: ${appointment.patientName}\nLocation: ${appointment.centerAddress}, ${appointment.centerCity}\nContact Phone: ${appointment.centerPhone}`
    );
    const location = encodeURIComponent(`${appointment.centerName}, ${appointment.centerAddress}, ${appointment.centerCity}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateClean}T090000/${startDateClean}T100000&details=${details}&location=${location}`;
  }
}

export const bookingService = new BookingService();
