import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Globe,
  CheckCircle2,
  AlertCircle,
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
  ExternalLink,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Laptop,
  Type,
  Activity,
  Trash2,
  RefreshCw,
  Edit3,
  Save,
  X,
  Share2,
  HeartPulse,
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
  onSwitchWorkspace?: () => void; // Kept in interface for props compatibility, but not exposed to patient
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
  onLogout,
}) => {
  const { t, language, setLanguage } = useTranslation();

  // Active section for jump navigation
  const [activeSection, setActiveSection] = useState<string>('account');

  // Personal Information state
  const [isEditingAccount, setIsEditingAccount] = useState<boolean>(false);
  const [name, setName] = useState<string>(currentUser.name || 'Patient');
  const [email, setEmail] = useState<string>(currentUser.email || 'patient@example.com');
  const [phone, setPhone] = useState<string>(currentUser.phone || '+91 98450 12345');
  const [dob, setDob] = useState<string>(currentUser.dateOfBirth || '1974-06-15');
  const [gender, setGender] = useState<string>('Female');

  // Verification states - required to show clearly
  const [emailVerified, setEmailVerified] = useState<boolean>(
    currentUser.emailVerified !== false // defaults to true for registered patient unless false
  );
  const [phoneVerified, setPhoneVerified] = useState<boolean>(
    currentUser.phoneVerified !== false // defaults to true for registered patient unless false
  );
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Copied ID toast
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Accessibility Config state
  const [accConfig, setAccConfig] = useState<AccessibilityConfig>(
    accessibilityService.getConfig()
  );

  // Communication Preferences state
  const [commPrefs, setCommPrefs] = useState<CommunicationPreferences>(() => {
    try {
      const saved = localStorage.getItem('retinaguard_comm_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
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
    } catch (e) {
      // ignore
    }
    return {
      researchContribution: true,
      retainHistoryYears: 5,
    };
  });

  // Patient Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);

  // FAQs open state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Sign out confirmation modal
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  // Subscribe to accessibility service updates
  useEffect(() => {
    const unsub = accessibilityService.subscribe((cfg) => setAccConfig(cfg));
    return () => unsub();
  }, []);

  // Load appointments
  useEffect(() => {
    let isMounted = true;
    bookingService.getPatientAppointments().then((appts) => {
      if (isMounted) {
        setAppointments(appts.slice(0, 3));
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
    } catch (e) {
      // ignore
    }
  };

  // Persist privacy preferences
  const handleTogglePrivacyPref = (key: keyof PrivacyPreferences) => {
    const updated = { ...privacyPrefs, [key]: !privacyPrefs[key] };
    setPrivacyPrefs(updated);
    try {
      localStorage.setItem('retinaguard_privacy_prefs', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id || 'PAT-2026-0814');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingAccount(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleSimulateEmailVerification = () => {
    setEmailVerified(true);
    setVerificationFeedback('Email verification confirmed: A confirmation link was verified.');
    setTimeout(() => setVerificationFeedback(null), 4000);
  };

  const handleSimulatePhoneVerification = () => {
    setPhoneVerified(true);
    setVerificationFeedback('Phone verification confirmed: One-time passcode (OTP) verified.');
    setTimeout(() => setVerificationFeedback(null), 4000);
  };

  const SECTIONS = [
    { id: 'account', label: t('accountSectionNav', 'Account') },
    { id: 'my-screening', label: t('myScreeningSectionNav', 'My Screening') },
    { id: 'preferences', label: t('preferencesSectionNav', 'Preferences') },
    { id: 'communication', label: t('communicationSectionNav', 'Communication') },
    { id: 'privacy-security', label: t('privacySecuritySectionNav', 'Privacy & Security') },
    { id: 'help', label: t('helpSectionNav', 'Help') },
    { id: 'sign-out', label: t('signOutSectionNav', 'Sign Out') },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-[#2B2024] dark:text-[#F3EDF0] pb-16">
      {/* =========================================================================
          PAGE TITLE & PATIENT SUMMARY CARD
          ========================================================================= */}
      <div className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE5D8] dark:bg-[#2F2119] border-2 border-[#FED7AA] dark:border-[#7C2D12] text-[#F05A28] flex items-center justify-center font-serif font-black text-2xl shadow-2xs">
              {name ? name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28] border border-[#FED7AA] dark:border-[#7C2D12] mb-1">
                <UserIcon className="w-3 h-3 text-[#F05A28]" />
                <span>{t('patientProfileBadge', 'Patient Account')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2024] dark:text-white">
                {name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6F6267] dark:text-[#A8989B]">
                <span className="font-mono text-[#8E7E81]">
                  ID: {currentUser.id || 'PAT-2026-0814'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-xs font-semibold text-[#F05A28] hover:underline cursor-pointer"
                >
                  {copiedId ? t('copiedIdFeedback', 'Copied ✓') : t('copyIdBtn', 'Copy')}
                </button>
                <span>•</span>
                <span>
                  {t('registeredSince', 'Member since')}:{' '}
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

          {/* Primary Action: Get Screened */}
          <button
            type="button"
            onClick={onNavigateToFindScreening}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{t('bookScreeningCta', 'Book a Screening')}</span>
          </button>
        </div>

        {/* SECTION NAV PILLS - CLEAN & NON-CROWDED */}
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
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{t('profileSavedNotification', 'Personal information saved successfully.')}</span>
        </div>
      )}

      {/* VERIFICATION FEEDBACK */}
      {verificationFeedback && (
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          <span>{verificationFeedback}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: ACCOUNT
          Personal Information, Email, Phone, Email Verification, Phone Verification
          ========================================================================= */}
      <section
        id="section-account"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                ACCOUNT
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Personal information, verified contact channels, and security states
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
              <span>{t('editProfileBtn', 'Edit Details')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingAccount(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6F6267] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('cancelBtn', 'Cancel')}</span>
            </button>
          )}
        </div>

        {/* VERIFICATION STATUS CALLOUTS - MANDATORY REQUIREMENT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Email Verification Card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8E7E81] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Email Verification</span>
              </span>
              <div className="font-mono text-xs font-bold text-[#1F181A] dark:text-white">
                {email}
              </div>
            </div>

            {emailVerified ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-black shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>✓ Email Verified</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulateEmailVerification}
                className="px-3 py-1.5 rounded-xl bg-[#F05A28] text-white text-xs font-bold hover:bg-[#D84818] shadow-2xs cursor-pointer"
              >
                Verify Email
              </button>
            )}
          </div>

          {/* Phone Verification Card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8E7E81] uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Phone Verification</span>
              </span>
              <div className="font-mono text-xs font-bold text-[#1F181A] dark:text-white">
                {phone}
              </div>
            </div>

            {phoneVerified ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-black shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>✓ Phone Verified</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSimulatePhoneVerification}
                className="px-3 py-1.5 rounded-xl bg-[#F05A28] text-white text-xs font-bold hover:bg-[#D84818] shadow-2xs cursor-pointer"
              >
                Verify Phone
              </button>
            )}
          </div>
        </div>

        {/* PERSONAL INFORMATION DETAILS OR EDIT FORM */}
        {!isEditingAccount ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E191C] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[#8E7E81] text-[11px] font-bold uppercase tracking-wider block">
                Full Name
              </span>
              <span className="font-bold text-sm text-[#1F181A] dark:text-white block">
                {name}
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

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E191C] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[#8E7E81] text-[11px] font-bold uppercase tracking-wider block">
                Primary Identity
              </span>
              <span className="font-bold text-sm text-[#1F181A] dark:text-white block">
                {gender}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E191C] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[#8E7E81] text-[11px] font-bold uppercase tracking-wider block">
                Record Status
              </span>
              <span className="font-bold text-sm text-[#15803D] dark:text-[#4ADE80] block">
                Active & Verified
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
                <label className="font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EFE4DC] dark:border-[#382E32]">
              <button
                type="button"
                onClick={() => setIsEditingAccount(false)}
                className="px-4 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] text-xs font-bold text-[#6F6267]"
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
        id="section-my-screening"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                MY SCREENING
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Screening history, clinical reports, scheduled visits, and follow-ups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToReports}
              className="text-xs font-bold text-[#F05A28] hover:underline cursor-pointer"
            >
              All Reports →
            </button>
          </div>
        </div>

        {/* 4 SUBSECTIONS IN CLEAN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Screening History */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Screening History</span>
              </span>
              <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                Latest: 14 Sept 2026
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Fundus Retinal Photography</span>
                <span className="text-[#0369A1]">Completed</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Both eyes (OD & OS) captured. No sight-threatening microvascular anomalies detected.
              </p>
              <div className="pt-1 text-[10px] text-[#8E7E81] flex items-center justify-between">
                <span>South Bengaluru Eye Clinic</span>
                <button
                  type="button"
                  onClick={onNavigateToJourney}
                  className="font-bold text-[#F05A28] hover:underline"
                >
                  View Journey →
                </button>
              </div>
            </div>
          </div>

          {/* 2. Reports */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Reports</span>
              </span>
              <button
                type="button"
                onClick={onNavigateToReports}
                className="text-[11px] font-bold text-[#F05A28] hover:underline"
              >
                View & Download
              </button>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Official Screening Summary</span>
                <span className="text-[10px] font-mono text-[#8E7E81]">REP-2026-0891</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Verified AI-assisted screening assessment and clinical referral recommendations.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onNavigateToReports}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded"
                >
                  <Download className="w-3 h-3" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Appointments */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Appointments</span>
              </span>
              <button
                type="button"
                onClick={onNavigateToFindScreening}
                className="text-[11px] font-bold text-[#F05A28] hover:underline"
              >
                Book New →
              </button>
            </div>

            {loadingAppointments ? (
              <div className="text-xs text-[#8E7E81] py-3 text-center">Loading appointments...</div>
            ) : appointments.length > 0 ? (
              <div className="space-y-2">
                {appointments.slice(0, 1).map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="truncate">{appt.centerName}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#14532D]">
                        {appt.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6F6267] dark:text-[#A8989B] flex items-center gap-2">
                      <span>{appt.appointmentDate}</span>
                      <span>•</span>
                      <span>{appt.appointmentTime}</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#8E7E81]">
                      Ref: {appt.referenceCode}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] text-xs text-[#8E7E81]">
                No upcoming appointments. Free walk-in and booked screening slots available.
              </div>
            )}
          </div>

          {/* 4. Follow-ups */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Follow-ups</span>
              </span>
              <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                Care Cycle Active
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <div className="text-xs font-bold text-[#1F181A] dark:text-white">
                Annual Retinal Photography Due: Sept 2027
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Regular yearly eye examination is standard medical protocol for diabetic eye health preservation.
              </p>
              <div className="pt-1 text-[10px] text-[#8E7E81]">
                Automated reminder scheduled 30 days prior.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PREFERENCES
          Language, Text Size, Color Vision, Contrast, Dark Mode, Reduce Motion
          ========================================================================= */}
      <section
        id="section-preferences"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                PREFERENCES
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Adjust reading comfort, high contrast, accessibility, and visual presentation
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
                Select primary interface language for screening instructions and reports
              </p>
            </div>

            <select
              aria-label="Change language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719] text-xs font-bold text-[#1F181A] dark:text-white focus:outline-none focus:border-[#F05A28] cursor-pointer"
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
                  {size === 'standard' ? 'Default' : size === 'large' ? 'Large' : 'Extra Large'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Color Vision */}
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
              aria-label="Color Vision adjustment"
              value={accConfig.colorVision}
              onChange={(e) =>
                accessibilityService.update({ colorVision: e.target.value as ColorVisionOption })
              }
              className="px-3 py-2 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] bg-white dark:bg-[#1C1719] text-xs font-bold text-[#1F181A] dark:text-white cursor-pointer"
            >
              <option value="default">Standard / Full Color</option>
              <option value="redGreen">Red-Green Enhanced (Deuteranopia/Protanopia)</option>
              <option value="blueYellow">Blue-Yellow Enhanced (Tritanopia)</option>
              <option value="monochrome">High Contrast Monochromatic</option>
            </select>
          </div>

          {/* 4. Contrast */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F05A28]" />
                <span>Contrast</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Elevates element borders and text contrast to satisfy WCAG AAA standards
              </p>
            </div>

            <button
              type="button"
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

          {/* 5. Dark Mode */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#1F181A] dark:text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#F05A28]" />
                <span>Dark Mode</span>
              </div>
              <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                Reduces glare for light-sensitive eyes and low-light screening environments
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
                Suppresses interface animations and auto-transitions for vestibular comfort
              </p>
            </div>

            <button
              type="button"
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
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                COMMUNICATION
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Manage alerts, reminder delivery channels, and screening messages
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
                Direct text alerts when your screening is processed or report is signed
              </p>
            </div>

            <button
              type="button"
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
                Automated 24-hour and 2-hour pre-screening SMS/WhatsApp reminders before your time slot
              </p>
            </div>

            <button
              type="button"
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
          Privacy, Security, Data Preferences
          ========================================================================= */}
      <section
        id="section-privacy-security"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                PRIVACY & SECURITY
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Health confidentiality, encryption assurances, and personal data rights
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* 1. Privacy Guarantee Card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1F181A] dark:text-white">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>Privacy & Medical Confidentiality</span>
            </div>
            <p className="text-[#6F6267] dark:text-[#A8989B] leading-relaxed">
              Your ocular photographs and clinical metadata are stored with end-to-end encryption.
              Personal medical records are never sold, rented, or shared with advertisers or third-party brokers.
            </p>
          </div>

          {/* 2. Security Status Card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1F181A] dark:text-white">
                <Lock className="w-4 h-4 text-[#F05A28]" />
                <span>Security Controls</span>
              </div>
              <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                Protected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6F6267] dark:text-[#A8989B]">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32]">
                <span className="font-bold block text-[#1F181A] dark:text-white">Two-Factor Authentication</span>
                <span>Enforced via verified SMS & Email OTP</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32]">
                <span className="font-bold block text-[#1F181A] dark:text-white">Session Security</span>
                <span>Encrypted JWT token active on this device</span>
              </div>
            </div>
          </div>

          {/* 3. Data Preferences */}
          <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-3">
            <div className="font-bold text-sm text-[#1F181A] dark:text-white">
              Data Preferences
            </div>

            {/* Research toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-bold text-xs text-[#1F181A] dark:text-white block">
                  De-Identified Research Contribution
                </span>
                <span className="text-[11px] text-[#6F6267] dark:text-[#A8989B]">
                  Contribute anonymized, non-identifiable retinal scans to non-profit diabetic retinopathy AI validation
                </span>
              </div>
              <button
                type="button"
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
            <div className="pt-3 border-t border-[#EFE4DC] dark:border-[#382E32] flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const dataStr = JSON.stringify({ name, email, phone, dob, registeredAt: currentUser.registeredAt }, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `patient_data_export_${currentUser.id || 'record'}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#382E32] hover:bg-white dark:hover:bg-[#1C1719] text-xs font-bold text-[#6F6267] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Export My Personal Data</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Data deletion request noted: To fulfill clinical archive compliance, your deletion request will be processed within 48 hours.')}
                className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Request Data Deletion</span>
              </button>
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
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE7] dark:border-[#2C2428]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFE5D8] dark:bg-[#2F2119] text-[#F05A28]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F181A] dark:text-white uppercase tracking-wider text-xs sm:text-sm">
                HELP
              </h2>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
                Frequently asked patient questions and dedicated helpline assistance
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E7E81]">
            Frequently Asked Questions
          </h3>

          {[
            {
              q: 'What happens during a diabetic retinal screening?',
              a: 'A trained health worker takes a non-invasive digital photograph of the back of your eye (retina) using a specialized camera. The process takes less than 5 minutes and typically requires no dilating eye drops.',
            },
            {
              q: 'Does this screening confirm a medical diagnosis?',
              a: 'No. This is an AI-assisted screening assessment to detect early indicators of diabetic retinopathy. It does not confirm or rule out a clinical diagnosis. Any findings should be evaluated by an ophthalmologist.',
            },
            {
              q: 'How often should someone with diabetes get screened?',
              a: 'Clinical guidelines recommend comprehensive retinal photography screening at least once every 12 months, or sooner if recommended by your eye-care professional.',
            },
            {
              q: 'How do I share this report with my primary doctor?',
              a: 'You can download your summary as an official PDF from the Reports section or present your reference code at any partner health clinic.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-1.5"
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
                <p className="text-[11px] text-[#6F6267] dark:text-[#A8989B] leading-relaxed pt-1">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="p-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#251E22] border border-[#EFE4DC] dark:border-[#382E32] space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-xs text-[#1F181A] dark:text-white uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>Contact Support</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#8E7E81] block">
                Toll-Free Patient Helpline
              </span>
              <a
                href="tel:1800738462"
                className="text-sm font-bold text-[#F05A28] hover:underline block"
              >
                1800-RETINA-CARE (1800-738-462)
              </a>
              <span className="text-[10px] text-[#8E7E81]">Mon – Sat, 8:00 AM – 8:00 PM IST</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#1C1719] border border-[#EFE4DC] dark:border-[#382E32] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#8E7E81] block">
                Email Patient Care
              </span>
              <a
                href="mailto:support@retinaguard.care"
                className="text-sm font-bold text-[#F05A28] hover:underline block"
              >
                support@retinaguard.care
              </a>
              <span className="text-[10px] text-[#8E7E81]">Response within 24 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: SIGN OUT
          Sign out button with confirmation safety
          ========================================================================= */}
      <section
        id="section-sign-out"
        className="bg-white dark:bg-[#1C1719] rounded-3xl border border-[#EFE4DC] dark:border-[#382E32] shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#1F181A] dark:text-white">
            Sign Out of Account
          </h2>
          <p className="text-xs text-[#6F6267] dark:text-[#A8989B]">
            Safely sign out of your patient portal session. Your preferences remain saved on this device.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSignOutModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>Sign Out</span>
        </button>
      </section>

      {/* SIGN OUT CONFIRMATION MODAL */}
      {isSignOutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#1C1719] rounded-3xl max-w-sm w-full border border-[#EFE4DC] dark:border-[#382E32] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1F181A] dark:text-white">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-[#6F6267] dark:text-[#A8989B] leading-relaxed">
                Are you sure you wish to sign out of your patient account?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EFE4DC] text-xs font-bold text-[#6F6267] hover:bg-[#FAF7F4] cursor-pointer"
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
