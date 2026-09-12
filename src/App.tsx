import React, { useEffect, useState } from 'react';
import { AblationView } from './components/AblationView';
import { ArchitectureView } from './components/ArchitectureView';
import { AuthModal } from './components/AuthModal';
import { BatchScreeningModal } from './components/BatchScreeningModal';
import { BatchScreeningView } from './components/BatchScreeningView';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { FindScreeningSection } from './components/FindScreeningSection';
import { Footer } from './components/Footer';
import { HistoryView } from './components/HistoryView';
import { ImageCaptureGuideModal } from './components/ImageCaptureGuideModal';
import { Navbar } from './components/Navbar';
import { ProviderAnalytics } from './components/ProviderAnalytics';
import { ProviderDashboard } from './components/ProviderDashboard';
import { ProviderReviewQueue } from './components/ProviderReviewQueue';
import { ProviderSettings } from './components/ProviderSettings';
import { PublicExploreDemo } from './components/PublicExploreDemo';
import { PublicGetScreened } from './components/PublicGetScreened';
import { PublicHowItHelps } from './components/PublicHowItHelps';
import { PublicLearn } from './components/PublicLearn';
import { ReferralsView } from './components/ReferralsView';
import { ResultsView } from './components/ResultsView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { HelpSupportModal } from './components/HelpSupportModal';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ResearchWorkspaceView } from './components/ResearchWorkspaceView';
import { ScreeningCampFlow } from './components/ScreeningCampFlow';
import { ScreeningFlow } from './components/ScreeningFlow';
import { TechnicalFaqModal } from './components/TechnicalFaqModal';
import { PRESET_CASES, PresetPatientCase } from './data/sampleCases';
import { I18nProvider, useTranslation } from './i18n/I18nContext';
import { VoiceReaderBar } from './components/VoiceReaderBar';
import { SimplifiedPatientHome } from './components/SimplifiedPatientHome';
import { authService } from './auth/authService';
import {
  AccessibilitySettings,
  AppExperience,
  MultimodalTriageResult,
  ProviderRoute,
  PublicRoute,
  User,
  UserRole,
} from './types';

