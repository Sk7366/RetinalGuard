import React, { useEffect, useState } from 'react';
import { AblationView } from './components/AblationView';
import { ArchitectureView } from './components/ArchitectureView';
import { AuthModal } from './components/AuthModal';
import { BatchScreeningModal } from './components/BatchScreeningModal';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { FindScreeningSection } from './components/FindScreeningSection';
import { Footer } from './components/Footer';
import { HistoryView } from './components/HistoryView';
import { ImageCaptureGuideModal } from './components/ImageCaptureGuideModal';
import { LandingHero } from './components/LandingHero';
import { Navbar } from './components/Navbar';
import { ProviderAnalytics } from './components/ProviderAnalytics';
import { ProviderDashboard } from './components/ProviderDashboard';
import { ProviderReviewQueue } from './components/ProviderReviewQueue';
import { ProviderSettings } from './components/ProviderSettings';
import { PublicExploreDemo } from './components/PublicExploreDemo';
import { PublicGetScreened } from './components/PublicGetScreened';
import { PublicHowItHelps } from './components/PublicHowItHelps';
import { PublicLearn } from './components/PublicLearn';
import { ResultsView } from './components/ResultsView';
import { RoleModal } from './components/RoleModal';
import { ScreeningCampFlow } from './components/ScreeningCampFlow';
import { ScreeningFlow } from './components/ScreeningFlow';
import { TechnicalFaqModal } from './components/TechnicalFaqModal';
import { PRESET_CASES, PresetPatientCase } from './data/sampleCases';
import { LanguageCode } from './i18n/translations';
import {
  AccessibilitySettings,
  MultimodalTriageResult,
  ProviderRoute,
  PublicRoute,
  UserRole,
} from './types';

