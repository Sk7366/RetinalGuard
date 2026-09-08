import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  Eye,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Tag,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { DR_GRADES } from '../data/benchmarks';
import { PRESET_CASES } from '../data/sampleCases';
import { DRGrade, MultimodalTriageResult, QualityStatus } from '../types';
import { RiskChip } from './RiskChip';

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
  // Built-in simulated queue records combined with any newly added history
  const initialQueueItems: QueueItem[] = [
    {
      id: 'Q-2026-091',
      patientCode: 'PT-8831',
      patientName: 'Devi Sundaram',
      patientAge: 62,
      gender: 'Female',
      encounterDate: 'Today, 09:45 AM',
      facility: 'Kengeri PHC Outreach Unit',
      qualityStatus: 'GOOD',
      fundusGrade: 3,
      finalGrade: 3,
      dmeDetected: true,
      confidence: 'HIGH',
      status: 'Pending',
      triageResult: PRESET_CASES[2].expectedTriage,
    },
    {
      id: 'Q-2026-092',
      patientCode: 'PT-7104',
      patientName: 'Mohan Kumar',
      patientAge: 54,
      gender: 'Male',
      encounterDate: 'Today, 10:12 AM',
      facility: 'Dharavi Mobile Screening Van',
      qualityStatus: 'UNCERTAIN',
      fundusGrade: 2,
      finalGrade: 2,
      dmeDetected: false,
      confidence: 'MODERATE',
      status: 'Pending',
      reviewerNotes: 'Subtle motion blur along superior arcade; fovea still legible.',
      triageResult: PRESET_CASES[1].expectedTriage,
    },
    {
      id: 'Q-2026-093',
      patientCode: 'PT-5529',
      patientName: 'Fatima Begum',
      patientAge: 49,
      gender: 'Female',
      encounterDate: 'Today, 10:30 AM',
      facility: 'Victoria Regional Outpatient Unit',
      qualityStatus: 'UNGRADABLE',
      fundusGrade: 1,
      finalGrade: 1,
      dmeDetected: false,
      confidence: 'LOW',
      status: 'Retake Requested',
      reviewerNotes: 'Corneal glare arc obscured 40% of optic disc and macula.',
      triageResult: PRESET_CASES[0].expectedTriage,
    },
    {
      id: 'Q-2026-094',
      patientCode: 'PT-9941',
      patientName: 'Ramesh Patel',
      patientAge: 58,
      gender: 'Male',
      encounterDate: 'Today, 11:05 AM',
      facility: 'Kengeri PHC Outreach Unit',
      qualityStatus: 'GOOD',
      fundusGrade: 2,
      finalGrade: 2,
      dmeDetected: true,
      confidence: 'HIGH',
      status: 'Pending',
      triageResult: PRESET_CASES[2].expectedTriage,
    },
    {
      id: 'Q-2026-095',
      patientCode: 'PT-3312',
      patientName: 'Anil Deshmukh',
      patientAge: 67,
      gender: 'Male',
      encounterDate: 'Today, 11:40 AM',
      facility: 'Sankara Nethralaya Community Clinic',
      qualityStatus: 'GOOD',
      fundusGrade: 4,
      finalGrade: 4,
      dmeDetected: true,
      confidence: 'HIGH',
      status: 'Pending',
      triageResult: PRESET_CASES[3].expectedTriage,
    },
    {
      id: 'Q-2026-096',
      patientCode: 'PT-1049',
      patientName: 'Sunita Rao',
      patientAge: 45,
      gender: 'Female',
      encounterDate: 'Today, 12:15 PM',
      facility: 'AIIMS Rural Outreach Center',
      qualityStatus: 'GOOD',
      fundusGrade: 0,
      finalGrade: 0,
      dmeDetected: false,
      confidence: 'HIGH',
      status: 'Approved',
      triageResult: PRESET_CASES[0].expectedTriage,
    },
  ];

  // Merge with live session history items
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
    // Tab filter
    if (activeTab === 'priority' && item.finalGrade < 3 && !item.dmeDetected) return false;
    if (activeTab === 'review' && (item.finalGrade !== 2 && item.qualityStatus !== 'UNCERTAIN')) return false;
    if (activeTab === 'low_concern' && (item.finalGrade > 1 || item.qualityStatus !== 'GOOD')) return false;
    if (activeTab === 'ungradable' && item.qualityStatus !== 'UNGRADABLE') return false;

    // Search filter
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

  // Actions
  const handleApprove = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Approved', reviewerNotes: 'Clinically audited and confirmed by provider.' }
          : item
      )
    );
  };

  const handleRequestRetake = (id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Retake Requested',
              reviewerNotes: 'Flagged for patient call-back and camera recapture due to image quality.',
            }
          : item
      )
    );
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
              reviewerNotes: overrideNote || `Physician adjusted AI grade to Grade ${overrideGrade}.`,
            }
          : item
      )
    );
    setSelectedCaseForOverride(null);
    setOverrideNote('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16" id="review-queue-root">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#EA580C]">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Ophthalmology Triage Worklist</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                SIMULATED DATA · Daily Clinical Queue
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Clinical Review Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-2xl leading-relaxed">
              High-throughput physician adjudication workspace for field screenings. Inspect AI Grad-CAM heatmaps, verify OCT fluid presence, approve recommendations, or adjust classifications.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onNavigateStartScreening}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start New Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Filter Tabs with Live Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-[#2E2628] text-white border-[#2E2628] shadow-xs'
              : 'bg-white text-[#6E5C5F] border-[#EFE4DC] hover:bg-[#FAF8F6]'
          }`}
        >
          <span>All Encounters</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('priority')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTab === 'priority'
              ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
              : 'bg-white text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Priority Specialist Referrals</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {priorityCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTab === 'review'
              ? 'bg-[#D97706] text-white border-[#D97706] shadow-xs'
              : 'bg-white text-[#D97706] border-[#FCD34D] hover:bg-[#FFFBEB]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Review Recommended</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {reviewCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('low_concern')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
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
          onClick={() => setActiveTab('ungradable')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
            activeTab === 'ungradable'
              ? 'bg-[#6E5C5F] text-white border-[#6E5C5F] shadow-xs'
              : 'bg-white text-[#6E5C5F] border-[#EFE4DC] hover:bg-[#FAF8F6]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ungradable (Retake)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {ungradableCount}
          </span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE4DC] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6E5C5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient code, name, facility..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6E5C5F] w-full sm:w-auto justify-between sm:justify-end">
          <span>
            Showing <strong className="text-[#2E2628]">{filteredQueue.length}</strong> patient records
          </span>
          <span className="text-[11px] px-2 py-0.5 bg-[#FAF8F6] rounded-md border border-[#EFE4DC]">
            Auto-refresh: 15s
          </span>
        </div>
      </div>

      {/* Queue Items Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F6] border-b border-[#EFE4DC] text-[11px] font-bold text-[#6E5C5F] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Patient &amp; Code</th>
                <th className="py-3.5 px-4">Encounter / Site</th>
                <th className="py-3.5 px-4">Quality Gate</th>
                <th className="py-3.5 px-4">AI Classification</th>
                <th className="py-3.5 px-4">OCT DME Status</th>
                <th className="py-3.5 px-4">Review Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4DC]">
              {filteredQueue.length > 0 ? (
                filteredQueue.map((item) => {
                  const gradeInfo = DR_GRADES[item.finalGrade];
                  const isUngradable = item.qualityStatus === 'UNGRADABLE';
                  const isPending = item.status === 'Pending';

                  return (
                    <tr key={item.id} className="hover:bg-[#FFFDFB] transition-colors">
                      {/* Patient & Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2E2628] text-sm">{item.patientName}</div>
                        <div className="text-[11px] text-[#6E5C5F] font-mono mt-0.5 flex items-center gap-1.5">
                          <span>{item.patientCode}</span>
                          <span>·</span>
                          <span>{item.patientAge}y</span>
                          <span>·</span>
                          <span>{item.gender}</span>
                        </div>
                      </td>

                      {/* Encounter / Site */}
                      <td className="py-3.5 px-4">
                        <div className="text-[#2E2628] font-medium">{item.facility}</div>
                        <div className="text-[11px] text-[#6E5C5F] mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#6E5C5F]" />
                          <span>{item.encounterDate}</span>
                        </div>
                      </td>

                      {/* Quality Gate */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.qualityStatus === 'GOOD'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : item.qualityStatus === 'UNCERTAIN'
                              ? 'bg-[#FEF3C7] text-[#B45309]'
                              : 'bg-[#FEE2E2] text-[#B91C1C]'
                          }`}
                        >
                          {item.qualityStatus === 'GOOD' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>{item.qualityStatus}</span>
                        </span>
                      </td>

                      {/* AI Classification */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <RiskChip grade={item.finalGrade} size="sm" />
                          <div>
                            <span className="font-bold text-[#2E2628] block">
                              Grade {item.finalGrade}
                            </span>
                            <span className="text-[10px] text-[#6E5C5F]">
                              {gradeInfo.name.split(' (')[0]}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* OCT DME Status */}
                      <td className="py-3.5 px-4">
                        {item.dmeDetected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                            <AlertCircle className="w-3 h-3" />
                            <span>DME Fluid Present</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F5F1ED] text-[#6E5C5F]">
                            <span>No Foveal Fluid</span>
                          </span>
                        )}
                      </td>

                      {/* Review Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            item.status === 'Approved'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : item.status === 'Overridden'
                              ? 'bg-[#E0E7FF] text-[#4338CA]'
                              : item.status === 'Retake Requested'
                              ? 'bg-[#FEF2F2] text-[#DC2626]'
                              : 'bg-[#FFF7ED] text-[#C2410C]'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.reviewerNotes && (
                          <div className="text-[10px] text-[#6E5C5F] mt-1 max-w-xs truncate" title={item.reviewerNotes}>
                            {item.reviewerNotes}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Inspect full case */}
                        <button
                          type="button"
                          onClick={() => onSelectCase(item.triageResult)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F6] text-[#2E2628] hover:bg-[#FFF7ED] hover:text-[#EA580C] hover:border-[#EA580C] border border-[#EFE4DC] text-xs font-semibold transition-colors"
                          title="View Grad-CAM and complete multimodal triage"
                        >
                          Inspect Scan
                        </button>

                        {/* Quick Approve button */}
                        {isPending && !isUngradable && (
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#15803D] text-white hover:bg-[#166534] text-xs font-semibold transition-colors shadow-2xs"
                            title="Approve AI triage assessment"
                          >
                            Approve
                          </button>
                        )}

                        {/* Override button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCaseForOverride(item);
                            setOverrideGrade(item.finalGrade);
                          }}
                          className="p-1.5 rounded-xl text-[#6E5C5F] hover:bg-[#FAF8F6] hover:text-[#2E2628] border border-transparent hover:border-[#EFE4DC]"
                          title="Override Grade or Adjust Rationale"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Mark Retake button */}
                        {isUngradable && item.status !== 'Retake Requested' && (
                          <button
                            type="button"
                            onClick={() => handleRequestRetake(item.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#DC2626] text-white hover:bg-[#B91C1C] text-xs font-semibold transition-colors shadow-2xs"
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
                  <td colSpan={7} className="py-12 text-center text-[#6E5C5F]">
                    <FileCheck className="w-8 h-8 text-[#6E5C5F]/50 mx-auto mb-2" />
                    <div className="font-bold text-[#2E2628]">No cases matching current filter</div>
                    <p className="text-xs mt-1">Try selecting a different tab or clearing search keywords.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Grade Modal */}
      {selectedCaseForOverride && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EFE4DC] p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#EA580C]" />
                <h3 className="font-bold text-[#2E2628] text-sm">
                  Clinical Grade Override · {selectedCaseForOverride.patientCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaseForOverride(null)}
                className="p-1 rounded-lg text-[#6E5C5F] hover:bg-[#FAF8F6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6E5C5F] leading-relaxed">
              As the supervising clinician, you may adjust the automated classification based on ophthalmoscopic judgment. This will be stamped into the clinical audit trail.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2E2628] block">Select Adjusted ICDR Grade:</label>
              <div className="grid grid-cols-1 gap-2">
                {([0, 1, 2, 3, 4] as DRGrade[]).map((g) => (
                  <label
                    key={g}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      overrideGrade === g
                        ? 'border-[#EA580C] bg-[#FFF7ED]'
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
                        className="text-[#EA580C] focus:ring-[#EA580C]"
                      />
                      <span className="text-xs font-bold text-[#2E2628]">
                        Grade {g}: {DR_GRADES[g].name}
                      </span>
                    </div>
                    <RiskChip grade={g} size="sm" />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2E2628] block">Clinical Justification / Audit Note:</label>
              <textarea
                rows={2}
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="e.g. Slit-lamp biomicroscopy reveals subtle macular edema not captured on 2D photo..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#EFE4DC] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div className="pt-3 border-t border-[#EFE4DC] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCaseForOverride(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6E5C5F] hover:bg-[#FAF8F6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOverride}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#EA580C] text-white hover:bg-[#C2410C] shadow-2xs"
              >
                Save Override &amp; Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
