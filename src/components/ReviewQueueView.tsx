import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Cpu,
  Download,
  Edit3,
  Eye,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Tag,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { DR_GRADES } from '../data/benchmarks';
import { generateFundusSvg, generateOctSvg } from '../data/sampleCases';
import { MOCK_REVIEW_QUEUE_ITEMS } from '../mock/mockData';
import {
  DRGrade,
  MultimodalTriageResult,
  QualityStatus,
  ResponsibleAiUncertaintyState,
} from '../types';
import { RESPONSIBLE_AI_UNCERTAINTY_QUOTE } from '../utils/uncertaintyEngine';
import { ResponsibleAiUncertaintyIndicator } from './ResponsibleAiUncertaintyIndicator';
import { RiskChip } from './RiskChip';
import { useTranslation } from '../i18n/I18nContext';

export interface QueueItem {
  id: string;
  patientCode: string;
  patientName: string;
  patientAge: number;
  gender: string;
  encounterDate: string;
  facility: string;
  qualityStatus: QualityStatus;
  fundusGrade: DRGrade;
  finalGrade: DRGrade;
  dmeDetected: boolean;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  status: 'Pending' | 'Approved' | 'Overridden' | 'Referred' | 'Retake Requested';
  reviewerNotes?: string;
  uncertaintyState?: ResponsibleAiUncertaintyState;
  triageResult: MultimodalTriageResult;
}

