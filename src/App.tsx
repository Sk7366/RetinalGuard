import React, { useState } from 'react';
import { AblationView } from './components/AblationView';
import { ArchitectureView } from './components/ArchitectureView';
import { AuthModal } from './components/AuthModal';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Footer } from './components/Footer';
import { HistoryView } from './components/HistoryView';
import { InterviewView } from './components/InterviewView';
import { LandingHero } from './components/LandingHero';
import { Navbar } from './components/Navbar';
import { ResultsView } from './components/ResultsView';
import { ScreeningFlow } from './components/ScreeningFlow';
import { PRESET_CASES, PresetPatientCase } from './data/sampleCases';
import { MultimodalTriageResult } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'landing' | 'screening' | 'results' | 'ablation' | 'architecture' | 'history' | 'interview'
  >('landing');

  // Authentication state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Initial history populated from benchmark cases
  const [history, setHistory] = useState<MultimodalTriageResult[]>(() =>
    PRESET_CASES.map((c) => c.expectedTriage)
  );

  // Active result defaulted to Case 3 (Moderate + DME) for instant inspection if desired
  const [activeResult, setActiveResult] = useState<MultimodalTriageResult | null>(
    PRESET_CASES[2].expectedTriage
  );

  const [activePreset, setActivePreset] = useState<PresetPatientCase | null>(null);

  // Handle preset selection from navbar or hero
  const handleSelectPreset = (caseId: string) => {
    const found = PRESET_CASES.find((c) => c.id === caseId);
    if (found) {
      setActivePreset(found);
      setActiveResult(found.expectedTriage);
      setActiveTab('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle screening completion
  const handleScreeningComplete = (result: MultimodalTriageResult) => {
    setActiveResult(result);
    setHistory((prev) => [result, ...prev]);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (tab: typeof activeTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFB] text-[#2E2628] antialiased">
      {/* Primary Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        hasActiveResult={activeResult !== null}
        onSelectPreset={handleSelectPreset}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        userEmail={userEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'landing' && (
          <LandingHero
            onStartScreening={() => {
              setActivePreset(null);
              navigateTo('screening');
            }}
            onSelectPreset={handleSelectPreset}
            onViewAblation={() => navigateTo('ablation')}
            onViewArchitecture={() => navigateTo('architecture')}
            onViewInterview={() => navigateTo('interview')}
          />
        )}

        {activeTab === 'screening' && (
          <ScreeningFlow
            key={activePreset ? activePreset.id : 'fresh-screening'}
            initialPreset={activePreset}
            onComplete={handleScreeningComplete}
          />
        )}

        {activeTab === 'results' && activeResult && (
          <ResultsView
            result={activeResult}
            onNewScreening={() => {
              setActivePreset(null);
              navigateTo('screening');
            }}
            onAblationClick={() => navigateTo('ablation')}
          />
        )}

        {activeTab === 'ablation' && <AblationView />}

        {activeTab === 'architecture' && <ArchitectureView />}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectResult={(selected) => {
              setActiveResult(selected);
              navigateTo('results');
            }}
            onNewScreening={() => {
              setActivePreset(null);
              navigateTo('screening');
            }}
          />
        )}

        {activeTab === 'interview' && <InterviewView />}
      </main>

      {/* Premium Dark Research Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Small Clinical Decision Support Notice in Bottom Right */}
      <DisclaimerBanner />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(email) => setUserEmail(email)}
      />
    </div>
  );
}
