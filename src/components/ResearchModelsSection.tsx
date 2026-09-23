import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  FileCode2,
  GitBranch,
  Layers,
  Server,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ModelSpec {
  id: string;
  name: string;
  type: string;
  parameters: string;
  inputDim: string;
  outputDim: string;
  latencyGpu: string;
  latencyCpu: string;
  description: string;
  details: string[];
}

const MODELS: ModelSpec[] = [
  {
    id: 'fundus-backbone',
    name: 'EfficientNet-B4 Fundus Backbone',
    type: '2D Convolutional Neural Network',
    parameters: '19.3M parameters',
    inputDim: '380 × 380 × 3 (RGB Fundus)',
    outputDim: '1,792-dim visual latent vector',
    latencyGpu: '14 ms (NVIDIA RTX 4090)',
    latencyCpu: '84 ms (Intel Xeon ONNX)',
    description: 'Pre-trained on ImageNet-22k and fine-tuned on 120,000 multi-ethnic retinal photographs with compound scaling. Computes Grad-CAM spatial gradients on top_conv.',
    details: [
      'Stochastic Depth (drop rate = 0.2) to prevent overfitting on subtle lesions',
      'AutoAugment tailored with CLAHE and circular vessel contrast normalization',
      'Outputs intermediate feature maps for multi-scale lesion localization',
    ],
  },
  {
    id: 'oct-backbone',
    name: '3D ResNet-50 OCT Volumetric Encoder',
    type: '3D Spatio-Temporal ResNet',
    parameters: '46.2M parameters',
    inputDim: '32 × 256 × 256 (Volumetric B-Scans)',
    outputDim: '2,048-dim depth latent vector',
    latencyGpu: '28 ms (NVIDIA RTX 4090)',
    latencyCpu: '142 ms (Intel Xeon ONNX)',
    description: 'Extracts cross-sectional macular layer thickness, intraretinal cystoid spaces, and subretinal fluid pockets for highly sensitive Diabetic Macular Edema (DME) classification.',
    details: [
      '3D anisotropic convolutions (3×7×7 kernel) prioritizing in-plane retinal resolution',
      'Pre-trained on 45,000 spectral-domain OCT volumes (Cirrus / Spectralis)',
      'Directly correlates retinal layer segmentation with fundus surface lesions',
    ],
  },
  {
    id: 'fusion-module',
    name: 'Multi-Head Cross-Attention Late Fusion',
    type: 'Transformer Cross-Attention Block',
    parameters: '8.4M parameters',
    inputDim: 'Fundus (1792d) + OCT (2048d) + EHR (128d)',
    outputDim: '512-dim multimodal joint embedding',
    latencyGpu: '4 ms (NVIDIA RTX 4090)',
    latencyCpu: '16 ms (Intel Xeon ONNX)',
    description: 'Learns bidirectional attention maps between fundus vascular abnormalities, OCT fluid accumulations, and patient glycemic control parameters.',
    details: [
      '8 attention heads with scaled dot-product and residual layer normalization',
      'Dynamic modality gating: automatically downweights degraded or missing modalities',
      'Demonstrates +0.068 AUC improvement over single-modality baseline (p < 0.001)',
    ],
  },
  {
    id: 'tabular-encoder',
    name: 'Clinical EHR Tabular Embedding MLP',
    type: 'Multi-Layer Perceptron with Residuals',
    parameters: '0.6M parameters',
    inputDim: '6 Covariates (Age, HbA1c, Duration, BP, BMI, Meds)',
    outputDim: '128-dim clinical embedding',
    latencyGpu: '< 1 ms (NVIDIA RTX 4090)',
    latencyCpu: '2 ms (Intel Xeon ONNX)',
    description: 'Embeds continuous and categorical clinical variables using entity embeddings and batch normalization to provide systemic contextual priors to the vision backbones.',
    details: [
      'Robust to missing clinical covariates via masked mean imputation',
      'Quantified via TreeSHAP for transparent epidemiological contribution',
      'Prevents false negatives in early-stage asymptomatic high-risk diabetics',
    ],
  },
  {
    id: 'evidential-head',
    name: 'Dirichlet Evidential Uncertainty Head',
    type: 'Evidential Deep Learning Head',
    parameters: '0.3M parameters',
    inputDim: '512-dim joint embedding',
    outputDim: '5-class Alpha parameters (Dirichlet Prior)',
    latencyGpu: '2 ms (NVIDIA RTX 4090)',
    latencyCpu: '6 ms (Intel Xeon ONNX)',
    description: 'Replaces standard uncalibrated softmax with Dirichlet parameter distributions, decomposing total predictive variance into aleatoric (data noise) and epistemic (model unfamiliarity) uncertainty.',
    details: [
      'Triggers "HUMAN REVIEW RECOMMENDED" whenever vacuity exceeds safety threshold',
      'Evaluated using Expected Calibration Error (ECE = 0.019 post-temperature scaling)',
      'Guarantees fail-safe behavior when presented with out-of-distribution retinal artifacts',
    ],
  },
];

