import React from 'react';
import { Layers, Upload, X, ArrowRight, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface BatchScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchScreeningModal: React.FC<BatchScreeningModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#EFE4DC] max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#EFE4DC] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center border border-[#FED7AA]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#2E2628] text-base">
                Batch Triage & Population Screening
              </h3>
              <p className="text-[11px] text-[#6E5C5F]">
                Offline-capable high-throughput queue for community camps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F6] text-[#6E5C5F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-[#2E2628]">
          <p className="text-[#6E5C5F] leading-relaxed">
            The Batch Screening pipeline supports multi-image ingest (up to 50 fundus images at once), paired metadata CSV mapping, automated parallel inference, and prioritized triage queueing.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
              <div className="font-bold text-[#C2410C] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Bulk Upload</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F]">Drag and drop DICOM / PNG / JPEG fundus images.</p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
              <div className="font-bold text-[#BE185D] flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV Metadata</span>
              </div>
              <p className="text-[11px] text-[#6E5C5F]">Auto-match HbA1c, BP, and diabetes duration.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFE4DC]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#EFE4DC] text-xs font-semibold text-[#6E5C5F] hover:bg-[#FAF8F6] transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              window.location.hash = 'provider/batch';
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-xs font-bold text-white hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            <span>Open Batch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
