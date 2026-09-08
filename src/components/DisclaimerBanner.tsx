import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      id="bottom-right-clinical-disclaimer"
      aria-label="Clinical Decision Support Notice"
      className="fixed bottom-3 right-3 z-40 max-w-[320px] sm:max-w-sm bg-white/95 backdrop-blur-xs border border-[#FED7AA] shadow-sm rounded-xl p-2.5 sm:p-3 text-[11px] text-[#6E5C5F] transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[#C2410C] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#EA580C]" />
          <span className="text-[11px] uppercase tracking-wide">
            Investigational Decision Support
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#EA580C] hover:text-[#C2410C] p-0.5 rounded focus:outline-none transition-colors"
          title={isExpanded ? "Collapse" : "Expand full clinical details"}
          aria-label={isExpanded ? "Collapse disclaimer" : "Expand disclaimer"}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <p className="text-[#2E2628] mt-1 leading-tight text-[11px]">
        Research & Triage Demo Only · Not FDA/CDSCO cleared as a diagnostic device.
      </p>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-[#FED7AA] space-y-1 text-[10px] text-[#6E5C5F] leading-relaxed">
          <p>
            All predictions, Grad-CAM overlays, and SHAP factors require confirmatory dilated ophthalmoscopy by a licensed retina specialist.
          </p>
          <p className="text-[10px] text-[#9E8D91]">
            Calibrated on UKPDS / DCCT feature distributions.
          </p>
        </div>
      )}
    </aside>
  );
};
