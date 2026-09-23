import React from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Eye,
  Building,
  UserCheck,
  FileText,
  HeartHandshake,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { User } from '../types';

interface PatientJourneyViewProps {
  currentUser: User;
  onNavigateToFindScreening: () => void;
  onNavigateToReports: () => void;
}

export const PatientJourneyView: React.FC<PatientJourneyViewProps> = ({
  currentUser,
  onNavigateToFindScreening,
  onNavigateToReports,
}) => {
  const { t } = useTranslation();

  const journeySteps = [
    {
      step: 1,
      title: t("journeyStep1Title", "Registration & Contact Verification"),
      status: 'completed',
      date: currentUser.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString() : t("activeStatus", "Active"),
      desc: t("journeyStep1Desc", "Your profile, email, and phone number are verified for confidential delivery of results and clinic alerts."),
      icon: UserCheck,
    },
    {
      step: 2,
      title: t("journeyStep2Title", "Retinal Image Capture at Camp or Clinic"),
      status: 'completed',
      date: t("journeyStep2Date", "Completed at Victoria Hospital Camp"),
      desc: t("journeyStep2Desc", "A trained screening worker captured non-mydriatic fundus images using a gentle, painless eye camera (no eye-drops or needles)."),
      icon: Eye,
    },
    {
      step: 3,
      title: t("journeyStep3Title", "AI-Assisted Quality & Risk Triage"),
      status: 'completed',
      date: t("journeyStep3Date", "Completed in < 12 seconds"),
      desc: t("journeyStep3Desc", "RetinaGuard verified image focus and assisted the healthcare team by identifying any signs that may need further clinical review."),
      icon: CheckCircle2,
    },
    {
      step: 4,
      title: t("journeyStep4Title", "Optometrist / Physician Clinical Review"),
      status: 'completed',
      date: t("journeyStep4Date", "Reviewed by Dr. Ananya Sharma"),
      desc: t("journeyStep4Desc", "A certified eye-care professional verified the automated findings and approved the clinical referral recommendation."),
      icon: HeartHandshake,
    },
    {
      step: 5,
      title: t("journeyStep5Title", "Digital Screening Report Generated"),
      status: 'completed',
      date: t("journeyStep5Date", "Available in My Reports"),
      desc: t("journeyStep5Desc", "Your comprehensive, easy-to-read report was generated and is ready for download or email."),
      icon: FileText,
    },
    {
      step: 6,
      title: t("journeyStep6Title", "Follow-Up Care & Annual Reminder"),
      status: 'current',
      date: t("journeyStep6Date", "Next checkup due: Sept 2027"),
      desc: t("journeyStep6Desc", "RetinaGuard will send you an SMS/email reminder before your next routine retinal evaluation."),
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-[#2B2024]">
      {/* HEADER */}
      <div className="pb-4 border-b border-[#EFE4DC]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE5D8] text-[#D84818] border border-[#FED7AA] mb-2">
          <Clock className="w-3.5 h-3.5 text-[#F05A28]" />
          <span>{t("careTimelineBadge", "CARE CONTINUUM TIMELINE")}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2024]">
          {t("myScreeningJourneyTitle", "My Screening Journey")}
        </h2>
        <p className="text-xs sm:text-sm text-[#6F6267] mt-1">
          {t("myScreeningJourneyDesc", "Track each step of your eye health journey from initial registration through follow-up reminders.")}
        </p>
      </div>

      {/* CORE PRODUCT PRINCIPLE BANNER: YOU DON'T NEED TO OPERATE THE AI YOURSELF */}
      <div className="p-5 rounded-2xl bg-white border border-[#EFE4DC] shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFE5D8] text-[#F05A28] flex items-center justify-center font-bold text-sm">
            💡
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2B2024]">
              {t("patientAiSupportHeading", "You don't need to operate the AI system yourself")}
            </h3>
            <span className="text-xs text-[#9E8D91]">
              {t("patientAiSupportSubheading", "How RetinaGuard supports you and your community healthcare team")}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
          {t("patientAiSupportBody", "At a participating screening center, a trained community health worker captures the required retinal images using a specialized digital camera. RetinaGuard then assists the screening team with instant image quality checking and referral decision support. A certified doctor reviews the findings so you receive clear, understandable care recommendations.")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
            <div className="font-bold text-[#2B2024] mb-1">{t("forYouPatientTitle", "For You (Patient)")}</div>
            <p className="text-[#6F6267] text-[11px] leading-relaxed">
              {t("forYouPatientDesc", "Fast access, painless checks, understandable reports, and timely care reminders.")}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
            <div className="font-bold text-[#2B2024] mb-1">{t("forScreeningHelperTitle", "For Screening Helper")}</div>
            <p className="text-[#6F6267] text-[11px] leading-relaxed">
              {t("forScreeningHelperDesc", "Real-time image quality feedback, assisted risk triage, and referral workflow tools.")}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
            <div className="font-bold text-[#2B2024] mb-1">{t("forEyeDoctorTitle", "For Eye Doctor")}</div>
            <p className="text-[#6F6267] text-[11px] leading-relaxed">
              {t("forEyeDoctorDesc", "Standardized image views, multimodal clinical metadata, and organized review queues.")}
            </p>
          </div>
        </div>
      </div>

      {/* TIMELINE STEPS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F05A28]">
          {t("careContinuumProgressHeading", "Care Continuum Progress")}
        </h3>

        <div className="relative border-l-2 border-[#FED7AA] ml-4 sm:ml-6 space-y-6 pb-2">
          {journeySteps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <div key={step.step} className="relative pl-6 sm:pl-8">
                {/* Step Circle Marker */}
                <div
                  className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-xs ${
                    isCompleted
                      ? 'bg-[#059669] border-white text-white'
                      : isCurrent
                      ? 'bg-[#F05A28] border-white text-white animate-pulse'
                      : 'bg-white border-[#D6D3D1] text-[#9E8D91]'
                  }`}
                >
                  {isCompleted ? '✓' : step.step}
                </div>

                {/* Content Box */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE4DC] shadow-2xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#F05A28]" />
                      <h4 className="text-sm font-bold text-[#2B2024]">{step.title}</h4>
                    </div>
                    <span className="text-[11px] font-semibold text-[#9E8D91]">{step.date}</span>
                  </div>

                  <p className="text-xs text-[#6F6267] leading-relaxed">
                    {step.desc}
                  </p>

                  {step.step === 5 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onNavigateToReports}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFE5D8] hover:bg-[#FFEDD5] border border-[#FED7AA] text-[#D84818] text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t("viewMyReportsArrow", "View My Screening Reports →")}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EFE4DC] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif font-bold text-base sm:text-lg text-[#2B2024]">
            {t("needAnotherScreeningQuestion", "Need another screening or advice?")}
          </h4>
          <p className="text-xs text-[#6F6267] mt-0.5">
            {t("locateNearbyCentersDesc", "Locate nearby certified screening centers and eye camps across Karnataka, Maharashtra, and Delhi NCR.")}
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToFindScreening}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Building className="w-4 h-4" />
          <span>{t("findScreeningCenterBtn", "Find a Screening Center")}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
