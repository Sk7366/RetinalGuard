import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  MapPin,
  Maximize2,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  Stethoscope,
  Tent,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { DR_GRADES } from '../data/benchmarks';
import { generateFundusSvg, PRESET_CASES } from '../data/sampleCases';
import { imageQualityService } from '../services/imageQualityService';
import {
  ClinicalMetadata,
  DRGrade,
  FundusAnalysis,
  ImageQualityAssessment,
  MultimodalTriageResult,
} from '../types';
import { executeMultimodalFusion } from '../utils/fusionEngine';
import { RiskChip } from './RiskChip';

interface ScreeningCampFlowProps {
  onComplete: (result: MultimodalTriageResult) => void;
  onExitCampMode: () => void;
}

export const ScreeningCampFlow: React.FC<ScreeningCampFlowProps> = ({
  onComplete,
  onExitCampMode,
}) => {
  // Camp Queue state
  const [patientCounter, setPatientCounter] = useState<number>(43);
  const [patientCode, setPatientCode] = useState<string>('CAMP-BLR-043');
  const [selectedEye, setSelectedEye] = useState<'OD' | 'OS'>('OD');
  const [ageGroup, setAgeGroup] = useState<string>('56-65');
  const [durationGroup, setDurationGroup] = useState<string>('5-10 yrs');
  const [symptomTag, setSymptomTag] = useState<string>('Routine Outreach');

  // Fundus Photo State
  const [selectedFundusGrade, setSelectedFundusGrade] = useState<DRGrade>(2);
  const [fundusImageName, setFundusImageName] = useState<string>('camp_capture_pt043_od.png');
  const [customFundusUrl, setCustomFundusUrl] = useState<string | null>(null);

  // Quality check state
  const [qualityStatus, setQualityStatus] = useState<'GOOD' | 'UNCERTAIN' | 'UNGRADABLE'>('GOOD');
  const [qualityChecked, setQualityChecked] = useState<boolean>(true);

  // Offline status indicator
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [syncedCount, setSyncedCount] = useState<number>(42);

  // Camp screening stages: 'intake' | 'analyzing' | 'decision'
  const [campStage, setCampStage] = useState<'intake' | 'analyzing' | 'decision'>('intake');
  const [currentResult, setCurrentResult] = useState<MultimodalTriageResult | null>(null);

  // Active fundus URL
  const activeFundusUrl = customFundusUrl || generateFundusSvg(selectedFundusGrade, 'normal');

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Run instant triage on current patient
  const handleRunInstantTriage = async () => {
    setCampStage('analyzing');

    // Run mock quality check layer
    const qualityReport = await imageQualityService.assessQuality({
      fileName: fundusImageName,
      imageDataUrl: activeFundusUrl,
      forcedPreset: qualityStatus,
    });

    // Short simulated pipeline latency
    await new Promise((r) => setTimeout(r, 600));

    // Numerical age & duration estimates from taps
    const estimatedAge =
      ageGroup === '<45' ? 42 : ageGroup === '45-55' ? 51 : ageGroup === '56-65' ? 60 : 70;
    const estimatedDuration =
      durationGroup === '<5 yrs'
        ? 3
        : durationGroup === '5-10 yrs'
        ? 8
        : durationGroup === '10-15 yrs'
        ? 12
        : 18;

    const clinicalInput: ClinicalMetadata = {
      age: estimatedAge,
      diabetesDurationYears: estimatedDuration,
      hba1c: 8.4,
      systolicBp: 140,
      diastolicBp: 85,
      serumCreatinine: 1.1,
      bmi: 27.2,
      insulinTherapy: true,
      priorLaser: false,
      visualAcuityLogMar: 0.3,
    };

    // Fundus features
    const probs: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    probs[selectedFundusGrade] = 0.88;
    if (selectedFundusGrade > 0) probs[selectedFundusGrade - 1] = 0.08;
    if (selectedFundusGrade < 4) probs[selectedFundusGrade + 1] = 0.04;

    const fundusAnalysis: FundusAnalysis = {
      grade: selectedFundusGrade,
      gradeLabel: `Grade ${selectedFundusGrade}`,
      probabilities: probs,
      inferenceMs: 110,
      camHotspots: [
        { x: 320, y: 220, radius: 40, label: 'Exudative ring cluster', intensity: 0.85 },
      ],
      featuresDetected:
        selectedFundusGrade === 0
          ? ['Normal retina', 'Clear optic disc']
          : selectedFundusGrade === 1
          ? ['Microaneurysms only']
          : selectedFundusGrade === 2
          ? ['Hard exudates near fovea', 'Blot hemorrhages']
          : selectedFundusGrade === 3
          ? ['Severe 4-quadrant hemorrhages']
          : ['Optic disc neovascularization'],
    };

    const triage = executeMultimodalFusion({
      fundus: fundusAnalysis,
      clinicalInput,
      patientId: patientCode,
      patientName: `Camp Intake #${patientCounter}`,
      fundusImageName,
      fundusImageUrl: activeFundusUrl,
      fundusClaheUrl: generateFundusSvg(selectedFundusGrade, 'clahe'),
      fundusCamUrl: generateFundusSvg(selectedFundusGrade, 'gradcam'),
    });

    setCurrentResult(triage);
    setCampStage('decision');
  };

  // "NEXT PATIENT" WORKFLOW: 1-tap reset to next queue item
  const handleNextPatient = () => {
    if (currentResult) {
      onComplete(currentResult);
    }
    const nextNum = patientCounter + 1;
    setPatientCounter(nextNum);
    setPatientCode(`CAMP-BLR-0${nextNum}`);
    setCustomFundusUrl(null);
    setFundusImageName(`camp_capture_pt0${nextNum}_od.png`);
    setSelectedFundusGrade(1); // Default to mild/moderate rotation
    setQualityStatus('GOOD');
    setCurrentResult(null);
    setSyncedCount((prev) => prev + 1);
    setCampStage('intake');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-16 select-none" id="screening-camp-root">
      {/* Tablet-Optimized Camp Banner */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C] shrink-0">
              <Tent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                  Mobile Camp High-Speed Mode
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  SIMULATED DATA
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[#2E2628]">
                Community Camp: Bengaluru Rural (Kengeri PHC)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Offline Mode Toggle Pill */}
            <button
              type="button"
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                isOffline
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
                  : 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isOffline ? 'Offline (Local Cache)' : 'Online Synced'}</span>
            </button>

            {/* Exit Camp Mode */}
            <button
              type="button"
              onClick={onExitCampMode}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-[#6E5C5F] text-xs font-semibold hover:text-[#2E2628] hover:bg-white"
            >
              Exit Camp
            </button>
          </div>
        </div>

        {/* Camp Throughput Bar */}
        <div className="mt-4 pt-3 border-t border-[#EFE4DC] flex items-center justify-between text-xs text-[#6E5C5F] flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Today Screened: <strong className="text-[#2E2628]">{syncedCount}</strong></span>
            </span>
            <span>Target: <strong>80 patients</strong></span>
            <span className="text-[#15803D] font-semibold">Speed: ~1.2 min/patient</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-[#6E5C5F]">
            <span>Active Station: Retinal Camera #01</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PHASE 1: TABLET INTAKE & PHOTO CAPTURE
          ===================================================================== */}
      {campStage === 'intake' && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-5 sm:p-8 shadow-xs space-y-6">
          {/* Top Token Bar */}
          <div className="flex items-center justify-between p-3.5 bg-[#FAF8F6] rounded-2xl border border-[#EFE4DC]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#6E5C5F] uppercase">Current Patient:</span>
              <span className="text-base sm:text-lg font-black font-mono text-[#EA580C] bg-white px-3 py-1 rounded-xl border border-[#EFE4DC] shadow-2xs">
                {patientCode}
              </span>
            </div>

            {/* Large Eye Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#EFE4DC]">
              <button
                type="button"
                onClick={() => setSelectedEye('OD')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  selectedEye === 'OD'
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-[#6E5C5F] hover:bg-[#FAF8F6]'
                }`}
              >
                OD (Right Eye)
              </button>
              <button
                type="button"
                onClick={() => setSelectedEye('OS')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  selectedEye === 'OS'
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-[#6E5C5F] hover:bg-[#FAF8F6]'
                }`}
              >
                OS (Left Eye)
              </button>
            </div>
          </div>

          {/* Large-Tap Minimal Demographic Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Age Range Tap Buttons */}
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
              <label className="text-xs font-bold text-[#2E2628] uppercase tracking-wider block">
                1. Patient Age Range (1-Tap):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['<45', '45-55', '56-65', '>65'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setAgeGroup(range)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                      ageGroup === range
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                        : 'bg-white text-[#2E2628] border-[#EFE4DC] hover:bg-[#FFF7ED]'
                    }`}
                  >
                    {range} yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Diabetes Duration Tap Buttons */}
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
              <label className="text-xs font-bold text-[#2E2628] uppercase tracking-wider block">
                2. Known Diabetes Duration (1-Tap):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['<5 yrs', '5-10 yrs', '10-15 yrs', '>15 yrs'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationGroup(dur)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                      durationGroup === dur
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs'
                        : 'bg-white text-[#2E2628] border-[#EFE4DC] hover:bg-[#FFF7ED]'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Easy Photo Upload / Camera Connection Box */}
          <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#EA580C]" />
                <span>3. Retinal Fundus Photo (OD/OS):</span>
              </label>

              {/* Sample Preset Selector for Offline/Field Demos */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-[#6E5C5F]">Field Preset:</span>
                {[
                  { grade: 0, label: 'Normal' },
                  { grade: 1, label: 'Mild' },
                  { grade: 2, label: 'Moderate' },
                  { grade: 3, label: 'Severe' },
                ].map((p) => (
                  <button
                    key={p.grade}
                    type="button"
                    onClick={() => {
                      setSelectedFundusGrade(p.grade as DRGrade);
                      setCustomFundusUrl(null);
                      setFundusImageName(`camp_benchmark_gr${p.grade}.png`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                      selectedFundusGrade === p.grade && !customFundusUrl
                        ? 'bg-[#EA580C] text-white border-[#EA580C]'
                        : 'bg-white text-[#2E2628] border-[#EFE4DC] hover:bg-[#FFF7ED]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Preview & Quality Quick Assessment */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Image Preview */}
              <div className="sm:col-span-4 rounded-2xl bg-[#181517] overflow-hidden aspect-[4/3] flex items-center justify-center p-2 relative border border-[#EFE4DC]">
                <img
                  src={activeFundusUrl}
                  alt="Camp Fundus"
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-[10px] font-mono text-white px-2 py-0.5 rounded">
                  {selectedEye} · 512×512
                </div>
              </div>

              {/* Quality & Retake Fast Controls */}
              <div className="sm:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2E2628]">Image Quality Gate:</span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EFE4DC]">
                    <button
                      type="button"
                      onClick={() => setQualityStatus('GOOD')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        qualityStatus === 'GOOD'
                          ? 'bg-[#15803D] text-white shadow-2xs'
                          : 'text-[#6E5C5F]'
                      }`}
                    >
                      Good
                    </button>
                    <button
                      type="button"
                      onClick={() => setQualityStatus('UNCERTAIN')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        qualityStatus === 'UNCERTAIN'
                          ? 'bg-[#D97706] text-white shadow-2xs'
                          : 'text-[#6E5C5F]'
                      }`}
                    >
                      Uncertain
                    </button>
                    <button
                      type="button"
                      onClick={() => setQualityStatus('UNGRADABLE')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        qualityStatus === 'UNGRADABLE'
                          ? 'bg-[#DC2626] text-white shadow-2xs'
                          : 'text-[#6E5C5F]'
                      }`}
                    >
                      Ungradable
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#6E5C5F] leading-relaxed">
                  {qualityStatus === 'GOOD'
                    ? 'Scan sharpness and illumination verified for automated AI inference.'
                    : qualityStatus === 'UNCERTAIN'
                    ? 'Mild motion blur detected. Patient can be evaluated with warning flag.'
                    : 'Glare arc obscuring fovea. Ask patient to blink and reposition camera.'}
                </p>

                {/* File Upload / Camera Trigger Button */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EFE4DC] text-xs font-bold text-[#2E2628] hover:bg-[#FAF8F6] shadow-2xs">
                    <Upload className="w-4 h-4 text-[#EA580C]" />
                    <span>Upload from Camera / File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {qualityStatus === 'UNGRADABLE' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomFundusUrl(null);
                        setQualityStatus('GOOD');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Required</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HUGE PRIMARY ACTION BUTTON: RUN INSTANT TRIAGE */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-camp-run-triage"
              onClick={handleRunInstantTriage}
              className="w-full py-4 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-base sm:text-lg font-black transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              <Sparkles className="w-6 h-6" />
              <span>RUN INSTANT AI TRIAGE ({patientCode})</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          PHASE 2: ANALYZING (LIGHTNING FAST)
          ===================================================================== */}
      {campStage === 'analyzing' && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center mx-auto shadow-xs animate-spin">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#2E2628]">Evaluating Retinal Scan...</h2>
          <p className="text-xs text-[#6E5C5F]">
            Executing EfficientNet-B4 &amp; Local Illumination Normalization for {patientCode}
          </p>
        </div>
      )}

      {/* =====================================================================
          PHASE 3: TRIAGE DECISION & "NEXT PATIENT" WORKFLOW
          ===================================================================== */}
      {campStage === 'decision' && currentResult && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE4DC]">
            <div>
              <div className="text-xs font-bold text-[#6E5C5F] uppercase tracking-wider">
                Instant Camp Triage Result
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#2E2628] mt-0.5 flex items-center gap-3">
                <span>{patientCode}</span>
                <span className="text-sm font-bold text-[#6E5C5F]">({selectedEye})</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RiskChip grade={currentResult.finalGrade} size="lg" />
            </div>
          </div>

          {/* Large Visual Decision Matrix */}
          <div
            className={`p-6 rounded-3xl border space-y-3 ${
              currentResult.finalGrade === 0
                ? 'bg-[#F0FDF4] border-[#86EFAC]'
                : currentResult.finalGrade === 1
                ? 'bg-[#F0FDF4] border-[#86EFAC]'
                : currentResult.finalGrade === 2
                ? 'bg-[#FFFBEB] border-[#FCD34D]'
                : 'bg-[#FEF2F2] border-[#FCA5A5]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-[#2E2628]">
                Grade {currentResult.finalGrade}: {currentResult.gradeLabel}
              </h3>
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-white text-[#2E2628] shadow-2xs">
                Inference: {currentResult.fundus.inferenceMs} ms
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#2E2628] font-medium leading-relaxed">
              {currentResult.recommendation}
            </p>

            {/* Fast Action Recommendation */}
            <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-[#2E2628]">Clinical Disposition:</span>
              <span className="px-3 py-1 rounded-lg bg-white font-bold text-[#EA580C] shadow-2xs">
                {currentResult.finalGrade >= 3
                  ? 'Priority Specialist Referral'
                  : currentResult.finalGrade === 2
                  ? 'Review Recommended in 3–6 Months'
                  : 'Routine 12-Month Annual Recall'}
              </span>
            </div>
          </div>

          {/* Quick Snapshot Heatmap & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-4 rounded-2xl bg-[#181517] overflow-hidden aspect-[4/3] flex items-center justify-center p-2 border border-[#EFE4DC]">
              <img
                src={currentResult.fundusCamUrl}
                alt="Grad-CAM"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div className="sm:col-span-8 space-y-2 text-xs">
              <div className="font-bold text-[#2E2628] uppercase text-[11px]">
                Detected Micro-Lesions:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentResult.fundus.featuresDetected.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F6] border border-[#EFE4DC] text-[#2E2628]"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-[#6E5C5F] pt-2">
                Patient SMS directions queued for Victoria Hospital Retina Clinic. Encounter cached in local SQLite storage.
              </div>
            </div>
          </div>

          {/* HUGE "NEXT PATIENT" ACTION BUTTON */}
          <div className="pt-4 border-t border-[#EFE4DC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCampStage('intake')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6]"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              <span>Modify Current Patient</span>
            </button>

            {/* The primary "NEXT PATIENT" button */}
            <button
              type="button"
              id="btn-camp-next-patient"
              onClick={handleNextPatient}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white text-base font-black transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              <UserPlus className="w-5 h-5" />
              <span>SAVE &amp; NEXT PATIENT (CAMP-BLR-0{patientCounter + 1}) →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
