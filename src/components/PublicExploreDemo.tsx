import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Eye,
  Heart,
  HelpCircle,
  Layers,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { PRESET_CASES, PresetPatientCase } from '../data/sampleCases';
import { MultimodalTriageResult } from '../types';

interface PublicExploreDemoProps {
  onSelectCaseForFullInspection?: (caseId: string) => void;
  onGetScreened?: () => void;
}

export const PublicExploreDemo: React.FC<PublicExploreDemoProps> = ({
  onSelectCaseForFullInspection,
  onGetScreened,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(PRESET_CASES[0].id);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const currentCase: PresetPatientCase =
    PRESET_CASES.find((c) => c.id === selectedCaseId) || PRESET_CASES[0];

  const triage: MultimodalTriageResult = currentCase.expectedTriage;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Friendly Header */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Interactive Patient Stories</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          Explore How Screening Catches Eye Damage Early
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5C5F] mt-2 leading-relaxed">
          Walk through sample eye screening results below to see how standard retinal photographs and depth scans identify early diabetic changes before noticeable sight loss occurs.
        </p>
      </div>

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_CASES.slice(0, 3).map((c, idx) => {
          const isSelected = c.id === selectedCaseId;
          const statusLabels = [
            '1. Clear & Healthy Retina',
            '2. Early Subtle Changes',
            '3. Macular Fluid Swelling',
          ];

          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCaseId(c.id);
                setShowTechnicalDetails(false);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-[#EA580C] bg-white shadow-xs ring-2 ring-[#EA580C]/20'
                  : 'border-[#EFE4DC] bg-[#FFFDFB] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#2E2628]">
                  {statusLabels[idx]}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    idx === 0
                      ? 'bg-[#15803D]'
                      : idx === 1
                      ? 'bg-[#D97706]'
                      : 'bg-[#DC2626]'
                  }`}
                />
              </div>
              <p className="text-[11px] text-[#6E5C5F] line-clamp-2 leading-relaxed">
                {c.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Case Showcase */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
          <div>
            <h2 className="text-lg font-bold text-[#2E2628]">
              {currentCase.name}
            </h2>
            <p className="text-xs text-[#6E5C5F] mt-0.5">
              Simulated case study · {currentCase.clinicalMetadata.diabetesDurationYears} years living with diabetes · HbA1c {currentCase.clinicalMetadata.hba1c}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                triage.finalGrade === 0
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : triage.finalGrade === 1
                  ? 'bg-[#FEF9C3] text-[#A16207]'
                  : 'bg-[#FFEDD5] text-[#C2410C]'
              }`}
            >
              {triage.finalGrade === 0
                ? 'No Eye Damage'
                : triage.finalGrade === 1
                ? 'Mild Changes'
                : 'Urgent Referral Recommended'}
            </span>
          </div>
        </div>

        {/* Retinal Visuals & Plain Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Visuals */}
          <div className="md:col-span-5 space-y-3">
            <div className="rounded-2xl border border-[#EFE4DC] bg-[#181517] overflow-hidden shadow-inner aspect-square flex items-center justify-center p-2">
              <img
                src={triage.fundusCamUrl || triage.fundusImageUrl}
                alt="Retina Scan"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="text-center text-[11px] text-[#6E5C5F]">
              Color photograph of the retina (surface view)
            </div>
          </div>

          {/* Plain English Explanation */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
              <h3 className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>What Was Found in This Eye</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#2E2628] leading-relaxed">
                {currentCase.description}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-2">
              <h3 className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Next Step Recommendation</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#2E2628] leading-relaxed font-medium">
                {triage.recommendation}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              {onGetScreened && (
                <button
                  onClick={onGetScreened}
                  className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:from-[#C2410C] hover:to-[#BE185D] transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Check Your Own Eyes Now</span>
                </button>
              )}

              {onSelectCaseForFullInspection && (
                <button
                  onClick={() => onSelectCaseForFullInspection(currentCase.id)}
                  className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] bg-white text-xs font-semibold text-[#2E2628] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors"
                >
                  Inspect in Full Clinical Viewer →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Section for Technical ML Details */}
        <div className="border-t border-[#EFE4DC] pt-4">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-[#FAF8F6] hover:bg-[#EFE4DC]/50 transition-colors text-xs font-semibold text-[#6E5C5F]"
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Show Technical & AI Model Details (Grad-CAM, SHAP, Clinical Grade)</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#6E5C5F] transition-transform ${
                showTechnicalDetails ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showTechnicalDetails && (
            <div className="mt-4 p-5 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-[#FAF8F6]">
                  <span className="text-[10px] text-[#6E5C5F] uppercase font-bold block">
                    ICDR Classification
                  </span>
                  <span className="text-sm font-bold text-[#2E2628]">
                    Grade {triage.finalGrade} ({triage.gradeLabel})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F6]">
                  <span className="text-[10px] text-[#6E5C5F] uppercase font-bold block">
                    Macular Edema (OCT)
                  </span>
                  <span className="text-sm font-bold text-[#EA580C]">
                    {triage.oct.dmeDetected ? 'Positive (Fluid Present)' : 'Negative'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F6]">
                  <span className="text-[10px] text-[#6E5C5F] uppercase font-bold block">
                    OCT Sub-type
                  </span>
                  <span className="text-sm font-bold text-[#2E2628] font-mono">
                    {triage.oct.predictedClass} ({(triage.oct.dmeProbability * 100).toFixed(0)}%)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F6]">
                  <span className="text-[10px] text-[#6E5C5F] uppercase font-bold block">
                    Fusion Arbitration
                  </span>
                  <span className="text-sm font-bold text-[#15803D]">
                    {triage.dmeEscalationApplied ? 'DME Rule Escalated' : 'Concordant'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F6] text-[11px] text-[#6E5C5F] leading-relaxed">
                <strong className="text-[#2E2628]">Feature Attributions (SHAP):</strong>{' '}
                {triage.contributingFactors.join(' · ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
