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

  // Refs for click outside handling
  const moreRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Roles identification
  const isPatient = experience === 'patient' && !isProviderMode;
  const isHelper = experience === 'helper' || (isProviderMode && currentRole !== 'researcher');
  const isResearcher = experience === 'researcher' || currentRole === 'researcher';

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
      className="bg-white/95 backdrop-blur-md border-b border-[#EFE4DC] sticky top-0 z-40 w-full overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 w-full min-w-0">
          {/* =====================================================================
              1. LOGO & BRAND
              ===================================================================== */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
              className="flex items-center gap-2 text-left focus:outline-none group"
              aria-label="RetinaGuard AI Home"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-[#F05A28] group-hover:bg-[#D84818] transition-colors shrink-0 shadow-xs">
                <Eye className="w-4 h-4" />
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#2B2024] group-hover:text-[#F05A28] transition-colors">
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
                  <span className="text-[9px] font-bold text-[#2B2024] tracking-wide uppercase mt-0.5">
                    RESEARCH
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* =====================================================================
              2. DESKTOP & TABLET NAVIGATION
              ===================================================================== */}
          <nav
            id="desktop-main-navigation"
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-2 min-w-0"
          >
            {/* -------------------------------------------------------------
                A. PATIENT NAVIGATION
                Why Screening | How It Works | Find a Center | My Screening | Learn
                ------------------------------------------------------------- */}
            {isPatient && (
              <>
                <button
                  type="button"
                  id="nav-patient-why-screening"
                  onClick={() => handlePublicNav('why-screening')}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    publicRoute === 'why-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFE5D8]/40'
                  }`}
                >
                  {t('navWhyScreening', 'Why Screening')}
                </button>

                <button
                  type="button"
                  id="nav-patient-how-it-works"
                  onClick={() => handlePublicNav('how-it-works')}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    publicRoute === 'how-it-works'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFE5D8]/40'
                  }`}
                >
                  {t('navHowItWorks', 'How It Works')}
                </button>

                <button
                  type="button"
                  id="nav-patient-find-center"
                  onClick={() => handlePublicNav('find-screening')}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    publicRoute === 'find-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFE5D8]/40'
                  }`}
                >
                  {t('navFindCenter', 'Find a Center')}
                </button>

                <button
                  type="button"
                  id="nav-patient-my-screening"
                  onClick={() => handlePublicNav('my-screening')}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    publicRoute === 'my-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFE5D8]/40'
                  }`}
                >
                  {t('navMyScreening', 'My Screening')}
                </button>

                <button
                  type="button"
                  id="nav-patient-learn"
                  onClick={() => handlePublicNav('learn')}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    publicRoute === 'learn'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFE5D8]/40'
                  }`}
                >
                  {t('navLearn', 'Learn')}
                </button>
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
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'dashboard'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navDashboard', 'Dashboard')}
                </button>

                <button
                  type="button"
                  id="nav-helper-start-screening"
                  onClick={() => handleProviderNav('start-screening')}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'start-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navStartScreening', 'Start Screening')}
                </button>

                <button
                  type="button"
                  id="nav-helper-review-queue"
                  onClick={() => handleProviderNav('review-queue')}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'review-queue'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navReviewQueue', 'Review Queue')}
                </button>

                {/* Visible on Desktop (>= 1280px), Collapsed into 'More' on Tablet (1024-1279px) */}
                <button
                  type="button"
                  id="nav-helper-appointments-desktop"
                  onClick={() => handleProviderNav('appointments')}
                  className={`hidden xl:inline-block px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'appointments'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navAppointments', 'Appointments')}
                </button>

                <button
                  type="button"
                  id="nav-helper-referrals-desktop"
                  onClick={() => handleProviderNav('referrals')}
                  className={`hidden xl:inline-block px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'referrals'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
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
                    className="px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors flex items-center gap-1 whitespace-nowrap"
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
                      className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#EFE4DC] py-1.5 z-50 animate-in fade-in"
                    >
                      {/* Secondary Items Collapsed on Tablet */}
                      <div className="xl:hidden pb-1 mb-1 border-b border-[#EFE4DC]">
                        <button
                          type="button"
                          onClick={() => handleProviderNav('appointments')}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{t('navAppointments', 'Appointments')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProviderNav('referrals')}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                        >
                          <Users className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{t('navReferrals', 'Referrals')}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('camp-mode')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                      >
                        <Activity className="w-3.5 h-3.5 text-[#6F6267]" />
                        <span>{t('navCampOfflineMode', 'Camp Offline Mode')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('batch-screening')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#6F6267]" />
                        <span>{t('navBatchScreening', 'Batch Screening')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('cases')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#6F6267]" />
                        <span>{t('navCasesHistory', 'Cases & History')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('analytics')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#6F6267]" />
                        <span>{t('navAnalytics', 'Analytics')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('technology')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#6F6267]" />
                        <span>{t('navTechnologySaMD', 'Technology & Architecture')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('settings')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#6F6267]" />
                        <span>{t('navSettings', 'Settings')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenHelpModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2 border-t border-[#EFE4DC] mt-1 pt-1.5"
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
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'research'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navResearchOverview', 'Research Overview')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-models"
                  onClick={() => handleProviderNav('models')}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'models'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navModels', 'Models')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-datasets"
                  onClick={() => handleProviderNav('datasets')}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'datasets'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navDatasets', 'Datasets')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-experiments"
                  onClick={() => handleProviderNav('experiments')}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'experiments'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navExperiments', 'Experiments')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-evaluation-desktop"
                  onClick={() => handleProviderNav('evaluation')}
                  className={`hidden xl:inline-block px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'evaluation'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navEvaluation', 'Evaluation')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-explainability-desktop"
                  onClick={() => handleProviderNav('explainability')}
                  className={`hidden xl:inline-block px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'explainability'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navExplainability', 'Explainability')}
                </button>

                <button
                  type="button"
                  id="nav-researcher-model-versions-desktop"
                  onClick={() => handleProviderNav('model-versions')}
                  className={`hidden xl:inline-block px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                    providerRoute === 'model-versions'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-semibold'
                      : 'text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  {t('navModelVersions', 'Model Versions')}
                </button>

                {/* MORE DROPDOWN FOR RESEARCHER */}
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    id="nav-researcher-more-btn"
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors flex items-center gap-1 whitespace-nowrap"
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
                      className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#EFE4DC] py-1.5 z-50 animate-in fade-in"
                    >
                      {/* Secondary items collapsed on Tablet */}
                      <div className="xl:hidden pb-1 mb-1 border-b border-[#EFE4DC]">
                        <button
                          type="button"
                          onClick={() => handleProviderNav('evaluation')}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{t('navEvaluation', 'Evaluation & Ablation Matrix')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProviderNav('explainability')}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{t('navExplainability', 'Explainability & Fairness')}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('technology')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#6F6267]" />
                        <span>{t('navArchitectureValidation', 'Architecture & SaMD Validation')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderNav('settings')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#6F6267]" />
                        <span>{t('navSettings', 'Research Settings')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenHelpModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2 border-t border-[#EFE4DC] mt-1 pt-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#F05A28]" />
                        <span>{t('navResearchDocumentation', 'Research Documentation & SOP')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* =====================================================================
              3. RIGHT SIDE CONTROLS
              - Primary CTA (FIND A SCREENING)
              - Language Selector
              - Accessibility
              - Sign In / Profile
              - Hamburger Toggle (< 1024px)
              ===================================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isPatient ? (
              <>
                {/* 1. LANGUAGE SELECTOR */}
                <div className="relative" ref={langRef}>
                  <button
                    type="button"
                    id="navbar-language-btn"
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] hover:bg-white text-xs text-[#2B2024] flex items-center gap-1 sm:gap-1.5 transition-colors focus:outline-none"
                    title="Change language"
                    aria-label="Language selection"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#F05A28]" />
                    <span className="font-semibold hidden xl:inline text-xs">
                      {currentLangObj.nativeLabel}
                    </span>
                    <span className="font-semibold hidden sm:inline xl:hidden text-xs uppercase">
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
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#EFE4DC] py-1.5 z-50 animate-in fade-in"
                    >
                      <div className="px-3 py-1 text-[10px] font-bold text-[#9E8D91] uppercase tracking-wider border-b border-[#EFE4DC]">
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
                              ? 'bg-[#FFE5D8] text-[#F05A28] font-bold'
                              : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                          }`}
                        >
                          <span className="font-medium">{lang.nativeLabel}</span>
                          <span className="text-[11px] text-[#9E8D91]">{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. PROFILE / SIGN IN */}
                {currentUser?.role === 'patient' && currentUser.id !== 'guest-public' ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      id="navbar-patient-profile-toggle"
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-[#FED7AA] bg-[#FFE5D8] hover:bg-[#FFEDD5] text-xs font-semibold text-[#D84818] transition-colors shadow-2xs"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#F05A28] text-white flex items-center justify-center text-[10px] font-bold">
                        {currentUser.name ? currentUser.name[0].toUpperCase() : 'P'}
                      </div>
                      <span className="hidden md:inline max-w-[85px] truncate">
                        {currentUser.name ? currentUser.name.split(' ')[0] : 'Profile'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-[#F05A28]" />
                    </button>

                    {profileMenuOpen && (
                      <div
                        id="navbar-patient-profile-dropdown"
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#EFE4DC] p-2 z-50 animate-in fade-in"
                      >
                        <div className="px-3 py-2 border-b border-[#EFE4DC] mb-1">
                          <div className="text-xs font-bold text-[#2B2024] truncate">
                            {currentUser.name}
                          </div>
                          <div className="text-[10px] text-[#6F6267] truncate">
                            {currentUser.email || 'Patient Account'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handlePublicNav('my-reports');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-[#2B2024] hover:bg-[#FFFDF9] rounded-lg flex items-center gap-2"
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
                          className="w-full text-left px-3 py-2 text-xs font-medium text-[#2B2024] hover:bg-[#FFFDF9] rounded-lg flex items-center gap-2"
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
                          className="w-full text-left px-3 py-2 text-xs font-medium text-[#2B2024] hover:bg-[#FFFDF9] rounded-lg flex items-center gap-2"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#6F6267]" />
                          <span>{t('navPatientProfile', 'Account Profile')}</span>
                        </button>

                        <div className="border-t border-[#EFE4DC] my-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              onOpenRoleModal();
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-[#6F6267] hover:bg-[#FFFDF9] rounded-lg flex items-center justify-between"
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
                            className="w-full text-left px-3 py-1.5 text-xs text-[#DC2626] hover:bg-red-50 rounded-lg flex items-center justify-between mt-0.5"
                          >
                            <span>{t('navSignOut', 'Sign Out')}</span>
                            <LogOut className="w-3 h-3 text-[#DC2626]" />
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
                    className="hidden sm:inline-flex px-2.5 sm:px-3 py-2 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-white hover:bg-[#FFE5D8] text-xs font-semibold text-[#2B2024] hover:text-[#F05A28] items-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#F05A28]" />
                    <span className="hidden md:inline">{t('navProfileSignIn', 'Profile / Sign In')}</span>
                    <span className="md:hidden">{t('navSignIn', 'Sign In')}</span>
                  </button>
                )}

                {/* 3. PRIMARY CTA: START SCREENING (The most visually prominent navigation action) */}
                <button
                  type="button"
                  id="navbar-primary-cta-start-screening"
                  onClick={() => handlePublicNav('get-screened')}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] active:bg-[#C23C10] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all whitespace-nowrap ring-2 ring-[#F05A28]/30 shrink-0"
                >
                  <Eye className="w-4 h-4 text-white shrink-0" />
                  <span className="hidden sm:inline">{t('navStartScreeningAction', 'START SCREENING')}</span>
                  <span className="sm:hidden text-[11px] font-bold">{t('navStartShort', 'START')}</span>
                </button>
              </>
            ) : (
              /* PROVIDER / RESEARCHER CONTROLS - PRESERVED UNCHANGED */
              <>
                {hasActiveResult && (
                  <button
                    type="button"
                    id="navbar-helper-active-result-btn"
                    onClick={onViewResults}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FFE5D8] border border-[#FED7AA] text-[#D84818] hover:bg-[#FFEDD5] text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap"
                    title="View active examination triage"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#F05A28] animate-pulse" />
                    <span className="hidden md:inline">{t('navResultsActive', 'Results • 1 active')}</span>
                    <span className="md:hidden">{t('navActiveShort', '1 Active')}</span>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#FFE5D8] hover:bg-[#FFEDD5] text-[#D84818] border border-[#FED7AA] font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#F05A28]" />
                  <span className="hidden sm:inline">Public Patient View</span>
                  <span className="sm:hidden">Patient View</span>
                </button>

                {/* LANGUAGE SELECTOR FOR PROVIDER */}
                <div className="relative" ref={langRef}>
                  <button
                    type="button"
                    id="navbar-provider-language-btn"
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] hover:bg-white text-xs text-[#2B2024] flex items-center gap-1 sm:gap-1.5 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#F05A28]" />
                    <span className="font-semibold hidden xl:inline text-xs">
                      {currentLangObj.nativeLabel}
                    </span>
                    <span className="font-semibold hidden sm:inline xl:hidden text-xs uppercase">
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
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#EFE4DC] py-1.5 z-50 animate-in fade-in"
                    >
                      <div className="px-3 py-1 text-[10px] font-bold text-[#9E8D91] uppercase tracking-wider border-b border-[#EFE4DC]">
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
                              ? 'bg-[#FFE5D8] text-[#F05A28] font-bold'
                              : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                          }`}
                        >
                          <span className="font-medium">{lang.nativeLabel}</span>
                          <span className="text-[11px] text-[#9E8D91]">{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block">
                  <AccessibilityMenu
                    settings={accessibilitySettings}
                    onUpdateSettings={onUpdateAccessibilitySettings}
                    currentLanguage={currentLanguage}
                    onLanguageChange={onLanguageChange}
                    onOpenFullSettings={onOpenAccessibilityModal}
                  />
                </div>

                {/* Staff / Provider / Researcher Profile Menu */}
                <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  id="navbar-staff-profile-btn"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDF9] hover:bg-white transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F05A28] text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser?.name ? currentUser.name[0] : 'U'}
                  </div>
                  <div className="text-left hidden lg:block leading-tight">
                    <span className="text-xs font-bold text-[#2B2024] block truncate max-w-[95px]">
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
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#EFE4DC] p-3 z-50 animate-in fade-in"
                  >
                    <div className="pb-3 border-b border-[#EFE4DC] mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#F05A28] text-white flex items-center justify-center font-bold text-xs">
                          {currentUser?.name ? currentUser.name[0] : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2B2024] truncate">
                            {currentUser?.name}
                          </div>
                          <div className="text-[10px] text-[#6F6267] truncate">
                            {currentUser?.email}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center gap-1">
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
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#2B2024] hover:bg-[#FFFDF9] rounded-lg flex items-center justify-between transition-colors"
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
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#DC2626] hover:bg-red-50 rounded-lg flex items-center justify-between transition-colors mt-1"
                    >
                      <span className="font-medium">{t('navSignOut', 'Sign Out')}</span>
                      <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

            {/* -------------------------------------------------------------
                HAMBURGER TOGGLE (< 1024px)
                ------------------------------------------------------------- */}
            <button
              type="button"
              id="navbar-mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#6F6267] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors"
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
          className="lg:hidden border-t border-[#EFE4DC] bg-white px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl animate-in slide-in-from-top-2"
        >
          {/* PATIENT MOBILE MENU */}
          {isPatient && (
            <div className="space-y-4">
              {/* Ultra-Prominent CTA in mobile drawer */}
              <button
                type="button"
                id="mobile-drawer-start-screening-cta"
                onClick={() => handlePublicNav('get-screened')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F05A28] hover:bg-[#D84818] active:bg-[#C23C10] text-white font-extrabold text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 ring-2 ring-[#F05A28]/25 min-h-[48px]"
              >
                <Eye className="w-4 h-4 text-white" />
                <span>START SCREENING</span>
              </button>

              <div className="space-y-1">
                <button
                  type="button"
                  id="mobile-nav-patient-why-screening"
                  onClick={() => handlePublicNav('why-screening')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                    publicRoute === 'why-screening'
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                      : 'text-[#2B2024] hover:bg-[#FFFDF9]'
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
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                      : 'text-[#2B2024] hover:bg-[#FFFDF9]'
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
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                      : 'text-[#2B2024] hover:bg-[#FFFDF9]'
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
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                      : 'text-[#2B2024] hover:bg-[#FFFDF9]'
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
                      ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                      : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                  }`}
                >
                  <span>{t('navLearn', 'Learn')}</span>
                  <ChevronRight className="w-4 h-4 text-[#9E8D91]" />
                </button>
              </div>

              {/* Language Selection in Mobile Drawer */}
              <div className="pt-3 border-t border-[#EFE4DC]">
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
                          ? 'bg-[#FFE5D8] text-[#F05A28] font-bold border border-[#FED7AA]'
                          : 'text-[#2B2024] bg-[#FFFDF9] hover:bg-white border border-[#EFE4DC]'
                      }`}
                    >
                      <span className="font-semibold">{lang.nativeLabel}</span>
                      <span className="text-[10px] text-[#9E8D91] uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Profile / Sign In in Mobile Drawer */}
              <div className="pt-3 border-t border-[#EFE4DC]">
                {currentUser?.role === 'patient' && currentUser.id !== 'guest-public' ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-xs">
                      <span className="text-[#6F6267] block">{t('navSignedInAs', 'Signed in as')}</span>
                      <span className="font-bold text-[#2B2024]">{currentUser.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePublicNav('my-reports')}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2 min-h-[44px]"
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
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 min-h-[44px]"
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
                    className="w-full py-3 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDF9] hover:bg-[#FFE5D8] text-sm font-semibold text-[#2B2024] hover:text-[#F05A28] flex items-center justify-center gap-2 min-h-[44px] transition-colors"
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
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'dashboard'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('navDashboard', 'Dashboard')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('start-screening')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'start-screening'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <Camera className="w-4 h-4 text-[#F05A28]" />
                <span>{t('navStartScreening', 'Start Screening')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('review-queue')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'review-queue'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('navReviewQueue', 'Review Queue')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('appointments')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'appointments'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t('navAppointments', 'Appointments')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('referrals')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'referrals'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t('navReferrals', 'Referrals')}</span>
              </button>

              <div className="pt-2 border-t border-[#EFE4DC]">
                <div className="px-3.5 text-[10px] font-bold text-[#9E8D91] uppercase tracking-wider mb-1">
                  {t('navToolsConfiguration', 'Tools & Configuration')}
                </div>

                <button
                  type="button"
                  onClick={() => handleProviderNav('camp-mode')}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-[#6F6267]" />
                  <span>{t('navCampOfflineMode', 'Camp Offline Mode')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderNav('batch-screening')}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6F6267]" />
                  <span>{t('navBatchScreening', 'Batch Screening')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderNav('cases')}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6F6267]" />
                  <span>{t('navCasesHistory', 'Cases & History')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderNav('analytics')}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#6F6267]" />
                  <span>{t('navAnalytics', 'Analytics')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderNav('settings')}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#2B2024] hover:bg-[#FFFDF9] flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-[#6F6267]" />
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
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'research'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('navResearchOverview', 'Research Overview')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('models')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'models'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>{t('navModels', 'Models')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('datasets')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'datasets'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>{t('navDatasets', 'Datasets')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('experiments')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'experiments'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('navExperiments', 'Experiments')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('evaluation')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'evaluation'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t('navEvaluation', 'Evaluation')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('explainability')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'explainability'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('navExplainability', 'Explainability')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('model-versions')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'model-versions'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>{t('navModelVersions', 'Model Versions')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderNav('technology')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                  providerRoute === 'technology'
                    ? 'text-[#F05A28] bg-[#FFE5D8] font-bold'
                    : 'text-[#2B2024] hover:bg-[#FFFDF9]'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>{t('navArchitectureValidation', 'Architecture & SaMD')}</span>
              </button>
            </div>
          )}

          {/* Accessibility button in Drawer */}
          {onOpenAccessibilityModal && (
            <div className="pt-2 border-t border-[#EFE4DC]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccessibilityModal();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between text-[#2B2024] hover:bg-[#FFFDF9]"
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
          <div className="pt-3 border-t border-[#EFE4DC] space-y-2">
            {isPatient ? (
              currentUser?.role === 'patient' && currentUser.id !== 'guest-public' ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#6F6267] block">{t('navSignedInAs', 'Signed in as')}</span>
                    <span className="font-bold text-[#2B2024]">{currentUser.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50"
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
                  className="w-full py-2.5 rounded-xl border border-[#EFE4DC] text-xs font-semibold text-[#2B2024] hover:bg-[#FFFDF9] flex items-center justify-center gap-2"
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
                  className="w-full py-2.5 rounded-xl border border-[#EFE4DC] text-xs font-semibold text-[#2B2024] hover:bg-[#FFFDF9] flex items-center justify-center gap-2"
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
                  className="w-full py-2.5 rounded-xl bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 flex items-center justify-center gap-2"
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
