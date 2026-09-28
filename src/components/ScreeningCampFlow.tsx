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
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Layers,
  MapPin,
  Maximize2,
  Play,
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
  X,
  XCircle,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
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

export interface CampBatchPatient {
  id: string;
  patientCode: string;
  name: string;
  eye: 'OD' | 'OS';
  ageGroup: string;
  durationGroup: string;
  fundusImageName: string;
  fundusGrade: DRGrade;
  customFundusUrl?: string | null;
  qualityStatus: 'GOOD' | 'UNCERTAIN' | 'UNGRADABLE';
  isProcessed: boolean;
  triageResult?: MultimodalTriageResult;
}

const INITIAL_CAMP_BATCH: CampBatchPatient[] = [
  {
    id: 'camp-batch-1',
    patientCode: 'CAMP-BLR-043',
    name: 'Smt. Gangamma',
    eye: 'OD',
    ageGroup: '56-65',
    durationGroup: '5-10 yrs',
    fundusImageName: 'camp_blr_043_od.png',
    fundusGrade: 2,
    qualityStatus: 'GOOD',
    isProcessed: false,
  },
  {
    id: 'camp-batch-2',
    patientCode: 'CAMP-BLR-044',
    name: 'Shri Venkatesh',
    eye: 'OS',
    ageGroup: '45-55',
    durationGroup: '<5 yrs',
    fundusImageName: 'camp_blr_044_os.png',
    fundusGrade: 0,
    qualityStatus: 'GOOD',
    isProcessed: false,
  },
  {
    id: 'camp-batch-3',
    patientCode: 'CAMP-BLR-045',
    name: 'Smt. Shanthala',
    eye: 'OD',
    ageGroup: '>65',
    durationGroup: '>15 yrs',
    fundusImageName: 'camp_blr_045_od.png',
    fundusGrade: 3,
    qualityStatus: 'GOOD',
    isProcessed: false,
  },
  {
    id: 'camp-batch-4',
    patientCode: 'CAMP-BLR-046',
    name: 'Shri Manjunath',
    eye: 'OD',
    ageGroup: '56-65',
    durationGroup: '10-15 yrs',
    fundusImageName: 'camp_blr_046_od.png',
    fundusGrade: 1,
    qualityStatus: 'GOOD',
    isProcessed: false,
  },
  {
    id: 'camp-batch-5',
    patientCode: 'CAMP-BLR-047',
    name: 'Smt. Padma',
    eye: 'OS',
    ageGroup: '<45',
    durationGroup: '<5 yrs',
    fundusImageName: 'camp_blr_047_os.png',
    fundusGrade: 0,
    qualityStatus: 'GOOD',
    isProcessed: false,
  },
];

interface ScreeningCampFlowProps {
  onComplete: (result: MultimodalTriageResult) => void;
  onExitCampMode: () => void;
  onOpenBatchScreening?: () => void;
}

