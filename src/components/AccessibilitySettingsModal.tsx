import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Type,
  Eye,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Database,
} from 'lucide-react';
import {
  accessibilityService,
  AccessibilityConfig,
  TextSizeOption,
  ColorVisionOption,
  ThemeModeOption,
  TEXT_SIZE_SCALES,
} from '../services/accessibilityService';
import { useTranslation } from '../i18n/I18nContext';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<AccessibilityConfig>(accessibilityService.getConfig());

  useEffect(() => {
    const unsub = accessibilityService.subscribe((c) => setConfig(c));
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSetTextSize = (size: TextSizeOption) => {
    accessibilityService.update({ textSize: size });
  };

  const handleToggleHighContrast = () => {
    accessibilityService.update({ highContrast: !config.highContrast });
  };

  const handleSetColorVision = (cv: ColorVisionOption) => {
    accessibilityService.update({ colorVision: cv });
  };

  const handleSetThemeMode = (mode: ThemeModeOption) => {
    accessibilityService.update({ themeMode: mode });
  };

  const handleToggleReduceMotion = (enable: boolean) => {
    accessibilityService.update({ reduceMotion: enable });
  };

  const handleReset = () => {
    accessibilityService.update({
      textSize: 'standard',
      highContrast: false,
      colorVision: 'default',
      reduceMotion: false,
      readAloud: true,
      themeMode: 'light',
    });
  };

  const currentScale = TEXT_SIZE_SCALES[config.textSize] || TEXT_SIZE_SCALES.standard;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white dark:bg-[#1B161A] rounded-3xl border border-[#EFE4DC] dark:border-[#33292F] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2B2024] dark:text-[#FAF5F7]">
        {/* HEADER */}
        <div className="bg-[#FFFDF9] dark:bg-[#211B1F] border-b border-[#EFE4DC] dark:border-[#33292F] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F05A28] text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 id="accessibility-settings-title" className="font-serif font-bold text-base text-[#2B2024] dark:text-[#FAF5F7]">
                {t("accessibilityModalTitle", "Centralized Accessibility Settings")}
              </h3>
              <p className="text-[11px] text-[#6F6267] dark:text-[#C4B6BC]">
                {t("accessibilityModalDesc", "System-wide text sizing, high contrast, color vision, and dark theme")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close accessibility settings"
            className="p-2 rounded-xl text-[#6F6267] hover:text-[#2B2024] dark:text-[#C4B6BC] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#2C1E24] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* 1. TEXT SIZE */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#F05A28]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#2B2024] dark:text-[#FAF5F7]">
                  1. {t("textSizeLabel", "Text Size (Global Token Scaling)")}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE5D8] text-[#F05A28] dark:bg-[#3D251E] dark:text-[#FF7A4D]">
                {currentScale.label} ({currentScale.scale}x)
              </span>
            </div>
            <p className="text-xs text-[#6F6267] dark:text-[#C4B6BC]">
              {t("textSizeDescFull", "Scales headings, body text, buttons, navigation, forms, cards, dialogs, results, reports, and tables without horizontal scrolling.")}
            </p>

            {/* 3 Text size options */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[
                { id: 'standard', label: 'Default', scale: '1.0x', display: 'A' },
                { id: 'large', label: 'Large', scale: '1.15x', display: 'A+' },
                { id: 'xl', label: 'Extra Large', scale: '1.30x', display: 'A++' },
              ].map((opt) => {
                const isSelected = config.textSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSetTextSize(opt.id as TextSizeOption)}
                    className={`relative p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-[#F05A28] ring-2 ring-[#F05A28]/30 bg-[#FFE5D8]/50 dark:bg-[#F05A28]/20 text-[#F05A28] dark:text-[#FF7A4D] font-bold shadow-xs'
                        : 'border-[#EFE4DC] dark:border-[#33292F] bg-white dark:bg-[#211B1F] text-[#2B2024] dark:text-[#FAF5F7] hover:bg-stone-50 dark:hover:bg-[#2C1E24]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F05A28] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className="font-bold text-lg">{opt.display}</span>
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className="text-[10px] opacity-75">{opt.scale}</span>
                  </button>
                );
              })}
            </div>

            {/* LIVE SAMPLE TEXT PREVIEW */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#211B1F] border border-[#EFE4DC] dark:border-[#33292F] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F6267] dark:text-[#C4B6BC]">
                  {t("livePreviewLabel", "Live Preview: Sample text")}
                </span>
                <span className="text-[10px] font-mono text-[#F05A28] dark:text-[#FF7A4D]">
                  --font-scale: {currentScale.scale}
                </span>
              </div>
              <p
                className="font-medium text-stone-800 dark:text-stone-100 leading-relaxed transition-all"
                style={{ fontSize: `calc(0.95rem * ${currentScale.scale})` }}
              >
                "Sample text: RetinaGuard multimodal screening combines fundus color photography and macular OCT biomarkers to assist clinical triage."
              </p>
            </div>
          </section>

          {/* 2. HIGH CONTRAST */}
          <section className="space-y-3 pt-4 border-t border-[#EFE4DC] dark:border-[#33292F]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#F05A28]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#2B2024] dark:text-[#FAF5F7]">
                  2. {t("highContrastLabel", "High Contrast Mode")}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleHighContrast}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  config.highContrast ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
                aria-label="Toggle High Contrast"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    config.highContrast ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-[#6F6267] dark:text-[#C4B6BC]">
              {t("highContrastDesc", "Globally enforces stark backgrounds, high-contrast text, prominent 2px borders, high-visibility focus indicators, and bold interactive elements across inputs, cards, dialogs, and navigation.")}
            </p>
            {config.highContrast && (
              <div className="p-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white text-xs font-bold flex items-center justify-between">
                <span>✓ High Contrast Active (WCAG AAA &gt; 7:1)</span>
                <span className="text-[10px] uppercase tracking-wider">Borders &amp; Focus Enhanced</span>
              </div>
            )}
          </section>

          {/* 3. COLOR VISION */}
          <section className="space-y-3 pt-4 border-t border-[#EFE4DC] dark:border-[#33292F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B2024] dark:text-[#FAF5F7]">
                3. {t("colorVisionLabel", "Color Vision Accessibility")}
              </span>
              <span className="text-[11px] font-semibold text-[#6F6267] dark:text-[#C4B6BC]">
                Icon + Text + Color
              </span>
            </div>
            <p className="text-xs text-[#6F6267] dark:text-[#C4B6BC]">
              {t("colorVisionRule", "RetinaGuard never relies on color alone to communicate status. Every result and indicator includes an explicit symbol and text description.")}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'default', label: 'Default', desc: 'Natural clinical palette' },
                { id: 'redGreen', label: 'Red-Green Friendly', desc: 'Cyan & Magenta distinction' },
                { id: 'blueYellow', label: 'Blue-Yellow Friendly', desc: 'Violet & Amber distinction' },
                { id: 'monochrome', label: 'Monochrome', desc: 'High-contrast grayscale' },
              ].map((item) => {
                const isSelected = config.colorVision === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSetColorVision(item.id as ColorVisionOption)}
                    className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                      isSelected
                        ? 'border-[#F05A28] ring-2 ring-[#F05A28]/30 bg-[#FFE5D8]/50 dark:bg-[#F05A28]/20 text-[#2B2024] dark:text-[#FAF5F7] font-bold shadow-xs'
                        : 'border-[#EFE4DC] dark:border-[#33292F] bg-white dark:bg-[#211B1F] text-[#2B2024] dark:text-[#FAF5F7] hover:bg-stone-50 dark:hover:bg-[#2C1E24]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-[#6F6267] dark:text-[#C4B6BC] mt-0.5">{item.desc}</div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#F05A28] shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Live Status Indicators Demonstration (Icon + Text + Color) */}
            <div className="p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#211B1F] border border-[#EFE4DC] dark:border-[#33292F] space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F6267] dark:text-[#C4B6BC] block">
                Standard Accessible Status Badges (Icon + Text + Color)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>✓ Completed</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>⚠ Needs Review</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>! Further Evaluation Recommended</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. DARK MODE */}
          <section className="space-y-3 pt-4 border-t border-[#EFE4DC] dark:border-[#33292F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B2024] dark:text-[#FAF5F7]">
                4. {t("colorThemeLabel", "Color Theme")}
              </span>
              <span className="text-[11px] text-[#6F6267] dark:text-[#C4B6BC]">
                Premium Dark Theme
              </span>
            </div>
            <p className="text-xs text-[#6F6267] dark:text-[#C4B6BC]">
              {t("themeDesc", "Curated warm obsidian aesthetic. Does not simply invert colors, maintaining clinical image fidelity.")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((theme) => {
                const IconComponent = theme.icon;
                const isSelected = config.themeMode === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSetThemeMode(theme.id as ThemeModeOption)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-[#F05A28] ring-2 ring-[#F05A28]/30 bg-[#FFE5D8]/50 dark:bg-[#F05A28]/20 text-[#F05A28] dark:text-[#FF7A4D] font-bold shadow-xs'
                        : 'border-[#EFE4DC] dark:border-[#33292F] bg-white dark:bg-[#211B1F] text-[#2B2024] dark:text-[#FAF5F7] hover:bg-stone-50 dark:hover:bg-[#2C1E24]'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-xs font-semibold">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. REDUCE MOTION */}
          <section className="space-y-3 pt-4 border-t border-[#EFE4DC] dark:border-[#33292F]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F05A28]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#2B2024] dark:text-[#FAF5F7]">
                  5. {t("reduceMotionTitle", "Reduce Motion")}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#211B1F] p-1 rounded-xl border border-[#EFE4DC] dark:border-[#33292F]">
                <button
                  type="button"
                  onClick={() => handleToggleReduceMotion(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    !config.reduceMotion
                      ? 'bg-white dark:bg-[#2C1E24] text-[#2B2024] dark:text-[#FAF5F7] shadow-2xs font-bold'
                      : 'text-[#6F6267] dark:text-[#C4B6BC]'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleReduceMotion(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    config.reduceMotion
                      ? 'bg-[#F05A28] text-white shadow-2xs font-bold'
                      : 'text-[#6F6267] dark:text-[#C4B6BC]'
                  }`}
                >
                  Reduce Motion
                </button>
              </div>
            </div>
            <p className="text-xs text-[#6F6267] dark:text-[#C4B6BC]">
              {t("reduceMotionDetail", "Disables scroll animations, hover transforms, and parallax shifts. Replaces continuous spinners with calm indicators for vestibular comfort.")}
            </p>
          </section>

          {/* 6. PERSISTENCE INFO */}
          <section className="p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#211B1F] border border-[#EFE4DC] dark:border-[#33292F] flex items-center gap-3">
            <Database className="w-4 h-4 text-[#F05A28] shrink-0" />
            <div className="text-[11px] text-[#6F6267] dark:text-[#C4B6BC]">
              <span className="font-bold text-[#2B2024] dark:text-[#FAF5F7]">
                6. Automatic Persistence:
              </span>{' '}
              Settings are saved in <span className="font-mono">localStorage</span> for guests and stored in user profiles / Supabase user preferences for authenticated clinicians and patients. Settings persist across page refresh.
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="bg-[#FFFDF9] dark:bg-[#211B1F] border-t border-[#EFE4DC] dark:border-[#33292F] px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[#6F6267] hover:text-[#2B2024] dark:text-[#C4B6BC] dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("resetToDefault", "Reset to Default")}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs transition-colors"
          >
            {t("doneBtn", "Done")}
          </button>
        </div>
      </div>
    </div>
  );
};

