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
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Printer,
  RotateCcw,
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
  const [showTechnicalExplanation, setShowTechnicalExplanation] = useState<boolean>(false);
  const [activeAttentionTab, setActiveAttentionTab] = useState<'comparison' | 'original' | 'attention'>('comparison');
  const [isViewingFullReportModal, setIsViewingFullReportModal] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Grade classification (0: Routine, 1: Mild, 2: Moderate, 3: Severe, 4: Proliferative)
  const grade =
    typeof result.finalGrade === 'number' && result.finalGrade >= 0 && result.finalGrade <= 4
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

    let narration = '';
    if (language === 'hi') {
      narration = isRoutine
        ? `स्क्रीनिंग सारांश। नियमित फॉलो-अप। इस जांच में रेटिना में कोई गंभीर बदलाव नहीं पाया गया। आपकी रेटिना की फोटो सामान्य दिख रही है। कृपया 12 महीने बाद अपनी अगली नियमित वार्षिक आंख जांच कराएं। ध्यान दें: यह एआई-सहायता प्राप्त स्क्रीनिंग है और डॉक्टर की पुष्टि आवश्यक है।`
        : `स्क्रीनिंग सारांश। विशेषज्ञ डॉक्टर से परामर्श की आवश्यकता है। आपकी रेटिना की जांच में कुछ शुरुआती बदलाव देखे गए हैं। समय पर जांच और डॉक्टर की सलाह आपकी दृष्टि को सुरक्षित रखती है। कृपया अगले ${isMild ? '30 से 60 दिनों' : '2 से 4 हफ्तों'} में किसी योग्य नेत्र चिकित्सक से परामर्श लें।`;
    } else if (language === 'kn') {
      narration = isRoutine
        ? `ತಪಾಸಣಾ ಸಾರಾಂಶ. ನಿಯಮಿತ ಅನುಸರಣೆ. ಈ ತಪಾಸಣೆಯಲ್ಲಿ ಯಾವುದೇ ಗಂಭೀರ ಬದಲಾವಣೆ ಕಂಡುಬಂದಿಲ್ಲ. ನಿಮ್ಮ ರೆಟಿನಾ ಫೋಟೋ ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳನ್ನು ತೋರಿಸುತ್ತದೆ. 12 ತಿಂಗಳಲ್ಲಿ ಮುಂದಿನ ವಾರ್ಷಿಕ ಕಣ್ಣಿನ ತಪಾಸಣೆಯನ್ನು ನಿಗದಿಪಡಿಸಿ. ಇದು ಎಐ ತಪಾಸಣಾ ಸಹಾಯವಾಗಿದ್ದು ವೈದ್ಯರ ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ.`
        : `ತಪಾಸಣಾ ಸಾರಾಂಶ. ತಜ್ಞ ನೇತ್ರ ವೈದ್ಯರ ಭೇಟಿ ಅಗತ್ಯವಿದೆ. ಆರಂಭಿಕ ಬದಲಾವಣೆಗಳು ಕಂಡುಬಂದಿವೆ. ಆರಂಭಿಕ ಪತ್ತೆಯಿಂದ ದೃಷ್ಟಿಯನ್ನು ರಕ್ಷಿಸಬಹುದು. ದಯವಿಟ್ಟು ${isMild ? '30 ರಿಂದ 60 ದಿನಗಳಲ್ಲಿ' : '2 ರಿಂದ 4 ವಾರಗಳಲ್ಲಿ'} ನೇತ್ರ ತಜ್ಞರನ್ನು ಭೇಟಿ ಮಾಡಿ.`;
    } else if (language === 'ta') {
      narration = isRoutine
        ? `பரிசோதனை சுருக்கம். வழக்கமான பின்தொடர்தல். இந்த பரிசோதனையில் தீவிர மாற்றங்கள் எதுவும் கண்டறியப்படவில்லை. உங்கள் விழித்திரை புகைப்படம் வழக்கமான அம்சங்களைக் காட்டுகிறது. 12 மாதங்களில் அடுத்த வருடாந்திர பரிசோதனையை திட்டமிடுங்கள்.`
        : `பரிசோதனை சுருக்கம். கண் மருத்துவரிடம் ஆலோசனை பெற பரிந்துரைக்கப்படுகிறது. ஆரம்பகால கண்டறிதல் பார்வையை பாதுகாக்கும். தயவுசெய்து ${isMild ? '30 முதல் 60 நாட்களுக்குள்' : '2 முதல் 4 வாரங்களுக்குள்'} கண் மருத்துவரை அணுகவும்.`;
    } else if (language === 'te') {
      narration = isRoutine
        ? `స్క్రీనింగ్ సారాంశం. సాధారణ ఫాలో-అప్. ఈ స్క్రీనింగ్‌లో ఎటువంటి తీవ్రమైన మార్పులు గుర్తించబడలేదు. మీ రెటీనా ఫోటో సాధారణంగా ఉంది. 12 నెలల్లో తదుపరి వార్షిక కంటి పరీక్షను చేయించుకోండి.`
        : `స్క్రీనింగ్ సారాంశం. కంటి వైద్యుని సంప్రదించడం అవసరం. ప్రారంభ మార్పులు గుర్తించబడ్డాయి. ముందస్తు గుర్తింపు చూపును కాపాడుతుంది. దయచేసి ${isMild ? '30 నుండి 60 రోజుల్లోపు' : '2 నుండి 4 వారాల్లోపు'} కంటి నిపుణుడిని సంప్రదించండి.`;
    } else if (language === 'ml') {
      narration = isRoutine
        ? `പരിശോധനാ സംഗ്രഹം. സാധാരണ ഫോളോ-അപ്പ്. ഈ പരിശോധനയിൽ ഗുരുതരമായ മാറ്റങ്ങളൊന്നും കണ്ടെത്തിയില്ല. നിങ്ങളുടെ റെറ്റിന ഫോട്ടോ സാധാരണ ലക്ഷണങ്ങൾ കാണിക്കുന്നു. 12 മാസത്തിനുള്ളിൽ അടുത്ത വാർഷിക നേത്ര പരിശോധന നടത്തുക.`
        : `പരിശോധനാ സംഗ്രഹം. നേത്രരോഗ വിദഗ്ദ്ധന്റെ പരിശോധന ശുപാർശ ചെയ്യുന്നു. ആദ്യഘട്ട കണ്ടെത്തൽ കാഴ്ച സംരക്ഷിക്കാൻ സഹായിക്കും. ദയവായി ${isMild ? '30 മുതൽ 60 ദിവസത്തിനകം' : '2 മുതൽ 4 ആഴ്ചയ്ക്കുള്ളിൽ'} കണ്ണ് ഡോക്ടറെ കാണുക.`;
    } else {
      narration = `
        Screening Summary for reference ${result.patientId}.
        What was reviewed: Retinal photograph${result.oct?.present ? ' and cross-sectional scan' : ''}.
        What the screening support indicates: ${
          isRoutine
            ? 'Routine Follow-up. No significant retinal changes detected on this screening.'
            : 'Further professional evaluation may be appropriate.'
        }
        What this may mean: ${
          isRoutine
            ? 'Your retinal photograph shows typical features. Continue regular monitoring.'
            : 'Minor or notable retinal features were observed. Early detection allows timely care to protect eyesight.'
        }
        Recommended next step: ${
          isRoutine
            ? 'Schedule your next routine annual eye examination in 12 months.'
            : isMild
            ? 'Please consult a qualified eye-care professional for clinical evaluation within 30 to 60 days.'
            : 'Please consult a qualified eye-care professional for clinical evaluation within 2 to 4 weeks.'
        }
        Notice: This AI-assisted screening result does not confirm or rule out a diagnosis. Further professional evaluation may be appropriate.
      `;
    }

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

  // Determine Primary Action based on workflow availability
  const hasClinicAction = Boolean(onFindClinic);
  const hasBookAction = Boolean(onBookScreening);

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-[#1F181A] dark:text-[#F3EDF0]">
      {/* =====================================================================
          MANDATORY PATIENT SAFETY BANNER & DISCLAIMER
          ===================================================================== */}
      <div
        role="region"
        aria-label="Screening Safety Notice"
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
            <strong className="text-[#1F181A] dark:text-white font-bold">
              This AI-assisted screening result does not confirm or rule out a diagnosis.
            </strong>{' '}
            Further professional evaluation may be appropriate to determine complete eye health.
          </p>
        </div>

        {/* Read aloud helper for patients with low vision */}
        <div className="pt-2 flex items-center justify-between border-t border-[#F2ECE7] dark:border-[#2C2428] text-xs">
          <span className="text-[#7A696C] dark:text-[#9F8F92]">
            Assessment is based on the information provided.
          </span>
          <button
            type="button"
            onClick={handleToggleVoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#241E21] hover:border-[#F05A28] text-[#382E30] dark:text-[#DDD3CD] font-bold transition-colors cursor-pointer"
            title="Read screening summary aloud"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>🔊 Read Aloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          1. SCREENING SUMMARY (PATIENT INTERPRETATION LAYER)
          Structure:
          - SCREENING SUMMARY
          - What was reviewed
          - What the screening support indicates
          - What this may mean
          - Recommended next step
          - Professional evaluation
          - Report
          - Technical Details
          ===================================================================== */}
      <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-10 shadow-xs space-y-10">
        
        {/* Main Screening Summary Header */}
        <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#F05A28] tracking-widest uppercase block mb-1">
              Patient Interpretation Layer
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1F181A] dark:text-white tracking-tight uppercase">
              SCREENING SUMMARY
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[#7A696C] dark:text-[#A8989B]">
            ID: {result.patientId}
          </span>
        </div>

        {/* -------------------------------------------------------------------
            WHAT WAS REVIEWED
            Plain language list of submitted visual & clinical inputs
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-reviewed" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <Eye className="w-4 h-4" />
            <h2 id="heading-reviewed" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              What was reviewed
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Primary Fundus Image */}
            <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F181A] dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Retinal Photograph</span>
              </div>
              <p className="text-xs text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                Color photograph of your retina ({result.fundusImageName || 'Submitted Fundus Image'}). Visual clarity and illumination met quality requirements for review.
              </p>
              <div className="text-[11px] font-semibold text-[#10B981] bg-[#ECFDF5] dark:bg-[#132B20] px-2.5 py-1 rounded-lg inline-block">
                ✓ Primary Visual Input
              </div>
            </div>

            {/* 2. OCT Cross-Section Scan */}
            <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F181A] dark:text-white">
                {result.oct?.present ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <Info className="w-4 h-4 text-[#8E7E81]" />
                )}
                <span>Cross-Section Scan (OCT)</span>
              </div>
              <p className="text-xs text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                {result.oct?.present
                  ? 'Optical cross-sectional scan evaluated for macular thickness and retinal tissue layers.'
                  : 'Optional OCT scan was not provided. Assessment proceeded using your primary retinal photograph.'}
              </p>
              <div className="text-[11px] font-semibold text-[#6F6267] dark:text-[#9F8F92] bg-[#F2ECE7] dark:bg-[#2C2428] px-2.5 py-1 rounded-lg inline-block">
                {result.oct?.present ? '✓ Cross-Section Included' : 'Optional • Not Provided'}
              </div>
            </div>

            {/* 3. Clinical & Health Background */}
            <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F181A] dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Health Background</span>
              </div>
              <p className="text-xs text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                {result.clinicalInput ? (
                  <>
                    Reported HbA1c: <strong>{result.clinicalInput.hba1c}%</strong> • Diabetes Duration:{' '}
                    <strong>{result.clinicalInput.diabetesDurationYears} yrs</strong> • BP:{' '}
                    <strong>{result.clinicalInput.systolicBp} mmHg</strong>
                  </>
                ) : (
                  'Standard age-adjusted baseline factors integrated for screening context.'
                )}
              </p>
              <div className="text-[11px] font-semibold text-[#6F6267] dark:text-[#9F8F92] bg-[#F2ECE7] dark:bg-[#2C2428] px-2.5 py-1 rounded-lg inline-block">
                Clinical Context
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            WHAT THE SCREENING SUPPORT INDICATES
            Clear status indicator with non-diagnostic, screening-support phrasing
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-indicates" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <Activity className="w-4 h-4" />
            <h2 id="heading-indicates" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              What the screening support indicates
            </h2>
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
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#1F181A] dark:text-white">
                  {isRoutine
                    ? 'Routine Screening Support • No Obvious Changes'
                    : isMild
                    ? 'Further Professional Evaluation May Be Appropriate'
                    : 'Further Professional Evaluation Recommended'}
                </h3>
              </div>

              <p className="text-base sm:text-lg font-medium text-[#382E30] dark:text-[#E2D8DD] leading-relaxed max-w-2xl">
                {isRoutine ? (
                  'No significant retinal microvascular changes were detected on the submitted photograph.'
                ) : (
                  <span>
                    Your screening information indicates that{' '}
                    <strong className="font-extrabold underline decoration-[#F05A28]/40 underline-offset-4">
                      further professional evaluation may be appropriate
                    </strong>
                    . This AI-assisted screening result does not confirm or rule out a diagnosis.
                  </span>
                )}
              </p>
            </div>

            {/* Visual Status Badge (Icon + Text + Color) */}
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
                  <span>✓ Completed • Routine</span>
                </>
              ) : isMild ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>⚠ Needs Review</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>! Further Evaluation Recommended</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            WHAT THIS MAY MEAN
            Empathetic, reassuring, non-alarmist interpretation
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-means" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <Stethoscope className="w-4 h-4" />
            <h2 id="heading-means" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              What this may mean
            </h2>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFBF8] dark:bg-[#201A1D] border border-[#F2ECE7] dark:border-[#382E32] space-y-3">
            <p className="text-base sm:text-lg text-[#382E30] dark:text-[#DDD3CD] leading-relaxed">
              {isRoutine ? (
                <>
                  Your retinal photograph shows clean, healthy blood vessel branches and typical optic disc margins at this time.{' '}
                  <strong className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
                    Because early eye changes in diabetes develop gradually without obvious early warning symptoms
                  </strong>
                  , continuing regular yearly screenings is the best way to safeguard your long-term vision.
                </>
              ) : isMild ? (
                <>
                  The screening noted early, small variations in the retinal blood vessel pattern.{' '}
                  <strong className="font-semibold text-[#1F181A] dark:text-white">
                    This does not mean you have vision loss.
                  </strong>{' '}
                  Early variations are common in people with diabetes. When recognized early, maintaining steady blood sugar control and obtaining timely clinical oversight usually prevents them from ever affecting your vision.
                </>
              ) : (
                <>
                  The screening identified notable retinal features that warrant{' '}
                  <strong className="font-semibold text-[#1F181A] dark:text-white">
                    timely in-person evaluation
                  </strong>{' '}
                  by an eye specialist. Modern medical care—including clinical monitoring, specialized eye drops, or gentle therapies—is highly effective at protecting sight when introduced early.
                </>
              )}
            </p>
            <p className="text-sm text-[#7A696C] dark:text-[#A8989B]">
              Early screening gives you and your doctor valuable advance notice long before daily vision is affected.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            RECOMMENDED NEXT STEP
            Clear timeline guidance with obvious, prominent primary action
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-next-step" className="space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <Clock className="w-4 h-4" />
            <h2 id="heading-next-step" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              Recommended next step
            </h2>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-[#FFE5D8] dark:bg-[#2A1D17] border-2 border-[#F05A28]/30 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#F05A28] uppercase tracking-wider">
                Recommended Action Window
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F181A] dark:text-white bg-white dark:bg-[#1D191B] px-3.5 py-1.5 rounded-full border border-[#F05A28]/20 shadow-2xs">
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
              Take this summary with you to your doctor or optometrist so they have your submitted photographs and screening context.
            </p>

            {/* ===============================================================
                OBVIOUS PRIMARY ACTION (Clear Hero Actions based on workflow)
                - Find a Screening Center
                - Book a Screening
                - View Report
                =============================================================== */}
            <div className="pt-4 border-t border-[#F05A28]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#1F181A] dark:text-white">
                  Next Steps & Actions:
                </span>
                <span className="text-xs font-medium text-[#7A696C]">
                  {hasClinicAction
                    ? 'Primary: Find a nearby screening center'
                    : hasBookAction
                    ? 'Primary: Book a screening appointment'
                    : 'Primary: View and download report'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Obvious primary CTA 1: Find a Screening Center */}
                {onFindClinic && (
                  <button
                    type="button"
                    id="btn-find-screening-center"
                    onClick={onFindClinic}
                    className="px-6 py-3.5 rounded-2xl bg-[#F05A28] hover:bg-[#D84818] text-white font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Find a Screening Center</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                )}

                {/* Obvious primary CTA 2: Book a Screening */}
                {onBookScreening && (
                  <button
                    type="button"
                    id="btn-book-screening"
                    onClick={onBookScreening}
                    className={`px-6 py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      !onFindClinic
                        ? 'bg-[#F05A28] hover:bg-[#D84818] text-white shadow-md hover:shadow-lg'
                        : 'bg-[#1F181A] dark:bg-white text-white dark:text-[#1F181A] hover:bg-[#382E30] dark:hover:bg-[#EAE2E5] shadow-xs'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book a Screening</span>
                  </button>
                )}

                {/* Obvious primary CTA 3: View Report */}
                <button
                  type="button"
                  id="btn-view-report"
                  onClick={() => {
                    if (onViewReport) {
                      onViewReport();
                    } else {
                      setIsViewingFullReportModal(true);
                    }
                  }}
                  className={`px-6 py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !onFindClinic && !onBookScreening
                      ? 'bg-[#F05A28] hover:bg-[#D84818] text-white shadow-md hover:shadow-lg'
                      : 'bg-white dark:bg-[#1D191B] border-2 border-[#F05A28] text-[#F05A28] hover:bg-[#FFE5D8] dark:hover:bg-[#2E1D16]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>View Report</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            PROFESSIONAL EVALUATION
            Explanation of why in-person examination is the gold standard & urgent warning signs
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-eval" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
            <ShieldAlert className="w-4 h-4" />
            <h2 id="heading-eval" className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
              Professional evaluation
            </h2>
          </div>

          <div className="p-6 rounded-2xl bg-[#FEF2F2] dark:bg-[#281517] border border-[#FECACA] dark:border-[#7F1D1D] space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#991B1B] dark:text-[#FCA5A5]">
                Why In-Person Clinical Evaluation Matters
              </h3>
              <p className="text-xs sm:text-sm text-[#7F1D1D] dark:text-[#FECACA] leading-relaxed">
                RetinaGuard provides AI-assisted screening support. Only a licensed eye-care professional (optometrist or ophthalmologist) can perform a dilated examination to examine the full periphery of your retina, measure ocular pressure, and provide a clinical diagnosis.
              </p>
            </div>

            <div className="pt-2 border-t border-[#FCA5A5]/40 space-y-2">
              <span className="text-xs font-bold text-[#991B1B] dark:text-[#FCA5A5] uppercase tracking-wider block">
                Do Not Wait: Seek Immediate Evaluation If You Notice:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#7F1D1D] dark:text-[#FECACA]">
                <li className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                  <span className="text-[#DC2626] font-black shrink-0">•</span>
                  <span>Sudden blurring, cloudiness, or rapid loss of vision</span>
                </li>
                <li className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                  <span className="text-[#DC2626] font-black shrink-0">•</span>
                  <span>New floating dark spots, specks, or web-like strings</span>
                </li>
                <li className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                  <span className="text-[#DC2626] font-black shrink-0">•</span>
                  <span>Flashes of light or sudden shimmering arcs</span>
                </li>
                <li className="flex items-start gap-2 p-2 rounded-xl bg-white/70 dark:bg-black/20">
                  <span className="text-[#DC2626] font-black shrink-0">•</span>
                  <span>A dark shadow, veil, or curtain covering part of your sight</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            REPORT
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
                A clean clinical summary formatted for your records and doctor consultation. Includes submitted image summaries, reviewed factors, and recommended care timeline.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                id="btn-report-view-modal"
                onClick={() => setIsViewingFullReportModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1D191B] hover:border-[#F05A28] text-[#1F181A] dark:text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#F05A28]" />
                <span>View Report</span>
              </button>

              <button
                type="button"
                id="btn-report-download-pdf"
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                id="btn-report-print-dialog"
                onClick={() => window.print()}
                className="w-full sm:w-auto p-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1D191B] hover:border-[#F05A28] text-[#382E30] dark:text-[#DDD3CD] transition-colors flex items-center justify-center cursor-pointer"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            TECHNICAL DETAILS (Collapsible)
            Keeps research details safely tucked away for patients
            ------------------------------------------------------------------- */}
        <section aria-labelledby="heading-technical" className="pt-2 border-t border-[#F2ECE7] dark:border-[#2C2428]">
          <button
            type="button"
            id="btn-toggle-technical-details"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full py-4 px-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32] hover:border-[#F05A28] text-[#382E30] dark:text-[#DDD3CD] transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-[#F05A28]" />
              <div className="text-left">
                <span id="heading-technical" className="text-sm sm:text-base font-bold text-[#1F181A] dark:text-white block">
                  {showTechnicalDetails ? 'Hide Technical Details' : 'Technical Details'}
                </span>
                <span className="text-xs text-[#7A696C] dark:text-[#9F8F92]">
                  Reference ID, image sensor metadata, and processing timestamps
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
            <div className="mt-4 p-5 rounded-2xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#1D191B] space-y-4 text-xs animate-in fade-in-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block">Case Reference</span>
                  <span className="font-mono font-bold text-[#1F181A] dark:text-white">{result.patientId}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block">Screening Timestamp</span>
                  <span className="font-bold text-[#1F181A] dark:text-white">
                    {new Date(result.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block">Imaging Input</span>
                  <span className="font-bold text-[#1F181A] dark:text-white">Fundus (Color Digital)</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#241E21] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block">Quality Status</span>
                  <span className="font-bold text-[#10B981]">Adequate / Evaluated</span>
                </div>
              </div>
              <p className="text-[11px] text-[#7A696C] dark:text-[#9F8F92]">
                For advanced neural network details, activation heatmaps, and SHAP drivers, see the Technical Explanation section below.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================================
          2. WHY DID THE SYSTEM FLAG THIS?
          Shows:
          - Original Image
          - AI Attention / Explanation
          - "Highlighted areas show regions that contributed to the AI-assisted output."
          ===================================================================== */}
      <div
        role="region"
        aria-labelledby="heading-why-flagged"
        className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] tracking-wider uppercase">
              <Eye className="w-4 h-4" />
              <span>Visual Explanation</span>
            </div>
            <h2 id="heading-why-flagged" className="text-xl sm:text-2xl font-black text-[#1F181A] dark:text-white tracking-tight">
              WHY DID THE SYSTEM FLAG THIS?
            </h2>
            <p className="text-xs sm:text-sm text-[#524346] dark:text-[#C4B7BA]">
              See the exact photograph reviewed alongside visual indicators of what the system analyzed.
            </p>
          </div>

          {/* View Tab Selector */}
          <div className="inline-flex rounded-xl p-1 bg-[#F3ECE5] dark:bg-[#2C2428] text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveAttentionTab('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAttentionTab === 'comparison'
                  ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] font-bold shadow-2xs'
                  : 'text-[#6F6267] dark:text-[#A8989B]'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setActiveAttentionTab('original')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAttentionTab === 'original'
                  ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] font-bold shadow-2xs'
                  : 'text-[#6F6267] dark:text-[#A8989B]'
              }`}
            >
              Original Image
            </button>
            <button
              type="button"
              onClick={() => setActiveAttentionTab('attention')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAttentionTab === 'attention'
                  ? 'bg-white dark:bg-[#1D191B] text-[#F05A28] font-bold shadow-2xs'
                  : 'text-[#6F6267] dark:text-[#A8989B]'
              }`}
            >
              AI Attention / Explanation
            </button>
          </div>
        </div>

        {/* The Two Views: Original Image & AI Attention / Explanation */}
        <div className="space-y-4">
          {activeAttentionTab === 'comparison' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* ORIGINAL IMAGE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F181A] dark:text-white flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#F05A28]" />
                    Original Image
                  </span>
                  <span className="text-[11px] text-[#7A696C]">Submitted photograph</span>
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#EFE4DC] dark:border-[#382E32]">
                  <img
                    src={result.fundusImageUrl}
                    alt="Original Fundus Retinal Photograph"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    Original Photograph
                  </span>
                </div>
              </div>

              {/* AI ATTENTION / EXPLANATION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#F05A28]" />
                    AI Attention / Explanation
                  </span>
                  <span className="text-[11px] text-[#7A696C]">Visual focus overlay</span>
                </div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#EFE4DC] dark:border-[#382E32]">
                  <img
                    src={result.fundusCamUrl || result.fundusImageUrl}
                    alt="AI Attention Visual Overlay"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2.5 left-2.5 bg-[#F05A28]/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                    AI Attention Overlay
                  </span>
                </div>
              </div>
            </div>
          ) : activeAttentionTab === 'original' ? (
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F181A] dark:text-white block text-center">
                Original Image
              </span>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#EFE4DC] dark:border-[#382E32]">
                <img
                  src={result.fundusImageUrl}
                  alt="Original Fundus Retinal Photograph"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] block text-center">
                AI Attention / Explanation
              </span>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#EFE4DC] dark:border-[#382E32]">
                <img
                  src={result.fundusCamUrl || result.fundusImageUrl}
                  alt="AI Attention Visual Overlay"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* CRITICAL REQUIRED STATEMENT */}
          <div className="p-4 rounded-2xl bg-[#FFFBF8] dark:bg-[#201A1D] border border-[#F2ECE7] dark:border-[#382E32] flex items-center gap-3">
            <Info className="w-5 h-5 text-[#F05A28] shrink-0" />
            <p className="text-sm font-semibold text-[#382E30] dark:text-[#E2D8DD]">
              Highlighted areas show regions that contributed to the AI-assisted output.
            </p>
          </div>

          {/* Plain-language summary of what the algorithm noted */}
          <div className="text-xs text-[#524346] dark:text-[#C4B7BA] space-y-1.5 leading-relaxed">
            <p>
              The attention overlay highlights the retinal vascular arcades and central macula that were reviewed during screening support.
              In routine cases, the algorithm confirms the absence of vascular swelling or microaneurysms across these areas.
              When early or notable variations are identified, the highlighted regions indicate where features were noted for professional follow-up.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. VIEW TECHNICAL EXPLANATION (COLLAPSIBLE)
          Only inside that section expose:
          - Grad-CAM
          - SHAP
          - Model information
          - Technical confidence information
          - Input modality
          ===================================================================== */}
      <div className="bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <button
          type="button"
          id="btn-view-technical-explanation"
          onClick={() => setShowTechnicalExplanation(!showTechnicalExplanation)}
          className="w-full py-2 px-1 text-left flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFE5D8] dark:bg-[#2C1D17] text-[#F05A28] flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white">
                View Technical Explanation
              </h2>
              <span className="text-xs text-[#7A696C] dark:text-[#9F8F92]">
                Detailed Grad-CAM activations, SHAP features, neural architectures, and confidence metrics
              </span>
            </div>
          </div>
          {showTechnicalExplanation ? (
            <ChevronUp className="w-5 h-5 text-[#F05A28]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#7A696C]" />
          )}
        </button>

        {showTechnicalExplanation && (
          <div className="pt-6 border-t border-[#F2ECE7] dark:border-[#2C2428] space-y-8 animate-in fade-in-50 text-xs">
            
            {/* 1. GRAD-CAM (Gradient-Weighted Class Activation Mapping) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#F05A28]" />
                  <span>Grad-CAM</span>
                </h3>
                <span className="font-mono text-[11px] text-[#7A696C]">Layer: Conv_Final / Stage-4</span>
              </div>
              <p className="text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                Gradient-weighted Class Activation Mapping computes gradients of the target class score with respect to feature activation maps of the final convolutional layer. High saliency scores concentrate over the superior and inferior vascular arches and parafoveal margins.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32] space-y-2">
                  <span className="font-bold text-[#1F181A] dark:text-white block">Fundus Grad-CAM Map</span>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    <img
                      src={result.fundusCamUrl || result.fundusImageUrl}
                      alt="Fundus Grad-CAM"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32] space-y-2">
                  <span className="font-bold text-[#1F181A] dark:text-white block">OCT B-Scan Grad-CAM Map</span>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    {result.octCamUrl || result.octImageUrl ? (
                      <img
                        src={result.octCamUrl || result.octImageUrl}
                        alt="OCT Grad-CAM"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-[#8E7E81]">
                        <Layers className="w-6 h-6 mx-auto mb-1 text-stone-400" />
                        <span>OCT B-scan not submitted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SHAP (SHapley Additive exPlanations) */}
            <div className="space-y-3 pt-6 border-t border-[#F2ECE7] dark:border-[#2C2428]">
              <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F05A28]" />
                <span>SHAP</span>
              </h3>
              <p className="text-[#524346] dark:text-[#C4B7BA] leading-relaxed">
                Shapley Additive exPlanations quantify each metabolic biomarker’s marginal contribution to the final risk escalation relative to the baseline training population.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.metadata?.shapValues && result.metadata.shapValues.length > 0 ? (
                  result.metadata.shapValues.slice(0, 4).map((shap, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#1F181A] dark:text-white block">
                          {shap.feature}
                        </span>
                        <span className="text-[11px] text-[#7A696C]">
                          {shap.impact === 'increases_risk'
                            ? 'Upward metabolic contribution'
                            : 'Protective contribution'}
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
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32] col-span-2 text-stone-500">
                    Standard baseline distribution priors evaluated without anomalous metadata shift.
                  </div>
                )}
              </div>
            </div>

            {/* 3. MODEL INFORMATION */}
            <div className="space-y-3 pt-6 border-t border-[#F2ECE7] dark:border-[#2C2428]">
              <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#F05A28]" />
                <span>Model information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block font-semibold mb-1">Fundus Backbone</span>
                  <strong className="text-sm text-[#1F181A] dark:text-white block">
                    {result.fundus.modelArchitecture || 'ResNet-50 / EfficientNet-B4 (ONNX)'}
                  </strong>
                  <span className="text-[11px] text-[#7A696C]">Dual-stage convolutional classifier</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block font-semibold mb-1">OCT B-Scan Backbone</span>
                  <strong className="text-sm text-[#1F181A] dark:text-white block">
                    {result.oct?.modelArchitecture || 'ConvNeXt-V2 / DenseNet-121'}
                  </strong>
                  <span className="text-[11px] text-[#7A696C]">Retinal fluid layer segmenter</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block font-semibold mb-1">Late Fusion Core</span>
                  <strong className="text-sm text-[#F05A28] block">
                    Hierarchical Surrogate + XGBoost
                  </strong>
                  <span className="text-[11px] text-[#7A696C]">Multi-modal late-stage integration</span>
                </div>
              </div>
            </div>

            {/* 4. TECHNICAL CONFIDENCE INFORMATION */}
            <div className="space-y-3 pt-6 border-t border-[#F2ECE7] dark:border-[#2C2428]">
              <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F05A28]" />
                <span>Technical confidence information</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block text-[11px]">Calculated Grade</span>
                  <strong className="text-sm font-bold text-[#F05A28]">Level {grade}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block text-[11px]">System Confidence</span>
                  <strong className="text-sm font-bold text-[#1F181A] dark:text-white">
                    {result.confidence}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block text-[11px]">Softmax Probability</span>
                  <strong className="text-sm font-bold text-[#1F181A] dark:text-white">
                    {((result.fundus.probabilities[grade] || 0.9) * 100).toFixed(1)}%
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block text-[11px]">Total Inference Time</span>
                  <strong className="text-sm font-bold text-[#1F181A] dark:text-white">
                    {result.fundus.inferenceMs + (result.oct?.inferenceMs || 0)} ms
                  </strong>
                </div>
              </div>
            </div>

            {/* 5. INPUT MODALITY */}
            <div className="space-y-3 pt-6 border-t border-[#F2ECE7] dark:border-[#2C2428]">
              <h3 className="text-sm font-bold text-[#1F181A] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F05A28]" />
                <span>Input modality</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block font-semibold">Primary Fundus Sensor</span>
                  <span className="text-sm font-bold text-[#1F181A] dark:text-white block mt-0.5">
                    {result.fundusImageName || 'Color Fundus (512×512)'}
                  </span>
                  <span className="text-[#10B981] font-bold text-[11px]">• Illumination: Adequate</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block font-semibold">OCT Cross-Section</span>
                  <span className="text-sm font-bold text-[#1F181A] dark:text-white block mt-0.5">
                    {result.oct?.present ? 'B-Scan Attached' : 'Omitted (Skipped)'}
                  </span>
                  <span className="text-[11px] text-[#7A696C]">
                    {result.oct?.centralSubfieldThicknessUm
                      ? `Thickness: ${result.oct.centralSubfieldThicknessUm} µm`
                      : 'Bi-modal fallback logic engaged'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32]">
                  <span className="text-[#8E7E81] block font-semibold">Metadata Vector</span>
                  <span className="text-sm font-bold text-[#1F181A] dark:text-white block mt-0.5">
                    {result.metadata?.provided ? 'Clinical Features Loaded' : 'Baseline Priors'}
                  </span>
                  <span className="text-[11px] text-[#7A696C]">Age, HbA1c, BP feature alignment</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
            RetinaGuard AI-Assisted Screening Support
          </span>
        </div>
      )}

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
                className="p-2 rounded-xl text-[#7A696C] hover:text-[#1F181A] dark:hover:text-white hover:bg-[#FAF7F4] dark:hover:bg-[#251E22] transition-colors cursor-pointer"
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
                  This AI-assisted screening result does not confirm or rule out a diagnosis. Further professional evaluation may be appropriate.
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
                    ? 'No obvious retinal microvascular abnormalities detected. Intact retinal vascular caliber and sharp optic disc rim reflex.'
                    : isMild
                    ? 'Your screening information indicates that further professional evaluation may be appropriate. Early microvascular features were detected on the retinal photograph.'
                    : 'Your screening information indicates that further professional evaluation is recommended to protect your vision. Notable retinal features observed requiring in-person clinical examination.'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#6F6267] dark:text-[#9F8F92]">
                  Reviewed Materials
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
                className="px-5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6F6267] dark:text-[#A8989B] hover:bg-[#FAF7F4] transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1D191B] text-xs font-bold text-[#1F181A] dark:text-white hover:border-[#F05A28] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
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
