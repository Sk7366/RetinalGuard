import React from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Layers,
  MapPin,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Tent,
  UserCheck,
  Users,
} from 'lucide-react';
import { PRESET_CASES } from '../data/sampleCases';
import { SIMULATED_TODAY_METRICS } from '../mock/mockData';
import { MultimodalTriageResult, UserRole } from '../types';
import { RiskChip } from './RiskChip';

interface ProviderDashboardProps {
  history: MultimodalTriageResult[];
  onNavigate: (route: string) => void;
  onSelectResult: (result: MultimodalTriageResult) => void;
  onNewScreening: () => void;
  onStartCamp: () => void;
  onOpenBatch: () => void;
  userRole: UserRole;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  history,
  onNavigate,
  onSelectResult,
  onNewScreening,
  onStartCamp,
  onOpenBatch,
  userRole,
}) => {
  // Live session increments
  const liveTotal = history.length;
  const liveLow = history.filter((h) => h.finalGrade <= 1).length;
  const liveReview = history.filter((h) => h.finalGrade === 2).length;
  const livePriority = history.filter((h) => h.finalGrade >= 3 || h.oct.dmeDetected).length;

  // Exact 5 metrics specified by user prompt:
  // 1. Today's screenings
  // 2. Low concern
  // 3. Review recommended
  // 4. Priority referral
  // 5. Ungradable
  const todayScreenings = SIMULATED_TODAY_METRICS.totalScreened + liveTotal;
  const lowConcern = SIMULATED_TODAY_METRICS.lowConcern + liveLow;
  const reviewRecommended = SIMULATED_TODAY_METRICS.reviewRecommended + liveReview;
  const priorityReferral = SIMULATED_TODAY_METRICS.priorityReferral + livePriority;
  const ungradable = SIMULATED_TODAY_METRICS.ungradable; // 7 ungradable scans flagged for recapture

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16" id="provider-dashboard-root">
      {/* Welcome & Command Header */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#EA580C]">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Provider Clinical Cockpit</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                SIMULATED DATA · Daily Field Cohort
              </span>
              <span className="text-xs text-[#6E5C5F] bg-[#FAF8F6] px-2.5 py-0.5 rounded-full border border-[#EFE4DC]">
                Site: Bengaluru Community Outreach
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Diabetic Retinopathy Screening Center
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-3xl leading-relaxed">
              Real-time multimodal clinical triage, automated OCT-DME safety overrides, closed-loop ophthalmology referrals, and community camp tracking.
            </p>
          </div>

          {/* Rapid Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              id="btn-start-screening-hero"
              onClick={onNewScreening}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Screening</span>
            </button>

            <button
              type="button"
              id="btn-start-camp-hero"
              onClick={onStartCamp}
              className="bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
            >
              <Tent className="w-4 h-4 text-[#EA580C]" />
              <span>Screening Camp Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          THE 5 SPECIFIED METRICS CARDS (CLEARLY LABELED SIMULATED DATA)
          1. Today's screenings
          2. Low concern
          3. Review recommended
          4. Priority referral
          5. Ungradable
          ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#6E5C5F] px-1">
          <span className="font-bold uppercase tracking-wider text-[#2E2628]">
            Today's Clinical Triage Overview
          </span>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            SIMULATED DATA
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Today's screenings */}
          <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#6E5C5F] mb-1">
              <span className="font-bold text-[#2E2628]">Today's Screenings</span>
              <Activity className="w-4 h-4 text-[#EA580C]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#2E2628]">
                {todayScreenings}
              </div>
              <div className="text-[11px] text-[#15803D] mt-1 font-semibold">
                100% Ingested &amp; Audited
              </div>
            </div>
          </div>

          {/* 2. Low concern */}
          <div className="bg-white p-5 rounded-2xl border border-[#86EFAC] bg-[#F0FDF4]/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#15803D] mb-1">
              <span className="font-bold">Low Concern</span>
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#15803D]">
                {lowConcern}
              </div>
              <div className="text-[11px] text-[#15803D] mt-1 font-medium">
                Grade 0 (None) &amp; Grade 1 (Mild)
              </div>
            </div>
          </div>

          {/* 3. Review recommended */}
          <div className="bg-white p-5 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB]/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#D97706] mb-1">
              <span className="font-bold">Review Recommended</span>
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#D97706]">
                {reviewRecommended}
              </div>
              <div className="text-[11px] text-[#D97706] mt-1 font-medium">
                Grade 2 Moderate NPDR
              </div>
            </div>
          </div>

          {/* 4. Priority referral */}
          <div className="bg-white p-5 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2]/30 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#DC2626] mb-1">
              <span className="font-bold">Priority Referral</span>
              <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#DC2626]">
                {priorityReferral}
              </div>
              <div className="text-[11px] text-[#DC2626] mt-1 font-medium">
                Grade 3, Grade 4, or Active DME
              </div>
            </div>
          </div>

          {/* 5. Ungradable */}
          <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-[#6E5C5F] mb-1">
              <span className="font-bold text-[#6E5C5F]">Ungradable</span>
              <RotateCcw className="w-4 h-4 text-[#6E5C5F]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#6E5C5F]">
                {ungradable}
              </div>
              <div className="text-[11px] text-[#DC2626] mt-1 font-medium">
                Recapture Required (QC Gate)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Functional Modules Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Start Screening */}
        <button
          type="button"
          onClick={onNewScreening}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] mb-3">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C]">
              Start Screening
            </h3>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              9-step examination encounter with fundus photos, optional OCT, image quality gate, and triage report.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#EA580C] mt-4">
            <span>Launch Exam</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Module 2: Review Queue */}
        <button
          type="button"
          onClick={() => onNavigate('review-queue')}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2E2628] group-hover:text-[#2563EB]">
                Review Queue
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                {priorityReferral} Priority
              </span>
            </div>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Supervising physician queue for case sign-off, Grad-CAM inspection, and grade overrides.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#2563EB] mt-4">
            <span>Open Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Module 3: Screening Camp Mode */}
        <button
          type="button"
          onClick={onStartCamp}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] mb-3">
              <Tent className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C]">
                Screening Camp Mode
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                Tablet Ready
              </span>
            </div>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              High-throughput field interface with large buttons, minimal typing, and "Next Patient" workflow.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#EA580C] mt-4">
            <span>Enter Camp Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Module 4: Batch Screening */}
        <button
          type="button"
          onClick={() => onNavigate('batch-screening')}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-center text-[#9333EA] mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#2E2628] group-hover:text-[#9333EA]">
              Batch Screening
            </h3>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Process multiple images and CSV manifests in mock ingestion mode with automated triage output.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#9333EA] mt-4">
            <span>Batch Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Priority Referrals Requiring Attention */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626]" />
              <h2 className="text-base font-bold text-[#2E2628]">
                Urgent Referrals Requiring Ophthalmology Action
              </h2>
            </div>
            <p className="text-xs text-[#6E5C5F] mt-0.5">
              Cases classified as Grade 3 (Severe NPDR), Grade 4 (PDR), or active OCT macular edema.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('review-queue')}
            className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1"
          >
            <span>View All in Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_CASES.slice(2, 4).map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2]/40 hover:bg-[#FEF2F2] transition-colors flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#2E2628]">{c.patientCode}</span>
                  <RiskChip grade={c.expectedTriage.finalGrade} size="sm" />
                </div>
                <div className="text-xs text-[#6E5C5F]">
                  {c.name} · {c.expectedTriage.clinicalInput.age}y · HbA1c {c.expectedTriage.clinicalInput.hba1c}%
                </div>
                <div className="text-[11px] font-medium text-[#DC2626]">
                  {c.expectedTriage.oct.dmeDetected
                    ? '⚠️ Active Cystoid Macular Edema'
                    : 'Severe Retinopathy Lesions'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectResult(c.expectedTriage)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#EFE4DC] text-[#2E2628] hover:text-[#EA580C] text-xs font-bold transition-colors shadow-2xs shrink-0"
              >
                Inspect Case
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
