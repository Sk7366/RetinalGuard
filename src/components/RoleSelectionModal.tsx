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
  Stethoscope,
  Microscope,
  HeartHandshake,
  Check,
  LogIn,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { HelperRoleTitle, User, UserRole, VerificationStatus } from '../types';
import { authService } from '../auth/authService';

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
];

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'select',
}) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'select' | 'patient-auth' | 'helper-auth' | 'researcher-auth'>(initialMode);
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Synchronize view with initialMode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setView(initialMode);
      setActiveTab('signin');
    }
  }, [isOpen, initialMode]);

  // Patient custom form state
  const [patientName, setPatientName] = useState('K. Meenakshi Amma');
  const [patientEmail, setPatientEmail] = useState('meenakshi.amma@gmail.com');
  const [patientPhone, setPatientPhone] = useState('+91 98451 22334');
  const [patientDob, setPatientDob] = useState('1963-04-12');

  // Helper custom form state
  const [helperName, setHelperName] = useState('Ananya Rao');
  const [helperEmail, setHelperEmail] = useState('ananya.rao@healthmission.org');
  const [helperPhone, setHelperPhone] = useState('+91 98450 67890');
  const [helperRole, setHelperRole] = useState<HelperRoleTitle>('Community Health Worker');
  const [helperOrg, setHelperOrg] = useState('Bengaluru District Eye Mission');
  const [helperLocation, setHelperLocation] = useState('Bengaluru, Karnataka');
  const [helperVerification, setHelperVerification] = useState<VerificationStatus>('Verified');

  // Researcher custom form state
  const [researcherName, setResearcherName] = useState('Dr. Sai Krishnan');
  const [researcherEmail, setResearcherEmail] = useState('sai.krishnan@visionai.edu');
  const [researcherOrg, setResearcherOrg] = useState('Medical AI & Retina Imaging Lab');
  const [researcherLocation, setResearcherLocation] = useState('Indian Institute of Science / AIIMS');

  if (!isOpen) return null;

  // 1. Patient Logins
  const handleQuickDemoPatient = async () => {
    const user = await authService.loginDemoPatient();
    onSuccessLogin(user);
    onClose();
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await authService.registerPatient({
      name: patientName,
      email: patientEmail,
      phone: patientPhone,
      dateOfBirth: patientDob,
      emailVerified: true,
      phoneVerified: true,
    });
    onSuccessLogin(user);
    onClose();
  };

  // 2. Medical Worker Logins
  const handleQuickDemoHelper = async () => {
    const user = await authService.loginDemoHelper();
    onSuccessLogin(user);
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

  // 3. Researcher Logins
  const handleQuickDemoResearcher = async () => {
    const user = await authService.loginDemoResearcher();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl border border-[#EFE4DC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-heading"
      >
        {/* MODAL HEADER */}
        <div className="bg-[#FFFDFB] border-b border-[#EFE4DC] px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F05A28] uppercase tracking-wider mb-0.5">
              <LogIn className="w-3.5 h-3.5" />
              <span>Authentication & Mode Access</span>
            </div>
            <h2 id="role-modal-heading" className="text-xl sm:text-2xl font-serif font-bold text-[#2B2024]">
              {view === 'select'
                ? 'Select Mode & Sign In'
                : view === 'patient-auth'
                ? 'Sign In: Patient Mode'
                : view === 'helper-auth'
                ? 'Sign In: Medical Worker Mode'
                : 'Sign In: Researcher Mode'}
            </h2>
            <p className="text-xs text-[#6F6267] mt-0.5">
              {view === 'select'
                ? 'Modes are enabled ONLY while signing in. For your signed profile, only that mode will be enabled.'
                : 'Signing in enables this specific workspace mode for your active profile (other modes will remain disabled).'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-[#8E7E81] hover:text-[#2B2024] hover:bg-[#FAF8F6] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* =====================================================================
              VIEW 1: THREE DISTINCT ROLE MODES SELECTION
              1. Patient Mode
              2. Medical Worker Mode
              3. Researcher Mode
              ===================================================================== */}
          {view === 'select' && (
            <div className="space-y-4">
              {/* MODE 1: PATIENT */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-[#FFE5D8]/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFE5D8] border border-[#FED7AA] text-[#F05A28] flex items-center justify-center shrink-0 shadow-2xs">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-serif font-bold text-[#2B2024]">
                        Patient Mode
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EFEB] text-[#6F6267]">
                        Individual & Family
                      </span>
                    </div>
                    <p className="text-xs text-[#6F6267] leading-relaxed max-w-md">
                      Access your verified eye health profile, review screening interpretations, download diagnostic reports, and book appointments.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0 self-stretch sm:self-center">
                  <button
                    type="button"
                    onClick={handleQuickDemoPatient}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer text-center"
                    title="Sign in as verified demo patient K. Meenakshi Amma"
                  >
                    Demo Patient Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('patient-auth')}
                    className="px-3 py-2 rounded-xl bg-white border border-[#EFE4DC] hover:border-[#FED7AA] text-xs font-semibold text-[#2B2024] transition-colors whitespace-nowrap cursor-pointer text-center"
                  >
                    Custom Details →
                  </button>
                </div>
              </div>

              {/* MODE 2: MEDICAL WORKER */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#FED7AA] bg-gradient-to-r from-[#FFFDF9] to-white hover:border-[#F05A28] transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F05A28] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-serif font-bold text-[#2B2024]">
                        Medical Worker Mode
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                        Screening Helper & Clinician
                      </span>
                    </div>
                    <p className="text-xs text-[#6F6267] leading-relaxed max-w-md">
                      Frontline non-mydriatic fundus intake, automated clarity verification, clinical review queue, appointments, and specialist referral dispatch.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0 self-stretch sm:self-center">
                  <button
                    type="button"
                    onClick={handleQuickDemoHelper}
                    className="px-3.5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer text-center"
                    title="Sign in as accredited helper Ananya Rao"
                  >
                    Demo Medical Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('helper-auth')}
                    className="px-3 py-2 rounded-xl bg-white border border-[#EFE4DC] hover:border-[#F05A28] text-xs font-semibold text-[#2B2024] transition-colors whitespace-nowrap cursor-pointer text-center"
                  >
                    Personas / ID →
                  </button>
                </div>
              </div>

              {/* MODE 3: RESEARCHER */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#EFE4DC] hover:border-[#2B2024] bg-[#FFFDF9] hover:bg-stone-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#2B2024] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Microscope className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-serif font-bold text-[#2B2024]">
                        Researcher Mode
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EFEB] text-[#6F6267]">
                        AI & Ophthalmic Research
                      </span>
                    </div>
                    <p className="text-xs text-[#6F6267] leading-relaxed max-w-md">
                      Inspect multimodal late fusion, ablation matrices, Grad-CAM attention heatmaps, SHAP feature attributions, and SaMD validation benchmarks.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0 self-stretch sm:self-center">
                  <button
                    type="button"
                    onClick={handleQuickDemoResearcher}
                    className="px-3.5 py-2.5 rounded-xl bg-[#2B2024] hover:bg-black text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer text-center"
                    title="Sign in as researcher Dr. Sai Krishnan"
                  >
                    Demo Researcher
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('researcher-auth')}
                    className="px-3 py-2 rounded-xl bg-white border border-[#EFE4DC] hover:border-[#2B2024] text-xs font-semibold text-[#2B2024] transition-colors whitespace-nowrap cursor-pointer text-center"
                  >
                    Institutional Login →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              VIEW 2: PATIENT CUSTOM AUTH
              ===================================================================== */}
          {view === 'patient-auth' && (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FFE5D8]/50 border border-[#FED7AA] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F05A28]" />
                  <span className="text-xs font-bold text-[#2B2024]">
                    Patient Portal Access (Verification Enabled)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoPatient}
                  className="text-xs font-bold text-[#F05A28] hover:underline"
                >
                  Use Preloaded Demo Patient (K. Meenakshi Amma)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={patientDob}
                    onChange={(e) => setPatientDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EFE4DC]">
                <button
                  type="button"
                  onClick={() => setView('select')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#6F6267] hover:text-[#2B2024]"
                >
                  ← Back to Mode Selection
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Sign In as Patient
                </button>
              </div>
            </form>
          )}

          {/* =====================================================================
              VIEW 3: MEDICAL WORKER (SCREENING HELPER) AUTH
              ===================================================================== */}
          {view === 'helper-auth' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0" />
                  <div>
                    <div className="text-xs font-black text-[#065F46] uppercase">
                      DEMO VERIFIED HELPER PERSONAS
                    </div>
                    <p className="text-[11px] text-[#047857]">
                      Select an accredited screening helper profile to immediately unlock Medical Worker Mode:
                    </p>
                  </div>
                </div>
              </div>

              {/* Preloaded Helper Profiles */}
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
                          <span className="font-bold text-xs text-[#2B2024] group-hover:text-[#F05A28]">
                            {profile.name}
                          </span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isProfileVerified
                                ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                                : 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                            }`}
                          >
                            {profile.badge}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#F05A28]">
                          {profile.role}
                        </div>
                        <div className="text-[10px] text-[#6F6267] truncate mt-0.5">
                          {profile.org}
                        </div>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-[#F5EFEB] flex items-center justify-between text-[10px] text-[#8E7E81]">
                        <span className="font-mono">{profile.phone}</span>
                        <span className="font-bold text-[#F05A28] group-hover:translate-x-0.5 transition-transform">
                          Select →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Medical Worker Form */}
              <form onSubmit={handleHelperSubmit} className="space-y-3 pt-2 border-t border-[#EFE4DC]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6F6267]">
                  Or Enter Custom Work Credentials
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={helperName}
                      onChange={(e) => setHelperName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={helperEmail}
                      onChange={(e) => setHelperEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                      Role Title <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={helperRole}
                      onChange={(e) => setHelperRole(e.target.value as HelperRoleTitle)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28] bg-white"
                    >
                      {HELPER_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={helperOrg}
                      onChange={(e) => setHelperOrg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setView('select')}
                    className="px-3 py-1.5 text-xs font-semibold text-[#6F6267] hover:text-[#2B2024]"
                  >
                    ← Back to Mode Selection
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Sign In as Medical Worker
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =====================================================================
              VIEW 4: RESEARCHER AUTH
              ===================================================================== */}
          {view === 'researcher-auth' && (
            <form onSubmit={handleResearcherSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#2B2024]">
                    Preloaded Researcher Profile: Dr. Sai Krishnan
                  </div>
                  <p className="text-[11px] text-[#6F6267] mt-0.5">
                    Medical AI & Retina Imaging Lab • IISc / AIIMS ( SaMD Class IIa Validation )
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoResearcher}
                  className="px-3.5 py-2 rounded-xl bg-[#2B2024] hover:bg-black text-white text-xs font-bold whitespace-nowrap shadow-xs cursor-pointer"
                >
                  Quick Sign In
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    Researcher Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={researcherName}
                    onChange={(e) => setResearcherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#2B2024]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    value={researcherEmail}
                    onChange={(e) => setResearcherEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#2B2024]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    Research Institute / University
                  </label>
                  <input
                    type="text"
                    required
                    value={researcherOrg}
                    onChange={(e) => setResearcherOrg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#2B2024]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EFE4DC]">
                <button
                  type="button"
                  onClick={() => setView('select')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#6F6267] hover:text-[#2B2024]"
                >
                  ← Back to Mode Selection
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2B2024] hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Sign In as Researcher
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
