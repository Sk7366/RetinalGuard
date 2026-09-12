import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  // Start in compact mode to be unobtrusive and not cover content
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      id="bottom-right-clinical-disclaimer"
      aria-label="Clinical Decision Support Notice"
      className={`fixed bottom-3 right-3 z-30 transition-all duration-200 ${
        isExpanded ? 'w-[320px] max-w-[calc(100vw-24px)]' : 'w-auto'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-sm rounded-xl p-2 sm:p-2.5 text-[11px] text-stone-600 transition-all">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-left group focus:outline-none"
            aria-label={isExpanded ? 'Collapse clinical notice' : 'Expand clinical notice'}
          >
            <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-3 h-3" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-stone-800 uppercase tracking-wider">
              Investigational Support
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-stone-100 transition-colors shrink-0"
            title={isExpanded ? 'Collapse notice' : 'Expand full clinical details'}
            aria-label={isExpanded ? 'Collapse disclaimer' : 'Expand disclaimer'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-stone-100 space-y-1.5 text-[10px] text-stone-600 leading-relaxed animate-in fade-in duration-150">
            <p className="font-medium text-stone-800">
              Research &amp; Triage Demo Only · Not FDA / CDSCO cleared as a diagnostic device.
            </p>
            <p className="text-stone-500">
              All predictions, Grad-CAM overlays, and biomarker detections require confirmatory examination by a licensed ophthalmologist.
            </p>
            <div className="flex items-center gap-1.5 text-[9px] text-stone-400 pt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Calibrated on UKPDS / DCCT feature distributions</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

