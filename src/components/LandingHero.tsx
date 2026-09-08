import React from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Eye,
  FileCheck,
  GitBranch,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { BENCHMARK_COMPARISONS, ABLATION_STUDY } from '../data/benchmarks';
import { PRESET_CASES } from '../data/sampleCases';
import { RiskChip } from './RiskChip';
import { HeroVisualScanner } from './HeroVisualScanner';
import { ProblemWorkflowSection } from './ProblemWorkflowSection';
import { HowItWorksSection } from './HowItWorksSection';
import { TechnologySection } from './TechnologySection';
import { DatasetsSection } from './DatasetsSection';
import { MLflowSection } from './MLflowSection';
import { ResponsibleAiSection } from './ResponsibleAiSection';

interface LandingHeroProps {
  onStartScreening: () => void;
  onSelectPreset: (caseId: string) => void;
  onViewAblation: () => void;
  onViewArchitecture?: () => void;
  onViewInterview?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartScreening,
  onSelectPreset,
  onViewAblation,
  onViewArchitecture,
  onViewInterview,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl bg-white border border-[#EFE4DC] shadow-sm">
        {/* Top Accent Gradient Ribbon */}
        <div
          className="h-2.5 w-full"
          style={{
            background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)',
          }}
        />

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Research Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
                <span>RESEARCH DEMONSTRATION • NOT A DIAGNOSTIC DEVICE</span>
              </div>

