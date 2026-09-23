import React, { useState } from 'react';
import { GitBranch, CheckCircle2, ArrowUpRight, Cpu, FileCode2, LineChart, Shield, Terminal } from 'lucide-react';

export const MLflowSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'params' | 'metrics' | 'artifacts'>('metrics');

  return (
    <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE4DC] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE5D8] text-[#D84818] border border-[#FED7AA] mb-2">
            <GitBranch className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>ML Experiment Tracking & Governance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2024] tracking-tight">
            Every experiment is traceable.
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6267] mt-1 max-w-3xl leading-relaxed">
            Full reproducibility and auditability using MLflow experiment tracking. All training runs, hyperparameter sweeps, loss configurations, and Grad-CAM validation artifacts are logged.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#FAF8F6] text-[#2B2024] border border-[#EFE4DC]">
            Run ID: <strong className="text-[#F05A28]">rg-exp-8842</strong>
          </span>
          <span className="font-mono text-xs px-2 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-bold">
            FINISHED
          </span>
        </div>
      </div>

      {/* EXPERIMENT RUN CARD */}
      <div className="rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] overflow-hidden">
        {/* Experiment Run Header Bar */}
        <div className="p-4 bg-[#FAF8F6] border-b border-[#EFE4DC] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#F05A28]" />
            <span className="font-mono font-bold text-[#2B2024]">
              experiment: fundus_efficientnetb4_v2
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#6F6267]">
            <span>Commit: <strong className="text-[#2B2024]">7d2f9a1</strong></span>
            <span>·</span>
            <span>PyTorch 2.3 + ONNX Runtime 1.18</span>
          </div>
        </div>

        {/* Experiment Sub-Tabs */}
        <div className="flex border-b border-[#EFE4DC] bg-white px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'border-[#F05A28] text-[#F05A28]'
                : 'border-transparent text-[#6F6267] hover:text-[#2B2024]'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Validation Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('params')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'params'
                ? 'border-[#F05A28] text-[#F05A28]'
                : 'border-transparent text-[#6F6267] hover:text-[#2B2024]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hyperparameters</span>
          </button>

          <button
            onClick={() => setActiveTab('artifacts')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'artifacts'
                ? 'border-[#F05A28] text-[#F05A28]'
                : 'border-transparent text-[#6F6267] hover:text-[#2B2024]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Artifacts & Visualizations</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'metrics' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
                <span className="text-[#9E8D91] block text-[11px]">Validation QWK:</span>
                <span className="text-xl font-mono font-bold text-[#F05A28]">0.936</span>
                <span className="text-[10px] text-[#10B981] block mt-0.5">Top quartile on APTOS 2019</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
                <span className="text-[#9E8D91] block text-[11px]">Macro AUC-ROC:</span>
                <span className="text-xl font-mono font-bold text-[#DB2777]">0.952</span>
                <span className="text-[10px] text-[#10B981] block mt-0.5">Multi-class one-vs-rest</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
                <span className="text-[#9E8D91] block text-[11px]">Severe DR (Grade 3) Sens:</span>
                <span className="text-xl font-mono font-bold text-[#2B2024]">94.6%</span>
                <span className="text-[10px] text-[#6F6267] block mt-0.5">High referral safety</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
                <span className="text-[#9E8D91] block text-[11px]">PDR (Grade 4) Sens:</span>
                <span className="text-xl font-mono font-bold text-[#2B2024]">97.2%</span>
                <span className="text-[10px] text-[#6F6267] block mt-0.5">Proliferative neovascularization</span>
              </div>
            </div>
          )}

          {activeTab === 'params' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2.5 bg-white rounded border border-[#EFE4DC]">
                <span className="text-[#9E8D91] text-[10px] block">backbone:</span>
                <span className="font-bold text-[#2B2024]">EfficientNet-B4 (ImageNet)</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#EFE4DC]">
                <span className="text-[#9E8D91] text-[10px] block">input_resolution:</span>
                <span className="font-bold text-[#2B2024]">512×512 RGB</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#EFE4DC]">
                <span className="text-[#9E8D91] text-[10px] block">loss_function:</span>
                <span className="font-bold text-[#2B2024]">Ordinal Cross-Entropy + Kappa Aux</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#EFE4DC]">
                <span className="text-[#9E8D91] text-[10px] block">optimizer:</span>
                <span className="font-bold text-[#2B2024]">AdamW (lr=2e-4, weight_decay=1e-3)</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#EFE4DC]">
                <span className="text-[#9E8D91] text-[10px] block">preprocessing:</span>
                <span className="font-bold text-[#2B2024]">CLAHE (clip_limit=2.0) + Ben Graham</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#EFE4DC]">
                <span className="text-[#9E8D91] text-[10px] block">export_format:</span>
                <span className="font-bold text-[#2B2024]">ONNX fp16 (runtime_ms=142)</span>
              </div>
            </div>
          )}

          {activeTab === 'artifacts' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded border border-[#EFE4DC] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2B2024]">confusion_matrix_val.png</p>
                  <p className="text-[10px] text-[#6F6267]">5×5 normalized ordinal matrix</p>
                </div>
                <span className="font-mono text-[10px] text-[#F05A28]">View</span>
              </div>
              <div className="p-3 bg-white rounded border border-[#EFE4DC] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2B2024]">gradcam_sample_overlays.zip</p>
                  <p className="text-[10px] text-[#6F6267]">500 validation Grad-CAM maps</p>
                </div>
                <span className="font-mono text-[10px] text-[#F05A28]">View</span>
              </div>
              <div className="p-3 bg-white rounded border border-[#EFE4DC] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2B2024]">model.onnx (74.2 MB)</p>
                  <p className="text-[10px] text-[#6F6267]">Production quantized artifact</p>
                </div>
                <span className="font-mono text-[10px] text-[#F05A28]">GCS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
