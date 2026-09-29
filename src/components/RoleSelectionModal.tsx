import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Building,
  User as UserIcon,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Stethoscope,
  Microscope,
  Check,
  LogIn,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  Award,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { HelperRoleTitle, User, UserRole, VerificationStatus } from '../types';
import { authService } from '../auth/authService';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { RetinaGuardLogo } from './RetinaGuardLogo';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User) => void;
  initialMode?: 'select' | 'patient-auth' | 'helper-auth' | 'researcher-auth';
}

const HELPER_ROLES: HelperRoleTitle[] = [
  'Community Health Worker',
  'Screening Technician',
  'Nurse',
  'Healthcare Provider',
  'Ophthalmic Assistant',
  'Program Coordinator',
];

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'select',
}) => {
  const { t, language, setLanguage } = useTranslation();

  // Navigation inside the modal
  const [view, setView] = useState<'select' | 'patient-auth' | 'helper-auth' | 'researcher-auth'>(initialMode);
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');

  // Contact verification simulate state
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Patient Form
  const [patientName, setPatientName] = useState('K. Meenakshi Amma');
  const [patientEmail, setPatientEmail] = useState('meenakshi.amma@gmail.com');
  const [patientPhone, setPatientPhone] = useState('+91 98451 22334');
  const [patientPassword, setPatientPassword] = useState('••••••••');
  const [patientDob, setPatientDob] = useState('1963-04-12');
  const [patientLanguage, setPatientLanguage] = useState(language);

  // Medical Worker Form
  const [helperName, setHelperName] = useState('Ananya Rao');
  const [helperEmail, setHelperEmail] = useState('ananya.rao@healthmission.org');
  const [helperPhone, setHelperPhone] = useState('+91 98450 67890');
  const [helperPassword, setHelperPassword] = useState('••••••••');
  const [helperOrg, setHelperOrg] = useState('Bengaluru District Eye Mission');
  const [helperRole, setHelperRole] = useState<HelperRoleTitle>('Community Health Worker');
  const [helperArea, setHelperArea] = useState('Bengaluru Urban & Rural Districts');
  const [helperProfId, setHelperProfId] = useState('CHW-KA-2024-8841');

  // Researcher Form
  const [researcherName, setResearcherName] = useState('Dr. Sai Krishnan');
  const [researcherEmail, setResearcherEmail] = useState('sai.krishnan@visionai.edu');
  const [researcherPhone, setResearcherPhone] = useState('+91 94480 55432');
  const [researcherPassword, setResearcherPassword] = useState('••••••••');
  const [researcherInstitution, setResearcherInstitution] = useState('Indian Institute of Science / AIIMS');
  const [researcherDepartment, setResearcherDepartment] = useState('Medical AI & Retina Imaging Lab');
  const [researcherArea, setResearcherArea] = useState('Multimodal Late Fusion DR Trial');
  const [researcherPurpose, setResearcherPurpose] = useState('Validation of non-mydriatic community triage AI algorithms');
  const [researcherOrcid, setResearcherOrcid] = useState('0000-0002-1825-0097');

  // Synchronize initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(initialMode);
      setAuthTab('signin');
      setFormError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // ==========================================
  // PATIENT ACTIONS
  // ==========================================
  const handleQuickDemoPatient = async () => {
    const user = await authService.loginDemoPatient();
    onSuccessLogin(user);
    onClose();
  };

  const handlePatientSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientEmail) {
      setFormError('Please provide your registered email address.');
      return;
    }
    const user = await authService.login(patientEmail, 'patient', {
      name: patientName,
      phone: patientPhone,
      dateOfBirth: patientDob,
      preferredLanguage: patientLanguage,
      verificationStatus: 'verified',
      emailVerified: true,
      phoneVerified: true,
    });
    onSuccessLogin(user);
    onClose();
  };

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientEmail.trim() || !patientPhone.trim()) {
      setFormError('Please enter your full name, email, and phone number.');
      return;
    }
    const user = await authService.registerPatient({
      name: patientName.trim(),
      email: patientEmail.trim(),
      phone: patientPhone.trim(),
      preferredLanguage: patientLanguage,
      dateOfBirth: patientDob,
      emailVerified: true,
      phoneVerified: true,
    });
    onSuccessLogin(user);
    onClose();
  };

  // ==========================================
  // MEDICAL WORKER ACTIONS
  // ==========================================
  const handleDemoMedicalWorkerVerified = async () => {
    const user = await authService.loginDemoHelper({
      verificationStatus: 'Verified',
    });
    onSuccessLogin(user);
    onClose();
  };

  const handleDemoMedicalWorkerPending = async () => {
    const user = await authService.loginDemoHelper({
      name: 'Rajesh Nair',
      email: 'rajesh.nair@mobilevision.org',
      role: 'Screening Technician',
      organization: 'South Zone Mobile Eye Van',
      phone: '+91 94460 12345',
      location: 'Mysuru Rural Outreach',
      verificationStatus: 'Pending Verification',
    });
    onSuccessLogin(user);
    onClose();
  };

  const handleMedicalWorkerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helperEmail) {
      setFormError('Please enter your medical worker email address.');
      return;
    }
    const user = await authService.login(helperEmail, 'helper', {
      name: helperName,
      helperRoleTitle: helperRole,
      organization: helperOrg,
      location: helperArea,
      phone: helperPhone,
      verificationStatus: 'Verified',
      isDemoVerification: true,
    });
    onSuccessLogin(user);
    onClose();
  };

  const handleMedicalWorkerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helperName.trim() || !helperEmail.trim() || !helperOrg.trim() || !helperPhone.trim()) {
      setFormError('Please fill in your name, email, organization, and phone.');
      return;
    }
    // Registered medical worker receives 'Pending Verification'
    const user = await authService.registerMedicalWorker({
      name: helperName.trim(),
      email: helperEmail.trim(),
      phone: helperPhone.trim(),
      organization: helperOrg.trim(),
      roleTitle: helperRole,
      areaOfWork: helperArea.trim(),
      professionalId: helperProfId.trim(),
      verificationStatus: 'Pending Verification',
    });
    onSuccessLogin(user);
    onClose();
  };

  // ==========================================
  // RESEARCHER ACTIONS
  // ==========================================
  const handleDemoResearcherVerified = async () => {
    const user = await authService.loginDemoResearcher({
      verificationStatus: 'verified',
    });
    onSuccessLogin(user);
    onClose();
  };

  const handleDemoResearcherPending = async () => {
    const user = await authService.loginDemoResearcher({
      name: 'Dr. Aniket Sharma, PhD',
      email: 'aniket.sharma@research-eye.ac.in',
      institution: 'National Eye Research Center',
      department: 'Biomedical Imaging Division',
      researchArea: 'Cross-Attention OCT DME Benchmarks',
      verificationStatus: 'Pending Verification',
    });
    onSuccessLogin(user);
    onClose();
  };

  const handleResearcherSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researcherEmail) {
      setFormError('Please provide your institutional email address.');
      return;
    }
    const user = await authService.login(researcherEmail, 'researcher', {
      name: researcherName,
      institution: researcherInstitution,
      department: researcherDepartment,
      organization: researcherInstitution,
      researchArea: researcherArea,
      location: researcherDepartment,
      phone: researcherPhone,
      verificationStatus: 'verified',
      isDemoVerification: true,
    });
    onSuccessLogin(user);
    onClose();
  };

  const handleResearcherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researcherName.trim() || !researcherEmail.trim() || !researcherInstitution.trim()) {
      setFormError('Please fill in your name, institutional email, and institution.');
      return;
    }
    // Registered researcher receives 'Pending Verification'
    const user = await authService.registerResearcher({
      name: researcherName.trim(),
      email: researcherEmail.trim(),
      phone: researcherPhone.trim(),
      institution: researcherInstitution.trim(),
      department: researcherDepartment.trim(),
      researchArea: researcherArea.trim(),
      researchPurpose: researcherPurpose.trim(),
      orcid: researcherOrcid.trim(),
      verificationStatus: 'Pending Verification',
    });
    onSuccessLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white dark:bg-[#1B161A] w-full max-w-3xl rounded-3xl border border-[#EFE4DC] dark:border-[#33292F] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-auth-modal-title"
      >
        {/* MODAL HEADER */}
        <div className="bg-[#FFFDFB] dark:bg-[#201A1F] border-b border-[#EFE4DC] dark:border-[#33292F] px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'select' && (
              <button
                type="button"
                onClick={() => {
                  setView('select');
                  setFormError(null);
                }}
                className="p-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] text-[#6F6267] dark:text-[#C8BCC2] hover:bg-[#FAF8F6] dark:hover:bg-[#251E23] transition-colors cursor-pointer"
                title="Back to role selection"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 drop-shadow-xs">
                <RetinaGuardLogo className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F05A28] uppercase tracking-wider mb-0.5">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('authSessionTitle', 'Account Role & Authentication')}</span>
                </div>
                <h2 id="role-auth-modal-title" className="text-xl sm:text-2xl font-serif font-bold text-[#2B2024] dark:text-[#FAF5F7]">
                  {view === 'select'
                    ? t('roleModalTitle', "Choose how you'll use RetinaGuard")
                    : view === 'patient-auth'
                    ? t('patientAuthHeader', 'Patient Account Access')
                    : view === 'helper-auth'
                    ? t('helperAuthHeader', 'Medical Worker / Social Helper Access')
                    : t('researcherAuthHeader', 'Researcher Lab Access')}
                </h2>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-[#8E7E81] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FAF8F6] dark:hover:bg-[#251E23] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* =====================================================================
              VIEW 1: THREE CLEAR ROLE SELECTION CARDS
              1. PATIENT
              2. MEDICAL WORKER / SOCIAL HELPER
              3. RESEARCHER
              ===================================================================== */}
          {view === 'select' && (
            <div className="space-y-4">
              <div className="text-xs sm:text-sm text-[#6F6267] dark:text-[#C8BCC2] leading-relaxed">
                {t(
                  'roleModalExplanation',
                  'Select your authenticated account role to sign in or create an account. Selecting a professional or researcher role requires credential verification before advanced tools are unlocked.'
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* ---------------- CARD 1: PATIENT ---------------- */}
                <div className="rounded-2xl border-2 border-[#EFE4DC] dark:border-[#33292F] hover:border-[#FED7AA] dark:hover:border-[#582A1B] bg-[#FFFDF9] dark:bg-[#1E181D] p-5 transition-all shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFE5D8] dark:bg-[#3D251E] border border-[#FED7AA] dark:border-[#582A1B] text-[#F05A28] flex items-center justify-center shrink-0 shadow-2xs">
                        <Eye className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-serif font-bold text-[#2B2024] dark:text-[#FAF5F7]">
                            {t('rolePatient', 'Patient')}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                            {t('instantAccess', 'Instant Access')}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#8E7E81] dark:text-[#A8989D]">
                          {t('rolePatientForWho', 'For people and families looking for screening')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <ul className="text-xs text-[#6F6267] dark:text-[#C8BCC2] space-y-1.5 pl-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Learn about retinal health & diabetes prevention</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Perform supported self-screening & upload images/reports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Find screening centers & book free eye checks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>View screening history & download clinical diagnostic reports</span>
                    </li>
                  </ul>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1 border-t border-[#EFE4DC] dark:border-[#33292F]">
                    <button
                      type="button"
                      onClick={() => {
                        setView('patient-auth');
                        setAuthTab('signin');
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t('rolePatientCta', 'Continue as Patient')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickDemoPatient}
                      className="py-2.5 px-3.5 rounded-xl border border-[#FED7AA] bg-[#FFE5D8] hover:bg-[#FFEDD5] dark:bg-[#3D251E] dark:hover:bg-[#4C2E25] text-xs font-bold text-[#D84818] dark:text-[#FF9D73] transition-colors whitespace-nowrap cursor-pointer text-center"
                      title="Instant demo sign in as verified patient"
                    >
                      Demo Patient Sign In
                    </button>
                  </div>
                </div>

                {/* ---------------- CARD 2: MEDICAL WORKER / SOCIAL HELPER ---------------- */}
                <div className="rounded-2xl border-2 border-[#EFE4DC] dark:border-[#33292F] hover:border-[#A7F3D0] dark:hover:border-[#065F46] bg-[#FFFDF9] dark:bg-[#1E181D] p-5 transition-all shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] dark:bg-[#102D24] border border-[#A7F3D0] dark:border-[#065F46] text-[#059669] flex items-center justify-center shrink-0 shadow-2xs">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-serif font-bold text-[#2B2024] dark:text-[#FAF5F7]">
                            {t('roleMedicalWorker', 'Medical Worker / Social Helper')}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]">
                            {t('verificationRequiredBadge', 'Verification Required')}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#8E7E81] dark:text-[#A8989D]">
                          {t('roleHelperForWho', 'For ASHA/community health workers, nurses, outreach workers & technicians')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <ul className="text-xs text-[#6F6267] dark:text-[#C8BCC2] space-y-1.5 pl-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Assist patients with guided non-mydriatic screening workflow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Upload patient screening info & review automated clarity scores</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Refer patients to eye centers & manage priority triage queue</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Conduct community eye camps with offline camp mode</span>
                    </li>
                  </ul>

                  <div className="p-2.5 rounded-xl bg-[#FFFBEB] dark:bg-[#2B2315] border border-[#FDE68A] text-[11px] text-[#92400E] dark:text-[#FCD34D] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Selecting this role does not grant automatic access. Accounts are verified before professional tools are unlocked.
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1 border-t border-[#EFE4DC] dark:border-[#33292F]">
                    <button
                      type="button"
                      onClick={() => {
                        setView('helper-auth');
                        setAuthTab('signin');
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t('roleHelperCta', 'Continue as Medical Worker')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDemoMedicalWorkerVerified}
                        className="py-2.5 px-3 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] dark:bg-[#102D24] text-xs font-bold text-[#047857] dark:text-[#6EE7B7] transition-colors whitespace-nowrap cursor-pointer text-center"
                        title="Sign in with verified demo credentials"
                      >
                        Demo (Verified)
                      </button>
                      <button
                        type="button"
                        onClick={handleDemoMedicalWorkerPending}
                        className="py-2.5 px-3 rounded-xl border border-[#FCD34D] bg-[#FEF3C7] hover:bg-[#FDE68A] text-xs font-bold text-[#92400E] transition-colors whitespace-nowrap cursor-pointer text-center"
                        title="Sign in with pending verification credentials to review gate"
                      >
                        Demo (Pending)
                      </button>
                    </div>
                  </div>
                </div>

                {/* ---------------- CARD 3: RESEARCHER ---------------- */}
                <div className="rounded-2xl border-2 border-[#EFE4DC] dark:border-[#33292F] hover:border-[#DDD6FE] dark:hover:border-[#4C1D95] bg-[#FFFDF9] dark:bg-[#1E181D] p-5 transition-all shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] dark:bg-[#2E1A47] border border-[#DDD6FE] dark:border-[#4C1D95] text-[#6D28D9] flex items-center justify-center shrink-0 shadow-2xs">
                        <Microscope className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-serif font-bold text-[#2B2024] dark:text-[#FAF5F7]">
                            {t('roleResearcher', 'Researcher')}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                            {t('accreditationRequiredBadge', 'IRB & Ethics Verification')}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#8E7E81] dark:text-[#A8989D]">
                          {t('roleResearcherForWho', 'For academic researchers, clinical researchers & authorized institutions')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <ul className="text-xs text-[#6F6267] dark:text-[#C8BCC2] space-y-1.5 pl-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Multimodal late fusion AI model validation (ONNX/PyTorch)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Ablation matrices, sensitivity analysis & SaMD evaluation metrics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Grad-CAM attention heatmaps & SHAP clinical attribution maps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span>Public benchmark dataset inspection (EyePACS, Messidor-2, IDRiD)</span>
                    </li>
                  </ul>

                  <div className="p-2.5 rounded-xl bg-[#FAF5FF] dark:bg-[#281A38] border border-[#DDD6FE] text-[11px] text-[#6D28D9] dark:text-[#C4B5FD] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Research-specific tools and datasets are accessible only after institutional affiliation and IRB authorization.
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1 border-t border-[#EFE4DC] dark:border-[#33292F]">
                    <button
                      type="button"
                      onClick={() => {
                        setView('researcher-auth');
                        setAuthTab('signin');
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t('roleResearcherCta', 'Continue as Researcher')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDemoResearcherVerified}
                        className="py-2.5 px-3 rounded-xl border border-[#DDD6FE] bg-[#EDE9FE] hover:bg-[#DDD6FE] text-xs font-bold text-[#6D28D9] transition-colors whitespace-nowrap cursor-pointer text-center"
                        title="Sign in with verified researcher demo credentials"
                      >
                        Demo (Verified)
                      </button>
                      <button
                        type="button"
                        onClick={handleDemoResearcherPending}
                        className="py-2.5 px-3 rounded-xl border border-[#FCD34D] bg-[#FEF3C7] hover:bg-[#FDE68A] text-xs font-bold text-[#92400E] transition-colors whitespace-nowrap cursor-pointer text-center"
                        title="Sign in with pending researcher credentials to review gate"
                      >
                        Demo (Pending)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              VIEW 2: PATIENT AUTH (SIGN IN / REGISTER)
              ===================================================================== */}
          {view === 'patient-auth' && (
            <div className="space-y-4">
              <div className="flex border-b border-[#EFE4DC] dark:border-[#33292F]">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authTab === 'signin'
                      ? 'border-[#F05A28] text-[#F05A28]'
                      : 'border-transparent text-[#6F6267] dark:text-[#C8BCC2]'
                  }`}
                >
                  Sign In to Patient Account
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authTab === 'register'
                      ? 'border-[#F05A28] text-[#F05A28]'
                      : 'border-transparent text-[#6F6267] dark:text-[#C8BCC2]'
                  }`}
                >
                  Register New Patient (Simple)
                </button>
              </div>

              {authTab === 'signin' ? (
                <form onSubmit={handlePatientSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                      Email Address or Mobile Number
                    </label>
                    <input
                      type="text"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      required
                      placeholder="e.g. meenakshi.amma@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#F05A28]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                      Password / Passcode
                    </label>
                    <input
                      type="password"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#F05A28]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Sign In to Patient Portal
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickDemoPatient}
                      className="py-2.5 px-4 rounded-xl border border-[#FED7AA] bg-[#FFE5D8] text-xs font-bold text-[#D84818] cursor-pointer"
                    >
                      Instant Demo Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePatientRegister} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#F05A28]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        required
                        placeholder="e.g. ramesh@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#F05A28]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        required
                        placeholder="+91 ••••• •••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#F05A28]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Preferred Language
                      </label>
                      <select
                        value={patientLanguage}
                        onChange={(e) => setPatientLanguage(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#F05A28]"
                      >
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.nativeLabel} ({l.label})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#F05A28]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Date of Birth / Age (Optional)
                      </label>
                      <input
                        type="date"
                        value={patientDob}
                        onChange={(e) => setPatientDob(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#F05A28]"
                      />
                    </div>
                  </div>

                  {/* Verification Badges */}
                  <div className="p-3 bg-[#ECFDF5] dark:bg-[#102D24] border border-[#A7F3D0] rounded-xl flex items-center justify-between text-xs">
                    <span className="text-[#065F46] dark:text-[#6EE7B7] font-semibold">
                      Contact Verification:
                    </span>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-[#059669]">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Phone Verified
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Create Verified Patient Account & Enter
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =====================================================================
              VIEW 3: MEDICAL WORKER AUTH (SIGN IN / REGISTER)
              ===================================================================== */}
          {view === 'helper-auth' && (
            <div className="space-y-4">
              <div className="flex border-b border-[#EFE4DC] dark:border-[#33292F]">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authTab === 'signin'
                      ? 'border-[#059669] text-[#059669]'
                      : 'border-transparent text-[#6F6267] dark:text-[#C8BCC2]'
                  }`}
                >
                  Medical Worker Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authTab === 'register'
                      ? 'border-[#059669] text-[#059669]'
                      : 'border-transparent text-[#6F6267] dark:text-[#C8BCC2]'
                  }`}
                >
                  Register as Medical Worker
                </button>
              </div>

              {authTab === 'signin' ? (
                <form onSubmit={handleMedicalWorkerSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                      Professional / Institutional Email Address
                    </label>
                    <input
                      type="email"
                      value={helperEmail}
                      onChange={(e) => setHelperEmail(e.target.value)}
                      required
                      placeholder="e.g. ananya.rao@healthmission.org"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={helperPassword}
                      onChange={(e) => setHelperPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Sign In as Medical Worker
                    </button>
                    <button
                      type="button"
                      onClick={handleDemoMedicalWorkerVerified}
                      className="py-2.5 px-3.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-xs font-bold text-[#047857] cursor-pointer"
                    >
                      Verified Demo Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleMedicalWorkerRegister} className="space-y-3.5">
                  <div className="p-3 bg-[#FFFBEB] dark:bg-[#2B2315] border border-[#FDE68A] rounded-xl text-xs text-[#92400E] dark:text-[#FCD34D] flex items-start gap-2 leading-relaxed">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Verification Required:</strong>
                      Your account will be registered with <code>role = medical_worker</code> and <code>verification_status = pending</code>. Professional screening tools will become available after your role has been verified.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={helperName}
                        onChange={(e) => setHelperName(e.target.value)}
                        required
                        placeholder="e.g. Ananya Rao"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Organization / Health Mission *
                      </label>
                      <input
                        type="text"
                        value={helperOrg}
                        onChange={(e) => setHelperOrg(e.target.value)}
                        required
                        placeholder="e.g. Bengaluru District Eye Mission"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Role / Designation *
                      </label>
                      <select
                        value={helperRole}
                        onChange={(e) => setHelperRole(e.target.value as HelperRoleTitle)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                      >
                        {HELPER_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Area of Work / District *
                      </label>
                      <input
                        type="text"
                        value={helperArea}
                        onChange={(e) => setHelperArea(e.target.value)}
                        required
                        placeholder="e.g. Tumakuru Primary Health Centre"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        value={helperEmail}
                        onChange={(e) => setHelperEmail(e.target.value)}
                        required
                        placeholder="ananya.rao@healthmission.org"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={helperPhone}
                        onChange={(e) => setHelperPhone(e.target.value)}
                        required
                        placeholder="+91 98450 67890"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Professional ID / Registration No. (Optional)
                      </label>
                      <input
                        type="text"
                        value={helperProfId}
                        onChange={(e) => setHelperProfId(e.target.value)}
                        placeholder="e.g. CHW-KA-2024-8841"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={helperPassword}
                        onChange={(e) => setHelperPassword(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#059669]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Submit for Verification & Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =====================================================================
              VIEW 4: RESEARCHER AUTH (SIGN IN / REGISTER)
              ===================================================================== */}
          {view === 'researcher-auth' && (
            <div className="space-y-4">
              <div className="flex border-b border-[#EFE4DC] dark:border-[#33292F]">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authTab === 'signin'
                      ? 'border-[#6D28D9] text-[#6D28D9]'
                      : 'border-transparent text-[#6F6267] dark:text-[#C8BCC2]'
                  }`}
                >
                  Researcher Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    authTab === 'register'
                      ? 'border-[#6D28D9] text-[#6D28D9]'
                      : 'border-transparent text-[#6F6267] dark:text-[#C8BCC2]'
                  }`}
                >
                  Register as Researcher
                </button>
              </div>

              {authTab === 'signin' ? (
                <form onSubmit={handleResearcherSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                      Institutional Email (.edu, .ac.in, .org)
                    </label>
                    <input
                      type="email"
                      value={researcherEmail}
                      onChange={(e) => setResearcherEmail(e.target.value)}
                      required
                      placeholder="e.g. sai.krishnan@visionai.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={researcherPassword}
                      onChange={(e) => setResearcherPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Sign In to Research Workspace
                    </button>
                    <button
                      type="button"
                      onClick={handleDemoResearcherVerified}
                      className="py-2.5 px-3.5 rounded-xl border border-[#DDD6FE] bg-[#EDE9FE] text-xs font-bold text-[#6D28D9] cursor-pointer"
                    >
                      Verified Demo Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResearcherRegister} className="space-y-3.5">
                  <div className="p-3 bg-[#FAF5FF] dark:bg-[#281A38] border border-[#DDD6FE] rounded-xl text-xs text-[#6D28D9] dark:text-[#C4B5FD] flex items-start gap-2 leading-relaxed">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Researcher Verification Pending:</strong>
                      Accounts are initialized in <code>verification_status = pending</code>. Research tools and benchmark datasets remain locked until institutional approval.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={researcherName}
                        onChange={(e) => setResearcherName(e.target.value)}
                        required
                        placeholder="Dr. Sai Krishnan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Institutional Email *
                      </label>
                      <input
                        type="email"
                        value={researcherEmail}
                        onChange={(e) => setResearcherEmail(e.target.value)}
                        required
                        placeholder="sai.krishnan@visionai.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Institution / University *
                      </label>
                      <input
                        type="text"
                        value={researcherInstitution}
                        onChange={(e) => setResearcherInstitution(e.target.value)}
                        required
                        placeholder="Indian Institute of Science / AIIMS"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Department / Lab *
                      </label>
                      <input
                        type="text"
                        value={researcherDepartment}
                        onChange={(e) => setResearcherDepartment(e.target.value)}
                        required
                        placeholder="Medical AI & Retina Imaging Lab"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        Research Area *
                      </label>
                      <input
                        type="text"
                        value={researcherArea}
                        onChange={(e) => setResearcherArea(e.target.value)}
                        required
                        placeholder="Multimodal Late Fusion DR Trial"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                        ORCID / Researcher ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={researcherOrcid}
                        onChange={(e) => setResearcherOrcid(e.target.value)}
                        placeholder="0000-0002-1825-0097"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] mb-1">
                      Research Purpose / Ethics Protocol
                    </label>
                    <textarea
                      rows={2}
                      value={researcherPurpose}
                      onChange={(e) => setResearcherPurpose(e.target.value)}
                      placeholder="Outline study objectives & IRB ethics reference..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#251E23] text-xs focus:outline-none focus:border-[#6D28D9]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Submit Researcher Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
