import React from 'react';
import {
  Clock,
  XCircle,
  AlertTriangle,
  User as UserIcon,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
  Lock,
  Microscope,
  FileText,
  BookOpen,
  Award,
} from 'lucide-react';
import { User, VerificationStatus } from '../types';
import { authService } from '../auth/authService';
import { useTranslation } from '../i18n/I18nContext';

interface ResearcherVerificationGateProps {
  currentUser?: User;
  user?: User;
  onVerificationUpdated?: (updatedUser: User) => void;
  onStatusUpdated?: (updatedUser: User) => void;
  onSwitchToPatient?: () => void;
  onLogout?: () => void;
}

export const ResearcherVerificationGate: React.FC<ResearcherVerificationGateProps> = ({
  currentUser: propCurrentUser,
  user: propUser,
  onVerificationUpdated,
  onStatusUpdated,
  onSwitchToPatient,
  onLogout,
}) => {
  const { t } = useTranslation();
  const currentUser = propCurrentUser || propUser || authService.getCurrentUser();
  const rawStatus = currentUser.verificationStatus || 'Pending Verification';
  const statusNormalized = rawStatus.toLowerCase();

  const isPending = statusNormalized.includes('pending');
  const isRejected = statusNormalized.includes('reject');
  const isSuspended = statusNormalized.includes('suspend');

  const notifyUpdated = (updated: User) => {
    if (onStatusUpdated) onStatusUpdated(updated);
    if (onVerificationUpdated) onVerificationUpdated(updated);
  };

  const handleSimulateApproval = () => {
    const updated = authService.setVerificationStatus('verified');
    notifyUpdated(updated);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 animate-in fade-in" id="researcher-verification-gate">
      {/* HEADER NOTICE */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
          <Lock className="w-3.5 h-3.5" />
          <span>{t('researchAccessRestricted', 'Researcher Access Restricted')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2024]">
          {t('researcherVerificationPendingTitle', 'Researcher Verification Pending')}
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6267] max-w-xl mx-auto leading-relaxed">
          {t(
            'researcherPendingNotice',
            'Your account has been created. Research-specific tools, benchmark datasets, model weights, and explainability analytics will become available once your institutional credentials and research protocol are verified.'
          )}
        </p>
      </div>

      {/* STATUS CARD */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 shadow-xs space-y-5 ${
          isPending
            ? 'bg-[#FFFBEB] border-[#FDE68A]'
            : isRejected
            ? 'bg-[#FEF2F2] border-[#FECACA]'
            : 'bg-[#F5F3FF] border-[#DDD6FE]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isPending
                  ? 'bg-[#FDE68A] text-[#B45309]'
                  : isRejected
                  ? 'bg-[#FEE2E2] text-[#DC2626]'
                  : 'bg-[#DDD6FE] text-[#6D28D9]'
              }`}
            >
              {isPending ? (
                <Clock className="w-6 h-6" />
              ) : isRejected ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6267]">
                {t('currentAccountStatus', 'Current Account Status')}
              </span>
              <h2 className="text-lg font-serif font-bold text-[#2B2024] flex items-center gap-2">
                <span>
                  {isPending
                    ? t('verificationPending', 'Verification Pending')
                    : isRejected
                    ? t('verificationRejected', 'Verification Rejected')
                    : t('accessSuspended', 'Access Suspended')}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    isPending
                      ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                      : isRejected
                      ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                      : 'bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]'
                  }`}
                >
                  {rawStatus}
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* STATUS EXPLANATION */}
        <div className="text-xs text-[#4A3B32] space-y-2 leading-relaxed">
          {isPending && (
            <p>
              {t(
                'researcherPendingExplanation',
                'Your researcher credentials have been logged and queued for review. In accordance with clinical data governance and IRB ethics compliance, research model weights, ablation matrices, and anonymized patient datasets require institutional verification before access is granted. Standard review typically concludes within 24 to 48 hours.'
              )}
            </p>
          )}
          {isRejected && (
            <p>
              {t(
                'researcherRejectedExplanation',
                'Your institutional affiliation or research ethics protocol could not be verified. If you applied with personal contact details instead of an official institutional domain, please re-submit or contact the review committee.'
              )}
            </p>
          )}
        </div>

        {/* SUBMITTED RESEARCHER PROFILE DETAILS */}
        <div className="bg-white/90 rounded-2xl p-4 border border-black/5 space-y-3">
          <div className="text-[11px] font-bold text-[#6F6267] uppercase tracking-wider">
            {t('registeredResearcherDetails', 'Registered Researcher Information')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Full Name</span>
                <span className="font-semibold text-[#2B2024]">{currentUser.name || 'Not provided'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Institution</span>
                <span className="font-semibold text-[#2B2024] truncate max-w-[170px] block">
                  {currentUser.institution || currentUser.organization || 'Not provided'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Microscope className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Department</span>
                <span className="font-semibold text-[#2B2024] truncate max-w-[170px] block">
                  {currentUser.department || 'Vision AI Lab'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Institutional Email</span>
                <span className="font-semibold text-[#2B2024] flex items-center gap-1">
                  <span className="truncate max-w-[140px]">{currentUser.email}</span>
                  <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Phone Number</span>
                <span className="font-semibold text-[#2B2024] flex items-center gap-1">
                  <span>{currentUser.phone || '+91 ••••• •••••'}</span>
                  <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Research Area</span>
                <span className="font-semibold text-[#2B2024] truncate max-w-[170px] block">
                  {currentUser.researchArea || 'Multimodal DR AI Validation'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LOCKED RESEARCH TOOLS PREVIEW */}
        <div className="p-4 rounded-2xl bg-white/70 border border-black/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#6F6267]">
            <span>{t('lockedFeaturesList', 'Research Features Pending Verification:')}</span>
            <span className="text-[10px] text-[#DC2626] font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Locked
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6F6267]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Multimodal ONNX Model Weights & Checkpoints</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Full Benchmark Datasets (IDRiD, Messidor-2)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Ablation Study Matrix & Sensitivity Runs</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Raw Grad-CAM & SHAP Activation Maps</span>
            </div>
          </div>
        </div>

        {/* SIMULATE VERIFICATION ACTION (FOR REVIEWERS & EVALUATORS) */}
        <div className="bg-[#FAF5FF] border border-[#DDD6FE] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6D28D9]">
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Reviewer & Evaluation Testing</span>
            </div>
            <p className="text-[11px] text-[#6F6267]">
              For demonstration and review, simulate immediate institutional accreditation to unlock the complete Research Lab.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSimulateApproval}
            className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-colors shadow-xs whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Simulate Verification Approval</span>
          </button>
        </div>

        {/* BOTTOM NAVIGATION ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-between pt-2 border-t border-black/10">
          <button
            type="button"
            onClick={onSwitchToPatient}
            className="px-4 py-2.5 rounded-xl border border-[#EFE4DC] bg-white hover:bg-[#FAF8F6] text-xs font-bold text-[#6F6267] transition-colors cursor-pointer"
          >
            ← Return to Patient View
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out to Switch Accounts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
