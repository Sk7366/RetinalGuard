import React from 'react';
import {
  Building2,
  Check,
  Eye,
  Globe,
  HardDrive,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  Sliders,
  Sparkles,
  Stethoscope,
  Type,
  Users,
} from 'lucide-react';
import { AccessibilitySettings, UserRole } from '../types';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { screeningApi } from '../services/screeningApi';

interface ProviderSettingsProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenRoleModal: () => void;
  accessibilitySettings: AccessibilitySettings;
  onUpdateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const ProviderSettings: React.FC<ProviderSettingsProps> = ({
  currentRole,
  onSelectRole,
  onOpenRoleModal,
  accessibilitySettings,
  onUpdateAccessibilitySettings,
  currentLanguage,
  onLanguageChange,
}) => {
  const roleNames: Record<UserRole, string> = {
    public: 'Public User (Patient & Community)',
    technician: 'Screening Technician (Field Camp Operator)',
    provider: 'Healthcare Provider (Optometrist / Physician)',
    admin: 'Administrator (Facility & Clinical Governance)',
    researcher: 'Researcher (Model Benchmark & Ablation)',
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
          <Sliders className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>System Configuration & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          Provider Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-2xl leading-relaxed">
          Manage clinical role personas, AI service connectivity, outreach camp device caching, and user interface accessibility.
        </p>
      </div>

      {/* 1. Active Role Architecture Switcher */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC]">
          <div>
            <h2 className="text-base font-bold text-[#2E2628] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EA580C]" />
              <span>Persona & Role Architecture</span>
            </h2>
            <p className="text-xs text-[#6E5C5F]">
              Current Active Perspective: <span className="font-semibold text-[#EA580C]">{roleNames[currentRole]}</span>
            </p>
          </div>
          <button
            onClick={onOpenRoleModal}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#EFE4DC] hover:border-[#EA580C] bg-[#FAF8F6] text-[#2E2628] hover:text-[#EA580C] transition-colors"
          >
            Switch Role ▾
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {(['public', 'technician', 'provider', 'admin', 'researcher'] as UserRole[]).map((r) => {
            const isCurrent = currentRole === r;
            return (
              <button
                key={r}
                onClick={() => onSelectRole(r)}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'border-[#EA580C] bg-[#FFF7ED]/50 font-bold text-[#EA580C] ring-1 ring-[#EA580C]'
                    : 'border-[#EFE4DC] bg-[#FFFDFB] text-[#2E2628] hover:bg-[#FAF8F6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{r === 'public' ? 'Public User' : r}</span>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-[#EA580C]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Facility & Screening Center Profile */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-[#EFE4DC]">
          <h2 className="text-base font-bold text-[#2E2628] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#DB2777]" />
            <span>Facility & Clinical Credentials</span>
          </h2>
          <p className="text-xs text-[#6E5C5F]">
            Appears on generated clinical PDF summaries and referral transmission slips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#6E5C5F] block mb-1">
              Screening Facility / Camp Wing
            </label>
            <input
              type="text"
              defaultValue="Aravind Eye Care System - Outreach Community Division"
              className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-xl px-3 py-2 text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6E5C5F] block mb-1">
              Registered Facility ID / NPI
            </label>
            <input
              type="text"
              defaultValue="IN-RET-CAMP-TN-4019"
              className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-xl px-3 py-2 text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6E5C5F] block mb-1">
              Default Referral Center
            </label>
            <input
              type="text"
              defaultValue="Dr. Mohan's Diabetes Specialities & Vitreoretina Hospital"
              className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-xl px-3 py-2 text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6E5C5F] block mb-1">
              Supervising Ophthalmologist
            </label>
            <input
              type="text"
              defaultValue="Dr. Arvind Swaminathan, MS, DNB, FICO (Retina)"
              className="w-full bg-[#FAF8F6] border border-[#EFE4DC] rounded-xl px-3 py-2 text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
            />
          </div>
        </div>
      </div>

      {/* 3. Inference Engine & Connectivity */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-[#EFE4DC] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2E2628] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#15803D]" />
              <span>AI Service Connectivity & Execution</span>
            </h2>
            <p className="text-xs text-[#6E5C5F]">
              Select between standalone local deterministic heuristics and connected FastAPI inference endpoints.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] font-bold">
            Mode: {screeningApi.getApiMode().toUpperCase()}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-[#2E2628]">Local Deterministic Edge Engine</div>
            <div className="text-[#6E5C5F]">Simulates full EfficientNet-B4 + ResNet-50 + XGBoost late fusion without external network overhead.</div>
          </div>
          <span className="text-xs font-semibold text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-lg">
            Active
          </span>
        </div>
      </div>

      {/* 4. Accessibility & Multilingual Localization */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-[#EFE4DC]">
          <h2 className="text-base font-bold text-[#2E2628] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#EA580C]" />
            <span>Accessibility & Multilingual Interface</span>
          </h2>
          <p className="text-xs text-[#6E5C5F]">
            Adjust font contrast, readability, and regional language preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-xs text-[#6E5C5F] block mb-2">
              Regional Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`p-2 rounded-xl text-xs text-left border transition-all ${
                    currentLanguage === lang.code
                      ? 'border-[#EA580C] bg-[#FFF7ED] text-[#C2410C] font-bold'
                      : 'border-[#EFE4DC] bg-[#FAF8F6] text-[#2E2628]'
                  }`}
                >
                  <div>{lang.nativeLabel}</div>
                  <div className="text-[10px] text-[#6E5C5F]">{lang.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-xs text-[#6E5C5F] block mb-2">
              Display Modifiers
            </label>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <div className="text-xs">
                <span className="font-semibold text-[#2E2628] block">High Contrast Mode</span>
                <span className="text-[10px] text-[#6E5C5F]">Enhanced boundary edges</span>
              </div>
              <input
                type="checkbox"
                checked={accessibilitySettings.highContrast}
                onChange={(e) =>
                  onUpdateAccessibilitySettings({ highContrast: e.target.checked })
                }
                className="accent-[#EA580C] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <div className="text-xs">
                <span className="font-semibold text-[#2E2628] block">Large Typography</span>
                <span className="text-[10px] text-[#6E5C5F]">Optimized for mobile field devices</span>
              </div>
              <input
                type="checkbox"
                checked={accessibilitySettings.largeText}
                onChange={(e) =>
                  onUpdateAccessibilitySettings({ largeText: e.target.checked })
                }
                className="accent-[#EA580C] w-4 h-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
