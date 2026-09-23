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
  'Healthcare Provider',
  'Ophthalmic Assistant',
  'Program Coordinator',
];

const DEMO_HELPER_PROFILES = [
  {
    name: 'Ananya Rao',
    role: 'Community Health Worker' as HelperRoleTitle,
    org: 'Bengaluru District Eye Mission',
    email: 'ananya.rao@healthmission.org',
    phone: '+91 98450 67890',
    location: 'Bengaluru, Karnataka',
    status: 'Verified' as VerificationStatus,
    badge: 'DEMO VERIFIED',
  },
  {
    name: 'Rajesh Nair',
    role: 'Screening Technician' as HelperRoleTitle,
    org: 'South Zone Mobile Eye Van',
    email: 'rajesh.nair@mobilevision.org',
    phone: '+91 94460 12345',
    location: 'Mysuru Rural Outreach',
    status: 'Pending Verification' as VerificationStatus,
    badge: 'Pending Review',
  },
  {
    name: 'Sister Priya Mathew',
    role: 'Nurse' as HelperRoleTitle,
    org: 'St. John Community Ophthalmology',
    email: 'priya.mathew@stjohn.health',
    phone: '+91 98801 55678',
    location: 'Kolar District Camp',
    status: 'Verified' as VerificationStatus,
    badge: 'DEMO VERIFIED',
  },
  {
    name: 'Dr. Kavitha S.',
    role: 'Healthcare Provider' as HelperRoleTitle,
    org: 'District Civil Hospital NCD Wing',
    email: 'kavitha.s@karnataka.gov.in',
    phone: '+91 98451 98765',
    location: 'Tumakuru General Hospital',
    status: 'Verified' as VerificationStatus,
    badge: 'DEMO VERIFIED',
  },
  {
    name: 'Arun Kumar',
    role: 'Ophthalmic Assistant' as HelperRoleTitle,
    org: 'Rural Primary Vision Center',
    email: 'arun.k@ruralvision.in',
    phone: '+91 97312 34567',
    location: 'Mandya Vision Center',
    status: 'Rejected' as VerificationStatus,
    badge: 'Rejected',
  },
  {
    name: 'Deepa Sharma',
    role: 'Program Coordinator' as HelperRoleTitle,
    org: 'State Blindness Prevention Society',
    email: 'deepa.sharma@npcbe.org',
    phone: '+91 99123 45678',
    location: 'State Directorate, Bengaluru',
    status: 'Suspended' as VerificationStatus,
    badge: 'Suspended',
  },
];

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'select',
}) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'select' | 'helper-auth' | 'researcher-auth'>(initialMode);
  const [helperAuthTab, setHelperAuthTab] = useState<'signin' | 'register'>('signin');

  // Synchronize view with initialMode when modal opens or initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      setView(initialMode);
      if (initialMode === 'helper-auth') {
        setHelperAuthTab('signin');
      }
    }
  }, [isOpen, initialMode]);

  // Helper form state
  const [helperName, setHelperName] = useState('Ananya Rao');
  const [helperEmail, setHelperEmail] = useState('ananya.rao@healthmission.org');
  const [helperPhone, setHelperPhone] = useState('+91 98450 67890');
  const [helperRole, setHelperRole] = useState<HelperRoleTitle>('Community Health Worker');
  const [helperOrg, setHelperOrg] = useState('Bengaluru District Eye Mission');
  const [helperLocation, setHelperLocation] = useState('Bengaluru, Karnataka');
  const [helperVerification, setHelperVerification] = useState<VerificationStatus>('Verified');

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
    const isVerified = helperVerification === 'Verified' || helperVerification === 'verified';
    const user = await authService.login(helperEmail, 'helper', {
      name: helperName,
      helperRoleTitle: helperRole,
      organization: helperOrg,
      location: helperLocation,
      phone: helperPhone,
      verificationStatus: helperVerification,
      isDemoVerification: isVerified,
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
                ? t('roleHelperSignIn', 'Screening Helper Sign In & Verification')
                : t('roleResearcherSignIn', 'Researcher Workspace Sign In')}
            </h2>
            <p className="text-xs text-[#6E5C5F] mt-0.5">
              {view === 'select'
                ? t('roleModalSubtitle', 'Select your dedicated workspace to access tailored tools and clear guidance.')
                : t('roleVerificationNote', 'Role verification ensures authorized access to clinical data and screening telemetry.')}
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
            <div className="space-y-4">
              {/* AUTHENTICATION SUB-TABS */}
              <div className="flex border-b border-[#EFE4DC] gap-4 text-xs font-semibold">
                <button
                  type="button"
                  id="tab-helper-signin"
                  onClick={() => setHelperAuthTab('signin')}
                  className={`pb-2.5 transition-colors relative ${
                    helperAuthTab === 'signin'
                      ? 'text-[#EA580C] border-b-2 border-[#EA580C] font-bold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628]'
                  }`}
                >
                  Sign In to Screening Helper
                </button>
                <button
                  type="button"
                  id="tab-helper-register"
                  onClick={() => setHelperAuthTab('register')}
                  className={`pb-2.5 transition-colors relative ${
                    helperAuthTab === 'register'
                      ? 'text-[#EA580C] border-b-2 border-[#EA580C] font-bold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628]'
                  }`}
                >
                  Register as Screening Helper
                </button>
              </div>

              {/* TAB A: SIGN IN */}
              {helperAuthTab === 'signin' && (
                <div className="space-y-4">
                  {/* DEMO VERIFIED BADGE HEADER */}
                  <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[#065F46] tracking-wide uppercase">
                            DEMO VERIFIED
                          </span>
                          <span className="text-[10px] font-semibold text-[#047857] bg-white px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                            Evaluation Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-[#047857] mt-0.5">
                          Select a pre-configured screening helper profile or sign in with your credentials:
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PRELOADED HELPER PROFILES */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5C5F]">
                      Choose an Accredited Screening Helper Persona
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {DEMO_HELPER_PROFILES.map((profile) => {
                        const isProfileVerified = profile.status === 'Verified';
                        return (
                          <button
                            key={profile.email}
                            type="button"
                            onClick={async () => {
                              const user = await authService.login(profile.email, 'helper', {
                                name: profile.name,
                                helperRoleTitle: profile.role,
                                organization: profile.org,
                                location: profile.location,
                                phone: profile.phone,
                                verificationStatus: profile.status,
                                isDemoVerification: isProfileVerified,
                                voiceGuidanceEnabled: true,
                              });
                              onSuccessLogin(user);
                              onClose();
                            }}
                            className="text-left p-3 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-white hover:bg-[#FFF7ED]/30 transition-all shadow-2xs group flex flex-col justify-between cursor-pointer"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-xs text-[#2E2628] group-hover:text-[#EA580C]">
                                  {profile.name}
                                </span>
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    isProfileVerified
                                      ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                                      : profile.status === 'Pending Verification'
                                      ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                                      : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                                  }`}
                                >
                                  {profile.badge}
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-[#EA580C]">
                                {profile.role}
                              </div>
                              <div className="text-[10px] text-[#6E5C5F] truncate mt-0.5">
                                {profile.org} · {profile.location}
                              </div>
                            </div>
                            <div className="mt-2 pt-1.5 border-t border-[#F5EFEB] flex items-center justify-between text-[10px] text-[#8E7E81]">
                              <span className="font-mono">{profile.phone}</span>
                              <span className="font-bold text-[#EA580C] group-hover:translate-x-0.5 transition-transform">
                                Select →
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CUSTOM SIGN IN FORM */}
                  <form onSubmit={handleHelperSubmit} className="space-y-3 pt-2 border-t border-[#EFE4DC]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5C5F]">
                      Or Sign In with Work ID
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          Role Title
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
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setView('select')}
                        className="px-3 py-1.5 text-xs font-medium text-[#6E5C5F] hover:text-[#2E2628]"
                      >
                        ← Back to Selection
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        Sign In & Enter Workspace
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB B: REGISTER AS SCREENING HELPER */}
              {helperAuthTab === 'register' && (
                <form onSubmit={handleHelperSubmit} className="space-y-3.5">
                  <div className="text-xs text-[#6E5C5F]">
                    Registering requires verified healthcare worker or community outreach credentials. Please complete all fields below:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-[#2E2628] mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya Rao"
                        value={helperName}
                        onChange={(e) => setHelperName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-medium text-[#2E2628] mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={helperRole}
                        onChange={(e) => setHelperRole(e.target.value as HelperRoleTitle)}
                        className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628] bg-white font-medium"
                      >
                        {HELPER_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Organization */}
                    <div>
                      <label className="block text-xs font-medium text-[#2E2628] mb-1">
                        Organization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bengaluru District Eye Mission"
                        value={helperOrg}
                        onChange={(e) => setHelperOrg(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                      />
                    </div>

                    {/* Work Email */}
                    <div>
                      <label className="block text-xs font-medium text-[#2E2628] mb-1">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ananya.rao@healthmission.org"
                        value={helperEmail}
                        onChange={(e) => setHelperEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-medium text-[#2E2628] mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98450 67890"
                        value={helperPhone}
                        onChange={(e) => setHelperPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-[#2E2628] mb-1">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bengaluru, Karnataka"
                        value={helperLocation}
                        onChange={(e) => setHelperLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                      />
                    </div>
                  </div>

                  {/* VERIFICATION STATE SELECTOR FOR EVALUATION */}
                  <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#FED7AA] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#2E2628]">
                        Initial Verification State (Prototype Testing)
                      </label>
                      <span className="text-[10px] font-bold text-[#EA580C] uppercase tracking-wider">
                        DEMO VERIFIED MODE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { value: 'Verified', label: 'Verified', desc: 'DEMO VERIFIED (Workspace Unlocked)' },
                          { value: 'Pending Verification', label: 'Pending', desc: 'Pending Verification' },
                          { value: 'Rejected', label: 'Rejected', desc: 'Accreditation Rejected' },
                          { value: 'Suspended', label: 'Suspended', desc: 'Privileges Suspended' },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setHelperVerification(item.value)}
                          className={`p-2 rounded-lg text-left border text-xs transition-all cursor-pointer ${
                            helperVerification === item.value
                              ? 'bg-[#FFF7ED] border-[#EA580C] text-[#EA580C] font-bold shadow-2xs'
                              : 'bg-white border-[#EFE4DC] text-[#6E5C5F] hover:bg-[#F9F5F1]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{item.label}</span>
                            {helperVerification === item.value && (
                              <CheckCircle2 className="w-3 h-3 text-[#EA580C]" />
                            )}
                          </div>
                          <span className="text-[9px] text-[#8E7E81] block mt-0.5 font-normal">
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] text-[#8E7E81] leading-relaxed">
                      Only a <strong>VERIFIED</strong> Screening Helper can access the clinical workspace. Selecting Pending, Rejected, or Suspended demonstrates the restricted access gate.
                    </p>
                  </div>

                  {/* SUBMIT BUTTONS */}
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
                      className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      Register & Complete Onboarding
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* VIEW 3: RESEARCHER AUTH */}
          {view === 'researcher-auth' && (
            <form onSubmit={handleResearcherSubmit} className="space-y-4">
              {/* DEMO QUICK ACCESS */}
              <div className="p-4 rounded-xl bg-[#F9F5F1] border border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E2628]">
                    <Layers className="w-4 h-4 text-[#EA580C]" />
                    <span>{t('roleQuickDemoResearcher', 'Quick Demo Researcher Access')}</span>
                  </div>
                  <p className="text-xs text-[#6E5C5F] mt-0.5">
                    {t('rolePreloadedResearcher', 'Preloaded profile: Dr. Sai Krishnan (Medical AI & Retina Imaging Lab • IISc / AIIMS)')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoResearcher}
                  className="px-3 py-1.5 rounded-lg bg-[#2E2628] hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
                >
                  {t('roleSignInDemoResearcher', 'Sign In with Demo Researcher')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    {t('fullNameLabel', 'Researcher Full Name')}
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
                    {t('instEmailLabel', 'Institutional Email')}
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
                    {t('researchOrgLabel', 'Research Institute / University')}
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
                {t('researchAccessNotice', 'Access granted to multimodal ablation matrices, ROC/PR curves, ONNX inference benchmarks, and SaMD compliance documentation.')}
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EFE4DC]">
                <button
                  type="button"
                  onClick={() => setView('select')}
                  className="px-4 py-2 text-xs font-medium text-[#6E5C5F] hover:text-[#2E2628] transition-colors"
                >
                  {t('backToSelectionBtn', '← Back to Workspace Selection')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2E2628] hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  {t('enterResearchWorkspaceBtn', 'Enter Research Workspace')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