export default function App() {
  // Navigation State
  const [isProviderMode, setIsProviderMode] = useState<boolean>(false);
  const [publicRoute, setPublicRoute] = useState<PublicRoute>('overview');
  const [providerRoute, setProviderRoute] = useState<ProviderRoute>('dashboard');
  const [isViewingActiveResult, setIsViewingActiveResult] = useState<boolean>(false);

  // Authentication state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // User Role state (supports 5 personas)
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Community & Tech Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isTechFaqOpen, setIsTechFaqOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Accessibility & Localization state
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
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
      if (!hash) return;

      if (hash.startsWith('provider/')) {
        const pRoute = hash.replace('provider/', '') as ProviderRoute;
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
          setIsProviderMode(true);
          setProviderRoute(pRoute);
          setIsViewingActiveResult(false);
          if (currentRole === 'public') {
            setCurrentRole('provider');
          }
        }
      } else if (hash.startsWith('public/')) {
        const pubRoute = hash.replace('public/', '') as PublicRoute;
        const validPublicRoutes: PublicRoute[] = [
          'overview',
          'how-it-helps',
          'get-screened',
          'find-screening',
          'learn',
          'explore-demo',
          'research',
        ];
        if (validPublicRoutes.includes(pubRoute)) {
          setIsProviderMode(false);
          setPublicRoute(pubRoute);
          setIsViewingActiveResult(false);
        }
      } else if (hash === 'results') {
        setIsViewingActiveResult(true);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRole]);

  // Sync state to URL hash
  const updateHash = (mode: 'public' | 'provider', route: string) => {
    window.location.hash = `${mode}/${route}`;
  };

  // Navigation handlers
  const navigatePublic = (route: PublicRoute) => {
    setIsProviderMode(false);
    setPublicRoute(route);
    setIsViewingActiveResult(false);
    updateHash('public', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateProvider = (route: ProviderRoute) => {
    setIsProviderMode(true);
    setProviderRoute(route);
    setIsViewingActiveResult(false);
    if (currentRole === 'public') {
      setCurrentRole('provider');
    }
    updateHash('provider', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchToProvider = () => {
    setIsProviderMode(true);
    if (currentRole === 'public') {
      setCurrentRole('provider');
    }
    navigateProvider('dashboard');
  };

  const switchToPublic = () => {
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

  // Handle role selection
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'public') {
      setIsProviderMode(false);
      navigatePublic('overview');
    } else {
      setIsProviderMode(true);
      navigateProvider('dashboard');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#FFFDFB] text-[#2E2628] antialiased ${
        accessibilitySettings.highContrast ? 'contrast-125 saturate-150' : ''
      } ${accessibilitySettings.largeText ? 'text-lg' : ''}`}
    >
      {/* Primary Navigation Header */}
      <Navbar
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
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onSelectPreset={handleSelectPreset}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        accessibilitySettings={accessibilitySettings}
        onUpdateAccessibilitySettings={handleUpdateAccessibilitySettings}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        userEmail={userEmail}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* If user clicked to view active result */}
        {isViewingActiveResult && activeResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-[#EFE4DC] text-xs">
              <span className="font-semibold text-[#6E5C5F]">
                Viewing Inspection Result: <span className="text-[#2E2628] font-bold">{activeResult.patientId}</span>
              </span>
              <button
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
                ← Return to {isProviderMode ? 'Provider View' : 'Public View'}
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
                if (isProviderMode) {
                  navigateProvider('research');
                } else {
                  navigatePublic('research');
                }
              }}
            />
          </div>
        ) : !isProviderMode ? (
          /* =========================================================================
             PUBLIC ROUTES
             ========================================================================= */
          <>
            {/* PUBLIC: Overview */}
            {publicRoute === 'overview' && (
              <LandingHero
                onStartScreening={() => {
                  setActivePreset(null);
                  navigatePublic('get-screened');
                }}
                onSelectPreset={handleSelectPreset}
                onViewAblation={() => navigatePublic('research')}
                onViewArchitecture={() => {
                  setIsProviderMode(true);
                  navigateProvider('technology');
                }}
                onViewInterview={() => {
                  setIsProviderMode(true);
                  navigateProvider('technology');
                }}
                onStartCampMode={() => {
                  setIsProviderMode(true);
                  navigateProvider('camp-mode');
                }}
                onOpenBatchScreening={() => setIsBatchModalOpen(true)}
                onOpenGuideModal={() => setIsGuideOpen(true)}
                onOpenTechFaqModal={() => setIsTechFaqOpen(true)}
                onOpenRoleModal={() => setIsRoleModalOpen(true)}
                userRole={currentRole}
              />
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
                onOpenFaq={() => setIsTechFaqOpen(true)}
              />
            )}

            {/* PUBLIC: Explore Demo */}
            {publicRoute === 'explore-demo' && (
              <PublicExploreDemo
                onSelectCaseForFullInspection={handleSelectPreset}
                onGetScreened={() => navigatePublic('get-screened')}
              />
            )}

            {/* PUBLIC: Research */}
            {publicRoute === 'research' && <AblationView />}
          </>
        ) : (
          /* =========================================================================
             PROVIDER ROUTES
             ========================================================================= */
          <>
            {/* PROVIDER: Dashboard */}
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
                userRole={currentRole}
              />
            )}

            {/* PROVIDER: Screening Camp Mode */}
            {providerRoute === 'camp-mode' && (
              <ScreeningCampFlow
                onComplete={handleScreeningComplete}
                onExitCampMode={() => navigateProvider('dashboard')}
              />
            )}

            {/* PROVIDER: Start Screening / Screenings */}
            {(providerRoute === 'start-screening' || providerRoute === 'screenings') && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#EFE4DC] shadow-xs flex-wrap gap-3">
                  <div>
                    <h2 className="text-base font-bold text-[#2E2628]">Clinical Examination Encounter</h2>
                    <p className="text-xs text-[#6E5C5F]">Fundus photography, OCT B-scans, and clinical laboratory input with real-time explainability.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateProvider('camp-mode')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFEDD5] transition-colors"
                    >
                      Switch to Camp Mode
                    </button>
                    <button
                      onClick={() => setIsBatchModalOpen(true)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FAF8F6] text-[#2E2628] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors"
                    >
                      Batch Triage Mode
                    </button>
                    <button
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

            {/* PROVIDER: Review Queue */}
            {providerRoute === 'review-queue' && (
              <ProviderReviewQueue
                history={history}
                onSelectResult={(selected) => {
                  setActiveResult(selected);
                  setIsViewingActiveResult(true);
                  window.location.hash = 'results';
                }}
              />
            )}

            {/* PROVIDER: Referrals */}
            {providerRoute === 'referrals' && (
              <HistoryView
                history={history}
                defaultSubTab="referrals"
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

            {/* PROVIDER: Cases (Audit History) */}
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

            {/* PROVIDER: Analytics */}
            {providerRoute === 'analytics' && <ProviderAnalytics history={history} />}

            {/* PROVIDER: Research */}
            {providerRoute === 'research' && <AblationView />}

            {/* PROVIDER: Technology (Inference Pipeline, SaMD FAQ, MLflow) */}
            {providerRoute === 'technology' && <ArchitectureView />}

            {/* PROVIDER: Settings */}
            {providerRoute === 'settings' && (
              <ProviderSettings
                currentRole={currentRole}
                onSelectRole={handleSelectRole}
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

      {/* Premium Dark Research Footer */}
      <Footer
        onNavigatePublic={navigatePublic}
        onNavigateProvider={navigateProvider}
      />

      {/* Small Clinical Decision Support Notice in Bottom Right */}
      <DisclaimerBanner />

      {/* Modals Suite */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(email) => setUserEmail(email)}
      />

      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
      />

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
