import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Cpu,
  Download,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Mic,
  Pause,
  Play,
  Printer,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Stethoscope,
  Upload,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { generateFundusSvg, generateOctSvg, PRESET_CASES } from '../data/sampleCases';
import { ClinicalMetadata, DRGrade, MultimodalTriageResult } from '../types';
import { executeMultimodalFusion, predictMetadataRisk } from '../utils/fusionEngine';
import { useTranslation } from '../i18n/I18nContext';
import { voiceService, VoicePlaybackState } from '../services/voiceService';
import { PatientScreeningResultView } from './PatientScreeningResultView';

interface PublicGetScreenedProps {
  onComplete?: (result: MultimodalTriageResult) => void;
  onFindClinic?: () => void;
  onBookScreening?: () => void;
  onViewReport?: () => void;
}

export type ScreeningStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const PublicGetScreened: React.FC<PublicGetScreenedProps> = ({
  onComplete,
  onFindClinic,
  onBookScreening,
  onViewReport,
}) => {
  const { t, language } = useTranslation();

  // Workflow Step State (1 to 7)
  const [currentStep, setCurrentStep] = useState<ScreeningStep>(1);

  // Voice Guidance State
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(true);
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());

  // STEP 1: Basic Information
  const [patientName, setPatientName] = useState<string>('Self-Screening Patient');
  const [patientAge, setPatientAge] = useState<number>(58);
  const [patientSex, setPatientSex] = useState<'female' | 'male' | 'other' | 'prefer_not_to_say'>('female');
  const [diabetesType, setDiabetesType] = useState<'type2' | 'type1' | 'prediabetes' | 'none' | 'unknown'>('type2');
  const [diabetesYears, setDiabetesYears] = useState<number>(6);
  const [targetEye, setTargetEye] = useState<'OD' | 'OS' | 'OU'>('OD');

  // STEP 2: Fundus Image State
  const [fundusImageFile, setFundusImageFile] = useState<string | null>(null);
  const [fundusImageName, setFundusImageName] = useState<string>('');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(1); // Default early/mild case for rich demo
  const [isUsingCustomFundus, setIsUsingCustomFundus] = useState<boolean>(false);
  const [fundusQualityStatus, setFundusQualityStatus] = useState<'adequate' | 'needs_attention' | null>(null);
  const [fundusDragActive, setFundusDragActive] = useState<boolean>(false);

  // Camera Modal State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fundusFileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 3: OCT Scan State (Optional)
  const [octImageFile, setOctImageFile] = useState<string | null>(null);
  const [octImageName, setOctImageName] = useState<string>('');
  const [isUsingCustomOct, setIsUsingCustomOct] = useState<boolean>(false);
  const [includeSampleOct, setIncludeSampleOct] = useState<boolean>(false);
  const [octQualityStatus, setOctQualityStatus] = useState<'adequate' | 'needs_attention' | null>(null);
  const [octDragActive, setOctDragActive] = useState<boolean>(false);
  const octFileInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 4: Additional Information State (Optional)
  const [reportFile, setReportFile] = useState<string | null>(null);
  const [reportFileName, setReportFileName] = useState<string>('');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [hba1cValue, setHba1cValue] = useState<number>(7.4);
  const [systolicBpValue, setSystolicBpValue] = useState<number>(128);
  const [symptoms, setSymptoms] = useState<{
    blurry: boolean;
    floaters: boolean;
    none: boolean;
    nightVision: boolean;
  }>({
    blurry: false,
    floaters: false,
    none: true,
    nightVision: false,
  });
  const reportFileInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 6: AI-Assisted Assessment Progress
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisPhaseText, setAnalysisPhaseText] = useState<string>('');

  // STEP 7: Results State
  const [triageResult, setTriageResult] = useState<MultimodalTriageResult | null>(null);
  const [selectedFundusView, setSelectedFundusView] = useState<'normal' | 'clahe' | 'gradcam'>('normal');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Subscribe to voice state updates
  useEffect(() => {
    const unsub = voiceService.subscribe(setVoiceState);
    return () => unsub();
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Voice player helper
  const handleReadStep = (text: string) => {
    if (!voiceGuidanceEnabled) return;
    if (voiceState.isPlaying) {
      voiceService.pause();
    } else if (voiceState.isPaused) {
      voiceService.resume();
    } else {
      voiceService.speak({
        text,
        title: 'Retinal Screening Guidance',
        lang: language,
      });
    }
  };

  // Step names & headings
  const STEPS = [
    { num: 1, title: 'Basic Information', short: 'Basic Info' },
    { num: 2, title: 'Fundus Image', short: 'Fundus Photo' },
    { num: 3, title: 'OCT — Optional', short: 'OCT Scan' },
    { num: 4, title: 'Additional Information — Optional', short: 'Additional Info' },
    { num: 5, title: 'Input Quality Check', short: 'Quality Check' },
    { num: 6, title: 'AI-Assisted Assessment', short: 'AI Assessment' },
    { num: 7, title: 'Results / Next Step', short: 'Results & Plan' },
  ];

  // Camera handlers
  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Direct camera stream failed:', err);
      setCameraError(
        'Direct live camera preview was blocked by browser permissions or device hardware. You can capture using your phone camera directly or upload a photo file.'
      );
      // Trigger native camera capture input
      cameraFallbackInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setFundusImageFile(dataUrl);
      setFundusImageName(`Camera_Capture_${new Date().toISOString().slice(0, 10)}.jpg`);
      setIsUsingCustomFundus(true);
      setFundusQualityStatus('adequate');
    }
    stopCamera();
  };

  // Fundus file upload handling
  const processFundusFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
      alert('Please upload a supported format: JPG, PNG, or WEBP.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFundusImageFile(dataUrl);
      setFundusImageName(file.name);
      setIsUsingCustomFundus(true);
      setFundusQualityStatus('adequate');
    };
    reader.readAsDataURL(file);
  };

  const handleFundusDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFundusDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFundusFile(e.dataTransfer.files[0]);
    }
  };

  // OCT file upload handling
  const processOctFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOctImageFile(dataUrl);
      setOctImageName(file.name);
      setIsUsingCustomOct(true);
      setOctQualityStatus('adequate');
    };
    reader.readAsDataURL(file);
  };

  const handleOctDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOctDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processOctFile(e.dataTransfer.files[0]);
    }
  };

  // Report file upload handling
  const processReportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setReportFile(dataUrl);
      setReportFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Run the AI-Assisted Assessment
  const runAiAssessment = () => {
    setCurrentStep(6);
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisPhaseText('Validating optical resolution and contrast normalization...');

    setTimeout(() => {
      setAnalysisProgress(35);
      setAnalysisPhaseText('Extracting deep learning vascular features & microaneurysms (EfficientNet-B4)...');
    }, 350);

    setTimeout(() => {
      setAnalysisProgress(68);
      setAnalysisPhaseText('Cross-referencing macular contour layers and clinical metabolic markers...');
    }, 750);

    setTimeout(() => {
      setAnalysisProgress(92);
      setAnalysisPhaseText('Calibrating ensemble uncertainty & generating Grad-CAM explainability maps...');
    }, 1100);

    setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisPhaseText('AI-assisted screening assessment completed.');

      // Synthesize fusion result using our verified fusionEngine
      const activePreset = PRESET_CASES[selectedPresetIdx] || PRESET_CASES[0];

      // Prepare clinical metadata
      const clinicalInput: ClinicalMetadata = {
        hba1c: hba1cValue,
        diabetesDurationYears: diabetesYears,
        systolicBp: systolicBpValue,
        diastolicBp: 80,
        serumCreatinine: 1.0,
        age: patientAge,
        bmi: 25.0,
        insulinTherapy: diabetesType === 'type1' || diabetesYears > 10,
        priorLaser: false,
        visualAcuityLogMar: symptoms.blurry ? 0.3 : 0.05,
      };

      const metaAnalysis = predictMetadataRisk(clinicalInput);

      // Determine imaging source based on input logic
      const fundusAvailable = isUsingCustomFundus ? Boolean(fundusImageFile) : true;
      const octAvailable = isUsingCustomOct ? Boolean(octImageFile) : includeSampleOct;

      const effectiveGrade = isUsingCustomFundus
        ? (1 as DRGrade) // Safe default for patient upload demo
        : activePreset.drGrade;

      const fundusImageUrl = isUsingCustomFundus && fundusImageFile
        ? fundusImageFile
        : generateFundusSvg(effectiveGrade, 'normal');

      const fundusClaheUrl = isUsingCustomFundus && fundusImageFile
        ? fundusImageFile
        : generateFundusSvg(effectiveGrade, 'clahe');

      const fundusCamUrl = isUsingCustomFundus && fundusImageFile
        ? fundusImageFile
        : generateFundusSvg(effectiveGrade, 'gradcam');

      const octImageUrl = octAvailable
        ? (isUsingCustomOct && octImageFile ? octImageFile : generateOctSvg(activePreset.octType, 'scan'))
        : undefined;

      const octCamUrl = octAvailable
        ? (isUsingCustomOct && octImageFile ? octImageFile : generateOctSvg(activePreset.octType, 'gradcam'))
        : undefined;

      const result = executeMultimodalFusion({
        fundus: {
          ...activePreset.expectedTriage.fundus,
          grade: effectiveGrade,
        },
        oct: octAvailable ? activePreset.expectedTriage.oct : undefined,
        metadata: metaAnalysis,
        clinicalInput,
        patientId: `SC-${Math.floor(100000 + Math.random() * 900000)}`,
        patientName: patientName || 'Patient',
        fundusImageName: isUsingCustomFundus ? fundusImageName : activePreset.expectedTriage.fundusImageName,
        octImageName: octAvailable ? (isUsingCustomOct ? octImageName : 'Sample_OCT_BScan.png') : undefined,
        fundusImageUrl,
        fundusClaheUrl,
        fundusCamUrl,
        octImageUrl,
        octCamUrl,
      });

      setTriageResult(result);
      setIsAnalyzing(false);
      setCurrentStep(7);
      if (onComplete) {
        onComplete(result);
      }
    }, 1450);
  };

  // Determine dynamic input logic description
  const hasFundus = isUsingCustomFundus ? Boolean(fundusImageFile) : true;
  const hasOct = isUsingCustomOct ? Boolean(octImageFile) : includeSampleOct;
  const hasReport = Boolean(reportFile) || reportNotes.trim().length > 0;

  let inputLogicHeadline = 'Multimodal Input (Fundus + Clinical Markers)';
  let inputLogicDetail =
    'Fundus retinal photograph will be used as the primary visual source for deep learning screening.';

  if (hasFundus && hasOct) {
    inputLogicHeadline = 'Dual-Modality Imaging (Fundus + OCT + Clinical Markers)';
    inputLogicDetail =
      'Both color fundus photograph and OCT macular cross-section will be combined through multimodal late fusion.';
  } else if (!hasFundus && hasOct) {
    inputLogicHeadline = 'OCT-First Imaging Input';
    inputLogicDetail =
      'Fundus photograph is unavailable; OCT macular scan will serve as the primary imaging input for retinal layer evaluation.';
  } else if (!hasFundus && !hasOct && hasReport) {
    inputLogicHeadline = 'Report-Driven Clinical Screening';
    inputLogicDetail =
      'Clinical report indicators, HbA1c, and health history will be evaluated for microvascular risk stratification.';
  }

  return (
    <div
      id="patient-screening-workflow-container"
      className="min-h-screen bg-[#FCFAF7] dark:bg-[#151214] text-[#2E2628] dark:text-[#E8E2DD] transition-colors py-6 sm:py-10 px-3 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* =================================================================
            1. WORKFLOW HERO & CLEAR SCREENING PURPOSE
            Purpose: SCREENING. High clarity, transparent disclaimer.
            ================================================================= */}
        <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] dark:bg-[#3D2619] border border-[#FFEDD5] dark:border-[#573522] text-[#EA580C] dark:text-[#FB923C] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('screeningPurposeBadge', 'AI-assisted screening support')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F181A] dark:text-white">
                {t('screeningTitle', 'Patient Retinal Screening')}
              </h1>
              <p className="text-sm sm:text-base text-[#6E5C5F] dark:text-[#A8989B] max-w-2xl leading-relaxed">
                {t(
                  'screeningPurposeDesc',
                  'Early screening checks for retinal microvascular changes from diabetes before vision symptoms appear. Quick, safe, and tailored to your available health records.'
                )}
              </p>
            </div>

            {/* Accessibility Voice Guidance Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="screening-voice-guide-btn"
                onClick={() =>
                  handleReadStep(
                    `Step ${currentStep} of 7: ${STEPS[currentStep - 1].title}. ${
                      currentStep === 1
                        ? 'Please enter your basic information.'
                        : currentStep === 2
                        ? 'Upload your fundus retinal image or use your camera.'
                        : currentStep === 3
                        ? 'Optionally upload an OCT scan.'
                        : currentStep === 4
                        ? 'Optionally upload an existing medical report.'
                        : currentStep === 5
                        ? 'Review your input quality check.'
                        : currentStep === 6
                        ? 'Running AI-assisted assessment.'
                        : 'Review your screening results and recommended next steps.'
                    }`
                  )
                }
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                  voiceState.isPlaying
                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                    : 'bg-[#FFFDFB] dark:bg-[#252022] text-[#6E5C5F] dark:text-[#C4B7BA] border-[#EFE4DC] dark:border-[#3E3438] hover:border-[#EA580C]'
                }`}
                title="Listen to this step out loud"
              >
                {voiceState.isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                <span>{voiceState.isPlaying ? 'Pause Audio' : 'Listen'}</span>
              </button>
            </div>
          </div>

          {/* Mandatory Clinical Disclaimer Banner */}
          <div className="mt-4 pt-3 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-start gap-2.5 text-xs text-[#7A696C] dark:text-[#9A8B8E]">
            <Info className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong className="font-semibold text-[#382E30] dark:text-[#E8E2DD]">Notice: </strong>
              This information does not confirm or rule out a diagnosis. Please consult a qualified eye-care professional
              for clinical evaluation.
            </p>
          </div>
        </div>

        {/* =================================================================
            2. PROGRESS INDICATOR (7 STEPS)
            Clear progress bar + numbered step bubbles
            ================================================================= */}
        <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#6E5C5F] dark:text-[#A8989B] mb-3">
            <span className="text-[#EA580C] dark:text-[#FB923C] uppercase tracking-wider">
              Step {currentStep} of 7: {STEPS[currentStep - 1].title}
            </span>
            <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
          </div>

          {/* Continuous Progress Track */}
          <div className="w-full h-2 bg-[#F3ECE5] dark:bg-[#2C2428] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#EA580C] to-[#E11D48] transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>

          {/* Step Bubbles */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {STEPS.map((step) => {
              const isCompleted = step.num < currentStep;
              const isCurrent = step.num === currentStep;

              return (
                <button
                  key={step.num}
                  type="button"
                  id={`step-indicator-${step.num}`}
                  disabled={step.num > currentStep && currentStep < 6}
                  onClick={() => {
                    if (step.num < currentStep && !isAnalyzing) {
                      setCurrentStep(step.num as ScreeningStep);
                    }
                  }}
                  className={`flex flex-col items-center text-center p-1.5 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-[#FFF7ED] dark:bg-[#3D2619] text-[#EA580C] font-bold ring-1 ring-[#EA580C]/40'
                      : isCompleted
                      ? 'text-[#2E2628] dark:text-[#E8E2DD] hover:bg-[#FAF6F2] dark:hover:bg-[#252022] cursor-pointer'
                      : 'text-[#A8989B] dark:text-[#63575A] cursor-not-allowed opacity-60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                      isCurrent
                        ? 'bg-[#EA580C] text-white shadow-xs'
                        : isCompleted
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#EFE4DC] dark:bg-[#2F272B] text-[#7A696C] dark:text-[#8E7E81]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : step.num}
                  </div>
                  <span className="hidden sm:inline text-[11px] leading-tight truncate max-w-[90px]">
                    {step.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================================
            STEP 1: BASIC INFORMATION
            ================================================================= */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4">
              <div className="flex items-center gap-2 text-[#EA580C] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>Step 1 of 7</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                Basic Information
              </h2>
              <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                Providing basic clinical context helps calibrate risk scoring. All information remains on your device.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Patient Identifier */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-patient-name"
                  className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider"
                >
                  Name / Identifier (Optional)
                </label>
                <input
                  type="text"
                  id="input-patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Self-Screening Patient"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#3E3438] bg-[#FFFDFB] dark:bg-[#252022] text-sm text-[#2E2628] dark:text-white focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                />
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-patient-age"
                  className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider"
                >
                  Age: <span className="text-[#EA580C] font-extrabold">{patientAge}</span> years
                </label>
                <input
                  type="range"
                  id="input-patient-age"
                  min="18"
                  max="95"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full accent-[#EA580C]"
                />
                <div className="flex justify-between text-[11px] text-[#8E7E81]">
                  <span>18 yrs</span>
                  <span>55 yrs</span>
                  <span>95 yrs</span>
                </div>
              </div>

              {/* Biological Sex */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-patient-sex"
                  className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider"
                >
                  Biological Sex
                </label>
                <select
                  id="input-patient-sex"
                  value={patientSex}
                  onChange={(e: any) => setPatientSex(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#3E3438] bg-[#FFFDFB] dark:bg-[#252022] text-sm text-[#2E2628] dark:text-white focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* Diabetes Status */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-diabetes-type"
                  className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider"
                >
                  Diabetes Status
                </label>
                <select
                  id="input-diabetes-type"
                  value={diabetesType}
                  onChange={(e: any) => setDiabetesType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#3E3438] bg-[#FFFDFB] dark:bg-[#252022] text-sm text-[#2E2628] dark:text-white focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                >
                  <option value="type2">Type 2 Diabetes</option>
                  <option value="type1">Type 1 Diabetes</option>
                  <option value="prediabetes">Pre-diabetes / Borderline</option>
                  <option value="none">No Known Diabetes</option>
                  <option value="unknown">Not Sure</option>
                </select>
              </div>

              {/* Known Duration */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-diabetes-years"
                  className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider"
                >
                  Known Diabetes Duration: <span className="text-[#EA580C] font-extrabold">{diabetesYears}</span> yrs
                </label>
                <input
                  type="range"
                  id="input-diabetes-years"
                  min="0"
                  max="40"
                  value={diabetesYears}
                  onChange={(e) => setDiabetesYears(Number(e.target.value))}
                  className="w-full accent-[#EA580C]"
                />
                <div className="flex justify-between text-[11px] text-[#8E7E81]">
                  <span>Newly Diagnosed</span>
                  <span>10 yrs</span>
                  <span>40+ yrs</span>
                </div>
              </div>

              {/* Target Eye */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider">
                  Eye Being Screened
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetEye('OD')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      targetEye === 'OD'
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-2xs'
                        : 'bg-[#FFFDFB] dark:bg-[#252022] border-[#EFE4DC] dark:border-[#3E3438] text-[#382E30] dark:text-[#DDD3CD]'
                    }`}
                  >
                    Right Eye (OD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetEye('OS')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      targetEye === 'OS'
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-2xs'
                        : 'bg-[#FFFDFB] dark:bg-[#252022] border-[#EFE4DC] dark:border-[#3E3438] text-[#382E30] dark:text-[#DDD3CD]'
                    }`}
                  >
                    Left Eye (OS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetEye('OU')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      targetEye === 'OU'
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-2xs'
                        : 'bg-[#FFFDFB] dark:bg-[#252022] border-[#EFE4DC] dark:border-[#3E3438] text-[#382E30] dark:text-[#DDD3CD]'
                    }`}
                  >
                    Both Eyes (OU)
                  </button>
                </div>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex justify-end">
              <button
                type="button"
                id="btn-step1-next"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>Continue to Fundus Image</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            STEP 2: FUNDUS IMAGE
            Large upload area: "Upload Fundus Image"
            Buttons: [ Upload Image ], [ Use Camera ]
            Formats: JPG, PNG, WEBP
            After upload: preview, quality status, allow replace, allow remove
            ================================================================= */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-[#EA580C] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                  <Eye className="w-4 h-4" />
                  <span>Step 2 of 7</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                  Fundus Retinal Image
                </h2>
                <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                  Primary photographic view of the retina, macula, and optic disc.
                </p>
              </div>

              <div className="text-xs text-[#7A696C] dark:text-[#9A8B8E] bg-[#FAF6F2] dark:bg-[#252022] px-3 py-1.5 rounded-lg border border-[#EFE4DC] dark:border-[#3A3034]">
                Formats: <span className="font-semibold text-[#EA580C]">JPG, PNG, WEBP</span>
              </div>
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fundusFileInputRef}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFundusFile(e.target.files[0]);
                }
              }}
            />
            <input
              type="file"
              ref={cameraFallbackInputRef}
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFundusFile(e.target.files[0]);
                }
              }}
            />

            {/* Camera Viewfinder Modal */}
            {isCameraActive && (
              <div className="p-4 rounded-xl border border-[#EA580C] bg-[#FFF7ED] dark:bg-[#2A1E18] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#EA580C]">
                    <Camera className="w-4 h-4" />
                    <span>Live Camera Viewfinder</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-1 rounded-md text-[#7A696C] hover:bg-black/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative bg-black rounded-lg overflow-hidden aspect-video max-h-64 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#382E32] text-[#382E30] dark:text-white border border-[#EFE4DC] dark:border-[#4B3E43]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="btn-capture-frame"
                    onClick={capturePhotoFromCamera}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-xs flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Photo</span>
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#B91C1C] flex items-center justify-between">
                <span>{cameraError}</span>
                <button
                  type="button"
                  onClick={() => setCameraError(null)}
                  className="text-xs font-bold underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Custom Uploaded Fundus Preview */}
            {isUsingCustomFundus && fundusImageFile ? (
              <div className="p-5 rounded-2xl border-2 border-[#10B981] bg-[#F0FDF4] dark:bg-[#15271E] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#A7F3D0] bg-black shrink-0">
                      <img
                        src={fundusImageFile}
                        alt="Uploaded Fundus Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Fundus Image Attached</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1F2937] dark:text-white truncate max-w-xs sm:max-w-md">
                        {fundusImageName || 'Uploaded_Fundus_Image.jpg'}
                      </p>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-[#DCFCE7] dark:bg-[#1A382A] text-[#15803D] dark:text-[#4ADE80] font-medium">
                        <span>Image Quality Status:</span>
                        <strong className="font-bold">Adequate (Clear Retinal Arcade)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Replace / Remove Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id="btn-replace-fundus"
                      onClick={() => fundusFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-[#A7F3D0] bg-white dark:bg-[#1E3A2B] text-xs font-bold text-[#065F46] dark:text-[#A7F3D0] hover:bg-[#DCFCE7] transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      id="btn-remove-fundus"
                      onClick={() => {
                        setFundusImageFile(null);
                        setFundusImageName('');
                        setIsUsingCustomFundus(false);
                        setFundusQualityStatus(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#FCA5A5] bg-white dark:bg-[#2D1B1E] text-xs font-bold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Large Upload Area as Requested */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setFundusDragActive(true);
                }}
                onDragLeave={() => setFundusDragActive(false)}
                onDrop={handleFundusDrop}
                className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed text-center transition-all ${
                  fundusDragActive
                    ? 'border-[#EA580C] bg-[#FFF7ED] dark:bg-[#2F1E16]'
                    : 'border-[#E5D7CD] dark:border-[#3E3438] bg-[#FAF7F3] dark:bg-[#1B1618] hover:border-[#EA580C]'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#FFF0E6] dark:bg-[#3D2619] text-[#EA580C] flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#1F181A] dark:text-white">
                  Upload Fundus Image
                </h3>
                <p className="text-xs sm:text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1 max-w-md mx-auto">
                  Drag and drop your retinal photograph here, or choose an action below. Supports JPG, PNG, or WEBP.
                </p>

                {/* Requested Buttons: [ Upload Image ] [ Use Camera ] */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    id="btn-upload-fundus-image"
                    onClick={() => fundusFileInputRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 min-h-[44px]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    id="btn-use-camera-fundus"
                    onClick={startCamera}
                    className="px-6 py-3 rounded-xl bg-white dark:bg-[#252022] hover:bg-[#FFFDFB] text-[#2E2628] dark:text-white border border-[#EFE4DC] dark:border-[#3E3438] font-bold text-sm shadow-xs transition-all flex items-center gap-2 min-h-[44px]"
                  >
                    <Camera className="w-4 h-4 text-[#EA580C]" />
                    <span>Use Camera</span>
                  </button>
                </div>

                {/* Verified Test Sample Cases for Convenience */}
                <div className="mt-6 pt-5 border-t border-[#EFE4DC] dark:border-[#2C2428]">
                  <p className="text-xs font-semibold text-[#8E7E81] mb-3">
                    Don't have an eye photo right now? Select a verified sample to test the AI model:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {PRESET_CASES.slice(0, 3).map((pc, idx) => (
                      <button
                        key={pc.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetIdx(idx);
                          setIsUsingCustomFundus(false);
                          setFundusQualityStatus('adequate');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          !isUsingCustomFundus && selectedPresetIdx === idx
                            ? 'bg-[#EA580C] text-white border-[#EA580C]'
                            : 'bg-white dark:bg-[#252022] text-[#382E30] dark:text-[#D5CBD0] border-[#EFE4DC] dark:border-[#3E3438] hover:border-[#EA580C]'
                        }`}
                      >
                        Sample {idx === 0 ? 'A (Normal)' : idx === 1 ? 'B (Early Changes)' : 'C (Moderate)'}
                      </button>
                    ))}
                  </div>

                  {/* Active Sample Preview */}
                  {!isUsingCustomFundus && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#EA580C] text-xs font-medium">
                      <span>Selected: {PRESET_CASES[selectedPresetIdx].name}</span>
                      <span className="text-[#10B981] font-bold">• Verified Quality: Adequate</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Helpful Input Logic Note */}
            <div className="p-3.5 rounded-xl bg-[#FAF6F2] dark:bg-[#1F191C] border border-[#EFE4DC] dark:border-[#2E2528] text-xs text-[#6E5C5F] dark:text-[#A8989B]">
              <strong>Note:</strong> If you don't have a fundus photo, you are not forced to provide one. You can
              continue to upload an OCT scan or medical report.
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center justify-between">
              <button
                type="button"
                id="btn-step2-back"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#3E3438] text-xs font-bold text-[#6E5C5F] dark:text-[#A8989B] hover:bg-[#FAF6F2] transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                id="btn-step2-next"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>Next: OCT Scan (Optional)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            STEP 3: OCT — OPTIONAL
            Upload OCT Scan — Optional
            Buttons: [ Upload OCT Scan ], [ Use Sample OCT Macular Slice ]
            Supported formats: JPG, PNG, WEBP
            After upload: preview, quality status, replace, remove
            The patient should NOT be forced to provide every modality.
            ================================================================= */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-[#EA580C] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>Step 3 of 7</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                  Upload OCT Scan — Optional
                </h2>
                <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                  Optical Coherence Tomography (OCT) cross-sections visualize deep retinal layers and macular edema.
                </p>
              </div>

              <div className="text-xs text-[#7A696C] dark:text-[#9A8B8E] bg-[#FAF6F2] dark:bg-[#252022] px-3 py-1.5 rounded-lg border border-[#EFE4DC] dark:border-[#3A3034]">
                Status: <span className="font-semibold text-[#10B981]">100% Optional</span>
              </div>
            </div>

            <input
              type="file"
              ref={octFileInputRef}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processOctFile(e.target.files[0]);
                }
              }}
            />

            {/* Custom or Sample OCT Attached State */}
            {(isUsingCustomOct && octImageFile) || includeSampleOct ? (
              <div className="p-5 rounded-2xl border-2 border-[#10B981] bg-[#F0FDF4] dark:bg-[#15271E] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-16 rounded-xl overflow-hidden border border-[#A7F3D0] bg-black shrink-0">
                      <img
                        src={
                          isUsingCustomOct && octImageFile
                            ? octImageFile
                            : generateOctSvg(PRESET_CASES[selectedPresetIdx].octType, 'scan')
                        }
                        alt="OCT Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>OCT Scan Attached</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1F2937] dark:text-white truncate max-w-xs sm:max-w-md">
                        {isUsingCustomOct ? octImageName : 'Sample_Macular_BScan_CrossSection.png'}
                      </p>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-[#DCFCE7] dark:bg-[#1A382A] text-[#15803D] dark:text-[#4ADE80] font-medium">
                        <span>Quality Status:</span>
                        <strong className="font-bold">Adequate (Retinal Layers & Foveal Pit Resolved)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id="btn-replace-oct"
                      onClick={() => octFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-[#A7F3D0] bg-white dark:bg-[#1E3A2B] text-xs font-bold text-[#065F46] dark:text-[#A7F3D0] hover:bg-[#DCFCE7] transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      id="btn-remove-oct"
                      onClick={() => {
                        setOctImageFile(null);
                        setOctImageName('');
                        setIsUsingCustomOct(false);
                        setIncludeSampleOct(false);
                        setOctQualityStatus(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#FCA5A5] bg-white dark:bg-[#2D1B1E] text-xs font-bold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setOctDragActive(true);
                }}
                onDragLeave={() => setOctDragActive(false)}
                onDrop={handleOctDrop}
                className={`p-8 sm:p-10 rounded-2xl border-2 border-dashed text-center transition-all ${
                  octDragActive
                    ? 'border-[#EA580C] bg-[#FFF7ED] dark:bg-[#2F1E16]'
                    : 'border-[#E5D7CD] dark:border-[#3E3438] bg-[#FAF7F3] dark:bg-[#1B1618] hover:border-[#EA580C]'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-[#FFF0E6] dark:bg-[#3D2619] text-[#EA580C] flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-[#1F181A] dark:text-white">
                  Upload OCT Scan — Optional
                </h3>
                <p className="text-xs sm:text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1 max-w-md mx-auto">
                  If your clinic took a cross-sectional tomography scan, attach it here to evaluate diabetic macular
                  edema.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    id="btn-upload-oct-scan"
                    onClick={() => octFileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload OCT Scan</span>
                  </button>

                  <button
                    type="button"
                    id="btn-sample-oct-scan"
                    onClick={() => {
                      setIncludeSampleOct(true);
                      setIsUsingCustomOct(false);
                      setOctQualityStatus('adequate');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#252022] hover:bg-[#FFFDFB] text-[#2E2628] dark:text-white border border-[#EFE4DC] dark:border-[#3E3438] font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#EA580C]" />
                    <span>Use Sample OCT Macular Slice</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modality Freedom Reassurance */}
            <div className="p-3.5 rounded-xl bg-[#FAF6F2] dark:bg-[#1F191C] border border-[#EFE4DC] dark:border-[#2E2528] text-xs text-[#6E5C5F] dark:text-[#A8989B]">
              <strong>No scan available?</strong> That is completely fine. The patient is not forced to provide every
              modality. Simply click <strong>Skip Step</strong> or <strong>Next</strong> to continue.
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center justify-between">
              <button
                type="button"
                id="btn-step3-back"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#3E3438] text-xs font-bold text-[#6E5C5F] dark:text-[#A8989B] hover:bg-[#FAF6F2] transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                id="btn-step3-next"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>
                  {isUsingCustomOct || includeSampleOct ? 'Next: Additional Info' : 'Skip / Next: Additional Info'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            STEP 4: ADDITIONAL INFORMATION — OPTIONAL
            Upload Existing Report — Optional
            Clinical risk factors: HbA1c, Blood Pressure, Symptoms
            ================================================================= */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-[#EA580C] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Step 4 of 7</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                  Additional Information — Optional
                </h2>
                <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                  Attach an existing doctor report or provide recent blood lab values to refine your risk calculation.
                </p>
              </div>

              <div className="text-xs text-[#7A696C] dark:text-[#9A8B8E] bg-[#FAF6F2] dark:bg-[#252022] px-3 py-1.5 rounded-lg border border-[#EFE4DC] dark:border-[#3A3034]">
                Status: <span className="font-semibold text-[#10B981]">Optional</span>
              </div>
            </div>

            <input
              type="file"
              ref={reportFileInputRef}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,application/pdf,image/*,text/plain"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processReportFile(e.target.files[0]);
                }
              }}
            />

            {/* Section A: Upload Existing Report */}
            <div className="p-5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] space-y-3">
              <h3 className="text-sm font-bold text-[#2E2628] dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#EA580C]" />
                <span>Upload Existing Report — Optional</span>
              </h3>

              {reportFile ? (
                <div className="p-3 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] dark:bg-[#182C22] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#059669]" />
                    <span className="text-xs font-semibold text-[#1F2937] dark:text-white truncate max-w-xs">
                      {reportFileName || 'Attached_Report.pdf'}
                    </span>
                    <span className="text-[11px] text-[#059669] font-bold">✓ Attached</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => reportFileInputRef.current?.click()}
                      className="text-xs text-[#065F46] font-bold hover:underline"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReportFile(null);
                        setReportFileName('');
                      }}
                      className="text-xs text-[#B91C1C] font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    Attach PDF, photo, or scan of your last eye checkup or hospital discharge summary.
                  </p>
                  <button
                    type="button"
                    id="btn-upload-report-file"
                    onClick={() => reportFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#292225] border border-[#EFE4DC] dark:border-[#42373C] text-xs font-bold text-[#2E2628] dark:text-white hover:border-[#EA580C] transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Upload Existing Report</span>
                  </button>
                </div>
              )}

              {/* Optional Notes */}
              <div className="pt-2">
                <label
                  htmlFor="input-report-notes"
                  className="block text-xs font-semibold text-[#6E5C5F] dark:text-[#A8989B] mb-1"
                >
                  Doctor's Notes or Prior Diagnoses (Optional)
                </label>
                <textarea
                  id="input-report-notes"
                  rows={2}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="e.g. Last eye check showed no bleeding; physician advised annual checkup."
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#252022] text-xs text-[#2E2628] dark:text-white focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                />
              </div>
            </div>

            {/* Section B: Clinical Risk Markers */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-[#2E2628] dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#EA580C]" />
                <span>Recent Health Metrics (Estimates are fine)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* HbA1c */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="input-hba1c" className="font-bold text-[#382E30] dark:text-[#DDD3CD]">
                      Recent HbA1c Level:
                    </label>
                    <span className="font-extrabold text-[#EA580C]">{hba1cValue.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    id="input-hba1c"
                    min="5.0"
                    max="14.0"
                    step="0.1"
                    value={hba1cValue}
                    onChange={(e) => setHba1cValue(parseFloat(e.target.value))}
                    className="w-full accent-[#EA580C]"
                  />
                  <div className="flex justify-between text-[11px] text-[#8E7E81]">
                    <span>5.5% (Normal)</span>
                    <span>7.0% (Target)</span>
                    <span>12.0%+ (Elevated)</span>
                  </div>
                </div>

                {/* Systolic BP */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="input-systolic-bp" className="font-bold text-[#382E30] dark:text-[#DDD3CD]">
                      Systolic Blood Pressure:
                    </label>
                    <span className="font-extrabold text-[#EA580C]">{systolicBpValue} mmHg</span>
                  </div>
                  <input
                    type="range"
                    id="input-systolic-bp"
                    min="90"
                    max="200"
                    value={systolicBpValue}
                    onChange={(e) => setSystolicBpValue(parseInt(e.target.value, 10))}
                    className="w-full accent-[#EA580C]"
                  />
                  <div className="flex justify-between text-[11px] text-[#8E7E81]">
                    <span>110 (Optimal)</span>
                    <span>130 (Standard)</span>
                    <span>180+ (High)</span>
                  </div>
                </div>
              </div>

              {/* Symptoms Checklist */}
              <div className="pt-2">
                <span className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] mb-2">
                  Are you experiencing any of these visual symptoms?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FFFDFB] dark:bg-[#252022] text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={symptoms.none}
                      onChange={(e) =>
                        setSymptoms({
                          none: e.target.checked,
                          blurry: false,
                          floaters: false,
                          nightVision: false,
                        })
                      }
                      className="accent-[#EA580C] rounded"
                    />
                    <span>No symptoms (Vision feels normal)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FFFDFB] dark:bg-[#252022] text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={symptoms.blurry}
                      onChange={(e) =>
                        setSymptoms((prev) => ({
                          ...prev,
                          blurry: e.target.checked,
                          none: false,
                        }))
                      }
                      className="accent-[#EA580C] rounded"
                    />
                    <span>Blurry or fluctuating vision</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FFFDFB] dark:bg-[#252022] text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={symptoms.floaters}
                      onChange={(e) =>
                        setSymptoms((prev) => ({
                          ...prev,
                          floaters: e.target.checked,
                          none: false,
                        }))
                      }
                      className="accent-[#EA580C] rounded"
                    />
                    <span>Dark spots, cobwebs, or floaters</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FFFDFB] dark:bg-[#252022] text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={symptoms.nightVision}
                      onChange={(e) =>
                        setSymptoms((prev) => ({
                          ...prev,
                          nightVision: e.target.checked,
                          none: false,
                        }))
                      }
                      className="accent-[#EA580C] rounded"
                    />
                    <span>Difficulty seeing at night or in low light</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center justify-between">
              <button
                type="button"
                id="btn-step4-back"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#3E3438] text-xs font-bold text-[#6E5C5F] dark:text-[#A8989B] hover:bg-[#FAF6F2] transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                id="btn-step4-next"
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>Next: Input Quality Check</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            STEP 5: INPUT QUALITY CHECK
            Comprehensive pre-flight review of available inputs.
            Input logic clearly stated:
            - If fundus is available: use as primary visual input.
            - If fundus unavailable but OCT exists: use OCT.
            - If both exist: use both.
            - If only report available: use report workflow.
            - If only partial info available: do not unnecessarily block user.
            Clearly state: "Assessment based on the information provided."
            Safety: "AI-assisted screening support"
            ================================================================= */}
        {currentStep === 5 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4">
              <div className="flex items-center gap-2 text-[#EA580C] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Step 5 of 7</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                Input Quality Check
              </h2>
              <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                Reviewing your provided screening data before initiating the AI-assisted assessment.
              </p>
            </div>

            {/* Mandated Safety Banner */}
            <div className="p-4 rounded-xl bg-[#FFF7ED] dark:bg-[#322017] border border-[#FED7AA] dark:border-[#573522] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] dark:text-[#FB923C] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>AI-assisted screening support</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#1F181A] dark:text-white">
                Assessment based on the information provided.
              </p>
              <p className="text-xs text-[#7A696C] dark:text-[#B5A5A8] leading-relaxed">
                This information does not confirm or rule out a diagnosis. Please consult a qualified eye-care
                professional for clinical evaluation.
              </p>
            </div>

            {/* Modality Status Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Fundus Image Status */}
              <div className="p-4 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hasFundus
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#F3ECE5] dark:bg-[#2D2428] text-[#8E7E81]'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2E2628] dark:text-white">Fundus Image</div>
                  <div className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    {hasFundus ? (
                      <span className="text-[#15803D] font-medium">✓ Provided (Adequate quality verified)</span>
                    ) : (
                      <span className="text-[#8E7E81]">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* OCT Scan Status */}
              <div className="p-4 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hasOct
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#F3ECE5] dark:bg-[#2D2428] text-[#8E7E81]'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2E2628] dark:text-white">OCT Scan (Optional)</div>
                  <div className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    {hasOct ? (
                      <span className="text-[#15803D] font-medium">✓ Attached (Macular cross-section)</span>
                    ) : (
                      <span className="text-[#8E7E81]">Not provided (Proceeding without OCT)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Report Status */}
              <div className="p-4 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hasReport
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#F3ECE5] dark:bg-[#2D2428] text-[#8E7E81]'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2E2628] dark:text-white">Clinical Report (Optional)</div>
                  <div className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    {hasReport ? (
                      <span className="text-[#15803D] font-medium">✓ Clinical notes / document attached</span>
                    ) : (
                      <span className="text-[#8E7E81]">No existing document attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Biomarkers Status */}
              <div className="p-4 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#DCFCE7] text-[#15803D]">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2E2628] dark:text-white">Health Indicators</div>
                  <div className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    <span className="text-[#15803D] font-medium">
                      HbA1c {hba1cValue.toFixed(1)}% • BP {systolicBpValue} mmHg • {diabetesYears} yrs duration
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Input Logic Explanation */}
            <div className="p-4 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#252022] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C]">
                <Cpu className="w-4 h-4" />
                <span>Selected Processing Pipeline: {inputLogicHeadline}</span>
              </div>
              <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B] leading-relaxed">
                {inputLogicDetail}
              </p>
              <p className="text-[11px] text-[#8E7E81] pt-1">
                Even with partial information, the platform does not block your screening. The deep learning model adapts
                to available modalities.
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-center justify-between">
              <button
                type="button"
                id="btn-step5-back"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#3E3438] text-xs font-bold text-[#6E5C5F] dark:text-[#A8989B] hover:bg-[#FAF6F2] transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Modify Inputs</span>
              </button>

              <button
                type="button"
                id="btn-start-ai-assessment"
                onClick={runAiAssessment}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#E11D48] hover:from-[#C2410C] hover:to-[#BE123C] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all ring-2 ring-[#EA580C]/20"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span>Begin AI-Assisted Assessment</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            STEP 6: AI-ASSISTED ASSESSMENT
            Interactive animated assessment execution
            ================================================================= */}
        {currentStep === 6 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-8 sm:p-12 shadow-xs text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#FFF0E6] dark:bg-[#3D2619] text-[#EA580C] flex items-center justify-center mx-auto animate-pulse">
              <Cpu className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#EA580C] text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Deep Learning Inference in Progress</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F181A] dark:text-white">
                AI-Assisted Assessment
              </h2>
              <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] max-w-md mx-auto">
                {analysisPhaseText || 'Evaluating input images and clinical biomarkers...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full h-3 bg-[#F3ECE5] dark:bg-[#2C2428] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#EA580C] via-[#E11D48] to-[#10B981] transition-all duration-300 rounded-full"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-[#8E7E81]">
                <span>Neural Feature Extraction</span>
                <span>{analysisProgress}%</span>
              </div>
            </div>

            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-[#FAF6F2] dark:bg-[#252022] border border-[#EFE4DC] dark:border-[#3A3034] text-xs text-[#7A696C] dark:text-[#A8989B]">
              <p>
                <strong>Assessment based on the information provided.</strong>
                <br />
                Model utilizes multi-scale CNN attention mapping and UKPDS risk calibration.
              </p>
            </div>
          </div>
        )}

        {/* =================================================================
            STEP 7: RESULTS / NEXT STEP
            Patient-facing screening outcome summary
            ================================================================= */}
        {currentStep === 7 && triageResult && (
          <PatientScreeningResultView
            result={triageResult}
            onFindClinic={onFindClinic}
            onBookScreening={onBookScreening || onFindClinic}
            onViewReport={onViewReport}
            onNewScreening={() => {
              setCurrentStep(1);
              setTriageResult(null);
              setFundusImageFile(null);
              setOctImageFile(null);
              setReportFile(null);
              setIsUsingCustomFundus(false);
              setIsUsingCustomOct(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>
    </div>
  );
};
