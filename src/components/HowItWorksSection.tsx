import React from 'react';
import { Eye, Layers, FileText, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE5D8] text-[#D84818] border border-[#FED7AA]">
          <Cpu className="w-3.5 h-3.5 text-[#F05A28]" />
          <span>Multimodal Pipeline</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2024] tracking-tight">
          Three signals. One explainable result.
        </h2>
        <p className="text-xs sm:text-sm text-[#6F6267] leading-relaxed">
          Complementary physiological signals are evaluated independently by specialized model backbones before entering rule-based clinical fusion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: FUNDUS */}
        <div className="bg-white rounded-2xl border border-[#FED7AA] p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-[#F05A28] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFE5D8] text-[#F05A28] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <span className="text-[11px] font-mono text-[#D84818] bg-[#FFE5D8] px-2.5 py-0.5 rounded border border-[#FED7AA]">
                PRIMARY STREAM
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#2B2024] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#F05A28]" />
                <span>Fundus Imaging</span>
              </h3>
              <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                Upload retinal color fundus photograph. Evaluates surface lesions including microaneurysms, hemorrhages, and venous beading.
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] space-y-2 text-xs">
              <div className="flex justify-between text-[#6F6267]">
                <span>Backbone Architecture:</span>
                <strong className="text-[#2B2024] font-mono">EfficientNet-B4</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Input Dimensions:</span>
                <strong className="text-[#2B2024] font-mono">512×512 RGB (CLAHE)</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Target Output:</span>
                <strong className="text-[#F05A28] font-mono">DR Grade 0–4</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Explainability Method:</span>
                <strong className="text-[#DB2777] font-mono">Grad-CAM Heatmaps</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6F6267] flex items-center gap-1.5 pt-2 border-t border-[#FBF4EE]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Trained on APTOS 2019 & EyePACS</span>
          </div>
        </div>

        {/* CARD 2: OCT */}
        <div className="bg-white rounded-2xl border border-[#FBCFE8] p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-[#DB2777] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FBE4EC] text-[#DB2777] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <span className="text-[11px] font-mono text-[#D94A78] bg-[#FBE4EC] px-2.5 py-0.5 rounded border border-[#FBCFE8]">
                OPTIONAL MODALITY
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#2B2024] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#DB2777]" />
                <span>OCT Imaging</span>
              </h3>
              <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                Upload Optical Coherence Tomography B-scan. Visualizes 10 retinal layers to detect subclinical Diabetic Macular Edema (DME).
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] space-y-2 text-xs">
              <div className="flex justify-between text-[#6F6267]">
                <span>Backbone Architecture:</span>
                <strong className="text-[#2B2024] font-mono">DenseNet-121</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Input Dimensions:</span>
                <strong className="text-[#2B2024] font-mono">224×224 Grayscale</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Primary Finding:</span>
                <strong className="text-[#DB2777] font-mono">DME Detection (Fluid)</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Explainability Method:</span>
                <strong className="text-[#F05A28] font-mono">OCT Grad-CAM Slices</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6F6267] flex items-center gap-1.5 pt-2 border-t border-[#FBF4EE]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Kermany Retinal OCT Dataset (Cell 2018)</span>
          </div>
        </div>

        {/* CARD 3: CLINICAL METADATA */}
        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-[#F05A28] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FBF4EE] text-[#F05A28] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <span className="text-[11px] font-mono text-[#6F6267] bg-[#FAF8F6] px-2.5 py-0.5 rounded border border-[#EFE4DC]">
                OPTIONAL CONTEXT
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#2B2024] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F05A28]" />
                <span>Clinical Metadata</span>
              </h3>
              <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                Structured clinical variables that contextualize chronic systemic exposure (HbA1c, duration, BP, creatinine, BMI).
              </p>
            </div>

            <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] space-y-2 text-xs">
              <div className="flex justify-between text-[#6F6267]">
                <span>Model Type:</span>
                <strong className="text-[#2B2024] font-mono">XGBoost Classifier</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Structured Features:</span>
                <strong className="text-[#2B2024] font-mono">10 Tabular Variables</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Explainability Method:</span>
                <strong className="text-[#DB2777] font-mono">TreeSHAP Waterfall Plots</strong>
              </div>
              <div className="flex justify-between text-[#6F6267]">
                <span>Clinical Calibration:</span>
                <strong className="text-[#2B2024] font-mono">UKPDS / DCCT Distributions</strong>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#FFE5D8] rounded-xl border border-[#FED7AA] text-[10px] text-[#D84818] flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#F05A28]" />
            <span>
              <strong>Synthetic metadata notice:</strong> Tabular values are synthetic for research demonstration. No real patient health records are collected.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
