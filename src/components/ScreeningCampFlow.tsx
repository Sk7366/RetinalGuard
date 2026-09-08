import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileCheck,
  HelpCircle,
  Layers,
  RotateCcw,
  Sparkles,
  Tent,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { generateFundusSvg, PRESET_CASES } from '../data/sampleCases';
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
  const [patientCounter, setPatientCounter] = useState(42);
  const [patientId, setPatientId] = useState(`CAMP-BLR-042`);
  const [patientAge, setPatientAge] = useState<number>(56);
  const [diabetesDuration, setDiabetesDuration] = useState<number>(8);
  const [selectedFundusGrade, setSelectedFundusGrade] = useState<DRGrade>(2);
  const [customFundusUrl, setCustomFundusUrl] = useState<string | null>(null);

  // Quality check state
  const [qualityChecked, setQualityChecked] = useState<boolean>(true);
  const [qualityStatus, setQualityStatus] = useState<'GOOD' | 'UNCERTAIN' | 'UNGRADABLE'>('GOOD');

  // Offline status indicator
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [syncedCount, setSyncedCount] = useState<number>(41);

  // Stage in current patient loop
  const [campStage, setCampStage] = useState<'capture' | 'analyzing' | 'result'>('capture');
  const [lastResult, setLastResult] = useState<MultimodalTriageResult | null>(null);

  const handleNextPatient = () => {
    const nextNum = patientCounter + 1;
    setPatientCounter(nextNum);
    setPatientId(`CAMP-BLR-0${nextNum}`);
    setPatientAge(55);
    setDiabetesDuration(6);
    setSelectedFundusGrade(nextNum % 2 === 0 ? 0 : 2);
    setCustomFundusUrl(null);
    setQualityChecked(true);
    setQualityStatus('GOOD');
    setCampStage('capture');
    setLastResult(null);
  };

  const handleRunCampAnalysis = async () => {
    setCampStage('analyzing');
    await new Promise((r) => setTimeout(r, 650));

    const fundusAnalysis: FundusAnalysis = {
      grade: selectedFundusGrade,
      gradeLabel: `Grade ${selectedFundusGrade}`,
      probabilities: [0.1, 0.1, 0.7, 0.08, 0.02],
      inferenceMs: 122,
      camHotspots: [
        { x: 300, y: 220, radius: 40, label: 'Temporal Arcade Vascular Shift', intensity: 0.82 },
      ],
      featuresDetected:
        selectedFundusGrade === 0
          ? ['Normal optic disc', 'No microaneurysms detected']
          : ['Microaneurysms detected', 'Hard exudate cluster'],
    };

    const clinicalInput: ClinicalMetadata = {
      hba1c: 8.4,
      diabetesDurationYears: diabetesDuration,
      systolicBp: 138,
      diastolicBp: 86,
      serumCreatinine: 1.1,
      age: patientAge,
      bmi: 27.8,
      insulinTherapy: false,
      priorLaser: false,
      visualAcuityLogMar: 0.2,
    };

    const triageResult = executeMultimodalFusion({
      fundus: fundusAnalysis,
      clinicalInput,
      patientId,
      patientName: `Camp Participant ${patientId}`,
      fundusImageName: `camp_fundus_${patientId}.png`,
      fundusImageUrl: customFundusUrl || generateFundusSvg(selectedFundusGrade, 'normal'),
      fundusClaheUrl: generateFundusSvg(selectedFundusGrade, 'clahe'),
      fundusCamUrl: generateFundusSvg(selectedFundusGrade, 'gradcam'),
    });

    setLastResult(triageResult);
    setSyncedCount((prev) => prev + 1);
    setCampStage('result');
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Tablet-First Camp Header Bar */}
      <div className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] rounded-2xl p-4 sm:p-5 text-white shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs text-white">
              <Tent className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">
              Community Screening Camp Mode • September 2026
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
            Bengaluru Rural Outreach (Kengeri Camp #3)
          </h2>
          <p className="text-xs text-white/80 mt-0.5">
            Optimized for fast-paced tablet entry & high throughput
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Offline/Online toggle */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors ${
              isOffline ? 'bg-amber-400 text-[#2E2628]' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Offline (Syncing Local)' : 'Online Synced'}</span>
          </button>

          <button
            onClick={onExitCampMode}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#EA580C] hover:bg-[#FFF7ED] transition-colors"
          >
            Exit Camp Mode
          </button>
        </div>
      </div>

      {/* Camp Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-white border border-[#EFE4DC] text-center shadow-xs">
          <div className="text-xs font-semibold text-[#6E5C5F]">Patients Screened Today</div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-[#EA580C] mt-1">
            {syncedCount}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#EFE4DC] text-center shadow-xs">
          <div className="text-xs font-semibold text-[#6E5C5F]">Current In-Queue</div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-[#2E2628] mt-1">
            #{patientCounter}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-[#EFE4DC] text-center shadow-xs">
          <div className="text-xs font-semibold text-[#6E5C5F]">Avg Time per Person</div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-[#059669] mt-1">
            1m 45s
          </div>
        </div>
      </div>

      {/* Main Workflow Card */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-sm">
        {campStage === 'capture' && (
          <div className="space-y-6">
            {/* Step 1: Rapid Patient Registration */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                    Screening ID
                  </span>
                  <div className="font-mono font-bold text-base text-[#2E2628]">{patientId}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#6E5C5F] block mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-20 px-3 py-1.5 rounded-lg border border-[#EFE4DC] text-xs font-bold text-[#2E2628] text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6E5C5F] block mb-1">
                    Diabetes Yrs
                  </label>
                  <input
                    type="number"
                    value={diabetesDuration}
                    onChange={(e) => setDiabetesDuration(Number(e.target.value))}
                    className="w-20 px-3 py-1.5 rounded-lg border border-[#EFE4DC] text-xs font-bold text-[#2E2628] text-center"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Fundus Image Capture Area */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#EA580C]" />
                  <h3 className="font-serif font-bold text-sm text-[#2E2628]">
                    Retinal Fundus Image (Required)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6E5C5F]">Quick Case:</span>
                  <select
                    value={selectedFundusGrade}
                    onChange={(e) => setSelectedFundusGrade(Number(e.target.value) as DRGrade)}
                    className="text-xs border border-[#EFE4DC] rounded-lg px-2.5 py-1 text-[#2E2628] font-medium bg-[#FAF8F6]"
                  >
                    <option value={0}>Normal (Grade 0)</option>
                    <option value={1}>Mild NPDR (Grade 1)</option>
                    <option value={2}>Moderate NPDR (Grade 2)</option>
                    <option value={3}>Severe NPDR (Grade 3)</option>
                    <option value={4}>Proliferative DR (Grade 4)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image Preview Box */}
                <div className="aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden border border-[#EFE4DC] bg-black relative shadow-inner">
                  <img
                    src={customFundusUrl || generateFundusSvg(selectedFundusGrade, 'normal')}
                    alt="Fundus scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
                    45° Non-Mydriatic
                  </div>
                </div>

                {/* Live Quality Check Card */}
                <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5C5F] block mb-1">
                      Automated Quality Check
                    </span>

                    <div className="flex items-center gap-2 mb-2">
                      {qualityStatus === 'GOOD' ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Suitable for AI Screening (Score: 94/100)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C]">
                          <AlertCircle className="w-4 h-4" />
                          <span>Uncertain / Slight Glare (Score: 68/100)</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[#6E5C5F] leading-relaxed">
                      {qualityStatus === 'GOOD'
                        ? 'Image has sharp vascular contrast, centered foveal reflex, and adequate illumination. Ready for multimodal analysis.'
                        : 'Slight illumination glare near margin. Technician judgment: proceed or recapture.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#EFE4DC] flex gap-2">
                      <button
                        onClick={() =>
                          setQualityStatus(qualityStatus === 'GOOD' ? 'UNCERTAIN' : 'GOOD')
                        }
                        className="text-[11px] text-[#6E5C5F] hover:text-[#EA580C] underline"
                      >
                        Simulate Quality Toggle ({qualityStatus === 'GOOD' ? 'Test Blur' : 'Test Good'})
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleRunCampAnalysis}
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white hover:opacity-95 transition-opacity shadow-sm flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Retinal Image Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {campStage === 'analyzing' && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#DB2777] flex items-center justify-center text-white mx-auto mb-4 animate-pulse">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2E2628]">
              Analyzing Participant {patientId}...
            </h3>
            <p className="text-xs text-[#6E5C5F] mt-1">
              Checking vascular lesions, calculating risk score, and generating clinical recommendations.
            </p>
          </div>
        )}

        {campStage === 'result' && lastResult && (
          <div className="space-y-6">
            {/* Quick Result Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFF7ED] to-[#FDF2F8] border border-[#FED7AA] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                  Camp Screening Summary
                </span>
                <h3 className="font-serif font-bold text-lg text-[#2E2628] flex items-center gap-2 mt-0.5">
                  <span>Participant {lastResult.patientId}</span>
                  <RiskChip grade={lastResult.finalGrade} size="sm" />
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#6E5C5F] block">Triage Recommendation</span>
                <span className="text-xs font-bold text-[#2E2628]">
                  {lastResult.recommendation}
                </span>
              </div>
            </div>

            {/* Findings & Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
                <h4 className="font-bold text-[#2E2628] mb-2">Key Model Findings</h4>
                <ul className="space-y-1.5 text-[#6E5C5F]">
                  {lastResult.fundus.featuresDetected.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                  <li>
                    • HbA1c: <strong>{lastResult.clinicalInput.hba1c}%</strong> | Diabetes:{' '}
                    <strong>{lastResult.clinicalInput.diabetesDurationYears} yrs</strong>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#2E2628] mb-1">Referral / Follow-up Action</h4>
                  <p className="text-[#6E5C5F] leading-relaxed">
                    {lastResult.finalGrade >= 2
                      ? 'Flagged for ophthalmologist review. Referral token created and sent to local PHC register.'
                      : 'Low concern. Counsel participant on annual screening and healthy glycemic control.'}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#EFE4DC] flex items-center justify-between text-[11px] text-[#6E5C5F]">
                  <span>Status: Saved to Camp Record</span>
                  <button
                    onClick={() => onComplete(lastResult)}
                    className="text-[#EA580C] font-semibold hover:underline"
                  >
                    View Full Clinical Report →
                  </button>
                </div>
              </div>
            </div>

            {/* Big Action: Next Patient Button */}
            <div className="pt-4 border-t border-[#EFE4DC] flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleNextPatient}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <span>Next Patient in Queue →</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onComplete(lastResult)}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl text-xs font-semibold border border-[#EFE4DC] text-[#2E2628] hover:bg-[#FAF8F6] transition-colors"
              >
                Open Full Result View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
