import React from 'react';
import { Eye, Layers, FileText, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
          <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Multimodal Pipeline</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          Three signals. One explainable result.
        </h2>
        <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
          Complementary physiological signals are evaluated independently by specialized model backbones before entering rule-based clinical fusion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: FUNDUS */}
        <div className="bg-white rounded-2xl border border-[#FED7AA] p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-[#EA580C] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <span className="text-[11px] font-mono text-[#C2410C] bg-[#FFF7ED] px-2.5 py-0.5 rounded border border-[#FED7AA]">
                PRIMARY STREAM
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#2E2628] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#EA580C]" />
                <span>Fundus Imaging</span>
              </h3>
              <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
                Upload retinal color fundus photograph. Evaluates surface lesions including microaneurysms, hemorrhages, and venous beading.
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] space-y-2 text-xs">
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Backbone Architecture:</span>
                <strong className="text-[#2E2628] font-mono">EfficientNet-B4</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Input Dimensions:</span>
                <strong className="text-[#2E2628] font-mono">512×512 RGB (CLAHE)</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Target Output:</span>
                <strong className="text-[#EA580C] font-mono">DR Grade 0–4</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Explainability Method:</span>
                <strong className="text-[#DB2777] font-mono">Grad-CAM Heatmaps</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6E5C5F] flex items-center gap-1.5 pt-2 border-t border-[#FBF4EE]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Trained on APTOS 2019 & EyePACS</span>
          </div>
        </div>

        {/* CARD 2: OCT */}
        <div className="bg-white rounded-2xl border border-[#FBCFE8] p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-[#DB2777] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <span className="text-[11px] font-mono text-[#BE185D] bg-[#FDF2F8] px-2.5 py-0.5 rounded border border-[#FBCFE8]">
                OPTIONAL MODALITY
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#2E2628] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#DB2777]" />
                <span>OCT Imaging</span>
              </h3>
              <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
                Upload Optical Coherence Tomography B-scan. Visualizes 10 retinal layers to detect subclinical Diabetic Macular Edema (DME).
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] space-y-2 text-xs">
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Backbone Architecture:</span>
                <strong className="text-[#2E2628] font-mono">DenseNet-121</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Input Dimensions:</span>
                <strong className="text-[#2E2628] font-mono">224×224 Grayscale</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Primary Finding:</span>
                <strong className="text-[#DB2777] font-mono">DME Detection (Fluid)</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Explainability Method:</span>
                <strong className="text-[#EA580C] font-mono">OCT Grad-CAM Slices</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6E5C5F] flex items-center gap-1.5 pt-2 border-t border-[#FBF4EE]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Kermany Retinal OCT Dataset (Cell 2018)</span>
          </div>
        </div>

        {/* CARD 3: CLINICAL METADATA */}
        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-[#EA580C] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FBF4EE] text-[#EA580C] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <span className="text-[11px] font-mono text-[#6E5C5F] bg-[#FAF8F6] px-2.5 py-0.5 rounded border border-[#EFE4DC]">
                OPTIONAL CONTEXT
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#2E2628] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#EA580C]" />
                <span>Clinical Metadata</span>
              </h3>
              <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
                Structured clinical variables that contextualize chronic systemic exposure (HbA1c, duration, BP, creatinine, BMI).
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] space-y-2 text-xs">
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Model Type:</span>
                <strong className="text-[#2E2628] font-mono">XGBoost Classifier</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Structured Features:</span>
                <strong className="text-[#2E2628] font-mono">10 Tabular Variables</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Explainability Method:</span>
                <strong className="text-[#DB2777] font-mono">TreeSHAP Waterfall Plots</strong>
              </div>
              <div className="flex justify-between text-[#6E5C5F]">
                <span>Clinical Calibration:</span>
                <strong className="text-[#2E2628] font-mono">UKPDS / DCCT Distributions</strong>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#FFF7ED] rounded-xl border border-[#FED7AA] text-[10px] text-[#C2410C] flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#EA580C]" />
            <span>
              <strong>Synthetic metadata notice:</strong> Tabular values are synthetic for research demonstration. No real patient health records are collected.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
