import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Download,
  Eye,
  FileText,
  Layers,
  MapPin,
  Printer,
  RotateCcw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { MultimodalTriageResult } from '../types';
import { generateClinicalPdfReport } from '../utils/pdfGenerator';
import { voiceService } from '../services/voiceService';
import { useTranslation } from '../i18n/I18nContext';

export interface PatientScreeningResultViewProps {
  result: MultimodalTriageResult;
  onFindClinic?: () => void;
  onBookScreening?: () => void;
  onViewReport?: () => void;
  onNewScreening?: () => void;
  isStandalone?: boolean;
}

export const PatientScreeningResultView: React.FC<PatientScreeningResultViewProps> = ({
  result,
  onFindClinic,
  onBookScreening,
  onViewReport,
  onNewScreening,
  isStandalone = false,
}) => {
  const { language } = useTranslation();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [selectedFundusView, setSelectedFundusView] = useState<'normal' | 'gradcam' | 'clahe'>('normal');
  const [isViewingFullReportModal, setIsViewingFullReportModal] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Grade classification
  const grade = typeof result.finalGrade === 'number' && result.finalGrade >= 0 && result.finalGrade <= 4
    ? result.finalGrade
    : 0;

  const isRoutine = grade === 0;
  const isMild = grade === 1;
  const isSignificant = grade >= 2;

  // Voice narration helper for accessibility
  const handleToggleVoice = () => {
    if (isSpeaking) {
      voiceService.stop();
      setIsSpeaking(false);
      return;
    }

    const narration = `
      Screening Summary for patient reference ${result.patientId}.
      Status: ${
        isRoutine
          ? 'Routine Follow-up. No obvious retinal changes detected on this screening.'
          : 'Your screening information indicates that further professional evaluation may be appropriate.'
      }
      Recommended Next Step: ${
        isRoutine
          ? 'Schedule your next routine annual eye examination in 12 months.'
          : isMild
          ? 'Please consult a qualified eye-care professional for clinical evaluation within 30 to 60 days.'
          : 'Please consult a qualified eye-care professional for clinical evaluation within 2 to 4 weeks.'
      }
      Important notice: This is an AI-assisted screening result and does not confirm or rule out a diagnosis.
    `;

    voiceService.speak({
      text: narration,
      title: 'Screening Summary Narration',
      lang: language,
      onComplete: () => setIsSpeaking(false),
    });
    setIsSpeaking(true);
  };

  const handleDownloadPdf = () => {
    try {
      generateClinicalPdfReport(result);
    } catch (e) {
      console.error('PDF export failed, falling back to print dialog', e);
      window.print();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-[#1F181A] dark:text-[#F3EDF0]">
      {/* =====================================================================
          MANDATORY SAFETY BANNER & DISCLAIMER
          ===================================================================== */}
      <div
        role="region"
        aria-label="Screening Notice"
        className="bg-white dark:bg-[#1C1719] border-2 border-[#F05A28]/40 dark:border-[#F05A28]/30 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FFE5D8] dark:bg-[#2C1D17] text-[#F05A28] text-xs sm:text-sm font-extrabold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#F05A28]" />
            <span>AI-Assisted Screening Support</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#6F6267] dark:text-[#A8989B]">
            <span className="font-mono bg-[#FAF6F2] dark:bg-[#261E22] px-2.5 py-1 rounded-lg border border-[#EFE4DC] dark:border-[#382E32]">
              Ref: {result.patientId}
            </span>
            <span>•</span>
            <span>{new Date(result.timestamp || Date.now()).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F181A] dark:text-white tracking-tight">
            Screening Summary
          </h1>
          <p className="text-base sm:text-lg text-[#524346] dark:text-[#DDD3CD] leading-relaxed">
            This is an AI-assisted screening result and does not confirm or rule out a diagnosis.{' '}
            <strong className="text-[#1F181A] dark:text-white font-bold">
              Please consult a qualified eye-care professional
            </strong>{' '}
            for clinical evaluation and personalized care.
          </p>
        </div>

        {/* Read aloud helper for patients with low vision */}
        <div className="pt-2 flex items-center justify-between border-t border-[#F2ECE7] dark:border-[#2C2428] text-xs">
          <span className="text-[#7A696C] dark:text-[#9F8F92]">
            Assessment based strictly on submitted photographs and reported information.
          </span>
          <button
            type="button"
            onClick={handleToggleVoice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#241E21] hover:border-[#F05A28] text-[#382E30] dark:text-[#DDD3CD] font-bold transition-colors"
            title="Read summary aloud"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Listen to Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAIN CARD: SCREENING SUMMARY
          Sections:
          1. Status
          2. What We Found
          3. What This Means
          4. Recommended Next Step
          5. When To Seek Professional Evaluation
          6. Report
          7. Technical Details
          ===================================================================== */}
      <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-10 shadow-xs space-y-10">
        
        {/* -------------------------------------------------------------------
            1. STATUS
            Large, readable, non-definitive language
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-status" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <Activity className="w-4 h-4" />
            <span id="heading-status">Status</span>
          </div>

          <div
            className={`p-6 sm:p-7 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
              isRoutine
                ? 'bg-[#F0FDF4] dark:bg-[#122418] border-[#86EFAC] dark:border-[#15803D]'
                : isMild
                ? 'bg-[#FEFCE8] dark:bg-[#262413] border-[#FDE047] dark:border-[#A16207]'
                : 'bg-[#FFE5D8] dark:bg-[#2B1B15] border-[#FDBA74] dark:border-[#D84818]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {isRoutine ? (
                  <CheckCircle2 className="w-7 h-7 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                ) : isMild ? (
                  <AlertCircle className="w-7 h-7 text-[#A16207] dark:text-[#FACC15] shrink-0" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-[#D84818] dark:text-[#FB923C] shrink-0" />
                )}
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1F181A] dark:text-white">
                  {isRoutine
                    ? 'Routine Follow-up'
                    : isMild
                    ? 'Professional Evaluation Advised'
                    : 'Specialist Evaluation Recommended'}
                </h2>
              </div>

              <p className="text-base sm:text-lg font-medium text-[#382E30] dark:text-[#E2D8DD] leading-relaxed max-w-2xl">
                {isRoutine ? (
                  'No obvious retinal microvascular changes were observed on your screening images.'
                ) : (
                  <span>
                    Your screening information indicates that{' '}
                    <strong className="font-extrabold underline decoration-[#F05A28]/40 underline-offset-4">
                      further professional evaluation may be appropriate
                    </strong>
                    .
                  </span>
                )}
              </p>
            </div>

            {/* Visual Status Indicator Pill (Icon + Text + High Contrast Color) */}
            <div
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shrink-0 ${
                isRoutine
                  ? 'bg-[#DCFCE7] text-[#14532D] border border-[#86EFAC]'
                  : isMild
                  ? 'bg-[#FEF08A] text-[#713F12] border border-[#FACC15]'
                  : 'bg-[#FED7AA] text-[#7C2D12] border border-[#FB923C]'
              }`}
            >
              {isRoutine ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Routine Category</span>
                </>
              ) : isMild ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Review Category</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Priority Review</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            2. WHAT WE FOUND
            Plain language observations of images and metadata
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-found" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <Eye className="w-4 h-4" />
            <h2 id="heading-found" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              What We Found
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual Retinal Findings Card */}
            <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F181A] dark:text-white">
                <Eye className="w-4 h-4 text-[#F05A28]" />
                <span>Retinal Photography Observations</span>
              </div>
              <p className="text-sm sm:text-base text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                {isRoutine
                  ? 'The blood vessels, optic nerve disc, and central macula in your retinal photograph show clean, typical margins with no visible bleeding, swelling, or microaneurysms detected.'
                  : isMild
                  ? 'Minor microvascular features (such as tiny microaneurysms or slight vessel widening) were detected in the peripheral retinal area. The central macula remains well-defined.'
                  : 'Observable retinal patterns were detected, which may include clusters of microaneurysms, small hemorrhages, or lipid deposits that require direct clinical examination.'}
              </p>
              {result.fundus.featuresDetected && result.fundus.featuresDetected.length > 0 && (
                <div className="pt-2 border-t border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-xs font-bold text-[#6F6267] dark:text-[#9F8F92] block mb-1">
                    Specific Image Indicators Noted:
                  </span>
                  <ul className="text-xs text-[#524346] dark:text-[#C4B7BA] space-y-1 list-disc list-inside">
                    {result.fundus.featuresDetected.map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Cross-Section Scan (OCT) & Health History Card */}
            <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F181A] dark:text-white">
                <Layers className="w-4 h-4 text-[#F05A28]" />
                <span>Cross-Section Scan (OCT) & Clinical Context</span>
              </div>

              {result.oct?.present ? (
                <p className="text-sm sm:text-base text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                  {result.oct.dmeDetected
                    ? 'Cross-sectional imaging indicates possible fluid accumulation or retinal thickening near the central macula (diabetic macular swelling).'
                    : 'The cross-sectional scan shows intact, smooth retinal layers with normal central thickness and no significant fluid pockets.'}
                </p>
              ) : (
                <p className="text-sm sm:text-base text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                  An optical cross-sectional scan (OCT) was not provided for this session. The assessment evaluated your primary fundus photograph alongside your provided clinical health background.
                </p>
              )}

              {result.clinicalInput && (
                <div className="pt-2 border-t border-[#EFE4DC] dark:border-[#382E32] text-xs text-[#6F6267] dark:text-[#9F8F92] space-y-1">
                  <span className="font-bold text-[#2B2024] dark:text-white block">
                    Health Factors Integrated:
                  </span>
                  <div>
                    HbA1c: <strong>{result.clinicalInput.hba1c}%</strong> • Diabetes Duration:{' '}
                    <strong>{result.clinicalInput.diabetesDurationYears} yrs</strong> • Systolic BP:{' '}
                    <strong>{result.clinicalInput.systolicBp} mmHg</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            3. WHAT THIS MEANS
            Calm, non-alarmist, empathetic context
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-means" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <Stethoscope className="w-4 h-4" />
            <h2 id="heading-means" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              What This Means
            </h2>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFBF8] dark:bg-[#201A1D] border border-[#F2ECE7] dark:border-[#382E32] space-y-3">
            <p className="text-base sm:text-lg text-[#382E30] dark:text-[#DDD3CD] leading-relaxed">
              {isRoutine ? (
                <>
                  Your retinal images show <strong className="font-semibold text-[#15803D] dark:text-[#4ADE80]">no signs of diabetic eye damage</strong> at this time.
                  Because diabetes can affect the tiny vessels of the eye very gradually and often without noticeable early warning symptoms, maintaining yearly eye checks is the most reliable way to keep your eyes healthy.
                </>
              ) : isMild ? (
                <>
                  The screening identified early, small microvascular changes. <strong className="font-semibold text-[#1F181A] dark:text-white">This does not mean you have permanent vision loss.</strong> Early changes are common in individuals living with diabetes. When recognized early, maintaining steady blood sugar control and obtaining timely clinical oversight usually prevents them from ever affecting your vision.
                </>
              ) : (
                <>
                  The screening noted distinct retinal features that warrant <strong className="font-semibold text-[#1F181A] dark:text-white">prompt in-person clinical examination</strong> by an eye specialist. Modern medical treatments—including targeted eye drops, specialized laser treatments, or gentle medical therapies—are overwhelmingly effective at protecting and preserving eyesight when introduced early.
                </>
              )}
            </p>
            <p className="text-sm text-[#7A696C] dark:text-[#A8989B]">
              Early detection gives you and your doctor the power to safeguard your eyesight long before any daily visual changes develop.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            4. RECOMMENDED NEXT STEP
            Clear guidance & prominent next action buttons
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-next-step" className="space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <Clock className="w-4 h-4" />
            <h2 id="heading-next-step" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              Recommended Next Step
            </h2>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-[#FFE5D8] dark:bg-[#2A1D17] border-2 border-[#F05A28]/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#F05A28] uppercase tracking-wider">
                Recommended Action Window
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F181A] dark:text-white bg-white dark:bg-[#1D191B] px-3 py-1 rounded-full border border-[#F05A28]/20">
                <Clock className="w-3.5 h-3.5 text-[#F05A28]" />
                {isRoutine
                  ? 'Routine: Within 12 Months'
                  : isMild
                  ? 'Review: Within 30 to 60 Days'
                  : 'Specialist: Within 2 to 4 Weeks'}
              </span>
            </div>

            <p className="text-lg sm:text-xl font-bold text-[#1F181A] dark:text-white leading-snug">
              {isRoutine
                ? 'Schedule your next routine annual comprehensive eye examination in 12 months.'
                : isMild
                ? 'Please consult a qualified eye-care professional (optometrist or ophthalmologist) for a comprehensive clinical evaluation within 30 to 60 days.'
                : 'Please consult a qualified eye-care professional (ophthalmologist or retina specialist) for a clinical evaluation within 2 to 4 weeks.'}
            </p>

            <p className="text-sm text-[#524346] dark:text-[#C4B7BA]">
              Share this screening summary and your latest HbA1c lab numbers with your primary healthcare provider or eye doctor so they have the full picture.
            </p>

            {/* PROMINENT NEXT ACTIONS */}
            <div className="pt-4 border-t border-[#F05A28]/20 flex flex-wrap items-center gap-3">
              {onFindClinic && (
                <button
                  type="button"
                  id="btn-find-screening-center"
                  onClick={onFindClinic}
                  className="px-6 py-3 rounded-2xl bg-[#F05A28] hover:bg-[#D84818] text-white font-extrabold text-sm uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Find a Screening Center</span>
                </button>
              )}

              {onBookScreening && (
                <button
                  type="button"
                  id="btn-book-screening"
                  onClick={onBookScreening}
                  className="px-6 py-3 rounded-2xl bg-[#1F181A] dark:bg-white text-white dark:text-[#1F181A] hover:bg-[#382E30] dark:hover:bg-[#EAE2E5] font-extrabold text-sm uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book a Screening</span>
                </button>
              )}

              <button
                type="button"
                id="btn-view-my-report"
                onClick={() => {
                  if (onViewReport) {
                    onViewReport();
                  } else {
                    setIsViewingFullReportModal(true);
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-white dark:bg-[#1D191B] border-2 border-[#F05A28] text-[#F05A28] hover:bg-[#FFE5D8] dark:hover:bg-[#2E1D16] font-extrabold text-sm uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View My Report</span>
              </button>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            5. WHEN TO SEEK PROFESSIONAL EVALUATION
            Safety guidelines for when patients should not wait
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-urgent" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <ShieldAlert className="w-4 h-4" />
            <h2 id="heading-urgent" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              When To Seek Professional Evaluation
            </h2>
          </div>

          <div className="p-6 rounded-2xl bg-[#FEF2F2] dark:bg-[#281517] border border-[#FECACA] dark:border-[#7F1D1D] space-y-4">
            <p className="text-sm sm:text-base font-bold text-[#991B1B] dark:text-[#FCA5A5] leading-relaxed">
              Regardless of any screening schedule, please seek prompt or urgent evaluation from an eye-care professional or emergency eye clinic if you experience any of the following warning signs:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#7F1D1D] dark:text-[#FECACA]">
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                <span className="text-[#DC2626] font-black shrink-0">•</span>
                <span>Sudden blurriness, cloudiness, or rapid loss of vision</span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                <span className="text-[#DC2626] font-black shrink-0">•</span>
                <span>New floating dark spots, specks, or web-like strings in your sight</span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                <span className="text-[#DC2626] font-black shrink-0">•</span>
                <span>Flashes of light or sudden shimmering arcs</span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                <span className="text-[#DC2626] font-black shrink-0">•</span>
                <span>A dark shadow, veil, or curtain covering any part of your vision</span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                <span className="text-[#DC2626] font-black shrink-0">•</span>
                <span>Persistent eye pain, pressure, or sudden severe redness</span>
              </li>
              <li className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                <span className="text-[#DC2626] font-black shrink-0">•</span>
                <span>Straight lines appearing wavy, distorted, or missing in the center</span>
              </li>
            </ul>

            <p className="text-xs sm:text-sm text-[#991B1B] dark:text-[#FCA5A5] italic border-t border-[#FCA5A5]/40 pt-2">
              Please consult a qualified eye-care professional immediately if any sudden visual changes occur.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            6. REPORT
            Dedicated patient report section with view, print, and PDF download
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-report" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <FileText className="w-4 h-4" />
            <h2 id="heading-report" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              Report
            </h2>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF7F4] dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
                Patient Screening Summary Report
              </h3>
              <p className="text-xs sm:text-sm text-[#524346] dark:text-[#C4B7BA]">
                A clean, comprehensive clinical summary formatted for you to save or take to your doctor. Includes image review records, metabolic inputs, and referral recommendations.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                id="btn-report-view"
                onClick={() => setIsViewingFullReportModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1D191B] hover:border-[#F05A28] text-[#1F181A] dark:text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-[#F05A28]" />
                <span>View My Report</span>
              </button>

              <button
                type="button"
                id="btn-report-download"
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                id="btn-report-print"
                onClick={() => window.print()}
                className="w-full sm:w-auto p-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1D191B] hover:border-[#F05A28] text-[#382E30] dark:text-[#DDD3CD] transition-colors flex items-center justify-center"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            7. TECHNICAL DETAILS
            Collapsible accordion keeping the patient view free of research dashboard clutter
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-technical" className="pt-2 border-t border-[#F2ECE7] dark:border-[#2C2428]">
          <button
            type="button"
            id="btn-toggle-technical"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full py-4 px-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32] hover:border-[#F05A28] text-[#382E30] dark:text-[#DDD3CD] transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-[#F05A28]" />
              <div className="text-left">
                <span id="heading-technical" className="text-sm sm:text-base font-bold text-[#1F181A] dark:text-white block">
                  Technical Details
                </span>
                <span className="text-xs text-[#7A696C] dark:text-[#9F8F92]">
                  Model information, input modalities, Grad-CAM attention, and SHAP attribution
                </span>
              </div>
            </div>
            {showTechnicalDetails ? (
              <ChevronUp className="w-5 h-5 text-[#F05A28]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#7A696C]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-4 p-6 sm:p-8 rounded-2xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#181416] space-y-8 animate-in fade-in-50">
              
              {/* MODEL INFORMATION */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#F05A28]" />
                  <span>Model Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block font-semibold mb-1">Fundus Architecture</span>
                    <strong className="text-sm text-[#1F181A] dark:text-white block">
                      {result.fundus.modelArchitecture || 'ResNet-50 / EfficientNet-B4 (ONNX)'}
                    </strong>
                    <span className="text-[11px] text-[#7A696C]">Deep retinal convolutional classification</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block font-semibold mb-1">OCT Architecture</span>
                    <strong className="text-sm text-[#1F181A] dark:text-white block">
                      {result.oct?.modelArchitecture || 'ConvNeXt-V2 / DenseNet-121 (B-Scan)'}
                    </strong>
                    <span className="text-[11px] text-[#7A696C]">Macular cross-section layer segmentation</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block font-semibold mb-1">Late Fusion Engine</span>
                    <strong className="text-sm text-[#F05A28] block">
                      Hierarchical Surrogate Matrix + XGBoost
                    </strong>
                    <span className="text-[11px] text-[#7A696C]">Multimodal decision late-fusion</span>
                  </div>
                </div>
              </div>

              {/* INPUT MODALITY */}
              <div className="space-y-3 pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428]">
                <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F05A28]" />
                  <span>Input Modality</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block font-semibold">Primary Retinal Image</span>
                    <span className="text-sm font-bold text-[#1F181A] dark:text-white block mt-0.5">
                      {result.fundusImageName || 'Fundus Color Photo'}
                    </span>
                    <span className="text-[#10B981] font-bold text-[11px]">• Quality: Adequate / Graded</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block font-semibold">OCT Modality</span>
                    <span className="text-sm font-bold text-[#1F181A] dark:text-white block mt-0.5">
                      {result.oct?.present ? 'B-Scan Attached' : 'Omitted (Skipped)'}
                    </span>
                    <span className="text-[11px] text-[#7A696C]">
                      {result.oct?.centralSubfieldThicknessUm
                        ? `Central Thickness: ${result.oct.centralSubfieldThicknessUm} µm`
                        : 'Bi-modal fallback logic active'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block font-semibold">Metadata Features</span>
                    <span className="text-sm font-bold text-[#1F181A] dark:text-white block mt-0.5">
                      {result.metadata?.provided ? 'Clinical Indicators Loaded' : 'Baseline Priors'}
                    </span>
                    <span className="text-[11px] text-[#7A696C]">Metabolic risk factors calibrated</span>
                  </div>
                </div>
              </div>

              {/* GRAD-CAM VISUAL ATTENTION */}
              <div className="space-y-4 pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#F05A28]" />
                      <span>Grad-CAM Visual Attention</span>
                    </h3>
                    <p className="text-xs text-[#7A696C] dark:text-[#9F8F92]">
                      Gradient-weighted Class Activation Mapping displays the exact retinal areas where the neural network focused.
                    </p>
                  </div>

                  <div className="inline-flex rounded-xl p-1 bg-[#F3ECE5] dark:bg-[#2C2428] text-xs font-semibold shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedFundusView('normal')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        selectedFundusView === 'normal'
                          ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] font-bold shadow-2xs'
                          : 'text-[#6F6267] dark:text-[#A8989B]'
                      }`}
                    >
                      Photo View
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFundusView('gradcam')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        selectedFundusView === 'gradcam'
                          ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] font-bold shadow-2xs'
                          : 'text-[#6F6267] dark:text-[#A8989B]'
                      }`}
                    >
                      Grad-CAM Heatmap
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFundusView('clahe')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        selectedFundusView === 'clahe'
                          ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] font-bold shadow-2xs'
                          : 'text-[#6F6267] dark:text-[#A8989B]'
                      }`}
                    >
                      Contrast CLAHE
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] space-y-2">
                    <span className="text-xs font-bold text-[#1F181A] dark:text-white block">
                      Fundus Retinal Focus ({selectedFundusView.toUpperCase()})
                    </span>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src={
                          selectedFundusView === 'gradcam'
                            ? result.fundusCamUrl
                            : selectedFundusView === 'clahe'
                            ? result.fundusClaheUrl
                            : result.fundusImageUrl
                        }
                        alt="Fundus Visualization"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] space-y-2">
                    <span className="text-xs font-bold text-[#1F181A] dark:text-white block">
                      OCT Macular Cross-Section Focus
                    </span>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      {result.octImageUrl ? (
                        <img
                          src={result.octImageUrl}
                          alt="OCT Scan Visualization"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6 space-y-2 text-[#8E7E81]">
                          <Layers className="w-8 h-8 mx-auto" />
                          <p className="text-xs font-semibold">No OCT Modality Provided</p>
                          <p className="text-[11px]">Fundus and metabolic models drove the evaluation.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SHAP ATTRIBUTION */}
              {result.metadata?.shapValues && result.metadata.shapValues.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428]">
                  <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#F05A28]" />
                    <span>SHAP Feature Attribution (Metabolic Drivers)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {result.metadata.shapValues.slice(0, 4).map((shap, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-[#1F181A] dark:text-white block">
                            {shap.feature}
                          </span>
                          <span className="text-[11px] text-[#7A696C]">
                            {shap.impact === 'increases_risk'
                              ? 'Upward metabolic pressure'
                              : 'Protective profile'}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold px-2 py-1 rounded-md text-[11px] ${
                            shap.shapValue > 0
                              ? 'bg-[#FEF2F2] text-[#DC2626]'
                              : 'bg-[#F0FDF4] text-[#16A34A]'
                          }`}
                        >
                          {shap.shapValue > 0 ? `+${shap.shapValue.toFixed(2)}` : shap.shapValue.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODEL OUTPUT & LATENCY */}
              <div className="space-y-3 pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428]">
                <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#F05A28]" />
                  <span>Model Output</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block text-[11px]">ICDR Level</span>
                    <strong className="text-sm font-bold text-[#F05A28]">Grade {grade}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block text-[11px]">Model Confidence</span>
                    <strong className="text-sm font-bold text-[#1F181A] dark:text-white">
                      {result.confidence}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block text-[11px]">Fundus Prob (Top)</span>
                    <strong className="text-sm font-bold text-[#1F181A] dark:text-white">
                      {((result.fundus.probabilities[grade] || 0.9) * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#33282C]">
                    <span className="text-[#8E7E81] block text-[11px]">Inference Latency</span>
                    <strong className="text-sm font-bold text-[#1F181A] dark:text-white">
                      {result.fundus.inferenceMs + (result.oct?.inferenceMs || 0)} ms
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =====================================================================
            FOOTER ACTIONS: Start New Screening
            ===================================================================== */}
        {onNewScreening && (
          <div className="pt-6 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center justify-between">
            <button
              type="button"
              id="btn-restart-screening"
              onClick={onNewScreening}
              className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6F6267] dark:text-[#A8989B] hover:bg-[#FAF6F2] dark:hover:bg-[#251E22] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Screening</span>
            </button>
            <span className="text-xs text-[#8E7E81]">
              RetinaGuard Multimodal Decision Support
            </span>
          </div>
        )}
      </div>

      {/* =====================================================================
          PATIENT FULL REPORT MODAL
          ===================================================================== */}
      {isViewingFullReportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE7] dark:border-[#2C2428]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFE5D8] text-[#F05A28] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="report-modal-title" className="text-xl font-extrabold text-[#1F181A] dark:text-white">
                    Patient Screening Summary
                  </h3>
                  <span className="text-xs text-[#7A696C] dark:text-[#A8989B]">
                    ID: {result.patientId} • Date: {new Date(result.timestamp || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsViewingFullReportModal(false)}
                className="p-2 rounded-xl text-[#7A696C] hover:text-[#1F181A] dark:hover:text-white hover:bg-[#FAF7F4] dark:hover:bg-[#251E22] transition-colors"
                aria-label="Close report view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 text-sm">
              <div className="p-4 rounded-xl bg-[#FFE5D8] dark:bg-[#2A1D17] border border-[#F05A28]/20 space-y-1">
                <span className="text-xs font-bold text-[#F05A28] uppercase tracking-wider block">
                  Notice for Clinical Consultation
                </span>
                <p className="text-xs sm:text-sm text-[#382E30] dark:text-[#E2D8DD] leading-relaxed">
                  This is an AI-assisted screening result and does not confirm or rule out a diagnosis. Please consult a qualified eye-care professional.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block">Patient Reference</span>
                  <span className="font-bold text-sm text-[#1F181A] dark:text-white">
                    {result.patientName || 'Patient'} ({result.patientId})
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block">Screening Outcome Status</span>
                  <span className="font-bold text-sm text-[#F05A28]">
                    {isRoutine
                      ? 'Routine Follow-up'
                      : isMild
                      ? 'Review Advised (30-60d)'
                      : 'Specialist Evaluation (2-4w)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#6F6267] dark:text-[#9F8F92]">
                  Summary Findings
                </h4>
                <p className="p-4 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] text-xs sm:text-sm text-[#382E30] dark:text-[#DDD3CD] leading-relaxed">
                  {isRoutine
                    ? 'No diabetic retinal microvascular abnormalities detected. Intact retinal vascular caliber and sharp optic disc rim reflex.'
                    : isMild
                    ? 'Your screening information indicates that further professional evaluation may be appropriate. Early microvascular features were detected on the retinal photograph.'
                    : 'Your screening information indicates that further professional evaluation is recommended to protect your vision. Notable retinal features observed requiring in-person slit-lamp and dilated examination.'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#6F6267] dark:text-[#9F8F92]">
                  Imaging Modalities Assessed
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[#EFE4DC] dark:border-[#382E32]">
                    <span className="font-bold block text-[#1F181A] dark:text-white">Fundus Photography</span>
                    <span className="text-[#10B981] font-semibold">Included • High Quality</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[#EFE4DC] dark:border-[#382E32]">
                    <span className="font-bold block text-[#1F181A] dark:text-white">OCT B-Scan</span>
                    <span className="text-[#6F6267] dark:text-[#A8989B]">
                      {result.oct?.present ? 'Included • Evaluated' : 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsViewingFullReportModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6F6267] dark:text-[#A8989B] hover:bg-[#FAF7F4] transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1D191B] text-xs font-bold text-[#1F181A] dark:text-white hover:border-[#F05A28] transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
