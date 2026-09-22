import React, { useState } from 'react';
import {
  FileText,
  Mail,
  Download,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  ShieldCheck,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { User as UserType } from '../types';

interface PatientReportsViewProps {
  currentUser: UserType;
  onNavigateToScreening: () => void;
  onOpenAuth: () => void;
}

interface MockReport {
  id: string;
  date: string;
  centerName: string;
  status: 'normal' | 'review_recommended' | 'urgent';
  gradeName: string;
  plainSummary: string;
  recommendedAction: string;
  urgencyDays: string;
  hasPdf: boolean;
  technicalDetails?: {
    model: string;
    modalities: string;
    confidence: string;
    gradCamRegion: string;
    shapTopFactors: string[];
  };
}

export const PatientReportsView: React.FC<PatientReportsViewProps> = ({
  currentUser,
  onNavigateToScreening,
  onOpenAuth,
}) => {
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState<MockReport | null>(null);
  const [emailSentId, setEmailSentId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);

  const handleDownloadPdf = (reportId: string) => {
    setDownloadingId(reportId);
    setTimeout(() => {
      setDownloadingId(null);
    }, 3000);
  };

  const mockReports: MockReport[] = [
    {
      id: 'REP-2026-0891',
      date: '12 Sept 2026',
      centerName: 'Victoria Hospital Regional Eye Center, Bengaluru',
      status: 'normal',
      gradeName: 'No Apparent Retinopathy Detected',
      plainSummary:
        'Your retinal photographs showed no visible signs of diabetic damage. Both blood vessels and optic nerves appear healthy and stable.',
      recommendedAction:
        'Maintain routine blood sugar management and schedule your next routine annual screening in 12 months.',
      urgencyDays: 'Routine check in 12 months',
      hasPdf: true,
      technicalDetails: {
        model: 'EfficientNet-B4 + Vision Transformer (Fusion v2.4)',
        modalities: 'Fundus Photography (OD/OS) + Blood Glucose Meta',
        confidence: '98.4%',
        gradCamRegion: 'Fovea and optic disc clear, zero microaneurysms detected',
        shapTopFactors: ['HbA1c stability (+0.42)', 'Blood Pressure nominal (+0.31)'],
      },
    },
    {
      id: 'REP-2025-0412',
      date: '18 Aug 2025',
      centerName: 'KC General Community Eye Camp, Malleshwaram',
      status: 'review_recommended',
      gradeName: 'Mild Retinal Changes Observed',
      plainSummary:
        'Minor micro-vascular spots were detected in the peripheral retina. This indicates early stage changes that should be monitored by an ophthalmologist.',
      recommendedAction:
        'Consult your local eye specialist within 30 days for a dilated clinical exam and lifestyle review.',
      urgencyDays: 'Visit ophthalmologist within 30 days',
      hasPdf: true,
      technicalDetails: {
        model: 'EfficientNet-B4 + XGBoost Late Fusion',
        modalities: 'Fundus Color Photo (OD) + Metadata',
        confidence: '89.1%',
        gradCamRegion: 'Temporal quadrant microaneurysm cluster (Grade 1)',
        shapTopFactors: ['Diabetes duration 8 yrs (+0.38)', 'HbA1c 7.9% (+0.29)'],
      },
    },
  ];

  const handleSendEmail = (report: MockReport) => {
    if (!currentUser.emailVerified) {
      onOpenAuth();
      return;
    }
    setEmailSentId(report.id);
    setTimeout(() => {
      setEmailSentId(null);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[#2E2628]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>{t("confidentialPatientRecordsTag", "CONFIDENTIAL PATIENT RECORDS")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628]">
            {t("myScreeningReportsTitle", "My Screening Reports")}
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1">
            {t("myScreeningReportsDesc", "Access, download, and securely email your past retinal screening results.")}
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToScreening}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>{t("findScreeningCenterBtn", "Find a Screening Center")}</span>
        </button>
      </div>

      {/* VERIFIED EMAIL BADGE */}
      <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Mail className="w-4 h-4 text-[#EA580C]" />
          <div>
            <span className="font-semibold text-[#2E2628]">{t("deliveryEmailLabel", "Delivery Email:")} </span>
            <span className="text-[#6E5C5F] font-mono">{currentUser.email}</span>
            {currentUser.emailVerified ? (
              <span className="ml-2 inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {t("verifiedBadge", "Verified ✓")}
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {t("unverifiedBadge", "Unverified (Verify to send)")}
              </span>
            )}
          </div>
        </div>

        {!currentUser.emailVerified && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="text-xs font-semibold text-[#EA580C] hover:underline shrink-0"
          >
            {t("verifyEmailNowLink", "Verify Email Now →")}
          </button>
        )}
      </div>

      {/* REPORT LIST */}
      <div className="space-y-4">
        {mockReports.map((report) => {
          const isNormal = report.status === 'normal';
          const isReview = report.status === 'review_recommended';
          const isUrgent = report.status === 'urgent';
          const isTechExpanded = expandedTechId === report.id;

          return (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-[#EFE4DC] shadow-2xs hover:border-[#D6D3D1] transition-all p-5 sm:p-6 space-y-4"
            >
              {/* TOP ROW: DATE, CENTER, STATUS BADGE */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs text-[#9E8D91]">
                  <Calendar className="w-4 h-4 text-[#EA580C]" />
                  <span className="font-semibold text-[#2E2628]">{report.date}</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">{report.id}</span>
                </div>

                {/* Status chip with Color + Icon + Text */}
                <div className="self-start sm:self-auto">
                  {isNormal && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t("statusNormalClean", "✓ Normal • No Concerning Signs")}</span>
                    </span>
                  )}
                  {isReview && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>{t("statusReviewFollowUp", "⚠ Needs Review • Follow-Up Recommended")}</span>
                    </span>
                  )}
                  {isUrgent && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                      <span>{t("statusUrgentClinical", "! Further Clinical Evaluation Required")}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* CENTER NAME */}
              <div className="flex items-center gap-2 text-xs font-medium text-[#6E5C5F]">
                <Building className="w-3.5 h-3.5 text-[#9E8D91]" />
                <span>{report.centerName}</span>
              </div>

              {/* PLAIN LANGUAGE SUMMARY */}
              <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]/80 space-y-2">
                <div className="text-sm font-bold text-[#2E2628]">
                  {report.gradeName}
                </div>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  {report.plainSummary}
                </p>
                <div className="pt-2 border-t border-[#EFE4DC]/60 flex items-start gap-2 text-xs text-[#2E2628]">
                  <span className="font-bold text-[#EA580C] shrink-0">{t("recommendedNextStepLabel", "Recommended Next Step:")}</span>
                  <span>{report.recommendedAction}</span>
                </div>
              </div>

              {/* ACTIONS: SEND TO VERIFIED EMAIL, VIEW REPORT, DOWNLOAD */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendEmail(report)}
                    disabled={emailSentId === report.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE4DC] bg-white hover:bg-[#F9F5F1] text-xs font-semibold text-[#2E2628] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>
                      {emailSentId === report.id
                        ? t("sentToEmailSuccess", "Sent to Email ✓")
                        : t("sendReportToEmailBtn", "Send Report to Verified Email")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedTechId(isTechExpanded ? null : report.id)}
                    className="inline-flex items-center gap-1 text-xs text-[#6E5C5F] hover:text-[#2E2628] font-medium px-2 py-1"
                  >
                    <span>{isTechExpanded ? t("hideTechDetails", "Hide Technical Details") : t("viewTechDetailsOptional", "View Technical Details (Optional)")}</span>
                    {isTechExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(report.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2E2628] hover:bg-black text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === report.id ? t("generatingPdf", "Generating PDF...") : t("downloadPdfBtn", "Download PDF")}</span>
                  </button>
                </div>
              </div>

              {/* EMAIL SENT CONFIRMATION BANNER */}
              {emailSentId === report.id && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {t("reportSentNotification", "Report was successfully sent to your verified email address. Please check your inbox.")}
                  </span>
                </div>
              )}

              {/* PDF DOWNLOAD IN-PROGRESS / PREPARATION BANNER */}
              {downloadingId === report.id && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {t("officialEncryptedPdfNotice", "Official encrypted PDF is downloaded for your medical records and specialist consultation.")}
                  </span>
                </div>
              )}

              {/* COLLAPSIBLE TECHNICAL DETAILS (Grad-CAM, SHAP, Fusion) */}
              {isTechExpanded && report.technicalDetails && (
                <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between font-bold text-[#2E2628] pb-1 border-b border-[#EFE4DC]">
                    <span>{t("techDecisionSupportTitle", "Technical Decision Support Details (For Clinicians)")}</span>
                    <span className="text-[10px] text-[#9E8D91]">SaMD IEC 62304 / IMDRF Compliant</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#6E5C5F]">
                    <div>
                      <span className="font-semibold text-[#2E2628] block">{t("inferenceModelLabel", "Inference Model:")}</span>
                      <span>{report.technicalDetails.model}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#2E2628] block">{t("modalitiesAnalyzedLabel", "Modalities Analyzed:")}</span>
                      <span>{report.technicalDetails.modalities}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#2E2628] block">{t("modelConfidenceLabel", "Model Confidence:")}</span>
                      <span className="font-mono font-bold text-[#EA580C]">{report.technicalDetails.confidence}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#2E2628] block">{t("gradCamSalienceFocusLabel", "Grad-CAM Salience Focus:")}</span>
                      <span>{report.technicalDetails.gradCamRegion}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-[#2E2628] block mb-1">{t("keyContributingShapLabel", "Key Contributing SHAP Factors:")}</span>
                    <ul className="list-disc list-inside text-[#6E5C5F] space-y-0.5">
                      {report.technicalDetails.shapTopFactors.map((factor, idx) => (
                        <li key={idx} className="font-mono text-[11px]">{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
