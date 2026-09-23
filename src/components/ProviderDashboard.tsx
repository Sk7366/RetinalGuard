import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Tent,
  User as UserIcon,
  UserCheck,
  Users,
} from 'lucide-react';
import { screeningApi } from '../api';
import { PRESET_CASES } from '../data/sampleCases';
import { SIMULATED_TODAY_METRICS } from '../mock/mockData';
import { MultimodalTriageResult, User, UserRole, VerificationStatus } from '../types';
import { RiskChip } from './RiskChip';
import { useTranslation } from '../i18n/I18nContext';
import { authService } from '../auth/authService';

interface ProviderDashboardProps {
  history: MultimodalTriageResult[];
  onNavigate: (route: string) => void;
  onSelectResult: (result: MultimodalTriageResult) => void;
  onNewScreening: () => void;
  onStartCamp: () => void;
  onOpenBatch: () => void;
  userRole: UserRole;
  currentUser?: User;
  onUserUpdated?: (user: User) => void;
}

interface TodayAppointmentItem {
  id: string;
  time: string;
  patientName: string;
  patientCode: string;
  age: number;
  phone: string;
  screeningType: string;
  status: 'Checked In' | 'Arrived' | 'Scheduled';
}

interface FollowUpItem {
  id: string;
  patientName: string;
  patientCode: string;
  grade: number;
  hasDme: boolean;
  dueDate: string;
  facility: string;
  actionRequired: string;
  contactStatus: 'Reminder Sent' | 'Pending Call' | 'Confirmed';
}

const SAMPLE_TODAY_APPOINTMENTS: TodayAppointmentItem[] = [
  {
    id: 'apt-01',
    time: '09:30 AM',
    patientName: 'K. Meenakshi Amma',
    patientCode: 'PT-8821',
    age: 61,
    phone: '+91 98451 22334',
    screeningType: 'Type 2 Diabetes 1-Year Recall',
    status: 'Checked In',
  },
  {
    id: 'apt-02',
    time: '10:15 AM',
    patientName: 'Govindappa Gowda',
    patientCode: 'PT-8834',
    age: 54,
    phone: '+91 98452 33445',
    screeningType: 'First-time Retinopathy Screening',
    status: 'Arrived',
  },
  {
    id: 'apt-03',
    time: '11:00 AM',
    patientName: 'Fatima Zohra',
    patientCode: 'PT-8849',
    age: 48,
    phone: '+91 98453 44556',
    screeningType: 'Post-Dilation Confirmatory Rescreen',
    status: 'Scheduled',
  },
  {
    id: 'apt-04',
    time: '02:30 PM',
    patientName: 'Shankar Narayanan',
    patientCode: 'PT-8862',
    age: 67,
    phone: '+91 98454 55667',
    screeningType: 'Annual Community Camp Rescreen',
    status: 'Scheduled',
  },
];

