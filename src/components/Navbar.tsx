import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Camera,
  ChevronDown,
  Cpu,
  Database,
  Eye,
  FileSpreadsheet,
  FileText,
  Globe,
  HeartHandshake,
  HelpCircle,
  Layers,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  RotateCcw,
  Send,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Stethoscope,
  Tent,
  User as UserIcon,
  UserCheck,
  Users,
  Volume2,
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
}

export const Navbar: React.FC<NavbarProps> = ({
  experience = 'patient',
  isProviderMode,
  publicRoute,
  providerRoute,
  onNavigatePublic,
  onNavigateProvider,
  onSwitchToProvider,
  onSwitchToPublic,
  onTryDemo,
  hasActiveResult,
  onViewResults,
  currentRole,
  currentUser,
  onSelectRole,
  onOpenRoleModal,
  onOpenHelpModal,
  onSelectPreset,
  onOpenBatchModal,
  accessibilitySettings,
  onUpdateAccessibilitySettings,
  currentLanguage,
  onLanguageChange,
  userEmail,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const isPatient = experience === 'patient' && !isProviderMode;
  const isHelper = experience === 'helper' || (isProviderMode && currentRole !== 'researcher');
  const isResearcher = experience === 'researcher' || currentRole === 'researcher';

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#EFE4DC] sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="navbar-brand-button"
              type="button"
              onClick={() => {
                if (isResearcher) {
                  onNavigateProvider('research');
                } else if (isHelper) {
                  onNavigateProvider('dashboard');
                } else {
                  onNavigatePublic('overview');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs bg-[#EA580C] group-hover:bg-[#C2410C] transition-colors shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#2E2628]">
                    RetinaGuard<span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#EA580C] ml-1">AI</span>
                  </span>
                </div>

                {/* Subtitle / Role Badge */}
                {isHelper && (
                  <span className="block text-[9px] font-semibold text-[#EA580C] tracking-wide uppercase mt-0.5">
                    SCREENING HELPER • DEMO VERIFIED
                  </span>
                )}
                {isResearcher && (
                  <span className="block text-[9px] font-semibold text-[#2E2628] tracking-wide uppercase mt-0.5">
                    RESEARCH WORKSPACE
                  </span>
                )}
                {isPatient && (
                  <span className="block text-[9px] font-medium text-[#9E8D91] tracking-wide mt-0.5">
                    Community Screening
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* DESKTOP NAVIGATION (>= 1024px) */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* 1. PUBLIC PATIENT LINKS */}
            {isPatient && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigatePublic('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    publicRoute === 'overview'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navHome', 'Home')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigatePublic('why-screening')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    publicRoute === 'why-screening'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navWhyScreening', 'Why Screening?')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigatePublic('find-screening')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    publicRoute === 'find-screening'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navFindScreening', 'Find Screening')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigatePublic('learn')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    publicRoute === 'learn'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navLearn', 'Learn')}
                </button>

                <button
                  type="button"
                  onClick={onOpenHelpModal}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors"
                >
                  {t('navHelp', 'Help')}
                </button>

                {/* MORE DROPDOWN FOR PUBLIC */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors flex items-center gap-1"
                  >
                    <span>{t('navMore', 'More')}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {moreMenuOpen && (
                    <div
                      onMouseLeave={() => setMoreMenuOpen(false)}
                      className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#EFE4DC] py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenRoleModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#FFF7ED] hover:text-[#EA580C] flex items-center justify-between"
                      >
                        <span className="font-medium">{t('navForHelpers', 'For Screening Helpers')}</span>
                        <Lock className="w-3.5 h-3.5 text-[#9E8D91]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenRoleModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#FFF7ED] hover:text-[#EA580C] flex items-center justify-between"
                      >
                        <span className="font-medium">{t('navForResearchers', 'For Researchers')}</span>
                        <Lock className="w-3.5 h-3.5 text-[#9E8D91]" />
                      </button>

                      <div className="border-t border-[#EFE4DC] my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigatePublic('explore-demo');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#F9F5F1] flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>Explore AI Screening Demo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenHelpModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#F9F5F1] flex items-center gap-2"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#9E8D91]" />
                        <span>About RetinaGuard & FAQ</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 2. SCREENING HELPER LINKS */}
            {isHelper && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateProvider('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    providerRoute === 'dashboard'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navDashboard', 'Dashboard')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateProvider('start-screening')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    providerRoute === 'start-screening'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navStartScreening', 'Start Screening')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateProvider('review-queue')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    providerRoute === 'review-queue'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navReviewQueue', 'Review Queue')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateProvider('referrals')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    providerRoute === 'referrals'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navReferrals', 'Referrals')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateProvider('camp-mode')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    providerRoute === 'camp-mode'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navCampMode', 'Camp Mode')}
                </button>

                {/* MORE DROPDOWN FOR HELPER */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors flex items-center gap-1"
                  >
                    <span>{t('navMore', 'More')}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {moreMenuOpen && (
                    <div
                      onMouseLeave={() => setMoreMenuOpen(false)}
                      className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#EFE4DC] py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigateProvider('batch-screening');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#F9F5F1] flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>{t('navBatchScreening', 'Batch Screening')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigateProvider('cases');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#F9F5F1] flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#6E5C5F]" />
                        <span>{t('navCases', 'Cases & History')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigateProvider('analytics');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#F9F5F1] flex items-center gap-2"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#6E5C5F]" />
                        <span>{t('navAnalytics', 'Analytics')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigateProvider('technology');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#F9F5F1] flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#6E5C5F]" />
                        <span>{t('navTechnology', 'Technology & Architecture')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onNavigateProvider('settings');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#F9F5F1] flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#6E5C5F]" />
                        <span>{t('navSettings', 'Settings')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenHelpModal();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#2E2628] hover:bg-[#F9F5F1] flex items-center gap-2 border-t border-[#EFE4DC] mt-1 pt-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>Screening SOP & Help</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 3. RESEARCHER LINKS */}
            {isResearcher && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateProvider('research')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    providerRoute === 'research'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navResearchOverview', 'Research Overview')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateProvider('research')}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors"
                >
                  {t('navExperiments', 'Experiments')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateProvider('research')}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors"
                >
                  {t('navDatasets', 'Datasets')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateProvider('research')}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors"
                >
                  {t('navModels', 'Models')}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateProvider('technology')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    providerRoute === 'technology'
                      ? 'text-[#EA580C] bg-[#FFF7ED] font-semibold'
                      : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {t('navArchitecture', 'Architecture & SaMD')}
                </button>

                <button
                  type="button"
                  onClick={onOpenHelpModal}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors"
                >
                  {t('navHelp', 'Help')}
                </button>
              </>
            )}
          </nav>

          {/* RIGHT CONTROLS: ACTION BUTTONS, LANGUAGE, PROFILE */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CONTEXTUAL ACTIVE RESULT BADGE (Helper / Patient) */}
            {hasActiveResult && (
              <button
                type="button"
                id="navbar-active-result-btn"
                onClick={onViewResults}
                className="px-2.5 py-1.5 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] hover:bg-[#FFEDD5] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Activity className="w-3.5 h-3.5 text-[#EA580C] animate-pulse" />
                <span>Results • 1 active</span>
              </button>
            )}

            {/* PRIMARY CTA FOR PUBLIC: FIND A SCREENING CENTER */}
            {isPatient && (
              <button
                type="button"
                id="navbar-patient-primary-cta"
                onClick={() => onNavigatePublic('find-screening')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('ctaFindScreeningCenter', 'Find a Screening Center')}</span>
              </button>
            )}

            {/* LANGUAGE SELECTOR WITH NATIVE LABELS */}
            <div className="relative">
              <button
                type="button"
                id="language-selector-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] hover:bg-white text-xs text-[#2E2628] flex items-center gap-1.5 transition-colors"
                title="Select language"
              >
                <Globe className="w-3.5 h-3.5 text-[#EA580C]" />
                <span className="font-semibold hidden sm:inline">{currentLangObj.nativeLabel}</span>
                <ChevronDown className={`w-3 h-3 text-[#9E8D91] transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div
                  onMouseLeave={() => setLangMenuOpen(false)}
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#EFE4DC] py-1 z-50 animate-in fade-in"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#9E8D91] uppercase tracking-wider border-b border-[#EFE4DC]">
                    Select Language
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
                          ? 'bg-[#FFF7ED] text-[#EA580C] font-bold'
                          : 'text-[#2E2628] hover:bg-[#F9F5F1]'
                      }`}
                    >
                      <span className="font-medium">{lang.nativeLabel}</span>
                      <span className="text-[11px] text-[#9E8D91]">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ACCESSIBILITY MENU */}
            <AccessibilityMenu
              settings={accessibilitySettings}
              onUpdateSettings={onUpdateAccessibilitySettings}
            />

            {/* PROFILE OR SIGN IN BUTTON */}
            {isPatient ? (
              <button
                type="button"
                id="navbar-signin-btn"
                onClick={onOpenRoleModal}
                className="px-3 py-1.5 rounded-xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-white hover:bg-[#FFF7ED] text-xs font-semibold text-[#2E2628] hover:text-[#EA580C] flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{t('navSignIn', 'Sign In')}</span>
              </button>
            ) : (
              /* LOGGED IN PROFILE MENU */
              <div className="relative">
                <button
                  type="button"
                  id="user-profile-menu-btn"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] hover:bg-white transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser?.name ? currentUser.name[0] : 'U'}
                  </div>
                  <div className="text-left hidden md:block leading-tight">
                    <span className="text-xs font-bold text-[#2E2628] block truncate max-w-[110px]">
                      {currentUser?.name || 'User'}
                    </span>
                    <span className="text-[10px] text-[#EA580C] font-semibold block">
                      {currentUser?.helperRoleTitle || (isResearcher ? 'Researcher' : 'Verified')}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#9E8D91]" />
                </button>

                {profileMenuOpen && (
                  <div
                    onMouseLeave={() => setProfileMenuOpen(false)}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#EFE4DC] p-3 z-50 animate-in fade-in"
                  >
                    {/* User Card */}
                    <div className="pb-3 border-b border-[#EFE4DC] mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs">
                          {currentUser?.name ? currentUser.name[0] : 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#2E2628]">{currentUser?.name}</div>
                          <div className="text-[10px] text-[#6E5C5F] truncate max-w-[170px]">
                            {currentUser?.email}
                          </div>
                        </div>
                      </div>

                      {currentUser?.organization && (
                        <div className="mt-2 text-[10px] text-[#6E5C5F] bg-[#FFFDFB] p-1.5 rounded-lg border border-[#EFE4DC]">
                          <span className="font-semibold block text-[#2E2628]">Organization:</span>
                          {currentUser.organization}
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>DEMO VERIFIED</span>
                        </span>
                      </div>
                    </div>

                    {/* Switch Workspace */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onOpenRoleModal();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#2E2628] hover:bg-[#F9F5F1] rounded-lg flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium">{t('profileSwitchWorkspace', 'Switch Workspace')}</span>
                      <RotateCcw className="w-3.5 h-3.5 text-[#9E8D91]" />
                    </button>

                    {/* Sign Out */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#DC2626] hover:bg-red-50 rounded-lg flex items-center justify-between transition-colors mt-1"
                    >
                      <span className="font-medium">{t('profileSignOut', 'Sign Out')}</span>
                      <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOBILE HAMBURGER BUTTON (< 1024px) */}
            <button
              type="button"
              id="navbar-mobile-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FULL DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EFE4DC] bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {isPatient && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onNavigatePublic('overview');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navHome', 'Home')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigatePublic('why-screening');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navWhyScreening', 'Why Screening?')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigatePublic('find-screening');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navFindScreening', 'Find Screening')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigatePublic('learn');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navLearn', 'Learn')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenHelpModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navHelp', 'Help & FAQs')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigatePublic('explore-demo');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#EA580C] hover:bg-[#FFF7ED]"
              >
                Explore AI Screening Demo
              </button>
            </div>
          )}

          {isHelper && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navDashboard', 'Dashboard')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('start-screening');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navStartScreening', 'Start Screening')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('review-queue');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navReviewQueue', 'Review Queue')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('referrals');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navReferrals', 'Referrals')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('camp-mode');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navCampMode', 'Camp Mode')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('batch-screening');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navBatchScreening', 'Batch Screening')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('analytics');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                {t('navAnalytics', 'Analytics')}
              </button>
            </div>
          )}

          {isResearcher && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('research');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                Research Overview
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateProvider('technology');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2E2628] hover:bg-[#F9F5F1]"
              >
                Architecture & SaMD
              </button>
            </div>
          )}

          {/* Quick Action Button */}
          <div className="pt-2 border-t border-[#EFE4DC]">
            {isPatient ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRoleModal();
                }}
                className="w-full py-2.5 rounded-xl bg-[#2E2628] text-white text-xs font-semibold text-center"
              >
                Sign In / Select Role
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-stone-100 text-[#DC2626] text-xs font-semibold text-center"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
