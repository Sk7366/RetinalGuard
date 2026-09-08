import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  FileText,
  Layers,
  Send,
  Sparkles,
  Stethoscope,
  Tent,
  UserCheck,
  Users,
} from 'lucide-react';
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
  // Compute dashboard metrics
  const totalScreened = history.length;
  const urgentCases = history.filter((h) => h.finalGrade >= 3 || h.oct.dmeDetected);
  const moderateCases = history.filter((h) => h.finalGrade === 2);
  const normalMildCases = history.filter((h) => h.finalGrade <= 1);
  const dmeDetectedCount = history.filter((h) => h.oct.dmeDetected).length;

  const roleTitleMap: Record<UserRole, string> = {
    public: 'Public User',
    technician: 'Screening Technician',
    provider: 'Healthcare Provider',
    admin: 'System Administrator',
    researcher: 'Clinical AI Researcher',
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                <Stethoscope className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Provider Clinical Cockpit</span>
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Simulated Clinical Cohort (Demo Data)
              </span>
              <span className="text-xs text-[#6E5C5F] bg-[#FAF8F6] px-2.5 py-0.5 rounded-full border border-[#EFE4DC]">
                Workspace: {roleTitleMap[userRole]}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Diabetic Retinopathy Screening Center
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-2xl leading-relaxed">
              Real-time multimodal clinical triage, automated OCT-DME safety overrides, closed-loop ophthalmology referrals, and community camp tracking.
            </p>
          </div>

          {/* Rapid Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onNewScreening}
              className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Screening</span>
            </button>

            <button
              onClick={onStartCamp}
              className="bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Tent className="w-4 h-4 text-[#EA580C]" />
              <span>Camp Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Clinical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Screenings */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6E5C5F] mb-1">
            <span className="font-medium">Total Cases Audited</span>
            <Activity className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2E2628]">{totalScreened}</div>
          <div className="text-[11px] text-[#6E5C5F] mt-1 flex items-center gap-1">
            <span className="text-[#15803D] font-semibold">100% evaluated</span> via tri-modal fusion
          </div>
        </div>

        {/* Urgent Action Required */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6E5C5F] mb-1">
            <span className="font-medium">Urgent Referrals</span>
            <AlertTriangle className="w-4 h-4 text-[#BE185D]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#BE185D]">{urgentCases.length}</div>
          <div className="text-[11px] text-[#BE185D] mt-1 font-medium">
            Grade 3, Grade 4, or Active DME
          </div>
        </div>

        {/* DME Detection */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6E5C5F] mb-1">
            <span className="font-medium">OCT-DME Detected</span>
            <Eye className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#EA580C]">{dmeDetectedCount}</div>
          <div className="text-[11px] text-[#C2410C] mt-1 font-medium">
            Elevated to Grade 2+ safety threshold
          </div>
        </div>

        {/* Average AI Pipeline Speed */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6E5C5F] mb-1">
            <span className="font-medium">Mean AI Inference</span>
            <Clock className="w-4 h-4 text-[#15803D]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#15803D]">244 ms</div>
          <div className="text-[11px] text-[#6E5C5F] mt-1">
            ONNX Runtime · Local Edge Pipeline
          </div>
        </div>
      </div>

      {/* Primary Provider Modules Launchpad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Start Screening */}
        <button
          onClick={() => onNavigate('start-screening')}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] mb-3">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#2E2628] group-hover:text-[#EA580C]">
              Start Screening
            </h3>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Full multimodal diagnostic workflow with fundus photos, OCT B-scans, and clinical labs.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#EA580C] mt-4">
            <span>Launch Encounter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* 2. Screening Camp Mode */}
        <button
          onClick={() => onNavigate('camp-mode')}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] mb-3">
              <Tent className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#2E2628] group-hover:text-[#EA580C]">
              Screening Camp Mode
            </h3>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Fast queue mode for mobile vans and outreach camps with offline local edge processing.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#EA580C] mt-4">
            <span>Open Field Camp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* 3. Review Queue */}
        <button
          onClick={() => onNavigate('review-queue')}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#2E2628] group-hover:text-[#EA580C]">
              Review Queue
            </h3>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Physician verification inbox for urgent cases, uncertain quality, or audit sign-offs.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#EA580C] mt-4">
            <span>Audit Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* 4. Referrals */}
        <button
          onClick={() => onNavigate('referrals')}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#DB2777] hover:bg-[#FDF2F8]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FDF2F8] border border-[#FBCFE8] flex items-center justify-center text-[#DB2777] mb-3">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#2E2628] group-hover:text-[#DB2777]">
              Referrals
            </h3>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Closed-loop referral dispatch and tracking to partner eye hospitals and specialists.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#DB2777] mt-4">
            <span>Manage Referrals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* 5. Analytics */}
        <button
          onClick={() => onNavigate('analytics')}
          className="text-left p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#EA580C] hover:bg-[#FFF7ED]/30 transition-all shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] flex items-center justify-center text-[#EA580C] mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#2E2628] group-hover:text-[#EA580C]">
              Analytics
            </h3>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Epidemiological metrics, ICDR grade distributions, DME rates, and turnaround impact.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#EA580C] mt-4">
            <span>View Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Recent Screenings Section */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC]">
          <div>
            <h2 className="text-base font-bold text-[#2E2628]">Recent Screening Evaluations</h2>
            <p className="text-xs text-[#6E5C5F]">
              Directly inspect patient results, explainability heatmaps, or print clinical referral summaries.
            </p>
          </div>
          <button
            onClick={() => onNavigate('review-queue')}
            className="text-xs font-semibold text-[#EA580C] hover:underline flex items-center gap-1"
          >
            <span>Open Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table of cases */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F6] text-[#6E5C5F] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Patient ID</th>
                <th className="py-2.5 px-3">Triage Grade</th>
                <th className="py-2.5 px-3">OCT DME</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DC]">
              {history.slice(0, 5).map((item) => (
                <tr key={item.patientId} className="hover:bg-[#FAF8F6]/50">
                  <td className="py-3 px-3 font-semibold text-[#2E2628]">
                    {item.patientId}
                  </td>
                  <td className="py-3 px-3">
                    <RiskChip grade={item.finalGrade} label={item.gradeLabel} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    {item.oct.dmeDetected ? (
                      <span className="font-bold text-[#BE185D] bg-[#FDF2F8] px-2 py-0.5 rounded border border-[#FBCFE8]">
                        Positive ({item.oct.centralSubfieldThicknessMicrons} µm)
                      </span>
                    ) : (
                      <span className="text-[#15803D] font-medium">Negative</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-[#15803D]">
                      {item.confidence}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-[#6E5C5F] bg-[#FAF8F6] px-2 py-0.5 rounded border border-[#EFE4DC]">
                      Simulated
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectResult(item)}
                      className="text-[#EA580C] hover:underline font-bold"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
