import React from 'react';
import { Cpu, Layers, Eye, FileText, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const TechnologySection: React.FC<{ onExploreArch: () => void }> = ({ onExploreArch }) => {
  return (
    <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs space-y-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE4DC] pb-5">
        <div className="max-w-3xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
            <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Multi-Backbone Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
            Built for multimodal reasoning.
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
            Independent neural backbones extract modality-specific representations before passing calibrated probabilities into a deterministic clinical late-fusion policy.
          </p>
        </div>

        <button
          onClick={onExploreArch}
          className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] hover:bg-[#FED7AA]/40 border border-[#FED7AA] flex items-center gap-1.5 transition-colors"
        >
          <span>Full Architecture & MLflow</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* VISUAL ARCHITECTURE FLOW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* STREAM 1 */}
        <div className="p-4 rounded-xl border border-[#FED7AA] bg-[#FFFDFB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#EA580C] font-bold">STREAM 01</span>
            <span className="text-[10px] text-[#9E8D91]">512×512 RGB</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#EA580C]" />
            <h4 className="font-bold text-xs text-[#2E2628]">EfficientNet-B4</h4>
          </div>
          <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
            Fundus surface grading. Outputs 5-class logits + Grad-CAM saliency.
          </p>
        </div>

        {/* STREAM 2 */}
        <div className="p-4 rounded-xl border border-[#FBCFE8] bg-[#FFFDFB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#DB2777] font-bold">STREAM 02</span>
            <span className="text-[10px] text-[#9E8D91]">224×224 Grayscale</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#DB2777]" />
            <h4 className="font-bold text-xs text-[#2E2628]">DenseNet-121</h4>
          </div>
          <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
            OCT B-scan depth analysis. Quantifies cystoid fluid & DME risk.
          </p>
        </div>

        {/* STREAM 3 */}
        <div className="p-4 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#2E2628] font-bold">STREAM 03</span>
            <span className="text-[10px] text-[#9E8D91]">10 Tabular Variables</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#EA580C]" />
            <h4 className="font-bold text-xs text-[#2E2628]">XGBoost + SHAP</h4>
          </div>
          <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
            Metabolic prior. Computes feature importance (HbA1c, BP, duration).
          </p>
        </div>

        {/* FUSION ENGINE */}
        <div className="p-4 rounded-xl border-2 border-[#FED7AA] bg-gradient-to-br from-[#FFF7ED] to-[#FDF2F8] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#BE185D] font-bold">CONSENSUS</span>
            <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
            <h4 className="font-bold text-xs text-[#2E2628]">Rule-Based Fusion</h4>
          </div>
          <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
            Weighted late fusion + clinical safety overrides for vision-critical DME.
          </p>
        </div>
      </div>

      {/* WHY RULE-BASED FUSION? ACCORDION / EXPLAINER */}
      <div className="p-5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
          <h3 className="text-sm font-bold text-[#2E2628]">
            Why Rule-Based Late Fusion Over End-to-End Neural Merging?
          </h3>
        </div>
        <p className="text-xs text-[#6E5C5F] leading-relaxed">
          In clinical medicine, black-box deep concatenation models cannot guarantee deterministic safety behavior. If a fundus camera misses a tiny central lesion but an OCT scan unequivocally reveals subfoveal fluid pockets, a black box might average the signals and downgrade the urgency.
        </p>
        <div className="p-3 bg-white rounded-lg border border-[#EFE4DC] text-xs space-y-1.5 font-mono">
          <p className="text-[#EA580C] font-bold text-[11px]">
            Example Clinical Safety Rule Execution:
          </p>
          <p className="text-[#2E2628] text-[11px] leading-relaxed font-sans">
            "Fundus predicted Grade 3, OCT confirmed DME, and elevated HbA1c corroborated poor glycemic control — resulting in a Severe (Grade 3) assessment with urgent 1-week ophthalmologist referral."
          </p>
        </div>
      </div>
    </section>
  );
};
