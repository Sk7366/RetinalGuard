import React from 'react';
import { Layers, Upload, X, ArrowRight, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';

interface BatchScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchScreeningModal: React.FC<BatchScreeningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#EFE4DC] max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#EFE4DC] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFE5D8] text-[#F05A28] flex items-center justify-center border border-[#FED7AA]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#2B2024] text-base">
                {t('batchTriageModalTitle', 'Batch Triage & Population Screening')}
              </h3>
              <p className="text-[11px] text-[#6F6267]">
                {t('batchTriageModalSub', 'Offline-capable high-throughput queue for community camps')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F6] text-[#6F6267] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-[#2B2024]">
          <p className="text-[#6F6267] leading-relaxed">
            {t('batchPipelineDescription', 'The Batch Screening pipeline supports multi-image ingest (up to 50 fundus images at once), paired metadata CSV mapping, automated parallel inference, and prioritized triage queueing.')}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
              <div className="font-bold text-[#D84818] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{t('bulkUploadTitle', 'Bulk Upload')}</span>
              </div>
              <p className="text-[11px] text-[#6F6267]">{t('bulkUploadDesc', 'Drag and drop DICOM / PNG / JPEG fundus images.')}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
              <div className="font-bold text-[#D94A78] flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{t('csvMetadataTitle', 'CSV Metadata')}</span>
              </div>
              <p className="text-[11px] text-[#6F6267]">{t('csvMetadataDesc', 'Auto-match HbA1c, BP, and diabetes duration.')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFE4DC]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#EFE4DC] text-xs font-semibold text-[#6F6267] hover:bg-[#FAF8F6] transition-colors"
          >
            {t('closeBtn', 'Close')}
          </button>
          <button
            onClick={() => {
              onClose();
              window.location.hash = 'provider/batch';
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F05A28] to-[#DB2777] text-xs font-bold text-white hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            <span>{t('openBatchWorkspace', 'Open Batch Workspace')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
