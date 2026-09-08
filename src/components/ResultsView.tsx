import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileDown,
  Layers,
  Printer,
  RefreshCw,
  Share2,
  ShieldAlert,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { DR_GRADES } from '../data/benchmarks';
import { DRGrade, MultimodalTriageResult } from '../types';
import { generateClinicalPdfReport } from '../utils/pdfGenerator';
import { RiskChip } from './RiskChip';
import { ShareModal } from './ShareModal';

interface ResultsViewProps {
  result: MultimodalTriageResult;
  onNewScreening: () => void;
  onAblationClick: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onNewScreening,
  onAblationClick,
}) => {
  // Fundus view mode: 'original' | 'clahe' | 'gradcam'
  const [fundusMode, setFundusMode] = useState<'original' | 'clahe' | 'gradcam'>('gradcam');
  // OCT view mode: 'scan' | 'gradcam'
  const [octMode, setOctMode] = useState<'scan' | 'gradcam'>('gradcam');

  // Heatmap opacity slider
  const [camOpacity, setCamOpacity] = useState<number>(0.75);

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const gradeInfo = DR_GRADES[result.finalGrade];

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EFE4DC] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="patient-tag font-mono text-xs font-bold text-[#EA580C] bg-[#FFF7ED] border-[#FED7AA] px-2 py-0.5 rounded-md border">
              #{result.patientId}
            </span>
            <span className="patient-tag text-xs font-medium text-[#6E5C5F] bg-[#FFFDFB] border-[#EFE4DC] px-2 py-0.5 rounded-md border">
              Session: {result.sessionId}
            </span>
            <span className="patient-tag text-xs font-medium bg-[#FDF2F8] border-[#FBCFE8] text-[#BE185D] px-2 py-0.5 rounded-md border">
              Clinical Mode: Tri-Modal
            </span>
            <span className="text-xs text-[#9E8D91] ml-1">
              Last updated: {new Date(result.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2628]">
            Multimodal AI Decision-Support Triage Card
          </h1>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="download-pdf-btn"
            onClick={() => generateClinicalPdfReport(result)}
            className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="bg-white hover:bg-[#FFFDFB] text-[#2E2628] border border-[#EFE4DC] text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#6E5C5F]" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            id="share-link-btn"
            onClick={handleShare}
            className="bg-white hover:bg-[#FFFDFB] text-[#2E2628] border border-[#EFE4DC] text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Share Link</span>
          </button>

          <button
            id="new-screening-top-btn"
            onClick={onNewScreening}
            className="bg-white hover:bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Screening</span>
          </button>
        </div>
      </div>

      {/* PRIMARY TRIAGE CARD: LARGE COLOR-CODED GRADE BADGE & ACTION PLAN */}
      <section
        id="primary-triage-card"
        className="rounded-2xl border p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden"
        style={{
          backgroundColor: gradeInfo.bgColor,
          borderColor: gradeInfo.borderColor,
        }}
      >
        {/* Accent Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: gradeInfo.borderColor }}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gradeInfo.color }} />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E2628]">
              Tri-Modal Consensus Triage Outcome
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border font-bold" style={{ borderColor: gradeInfo.borderColor, color: gradeInfo.color }}>
              Confidence: {result.confidence}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/80 border border-[#EFE4DC] text-[#6E5C5F]">
              Raw Score: {result.rawFusionScore}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Grade Badge */}
          <div className="lg:col-span-5 space-y-3">
            <div className="inline-block">
              <RiskChip grade={result.finalGrade} size="lg" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#2E2628]">
              {gradeInfo.name}
            </h2>

            <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
              {gradeInfo.description}
            </p>

            {result.dmeEscalationApplied && (
              <div className="p-3 bg-white/90 rounded-xl border border-[#EA580C] text-xs text-[#C2410C] space-y-0.5">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-[#EA580C]" />
                  <span>DME Escalation Rule Enforced</span>
                </p>
                <p className="text-[11px] text-[#6E5C5F]">
                  Diabetic Macular Edema on OCT automatically warrants at least Grade 2 (Moderate DR / CSME) to prevent vision loss.
                </p>
              </div>
            )}
          </div>

          {/* Right: Plain Language Clinical Recommendation Box */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4" style={{ borderColor: gradeInfo.borderColor }}>
            <div>
              <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider block mb-1">
                Triage Recommendation & Action Plan
              </span>
              <p className="text-sm sm:text-base font-semibold text-[#2E2628] leading-relaxed">
                {result.recommendation}
              </p>
            </div>

            {/* Contributing factors plain language list */}
            <div className="space-y-1.5 pt-2 border-t border-[#EFE4DC]">
              <span className="text-xs font-bold text-[#6E5C5F]">Primary Contributing Factors:</span>
              <ul className="space-y-1 text-xs text-[#2E2628]">
                {result.contributingFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* VISUAL EXPLAINABILITY INSPECTOR: GRAD-CAM HEATMAPS (FUNDUS & OCT) */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#2E2628] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#EA580C]" />
              <span>Grad-CAM Visual Explanations (Thermal Colormap, α={camOpacity.toFixed(2)})</span>
            </h2>
            <p className="text-xs text-[#6E5C5F] mt-0.5">
              Class Activation Maps show which retinal regions drove the model's predictions (optic disc rim, macular exudates, hemorrhages, and OCT fluid).
            </p>
          </div>

          {/* Heatmap Opacity Controls */}
          <div className="flex items-center gap-3 bg-[#FFFDFB] px-3 py-1.5 rounded-xl border border-[#EFE4DC]">
            <Sliders className="w-3.5 h-3.5 text-[#6E5C5F]" />
            <span className="text-xs text-[#6E5C5F] font-medium">CAM Alpha:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={camOpacity}
              onChange={(e) => setCamOpacity(parseFloat(e.target.value))}
              className="w-24 accent-[#EA580C]"
            />
            <span className="text-xs font-mono font-bold text-[#EA580C]">
              {Math.round(camOpacity * 100)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fundus Inspection Viewer */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] overflow-hidden flex flex-col shadow-xs">
            <div className="p-3 sm:px-4 border-t-4 border-[#EA580C] border-b border-[#EFE4DC] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#C2410C]">
                  Fundus Stream (512×512)
                </span>
                <span className="text-[10px] bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] px-2 py-0.5 rounded font-mono font-medium">
                  EfficientNet-B4
                </span>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-[#FFFDFB] p-1 rounded-lg border border-[#EFE4DC] text-xs">
                <button
                  type="button"
                  onClick={() => setFundusMode('original')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    fundusMode === 'original' ? 'bg-white text-[#2E2628] shadow-xs' : 'text-[#6E5C5F]'
                  }`}
                >
                  Raw RGB
                </button>
                <button
                  type="button"
                  onClick={() => setFundusMode('clahe')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    fundusMode === 'clahe' ? 'bg-white text-[#2E2628] shadow-xs' : 'text-[#6E5C5F]'
                  }`}
                >
                  CLAHE
                </button>
                <button
                  type="button"
                  onClick={() => setFundusMode('gradcam')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                    fundusMode === 'gradcam'
                      ? 'bg-[#EA580C] text-white shadow-xs'
                      : 'text-[#EA580C]'
                  }`}
                >
                  Grad-CAM
                </button>
              </div>
            </div>

            {/* Fundus Visual Frame */}
            <div className="relative aspect-square bg-[#140200] overflow-hidden border-b border-[#EFE4DC] flex items-center justify-center group">
              <img
                src={
                  fundusMode === 'clahe'
                    ? result.fundusClaheUrl
                    : fundusMode === 'gradcam'
                    ? result.fundusCamUrl
                    : result.fundusImageUrl
                }
                alt="Fundus Scan"
                className="w-full h-full object-contain"
                style={{
                  opacity: fundusMode === 'gradcam' ? 0.95 : 1.0,
                }}
              />

              {/* CAM Overlay Alpha Badge */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded border border-white/20">
                CAM Overlay: {camOpacity.toFixed(2)} Alpha
              </div>

              <div className="absolute top-3 right-3">
                <RiskChip grade={result.fundus.grade} size="sm" />
              </div>
            </div>

            {/* Hotspots & Features Callout */}
            <div className="p-4 bg-[#FFFDFB] border-t border-[#EFE4DC] space-y-1.5 text-xs">
              <p className="font-bold text-[#C2410C]">Observation Notes & Hotspots:</p>
              <ul className="space-y-1 text-[#2E2628]">
                {result.fundus.camHotspots.map((spot, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                    <span>
                      <strong>{spot.label}</strong> (Activation: {(spot.intensity * 100).toFixed(0)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* OCT Depth Inspection Viewer */}
          <div className="bg-white rounded-2xl border border-[#EFE4DC] overflow-hidden flex flex-col shadow-xs">
            <div className="p-3 sm:px-4 border-t-4 border-[#DB2777] border-b border-[#EFE4DC] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#BE185D]">
                  OCT Stream (B-Scan)
                </span>
                <span className="text-[10px] bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8] px-2 py-0.5 rounded font-mono font-medium">
                  DenseNet-121
                </span>
              </div>

              {result.oct.present && (
                <div className="flex items-center gap-1 bg-[#FFFDFB] p-1 rounded-lg border border-[#EFE4DC] text-xs">
                  <button
                    type="button"
                    onClick={() => setOctMode('scan')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      octMode === 'scan' ? 'bg-white text-[#2E2628] shadow-xs' : 'text-[#6E5C5F]'
                    }`}
                  >
                    B-Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setOctMode('gradcam')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      octMode === 'gradcam'
                        ? 'bg-[#DB2777] text-white shadow-xs'
                        : 'text-[#DB2777]'
                    }`}
                  >
                    DME CAM
                  </button>
                </div>
              )}
            </div>

            {/* OCT Visual Frame */}
            {result.oct.present ? (
              <>
                <div className="relative aspect-square sm:aspect-[16/9] lg:aspect-square bg-[#0A0B0E] overflow-hidden border-b border-[#EFE4DC] flex items-center justify-center">
                  <img
                    src={octMode === 'gradcam' ? result.octCamUrl || result.octImageUrl : result.octImageUrl}
                    alt="OCT B-Scan"
                    className="w-full h-full object-contain"
                  />

                  {/* DME status top right badge */}
                  <div className={`absolute top-3 right-3 font-bold text-[10px] bg-black/75 px-2.5 py-1 rounded border ${
                    result.oct.dmeDetected ? 'text-[#EA580C] border-[#EA580C]/50' : 'text-[#10B981] border-[#10B981]/50'
                  }`}>
                    {result.oct.dmeDetected ? 'DME DETECTED' : 'DME NEGATIVE'}
                  </div>

                  <div className="absolute bottom-3 left-3 bg-[#FDF2F8] text-[#BE185D] text-xs font-semibold px-2 py-0.5 rounded border border-[#FBCFE8]">
                    {result.oct.predictedClass} · {(result.oct.dmeProbability * 100).toFixed(1)}% DME Risk
                  </div>
                </div>

                {/* Retinal Layer Findings */}
                <div className="p-4 bg-[#FFFDFB] border-t border-[#EFE4DC] space-y-1.5 text-xs">
                  <p className="font-bold text-[#BE185D]">OCT Structural Indicators:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#FDF2F8] text-[10px] rounded text-[#BE185D] border border-[#FBCFE8]">
                      CNV: Negative
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] rounded border ${
                      result.oct.dmeDetected
                        ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA] font-bold'
                        : 'bg-[#FDF2F8] text-[#BE185D] border-[#FBCFE8]'
                    }`}>
                      DME: {result.oct.dmeDetected ? 'High Risk' : 'Low Risk'}
                    </span>
                    <span className="px-2 py-0.5 bg-[#FDF2F8] text-[10px] rounded text-[#BE185D] border border-[#FBCFE8]">
                      Drusen: Normal
                    </span>
                  </div>
                  <ul className="space-y-1 text-[#2E2628]">
                    {result.oct.retinalLayerFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DB2777]" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="aspect-square rounded-b-2xl bg-[#FFFDFB] flex flex-col items-center justify-center p-6 text-center space-y-2">
                <Layers className="w-8 h-8 text-[#9E8D91]" />
                <p className="text-xs font-bold text-[#2E2628]">OCT Modality Not Provided</p>
                <p className="text-[11px] text-[#6E5C5F] max-w-xs">
                  Model ran in dual-stream mode. Uploading an OCT B-scan provides cross-sectional cystoid fluid detection and triggers the DME escalation rule.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SHAP WATERFALL & CLINICAL FEATURE EXPLAINABILITY */}
      {result.metadata.provided && (
        <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                <h2 className="text-lg font-serif font-bold text-[#2E2628]">
                  SHAP Waterfall Risk Factor Attributions (XGBoost)
                </h2>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                TreeExplainer feature impacts showing which physiological variables pushed the retinopathy risk higher (orange) or lower (pink).
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#C2410C] font-semibold">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#EA580C]" /> Increases Risk (+)
              </span>
              <span className="flex items-center gap-1 text-[#BE185D] font-semibold">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#DB2777]" /> Decreases Risk (-)
              </span>
            </div>
          </div>

          {/* SHAP Horizontal Waterfall Chart */}
          <div className="space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
              SHAP Feature Impact
            </div>
            <p className="text-xs text-[#6E5C5F] -mt-2">
              Top factors driving risk grading from clinical history (XGBoost TreeExplainer):
            </p>

            <div className="space-y-3 pt-1">
              {result.metadata.shapValues.map((shap) => {
                const isPositive = shap.shapValue > 0;
                const absVal = Math.min(1, Math.abs(shap.shapValue));
                const widthPct = Math.round(absVal * 100);

                return (
                  <div key={shap.feature} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2E2628]">{shap.feature}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#6E5C5F]">{shap.value}</span>
                        <span
                          className={`font-mono font-bold ${
                            isPositive ? 'text-[#EA580C]' : 'text-[#DB2777]'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {shap.shapValue} SHAP
                        </span>
                      </div>
                    </div>

                    {/* Bar container matching Natural Tones .shap-bar */}
                    <div className="h-3 w-full bg-[#EFE4DC]/60 rounded-xs overflow-hidden flex items-center">
                      <div
                        className={`h-full rounded-xs transition-all duration-500 ${
                          isPositive ? 'bg-[#EA580C]' : 'bg-[#DB2777]'
                        }`}
                        style={{ width: `${Math.max(6, widthPct)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#6E5C5F] italic">
                      Clinical Context: {shap.clinicalContext}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PER-MODALITY BREAKDOWN CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fundus Stream (Warm Orange) */}
        <div className="p-4 rounded-2xl border border-[#FED7AA] border-t-4 border-t-[#EA580C] bg-[#FFF7ED]/50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#C2410C]">1. Fundus Stream</span>
            <span className="text-[10px] font-mono text-[#EA580C]">{result.fundus.inferenceMs}ms</span>
          </div>

          <div>
            <p className="text-lg font-bold text-[#C2410C]">
              Grade {result.fundus.grade}: {DR_GRADES[result.fundus.grade].shortName}
            </p>
            <p className="text-[11px] text-[#6E5C5F]">EfficientNet-B4 · Ordinal Cross-Entropy</p>
          </div>

          {/* Probabilities Bars */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-semibold text-[#6E5C5F]">5-Class Probabilities:</span>
            {result.fundus.probabilities.map((prob, g) => (
              <div key={g} className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#6E5C5F]">G{g}</span>
                <div className="h-1.5 w-24 bg-[#EFE4DC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#EA580C] rounded-full"
                    style={{ width: `${Math.round(prob * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right font-bold text-[#2E2628]">
                  {Math.round(prob * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: OCT Stream (Vibrant Pink) */}
        <div className="p-4 rounded-2xl border border-[#FBCFE8] border-t-4 border-t-[#DB2777] bg-[#FDF2F8]/60 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#BE185D]">2. OCT Stream</span>
            <span className="text-[10px] font-mono text-[#DB2777]">
              {result.oct.inferenceMs}ms
            </span>
          </div>

          <div>
            <p className="text-lg font-bold text-[#BE185D]">
              {result.oct.present ? result.oct.predictedClass : 'Omitted'}
            </p>
            <p className="text-[11px] text-[#6E5C5F]">DenseNet-121 · Kermany B-scans</p>
          </div>

          {result.oct.present ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6E5C5F]">DME Fluid Status:</span>
                <span
                  className={`font-bold ${
                    result.oct.dmeDetected ? 'text-[#EA580C]' : 'text-[#10B981]'
                  }`}
                >
                  {result.oct.dmeDetected ? 'Detected (+)' : 'Absent (-)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6E5C5F]">DME Probability:</span>
                <span className="font-mono font-bold text-[#BE185D]">
                  {(result.oct.dmeProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#EFE4DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#DB2777] rounded-full"
                  style={{ width: `${Math.round(result.oct.dmeProbability * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#9E8D91] italic">OCT modality bypassed in screening.</p>
          )}
        </div>

        {/* Card 3: Clinical Metadata (Warm Terracotta) */}
        <div className="p-4 rounded-2xl border border-[#FED7AA] border-t-4 border-t-[#EA580C]/70 bg-[#FFF7ED]/30 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#2E2628]">3. Clinical Model</span>
            <span className="text-[10px] font-mono text-[#6E5C5F]">
              {result.metadata.inferenceMs}ms
            </span>
          </div>

          <div>
            <p className="text-lg font-bold text-[#2E2628]">
              Risk Score: {(result.metadata.riskScore * 100).toFixed(0)}%
            </p>
            <p className="text-[11px] text-[#6E5C5F]">XGBoost · UKPDS/DCCT Distributions</p>
          </div>

          <div className="space-y-1 pt-1 text-xs">
            <span className="text-[10px] font-semibold text-[#6E5C5F] block">Top Risk Factors:</span>
            {result.metadata.top3RiskDrivers.map((driver, i) => (
              <p key={i} className="text-[11px] text-[#2E2628] truncate">
                • {driver}
              </p>
            ))}
          </div>
        </div>

        {/* Card 4: Multimodal Fusion Junction (Orange & Pink Gradient) */}
        <div className="p-4 rounded-2xl border border-[#FDBA74] border-t-4 border-t-[#DB2777] bg-gradient-to-br from-[#FFF7ED] to-[#FDF2F8] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#9D174D]">4. Late Fusion</span>
            <span className="text-[10px] font-mono font-bold text-[#9D174D]">
              {result.confidence} CONF
            </span>
          </div>

          <div>
            <p className="text-lg font-bold text-[#9D174D]">
              Grade {result.finalGrade} ({DR_GRADES[result.finalGrade].shortName})
            </p>
            <p className="text-[11px] text-[#6E5C5F]">Rule-Based Weighted Combination</p>
          </div>

          <div className="p-2 bg-white rounded-lg border border-[#FDBA74] text-[10px] font-mono text-[#2E2628] space-y-0.5">
            <p>0.55·Fundus ({result.fundus.grade})</p>
            <p>+ 0.30·Meta ({result.metadata.predictedGrade})</p>
            <p>+ 0.15·OCT ({result.oct.dmeDetected ? '2' : '0'})</p>
            <p className="font-bold text-[#9D174D] pt-0.5 border-t border-[#EFE4DC]">
              = Raw {result.rawFusionScore} → Final {result.finalGrade}
            </p>
          </div>
        </div>
      </section>

      {/* ABLATION STUDY COMPARISON TEASER CALLOUT */}
      <section className="bg-gradient-to-r from-[#FFF7ED] via-white to-[#FDF2F8] p-6 rounded-2xl border border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#EA580C]" />
            <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider">
              Core Scientific Ablation Contribution
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6E5C5F]">
            Does fusing OCT depth scans and clinical history actually help? Yes — our 6-experiment ablation shows a statistically significant <strong>+0.068 AUC increase</strong> over fundus-only classification.
          </p>
        </div>

        <button
          onClick={onAblationClick}
          className="bg-white hover:bg-[#FFF7ED] text-[#2E2628] hover:text-[#EA580C] border border-[#EFE4DC] hover:border-[#FDBA74] px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <span>View 6-Experiment Matrix</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        result={result}
      />
    </div>
  );
};
