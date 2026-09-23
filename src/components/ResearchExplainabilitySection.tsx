import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Eye,
  FileText,
  Filter,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

interface GradCamCase {
  id: string;
  name: string;
  grade: string;
  gradeLabel: string;
  keyFindings: string[];
  rawImage: string;
  camHotspotArea: string;
  layerActivation: string;
}

const GRAD_CAM_CASES: GradCamCase[] = [
  {
    id: 'case-severe-npdr',
    name: 'Case RG-4091 (Severe NPDR)',
    grade: 'Grade 3',
    gradeLabel: 'Severe Non-Proliferative DR',
    keyFindings: ['Multiple blot hemorrhages in 4 quadrants', 'Venous beading along superior arcade', 'Hard exudate clusters near fovea'],
    rawImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    camHotspotArea: 'Temporal superior vascular arcade & perimacular ring',
    layerActivation: 'EfficientNet-B4 · top_conv (1792 channels)',
  },
  {
    id: 'case-pdr-nvd',
    name: 'Case RG-8812 (Proliferative DR)',
    grade: 'Grade 4',
    gradeLabel: 'High-Risk Proliferative DR',
    keyFindings: ['Neovascularization at optic disc (NVD > 1/3 disc area)', 'Preretinal hemorrhage', 'Fibrovascular proliferation'],
    rawImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    camHotspotArea: 'Optic nerve head boundary (NVD) & nasal arcades',
    layerActivation: 'EfficientNet-B4 · top_conv + Cross-Attention Layer 2',
  },
  {
    id: 'case-moderate-npdr',
    name: 'Case RG-2204 (Moderate NPDR)',
    grade: 'Grade 2',
    gradeLabel: 'Moderate Non-Proliferative DR',
    keyFindings: ['Microaneurysms in temporal retina', 'Isolated cotton wool spot', 'Trace macular lipid rings'],
    rawImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    camHotspotArea: 'Inferior temporal quadrant microvascular bed',
    layerActivation: 'EfficientNet-B4 · block6a_expand',
  },
];

const SHAP_FEATURES = [
  { name: 'HbA1c Level (%)', impact: +0.38, baseline: 7.2, value: 9.6, direction: 'increase', pValue: '< 0.001' },
  { name: 'Diabetes Duration (Years)', impact: +0.29, baseline: 5.4, value: 14.0, direction: 'increase', pValue: '< 0.001' },
  { name: 'Systolic Blood Pressure (mmHg)', impact: +0.14, baseline: 128, value: 154, direction: 'increase', pValue: '0.004' },
  { name: 'Patient Age (Years)', impact: +0.08, baseline: 52, value: 61, direction: 'increase', pValue: '0.018' },
  { name: 'BMI (kg/m²)', impact: +0.04, baseline: 24.8, value: 27.4, direction: 'increase', pValue: '0.082' },
  { name: 'Statin Medication Adherence', impact: -0.11, baseline: 0.4, value: 1.0, direction: 'decrease', pValue: '0.009' },
];

