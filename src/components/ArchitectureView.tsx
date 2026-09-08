import React from 'react';
import {
  Activity,
  ArrowDown,
  CheckCircle2,
  Code,
  Cpu,
  Database,
  Eye,
  FileCode,
  Layers,
  Server,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
          <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Production ML Architecture & System Engineering</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          RetinaGuard Technical Architecture & Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-3xl leading-relaxed">
          Production stack specifications: PyTorch models exported to ONNX Runtime, served through FastAPI microservices, tracked with MLflow, and integrated into modern React clients.
        </p>
      </div>

      {/* PIPELINE ARCHITECTURE FLOWCHART */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#EFE4DC] pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#2E2628]">End-to-End Multimodal Inference Pipeline</h2>
            <p className="text-xs text-[#6E5C5F]">
              From multimodal clinical ingestion to explainable triage report output:
            </p>
          </div>
          <span className="text-xs font-mono text-[#BE185D] bg-[#FDF2F8] px-2.5 py-1 rounded-md border border-[#FBCFE8]">
            Latency: ~244 ms
          </span>
        </div>

        {/* Pipeline Diagram Blocks */}
        <div className="space-y-6">
          {/* Layer 1: Ingestion */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6E5C5F] block mb-2">
              1. Ingestion & Preprocessing Layer
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/50 space-y-1">
                <span className="text-xs font-bold text-[#C2410C]">Fundus RGB Preprocessing</span>
                <p className="text-[11px] text-[#6E5C5F]">
                  Resize to 512×512 · Circular mask cropping · Contrast Limited Adaptive Histogram Equalization (CLAHE) · Ben Graham color space subtraction.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#FBCFE8] bg-[#FDF2F8]/50 space-y-1">
                <span className="text-xs font-bold text-[#BE185D]">OCT B-Scan Preprocessing</span>
                <p className="text-[11px] text-[#6E5C5F]">
                  Resize to 224×224 · Grayscale normalization · Median speckle noise filtering · RPE layer boundary alignment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] space-y-1">
                <span className="text-xs font-bold text-[#2E2628]">Tabular Metadata Vector</span>
                <p className="text-[11px] text-[#6E5C5F]">
                  10-dimensional clinical feature vector · MinMax normalization scaled on UKPDS/DCCT trial cohorts.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-[#9E8D91]">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Layer 2: Core Machine Learning Engines */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6E5C5F] block mb-2">
              2. Core Deep Learning & Machine Learning Models (ONNX)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border-2 border-[#FED7AA] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C2410C]">EfficientNet-B4</span>
                  <span className="text-[10px] font-mono bg-[#FFF7ED] text-[#C2410C] px-1.5 py-0.5 rounded">
                    PyTorch → ONNX
                  </span>
                </div>
                <p className="text-xs text-[#2E2628] leading-snug">
                  Trained on APTOS 2019 / EyePACS. 19.3M params. Uses <strong>Ordinal Cross-Entropy Loss</strong> to penalize clinically severe distance misclassifications.
                </p>
                <div className="text-[11px] font-mono text-[#6E5C5F] pt-1 border-t border-[#EFE4DC]">
                  Output: 5-class softmax probabilities
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-[#FBCFE8] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#BE185D]">DenseNet-121</span>
                  <span className="text-[10px] font-mono bg-[#FDF2F8] text-[#BE185D] px-1.5 py-0.5 rounded">
                    PyTorch → ONNX
                  </span>
                </div>
                <p className="text-xs text-[#2E2628] leading-snug">
                  Trained on Kermany et al. (Cell 2018) 84,495 B-scans. Dense connectivity captures fine retinal layer fluid borders.
                </p>
                <div className="text-[11px] font-mono text-[#6E5C5F] pt-1 border-t border-[#EFE4DC]">
                  Output: DME / Normal / CNV / Drusen
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-[#EFE4DC] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2E2628]">XGBoost Regressor</span>
                  <span className="text-[10px] font-mono bg-[#FFFDFB] text-[#2E2628] px-1.5 py-0.5 rounded border border-[#EFE4DC]">
                    scikit-learn
                  </span>
                </div>
                <p className="text-xs text-[#2E2628] leading-snug">
                  Gradient boosted trees calibrated on systemic risk variables (HbA1c, duration, systolic/diastolic BP, creatinine).
                </p>
                <div className="text-[11px] font-mono text-[#6E5C5F] pt-1 border-t border-[#EFE4DC]">
                  Output: Continuous risk score [0..1]
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-[#9E8D91]">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Layer 3: Explainability Engines */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6E5C5F] block mb-2">
              3. Explainable AI (XAI) Attribution Modules
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/50 space-y-1">
                <span className="text-xs font-bold text-[#C2410C]">Grad-CAM Visual Explanations</span>
                <p className="text-[11px] text-[#6E5C5F]">
                  Gradients pooled from the final convolutional layer of EfficientNet-B4 (`top_conv`) and DenseNet-121 (`denseblock4`). Overlaid with thermal colormap to verify lesion grounding.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#FBCFE8] bg-[#FDF2F8]/50 space-y-1">
                <span className="text-xs font-bold text-[#BE185D]">TreeSHAP Factor Attributions</span>
                <p className="text-[11px] text-[#6E5C5F]">
                  Calculates exact Shapley values for each clinical metadata variable, showing direction and magnitude of risk shifts without sampling approximations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-[#9E8D91]">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Layer 4: Late Fusion & Safety Escalation */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FFF7ED] via-[#FFFDFB] to-[#FDF2F8] border-2 border-[#FED7AA] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#EA580C]" />
                <span className="text-sm font-bold text-[#EA580C]">
                  4. Rule-Based Late Fusion Consensus & DME Escalation Rule
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#DB2777]">
                Safety Guarantee
              </span>
            </div>

            <p className="text-xs text-[#2E2628] leading-relaxed">
              <strong>Late Fusion Formula:</strong>{' '}
              <code className="bg-white/90 px-2 py-0.5 rounded font-mono text-[11px] text-[#C2410C] border border-[#FED7AA]">
                Score = 0.55 × Fundus_Grade + 0.30 × Meta_Grade + 0.15 × (2 if OCT_DME else 0)
              </code>
            </p>

            <div className="p-3 bg-white/90 rounded-xl border border-[#FED7AA] text-xs text-[#2E2628] space-y-1">
              <span className="font-bold text-[#C2410C] block">
                Clinical Safety Escalation Rule (Prevents Maculopathy Blindness):
              </span>
              <p className="text-[11px] text-[#6E5C5F]">
                If the OCT model flags Diabetic Macular Edema (P &gt; 0.50), the system unconditionally enforces a <strong>minimum grade of 2 (Moderate DR / CSME)</strong>, regardless of surface fundus appearance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STACK & MLFLOW INFRASTRUCTURE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EFE4DC] space-y-3">
          <div className="flex items-center gap-2 text-[#C2410C] font-bold text-sm">
            <Server className="w-4 h-4 text-[#EA580C]" />
            <span>FastAPI & ONNX Runtime</span>
          </div>
          <p className="text-xs text-[#6E5C5F] leading-relaxed">
            FastAPI provides asynchronous, type-annotated OpenAPI endpoints. Models run via ONNX Runtime CPU/CUDA with FP16 quantization, cutting cold-start latencies to &lt;250ms.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EFE4DC] space-y-3">
          <div className="flex items-center gap-2 text-[#BE185D] font-bold text-sm">
            <Activity className="w-4 h-4 text-[#DB2777]" />
            <span>MLflow Experiment Tracking</span>
          </div>
          <p className="text-xs text-[#6E5C5F] leading-relaxed">
            All 6 ablation runs, hyperparameters (learning rate 1e-4, weight decay 1e-5, cosine annealing), validation AUC curves, and serialized ONNX model artifacts are logged in MLflow.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EFE4DC] space-y-3">
          <div className="flex items-center gap-2 text-[#2E2628] font-bold text-sm">
            <Database className="w-4 h-4 text-[#2E2628]" />
            <span>Cloud Run & GCS Storage</span>
          </div>
          <p className="text-xs text-[#6E5C5F] leading-relaxed">
            Containerized Docker image deployed onto Google Cloud Run with scale-to-zero capability. De-identified patient scan uploads are stored in encrypted Google Cloud Storage buckets.
          </p>
        </div>
      </section>
    </div>
  );
};
