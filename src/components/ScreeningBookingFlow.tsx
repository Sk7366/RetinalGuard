import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Layers,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Printer,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tent,
  User,
  X,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Appointment, AppointmentStatus, BookingFormInput, ScreeningCenterLocation, ScreeningSlot } from '../types/booking';
import { useTranslation } from '../i18n/I18nContext';

interface ScreeningBookingFlowProps {
  initialCenterId?: string;
  onNavigateToScreening?: () => void;
  onClose?: () => void;
}

export const ScreeningBookingFlow: React.FC<ScreeningBookingFlowProps> = ({
  initialCenterId,
  onNavigateToScreening,
  onClose,
}) => {
  const { t } = useTranslation();

  // Workflow steps: 1: Find Center -> 2: Select Service -> 3: Select Date & Slot -> 4: Patient Info & Book -> 5: Confirmed
  const [currentStep, setCurrentStep] = useState<number>(initialCenterId ? 2 : 1);

  // Data state
  const [centers, setCenters] = useState<ScreeningCenterLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCenter, setSelectedCenter] = useState<ScreeningCenterLocation | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<{ date: string; slotsCount: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slotsForDate, setSlotsForDate] = useState<ScreeningSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ScreeningSlot | null>(null);

  // Patient Booking Form
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAge, setPatientAge] = useState<number | undefined>(56);
  const [diabetesType, setDiabetesType] = useState('Type 2');
  const [notes, setNotes] = useState('');
  const [reminderOptIn, setReminderOptIn] = useState(true);
  const [reminderMethod, setReminderMethod] = useState<'sms' | 'email' | 'both'>('both');

  // Booked State
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Manage / Reschedule / Cancel Modal State
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState<ScreeningSlot | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<ScreeningSlot[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Lookup existing appointments tab
  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book');
  const [lookupQuery, setLookupQuery] = useState('');
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const isLive = bookingService.isBackendLive();
  const cities = ['All', 'Bengaluru', 'Mumbai', 'New Delhi', 'Chennai', 'Hyderabad'];

  // Load centers on mount
  useEffect(() => {
    bookingService.getCenters(selectedCity, searchQuery).then((data) => {
      setCenters(data);
      if (initialCenterId && !selectedCenter) {
        const found = data.find((c) => c.id === initialCenterId);
        if (found) {
          handleSelectCenter(found);
        }
      }
    });
  }, [selectedCity, searchQuery, initialCenterId]);

  // When center is selected, load default service and dates
  const handleSelectCenter = async (center: ScreeningCenterLocation) => {
    setSelectedCenter(center);
    setSelectedService(center.services[0] || 'Comprehensive Retinal Fundus Screening');
    const dates = await bookingService.getAvailableDates(center.id);
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].date);
      const slots = await bookingService.getSlotsForDate(center.id, dates[0].date);
      setSlotsForDate(slots);
      setSelectedSlot(slots.find((s) => s.bookedCount < s.capacity) || null);
    }
    setCurrentStep(2);
  };

  // Date selection change
  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    if (selectedCenter) {
      const slots = await bookingService.getSlotsForDate(selectedCenter.id, date);
      setSlotsForDate(slots);
      setSelectedSlot(slots.find((s) => s.bookedCount < s.capacity) || null);
    }
  };

  // Submit booking
  const handleBookScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter || !selectedSlot || !selectedDate) {
      setBookingError('Please complete all selection steps.');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      setBookingError('Patient name and contact phone number are required.');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const input: BookingFormInput = {
        centerId: selectedCenter.id,
        serviceType: selectedService,
        date: selectedDate,
        slotId: selectedSlot.id,
        timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || undefined,
        patientAge,
        diabetesType,
        notes: notes.trim() || undefined,
        reminderOptIn,
        reminderMethod,
      };

      const appt = await bookingService.bookAppointment(input);
      setConfirmedAppointment(appt);
      setCurrentStep(5);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reschedule handler
  const handleConfirmReschedule = async () => {
    if (!confirmedAppointment || !rescheduleDate || !rescheduleSlot) return;
    try {
      const updated = await bookingService.rescheduleAppointment(
        confirmedAppointment.id,
        rescheduleDate,
        `${rescheduleSlot.startTime} - ${rescheduleSlot.endTime}`,
        rescheduleSlot.id
      );
      setConfirmedAppointment({ ...updated });
      setIsRescheduling(false);
    } catch (e: any) {
      alert(e.message || 'Failed to reschedule.');
    }
  };

  // Cancel handler
  const handleConfirmCancel = async () => {
    if (!confirmedAppointment) return;
    try {
      const updated = await bookingService.cancelAppointment(confirmedAppointment.id, cancelReason);
      setConfirmedAppointment({ ...updated });
      setIsCancelling(false);
    } catch (e: any) {
      alert(e.message || 'Failed to cancel appointment.');
    }
  };

  // Lookup existing appointments
  const handleLookup = async () => {
    setIsLookingUp(true);
    const results = await bookingService.getPatientAppointments(lookupQuery);
    setPatientAppointments(results);
    setIsLookingUp(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-[#1F181A] dark:text-[#F3EDF0]">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE4DC] dark:border-[#382E32] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#EA580C] text-xs font-extrabold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Retinal Screening Appointments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1F181A] dark:text-white tracking-tight">
            Screening Center Booking
          </h1>
          <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
            Book a non-invasive retinal photography appointment at your local community eye center or mobile screening outreach van.
          </p>
        </div>

        <div className="inline-flex rounded-xl p-1 bg-[#F3ECE5] dark:bg-[#2C2428] text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('book')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'book'
                ? 'bg-white dark:bg-[#1D191B] text-[#EA580C] shadow-2xs'
                : 'text-[#6E5C5F] dark:text-[#A8989B]'
            }`}
          >
            Book Screening
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('my-bookings');
              handleLookup();
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'my-bookings'
                ? 'bg-white dark:bg-[#1D191B] text-[#EA580C] shadow-2xs'
                : 'text-[#6E5C5F] dark:text-[#A8989B]'
            }`}
          >
            My Appointments
          </button>
        </div>
      </div>

      {/* =====================================================================
          MANDATORY DEMO DISCLAIMER BANNER
          "If backend availability is not yet implemented, clearly label the
          interface as DEMO and do not pretend the slots are real."
          ===================================================================== */}
      {!isLive ? (
        <div
          role="region"
          aria-label="Demonstration Notice"
          className="p-4 rounded-2xl bg-[#FEF3C7] dark:bg-[#2A2312] border-2 border-[#F59E0B] text-[#92400E] dark:text-[#FDE68A] text-xs sm:text-sm flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs">
              <span className="px-2 py-0.5 rounded-md bg-[#D97706] text-white">DEMO MODE</span>
              <span>Backend Availability Is Simulated</span>
            </div>
            <p className="leading-relaxed">
              Real-time hospital booking integration is running in demonstration mode. The available dates and time slots shown below are <strong>sample demonstration slots</strong> to showcase the end-to-end booking workflow and do not represent actual live clinical appointments.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#132317] border border-[#86EFAC] dark:border-[#166534] text-xs text-[#166534] dark:text-[#86EFAC] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Connected to live Supabase scheduling with Row Level Security (RLS) active.</span>
        </div>
      )}

      {/* =====================================================================
          TAB 1: BOOK SCREENING WORKFLOW
          Workflow:
          Find Screening Center -> Select Center -> View Services ->
          View Available Dates -> View Available Time Slots -> Book -> Confirmation -> Reminder
          ===================================================================== */}
      {activeTab === 'book' && (
        <div className="space-y-8">
          {/* Progress Indicator Steps */}
          <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between overflow-x-auto pb-1 text-xs font-bold gap-2">
              <div
                className={`flex items-center gap-2 shrink-0 ${
                  currentStep >= 1 ? 'text-[#EA580C]' : 'text-[#8E7E81]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentStep > 1
                      ? 'bg-[#15803D] text-white'
                      : currentStep === 1
                      ? 'bg-[#EA580C] text-white'
                      : 'bg-[#E5D7CD] text-[#7A696C]'
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <span>Find Center</span>
              </div>

              <span className="text-[#C4B7BA]">→</span>

              <div
                className={`flex items-center gap-2 shrink-0 ${
                  currentStep >= 2 ? 'text-[#EA580C]' : 'text-[#8E7E81]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentStep > 2
                      ? 'bg-[#15803D] text-white'
                      : currentStep === 2
                      ? 'bg-[#EA580C] text-white'
                      : 'bg-[#E5D7CD] text-[#7A696C]'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <span>View Services</span>
              </div>

              <span className="text-[#C4B7BA]">→</span>

              <div
                className={`flex items-center gap-2 shrink-0 ${
                  currentStep >= 3 ? 'text-[#EA580C]' : 'text-[#8E7E81]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentStep > 3
                      ? 'bg-[#15803D] text-white'
                      : currentStep === 3
                      ? 'bg-[#EA580C] text-white'
                      : 'bg-[#E5D7CD] text-[#7A696C]'
                  }`}
                >
                  {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
                </div>
                <span>Dates & Slots</span>
              </div>

              <span className="text-[#C4B7BA]">→</span>

              <div
                className={`flex items-center gap-2 shrink-0 ${
                  currentStep >= 4 ? 'text-[#EA580C]' : 'text-[#8E7E81]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentStep > 4
                      ? 'bg-[#15803D] text-white'
                      : currentStep === 4
                      ? 'bg-[#EA580C] text-white'
                      : 'bg-[#E5D7CD] text-[#7A696C]'
                  }`}
                >
                  {currentStep > 4 ? <Check className="w-3.5 h-3.5" /> : '4'}
                </div>
                <span>Book Details</span>
              </div>

              <span className="text-[#C4B7BA]">→</span>

              <div
                className={`flex items-center gap-2 shrink-0 ${
                  currentStep === 5 ? 'text-[#15803D]' : 'text-[#8E7E81]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentStep === 5 ? 'bg-[#15803D] text-white' : 'bg-[#E5D7CD] text-[#7A696C]'
                  }`}
                >
                  5
                </div>
                <span>Confirmation</span>
              </div>
            </div>
          </div>

          {/* STEP 1: FIND & SELECT SCREENING CENTER */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Search & City Filter */}
              <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#8E7E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clinic name, PIN code (e.g. 560011), or street address..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-xs sm:text-sm text-[#1F181A] dark:text-white placeholder:text-[#8E7E81] focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          selectedCity === city
                            ? 'bg-[#EA580C] text-white'
                            : 'bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] text-[#6E5C5F] dark:text-[#C4B7BA]'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Centers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {centers.map((center) => (
                  <div
                    key={center.id}
                    className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] hover:border-[#EA580C] dark:hover:border-[#EA580C] rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#6E5C5F] dark:text-[#A8989B] bg-[#FAF7F4] dark:bg-[#251E22] px-2.5 py-1 rounded-lg border border-[#EFE4DC] dark:border-[#382E32] flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-[#EA580C]" />
                          ~{center.distanceKm || 2.5} km away
                        </span>
                        {center.isCampActive ? (
                          <span className="text-[11px] font-bold text-[#EA580C] bg-[#FFF7ED] dark:bg-[#2C1D17] px-2.5 py-1 rounded-lg border border-[#FDBA74] flex items-center gap-1">
                            <Tent className="w-3 h-3" />
                            Camp Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#8E7E81] uppercase font-semibold">
                            Permanent Clinic
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#1F181A] dark:text-white group-hover:text-[#EA580C] transition-colors">
                        {center.name}
                      </h3>

                      <p className="text-xs text-[#524346] dark:text-[#C4B7BA] flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                        <span>
                          {center.address}, {center.city} — {center.pinCode}
                        </span>
                      </p>

                      <div className="text-xs text-[#6E5C5F] dark:text-[#A8989B] space-y-1 pt-2 border-t border-[#F2ECE7] dark:border-[#2C2428]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8E7E81]" />
                          <span>{center.operatingHours}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-[#8E7E81]" />
                          <span>{center.phone}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-1">
                        {center.services.slice(0, 2).map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] text-[#6E5C5F] dark:text-[#C4B7BA]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectCenter(center)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Select Center</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(center.name + ', ' + center.city)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] hover:bg-[#FAF7F4] dark:hover:bg-[#251E22] text-[#6E5C5F] dark:text-[#C4B7BA] transition-colors"
                        title="Directions"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: VIEW SERVICES */}
          {currentStep === 2 && selectedCenter && (
            <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE7] dark:border-[#2C2428]">
                <div>
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block">
                    Step 2 • Screening Services
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F181A] dark:text-white mt-1">
                    Available Services at {selectedCenter.name}
                  </h2>
                  <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B] mt-0.5">
                    Location: {selectedCenter.address}, {selectedCenter.city}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6E5C5F] hover:bg-[#FAF7F4] flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Center</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedCenter.services.map((svc, i) => {
                  const isSelected = selectedService === svc;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedService(svc)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#EA580C] bg-[#FFF7ED] dark:bg-[#2C1D17]'
                          : 'border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] hover:border-[#FDBA74]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                            Service {i + 1}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#EA580C] border-[#EA580C] text-white'
                                : 'border-[#C4B7BA]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-[#1F181A] dark:text-white">
                          {svc}
                        </h3>

                        <p className="text-xs text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                          {svc.includes('OCT')
                            ? 'Cross-sectional retinal layer thickness measurement for sub-clinical macular edema.'
                            : svc.includes('Fundus')
                            ? 'High-resolution non-mydriatic photograph of optic disc, macula, and vascular arcades.'
                            : svc.includes('AI')
                            ? 'Instant ICDR diabetic retinopathy triage and metabolic risk stratification.'
                            : 'Standard visual acuity and diabetic eye consultation.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#EFE4DC]/60 text-[11px] text-[#7A696C] dark:text-[#A8989B] flex items-center justify-between">
                        <span>Duration: ~5-10 mins</span>
                        <span className="text-[#15803D] font-bold">No Dilation Drops Needed</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE7] dark:border-[#2C2428]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6E5C5F] hover:bg-[#FAF7F4]"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedService}
                  className="px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Select Dates & Slots</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VIEW AVAILABLE DATES & TIME SLOTS */}
          {currentStep === 3 && selectedCenter && (
            <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2ECE7] dark:border-[#2C2428]">
                <div>
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block">
                    Step 3 • Available Schedule
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F181A] dark:text-white mt-1">
                    Select Date & Time Slot
                  </h2>
                  <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B] mt-0.5">
                    {selectedCenter.name} • {selectedService}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8E7E81] bg-[#FAF7F4] dark:bg-[#251E22] px-3 py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] font-semibold">
                    Operating: {selectedCenter.operatingHours}
                  </span>
                </div>
              </div>

              {/* Notice regarding demo availability */}
              {!isLive && (
                <div className="p-3 rounded-xl bg-[#FFFBEB] dark:bg-[#2E2413] border border-[#FDE68A] dark:border-[#78350F] text-xs text-[#92400E] dark:text-[#FDE68A] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>
                    <strong>Demo Schedule:</strong> Available slots are generated for functional validation. Choose an available slot to proceed.
                  </span>
                </div>
              )}

              {/* DATE SELECTOR */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1F181A] dark:text-white block">
                  1. Choose Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {availableDates.map((item) => {
                    const d = new Date(item.date + 'T00:00:00');
                    const isSelected = selectedDate === item.date;
                    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
                    const dateNum = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                    return (
                      <button
                        key={item.date}
                        type="button"
                        onClick={() => handleDateChange(item.date)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#EA580C] bg-[#FFF7ED] dark:bg-[#2C1D17] text-[#EA580C] font-bold shadow-xs'
                            : 'border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-[#382E30] dark:text-[#DDD3CD] hover:border-[#EA580C]/50'
                        }`}
                      >
                        <span className="text-[11px] block uppercase font-semibold text-[#8E7E81]">
                          {dayName}
                        </span>
                        <span className="text-sm font-extrabold block my-0.5">{dateNum}</span>
                        <span className="text-[10px] text-[#15803D] font-bold block">
                          {item.slotsCount} slots open
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIME SLOTS SELECTOR */}
              <div className="space-y-3 pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F181A] dark:text-white block">
                    2. Choose Available Time Slot
                  </label>
                  <span className="text-xs text-[#7A696C]">
                    Date: {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {slotsForDate.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isFull = slot.bookedCount >= slot.capacity;
                    const remaining = slot.capacity - slot.bookedCount;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                          isFull
                            ? 'opacity-40 bg-[#F3ECE5] border-transparent cursor-not-allowed'
                            : isSelected
                            ? 'border-[#EA580C] bg-[#FFF7ED] dark:bg-[#2C1D17] shadow-xs'
                            : 'border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] hover:border-[#EA580C]/40 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className={isSelected ? 'text-[#EA580C]' : 'text-[#1F181A] dark:text-white'}>
                            {slot.startTime}
                          </span>
                          <span className="text-[11px] text-[#8E7E81]">{slot.endTime}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span
                            className={`font-semibold ${
                              isFull
                                ? 'text-[#DC2626]'
                                : remaining === 1
                                ? 'text-[#D97706]'
                                : 'text-[#16A34A]'
                            }`}
                          >
                            {isFull ? 'Full' : `${remaining} available`}
                          </span>
                          {slot.isDemo && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#E5D7CD] dark:bg-[#382E32] text-[#6E5C5F] dark:text-[#A8989B]">
                              Demo
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE7] dark:border-[#2C2428]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6E5C5F] hover:bg-[#FAF7F4]"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  disabled={!selectedSlot}
                  className="px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Enter Patient Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PATIENT DETAILS & BOOK */}
          {currentStep === 4 && selectedCenter && selectedSlot && (
            <form
              onSubmit={handleBookScreening}
              className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2ECE7] dark:border-[#2C2428]">
                <div>
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block">
                    Step 4 • Participant Confirmation
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F181A] dark:text-white mt-1">
                    Complete Your Screening Registration
                  </h2>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFF7ED] dark:bg-[#2C1D17] border border-[#FDBA74] text-xs text-[#7C2D12] dark:text-[#FDBA74] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>{selectedCenter.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>
                      {selectedSlot.startTime} - {selectedSlot.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {bookingError && (
                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[#1F181A] dark:text-white block mb-1">
                    Participant Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Sundaram"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-[#1F181A] dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#EA580C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1F181A] dark:text-white block mb-1">
                    Contact Phone Number (for SMS token & reminders) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. +91 98450 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-[#1F181A] dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#EA580C]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1F181A] dark:text-white block mb-1">
                    Email Address (optional)
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="e.g. patient@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-[#1F181A] dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#EA580C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#1F181A] dark:text-white block mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={patientAge || ''}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-[#1F181A] dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1F181A] dark:text-white block mb-1">
                      Diabetes Profile
                    </label>
                    <select
                      value={diabetesType}
                      onChange={(e) => setDiabetesType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-[#1F181A] dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#EA580C]"
                    >
                      <option value="Type 2">Type 2 Diabetes</option>
                      <option value="Type 1">Type 1 Diabetes</option>
                      <option value="Pre-Diabetes">Pre-Diabetes</option>
                      <option value="Gestational">Gestational</option>
                      <option value="Screening Check">Routine Eye Check</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-[#1F181A] dark:text-white block mb-1">
                    Special Accommodations or Questions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Wheelchair access needed, non-English speaker..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-[#1F181A] dark:text-white text-xs focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {/* REMINDER SETTINGS */}
              <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderOptIn}
                      onChange={(e) => setReminderOptIn(e.target.checked)}
                      className="w-4 h-4 text-[#EA580C] rounded border-[#EFE4DC] focus:ring-[#EA580C]"
                    />
                    <span className="text-xs font-bold text-[#1F181A] dark:text-white">
                      Send automated appointment reminders (24 hours prior)
                    </span>
                  </label>

                  <span className="text-[11px] text-[#15803D] font-bold">SMS / Email Notification</span>
                </div>

                {reminderOptIn && (
                  <div className="flex items-center gap-4 text-xs text-[#6E5C5F] dark:text-[#A8989B] pt-2 border-t border-[#EFE4DC] dark:border-[#382E32]">
                    <span className="font-semibold text-[11px]">Preferred Channel:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="reminderChannel"
                        checked={reminderMethod === 'sms'}
                        onChange={() => setReminderMethod('sms')}
                        className="text-[#EA580C]"
                      />
                      <span>SMS Only</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="reminderChannel"
                        checked={reminderMethod === 'email'}
                        onChange={() => setReminderMethod('email')}
                        className="text-[#EA580C]"
                      />
                      <span>Email Only</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="reminderChannel"
                        checked={reminderMethod === 'both'}
                        onChange={() => setReminderMethod('both')}
                        className="text-[#EA580C]"
                      />
                      <span>Both SMS & Email</span>
                    </label>
                  </div>
                )}
              </div>

              {/* CTA BUTTON */}
              <div className="pt-4 flex items-center justify-between border-t border-[#F2ECE7] dark:border-[#2C2428]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6E5C5F] hover:bg-[#FAF7F4]"
                >
                  Back
                </button>

                {/* PRIMARY CTA AS REQUIRED: [ Book a Screening ] */}
                <button
                  type="submit"
                  id="btn-book-a-screening"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reserving Slot...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Book a Screening</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: CONFIRMATION & ACTIONS
              After booking show:
              Booking Confirmed
              Center
              Date
              Time
              Booking Reference
              Actions:
              Add to Calendar
              Reschedule
              Cancel
          */}
          {currentStep === 5 && confirmedAppointment && (
            <div className="bg-white dark:bg-[#1C1719] border-2 border-[#15803D]/30 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 animate-in zoom-in-95">
              {/* Top Confirmed Header */}
              <div className="text-center space-y-3 pb-6 border-b border-[#F2ECE7] dark:border-[#2C2428]">
                <div className="w-16 h-16 rounded-full bg-[#F0FDF4] dark:bg-[#152D1C] border-2 border-[#86EFAC] dark:border-[#166534] flex items-center justify-center text-[#15803D] dark:text-[#4ADE80] mx-auto shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#14532D] text-xs font-extrabold uppercase tracking-wider">
                  <span>Status: {confirmedAppointment.status}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F181A] dark:text-white tracking-tight">
                  Booking Confirmed
                </h2>
                <p className="text-sm text-[#524346] dark:text-[#DDD3CD] max-w-lg mx-auto">
                  Your appointment slot is reserved. A confirmation SMS with directions and queue guidelines has been logged for <strong>{confirmedAppointment.patientPhone}</strong>.
                </p>
              </div>

              {/* BOOKING DETAILS CARD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Center */}
                <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5">
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Center</span>
                  </span>
                  <h3 className="text-base font-bold text-[#1F181A] dark:text-white">
                    {confirmedAppointment.centerName}
                  </h3>
                  <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    {confirmedAppointment.centerAddress}, {confirmedAppointment.centerCity}
                  </p>
                  <p className="text-xs font-mono text-[#8E7E81] pt-1">
                    Phone: {confirmedAppointment.centerPhone}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5">
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date & Time</span>
                  </span>
                  <div className="text-base font-bold text-[#1F181A] dark:text-white">
                    {new Date(confirmedAppointment.appointmentDate + 'T00:00:00').toLocaleDateString(undefined, {
                      dateStyle: 'full',
                    })}
                  </div>
                  <div className="text-sm font-semibold text-[#15803D] dark:text-[#4ADE80] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{confirmedAppointment.appointmentTime}</span>
                  </div>
                  <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B] pt-1">
                    Service: {confirmedAppointment.serviceType}
                  </p>
                </div>

                {/* Booking Reference */}
                <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5">
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                    Booking Reference
                  </span>
                  <div className="text-xl sm:text-2xl font-mono font-black text-[#EA580C] tracking-wide">
                    {confirmedAppointment.referenceCode}
                  </div>
                  <p className="text-xs text-[#7A696C]">
                    Keep this reference for check-in upon arrival at the screening reception desk.
                  </p>
                </div>

                {/* Patient & Reminder Summary */}
                <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5">
                  <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Reminder & Patient</span>
                  </span>
                  <div className="text-sm font-bold text-[#1F181A] dark:text-white">
                    {confirmedAppointment.patientName} ({confirmedAppointment.diabetesType || 'Participant'})
                  </div>
                  <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    Reminder scheduled 24 hrs prior to {confirmedAppointment.patientPhone}
                  </p>
                  <div className="text-[11px] text-[#15803D] font-bold">
                    ✓ Reminder token activated
                  </div>
                </div>
              </div>

              {/* REQUIRED ACTIONS: Add to Calendar, Reschedule, Cancel */}
              <div className="p-6 rounded-2xl bg-[#FFF7ED] dark:bg-[#2C1D17] border border-[#FDBA74] space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C2D12] dark:text-[#FDBA74] block">
                  Appointment Actions
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Action 1: Add to Calendar (ICS + Google) */}
                  <button
                    type="button"
                    id="btn-add-to-calendar"
                    onClick={() => bookingService.generateIcsFile(confirmedAppointment)}
                    className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Add to Calendar (.ics)</span>
                  </button>

                  <a
                    href={bookingService.getGoogleCalendarUrl(confirmedAppointment)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl border border-[#EA580C] text-[#EA580C] hover:bg-[#FFEDD5] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>Google Calendar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Action 2: Reschedule */}
                  <button
                    type="button"
                    id="btn-reschedule-appointment"
                    onClick={async () => {
                      setIsRescheduling(true);
                      const dates = await bookingService.getAvailableDates(confirmedAppointment.centerId);
                      setAvailableDates(dates);
                      if (dates.length > 0) {
                        setRescheduleDate(dates[0].date);
                        const slots = await bookingService.getSlotsForDate(confirmedAppointment.centerId, dates[0].date);
                        setRescheduleSlots(slots);
                        setRescheduleSlot(slots.find((s) => s.bookedCount < s.capacity) || null);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1D191B] hover:border-[#EA580C] text-[#1F181A] dark:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-[#EA580C]" />
                    <span>Reschedule</span>
                  </button>

                  {/* Action 3: Cancel */}
                  <button
                    type="button"
                    id="btn-cancel-appointment"
                    onClick={() => setIsCancelling(true)}
                    className="px-4 py-2.5 rounded-xl border border-[#FECACA] bg-white dark:bg-[#1D191B] text-[#DC2626] hover:bg-[#FEF2F2] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel Appointment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1D191B] text-[#382E30] dark:text-[#DDD3CD] hover:border-[#EA580C] transition-colors"
                    title="Print Confirmation Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setConfirmedAppointment(null);
                    setSelectedCenter(null);
                    setSelectedSlot(null);
                  }}
                  className="font-bold text-[#EA580C] hover:underline cursor-pointer"
                >
                  + Book another appointment for a family member
                </button>

                {onNavigateToScreening && (
                  <button
                    type="button"
                    onClick={onNavigateToScreening}
                    className="px-4 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] font-semibold text-[#6E5C5F] hover:bg-[#FAF7F4] transition-colors"
                  >
                    Try AI Demo Screening Experience →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* RESCHEDULE MODAL */}
          {isRescheduling && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
                  <h3 className="text-lg font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-[#EA580C]" />
                    <span>Reschedule Screening Appointment</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="p-1 rounded-lg text-[#8E7E81] hover:text-[#1F181A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <label className="font-bold block mb-1">Select New Date</label>
                    <select
                      value={rescheduleDate}
                      onChange={async (e) => {
                        const newD = e.target.value;
                        setRescheduleDate(newD);
                        if (confirmedAppointment) {
                          const slots = await bookingService.getSlotsForDate(
                            confirmedAppointment.centerId,
                            newD
                          );
                          setRescheduleSlots(slots);
                          setRescheduleSlot(slots.find((s) => s.bookedCount < s.capacity) || null);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] bg-[#FAF7F4] dark:bg-[#251E22]"
                    >
                      {availableDates.map((item) => (
                        <option key={item.date} value={item.date}>
                          {new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })}{' '}
                          ({item.slotsCount} open)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Select Available Time Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {rescheduleSlots.map((slot) => {
                        const isFull = slot.bookedCount >= slot.capacity;
                        const isSelected = rescheduleSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={isFull}
                            onClick={() => setRescheduleSlot(slot)}
                            className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                              isFull
                                ? 'opacity-40 bg-stone-100 cursor-not-allowed'
                                : isSelected
                                ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C] font-bold'
                                : 'border-[#EFE4DC] bg-[#FAF7F4]'
                            }`}
                          >
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="block text-[10px] text-[#8E7E81]">
                              {isFull ? 'Full' : `${slot.capacity - slot.bookedCount} left`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex gap-2 justify-end border-t border-[#F2ECE7] dark:border-[#2C2428]">
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="px-4 py-2 rounded-xl border border-[#EFE4DC] text-xs font-bold text-[#6E5C5F]"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReschedule}
                    disabled={!rescheduleSlot}
                    className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    Confirm Reschedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CANCEL MODAL */}
          {isCancelling && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-[#1C1719] border border-[#FECACA] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center gap-3 text-[#DC2626]">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Cancel Screening Appointment?</h3>
                </div>

                <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B] leading-relaxed">
                  Are you sure you want to cancel appointment <strong>{confirmedAppointment?.referenceCode}</strong>? This slot will be released back to the community pool.
                </p>

                <div>
                  <label className="text-xs font-bold block mb-1">Reason for cancellation (optional):</label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Schedule conflict, visit relocated..."
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs bg-[#FAF7F4]"
                  />
                </div>

                <div className="pt-3 flex gap-2 justify-end border-t border-[#F2ECE7]">
                  <button
                    type="button"
                    onClick={() => setIsCancelling(false)}
                    className="px-4 py-2 rounded-xl border border-[#EFE4DC] text-xs font-bold text-[#6E5C5F]"
                  >
                    Keep Appointment
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: MY APPOINTMENTS LOOKUP (PATIENT VIEW)
          ===================================================================== */}
      {activeTab === 'my-bookings' && (
        <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2ECE7] dark:border-[#2C2428]">
            <div>
              <h2 className="text-xl font-extrabold text-[#1F181A] dark:text-white">
                My Screening Appointments
              </h2>
              <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                Lookup and manage your existing appointments using your Booking Reference code or phone number.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Search reference (e.g. BR-...) or phone..."
                className="px-3.5 py-2 rounded-xl border border-[#EFE4DC] text-xs bg-[#FAF7F4] w-64 focus:outline-none focus:border-[#EA580C]"
              />
              <button
                type="button"
                onClick={handleLookup}
                className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-2xs"
              >
                Search
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {patientAppointments.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-[#8E7E81]">
                <Calendar className="w-8 h-8 mx-auto" />
                <p className="text-xs font-semibold">No appointments found matching search.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('book')}
                  className="text-xs font-bold text-[#EA580C] hover:underline"
                >
                  Book a new screening appointment →
                </button>
              </div>
            ) : (
              patientAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#EA580C]">
                        {appt.referenceCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          appt.status === 'Confirmed'
                            ? 'bg-[#DCFCE7] text-[#14532D]'
                            : appt.status === 'Completed'
                            ? 'bg-[#E0F2FE] text-[#0369A1]'
                            : appt.status === 'Cancelled'
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : appt.status === 'Rescheduled'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {appt.status}
                      </span>
                      {appt.isDemo && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#E5D7CD] dark:bg-[#382E32] text-[#6E5C5F] uppercase font-bold">
                          Demo
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-[#1F181A] dark:text-white">
                      {appt.centerName}
                    </div>

                    <div className="text-xs text-[#6E5C5F] dark:text-[#A8989B] flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{appt.appointmentDate}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{appt.appointmentTime}</span>
                      <span>•</span>
                      <span>{appt.patientName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => bookingService.generateIcsFile(appt)}
                      className="px-3 py-1.5 rounded-xl border border-[#EFE4DC] bg-white text-xs font-bold text-[#1F181A] hover:border-[#EA580C] flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3 text-[#EA580C]" />
                      <span>Calendar</span>
                    </button>

                    {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const updated = await bookingService.cancelAppointment(appt.id, 'Cancelled from patient portal');
                          setPatientAppointments((prev) =>
                            prev.map((item) => (item.id === updated.id ? updated : item))
                          );
                        }}
                        className="px-3 py-1.5 rounded-xl border border-[#FECACA] bg-white text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