export const ResearchExplainabilitySection: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<GradCamCase>(GRAD_CAM_CASES[0]);
  const [camOpacity, setCamOpacity] = useState<number>(0.65);
  const [selectedLayer, setSelectedLayer] = useState<'top_conv' | 'block6a' | 'cross_attention'>('top_conv');
  const [activeSubTab, setActiveSubTab] = useState<'gradcam' | 'shap' | 'fairness'>('gradcam');

  return (
    <div className="space-y-8 pb-12">
      {/* 1. SECTION BANNER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Scientific Interpretability & Governance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Explainability: Grad-CAM, SHAP & Algorithmic Fairness
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-3xl leading-relaxed">
              Medical deep learning models must not function as black boxes. Inspect spatial convolutional gradients via Grad-CAM, compute patient-level marginal log-odds risk via TreeSHAP, and audit demographic parity across rural and urban cohorts.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF8F6] p-1.5 rounded-xl border border-[#EFE4DC]">
            <button
              type="button"
              onClick={() => setActiveSubTab('gradcam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === 'gradcam'
                  ? 'bg-[#2E2628] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              Grad-CAM Saliency
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('shap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === 'shap'
                  ? 'bg-[#2E2628] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              SHAP Attributions
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('fairness')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === 'fairness'
                  ? 'bg-[#2E2628] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              Fairness Audits
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB A: GRAD-CAM SALIENCY STUDIO */}
      {activeSubTab === 'gradcam' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE4DC] pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2E2628]">
                  Convolutional Saliency Studio (Grad-CAM Heatmap Explorer)
                </h3>
                <p className="text-xs text-[#6E5C5F]">
                  Visualizing rectified linear combinations of activation gradients across EfficientNet-B4 feature maps
                </p>
              </div>

              {/* Case selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6E5C5F] font-medium">Select Case:</span>
                <select
                  value={selectedCase.id}
                  onChange={(e) => {
                    const c = GRAD_CAM_CASES.find((item) => item.id === e.target.value);
                    if (c) setSelectedCase(c);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FAF8F6] text-xs font-bold text-[#2E2628] focus:border-[#EA580C]"
                >
                  {GRAD_CAM_CASES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CONTROLS BAR: Opacity & Layer Selection */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-xs">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-[#EA580C]" />
                <span className="font-bold text-[#2E2628]">Heatmap Opacity (Alpha = {camOpacity.toFixed(2)}):</span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={camOpacity}
                  onChange={(e) => setCamOpacity(parseFloat(e.target.value))}
                  className="w-32 accent-[#EA580C] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#6E5C5F] font-medium">Target Layer:</span>
                <button
                  type="button"
                  onClick={() => setSelectedLayer('top_conv')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    selectedLayer === 'top_conv'
                      ? 'bg-[#EA580C] text-white shadow-2xs'
                      : 'bg-white border border-[#EFE4DC] text-[#6E5C5F]'
                  }`}
                >
                  top_conv (1792ch)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLayer('block6a')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    selectedLayer === 'block6a'
                      ? 'bg-[#EA580C] text-white shadow-2xs'
                      : 'bg-white border border-[#EFE4DC] text-[#6E5C5F]'
                  }`}
                >
                  block6a_expand
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLayer('cross_attention')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    selectedLayer === 'cross_attention'
                      ? 'bg-[#EA580C] text-white shadow-2xs'
                      : 'bg-white border border-[#EFE4DC] text-[#6E5C5F]'
                  }`}
                >
                  Cross-Attention
                </button>
              </div>
            </div>

            {/* VISUAL VIEWER: Raw vs Heatmap vs Attributed Lesions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Image with Grad-CAM overlay */}
              <div className="relative rounded-2xl overflow-hidden border border-[#EFE4DC] bg-black aspect-square max-w-[460px] mx-auto shadow-md">
                {/* Base retinal scan */}
                <img
                  src={selectedCase.rawImage}
                  alt={selectedCase.name}
                  className="w-full h-full object-cover"
                />

                {/* Simulated Grad-CAM Colormap Overlay with Dynamic Opacity */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                  style={{
                    opacity: camOpacity,
                    background:
                      selectedCase.grade === 'Grade 4'
                        ? 'radial-gradient(circle at 35% 45%, rgba(220,38,38,0.85) 0%, rgba(234,88,12,0.7) 25%, rgba(234,179,8,0.5) 45%, rgba(59,130,246,0.2) 65%, transparent 80%)'
                        : 'radial-gradient(circle at 60% 55%, rgba(220,38,38,0.85) 0%, rgba(234,88,12,0.7) 22%, rgba(234,179,8,0.5) 42%, rgba(59,130,246,0.2) 60%, transparent 80%)',
                    mixBlendMode: 'color-dodge',
                  }}
                />

                {/* Heatmap Legend Badge */}
                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20 text-[10px] text-white font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Max Activation: {selectedCase.camHotspotArea}</span>
                </div>

                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20 text-[10px] text-white font-mono">
                  α = {camOpacity.toFixed(2)}
                </div>
              </div>

              {/* Clinical findings and mathematical derivation */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#EA580C] font-bold block">
                    Diagnostic Ground Truth
                  </span>
                  <div className="text-sm font-serif font-bold text-[#2E2628]">
                    {selectedCase.gradeLabel} ({selectedCase.grade})
                  </div>
                  <div className="space-y-1 pt-1">
                    <span className="text-[#6E5C5F] font-medium block">Key Pathological Biomarkers:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#2E2628]">
                      {selectedCase.keyFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#2E2628] font-bold block">
                    Mathematical Formulation
                  </span>
                  <div className="p-2.5 rounded-lg bg-stone-900 text-stone-200 font-mono text-[11px] overflow-x-auto">
                    L^c_GradCAM = ReLU( ∑_k α_k^c · A^k )
                  </div>
                  <p className="text-[#6E5C5F] text-[11px] leading-relaxed">
                    Weights <code className="text-[#EA580C] font-mono">α_k^c</code> represent the global average pooled gradients of the DR class score with respect to feature maps <code className="text-[#EA580C] font-mono">A^k</code>. ReLU ensures only features positively influencing the predicted class are visualized.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[11px] text-[#C2410C] flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Deployment Guardrail:</strong> Grad-CAM highlights model focus areas and helps detect shortcut learning, but is not an automated segmentation mask. Clinicians confirm all findings on biomicroscopy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB B: SHAP ATTRIBUTIONS */}
      {activeSubTab === 'shap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#EFE4DC] pb-4">
              <h3 className="font-serif font-bold text-lg text-[#2E2628]">
                TreeSHAP Clinical Feature Attributions
              </h3>
              <p className="text-xs text-[#6E5C5F]">
                Quantifying the exact marginal log-odds impact of clinical tabular covariates (HbA1c, Duration, BP, Age) on late fusion prediction
              </p>
            </div>

            {/* Waterfall plot of feature contributions */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#2E2628] block">
                Individual Patient Marginal Contribution (Baseline Risk: 0.12 → Final Score: 0.88)
              </span>

              <div className="space-y-2">
                {SHAP_FEATURES.map((feat) => {
                  const isPositive = feat.impact > 0;
                  const barWidth = Math.min(Math.abs(feat.impact) * 220, 100);

                  return (
                    <div
                      key={feat.name}
                      className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-[200px]">
                        <span className="font-bold text-[#2E2628] block">{feat.name}</span>
                        <span className="text-[10px] text-[#6E5C5F]">
                          Value: <strong>{feat.value}</strong> (Cohort Baseline: {feat.baseline}) · p = {feat.pValue}
                        </span>
                      </div>

                      <div className="flex-1 max-w-[260px] flex items-center gap-2">
                        <div className="w-full bg-[#EFE4DC] h-3 rounded-full overflow-hidden flex items-center">
                          {isPositive ? (
                            <div
                              className="h-full bg-[#EA580C] rounded-full"
                              style={{ width: `${barWidth}%` }}
                            />
                          ) : (
                            <div
                              className="h-full bg-[#059669] rounded-full"
                              style={{ width: `${barWidth}%` }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isPositive ? 'text-[#EA580C]' : 'text-[#059669]'
                          }`}
                        >
                          {isPositive ? `+${feat.impact.toFixed(2)}` : feat.impact.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-[#8E7E81] block">log-odds</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC] text-xs text-[#6E5C5F] space-y-1">
              <span className="font-bold text-[#2E2628] block">Global Feature Importance (Mean |SHAP| Value)</span>
              <p>
                Across 4,250 validation cases, <strong>HbA1c level</strong> contributes 44.2% of tabular predictive weight, followed by <strong>Diabetes Duration</strong> (32.8%) and <strong>Systolic Blood Pressure</strong> (14.6%). This mirrors established epidemiological risk factors in the UK Prospective Diabetes Study (UKPDS).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB C: FAIRNESS & DEMOGRAPHIC PARITY AUDITS */}
      {activeSubTab === 'fairness' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#EFE4DC] pb-4">
              <h3 className="font-serif font-bold text-lg text-[#2E2628]">
                Subgroup Demographic Parity & Fairness Audits
              </h3>
              <p className="text-xs text-[#6E5C5F]">
                Continuous monitoring for disparate impact across biological sex, clinical setting, and camera hardware
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#EFE4DC] text-[11px] font-bold text-[#6E5C5F]">
                    <th className="pb-2">Subgroup Dimension</th>
                    <th className="pb-2">Cohort Size</th>
                    <th className="pb-2 text-right">AUC-ROC</th>
                    <th className="pb-2 text-right">Sensitivity</th>
                    <th className="pb-2 text-right">Specificity</th>
                    <th className="pb-2 text-right">Parity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB]">
                  <tr className="hover:bg-[#FAF8F6]/60">
                    <td className="py-2.5 font-bold text-[#2E2628]">Biological Sex: Female</td>
                    <td className="py-2.5 text-[#6E5C5F]">N = 2,070 (48.7%)</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#EA580C]">0.943</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">92.6%</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">95.1%</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Equitable (Δ &lt; 0.005)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F6]/60">
                    <td className="py-2.5 font-bold text-[#2E2628]">Biological Sex: Male</td>
                    <td className="py-2.5 text-[#6E5C5F]">N = 2,180 (51.3%)</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#EA580C]">0.941</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">92.2%</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">94.9%</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Equitable (Δ &lt; 0.005)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F6]/60">
                    <td className="py-2.5 font-bold text-[#2E2628]">Rural Outreach Camps</td>
                    <td className="py-2.5 text-[#6E5C5F]">N = 2,650 (62.4%)</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#EA580C]">0.939</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">91.8%</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">94.6%</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Equitable
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F6]/60">
                    <td className="py-2.5 font-bold text-[#2E2628]">Urban Tertiary Hospitals</td>
                    <td className="py-2.5 text-[#6E5C5F]">N = 1,600 (37.6%)</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#EA580C]">0.945</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">93.1%</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">95.4%</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Equitable
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F6]/60">
                    <td className="py-2.5 font-bold text-[#2E2628]">Age &lt; 50 Years</td>
                    <td className="py-2.5 text-[#6E5C5F]">N = 1,420 (33.4%)</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#EA580C]">0.944</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">92.8%</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">95.2%</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Equitable
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#FAF8F6]/60">
                    <td className="py-2.5 font-bold text-[#2E2628]">Age ≥ 50 Years</td>
                    <td className="py-2.5 text-[#6E5C5F]">N = 2,830 (66.6%)</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#EA580C]">0.940</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">92.1%</td>
                    <td className="py-2.5 text-right font-mono text-[#2E2628]">94.8%</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Equitable
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-xs text-[#6E5C5F] flex items-center justify-between">
              <span>Disparate Impact Ratio across all tested subgroups: <strong>0.982</strong> (threshold &gt; 0.80)</span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                AUDIT PASSED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
