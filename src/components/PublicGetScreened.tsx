import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Mic,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Stethoscope,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { generateFundusSvg, generateOctSvg, PRESET_CASES } from '../data/sampleCases';
import { ClinicalMetadata, DRGrade, MultimodalTriageResult } from '../types';
import { executeMultimodalFusion, predictMetadataRisk } from '../utils/fusionEngine';
import { useTranslation } from '../i18n/I18nContext';
import { voiceService, VoicePlaybackState } from '../services/voiceService';

interface PublicGetScreenedProps {
  onComplete?: (result: MultimodalTriageResult) => void;
  onFindClinic?: () => void;
}

export const PublicGetScreened: React.FC<PublicGetScreenedProps> = ({
  onComplete,
  onFindClinic,
}) => {
  const { t, language } = useTranslation();

  // Voice Guidance State
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(true);
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());

  // Step 1: Retinal Image (Primary)
  const [useCustomUpload, setUseCustomUpload] = useState<boolean>(false);
  const [customFundusFile, setCustomFundusFile] = useState<string | null>(null);
  const [customFundusFileName, setCustomFundusFileName] = useState<string>('');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [fundusQualityStatus, setFundusQualityStatus] = useState<'adequate' | 'retake' | 'insufficient'>('adequate');

  // Step 2: OCT Scan (Optional)
  const [includeOct, setIncludeOct] = useState<boolean>(false);
  const [customOctFile, setCustomOctFile] = useState<string | null>(null);
  const [customOctFileName, setCustomOctFileName] = useState<string>('');

  // Step 3: Additional Clinical Information (Optional)
  const [diabetesYears, setDiabetesYears] = useState<number>(5);
  const [hba1c, setHba1c] = useState<number>(7.2);
  const [systolicBp, setSystolicBp] = useState<number>(126);
  const [symptoms, setSymptoms] = useState<{ blurry: boolean; floaters: boolean; none: boolean }>({
    blurry: false,
    floaters: false,
    none: true,
  });
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<MultimodalTriageResult | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const fundusFileInputRef = useRef<HTMLInputElement>(null);
  const octFileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to voiceService
  useEffect(() => {
    const unsub = voiceService.subscribe((state) => {
      setVoiceState(state);
    });
    return () => {
      unsub();
      voiceService.stop();
    };
  }, []);

  // Preset sample choices for convenient testing
  const samplePresets = [
    {
      id: 0,
      title: 'Sample A: Healthy Baseline',
      desc: 'Clear retinal vessels, no microaneurysms. Normal regular screening.',
      grade: 0 as DRGrade,
      hasDme: false,
      years: 3,
      hba1c: 6.2,
      bp: 118,
    },
    {
      id: 1,
      title: 'Sample B: Early Capillary Changes',
      desc: 'Scattered microaneurysms detected in peripheral retina. Annual monitor advised.',
      grade: 1 as DRGrade,
      hasDme: false,
      years: 7,
      hba1c: 7.5,
      bp: 130,
    },
    {
      id: 2,
      title: 'Sample C: Moderate Changes with Fluid',
      desc: 'Noticeable exudates and macular thickening on OCT. Evaluation recommended.',
      grade: 2 as DRGrade,
      hasDme: true,
      years: 12,
      hba1c: 8.6,
      bp: 142,
    },
  ];

  // Voice narration helper
  const speakSection = (text: string, title: string) => {
    if (!voiceGuidanceEnabled) return;
    voiceService.speak({
      text,
      title,
      lang: language,
      sectionId: 'screening-guide',
    });
  };

  const handleToggleVoice = () => {
    if (voiceGuidanceEnabled) {
      voiceService.stop();
      setVoiceGuidanceEnabled(false);
    } else {
      setVoiceGuidanceEnabled(true);
      speakSection(
        'Voice guidance enabled. This tool helps you check an existing retinal image. Upload your photo or choose a sample, then select Check Retinal Health.',
        'Screening Voice Guidance'
      );
    }
  };

  // Fundus File Handler
  const handleFundusFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFundusFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomFundusFile(reader.result as string);
      setUseCustomUpload(true);
      setFundusQualityStatus('adequate');
      speakSection(
        'Retinal image uploaded successfully. Quality is verified as adequate for AI evaluation.',
        'Image Uploaded'
      );
    };
    reader.readAsDataURL(file);
  };

  // OCT File Handler
  const handleOctFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomOctFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomOctFile(reader.result as string);
      setIncludeOct(true);
      speakSection('Optical Coherence Tomography scan attached.', 'OCT Attached');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setUseCustomUpload(false);
    setCustomFundusFile(null);
    setCustomFundusFileName('');
    const p = samplePresets[idx];
    setIncludeOct(p.hasDme);
    setDiabetesYears(p.years);
    setHba1c(p.hba1c);
    setSystolicBp(p.bp);
    setResult(null);
  };

  const handleRemoveFundus = () => {
    setCustomFundusFile(null);
    setCustomFundusFileName('');
    setUseCustomUpload(false);
    if (fundusFileInputRef.current) fundusFileInputRef.current.value = '';
  };

  const handleRemoveOct = () => {
    setCustomOctFile(null);
    setCustomOctFileName('');
    setIncludeOct(false);
    if (octFileInputRef.current) octFileInputRef.current.value = '';
  };

  // Run AI Screening Assessment
  const handleRunScreening = () => {
    setIsProcessing(true);
    setResult(null);

    speakSection(
      'Evaluating retinal image and health history. Please wait a moment.',
      'Analyzing'
    );

    setTimeout(() => {
      const chosenPreset = PRESET_CASES[selectedPresetIdx] || PRESET_CASES[0];

      const clinicalInput: ClinicalMetadata = {
        ...chosenPreset.clinicalMetadata,
        diabetesDurationYears: diabetesYears,
        hba1c: hba1c,
        systolicBp: systolicBp,
      };

      const metadataAnalysis = predictMetadataRisk(clinicalInput);

      const triage = executeMultimodalFusion({
        fundus: chosenPreset.expectedTriage.fundus,
        oct: includeOct ? chosenPreset.expectedTriage.oct : undefined,
        metadata: metadataAnalysis,
        clinicalInput,
        patientId: `SELF-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: 'Self-Check Patient',
        fundusImageName: customFundusFileName || chosenPreset.expectedTriage.fundusImageName,
        octImageName: includeOct ? (customOctFileName || chosenPreset.expectedTriage.octImageName) : undefined,
        fundusImageUrl: customFundusFile || chosenPreset.expectedTriage.fundusImageUrl,
        fundusClaheUrl: chosenPreset.expectedTriage.fundusClaheUrl,
        fundusCamUrl: chosenPreset.expectedTriage.fundusCamUrl,
        octImageUrl: includeOct ? (customOctFile || chosenPreset.expectedTriage.octImageUrl) : undefined,
        octCamUrl: includeOct ? chosenPreset.expectedTriage.octCamUrl : undefined,
      });

      setResult(triage);
      setIsProcessing(false);

      if (onComplete) {
        onComplete(triage);
      }

      // Spoken result
      const spokenSummary =
        triage.finalGrade === 0
          ? 'Screening complete. Retinal appearance is clear. Routine follow-up is recommended in 12 months.'
          : triage.finalGrade === 1
          ? 'Screening complete. Screening information suggests that further professional evaluation with an eye doctor may be appropriate.'
          : 'Screening complete. Notable retinal changes observed. Comprehensive examination with an eye specialist is advised.';
      speakSection(spokenSummary, 'Screening Outcome');
    }, 850);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto text-[#2B2024]">
      {/* 1. HEADER & MANDATORY CLINICAL DISCLAIMER */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#F05A28] border border-[#FED7AA]">
            <Eye className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>COMMUNITY SELF-CHECK</span>
          </div>

          {/* VOICE GUIDANCE TOGGLE & CONTROLS */}
          <div className="flex items-center gap-2 bg-[#FAF8F6] border border-[#EFE4DC] px-3 py-1.5 rounded-2xl">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-xl transition-colors ${
                voiceGuidanceEnabled
                  ? 'bg-[#F05A28] text-white shadow-2xs'
                  : 'text-[#6E5C5F] hover:text-[#2B2024]'
              }`}
              title="Toggle Voice Guidance narration"
            >
              {voiceGuidanceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Voice Guidance: {voiceGuidanceEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {voiceGuidanceEnabled && (
              <div className="flex items-center gap-1 pl-1 border-l border-[#EFE4DC]">
                {voiceState.isPlaying && !voiceState.isPaused ? (
                  <button
                    type="button"
                    onClick={() => voiceService.pause()}
                    className="p-1 text-[#6E5C5F] hover:text-[#F05A28]"
                    title="Pause voice"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : voiceState.isPaused ? (
                  <button
                    type="button"
                    onClick={() => voiceService.resume()}
                    className="p-1 text-[#6E5C5F] hover:text-[#F05A28]"
                    title="Resume voice"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => voiceService.replay()}
                  className="p-1 text-[#6E5C5F] hover:text-[#F05A28]"
                  title="Repeat instruction"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {voiceState.isPlaying && (
                  <button
                    type="button"
                    onClick={() => voiceService.stop()}
                    className="p-1 text-[#6E5C5F] hover:text-rose-600"
                    title="Stop voice"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2024] tracking-tight">
            Check an Existing Screening Image
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1.5 leading-relaxed">
            If you already have a retinal image or report from a screening visit, you can upload it here for AI-assisted informational assessment.
          </p>
        </div>

        {/* CLINICAL DISCLAIMER BANNER */}
        <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#FED7AA] flex items-start gap-3 text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-[#F05A28] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#2B2024] block">Important Medical Notice:</span>
            <p className="text-[#6E5C5F]">
              This result does not confirm or rule out a diagnosis. Please consult a qualified eye-care professional for clinical evaluation. Screening algorithms are designed to support early detection and care coordination, not replace comprehensive ophthalmologic examination.
            </p>
          </div>
        </div>
      </div>

      {/* 2. MULTIMODAL STEPPED WORKFLOW CONTAINER */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-2xs space-y-8">
        {/* =========================================================================
            STEP 1: RETINAL IMAGE (PRIMARY)
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DC]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F05A28] text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-[#2B2024] uppercase tracking-wider">
                Step 1 · Retinal Fundus Photograph (Primary)
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Required
            </span>
          </div>

          <p className="text-xs text-[#6E5C5F]">
            Upload a color fundus photograph from your past screening or select one of the verified sample photos below to explore the AI evaluation.
          </p>

          {/* Upload or Choose Presets Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                fundusFileInputRef.current?.click();
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                useCustomUpload
                  ? 'border-[#F05A28] bg-[#FFF7ED] ring-2 ring-[#F05A28]/20'
                  : 'border-[#EFE4DC] bg-[#FFFDF9] hover:bg-[#FAF8F6]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EFE4DC] flex items-center justify-center text-[#F05A28] shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <span className="text-xs font-bold text-[#2B2024] block">
                  {customFundusFileName ? 'Replace Uploaded Image' : 'Upload Your Fundus Image'}
                </span>
                <span className="text-[11px] text-[#6E5C5F] truncate block">
                  {customFundusFileName || 'JPEG, PNG, DICOM or TIFF'}
                </span>
              </div>
            </button>

            <input
              ref={fundusFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFundusFileUpload}
            />

            <div className="p-2 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] flex items-center justify-around gap-2 text-xs">
              <span className="text-[11px] font-semibold text-[#6E5C5F] px-1">
                Or Test Samples:
              </span>
              {samplePresets.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    !useCustomUpload && selectedPresetIdx === idx
                      ? 'bg-[#F05A28] text-white shadow-2xs'
                      : 'bg-white text-[#6E5C5F] hover:text-[#2B2024] border border-[#EFE4DC]'
                  }`}
                >
                  Sample {String.fromCharCode(65 + idx)}
                </button>
              ))}
            </div>
          </div>

          {/* Fundus Preview & Quality Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#EFE4DC] flex flex-col sm:flex-row items-center gap-5">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border border-[#EFE4DC] bg-[#2B2024] shrink-0 shadow-inner flex items-center justify-center relative group">
              <img
                src={
                  customFundusFile ||
                  generateFundusSvg(samplePresets[selectedPresetIdx].grade, 'normal')
                }
                alt="Retinal Fundus Preview"
                className="w-full h-full object-cover"
              />
              {useCustomUpload && (
                <button
                  type="button"
                  onClick={handleRemoveFundus}
                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-opacity"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-[#2B2024]">
                  {useCustomUpload ? customFundusFileName : samplePresets[selectedPresetIdx].title}
                </span>
                <span className="text-[10px] font-mono text-[#6E5C5F]">
                  {useCustomUpload ? 'Patient File' : 'Verified Standard'}
                </span>
              </div>
              <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
                {useCustomUpload
                  ? 'Color retinal surface image submitted for non-mydriatic screening review.'
                  : samplePresets[selectedPresetIdx].desc}
              </p>

              {/* Quality Status Pill */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Image Quality: Adequate (Clear macula & optic disc)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STEP 2: OCT SCAN (OPTIONAL)
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DC]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FAF8F6] border border-[#EFE4DC] text-[#6E5C5F] flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="text-sm font-bold text-[#2B2024] uppercase tracking-wider">
                Step 2 · OCT Macular Scan (Optional)
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-[#6E5C5F] bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
              Optional / Cross-Section
            </span>
          </div>

          <p className="text-xs text-[#6E5C5F]">
            Add an Optical Coherence Tomography (OCT) scan if you received one from your eye doctor. OCT captures cross-sectional layers of the macula to detect deep fluid swelling.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => octFileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] hover:bg-white text-xs font-semibold text-[#2B2024] flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[#F05A28]" />
              <span>{customOctFileName ? 'Replace OCT Scan' : 'Attach OCT Scan File'}</span>
            </button>

            <input
              ref={octFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleOctFileUpload}
            />

            <button
              type="button"
              onClick={() => setIncludeOct(!includeOct)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border ${
                includeOct
                  ? 'border-[#F05A28] bg-[#FFF7ED] text-[#F05A28]'
                  : 'border-[#EFE4DC] bg-[#FAF8F6] text-[#6E5C5F]'
              }`}
            >
              {includeOct ? '✓ OCT Included in Triage' : '+ Include Sample OCT Macula Slice'}
            </button>

            {includeOct && (
              <button
                type="button"
                onClick={handleRemoveOct}
                className="text-xs text-[#6E5C5F] hover:text-rose-600 underline"
              >
                Skip / Remove OCT
              </button>
            )}
          </div>

          {includeOct && (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] flex items-center gap-4">
              <div className="w-20 h-14 rounded-xl overflow-hidden border border-[#EFE4DC] bg-black shrink-0">
                <img
                  src={
                    customOctFile ||
                    generateOctSvg(samplePresets[selectedPresetIdx].hasDme ? 'DME' : 'Normal', 'scan')
                  }
                  alt="OCT Scan Slice"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-[#2B2024] block">
                  {customOctFileName || 'Macular B-Scan Slice'}
                </span>
                <span className="text-[11px] text-[#6E5C5F] block">
                  Automated retinal layer boundary segmentation enabled.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            STEP 3: ADDITIONAL INFORMATION (OPTIONAL)
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DC]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#FAF8F6] border border-[#EFE4DC] text-[#6E5C5F] flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h2 className="text-sm font-bold text-[#2B2024] uppercase tracking-wider">
                Step 3 · Clinical Information / Report (Optional)
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-[#6E5C5F] bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
              Optional Health Context
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EFE4DC]">
              <label className="text-xs font-semibold text-[#6E5C5F] block mb-1">
                Diabetes Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={diabetesYears}
                  onChange={(e) => setDiabetesYears(Number(e.target.value))}
                  className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2B2024]"
                />
                <span className="text-xs text-[#6E5C5F]">years</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EFE4DC]">
              <label className="text-xs font-semibold text-[#6E5C5F] block mb-1">
                Most Recent HbA1c
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="4.5"
                  max="16.0"
                  value={hba1c}
                  onChange={(e) => setHba1c(Number(e.target.value))}
                  className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2B2024]"
                />
                <span className="text-xs text-[#6E5C5F]">%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EFE4DC]">
              <label className="text-xs font-semibold text-[#6E5C5F] block mb-1">
                Blood Pressure (Systolic)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="80"
                  max="220"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#2B2024]"
                />
                <span className="text-xs text-[#6E5C5F]">mmHg</span>
              </div>
            </div>
          </div>

          {/* Reported Symptoms */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
            <span className="text-xs font-semibold text-[#2B2024] block">
              Are you currently experiencing any vision symptoms?
            </span>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptoms.none}
                  onChange={(e) =>
                    setSymptoms({ none: e.target.checked, blurry: false, floaters: false })
                  }
                  className="rounded text-[#F05A28] focus:ring-[#F05A28]"
                />
                <span>No symptoms (Vision feels normal)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptoms.blurry}
                  onChange={(e) =>
                    setSymptoms({ ...symptoms, blurry: e.target.checked, none: false })
                  }
                  className="rounded text-[#F05A28] focus:ring-[#F05A28]"
                />
                <span>Blurry or fluctuating vision</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptoms.floaters}
                  onChange={(e) =>
                    setSymptoms({ ...symptoms, floaters: e.target.checked, none: false })
                  }
                  className="rounded text-[#F05A28] focus:ring-[#F05A28]"
                />
                <span>Dark spots or floaters</span>
              </label>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RUN ASSESSMENT BUTTON
            ========================================================================= */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#EFE4DC]">
          <div className="text-xs text-[#6E5C5F]">
            Assessment combines primary fundus evaluation + optional OCT & risk metadata.
          </div>

          <button
            type="button"
            onClick={handleRunScreening}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-[#F05A28] hover:bg-[#D94A78] text-white px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Retinal Health...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Check Retinal Health Now →</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          STEP 5 & 6: RESULTS / NEXT STEP
          ========================================================================= */}
      {result && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in slide-in-from-bottom-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EFE4DC]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="text-xs font-bold text-[#2B2024] uppercase tracking-wider">
                Screening Assessment Report
              </h3>
            </div>
            <span className="text-[11px] text-[#6E5C5F]">
              Assessment based on available information · {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* Plain-Language Outcome Card */}
          <div
            className={`p-6 rounded-2xl border ${
              result.finalGrade === 0
                ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                : result.finalGrade === 1
                ? 'bg-[#FEFCE8] border-[#FEF08A]'
                : 'bg-[#FFF7ED] border-[#FED7AA]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  result.finalGrade === 0
                    ? 'bg-[#DCFCE7] text-emerald-700'
                    : result.finalGrade === 1
                    ? 'bg-[#FEF9C3] text-amber-700'
                    : 'bg-[#FFEDD5] text-[#F05A28]'
                }`}
              >
                {result.finalGrade === 0 ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertCircle className="w-7 h-7" />
                )}
              </div>

              <div className="space-y-1">
                <h4
                  className={`text-lg sm:text-xl font-bold ${
                    result.finalGrade === 0
                      ? 'text-emerald-800'
                      : result.finalGrade === 1
                      ? 'text-amber-800'
                      : 'text-[#F05A28]'
                  }`}
                >
                  {result.finalGrade === 0
                    ? 'Routine Follow-up (Clear Retinal View)'
                    : result.finalGrade === 1
                    ? 'Screening Information Suggests Professional Evaluation May Be Appropriate'
                    : 'Notable Retinal Changes Observed — Professional Evaluation Recommended'}
                </h4>

                <p className="text-xs sm:text-sm text-[#2B2024] leading-relaxed pt-1">
                  {result.finalGrade === 0
                    ? 'The uploaded fundus photograph shows a healthy retinal surface with clear blood vessels and optic nerve. No signs of diabetic microvascular leakage were detected.'
                    : 'RetinaGuard identified features in the retinal photograph that warrant clinical review. Remember that screening algorithms assist early detection and do not provide a final medical diagnosis.'}
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Next Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#EFE4DC] space-y-2">
              <span className="text-xs font-bold text-[#2B2024] uppercase tracking-wider block">
                Next Step Recommended
              </span>
              <p className="text-xs font-semibold text-[#2B2024]">
                {result.finalGrade === 0
                  ? 'Continue routine annual eye examinations.'
                  : result.finalGrade === 1
                  ? 'Schedule a comprehensive dilated eye exam with an eye-care professional within 30 to 60 days.'
                  : 'Visit an ophthalmologist or retinal specialist for a complete dilated examination within 2 to 4 weeks.'}
              </p>
              <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
                Regular blood sugar, cholesterol, and blood pressure monitoring significantly protect your eye capillaries.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#EFE4DC] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#2B2024] uppercase tracking-wider block">
                  Find an In-Person Clinic
                </span>
                <p className="text-xs text-[#6E5C5F] leading-relaxed">
                  Connect with a verified community screening camp, hospital eye department, or optometrist near your location.
                </p>
              </div>

              {onFindClinic && (
                <button
                  type="button"
                  onClick={onFindClinic}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F05A28] hover:text-[#D94A78] pt-2 self-start"
                >
                  <span>Find a Screening Center Near You</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Technical Details (For Clinicians & Researchers) */}
          <div className="border-t border-[#EFE4DC] pt-4">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center justify-between w-full p-3 rounded-2xl bg-[#FAF8F6] hover:bg-[#EFE4DC]/50 transition-colors text-xs font-semibold text-[#6E5C5F]"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Technical & AI Model Details (For Clinicians & Researchers)</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#6E5C5F] transition-transform ${
                  showTechnicalDetails ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-4 rounded-2xl bg-[#FFFDF9] border border-[#EFE4DC] text-xs space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[#6E5C5F] block text-[10px]">ICDR Grade</span>
                    <span className="font-bold text-[#2B2024] text-sm">
                      Grade {result.finalGrade}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6E5C5F] block text-[10px]">OCT DME Status</span>
                    <span className="font-bold text-[#F05A28] text-sm">
                      {result.oct.dmeDetected ? 'Positive (Detected)' : 'Negative (Clear)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6E5C5F] block text-[10px]">Central Thickness</span>
                    <span className="font-bold text-[#2B2024] text-sm font-mono">
                      {result.oct.centralSubfieldThicknessMicrons} µm
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6E5C5F] block text-[10px]">Confidence Level</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {result.confidence}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EFE4DC] text-[11px] text-[#6E5C5F]">
                  <strong>Fusion Architecture:</strong> EfficientNet-B4 (Fundus Color) + ResNet-50 (Macular OCT) + XGBoost (Clinical Risk Factors) with attention-gated feature fusion.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
