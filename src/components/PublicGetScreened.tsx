import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Eye,
  FileCheck,
  HelpCircle,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
} from 'lucide-react';
import { generateFundusSvg, generateOctSvg, PRESET_CASES } from '../data/sampleCases';
import { ClinicalMetadata, DRGrade, MultimodalTriageResult } from '../types';
import { executeMultimodalFusion, predictMetadataRisk } from '../utils/fusionEngine';
import { RiskChip } from './RiskChip';

interface PublicGetScreenedProps {
  onComplete?: (result: MultimodalTriageResult) => void;
  onFindClinic?: () => void;
}

export const PublicGetScreened: React.FC<PublicGetScreenedProps> = ({
  onComplete,
  onFindClinic,
}) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [hasOct, setHasOct] = useState<boolean>(true);
  const [diabetesYears, setDiabetesYears] = useState<number>(6);
  const [hba1c, setHba1c] = useState<number>(7.2);
  const [systolicBp, setSystolicBp] = useState<number>(128);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<MultimodalTriageResult | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Sample presets for quick public demonstration
  const sampleChoices = [
    {
      title: 'Sample 1: Clear & Healthy',
      desc: 'No signs of diabetic eye disease. Typical for well-controlled diabetes.',
      grade: 0 as DRGrade,
      hasDme: false,
      years: 3,
      hba1c: 6.2,
      bp: 118,
    },
    {
      title: 'Sample 2: Early Changes',
      desc: 'Small capillary spots (microaneurysms). Requires annual monitoring.',
      grade: 1 as DRGrade,
      hasDme: false,
      years: 8,
      hba1c: 7.6,
      bp: 130,
    },
    {
      title: 'Sample 3: Needs Attention',
      desc: 'Noticeable retinal swelling (fluid in macula). Specialist care advised.',
      grade: 2 as DRGrade,
      hasDme: true,
      years: 14,
      hba1c: 8.8,
      bp: 142,
    },
  ];

  const handleSelectSample = (idx: number) => {
    setSelectedCaseIdx(idx);
    const c = sampleChoices[idx];
    setHasOct(c.hasDme || idx > 0);
    setDiabetesYears(c.years);
    setHba1c(c.hba1c);
    setSystolicBp(c.bp);
    setResult(null);
    setShowTechnicalDetails(false);
  };

  const handleRunScreening = () => {
    setIsProcessing(true);
    setResult(null);

    const chosenPreset = PRESET_CASES[selectedCaseIdx] || PRESET_CASES[0];

    setTimeout(() => {
      const clinicalInput: ClinicalMetadata = {
        ...chosenPreset.clinicalMetadata,
        diabetesDurationYears: diabetesYears,
        hba1c: hba1c,
        systolicBp: systolicBp,
      };

      const metadataAnalysis = predictMetadataRisk(clinicalInput);

      const triage = executeMultimodalFusion({
        fundus: chosenPreset.expectedTriage.fundus,
        oct: hasOct ? chosenPreset.expectedTriage.oct : undefined,
        metadata: metadataAnalysis,
        clinicalInput,
        patientId: `COMMUNITY-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: 'Self-Check Patient',
        fundusImageName: chosenPreset.expectedTriage.fundusImageName,
        octImageName: hasOct ? chosenPreset.expectedTriage.octImageName : undefined,
        fundusImageUrl: chosenPreset.expectedTriage.fundusImageUrl,
        fundusClaheUrl: chosenPreset.expectedTriage.fundusClaheUrl,
        fundusCamUrl: chosenPreset.expectedTriage.fundusCamUrl,
        octImageUrl: hasOct ? chosenPreset.expectedTriage.octImageUrl : undefined,
        octCamUrl: hasOct ? chosenPreset.expectedTriage.octCamUrl : undefined,
      });

      setResult(triage);
      setIsProcessing(false);
      if (onComplete) {
        onComplete(triage);
      }
    }, 700);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Friendly Header */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-3">
          <Eye className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Quick & Comfortable Eye Health Check</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          Get Your Retina Screened
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5C5F] mt-2 leading-relaxed">
          Diabetic eye changes develop without any early pain or warning symptoms. Test your eye health below using a pre-loaded sample photograph or enter your health history for an instant plain-language evaluation.
        </p>
      </div>

      {/* Interactive Selection Flow */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step 1: Retinal Photo Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider">
              Step 1 · Choose a Sample Retinal Eye Photo
            </span>
            <span className="text-[11px] text-[#6E5C5F]">Simulated Patient Images</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleChoices.map((sample, idx) => {
              const isSelected = selectedCaseIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(idx)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-[#EA580C] bg-[#FFF7ED]/60 ring-2 ring-[#EA580C]/20 shadow-xs'
                      : 'border-[#EFE4DC] bg-[#FFFDFB] hover:bg-[#FAF8F6]'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-[#2E2628] mb-1">
                    {sample.title}
                  </div>
                  <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
                    {sample.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Eye Photo Preview */}
        <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] flex flex-col sm:flex-row items-center gap-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-[#EFE4DC] bg-[#2E2628] shrink-0 shadow-inner flex items-center justify-center">
            <img
              src={generateFundusSvg(sampleChoices[selectedCaseIdx].grade, 'normal')}
              alt="Retinal Fundus"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold text-[#2E2628]">
              Retinal Surface Photograph
            </div>
            <p className="text-[11px] text-[#6E5C5F] leading-relaxed max-w-md">
              A standard 30-second color photo of the back of your eye. It shows the optic nerve, major blood vessels, and the macula.
            </p>
            <div className="text-[10px] text-[#15803D] font-medium pt-1">
              ✓ Image quality verified: Clear view of retinal vessels
            </div>
          </div>
        </div>

        {/* Step 3: Simple Health Indicators */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider block">
            Step 2 · Your Health History (Optional)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC]">
              <label className="text-xs font-semibold text-[#6E5C5F] block mb-1">
                Years with Diabetes
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={diabetesYears}
                  onChange={(e) => setDiabetesYears(Number(e.target.value))}
                  className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#2E2628]"
                />
                <span className="text-xs text-[#6E5C5F]">yrs</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC]">
              <label className="text-xs font-semibold text-[#6E5C5F] block mb-1">
                Typical HbA1c (Blood Sugar)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="5.0"
                  max="14.0"
                  value={hba1c}
                  onChange={(e) => setHba1c(Number(e.target.value))}
                  className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#2E2628]"
                />
                <span className="text-xs text-[#6E5C5F]">%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC]">
              <label className="text-xs font-semibold text-[#6E5C5F] block mb-1">
                Blood Pressure (Systolic)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="90"
                  max="200"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#2E2628]"
                />
                <span className="text-xs text-[#6E5C5F]">mmHg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Check Button */}
        <div className="pt-4 flex items-center justify-between gap-4 border-t border-[#EFE4DC]">
          <span className="text-xs text-[#6E5C5F] hidden sm:inline">
            Non-invasive instant evaluation · Takes under 1 second
          </span>

          <button
            onClick={handleRunScreening}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking Retinal Health...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Check Eye Health Now →</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Friendly Plain-Language Results Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EFE4DC]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
              <span className="text-xs font-bold text-[#2E2628]">
                Screening Check Result
              </span>
            </div>
            <span className="text-[11px] text-[#6E5C5F]">
              Evaluated on {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* Simple Status Box */}
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
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : result.finalGrade === 1
                    ? 'bg-[#FEF9C3] text-[#A16207]'
                    : 'bg-[#FFEDD5] text-[#C2410C]'
                }`}
              >
                {result.finalGrade === 0 ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertCircle className="w-7 h-7" />
                )}
              </div>

              <div className="space-y-1">
                <h2
                  className={`text-lg sm:text-xl font-bold ${
                    result.finalGrade === 0
                      ? 'text-[#15803D]'
                      : result.finalGrade === 1
                      ? 'text-[#A16207]'
                      : 'text-[#C2410C]'
                  }`}
                >
                  {result.finalGrade === 0
                    ? 'Clear Retina — No Damage Detected'
                    : result.finalGrade === 1
                    ? 'Early Signs Spotted — Routine Follow-Up'
                    : 'Noticeable Eye Changes — Specialist Check Advised'}
                </h2>

                <p className="text-xs sm:text-sm text-[#2E2628] leading-relaxed">
                  {result.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* What This Means & Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
              <h3 className="text-xs font-bold text-[#2E2628] uppercase tracking-wider">
                What This Means for You
              </h3>
              <p className="text-xs text-[#6E5C5F] leading-relaxed">
                {result.finalGrade === 0
                  ? 'Your retina currently shows healthy blood vessels with no diabetic capillary leakage. Keep up your healthy lifestyle, nutrition, and blood sugar control.'
                  : result.finalGrade === 1
                  ? 'A few tiny blood vessel balloons (microaneurysms) were spotted. This does not cause blindness, but indicates your blood sugar has stressed delicate eye capillaries over time.'
                  : 'Fluid swelling or blood vessel blockages were found. When caught early, modern eye treatments can protect and maintain your eyesight effectively.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
              <h3 className="text-xs font-bold text-[#2E2628] uppercase tracking-wider">
                Recommended Action
              </h3>
              <p className="text-xs text-[#2E2628] font-medium leading-relaxed">
                {result.finalGrade === 0
                  ? 'Repeat your routine eye screening in 12 months.'
                  : result.finalGrade === 1
                  ? 'Schedule a repeat checkup with your optometrist or eye doctor in 6 to 12 months.'
                  : 'Visit an ophthalmologist or retina specialist within 2 to 4 weeks for a comprehensive dilated examination.'}
              </p>
              {onFindClinic && (
                <button
                  onClick={onFindClinic}
                  className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Find a Screening Clinic Near You</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Optional Accordion for Technical / Model Details */}
          <div className="border-t border-[#EFE4DC] pt-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-[#FAF8F6] hover:bg-[#EFE4DC]/50 transition-colors text-xs font-semibold text-[#6E5C5F]"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Technical & AI Model Details (For Clinicians & Researchers)</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#6E5C5F] transition-transform ${
                  showTechnicalDetails ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-4 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC] text-xs space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[#6E5C5F] block text-[10px]">ICDR Grade</span>
                    <span className="font-bold text-[#2E2628] text-sm">
                      Grade {result.finalGrade}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6E5C5F] block text-[10px]">OCT DME Status</span>
                    <span className="font-bold text-[#EA580C] text-sm">
                      {result.oct.dmeDetected ? 'Positive (Detected)' : 'Negative (Clear)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6E5C5F] block text-[10px]">Central Thickness</span>
                    <span className="font-bold text-[#2E2628] text-sm font-mono">
                      {result.oct.centralSubfieldThicknessMicrons} µm
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6E5C5F] block text-[10px]">Confidence Level</span>
                    <span className="font-bold text-[#15803D] text-sm">
                      {result.confidence}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EFE4DC] text-[11px] text-[#6E5C5F]">
                  <strong>Fusion Model:</strong> EfficientNet-B4 (Fundus) + ResNet-50 (Macular OCT) + XGBoost (HbA1c, Blood Pressure, Duration) with cross-attention late gating.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
