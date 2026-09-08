import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileDown,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Printer,
  RefreshCw,
  Share2,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';
import { DR_GRADES } from '../data/benchmarks';
import { screeningApi } from '../services/screeningApi';
import { DRGrade, MultimodalTriageResult } from '../types';
import { generateClinicalPdfReport } from '../utils/pdfGenerator';
import { ClinicalAssistantModal } from './ClinicalAssistantModal';
import { RiskChip } from './RiskChip';
import { ShareModal } from './ShareModal';

interface ResultsViewProps {
  result: MultimodalTriageResult;
  onNewScreening: () => void;
  onAblationClick: () => void;
}

type ViewPerspective = 'clinical' | 'simple' | 'technical';

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onNewScreening,
  onAblationClick,
}) => {
  // Active view perspective tab: "Clinical view" | "Simple explanation" | "Technical details"
  const [activeTab, setActiveTab] = useState<ViewPerspective>('clinical');

  // Fundus view mode: 'original' | 'clahe' | 'gradcam'
  const [fundusMode, setFundusMode] = useState<'original' | 'clahe' | 'gradcam'>('gradcam');
  // OCT view mode: 'scan' | 'gradcam'
  const [octMode, setOctMode] = useState<'scan' | 'gradcam'>('gradcam');

  // Heatmap opacity slider
  const [camOpacity, setCamOpacity] = useState<number>(0.75);

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  // Clinical AI Assistant modal state
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  // Referral created status
  const [referralToken, setReferralToken] = useState<string | null>(null);
  const [referralLoading, setReferralLoading] = useState<boolean>(false);

  // Safe Grade & Grade Info
  const isUngradable =
    result.finalGrade === -1 ||
    (result as any).isUngradable ||
    (result.fundus as any)?.qualityStatus === 'UNGRADABLE' ||
    (result as any).qualityStatus === 'UNGRADABLE';

  const safeGrade: DRGrade = result.finalGrade >= 0 && result.finalGrade <= 4 ? result.finalGrade : 0;
  const gradeInfo = DR_GRADES[safeGrade];

  // Multimodal Agreement Calculation
  const fundusGrade = result.fundus.grade;
  const metaPredictedGrade = result.metadata.provided ? result.metadata.predictedGrade : fundusGrade;
  const octDmePresent = result.oct.present ? result.oct.dmeDetected : false;

  // Disagreement trigger: Grade difference >= 2 OR conflict with severe DME on Grade 0 fundus
  const gradeDiff = Math.abs(fundusGrade - metaPredictedGrade);
  const isDmeConflict = fundusGrade === 0 && octDmePresent;
  const hasModalityDisagreement = gradeDiff >= 2 || isDmeConflict;

  const agreementStatus: 'High' | 'Moderate' | 'Low' = hasModalityDisagreement
    ? 'Low'
    : gradeDiff === 1 || (result.oct.present && result.dmeEscalationApplied)
    ? 'Moderate'
    : 'High';

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateReferral = async () => {
    setReferralLoading(true);
    const ref = await screeningApi.createReferral(
      result,
      'Victoria Hospital Retina Clinic (Simulated)',
      'Automated triage referral token'
    );
    setReferralToken(ref.id);
    setReferralLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
      {/* 1. MANDATORY CLINICAL & NON-DIAGNOSTIC SAFETY BANNER */}
      <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <Shield className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#C2410C] uppercase tracking-wider text-[11px]">
              <span>AI-Assisted Screening Assessment</span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] border border-[#FED7AA] font-mono text-[#9A3412]">
                DECISION-SUPPORT ONLY
              </span>
            </div>
            <p className="text-[#9A3412] leading-relaxed font-medium">
              This screening tool provides an <strong>AI-assisted screening assessment</strong> to help prioritize ophthalmic review. It does not provide a definitive medical diagnosis. <strong>Clinical confirmation is required.</strong> <strong>Further specialist evaluation may be appropriate.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. UNGRADABLE WARNING (IF APPLICABLE) */}
      {isUngradable && (
        <div className="bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5 text-[#B91C1C] font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            <span>Image Quality Assessment: Ungradable</span>
          </div>
          <p className="text-xs text-[#991B1B] font-bold">
            Retake image or seek appropriate clinical evaluation.
          </p>
          <p className="text-xs text-[#7F1D1D] leading-relaxed">
            Severe glare, media opacity, or poor focus prevented reliable automated feature extraction. Automated grading has been suspended to protect patient safety.
          </p>
          <div className="pt-2">
            <button
              onClick={onNewScreening}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Fundus Photograph</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MULTIMODAL DISAGREEMENT CALLOUT (IF APPLICABLE) */}
      {hasModalityDisagreement && (
        <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-[#92400E] font-bold text-xs uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-[#D97706]" />
            <span>Modality Concordance Flag</span>
          </div>
          <p className="text-sm font-bold text-[#B45309]">
            Low agreement — human review recommended.
          </p>
          <p className="text-xs text-[#78350F] leading-relaxed">
            The fundus photograph grading (Grade {fundusGrade}) diverged noticeably from the clinical metadata prediction (Grade {metaPredictedGrade}) or cross-sectional OCT indicators. A trained human clinician must verify these findings prior to any clinical intervention.
          </p>
        </div>
      )}

      {/* 4. TOP ACTION BAR & PATIENT SESSION HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-[#EA580C] bg-[#FFF7ED] border border-[#FED7AA] px-2.5 py-0.5 rounded-md">
              #{result.patientId}
            </span>
            <span className="text-xs font-medium text-[#6E5C5F] bg-[#FAF8F6] border border-[#EFE4DC] px-2 py-0.5 rounded-md">
              Session: {result.sessionId}
            </span>
            <span className="text-xs font-medium bg-[#FDF2F8] border border-[#FBCFE8] text-[#BE185D] px-2 py-0.5 rounded-md">
              {result.oct.present ? 'Tri-Modal (Fundus + OCT + Metadata)' : 'Dual-Stream (Fundus + Metadata)'}
            </span>
            <span className="text-xs text-[#9C8E91] ml-1">
              {new Date(result.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2628]">
            AI-Assisted Screening Assessment
          </h1>
          <p className="text-xs text-[#6E5C5F] mt-0.5">
            Decision-support review for diabetic retinopathy risk stratification and care coordination.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="download-pdf-btn"
            onClick={() => generateClinicalPdfReport(result)}
            className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="bg-white hover:bg-[#FAF8F6] text-[#2E2628] border border-[#EFE4DC] text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#6E5C5F]" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={() => setIsAssistantOpen(true)}
            className="bg-white hover:bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Ask Assistant</span>
          </button>

          <button
            id="share-link-btn"
            onClick={handleShare}
            className="bg-white hover:bg-[#FAF8F6] text-[#2E2628] border border-[#EFE4DC] text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Share</span>
          </button>

          <button
            id="new-screening-top-btn"
            onClick={onNewScreening}
            className="bg-[#FAF8F6] hover:bg-[#F5EBE1] text-[#6E5C5F] border border-[#EFE4DC] text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* 5. VIEW PERSPECTIVE SWITCHER TABS */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-2 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'clinical'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'text-[#6E5C5F] hover:bg-[#FAF8F6] hover:text-[#2E2628]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical view</span>
          </button>

          <button
            onClick={() => setActiveTab('simple')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'simple'
                ? 'bg-[#EA580C] text-white shadow-xs'
                : 'text-[#6E5C5F] hover:bg-[#FAF8F6] hover:text-[#2E2628]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Simple explanation</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'technical'
                ? 'bg-[#DB2777] text-white shadow-xs'
                : 'text-[#6E5C5F] hover:bg-[#FAF8F6] hover:text-[#2E2628]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Technical details</span>
          </button>
        </div>
      </div>

      {/* 6. PRIMARY ASSESSMENT CARD (GRADE & KEY ATTRIBUTION) */}
      <section
        id="primary-triage-card"
        className="rounded-2xl border p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden"
        style={{
          backgroundColor: gradeInfo.bgColor,
          borderColor: gradeInfo.borderColor,
        }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
          style={{ borderColor: gradeInfo.borderColor }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gradeInfo.color }} />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E2628]">
              Consensus Triage Classification
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border font-bold"
              style={{ borderColor: gradeInfo.borderColor, color: gradeInfo.color }}
            >
              Consensus: {result.confidence}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/80 border border-[#EFE4DC] text-[#6E5C5F]">
              Raw Fusion: {result.rawFusionScore}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Grade Badge */}
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
                  Diabetic Macular Edema on OCT warrants at least Grade 2 (Moderate DR / CSME) to guard against sight-threatening progression.
                </p>
              </div>
            )}
          </div>

          {/* Action Recommendation Box */}
          <div
            className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4"
            style={{ borderColor: gradeInfo.borderColor }}
          >
            <div>
              <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider block mb-1">
                Screening Recommendation & Follow-up
              </span>
              <p className="text-sm sm:text-base font-semibold text-[#2E2628] leading-relaxed">
                {result.recommendation}
              </p>
              <p className="text-[11px] text-[#6E5C5F] mt-1 italic">
                Further specialist evaluation may be appropriate. Clinical confirmation is required.
              </p>
            </div>

            {/* Contributing factors plain language list */}
            <div className="space-y-1.5 pt-2 border-t border-[#EFE4DC]">
              <span className="text-xs font-bold text-[#6E5C5F]">Primary Observation Drivers:</span>
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

      {/* 7. "WHY WAS THIS SCREENING FLAGGED?" SECTION */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#EFE4DC] pb-3">
          <HelpCircle className="w-5 h-5 text-[#EA580C]" />
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#2E2628]">
              Why was this screening flagged?
            </h3>
            <p className="text-xs text-[#6E5C5F]">
              Specific optical biomarkers and clinical indicators identified during multimodal assessment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Fundus Findings */}
          <div className="bg-[#FAF8F6] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
            <div className="font-bold text-[#C2410C] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Eye className="w-4 h-4 text-[#EA580C]" />
              <span>Fundus Image Features</span>
            </div>
            <p className="text-[#2E2628] font-semibold">
              Grade {result.fundus.grade}: {DR_GRADES[result.fundus.grade].shortName}
            </p>
            <ul className="space-y-1 text-[#6E5C5F]">
              {result.fundus.camHotspots.map((h, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                  <span>
                    <strong>{h.label}</strong> (Attention: {Math.round(h.intensity * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* OCT Depth Findings */}
          <div className="bg-[#FAF8F6] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
            <div className="font-bold text-[#BE185D] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Layers className="w-4 h-4 text-[#DB2777]" />
              <span>OCT Cross-Sectional Scan</span>
            </div>
            {result.oct.present ? (
              <>
                <p className="text-[#2E2628] font-semibold">
                  {result.oct.dmeDetected ? 'Cystoid Fluid Detected' : 'No Subretinal Fluid'}
                </p>
                <ul className="space-y-1 text-[#6E5C5F]">
                  {result.oct.retinalLayerFindings.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DB2777] mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-[#9C8E91] italic pt-1">
                OCT scan not submitted. Dual-stream evaluation performed.
              </p>
            )}
          </div>

          {/* Clinical Context Findings */}
          <div className="bg-[#FAF8F6] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
            <div className="font-bold text-[#2E2628] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Activity className="w-4 h-4 text-[#EA580C]" />
              <span>Clinical Profile Correlates</span>
            </div>
            {result.metadata.provided ? (
              <>
                <p className="text-[#2E2628] font-semibold">
                  Risk Tier: {result.metadata.riskScore >= 0.6 ? 'Elevated' : 'Standard'}
                </p>
                <ul className="space-y-1 text-[#6E5C5F]">
                  {result.metadata.top3RiskDrivers.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E2628] mt-1.5 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-[#9C8E91] italic pt-1">
                Clinical history not provided. Image-only classification executed.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 8. "MULTIMODAL AGREEMENT" SECTION */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#EA580C]" />
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2E2628]">
                Multimodal agreement
              </h3>
              <p className="text-xs text-[#6E5C5F]">
                Concordance and cross-validation between fundus photography, OCT, and systemic clinical metadata.
              </p>
            </div>
          </div>

          {/* Agreement Badge */}
          <div>
            {hasModalityDisagreement ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5] text-xs font-bold shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Low agreement — human review recommended.</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Modality Consensus: {agreementStatus} Agreement</span>
              </span>
            )}
          </div>
        </div>

        {/* Side-by-Side Modality Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/40 space-y-1.5">
            <span className="text-[10px] font-bold text-[#C2410C] uppercase tracking-wider">
              1. Fundus Image Stream
            </span>
            <div className="text-sm font-bold text-[#2E2628]">
              Grade {result.fundus.grade} ({DR_GRADES[result.fundus.grade].shortName})
            </div>
            <p className="text-[11px] text-[#6E5C5F]">
              Primary retinal lesion detection (EfficientNet-B4).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#FBCFE8] bg-[#FDF2F8]/50 space-y-1.5">
            <span className="text-[10px] font-bold text-[#BE185D] uppercase tracking-wider">
              2. OCT B-Scan Stream
            </span>
            <div className="text-sm font-bold text-[#2E2628]">
              {result.oct.present
                ? result.oct.dmeDetected
                  ? 'DME Detected (+)'
                  : 'DME Negative (-)'
                : 'Not Provided (Dual Stream)'}
            </div>
            <p className="text-[11px] text-[#6E5C5F]">
              {result.oct.present
                ? 'Cross-sectional subretinal fluid assessment.'
                : 'Macular thickness not verified on OCT.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#EFE4DC] bg-[#FAF8F6] space-y-1.5">
            <span className="text-[10px] font-bold text-[#6E5C5F] uppercase tracking-wider">
              3. Clinical History Stream
            </span>
            <div className="text-sm font-bold text-[#2E2628]">
              {result.metadata.provided
                ? `Grade ${result.metadata.predictedGrade} Projection`
                : 'Not Provided'}
            </div>
            <p className="text-[11px] text-[#6E5C5F]">
              {result.metadata.provided
                ? 'Systemic physiological risk correlation.'
                : 'Risk evaluation driven purely by imaging.'}
            </p>
          </div>
        </div>

        {hasModalityDisagreement && (
          <div className="p-3 bg-[#FFFBEB] rounded-xl border border-[#FED7AA] text-xs text-[#92400E]">
            <strong>Clinical Notice:</strong> Because individual streams produced diverging risk tiers, automated outputs must be treated with caution. <strong>Further specialist evaluation may be appropriate.</strong>
          </div>
        )}
      </section>

      {/* 9. "WHAT HAPPENS NEXT?" SECTION */}
      <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#EFE4DC] pb-3">
          <Calendar className="w-5 h-5 text-[#EA580C]" />
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#2E2628]">
              What happens next?
            </h3>
            <p className="text-xs text-[#6E5C5F]">
              Recommended care coordination steps based on this screening encounter.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FAF8F6] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#FFF7ED] text-[#EA580C] font-bold text-xs flex items-center justify-center border border-[#FED7AA]">
              1
            </div>
            <div className="font-bold text-xs text-[#2E2628]">Clinical Confirmation</div>
            <p className="text-xs text-[#6E5C5F] leading-relaxed">
              Clinical confirmation is required. Schedule an in-person dilated ophthalmic biomicroscopy with a qualified eye care professional.
            </p>
          </div>

          <div className="bg-[#FAF8F6] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#FDF2F8] text-[#DB2777] font-bold text-xs flex items-center justify-center border border-[#FBCFE8]">
              2
            </div>
            <div className="font-bold text-xs text-[#2E2628]">Specialist Referral</div>
            <p className="text-xs text-[#6E5C5F] leading-relaxed">
              {result.finalGrade >= 2
                ? 'Further specialist evaluation may be appropriate. Connect with a vitreoretinal clinic for comprehensive diagnostic testing.'
                : 'Routine periodic follow-up. Maintain optimal blood glucose and annual eye screening.'}
            </p>
          </div>

          <div className="bg-[#FAF8F6] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#FAF8F6] text-[#2E2628] font-bold text-xs flex items-center justify-center border border-[#EFE4DC]">
              3
            </div>
            <div className="font-bold text-xs text-[#2E2628]">Tracked Care Token</div>
            <p className="text-xs text-[#6E5C5F] leading-relaxed">
              Generate a digital referral ticket in the referral registry (/referrals) to ensure follow-up compliance and closed-loop care.
            </p>
          </div>
        </div>

        {/* CLOSED-LOOP SPECIALIST REFERRAL DISPATCH BUTTON */}
        <div className="bg-[#FFF7ED] rounded-xl border border-[#FED7AA] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-[#EA580C] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#2E2628]">
                Initiate Tracked Referral Packet
              </div>
              <div className="text-[11px] text-[#6E5C5F]">
                Dispatch this screening encounter to your partner hospital registry (/referrals).
              </div>
            </div>
          </div>

          {referralToken ? (
            <div className="px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-bold text-[#059669] flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Token: {referralToken}</span>
            </div>
          ) : (
            <button
              onClick={handleCreateReferral}
              disabled={referralLoading}
              className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{referralLoading ? 'Dispatching...' : 'Create Referral in /referrals'}</span>
            </button>
          )}
        </div>
      </section>

      {/* 10. CONDITIONAL PERSPECTIVE CONTENT: SIMPLE VS CLINICAL VS TECHNICAL */}

      {/* PERSPECTIVE: SIMPLE EXPLANATION */}
      {activeTab === 'simple' && (
        <section className="bg-white rounded-2xl border border-[#FED7AA] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-[#FED7AA] pb-3">
            <h3 className="text-lg font-serif font-bold text-[#2E2628] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#EA580C]" />
              <span>Simple explanation for Patients and Families</span>
            </h3>
            <p className="text-xs text-[#6E5C5F]">
              A non-technical, easy-to-understand overview of today's screening results.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#2E2628] leading-relaxed">
            <div className="bg-[#FFFDFB] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
              <h4 className="font-bold text-sm text-[#C2410C]">What was checked today?</h4>
              <p className="text-xs text-[#6E5C5F] leading-relaxed">
                We captured photographs of the retina (the light-sensitive lining at the back of your eye). High-resolution digital imaging evaluated the tiny blood vessels that nourish your vision to detect early changes caused by blood sugar levels.
              </p>
            </div>

            <div className="bg-[#FFFDFB] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
              <h4 className="font-bold text-sm text-[#C2410C]">What did the screening show?</h4>
              <p className="text-xs text-[#6E5C5F] leading-relaxed">
                The image analysis categorized your encounter as <strong>{gradeInfo.name}</strong>. {gradeInfo.description}
              </p>
            </div>

            <div className="bg-[#FFFDFB] p-4 rounded-xl border border-[#EFE4DC] space-y-2">
              <h4 className="font-bold text-sm text-[#C2410C]">What should you do now?</h4>
              <ul className="space-y-1.5 text-xs text-[#6E5C5F] list-disc pl-5">
                <li>Clinical confirmation is required. Please show this summary report to your optometrist, eye doctor, or diabetic specialist.</li>
                <li>Further specialist evaluation may be appropriate if you notice changes in your vision, blurriness, or floating dark spots.</li>
                <li>Keep your blood glucose, blood pressure, and cholesterol within the targets recommended by your doctor.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* PERSPECTIVE: CLINICAL & GRAD-CAM VIEW */}
      {(activeTab === 'clinical' || activeTab === 'simple') && (
        <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2E2628] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#EA580C]" />
                <span>Grad-CAM Visual Explanations (Alpha = {camOpacity.toFixed(2)})</span>
              </h2>
              <p className="text-xs text-[#6E5C5F] mt-0.5">
                Thermal activation maps highlighting retinal regions that influenced the model's feature weights.
              </p>
            </div>

            {/* Heatmap Opacity Controls */}
            <div className="flex items-center gap-3 bg-[#FAF8F6] px-3 py-1.5 rounded-xl border border-[#EFE4DC]">
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
                <div className="flex items-center gap-1 bg-[#FAF8F6] p-1 rounded-lg border border-[#EFE4DC] text-xs">
                  <button
                    type="button"
                    onClick={() => setFundusMode('original')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      fundusMode === 'original'
                        ? 'bg-white text-[#2E2628] shadow-xs'
                        : 'text-[#6E5C5F]'
                    }`}
                  >
                    Raw RGB
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundusMode('clahe')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      fundusMode === 'clahe'
                        ? 'bg-white text-[#2E2628] shadow-xs'
                        : 'text-[#6E5C5F]'
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

                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded border border-white/20">
                  Overlay Alpha: {camOpacity.toFixed(2)}
                </div>

                <div className="absolute top-3 right-3">
                  <RiskChip grade={result.fundus.grade} size="sm" />
                </div>
              </div>

              {/* Hotspots & Features Callout */}
              <div className="p-4 bg-[#FAF8F6] border-t border-[#EFE4DC] space-y-1.5 text-xs">
                <p className="font-bold text-[#C2410C]">Visual Attention Clusters:</p>
                <ul className="space-y-1 text-[#2E2628]">
                  {result.fundus.camHotspots.map((spot, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                      <span>
                        <strong>{spot.label}</strong> (Attention Peak: {(spot.intensity * 100).toFixed(0)}%)
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
                  <div className="flex items-center gap-1 bg-[#FAF8F6] p-1 rounded-lg border border-[#EFE4DC] text-xs">
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
                      src={
                        octMode === 'gradcam'
                          ? result.octCamUrl || result.octImageUrl
                          : result.octImageUrl
                      }
                      alt="OCT B-Scan"
                      className="w-full h-full object-contain"
                    />

                    <div
                      className={`absolute top-3 right-3 font-bold text-[10px] bg-black/75 px-2.5 py-1 rounded border ${
                        result.oct.dmeDetected
                          ? 'text-[#EA580C] border-[#EA580C]/50'
                          : 'text-[#10B981] border-[#10B981]/50'
                      }`}
                    >
                      {result.oct.dmeDetected ? 'DME DETECTED' : 'DME NEGATIVE'}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-[#FDF2F8] text-[#BE185D] text-xs font-semibold px-2 py-0.5 rounded border border-[#FBCFE8]">
                      {result.oct.predictedClass} · {(result.oct.dmeProbability * 100).toFixed(1)}% DME Score
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF8F6] border-t border-[#EFE4DC] space-y-1.5 text-xs">
                    <p className="font-bold text-[#BE185D]">OCT Cross-Sectional Indicators:</p>
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
                <div className="aspect-square rounded-b-2xl bg-[#FAF8F6] flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Layers className="w-8 h-8 text-[#9C8E91]" />
                  <p className="text-xs font-bold text-[#2E2628]">OCT Modality Not Provided</p>
                  <p className="text-[11px] text-[#6E5C5F] max-w-xs">
                    Model ran in dual-stream mode. Capturing an OCT scan enables cross-sectional cystoid fluid detection and triggers the DME escalation rule.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PERSPECTIVE: TECHNICAL DETAILS (SHAP, MODALITY OUTPUTS, FUSION LOGIC) */}
      {(activeTab === 'technical' || activeTab === 'clinical') && (
        <>
          {/* 11. SHAP WATERFALL & CLINICAL FEATURE EXPLAINABILITY */}
          {result.metadata.provided && (
            <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                    <h2 className="text-lg font-serif font-bold text-[#2E2628]">
                      SHAP Waterfall Feature Attributions (XGBoost)
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

              {/* SHAP Waterfall Chart */}
              <div className="space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                  SHAP Feature Impact
                </div>
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

          {/* 12. PER-MODALITY BREAKDOWN & FUSION LOGIC */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2E2628]">
                  Modality outputs & Late Fusion Logic
                </h3>
                <p className="text-xs text-[#6E5C5F]">
                  Independent classification streams fused through weighted decision-support rules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Fundus Stream */}
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

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-[#6E5C5F]">5-Class Output Vector:</span>
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
                        {(prob * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: OCT Stream */}
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
                      <span className="text-[#6E5C5F]">DME Score:</span>
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
                  <p className="text-xs text-[#9C8E91] italic">OCT modality bypassed in screening.</p>
                )}
              </div>

              {/* Card 3: Clinical Metadata */}
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
                  <p className="text-[11px] text-[#6E5C5F]">XGBoost · UKPDS Distributions</p>
                </div>

                <div className="space-y-1 pt-1 text-xs">
                  <span className="text-[10px] font-semibold text-[#6E5C5F] block">Top Correlates:</span>
                  {result.metadata.top3RiskDrivers.map((driver, i) => (
                    <p key={i} className="text-[11px] text-[#2E2628] truncate">
                      • {driver}
                    </p>
                  ))}
                </div>
              </div>

              {/* Card 4: Multimodal Fusion Junction */}
              <div className="p-4 rounded-2xl border border-[#FDBA74] border-t-4 border-t-[#DB2777] bg-gradient-to-br from-[#FFF7ED] to-[#FDF2F8] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#9D174D]">4. Late Fusion</span>
                  <span className="text-[10px] font-mono font-bold text-[#9D174D]">
                    {result.confidence} CONSENSUS
                  </span>
                </div>

                <div>
                  <p className="text-lg font-bold text-[#9D174D]">
                    Grade {result.finalGrade} ({DR_GRADES[result.finalGrade].shortName})
                  </p>
                  <p className="text-[11px] text-[#6E5C5F]">Weighted Late Fusion Model</p>
                </div>

                <div className="p-2 bg-white rounded-lg border border-[#FDBA74] text-[10px] font-mono text-[#2E2628] space-y-0.5">
                  <p>0.55 · Fundus ({result.fundus.grade})</p>
                  <p>+ 0.30 · Meta ({result.metadata.predictedGrade})</p>
                  <p>+ 0.15 · OCT ({result.oct.dmeDetected ? '2' : '0'})</p>
                  <p className="font-bold text-[#9D174D] pt-0.5 border-t border-[#EFE4DC]">
                    = Raw {result.rawFusionScore} → Final {result.finalGrade}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 13. ABLATION STUDY COMPARISON TEASER */}
          <section className="bg-gradient-to-r from-[#FFF7ED] via-white to-[#FDF2F8] p-6 rounded-2xl border border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#EA580C]" />
                <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider">
                  Scientific Ablation Benchmarks
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#6E5C5F]">
                Our 6-experiment ablation matrix demonstrates that multimodal fusion yields a statistically validated <strong>+0.068 AUC gain</strong> over fundus-alone classification.
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
        </>
      )}

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        result={result}
      />

      {/* Controlled Clinical AI Assistant Modal */}
      <ClinicalAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        result={result}
      />
    </div>
  );
};
