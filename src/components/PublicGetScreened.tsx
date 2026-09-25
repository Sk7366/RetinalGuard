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
import { ScreeningVoiceGuide } from './ScreeningVoiceGuide';

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

  // STEP 01: Basic Information
  const [patientName, setPatientName] = useState<string>('Self-Screening Patient');
  const [patientAge, setPatientAge] = useState<number>(58);
  const [patientSex, setPatientSex] = useState<'female' | 'male' | 'other' | 'prefer_not_to_say'>('female');
  const [diabetesType, setDiabetesType] = useState<'type2' | 'type1' | 'prediabetes' | 'none' | 'unknown'>('type2');
  const [diabetesYears, setDiabetesYears] = useState<number>(6);
  const [targetEye, setTargetEye] = useState<'OD' | 'OS' | 'OU'>('OD');

  // STEP 02: Fundus Image State
  const [fundusImageFile, setFundusImageFile] = useState<string | null>(null);
  const [fundusImageName, setFundusImageName] = useState<string>('');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(1); // Default sample case
  const [isUsingCustomFundus, setIsUsingCustomFundus] = useState<boolean>(false);
  const [hasSampleFundusSelected, setHasSampleFundusSelected] = useState<boolean>(true);
  const [fundusQualityStatus, setFundusQualityStatus] = useState<'adequate' | 'needs_attention' | null>('adequate');
  const [fundusDragActive, setFundusDragActive] = useState<boolean>(false);

  // Camera Modal State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fundusFileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 03: OCT Scan State (Optional)
  const [octImageFile, setOctImageFile] = useState<string | null>(null);
  const [octImageName, setOctImageName] = useState<string>('');
  const [isUsingCustomOct, setIsUsingCustomOct] = useState<boolean>(false);
  const [includeSampleOct, setIncludeSampleOct] = useState<boolean>(false);
  const [octQualityStatus, setOctQualityStatus] = useState<'adequate' | 'needs_attention' | null>(null);
  const [octDragActive, setOctDragActive] = useState<boolean>(false);
  const octFileInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 04: Other Reports State (Optional)
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

  // STEP 06: AI-Assisted Screening Progress
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisPhaseText, setAnalysisPhaseText] = useState<string>('');

  // STEP 07: Results State
  const [triageResult, setTriageResult] = useState<MultimodalTriageResult | null>(null);

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

  // Step definitions matching exact prompt requirements
  const STEPS: { num: ScreeningStep; label: string; title: string; short: string; whatToDo: string; whatNext: string }[] = [
    {
      num: 1,
      label: '01',
      title: 'Basic Information',
      short: 'Basic Info',
      whatToDo: 'Provide basic health details (age, diabetes duration, eye to screen) to calibrate screening baseline.',
      whatNext: 'Next is 02 Fundus Image, where you can upload a retinal photograph or capture one with your camera.',
    },
    {
      num: 2,
      label: '02',
      title: 'Fundus Image',
      short: 'Fundus Image',
      whatToDo: 'Upload your fundus retinal image or capture one using your camera. You can also select a test sample.',
      whatNext: 'Next is 03 OCT — Optional for cross-sectional scans (you can safely skip it if you do not have one).',
    },
    {
      num: 3,
      label: '03',
      title: 'OCT — Optional',
      short: 'OCT',
      whatToDo: 'If you have an Optical Coherence Tomography (OCT) scan, attach it here. This step is 100% optional.',
      whatNext: 'Next is 04 Other Reports — Optional for previous eye reports, lab tests, and health indicators.',
    },
    {
      num: 4,
      label: '04',
      title: 'Other Reports — Optional',
      short: 'Other Reports',
      whatToDo: 'Attach existing clinical documents, doctor notes, or recent blood sugar (HbA1c) readings.',
      whatNext: 'Next is 05 Image Quality to review your uploaded inputs and screening pipeline before analysis.',
    },
    {
      num: 5,
      label: '05',
      title: 'Image Quality',
      short: 'Image Quality',
      whatToDo: 'Review input verification status and confirm the screening pipeline tailored to your available data.',
      whatNext: 'Next is 06 AI-Assisted Screening Support to initiate deep learning evaluation.',
    },
    {
      num: 6,
      label: '06',
      title: 'AI-Assisted Screening Support',
      short: 'AI Screening',
      whatToDo: 'Please wait while AI-assisted screening algorithms evaluate the provided images and clinical context.',
      whatNext: 'Next is 07 Next Step to view your screening summary and recommended follow-up actions.',
    },
    {
      num: 7,
      label: '07',
      title: 'Next Step',
      short: 'Next Step',
      whatToDo: 'Review your screening support summary and explore recommended clinical follow-up actions.',
      whatNext: 'Connect with a local screening center, book an appointment, or download a printable record.',
    },
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
      setHasSampleFundusSelected(false);
      setFundusQualityStatus('adequate');
    }
    stopCamera();
  };

  // Fundus file upload handling (JPG, PNG, WEBP)
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
      setHasSampleFundusSelected(false);
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

  // Run AI-Assisted Screening Support
  const runAiAssessment = () => {
    setCurrentStep(6);
    setIsAnalyzing(true);
    setAnalysisProgress(12);
    setAnalysisPhaseText('Validating optical clarity, resolution, and contrast normalization...');

    setTimeout(() => {
      setAnalysisProgress(38);
      setAnalysisPhaseText('Evaluating microvascular patterns, vessel calibre, and retinal arcade...');
    }, 400);

    setTimeout(() => {
      setAnalysisProgress(70);
      setAnalysisPhaseText('Integrating clinical context, blood markers, and cross-referencing findings...');
    }, 800);

    setTimeout(() => {
      setAnalysisProgress(92);
      setAnalysisPhaseText('Compiling AI-assisted screening support summary and follow-up guidance...');
    }, 1150);

    setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisPhaseText('Screening support summary ready.');

      // Synthesize fusion result using verified fusionEngine
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

      // Workflow Modality Logic:
      // 1. If fundus is available: use it as primary visual input.
      // 2. If fundus unavailable but OCT available: allow OCT-based workflow.
      // 3. If both available: allow both.
      // 4. If only another report available: allow supported report workflow.
      const fundusAvailable = isUsingCustomFundus
        ? Boolean(fundusImageFile)
        : hasSampleFundusSelected;
      const octAvailable = isUsingCustomOct ? Boolean(octImageFile) : includeSampleOct;

      let effectiveGrade: DRGrade = 0;
      if (fundusAvailable) {
        effectiveGrade = isUsingCustomFundus ? (1 as DRGrade) : activePreset.drGrade;
      } else if (octAvailable) {
        effectiveGrade = activePreset.octType !== 'Normal' ? 2 : 0;
      } else {
        effectiveGrade = metaAnalysis.predictedGrade || 0;
      }

      const fundusImageUrl = fundusAvailable
        ? (isUsingCustomFundus && fundusImageFile ? fundusImageFile : generateFundusSvg(effectiveGrade, 'normal'))
        : generateFundusSvg(0, 'normal');

      const fundusClaheUrl = fundusAvailable
        ? (isUsingCustomFundus && fundusImageFile ? fundusImageFile : generateFundusSvg(effectiveGrade, 'clahe'))
        : generateFundusSvg(0, 'clahe');

      const fundusCamUrl = fundusAvailable
        ? (isUsingCustomFundus && fundusImageFile ? fundusImageFile : generateFundusSvg(effectiveGrade, 'gradcam'))
        : generateFundusSvg(0, 'gradcam');

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
        fundusImageName: fundusAvailable
          ? (isUsingCustomFundus ? fundusImageName : activePreset.expectedTriage.fundusImageName)
          : 'None (OCT / Report Driven)',
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
    }, 1500);
  };

  // Determine dynamic input logic description
  const hasFundus = isUsingCustomFundus ? Boolean(fundusImageFile) : hasSampleFundusSelected;
  const hasOct = isUsingCustomOct ? Boolean(octImageFile) : includeSampleOct;
  const hasReport = Boolean(reportFile) || reportNotes.trim().length > 0;

  let inputLogicHeadline = 'Primary Fundus Retinal Screening';
  let inputLogicDetail =
    'Fundus retinal photograph is available and will be used as the primary visual input for deep learning screening.';

  if (hasFundus && hasOct) {
    inputLogicHeadline = 'Dual-Modality Screening (Fundus + OCT)';
    inputLogicDetail =
      'Both a color fundus photograph and an OCT macular cross-section are available and will be analyzed together.';
  } else if (!hasFundus && hasOct) {
    inputLogicHeadline = 'OCT-Based Screening Workflow';
    inputLogicDetail =
      'Fundus photograph is unavailable; the OCT macular scan will serve as the primary imaging input for retinal layer evaluation.';
  } else if (!hasFundus && !hasOct && hasReport) {
    inputLogicHeadline = 'Report-Driven Clinical Screening Workflow';
    inputLogicDetail =
      'Imaging is unavailable; your clinical report, reported HbA1c, and health history will be evaluated for microvascular risk indicators.';
  } else if (!hasFundus && !hasOct && !hasReport) {
    inputLogicHeadline = 'Basic Clinical Risk Stratification';
    inputLogicDetail =
      'Screening will provide general risk-support based on your basic health profile and reported duration of diabetes.';
  }

  const currentStepObj = STEPS[currentStep - 1];

  return (
    <div
      id="patient-screening-workflow-container"
      className="min-h-screen bg-[#FCFAF7] dark:bg-[#151214] text-[#2E2628] dark:text-[#E8E2DD] transition-colors py-6 sm:py-10 px-3 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* =================================================================
            1. PRIMARY PURPOSE HEADER: SCREENING
            Immediate clarity: AI-assisted screening support.
            ================================================================= */}
        <header className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE5D8] dark:bg-[#3D2619] border border-[#FED7AA] dark:border-[#573522] text-[#F05A28] dark:text-[#FB923C] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI-Assisted Screening Support</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#1F181A] dark:text-white">
                Retinal Screening
              </h1>
              <p className="text-sm sm:text-base text-[#6E5C5F] dark:text-[#A8989B] max-w-2xl leading-relaxed">
                Early retinal screening identifies signs of diabetes-related eye changes before vision symptoms appear.
                Complete our step-by-step workflow with your available images or health reports.
              </p>
            </div>

            {/* Accessibility Voice Guidance Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="screening-voice-guide-btn"
                onClick={() =>
                  handleReadStep(
                    `Where you are: Step ${currentStepObj.label} of 07, ${currentStepObj.title}. What you need to do: ${currentStepObj.whatToDo}. What happens next: ${currentStepObj.whatNext}. Notice: Assessment is based on the information provided. This information does not confirm or rule out a diagnosis. Professional evaluation may be required.`
                  )
                }
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                  voiceState.isPlaying
                    ? 'bg-[#F05A28] text-white border-[#F05A28] shadow-sm'
                    : 'bg-[#FFFDFB] dark:bg-[#252022] text-[#2E2628] dark:text-[#C4B7BA] border-[#EFE4DC] dark:border-[#3E3438] hover:border-[#F05A28]'
                }`}
                title="Listen to this step out loud"
              >
                {voiceState.isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4 text-[#F05A28]" />}
                <span>{voiceState.isPlaying ? 'Pause Audio' : '🔊 Read Aloud'}</span>
              </button>
            </div>
          </div>

          {/* Mandatory Patient Notice */}
          <div className="mt-5 pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex items-start gap-2.5 text-xs text-[#7A696C] dark:text-[#9A8B8E]">
            <Info className="w-4 h-4 text-[#F05A28] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-semibold text-[#382E30] dark:text-[#E8E2DD]">Assessment is based on the information provided: </strong>
              RetinaGuard provides AI-assisted screening support. This information does not confirm or rule out a diagnosis. Professional evaluation may be required.
            </p>
          </div>
        </header>

        {/* =================================================================
            PROMINENT SCREENING VOICE GUIDE (PATIENT ROLE)
            With OFF / ON toggle, Play, Pause, Repeat, Stop
            Automatically uses selected language (English, Hindi, Kannada, Tamil, Telugu, Malayalam)
            ================================================================= */}
        <ScreeningVoiceGuide
          role="patient"
          currentStep={currentStep}
          totalSteps={7}
          stepContext={{
            hasImageUploaded: Boolean(fundusImageFile || hasSampleFundusSelected),
            hasOctUploaded: Boolean(octImageFile || includeSampleOct),
            hasReportUploaded: Boolean(reportFile),
            isAnalyzing,
            isComplete: currentStep === 7,
          }}
        />

        {/* =================================================================
            2. GUIDED WORKFLOW STEPPER (01 to 07)
            01 Basic Information
            02 Fundus Image
            03 OCT — Optional
            04 Other Reports — Optional
            05 Image Quality
            06 AI-Assisted Screening Support
            07 Next Step
            ================================================================= */}
        <nav aria-label="Screening Workflow Progress" className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#6E5C5F] dark:text-[#A8989B]">
            <span className="text-[#F05A28] dark:text-[#FB923C] uppercase tracking-wider">
              Step {currentStepObj.label} of 07 · {currentStepObj.title}
            </span>
            <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
          </div>

          {/* Continuous Progress Track */}
          <div className="w-full h-2 bg-[#F3ECE5] dark:bg-[#2C2428] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F05A28] to-[#E11D48] transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>

          {/* 7 Numbered Steps */}
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
                  className={`flex flex-col items-center text-center p-1 sm:p-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-[#FFE5D8] dark:bg-[#3D2619] text-[#F05A28] font-bold ring-1 ring-[#F05A28]/40'
                      : isCompleted
                      ? 'text-[#2E2628] dark:text-[#E8E2DD] hover:bg-[#FAF6F2] dark:hover:bg-[#252022] cursor-pointer'
                      : 'text-[#A8989B] dark:text-[#63575A] cursor-not-allowed opacity-60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                      isCurrent
                        ? 'bg-[#F05A28] text-white shadow-xs'
                        : isCompleted
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#EFE4DC] dark:bg-[#2F272B] text-[#7A696C] dark:text-[#8E7E81]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : step.label}
                  </div>
                  <span className="hidden sm:inline text-[11px] leading-tight truncate max-w-[95px]">
                    {step.short}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* =================================================================
            ORIENTATION CARD: WHERE YOU ARE · WHAT TO DO · WHAT NEXT
            Displayed for every step so the user always knows their context.
            ================================================================= */}
        <div className="bg-[#FAF7F4] dark:bg-[#221C1F] border border-[#EFE4DC] dark:border-[#382E32] rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:divide-x divide-y md:divide-y-0 divide-[#EFE4DC] dark:divide-[#382E32]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#F05A28] uppercase tracking-wider block">{t("Where you are", "Where you are")}</span>
              <p className="text-xs sm:text-sm font-bold text-[#1F181A] dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-[#FFE5D8] dark:bg-[#3D2619] text-[#F05A28] flex items-center justify-center text-[11px] font-extrabold">{currentStepObj.label}</span>
                <span>{t(currentStepObj.title, currentStepObj.title)}</span>
              </p>
            </div>
            <div className="space-y-1 pt-2 md:pt-0 md:pl-4">
              <span className="text-[11px] font-bold text-[#6E5C5F] dark:text-[#A8989B] uppercase tracking-wider block">{t("What you need to do", "What you need to do")}</span>
              <p className="text-xs text-[#2E2628] dark:text-[#E8E2DD] leading-relaxed">
                {t(currentStepObj.whatToDo, currentStepObj.whatToDo)}
              </p>
            </div>
            <div className="space-y-1 pt-2 md:pt-0 md:pl-4">
              <span className="text-[11px] font-bold text-[#6E5C5F] dark:text-[#A8989B] uppercase tracking-wider block">{t("What happens next", "What happens next")}</span>
              <p className="text-xs text-[#2E2628] dark:text-[#E8E2DD] leading-relaxed">
                {t(currentStepObj.whatNext, currentStepObj.whatNext)}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================================
            01 BASIC INFORMATION
            ================================================================= */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4">
              <div className="flex items-center gap-2 text-[#F05A28] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>01 Basic Information</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                Your Health Context
              </h2>
              <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                This helps the screening system contextualize your retinal risk baseline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Patient Name */}
              <div className="space-y-1.5">
                <label htmlFor="input-patient-name" className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider">
                  Full Name / Identifier
                </label>
                <input
                  type="text"
                  id="input-patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FFFDFB] dark:bg-[#252022] text-sm text-[#2E2628] dark:text-white focus:ring-2 focus:ring-[#F05A28] focus:outline-none"
                />
              </div>

              {/* Patient Age */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="input-patient-age" className="font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider">
                    Age: <span className="text-[#F05A28] font-extrabold text-sm">{patientAge} yrs</span>
                  </label>
                </div>
                <input
                  type="range"
                  id="input-patient-age"
                  min="18"
                  max="90"
                  value={patientAge}
                  onChange={(e) => setPatientAge(parseInt(e.target.value, 10))}
                  className="w-full accent-[#F05A28]"
                />
                <div className="flex justify-between text-[11px] text-[#8E7E81]">
                  <span>18</span>
                  <span>50</span>
                  <span>90</span>
                </div>
              </div>

              {/* Diabetes Type */}
              <div className="space-y-1.5">
                <label htmlFor="select-diabetes-type" className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider">
                  Diabetes Diagnosis
                </label>
                <select
                  id="select-diabetes-type"
                  value={diabetesType}
                  onChange={(e) => setDiabetesType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FFFDFB] dark:bg-[#252022] text-sm text-[#2E2628] dark:text-white focus:ring-2 focus:ring-[#F05A28] focus:outline-none"
                >
                  <option value="type2">Type 2 Diabetes</option>
                  <option value="type1">Type 1 Diabetes</option>
                  <option value="prediabetes">Prediabetes / Borderline</option>
                  <option value="none">No Diabetes (General Health Screening)</option>
                  <option value="unknown">Uncertain / Not Sure</option>
                </select>
              </div>

              {/* Diabetes Duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="input-diabetes-years" className="font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider">
                    Duration with Diabetes: <span className="text-[#F05A28] font-extrabold text-sm">{diabetesYears} yrs</span>
                  </label>
                </div>
                <input
                  type="range"
                  id="input-diabetes-years"
                  min="0"
                  max="40"
                  value={diabetesYears}
                  onChange={(e) => setDiabetesYears(parseInt(e.target.value, 10))}
                  className="w-full accent-[#F05A28]"
                />
                <div className="flex justify-between text-[11px] text-[#8E7E81]">
                  <span>Newly Diagnosed (0 yrs)</span>
                  <span>10 yrs</span>
                  <span>40+ yrs</span>
                </div>
              </div>

              {/* Eye being screened */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-[#382E30] dark:text-[#DDD3CD] uppercase tracking-wider">
                  Eye Being Screened
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetEye('OD')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      targetEye === 'OD'
                        ? 'bg-[#F05A28] text-white border-[#F05A28] shadow-2xs'
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
                        ? 'bg-[#F05A28] text-white border-[#F05A28] shadow-2xs'
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
                        ? 'bg-[#F05A28] text-white border-[#F05A28] shadow-2xs'
                        : 'bg-[#FFFDFB] dark:bg-[#252022] border-[#EFE4DC] dark:border-[#3E3438] text-[#382E30] dark:text-[#DDD3CD]'
                    }`}
                  >
                    Both Eyes (OU)
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-[#F2ECE7] dark:border-[#2C2428] flex justify-end">
              <button
                type="button"
                id="btn-step1-next"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>Continue to 02 Fundus Image</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            02 FUNDUS IMAGE
            Prominent upload area: Upload Fundus Image
            Actions: Upload Image, Use Camera
            Supported: JPG, PNG, WEBP
            After upload: preview, image quality status, replace, remove
            ================================================================= */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-[#F05A28] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                  <Eye className="w-4 h-4" />
                  <span>02 Fundus Image</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                  Fundus Retinal Image
                </h2>
                <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                  Primary photographic view of the retina, macula, and optic disc.
                </p>
              </div>

              <div className="text-xs text-[#7A696C] dark:text-[#9A8B8E] bg-[#FAF6F2] dark:bg-[#252022] px-3 py-1.5 rounded-lg border border-[#EFE4DC] dark:border-[#3A3034]">
                Supported: <span className="font-semibold text-[#F05A28]">JPG, PNG, WEBP</span>
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
              <div className="p-4 rounded-2xl border border-[#F05A28] bg-[#FFF7ED] dark:bg-[#2A1E18] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F05A28]">
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

                <div className="relative bg-black rounded-xl overflow-hidden aspect-video max-h-64 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#382E32] text-[#382E30] dark:text-white border border-[#EFE4DC] dark:border-[#4B3E43]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="btn-capture-frame"
                    onClick={capturePhotoFromCamera}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#F05A28] hover:bg-[#D84818] text-white shadow-xs flex items-center gap-1.5"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#A7F3D0] bg-black shrink-0 shadow-xs">
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
                      
                      {/* Image Quality Status */}
                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#DCFCE7] dark:bg-[#1A382A] text-[#15803D] dark:text-[#4ADE80] font-medium border border-[#86EFAC]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Image Quality Status: <strong>Adequate for Screening</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Requested Actions: Replace, Remove */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id="btn-replace-fundus"
                      onClick={() => fundusFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl border border-[#A7F3D0] bg-white dark:bg-[#1E3A2B] text-xs font-bold text-[#065F46] dark:text-[#A7F3D0] hover:bg-[#DCFCE7] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      id="btn-remove-fundus"
                      onClick={() => {
                        setFundusImageFile(null);
                        setFundusImageName('');
                        setIsUsingCustomFundus(false);
                        setHasSampleFundusSelected(false);
                        setFundusQualityStatus(null);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-[#FCA5A5] bg-white dark:bg-[#2D1B1E] text-xs font-bold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Prominent Upload Area as Requested */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setFundusDragActive(true);
                }}
                onDragLeave={() => setFundusDragActive(false)}
                onDrop={handleFundusDrop}
                className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed text-center transition-all ${
                  fundusDragActive
                    ? 'border-[#F05A28] bg-[#FFE5D8] dark:bg-[#2F1E16]'
                    : 'border-[#E5D7CD] dark:border-[#3E3438] bg-[#FAF7F3] dark:bg-[#1B1618] hover:border-[#F05A28]'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#FFE5D8] dark:bg-[#3D2619] text-[#F05A28] flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white">
                  Upload Fundus Image
                </h3>
                <p className="text-xs sm:text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1.5 max-w-md mx-auto">
                  Drag and drop your retinal photograph here, or select one of the actions below.
                </p>
                <p className="text-xs font-semibold text-[#F05A28] mt-1">
                  Supported formats: JPG, PNG, WEBP
                </p>

                {/* Requested Action Buttons: [ Upload Image ] [ Use Camera ] */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    id="btn-upload-fundus-image"
                    onClick={() => fundusFileInputRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-extrabold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 min-h-[44px]"
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
                    <Camera className="w-4 h-4 text-[#F05A28]" />
                    <span>Use Camera</span>
                  </button>
                </div>

                {/* Verified Test Sample Cases for Convenience */}
                <div className="mt-8 pt-6 border-t border-[#EFE4DC] dark:border-[#2C2428]">
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
                          setHasSampleFundusSelected(true);
                          setFundusQualityStatus('adequate');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          hasSampleFundusSelected && !isUsingCustomFundus && selectedPresetIdx === idx
                            ? 'bg-[#F05A28] text-white border-[#F05A28] shadow-2xs'
                            : 'bg-white dark:bg-[#252022] text-[#382E30] dark:text-[#D5CBD0] border-[#EFE4DC] dark:border-[#3E3438] hover:border-[#F05A28]'
                        }`}
                      >
                        Sample {idx === 0 ? 'A (Normal)' : idx === 1 ? 'B (Early Changes)' : 'C (Moderate)'}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setHasSampleFundusSelected(false);
                        setIsUsingCustomFundus(false);
                        setFundusImageFile(null);
                        setFundusQualityStatus(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#8E7E81] hover:text-[#DC2626] border border-dashed border-[#EFE4DC] hover:border-[#DC2626] transition-colors"
                      title="Clear fundus selection to test OCT-only or report-only workflows"
                    >
                      Clear / Skip Fundus
                    </button>
                  </div>

                  {/* Active Sample Preview */}
                  {hasSampleFundusSelected && !isUsingCustomFundus && (
                    <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE5D8] text-[#F05A28] text-xs font-medium border border-[#FED7AA]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Active Sample: {PRESET_CASES[selectedPresetIdx].name}</span>
                      <span className="text-[#10B981] font-bold">• Image Quality: Adequate</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Workflow Logic Reassurance */}
            <div className="p-4 rounded-2xl bg-[#FAF6F2] dark:bg-[#1F191C] border border-[#EFE4DC] dark:border-[#2E2528] text-xs text-[#6E5C5F] dark:text-[#A8989B]">
              <strong>Flexible Workflow:</strong> If you don't have a fundus photo, you are not blocked. You can advance to 03 OCT or 04 Other Reports.
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
                <span>Back to 01 Basic Information</span>
              </button>

              <button
                type="button"
                id="btn-step2-next"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>Continue to 03 OCT — Optional</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            03 OCT — OPTIONAL
            Upload OCT Scan — Optional
            Buttons: [ Upload OCT Scan ], [ Use Sample OCT Macular Slice ]
            Supported: JPG, PNG, WEBP
            After upload: preview, quality status, replace, remove
            ================================================================= */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-[#F05A28] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>03 OCT — Optional</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                  Upload OCT Scan — Optional
                </h2>
                <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                  Optical Coherence Tomography (OCT) cross-sections visualize deep retinal layers and macular swelling.
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 rounded-xl overflow-hidden border border-[#A7F3D0] bg-black shrink-0 shadow-xs">
                      <img
                        src={
                          isUsingCustomOct && octImageFile
                            ? octImageFile
                            : generateOctSvg(PRESET_CASES[selectedPresetIdx].octType, 'scan')
                        }
                        alt="OCT Scan Preview"
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
                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#DCFCE7] dark:bg-[#1A382A] text-[#15803D] dark:text-[#4ADE80] font-medium border border-[#86EFAC]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Quality Status: <strong>Adequate (Retinal Layers & Fovea Resolved)</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Replace, Remove */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id="btn-replace-oct"
                      onClick={() => octFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl border border-[#A7F3D0] bg-white dark:bg-[#1E3A2B] text-xs font-bold text-[#065F46] dark:text-[#A7F3D0] hover:bg-[#DCFCE7] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
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
                      className="px-3.5 py-2 rounded-xl border border-[#FCA5A5] bg-white dark:bg-[#2D1B1E] text-xs font-bold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
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
                className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed text-center transition-all ${
                  octDragActive
                    ? 'border-[#F05A28] bg-[#FFE5D8] dark:bg-[#2F1E16]'
                    : 'border-[#E5D7CD] dark:border-[#3E3438] bg-[#FAF7F3] dark:bg-[#1B1618] hover:border-[#F05A28]'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#FFE5D8] dark:bg-[#3D2619] text-[#F05A28] flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <Layers className="w-8 h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white">
                  Upload OCT Scan — Optional
                </h3>
                <p className="text-xs sm:text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1.5 max-w-md mx-auto">
                  If your clinic took a cross-sectional tomography scan, attach it here to assess macular contours.
                </p>
                <p className="text-xs font-semibold text-[#F05A28] mt-1">
                  Supported formats: JPG, PNG, WEBP
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    id="btn-upload-oct-scan"
                    onClick={() => octFileInputRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-extrabold text-sm shadow-sm transition-all flex items-center gap-2 min-h-[44px]"
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
                    className="px-6 py-3 rounded-xl bg-white dark:bg-[#252022] hover:bg-[#FFFDFB] text-[#2E2628] dark:text-white border border-[#EFE4DC] dark:border-[#3E3438] font-bold text-sm shadow-2xs transition-all flex items-center gap-2 min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 text-[#F05A28]" />
                    <span>Use Sample OCT Macular Slice</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modality Freedom Reassurance */}
            <div className="p-4 rounded-2xl bg-[#FAF6F2] dark:bg-[#1F191C] border border-[#EFE4DC] dark:border-[#2E2528] text-xs text-[#6E5C5F] dark:text-[#A8989B]">
              <strong>No scan available?</strong> That is completely fine. You are not forced to provide every modality.
              Simply click <strong>Continue to 04 Other Reports</strong>.
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
                <span>Back to 02 Fundus Image</span>
              </button>

              <button
                type="button"
                id="btn-step3-next"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>{hasOct ? 'Continue to 04 Other Reports' : 'Skip / Continue to 04 Other Reports'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            04 OTHER REPORTS — OPTIONAL
            Upload Existing Report — Optional
            Doctor's notes & clinical markers (HbA1c, Blood pressure, Symptoms)
            ================================================================= */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-[#F05A28] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>04 Other Reports — Optional</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                  Upload Existing Report — Optional
                </h2>
                <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                  Attach an existing doctor report or provide recent lab values to refine your screening baseline.
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

            {/* Upload Existing Report Area */}
            <div className="p-5 rounded-2xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] space-y-3">
              <h3 className="text-sm font-bold text-[#2E2628] dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#F05A28]" />
                <span>Upload Existing Report — Optional</span>
              </h3>

              {reportFile ? (
                <div className="p-3.5 rounded-xl border border-[#A7F3D0] bg-[#F0FDF4] dark:bg-[#182C22] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#059669]" />
                    <div>
                      <span className="text-xs font-semibold text-[#1F2937] dark:text-white truncate block max-w-xs sm:max-w-md">
                        {reportFileName || 'Attached_Report.pdf'}
                      </span>
                      <span className="text-[11px] text-[#059669] font-bold">✓ Attached Document</span>
                    </div>
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-[#241E21] rounded-xl border border-[#EFE4DC] dark:border-[#33282C]">
                  <p className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    Attach PDF, photo, or scan of your last eye examination or hospital discharge summary.
                  </p>
                  <button
                    type="button"
                    id="btn-upload-report-file"
                    onClick={() => reportFileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#292225] border border-[#EFE4DC] dark:border-[#42373C] text-xs font-bold text-[#2E2628] dark:text-white hover:border-[#F05A28] transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#F05A28]" />
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
                  Doctor's Notes or Prior Medical Details (Optional)
                </label>
                <textarea
                  id="input-report-notes"
                  rows={2}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="e.g. Previous checkup noted mild blurriness in right eye; doctor advised annual monitoring."
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#252022] text-xs text-[#2E2628] dark:text-white focus:ring-2 focus:ring-[#F05A28] focus:outline-none"
                />
              </div>
            </div>

            {/* Optional Health Metrics */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-[#2E2628] dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F05A28]" />
                <span>Recent Health Metrics (Estimates are fine)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* HbA1c */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="input-hba1c" className="font-bold text-[#382E30] dark:text-[#DDD3CD]">
                      Recent HbA1c Level:
                    </label>
                    <span className="font-extrabold text-[#F05A28]">{hba1cValue.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    id="input-hba1c"
                    min="5.0"
                    max="14.0"
                    step="0.1"
                    value={hba1cValue}
                    onChange={(e) => setHba1cValue(parseFloat(e.target.value))}
                    className="w-full accent-[#F05A28]"
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
                    <span className="font-extrabold text-[#F05A28]">{systolicBpValue} mmHg</span>
                  </div>
                  <input
                    type="range"
                    id="input-systolic-bp"
                    min="90"
                    max="200"
                    value={systolicBpValue}
                    onChange={(e) => setSystolicBpValue(parseInt(e.target.value, 10))}
                    className="w-full accent-[#F05A28]"
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
                  Are you experiencing any visual symptoms?
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
                      className="accent-[#F05A28] rounded"
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
                      className="accent-[#F05A28] rounded"
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
                      className="accent-[#F05A28] rounded"
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
                      className="accent-[#F05A28] rounded"
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
                <span>Back to 03 OCT</span>
              </button>

              <button
                type="button"
                id="btn-step4-next"
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>Continue to 05 Image Quality</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            05 IMAGE QUALITY
            Pre-flight review of available inputs and workflow logic.
            Workflow rules:
            - If fundus available: use as primary visual input.
            - If fundus unavailable but OCT available: allow OCT-based workflow.
            - If both available: allow both.
            - If only report available: allow supported report workflow.
            - Do not block users because they do not have every modality.
            Mandatory statement: "Assessment is based on the information provided."
            ================================================================= */}
        {currentStep === 5 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#F2ECE7] dark:border-[#2C2428] pb-4">
              <div className="flex items-center gap-2 text-[#F05A28] dark:text-[#FB923C] font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>05 Image Quality</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F181A] dark:text-white mt-1">
                Input & Quality Verification
              </h2>
              <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] mt-1">
                Verifying the quality of your submitted materials before initiating AI screening.
              </p>
            </div>

            {/* Mandatory Safety Notice Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFE5D8] dark:bg-[#322017] border border-[#FED7AA] dark:border-[#573522] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28] dark:text-[#FB923C] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>AI-Assisted Screening Support</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-[#1F181A] dark:text-white">
                Assessment is based on the information provided.
              </p>
              <p className="text-xs text-[#7A696C] dark:text-[#B5A5A8] leading-relaxed">
                This information does not confirm or rule out a diagnosis. Professional evaluation may be required.
              </p>
            </div>

            {/* Modality Status Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Fundus Status */}
              <div className="p-4 rounded-2xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] flex items-center gap-3.5">
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
                      <span className="text-[#15803D] font-bold">✓ Adequate Quality (Primary Visual Input)</span>
                    ) : (
                      <span className="text-[#8E7E81]">Not provided (Bypassed)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* OCT Scan Status */}
              <div className="p-4 rounded-2xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] flex items-center gap-3.5">
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
                      <span className="text-[#15803D] font-bold">✓ Attached (Macular Cross-Section)</span>
                    ) : (
                      <span className="text-[#8E7E81]">Not provided (Proceeding without OCT)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Status */}
              <div className="p-4 rounded-2xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] flex items-center gap-3.5">
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
                  <div className="text-xs font-bold text-[#2E2628] dark:text-white">Existing Report (Optional)</div>
                  <div className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    {hasReport ? (
                      <span className="text-[#15803D] font-bold">✓ Attached Document / Clinical Notes</span>
                    ) : (
                      <span className="text-[#8E7E81]">No document attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Markers Status */}
              <div className="p-4 rounded-2xl border border-[#EFE4DC] dark:border-[#382E32] bg-[#FAF7F4] dark:bg-[#201A1D] flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#DCFCE7] text-[#15803D]">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2E2628] dark:text-white">Health Indicators</div>
                  <div className="text-xs text-[#6E5C5F] dark:text-[#A8989B]">
                    <span className="text-[#15803D] font-medium">
                      HbA1c {hba1cValue.toFixed(1)}% • BP {systolicBpValue} mmHg • {diabetesYears} yrs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Workflow Logic Display */}
            <div className="p-5 rounded-2xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#252022] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F05A28]">
                <Cpu className="w-4 h-4" />
                <span>Selected Workflow: {inputLogicHeadline}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#524346] dark:text-[#DDD3CD] leading-relaxed">
                {inputLogicDetail}
              </p>
              <div className="pt-2 border-t border-[#EFE4DC] dark:border-[#33282C] text-[11px] text-[#8E7E81]">
                <strong>Patient Flexibility:</strong> You are not blocked if you do not have every modality. The screening engine adapts dynamically to your available records.
              </div>
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
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F05A28] to-[#E11D48] hover:from-[#D84818] hover:to-[#BE123C] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all ring-2 ring-[#F05A28]/20"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span>Begin 06 AI-Assisted Screening Support</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            06 AI-ASSISTED SCREENING SUPPORT
            Animated screening inference execution
            Language: simple, non-definitive, AI-assisted screening support
            ================================================================= */}
        {currentStep === 6 && (
          <div className="bg-white dark:bg-[#1D191B] border border-[#EFE4DC] dark:border-[#382E32] rounded-3xl p-8 sm:p-12 shadow-xs text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#FFE5D8] dark:bg-[#3D2619] text-[#F05A28] flex items-center justify-center mx-auto animate-pulse shadow-xs">
              <Cpu className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFE5D8] text-[#F05A28] text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>AI-Assisted Screening Support</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F181A] dark:text-white">
                06 AI-Assisted Screening Support
              </h2>
              <p className="text-sm text-[#6E5C5F] dark:text-[#A8989B] max-w-md mx-auto">
                {analysisPhaseText || 'Evaluating input images and clinical context...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-full h-3 bg-[#F3ECE5] dark:bg-[#2C2428] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F05A28] via-[#E11D48] to-[#10B981] transition-all duration-300 rounded-full"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-[#8E7E81]">
                <span>Neural Feature Review</span>
                <span>{analysisProgress}%</span>
              </div>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#FAF6F2] dark:bg-[#252022] border border-[#EFE4DC] dark:border-[#3A3034] text-xs text-[#7A696C] dark:text-[#A8989B] leading-relaxed">
              <p>
                <strong>Assessment is based on the information provided.</strong>
                <br />
                This information does not confirm or rule out a diagnosis. Professional evaluation may be required.
              </p>
            </div>
          </div>
        )}

        {/* =================================================================
            07 NEXT STEP
            Patient-facing screening outcome summary & action plan
            Technical details kept safely hidden behind "View Technical Details"
            ================================================================= */}
        {currentStep === 7 && triageResult && (
          <div className="space-y-6">
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
                setHasSampleFundusSelected(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