interface ReviewQueueViewProps {
  history: MultimodalTriageResult[];
  onSelectCase: (result: MultimodalTriageResult) => void;
  onNavigateStartScreening: () => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  history,
  onSelectCase,
  onNavigateStartScreening,
}) => {
  const { t } = useTranslation();
  const initialQueueItems = MOCK_REVIEW_QUEUE_ITEMS;

  // Merge live session history items with mock items
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const fromHistory: QueueItem[] = history.map((h, idx) => ({
      id: `LIVE-${h.sessionId.slice(0, 6)}`,
      patientCode: h.patientId,
      patientName: h.patientName || `Patient ${h.patientId}`,
      patientAge: h.clinicalInput.age,
      gender: 'Not Specified',
      encounterDate: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      facility: 'Current Screening Session',
      qualityStatus: 'GOOD',
      fundusGrade: h.fundus.grade,
      finalGrade: h.finalGrade,
      dmeDetected: h.oct.dmeDetected,
      confidence: h.confidence,
      status: 'Pending',
      triageResult: h,
    }));
    return [...fromHistory, ...initialQueueItems];
  });

  const [activeTab, setActiveTab] = useState<
    'all' | 'priority' | 'review' | 'low_concern' | 'ungradable'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inspect Modal State
  const [selectedCaseForReview, setSelectedCaseForReview] = useState<QueueItem | null>(null);
  const [showTechnicalResearch, setShowTechnicalResearch] = useState<boolean>(false);
  const [inspectFundusMode, setInspectFundusMode] = useState<'normal' | 'gradcam'>('normal');

  // Override Modal State
  const [selectedCaseForOverride, setSelectedCaseForOverride] = useState<QueueItem | null>(null);
  const [overrideGrade, setOverrideGrade] = useState<DRGrade>(2);
  const [overrideNote, setOverrideNote] = useState('');

  // Counts
  const totalCount = queue.length;
  const priorityCount = queue.filter((q) => q.finalGrade >= 3 || q.dmeDetected).length;
  const reviewCount = queue.filter((q) => q.finalGrade === 2 || q.qualityStatus === 'UNCERTAIN').length;
  const lowConcernCount = queue.filter((q) => q.finalGrade <= 1 && q.qualityStatus === 'GOOD').length;
  const ungradableCount = queue.filter((q) => q.qualityStatus === 'UNGRADABLE').length;

  // Filtered list
  const filteredQueue = queue.filter((item) => {
    if (activeTab === 'priority' && item.finalGrade < 3 && !item.dmeDetected) return false;
    if (activeTab === 'review' && (item.finalGrade !== 2 && item.qualityStatus !== 'UNCERTAIN')) return false;
    if (activeTab === 'low_concern' && (item.finalGrade > 1 || item.qualityStatus !== 'GOOD')) return false;
    if (activeTab === 'ungradable' && item.qualityStatus !== 'UNGRADABLE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.patientCode.toLowerCase().includes(q) ||
        item.patientName.toLowerCase().includes(q) ||
        item.facility.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action handlers
  const handleApprove = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Approved', reviewerNotes: 'Clinically audited and confirmed by helper/clinician.' }
          : item
      )
    );
    if (selectedCaseForReview?.id === id) {
      setSelectedCaseForReview((prev) => prev ? { ...prev, status: 'Approved', reviewerNotes: 'Clinically audited and confirmed by helper/clinician.' } : null);
    }
  };

  const handleDispatchReferral = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Referred', reviewerNotes: 'Specialist referral token dispatched to regional eye clinic.' }
          : item
      )
    );
    if (selectedCaseForReview?.id === id) {
      setSelectedCaseForReview((prev) => prev ? { ...prev, status: 'Referred', reviewerNotes: 'Specialist referral token dispatched to regional eye clinic.' } : null);
    }
  };

  const handleRequestRetake = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Retake Requested', reviewerNotes: 'Recapture requested due to inadequate illumination or focus.' }
          : item
      )
    );
    if (selectedCaseForReview?.id === id) {
      setSelectedCaseForReview((prev) => prev ? { ...prev, status: 'Retake Requested', reviewerNotes: 'Recapture requested due to inadequate illumination or focus.' } : null);
    }
  };

  const handleSaveOverride = () => {
    if (!selectedCaseForOverride) return;
    setQueue((prev) =>
      prev.map((item) =>
        item.id === selectedCaseForOverride.id
          ? {
              ...item,
              finalGrade: overrideGrade,
              status: 'Overridden',
              reviewerNotes: overrideNote || `Overridden from Grade ${item.finalGrade} to Grade ${overrideGrade}.`,
            }
          : item
      )
    );
    if (selectedCaseForReview?.id === selectedCaseForOverride.id) {
      setSelectedCaseForReview((prev) =>
        prev
          ? {
              ...prev,
              finalGrade: overrideGrade,
              status: 'Overridden',
              reviewerNotes: overrideNote || `Overridden to Grade ${overrideGrade}.`,
            }
          : null
      );
    }
    setSelectedCaseForOverride(null);
    setOverrideNote('');
  };

  const openReviewModal = (item: QueueItem) => {
    setSelectedCaseForReview(item);
    setShowTechnicalResearch(false);
    setInspectFundusMode('normal');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 px-2 sm:px-4" id="review-queue-view-root">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#FFE5D8] text-[#F05A28] border border-[#FED7AA]">
                <FileCheck className="w-3.5 h-3.5 text-[#F05A28]" />
                <span>Screening Helper Workflow</span>
              </span>
              <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#047857] px-2.5 py-1 rounded-md border border-[#A7F3D0]">
                DEMO VERIFIED WORKSPACE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2024] tracking-tight">
              Review Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6267] mt-1 max-w-2xl leading-relaxed">
              Frontline adjudication queue for screening encounters. Validate automated clarity scores, examine clinical risk output, confirm recommendations, or dispatch specialist referrals.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onNavigateStartScreening}
              className="bg-[#F05A28] hover:bg-[#D84818] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-orange-100" />
              <span>Start Screening</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#2B2024] text-white border-[#2B2024] shadow-xs'
              : 'bg-white text-[#6F6267] border-[#EFE4DC] hover:bg-[#FAF8F6]'
          }`}
        >
          <span>All Encounters</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('priority')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
            activeTab === 'priority'
              ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
              : 'bg-white text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Referral Recommended</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {priorityCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
            activeTab === 'review'
              ? 'bg-[#D97706] text-white border-[#D97706] shadow-xs'
              : 'bg-white text-[#D97706] border-[#FCD34D] hover:bg-[#FFFBEB]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Awaiting Review</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {reviewCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('low_concern')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
            activeTab === 'low_concern'
              ? 'bg-[#15803D] text-white border-[#15803D] shadow-xs'
              : 'bg-white text-[#15803D] border-[#86EFAC] hover:bg-[#F0FDF4]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Low Concern / Routine</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {lowConcernCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ungradable')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
            activeTab === 'ungradable'
              ? 'bg-[#6F6267] text-white border-[#6F6267] shadow-xs'
              : 'bg-white text-[#6F6267] border-[#EFE4DC] hover:bg-[#FAF8F6]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ungradable (Retake)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {ungradableCount}
          </span>
        </button>
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EFE4DC] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8E7E81] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case ID, patient name, facility..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2B2024] focus:outline-none focus:border-[#F05A28]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6F6267] w-full sm:w-auto justify-between sm:justify-end">
          <span>
            Showing <strong className="text-[#2B2024]">{filteredQueue.length}</strong> cases
          </span>
          <span className="text-[11px] px-2 py-0.5 bg-[#FAF8F6] rounded-md border border-[#EFE4DC]">
            Auto-refresh: 15s
          </span>
        </div>
      </div>

      {/* TABLE: REQUIRED 6 COLUMNS
          1. Case ID
          2. Time
          3. Image quality
          4. Screening status
          5. Priority/status
          6. Next action
      */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F6] border-b border-[#EFE4DC] text-[11px] font-bold text-[#6F6267] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Image quality</th>
                <th className="py-3.5 px-4">Screening status</th>
                <th className="py-3.5 px-4">Priority / Status</th>
                <th className="py-3.5 px-4 text-right">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DC]">
              {filteredQueue.length > 0 ? (
                filteredQueue.map((item) => {
                  const gradeInfo = DR_GRADES[item.finalGrade];
                  const isUngradable = item.qualityStatus === 'UNGRADABLE';
                  const isPending = item.status === 'Pending';
                  const isHighPriority = item.finalGrade >= 3 || item.dmeDetected;
                  const isModerate = item.finalGrade === 2;

                  return (
                    <tr key={item.id} className="hover:bg-[#FFFDF9] transition-colors">
                      {/* 1. Case ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#2B2024] text-xs bg-[#F5EFEB] px-2 py-0.5 rounded">
                            {item.patientCode}
                          </span>
                          <span className="font-bold text-[#2B2024] text-xs">
                            {item.patientName}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8E7E81] mt-0.5 flex items-center gap-1.5">
                          <span>Age {item.patientAge}y</span>
                          <span>·</span>
                          <span>{item.facility}</span>
                        </div>
                      </td>

                      {/* 2. Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-[#2B2024] font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#F05A28]" />
                          <span>{item.encounterDate}</span>
                        </div>
                        <div className="text-[10px] text-[#8E7E81]">Today's Field Intake</div>
                      </td>

                      {/* 3. Image quality */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                            item.qualityStatus === 'GOOD'
                              ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                              : item.qualityStatus === 'UNCERTAIN'
                              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]'
                              : 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]'
                          }`}
                        >
                          {item.qualityStatus === 'GOOD' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>
                            {item.qualityStatus === 'GOOD'
                              ? 'Good (Gradeable)'
                              : item.qualityStatus === 'UNCERTAIN'
                              ? 'Suboptimal Focus'
                              : 'Ungradable (Retake)'}
                          </span>
                        </span>
                      </td>

                      {/* 4. Screening status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#2B2024] text-xs">
                              AI Support Generated
                            </span>
                            <span className="text-[10px] text-[#6F6267] font-mono">
                              ({gradeInfo.name.split(' (')[0]})
                            </span>
                          </div>
                          {item.dmeDetected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>Macular Edema Detected</span>
                            </span>
                          )}
                          {!item.dmeDetected && (
                            <span className="text-[10px] text-[#8E7E81] block">
                              No active macular edema
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Priority/status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {isUngradable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#F5EFEB] text-[#6F6267] border border-[#EFE4DC]">
                              <RotateCcw className="w-3 h-3" />
                              <span>Retake Needed</span>
                            </span>
                          ) : isHighPriority ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                              <AlertCircle className="w-3 h-3" />
                              <span>Referral Recommended</span>
                            </span>
                          ) : isModerate ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Review Recommended</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Low Concern / Routine</span>
                            </span>
                          )}

                          <div className="text-[10px] text-[#8E7E81]">
                            Status: <strong className="text-[#2B2024]">{item.status}</strong>
                          </div>
                        </div>
                      </td>

                      {/* 6. Next action */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Primary: Inspect & Review Case */}
                        <button
                          type="button"
                          onClick={() => openReviewModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFE5D8] border border-[#EFE4DC] hover:border-[#F05A28] text-[#2B2024] hover:text-[#F05A28] text-xs font-bold transition-colors cursor-pointer"
                        >
                          Review Case
                        </button>

                        {/* Quick Approve button for pending low concern */}
                        {isPending && !isUngradable && !isHighPriority && (
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                            title="Approve screening support output"
                          >
                            Approve
                          </button>
                        )}

                        {/* Quick Referral button for priority */}
                        {isHighPriority && item.status !== 'Referred' && (
                          <button
                            type="button"
                            onClick={() => handleDispatchReferral(item.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                            title="Dispatch specialist referral"
                          >
                            Dispatch Referral
                          </button>
                        )}

                        {/* Override button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCaseForOverride(item);
                            setOverrideGrade(item.finalGrade);
                          }}
                          className="p-1.5 rounded-xl text-[#8E7E81] hover:bg-[#FAF8F6] hover:text-[#2B2024] border border-transparent hover:border-[#EFE4DC] cursor-pointer"
                          title="Override Grade or Adjust Notes"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Flag Retake button */}
                        {isUngradable && item.status !== 'Retake Requested' && (
                          <button
                            type="button"
                            onClick={() => handleRequestRetake(item.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                          >
                            Flag Retake
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6F6267]">
                    <FileCheck className="w-8 h-8 text-[#8E7E81]/50 mx-auto mb-2" />
                    <div className="font-bold text-[#2B2024]">No cases matching filter</div>
                    <p className="text-xs mt-1">Try selecting a different filter tab or clearing search keywords.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          CASE INSPECTION MODAL
          Standard view exposes clean photographic images & clinical recommendations.
          DO NOT EXPOSE RESEARCH FEATURES (Grad-CAM, SHAP, model details) BY DEFAULT.
          ========================================================================= */}
      {selectedCaseForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#EFE4DC] p-5 sm:p-7 max-w-4xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#EFE4DC] gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFE5D8] text-[#F05A28] rounded border border-[#FED7AA]">
                    {selectedCaseForReview.patientCode}
                  </span>
                  <RiskChip grade={selectedCaseForReview.finalGrade} size="sm" />
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedCaseForReview.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedCaseForReview.status === 'Referred'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : selectedCaseForReview.status === 'Retake Requested'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {selectedCaseForReview.status}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2B2024] mt-1">
                  {selectedCaseForReview.patientName} · Clinical Review Encounter
                </h2>
                <div className="text-xs text-[#6F6267] mt-0.5">
                  Age {selectedCaseForReview.patientAge}y · Encounter Time: {selectedCaseForReview.encounterDate} · Site: {selectedCaseForReview.facility}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCaseForReview(null)}
                className="p-1.5 rounded-xl text-[#8E7E81] hover:bg-[#FAF8F6] hover:text-[#2B2024] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Standard Clinical Images (Original Photographic View by Default) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fundus Image Card */}
              <div className="bg-[#FAF8F6] p-4 rounded-2xl border border-[#EFE4DC] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-[#2B2024] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#F05A28]" />
                    <span>Retinal Fundus Photography</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedCaseForReview.qualityStatus === 'GOOD'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedCaseForReview.qualityStatus === 'GOOD' ? 'Gradeable (Pass)' : 'Suboptimal'}
                  </span>
                </div>

                <div className="aspect-square rounded-xl overflow-hidden bg-black/90 flex items-center justify-center relative">
                  <img
                    src={generateFundusSvg(selectedCaseForReview.finalGrade, inspectFundusMode)}
                    alt="Fundus view"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded font-mono">
                    {inspectFundusMode === 'normal' ? 'Original Photographic View' : 'AI Attention Heatmap'}
                  </div>
                </div>

                <p className="text-[11px] text-[#6F6267]">
                  Macula & optic disc centering verified. Non-mydriatic 45° field coverage.
                </p>
              </div>

              {/* OCT / Cross-section Scan Card */}
              <div className="bg-[#FAF8F6] p-4 rounded-2xl border border-[#EFE4DC] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-[#2B2024] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F05A28]" />
                    <span>OCT Cross-Sectional Scan</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedCaseForReview.dmeDetected
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {selectedCaseForReview.dmeDetected ? '⚠️ Macular Edema' : 'No Foveal Fluid'}
                  </span>
                </div>

                <div className="aspect-square rounded-xl overflow-hidden bg-black/90 flex items-center justify-center relative">
                  <img
                    src={generateOctSvg(selectedCaseForReview.dmeDetected, 'scan')}
                    alt="OCT B-scan"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded font-mono">
                    High-Definition B-Scan
                  </div>
                </div>

                <p className="text-[11px] text-[#6F6267]">
                  {selectedCaseForReview.dmeDetected
                    ? 'Subretinal and intraretinal fluid detected in central subfield.'
                    : 'Foveal contour preserved without evidence of cystoid macular edema.'}
                </p>
              </div>
            </div>

            {/* AI Screening Support Summary */}
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#FED7AA] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#F05A28]" />
                  <h3 className="font-bold text-sm text-[#2B2024]">
                    AI-Assisted Screening Support Findings
                  </h3>
                </div>
                <span className="text-[11px] text-[#6F6267] italic">
                  Non-diagnostic screening support for qualified personnel review
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#EFE4DC]">
                  <span className="text-[10px] text-[#8E7E81] uppercase font-bold block">Assigned Risk</span>
                  <div className="font-bold text-[#2B2024] text-sm mt-0.5">
                    Grade {selectedCaseForReview.finalGrade}: {DR_GRADES[selectedCaseForReview.finalGrade].name}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#EFE4DC]">
                  <span className="text-[10px] text-[#8E7E81] uppercase font-bold block">Macular Edema</span>
                  <div className="font-bold text-sm mt-0.5 text-red-600">
                    {selectedCaseForReview.dmeDetected ? 'Positive for Edema' : 'None Detected'}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#EFE4DC]">
                  <span className="text-[10px] text-[#8E7E81] uppercase font-bold block">Recommended Action</span>
                  <div className="font-bold text-sm mt-0.5 text-[#F05A28]">
                    {selectedCaseForReview.finalGrade >= 3 || selectedCaseForReview.dmeDetected
                      ? 'Referral Recommended'
                      : selectedCaseForReview.finalGrade === 2
                      ? 'Review Recommended'
                      : 'Routine 1-Year Follow-up'}
                  </div>
                </div>
              </div>
            </div>

            {/* RESEARCH TOOLS & EXPLAINABILITY (COLLAPSED BY DEFAULT)
                Only appear when clicked or when clinically/workflow relevant
            */}
            <div className="border border-[#EFE4DC] rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowTechnicalResearch(!showTechnicalResearch)}
                className="w-full flex items-center justify-between p-4 bg-[#FAF8F6] hover:bg-[#F5EFEB] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#8E7E81]" />
                  <span className="text-xs font-bold text-[#2B2024]">
                    Technical & Research Details (Grad-CAM, SHAP, Model Details)
                  </span>
                  <span className="text-[10px] font-semibold text-[#8E7E81] bg-white px-2 py-0.5 rounded border border-[#EFE4DC]">
                    Optional
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6F6267]">
                  <span>{showTechnicalResearch ? 'Hide Technical Explanation' : 'View Technical Explanation'}</span>
                  {showTechnicalResearch ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {showTechnicalResearch && (
                <div className="p-5 border-t border-[#EFE4DC] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs border-b border-[#EFE4DC] pb-3 flex-wrap gap-2">
                    <div>
                      <div className="font-bold text-[#2B2024]">Grad-CAM Attention Heatmap</div>
                      <p className="text-[11px] text-[#6F6267]">
                        Highlighted areas show regions that contributed to the AI-assisted output.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectFundusMode('normal')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                          inspectFundusMode === 'normal'
                            ? 'bg-[#2B2024] text-white border-[#2B2024]'
                            : 'bg-white text-[#6F6267] border-[#EFE4DC]'
                        }`}
                      >
                        Original
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectFundusMode('gradcam')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                          inspectFundusMode === 'gradcam'
                            ? 'bg-[#F05A28] text-white border-[#F05A28]'
                            : 'bg-white text-[#6F6267] border-[#EFE4DC]'
                        }`}
                      >
                        Grad-CAM Overlay
                      </button>
                    </div>
                  </div>

                  {/* Model architecture details */}
                  <div className="bg-[#FAF8F6] p-3.5 rounded-xl border border-[#EFE4DC] space-y-1.5 text-xs">
                    <span className="font-bold text-[#2B2024] block">Model Architecture & Explainability Specifications:</span>
                    <ul className="list-disc list-inside space-y-1 text-[#6F6267] text-[11px]">
                      <li><strong>Architecture:</strong> Multimodal CNN + Vision Transformer with Cross-Attention Fusion</li>
                      <li><strong>Feature Attribution:</strong> TreeExplainer SHAP & Gradient-weighted Class Activation Mapping (Grad-CAM)</li>
                      <li><strong>Modality:</strong> 45° Non-Mydriatic Fundus (512x512) paired with Spectral-Domain OCT B-scan</li>
                      <li><strong>Quality Gate:</strong> Automated focus, illumination, and macular centering evaluation</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Controls */}
            <div className="pt-3 border-t border-[#EFE4DC] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCaseForOverride(selectedCaseForReview);
                    setOverrideGrade(selectedCaseForReview.finalGrade);
                  }}
                  className="px-3 py-2 rounded-xl border border-[#EFE4DC] hover:border-[#F05A28] text-[#2B2024] hover:text-[#F05A28] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Override Grade</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCase(selectedCaseForReview.triageResult)}
                  className="px-3 py-2 rounded-xl border border-[#EFE4DC] hover:bg-[#FAF8F6] text-[#6F6267] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Open Full Clinical Report
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRequestRetake(selectedCaseForReview.id)}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Request Retake
                </button>

                {selectedCaseForReview.finalGrade >= 3 || selectedCaseForReview.dmeDetected ? (
                  <button
                    type="button"
                    onClick={() => handleDispatchReferral(selectedCaseForReview.id)}
                    className="px-4 py-2 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Specialist Referral</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedCaseForReview.id)}
                    className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Screening Result</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Override Grade Modal */}
      {selectedCaseForOverride && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#F05A28]" />
                <h3 className="font-bold text-[#2B2024] text-sm">
                  Clinical Grade Override · {selectedCaseForOverride.patientCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaseForOverride(null)}
                className="p-1 rounded-lg text-[#8E7E81] hover:bg-[#FAF8F6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6F6267] leading-relaxed">
              As a qualified healthcare personnel or supervisory helper, you may adjust the automated classification based on ophthalmoscopic judgment. This will be stamped into the clinical audit trail.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2B2024] block">Select Adjusted ICDR Grade:</label>
              <div className="grid grid-cols-1 gap-2">
                {([0, 1, 2, 3, 4] as DRGrade[]).map((g) => (
                  <label
                    key={g}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      overrideGrade === g
                        ? 'border-[#F05A28] bg-[#FFE5D8]'
                        : 'border-[#EFE4DC] hover:bg-[#FAF8F6]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="override_grade"
                        value={g}
                        checked={overrideGrade === g}
                        onChange={() => setOverrideGrade(g)}
                        className="text-[#F05A28] focus:ring-[#F05A28]"
                      />
                      <span className="text-xs font-bold text-[#2B2024]">
                        Grade {g}: {DR_GRADES[g].name}
                      </span>
                    </div>
                    <RiskChip grade={g} size="sm" />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2B2024] block">Clinical Justification / Audit Note:</label>
              <textarea
                rows={2}
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="e.g. Slit-lamp biomicroscopy reveals subtle macular edema not captured on 2D photo..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#EFE4DC] focus:outline-none focus:border-[#F05A28]"
              />
            </div>

            <div className="pt-3 border-t border-[#EFE4DC] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCaseForOverride(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6F6267] hover:bg-[#FAF8F6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverride}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F05A28] text-white hover:bg-[#D84818] shadow-2xs cursor-pointer"
              >
                Save Override & Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
