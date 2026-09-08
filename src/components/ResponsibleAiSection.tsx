import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, HeartHandshake, Eye, Sparkles } from 'lucide-react';

export const ResponsibleAiSection: React.FC = () => {
  return (
    <section className="bg-white rounded-2xl border border-[#FED7AA] p-6 sm:p-10 shadow-xs space-y-6">
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
          <HeartHandshake className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Responsible AI & Regulatory Posture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          Designed with clinical humility.
        </h2>
        <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
          Artificial intelligence in ophthalmology must assist human clinicians, not preempt their specialized clinical judgment.
          RetinaGuard is built as a transparent, auditable decision-support aid.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PILLAR 1: EXPLAINABILITY VS DIAGNOSIS */}
        <div className="p-5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
          <div className="flex items-center gap-2 text-[#EA580C] font-bold text-sm">
            <Eye className="w-4 h-4" />
            <span>Explainability ≠ Ground Truth</span>
          </div>
          <p className="text-xs text-[#2E2628] leading-relaxed">
            <strong>Visual explanations indicate model attention, not clinical proof.</strong> A Grad-CAM activation hotspot highlights regions that mathematically influenced the convolutional layers, but it cannot substitute for dilated stereoscopic biomicroscopy.
          </p>
          <div className="p-2.5 rounded-lg bg-[#FFF7ED] text-[11px] text-[#C2410C] border border-[#FED7AA]/60">
            Grad-CAM and SHAP are auditable interpretability tools designed to flag potential shortcut learning and promote clinician trust.
          </div>
        </div>

        {/* PILLAR 2: REGULATORY & CLINICAL BOUNDARIES */}
        <div className="p-5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
          <div className="flex items-center gap-2 text-[#DB2777] font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Regulatory & Data Safety Commitments</span>
          </div>
          <ul className="space-y-2 text-xs text-[#6E5C5F]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>Research Demonstration Only:</strong> Not cleared by the US FDA or Indian CDSCO as an independent SaMD device.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>No Real Patient Data:</strong> All structured clinical parameters are synthetically generated from UKPDS trial distributions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>Mandatory Confirmatory Review:</strong> All triage outputs require in-person validation by a certified retinal specialist.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
