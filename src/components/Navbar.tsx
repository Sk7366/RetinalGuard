import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  Database,
  Eye,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Globe,
  HeartHandshake,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  RotateCcw,
  Scale,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Microscope,
  User as UserIcon,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  AccessibilitySettings,
  AppExperience,
  ProviderRoute,
  PublicRoute,
  User,
  UserRole,
} from '../types';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { AccessibilityMenu } from './AccessibilityMenu';
import { useTranslation } from '../i18n/I18nContext';

interface NavbarProps {
  experience?: AppExperience;
  isProviderMode: boolean;
  publicRoute: PublicRoute;
  providerRoute: ProviderRoute;
  onNavigatePublic: (route: PublicRoute) => void;
  onNavigateProvider: (route: ProviderRoute) => void;
  onSwitchToProvider?: () => void;
  onSwitchToPublic?: () => void;
  onTryDemo: () => void;
  hasActiveResult: boolean;
  onViewResults: () => void;
  currentRole: UserRole;
  currentUser?: User;
  onSelectRole: (role: UserRole) => void;
  onOpenRoleModal: () => void;
  onOpenHelpModal: () => void;
  onSelectPreset: (caseId: string) => void;
  onOpenBatchModal: () => void;
  onOpenGuide?: () => void;
  accessibilitySettings: AccessibilitySettings;
  onUpdateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  userEmail: string | null;
  onOpenAuth: () => void;
  onLogout?: () => void;
  onOpenAccessibilityModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  experience = 'patient',
  isProviderMode,
  publicRoute,
  providerRoute,
  onNavigatePublic,
  onNavigateProvider,
  onSwitchToPublic,
  hasActiveResult,
  onViewResults,
  currentRole,
  currentUser,
  onOpenRoleModal,
  onOpenHelpModal,
  accessibilitySettings,
  onUpdateAccessibilitySettings,
  currentLanguage,
  onLanguageChange,
  onLogout,
  onOpenAccessibilityModal,
}) => {
  const { t } = useTranslation();

  // Dropdown states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  // Refs for click outside handling
  const moreRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  // Roles identification
  const isPatient = experience === 'patient' && !isProviderMode;
  const isHelper = experience === 'helper' || (isProviderMode && currentRole !== 'researcher');
  const isResearcher = experience === 'researcher' || currentRole === 'researcher';

  // Check if current user is an authenticated session user
  const isUserAuthenticated =
    Boolean(currentUser?.isLoggedIn) &&
    currentUser?.role !== 'public' &&
    currentUser?.id !== 'guest-patient' &&
    Boolean(currentUser?.email);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route navigation
  const handlePublicNav = (route: PublicRoute) => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    onNavigatePublic(route);
  };

  const handleProviderNav = (route: ProviderRoute) => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    onNavigateProvider(route);
  };

  return (
    <header
      id="main-navbar-header"
      className="bg-white/95 dark:bg-[#1B161A]/95 backdrop-blur-md border-b border-[#EFE4DC] dark:border-[#33292F] sticky top-0 z-40 w-full overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-2 md:gap-3 xl:gap-4 w-full min-w-0">
          {/* =====================================================================
              1. LOGO & BRAND
              ===================================================================== */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              id="navbar-brand-logo-btn"
              type="button"
              onClick={() => {
                if (onSwitchToPublic) {
                  onSwitchToPublic();
                } else {
                  handlePublicNav('overview');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] rounded-xl group transition-transform active:scale-[0.98]"
              aria-label="RetinaGuard AI Home"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-[#F05A28] group-hover:bg-[#D84818] transition-colors shrink-0 shadow-xs">
                <Eye className="w-4 h-4" />
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-serif font-bold text-sm sm:text-base lg:text-lg tracking-tight text-[#2B2024] dark:text-[#FAF5F7] group-hover:text-[#F05A28] transition-colors select-none">
                    RETINAGUARD
                  </span>
                  {!isPatient && (
                    <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#F05A28]">
                      AI
                    </span>
                  )}
                </div>

                {/* Subtitle / Role Badge ONLY for non-patient */}
                {!isPatient && isHelper && (
                  <span className="text-[9px] font-bold text-[#F05A28] tracking-wide uppercase mt-0.5">
                    HELPER
                  </span>
                )}
                {!isPatient && isResearcher && (
                  <span className="text-[9px] font-bold text-[#2B2024] dark:text-[#FAF5F7] tracking-wide uppercase mt-0.5">
                    RESEARCH
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* =====================================================================
              2. DESKTOP NAVIGATION (>= 1024px)
              Adapts gracefully between 1024px (compact/tablet-landscape), 1280px,
              1440px, and 1920px with zero overlap.
              ===================================================================== */}
          <nav
            id="desktop-main-navigation"
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 min-w-0"
          >
            {/* -------------------------------------------------------------
                A. PATIENT NAVIGATION
                Why Screening | How It Works | Find a Center | My Screening | Learn
                At 1024px-1279px: Primary links visible, secondary in More dropdown.
                At >= 1280px: All 5 links visible horizontally.
                ------------------------------------------------------------- */}
            {isPatient && (
              <>
                <button
                  type="button"
                  id="nav-patient-why-screening"
                  onClick={() => handlePublicNav('why-screening')}
                  className={`px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    publicRoute === 'why-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navWhyScreening', 'Why Screening')}
                </button>

                <button
                  type="button"
                  id="nav-patient-how-it-works"
                  onClick={() => handlePublicNav('how-it-works')}
                  className={`px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    publicRoute === 'how-it-works'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navHowItWorks', 'How It Works')}
                </button>

                <button
                  type="button"
                  id="nav-patient-find-center"
                  onClick={() => handlePublicNav('find-screening')}
                  className={`px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    publicRoute === 'find-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navFindCenter', 'Find a Center')}
                </button>

                <button
                  type="button"
                  id="nav-patient-my-screening"
                  onClick={() => handlePublicNav('my-screening')}
                  className={`hidden xl:inline-block px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    publicRoute === 'my-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navMyScreening', 'My Screening')}
                </button>

                <button
                  type="button"
                  id="nav-patient-learn"
                  onClick={() => handlePublicNav('learn')}
                  className={`hidden 2xl:inline-block px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    publicRoute === 'learn'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navLearn', 'Learn')}
                </button>

                {/* MORE DROPDOWN ON TABLET/COMPACT DESKTOP (1024-1279px for My Screening & Learn; 1280-1535px for Learn) */}
                <div className="relative 2xl:hidden" ref={moreRef}>
                  <button
                    type="button"
                    id="nav-patient-more-btn"
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="px-2 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40 transition-colors flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                    aria-expanded={moreMenuOpen}
                    aria-label="More navigation links"
                  >
                    <span>{t('navMore', 'More')}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        moreMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {moreMenuOpen && (
                    <div
                      id="nav-patient-more-dropdown"
                      className="absolute left-0 mt-2 w-52 bg-white dark:bg-[#1B161A] rounded-xl shadow-xl border border-[#EFE4DC] dark:border-[#33292F] py-1.5 z-50 animate-in fade-in"
                    >
                      <div className="xl:hidden">
                        <button
                          type="button"
                          onClick={() => handlePublicNav('my-screening')}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 transition-colors ${
                            publicRoute === 'my-screening'
                              ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                              : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                          }`}
                        >
                          <Activity className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{t('navMyScreening', 'My Screening')}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePublicNav('learn')}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 transition-colors ${
                          publicRoute === 'learn'
                            ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                            : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#F05A28]" />
                        <span>{t('navLearn', 'Learn')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* -------------------------------------------------------------
                B. SCREENING HELPER NAVIGATION
                Dashboard | Start Screening | Review Queue | Appointments | Referrals | More
                Tablet (1024-1279px): Collapses Appointments & Referrals into More
                ------------------------------------------------------------- */}
            {isHelper && (
              <>
                <button
                  type="button"
                  id="nav-helper-dashboard"
                  onClick={() => handleProviderNav('dashboard')}
                  className={`px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'dashboard'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navDashboard', 'Dashboard')}
                </button>

                <button
                  type="button"
                  id="nav-helper-start-screening"
                  onClick={() => handleProviderNav('start-screening')}
                  className={`px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'start-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navStartScreening', 'Start Screening')}
                </button>

                <button
                  type="button"
                  id="nav-helper-review-queue"
                  onClick={() => handleProviderNav('review-queue')}
                  className={`px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'review-queue'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navReviewQueue', 'Review Queue')}
                </button>

                {/* Visible on Desktop (>= 1280px), Collapsed into 'More' on Tablet (1024-1279px) */}
                <button
                  type="button"
                  id="nav-helper-appointments-desktop"
                  onClick={() => handleProviderNav('appointments')}
                  className={`hidden xl:inline-block px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'appointments'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navAppointments', 'Appointments')}
                </button>

                <button
                  type="button"
                  id="nav-helper-referrals-desktop"
                  onClick={() => handleProviderNav('referrals')}
                  className={`hidden xl:inline-block px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'referrals'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navReferrals', 'Referrals')}
                </button>

                {/* MORE DROPDOWN FOR HELPER */}
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    id="nav-helper-more-btn"
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="px-2 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40 transition-colors flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                  >
                    <span>{t('navMore', 'More')}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        moreMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {moreMenuOpen && (
                    <div
                      id="nav-helper-more-dropdown"
                      className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#1B161A] rounded-xl shadow-xl border border-[#EFE4DC] dark:border-[#33292F] py-1.5 z-50 animate-in fade-in"
                    >
                      {/* Secondary Items Collapsed on Tablet */}
                      <div className="xl:hidden pb-1 mb-1 border-b border-[#EFE4DC] dark:border-[#33292F]">
                        <button
                          type="button"
                          onClick={() => handleProviderNav('appointments')}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{t('navAppointments', 'Appointments')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProviderNav('referrals')}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                        >
                          <Users className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{t('navReferrals', 'Referrals')}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('camp-mode')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <Activity className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navCampOfflineMode', 'Camp Offline Mode')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('batch-screening')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navBatchScreening', 'Batch Screening')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('cases')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navCasesHistory', 'Cases & History')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('analytics')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navAnalytics', 'Analytics')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('technology')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navTechnologySaMD', 'Technology & Architecture')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('settings')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navSettings', 'Settings')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenHelpModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2 border-t border-[#EFE4DC] dark:border-[#33292F] mt-1 pt-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#F05A28]" />
                        <span>{t('navScreeningSOPHelp', 'Screening SOP & Help')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* -------------------------------------------------------------
                C. RESEARCHER NAVIGATION
                Research Overview | Models | Datasets | Experiments | Evaluation | Explainability | Model Versions
                ------------------------------------------------------------- */}
            {isResearcher && (
              <>
                <button
                  type="button"
                  id="nav-researcher-overview"
                  onClick={() => handleProviderNav('research')}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'research'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navResearchOverview', 'Overview')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-models"
                  onClick={() => handleProviderNav('models')}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'models'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navModels', 'Models')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-datasets"
                  onClick={() => handleProviderNav('datasets')}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'datasets'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navDatasets', 'Datasets')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-experiments"
                  onClick={() => handleProviderNav('experiments')}
                  className={`hidden xl:inline-block px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                    providerRoute === 'experiments'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-semibold'
                      : 'text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40'
                  }`}
                >
                  {t('navExperiments', 'Experiments')}
                </button>

                {/* MORE DROPDOWN FOR RESEARCHER */}
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    id="nav-researcher-more-btn"
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="px-2 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40 transition-colors flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                  >
                    <span>{t('navMore', 'More')}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        moreMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {moreMenuOpen && (
                    <div
                      id="nav-researcher-more-dropdown"
                      className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#1B161A] rounded-xl shadow-xl border border-[#EFE4DC] dark:border-[#33292F] py-1.5 z-50 animate-in fade-in"
                    >
                      {/* Secondary items collapsed on Tablet */}
                      <div className="xl:hidden pb-1 mb-1 border-b border-[#EFE4DC] dark:border-[#33292F]">
                        <button
                          type="button"
                          onClick={() => handleProviderNav('experiments')}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{t('navExperiments', 'Experiments')}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('evaluation')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#F05A28]" />
                        <span>{t('navEvaluation', 'Evaluation & Ablation')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('explainability')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-[#F05A28]" />
                        <span>{t('navExplainability', 'Explainability & Fairness')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('model-versions')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navModelVersions', 'Model Versions')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('technology')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navArchitectureValidation', 'Architecture & SaMD Validation')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('settings')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navSettings', 'Research Settings')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenHelpModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2 border-t border-[#EFE4DC] dark:border-[#33292F] mt-1 pt-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#F05A28]" />
                        <span>{t('navResearchDocumentation', 'Documentation & SOP')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* =====================================================================
              3. RIGHT SIDE CONTROLS
              - Workspace Mode Selector (Patient / Medical Worker / Researcher)
              - Language Selector
              - Accessibility & Display Preferences
              - Sign In / Profile
              - Primary CTA (START SCREENING)
              - Hamburger Toggle (< 1024px)
              ===================================================================== */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5 shrink-0 min-w-0">
            {/* -------------------------------------------------------------
                WORKSPACE MODE SELECTOR & SWITCHER
                (Visible on tablet >= 768px in the bar; in hamburger drawer on mobile)
                ------------------------------------------------------------- */}
            <div className="relative hidden md:block" ref={modeMenuRef}>
              <button
                type="button"
                id="navbar-workspace-mode-badge"
                onClick={() => setModeMenuOpen(!modeMenuOpen)}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 lg:px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] ${
                  isPatient
                    ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA] hover:bg-[#FFEDD5] dark:bg-[#321C14] dark:text-[#FFB594] dark:border-[#582A1B]'
                    : isHelper
                    ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] hover:bg-[#D1FAE5] dark:bg-[#102D24] dark:text-[#6EE7B7] dark:border-[#065F46]'
                    : 'bg-[#F4F4F5] text-[#18181B] border-[#D4D4D8] hover:bg-[#E4E4E7] dark:bg-[#27272A] dark:text-[#F4F4F5] dark:border-[#3F3F46]'
                }`}
                title="Switch mode: Patient, Medical Worker, Researcher"
                aria-expanded={modeMenuOpen}
              >
                {isPatient ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                    <span className="hidden xl:inline">{t('navPatientMode', 'Patient Mode')}</span>
                    <span className="xl:hidden">{t('rolePatientTitle', 'Patient')}</span>
                  </>
                ) : isHelper ? (
                  <>
                    <Stethoscope className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span className="hidden xl:inline">{t('navMedicalWorkerMode', 'Medical Worker Mode')}</span>
                    <span className="xl:hidden">{t('roleHelperTitle', 'Worker')}</span>
                  </>
                ) : (
                  <>
                    <Microscope className="w-3.5 h-3.5 text-[#18181B] dark:text-[#F4F4F5] shrink-0" />
                    <span className="hidden xl:inline">{t('navResearcherMode', 'Researcher Mode')}</span>
                    <span className="xl:hidden">{t('roleResearcherTitle', 'Research')}</span>
                  </>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${modeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {modeMenuOpen && (
                <div
                  id="navbar-mode-selector-dropdown"
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1B161A] rounded-2xl shadow-2xl border border-[#EFE4DC] dark:border-[#33292F] p-3.5 z-50 animate-in fade-in"
                >
                  <div className="pb-2.5 border-b border-[#EFE4DC] dark:border-[#33292F]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8E7E81] uppercase tracking-wider">
                        {t('navActiveWorkspace', 'Active Workspace')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] dark:bg-[#102D24] dark:text-[#6EE7B7] dark:border-[#065F46]">
                        {t('navEnabled', 'ENABLED')}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#1F181A] dark:text-[#FAF5F7] mt-0.5">
                      {isPatient ? t('navPatientMode', 'Patient Mode') : isHelper ? t('navMedicalWorkerMode', 'Medical Worker Mode') : t('navResearcherMode', 'Researcher Mode')}
                    </div>
                    <p className="text-[11px] text-[#6F6267] dark:text-[#C8BCC2] mt-1 leading-relaxed">
                      {t('roleModalSubtitle', 'For your signed profile, only this mode is enabled. To enable another mode, sign in with that role profile.')}
                    </p>
                  </div>

                  <div className="pt-2.5 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setModeMenuOpen(false);
                        onOpenRoleModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold transition-colors flex items-center justify-between shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-white" />
                        <span>{t('navSwitchModeSignIn', 'Switch Mode (Sign In)')}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>

                    {isUserAuthenticated && (
                      <button
                        type="button"
                        onClick={() => {
                          setModeMenuOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-[#DC2626] dark:text-[#F87171] hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-between transition-colors cursor-pointer mt-1"
                      >
                        <span>{t('navSignOutToGuest', 'Sign Out to Guest')}</span>
                        <LogOut className="w-3.5 h-3.5 text-[#DC2626] dark:text-[#F87171]" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                LANGUAGE SELECTOR
                (Visible in top bar on tablet/desktop >= 768px)
                ------------------------------------------------------------- */}
            <div className="relative hidden md:block" ref={langRef}>
              <button
                type="button"
                id="navbar-language-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-1.5 sm:px-2 lg:px-2.5 sm:py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#1B161A] hover:bg-white dark:hover:bg-[#251E23] text-xs text-[#2B2024] dark:text-[#FAF5F7] flex items-center gap-1 sm:gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                title="Change language"
                aria-label="Language selection"
                aria-expanded={langMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-[#F05A28] shrink-0" />
                <span className="font-semibold hidden xl:inline text-xs">
                  {currentLangObj.nativeLabel}
                </span>
                <span className="font-semibold hidden md:inline xl:hidden text-xs uppercase">
                  {currentLangObj.code}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#9E8D91] transition-transform ${
                    langMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {langMenuOpen && (
                <div
                  id="navbar-language-dropdown"
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1B161A] rounded-xl shadow-xl border border-[#EFE4DC] dark:border-[#33292F] py-1.5 z-50 animate-in fade-in"
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-[#9E8D91] uppercase tracking-wider border-b border-[#EFE4DC] dark:border-[#33292F]">
                    {t('navSelectLanguage', 'Select Language')}
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-[#FFE5D8] dark:bg-[#3D251E] text-[#F05A28] dark:text-[#FF7A4D] font-bold'
                          : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                      }`}
                    >
                      <span className="font-medium">{lang.nativeLabel}</span>
                      <span className="text-[11px] text-[#9E8D91]">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------
                ACCESSIBILITY & DISPLAY PREFERENCES
                (Quick drawer on desktop >= 1024px; accessible via mobile/tablet drawer)
                ------------------------------------------------------------- */}
            <div className="hidden lg:block shrink-0">
              <AccessibilityMenu
                settings={accessibilitySettings}
                onUpdateSettings={onUpdateAccessibilitySettings}
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
                onOpenFullSettings={onOpenAccessibilityModal}
              />
            </div>

            {/* -------------------------------------------------------------
                PROFILE / SIGN IN
                ------------------------------------------------------------- */}
            {isPatient ? (
              currentUser?.role === 'patient' && currentUser.id !== 'guest-public' ? (
                <div className="relative hidden sm:block" ref={profileRef}>
                  <button
                    type="button"
                    id="navbar-patient-profile-toggle"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#FED7AA] bg-[#FFE5D8] hover:bg-[#FFEDD5] dark:bg-[#3D251E] dark:border-[#582A1B] text-xs font-semibold text-[#D84818] dark:text-[#FF9D73] transition-colors shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#F05A28] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : 'P'}
                    </div>
                    <span className="hidden xl:inline max-w-[85px] truncate">
                      {currentUser.name ? currentUser.name.split(' ')[0] : 'Profile'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#F05A28]" />
                  </button>

                  {profileMenuOpen && (
                    <div
                      id="navbar-patient-profile-dropdown"
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1B161A] rounded-xl shadow-xl border border-[#EFE4DC] dark:border-[#33292F] p-2 z-50 animate-in fade-in"
                    >
                      <div className="px-3 py-2 border-b border-[#EFE4DC] dark:border-[#33292F] mb-1">
                        <div className="text-xs font-bold text-[#2B2024] dark:text-[#FAF5F7] truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] text-[#6F6267] dark:text-[#C8BCC2] truncate">
                          {currentUser.email || 'Patient Account'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handlePublicNav('my-reports');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] rounded-lg flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#F05A28]" />
                        <span>{t('navMyReports', 'My Reports')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handlePublicNav('my-screening');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] rounded-lg flex items-center gap-2"
                      >
                        <Activity className="w-3.5 h-3.5 text-[#F05A28]" />
                        <span>{t('navMyScreening', 'My Screening Journey')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handlePublicNav('profile');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] rounded-lg flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                        <span>{t('navPatientProfile', 'Account Profile')}</span>
                      </button>

                      <div className="border-t border-[#EFE4DC] dark:border-[#33292F] my-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onOpenRoleModal();
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#6F6267] dark:text-[#C8BCC2] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] rounded-lg flex items-center justify-between"
                        >
                          <span>{t('navSwitchWorkspace', 'Switch Workspace')}</span>
                          <RotateCcw className="w-3 h-3 text-[#9E8D91]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            if (onLogout) onLogout();
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#DC2626] dark:text-[#F87171] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center justify-between mt-0.5"
                        >
                          <span>{t('navSignOut', 'Sign Out')}</span>
                          <LogOut className="w-3 h-3 text-[#DC2626] dark:text-[#F87171]" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  id="navbar-patient-signin-btn"
                  onClick={onOpenRoleModal}
                  className="hidden md:inline-flex px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#FED7AA] bg-[#FFE5D8] hover:bg-[#FFEDD5] dark:bg-[#3D251E] dark:border-[#582A1B] text-xs font-bold text-[#D84818] dark:text-[#FF9D73] items-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#F05A28]" />
                  <span className="hidden xl:inline">Sign In / Mode</span>
                  <span className="xl:hidden">Sign In</span>
                </button>
              )
            ) : (
              /* Non-patient (Helper / Researcher) controls */
              <>
                {hasActiveResult && (
                  <button
                    type="button"
                    id="navbar-helper-active-result-btn"
                    onClick={onViewResults}
                    className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FFE5D8] dark:bg-[#3D251E] border border-[#FED7AA] dark:border-[#582A1B] text-[#D84818] dark:text-[#FF9D73] hover:bg-[#FFEDD5] text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                    title="View active examination triage"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#F05A28] animate-pulse" />
                    <span>{t('navResultsActive', 'Results • 1 active')}</span>
                  </button>
                )}

                <button
                  type="button"
                  id="navbar-back-to-patient-view"
                  onClick={() => {
                    if (onSwitchToPublic) {
                      onSwitchToPublic();
                    } else {
                      handlePublicNav('overview');
                    }
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#FFE5D8] hover:bg-[#FFEDD5] dark:bg-[#3D251E] dark:hover:bg-[#4C2E25] text-[#D84818] dark:text-[#FF9D73] border border-[#FED7AA] dark:border-[#582A1B] font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#F05A28]" />
                  <span className="hidden lg:inline">Patient View</span>
                </button>

                {/* Staff / Provider / Researcher Profile Menu */}
                <div className="relative hidden md:block" ref={profileRef}>
                  <button
                    type="button"
                    id="navbar-staff-profile-btn"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] bg-[#FFFDF9] dark:bg-[#1B161A] hover:bg-white dark:hover:bg-[#251E23] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#F05A28] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {currentUser?.name ? currentUser.name[0] : 'U'}
                    </div>
                    <div className="text-left hidden 2xl:block leading-tight">
                      <span className="text-xs font-bold text-[#2B2024] dark:text-[#FAF5F7] block truncate max-w-[95px]">
                        {currentUser?.name || 'User'}
                      </span>
                      <span className="text-[10px] text-[#F05A28] font-semibold block">
                        {currentUser?.helperRoleTitle || (isResearcher ? 'Researcher' : 'Helper')}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-[#9E8D91]" />
                  </button>

                  {profileMenuOpen && (
                    <div
                      id="navbar-staff-profile-dropdown"
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1B161A] rounded-xl shadow-xl border border-[#EFE4DC] dark:border-[#33292F] p-3 z-50 animate-in fade-in"
                    >
                      <div className="pb-3 border-b border-[#EFE4DC] dark:border-[#33292F] mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#F05A28] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {currentUser?.name ? currentUser.name[0] : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#2B2024] dark:text-[#FAF5F7] truncate">
                              {currentUser?.name}
                            </div>
                            <div className="text-[10px] text-[#6F6267] dark:text-[#C8BCC2] truncate">
                              {currentUser?.email}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] dark:bg-[#102D24] dark:text-[#6EE7B7] dark:border-[#065F46] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{t('navDemoVerified', 'DEMO VERIFIED')}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onOpenRoleModal();
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] rounded-lg flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium">{t('navSwitchWorkspace', 'Switch Workspace')}</span>
                        <RotateCcw className="w-3.5 h-3.5 text-[#9E8D91]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-[#DC2626] dark:text-[#F87171] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center justify-between transition-colors mt-1"
                      >
                        <span className="font-medium">{t('navSignOut', 'Sign Out')}</span>
                        <LogOut className="w-3.5 h-3.5 text-[#DC2626] dark:text-[#F87171]" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* -------------------------------------------------------------
                4. PRIMARY CTA: START SCREENING (Prominent and responsive)
                Remains clearly visible and never clipped across all widths.
                ------------------------------------------------------------- */}
            {isPatient && (
              <button
                type="button"
                id="navbar-primary-cta-start-screening"
                onClick={() => handlePublicNav('get-screened')}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 xl:px-4 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] active:bg-[#C23C10] text-white font-extrabold text-xs sm:text-xs xl:text-sm uppercase tracking-wider shadow-sm hover:shadow-md transition-all whitespace-nowrap ring-2 ring-[#F05A28]/25 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F05A28]"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span className="hidden sm:inline">{t('navStartScreeningAction', 'START SCREENING')}</span>
                <span className="sm:hidden text-[11px] font-bold">{t('navStartShort', 'START')}</span>
              </button>
            )}

            {/* -------------------------------------------------------------
                HAMBURGER TOGGLE (< 1024px)
                Provides instant access to full mobile navigation, role switch,
                language selection, and accessibility.
                ------------------------------------------------------------- */}
            <button
              type="button"
              id="navbar-mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#6F6267] dark:text-[#C8BCC2] hover:text-[#2B2024] dark:hover:text-[#FAF5F7] hover:bg-[#FFE5D8]/40 dark:hover:bg-[#3D251E]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] shrink-0"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. MOBILE & TABLET HAMBURGER DRAWER (< 1024px)
          Comprehensive, non-overflowing drawer with touch targets >= 44px
          ===================================================================== */}
      {mobileMenuOpen && (
        <div
          id="navbar-mobile-drawer"
          className="lg:hidden border-t border-[#EFE4DC] dark:border-[#33292F] bg-white dark:bg-[#1B161A] px-3.5 sm:px-5 pt-3.5 pb-8 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2 text-[#2B2024] dark:text-[#FAF5F7]"
        >
          {/* PROMINENT MOBILE MODE CARD */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#251E23] border border-[#FED7AA] dark:border-[#582A1B] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#C2410C] dark:text-[#FFB594] uppercase tracking-wider">
                {t('navActiveMode', 'Current Workspace Mode')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE5D8] dark:bg-[#3D251E] text-[#EA580C] dark:text-[#FF7A4D] border border-[#FED7AA] dark:border-[#582A1B]">
                {isPatient ? t('navPatientMode', 'Patient Mode') : isHelper ? t('navMedicalWorkerMode', 'Medical Worker Mode') : t('navResearcherMode', 'Researcher Mode')}
              </span>
            </div>
            <p className="text-xs text-[#6F6267] dark:text-[#C8BCC2] leading-relaxed">
              {isPatient
                ? t('rolePatientDesc', 'Patient Mode: Find screening centers, view reports, and book appointments.')
                : isHelper
                ? t('roleHelperDesc', 'Medical Worker Mode: Screening helper intake, clarity checks, and clinical review queue.')
                : t('roleResearcherDesc', 'Researcher Mode: Multimodal late fusion, model evaluation, and benchmarks.')}
            </p>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRoleModal();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white" />
              <span>{t('navSwitchModeSignIn', 'Switch Mode (Sign In)')}</span>
            </button>
          </div>

          {/* PATIENT MOBILE MENU */}
          {isPatient && (
            <div className="space-y-4">
              {/* Ultra-Prominent CTA in mobile drawer */}
              <button
                type="button"
                id="mobile-drawer-start-screening-cta"
                onClick={() => handlePublicNav('get-screened')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F05A28] hover:bg-[#D84818] active:bg-[#C23C10] text-white font-extrabold text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 ring-2 ring-[#F05A28]/25 min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F05A28]"
              >
                <Eye className="w-4 h-4 text-white shrink-0" />
                <span>START SCREENING</span>
              </button>

              <div className="space-y-1">
                <button
                  type="button"
                  id="mobile-nav-patient-why-screening"
                  onClick={() => handlePublicNav('why-screening')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                    publicRoute === 'why-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-bold'
                      : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                  }`}
                >
                  <span>{t('navWhyScreening', 'Why Screening')}</span>
                  <ChevronRight className="w-4 h-4 text-[#9E8D91]" />
                </button>

                <button
                  type="button"
                  id="mobile-nav-patient-how-it-works"
                  onClick={() => handlePublicNav('how-it-works')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                    publicRoute === 'how-it-works'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-bold'
                      : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                  }`}
                >
                  <span>{t('navHowItWorks', 'How It Works')}</span>
                  <ChevronRight className="w-4 h-4 text-[#9E8D91]" />
                </button>

                <button
                  type="button"
                  id="mobile-nav-patient-find-center"
                  onClick={() => handlePublicNav('find-screening')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                    publicRoute === 'find-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-bold'
                      : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                  }`}
                >
                  <span>{t('navFindCenter', 'Find a Center')}</span>
                  <ChevronRight className="w-4 h-4 text-[#9E8D91]" />
                </button>

                <button
                  type="button"
                  id="mobile-nav-patient-my-screening"
                  onClick={() => handlePublicNav('my-screening')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                    publicRoute === 'my-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-bold'
                      : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                  }`}
                >
                  <span>{t('navMyScreening', 'My Screening')}</span>
                  <ChevronRight className="w-4 h-4 text-[#9E8D91]" />
                </button>

                <button
                  type="button"
                  id="mobile-nav-patient-learn"
                  onClick={() => handlePublicNav('learn')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                    publicRoute === 'learn'
                      ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] dark:text-[#FF7A4D] font-bold'
                      : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                  }`}
                >
                  <span>{t('navLearn', 'Learn')}</span>
                  <ChevronRight className="w-4 h-4 text-[#9E8D91]" />
                </button>
              </div>

              {/* Language Selection in Mobile Drawer */}
              <div className="pt-3 border-t border-[#EFE4DC] dark:border-[#33292F]">
                <div className="px-3 text-[11px] font-bold text-[#9E8D91] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#F05A28]" />
                  <span>{t('navLanguage', 'Language')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => onLanguageChange(lang.code)}
                      className={`text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between min-h-[40px] transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-[#FFE5D8] dark:bg-[#3D251E] text-[#F05A28] dark:text-[#FF7A4D] font-bold border border-[#FED7AA] dark:border-[#582A1B]'
                          : 'text-[#2B2024] dark:text-[#FAF5F7] bg-[#FFFDF9] dark:bg-[#251E23] hover:bg-white dark:hover:bg-[#2F262C] border border-[#EFE4DC] dark:border-[#33292F]'
                      }`}
                    >
                      <span className="font-semibold">{lang.nativeLabel}</span>
                      <span className="text-[10px] text-[#9E8D91] uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Profile / Sign In in Mobile Drawer */}
              <div className="pt-3 border-t border-[#EFE4DC] dark:border-[#33292F]">
                {currentUser?.role === 'patient' && currentUser.id !== 'guest-public' ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-xs">
                      <span className="text-[#6F6267] dark:text-[#C8BCC2] block">{t('navSignedInAs', 'Signed in as')}</span>
                      <span className="font-bold text-[#2B2024] dark:text-[#FAF5F7]">{currentUser.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePublicNav('my-reports')}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2 min-h-[44px]"
                    >
                      <FileText className="w-4 h-4 text-[#F05A28]" />
                      <span>{t('navMyReports', 'My Reports')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('navSignOut', 'Sign Out')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRoleModal();
                    }}
                    className="w-full py-3 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] hover:border-[#FED7AA] bg-[#FFFDF9] dark:bg-[#251E23] hover:bg-[#FFE5D8] text-sm font-semibold text-[#2B2024] dark:text-[#FAF5F7] hover:text-[#F05A28] flex items-center justify-center gap-2 min-h-[44px] transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-[#F05A28]" />
                    <span>Profile / Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SCREENING HELPER MOBILE MENU */}
          {isHelper && (
            <div className="space-y-1">
              <div className="px-3.5 text-[10px] font-bold text-[#9E8D91] uppercase tracking-wider mb-1">
                {t('navClinicalWorkflow', 'Clinical Workflow')}
              </div>
              <button
                type="button"
                onClick={() => handleProviderNav('dashboard')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'dashboard'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('navDashboard', 'Dashboard')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('start-screening')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'start-screening'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <Camera className="w-4 h-4 text-[#F05A28]" />
                <span>{t('navStartScreening', 'Start Screening')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('review-queue')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'review-queue'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('navReviewQueue', 'Review Queue')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('appointments')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'appointments'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t('navAppointments', 'Appointments')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('referrals')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'referrals'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t('navReferrals', 'Referrals')}</span>
              </button>

              <div className="pt-2 border-t border-[#EFE4DC] dark:border-[#33292F]">
                <div className="px-3.5 text-[10px] font-bold text-[#9E8D91] uppercase tracking-wider mb-1">
                  {t('navToolsConfiguration', 'Tools & Configuration')}
                </div>

                <button
                  type="button"
                  onClick={() => handleProviderNav('camp-mode')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2 min-h-[40px]"
                >
                  <Activity className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                  <span>{t('navCampOfflineMode', 'Camp Offline Mode')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderNav('batch-screening')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2 min-h-[40px]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                  <span>{t('navBatchScreening', 'Batch Screening')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderNav('cases')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2 min-h-[40px]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                  <span>{t('navCasesHistory', 'Cases & History')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderNav('analytics')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2 min-h-[40px]"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                  <span>{t('navAnalytics', 'Analytics')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderNav('settings')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center gap-2 min-h-[40px]"
                >
                  <Settings className="w-3.5 h-3.5 text-[#6F6267] dark:text-[#C8BCC2]" />
                  <span>{t('navSettings', 'Settings')}</span>
                </button>
              </div>
            </div>
          )}

          {/* RESEARCHER MOBILE MENU */}
          {isResearcher && (
            <div className="space-y-1">
              <div className="px-3.5 text-[10px] font-bold text-[#9E8D91] uppercase tracking-wider mb-1">
                {t('navResearchWorkspace', 'Research Workspace')}
              </div>
              <button
                type="button"
                onClick={() => handleProviderNav('research')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'research'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('navResearchOverview', 'Research Overview')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('models')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'models'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>{t('navModels', 'Models')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('datasets')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'datasets'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>{t('navDatasets', 'Datasets')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('experiments')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'experiments'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('navExperiments', 'Experiments')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('evaluation')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'evaluation'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t('navEvaluation', 'Evaluation')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('explainability')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'explainability'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('navExplainability', 'Explainability')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('model-versions')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'model-versions'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>{t('navModelVersions', 'Model Versions')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('technology')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 min-h-[44px] ${
                  providerRoute === 'technology'
                    ? 'text-[#F05A28] bg-[#FFE5D8] dark:bg-[#3D251E] font-bold'
                    : 'text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23]'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>{t('navArchitectureValidation', 'Architecture & SaMD')}</span>
              </button>
            </div>
          )}

          {/* Accessibility button in Drawer */}
          {onOpenAccessibilityModal && (
            <div className="pt-2 border-t border-[#EFE4DC] dark:border-[#33292F]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccessibilityModal();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] transition-colors min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-[#F05A28]" />
                  <span>{t('accessibilitySettingsTitle', 'Accessibility & Display')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9E8D91]" />
              </button>
            </div>
          )}

          {/* User Account / Sign In / Switch in Drawer */}
          <div className="pt-3 border-t border-[#EFE4DC] dark:border-[#33292F] space-y-2">
            {isPatient ? (
              currentUser?.role === 'patient' && currentUser.id !== 'guest-public' ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#6F6267] dark:text-[#C8BCC2] block">{t('navSignedInAs', 'Signed in as')}</span>
                    <span className="font-bold text-[#2B2024] dark:text-[#FAF5F7]">{currentUser.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 min-h-[36px]"
                  >
                    {t('navSignOut', 'Sign Out')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRoleModal();
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <LogIn className="w-4 h-4 text-[#F05A28]" />
                  <span>{t('navSignInSelectRole', 'Sign In / Select Role')}</span>
                </button>
              )
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRoleModal();
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#EFE4DC] dark:border-[#33292F] text-xs font-semibold text-[#2B2024] dark:text-[#FAF5F7] hover:bg-[#FFFDF9] dark:hover:bg-[#251E23] flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4 text-[#F05A28]" />
                  <span>{t('navSwitchWorkspace', 'Switch Workspace')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navSignOut', 'Sign Out')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
