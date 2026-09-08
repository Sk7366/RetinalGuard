import React, { useState } from 'react';
import {
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ABLATION_STUDY, BENCHMARK_COMPARISONS } from '../data/benchmarks';

export const AblationView: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'auc' | 'qwk' | 'sensitivitySeverePdr' | 'latencyMs'>(
    'auc'
  );

  const baselineAuc = ABLATION_STUDY[0].auc;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
              <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Scientific Validation · Ablation Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Multimodal Ablation Study (6 Experimental Conditions)
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-3xl leading-relaxed">
              Evaluating the quantitative contribution of each clinical modality stream. Adding OCT depth scans and tabular metadata produces a statistically significant{' '}
              <strong className="text-[#EA580C]">+0.068 AUC increase (p &lt; 0.001)</strong> over baseline fundus-only classification.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-[#FFFDFB] p-3 rounded-xl border border-[#EFE4DC]">
            <div>
              <span className="text-[#9E8D91] block text-[10px]">Statistical Test:</span>
              <span className="font-bold text-[#EA580C]">DeLong p &lt; 0.001</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE COMPARISON METRIC TOGGLE & BARS */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#2E2628] flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#EA580C]" />
              <span>Modality Performance Progression</span>
            </h2>
            <p className="text-xs text-[#6E5C5F]">
              Select a benchmark metric to inspect the ablation hierarchy across all 6 configurations:
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 bg-[#FFFDFB] p-1 rounded-xl border border-[#EFE4DC] text-xs">
            <button
              onClick={() => setSelectedMetric('auc')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedMetric === 'auc'
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              AUC-ROC
            </button>
            <button
              onClick={() => setSelectedMetric('qwk')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedMetric === 'qwk'
                  ? 'bg-[#DB2777] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              QWK (Kappa)
            </button>
            <button
              onClick={() => setSelectedMetric('sensitivitySeverePdr')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedMetric === 'sensitivitySeverePdr'
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              Severe DR Sensitivity
            </button>
            <button
              onClick={() => setSelectedMetric('latencyMs')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedMetric === 'latencyMs'
                  ? 'bg-[#BE185D] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:text-[#2E2628]'
              }`}
            >
              Latency (ms)
            </button>
          </div>
        </div>

        {/* Visual Bar Progression */}
        <div className="space-y-4">
          {ABLATION_STUDY.map((exp, idx) => {
            const isFull = idx === 5;
            const isFundusBaseline = idx === 0;
            const val = exp[selectedMetric];
            const deltaVsBaseline = Number((exp.auc - baselineAuc).toFixed(3));
            const pct = selectedMetric === 'latencyMs' ? Math.min(100, Math.round((val / 300) * 100)) : Math.round(val * 100);

            return (
              <div
                key={exp.id}
                className={`p-4 rounded-xl border transition-all ${
                  isFull
                    ? 'bg-gradient-to-r from-[#FFF7ED] to-[#FDF2F8] border-[#FDBA74] shadow-xs'
                    : 'bg-white border-[#EFE4DC] hover:bg-[#FFFDFB]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#9E8D91]">0{idx + 1}</span>
                    <strong className="text-[#2E2628] text-sm">{exp.name}</strong>
                    {isFull && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white font-bold text-[10px]">
                        RetinaGuard Tri-Modal
                      </span>
                    )}
                    {isFundusBaseline && (
                      <span className="px-2 py-0.5 rounded-full bg-[#EFE4DC] text-[#6E5C5F] font-medium text-[10px]">
                        Baseline Reference
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#6E5C5F]">
                      {selectedMetric.toUpperCase()}: <strong>{selectedMetric === 'latencyMs' ? `${val}ms` : val.toFixed(3)}</strong>
                    </span>
                    <span
                      className={`font-bold ${
                        deltaVsBaseline > 0
                          ? 'text-[#EA580C]'
                          : deltaVsBaseline < 0
                          ? 'text-[#DC2626]'
                          : 'text-[#9E8D91]'
                      }`}
                    >
                      {deltaVsBaseline > 0 ? '+' : ''}
                      {deltaVsBaseline === 0 ? '0.000' : deltaVsBaseline.toFixed(3)}{' '}
                      Δ AUC
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="h-3 w-full bg-[#EFE4DC]/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFull
                        ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777]'
                        : isFundusBaseline
                        ? 'bg-[#FED7AA]'
                        : 'bg-[#FDBA74]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-[11px] text-[#6E5C5F] mt-2 italic">
                  Clinical Observation: {exp.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FULL ABLATION DATA TABLE */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#EFE4DC] pb-4">
          <h2 className="text-xl font-serif font-bold text-[#2E2628]">Complete 6-Experiment Ablation Matrix</h2>
          <p className="text-xs text-[#6E5C5F] mt-0.5">
            Cross-validated on 3,662 APTOS 2019 fundus images, 84,495 Kermany OCT scans, and clinical metadata distributions:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EFE4DC] bg-[#FFFDFB] text-[#6E5C5F] font-semibold">
                <th className="py-3 px-4">Experiment</th>
                <th className="py-3 px-4">Modalities Included</th>
                <th className="py-3 px-3 text-center">AUC-ROC</th>
                <th className="py-3 px-3 text-center">QWK (κ)</th>
                <th className="py-3 px-3 text-center">Sensitivity (PDR)</th>
                <th className="py-3 px-3 text-center">Latency</th>
                <th className="py-3 px-3 text-center">Δ AUC vs Fundus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DC]">
              {ABLATION_STUDY.map((exp, idx) => {
                const isWinner = idx === 5;
                const deltaVsBaseline = Number((exp.auc - baselineAuc).toFixed(3));
                return (
                  <tr
                    key={exp.id}
                    className={`transition-colors ${
                      isWinner ? 'bg-[#FFF7ED] font-semibold' : 'hover:bg-[#FFFDFB]'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-[#2E2628]">
                      <span className="font-bold">{exp.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6E5C5F]">
                      {exp.modalities}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-[#EA580C]">
                      {exp.auc.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-[#DB2777]">
                      {exp.qwk.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      {(exp.sensitivitySeverePdr * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      {exp.latencyMs} ms
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono">
                      <span
                        className={
                          deltaVsBaseline > 0
                            ? 'text-[#EA580C]'
                            : deltaVsBaseline < 0
                            ? 'text-[#DC2626]'
                            : 'text-[#9E8D91]'
                        }
                      >
                        {deltaVsBaseline > 0 ? '+' : ''}
                        {deltaVsBaseline === 0 ? '0.000' : deltaVsBaseline.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* WHY TRI-MODAL FUSION OUTPERFORMS: CLINICAL DEEP DIVE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#FED7AA] space-y-3">
          <div className="flex items-center gap-2 text-[#C2410C] font-bold text-sm">
            <Sparkles className="w-4 h-4 text-[#EA580C]" />
            <span>Why Fundus + OCT Slashes False Negatives</span>
          </div>
          <p className="text-xs text-[#6E5C5F] leading-relaxed">
            In standard 2D fundus photography, early Diabetic Macular Edema (DME) often appears entirely normal because
            intraretinal serous fluid is translucent and has not yet created yellowish lipid exudates. Adding cross-sectional OCT
            B-scans detects subretinal fluid pockets immediately, raising sensitivity from 83.2% to 94.6%.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#FBCFE8] space-y-3">
          <div className="flex items-center gap-2 text-[#BE185D] font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-[#DB2777]" />
            <span>Why Clinical Metadata Breaks Grading Ties</span>
          </div>
          <p className="text-xs text-[#6E5C5F] leading-relaxed">
            Between Mild (Grade 1) and Moderate (Grade 2) NPDR, visual lesion counts can be ambiguous due to poor pupillary dilation
            or media opacities (cataracts). An elevated HbA1c (&gt;9%) combined with &gt;12 years of diabetes duration provides
            Bayesian prior risk that prevents dangerous under-grading.
          </p>
        </div>
      </section>
    </div>
  );
};
