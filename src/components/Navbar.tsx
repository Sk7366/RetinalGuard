import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Camera,
  ChevronDown,
  Clock,
  Cpu,
  Eye,
  FileSpreadsheet,
  FileText,
  HeartHandshake,
  Layers,
  LogIn,
  MapPin,
  Menu,
  Send,
  Settings,
  Sliders,
  Sparkles,
  Stethoscope,
  Tent,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { AccessibilitySettings, ProviderRoute, PublicRoute, UserRole } from '../types';
import { LanguageCode } from '../i18n/translations';
import { AccessibilityMenu } from './AccessibilityMenu';
import { useTranslation } from '../i18n/I18nContext';

interface NavbarProps {
  isProviderMode: boolean;
  publicRoute: PublicRoute;
  providerRoute: ProviderRoute;
  onNavigatePublic: (route: PublicRoute) => void;
  onNavigateProvider: (route: ProviderRoute) => void;
  onSwitchToProvider: () => void;
  onSwitchToPublic: () => void;
  onTryDemo: () => void;
  hasActiveResult: boolean;
  onViewResults: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenRoleModal: () => void;
  onSelectPreset: (caseId: string) => void;
  onOpenBatchModal: () => void;
  onOpenGuide: () => void;
  accessibilitySettings: AccessibilitySettings;
  onUpdateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  userEmail: string | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
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
  onSelectRole,
  onOpenRoleModal,
  onSelectPreset,
  onOpenBatchModal,
  onOpenGuide,
  accessibilitySettings,
  onUpdateAccessibilitySettings,
  currentLanguage,
  onLanguageChange,
  userEmail,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const roleLabels: Record<UserRole, string> = {
    public: 'Public User',
    technician: 'Screening Tech',
    provider: 'Healthcare Provider',
    admin: 'Administrator',
    researcher: 'Researcher',
  };

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-stone-200/70 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="navbar-brand-button"
              onClick={() => {
                if (isProviderMode) {
                  onNavigateProvider('dashboard');
                } else {
                  onNavigatePublic('overview');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs bg-gradient-to-br from-[#EA580C] to-[#DB2777] transition-all group-hover:scale-105 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-stone-900">
                    RetinaGuard<span className="font-sans text-[11px] font-semibold text-[#EA580C] ml-1">AI</span>
                  </span>
                  {isProviderMode && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                      Provider
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stone-400 font-normal hidden sm:block tracking-tight">
                  Multimodal Retinopathy & DME Screening
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links: Public vs Provider */}
          <nav className="hidden md:flex items-center gap-1 text-xs lg:text-sm font-medium">
            {!isProviderMode ? (
              // PUBLIC NAVIGATION
              <>
                <button
                  onClick={() => onNavigatePublic('find-screening')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    publicRoute === 'find-screening'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{t('navFindScreening', 'Find Screening Near Me')}</span>
                </button>

                <button
                  onClick={() => onNavigatePublic('learn')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    publicRoute === 'learn'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('navLearn', 'Learn About Screening')}</span>
                </button>

                <button
                  onClick={() => onNavigatePublic('get-screened')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    publicRoute === 'get-screened'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('navPractice', 'Sample Eye Check')}</span>
                </button>

                <button
                  onClick={() => onNavigatePublic('explore-demo')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    publicRoute === 'explore-demo'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#DB2777]" />
                  <span>{t('ctaSeePracticeCheck', 'Explore Demo')}</span>
                </button>
              </>
            ) : (
              // PROVIDER NAVIGATION
              <>
                <button
                  onClick={() => onNavigateProvider('dashboard')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all ${
                    providerRoute === 'dashboard'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => onNavigateProvider('camp-mode')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    providerRoute === 'camp-mode'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Tent className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Camp Mode</span>
                </button>

                <button
                  onClick={() => onNavigateProvider('start-screening')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    providerRoute === 'start-screening'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-stone-500" />
                  <span>Start Screening</span>
                </button>

                <button
                  onClick={() => onNavigateProvider('review-queue')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    providerRoute === 'review-queue'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-stone-500" />
                  <span>Review Queue</span>
                </button>

                <button
                  onClick={() => onNavigateProvider('batch-screening')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    providerRoute === 'batch-screening'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  <span>Batch Screening</span>
                </button>

                <button
                  onClick={() => onNavigateProvider('referrals')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    providerRoute === 'referrals'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-[#DB2777]" />
                  <span>Referrals</span>
                </button>

                <button
                  onClick={() => onNavigateProvider('analytics')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    providerRoute === 'analytics'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => onNavigateProvider('technology')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    providerRoute === 'technology'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                  title="Architecture & Engineering FAQ"
                >
                  <Cpu className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden xl:inline">Technology</span>
                </button>

                <button
                  onClick={() => onNavigateProvider('settings')}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    providerRoute === 'settings'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </>
            )}
          </nav>

          {/* Right Action & CTA Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {!isProviderMode ? (
              // PUBLIC CTAs: For Providers & Try Demo
              <>
                <button
                  id="for-providers-header-cta"
                  onClick={onSwitchToProvider}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-900 transition-all shadow-2xs"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{t('navForProviders', 'For Providers')}</span>
                </button>

                <button
                  id="try-demo-header-cta"
                  onClick={onTryDemo}
                  className="bg-[#1C1917] hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FED7AA]" />
                  <span>Try Demo</span>
                </button>
              </>
            ) : (
              // PROVIDER CTAs & Controls
              <>
                {/* Switch to Public Link */}
                <button
                  onClick={onSwitchToPublic}
                  className="hidden xl:flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 font-medium transition-colors mr-1"
                  title="Switch to Public View"
                >
                  <span>Public View</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {/* Role Switcher Pill */}
                <button
                  onClick={onOpenRoleModal}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-700 hover:border-stone-300 hover:bg-white transition-colors"
                  title="Switch user perspective / role"
                >
                  <Users className="w-3.5 h-3.5 text-stone-500" />
                  <span>{roleLabels[currentRole]}</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {/* Quick Demo Case Selector */}
                <div className="relative hidden xl:block">
                  <select
                    id="quick-case-presets-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        onSelectPreset(e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="text-xs bg-white border border-stone-200 text-stone-700 rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:border-stone-400 shadow-2xs"
                  >
                    <option value="" disabled>
                      ⚡ Demo Cases...
                    </option>
                    <option value="case-normal-01">Case 1: Normal (Grade 0)</option>
                    <option value="case-mild-02">Case 2: Mild (Grade 1)</option>
                    <option value="case-moderate-dme-03">Case 3: Moderate + DME (Grade 2)</option>
                    <option value="case-severe-04">Case 4: Severe 4:2:1 (Grade 3)</option>
                    <option value="case-pdr-05">Case 5: High-Risk PDR (Grade 4)</option>
                  </select>
                </div>

                {hasActiveResult && (
                  <button
                    onClick={onViewResults}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8] text-xs font-bold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#DB2777]" />
                    <span>Active Result</span>
                  </button>
                )}
              </>
            )}

            {/* Accessibility & Language Menu */}
            <AccessibilityMenu
              settings={accessibilitySettings}
              onUpdateSettings={onUpdateAccessibilitySettings}
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />

            {/* Auth / Profile Button */}
            {userEmail ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-800">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline font-medium truncate max-w-[100px]">
                  {userEmail.split('@')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-200/80 space-y-1.5 text-xs animate-in fade-in duration-150">
            {/* Perspective Switch Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 mb-2">
              <span className="font-semibold text-stone-800">
                {isProviderMode ? 'Provider Experience' : 'Public Patient View'}
              </span>
              <button
                onClick={() => {
                  if (isProviderMode) {
                    onSwitchToPublic();
                  } else {
                    onSwitchToProvider();
                  }
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-[#EA580C] hover:underline"
              >
                Switch to {isProviderMode ? 'Public' : 'Provider'}
              </button>
            </div>

            {!isProviderMode ? (
              // Mobile Public Routes
              <>
                <button
                  onClick={() => {
                    onNavigatePublic('find-screening');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl font-medium text-stone-800 hover:bg-stone-100 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-[#EA580C]" />
                  <span>Find Screening Near Me</span>
                </button>
                <button
                  onClick={() => {
                    onNavigatePublic('learn');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl font-medium text-stone-800 hover:bg-stone-100 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-stone-500" />
                  <span>Learn About Screening</span>
                </button>
                <button
                  onClick={() => {
                    onNavigatePublic('get-screened');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl font-medium text-stone-800 hover:bg-stone-100 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-stone-500" />
                  <span>Sample Eye Check</span>
                </button>
                <button
                  onClick={() => {
                    onNavigatePublic('explore-demo');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl font-medium text-stone-800 hover:bg-stone-100 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#DB2777]" />
                  <span>Explore Demo</span>
                </button>
                <div className="pt-2 border-t border-stone-200 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onSwitchToProvider();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold hover:bg-stone-50"
                  >
                    For Providers →
                  </button>
                  <button
                    onClick={() => {
                      onTryDemo();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 rounded-xl bg-[#1C1917] text-white font-semibold hover:bg-stone-800"
                  >
                    Try Demo
                  </button>
                </div>
              </>
            ) : (
              // Mobile Provider Routes
              <>
                <button
                  onClick={() => {
                    onNavigateProvider('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FFF7ED]"
                >
                  Provider Dashboard
                </button>
                <button
                  onClick={() => {
                    onNavigateProvider('camp-mode');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#EA580C] hover:bg-[#FFF7ED] flex items-center gap-2"
                >
                  <Tent className="w-4 h-4 text-[#EA580C]" />
                  <span>Screening Camp Mode</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateProvider('start-screening');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#EA580C] hover:bg-[#FFF7ED] flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>Start Screening</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateProvider('review-queue');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#EA580C] hover:bg-[#FFF7ED] flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Review Queue</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateProvider('batch-screening');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#EA580C] hover:bg-[#FFF7ED] flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Batch Screening</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateProvider('referrals');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#DB2777] hover:bg-[#FDF2F8] flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Referrals</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateProvider('analytics');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FAF8F6] flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-[#EA580C]" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateProvider('technology');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FAF8F6] flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-[#EA580C]" />
                  <span>Technology & SaMD FAQ</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateProvider('settings');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FAF8F6] flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-[#6E5C5F]" />
                  <span>Settings & Roles</span>
                </button>

                <div className="pt-2 border-t border-[#EFE4DC] space-y-1">
                  <button
                    onClick={() => {
                      onOpenRoleModal();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FAF8F6] flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Select Role ({roleLabels[currentRole]})</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenBatchModal();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FAF8F6] flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#DB2777]" />
                    <span>Batch Image Screening</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenGuide();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FAF8F6] flex items-center gap-2"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Image Capture Guidelines</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
