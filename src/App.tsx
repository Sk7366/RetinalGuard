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
import { PatientScreeningResultView } from './components/PatientScreeningResultView';
import { ScreeningBookingFlow } from './components/ScreeningBookingFlow';
import { ProviderAppointmentsView } from './components/ProviderAppointmentsView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { HelpSupportModal } from './components/HelpSupportModal';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ResearchWorkspaceView } from './components/ResearchWorkspaceView';
import { ResearcherSignIn } from './components/ResearcherSignIn';
import { ScreeningCampFlow } from './components/ScreeningCampFlow';
import { ScreeningFlow } from './components/ScreeningFlow';
import { TechnicalFaqModal } from './components/TechnicalFaqModal';
import { PRESET_CASES, PresetPatientCase } from './data/sampleCases';
import { I18nProvider, useTranslation } from './i18n/I18nContext';
import { VoiceReaderBar } from './components/VoiceReaderBar';
import { SimplifiedPatientHome } from './components/SimplifiedPatientHome';
import { WelcomeModal } from './components/WelcomeModal';
import { PatientAuthModal } from './components/PatientAuthModal';
import { AccessibilitySettingsModal } from './components/AccessibilitySettingsModal';
import { PatientReportsView } from './components/PatientReportsView';
import { PatientJourneyView } from './components/PatientJourneyView';
import { PatientProfileView } from './components/PatientProfileView';
import { ScreeningHelperVerificationGate } from './components/ScreeningHelperVerificationGate';
import { accessibilityService } from './services/accessibilityService';
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
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '').trim() : '';
    if (hash.startsWith('researcher/')) return 'researcher';
    if (hash.startsWith('helper/') || hash.startsWith('provider/')) return 'helper';
    return 'patient';
  });

  // Navigation State
  const [isProviderMode, setIsProviderMode] = useState<boolean>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '').trim() : '';
    return hash.startsWith('helper/') || hash.startsWith('provider/') || hash.startsWith('researcher/');
  });
  const [publicRoute, setPublicRoute] = useState<PublicRoute>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '').trim() : '';
    if (hash.startsWith('public/')) {
      const p = hash.replace('public/', '') as PublicRoute;
      return p || 'overview';
    }
    return 'overview';
  });
  const [providerRoute, setProviderRoute] = useState<ProviderRoute>('dashboard');
  const [isViewingActiveResult, setIsViewingActiveResult] = useState<boolean>(false);

  // Authentication & Role modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [isPatientAuthModalOpen, setIsPatientAuthModalOpen] = useState<boolean>(false);
  const [patientAuthInitialTab, setPatientAuthInitialTab] = useState<'login' | 'register'>('register');
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState<boolean>(false);

  // Community & Tech Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isTechFaqOpen, setIsTechFaqOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Voice Guidance state (narrates screening step-by-step for helpers)
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(true);

  // Accessibility & Localization state from I18nContext
  const { language: currentLanguage, setLanguage: setCurrentLanguage, t } = useTranslation();
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    offlineMode: false,
    textToSpeech: false,
  });

  useEffect(() => {
    const unsub = accessibilityService.subscribe((config) => {
      setAccessibilitySettings({
        highContrast: config.highContrast,
        largeText: config.textSize !== 'standard',
        reduceMotion: config.reduceMotion,
        offlineMode: false,
        textToSpeech: config.readAloud,
      });
    });
    return () => unsub();
  }, []);

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
      const activeUser = authService.getCurrentUser();
      const authorizedRoles = activeUser.authorizedRoles || [activeUser.role];
      const hasStaffAccess = authorizedRoles.some((r) => ['helper', 'technician', 'provider', 'admin'].includes(r));
      const hasResearchAccess = authorizedRoles.includes('researcher') || activeUser.role === 'researcher';

      // Help route
      if (hash === 'help') {
        setIsHelpModalOpen(true);
        return;
      }

      // Direct /referrals or #referrals route support
      if (hash === 'referrals' || hash === '/referrals' || window.location.pathname === '/referrals') {
        if (!hasStaffAccess) {
          // If a patient attempts to access provider referrals, redirect to patient overview
          setExperience('patient');
          setIsProviderMode(false);
          setPublicRoute('overview');
          window.location.hash = 'public/overview';
          return;
        }
        setExperience('helper');
        setIsProviderMode(true);
        setProviderRoute('referrals');
        setIsViewingActiveResult(false);
        return;
      }

      // Default to Public Patient Overview if hash is empty or root
      if (!hash || hash === '' || hash === '/' || hash === 'public/overview' || hash === 'overview') {
        setExperience('patient');
        setIsProviderMode(false);
        setPublicRoute('overview');
        setIsViewingActiveResult(false);
        return;
      }

      if (hash.startsWith('helper/') || hash.startsWith('provider/')) {
        if (!hasStaffAccess) {
          // Block unauthorized access to helper/provider features for patient accounts
          setExperience('patient');
          setIsProviderMode(false);
          setPublicRoute('overview');
          window.location.hash = 'public/overview';
          return;
        }
        const pRoute = hash.replace(/^(helper|provider)\//, '') as ProviderRoute;
        const validProviderRoutes: ProviderRoute[] = [
          'dashboard',
          'camp-mode',
          'start-screening',
          'review-queue',
          'appointments',
          'batch-screening',
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
        if (!hasResearchAccess) {
          // Block unauthorized access to researcher features for patient accounts
          setExperience('patient');
          setIsProviderMode(false);
          setPublicRoute('overview');
          window.location.hash = 'public/overview';
          return;
        }
        const rSub = hash.replace('researcher/', '') as ProviderRoute;
        setExperience('researcher');
        setIsProviderMode(true);
        setProviderRoute(rSub || 'research');
        setIsViewingActiveResult(false);
      } else if (
        hash.startsWith('public/') ||
        [
          'overview',
          'why-screening',
          'how-it-works',
          'find-screening',
          'learn',
          'explore-demo',
          'get-screened',
          'my-screening',
          'my-reports',
          'profile',
        ].includes(hash)
      ) {
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
    const authorized = currentUser.authorizedRoles || [currentUser.role];
    if (route === 'research' || experience === 'researcher') {
      if (!authorized.includes('researcher') && currentUser.role !== 'researcher') {
        setIsRoleModalOpen(true);
        return;
      }
      setExperience('researcher');
      window.location.hash = `researcher/overview`;
    } else {
      if (!authorized.some((r) => ['helper', 'technician', 'provider', 'admin'].includes(r))) {
        setIsRoleModalOpen(true);
        return;
      }
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

  const switchToResearcher = () => {
    setExperience('researcher');
    setIsProviderMode(true);
    navigateProvider('research');
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
    if (isProviderMode) {
      setIsViewingActiveResult(true);
      window.location.hash = 'results';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      className="min-h-screen flex flex-col bg-[#FFFDF9] dark:bg-[#151014] text-[#2B2024] dark:text-[#FAF5F7] antialiased overflow-x-clip"
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
        onOpenRoleModal={() => {
          if (experience === 'patient') {
            setIsPatientAuthModalOpen(true);
          } else {
            setIsRoleModalOpen(true);
          }
        }}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onSelectPreset={handleSelectPreset}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        accessibilitySettings={accessibilitySettings}
        onUpdateAccessibilitySettings={handleUpdateAccessibilitySettings}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        userEmail={currentUser.email}
        onOpenAuth={() => {
          if (experience === 'patient') {
            setIsPatientAuthModalOpen(true);
          } else {
            setIsRoleModalOpen(true);
          }
        }}
        onLogout={handleLogout}
        onOpenAccessibilityModal={() => setIsAccessibilityModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* If user clicked to view active result */}
        {isViewingActiveResult && activeResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-[#EFE4DC] text-xs shadow-xs">
              <span className="font-semibold text-[#6F6267]">
                Viewing Inspection Result: <span className="text-[#2B2024] font-bold">{activeResult.patientId}</span>
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
                className="font-bold text-[#F05A28] hover:text-[#D84818] transition-colors"
              >
                ← Return to {isProviderMode ? (experience === 'researcher' ? 'Research Lab' : 'Helper Dashboard') : 'Patient View'}
              </button>
            </div>
            {isProviderMode ? (
              <ResultsView
                result={activeResult}
                onNewScreening={() => {
                  setActivePreset(null);
                  setIsViewingActiveResult(false);
                  navigateProvider('start-screening');
                }}
                onAblationClick={() => {
                  setIsViewingActiveResult(false);
                  navigateProvider('research');
                }}
              />
            ) : (
              <PatientScreeningResultView
                result={activeResult}
                onFindClinic={() => {
                  setIsViewingActiveResult(false);
                  navigatePublic('find-screening');
                }}
                onBookScreening={() => {
                  setIsViewingActiveResult(false);
                  navigatePublic('find-screening');
                }}
                onViewReport={() => {
                  setIsViewingActiveResult(false);
                  navigatePublic('my-reports');
                }}
                onNewScreening={() => {
                  setActivePreset(null);
                  setIsViewingActiveResult(false);
                  navigatePublic('get-screened');
                }}
              />
            )}
          </div>
        ) : experience === 'researcher' ? (
          /* =========================================================================
             RESEARCHER EXPERIENCE
             Researcher Sign In ↓ Research Workspace
             Keep Grad-CAM, SHAP, model evaluation, research metrics inside Researcher workspace.
             ========================================================================= */
          currentUser.role !== 'researcher' ? (
            <ResearcherSignIn
              onAuthenticate={(user) => {
                setCurrentUser(user);
                setExperience('researcher');
                setIsProviderMode(true);
                setProviderRoute('research');
                window.location.hash = 'researcher/overview';
              }}
              onCancel={() => {
                setExperience('patient');
                setIsProviderMode(false);
                setPublicRoute('overview');
                window.location.hash = 'public/overview';
              }}
            />
          ) : (
            <ResearchWorkspaceView
              initialTab={
                providerRoute === 'models'
                  ? 'models'
                  : providerRoute === 'datasets'
                  ? 'datasets'
                  : providerRoute === 'experiments'
                  ? 'experiments'
                  : providerRoute === 'evaluation'
                  ? 'evaluation'
                  : providerRoute === 'explainability'
                  ? 'explainability'
                  : providerRoute === 'model-versions'
                  ? 'model-versions'
                  : providerRoute === 'technology'
                  ? 'models'
                  : 'overview'
              }
              onNavigateTab={(tab) => {
                navigateProvider(tab as ProviderRoute);
              }}
              onSwitchWorkspace={() => setIsRoleModalOpen(true)}
              currentUser={currentUser}
            />
          )
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

            {/* PUBLIC: How It Works / Journey */}
            {(publicRoute === 'how-it-works' || publicRoute === 'my-screening') && (
              <PatientJourneyView
                currentUser={currentUser}
                onNavigateToFindScreening={() => navigatePublic('find-screening')}
                onNavigateToReports={() => navigatePublic('my-reports')}
              />
            )}

            {/* PUBLIC: My Reports */}
            {publicRoute === 'my-reports' && (
              <PatientReportsView
                currentUser={currentUser}
                onOpenScreeningJourney={() => navigatePublic('my-screening')}
                onFindScreening={() => navigatePublic('find-screening')}
              />
            )}

            {/* PUBLIC: Patient Profile */}
            {publicRoute === 'profile' && (
              <PatientProfileView
                currentUser={currentUser}
                onNavigateToFindScreening={() => navigatePublic('find-screening')}
                onNavigateToReports={() => navigatePublic('my-reports')}
                onNavigateToJourney={() => navigatePublic('my-screening')}
                onOpenAccessibility={() => setIsAccessibilityModalOpen(true)}
                onSwitchWorkspace={() => setIsRoleModalOpen(true)}
                onLogout={handleLogout}
              />
            )}

            {/* PUBLIC: Get your retina screened */}
            {publicRoute === 'get-screened' && (
              <PublicGetScreened
                onComplete={handleScreeningComplete}
                onFindClinic={() => navigatePublic('find-screening')}
                onBookScreening={() => navigatePublic('find-screening')}
                onViewReport={() => navigatePublic('my-reports')}
              />
            )}

            {/* PUBLIC: Find Screening Near Me & Booking Workflow */}
            {publicRoute === 'find-screening' && (
              <ScreeningBookingFlow
                onNavigateToScreening={() => navigatePublic('get-screened')}
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

            {/* PUBLIC: Research Link - Gated by Researcher Authentication */}
            {publicRoute === 'research' && (
              currentUser.role === 'researcher' ? (
                <ResearchWorkspaceView
                  initialTab="overview"
                  onSwitchWorkspace={() => setIsRoleModalOpen(true)}
                  currentUser={currentUser}
                />
              ) : (
                <ResearcherSignIn
                  onAuthenticate={(user) => {
                    setCurrentUser(user);
                    setExperience('researcher');
                    setIsProviderMode(true);
                    setProviderRoute('research');
                    window.location.hash = 'researcher/overview';
                  }}
                  onCancel={() => {
                    navigatePublic('overview');
                  }}
                />
              )
            )}
          </>
        ) : currentUser.role === 'helper' &&
          currentUser.verificationStatus !== 'Verified' &&
          currentUser.verificationStatus !== 'verified' ? (
          /* =========================================================================
             SCREENING HELPER RESTRICTED VERIFICATION GATE
             Only a VERIFIED Screening Helper can access the full helper workspace.
             ========================================================================= */
          <ScreeningHelperVerificationGate
            user={currentUser}
            onStatusUpdated={(updated) => {
              setCurrentUser(updated);
            }}
            onSwitchToPatient={() => {
              setExperience('patient');
              setIsProviderMode(false);
              setPublicRoute('overview');
              window.location.hash = 'public/overview';
            }}
          />
        ) : (
          /* =========================================================================
             SCREENING HELPER & CLINICAL WORKSPACE (VERIFIED ACCESS)
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
                currentUser={currentUser}
                onUserUpdated={(updated) => setCurrentUser(updated)}
              />
            )}

            {/* HELPER: Screening Appointments & Slot Management */}
            {providerRoute === 'appointments' && (
              <ProviderAppointmentsView
                onStartScreeningWithPatient={() => {
                  navigateProvider('start-screening');
                }}
                userRole={currentUser.role}
              />
            )}

            {/* HELPER: Screening Camp Outreach */}
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
                    <h2 className="text-base font-serif font-bold text-[#2B2024]">
                      {t("encounterTitle", "Screening Examination Encounter")}
                    </h2>
                    <p className="text-xs text-[#6F6267] mt-0.5">
                      {t("encounterDesc", "Non-mydriatic fundus capture with automated clarity assessment and optional OCT depth scanning.")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigateProvider('camp-mode')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#FED7AA] bg-[#FFE5D8] text-[#D84818] hover:bg-[#FFEDD5] transition-colors"
                    >
                      {t("campOfflineModeBtn", "Camp Offline Mode")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGuideOpen(true)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FAF8F6] text-[#2B2024] hover:border-[#F05A28] hover:text-[#F05A28] transition-colors"
                    >
                      {t("captureGuidelinesBtn", "Capture Guidelines")}
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

            {/* HELPER: Research (Gated by Researcher Authentication) */}
            {providerRoute === 'research' && (
              currentUser.role === 'researcher' ? (
                <ResearchWorkspaceView
                  onSwitchWorkspace={() => setIsRoleModalOpen(true)}
                  currentUser={currentUser}
                />
              ) : (
                <ResearcherSignIn
                  onAuthenticate={(user) => {
                    setCurrentUser(user);
                    setExperience('researcher');
                    setIsProviderMode(true);
                    setProviderRoute('research');
                    window.location.hash = 'researcher/overview';
                  }}
                  onCancel={() => {
                    navigateProvider('dashboard');
                  }}
                />
              )
            )}

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
        experience={experience}
        onNavigatePublic={navigatePublic}
        onNavigateProvider={navigateProvider}
      />

      {/* Small Clinical Decision Support Notice in Bottom Left */}
      <DisclaimerBanner />

      {/* Floating Voice Reader Bar when narration is playing */}
      <VoiceReaderBar />

      {/* Persistent, Context-Aware Voice Assistant (Bottom-Right) - Only for Helpers/Staff/Researchers, NEVER in Patient mode */}
      {experience !== 'patient' && (
        <VoiceAssistant
          role={currentUser.role}
          voiceGuidanceEnabled={voiceGuidanceEnabled}
          onToggleVoiceGuidance={setVoiceGuidanceEnabled}
          currentRoute={isProviderMode ? providerRoute : publicRoute}
        />
      )}

      {/* Patient Welcome & Voice-Guided Onboarding Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => {
          setIsWelcomeModalOpen(false);
          localStorage.setItem('retinaguard_welcomed_v2', 'true');
        }}
        onContinueAsPatient={() => {
          setIsWelcomeModalOpen(false);
          localStorage.setItem('retinaguard_welcomed_v2', 'true');
          navigatePublic('overview');
        }}
        onContinueAsHelper={() => {
          setIsWelcomeModalOpen(false);
          localStorage.setItem('retinaguard_welcomed_v2', 'true');
          setIsRoleModalOpen(true);
        }}
        onContinueAsResearcher={() => {
          setIsWelcomeModalOpen(false);
          localStorage.setItem('retinaguard_welcomed_v2', 'true');
          switchToResearcher();
        }}
      />

      {/* Patient Registration & OTP Verification Modal */}
      <PatientAuthModal
        isOpen={isPatientAuthModalOpen}
        onClose={() => setIsPatientAuthModalOpen(false)}
        onSuccess={(user) => {
          handleSuccessLogin(user);
          setIsPatientAuthModalOpen(false);
        }}
        initialTab={patientAuthInitialTab}
      />

      {/* Global Accessibility Settings Modal (Text size, contrast, color vision) */}
      <AccessibilitySettingsModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
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
