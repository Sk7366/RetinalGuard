import React, { useState } from 'react';
import {
  X,
  Eye,
  Camera,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Building,
  User as UserIcon,
  MapPin,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { HelperRoleTitle, User, UserRole, VerificationStatus } from '../types';
import { authService } from '../auth/authService';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User) => void;
  initialMode?: 'select' | 'helper-auth' | 'researcher-auth';
}

const HELPER_ROLES: HelperRoleTitle[] = [
  'Community Health Worker',
  'Screening Technician',
  'Nurse',
  'Primary Care Provider',
  'Ophthalmic Assistant',
  'Healthcare Provider',
  'Program Coordinator',
];

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'select',
}) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'select' | 'helper-auth' | 'researcher-auth'>(initialMode);

  // Helper form state
  const [helperName, setHelperName] = useState('Ananya Rao');
  const [helperEmail, setHelperEmail] = useState('ananya.rao@healthmission.org');
  const [helperRole, setHelperRole] = useState<HelperRoleTitle>('Community Health Worker');
  const [helperOrg, setHelperOrg] = useState('Bengaluru District Eye Mission');
  const [helperLocation, setHelperLocation] = useState('Bengaluru, Karnataka');
  const [helperVerification, setHelperVerification] = useState<VerificationStatus>('verified');

  // Researcher form state
  const [researcherName, setResearcherName] = useState('Dr. Sai Krishnan');
  const [researcherEmail, setResearcherEmail] = useState('sai.krishnan@visionai.edu');
  const [researcherOrg, setResearcherOrg] = useState('Medical AI & Retina Imaging Lab');
  const [researcherLocation, setResearcherLocation] = useState('Indian Institute of Science / AIIMS');

  if (!isOpen) return null;

  const handlePatientSelect = () => {
    const guestUser = authService.getCurrentUser();
    onSuccessLogin(guestUser);
    onClose();
  };

  const handleHelperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await authService.login(helperEmail, 'helper', {
      name: helperName,
      helperRoleTitle: helperRole,
      organization: helperOrg,
      location: helperLocation,
      verificationStatus: helperVerification,
      isDemoVerification: true,
      voiceGuidanceEnabled: true,
    });
    onSuccessLogin(user);
    onClose();
  };

  const handleResearcherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await authService.login(researcherEmail, 'researcher', {
      name: researcherName,
      organization: researcherOrg,
      location: researcherLocation,
      verificationStatus: 'verified',
      isDemoVerification: true,
    });
    onSuccessLogin(user);
    onClose();
  };

  const handleQuickDemoHelper = async () => {
    const user = await authService.loginDemoHelper();
    onSuccessLogin(user);
    onClose();
  };

  const handleQuickDemoResearcher = async () => {
    const user = await authService.loginDemoResearcher();
    onSuccessLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl border border-[#EFE4DC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-heading"
      >
        {/* HEADER */}
        <div className="bg-[#FFFDFB] border-b border-[#EFE4DC] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 id="role-modal-heading" className="text-lg font-serif font-bold text-[#2E2628]">
              {view === 'select'
                ? t('roleModalTitle', 'How will you use RetinaGuard?')
                : view === 'helper-auth'
                ? 'Screening Helper Sign In & Verification'
                : 'Researcher Workspace Sign In'}
            </h2>
            <p className="text-xs text-[#6E5C5F] mt-0.5">
              {view === 'select'
                ? t('roleModalSubtitle', 'Select your dedicated workspace to access tailored tools and clear guidance.')
                : 'Role verification ensures authorized access to clinical data and screening telemetry.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#9E8D91] hover:text-[#2E2628] hover:bg-[#F9F5F1] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto">
          {/* VIEW 1: THREE CARDS SELECTION */}
          {view === 'select' && (
            <div className="space-y-4">
              {/* CARD 1: PATIENT */}
              <div
                onClick={handlePatientSelect}
                className="group p-5 rounded-2xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDFB] hover:bg-[#FFF7ED]/30 cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-serif font-bold text-[#2E2628]">
                        {t('rolePatientTitle', "I'm Looking for Screening")}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5EFEB] text-[#6E5C5F]">
                        {t('rolePatientAudience', 'For people and families')}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5C5F] leading-relaxed max-w-md">
                      {t('rolePatientDesc', 'Find screening centers, learn why early eye photography prevents sight loss, and understand next steps.')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePatientSelect}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EFE4DC] group-hover:border-[#FED7AA] text-xs font-semibold text-[#2E2628] group-hover:text-[#EA580C] flex items-center gap-1.5 self-start sm:self-center transition-colors whitespace-nowrap"
                >
                  <span>{t('rolePatientCta', 'Continue as Patient')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CARD 2: SCREENING HELPER */}
              <div
                onClick={() => setView('helper-auth')}
                className="group p-5 rounded-2xl border-2 border-[#EA580C]/30 hover:border-[#EA580C] bg-white hover:bg-[#FFFDFB] cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#EA580C] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-serif font-bold text-[#2E2628]">
                        {t('roleHelperTitle', 'I Help with Screening')}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                        {t('roleHelperAudience', 'For community screening workers & healthcare teams')}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5C5F] leading-relaxed max-w-md">
                      {t('roleHelperDesc', 'Capture retinal photos, review AI quality scores, conduct camp triage, and coordinate patient referrals.')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setView('helper-auth')}
                  className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center transition-colors whitespace-nowrap shadow-xs"
                >
                  <span>{t('roleHelperCta', 'Continue as Screening Helper')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CARD 3: RESEARCHER */}
              <div
                onClick={() => setView('researcher-auth')}
                className="group p-5 rounded-2xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDFB] hover:bg-[#FFF7ED]/30 cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#2E2628] text-white flex items-center justify-center flex-shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-serif font-bold text-[#2E2628]">
                        {t('roleResearcherTitle', "I'm a Researcher")}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5EFEB] text-[#6E5C5F]">
                        {t('roleResearcherAudience', 'Academic & AI validation')}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5C5F] leading-relaxed max-w-md">
                      {t('roleResearcherDesc', 'Explore multimodal late fusion, ablation matrices, Grad-CAM attention heatmaps, and SaMD metrics.')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setView('researcher-auth')}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EFE4DC] group-hover:border-[#FED7AA] text-xs font-semibold text-[#2E2628] group-hover:text-[#EA580C] flex items-center gap-1.5 self-start sm:self-center transition-colors whitespace-nowrap"
                >
                  <span>{t('roleResearcherCta', 'Continue as Researcher')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: SCREENING HELPER AUTH & VERIFICATION */}
          {view === 'helper-auth' && (
            <form onSubmit={handleHelperSubmit} className="space-y-4">
              {/* DEMO QUICK ACCESS BANNER */}
              <div className="p-4 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C2410C]">
                    <Sparkles className="w-4 h-4 text-[#EA580C]" />
                    <span>Quick Demo Screening Helper Access</span>
                  </div>
                  <p className="text-xs text-[#9A3412] mt-0.5">
                    Preloaded profile: Ananya Rao (Community Health Worker • Bengaluru Urban Eye Mission)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoHelper}
                  className="px-3 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
                >
                  Sign In with Demo Helper
                </button>
              </div>

              {/* CREDENTIALS FORM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={helperName}
                    onChange={(e) => setHelperName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Work Email / ID
                  </label>
                  <input
                    type="email"
                    required
                    value={helperEmail}
                    onChange={(e) => setHelperEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Specific Healthcare Role
                  </label>
                  <select
                    value={helperRole}
                    onChange={(e) => setHelperRole(e.target.value as HelperRoleTitle)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628] bg-white"
                  >
                    {HELPER_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Affiliated Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={helperOrg}
                    onChange={(e) => setHelperOrg(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    District / Camp Location
                  </label>
                  <input
                    type="text"
                    required
                    value={helperLocation}
                    onChange={(e) => setHelperLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>
              </div>

              {/* DEMO VERIFICATION BADGE NOTICE */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#6E5C5F] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#EA580C] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#2E2628]">DEMO VERIFICATION APPLIED</span>
                  <p className="text-[11px] mt-0.5 leading-relaxed">
                    In production deployments, account credentials and clinical licenses are vetted by district health coordinators. For this evaluation, your account will be granted verified screening privileges instantly.
                  </p>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EFE4DC]">
                <button
                  type="button"
                  onClick={() => setView('select')}
                  className="px-4 py-2 text-xs font-medium text-[#6E5C5F] hover:text-[#2E2628] transition-colors"
                >
                  ← Back to Workspace Selection
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Enter Screening Helper Dashboard
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: RESEARCHER AUTH */}
          {view === 'researcher-auth' && (
            <form onSubmit={handleResearcherSubmit} className="space-y-4">
              {/* DEMO QUICK ACCESS */}
              <div className="p-4 rounded-xl bg-[#F9F5F1] border border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E2628]">
                    <Layers className="w-4 h-4 text-[#EA580C]" />
                    <span>Quick Demo Researcher Access</span>
                  </div>
                  <p className="text-xs text-[#6E5C5F] mt-0.5">
                    Preloaded profile: Dr. Sai Krishnan (Medical AI & Retina Imaging Lab • IISc / AIIMS)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoResearcher}
                  className="px-3 py-1.5 rounded-lg bg-[#2E2628] hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
                >
                  Sign In with Demo Researcher
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Researcher Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={researcherName}
                    onChange={(e) => setResearcherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    value={researcherEmail}
                    onChange={(e) => setResearcherEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Research Institute / University
                  </label>
                  <input
                    type="text"
                    required
                    value={researcherOrg}
                    onChange={(e) => setResearcherOrg(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>
              </div>

              {/* NOTICE */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#6E5C5F]">
                Access granted to multimodal ablation matrices, ROC/PR curves, ONNX inference benchmarks, and SaMD compliance documentation.
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EFE4DC]">
                <button
                  type="button"
                  onClick={() => setView('select')}
                  className="px-4 py-2 text-xs font-medium text-[#6E5C5F] hover:text-[#2E2628] transition-colors"
                >
                  ← Back to Workspace Selection
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2E2628] hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Enter Research Workspace
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
