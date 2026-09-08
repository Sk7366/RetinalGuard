import React from 'react';
import { Eye, Shield, ArrowUpRight, Github, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'landing' | 'screening' | 'results' | 'ablation' | 'architecture' | 'history' | 'interview') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#181517] text-[#D1C7BD] border-t border-[#2E282B] pt-14 pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#EA580C] to-[#DB2777]">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-tight">
                RetinaGuard<span className="text-[#EA580C] text-xs font-sans ml-1">AI</span>
              </span>
            </div>

            <p className="text-sm text-[#A39699] max-w-sm leading-relaxed">
              "Multimodal AI. Explainable by design."
            </p>
            <p className="text-xs text-[#827477] max-w-sm leading-relaxed">
              A research-grade decision-support system fusing color fundus photography, cross-sectional OCT depth imaging, and structured clinical metadata for explainable diabetic retinopathy triage.
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="px-2 py-0.5 rounded bg-[#2A2326] text-[#EA580C] border border-[#3D3236] font-mono text-[11px]">
                PyTorch → ONNX
              </span>
              <span className="px-2 py-0.5 rounded bg-[#2A2326] text-[#DB2777] border border-[#3D3236] font-mono text-[11px]">
                FastAPI · Cloud Run
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3 text-xs">
            <p className="font-bold uppercase tracking-wider text-white text-[11px]">
              Product
            </p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-white transition-colors"
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('screening')}
                  className="hover:text-white transition-colors"
                >
                  3-Step Screening
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="hover:text-white transition-colors"
                >
                  Triage Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-white transition-colors"
                >
                  Screening History
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Tech */}
          <div className="space-y-3 text-xs">
            <p className="font-bold uppercase tracking-wider text-white text-[11px]">
              Research & Tech
            </p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('ablation')}
                  className="hover:text-white transition-colors"
                >
                  6-Model Ablation Study
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('architecture')}
                  className="hover:text-white transition-colors"
                >
                  System Architecture & MLflow
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('interview')}
                  className="hover:text-white transition-colors"
                >
                  Engineering Credibility FAQs
                </button>
              </li>
              <li>
                <span className="text-[#827477] cursor-not-allowed">
                  APTOS 2019 Benchmark
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Standards */}
          <div className="space-y-3 text-xs">
            <p className="font-bold uppercase tracking-wider text-white text-[11px]">
              Legal & Standards
            </p>
            <ul className="space-y-2">
              <li>
                <span className="text-[#A39699]">
                  Research SaMD Protocol
                </span>
              </li>
              <li>
                <span className="text-[#A39699]">
                  Synthetic Metadata Notice
                </span>
              </li>
              <li>
                <span className="text-[#A39699]">
                  Privacy & PHI Protection
                </span>
              </li>
              <li>
                <span className="text-[#A39699]">
                  No Clinical Diagnosis Claimed
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM STATUTORY DISCLAIMER */}
        <div className="pt-8 border-t border-[#2E282B] space-y-4">
          <div className="p-4 rounded-xl bg-[#221D20] border border-[#382E32] text-xs text-[#A39699] leading-relaxed">
            <p className="font-semibold text-white mb-1">
              Important Medical & Regulatory Notice:
            </p>
            <p>
              RetinaGuard is a research demonstration tool and is not intended to diagnose, treat, cure, or prevent disease. All model predictions, Grad-CAM attention maps, and SHAP risk factor attributions require confirmatory clinical examination by a licensed ophthalmologist. No FDA or CDSCO clearance is claimed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#827477]">
            <p>© 2026 RetinaGuard Multimodal Clinical AI Research Lab. All rights reserved.</p>
            <p className="font-mono text-[11px]">
              Trained on APTOS 2019, EyePACS, Kermany OCT, and UKPDS distributions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
