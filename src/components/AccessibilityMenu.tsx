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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs"
        title="Accessibility & Language Preferences"
        aria-label="Accessibility options"
      >
        <Globe className="w-3.5 h-3.5 text-stone-500" />
        <span className="hidden sm:inline font-semibold">
          {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeLabel || 'Language'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-stone-200 shadow-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-stone-600" />
              <h4 className="text-xs font-semibold text-stone-900">
                Preferences & Accessibility
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Language Selector */}
          <div className="mb-4">
            <label className="text-[11px] font-medium text-stone-500 block mb-1.5">
              Select Language (ಭಾಷೆ / भाषा / மொழி)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all ${
                    currentLanguage === lang.code
                      ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                      : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>{lang.nativeLabel}</span>
                  {currentLanguage === lang.code && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            {/* Large Text */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-2.5">
                <Type className="w-4 h-4 text-stone-600" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">Large Text Mode</div>
                  <div className="text-[10px] text-stone-500">Comfortable reading for seniors</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ largeText: !settings.largeText })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.largeText ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                aria-label="Toggle large text"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.largeText ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-stone-600" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">High Contrast</div>
                  <div className="text-[10px] text-stone-500">Higher visual edge definition</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.highContrast ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                aria-label="Toggle high contrast"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Lite Mode */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-stone-600" />
                <div>
                  <div className="text-xs font-semibold text-stone-900">Lite Mode (Low Bandwidth)</div>
                  <div className="text-[10px] text-stone-500">Fast load, reduced animation</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ liteMode: !settings.liteMode })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  settings.liteMode ? 'bg-stone-900' : 'bg-stone-300'
                }`}
                aria-label="Toggle lite mode"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.liteMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[10px] text-stone-400 text-center border-t border-stone-100">
            Preferences apply instantly to this browser session.
          </div>
        </div>
      )}
    </div>
  );
};