const SAMPLE_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'fup-01',
    patientName: 'Smt. Lakshmi Devi',
    patientCode: 'PT-7104',
    grade: 3,
    hasDme: false,
    dueDate: 'In 3 Days',
    facility: 'Victoria Hospital Retina Clinic',
    actionRequired: 'Severe NPDR referral confirmation',
    contactStatus: 'Confirmed',
  },
  {
    id: 'fup-02',
    patientName: 'Shri Mohan Rao',
    patientCode: 'PT-7189',
    grade: 2,
    hasDme: true,
    dueDate: 'Within 7 Days',
    facility: 'Minto Ophthalmic Hospital',
    actionRequired: 'Active DME - Anti-VEGF evaluation',
    contactStatus: 'Reminder Sent',
  },
  {
    id: 'fup-03',
    patientName: 'Smt. Mumtaz Begum',
    patientCode: 'PT-7250',
    grade: 1,
    hasDme: false,
    dueDate: 'In 30 Days',
    facility: 'South Zone Vision Center',
    actionRequired: 'Mild NPDR annual glycemic follow-up',
    contactStatus: 'Pending Call',
  },
  {
    id: 'fup-04',
    patientName: 'Shri Ramesh Patel',
    patientCode: 'PT-7299',
    grade: 2,
    hasDme: false,
    dueDate: 'Overdue (2 Days)',
    facility: 'District Hospital Ophthalmology',
    actionRequired: 'Recapture confirmation after cataract review',
    contactStatus: 'Pending Call',
  },
];

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  history,
  onNavigate,
  onSelectResult,
  onNewScreening,
  onStartCamp,
  onOpenBatch,
  userRole,
  currentUser: propUser,
  onUserUpdated,
}) => {
  const { t } = useTranslation();
  const [baseMetrics, setBaseMetrics] = useState(SIMULATED_TODAY_METRICS);
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<TodayAppointmentItem[]>(SAMPLE_TODAY_APPOINTMENTS);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(SAMPLE_FOLLOW_UPS);
  const [activeUser, setActiveUser] = useState<User>(() => propUser || authService.getCurrentUser());

  useEffect(() => {
    if (propUser) {
      setActiveUser(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    let isMounted = true;
    screeningApi.getTodayMetrics().then((metrics) => {
      if (isMounted && metrics) {
        setBaseMetrics(metrics);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Live session increments
  const liveTotal = history.length;
  const liveLow = history.filter((h) => h.finalGrade <= 1).length;
  const liveReview = history.filter((h) => h.finalGrade === 2).length;
  const livePriority = history.filter((h) => h.finalGrade >= 3 || h.oct.dmeDetected).length;

  const todayScreenings = baseMetrics.totalScreened + liveTotal;
  const lowConcern = baseMetrics.lowConcern + liveLow;
  const reviewRecommended = baseMetrics.reviewRecommended + liveReview;
  const priorityReferral = baseMetrics.priorityReferral + livePriority;
  const ungradable = baseMetrics.ungradable;

  const handleSimulateStatus = (status: VerificationStatus) => {
    const updated = authService.setVerificationStatus(status);
    setActiveUser(updated);
    if (onUserUpdated) onUserUpdated(updated);
  };

  const handleActionFollowUp = (id: string) => {
    setFollowUps((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.contactStatus === 'Pending Call'
              ? 'Reminder Sent'
              : item.contactStatus === 'Reminder Sent'
              ? 'Confirmed'
              : 'Confirmed';
          return { ...item, contactStatus: nextStatus };
        }
        return item;
      })
    );
  };

  const roleTitle = activeUser.helperRoleTitle || 'Community Health Worker';
  const isDemoVerified = activeUser.isDemoVerification ?? true;

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-20" id="screening-helper-dashboard-root">
      {/* =========================================================================
          HELPER HEADER & VERIFICATION BADGE
          ========================================================================= */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 lg:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            {/* Context Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#FFE5D8] text-[#F05A28] border border-[#FED7AA]">
                <Stethoscope className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>SCREENING HELPER WORKSPACE</span>
              </span>

              {/* CRITICAL: DEMO VERIFIED BADGE */}
              <span
                id="badge-demo-verified"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>DEMO VERIFIED</span>
                <span className="text-[10px] font-normal text-[#065F46] hidden sm:inline">
                  · Accredited Healthcare Personnel
                </span>
              </span>

              <span className="text-[11px] text-[#6F6267] bg-[#FFFDF9] px-2.5 py-1 rounded-md border border-[#EFE4DC]">
                {activeUser.organization || 'Bengaluru District Eye Mission'}
              </span>
            </div>

            {/* Helper Identity */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#2B2024] tracking-tight flex items-center gap-2 flex-wrap">
                <span>{activeUser.name || 'Ananya Rao'}</span>
                <span className="text-sm sm:text-base font-normal text-[#F05A28] font-sans">
                  · {roleTitle}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6267] mt-1 leading-relaxed max-w-2xl">
                Frontline non-mydriatic retinal photography intake, immediate AI risk screening, clinical appointment check-ins, and closed-loop patient referral coordination.
              </p>
            </div>
          </div>

          {/* Quick Actions & Demo Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="dashboard-quick-start-screening-btn"
              onClick={onNewScreening}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-orange-100" />
              <span>Start Screening</span>
            </button>

            <button
              type="button"
              id="dashboard-quick-camp-mode-btn"
              onClick={onStartCamp}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#FFFDF9] text-[#2B2024] border border-[#EFE4DC] text-sm font-semibold transition-colors cursor-pointer"
            >
              <Tent className="w-4 h-4 text-[#F05A28]" />
              <span>Camp Mode</span>
            </button>
          </div>
        </div>

        {/* PROTOTYPE TESTING CONTROLS IN HELPER DASHBOARD */}
        <div className="mt-4 pt-4 border-t border-[#EFE4DC] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8E7E81] uppercase tracking-wider">
              Prototype Verification Test:
            </span>
            <span className="text-[11px] text-[#6F6267]">
              Current Status: <strong className="text-[#059669]">Verified</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleSimulateStatus('Pending Verification')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] transition-colors cursor-pointer"
              title="Test Restricted Gate when status is Pending Verification"
            >
              Simulate Pending Gate
            </button>
            <button
              type="button"
              onClick={() => handleSimulateStatus('Rejected')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] transition-colors cursor-pointer"
              title="Test Restricted Gate when status is Rejected"
            >
              Simulate Rejected Gate
            </button>
            <button
              type="button"
              onClick={() => handleSimulateStatus('Suspended')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FDF4FF] hover:bg-[#FCE7F3] text-[#9E254E] border border-[#F5D0FE] transition-colors cursor-pointer"
              title="Test Restricted Gate when status is Suspended"
            >
              Simulate Suspended Gate
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRIORITY 1: START SCREENING (TOP PRIMARY ACTION MODULE)
          ========================================================================= */}
      <section
        id="section-helper-start-screening"
        className="bg-gradient-to-r from-[#FFE5D8] via-white to-[#FFFDF9] rounded-2xl border-2 border-[#FED7AA] p-5 sm:p-6 lg:p-7 shadow-xs space-y-4"
        aria-label="Start Screening Priority Section"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28] animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B2024] uppercase tracking-wide">
              1. Start Screening
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#F05A28] text-white">
              Primary Workflow
            </span>
          </div>
          <span className="text-xs text-[#8E7E81]">
            Standard 45° Non-Mydriatic Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2B2024]">
              Ready to examine next patient encounter
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed">
              Capture or upload 2D macula-centered & disc-centered fundus photographs. Automated clarity analysis validates focus and illumination before instant multimodal AI risk triaging.
            </p>

            <div className="flex items-center gap-4 text-xs text-[#6F6267] pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                Auto-Quality Gate
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                Grad-CAM Lesion Heatmap
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                OCT-DME Verification
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              type="button"
              id="btn-launch-screening-encounter"
              onClick={onNewScreening}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-sm font-bold shadow-md transition-all cursor-pointer group"
            >
              <Camera className="w-5 h-5 text-orange-100 group-hover:scale-110 transition-transform" />
              <span>Launch Screening Encounter</span>
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              id="btn-launch-camp-flow"
              onClick={onStartCamp}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFFDF9] text-[#2B2024] border border-[#EFE4DC] text-xs font-bold transition-colors cursor-pointer"
            >
              <Tent className="w-4 h-4 text-[#F05A28]" />
              <span>Screening Camp High-Throughput Mode</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRIORITY 2: TODAY'S CASES
          ========================================================================= */}
      <section
        id="section-helper-todays-cases"
        className="space-y-4"
        aria-label="Today's Cases Priority Section"
      >
        <div className="flex items-center justify-between text-xs px-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <h2 className="font-bold uppercase tracking-wider text-[#2B2024] text-sm">
              2. Today's Cases & Triage Metrics
            </h2>
          </div>
          <span className="text-[11px] font-medium text-[#6F6267] bg-[#FFFDF9] px-2.5 py-0.5 rounded border border-[#EFE4DC]">
            Today's Field Cohort
          </span>
        </div>

        {/* 5 KPI SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Today's screenings */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE4DC] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#6F6267] mb-1.5">
              <span className="font-bold text-[#2B2024]">Today's Screenings</span>
              <Activity className="w-3.5 h-3.5 text-[#F05A28]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2024]">
                {todayScreenings}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#059669] mt-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                <span>Audited Encounters</span>
              </div>
            </div>
          </div>

          {/* 2. Low concern */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE4DC] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#2B2024]">Low Concern</span>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Normal / Mild
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2024]">
                {lowConcern}
              </div>
              <div className="text-[10px] text-[#6F6267] mt-1">
                Grade 0 & Grade 1 (Routine 1y)
              </div>
            </div>
          </div>

          {/* 3. Review recommended */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE4DC] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#2B2024]">Review Recommended</span>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Moderate
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2024]">
                {reviewRecommended}
              </div>
              <div className="text-[10px] text-[#6F6267] mt-1">
                Grade 2 Moderate NPDR
              </div>
            </div>
          </div>

          {/* 4. Priority referral */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE4DC] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#2B2024]">Priority Referral</span>
              <span className="text-[9px] font-bold text-red-800 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                Urgent
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-red-700">
                {priorityReferral}
              </div>
              <div className="text-[10px] text-red-600 mt-1 font-medium">
                Grade 3, 4, or Active DME
              </div>
            </div>
          </div>

          {/* 5. Ungradable */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE4DC] shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#2B2024]">Ungradable</span>
              <span className="text-[9px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                Retake
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2024]">
                {ungradable}
              </div>
              <div className="text-[10px] text-[#6F6267] mt-1">
                Recapture Required (QC)
              </div>
            </div>
          </div>
        </div>

        {/* TODAY'S SCREENED CASES LIST */}
        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#2B2024]">
                Recent Screened Patients (Today's Encounters)
              </h3>
              <p className="text-xs text-[#6F6267]">
                Quick case review with automated grade summary and immediate inspect action.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('screenings')}
              className="text-xs font-bold text-[#F05A28] hover:text-[#D84818] flex items-center gap-1 transition-colors"
            >
              <span>View All Today's Cases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRESET_CASES.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-white transition-all shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#2B2024]">{c.patientCode}</span>
                      <RiskChip grade={c.expectedTriage.finalGrade} size="sm" />
                    </div>
                    <div className="text-xs font-medium text-[#2B2024] mt-1">{c.name}</div>
                    <div className="text-[11px] text-[#6F6267]">
                      Age {c.expectedTriage.clinicalInput.age} · HbA1c {c.expectedTriage.clinicalInput.hba1c}% · {c.expectedTriage.clinicalInput.diabetesDurationYears}y DM
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8E7E81] bg-[#F5EFEB] px-1.5 py-0.5 rounded font-mono">
                    OD & OS
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F5EFEB] text-xs">
                  <span className="text-[10px] font-semibold text-[#6F6267]">
                    {c.expectedTriage.oct.dmeDetected ? '⚠️ Macular Edema' : 'Fundus QC: Pass'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectResult(c.expectedTriage)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#EFE4DC] hover:border-[#F05A28] text-[#2B2024] hover:text-[#F05A28] text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Inspect Result
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRIORITY 3: REVIEW QUEUE
          ========================================================================= */}
      <section
        id="section-helper-review-queue"
        className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 shadow-xs space-y-4"
        aria-label="Review Queue Priority Section"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <h2 className="text-base font-bold text-[#2B2024] uppercase tracking-wide">
              3. Review Queue
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-700 border border-red-200">
              {priorityReferral} Cases Flagged for Ophthalmology Action
            </span>
          </div>

          <button
            type="button"
            id="btn-open-full-review-queue"
            onClick={() => onNavigate('review-queue')}
            className="text-xs font-bold text-[#F05A28] hover:text-[#D84818] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Full Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#6F6267]">
          Priority cases requiring supervisory review, ophthalmologist confirmation, or urgent hospital referral dispatch.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {PRESET_CASES.slice(2, 4).map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50/50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-[#2B2024]">{c.patientCode}</span>
                  <RiskChip grade={c.expectedTriage.finalGrade} size="sm" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                    URGENT (24-48h)
                  </span>
                </div>
                <div className="text-xs text-[#6F6267] truncate">
                  {c.name} · {c.expectedTriage.clinicalInput.age}y · HbA1c {c.expectedTriage.clinicalInput.hba1c}%
                </div>
                <div className="text-[11px] font-bold text-red-700">
                  {c.expectedTriage.oct.dmeDetected
                    ? '⚠️ Active Cystoid Macular Edema'
                    : 'Severe NPDR Retinopathy Lesions'}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectResult(c.expectedTriage)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#EFE4DC] text-[#2B2024] hover:text-[#F05A28] text-xs font-bold transition-colors shadow-2xs cursor-pointer text-center"
                >
                  Inspect Case
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('referrals')}
                  className="px-3 py-1 rounded-lg bg-[#F05A28] hover:bg-[#D84818] text-white text-[10px] font-bold transition-colors cursor-pointer text-center"
                >
                  Dispatch Referral
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          PRIORITY 4: APPOINTMENTS
          ========================================================================= */}
      <section
        id="section-helper-appointments"
        className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 shadow-xs space-y-4"
        aria-label="Appointments Priority Section"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <h2 className="text-base font-bold text-[#2B2024] uppercase tracking-wide">
              4. Appointments
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#FFE5D8] text-[#D84818] border border-[#FED7AA]">
              {appointments.length} Scheduled Today
            </span>
          </div>

          <button
            type="button"
            id="btn-view-all-appointments"
            onClick={() => onNavigate('appointments')}
            className="text-xs font-bold text-[#F05A28] hover:text-[#D84818] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Manage All Slots & Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#6F6267]">
          Patients booked for diabetic retinopathy screening encounters at your center today.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-3.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] hover:bg-white transition-all shadow-2xs flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#F05A28] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {apt.time}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      apt.status === 'Checked In'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : apt.status === 'Arrived'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div className="font-bold text-xs text-[#2B2024] truncate">{apt.patientName}</div>
                <div className="text-[11px] text-[#6F6267]">
                  {apt.patientCode} · Age {apt.age}
                </div>
                <div className="text-[10px] text-[#8E7E81] truncate mt-0.5">
                  {apt.screeningType}
                </div>
              </div>

              <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#6F6267] flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5 text-[#8E7E81]" />
                  {apt.phone.slice(-5)}
                </span>
                <button
                  type="button"
                  onClick={() => onNewScreening()}
                  className="px-2.5 py-1 rounded-lg bg-[#F05A28] hover:bg-[#D84818] text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Screen Patient
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          PRIORITY 5: FOLLOW-UPS
          ========================================================================= */}
      <section
        id="section-helper-follow-ups"
        className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 shadow-xs space-y-4"
        aria-label="Follow-ups Priority Section"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <h2 className="text-base font-bold text-[#2B2024] uppercase tracking-wide">
              5. Follow-ups & Care Coordination
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#FFFDF9] text-[#2B2024] border border-[#EFE4DC]">
              {followUps.length} Action Items
            </span>
          </div>

          <button
            type="button"
            id="btn-view-all-referrals"
            onClick={() => onNavigate('referrals')}
            className="text-xs font-bold text-[#F05A28] hover:text-[#D84818] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View All Referrals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#6F6267]">
          Closed-loop tracking for patients requiring hospital ophthalmologist confirmation, repeat fundus photography, or anti-VEGF injection follow-up.
        </p>

        <div className="space-y-2.5">
          {followUps.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-white transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-[#2B2024]">{item.patientName}</span>
                  <span className="text-[11px] font-mono text-[#8E7E81]">({item.patientCode})</span>
                  <RiskChip grade={item.grade} size="sm" />
                  {item.hasDme && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      DME
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {item.dueDate}
                  </span>
                </div>
                <div className="text-xs text-[#6F6267]">
                  <strong className="text-[#2B2024]">{item.actionRequired}</strong> · Destination: {item.facility}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    item.contactStatus === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.contactStatus === 'Reminder Sent'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {item.contactStatus}
                </span>

                <button
                  type="button"
                  onClick={() => handleActionFollowUp(item.id)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFE5D8] border border-[#EFE4DC] hover:border-[#F05A28] text-[#2B2024] hover:text-[#F05A28] text-xs font-bold transition-colors cursor-pointer"
                >
                  {item.contactStatus === 'Pending Call'
                    ? 'Log Call / SMS'
                    : item.contactStatus === 'Reminder Sent'
                    ? 'Confirm Appointment'
                    : 'Verified Completed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