export const ScreeningCampFlow: React.FC<ScreeningCampFlowProps> = ({
  onComplete,
  onExitCampMode,
  onOpenBatchScreening,
}) => {
  const { t } = useTranslation();

  // Mode: Single Patient Flow vs. Batch Multi-Patient Screening
  const [campMode, setCampMode] = useState<'single' | 'batch'>('single');

  // Camp Queue state (Single Patient Flow)
  const [patientCounter, setPatientCounter] = useState<number>(43);
  const [patientCode, setPatientCode] = useState<string>('CAMP-BLR-043');
  const [selectedEye, setSelectedEye] = useState<'OD' | 'OS'>('OD');
  const [ageGroup, setAgeGroup] = useState<string>('56-65');
  const [durationGroup, setDurationGroup] = useState<string>('5-10 yrs');
  const [symptomTag, setSymptomTag] = useState<string>('Routine Outreach');

  // Fundus Photo State (Single)
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

  // Batch Screening State (Multi-Patient Flow)
  const [batchQueue, setBatchQueue] = useState<CampBatchPatient[]>(INITIAL_CAMP_BATCH);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchStageText, setBatchStageText] = useState<string>('');
  const [batchProcessed, setBatchProcessed] = useState<boolean>(false);
  const [batchSyncSuccess, setBatchSyncSuccess] = useState<string | null>(null);
  const [activeModalResult, setActiveModalResult] = useState<MultimodalTriageResult | null>(null);

  // Active fundus URL (Single)
  const activeFundusUrl = customFundusUrl || generateFundusSvg(selectedFundusGrade, 'normal');

  // Handle custom file upload (Single)
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

  // Helper to generate triage for a single patient record
  const generateTriageForRecord = (
    pCode: string,
    pName: string,
    eye: 'OD' | 'OS',
    ageGrp: string,
    durGrp: string,
    grade: DRGrade,
    fileName: string,
    imgUrl?: string | null
  ): MultimodalTriageResult => {
    const estimatedAge =
      ageGrp === '<45' ? 42 : ageGrp === '45-55' ? 51 : ageGrp === '56-65' ? 60 : 70;
    const estimatedDuration =
      durGrp === '<5 yrs'
        ? 3
        : durGrp === '5-10 yrs'
        ? 8
        : durGrp === '10-15 yrs'
        ? 12
        : 18;

    const clinicalInput: ClinicalMetadata = {
      age: estimatedAge,
      diabetesDurationYears: estimatedDuration,
      hba1c: grade >= 3 ? 9.8 : grade === 2 ? 8.4 : 7.2,
      systolicBp: grade >= 2 ? 142 : 126,
      diastolicBp: 84,
      serumCreatinine: 1.1,
      bmi: 27.2,
      insulinTherapy: grade >= 2,
      priorLaser: false,
      visualAcuityLogMar: grade >= 3 ? 0.5 : 0.2,
    };

    const probs: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    probs[grade] = 0.88;
    if (grade > 0) probs[grade - 1] = 0.08;
    if (grade < 4) probs[grade + 1] = 0.04;

    const fundusAnalysis: FundusAnalysis = {
      grade,
      gradeLabel: `Grade ${grade}`,
      probabilities: probs,
      inferenceMs: 105,
      camHotspots: [
        { x: 320, y: 220, radius: 40, label: 'Exudative ring cluster', intensity: 0.85 },
      ],
      featuresDetected:
        grade === 0
          ? ['Normal retina', 'Clear optic disc']
          : grade === 1
          ? ['Microaneurysms only']
          : grade === 2
          ? ['Hard exudates near fovea', 'Blot hemorrhages']
          : grade === 3
          ? ['Severe 4-quadrant hemorrhages', 'Venous beading']
          : ['Optic disc neovascularization', 'Vitreous hemorrhage'],
    };

    const resolvedUrl = imgUrl || generateFundusSvg(grade, 'normal');

    return executeMultimodalFusion({
      fundus: fundusAnalysis,
      clinicalInput,
      patientId: pCode,
      patientName: pName,
      fundusImageName: fileName,
      fundusImageUrl: resolvedUrl,
      fundusClaheUrl: generateFundusSvg(grade, 'clahe'),
      fundusCamUrl: generateFundusSvg(grade, 'gradcam'),
    });
  };

  // Run instant triage on current single patient
  const handleRunInstantTriage = async () => {
    setCampStage('analyzing');

    // Run mock quality check layer
    await imageQualityService.assessQuality({
      fileName: fundusImageName,
      imageDataUrl: activeFundusUrl,
      forcedPreset: qualityStatus,
    });

    // Short simulated pipeline latency
    await new Promise((r) => setTimeout(r, 600));

    const triage = generateTriageForRecord(
      patientCode,
      `Camp Intake #${patientCounter}`,
      selectedEye,
      ageGroup,
      durationGroup,
      selectedFundusGrade,
      fundusImageName,
      activeFundusUrl
    );

    setCurrentResult(triage);
    setCampStage('decision');
  };

  // "NEXT PATIENT" WORKFLOW (Single)
  const handleNextPatient = () => {
    if (currentResult) {
      onComplete(currentResult);
    }
    const nextNum = patientCounter + 1;
    setPatientCounter(nextNum);
    setPatientCode(`CAMP-BLR-0${nextNum}`);
    setCustomFundusUrl(null);
    setFundusImageName(`camp_capture_pt0${nextNum}_od.png`);
    setSelectedFundusGrade(1);
    setQualityStatus('GOOD');
    setCurrentResult(null);
    setSyncedCount((prev) => prev + 1);
    setCampStage('intake');
  };

  // BATCH FLOW: Add individual patient to queue
  const handleAddPatientToBatch = () => {
    const nextNum = 43 + batchQueue.length;
    const newPatient: CampBatchPatient = {
      id: `camp-batch-${Date.now()}`,
      patientCode: `CAMP-BLR-0${nextNum}`,
      name: `Camp Patient #${nextNum}`,
      eye: 'OD',
      ageGroup: '56-65',
      durationGroup: '5-10 yrs',
      fundusImageName: `camp_capture_pt0${nextNum}_od.png`,
      fundusGrade: ((nextNum % 4) as DRGrade),
      qualityStatus: 'GOOD',
      isProcessed: false,
    };
    setBatchQueue((prev) => [...prev, newPatient]);
    setBatchProcessed(false);
  };

  // BATCH FLOW: Load 5 quick patients
  const handleQuickLoadMore = () => {
    const currentLen = batchQueue.length;
    const additions: CampBatchPatient[] = Array.from({ length: 5 }).map((_, idx) => {
      const num = 43 + currentLen + idx;
      const grades: DRGrade[] = [0, 1, 2, 0, 3];
      return {
        id: `camp-batch-auto-${Date.now()}-${idx}`,
        patientCode: `CAMP-BLR-0${num}`,
        name: `Camp Intake #${num}`,
        eye: idx % 2 === 0 ? 'OD' : 'OS',
        ageGroup: idx % 3 === 0 ? '>65' : idx % 2 === 0 ? '56-65' : '45-55',
        durationGroup: idx % 2 === 0 ? '5-10 yrs' : '10-15 yrs',
        fundusImageName: `camp_blr_0${num}_${idx % 2 === 0 ? 'od' : 'os'}.png`,
        fundusGrade: grades[idx % grades.length],
        qualityStatus: 'GOOD',
        isProcessed: false,
      };
    });
    setBatchQueue((prev) => [...prev, ...additions]);
    setBatchProcessed(false);
  };

  // BATCH FLOW: Handle multi-file image upload
  const handleBatchFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      setBatchQueue((prev) =>
        prev.map((item, idx) => {
          if (files[idx]) {
            const file: File = files[idx];
            const isBlur = file.name.toLowerCase().includes('blur');
            return {
              ...item,
              fundusImageName: file.name,
              qualityStatus: isBlur ? 'UNGRADABLE' : 'GOOD',
              isProcessed: false,
            };
          }
          return item;
        })
      );
      setBatchProcessed(false);
    }
  };

  // BATCH FLOW: Update single row attribute
  const handleUpdateBatchItem = (id: string, updates: Partial<CampBatchPatient>) => {
    setBatchQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, isProcessed: false } : item))
    );
    setBatchProcessed(false);
  };

  // BATCH FLOW: Delete patient from batch
  const handleRemoveFromBatch = (id: string) => {
    setBatchQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // BATCH FLOW: Run batch inference on all queued patients
  const handleRunBatchScreening = async () => {
    if (batchQueue.length === 0) return;
    setIsBatchRunning(true);
    setBatchProgress(5);
    setBatchSyncSuccess(null);

    const stages = [
      'Validating retinal illumination & contrast across batch...',
      'Running EfficientNet-B4 ONNX inference on fundus arcades...',
      'Evaluating multimodal risk factors & DME markers...',
      'Synthesizing clinical disposition & referral triage...',
    ];

    for (let s = 0; s < stages.length; s++) {
      setBatchStageText(stages[s]);
      setBatchProgress(Math.round(((s + 1) / (stages.length + 1)) * 90));
      await new Promise((r) => setTimeout(r, 260));
    }

    // Process each patient with fusion engine
    const processedList: CampBatchPatient[] = batchQueue.map((p) => {
      const triage = generateTriageForRecord(
        p.patientCode,
        p.name,
        p.eye,
        p.ageGroup,
        p.durationGroup,
        p.fundusGrade,
        p.fundusImageName,
        p.customFundusUrl
      );

      return {
        ...p,
        isProcessed: true,
        triageResult: triage,
      };
    });

    setBatchQueue(processedList);
    setBatchProgress(100);
    setBatchStageText('Batch screening completed for all patients!');
    await new Promise((r) => setTimeout(r, 200));
    setIsBatchRunning(false);
    setBatchProcessed(true);
  };

  // BATCH FLOW: Commit & sync all processed patients to camp history
  const handleSyncAllBatchPatients = () => {
    const readyItems = batchQueue.filter((p) => p.isProcessed && p.triageResult);
    if (readyItems.length === 0) return;

    readyItems.forEach((p) => {
      if (p.triageResult) {
        onComplete(p.triageResult);
      }
    });

    setSyncedCount((prev) => prev + readyItems.length);
    setBatchSyncSuccess(
      `✓ Successfully recorded and synced ${readyItems.length} patients to camp records and referral queue.`
    );
  };

  // Batch statistics
  const batchTotal = batchQueue.length;
  const batchProcessedCount = batchQueue.filter((p) => p.isProcessed).length;
  const batchPriorityCount = batchQueue.filter((p) => p.isProcessed && p.fundusGrade >= 3).length;
  const batchModerateCount = batchQueue.filter((p) => p.isProcessed && p.fundusGrade === 2).length;
  const batchLowConcernCount = batchQueue.filter((p) => p.isProcessed && p.fundusGrade <= 1).length;

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

        {/* Camp Screening Mode Switcher: Single Patient vs Batch Multi-Patient */}
        <div className="mt-4 pt-3 border-t border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F6] rounded-2xl border border-[#EFE4DC]">
            <button
              type="button"
              id="camp-switch-single-btn"
              onClick={() => setCampMode('single')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                campMode === 'single'
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:bg-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t("singlePatientIntake", "Single Patient Intake")}</span>
            </button>
            <button
              type="button"
              id="camp-switch-batch-btn"
              onClick={() => setCampMode('batch')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                campMode === 'batch'
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'text-[#6E5C5F] hover:bg-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t("batchScreeningOption", "Batch Screening (Multi-Patient)")}</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Add-On
              </span>
            </button>
          </div>

          {onOpenBatchScreening && (
            <button
              type="button"
              onClick={onOpenBatchScreening}
              className="text-xs font-semibold text-[#D84818] hover:text-[#9A3412] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t("openCsvBatchWorkspace", "Open Institutional CSV Batch Pipeline →")}</span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          CAMP MODE: BATCH SCREENING (MULTI-PATIENT)
          ===================================================================== */}
      {campMode === 'batch' && (
        <div className="space-y-6" id="camp-batch-screening-panel">
          {/* Batch Header & Controls */}
          <div className="bg-white rounded-3xl border border-[#EFE4DC] p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFEDD5] text-[#D84818] border border-[#FED7AA]">
                    <Users className="w-3 h-3" />
                    <span>Camp Batch Intake Queue</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-[#6E5C5F]">
                    {batchQueue.length} {t("patientsQueued", "Patients in Queue")}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#2E2628]">
                  {t("batchCampTitle", "Simultaneous Multi-Patient Camp Screening")}
                </h2>
                <p className="text-xs text-[#6E5C5F] mt-0.5">
                  {t("batchCampDesc", "Screen multiple field camp attendees simultaneously. Register tokens, map fundus images, and execute AI quality and DR grading in a single batch.")}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddPatientToBatch}
                  className="px-3 py-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-[#2E2628] hover:bg-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{t("addPatientBtn", "+ Add Patient")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickLoadMore}
                  className="px-3 py-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-[#2E2628] hover:bg-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{t("load5MoreBtn", "+ Load 5 More")}</span>
                </button>
                <label className="px-3 py-2 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] hover:bg-[#FFEDD5] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t("uploadBatchPhotosBtn", "Upload Batch Photos")}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBatchFilesUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Sync confirmation alert */}
            {batchSyncSuccess && (
              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-xs font-bold text-[#15803D] flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span>{batchSyncSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchSyncSuccess(null)}
                  className="text-[#15803D] hover:text-[#14532D] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Patient Batch Queue Cards */}
          <div className="bg-white rounded-3xl border border-[#EFE4DC] p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC]">
              <h3 className="text-sm font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#EA580C]" />
                <span>{t("campBatchQueueTitle", "Camp Queue Roster & Retinal Assignments")}</span>
              </h3>
              <span className="text-xs text-[#6E5C5F]">
                {batchProcessedCount} of {batchTotal} {t("screenedStatus", "Screened")}
              </span>
            </div>

            {batchQueue.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Users className="w-10 h-10 text-[#C8BCC2] mx-auto" />
                <p className="text-xs font-medium text-[#6E5C5F]">
                  {t("batchQueueEmpty", "The batch queue is currently empty. Add patients or load sample camp attendees to begin.")}
                </p>
                <button
                  type="button"
                  onClick={handleQuickLoadMore}
                  className="px-4 py-2 rounded-xl bg-[#EA580C] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t("populateCampQueueBtn", "Populate Camp Queue with 5 Attendees")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {batchQueue.map((item, idx) => {
                  const fundusThumb = item.customFundusUrl || generateFundusSvg(item.fundusGrade, 'normal');
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.isProcessed
                          ? 'bg-[#FCFBF9] border-[#BBF7D0]'
                          : 'bg-[#FAF8F6] border-[#EFE4DC] hover:border-[#EA580C]/40'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Token & Identity */}
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-white border border-[#EFE4DC] text-[#6E5C5F] text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-[#EA580C] bg-white px-2 py-0.5 rounded-lg border border-[#EFE4DC] shadow-2xs">
                                {item.patientCode}
                              </span>
                              <span className="text-xs font-bold text-[#2E2628]">{item.name}</span>
                            </div>
                            <span className="text-[11px] text-[#6E5C5F] block mt-0.5">
                              {item.fundusImageName}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Parameters */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Eye Toggle */}
                          <div className="flex items-center gap-1 p-0.5 bg-white rounded-xl border border-[#EFE4DC]">
                            <button
                              type="button"
                              onClick={() => handleUpdateBatchItem(item.id, { eye: 'OD' })}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                item.eye === 'OD'
                                  ? 'bg-[#EA580C] text-white'
                                  : 'text-[#6E5C5F] hover:bg-[#FAF8F6]'
                              }`}
                            >
                              OD (R)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateBatchItem(item.id, { eye: 'OS' })}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                item.eye === 'OS'
                                  ? 'bg-[#EA580C] text-white'
                                  : 'text-[#6E5C5F] hover:bg-[#FAF8F6]'
                              }`}
                            >
                              OS (L)
                            </button>
                          </div>

                          {/* Age selector */}
                          <select
                            value={item.ageGroup}
                            onChange={(e) => handleUpdateBatchItem(item.id, { ageGroup: e.target.value })}
                            className="text-xs py-1.5 px-2 rounded-xl bg-white border border-[#EFE4DC] text-[#2E2628] font-medium"
                          >
                            <option value="<45">&lt;45 yrs</option>
                            <option value="45-55">45-55 yrs</option>
                            <option value="56-65">56-65 yrs</option>
                            <option value=">65">&gt;65 yrs</option>
                          </select>

                          {/* Duration selector */}
                          <select
                            value={item.durationGroup}
                            onChange={(e) => handleUpdateBatchItem(item.id, { durationGroup: e.target.value })}
                            className="text-xs py-1.5 px-2 rounded-xl bg-white border border-[#EFE4DC] text-[#2E2628] font-medium"
                          >
                            <option value="<5 yrs">&lt;5 yrs DM</option>
                            <option value="5-10 yrs">5-10 yrs DM</option>
                            <option value="10-15 yrs">10-15 yrs DM</option>
                            <option value=">15 yrs">&gt;15 yrs DM</option>
                          </select>

                          {/* Fundus Preview Thumbnail & Grade selector */}
                          <div className="flex items-center gap-2">
                            <img
                              src={fundusThumb}
                              alt="Fundus"
                              className="w-8 h-8 rounded-lg object-cover border border-[#EFE4DC] bg-[#181517]"
                            />
                            <select
                              value={item.fundusGrade}
                              onChange={(e) =>
                                handleUpdateBatchItem(item.id, {
                                  fundusGrade: parseInt(e.target.value, 10) as DRGrade,
                                })
                              }
                              className="text-xs py-1.5 px-2 rounded-xl bg-white border border-[#EFE4DC] text-[#2E2628] font-semibold"
                            >
                              <option value={0}>Normal (Gr.0)</option>
                              <option value={1}>Mild (Gr.1)</option>
                              <option value={2}>Moderate (Gr.2)</option>
                              <option value={3}>Severe (Gr.3)</option>
                              <option value={4}>Proliferative (Gr.4)</option>
                            </select>
                          </div>

                          {/* Status / Result badge */}
                          {item.isProcessed && item.triageResult ? (
                            <div className="flex items-center gap-1.5">
                              <RiskChip grade={item.fundusGrade} />
                              <button
                                type="button"
                                onClick={() => setActiveModalResult(item.triageResult!)}
                                className="px-2 py-1 rounded-lg bg-white border border-[#EFE4DC] text-[11px] font-bold text-[#D84818] hover:bg-[#FFE5D8] cursor-pointer"
                              >
                                {t("viewReportBtn", "View Report")}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                              {t("readyForInference", "Ready")}
                            </span>
                          )}

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveFromBatch(item.id)}
                            className="p-1.5 rounded-lg text-[#6E5C5F] hover:text-[#DC2626] hover:bg-white transition-colors cursor-pointer"
                            title="Remove from batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Run Batch CTA Bar */}
            <div className="pt-4 border-t border-[#EFE4DC] space-y-3">
              {isBatchRunning && (
                <div className="space-y-1.5 p-4 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#EA580C]">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{batchStageText}</span>
                    </span>
                    <span>{batchProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FED7AA] overflow-hidden">
                    <div
                      className="h-full bg-[#EA580C] transition-all duration-300 rounded-full"
                      style={{ width: `${batchProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#6E5C5F]">
                  <span>{t("batchScreeningHint", "High-throughput parallel assessment runs quality checks and Multimodal AI Grading on all patients.")}</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {batchProcessed && (
                    <button
                      type="button"
                      onClick={handleSyncAllBatchPatients}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("syncAllPatientsBtn", `Sync & Save All ${batchProcessedCount} Patients`)}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    id="btn-run-camp-batch"
                    onClick={handleRunBatchScreening}
                    disabled={isBatchRunning || batchQueue.length === 0}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-[#C8BCC2] text-white text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isBatchRunning
                        ? t("screeningBatchProgress", "Screening Patients...")
                        : t("runBatchScreeningBtn", `⚡ Run Batch Screening (${batchQueue.length} Patients)`)}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Results Summary (when processed) */}
          {batchProcessed && (
            <div className="bg-white rounded-3xl border border-[#EFE4DC] p-5 sm:p-7 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#2E2628]">
                    {t("batchSummaryTitle", "Camp Batch Triage Summary")}
                  </h3>
                  <p className="text-xs text-[#6E5C5F]">
                    {t("batchSummaryDesc", "Consolidated cohort analysis ready for referral management and outreach reports.")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-[#2E2628] hover:bg-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#6E5C5F]" />
                    <span>{t("printSummaryBtn", "Print Batch Summary")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickLoadMore}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-[#2E2628] hover:bg-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>{t("screenNextBatchBtn", "Screen Next Batch")}</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] text-center">
                  <span className="text-xs text-[#6E5C5F] block">{t("totalScreened", "Total Screened")}</span>
                  <span className="text-2xl font-black text-[#2E2628]">{batchTotal}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-center">
                  <span className="text-xs text-[#DC2626] font-bold block">{t("priorityReferrals", "Priority Referrals")}</span>
                  <span className="text-2xl font-black text-[#DC2626]">{batchPriorityCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-center">
                  <span className="text-xs text-[#B45309] font-bold block">{t("moderateReview", "Moderate Review")}</span>
                  <span className="text-2xl font-black text-[#B45309]">{batchModerateCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-center">
                  <span className="text-xs text-[#15803D] font-bold block">{t("lowConcern", "Low Concern")}</span>
                  <span className="text-2xl font-black text-[#15803D]">{batchLowConcernCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Individual Result Modal */}
          {activeModalResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl border border-[#EFE4DC] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC]">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#EA580C]">
                      {activeModalResult.patientId}
                    </span>
                    <h3 className="text-base font-bold text-[#2E2628]">
                      {activeModalResult.patientName} - {t("triageEncounterReport", "Triage Encounter Report")}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalResult(null)}
                    className="p-1.5 rounded-xl hover:bg-[#FAF8F6] text-[#6E5C5F] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
                    <span className="text-xs font-bold text-[#6E5C5F] uppercase block">
                      {t("aiDrClassification", "AI DR Classification")}
                    </span>
                    <div className="flex items-center gap-2">
                      <RiskChip grade={activeModalResult.finalGrade} />
                      <span className="text-xs font-bold text-[#2E2628]">
                        Grade {activeModalResult.finalGrade}: {activeModalResult.gradeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5C5F] mt-2">
                      {activeModalResult.recommendation}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#181517] overflow-hidden aspect-[4/3] flex items-center justify-center p-2 border border-[#EFE4DC]">
                    <img
                      src={activeModalResult.fundusCamUrl}
                      alt="CAM"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1.5">
                  <span className="text-xs font-bold text-[#2E2628] uppercase">
                    {t("featuresDetected", "Detected Micro-Lesions:")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalResult.fundus.featuresDetected.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-white border border-[#EFE4DC] text-xs text-[#2E2628]"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModalResult(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#2E2628] text-white text-xs font-bold cursor-pointer"
                  >
                    {t("closeModalBtn", "Close Report")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          PHASE 1: TABLET INTAKE & PHOTO CAPTURE (SINGLE PATIENT)
          ===================================================================== */}
      {campMode === 'single' && campStage === 'intake' && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-5 sm:p-8 shadow-xs space-y-6">
          {/* Batch Mode Suggestion Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#FFF7ED] rounded-2xl border border-[#FED7AA] gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#9A3412] block">
                  {t("multipleCampPatientsBanner", "Screening a high-volume queue of waiting camp patients?")}
                </span>
                <span className="text-[11px] text-[#C2410C]">
                  {t("multipleCampPatientsSub", "Use Batch Screening to intake and grade multiple camp attendees simultaneously.")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCampMode('batch')}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              {t("switchToBatchModeBtn", "Switch to Batch Screening")}
            </button>
          </div>

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
      {campMode === 'single' && campStage === 'analyzing' && (
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
      {campMode === 'single' && campStage === 'decision' && currentResult && (
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
