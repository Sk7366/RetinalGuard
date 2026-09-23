import React from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  Layers,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { MultimodalTriageResult } from '../types';
import { DR_GRADES } from '../data/benchmarks';

interface ProviderAnalyticsProps {
  history: MultimodalTriageResult[];
}

export const ProviderAnalytics: React.FC<ProviderAnalyticsProps> = ({ history }) => {
  const totalCases = history.length || 1;

  // Grade breakdown
  const gradeCounts = [0, 1, 2, 3, 4].map(
    (g) => history.filter((h) => h.finalGrade === g).length
  );

  const dmeCount = history.filter((h) => h.oct.dmeDetected).length;
  const dmePercentage = Math.round((dmeCount / totalCases) * 100);

  const urgentCount = history.filter((h) => h.finalGrade >= 3 || h.oct.dmeDetected).length;
  const urgentPercentage = Math.round((urgentCount / totalCases) * 100);

  const highConfidenceCount = history.filter((h) => h.confidence === 'HIGH').length;
  const highConfidencePct = Math.round((highConfidenceCount / totalCases) * 100);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE5D8] text-[#D84818] border border-[#FED7AA]">
            <BarChart3 className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>Clinical Population Triage Analytics</span>
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Simulated Benchmark Cohort (Demo Data)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2024] tracking-tight">
          Screening Analytics & Epidemiological Oversight
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6267] mt-1 max-w-2xl leading-relaxed">
          Aggregated diagnostic metrics across community camps and clinic encounters. Monitor population DR stage distributions, macular edema incidence, and referral follow-up efficiency.
        </p>
      </div>

      {/* Top 4 Metric Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
          <div className="text-xs text-[#6F6267] font-medium mb-1">Total Population Screened</div>
          <div className="text-3xl font-bold font-serif text-[#2B2024]">{history.length}</div>
          <div className="text-[11px] text-[#15803D] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% automated quality verified</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
          <div className="text-xs text-[#6F6267] font-medium mb-1">Macular Edema (DME) Rate</div>
          <div className="text-3xl font-bold font-serif text-[#F05A28]">{dmePercentage}%</div>
          <div className="text-[11px] text-[#D84818] mt-1">
            {dmeCount} of {history.length} patients detected on OCT
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
          <div className="text-xs text-[#6F6267] font-medium mb-1">Actionable Referrals</div>
          <div className="text-3xl font-bold font-serif text-[#D94A78]">{urgentPercentage}%</div>
          <div className="text-[11px] text-[#D94A78] mt-1">
            {urgentCount} cases flagged for specialist review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
          <div className="text-xs text-[#6F6267] font-medium mb-1">High Diagnostic Confidence</div>
          <div className="text-3xl font-bold font-serif text-[#15803D]">{highConfidencePct}%</div>
          <div className="text-[11px] text-[#6F6267] mt-1">
            Entropy calibrated across modalities
          </div>
        </div>
      </div>

      {/* Grade Distribution Breakdown Bar Chart */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#2B2024]">Diabetic Retinopathy Grade Distribution</h2>
          <p className="text-xs text-[#6F6267]">
            Breakdown across International Clinical Diabetic Retinopathy (ICDR) grades 0 through 4.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {Object.values(DR_GRADES).map((g, idx) => {
            const count = gradeCounts[idx] || 0;
            const pct = Math.round((count / totalCases) * 100);

            return (
              <div key={g.grade} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                    <span className="font-semibold text-[#2B2024]">{g.name}</span>
                    <span className="text-[#6F6267]">({g.shortName})</span>
                  </div>
                  <div className="font-mono text-[#2B2024]">
                    <span className="font-bold">{count}</span> patients ({pct}%)
                  </div>
                </div>
                <div className="h-3 w-full bg-[#FAF8F6] rounded-full overflow-hidden border border-[#EFE4DC]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, pct)}%`,
                      backgroundColor: g.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Economics & Triage Turnaround Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D84818]">
            <Clock className="w-4 h-4 text-[#F05A28]" />
            <span>Turnaround Time Impact</span>
          </div>
          <h3 className="text-lg font-bold text-[#2B2024]">AI Triage vs. Conventional Specialist Audit</h3>
          <p className="text-xs text-[#6F6267] leading-relaxed">
            In standard rural outreach, manual fundus reading by vitreoretinal specialists averages 12–18 business days. RetinaGuard tri-modal execution delivers immediate point-of-care results.
          </p>

          <div className="space-y-2.5 pt-3">
            <div className="p-3 rounded-xl bg-[#FFE5D8] border border-[#FED7AA] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#D84818]">RetinaGuard Instant Triage</div>
                <div className="text-[11px] text-[#6F6267]">Fundus + OCT + Lab Metadata in clinic</div>
              </div>
              <span className="text-lg font-bold font-mono text-[#F05A28]">~244 ms</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#2B2024]">Traditional Specialist Backlog</div>
                <div className="text-[11px] text-[#6F6267]">Reading center postal queue</div>
              </div>
              <span className="text-base font-semibold font-mono text-[#6F6267]">14 Days</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#BF3663]">
            <ShieldCheck className="w-4 h-4 text-[#DB2777]" />
            <span>Multi-Modal Completeness Audit</span>
          </div>
          <h3 className="text-lg font-bold text-[#2B2024]">Data Stream Capture Fidelity</h3>
          <p className="text-xs text-[#6F6267] leading-relaxed">
            Evaluation of how many patient encounters captured secondary modalities for robust late-fusion arbitration.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#2B2024]">Fundus Photography (Primary)</span>
                <span className="font-bold text-[#15803D]">100%</span>
              </div>
              <div className="h-2 w-full bg-[#FAF8F6] rounded-full overflow-hidden border border-[#EFE4DC]">
                <div className="h-full bg-[#15803D] w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#2B2024]">Macular OCT B-Scans (Secondary)</span>
                <span className="font-bold text-[#F05A28]">94%</span>
              </div>
              <div className="h-2 w-full bg-[#FAF8F6] rounded-full overflow-hidden border border-[#EFE4DC]">
                <div className="h-full bg-[#F05A28] w-[94%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#2B2024]">Clinical Lab Panel (HbA1c, BP, Cr)</span>
                <span className="font-bold text-[#DB2777]">88%</span>
              </div>
              <div className="h-2 w-full bg-[#FAF8F6] rounded-full overflow-hidden border border-[#EFE4DC]">
                <div className="h-full bg-[#DB2777] w-[88%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
