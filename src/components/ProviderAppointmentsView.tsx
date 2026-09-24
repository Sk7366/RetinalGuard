import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import { bookingService, DEFAULT_SCREENING_CENTERS } from '../services/bookingService';
import { Appointment, AppointmentStatus, ScreeningCenterLocation, ScreeningSlot } from '../types/booking';
import { useTranslation } from '../i18n/I18nContext';

interface ProviderAppointmentsViewProps {
  onStartScreeningWithPatient?: (patientName: string, diabetesType?: string) => void;
  userRole?: string;
}

export const ProviderAppointmentsView: React.FC<ProviderAppointmentsViewProps> = ({
  onStartScreeningWithPatient,
  userRole = 'screening_technician',
}) => {
  const { t } = useTranslation();

  // Active view: 'list' | 'calendar' | 'slots'
  const [activeView, setActiveView] = useState<'list' | 'calendar' | 'slots'>('list');

  // Center selection (Authorized center)
  const [selectedCenterId, setSelectedCenterId] = useState<string>('center-blr-jayanagar');
  const [centers, setCenters] = useState<ScreeningCenterLocation[]>(DEFAULT_SCREENING_CENTERS);

  // Appointments & Slots
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<ScreeningSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Add Slot Modal
  const [isAddSlotOpen, setIsAddSlotOpen] = useState<boolean>(false);
  const [newSlotDate, setNewSlotDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newSlotStart, setNewSlotStart] = useState<string>('09:00 AM');
  const [newSlotEnd, setNewSlotEnd] = useState<string>('09:30 AM');
  const [newSlotService, setNewSlotService] = useState<string>(
    'Comprehensive Retinal Fundus Screening'
  );
  const [newSlotCapacity, setNewSlotCapacity] = useState<number>(4);

  const isLive = bookingService.isBackendLive();

  // Status options as required by user prompt:
  // Pending, Confirmed, Completed, Cancelled, Rescheduled, No Show
  const STATUSES: AppointmentStatus[] = [
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled',
    'Rescheduled',
    'No Show',
  ];

  // Load appointments and slots
  const reloadData = async () => {
    setIsLoading(true);
    const appts = await bookingService.getCenterAppointments(selectedCenterId);
    setAppointments(appts);

    // Get slots for next 7 days for this center
    const dates = await bookingService.getAvailableDates(selectedCenterId);
    const allSlots: ScreeningSlot[] = [];
    for (const d of dates.slice(0, 5)) {
      const s = await bookingService.getSlotsForDate(selectedCenterId, d.date);
      allSlots.push(...s);
    }
    setSlots(allSlots);
    setIsLoading(false);
  };

  useEffect(() => {
    reloadData();
  }, [selectedCenterId]);

  // Handle status update
  const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const updated = await bookingService.updateStatus(appointmentId, newStatus);
      setAppointments((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (e: any) {
      alert(e.message || 'Failed to update status.');
    }
  };

  // Handle toggle slot active/inactive
  const handleToggleSlot = async (slotId: string) => {
    await bookingService.toggleSlot(selectedCenterId, slotId);
    reloadData();
  };

  // Handle add slot submit
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await bookingService.addSlot(
      selectedCenterId,
      newSlotDate,
      newSlotStart,
      newSlotEnd,
      newSlotService,
      newSlotCapacity
    );
    setIsAddSlotOpen(false);
    reloadData();
  };

  // Metrics calculation
  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'Confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;
  const rescheduledCount = appointments.filter((a) => a.status === 'Rescheduled').length;
  const noShowCount = appointments.filter((a) => a.status === 'No Show').length;

  const totalSlotsCount = slots.length;
  const availableSlotsCount = slots.filter((s) => s.isActive && s.bookedCount < s.capacity).length;
  const bookedSlotsCount = slots.reduce((acc, s) => acc + s.bookedCount, 0);

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesDate = !dateFilter || a.appointmentDate === dateFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      a.patientName.toLowerCase().includes(q) ||
      a.patientPhone.includes(q) ||
      a.referenceCode.toLowerCase().includes(q) ||
      a.serviceType.toLowerCase().includes(q);

    return matchesStatus && matchesDate && matchesQuery;
  });

  const currentCenter = centers.find((c) => c.id === selectedCenterId) || centers[0];

  return (
    <div className="space-y-6 text-[#1F181A] dark:text-[#F3EDF0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE5D8] text-[#F05A28] text-xs font-extrabold uppercase tracking-wider mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Screening Center Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1F181A] dark:text-white tracking-tight">
            Appointments & Slot Management
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6267] dark:text-[#A8989B] mt-1">
            Manage patient appointment queues, calendar scheduling, and provider capacity with Row Level Security (RLS) enforcement.
          </p>
        </div>

        {/* Center Switcher (Simulating Authorized Screening Center Access) */}
        <div className="space-y-1.5 self-start sm:self-auto">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E81] block">
            Authorized Center
          </label>
          <div className="relative">
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="appearance-none pr-9 pl-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-xs font-bold text-[#1F181A] dark:text-white focus:outline-none focus:border-[#F05A28] cursor-pointer"
            >
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8E7E81] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* MANDATORY DEMO / RLS BANNER */}
      {!isLive ? (
        <div
          role="region"
          aria-label="Demonstration Notice"
          className="p-4 rounded-2xl bg-[#FEF3C7] dark:bg-[#2A2312] border-2 border-[#F59E0B] text-[#92400E] dark:text-[#FDE68A] text-xs sm:text-sm flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs">
              <span className="px-2 py-0.5 rounded-md bg-[#D97706] text-white">DEMO DATA</span>
              <span>Local State Simulation Active</span>
            </div>
            <p className="leading-relaxed">
              Appointments and slot management are currently populated with <strong>DEMO DATA</strong>. In production, Supabase Row Level Security (RLS) guarantees that <strong>providers can only manage authorized center appointments</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] dark:bg-[#132317] border border-[#86EFAC] dark:border-[#166534] text-xs text-[#166534] dark:text-[#86EFAC] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>RLS Enforced: Providers can only manage authorized center appointments for {currentCenter.name}.</span>
        </div>
      )}

      {/* METRICS ROW (Exact structure requested: Appointments, Available Slots, Booked Slots, Completed, Cancelled, Rescheduled, No Show) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Appointments */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E81] block">
            Appointments
          </span>
          <div className="text-2xl font-black text-[#1F181A] dark:text-white mt-1">
            {totalAppointments}
          </div>
          <span className="text-[10px] text-[#6F6267] dark:text-[#A8989B]">
            {pendingCount} Pending, {confirmedCount} Confirmed
          </span>
        </div>

        {/* 2. Available Slots */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E81] block">
            Available Slots
          </span>
          <div className="text-2xl font-black text-[#15803D] dark:text-[#4ADE80] mt-1">
            {availableSlotsCount}
          </div>
          <span className="text-[10px] text-[#6F6267] dark:text-[#A8989B]">
            Across upcoming schedule
          </span>
        </div>

        {/* 3. Booked Slots */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E81] block">
            Booked Slots
          </span>
          <div className="text-2xl font-black text-[#EA580C] mt-1">
            {bookedSlotsCount}
          </div>
          <span className="text-[10px] text-[#6F6267] dark:text-[#A8989B]">
            Active reservations
          </span>
        </div>

        {/* 4. Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E81] block">
            Completed
          </span>
          <div className="text-2xl font-black text-[#0369A1] mt-1">
            {completedCount}
          </div>
          <span className="text-[10px] text-[#6F6267] dark:text-[#A8989B]">
            Screened & triaged
          </span>
        </div>

        {/* 5. Cancelled */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E81] block">
            Cancelled
          </span>
          <div className="text-2xl font-black text-[#DC2626] mt-1">
            {cancelledCount}
          </div>
          <span className="text-[10px] text-[#6F6267] dark:text-[#A8989B]">
            Released slots
          </span>
        </div>

        {/* 6. Rescheduled */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E81] block">
            Rescheduled
          </span>
          <div className="text-2xl font-black text-[#7C3AED] mt-1">
            {rescheduledCount}
          </div>
          <span className="text-[10px] text-[#6F6267] dark:text-[#A8989B]">
            Reassigned dates
          </span>
        </div>

        {/* 7. No Show */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E7E81] block">
            No Show
          </span>
          <div className="text-2xl font-black text-[#7A696C] mt-1">
            {noShowCount}
          </div>
          <span className="text-[10px] text-[#6F6267] dark:text-[#A8989B]">
            Pending outreach
          </span>
        </div>
      </div>

      {/* VIEW TABS & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] dark:border-[#382E32] pb-4">
        <div className="inline-flex rounded-xl p-1 bg-[#F3ECE5] dark:bg-[#2C2428] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'list'
                ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] shadow-2xs'
                : 'text-[#6F6267] dark:text-[#A8989B]'
            }`}
          >
            Appointments ({appointments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'calendar'
                ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] shadow-2xs'
                : 'text-[#6F6267] dark:text-[#A8989B]'
            }`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveView('slots')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'slots'
                ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] shadow-2xs'
                : 'text-[#6F6267] dark:text-[#A8989B]'
            }`}
          >
            Available Slots ({slots.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Action to create slot */}
          <button
            type="button"
            onClick={() => setIsAddSlotOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Available Slot</span>
          </button>

          <button
            type="button"
            onClick={reloadData}
            className="p-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] hover:bg-[#FAF7F4] text-[#6F6267]"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          SUB-VIEW 1: APPOINTMENTS LIST
          ===================================================================== */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8E7E81] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by patient name, phone, or reference code..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-xs"
                />
              </div>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#251E22] text-xs font-semibold"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="text-xs text-[#DC2626] font-bold hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  statusFilter === 'All'
                    ? 'bg-[#1F181A] text-white dark:bg-white dark:text-[#1F181A]'
                    : 'bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] text-[#6F6267]'
                }`}
              >
                All ({appointments.length})
              </button>
              {STATUSES.map((st) => {
                const count = appointments.filter((a) => a.status === st).length;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      statusFilter === st
                        ? 'bg-[#F05A28] text-white'
                        : 'bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] text-[#6F6267]'
                    }`}
                  >
                    {st} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table / List */}
          <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl shadow-xs overflow-hidden">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-[#8E7E81]">
                <Calendar className="w-8 h-8 mx-auto" />
                <p className="text-xs font-semibold">No appointments match the selected filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F4] dark:bg-[#251E22] border-b border-[#EFE4DC] dark:border-[#382E32] text-[#8E7E81] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Ref Code & Patient</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Screening Service</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Reminder</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE4DC] dark:divide-[#382E32]">
                    {filteredAppointments.map((appt) => (
                      <tr
                        key={appt.id}
                        className="hover:bg-[#FFFDF9] dark:hover:bg-[#221B1F] transition-colors"
                      >
                        {/* Patient info */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[11px] font-bold text-[#F05A28]">
                            {appt.referenceCode}
                          </div>
                          <div className="font-bold text-sm text-[#1F181A] dark:text-white mt-0.5">
                            {appt.patientName}
                          </div>
                          <div className="text-[11px] text-[#6F6267] dark:text-[#A8989B] flex items-center gap-2">
                            <span>{appt.patientPhone}</span>
                            {appt.diabetesType && (
                              <span>• {appt.diabetesType}</span>
                            )}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1F181A] dark:text-white">
                            {appt.appointmentDate}
                          </div>
                          <div className="text-[11px] text-[#6F6267] dark:text-[#A8989B] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#F05A28]" />
                            <span>{appt.appointmentTime}</span>
                          </div>
                        </td>

                        {/* Service */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#1F181A] dark:text-white block max-w-xs truncate">
                            {appt.serviceType}
                          </span>
                          {appt.notes && (
                            <span className="text-[10px] text-[#8E7E81] block italic truncate max-w-xs">
                              {appt.notes}
                            </span>
                          )}
                        </td>

                        {/* Status dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={appt.status}
                            onChange={(e) =>
                              handleUpdateStatus(appt.id, e.target.value as AppointmentStatus)
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                              appt.status === 'Confirmed'
                                ? 'bg-[#DCFCE7] text-[#14532D] border-[#86EFAC]'
                                : appt.status === 'Completed'
                                ? 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]'
                                : appt.status === 'Cancelled'
                                ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]'
                                : appt.status === 'Pending'
                                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                                : appt.status === 'Rescheduled'
                                ? 'bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE]'
                                : 'bg-[#F3ECE5] text-[#524346] border-[#C4B7BA]'
                            }`}
                          >
                            {STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Reminder */}
                        <td className="py-3.5 px-4">
                          {appt.reminderOptIn ? (
                            <span className="text-[10px] text-[#15803D] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                              ✓ {appt.reminderMethod?.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8E7E81]">Opted out</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onStartScreeningWithPatient && appt.status !== 'Completed' && (
                              <button
                                type="button"
                                onClick={() =>
                                  onStartScreeningWithPatient(appt.patientName, appt.diabetesType)
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#F05A28] hover:bg-[#D84818] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Start screening examination with this patient"
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Screen Now</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => bookingService.generateIcsFile(appt)}
                              className="p-1.5 rounded-lg border border-[#EFE4DC] text-[#6F6267] hover:bg-[#FAF7F4]"
                              title="Download iCal file"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 2: CALENDAR VIEW
          ===================================================================== */}
      {activeView === 'calendar' && (
        <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE7] dark:border-[#2C2428]">
            <div>
              <h2 className="text-xl font-extrabold text-[#1F181A] dark:text-white">
                Upcoming Appointment Calendar
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Daily distribution of patient appointments for {currentCenter.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from(new Set(appointments.map((a) => a.appointmentDate)))
              .sort()
              .map((dateStr) => {
                const dayAppts = appointments.filter((a) => a.appointmentDate === dateStr);
                const d = new Date(dateStr + 'T00:00:00');

                return (
                  <div
                    key={dateStr}
                    className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DC] dark:border-[#382E32]">
                      <div>
                        <span className="text-xs font-bold text-[#F05A28] uppercase">
                          {d.toLocaleDateString(undefined, { weekday: 'long' })}
                        </span>
                        <h3 className="text-sm font-extrabold text-[#1F181A] dark:text-white">
                          {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1C1719] border border-[#EFE4DC]">
                        {dayAppts.length} appointments
                      </span>
                    </div>

                    <div className="space-y-2">
                      {dayAppts.map((a) => (
                        <div
                          key={a.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[#1F181A] dark:text-white">{a.patientName}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                a.status === 'Confirmed'
                                  ? 'bg-[#DCFCE7] text-[#14532D]'
                                  : a.status === 'Completed'
                                  ? 'bg-[#E0F2FE] text-[#0369A1]'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {a.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6F6267] dark:text-[#A8989B] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#F05A28]" />
                            <span>{a.appointmentTime}</span>
                          </div>
                          <div className="text-[10px] text-[#8E7E81] truncate">{a.serviceType}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 3: AVAILABLE SLOTS MANAGEMENT
          "Authorized staff should be able to manage available slots."
          ===================================================================== */}
      {activeView === 'slots' && (
        <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2ECE7] dark:border-[#2C2428]">
            <div>
              <h2 className="text-xl font-extrabold text-[#1F181A] dark:text-white">
                Screening Slot Capacity Management
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Configure, open, or close available photography time slots for {currentCenter.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddSlotOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Slot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const remaining = slot.capacity - slot.bookedCount;
              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    !slot.isActive
                      ? 'opacity-50 bg-[#F3ECE5] border-dashed border-[#C4B7BA]'
                      : remaining === 0
                      ? 'bg-white dark:bg-[#1C1719] border-[#DC2626]/40'
                      : 'bg-white dark:bg-[#1C1719] border-[#EFE4DC] dark:border-[#382E32] hover:border-[#F05A28]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#F05A28]">
                        {slot.date}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          slot.isActive
                            ? 'bg-[#DCFCE7] text-[#14532D]'
                            : 'bg-stone-300 text-stone-700'
                        }`}
                      >
                        {slot.isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-[#1F181A] dark:text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8E7E81]" />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B] truncate">
                      {slot.serviceType}
                    </p>

                    <div className="pt-2 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center justify-between text-xs">
                      <span className="text-[#8E7E81]">Capacity:</span>
                      <span className="font-bold">
                        {slot.bookedCount} / {slot.capacity} Booked
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleSlot(slot.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        slot.isActive
                          ? 'border border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]'
                          : 'border border-[#86EFAC] text-[#15803D] hover:bg-[#F0FDF4]'
                      }`}
                    >
                      {slot.isActive ? 'Close Slot' : 'Re-open Slot'}
                    </button>
                    {slot.isDemo && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] uppercase font-bold">
                        DEMO DATA
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE SLOT MODAL */}
      {isAddSlotOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleAddSlot}
            className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
              <h3 className="text-lg font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F05A28]" />
                <span>Add Available Screening Slot</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSlotOpen(false)}
                className="p-1 rounded-lg text-[#8E7E81] hover:text-[#1F181A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="font-bold block mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] bg-[#FAF7F4] dark:bg-[#251E22]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] bg-[#FAF7F4] dark:bg-[#251E22]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    placeholder="09:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] bg-[#FAF7F4] dark:bg-[#251E22]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Screening Service *</label>
                <select
                  value={newSlotService}
                  onChange={(e) => setNewSlotService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] bg-[#FAF7F4] dark:bg-[#251E22]"
                >
                  <option value="Comprehensive Retinal Fundus Screening">
                    Comprehensive Retinal Fundus Screening
                  </option>
                  <option value="High-Resolution Macular OCT Scan">
                    High-Resolution Macular OCT Scan
                  </option>
                  <option value="Community Mobile Fundus Screening">
                    Community Mobile Fundus Screening
                  </option>
                  <option value="Rapid Walk-in Fundus Camera Screening">
                    Rapid Walk-in Fundus Camera Screening
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Slot Capacity (Patients) *</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newSlotCapacity}
                  onChange={(e) => setNewSlotCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] bg-[#FAF7F4] dark:bg-[#251E22]"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2 justify-end border-t border-[#F2ECE7] dark:border-[#2C2428]">
              <button
                type="button"
                onClick={() => setIsAddSlotOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#EFE4DC] text-xs font-bold text-[#6F6267]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Add Slot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
