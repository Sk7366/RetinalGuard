import React, { useState, useEffect } from 'react';
import {
  Check,
  Eye,
  Globe,
  Sliders,
  Sparkles,
  Type,
  Sun,
  Moon,
  Laptop,
  X,
} from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { AccessibilitySettings } from '../types';
import { useTranslation } from '../i18n/I18nContext';
import {
  accessibilityService,
  AccessibilityConfig,
  TextSizeOption,
  ThemeModeOption,
} from '../services/accessibilityService';

interface AccessibilityMenuProps {
  settings?: AccessibilitySettings;
  onUpdateSettings?: (newSettings: Partial<AccessibilitySettings>) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenFullSettings?: () => void;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenFullSettings,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AccessibilityConfig>(accessibilityService.getConfig());

  useEffect(() => {
    const unsub = accessibilityService.subscribe((c) => setConfig(c));
    return () => unsub();
  }, []);

  const handleTextSizeChange = (size: TextSizeOption) => {
    accessibilityService.update({ textSize: size });
  };

  const handleHighContrastToggle = () => {
    accessibilityService.update({ highContrast: !config.highContrast });
  };

  const handleThemeModeChange = (mode: ThemeModeOption) => {
    accessibilityService.update({ themeMode: mode });
  };

  const handleReduceMotionToggle = () => {
    accessibilityService.update({ reduceMotion: !config.reduceMotion });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-[#33292F] bg-white dark:bg-[#1B161A] text-xs font-medium text-stone-700 dark:text-[#FAF5F7] hover:bg-stone-50 dark:hover:bg-[#2A2226] transition-colors shadow-2xs"
        title={t('accessibilityAndLangPref', 'Accessibility & Language Preferences')}
        aria-label={t('accessibilityOptions', 'Accessibility options')}
        aria-expanded={isOpen}
      >
        <Sliders className="w-3.5 h-3.5 text-[#F05A28]" />
        <Globe className="w-3.5 h-3.5 text-stone-400" />
        <span className="hidden sm:inline font-semibold text-[11px]">
          {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeLabel || t('language', 'Language')}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 bg-white dark:bg-[#1B161A] rounded-2xl border border-stone-200 dark:border-[#33292F] shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#2B2024] dark:text-[#FAF5F7]">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#33292F] mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#F05A28]" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {t('preferencesAndAccessibility', 'Accessibility & Language')}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#2A2226] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Global Text Sizing Quick Selector */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#F05A28]" />
                {t('textSize', 'Text Size')}
              </span>
              <span className="text-[10px] font-bold text-[#F05A28] uppercase">
                {config.textSize === 'xl' ? 'Extra Large (1.30x)' : config.textSize === 'large' ? 'Large (1.15x)' : 'Default (1.0x)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'standard', label: 'Default', scale: '1.0x' },
                { id: 'large', label: 'Large', scale: '1.15x' },
                { id: 'xl', label: 'XL', scale: '1.30x' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleTextSizeChange(s.id as TextSizeOption)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    config.textSize === s.id
                      ? 'bg-[#F05A28] text-white shadow-2xs font-bold'
                      : 'border border-stone-200 dark:border-[#33292F] text-stone-700 dark:text-[#FAF5F7] hover:bg-stone-50 dark:hover:bg-[#2A2226]'
                  }`}
                >
                  <span>{s.label}</span>
                  <span className="text-[9px] opacity-80">{s.scale}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Theme Mode Quick Toggle */}
          <div className="mb-3">
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-200 block mb-1.5">
              {t('colorTheme', 'Color Theme')}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((m) => {
                const IconComp = m.icon;
                const isSel = config.themeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleThemeModeChange(m.id as ThemeModeOption)}
                    className={`px-2 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                      isSel
                        ? 'bg-[#F05A28] text-white font-bold shadow-2xs'
                        : 'border border-stone-200 dark:border-[#33292F] text-stone-700 dark:text-[#FAF5F7] hover:bg-stone-50 dark:hover:bg-[#2A2226]'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. High Contrast & Reduce Motion Toggles */}
          <div className="space-y-2 mb-3">
            {/* High Contrast */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-[#211B1F] border border-stone-200 dark:border-[#33292F]">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#F05A28]" />
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{t('highContrast', 'High Contrast')}</span>
              </div>
              <button
                type="button"
                onClick={handleHighContrastToggle}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  config.highContrast ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
                aria-label="Toggle High Contrast"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.highContrast ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reduce Motion */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-[#211B1F] border border-stone-200 dark:border-[#33292F]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{t('reduceMotion', 'Reduce Motion')}</span>
              </div>
              <button
                type="button"
                onClick={handleReduceMotionToggle}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  config.reduceMotion ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
                aria-label="Toggle Reduce Motion"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.reduceMotion ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4. Language Selector */}
          <div className="mb-3 pt-2.5 border-t border-stone-100 dark:border-[#33292F]">
            <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#F05A28]" />
              {t('selectLanguageHeader', 'Language (ಭಾಷೆ / भाषा / மொழி)')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all ${
                    currentLanguage === lang.code
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold shadow-2xs'
                      : 'border border-stone-200 dark:border-[#33292F] text-stone-700 dark:text-[#FAF5F7] hover:bg-stone-50 dark:hover:bg-[#2A2226]'
                  }`}
                >
                  <span className="text-[11px]">{lang.nativeLabel}</span>
                  {currentLanguage === lang.code && (
                    <Check className="w-3 h-3 text-white dark:text-stone-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Open Full Centralized Accessibility Settings Modal */}
          {onOpenFullSettings && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenFullSettings();
              }}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-[#F05A28]/10 hover:bg-[#F05A28]/20 dark:bg-[#F05A28]/20 dark:hover:bg-[#F05A28]/30 text-[#F05A28] dark:text-[#FF7A4D] border border-[#F05A28]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('openAllAccessibilitySettings', 'Open Full Accessibility System...')}</span>
            </button>
          )}

          <div className="mt-2.5 pt-2 text-[10px] text-stone-400 dark:text-stone-500 text-center border-t border-stone-100 dark:border-[#33292F]">
            {t('preferencesApplyInstantly', 'Preferences persist across sessions and page refresh.')}
          </div>
        </div>
      )}
    </div>
  );
};

