import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, Cpu, Eye, FileText, Layers, Sparkles } from 'lucide-react';

export const ProblemWorkflowSection: React.FC = () => {
  return (
    <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs space-y-8">
      {/* SECTION HEADER */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
          <AlertCircle className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>The Screening Infrastructure Gap</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          Diabetic retinopathy is preventable. Late detection isn't.
        </h2>
        <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
          Early detection and strict glycemic control can prevent over 90% of severe vision loss.
          Yet in most primary care settings, screening infrastructure remains severely fragmented across disparate instruments, specialists, and paper records.
        </p>
      </div>

      {/* COMPARISON WORKFLOW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* TRADITIONAL WORKFLOW CARD */}
        <div className="rounded-2xl border border-[#EFE4DC] bg-[#FAF8F6] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9E8D91]">
                Current Standard of Care
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-200/70 text-neutral-600">
                Fragmented & Delayed
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2E2628]">
              Traditional Disjointed Screening
            </h3>
            <p className="text-xs text-[#6E5C5F] leading-relaxed">
              Patients cycle through multiple clinic visits, isolated imaging machines, and manual handwritten charts with high loss-to-follow-up rates.
            </p>
          </div>

          {/* Sequential Step Diagram */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#EFE4DC] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-[10px] font-bold">
                1
              </div>
              <div>
                <p className="font-bold text-[#2E2628]">Primary Care Fundus Photo</p>
                <p className="text-[10px] text-[#6E5C5F] font-sans">Camera captures 2D retinal surface</p>
              </div>
            </div>

            <div className="flex justify-center text-[#9E8D91]">↓ <span className="text-[10px] ml-1 font-sans">Weeks of referral delay</span></div>

            <div className="p-3 bg-white rounded-xl border border-[#EFE4DC] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-[10px] font-bold">
                2
              </div>
              <div>
                <p className="font-bold text-[#2E2628]">Separate OCT Machine Referral</p>
                <p className="text-[10px] text-[#6E5C5F] font-sans">Requires tertiary eye hospital visit</p>
              </div>
            </div>

            <div className="flex justify-center text-[#9E8D91]">↓ <span className="text-[10px] ml-1 font-sans">Isolated laboratory report</span></div>

            <div className="p-3 bg-white rounded-xl border border-[#EFE4DC] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              <div>
                <p className="font-bold text-[#2E2628]">Manual Clinical History Review</p>
                <p className="text-[10px] text-[#6E5C5F] font-sans">HbA1c & renal labs checked on paper</p>
              </div>
            </div>

            <div className="flex justify-center text-[#9E8D91]">↓ <span className="text-[10px] ml-1 font-sans">Subjective grading variance</span></div>

            <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-300 flex items-center justify-between text-neutral-700">
              <span className="font-bold">Manual Specialist Interpretation</span>
              <span className="text-[10px] text-neutral-500 font-sans">High inter-rater variability</span>
            </div>
          </div>
        </div>

        {/* RETINAGUARD WORKFLOW CARD */}
        <div className="rounded-2xl border-2 border-[#FED7AA] bg-gradient-to-br from-[#FFFDFB] via-[#FFF7ED]/30 to-[#FDF2F8]/30 p-6 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                RetinaGuard Approach
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] font-bold">
                Tri-Modal Consensus
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2E2628]">
              Unified Multimodal AI Decision-Support
            </h3>
            <p className="text-xs text-[#6E5C5F] leading-relaxed">
              Consolidates fundus imaging, cross-sectional OCT, and clinical metadata into an instant, explainable severity assessment with Grad-CAM and SHAP attribution.
            </p>
          </div>

          {/* Unified Flow Diagram */}
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-white rounded-xl border border-[#FED7AA] text-center">
                <span className="text-[10px] font-bold text-[#EA580C] block">FUNDUS</span>
                <span className="text-[9px] text-[#6E5C5F] font-sans">EfficientNet</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#FBCFE8] text-center">
                <span className="text-[10px] font-bold text-[#DB2777] block">OCT</span>
                <span className="text-[9px] text-[#6E5C5F] font-sans">DenseNet DME</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#EFE4DC] text-center">
                <span className="text-[10px] font-bold text-[#2E2628] block">METADATA</span>
                <span className="text-[9px] text-[#6E5C5F] font-sans">XGBoost SHAP</span>
              </div>
            </div>

            <div className="flex justify-center text-[#EA580C]">
              ↓ <span className="text-[10px] ml-1 font-bold font-sans">Deterministic Late Rule-Based Fusion</span>
            </div>

            <div className="p-3 bg-gradient-to-r from-[#FFF7ED] to-[#FDF2F8] rounded-xl border border-[#FDBA74] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EA580C]" />
                <span className="font-bold text-[#2E2628]">Explainable Severity Grade</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#BE185D]">
                Grade 0–4 + Grad-CAM
              </span>
            </div>

            <div className="flex justify-center text-[#DB2777]">
              ↓ <span className="text-[10px] ml-1 font-bold font-sans">Actionable Referral Routing</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#FED7AA] flex items-center justify-between text-[#C2410C]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span className="font-bold">Prioritized Triage Recommendation</span>
              </div>
              <span className="text-[10px] font-sans text-[#6E5C5F]">PDF report generation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
