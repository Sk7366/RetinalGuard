import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileCheck,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  generateFundusSvg,
  generateOctSvg,
  PRESET_CASES,
  PresetPatientCase,
} from '../data/sampleCases';
import {
  ClinicalMetadata,
  DRGrade,
  FundusAnalysis,
  MultimodalTriageResult,
  OCTAnalysis,
} from '../types';
import { executeMultimodalFusion, predictMetadataRisk } from '../utils/fusionEngine';
import { RiskChip } from './RiskChip';

interface ScreeningFlowProps {
  onComplete: (result: MultimodalTriageResult) => void;
  initialPreset?: PresetPatientCase | null;
}

export const ScreeningFlow: React.FC<ScreeningFlowProps> = ({ onComplete, initialPreset }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Fundus state
  const [selectedFundusGrade, setSelectedFundusGrade] = useState<DRGrade>(
    initialPreset ? initialPreset.drGrade : 2
  );
  const [fundusImageName, setFundusImageName] = useState<string>(
    initialPreset ? initialPreset.expectedTriage.fundusImageName : 'aptos_2019_sample_021.png'
  );
  const [customFundusUrl, setCustomFundusUrl] = useState<string | null>(null);
  const [showClahePreview, setShowClahePreview] = useState<boolean>(false);

  // Step 2: OCT state
  const [includeOct, setIncludeOct] = useState<boolean>(true);
  const [selectedOctType, setSelectedOctType] = useState<'Normal' | 'DME' | 'CNV' | 'Drusen'>(
    initialPreset ? initialPreset.octType : 'DME'
  );
  const [octImageName, setOctImageName] = useState<string>(
    initialPreset ? initialPreset.expectedTriage.octImageName || 'oct_bscan_kermany_084.png' : 'oct_bscan_kermany_084.png'
  );
  const [customOctUrl, setCustomOctUrl] = useState<string | null>(null);

  // Step 3: Clinical Metadata state
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [patientId, setPatientId] = useState<string>(
    initialPreset ? initialPreset.patientCode : `PT-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [patientName, setPatientName] = useState<string>(
    initialPreset ? initialPreset.name : 'Outpatient Screening'
  );

  const [clinicalData, setClinicalData] = useState<ClinicalMetadata>(
    initialPreset
      ? initialPreset.clinicalMetadata
      : {
          hba1c: 8.8,
          diabetesDurationYears: 11,
          systolicBp: 144,
          diastolicBp: 88,
          serumCreatinine: 1.25,
          age: 61,
          bmi: 29.4,
          insulinTherapy: true,
          priorLaser: false,
          visualAcuityLogMar: 0.3,
        }
  );

  // Loading animation state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<number>(0);

  const processingSteps = [
    'Applying CLAHE local illumination normalization & Ben Graham transform (512×512)...',
    'Executing EfficientNet-B4 ONNX inference (5-class ordinal DR prediction)...',
    'Computing fundus Grad-CAM class activation maps across retinal vascular arcades...',
    'Running DenseNet-121 ONNX on cross-sectional OCT B-scan for DME fluid detection...',
    'Evaluating XGBoost clinical metadata model & computing SHAP feature attributions...',
    'Synthesizing rule-based multimodal triage score & checking DME escalation criteria...',
  ];

  // Load a preset directly
  const applyPreset = (preset: PresetPatientCase) => {
    setSelectedFundusGrade(preset.drGrade);
    setFundusImageName(preset.expectedTriage.fundusImageName);
    setCustomFundusUrl(null);

    setIncludeOct(true);
    setSelectedOctType(preset.octType);
    setOctImageName(preset.expectedTriage.octImageName || 'oct_scan.png');
    setCustomOctUrl(null);

    setIncludeMetadata(true);
    setPatientId(preset.patientCode);
    setPatientName(preset.name);
    setClinicalData(preset.clinicalMetadata);
  };

  // Handle custom fundus file upload
  const handleFundusFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFundusImageName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCustomFundusUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom OCT file upload
  const handleOctFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOctImageName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCustomOctUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger analysis pipeline
  const handleSubmitScreening = async () => {
    setIsProcessing(true);
    setProcessingStage(0);

    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStage(i);
      await new Promise((r) => setTimeout(r, 420));
    }

    // Compute Fundus Analysis
    const fundusGrade = selectedFundusGrade;
    let probs: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    probs[fundusGrade] = 0.85;
    // Distribute remaining across neighbors
    if (fundusGrade > 0) probs[fundusGrade - 1] = 0.10;
    if (fundusGrade < 4) probs[fundusGrade + 1] = 0.05;

    const fundusAnalysis: FundusAnalysis = {
      grade: fundusGrade,
      gradeLabel: `Grade ${fundusGrade}`,
      probabilities: probs,
      inferenceMs: 146,
      camHotspots: [
        { x: 340, y: 230, radius: 45, label: 'Macular Hard Exudate Circinate Cluster', intensity: 0.88 },
        { x: 260, y: 190, radius: 35, label: 'Intraretinal Microaneurysms / Blot Hemorrhages', intensity: 0.76 },
      ],
      featuresDetected:
        fundusGrade === 0
          ? ['Normal optic disc rim', 'Foveal reflex sharp', 'Clear vascular arcades']
          : fundusGrade === 1
          ? ['Isolated microaneurysms in temporal arcade', 'No hard exudates']
          : fundusGrade === 2
          ? ['Microaneurysms in multiple quadrants', 'Hard exudate circinate ring', 'Blot hemorrhages']
          : fundusGrade === 3
          ? ['Intraretinal hemorrhages >20 in 4 quadrants', 'Definite venous beading', 'Cotton-wool spots']
          : ['Optic disc neovascularization (NVD)', 'Preretinal hemorrhage', 'Fibrovascular proliferation'],
    };

    // Compute OCT Analysis if provided
    let octAnalysis: OCTAnalysis | undefined = undefined;
    if (includeOct) {
      const isDme = selectedOctType === 'DME';
      octAnalysis = {
        present: true,
        predictedClass: selectedOctType,
        dmeDetected: isDme,
        dmeProbability: isDme ? 0.948 : 0.032,
        classProbabilities: {
          Normal: selectedOctType === 'Normal' ? 0.94 : 0.02,
          DME: selectedOctType === 'DME' ? 0.95 : 0.03,
          CNV: selectedOctType === 'CNV' ? 0.92 : 0.02,
          Drusen: selectedOctType === 'Drusen' ? 0.91 : 0.03,
        },
        inferenceMs: 98,
        retinalLayerFindings: isDme
          ? [
              'Intraretinal cystoid fluid spaces in outer nuclear layer',
              'Subretinal fluid detachment',
              'Central subfield thickness 398 µm (thickened)',
            ]
          : [
              'Normal foveal depression intact',
              'Preserved IS/OS ellipsoid zone band',
              'Normal central thickness 245 µm',
            ],
      };
    }

    // Compute Metadata Analysis if provided
    let metadataAnalysis = undefined;
    if (includeMetadata) {
      metadataAnalysis = predictMetadataRisk(clinicalData);
    }

    const fundusUrl = customFundusUrl || generateFundusSvg(fundusGrade, 'normal');
    const fundusClahe = generateFundusSvg(fundusGrade, 'clahe');
    const fundusCam = generateFundusSvg(fundusGrade, 'gradcam');
    const octUrl = includeOct ? customOctUrl || generateOctSvg(selectedOctType, 'scan') : undefined;
    const octCam = includeOct ? generateOctSvg(selectedOctType, 'gradcam') : undefined;

    const result = executeMultimodalFusion({
      fundus: fundusAnalysis,
      oct: octAnalysis,
      metadata: metadataAnalysis,
      clinicalInput: clinicalData,
      patientId,
      patientName,
      fundusImageName,
      octImageName: includeOct ? octImageName : undefined,
      fundusImageUrl: fundusUrl,
      fundusClaheUrl: fundusClahe,
      fundusCamUrl: fundusCam,
      octImageUrl: octUrl,
      octCamUrl: octCam,
    });

    setIsProcessing(false);
    onComplete(result);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* STEPPER HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE4DC]">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2628] flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-[#EA580C]" />
              <span>Diabetic Retinopathy Screening Workflow</span>
            </h1>
            <p className="text-xs text-[#6E5C5F] mt-0.5">
              Follow the 3-step multimodal pipeline to grade DR severity, detect macular edema, and compute explainable risk.
            </p>
          </div>

          {/* Quick Preset loader dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6E5C5F] font-medium hidden md:inline">Preset:</span>
            <select
              id="flow-preset-picker"
              onChange={(e) => {
                const found = PRESET_CASES.find((c) => c.id === e.target.value);
                if (found) applyPreset(found);
              }}
              defaultValue=""
              className="text-xs bg-[#FFF7ED]/50 border border-[#FED7AA] text-[#2E2628] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-[#EA580C]"
            >
              <option value="" disabled>
                Select Benchmark Sample Case...
              </option>
              {PRESET_CASES.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  Grade {preset.drGrade}: {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Progress Steps Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 text-xs font-medium">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
              currentStep === 1
                ? 'bg-[#FFF7ED] border-[#FDBA74] text-[#C2410C] shadow-xs'
                : 'bg-white border-[#EFE4DC] text-[#6E5C5F] hover:bg-[#FFF7ED]/30'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 1 ? 'bg-[#EA580C] text-white' : 'bg-[#FBF4EE] text-[#6E5C5F]'
              }`}
            >
              1
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate">Step 1: Fundus Image</p>
              <p className="text-[11px] opacity-80 truncate">5-Class DR (Mandatory)</p>
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
              currentStep === 2
                ? 'bg-[#FDF2F8] border-[#FBCFE8] text-[#BE185D] shadow-xs'
                : 'bg-white border-[#EFE4DC] text-[#6E5C5F] hover:bg-[#FDF2F8]/30'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 2 ? 'bg-[#DB2777] text-white' : 'bg-[#FBF4EE] text-[#6E5C5F]'
              }`}
            >
              2
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate">Step 2: OCT B-Scan</p>
              <p className="text-[11px] opacity-80 truncate">DME Depth (Optional)</p>
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => setCurrentStep(3)}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
              currentStep === 3
                ? 'bg-gradient-to-r from-[#FFF7ED] to-[#FDF2F8] border-[#FDBA74] text-[#9D174D] shadow-xs'
                : 'bg-white border-[#EFE4DC] text-[#6E5C5F] hover:bg-[#FFF7ED]/30'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 3 ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white' : 'bg-[#FBF4EE] text-[#6E5C5F]'
              }`}
            >
              3
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate">Step 3: Clinical Data</p>
              <p className="text-[11px] opacity-80 truncate">HbA1c & History (SHAP)</p>
            </div>
          </button>
        </div>
      </div>

      {/* PROCESSING OVERLAY MODAL */}
      {isProcessing && (
        <div className="bg-white rounded-2xl border border-[#EA580C] p-8 shadow-lg text-center space-y-6 animate-pulse">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-serif font-bold text-[#2E2628]">Executing Multimodal Inference Pipeline</h2>
            <p className="text-xs text-[#6E5C5F] font-mono max-w-md mx-auto">
              Simulating FastAPI server runtime with deterministic ONNX engines & Grad-CAM synthesis
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2 text-left bg-[#FFFDFB] p-4 rounded-xl border border-[#EFE4DC]">
            {processingSteps.map((step, idx) => (
              <div
                key={step}
                className={`flex items-start gap-2.5 text-xs transition-opacity ${
                  idx === processingStage
                    ? 'font-bold text-[#EA580C]'
                    : idx < processingStage
                    ? 'text-[#10B981]'
                    : 'text-[#9E8D91] opacity-60'
                }`}
              >
                {idx < processingStage ? (
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                ) : idx === processingStage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#EA580C] shrink-0 mt-0.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#EFE4DC] inline-block shrink-0 mt-0.5 text-center text-[9px] leading-3.5">
                    {idx + 1}
                  </span>
                )}
                <span className="leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: FUNDUS PHOTOGRAPHY UPLOAD */}
      {!isProcessing && currentStep === 1 && (
        <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                <h2 className="text-lg font-serif font-bold text-[#C2410C]">Step 1: Color Fundus Photography</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                  Primary Stream · EfficientNet-B4
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-1">
                Upload a 512×512 retinal fundus photograph or pick from verified benchmark training images (APTOS / EyePACS / IDRiD):
              </p>
            </div>

            {/* CLAHE Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6E5C5F]">CLAHE Preview:</span>
              <button
                type="button"
                onClick={() => setShowClahePreview(!showClahePreview)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                  showClahePreview
                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                    : 'bg-[#FFF7ED]/50 text-[#2E2628] border-[#FED7AA]'
                }`}
              >
                {showClahePreview ? 'CLAHE On' : 'Standard'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Fundus Preview Stage */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-square max-w-sm mx-auto bg-[#140200] rounded-2xl overflow-hidden border-2 border-[#EFE4DC] shadow-inner flex items-center justify-center group">
                <img
                  src={
                    customFundusUrl ||
                    generateFundusSvg(selectedFundusGrade, showClahePreview ? 'clahe' : 'normal')
                  }
                  alt="Fundus Scan Preview"
                  className="w-full h-full object-contain transition-transform group-hover:scale-102"
                />

                {/* Preprocessing badge */}
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded-md border border-white/20">
                  {showClahePreview ? 'BEN GRAHAM + CLAHE (512²)' : 'RAW APERTURE RGB'}
                </div>

                {/* Grade label */}
                <div className="absolute bottom-3 right-3">
                  <RiskChip grade={selectedFundusGrade} size="sm" />
                </div>
              </div>

              <p className="text-center text-xs text-[#6E5C5F] font-mono">
                {fundusImageName} · 512×512 · 24-bit RGB
              </p>
            </div>

            {/* Right: Upload or Select Benchmark Sample */}
            <div className="md:col-span-6 space-y-4">
              {/* File Drag & Drop Zone */}
              <label className="border-2 border-dashed border-[#FDBA74] hover:border-[#EA580C] bg-[#FFF7ED]/40 rounded-xl p-6 text-center cursor-pointer transition-colors block">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFundusFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-[#EA580C] mb-2" />
                <p className="text-xs font-semibold text-[#C2410C]">
                  Click to upload custom fundus photo or drag and drop
                </p>
                <p className="text-[11px] text-[#9E8D91] mt-1">
                  Supports JPEG/PNG · Recommended 512×512 or higher
                </p>
              </label>

              {/* Or Select from APTOS 2019 Benchmark Classes */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#2E2628] block">
                  Or test with verified APTOS 2019 benchmark samples:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {([0, 1, 2, 3, 4] as DRGrade[]).map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => {
                        setSelectedFundusGrade(grade);
                        setFundusImageName(`aptos_benchmark_grade${grade}_sample.png`);
                        setCustomFundusUrl(null);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        selectedFundusGrade === grade && !customFundusUrl
                          ? 'border-[#EA580C] bg-[#FFF7ED] shadow-xs'
                          : 'border-[#EFE4DC] hover:bg-[#FFF7ED]/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RiskChip grade={grade} size="sm" />
                        <span className="text-xs text-[#2E2628] font-medium">
                          {grade === 0 && 'Clear macula & vasculature'}
                          {grade === 1 && 'Microaneurysms only'}
                          {grade === 2 && 'Hard exudate circinate ring'}
                          {grade === 3 && 'Venous beading & 4-quadrant hemorrhages'}
                          {grade === 4 && 'Disc neovascularization (NVD)'}
                        </span>
                      </div>
                      {selectedFundusGrade === grade && !customFundusUrl && (
                        <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE4DC]">
            <button
              id="step1-next-btn"
              onClick={() => setCurrentStep(2)}
              className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>Continue to Step 2: OCT Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: OCT B-SCAN UPLOAD (OPTIONAL) */}
      {!isProcessing && currentStep === 2 && (
        <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DB2777]" />
                <h2 className="text-lg font-serif font-bold text-[#BE185D]">Step 2: Optical Coherence Tomography (OCT)</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8]">
                  Secondary Stream · DenseNet-121 · Kermany et al.
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-1">
                Optional: OCT depth scans detect <strong>Diabetic Macular Edema (DME)</strong> cystoid fluid. Model works with or without OCT.
              </p>
            </div>

            {/* Include/Bypass OCT toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOct}
                onChange={(e) => setIncludeOct(e.target.checked)}
                className="rounded text-[#DB2777] focus:ring-0 accent-[#DB2777]"
              />
              <span className="text-xs font-semibold text-[#2E2628]">Include OCT Modality</span>
            </label>
          </div>

          {includeOct ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: OCT Scan Preview Stage */}
              <div className="md:col-span-6 space-y-3">
                <div className="relative aspect-[16/9] max-w-sm mx-auto bg-[#0A0B0E] rounded-2xl overflow-hidden border-2 border-[#EFE4DC] shadow-inner flex items-center justify-center group">
                  <img
                    src={customOctUrl || generateOctSvg(selectedOctType, 'scan')}
                    alt="OCT B-Scan Preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded-md border border-white/20">
                    SD-OCT B-SCAN (224²)
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#FDF2F8] text-[#BE185D] text-xs font-semibold px-2 py-0.5 rounded border border-[#FBCFE8]">
                    {selectedOctType}
                  </div>
                </div>
                <p className="text-center text-xs text-[#6E5C5F] font-mono">
                  {octImageName} · 224×224 Grayscale B-Scan
                </p>
              </div>

              {/* Right: Upload or select OCT class */}
              <div className="md:col-span-6 space-y-4">
                <label className="border-2 border-dashed border-[#FBCFE8] hover:border-[#DB2777] bg-[#FDF2F8]/40 rounded-xl p-5 text-center cursor-pointer transition-colors block">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleOctFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-7 h-7 mx-auto text-[#DB2777] mb-1.5" />
                  <p className="text-xs font-semibold text-[#BE185D]">Upload custom OCT B-scan</p>
                  <p className="text-[11px] text-[#9E8D91]">Kermany dataset / Spectralis / Cirrus format</p>
                </label>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#2E2628] block">
                    Or select Kermany 2018 OCT pathology category:
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {(['DME', 'Normal', 'CNV', 'Drusen'] as const).map((octClass) => (
                      <button
                        key={octClass}
                        type="button"
                        onClick={() => {
                          setSelectedOctType(octClass);
                          setOctImageName(`oct_kermany_${octClass.toLowerCase()}_sample.png`);
                          setCustomOctUrl(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedOctType === octClass && !customOctUrl
                            ? 'border-[#DB2777] bg-[#FDF2F8] font-bold text-[#BE185D] shadow-xs'
                            : 'border-[#EFE4DC] hover:bg-[#FDF2F8]/30 text-[#2E2628]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{octClass}</span>
                          {octClass === 'DME' && (
                            <span className="text-[10px] bg-[#EA580C] text-white px-1.5 py-0.2 rounded font-mono">
                              DR-Linked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-normal text-[#6E5C5F] mt-0.5">
                          {octClass === 'DME' && 'Cystoid intraretinal fluid'}
                          {octClass === 'Normal' && 'Sharp foveal depression'}
                          {octClass === 'CNV' && 'Choroidal neovascularization'}
                          {octClass === 'Drusen' && 'Sub-RPE nodular deposits'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FFFDFB] rounded-xl border border-dashed border-[#EFE4DC] space-y-2">
              <Layers className="w-8 h-8 mx-auto text-[#9E8D91]" />
              <p className="text-sm font-semibold text-[#2E2628]">OCT Modality Bypassed</p>
              <p className="text-xs text-[#6E5C5F] max-w-md mx-auto">
                The decision support engine will proceed using the Fundus + Clinical Metadata dual-stream model
                (0.65 Fundus + 0.35 Metadata).
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#EFE4DC]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#6E5C5F] hover:bg-[#FBF4EE] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 1</span>
            </button>

            <button
              id="step2-next-btn"
              onClick={() => setCurrentStep(3)}
              className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>Continue to Step 3: Clinical Metadata</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: CLINICAL METADATA & FUSION EXECUTION */}
      {!isProcessing && currentStep === 3 && (
        <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE4DC] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                <h2 className="text-lg font-serif font-bold text-[#2E2628]">Step 3: Structured Clinical Metadata</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                  XGBoost + SHAP Attributions (UKPDS / DCCT)
                </span>
              </div>
              <p className="text-xs text-[#6E5C5F] mt-1">
                Clinical history contextualizes visual imaging. Features are calibrated against published epidemiological trial distributions.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded text-[#EA580C] focus:ring-0 accent-[#EA580C]"
              />
              <span className="text-xs font-semibold text-[#2E2628]">Include Clinical Parameters</span>
            </label>
          </div>

          {includeMetadata ? (
            <div className="space-y-6">
              {/* Patient Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC]">
                <div>
                  <label className="text-xs font-semibold text-[#2E2628] block mb-1">
                    Patient Reference / MRN
                  </label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full text-xs bg-white border border-[#EFE4DC] rounded-lg px-3 py-2 text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2E2628] block mb-1">
                    Clinical Session Label
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs bg-white border border-[#EFE4DC] rounded-lg px-3 py-2 text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {/* 10 Clinical Features Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* HbA1c */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2E2628]">HbA1c (%)</label>
                    <span className="text-[11px] font-mono text-[#EA580C] font-bold">
                      {clinicalData.hba1c}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="14.0"
                    step="0.1"
                    value={clinicalData.hba1c}
                    onChange={(e) =>
                      setClinicalData({ ...clinicalData, hba1c: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#EA580C]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9E8D91]">
                    <span>5.0% (Optimal)</span>
                    <span>8.2% (Trial Mean)</span>
                    <span>14.0%</span>
                  </div>
                </div>

                {/* Diabetes Duration */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2E2628]">Diabetes Duration (Years)</label>
                    <span className="text-[11px] font-mono text-[#DB2777] font-bold">
                      {clinicalData.diabetesDurationYears} yrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    step="1"
                    value={clinicalData.diabetesDurationYears}
                    onChange={(e) =>
                      setClinicalData({
                        ...clinicalData,
                        diabetesDurationYears: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-[#DB2777]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9E8D91]">
                    <span>0 yrs</span>
                    <span>10 yrs</span>
                    <span>35 yrs</span>
                  </div>
                </div>

                {/* Systolic Blood Pressure */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2E2628]">Systolic BP (mmHg)</label>
                    <span className="text-[11px] font-mono text-[#EA580C] font-bold">
                      {clinicalData.systolicBp} mmHg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="200"
                    step="2"
                    value={clinicalData.systolicBp}
                    onChange={(e) =>
                      setClinicalData({ ...clinicalData, systolicBp: parseInt(e.target.value) })
                    }
                    className="w-full accent-[#EA580C]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9E8D91]">
                    <span>90</span>
                    <span>130 (Target)</span>
                    <span>200</span>
                  </div>
                </div>

                {/* Diastolic Blood Pressure */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2E2628]">Diastolic BP (mmHg)</label>
                    <span className="text-[11px] font-mono text-[#2E2628] font-bold">
                      {clinicalData.diastolicBp} mmHg
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="120"
                    step="2"
                    value={clinicalData.diastolicBp}
                    onChange={(e) =>
                      setClinicalData({ ...clinicalData, diastolicBp: parseInt(e.target.value) })
                    }
                    className="w-full accent-[#EA580C]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9E8D91]">
                    <span>60</span>
                    <span>80 (Normal)</span>
                    <span>120</span>
                  </div>
                </div>

                {/* Serum Creatinine (Renal Marker) */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2E2628]">Serum Creatinine (mg/dL)</label>
                    <span className="text-[11px] font-mono text-[#DB2777] font-bold">
                      {clinicalData.serumCreatinine} mg/dL
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.05"
                    value={clinicalData.serumCreatinine}
                    onChange={(e) =>
                      setClinicalData({
                        ...clinicalData,
                        serumCreatinine: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-[#DB2777]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9E8D91]">
                    <span>0.5 (Normal)</span>
                    <span>1.2 (Borderline)</span>
                    <span>4.0 (Renal Disease)</span>
                  </div>
                </div>

                {/* Age */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2E2628]">Patient Age (Years)</label>
                    <span className="text-[11px] font-mono text-[#2E2628] font-bold">
                      {clinicalData.age} yrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="1"
                    value={clinicalData.age}
                    onChange={(e) =>
                      setClinicalData({ ...clinicalData, age: parseInt(e.target.value) })
                    }
                    className="w-full accent-[#EA580C]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9E8D91]">
                    <span>20</span>
                    <span>55</span>
                    <span>90</span>
                  </div>
                </div>

                {/* BMI */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2E2628]">Body Mass Index (BMI)</label>
                    <span className="text-[11px] font-mono text-[#2E2628] font-bold">
                      {clinicalData.bmi}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18.0"
                    max="45.0"
                    step="0.2"
                    value={clinicalData.bmi}
                    onChange={(e) =>
                      setClinicalData({ ...clinicalData, bmi: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#EA580C]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9E8D91]">
                    <span>18.5 (Normal)</span>
                    <span>25.0</span>
                    <span>45.0</span>
                  </div>
                </div>

                {/* Insulin vs Oral Meds */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[#2E2628] block">Insulin Therapy</label>
                    <p className="text-[10px] text-[#6E5C5F]">Beta-cell failure marker</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setClinicalData({
                        ...clinicalData,
                        insulinTherapy: !clinicalData.insulinTherapy,
                      })
                    }
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors ${
                      clinicalData.insulinTherapy
                        ? 'bg-[#EA580C] text-white border-[#EA580C]'
                        : 'bg-[#FFF7ED]/50 text-[#6E5C5F] border-[#FED7AA]'
                    }`}
                  >
                    {clinicalData.insulinTherapy ? 'On Insulin' : 'Oral Meds Only'}
                  </button>
                </div>

                {/* Prior Laser Photocoagulation */}
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[#2E2628] block">
                      Prior Laser Treatment
                    </label>
                    <p className="text-[10px] text-[#6E5C5F]">Past PRP or focal laser</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setClinicalData({
                        ...clinicalData,
                        priorLaser: !clinicalData.priorLaser,
                      })
                    }
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors ${
                      clinicalData.priorLaser
                        ? 'bg-[#DB2777] text-white border-[#DB2777]'
                        : 'bg-[#FFF7ED]/50 text-[#6E5C5F] border-[#FED7AA]'
                    }`}
                  >
                    {clinicalData.priorLaser ? 'History of Laser' : 'No Prior Laser'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FFFDFB] rounded-xl border border-dashed border-[#EFE4DC] space-y-2">
              <Info className="w-8 h-8 mx-auto text-[#9E8D91]" />
              <p className="text-sm font-semibold text-[#2E2628]">Clinical Parameters Bypassed</p>
              <p className="text-xs text-[#6E5C5F] max-w-md mx-auto">
                The multimodal fusion will weight the remaining imaging stream(s) accordingly.
              </p>
            </div>
          )}

          {/* Fusion Summary Preview Pill */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFF7ED] to-[#FDF2F8] border border-[#FDBA74] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-[#9D174D] uppercase tracking-wider text-[11px]">
                Active Triage Configuration
              </span>
              <p className="text-[#2E2628]">
                Fundus Grade {selectedFundusGrade} · OCT {includeOct ? selectedOctType : 'None'} ·
                Clinical HbA1c {includeMetadata ? `${clinicalData.hba1c}%` : 'Omitted'}
              </p>
            </div>

            <span className="text-[11px] font-mono text-[#C2410C] bg-white px-2.5 py-1 rounded-md border border-[#FED7AA]">
              Late Fusion: 0.55·Fundus + 0.30·Meta + 0.15·OCT
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EFE4DC]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#6E5C5F] hover:bg-[#FBF4EE] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 2</span>
            </button>

            {/* Execute Analysis Button (Orange-Pink gradient) */}
            <button
              id="submit-screening-btn"
              onClick={handleSubmitScreening}
              className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 hover:gap-2.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Execute Multimodal AI Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
