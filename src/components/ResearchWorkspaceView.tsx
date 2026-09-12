import React, { useState } from 'react';
import {
  Layers,
  BarChart2,
  Database,
  Cpu,
  ShieldAlert,
  GitBranch,
  BookOpen,
  Sparkles,
  CheckCircle2,
  FileText,
  Activity,
} from 'lucide-react';
import { AblationView } from './AblationView';
import { DatasetsSection } from './DatasetsSection';
import { MLflowSection } from './MLflowSection';
import { ResponsibleAiSection } from './ResponsibleAiSection';
import { ArchitectureView } from './ArchitectureView';
import { useTranslation } from '../i18n/I18nContext';

interface ResearchWorkspaceViewProps {
  initialTab?: 'overview' | 'experiments' | 'datasets' | 'models' | 'explainability' | 'architecture';
  onNavigateTab?: (tab: string) => void;
}

export const ResearchWorkspaceView: React.FC<ResearchWorkspaceViewProps> = ({
  initialTab = 'overview',
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'experiments' | 'datasets' | 'models' | 'explainability' | 'architecture'
  >(initialTab);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8">
      {/* RESEARCH WORKSPACE BANNER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F9F5F1] text-[#2E2628] border border-[#EFE4DC] mb-2">
              <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{t('badgeResearchWorkspace', 'RESEARCH WORKSPACE')} • V2.4.0-ML</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Multimodal Validation & SaMD Research Lab
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-3xl leading-relaxed">
              Transparent, reproducible scientific validation of RetinaGuard&apos;s late fusion architecture,
              ablation benchmarks across 6 experimental conditions, and responsible AI fairness audits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#EFE4DC] text-center min-w-[100px]">
              <span className="text-[10px] text-[#9E8D91] block">Fusion AUC</span>
              <span className="text-lg font-mono font-bold text-[#EA580C]">0.942</span>
            </div>
            <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#EFE4DC] text-center min-w-[100px]">
              <span className="text-[10px] text-[#9E8D91] block">Multi-class QWK</span>
              <span className="text-lg font-mono font-bold text-[#2E2628]">0.884</span>
            </div>
            <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#EFE4DC] text-center min-w-[100px] hidden sm:block">
              <span className="text-[10px] text-[#9E8D91] block">DeLong p-val</span>
              <span className="text-sm font-mono font-bold text-[#059669]">&lt; 0.001</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE SUB-TABS */}
        <div className="flex items-center gap-2 border-t border-[#EFE4DC] mt-6 pt-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Ablation Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('datasets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'datasets'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cohort Datasets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('models')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'models'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Model Registry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('explainability')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'explainability'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Fairness & Bias Audits</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>SaMD & System Architecture</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ABLATION MATRIX */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AblationView />
        </div>
      )}

      {/* TAB 2: DATASETS */}
      {activeTab === 'datasets' && (
        <div className="space-y-6">
          <DatasetsSection />
        </div>
      )}

      {/* TAB 3: MODEL REGISTRY */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <MLflowSection />
        </div>
      )}

      {/* TAB 4: EXPLAINABILITY & RESPONSIBLE AI */}
      {activeTab === 'explainability' && (
        <div className="space-y-6">
          <ResponsibleAiSection />
        </div>
      )}

      {/* TAB 5: ARCHITECTURE & REGULATORY */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <ArchitectureView />
        </div>
      )}
    </div>
  );
};
