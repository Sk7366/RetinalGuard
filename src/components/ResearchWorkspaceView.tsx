import React, { useState, useEffect } from 'react';
import {
  Activity,
  Award,
  BarChart2,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  GitBranch,
  Layers,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';
import { ResearchOverviewSection } from './ResearchOverviewSection';
import { ResearchModelsSection } from './ResearchModelsSection';
import { DatasetsSection } from './DatasetsSection';
import { AblationView } from './AblationView';
import { ResearchEvaluationSection } from './ResearchEvaluationSection';
import { ResearchExplainabilitySection } from './ResearchExplainabilitySection';
import { MLflowSection } from './MLflowSection';
import { ArchitectureView } from './ArchitectureView';
import { User } from '../types';
import { useTranslation } from '../i18n/I18nContext';

export type ResearchTab =
  | 'overview'
  | 'models'
  | 'datasets'
  | 'experiments'
  | 'evaluation'
  | 'explainability'
  | 'model-versions';

interface ResearchWorkspaceViewProps {
  initialTab?: string;
  onNavigateTab?: (tab: string) => void;
  onSwitchWorkspace?: () => void;
  currentUser?: User;
}

export const ResearchWorkspaceView: React.FC<ResearchWorkspaceViewProps> = ({
  initialTab = 'overview',
  onNavigateTab,
  onSwitchWorkspace,
  currentUser,
}) => {
  const { t } = useTranslation();

  // Normalize initial tab
  const normalizeTab = (t?: string): ResearchTab => {
    if (!t) return 'overview';
    if (t === 'research' || t === 'overview' || t === 'research-overview') return 'overview';
    if (t === 'models') return 'models';
    if (t === 'datasets') return 'datasets';
    if (t === 'experiments') return 'experiments';
    if (t === 'evaluation') return 'evaluation';
    if (t === 'explainability') return 'explainability';
    if (t === 'model-versions' || t === 'mlflow') return 'model-versions';
    if (t === 'architecture' || t === 'technology') return 'models';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<ResearchTab>(normalizeTab(initialTab));

  useEffect(() => {
    setActiveTab(normalizeTab(initialTab));
  }, [initialTab]);

  const handleSelectTab = (tab: ResearchTab) => {
    setActiveTab(tab);
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8">
      {/* 1. TOP RESEARCH WORKSPACE HEADER & CREDENTIALS BANNER */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2E2628] text-white">
                <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>RESEARCH WORKSPACE</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                <span>IRB #2024-AI-0418 · ACCREDITED</span>
              </span>
              <span className="text-[11px] font-mono text-[#8E7E81]">
                v2.4.0-ML Production
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Multimodal Validation & SaMD Research Laboratory
            </h1>

            <p className="text-xs sm:text-sm text-[#6E5C5F] max-w-3xl leading-relaxed">
              Authenticated investigator environment for Late Fusion model ablation, Grad-CAM attention inspection, TreeSHAP clinical attributions, and MLflow experiment governance.
            </p>

            {/* Investigator Identity Chip */}
            {currentUser && (
              <div className="pt-1 flex items-center gap-2 text-xs text-[#2E2628]">
                <div className="w-5 h-5 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name ? currentUser.name[0] : 'R'}
                </div>
                <span className="font-bold">{currentUser.name}</span>
                <span className="text-[#8E7E81]">·</span>
                <span className="text-[#6E5C5F]">{currentUser.organization || 'AIIMS / IISc Medical AI Lab'}</span>
                <span className="text-[#8E7E81]">·</span>
                <span className="text-[#EA580C] font-semibold">{currentUser.location || 'Medical Vision Division'}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onSwitchWorkspace && (
              <button
                type="button"
                onClick={onSwitchWorkspace}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] border border-[#EFE4DC] transition-colors cursor-pointer"
                title="Switch to Helper or Patient Portal"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Switch Portal</span>
              </button>
            )}

            <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#EFE4DC] text-center min-w-[95px]">
              <span className="text-[10px] text-[#9E8D91] block uppercase font-mono">Late Fusion AUC</span>
              <span className="text-lg font-mono font-bold text-[#EA580C]">0.942</span>
            </div>
            <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#EFE4DC] text-center min-w-[95px]">
              <span className="text-[10px] text-[#9E8D91] block uppercase font-mono">Multi-class QWK</span>
              <span className="text-lg font-mono font-bold text-[#2E2628]">0.884</span>
            </div>
          </div>
        </div>

        {/* 2. RESEARCH NAVIGATION TABS */}
        {/* Strictly: Research Overview | Models | Datasets | Experiments | Evaluation | Explainability | Model Versions */}
        <div className="flex items-center gap-1.5 border-t border-[#EFE4DC] mt-6 pt-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleSelectTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Research Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('models')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'models'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Models</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('datasets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'datasets'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Datasets</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('experiments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'experiments'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Experiments</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('evaluation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'evaluation'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Evaluation</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('explainability')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'explainability'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainability</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('model-versions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'model-versions'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FFFDFB] border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Model Versions</span>
          </button>
        </div>
      </div>

      {/* 3. TAB 1: RESEARCH OVERVIEW */}
      {activeTab === 'overview' && (
        <ResearchOverviewSection onNavigateTab={(t) => handleSelectTab(t as ResearchTab)} />
      )}

      {/* 4. TAB 2: MODELS */}
      {activeTab === 'models' && <ResearchModelsSection />}

      {/* 5. TAB 3: DATASETS */}
      {activeTab === 'datasets' && <DatasetsSection />}

      {/* 6. TAB 4: EXPERIMENTS */}
      {activeTab === 'experiments' && <AblationView />}

      {/* 7. TAB 5: EVALUATION */}
      {activeTab === 'evaluation' && <ResearchEvaluationSection />}

      {/* 8. TAB 6: EXPLAINABILITY (Grad-CAM + SHAP) */}
      {activeTab === 'explainability' && <ResearchExplainabilitySection />}

      {/* 9. TAB 7: MODEL VERSIONS (MLflow) */}
      {activeTab === 'model-versions' && <MLflowSection />}
    </div>
  );
};
