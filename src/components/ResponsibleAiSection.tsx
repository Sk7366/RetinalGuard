import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GitCompare,
  HeartHandshake,
  HelpCircle,
  Info,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { ResponsibleAiUncertaintyState } from '../types';
import {
  RESPONSIBLE_AI_UNCERTAINTY_QUOTE,
  UNCERTAINTY_STATE_DEFINITIONS,
} from '../utils/uncertaintyEngine';
import { ResponsibleAiUncertaintyIndicator } from './ResponsibleAiUncertaintyIndicator';

export const ResponsibleAiSection: React.FC = () => {
  const [selectedState, setSelectedState] = useState<ResponsibleAiUncertaintyState>(
    'HUMAN REVIEW RECOMMENDED'
  );

  const activeDef = UNCERTAINTY_STATE_DEFINITIONS[selectedState];

  return (
    <section
      id="responsible-ai-uncertainty-capability-section"
      className="bg-white rounded-3xl border border-[#FED7AA] p-6 sm:p-10 shadow-xs space-y-8"
    >
      {/* 1. Header Banner */}
      <div className="max-w-4xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
          <HeartHandshake className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Core Product Capability</span>
          <span className="w-1 h-1 rounded-full bg-[#EA580C]" />
          <span>Responsible AI & Uncertainty</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2E2628] tracking-tight">
          Responsible AI / Uncertainty: Clinical Humility Over False Certainty
        </h2>

        <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
          AI screening systems must communicate when they do <em>not</em> have sufficient evidence. Rather than fabricating arbitrary confidence numbers or guessing on degraded images, RetinaGuard prioritizes human review whenever uncertainty exists.
        </p>
      </div>

      {/* 2. Mandatory Core Principle Callout */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#FFF7ED] via-white to-[#FDF2F8] border-2 border-[#FED7AA] shadow-2xs relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#EA580C] text-white shrink-0 mt-0.5 shadow-2xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#C2410C] block">
              Core Design Differentiator
            </span>
            <blockquote className="text-sm sm:text-base font-serif font-bold text-[#2E2628] leading-snug">
              "{RESPONSIBLE_AI_UNCERTAINTY_QUOTE}"
            </blockquote>
            <p className="text-xs text-[#6E5C5F] leading-relaxed">
              Standard medical machine learning models emit uncalibrated softmax probabilities (e.g. <em>"91.4% confidence"</em>) that give false comfort to operators. RetinaGuard completely rejects misleading numerical percentages, replacing them with four rigorous, qualitative decision states.
            </p>
          </div>
        </div>
      </div>

      {/* 3. The 4 Responsible AI Uncertainty States Interactive Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#2E2628]">
              The 4 Uncertainty States of RetinaGuard
            </h3>
            <p className="text-xs text-[#6E5C5F]">
              Select any state to explore how the system guards against premature diagnosis and honors human clinician authority:
            </p>
          </div>

          <span className="text-[11px] text-[#059669] font-bold bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0] shrink-0 self-start sm:self-auto">
            Zero Misleading %
          </span>
        </div>

        {/* State Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            Object.keys(UNCERTAINTY_STATE_DEFINITIONS) as ResponsibleAiUncertaintyState[]
          ).map((stateKey) => {
            const def = UNCERTAINTY_STATE_DEFINITIONS[stateKey];
            const isSelected = selectedState === stateKey;

            return (
              <button
                key={stateKey}
                onClick={() => setSelectedState(stateKey)}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white shadow-sm border-2 ring-2 ring-stone-900/5'
                    : 'bg-[#FAF8F6] hover:bg-white border-[#EFE4DC] text-[#6E5C5F]'
                }`}
                style={{
                  borderColor: isSelected ? def.color : undefined,
                }}
              >
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-[10px] font-mono font-bold tracking-tight uppercase"
                      style={{ color: def.color }}
                    >
                      {def.shortStatus}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: def.color }}
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#2E2628] leading-snug">
                    {def.badgeLabel}
                  </h4>
                </div>

                <p className="text-[11px] text-[#6E5C5F] line-clamp-2 leading-relaxed">
                  {def.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active State Detailed Visual Display */}
        <div
          className="rounded-3xl border p-6 sm:p-7 shadow-xs space-y-5 transition-all"
          style={{
            backgroundColor: activeDef.bgColor,
            borderColor: activeDef.borderColor,
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: activeDef.borderColor }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-2xs shrink-0"
                style={{ backgroundColor: activeDef.color }}
              >
                {activeDef.iconName === 'ShieldCheck' && <ShieldCheck className="w-5 h-5" />}
                {activeDef.iconName === 'UserCheck' && <UserCheck className="w-5 h-5" />}
                {activeDef.iconName === 'EyeOff' && <EyeOff className="w-5 h-5" />}
                {activeDef.iconName === 'GitCompare' && <GitCompare className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#6E5C5F]">
                  State Posture
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[#2E2628]">
                  {activeDef.title}
                </h4>
              </div>
            </div>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-white border self-start sm:self-auto"
              style={{ borderColor: activeDef.borderColor, color: activeDef.textColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeDef.color }} />
              {activeDef.badgeLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200/80">
              <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider block">
                Clinical Significance
              </span>
              <p className="text-xs sm:text-sm text-[#2E2628] leading-relaxed">
                {activeDef.clinicalMeaning}
              </p>
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-bold text-[#C2410C] block mb-1">
                  RetinaGuard Protocol Action:
                </span>
                <p className="text-xs text-[#6E5C5F] leading-relaxed">
                  {activeDef.systemAction}
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200/80">
              <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider block">
                Qualitative Evidence Criteria (No Misleading Numbers)
              </span>
              <ul className="space-y-2 text-xs">
                {activeDef.evidenceCriteria.map((criterion, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-[#FAF8F6]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span className="text-[#2E2628] leading-tight font-medium">
                      {criterion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two Additional Responsible AI Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* PILLAR 1: EXPLAINABILITY VS DIAGNOSIS */}
        <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
          <div className="flex items-center gap-2 text-[#EA580C] font-bold text-sm">
            <Eye className="w-4 h-4" />
            <span>Explainability ≠ Ground Truth</span>
          </div>
          <p className="text-xs text-[#2E2628] leading-relaxed">
            <strong>Visual explanations indicate model attention, not clinical proof.</strong> A Grad-CAM activation hotspot highlights regions that mathematically influenced the convolutional layers, but it cannot substitute for dilated stereoscopic biomicroscopy.
          </p>
          <div className="p-2.5 rounded-xl bg-[#FFF7ED] text-[11px] text-[#C2410C] border border-[#FED7AA]/60">
            Grad-CAM and SHAP are auditable interpretability tools designed to flag potential shortcut learning and promote clinician trust.
          </div>
        </div>

        {/* PILLAR 2: REGULATORY & CLINICAL BOUNDARIES */}
        <div className="p-5 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
          <div className="flex items-center gap-2 text-[#DB2777] font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Regulatory & Data Safety Commitments</span>
          </div>
          <ul className="space-y-2 text-xs text-[#6E5C5F]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>Research Demonstration Only:</strong> Not cleared by the US FDA or Indian CDSCO as an independent SaMD device.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>No Real Patient Data:</strong> All structured clinical parameters are synthetically generated from UKPDS trial distributions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
              <span><strong>Mandatory Confirmatory Review:</strong> All triage outputs require in-person validation by a certified retinal specialist.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
