import React from 'react';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  FileText,
  GitBranch,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface ResearchOverviewSectionProps {
  onNavigateTab: (tab: string) => void;
}

export const ResearchOverviewSection: React.FC<ResearchOverviewSectionProps> = ({
  onNavigateTab,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO SCIENTIFIC EXECUTIVE SUMMARY */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
              <Award className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Multicenter Clinical AI Validation Study · IRB #2024-AI-0418</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Multimodal Late Fusion for Diabetic Retinopathy & Macular Edema Screening
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
              RetinaGuard demonstrates that combining 2D fundus photography, 3D optical coherence tomography (OCT), and electronic health record (EHR) glycemic covariates via cross-attention fusion achieves a statistically superior diagnostic discrimination (AUC 0.942, QWK 0.884) compared to single-modality imaging baselines (DeLong test p &lt; 0.001).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 shrink-0">
            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] text-center min-w-[110px]">
              <span className="text-[10px] text-[#9E8D91] block uppercase font-mono">Late Fusion AUC</span>
              <span className="text-2xl font-mono font-bold text-[#EA580C]">0.942</span>
              <span className="text-[9px] text-[#059669] font-medium block">95% CI: 0.931-0.953</span>
            </div>
            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] text-center min-w-[110px]">
              <span className="text-[10px] text-[#9E8D91] block uppercase font-mono">Multi-class QWK</span>
              <span className="text-2xl font-mono font-bold text-[#2E2628]">0.884</span>
              <span className="text-[9px] text-[#6E5C5F] font-medium block">Quad Weighted Kappa</span>
            </div>
            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] text-center min-w-[110px]">
              <span className="text-[10px] text-[#9E8D91] block uppercase font-mono">DeLong p-val</span>
              <span className="text-xl font-mono font-bold text-[#059669]">&lt; 0.001</span>
              <span className="text-[9px] text-[#8E7E81] font-medium block">vs Fundus Baseline</span>
            </div>
            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] text-center min-w-[110px]">
              <span className="text-[10px] text-[#9E8D91] block uppercase font-mono">Cohort Size</span>
              <span className="text-xl font-mono font-bold text-[#2E2628]">4,250</span>
              <span className="text-[9px] text-[#6E5C5F] font-medium block">Triple-masked eyes</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MULTIMODAL LATE FUSION PIPELINE DIAGRAM */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#EFE4DC] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2E2628] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#EA580C]" />
              <span>End-to-End Multimodal Late Fusion Architecture</span>
            </h3>
            <p className="text-xs text-[#6E5C5F]">
              How 3 input streams converge through cross-attention to produce calibrated clinical triage
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#8E7E81] bg-[#FAF8F6] px-2.5 py-1 rounded-lg border border-[#EFE4DC]">
            ONNX Runtime 1.18 · 182 ms latency
          </span>
        </div>

        {/* Dataflow Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Stage 1: Modality Inputs */}
          <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-[#EA580C] block">
              Stage 1: Input Modalities
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">2D Color Fundus</span>
                <span className="text-[10px] text-[#6E5C5F]">380×380 RGB photograph</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">3D Volumetric OCT</span>
                <span className="text-[10px] text-[#6E5C5F]">32 B-scans macula volume</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">Clinical Covariates</span>
                <span className="text-[10px] text-[#6E5C5F]">HbA1c, Duration, BP, Age</span>
              </div>
            </div>
          </div>

          {/* Stage 2: Feature Encoders */}
          <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-[#EA580C] block">
              Stage 2: Deep Encoders
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">EfficientNet-B4</span>
                <span className="text-[10px] font-mono text-[#EA580C]">1,792d latent + Grad-CAM</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">3D ResNet-50</span>
                <span className="text-[10px] font-mono text-[#EA580C]">2,048d depth latent</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">Entity Embedding MLP</span>
                <span className="text-[10px] font-mono text-[#EA580C]">128d clinical prior</span>
              </div>
            </div>
          </div>

          {/* Stage 3: Late Fusion */}
          <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-[#EA580C] block">
              Stage 3: Cross-Attention
            </span>
            <div className="h-full flex flex-col justify-center space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-[#FFF7ED] border border-[#FED7AA]">
                <span className="font-bold text-[#C2410C] block">Cross-Attention Layer</span>
                <p className="text-[10px] text-[#9A3412] mt-1 leading-relaxed">
                  8-head cross-attention dynamically aligns retinal lesion hotspots with OCT intraretinal edema and systemic glycemic chronicity.
                </p>
              </div>
              <div className="text-[10px] font-mono text-[#8E7E81] text-center">
                Joint Vector: 512 dimensions
              </div>
            </div>
          </div>

          {/* Stage 4: Triage & Uncertainty */}
          <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-[#EA580C] block">
              Stage 4: Triage & Audit
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">5-Class DR Logits</span>
                <span className="text-[10px] text-[#059669] font-semibold">Grades 0-4 Classification</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">Dirichlet Evidential</span>
                <span className="text-[10px] text-[#EA580C] font-semibold">Vacuity & Epistemic Head</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC]">
                <span className="font-bold text-[#2E2628] block">Explainability Attributions</span>
                <span className="text-[10px] text-[#6E5C5F]">Grad-CAM + TreeSHAP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SCIENTIFIC STUDY SECTIONS NAVIGATION TILES */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#6E5C5F] uppercase tracking-wider block">
          Explore Research Sections
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onNavigateTab('models')}
            className="p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#FED7AA] hover:bg-[#FFF7ED]/30 text-left transition-all shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C] transition-colors block">
              Models
            </span>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Inspect EfficientNet-B4 fundus backbone, 3D ResNet-50 OCT encoder, and cross-attention layer parameters.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('datasets')}
            className="p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#FED7AA] hover:bg-[#FFF7ED]/30 text-left transition-all shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Database className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C] transition-colors block">
              Datasets
            </span>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              MESSIDOR-2, EyePACS, APTOS 2019, and the 4,250-patient Karnataka Camp validation cohort splits.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('experiments')}
            className="p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#FED7AA] hover:bg-[#FFF7ED]/30 text-left transition-all shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C] transition-colors block">
              Experiments
            </span>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              The 6-condition Multimodal Ablation Study matrix and statistical DeLong test evaluations.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('evaluation')}
            className="p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#FED7AA] hover:bg-[#FFF7ED]/30 text-left transition-all shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C] transition-colors block">
              Evaluation
            </span>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              5-class DR confusion matrix, per-class sensitivity & specificity, ROC curves, and DME benchmarks.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('explainability')}
            className="p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#FED7AA] hover:bg-[#FFF7ED]/30 text-left transition-all shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C] transition-colors block">
              Explainability
            </span>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              Interactive Grad-CAM heatmaps with alpha slider, TreeSHAP clinical attributions, and fairness audits.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('model-versions')}
            className="p-5 rounded-2xl bg-white border border-[#EFE4DC] hover:border-[#FED7AA] hover:bg-[#FFF7ED]/30 text-left transition-all shadow-2xs group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GitBranch className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C] transition-colors block">
              Model Versions
            </span>
            <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
              MLflow experiment tracking, semantic version registry (v2.4.0-ml), SHA-256 weight checksums, and Model Cards.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
