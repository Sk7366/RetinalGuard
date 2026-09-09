import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  EyeOff,
  GitCompare,
  HelpCircle,
  Info,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  MultimodalTriageResult,
  QualityStatus,
  ResponsibleAiUncertaintyState,
  Screening,
} from '../types';
import {
  evaluateResponsibleAiUncertainty,
  RESPONSIBLE_AI_UNCERTAINTY_QUOTE,
  UNCERTAINTY_STATE_DEFINITIONS,
  UncertaintyStateDefinition,
} from '../utils/uncertaintyEngine';

interface ResponsibleAiUncertaintyIndicatorProps {
  result?: MultimodalTriageResult | Screening;
  qualityStatusOverride?: QualityStatus;
  forcedState?: ResponsibleAiUncertaintyState;
  variant?: 'card' | 'banner' | 'chip';
  showDetailsToggle?: boolean;
  className?: string;
  id?: string;
}

export const ResponsibleAiUncertaintyIndicator: React.FC<
  ResponsibleAiUncertaintyIndicatorProps
> = ({
  result,
  qualityStatusOverride,
  forcedState,
  variant = 'card',
  showDetailsToggle = true,
  className = '',
  id = 'responsible-ai-uncertainty-indicator',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedDemoState, setSelectedDemoState] = useState<ResponsibleAiUncertaintyState | null>(
    null
  );

  // Compute evaluation
  const baseEvaluation = result
    ? evaluateResponsibleAiUncertainty(result, qualityStatusOverride)
    : evaluateResponsibleAiUncertainty({
        sessionId: 'SAMPLE',
        timestamp: new Date().toISOString(),
        patientId: 'PT-DEMO',
        fundusImageName: 'sample.jpg',
        fundusImageUrl: '',
        fundusClaheUrl: '',
        fundusCamUrl: '',
        fundus: {
          grade: 0,
          gradeLabel: 'No Apparent DR',
          probabilities: [1, 0, 0, 0, 0],
          inferenceMs: 42,
          camHotspots: [],
          featuresDetected: [],
        },
        oct: {
          present: false,
          predictedClass: 'Normal',
          dmeDetected: false,
          dmeProbability: 0,
          classProbabilities: { Normal: 1, DME: 0, CNV: 0, Drusen: 0 },
          inferenceMs: 0,
          retinalLayerFindings: [],
        },
        metadata: {
          provided: false,
          predictedGrade: 0,
          inferenceMs: 0,
          riskScore: 0,
          probabilities: [1, 0, 0, 0, 0],
          shapValues: [],
          top3RiskDrivers: [],
          syntheticMode: true,
        },
        clinicalInput: {
          hba1c: 6.5,
          diabetesDurationYears: 4,
          systolicBp: 120,
          diastolicBp: 80,
          serumCreatinine: 0.9,
          age: 50,
          bmi: 24,
          insulinTherapy: false,
          priorLaser: false,
          visualAcuityLogMar: 0.0,
        },
        rawFusionScore: 0,
        finalGrade: 0,
        gradeLabel: 'No Apparent DR',
        confidence: 'HIGH',
        dmeEscalationApplied: false,
        recommendation: 'Annual screening',
        urgencyLevel: 'routine',
        contributingFactors: [],
        syntheticMode: true,
      });

  const activeStateKey: ResponsibleAiUncertaintyState =
    selectedDemoState || forcedState || baseEvaluation.state;

  const activeDef: UncertaintyStateDefinition = UNCERTAINTY_STATE_DEFINITIONS[activeStateKey];

  // Helper icon renderer
  const renderStateIcon = (iconName: string, sizeClass = 'w-5 h-5') => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className={sizeClass} />;
      case 'UserCheck':
        return <UserCheck className={sizeClass} />;
      case 'EyeOff':
        return <EyeOff className={sizeClass} />;
      case 'GitCompare':
        return <GitCompare className={sizeClass} />;
      default:
        return <ShieldAlert className={sizeClass} />;
    }
  };

  // Compact Chip Variant
  if (variant === 'chip') {
    return (
      <span
        id={id}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow-2xs whitespace-nowrap ${className}`}
        style={{
          backgroundColor: activeDef.bgColor,
          borderColor: activeDef.borderColor,
          color: activeDef.textColor,
        }}
        title={`RetinaGuard Responsible AI Posture: ${activeDef.title}`}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: activeDef.color }}
        />
        {renderStateIcon(activeDef.iconName, 'w-3.5 h-3.5')}
        <span>{activeDef.badgeLabel}</span>
      </span>
    );
  }

  // Banner Variant
  if (variant === 'banner') {
    return (
      <div
        id={id}
        className={`rounded-2xl border p-4 shadow-2xs transition-all ${className}`}
        style={{
          backgroundColor: activeDef.bgColor,
          borderColor: activeDef.borderColor,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-xl text-white shrink-0 mt-0.5"
              style={{ backgroundColor: activeDef.color }}
            >
              {renderStateIcon(activeDef.iconName, 'w-4 h-4')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#6E5C5F]">
                  Responsible AI / Uncertainty
                </span>
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-white"
                  style={{ borderColor: activeDef.borderColor, color: activeDef.textColor }}
                >
                  {activeDef.badgeLabel}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#2E2628] mt-0.5">
                {activeDef.title}
              </h4>
              <p className="text-xs text-[#6E5C5F] mt-0.5 leading-relaxed">
                {baseEvaluation.primaryRationale || activeDef.clinicalMeaning}
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[11px] font-semibold text-[#2E2628] block">
              {activeDef.shortStatus}
            </span>
            <span className="text-[10px] text-[#6E5C5F]">
              Zero misleading % · Evidence grounded
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full Card Variant (Default for ResultsView and Responsible AI showcase)
  return (
    <section
      id={id}
      className={`rounded-3xl border shadow-sm transition-all overflow-hidden ${className}`}
      style={{
        backgroundColor: activeDef.bgColor,
        borderColor: activeDef.borderColor,
      }}
    >
      {/* 1. Header with Core Product Capability Identification */}
      <div
        className="px-5 py-4 sm:px-6 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ borderColor: activeDef.borderColor }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
            style={{ backgroundColor: activeDef.color }}
          >
            {renderStateIcon(activeDef.iconName, 'w-4 h-4')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#6E5C5F]">
                Product Capability
              </span>
              <span className="w-1 h-1 rounded-full bg-[#9C8E91]" />
              <span className="text-[11px] font-semibold text-[#2E2628]">
                Evidence-Grounded Triaging
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#2E2628] leading-tight">
              Responsible AI / Uncertainty
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active State Pill */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-tight bg-white border shadow-2xs"
            style={{
              borderColor: activeDef.borderColor,
              color: activeDef.textColor,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeDef.color }}
            />
            <span>{activeDef.badgeLabel}</span>
          </span>

          {showDetailsToggle && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-[#6E5C5F] hover:text-[#2E2628] border border-stone-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Toggle Uncertainty Framework explanation"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">
                {isExpanded ? 'Hide Framework' : 'How It Works'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-5">
        {/* 2. Core Mandatory Philosophy Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <span className="text-xl select-none leading-none font-serif text-[#EA580C] font-black">
              “
            </span>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-serif font-semibold text-[#2E2628] leading-relaxed italic">
                {RESPONSIBLE_AI_UNCERTAINTY_QUOTE}
              </p>
              <p className="text-[11px] text-[#6E5C5F]">
                RetinaGuard does not emit misleading numerical confidence percentages (e.g. "89.4% confident"). In clinical decision-support, uncertainty is communicated through qualitative evidence sufficiency and transparent consensus guardrails.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Primary Evidence Breakdown & Clinical Rationale */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Column: Clinical Rationale & System Action */}
          <div className="md:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5C5F] block">
                Evidence Sufficiency Assessment
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[#2E2628] mt-0.5">
                {activeDef.title}
              </h4>
              <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
                {selectedDemoState
                  ? activeDef.clinicalMeaning
                  : baseEvaluation.primaryRationale}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <span className="text-[11px] font-bold text-[#2E2628] flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Protocol Safeguard Triggered:</span>
              </span>
              <p className="text-xs text-[#2E2628] bg-[#FAF8F6] p-2.5 rounded-xl border border-[#EFE4DC]">
                {selectedDemoState
                  ? activeDef.systemAction
                  : baseEvaluation.clinicalAction}
              </p>
            </div>
          </div>

          {/* Right Column: Grounded Evidence Factors (No misleading numbers!) */}
          <div className="md:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5C5F]">
                Evidence Factor Checks
              </span>
              <span className="text-[10px] text-[#059669] font-bold bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                Qualitative
              </span>
            </div>

            <ul className="space-y-2 text-xs">
              {(selectedDemoState
                ? activeDef.evidenceCriteria.map((c, i) => ({
                    label: c.split(':')[0],
                    status: i === 0 && activeDef.state === 'IMAGE UNGRADABLE' ? 'fail' : 'pass',
                    detail: c.split(':')[1] || c,
                  }))
                : baseEvaluation.evidenceFactors
              ).map((factor, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]/70"
                >
                  {factor.status === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  ) : factor.status === 'caution' ? (
                    <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  )}
                  <div className="leading-tight">
                    <span className="font-bold text-[#2E2628] text-[11px] block">
                      {factor.label}
                    </span>
                    <span className="text-[11px] text-[#6E5C5F]">{factor.detail}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Interactive State Explorer (Allows clinicians & auditors to review all 4 states) */}
        <div className="bg-white/80 rounded-2xl border border-stone-200/90 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              <span className="text-xs font-bold text-[#2E2628]">
                Responsible AI Differentiator: 4 Strict Uncertainty States
              </span>
            </div>
            <span className="text-[10px] text-[#6E5C5F]">
              Click any state to preview RetinaGuard's clinical posture:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {(
              Object.keys(UNCERTAINTY_STATE_DEFINITIONS) as ResponsibleAiUncertaintyState[]
            ).map((stateKey) => {
              const def = UNCERTAINTY_STATE_DEFINITIONS[stateKey];
              const isSelected = activeStateKey === stateKey;
              return (
                <button
                  key={stateKey}
                  onClick={() => setSelectedDemoState(stateKey)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white shadow-2xs border-2 font-bold ring-2 ring-stone-900/5'
                      : 'bg-white/60 hover:bg-white border-stone-200 text-[#6E5C5F]'
                  }`}
                  style={{
                    borderColor: isSelected ? def.color : undefined,
                  }}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-tight"
                      style={{ color: def.color }}
                    >
                      {def.shortStatus}
                    </span>
                    {renderStateIcon(def.iconName, 'w-3.5 h-3.5')}
                  </div>
                  <span className="text-[11px] text-[#2E2628] line-clamp-2 leading-tight">
                    {def.tagline}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedDemoState && (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedDemoState(null)}
                className="text-[11px] text-[#EA580C] hover:underline font-semibold"
              >
                Reset to this scan's live state ({baseEvaluation.shortStatus})
              </button>
            </div>
          )}
        </div>

        {/* 5. Expandable Clinical & Regulatory Justification Drawer */}
        {isExpanded && (
          <div className="pt-3 border-t border-stone-200/80 space-y-3 text-xs text-[#6E5C5F] animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1.5">
                <span className="font-bold text-[#2E2628] flex items-center gap-1.5 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-[#EA580C]" />
                  Why we reject numerical confidence percentages (e.g., "89.4%")
                </span>
                <p className="text-[11px] leading-relaxed">
                  Deep neural networks are notoriously overconfident on out-of-distribution optical distortions, lens dust, and media opacities. Showing a precise percentage like <em>"89.7% confidence"</em> provides dangerous false reassurance to community health workers. RetinaGuard instead forces hard categorical decisions based on image quality and multimodal concordance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1.5">
                <span className="font-bold text-[#2E2628] flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                  Clinical Safety: Prioritizing Human Review
                </span>
                <p className="text-[11px] leading-relaxed">
                  Whenever an image is ungradable or modalities disagree, the system deliberately halts automated scoring and prioritizes ophthalmologist review. This clinical humility prevents unnecessary treatment errors and guards against irreversible vision loss.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
