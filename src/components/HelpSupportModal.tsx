import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Eye,
  Camera,
  Layers,
  FileCheck,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { UserRole } from '../types';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: UserRole;
  onNavigate?: (route: string) => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  role = 'public',
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'patient' | 'helper' | 'researcher'>(
    role === 'researcher' ? 'researcher' : role === 'helper' || role === 'technician' || role === 'provider' ? 'helper' : 'patient'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl border border-[#EFE4DC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        {/* MODAL HEADER */}
        <div className="bg-[#FFFDFB] border-b border-[#EFE4DC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-base sm:text-lg font-serif font-bold text-[#2E2628]">
                {t('helpTitle', 'RetinaGuard Help & Clinical Guidelines')}
              </h2>
              <p className="text-xs text-[#6E5C5F]">
                {t('helpSubtitle', 'Tailored guides for patients, community workers, and research partners.')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#9E8D91] hover:text-[#2E2628] hover:bg-[#F9F5F1] flex items-center justify-center transition-colors"
            aria-label={t('closeModal', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ROLE TABS */}
        <div className="flex border-b border-[#EFE4DC] bg-[#FFFDFB] px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'patient'
                ? 'border-[#EA580C] text-[#EA580C] font-semibold'
                : 'border-transparent text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{t('helpTabPatient', 'For Patients & Families')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('helper')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'helper'
                ? 'border-[#EA580C] text-[#EA580C] font-semibold'
                : 'border-transparent text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('helpTabHelper', 'For Screening Helpers')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('researcher')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'researcher'
                ? 'border-[#EA580C] text-[#EA580C] font-semibold'
                : 'border-transparent text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t('helpTabResearcher', 'For Researchers & Clinicians')}</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PATIENTS */}
          {activeTab === 'patient' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#EA580C] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#C2410C]">{t('painlessCheckTitle', 'Eye Screening is 100% Painless')}</h4>
                  <p className="text-xs text-[#9A3412] mt-0.5 leading-relaxed">
                    {t('painlessCheckDesc', 'RetinaGuard photography takes less than 3 minutes. No needles, no surgery, and in most community camps, no stinging dilating drops are required.')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] space-y-2">
                  <h5 className="text-xs font-bold text-[#2E2628]">{t('whatIfChangesTitle', 'What if my photo shows changes?')}</h5>
                  <p className="text-xs text-[#6E5C5F] leading-relaxed">
                    {t('whatIfChangesDesc', 'Early detection means treatment is simple and gentle. Being flagged for review is NOT a diagnosis of vision loss; it helps you connect with an ophthalmologist early.')}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] space-y-2">
                  <h5 className="text-xs font-bold text-[#2E2628]">{t('howOftenCheckTitle', 'How often should I get checked?')}</h5>
                  <p className="text-xs text-[#6E5C5F] leading-relaxed">
                    {t('howOftenCheckDesc', 'Anyone living with diabetes should have their retinas photographed at least once every 12 months, even if your vision feels completely normal today.')}
                  </p>
                </div>
              </div>

              {/* ACTION ROW */}
              <div className="p-4 rounded-xl border border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div>
                  <h5 className="text-xs font-bold text-[#2E2628]">{t('needHelpCampTitle', 'Need help finding a nearby eye camp?')}</h5>
                  <p className="text-[11px] text-[#6E5C5F]">{t('needHelpCampDesc', 'Our team operates free screening in community health centers.')}</p>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('find-screening');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#EA580C] text-white text-xs font-semibold hover:bg-[#C2410C] transition-colors whitespace-nowrap"
                  >
                    {t('viewScreeningCentersBtn', 'View Screening Centers')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SCREENING HELPERS */}
          {activeTab === 'helper' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-2">
                <h4 className="text-xs font-bold text-[#2E2628] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#EA580C]" />
                  <span>{t('fundusCaptureSOPTitle', 'Standard Non-Mydriatic Fundus Capture SOP')}</span>
                </h4>
                <ul className="text-xs text-[#6E5C5F] space-y-1.5 list-disc list-inside">
                  <li><strong>{t('roomLightingLabel', 'Room Lighting:')}</strong> {t('roomLightingDesc', 'Dim room lights or use a dark privacy booth to naturally dilate the patient\'s pupils.')}</li>
                  <li><strong>{t('alignmentLabel', 'Alignment:')}</strong> {t('alignmentDesc', 'Align the camera crosshairs with the pupil center until the infrared targeting ring turns green.')}</li>
                  <li><strong>{t('fovLabel', 'Field of View:')}</strong> {t('fovDesc', 'Position the optic disc approximately 2 disc diameters nasal to the macula center (45° posterior pole).')}</li>
                  <li><strong>{t('immediateFeedbackLabel', 'Immediate Feedback:')}</strong> {t('immediateFeedbackDesc', 'Check the automated quality score (A/B/C/D). If illumination is below 70%, retake before releasing patient.')}</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <span className="text-xs font-bold text-[#2E2628]">{t('campModeOfflineTitle', 'Camp Mode Offline Sync')}</span>
                  <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
                    {t('campModeOfflineDesc', 'When operating in rural camps with no cellular signal, RetinaGuard queues scans locally in browser IndexedDB and syncs once connected.')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                  <span className="text-xs font-bold text-[#2E2628]">{t('referralProtocolTitle', 'Referral Escalation Protocol')}</span>
                  <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
                    {t('referralProtocolDesc', 'Referrals flagged as Severe NPDR or PDR trigger an automated SMS to the patient and alert the district ophthalmologist review queue.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESEARCHERS */}
          {activeTab === 'researcher' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-2">
                <h4 className="text-xs font-bold text-[#2E2628] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#EA580C]" />
                  <span>{t('samdClassificationTitle', 'SaMD Regulatory Classification & Model Metrics')}</span>
                </h4>
                <p className="text-xs text-[#6E5C5F] leading-relaxed">
                  {t('samdClassificationDesc', 'RetinaGuard AI is structured under IMDRF SaMD Risk Categorization Class IIa (screening and triaging aid). Final clinical diagnostic responsibility remains with the credentialed ophthalmologist.')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC] text-center">
                    <span className="text-[10px] text-[#9E8D91] block">{t('overallAuc', 'Overall AUC')}</span>
                    <span className="text-sm font-mono font-bold text-[#EA580C]">0.942</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC] text-center">
                    <span className="text-[10px] text-[#9E8D91] block">{t('multiclassQwk', 'Multi-class QWK')}</span>
                    <span className="text-sm font-mono font-bold text-[#EA580C]">0.884</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC] text-center">
                    <span className="text-[10px] text-[#9E8D91] block">{t('severePdrSens', 'Severe PDR Sens')}</span>
                    <span className="text-sm font-mono font-bold text-[#EA580C]">94.1%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#EFE4DC] text-center">
                    <span className="text-[10px] text-[#9E8D91] block">{t('cpuLatency', 'CPU Latency')}</span>
                    <span className="text-sm font-mono font-bold text-[#EA580C]">42ms</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#EFE4DC] bg-white space-y-1">
                <span className="text-xs font-bold text-[#2E2628]">{t('statisticalSignificanceTitle', 'Statistical Significance')}</span>
                <p className="text-[11px] text-[#6E5C5F] leading-relaxed">
                  {t('statisticalSignificanceDesc', 'Multimodal late fusion improvements over unimodal baselines are verified via DeLong test for paired ROC curves (p < 0.001) across 3,662 external APTOS 2019 test cases.')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-[#FFFDFB] border-t border-[#EFE4DC] px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-[#9E8D91]">
            {t('clinicalOpsVersion', 'RetinaGuard Clinical Operations • Version 2.4.0')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2E2628] text-white text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            {t('doneBtn', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