export const ResearchModelsSection: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelSpec>(MODELS[0]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. SECTION BANNER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
              <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Backbone Architectures</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Deep Learning Backbones & Multimodal Encoders
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-3xl leading-relaxed">
              Detailed specifications of the 2D fundus convolutional network, 3D volumetric OCT encoder, cross-attention fusion mechanism, and Dirichlet evidential uncertainty head.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#EFE4DC] text-center min-w-[95px]">
              <span className="text-[10px] text-[#9E8D91] block uppercase font-mono">Total Params</span>
              <span className="text-lg font-mono font-bold text-[#EA580C]">74.8M</span>
            </div>
            <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#EFE4DC] text-center min-w-[95px]">
              <span className="text-[10px] text-[#9E8D91] block uppercase font-mono">ONNX Latency</span>
              <span className="text-lg font-mono font-bold text-[#2E2628]">182 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MODELS GRID / SELECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Model list cards */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-[#6E5C5F] uppercase tracking-wider block">
            Subsystem Architectures ({MODELS.length})
          </span>

          <div className="space-y-2">
            {MODELS.map((m) => {
              const isSelected = m.id === selectedModel.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModel(m)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#EA580C] shadow-md ring-1 ring-[#EA580C]'
                      : 'bg-[#FFFDFB] border-[#EFE4DC] hover:border-[#FED7AA] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#2E2628]">{m.name}</span>
                    <span className="text-[10px] font-mono text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA]">
                      {m.parameters}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6E5C5F] block">{m.type}</span>
                  <div className="flex items-center gap-3 text-[10px] text-[#8E7E81] font-mono mt-2 pt-2 border-t border-[#F5EFEB]">
                    <span>GPU: {m.latencyGpu.split(' ')[0]}</span>
                    <span>·</span>
                    <span>CPU: {m.latencyCpu.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Model Detail Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#EFE4DC] pb-4">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="font-serif font-bold text-xl text-[#2E2628]">
                {selectedModel.name}
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF8F6] text-[#2E2628] border border-[#EFE4DC] font-mono">
                {selectedModel.parameters}
              </span>
            </div>
            <p className="text-xs text-[#EA580C] font-semibold">{selectedModel.type}</p>
            <p className="text-xs text-[#6E5C5F] mt-2 leading-relaxed">
              {selectedModel.description}
            </p>
          </div>

          {/* I/O Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <span className="text-[10px] font-mono uppercase text-[#8E7E81] block">Input Tensor Shape</span>
              <span className="text-xs font-mono font-bold text-[#2E2628] mt-0.5 block">
                {selectedModel.inputDim}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <span className="text-[10px] font-mono uppercase text-[#8E7E81] block">Output Latent Representation</span>
              <span className="text-xs font-mono font-bold text-[#EA580C] mt-0.5 block">
                {selectedModel.outputDim}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <span className="text-[10px] font-mono uppercase text-[#8E7E81] block">GPU Latency Benchmark</span>
              <span className="text-xs font-mono font-bold text-[#059669] mt-0.5 block">
                {selectedModel.latencyGpu}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <span className="text-[10px] font-mono uppercase text-[#8E7E81] block">Edge CPU Latency (ONNX)</span>
              <span className="text-xs font-mono font-bold text-[#2E2628] mt-0.5 block">
                {selectedModel.latencyCpu}
              </span>
            </div>
          </div>

          {/* Architecture Architectural Highlights */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#2E2628] block">
              Architectural Design Decisions:
            </span>
            <ul className="space-y-1.5 text-xs text-[#6E5C5F]">
              {selectedModel.details.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC] text-xs font-mono text-[#6E5C5F] flex items-center justify-between">
            <span>Framework: PyTorch 2.3 · ONNX Runtime 1.18 · FP16 Quantized</span>
            <span className="text-[#059669] font-bold">READY FOR SERVING</span>
          </div>
        </div>
      </div>
    </div>
  );
};
