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
} from 'lucide-react';
import {
  accessibilityService,
  AccessibilityConfig,
  TextSizeOption,
  ColorVisionOption,
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
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-3xl border border-[#EFE4DC] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2E2628]">
        {/* HEADER */}
        <div className="bg-[#FFFDFB] border-b border-[#EFE4DC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shadow-2xs">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 id="accessibility-settings-title" className="font-serif font-bold text-base text-[#2E2628]">
                Accessibility & Display Settings
              </h3>
              <p className="text-[11px] text-[#9E8D91]">
                Customized for high visibility, low vision, and ease of reading
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9E8D91] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors"
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
                <Type className="w-4 h-4 text-[#EA580C]" />
                <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider">
                  Text Size (Global Scaling)
                </span>
              </div>
              <span className="text-xs font-semibold text-[#EA580C] capitalize">
                {config.textSize === 'xl' ? 'Extra Large' : config.textSize}
              </span>
            </div>
            <p className="text-xs text-[#6E5C5F]">
              Scales all headings, buttons, instructions, forms, and results across the entire platform.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSetTextSize('standard')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  config.textSize === 'standard'
                    ? 'border-[#EA580C] bg-[#FFF7ED] text-[#C2410C] font-bold shadow-2xs'
                    : 'border-[#EFE4DC] bg-white text-[#2E2628] hover:bg-[#F9F5F1]'
                }`}
              >
                <div className="text-sm font-semibold">Aa</div>
                <div className="text-[11px] mt-0.5">Default</div>
              </button>

              <button
                type="button"
                onClick={() => handleSetTextSize('large')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  config.textSize === 'large'
                    ? 'border-[#EA580C] bg-[#FFF7ED] text-[#C2410C] font-bold shadow-2xs'
                    : 'border-[#EFE4DC] bg-white text-[#2E2628] hover:bg-[#F9F5F1]'
                }`}
              >
                <div className="text-base font-semibold">Aa</div>
                <div className="text-[11px] mt-0.5">Large</div>
              </button>

              <button
                type="button"
                onClick={() => handleSetTextSize('xl')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  config.textSize === 'xl'
                    ? 'border-[#EA580C] bg-[#FFF7ED] text-[#C2410C] font-bold shadow-2xs'
                    : 'border-[#EFE4DC] bg-white text-[#2E2628] hover:bg-[#F9F5F1]'
                }`}
              >
                <div className="text-lg font-semibold">Aa</div>
                <div className="text-[11px] mt-0.5">Extra Large</div>
              </button>
            </div>
          </div>

          {/* 2. COLOR VISION & CONTRAST */}
          <div className="space-y-2 pt-4 border-t border-[#EFE4DC]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#EA580C]" />
              <span className="text-xs font-bold text-[#2E2628] uppercase tracking-wider">
                Color Vision & Contrast Mode
              </span>
            </div>
            <p className="text-xs text-[#6E5C5F]">
              Optimized palettes ensuring information is never communicated through color alone.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { id: 'default', label: 'Default Natural', desc: 'Standard warm clinic theme' },
                { id: 'highContrast', label: 'High Contrast', desc: 'Maximum edge & text contrast' },
                { id: 'redGreen', label: 'Red-Green Friendly', desc: 'Adjusted for Protan/Deutan vision' },
                { id: 'blueYellow', label: 'Blue-Yellow Friendly', desc: 'Adjusted for Tritan vision' },
                { id: 'monochrome', label: 'Monochrome', desc: 'Grayscale with crisp borders' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSetColorVision(item.id as ColorVisionOption)}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                    config.colorVision === item.id
                      ? 'border-[#EA580C] bg-[#FFF7ED] text-[#2E2628] shadow-2xs'
                      : 'border-[#EFE4DC] bg-white text-[#2E2628] hover:bg-[#F9F5F1]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-[#6E5C5F] mt-0.5">{item.desc}</div>
                  </div>
                  {config.colorVision === item.id && (
                    <Check className="w-4 h-4 text-[#EA580C] shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. REDUCE MOTION & READ ALOUD TOGGLES */}
          <div className="space-y-3 pt-4 border-t border-[#EFE4DC]">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#EA580C]" />
                <div>
                  <div className="text-xs font-semibold text-[#2E2628]">Reduce Motion</div>
                  <div className="text-[11px] text-[#6E5C5F]">Disables animations and hover transitions</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleReduceMotion}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  config.reduceMotion ? 'bg-[#EA580C]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.reduceMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC]">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#EA580C]" />
                <div>
                  <div className="text-xs font-semibold text-[#2E2628]">Read Aloud Support</div>
                  <div className="text-[11px] text-[#6E5C5F]">Enables voice narration on articles and instructions</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleReadAloud}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  config.readAloud ? 'bg-[#EA580C]' : 'bg-stone-300'
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
        <div className="bg-[#FFFDFB] border-t border-[#EFE4DC] px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[#6E5C5F] hover:text-[#2E2628] flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
