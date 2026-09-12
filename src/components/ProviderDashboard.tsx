import React, { useEffect, useState } from 'react';
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
import { screeningApi } from '../api';
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
  const [baseMetrics, setBaseMetrics] = useState(SIMULATED_TODAY_METRICS);

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

  // Exact 5 metrics specified by user prompt:
  // 1. Today's screenings
  // 2. Low concern
  // 3. Review recommended
  // 4. Priority referral
  // 5. Ungradable
  const todayScreenings = baseMetrics.totalScreened + liveTotal;
  const lowConcern = baseMetrics.lowConcern + liveLow;
  const reviewRecommended = baseMetrics.reviewRecommended + liveReview;
  const priorityReferral = baseMetrics.priorityReferral + livePriority;
  const ungradable = baseMetrics.ungradable; // 7 ungradable scans flagged for recapture

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16" id="provider-dashboard-root">
      {/* Welcome & Clinical Command Hero */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 lg:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            {/* Context & Status Badges */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200/80">
                <Stethoscope className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Provider Clinical Cockpit</span>
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50/80 text-amber-900 border border-amber-200/70">
                SIMULATED DATA · Daily Field Cohort
              </span>
              <span className="text-[11px] text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/70">
                Site: Bengaluru Community Outreach
              </span>
            </div>

            {/* Heading & Supporting Description */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Diabetic Retinopathy Screening Center
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
              Multimodal screening with automated 2D fundus grading, OCT-DME safety verification, and closed-loop ophthalmology referral tracking.
            </p>
          </div>

          {/* Primary & Secondary Clinical CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              id="btn-start-screening-hero"
              onClick={onNewScreening}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors focus:ring-2 focus:ring-[#EA580C]/30 focus:outline-none"
            >
              <Sparkles className="w-4 h-4 text-orange-100" />
              <span>Start Screening</span>
            </button>

            <button
              type="button"
              id="btn-start-camp-hero"
              onClick={onStartCamp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 text-xs sm:text-sm font-semibold transition-colors focus:ring-2 focus:ring-stone-200 focus:outline-none"
            >
              <Tent className="w-4 h-4 text-[#EA580C]" />
              <span>Screening Camp Mode</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CLINICAL TRIAGE OVERVIEW (5 COMPACT, SCAN-OPTIMIZED METRIC CARDS)
          ========================================================================= */}
      <section className="space-y-2.5" aria-label="Clinical Triage Metrics">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
            Today's Clinical Triage Overview
          </span>
          <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/60">
            Simulated Field Data
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Today's screenings */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-medium text-stone-700">Today's Screenings</span>
              <Activity className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                {todayScreenings}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>100% Ingested &amp; Audited</span>
              </div>
            </div>
          </div>

          {/* 2. Low concern (subtle green indicator) */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-stone-700">Low Concern</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Normal / Mild
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                {lowConcern}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Grade 0 (None) &amp; Grade 1 (Mild)
              </div>
            </div>
          </div>

          {/* 3. Review recommended (subtle amber indicator) */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-stone-700">Review Recommended</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Moderate
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                {reviewRecommended}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Grade 2 Moderate NPDR
              </div>
            </div>
          </div>

          {/* 4. Priority referral (subtle red indicator) */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-stone-700">Priority Referral</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Urgent
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                {priorityReferral}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Grade 3, 4, or Active DME
              </div>
            </div>
          </div>

          {/* 5. Ungradable (neutral/warning indicator) */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-stone-700">Ungradable</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                Retake
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                {ungradable}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Recapture Required (QC Gate)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PURPOSEFUL QUICK ACTION WORKFLOW MODULES
          ========================================================================= */}
      <section className="space-y-2.5" aria-label="Quick Action Modules">
        <div className="text-xs px-0.5 font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
          Clinical Workflow Modules
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Module 1: Start Screening */}
          <button
            type="button"
            onClick={onNewScreening}
            className="text-left p-4 sm:p-5 rounded-xl bg-white border border-stone-200/80 hover:border-[#EA580C]/50 hover:bg-stone-50/50 transition-all shadow-2xs group flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#EA580C]">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-orange-50 text-[#EA580C] border border-orange-200/60">
                  Primary Flow
                </span>
              </div>
              <h3 className="font-semibold text-sm text-stone-900 group-hover:text-[#EA580C] transition-colors">
                Start Screening
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Step-by-step examination with 2D fundus, optional OCT, quality gate, and triage report.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EA580C] mt-4 pt-2 border-t border-stone-100">
              <span>Launch Encounter</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Module 2: Review Queue */}
          <button
            type="button"
            onClick={() => onNavigate('review-queue')}
            className="text-left p-4 sm:p-5 rounded-xl bg-white border border-stone-200/80 hover:border-blue-400/50 hover:bg-stone-50/50 transition-all shadow-2xs group flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-blue-400/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200/60">
                  {priorityReferral} Priority
                </span>
              </div>
              <h3 className="font-semibold text-sm text-stone-900 group-hover:text-blue-600 transition-colors">
                Review Queue
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Supervising clinician queue for case validation, Grad-CAM review, and grade confirmation.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-4 pt-2 border-t border-stone-100">
              <span>Open Queue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Module 3: Screening Camp Mode */}
          <button
            type="button"
            onClick={onStartCamp}
            className="text-left p-4 sm:p-5 rounded-xl bg-white border border-stone-200/80 hover:border-emerald-400/50 hover:bg-stone-50/50 transition-all shadow-2xs group flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                  <Tent className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Field / Tablet
                </span>
              </div>
              <h3 className="font-semibold text-sm text-stone-900 group-hover:text-emerald-700 transition-colors">
                Screening Camp Mode
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Streamlined field interface with high-throughput capture and offline sync capability.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-4 pt-2 border-t border-stone-100">
              <span>Enter Camp Mode</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Module 4: Batch Screening */}
          <button
            type="button"
            onClick={() => onNavigate('batch-screening')}
            className="text-left p-4 sm:p-5 rounded-xl bg-white border border-stone-200/80 hover:border-purple-400/50 hover:bg-stone-50/50 transition-all shadow-2xs group flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-purple-400/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60">
                  Multi-Patient
                </span>
              </div>
              <h3 className="font-semibold text-sm text-stone-900 group-hover:text-purple-700 transition-colors">
                Batch Screening
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Ingest multiple imaging sets via CSV manifests with automated batch risk triaging.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 mt-4 pt-2 border-t border-stone-100">
              <span>Batch Engine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Priority Referrals Requiring Attention */}
      <section className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-3.5" aria-label="Priority Referrals">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <h2 className="text-sm sm:text-base font-semibold text-stone-900">
                Priority Referrals Requiring Ophthalmology Action
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Cases classified as Grade 3 (Severe NPDR), Grade 4 (PDR), or active OCT macular edema.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('review-queue')}
            className="text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] inline-flex items-center gap-1 transition-colors"
          >
            <span>View All in Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_CASES.slice(2, 4).map((c) => (
            <div
              key={c.id}
              className="p-3.5 sm:p-4 rounded-xl border border-red-200/70 bg-red-50/20 hover:bg-red-50/40 transition-colors flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs sm:text-sm text-stone-900 truncate">{c.patientCode}</span>
                  <RiskChip grade={c.expectedTriage.finalGrade} size="sm" />
                </div>
                <div className="text-xs text-stone-600 truncate">
                  {c.name} · {c.expectedTriage.clinicalInput.age}y · HbA1c {c.expectedTriage.clinicalInput.hba1c}%
                </div>
                <div className="text-[11px] font-medium text-red-700">
                  {c.expectedTriage.oct.dmeDetected
                    ? '⚠️ Active Cystoid Macular Edema'
                    : 'Severe Retinopathy Lesions'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectResult(c.expectedTriage)}
                className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-800 hover:text-[#EA580C] hover:border-[#EA580C]/40 text-xs font-semibold transition-colors shadow-2xs shrink-0"
              >
                Inspect Case
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
