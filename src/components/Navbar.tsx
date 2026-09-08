import React, { useState } from 'react';
import {
  Activity,
  BookOpen,
  Clock,
  Cpu,
  Eye,
  FileText,
  Layers,
  Sparkles,
  User,
  Menu,
  X,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'screening' | 'results' | 'ablation' | 'architecture' | 'history' | 'interview';
  setActiveTab: (tab: 'landing' | 'screening' | 'results' | 'ablation' | 'architecture' | 'history' | 'interview') => void;
  hasActiveResult: boolean;
  onSelectPreset: (caseId: string) => void;
  onOpenAuth: () => void;
  userEmail: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveResult,
  onSelectPreset,
  onOpenAuth,
  userEmail,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E3DDD9] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: RetinaGuard Logo */}
          <div className="flex items-center gap-3">
            <button
              id="navbar-brand-button"
              onClick={() => {
                setActiveTab('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs bg-gradient-to-br from-[#EA580C] to-[#DB2777] transition-transform group-hover:scale-105">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-xl tracking-tight bg-gradient-to-r from-[#EA580C] to-[#DB2777] bg-clip-text text-transparent">
                    RetinaGuard<span className="font-light opacity-60 ml-0.5 text-xs font-sans text-[#2E2628]">AI</span>
                  </span>
                </div>
                <p className="text-[10px] text-[#6E5C5F] font-normal hidden sm:block">
                  Multimodal Retinopathy & DME Screening
                </p>
              </div>
            </button>
          </div>

          {/* Center/Right Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs lg:text-sm font-medium">
            <button
              onClick={() => {
                setActiveTab('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'landing'
                  ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
                  : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FFF7ED]/50'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('screening')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'screening'
                  ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
                  : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FFF7ED]/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Screening</span>
            </button>

            {hasActiveResult && (
              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'results'
                    ? 'bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8]'
                    : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FDF2F8]/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#DB2777]" />
                <span>Results</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('ablation')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ablation'
                  ? 'bg-gradient-to-r from-[#FFF7ED] to-[#FDF2F8] text-[#9D174D] border border-[#FDBA74]'
                  : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FFF7ED]/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Research</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
                  : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FFF7ED]/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Technology</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8]'
                  : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FDF2F8]/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#DB2777]" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'interview'
                  ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
                  : 'text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FFF7ED]/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Engineering FAQ</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Case selector for desktop */}
            <div className="relative hidden xl:block">
              <select
                id="quick-case-presets-select"
                onChange={(e) => {
                  if (e.target.value) {
                    onSelectPreset(e.target.value);
                  }
                }}
                defaultValue=""
                className="text-xs bg-[#FFFDFB] border border-[#EFE4DC] text-[#2E2628] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-[#EA580C]"
              >
                <option value="" disabled>
                  ⚡ Load Demo Case...
                </option>
                <option value="case-normal-01">Case 1: Normal (Grade 0)</option>
                <option value="case-mild-02">Case 2: Mild (Grade 1)</option>
                <option value="case-moderate-dme-03">Case 3: Moderate + DME (Grade 2)</option>
                <option value="case-severe-04">Case 4: Severe 4:2:1 (Grade 3)</option>
                <option value="case-pdr-05">Case 5: High-Risk PDR (Grade 4)</option>
              </select>
            </div>

            {/* Auth / Profile Button */}
            {userEmail ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F6] border border-[#EFE4DC] text-xs text-[#2E2628]">
                <User className="w-3.5 h-3.5 text-[#EA580C]" />
                <span className="hidden sm:inline font-medium truncate max-w-[110px]">
                  {userEmail.split('@')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-[#6E5C5F] hover:text-[#2E2628] px-2.5 py-1.5 rounded-lg hover:bg-[#FAF8F6] transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5 text-[#EA580C]" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Primary CTA (Orange to Pink Gradient) */}
            <button
              id="start-screening-header-btn"
              onClick={() => setActiveTab('screening')}
              className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Screening →</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FAF8F6]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#EFE4DC] space-y-1 text-xs">
            <button
              onClick={() => {
                setActiveTab('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FFF7ED]"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('screening');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#EA580C] hover:bg-[#FFF7ED] flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>3-Step Screening</span>
            </button>
            {hasActiveResult && (
              <button
                onClick={() => {
                  setActiveTab('results');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#DB2777] hover:bg-[#FDF2F8] flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Active Results</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('ablation');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FFF7ED] flex items-center gap-2"
            >
              <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Ablation & Research</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('architecture');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FFF7ED] flex items-center gap-2"
            >
              <Cpu className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Architecture & MLflow</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FFF7ED] flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-[#DB2777]" />
              <span>History</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('interview');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-medium text-[#2E2628] hover:bg-[#FFF7ED] flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Engineering FAQ</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