              {/* Headlines */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#2E2628] leading-[1.12]">
                  See beyond the image.
                </h1>
                <p className="text-xl sm:text-2xl font-sans font-medium bg-gradient-to-r from-[#EA580C] to-[#DB2777] bg-clip-text text-transparent">
                  Multimodal AI for explainable diabetic retinopathy screening.
                </p>
              </div>

              <p className="text-[#6E5C5F] text-base sm:text-lg leading-relaxed max-w-2xl">
                RetinaGuard combines <strong>fundus photography</strong>,{' '}
                <strong>OCT depth imaging</strong>, and <strong>clinical metadata</strong> into an interpretable, calibrated DR severity assessment with visual Grad-CAM heatmaps and local SHAP feature attributions.
              </p>

              {/* CTA Action Group */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-start-screening-btn"
                  onClick={onStartScreening}
                  className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center gap-2 hover:gap-2.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try RetinaGuard →</span>
                </button>

                <button
                  id="hero-view-ablation-btn"
                  onClick={onViewAblation}
                  className="bg-white hover:bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] px-5 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Layers className="w-4 h-4 text-[#EA580C]" />
                  <span>Explore the Research</span>
                </button>

                <button
                  onClick={() => onSelectPreset('case-3')}
                  className="bg-[#FAF8F6] hover:bg-[#F3EDE8] text-[#2E2628] border border-[#EFE4DC] px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-[#DB2777]" />
                  <span>Explore Demo Result</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#9E8D91] pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> 1 free screening without login
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> Deterministic ONNX runtime
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> Transparent Grad-CAM & SHAP
                </span>
              </div>
            </div>

            {/* Hero Right Visual: Dynamic Scanning Stage */}
            <div className="lg:col-span-5">
              <HeroVisualScanner onExploreDemo={() => onSelectPreset('case-3')} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY STATS (Immediately Below Hero) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#FED7AA] p-5 shadow-xs">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-[#EA580C]">77M+</p>
          <p className="text-xs font-semibold text-[#2E2628] mt-1">Diabetic Patients in India</p>
          <p className="text-[11px] text-[#6E5C5F] mt-0.5">Second largest diabetic population globally; 1 in 3 has retinopathy.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#FBCFE8] p-5 shadow-xs">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-[#DB2777]">5</p>
          <p className="text-xs font-semibold text-[#2E2628] mt-1">DR Severity Grades</p>
          <p className="text-[11px] text-[#6E5C5F] mt-0.5">International ICDR scale: No DR, Mild, Moderate, Severe, and PDR.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#FED7AA] p-5 shadow-xs">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-[#C2410C]">3</p>
          <p className="text-xs font-semibold text-[#2E2628] mt-1">Input Modalities</p>
          <p className="text-[11px] text-[#6E5C5F] mt-0.5">2D Fundus photographs, OCT B-scan depth slices, and clinical metadata.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs">
          <p className="text-3xl sm:text-4xl font-serif font-bold text-[#2E2628]">0–4</p>
          <p className="text-xs font-semibold text-[#2E2628] mt-1">International Severity Scale</p>
          <p className="text-[11px] text-[#6E5C5F] mt-0.5">Standardized clinical scale with dedicated DME fluid escalation logic.</p>
        </div>
      </section>

      {/* 3. PROBLEM SECTION (Traditional vs RetinaGuard Workflow) */}
      <ProblemWorkflowSection />

      {/* 4. HOW IT WORKS (Three signals. One explainable result.) */}
      <HowItWorksSection />

      {/* 5. TECHNOLOGY SECTION (Architecture & Rule-Based Fusion) */}
      <TechnologySection onExploreArch={() => (onViewArchitecture ? onViewArchitecture() : onViewAblation())} />

      {/* 6. RESEARCH & BENCHMARKS SECTION */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE4DC] pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Scientific Benchmarking Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Beyond accuracy. Measure what actually helps.
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-2xl leading-relaxed">
              Comparing landmark peer-reviewed ophthalmic screening benchmarks against RetinaGuard's research protocol targets.
            </p>
          </div>

          <button
            onClick={onViewAblation}
            className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] hover:bg-[#FED7AA]/40 border border-[#FED7AA] flex items-center gap-1.5 transition-colors"
          >
            <span>View Full Ablation Protocol</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Benchmark Table */}
        <div className="overflow-x-auto rounded-xl border border-[#EFE4DC]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F6] border-b border-[#EFE4DC] text-[#6E5C5F] font-semibold">
                <th className="py-3 px-4">Model / Research Benchmark</th>
                <th className="py-3 px-4">Reference & Cohort</th>
                <th className="py-3 px-4 text-right">AUC-ROC</th>
                <th className="py-3 px-4 text-right">Quadratic Weighted Kappa</th>
                <th className="py-3 px-4">Scientific Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DC]">
              {BENCHMARK_COMPARISONS.map((b, idx) => (
                <tr
                  key={idx}
                  className={
                    b.isPlaceholder
                      ? 'bg-gradient-to-r from-[#FFF7ED]/70 to-[#FDF2F8]/70 font-semibold'
                      : 'hover:bg-[#FAF8F6]'
                  }
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {b.isPlaceholder && (
                        <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                      )}
                      <span className={b.isPlaceholder ? 'text-[#EA580C] font-bold' : 'text-[#2E2628]'}>
                        {b.modelName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#6E5C5F]">{b.reference}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    {b.aucDisplay || b.auc.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    {b.qwkDisplay || b.qwk.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-[#6E5C5F] max-w-xs">{b.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] text-xs text-[#6E5C5F] flex items-center justify-between">
          <span>
            <strong>Note on benchmarking:</strong> Landmark models (Gulshan et al. 2016 JAMA) benchmark binary referable DR on 128k images. RetinaGuard targets 5-class ordinal grading with explicit DME detection.
          </span>
          <span className="font-mono text-[11px] text-[#EA580C] shrink-0 ml-4 font-bold">
            Measured result — update after evaluation
          </span>
        </div>
      </section>

      {/* 7. ABLATION STUDY SECTION (Interactive cards) */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE4DC] pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
              <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Ablation Experiments</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Does multimodal fusion actually help?
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 leading-relaxed">
              "The experiment that turns a model into a research contribution."
            </p>
          </div>

          <div className="p-3 bg-gradient-to-r from-[#FFF7ED] to-[#FDF2F8] rounded-xl border border-[#FDBA74] text-xs">
            <span className="text-[#9E8D91] block text-[10px]">Expected Conceptual Progression:</span>
            <span className="font-bold text-[#BE185D]">
              Full Fusion &gt; Fundus Only &gt; Metadata Only
            </span>
          </div>
        </div>

        {/* Headline Result Highlight Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFF7ED] to-[#FDF2F8] border border-[#FDBA74] text-xs text-[#2E2628] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#EA580C] shrink-0" />
            <span className="font-semibold">
              The improvement from <strong>Fundus Only → Full Fusion</strong> is the project's headline scientific result.
            </span>
          </div>
          <button
            onClick={onViewAblation}
            className="text-xs font-bold text-[#EA580C] hover:underline shrink-0 flex items-center gap-1"
          >
            <span>View 6 Experiments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Experiment Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ABLATION_STUDY.map((exp) => (
            <div
              key={exp.id}
              className={`p-4 rounded-xl border transition-all ${
                exp.id === 6
                  ? 'border-2 border-[#FED7AA] bg-gradient-to-br from-[#FFFDFB] to-[#FFF7ED]/40 shadow-xs'
                  : 'border-[#EFE4DC] bg-[#FFFDFB] hover:border-[#FED7AA]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#2E2628]">{exp.name}</span>
                <span className="font-mono text-[11px] font-bold text-[#EA580C]">
                  {exp.aucDisplay || `AUC ${exp.auc}`}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#6E5C5F] mb-2">{exp.modalities}</p>
              <p className="text-xs text-[#6E5C5F] leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. DATASETS SECTION */}
      <DatasetsSection />

      {/* 9. ML EXPERIMENT TRACKING SECTION */}
      <MLflowSection />

      {/* 10. PRESET CLINICAL CASES (Instant Demo Test) */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE4DC] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
              <FileCheck className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Recruiter & Judge Test Bench</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2628] tracking-tight">
              Pre-Configured Benchmark Cases
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-0.5">
              Instantly inspect tri-modal fusion outputs across diverse clinical phenotypes without uploading files:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESET_CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectPreset(c.id)}
              className="p-4 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] hover:bg-[#FFF7ED]/30 transition-all text-left flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#EA580C]">
                    {c.patientCode}
                  </span>
                  <RiskChip grade={c.expectedTriage.finalGrade} size="sm" />
                </div>
                <p className="text-xs font-semibold text-[#2E2628] mt-1.5">{c.name}</p>
                <p className="text-[11px] text-[#6E5C5F] mt-1 line-clamp-2">
                  HbA1c: <strong>{c.clinicalMetadata.hba1c}%</strong> · OCT: {c.octType}
                </p>
              </div>

              <div className="text-[11px] font-semibold text-[#EA580C] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Triage & CAM</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 11. RESPONSIBLE AI & ETHICS SECTION */}
      <ResponsibleAiSection />
    </div>
  );
};
