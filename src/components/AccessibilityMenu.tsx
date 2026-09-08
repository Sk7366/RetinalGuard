import React, { useState } from 'react';
import {
  Check,
  Eye,
  Globe,
  Sliders,
  Sparkles,
  Type,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { AccessibilitySettings } from '../types';

interface AccessibilityMenuProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  settings,
  onUpdateSettings,
  currentLanguage,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#EFE4DC] bg-white text-xs font-medium text-[#2E2628] hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-colors"
        title="Accessibility & Language Preferences"
        aria-label="Accessibility options"
      >
        <Globe className="w-3.5 h-3.5 text-[#EA580C]" />
        <span className="hidden sm:inline font-semibold">
          {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeLabel || 'Language'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#EFE4DC] shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC] mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#EA580C]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E2628]">
                Preferences & Accessibility
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-[#6E5C5F] hover:bg-[#FAF8F6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Language Selector */}
          <div className="mb-4">
            <label className="text-[11px] font-semibold text-[#6E5C5F] block mb-1.5">
              Select Language (ಭಾಷೆ / भाषा / மொழி)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors ${
                    currentLanguage === lang.code
                      ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] font-bold'
                      : 'border border-[#EFE4DC] text-[#2E2628] hover:bg-[#FAF8F6]'
                  }`}
                >
                  <span>{lang.nativeLabel}</span>
                  {currentLanguage === lang.code && (
                    <Check className="w-3 h-3 text-[#EA580C]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#EFE4DC]">
            {/* Large Text */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <div className="flex items-center gap-2.5">
                <Type className="w-4 h-4 text-[#EA580C]" />
                <div>
                  <div className="text-xs font-semibold text-[#2E2628]">Large Text Mode</div>
                  <div className="text-[10px] text-[#6E5C5F]">Comfortable reading for seniors</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ largeText: !settings.largeText })}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.largeText ? 'bg-[#EA580C]' : 'bg-gray-200'
                }`}
                aria-label="Toggle large text"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.largeText ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-[#DB2777]" />
                <div>
                  <div className="text-xs font-semibold text-[#2E2628]">High Contrast</div>
                  <div className="text-[10px] text-[#6E5C5F]">Higher visual edge definition</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.highContrast ? 'bg-[#DB2777]' : 'bg-gray-200'
                }`}
                aria-label="Toggle high contrast"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Lite Mode */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-[#EA580C]" />
                <div>
                  <div className="text-xs font-semibold text-[#2E2628]">Lite Mode (Low Bandwidth)</div>
                  <div className="text-[10px] text-[#6E5C5F]">Fast load, reduced animation</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ liteMode: !settings.liteMode })}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.liteMode ? 'bg-[#EA580C]' : 'bg-gray-200'
                }`}
                aria-label="Toggle lite mode"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.liteMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[10px] text-[#6E5C5F] text-center border-t border-[#EFE4DC]">
            Preferences apply instantly to this browser session.
          </div>
        </div>
      )}
    </div>
  );
};
