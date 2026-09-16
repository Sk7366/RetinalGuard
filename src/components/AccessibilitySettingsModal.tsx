import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Type,
  Eye,
  Sparkles,
  Volume2,
  Check,
  X,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import {
  accessibilityService,
  AccessibilityConfig,
  TextSizeOption,
  ColorVisionOption,
  ThemeModeOption,
} from '../services/accessibilityService';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<AccessibilityConfig>(accessibilityService.getConfig());

  useEffect(() => {
    const unsub = accessibilityService.subscribe((c) => setConfig(c));
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSetTextSize = (size: TextSizeOption) => {
    accessibilityService.update({ textSize: size });
  };

  const handleSetColorVision = (cv: ColorVisionOption) => {
    accessibilityService.update({
      colorVision: cv,
      highContrast: cv === 'highContrast',
    });
  };

  const handleSetThemeMode = (mode: ThemeModeOption) => {
    accessibilityService.update({ themeMode: mode });
  };

  const handleToggleReduceMotion = () => {
    accessibilityService.update({ reduceMotion: !config.reduceMotion });
  };

  const handleToggleReadAloud = () => {
    accessibilityService.update({ readAloud: !config.readAloud });
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white dark:bg-[#211B1E] rounded-3xl border border-[#EFE4DC] dark:border-[#382E33] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2B2024] dark:text-[#FFF7F2]">
        {/* HEADER */}
        <div className="bg-[#FFFDF9] dark:bg-[#211B1E] border-b border-[#EFE4DC] dark:border-[#382E33] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F05A28] text-white flex items-center justify-center shadow-2xs">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="accessibility-settings-title" className="font-serif font-bold text-base text-[#2B2024] dark:text-[#FFF7F2]">
                Accessibility & Display
              </h3>
              <p className="text-[11px] text-[#6F6267] dark:text-[#D8C9CE]">
                Personalize text size, contrast, color vision, and theme
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6F6267] hover:text-[#2B2024] dark:text-[#D8C9CE] dark:hover:text-white hover:bg-[#FBE4EC]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1. TEXT SIZE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#F05A28]" />
                <span className="text-xs font-bold text-[#2B2024] dark:text-[#FFF7F2] uppercase tracking-wider">
                  Text Size (Global Scaling)
                </span>
              </div>
              <span className="text-xs font-semibold text-[#F05A28] capitalize">
                {config.textSize === 'xl' ? 'Extra Large' : config.textSize === 'large' ? 'Large' : 'Default'}
              </span>
            </div>
            <p className="text-xs text-[#6F6267] dark:text-[#D8C9CE]">
              Scales headings, buttons, instructions, and reports across the entire platform.
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSetTextSize('standard')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  config.textSize === 'standard'
                    ? 'border-[#F05A28] bg-[#FFE5D8]/40 dark:bg-[#F05A28]/20 text-[#F05A28] font-bold shadow-2xs'
                    : 'border-[#EFE4DC] dark:border-[#382E33] bg-white dark:bg-[#2A2226] text-[#2B2024] dark:text-[#FFF7F2] hover:bg-[#FFE5D8]/20'
                }`}
              >
                <div className="text-base font-bold">A</div>
                <div className="text-[11px] mt-0.5 font-medium">Default</div>
              </button>

              <button
                type="button"
                onClick={() => handleSetTextSize('large')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  config.textSize === 'large'
                    ? 'border-[#F05A28] bg-[#FFE5D8]/40 dark:bg-[#F05A28]/20 text-[#F05A28] font-bold shadow-2xs'
                    : 'border-[#EFE4DC] dark:border-[#382E33] bg-white dark:bg-[#2A2226] text-[#2B2024] dark:text-[#FFF7F2] hover:bg-[#FFE5D8]/20'
                }`}
              >
                <div className="text-lg font-bold">A+</div>
                <div className="text-[11px] mt-0.5 font-medium">Large</div>
              </button>

              <button
                type="button"
                onClick={() => handleSetTextSize('xl')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  config.textSize === 'xl'
                    ? 'border-[#F05A28] bg-[#FFE5D8]/40 dark:bg-[#F05A28]/20 text-[#F05A28] font-bold shadow-2xs'
                    : 'border-[#EFE4DC] dark:border-[#382E33] bg-white dark:bg-[#2A2226] text-[#2B2024] dark:text-[#FFF7F2] hover:bg-[#FFE5D8]/20'
                }`}
              >
                <div className="text-xl font-bold">A++</div>
                <div className="text-[11px] mt-0.5 font-medium">Extra Large</div>
              </button>
            </div>

            {/* LIVE SAMPLE TEXT PREVIEW (Part 29) */}
            <div className="mt-2.5 p-3 rounded-xl bg-[#FFFDF9] dark:bg-[#2A2226] border border-[#EFE4DC] dark:border-[#382E33]">
              <div className="text-[10px] uppercase font-bold text-[#6F6267] dark:text-[#D8C9CE] tracking-wider mb-1">
                Live Sample Preview
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Clear, comfortable reading for eye health screening and reports.
              </p>
            </div>
          </div>

          {/* 2. THEME MODE (Part 32) */}
          <div className="space-y-2 pt-4 border-t border-[#EFE4DC] dark:border-[#382E33]">
            <span className="text-xs font-bold text-[#2B2024] dark:text-[#FFF7F2] uppercase tracking-wider block">
              Color Theme
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((theme) => {
                const IconComponent = theme.icon;
                const isSelected = (config.themeMode || 'light') === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSetThemeMode(theme.id as ThemeModeOption)}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-[#F05A28] bg-[#FFE5D8]/40 dark:bg-[#F05A28]/20 text-[#F05A28] font-bold shadow-2xs'
                        : 'border-[#EFE4DC] dark:border-[#382E33] bg-white dark:bg-[#2A2226] text-[#2B2024] dark:text-[#FFF7F2] hover:bg-[#FFE5D8]/20'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-xs font-semibold">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. COLOR VISION & CONTRAST (Part 30 & 31) */}
          <div className="space-y-2 pt-4 border-t border-[#EFE4DC] dark:border-[#382E33]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#F05A28]" />
              <span className="text-xs font-bold text-[#2B2024] dark:text-[#FFF7F2] uppercase tracking-wider">
                Color Vision & Contrast Mode
              </span>
            </div>
            <p className="text-xs text-[#6F6267] dark:text-[#D8C9CE]">
              Never relies on color alone: results always feature distinct icons, clear labels, and adjusted tones.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { id: 'default', label: 'Default Natural', desc: 'Warm ivory clinic palette' },
                { id: 'highContrast', label: 'High Contrast', desc: 'Maximum edge & text contrast' },
                { id: 'redGreen', label: 'Red-Green Friendly', desc: 'Adjusted for Protan/Deutan vision' },
                { id: 'blueYellow', label: 'Blue-Yellow Friendly', desc: 'Adjusted for Tritan vision' },
                { id: 'monochrome', label: 'Monochrome', desc: 'Pure grayscale with strong borders' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSetColorVision(item.id as ColorVisionOption)}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                    config.colorVision === item.id
                      ? 'border-[#F05A28] bg-[#FFE5D8]/40 dark:bg-[#F05A28]/20 text-[#2B2024] dark:text-[#FFF7F2] shadow-2xs font-semibold'
                      : 'border-[#EFE4DC] dark:border-[#382E33] bg-white dark:bg-[#2A2226] text-[#2B2024] dark:text-[#FFF7F2] hover:bg-[#FFE5D8]/20'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-[#6F6267] dark:text-[#D8C9CE] mt-0.5">{item.desc}</div>
                  </div>
                  {config.colorVision === item.id && (
                    <Check className="w-4 h-4 text-[#F05A28] shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 4. REDUCE MOTION & READ ALOUD TOGGLES (Part 33) */}
          <div className="space-y-3 pt-4 border-t border-[#EFE4DC] dark:border-[#382E33]">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#2A2226] border border-[#EFE4DC] dark:border-[#382E33]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#F05A28]" />
                <div>
                  <div className="text-xs font-semibold text-[#2B2024] dark:text-[#FFF7F2]">Reduce Motion</div>
                  <div className="text-[11px] text-[#6F6267] dark:text-[#D8C9CE]">Disables transitions and animations</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleReduceMotion}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  config.reduceMotion ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.reduceMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#2A2226] border border-[#EFE4DC] dark:border-[#382E33]">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#F05A28]" />
                <div>
                  <div className="text-xs font-semibold text-[#2B2024] dark:text-[#FFF7F2]">Read Aloud Support</div>
                  <div className="text-[11px] text-[#6F6267] dark:text-[#D8C9CE]">Enables audio narration for educational articles</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleReadAloud}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  config.readAloud ? 'bg-[#F05A28]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.readAloud ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-[#FFFDF9] dark:bg-[#211B1E] border-t border-[#EFE4DC] dark:border-[#382E33] px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[#6F6267] hover:text-[#2B2024] dark:text-[#D8C9CE] dark:hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
