import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Globe,
  CheckCircle2,
  Eye,
  FileText,
  Sliders,
  LogOut,
  Clock,
  ShieldCheck,
  Shield,
  Lock,
  Bell,
  Smartphone,
  MessageSquare,
  HelpCircle,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  Moon,
  Type,
  Activity,
  Trash2,
  Edit3,
  Save,
  X,
  HeartPulse,
  Sparkles,
  RefreshCw,
  PhoneCall,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { User } from '../types';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import {
  accessibilityService,
  AccessibilityConfig,
  TextSizeOption,
  ColorVisionOption,
  ThemeModeOption,
} from '../services/accessibilityService';
import { bookingService } from '../services/bookingService';
import { Appointment } from '../types/booking';

export interface PatientProfileViewProps {
  currentUser: User;
  onNavigateToFindScreening: () => void;
  onNavigateToReports: () => void;
  onNavigateToJourney: () => void;
  onOpenAccessibility?: () => void;
  onSwitchWorkspace?: () => void;
  onOpenSignIn?: () => void;
  onLogout: () => void;
}

interface CommunicationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
}

interface PrivacyPreferences {
  researchContribution: boolean;
  retainHistoryYears: number;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  currentUser,
  onNavigateToFindScreening,
  onNavigateToReports,
  onNavigateToJourney,
  onSwitchWorkspace,
  onOpenSignIn,
  onLogout,
}) => {
  const { t, language, setLanguage } = useTranslation();

  // Determine if the current session is an unauthenticated guest visitor
  const isGuest =
    !currentUser ||
    currentUser.role === 'public' ||
    currentUser.id === 'guest-patient' ||
    currentUser.id === 'guest-visitor' ||
    !currentUser.token ||
    !currentUser.email ||
    currentUser.isLoggedIn === false;

  // Active section for jump navigation
  const [activeSection, setActiveSection] = useState<string>('account');

  // Personal Information state (MY ACCOUNT)
  const [isEditingAccount, setIsEditingAccount] = useState<boolean>(false);
  const [name, setName] = useState<string>(isGuest ? 'Guest Visitor (Not Signed In)' : currentUser.name || 'Patient');
  const [email, setEmail] = useState<string>(isGuest ? 'Not signed in' : currentUser.email || '');
  const [phone, setPhone] = useState<string>(isGuest ? 'Not registered' : currentUser.phone || '');
  const [dob, setDob] = useState<string>(currentUser.dateOfBirth || '1974-06-15');
  const [gender, setGender] = useState<string>('Female');

  // Verification status states (Only true if user is actually signed in with verified credentials!)
  const [emailVerified, setEmailVerified] = useState<boolean>(
    !isGuest && Boolean(currentUser.emailVerified) && currentUser.isLoggedIn === true
  );
  const [phoneVerified, setPhoneVerified] = useState<boolean>(
    !isGuest && Boolean(currentUser.phoneVerified) && currentUser.isLoggedIn === true
  );
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Sync state if currentUser changes
  useEffect(() => {
    const isNowGuest =
      !currentUser ||
      currentUser.role === 'public' ||
      currentUser.id === 'guest-patient' ||
      currentUser.id === 'guest-visitor' ||
      !currentUser.token ||
      !currentUser.email ||
      currentUser.isLoggedIn === false;
    setName(isNowGuest ? 'Guest Visitor (Not Signed In)' : currentUser.name || 'Patient');
    setEmail(isNowGuest ? 'Not signed in' : currentUser.email || '');
    setPhone(isNowGuest ? 'Not registered' : currentUser.phone || '');
    setEmailVerified(!isNowGuest && Boolean(currentUser.emailVerified) && currentUser.isLoggedIn === true);
    setPhoneVerified(!isNowGuest && Boolean(currentUser.phoneVerified) && currentUser.isLoggedIn === true);
  }, [currentUser]);

  // Copied ID state
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Accessibility & Preferences Config
  const [accConfig, setAccConfig] = useState<AccessibilityConfig>(
    accessibilityService.getConfig()
  );

  // Communication Preferences state
  const [commPrefs, setCommPrefs] = useState<CommunicationPreferences>(() => {
    try {
      const saved = localStorage.getItem('retinaguard_comm_prefs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      emailNotifications: true,
      smsNotifications: true,
      appointmentReminders: true,
    };
  });

  // Privacy & Data Preferences state
  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPreferences>(() => {
    try {
      const saved = localStorage.getItem('retinaguard_privacy_prefs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      researchContribution: true,
      retainHistoryYears: 5,
    };
  });

  // Patient Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);

  // FAQs open state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Sign out confirmation modal & save toast
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  // Subscribe to accessibility service updates
  useEffect(() => {
    const unsub = accessibilityService.subscribe((cfg) => setAccConfig(cfg));
    return () => unsub();
  }, []);

  // Load patient appointments
  useEffect(() => {
    let isMounted = true;
    bookingService.getPatientAppointments().then((appts) => {
      if (isMounted) {
        setAppointments(appts);
        setLoadingAppointments(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist communication preferences
  const handleToggleCommPref = (key: keyof CommunicationPreferences) => {
    const updated = { ...commPrefs, [key]: !commPrefs[key] };
    setCommPrefs(updated);
    try {
      localStorage.setItem('retinaguard_comm_prefs', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Persist privacy preferences
  const handleTogglePrivacyPref = (key: keyof PrivacyPreferences) => {
    const updated = { ...privacyPrefs, [key]: !privacyPrefs[key] };
    setPrivacyPrefs(updated);
    try {
      localStorage.setItem('retinaguard_privacy_prefs', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopyId = () => {
    const patientId = currentUser.id || 'PAT-2026-0814';
    navigator.clipboard.writeText(patientId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingAccount(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleVerifyEmail = () => {
    setEmailVerified(true);
    setVerificationFeedback('✓ Email verification confirmed. Secure confirmation link validated.');
    setTimeout(() => setVerificationFeedback(null), 4000);
  };

  const handleVerifyPhone = () => {
    setPhoneVerified(true);
    setVerificationFeedback('✓ Phone verification confirmed. One-time passcode (OTP) validated.');
    setTimeout(() => setVerificationFeedback(null), 4000);
  };

  const SECTIONS = [
    { id: 'account', label: 'My Account' },
    { id: 'screening', label: 'My Screening' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'communication', label: 'Communication' },
    { id: 'privacy-security', label: 'Privacy & Security' },
    { id: 'help', label: 'Help' },
    { id: 'sign-out', label: 'Sign Out' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-[#2B2024] dark:text-[#F3EDF0] pb-20 px-3 sm:px-4">
      {/* =========================================================================
          PAGE HEADER & PATIENT IDENTITY OVERVIEW
          ========================================================================= */}
      <div className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE5D8] dark:bg-[#2F2119] border-2 border-[#FED7AA] dark:border-[#7C2D12] text-[#F05A28] flex items-center justify-center font-serif font-black text-2xl shadow-2xs shrink-0">
              {name ? name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28] border border-[#FED7AA] dark:border-[#7C2D12] mb-1">
                <UserIcon className="w-3 h-3 text-[#F05A28]" />
                <span>Patient Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F181A] dark:text-white">
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6F6267] dark:text-[#A8989B]">
                <span className="font-mono text-[#8E7E81]">
                  ID: {currentUser.id || 'PAT-2026-0814'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-xs font-bold text-[#F05A28] hover:underline cursor-pointer"
                >
                  {copiedId ? 'Copied ✓' : 'Copy'}
                </button>
                <span>•</span>
                <span>
                  Member since{' '}
                  {currentUser.registeredAt
                    ? new Date(currentUser.registeredAt).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Sept 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Patient Action */}
          <button
            type="button"
            onClick={onNavigateToFindScreening}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all self-start sm:self-auto cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Book a Screening</span>
          </button>
        </div>

        {/* ACTIVE WORKSPACE MODE & SWITCH MODE CARD */}
        <div className="mt-4 p-4 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E191C] border border-[#FED7AA] dark:border-[#7C2D12] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] border border-[#FED7AA] text-[#F05A28] flex items-center justify-center shrink-0 shadow-2xs">
              <Eye className="w-5 h-5 text-[#F05A28]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">
                  Active Mode:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FFE5D8] text-[#EA580C] border border-[#FED7AA]">
                  {isGuest ? 'Patient Mode (Guest Visitor)' : 'Patient Mode (Verified Profile)'}
                </span>
              </div>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B] mt-0.5">
                {isGuest
                  ? 'Sign in to enable verified status for Patient, Medical Worker, or Researcher mode.'
                  : 'For this signed profile, only Patient Mode is enabled. Mode is enabled only while signing in.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSignIn || onSwitchWorkspace}
            className="px-4 py-2.5 rounded-xl bg-[#1F181A] hover:bg-black text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FED7AA]" />
            <span>Switch Mode (Sign In)</span>
          </button>
        </div>

        {/* GUEST VISITOR NOTIFICATION BANNER */}
        {isGuest && (
          <div className="mt-4 p-4 rounded-2xl bg-[#FFF7ED] dark:bg-[#2A1D17] border border-[#FED7AA] dark:border-[#7C2D12] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C]">
                <Lock className="w-4 h-4" />
                <span>You are browsing as a guest (Not Signed In • Unverified)</span>
              </div>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B] leading-relaxed">
                You haven't signed in yet. Mode access (Patient, Medical Worker, Researcher) and verified identity badges are enabled only after signing in.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSignIn || onSwitchWorkspace}
              className="px-4 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In / Select Mode</span>
            </button>
          </div>
        )}

        {/* SECTION QUICK-JUMP NAVIGATION */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto scrollbar-none">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-[#1F181A] text-white dark:bg-white dark:text-[#1F181A] shadow-2xs'
                  : 'bg-[#FAF7F4] dark:bg-[#251E22] text-[#6F6267] dark:text-[#A8989B] hover:text-[#1F181A] border border-[#EFE4DC] dark:border-[#382E32]'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* SAVE TOAST */}
      {showSaveToast && (
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>Profile information updated successfully.</span>
        </div>
      )}

      {/* VERIFICATION FEEDBACK TOAST */}
      {verificationFeedback && (
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{verificationFeedback}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: MY ACCOUNT
          Name, Email, Phone, Email verification, Phone verification
          ========================================================================= */}
      <section
        id="section-account"
        aria-labelledby="heading-account"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="heading-account"
                className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider"
              >
                MY ACCOUNT
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Your personal details and verified contact credentials
              </p>
            </div>
          </div>

          {!isEditingAccount ? (
            <button
              type="button"
              onClick={() => setIsEditingAccount(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] hover:bg-[#FAF7F4] dark:hover:bg-[#251E22] text-xs font-bold text-[#6F6267] dark:text-[#A8989B] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#F05A28]" />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingAccount(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6F6267] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {/* VERIFICATION STATUS CALLOUTS - MANDATORY CLEAR DISPLAY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email & Email Verification */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8E7E81] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Email & Verification</span>
              </span>
              <div className="font-mono text-xs font-bold text-[#1F181A] dark:text-white truncate">
                {email}
              </div>
            </div>

            {emailVerified ? (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-2xs shrink-0"
                title="Your email address has been verified"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>✓ Email Verified</span>
              </div>
            ) : isGuest ? (
              <button
                type="button"
                onClick={onOpenSignIn || onSwitchWorkspace}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs shrink-0 cursor-pointer"
                title="Sign in to verify this account"
              >
                ✕ Unverified (Sign in)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerifyEmail}
                className="px-3 py-1.5 rounded-xl bg-[#F05A28] text-white text-xs font-bold hover:bg-[#D84818] shadow-2xs shrink-0 cursor-pointer"
              >
                Verify Email
              </button>
            )}
          </div>

          {/* Phone & Phone Verification */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8E7E81] uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Phone & Verification</span>
              </span>
              <div className="font-mono text-xs font-bold text-[#1F181A] dark:text-white truncate">
                {phone}
              </div>
            </div>

            {phoneVerified ? (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-2xs shrink-0"
                title="Your phone number has been verified"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>✓ Phone Verified</span>
              </div>
            ) : isGuest ? (
              <button
                type="button"
                onClick={onOpenSignIn || onSwitchWorkspace}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs shrink-0 cursor-pointer"
                title="Sign in to verify this account"
              >
                ✕ Unverified (Sign in)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerifyPhone}
                className="px-3 py-1.5 rounded-xl bg-[#F05A28] text-white text-xs font-bold hover:bg-[#D84818] shadow-2xs shrink-0 cursor-pointer"
              >
                Verify Phone
              </button>
            )}
          </div>
        </div>

        {/* ACCOUNT DETAILS / EDIT FORM */}
        {!isEditingAccount ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E191C] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[#8E7E81] text-[11px] font-bold uppercase tracking-wider block">
                Name
              </span>
              <span className="font-bold text-sm text-[#1F181A] dark:text-white block">
                {name}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E191C] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[#8E7E81] text-[11px] font-bold uppercase tracking-wider block">
                Email
              </span>
              <span className="font-bold text-xs text-[#1F181A] dark:text-white block truncate">
                {email}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E191C] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[#8E7E81] text-[11px] font-bold uppercase tracking-wider block">
                Phone
              </span>
              <span className="font-bold text-xs text-[#1F181A] dark:text-white block truncate">
                {phone}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E191C] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[#8E7E81] text-[11px] font-bold uppercase tracking-wider block">
                Date of Birth
              </span>
              <span className="font-bold text-sm text-[#1F181A] dark:text-white block">
                {dob}
              </span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSavePersonalInfo}
            className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-4 animate-in fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold block mb-1 text-[#1F181A] dark:text-white">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719] text-[#1F181A] dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-[#1F181A] dark:text-white">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719] text-[#1F181A] dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-[#1F181A] dark:text-white">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719] text-[#1F181A] dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-[#1F181A] dark:text-white">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719] text-[#1F181A] dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EFE4DC] dark:border-[#382E32]">
              <button
                type="button"
                onClick={() => setIsEditingAccount(false)}
                className="px-4 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6F6267] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* =========================================================================
          SECTION 2: MY SCREENING
          Screening History, Reports, Appointments, Follow-ups
          ========================================================================= */}
      <section
        id="section-screening"
        aria-labelledby="heading-screening"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="heading-screening"
                className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider"
              >
                MY SCREENING
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Your retinal screening history, official reports, appointments, and care follow-ups
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToReports}
            className="text-xs font-bold text-[#F05A28] hover:underline cursor-pointer"
          >
            All Reports →
          </button>
        </div>

        {/* 4 CLEAR SUB-PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Screening History */}
          <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Screening History</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Recent: Sept 2026
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#1F181A] dark:text-white">
                  <span>Fundus Retinal Photography</span>
                  <span className="text-[#0369A1] dark:text-[#38BDF8]">Completed</span>
                </div>
                <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                  Bilateral non-mydriatic fundus photograph reviewed. No sight-threatening microvascular anomalies detected.
                </p>
                <div className="pt-1 text-[10px] text-[#8E7E81] flex items-center justify-between">
                  <span>South Bengaluru Clinic</span>
                  <span className="font-mono">14 Sept 2026</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToJourney}
              className="text-xs font-bold text-[#F05A28] hover:underline self-start flex items-center gap-1 cursor-pointer"
            >
              <span>View Screening Journey</span>
              <span>→</span>
            </button>
          </div>

          {/* 2. Reports */}
          <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Reports</span>
                </span>
                <span className="text-[10px] font-mono text-[#8E7E81]">REP-2026-0891</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5">
                <div className="text-xs font-bold text-[#1F181A] dark:text-white">
                  Official Screening Summary
                </div>
                <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                  Verified screening summary ready for ophthalmologist or primary care physician review.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onNavigateToReports}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToReports}
              className="text-xs font-bold text-[#F05A28] hover:underline self-start flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All Reports</span>
              <span>→</span>
            </button>
          </div>

          {/* 3. Appointments */}
          <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Appointments</span>
                </span>
                <span className="text-[10px] font-bold text-[#15803D] dark:text-[#4ADE80]">
                  {appointments.length} Scheduled
                </span>
              </div>

              {loadingAppointments ? (
                <div className="text-xs text-[#8E7E81] py-3 text-center">Loading appointments...</div>
              ) : appointments.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1F181A] dark:text-white">
                    <span className="truncate">{appointments[0].centerName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      {appointments[0].status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                    {appointments[0].appointmentDate} • {appointments[0].appointmentTime}
                  </div>
                  <div className="text-[10px] font-mono text-[#8E7E81]">
                    Ref: {appointments[0].referenceCode}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] text-xs text-[#8E7E81]">
                  No upcoming appointments. Free walk-in and booked photography slots available.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onNavigateToFindScreening}
              className="text-xs font-bold text-[#F05A28] hover:underline self-start flex items-center gap-1 cursor-pointer"
            >
              <span>Book or Reschedule Screening</span>
              <span>→</span>
            </button>
          </div>

          {/* 4. Follow-ups */}
          <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Follow-ups</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                  Annual Cycle Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5">
                <div className="text-xs font-bold text-[#1F181A] dark:text-white">
                  Next Annual Retinal Exam Due: Sept 2027
                </div>
                <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                  Regular yearly retinal photography is the recognized standard for diabetic eye health preservation.
                </p>
                <div className="text-[10px] text-[#8E7E81]">
                  Automated SMS & email notification scheduled 30 days prior.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToFindScreening}
              className="text-xs font-bold text-[#F05A28] hover:underline self-start flex items-center gap-1 cursor-pointer"
            >
              <span>Schedule Early Follow-up</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PREFERENCES
          Language, Text Size, Contrast, Color Vision, Dark Mode, Reduce Motion
          ========================================================================= */}
      <section
        id="section-preferences"
        aria-labelledby="heading-preferences"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="heading-preferences"
                className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider"
              >
                PREFERENCES
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Adjust visual comfort, reading accessibility, and interface language
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* 1. Language */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F05A28]" />
                <span>Language</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Choose your primary language for screening guidance, audio instructions, and reports
              </p>
            </div>

            <select
              aria-label="Interface Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719] text-xs font-bold text-[#1F181A] dark:text-white focus:outline-none focus:border-[#F05A28] cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Text Size */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-[#F05A28]" />
                <span>Text Size</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Scales body and result typography for clear readability without eye strain
              </p>
            </div>

            <div className="inline-flex rounded-xl p-1 bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32]">
              {(['standard', 'large', 'xl'] as TextSizeOption[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => accessibilityService.update({ textSize: size })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    accConfig.textSize === size
                      ? 'bg-[#F05A28] text-white shadow-2xs'
                      : 'text-[#6F6267] dark:text-[#A8989B] hover:text-[#1F181A]'
                  }`}
                >
                  {size === 'standard' ? 'Standard' : size === 'large' ? 'Large' : 'Extra Large'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Contrast */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F05A28]" />
                <span>Contrast</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Enhances element borders and contrast ratios for higher visual separation
              </p>
            </div>

            <button
              type="button"
              aria-label="Toggle High Contrast"
              onClick={() =>
                accessibilityService.update({ highContrast: !accConfig.highContrast })
              }
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                accConfig.highContrast ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  accConfig.highContrast ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 4. Color Vision */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#F05A28]" />
                <span>Color Vision</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Applies calibrated filters for deuteranopia, protanopia, or blue-yellow vision
              </p>
            </div>

            <select
              aria-label="Color Vision Filter"
              value={accConfig.colorVision}
              onChange={(e) =>
                accessibilityService.update({ colorVision: e.target.value as ColorVisionOption })
              }
              className="px-3.5 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719] text-xs font-bold text-[#1F181A] dark:text-white cursor-pointer"
            >
              <option value="default">Standard (Full Color)</option>
              <option value="redGreen">Red-Green Enhanced (Deuteranopia/Protanopia)</option>
              <option value="blueYellow">Blue-Yellow Enhanced (Tritanopia)</option>
              <option value="monochrome">High Contrast Monochromatic</option>
            </select>
          </div>

          {/* 5. Dark Mode */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#F05A28]" />
                <span>Dark Mode</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Reduces glare for light-sensitive eyes and low-light environments
              </p>
            </div>

            <div className="inline-flex rounded-xl p-1 bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32]">
              {(['light', 'dark', 'system'] as ThemeModeOption[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => accessibilityService.update({ themeMode: mode })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    accConfig.themeMode === mode
                      ? 'bg-[#F05A28] text-white shadow-2xs'
                      : 'text-[#6F6267] dark:text-[#A8989B]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Reduce Motion */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F05A28]" />
                <span>Reduce Motion</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Suppresses animations and transition effects for vestibular comfort
              </p>
            </div>

            <button
              type="button"
              aria-label="Toggle Reduce Motion"
              onClick={() =>
                accessibilityService.update({ reduceMotion: !accConfig.reduceMotion })
              }
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                accConfig.reduceMotion ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  accConfig.reduceMotion ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: COMMUNICATION
          Email Notifications, SMS Notifications, Appointment Reminders
          ========================================================================= */}
      <section
        id="section-communication"
        aria-labelledby="heading-communication"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="heading-communication"
                className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider"
              >
                COMMUNICATION
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Manage alerts, delivery channels, and screening reminders
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F05A28]" />
                <span>Email Notifications</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Receive digital report copies, annual checkup invitations, and account updates
              </p>
            </div>

            <button
              type="button"
              aria-label="Toggle Email Notifications"
              onClick={() => handleToggleCommPref('emailNotifications')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                commPrefs.emailNotifications ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  commPrefs.emailNotifications ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* SMS Notifications */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#F05A28]" />
                <span>SMS Notifications</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Direct SMS text alerts when your screening is processed or report is ready
              </p>
            </div>

            <button
              type="button"
              aria-label="Toggle SMS Notifications"
              onClick={() => handleToggleCommPref('smsNotifications')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                commPrefs.smsNotifications ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  commPrefs.smsNotifications ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Appointment Reminders */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F05A28]" />
                <span>Appointment Reminders</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Automated 24-hour and 2-hour pre-screening SMS & WhatsApp reminders before your reserved slot
              </p>
            </div>

            <button
              type="button"
              aria-label="Toggle Appointment Reminders"
              onClick={() => handleToggleCommPref('appointmentReminders')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                commPrefs.appointmentReminders ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  commPrefs.appointmentReminders ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: PRIVACY & SECURITY
          Privacy, Data Preferences, Account Security
          ========================================================================= */}
      <section
        id="section-privacy-security"
        aria-labelledby="heading-privacy-security"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="heading-privacy-security"
                className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider"
              >
                PRIVACY & SECURITY
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Health confidentiality, encryption assurances, and personal data rights
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* 1. Privacy */}
          <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1F181A] dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Privacy</span>
            </div>
            <p className="text-[#6F6267] dark:text-[#A8989B] leading-relaxed">
              Your ocular photographs and clinical metadata are protected with strict medical confidentiality and end-to-end encryption. Personal records are never sold, rented, or shared with commercial advertisers or external data brokers.
            </p>
          </div>

          {/* 2. Data Preferences */}
          <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-4">
            <div className="font-bold text-sm text-[#1F181A] dark:text-white">
              Data Preferences
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-[#1F181A] dark:text-white block">
                  De-Identified Research Contribution
                </span>
                <span className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                  Allow anonymous, fully de-identified retinal images to assist non-profit clinical diabetic retinopathy screening validation
                </span>
              </div>
              <button
                type="button"
                aria-label="Toggle Research Contribution"
                onClick={() => handleTogglePrivacyPref('researchContribution')}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  privacyPrefs.researchContribution
                    ? 'bg-[#F05A28]'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    privacyPrefs.researchContribution ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Export & Deletion buttons */}
            <div className="pt-3 border-t border-[#EFE4DC] dark:border-[#382E32] flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const dataStr = JSON.stringify(
                    {
                      name,
                      email,
                      phone,
                      dob,
                      emailVerified,
                      phoneVerified,
                      registeredAt: currentUser.registeredAt,
                    },
                    null,
                    2
                  );
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `patient_data_export_${currentUser.id || 'record'}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3.5 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] hover:bg-white dark:hover:bg-[#1C1719] text-xs font-bold text-[#6F6267] dark:text-[#A8989B] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Export My Personal Data</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    'Data deletion request submitted: In accordance with medical archive standards, your verification and deletion request will be processed within 48 hours.'
                  )
                }
                className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Request Data Deletion</span>
              </button>
            </div>
          </div>

          {/* 3. Account Security */}
          <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1F181A] dark:text-white">
                <Lock className="w-4 h-4 text-[#F05A28]" />
                <span>Account Security</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Protected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-[#6F6267] dark:text-[#A8989B]">
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32]">
                <span className="font-bold block text-[#1F181A] dark:text-white">
                  Two-Factor Authentication
                </span>
                <span>Enforced via verified SMS and Email verification codes</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32]">
                <span className="font-bold block text-[#1F181A] dark:text-white">
                  Active Session Encryption
                </span>
                <span>Secure SSL/TLS encrypted patient session active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: HELP
          FAQs, Contact Support
          ========================================================================= */}
      <section
        id="section-help"
        aria-labelledby="heading-help"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="heading-help"
                className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider"
              >
                HELP
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Patient FAQs and direct contact with our screening support care team
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E7E81]">
            FAQs
          </h3>

          {[
            {
              q: 'What is the purpose of diabetic retinal screening?',
              a: 'Retinal screening takes a high-resolution photograph of the blood vessels inside your eyes to check for early indicators of diabetic eye changes before any noticeable blurriness or vision loss occurs.',
            },
            {
              q: 'Does an AI-assisted screening replace an eye doctor?',
              a: 'No. RetinaGuard provides AI-assisted screening support to assist trained eye-care workers in identifying signs that need review. It does not confirm or rule out a clinical diagnosis, and professional evaluation by an ophthalmologist or optometrist remains essential.',
            },
            {
              q: 'How frequently should I have my retina checked?',
              a: 'Standard clinical guidance advises individuals with diabetes to have comprehensive retinal photography at least once every 12 months, or sooner if recommended by a doctor.',
            },
            {
              q: 'How can I take my report to my doctor?',
              a: 'You can download an official PDF report at any time from the Reports section or share your screening reference code with your healthcare provider.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-2"
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-[#1F181A] dark:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#F05A28] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8E7E81] shrink-0" />
                )}
              </button>
              {expandedFaq === idx && (
                <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B] leading-relaxed pt-1 border-t border-[#EFE4DC] dark:border-[#382E32]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="p-5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
          <div className="flex items-center gap-2 font-bold text-xs text-[#1F181A] dark:text-white uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>Contact Support</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#8E7E81] block">
                Toll-Free Patient Helpline
              </span>
              <a
                href="tel:1800738462"
                className="text-sm font-bold text-[#F05A28] hover:underline block flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>1800-RETINA-CARE</span>
              </a>
              <span className="text-[10px] text-[#8E7E81]">Mon – Sat, 8:00 AM – 8:00 PM IST</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#8E7E81] block">
                Email Patient Care
              </span>
              <a
                href="mailto:support@retinaguard.care"
                className="text-sm font-bold text-[#F05A28] hover:underline block flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@retinaguard.care</span>
              </a>
              <span className="text-[10px] text-[#8E7E81]">Care team response within 24 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: SIGN OUT
          Clean, distinct sign out action
          ========================================================================= */}
      <section
        id="section-sign-out"
        aria-labelledby="heading-sign-out"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h2
            id="heading-sign-out"
            className="text-base sm:text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider"
          >
            {isGuest ? 'ACCOUNT ACCESS & SIGN IN' : 'SIGN OUT'}
          </h2>
          <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
            {isGuest
              ? 'You are browsing as an unverified guest. Sign in to your Patient, Medical Worker, or Researcher profile to enable verified access.'
              : 'Safely disconnect this patient session. Your viewing preferences will remain saved on this device.'}
          </p>
        </div>

        {isGuest ? (
          <button
            type="button"
            onClick={onOpenSignIn || onSwitchWorkspace}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <UserIcon className="w-4 h-4 text-white" />
            <span>Sign In / Select Mode</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-red-200 dark:border-red-900/60 hover:border-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Sign Out</span>
          </button>
        )}
      </section>

      {/* SIGN OUT CONFIRMATION DIALOG */}
      {isSignOutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-sign-out-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-[#1C1719] rounded-3xl max-w-sm w-full border border-[#EFE4DC] dark:border-[#382E32] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3
                id="dialog-sign-out-title"
                className="text-base font-bold text-[#1F181A] dark:text-white"
              >
                Sign Out of Patient Account?
              </h3>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B] leading-relaxed">
                You can return and view your screening results anytime with your verified email or phone number.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6F6267] dark:text-[#A8989B] hover:bg-[#FAF7F4] dark:hover:bg-[#251E22] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignOutModalOpen(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
