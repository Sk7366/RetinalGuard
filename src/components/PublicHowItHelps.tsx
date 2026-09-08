import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';

interface PublicHowItHelpsProps {
  onGetScreened: () => void;
  onTryDemo: () => void;
}

export const PublicHowItHelps: React.FC<PublicHowItHelpsProps> = ({
  onGetScreened,
  onTryDemo,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-8 sm:p-12 shadow-xs relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-gradient-to-br from-[#EA580C]/10 to-[#DB2777]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
            <Heart className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Preventing Preventable Blindness</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2E2628] tracking-tight">
            How RetinaGuard Protects Vision Before It's Too Late
          </h1>

          <p className="text-sm sm:text-base text-[#6E5C5F] leading-relaxed">
            Diabetic Retinopathy is the leading cause of preventable blindness among working-age adults. In its early stages, it develops silently with zero noticeable symptoms. RetinaGuard equips clinics and community screenings with multimodal AI that detects microscopic damage years before sight deteriorates.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={onGetScreened}
              className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Screened Today</span>
            </button>

            <button
              onClick={onTryDemo}
              className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] bg-[#FAF8F6] text-xs sm:text-sm font-semibold text-[#2E2628] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors flex items-center gap-2"
            >
              <span>Explore Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Pillars: Patients, Clinics, Communities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: For Patients */}
        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4 hover:border-[#EA580C] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#2E2628]">For Patients & Families</h2>
          <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
            Pain-free, comfortable screening with no mandatory pupil-dilating drops in most non-mydriatic cameras. Receive immediate plain-language explanations of your retinal health instead of waiting anxious weeks for reading center mailings.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-[#2E2628]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>Results in under 1 second during your regular doctor checkup</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>Clear explanation of your blood sugar (HbA1c) risk correlation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>Immediate referral priority for urgent treatments (anti-VEGF/laser)</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2: For Outreach & Camps */}
        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4 hover:border-[#DB2777] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] border border-[#FBCFE8] flex items-center justify-center text-[#DB2777]">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#2E2628]">For Field Camps & Rural Clinics</h2>
          <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
            Designed specifically to bring tertiary-hospital-grade diagnosis directly into mobile vans and rural community centers where ophthalmologists are scarce.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-[#2E2628]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>Fast queue mode handles 100+ patient examinations per day</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>Deterministic local edge engine works smoothly in low-bandwidth zones</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>Automated image quality gating flags blurry or dark scans on the spot</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: For Eye Care Specialists */}
        <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4 hover:border-[#EA580C] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#2E2628]">For Eye Care Specialists</h2>
          <p className="text-xs sm:text-sm text-[#6E5C5F] leading-relaxed">
            Eliminates diagnostic ambiguity through dual-modality vision plus clinical tabulations. Transparent Grad-CAM heatmaps verify AI attention on authentic microvascular lesions.
          </p>
          <ul className="space-y-2 pt-2 text-xs text-[#2E2628]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>Catches hidden sub-retinal macular edema (DME) invisible on fundus</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>TreeSHAP explainability quantifies physiological risk factors</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>Closed-loop referral dispatching prevents loss-to-follow-up</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The Difference: Traditional Screening vs RetinaGuard Multimodal */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2628]">
            Why Dual-Modality (Fundus + OCT) Is a Game Changer
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1">
            Standard AI screening tools rely solely on 2D surface photos, frequently missing sight-threatening macular edema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-200 text-gray-700">
              <span>Conventional Screening</span>
            </div>
            <h3 className="font-bold text-base text-[#2E2628]">Single-Modality Fundus Only</h3>
            <p className="text-xs text-[#6E5C5F] leading-relaxed">
              Looks strictly at the retina surface in 2D. May grade an eye as "Mild" (Grade 1) because microaneurysms look small, completely missing severe fluid swelling located deep inside the retinal layers.
            </p>
            <div className="pt-2 text-xs font-medium text-[#BE185D]">
              ⚠️ Misses up to 25% of clinically significant macular edema cases
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFF7ED]/60 border-2 border-[#EA580C] space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RetinaGuard Multimodal Protocol</span>
            </div>
            <h3 className="font-bold text-base text-[#C2410C]">Fundus + Cross-Sectional OCT + Labs</h3>
            <p className="text-xs text-[#2E2628] leading-relaxed">
              Combines high-resolution fundus inspection with deep optical coherence tomography (OCT) B-scans. If intraretinal cystoid fluid is detected on OCT, safety rules instantly elevate the triage to urgent referral.
            </p>
            <div className="pt-2 text-xs font-bold text-[#15803D]">
              ✓ Achieves 0.957 AUC with zero missed severe DME cases
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