function AppContent() {
  // Current logged in user (defaults to guest patient)
  const [currentUser, setCurrentUser] = useState<User>(() => authService.getCurrentUser());

  // App Experience: 'patient' (default) | 'helper' | 'researcher'
  const [experience, setExperience] = useState<AppExperience>(() => {
    const user = authService.getCurrentUser();
    if (user.role === 'researcher') return 'researcher';
    if (user.role === 'helper' || user.role === 'technician' || user.role === 'provider') return 'helper';
    return 'patient';
  });

  // Navigation State
  const [isProviderMode, setIsProviderMode] = useState<boolean>(() => {
    const user = authService.getCurrentUser();
    return user.role === 'helper' || user.role === 'provider' || user.role === 'technician' || user.role === 'researcher';
  });
  const [publicRoute, setPublicRoute] = useState<PublicRoute>('overview');
  const [providerRoute, setProviderRoute] = useState<ProviderRoute>('dashboard');
  const [isViewingActiveResult, setIsViewingActiveResult] = useState<boolean>(false);

  // Authentication & Role modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Community & Tech Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isTechFaqOpen, setIsTechFaqOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Voice Guidance state (narrates screening step-by-step for helpers)
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(true);

  // Accessibility & Localization state from I18nContext
  const { language: currentLanguage, setLanguage: setCurrentLanguage } = useTranslation();
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    offlineMode: false,
    textToSpeech: false,
  });

  const handleUpdateAccessibilitySettings = (updated: Partial<AccessibilitySettings>) => {
    setAccessibilitySettings((prev) => ({ ...prev, ...updated }));
  };

  // Initial history populated from benchmark cases
  const [history, setHistory] = useState<MultimodalTriageResult[]>(() =>
    PRESET_CASES.map((c) => c.expectedTriage)
  );

  // Active result defaulted to Case 3 (Moderate + DME)
  const [activeResult, setActiveResult] = useState<MultimodalTriageResult | null>(
    PRESET_CASES[2].expectedTriage
  );
  const [activePreset, setActivePreset] = useState<PresetPatientCase | null>(null);

  // Parse URL Hash on mount & respond to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();

      // Help route
      if (hash === 'help') {
        setIsHelpModalOpen(true);
        return;
      }

      // Direct /referrals or #referrals route support
      if (hash === 'referrals' || hash === '/referrals' || window.location.pathname === '/referrals') {
        setExperience('helper');
        setIsProviderMode(true);
        setProviderRoute('referrals');
        setIsViewingActiveResult(false);
        return;
      }

      if (!hash) return;

      if (hash.startsWith('helper/') || hash.startsWith('provider/')) {
        const pRoute = hash.replace(/^(helper|provider)\//, '') as ProviderRoute;
        const validProviderRoutes: ProviderRoute[] = [
          'dashboard',
          'camp-mode',
          'start-screening',
          'review-queue',
          'referrals',
          'analytics',
          'screenings',
          'cases',
          'research',
          'technology',
          'settings',
        ];
        if (validProviderRoutes.includes(pRoute)) {
          setExperience('helper');
          setIsProviderMode(true);
          setProviderRoute(pRoute);
          setIsViewingActiveResult(false);
        }
      } else if (hash.startsWith('researcher/')) {
        setExperience('researcher');
        setIsProviderMode(true);
        setProviderRoute('research');
        setIsViewingActiveResult(false);
      } else if (hash.startsWith('public/') || ['overview', 'why-screening', 'find-screening', 'learn', 'explore-demo', 'get-screened'].includes(hash)) {
        const pubRoute = (hash.startsWith('public/') ? hash.replace('public/', '') : hash) as PublicRoute;
        setExperience('patient');
        setIsProviderMode(false);
        setPublicRoute(pubRoute);
        setIsViewingActiveResult(false);
      } else if (hash === 'results') {
        setIsViewingActiveResult(true);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation handlers
  const navigatePublic = (route: PublicRoute) => {
    if (route === 'help') {
      setIsHelpModalOpen(true);
      return;
    }
    setExperience('patient');
    setIsProviderMode(false);
    setPublicRoute(route);
    setIsViewingActiveResult(false);
    window.location.hash = `public/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateProvider = (route: ProviderRoute) => {
    if (route === 'help') {
      setIsHelpModalOpen(true);
      return;
    }
    if (route === 'research' || experience === 'researcher') {
      setExperience('researcher');
      window.location.hash = `researcher/overview`;
    } else {
      setExperience('helper');
      window.location.hash = `helper/${route}`;
    }
    setIsProviderMode(true);
    setProviderRoute(route);
    setIsViewingActiveResult(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchToProvider = () => {
    setExperience('helper');
    setIsProviderMode(true);
    navigateProvider('dashboard');
  };

  const switchToPublic = () => {
    setExperience('patient');
    setIsProviderMode(false);
    navigatePublic('overview');
  };

  // Preset selection handler
  const handleSelectPreset = (caseId: string) => {
    const found = PRESET_CASES.find((c) => c.id === caseId);
    if (found) {
      setActivePreset(found);
      setActiveResult(found.expectedTriage);
      setIsViewingActiveResult(true);
      window.location.hash = 'results';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Try Demo CTA Handler
  const handleTryDemo = () => {
    handleSelectPreset('case-moderate-dme-03');
  };

  // Screening completion
  const handleScreeningComplete = (result: MultimodalTriageResult) => {
    setActiveResult(result);
    setHistory((prev) => [result, ...prev]);
    setIsViewingActiveResult(true);
    window.location.hash = 'results';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle successful login from RoleSelectionModal
  const handleSuccessLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'researcher') {
      setExperience('researcher');
      setIsProviderMode(true);
      navigateProvider('research');
    } else if (user.role === 'helper' || user.role === 'technician' || user.role === 'provider') {
      setExperience('helper');
      setIsProviderMode(true);
      navigateProvider('dashboard');
    } else {
      setExperience('patient');
      setIsProviderMode(false);
      navigatePublic('overview');
    }
  };

  // Logout handler
  const handleLogout = () => {
    const guest = authService.logout();
    setCurrentUser(guest);
    setExperience('patient');
    setIsProviderMode(false);
    navigatePublic('overview');
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#FFFDFB] text-[#2E2628] antialiased ${
        accessibilitySettings.highContrast ? 'contrast-125 saturate-150' : ''
      } ${accessibilitySettings.largeText ? 'text-lg' : ''}`}
    >
      {/* Primary Navigation Header */}
      <Navbar
        experience={experience}
        isProviderMode={isProviderMode}
        publicRoute={publicRoute}
        providerRoute={providerRoute}
        onNavigatePublic={navigatePublic}
        onNavigateProvider={navigateProvider}
        onSwitchToProvider={switchToProvider}
        onSwitchToPublic={switchToPublic}
        onTryDemo={handleTryDemo}
        hasActiveResult={activeResult !== null}
        onViewResults={() => {
          setIsViewingActiveResult(true);
          window.location.hash = 'results';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentRole={currentUser.role}
        currentUser={currentUser}
        onSelectRole={(role) => {
          const updated = authService.switchRole(role);
          handleSuccessLogin(updated);
        }}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onSelectPreset={handleSelectPreset}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        accessibilitySettings={accessibilitySettings}
        onUpdateAccessibilitySettings={handleUpdateAccessibilitySettings}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        userEmail={currentUser.email}
        onOpenAuth={() => setIsRoleModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* If user clicked to view active result */}
        {isViewingActiveResult && activeResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-[#EFE4DC] text-xs shadow-xs">
              <span className="font-semibold text-[#6E5C5F]">
                Viewing Inspection Result: <span className="text-[#2E2628] font-bold">{activeResult.patientId}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsViewingActiveResult(false);
                  if (isProviderMode) {
                    navigateProvider(providerRoute);
                  } else {
                    navigatePublic(publicRoute);
                  }
                }}
                className="font-bold text-[#EA580C] hover:underline"
              >
                ← Return to {isProviderMode ? (experience === 'researcher' ? 'Research Lab' : 'Helper Dashboard') : 'Patient View'}
              </button>
            </div>
            <ResultsView
              result={activeResult}
              onNewScreening={() => {
                setActivePreset(null);
                setIsViewingActiveResult(false);
                if (isProviderMode) {
                  navigateProvider('start-screening');
                } else {
                  navigatePublic('get-screened');
                }
              }}
              onAblationClick={() => {
                setIsViewingActiveResult(false);
                navigateProvider('research');
              }}
            />
          </div>
        ) : experience === 'researcher' ? (
          /* =========================================================================
             RESEARCHER EXPERIENCE
             ========================================================================= */
          <ResearchWorkspaceView />
        ) : !isProviderMode ? (
          /* =========================================================================
             PUBLIC PATIENT EXPERIENCE (DEFAULT)
             ========================================================================= */
          <>
            {/* PUBLIC: Overview - Simplified Patient & Community Journey */}
            {publicRoute === 'overview' && (
              <SimplifiedPatientHome
                onGoToSampleCheck={() => {
                  setActivePreset(null);
                  navigatePublic('get-screened');
                }}
                onSwitchToProviderPortal={switchToProvider}
                isHighContrast={accessibilitySettings.highContrast}
                onToggleHighContrast={() =>
                  handleUpdateAccessibilitySettings({
                    highContrast: !accessibilitySettings.highContrast,
                  })
                }
                onSetTextSize={(size) =>
                  handleUpdateAccessibilitySettings({
                    largeText: size !== 'standard',
                  })
                }
                currentTextSize={accessibilitySettings.largeText ? 'large' : 'standard'}
              />
            )}

            {/* PUBLIC: Why Screening? */}
            {publicRoute === 'why-screening' && (
              <div className="space-y-6">
                <PublicLearn
                  onGetScreened={() => navigatePublic('get-screened')}
                  onOpenFaq={() => setIsHelpModalOpen(true)}
                />
              </div>
            )}

            {/* PUBLIC: How It Helps */}
            {publicRoute === 'how-it-helps' && (
              <PublicHowItHelps
                onGetScreened={() => navigatePublic('get-screened')}
                onTryDemo={handleTryDemo}
              />
            )}

            {/* PUBLIC: Get your retina screened */}
            {publicRoute === 'get-screened' && (
              <PublicGetScreened
                onComplete={handleScreeningComplete}
                onFindClinic={() => navigatePublic('find-screening')}
              />
            )}

            {/* PUBLIC: Find Screening Near Me */}
            {publicRoute === 'find-screening' && (
              <FindScreeningSection
                onStartDemoScreening={() => navigatePublic('get-screened')}
              />
            )}

            {/* PUBLIC: Learn About Screening */}
            {publicRoute === 'learn' && (
              <PublicLearn
                onGetScreened={() => navigatePublic('get-screened')}
                onOpenFaq={() => setIsHelpModalOpen(true)}
              />
            )}

            {/* PUBLIC: Explore Demo */}
            {publicRoute === 'explore-demo' && (
              <PublicExploreDemo
                onSelectCaseForFullInspection={handleSelectPreset}
                onGetScreened={() => navigatePublic('get-screened')}
              />
            )}

            {/* PUBLIC: Research Link */}
            {publicRoute === 'research' && <ResearchWorkspaceView />}
          </>
        ) : (
          /* =========================================================================
             SCREENING HELPER & CLINICAL WORKSPACE
             ========================================================================= */
          <>
            {/* HELPER: Dashboard */}
            {providerRoute === 'dashboard' && (
              <ProviderDashboard
                history={history}
                onNavigate={(route) => navigateProvider(route as ProviderRoute)}
                onSelectResult={(selected) => {
                  setActiveResult(selected);
                  setIsViewingActiveResult(true);
                  window.location.hash = 'results';
                }}
                onNewScreening={() => {
                  setActivePreset(null);
                  navigateProvider('start-screening');
                }}
                onStartCamp={() => {
                  navigateProvider('camp-mode');
                }}
                onOpenBatch={() => setIsBatchModalOpen(true)}
                userRole={currentUser.role}
              />
            )}

            {/* HELPER: Screening Camp Mode */}
            {providerRoute === 'camp-mode' && (
              <ScreeningCampFlow
                onComplete={handleScreeningComplete}
                onExitCampMode={() => navigateProvider('dashboard')}
              />
            )}

            {/* HELPER: Start Screening / Screenings */}
            {(providerRoute === 'start-screening' || providerRoute === 'screenings') && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE4DC] shadow-xs flex-wrap gap-3">
                  <div>
                    <h2 className="text-base font-serif font-bold text-[#2E2628]">
                      Screening Examination Encounter
                    </h2>
                    <p className="text-xs text-[#6E5C5F] mt-0.5">
                      Non-mydriatic fundus capture with automated clarity assessment and optional OCT depth scanning.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigateProvider('camp-mode')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFEDD5] transition-colors"
                    >
                      Camp Offline Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGuideOpen(true)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FAF8F6] text-[#2E2628] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors"
                    >
                      Capture Guidelines
                    </button>
                  </div>
                </div>

                <ScreeningFlow
                  key={activePreset ? activePreset.id : 'provider-screening'}
                  initialPreset={activePreset}
                  onComplete={handleScreeningComplete}
                />
              </div>
            )}

            {/* HELPER: Review Queue */}
            {providerRoute === 'review-queue' && (
              <ReviewQueueView
                history={history}
                onSelectCase={(selected) => {
                  setActiveResult(selected);
                  setIsViewingActiveResult(true);
                  window.location.hash = 'results';
                }}
                onNavigateStartScreening={() => {
                  setActivePreset(null);
                  navigateProvider('start-screening');
                }}
              />
            )}

            {/* HELPER: Batch Screening Architecture */}
            {providerRoute === 'batch-screening' && (
              <BatchScreeningView
                onSelectResult={(selected) => {
                  setActiveResult(selected);
                  setIsViewingActiveResult(true);
                  window.location.hash = 'results';
                }}
                onNavigateStartScreening={() => {
                  setActivePreset(null);
                  navigateProvider('start-screening');
                }}
              />
            )}

            {/* HELPER: Referrals */}
            {providerRoute === 'referrals' && (
              <ReferralsView
                history={history}
                onSelectResult={(selected) => {
                  setActiveResult(selected);
                  setIsViewingActiveResult(true);
                  window.location.hash = 'results';
                }}
                onNavigateStartScreening={() => {
                  setActivePreset(null);
                  navigateProvider('start-screening');
                }}
              />
            )}

            {/* HELPER: Cases (Audit History) */}
            {providerRoute === 'cases' && (
              <HistoryView
                history={history}
                defaultSubTab="screenings"
                onSelectResult={(selected) => {
                  setActiveResult(selected);
                  setIsViewingActiveResult(true);
                  window.location.hash = 'results';
                }}
                onNewScreening={() => {
                  setActivePreset(null);
                  navigateProvider('start-screening');
                }}
              />
            )}

            {/* HELPER: Analytics */}
            {providerRoute === 'analytics' && <ProviderAnalytics history={history} />}

            {/* HELPER: Research */}
            {providerRoute === 'research' && <ResearchWorkspaceView />}

            {/* HELPER: Technology */}
            {providerRoute === 'technology' && <ArchitectureView />}

            {/* HELPER: Settings */}
            {providerRoute === 'settings' && (
              <ProviderSettings
                currentRole={currentUser.role}
                onSelectRole={(role) => {
                  const updated = authService.switchRole(role);
                  handleSuccessLogin(updated);
                }}
                onOpenRoleModal={() => setIsRoleModalOpen(true)}
                accessibilitySettings={accessibilitySettings}
                onUpdateAccessibilitySettings={handleUpdateAccessibilitySettings}
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
              />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigatePublic={navigatePublic}
        onNavigateProvider={navigateProvider}
      />

      {/* Small Clinical Decision Support Notice in Bottom Left */}
      <DisclaimerBanner />

      {/* Floating Voice Reader Bar when narration is playing */}
      <VoiceReaderBar />

      {/* Persistent, Context-Aware Voice Assistant (Bottom-Right) */}
      <VoiceAssistant
        role={currentUser.role}
        voiceGuidanceEnabled={voiceGuidanceEnabled}
        onToggleVoiceGuidance={setVoiceGuidanceEnabled}
        currentRoute={isProviderMode ? providerRoute : publicRoute}
      />

      {/* Role Selection Landing Modal (3 Clear Paths: Patient, Helper, Researcher) */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
      />

      {/* Universal Help & Support Modal */}
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        role={currentUser.role}
        onNavigate={(route) => {
          if (route === 'find-screening') {
            navigatePublic('find-screening');
          }
        }}
      />

      {/* Ancillary Modals Suite */}
      <BatchScreeningModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      <TechnicalFaqModal
        isOpen={isTechFaqOpen}
        onClose={() => setIsTechFaqOpen(false)}
      />

      <ImageCaptureGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
