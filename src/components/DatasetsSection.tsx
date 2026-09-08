import React from 'react';
import { Database, Info, Layers, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const DatasetsSection: React.FC = () => {
  return (
    <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE4DC] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
            <Database className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Open-Access Research Benchmarks</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2628] tracking-tight">
            Research Datasets & Cohort Distributions
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-3xl leading-relaxed">
            RetinaGuard models are trained and validated against gold-standard peer-reviewed public datasets across color fundus photography and spectral-domain OCT.
          </p>
        </div>
      </div>

      {/* THREE DATASET CATEGORY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FUNDUS DATASETS */}
        <div className="p-5 rounded-xl border border-[#FED7AA] bg-[#FFFDFB] space-y-4">
          <div className="flex items-center gap-2 text-[#EA580C] font-bold text-sm">
            <Eye className="w-4 h-4" />
            <span>Fundus Photography</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>APTOS 2019 Blindness</span>
                <span className="font-mono text-[#EA580C]">3,662 scans</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                5-class severity grading from Aravind Eye Hospital clinical cohort.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>EyePACS Dataset</span>
                <span className="font-mono text-[#EA580C]">88,702 scans</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                High-volume screening registry for pretraining and domain transfer.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>Messidor-2 & IDRiD</span>
                <span className="font-mono text-[#EA580C]">2,264 scans</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                Pixel-level microaneurysm & hemorrhage ground truth from Indian diabetic cohorts.
              </p>
            </div>
          </div>
        </div>

        {/* OCT DATASETS */}
        <div className="p-5 rounded-xl border border-[#FBCFE8] bg-[#FFFDFB] space-y-4">
          <div className="flex items-center gap-2 text-[#DB2777] font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Optical Coherence Tomography</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>Kermany Retinal OCT</span>
                <span className="font-mono text-[#DB2777]">84,495 B-scans</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                Cell 2018 benchmark covering DME, CNV, Drusen, and Normal retinas.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>Duke SD-OCT</span>
                <span className="font-mono text-[#DB2777]">269 volumes</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                3D volumetric scans annotated for diabetic macular edema fluid pockets.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>OCTID Dataset</span>
                <span className="font-mono text-[#DB2777]">500 scans</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                External cross-scanner validation for optic nerve head and fovea alignment.
              </p>
            </div>
          </div>
        </div>

        {/* CLINICAL METADATA */}
        <div className="p-5 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] space-y-4">
          <div className="flex items-center gap-2 text-[#2E2628] font-bold text-sm">
            <FileText className="w-4 h-4 text-[#EA580C]" />
            <span>Synthetic Clinical Cohort</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>UKPDS & DCCT Calibration</span>
                <span className="font-mono text-[#EA580C]">10,000 synthetic rows</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                Model calibrated against multivariate covariance distributions from landmark diabetic trials.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>10 Structured Biomarkers</span>
                <span className="font-mono text-[#EA580C]">10 features</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                HbA1c (%), disease duration (yrs), systolic & diastolic BP, creatinine, BMI, insulin, visual acuity.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
              <div className="flex justify-between font-bold text-[#2E2628]">
                <span>TreeSHAP Explanations</span>
                <span className="font-mono text-[#EA580C]">Local attributions</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] mt-0.5">
                Computes additive Shapley feature attributions explaining model risk elevation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SCIENTIFIC DATASET HONESTY CALLOUT */}
      <div className="p-4 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-xs text-[#C2410C] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Multimodal Research Disclosure:</strong> No single public dataset combines paired fundus photography, OCT volumes, and longitudinal clinical metadata for the exact same patient cohort. RetinaGuard therefore uses independently trained imaging backbones on verified public benchmarks and a calibrated synthetic metadata cohort for multimodal fusion demonstration.
        </p>
      </div>
    </section>
  );
};
