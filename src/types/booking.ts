export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled'
  | 'No Show';

export interface ScreeningCenterLocation {
  id: string;
  name: string;
  slug: string;
  category: 'clinic' | 'hospital' | 'camp' | 'mobile_van';
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  email?: string;
  operatingHours: string;
  services: string[];
  equipment?: string[];
  distanceKm?: number;
  isCampActive: boolean;
  campDates?: string;
  languagesSupported?: string[];
}

export interface ScreeningSlot {
  id: string;
  centerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:30 AM"
  endTime: string; // e.g. "10:00 AM"
  serviceType: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  isDemo: boolean;
}

export interface Appointment {
  id: string;
  referenceCode: string; // e.g. "BR-20260923-8419"
  centerId: string;
  centerName: string;
  centerAddress: string;
  centerCity: string;
  centerPhone: string;
  slotId?: string;
  patientUserId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: number;
  diabetesType?: string;
  serviceType: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:00 AM - 10:30 AM"
  status: AppointmentStatus;
  notes?: string;
  reminderOptIn: boolean;
  reminderMethod?: 'sms' | 'email' | 'both';
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface BookingFormInput {
  centerId: string;
  serviceType: string;
  date: string;
  slotId: string;
  timeSlot: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: number;
  diabetesType?: string;
  notes?: string;
  reminderOptIn: boolean;
  reminderMethod: 'sms' | 'email' | 'both';
}
