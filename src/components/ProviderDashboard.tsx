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
  ChevronRight,
  Clock,
  Cpu,
  Eye,
  FileCheck,
  FileText,
  Layers,
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

  // Compute live increments
  const liveTotal = history.length;
  const liveReview = history.filter((h) => h.finalGrade === 2).length;
  const livePriority = history.filter((h) => h.finalGrade >= 3 || h.oct.dmeDetected).length;

  // Exact 4 Dashboard Metrics requested:
  // 1. Today's Screening
  // 2. Awaiting Review
  // 3. Referral Recommended
  // 4. Follow-up Due
  const todaysScreeningCount = baseMetrics.totalScreened + liveTotal;
  const awaitingReviewCount = baseMetrics.reviewRecommended + liveReview;
  const referralRecommendedCount = baseMetrics.priorityReferral + livePriority;
  const followUpDueCount = followUps.length;

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

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-20 px-2 sm:px-4" id="screening-helper-dashboard-root">
      {/* =========================================================================
          1. HEADER: Screening Helper
          Do not fake verification.
          Only verified Screening Helpers should access this workspace in production.
          If verification is currently demo-only, clearly show: DEMO VERIFIED
          ========================================================================= */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 lg:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            {/* Header Badge & Demo Verification */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#FFE5D8] text-[#F05A28] border border-[#FED7AA]">
                <Stethoscope className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Screening Helper</span>
              </span>

              {/* CRITICAL REQUIRED BADGE: DEMO VERIFIED */}
              <span
                id="badge-demo-verified"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shadow-2xs"
                title="Accredited Screening Helper credentials active in preview mode"
              >
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>DEMO VERIFIED</span>
              </span>

              <span className="text-[11px] text-[#6F6267] bg-[#FFFDF9] px-2.5 py-1 rounded-md border border-[#EFE4DC]">
                {activeUser.organization || 'Bengaluru District Eye Mission'}
              </span>
            </div>

            {/* Helper Identity */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2B2024] tracking-tight flex items-center gap-2 flex-wrap">
                <span>Screening Helper</span>
                <span className="text-base sm:text-lg font-normal text-[#F05A28] font-sans">
                  · {activeUser.name || 'Ananya Rao'} ({roleTitle})
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6267] mt-1 leading-relaxed max-w-2xl">
                Frontline non-mydriatic fundus intake, automated clarity verification, AI screening support, and closed-loop specialist referral dispatch.
              </p>
            </div>

            {/* Verification Safety Principle Notice */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#6F6267] pt-0.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#059669] shrink-0" />
              <span>
                <strong>Verification Policy:</strong> Only verified Screening Helpers should access this workspace in production. Demo verification is active for testing.
              </span>
            </div>
          </div>

          {/* Quick Header CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="dashboard-header-start-screening-btn"
              onClick={onNewScreening}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-orange-100" />
              <span>Start Screening</span>
            </button>

            <button
              type="button"
              id="dashboard-header-camp-btn"
              onClick={onStartCamp}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#FFFDF9] text-[#2B2024] border border-[#EFE4DC] text-sm font-semibold transition-colors cursor-pointer"
            >
              <Tent className="w-4 h-4 text-[#F05A28]" />
              <span>Camp Mode</span>
            </button>
          </div>
        </div>

        {/* Prototype Verification Simulation Toolbar */}
        <div className="mt-4 pt-4 border-t border-[#EFE4DC] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8E7E81] uppercase tracking-wider">
              Verification State:
            </span>
            <span className="text-[11px] text-[#059669] font-semibold bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
              ✓ Verified (Demo Mode Active)
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#8E7E81]">Test Gate Restrictions:</span>
            <button
              type="button"
              onClick={() => handleSimulateStatus('Pending Verification')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] transition-colors cursor-pointer"
            >
              Simulate Pending Gate
            </button>
            <button
              type="button"
              onClick={() => handleSimulateStatus('Rejected')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] transition-colors cursor-pointer"
            >
              Simulate Rejected Gate
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. DASHBOARD METRICS:
          Today's Screening
          Awaiting Review
          Referral Recommended
          Follow-up Due
          ========================================================================= */}
      <section
        id="section-helper-dashboard-metrics"
        aria-label="Dashboard Metrics Section"
        className="space-y-2.5"
      >
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-bold uppercase tracking-wider text-[#6F6267] text-[11px]">
            Dashboard Metrics
          </span>
          <span className="text-[11px] text-[#8E7E81]">
            Real-time encounter indicators
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* METRIC 1: Today's Screening */}
          <div
            id="metric-todays-screening"
            className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#FED7AA] transition-all"
          >
            <div className="flex items-center justify-between text-xs text-[#6F6267]">
              <span className="font-bold text-[#2B2024] text-xs">Today's Screening</span>
              <Activity className="w-4 h-4 text-[#F05A28]" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2024]">
                {todaysScreeningCount}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#059669] mt-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span>Completed Encounters</span>
              </div>
            </div>
          </div>

          {/* METRIC 2: Awaiting Review */}
          <div
            id="metric-awaiting-review"
            onClick={() => onNavigate('review-queue')}
            className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#FCD34D] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#6F6267]">
              <span className="font-bold text-[#2B2024] text-xs">Awaiting Review</span>
              <AlertTriangle className="w-4 h-4 text-[#D97706] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#D97706]">
                {awaitingReviewCount}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#92400E] mt-1 font-medium">
                <span>Pending Supervisory Adjudication</span>
              </div>
            </div>
          </div>

          {/* METRIC 3: Referral Recommended */}
          <div
            id="metric-referral-recommended"
            onClick={() => onNavigate('referrals')}
            className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#FCA5A5] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#6F6267]">
              <span className="font-bold text-[#2B2024] text-xs">Referral Recommended</span>
              <AlertCircle className="w-4 h-4 text-[#DC2626] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#DC2626]">
                {referralRecommendedCount}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#991B1B] mt-1 font-medium">
                <span>Urgent & Routine Specialist Referrals</span>
              </div>
            </div>
          </div>

          {/* METRIC 4: Follow-up Due */}
          <div
            id="metric-follow-up-due"
            onClick={() => onNavigate('referrals')}
            className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#FED7AA] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-[#6F6267]">
              <span className="font-bold text-[#2B2024] text-xs">Follow-up Due</span>
              <Clock className="w-4 h-4 text-[#F05A28] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2024]">
                {followUpDueCount}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6F6267] mt-1 font-medium">
                <span>Recall Care Checks & Appointments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. PRIMARY ACTIONS:
          Start Screening
          Review Queue
          Appointments
          Referrals
          ========================================================================= */}
      <section
        id="section-helper-primary-actions"
        aria-label="Primary Actions Section"
        className="space-y-3"
      >
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-bold uppercase tracking-wider text-[#2B2024] text-sm">
            Primary Actions
          </span>
          <span className="text-[11px] text-[#8E7E81]">
            Direct frontline helper controls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Start Screening */}
          <div
            id="action-card-start-screening"
            onClick={onNewScreening}
            className="bg-gradient-to-br from-[#FFE5D8] to-white p-5 rounded-2xl border-2 border-[#FED7AA] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F05A28] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F05A28] text-white">
                Primary Intake
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2B2024] group-hover:text-[#F05A28] transition-colors">
                Start Screening
              </h3>
              <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                Register patient, capture 45° non-mydriatic fundus images, and run automated clarity validation.
              </p>
            </div>
            <div className="pt-2 border-t border-[#FED7AA]/60 flex items-center text-xs font-bold text-[#F05A28]">
              <span>Launch New Encounter</span>
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Review Queue */}
          <div
            id="action-card-review-queue"
            onClick={() => onNavigate('review-queue')}
            className="bg-white p-5 rounded-2xl border border-[#EFE4DC] hover:border-[#FED7AA] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] text-[#2B2024] border border-[#EFE4DC] flex items-center justify-center group-hover:border-[#F05A28] group-hover:text-[#F05A28] transition-all">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {awaitingReviewCount} Cases
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2B2024] group-hover:text-[#F05A28] transition-colors">
                Review Queue
              </h3>
              <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                Supervisory adjudication for flagged encounters, ungradable image retakes, and clinician sign-offs.
              </p>
            </div>
            <div className="pt-2 border-t border-[#EFE4DC] flex items-center text-xs font-bold text-[#2B2024] group-hover:text-[#F05A28]">
              <span>Open Review Queue</span>
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Appointments */}
          <div
            id="action-card-appointments"
            onClick={() => onNavigate('appointments')}
            className="bg-white p-5 rounded-2xl border border-[#EFE4DC] hover:border-[#FED7AA] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] text-[#2B2024] border border-[#EFE4DC] flex items-center justify-center group-hover:border-[#F05A28] group-hover:text-[#F05A28] transition-all">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {appointments.length} Today
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2B2024] group-hover:text-[#F05A28] transition-colors">
                Appointments
              </h3>
              <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                Daily scheduled patient slots, arrival check-in status, and capacity slot management.
              </p>
            </div>
            <div className="pt-2 border-t border-[#EFE4DC] flex items-center text-xs font-bold text-[#2B2024] group-hover:text-[#F05A28]">
              <span>Manage Appointments</span>
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Referrals */}
          <div
            id="action-card-referrals"
            onClick={() => onNavigate('referrals')}
            className="bg-white p-5 rounded-2xl border border-[#EFE4DC] hover:border-[#FED7AA] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] text-[#2B2024] border border-[#EFE4DC] flex items-center justify-center group-hover:border-[#F05A28] group-hover:text-[#F05A28] transition-all">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200">
                {referralRecommendedCount} Active
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2B2024] group-hover:text-[#F05A28] transition-colors">
                Referrals
              </h3>
              <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                Dispatched ophthalmologist referral tokens, hospital handovers, and anti-VEGF consults.
              </p>
            </div>
            <div className="pt-2 border-t border-[#EFE4DC] flex items-center text-xs font-bold text-[#2B2024] group-hover:text-[#F05A28]">
              <span>View Referrals & Tokens</span>
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SCREENING WORKFLOW:
          Patient
          → Capture / Upload Image
          → Image Quality Check
          → AI-Assisted Screening Support
          → Human Review
          → Referral
          → Follow-up
          ========================================================================= */}
      <section
        id="section-helper-screening-workflow"
        aria-label="Screening Workflow Section"
        className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <h2 className="text-base font-bold text-[#2B2024] uppercase tracking-wide">
              Screening Workflow
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-[#FFE5D8] text-[#F05A28]">
              Standardized 7-Stage Protocol
            </span>
          </div>

          <button
            type="button"
            onClick={onNewScreening}
            className="text-xs font-bold text-[#F05A28] hover:text-[#D84818] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Start Screening Encounter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#6F6267]">
          End-to-end clinical workflow designed for non-mydriatic screening encounters, image quality enforcement, and closed-loop care.
        </p>

        {/* 7-Stage Interactive Visual Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 pt-1">
          {/* Stage 1: Patient */}
          <div
            onClick={onNewScreening}
            className="p-3 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-white transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-[#FFE5D8] text-[#F05A28] text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <UserIcon className="w-3.5 h-3.5 text-[#8E7E81]" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#2B2024]">Patient</div>
              <div className="text-[10px] text-[#6F6267] leading-tight mt-0.5">
                Demographics & diabetes history
              </div>
            </div>
          </div>

          {/* Stage 2: Capture / Upload Image */}
          <div
            onClick={onNewScreening}
            className="p-3 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-white transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-[#FFE5D8] text-[#F05A28] text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <Camera className="w-3.5 h-3.5 text-[#8E7E81]" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#2B2024]">Capture / Upload</div>
              <div className="text-[10px] text-[#6F6267] leading-tight mt-0.5">
                45° fundus & optional OCT scan
              </div>
            </div>
          </div>

          {/* Stage 3: Image Quality Check */}
          <div
            onClick={onNewScreening}
            className="p-3 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-white transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-[#FFE5D8] text-[#F05A28] text-[10px] font-bold flex items-center justify-center">
                3
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8E7E81]" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#2B2024]">Quality Check</div>
              <div className="text-[10px] text-[#6F6267] leading-tight mt-0.5">
                Automated clarity & illumination gate
              </div>
            </div>
          </div>

          {/* Stage 4: AI-Assisted Screening Support */}
          <div
            onClick={onNewScreening}
            className="p-3 rounded-xl border border-[#FED7AA] bg-[#FFE5D8]/40 hover:bg-[#FFE5D8]/70 transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-[#F05A28] text-white text-[10px] font-bold flex items-center justify-center">
                4
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#2B2024]">AI-Assisted Support</div>
              <div className="text-[10px] text-[#6F6267] leading-tight mt-0.5">
                DR stage & DME fluid detection
              </div>
            </div>
          </div>

          {/* Stage 5: Human Review */}
          <div
            onClick={() => onNavigate('review-queue')}
            className="p-3 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-white transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-[#FFE5D8] text-[#F05A28] text-[10px] font-bold flex items-center justify-center">
                5
              </span>
              <Stethoscope className="w-3.5 h-3.5 text-[#8E7E81]" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#2B2024]">Human Review</div>
              <div className="text-[10px] text-[#6F6267] leading-tight mt-0.5">
                Clinical adjudication & sign-off
              </div>
            </div>
          </div>

          {/* Stage 6: Referral */}
          <div
            onClick={() => onNavigate('referrals')}
            className="p-3 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-white transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-[#FFE5D8] text-[#F05A28] text-[10px] font-bold flex items-center justify-center">
                6
              </span>
              <Send className="w-3.5 h-3.5 text-[#8E7E81]" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#2B2024]">Referral</div>
              <div className="text-[10px] text-[#6F6267] leading-tight mt-0.5">
                Fast-track specialist handover
              </div>
            </div>
          </div>

          {/* Stage 7: Follow-up */}
          <div
            onClick={() => onNavigate('referrals')}
            className="p-3 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-white transition-all cursor-pointer space-y-1.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-[#FFE5D8] text-[#F05A28] text-[10px] font-bold flex items-center justify-center">
                7
              </span>
              <Clock className="w-3.5 h-3.5 text-[#8E7E81]" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#2B2024]">Follow-up</div>
              <div className="text-[10px] text-[#6F6267] leading-tight mt-0.5">
                Closed-loop recall verification
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. REVIEW QUEUE PREVIEW:
          Shows recent cases matching:
          - Case ID
          - Time
          - Image quality
          - Screening status
          - Priority/status
          - Next action
          ========================================================================= */}
      <section
        id="section-helper-review-queue-preview"
        aria-label="Review Queue Section"
        className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <h2 className="text-base font-bold text-[#2B2024] uppercase tracking-wide">
              Review Queue
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {awaitingReviewCount} Awaiting Review
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
          Cases requiring supervisory review, ophthalmoscopic adjudication, or hospital referral dispatch.
        </p>

        {/* Case Cards Table with 6 Fields: Case ID, Time, Image quality, Screening status, Priority/status, Next action */}
        <div className="overflow-x-auto border border-[#EFE4DC] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F6] border-b border-[#EFE4DC] text-[11px] font-bold text-[#6F6267] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Case ID</th>
                <th className="py-3 px-3.5">Time</th>
                <th className="py-3 px-3.5">Image quality</th>
                <th className="py-3 px-3.5">Screening status</th>
                <th className="py-3 px-3.5">Priority / Status</th>
                <th className="py-3 px-3.5 text-right">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DC]">
              {PRESET_CASES.slice(1, 4).map((c, idx) => {
                const triage = c.expectedTriage;
                const times = ['09:30 AM', '10:15 AM', '11:00 AM'];
                const isUrgent = triage.finalGrade >= 3 || triage.oct.dmeDetected;
                const isModerate = triage.finalGrade === 2;

                return (
                  <tr key={c.id} className="hover:bg-[#FFFDF9] transition-colors">
                    {/* 1. Case ID */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-[#2B2024] text-xs">
                        {c.patientCode}
                      </div>
                      <div className="text-[11px] text-[#6F6267]">
                        {c.name} · {triage.clinicalInput.age}y
                      </div>
                    </td>

                    {/* 2. Time */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="text-xs text-[#2B2024] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F05A28]" />
                        <span>{times[idx] || 'Today'}</span>
                      </div>
                    </td>

                    {/* 3. Image quality */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Good (Gradeable)</span>
                      </span>
                    </td>

                    {/* 4. Screening status */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-[#2B2024]">
                        Grade {triage.finalGrade} Output
                      </div>
                      <div className="text-[10px] text-[#8E7E81]">
                        {triage.oct.dmeDetected ? '⚠️ Macular Edema Present' : 'No Foveal Fluid'}
                      </div>
                    </td>

                    {/* 5. Priority/status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {isUrgent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Referral Recommended</span>
                        </span>
                      ) : isModerate ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Review Recommended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Low Concern / Routine</span>
                        </span>
                      )}
                    </td>

                    {/* 6. Next action */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectResult(triage)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#EFE4DC] hover:border-[#F05A28] text-[#2B2024] hover:text-[#F05A28] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Inspect Result
                      </button>

                      {isUrgent ? (
                        <button
                          type="button"
                          onClick={() => onNavigate('referrals')}
                          className="px-2.5 py-1 rounded-lg bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Dispatch
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigate('review-queue')}
                          className="px-2.5 py-1 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          6. APPOINTMENTS:
          Today's booked slots & patient arrival status
          ========================================================================= */}
      <section
        id="section-helper-appointments-preview"
        aria-label="Appointments Section"
        className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <h2 className="text-base font-bold text-[#2B2024] uppercase tracking-wide">
              Appointments
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
                  onClick={onNewScreening}
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
          7. REFERRALS & FOLLOW-UPS
          ========================================================================= */}
      <section
        id="section-helper-follow-ups-preview"
        aria-label="Referrals & Follow-ups Section"
        className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <h2 className="text-base font-bold text-[#2B2024] uppercase tracking-wide">
              Referrals & Follow-ups
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#FFFDF9] text-[#2B2024] border border-[#EFE4DC]">
              {followUps.length} Care Follow-ups
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
                  <strong className="text-[#2B2024]">{item.actionRequired}</strong> · Clinic: {item.facility}
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
                    ? 'Confirm Handover'
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
