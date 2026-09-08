import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Layers,
  Search,
  Send,
  Sparkles,
  Stethoscope,
  UserCheck,
} from 'lucide-react';
import { DR_GRADES } from '../data/benchmarks';
import { MultimodalTriageResult } from '../types';
import { RiskChip } from './RiskChip';

interface ProviderReviewQueueProps {
  history: MultimodalTriageResult[];
  onSelectResult: (result: MultimodalTriageResult) => void;
  onDispatchReferral?: (result: MultimodalTriageResult) => void;
}

interface ReviewCaseItem {
  id: string;
  result: MultimodalTriageResult;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  physicianNotes?: string;
  priority: 'urgent' | 'moderate' | 'routine';
}

export const ProviderReviewQueue: React.FC<ProviderReviewQueueProps> = ({
  history,
  onSelectResult,
  onDispatchReferral,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseForNote, setSelectedCaseForNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Local simulated queue state initialized with history
  const [queueItems, setQueueItems] = useState<ReviewCaseItem[]>(() =>
    history.map((h, idx) => ({
      id: h.patientId,
      result: h,
      reviewed: idx > 2, // First 3 are pending review
      reviewedBy: idx > 2 ? 'Dr. S. Nair, MD (Ophthal)' : undefined,
      reviewedAt: idx > 2 ? 'Today, 10:15 AM' : undefined,
      physicianNotes:
        idx > 2
          ? 'Concordant with clinical OCT presentation. Anti-VEGF consult recommended.'
          : undefined,
      priority: h.finalGrade >= 3 || h.oct.dmeDetected ? 'urgent' : h.finalGrade === 2 ? 'moderate' : 'routine',
    }))
  );

  const handleSignOff = (id: string) => {
    setQueueItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            reviewed: true,
            reviewedBy: 'Dr. S. Nair, MD (Ophthal)',
            reviewedAt: 'Just now',
            physicianNotes: noteText || 'Clinically confirmed and approved for care plan.',
          };
        }
        return item;
      })
    );
    setSelectedCaseForNote(null);
    setNoteText('');
  };

  const filteredItems = queueItems.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.gradeLabel.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'pending') return !item.reviewed;
    if (filter === 'urgent') return item.priority === 'urgent';
    if (filter === 'completed') return item.reviewed;
    return true;
  });

  const pendingCount = queueItems.filter((i) => !i.reviewed).length;
  const urgentCount = queueItems.filter((i) => !i.reviewed && i.priority === 'urgent').length;
  const completedCount = queueItems.filter((i) => i.reviewed).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                <UserCheck className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Clinical Decision Support</span>
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Simulated Triage Queue (Demo Data)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
              Clinician Review & Sign-Off Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 max-w-2xl">
              Cases automatically flagged by multimodal fusion for clinical verification, quality audit, or immediate ophthalmology referral dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-center min-w-[90px]">
              <span className="text-lg font-bold text-[#EA580C] block">
                {pendingCount}
              </span>
              <span className="text-[10px] text-[#6E5C5F] uppercase font-bold">
                Pending Audit
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-center min-w-[90px]">
              <span className="text-lg font-bold text-[#DC2626] block">
                {urgentCount}
              </span>
              <span className="text-[10px] text-[#6E5C5F] uppercase font-bold">
                Urgent High Risk
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-center min-w-[90px]">
              <span className="text-lg font-bold text-[#15803D] block">
                {completedCount}
              </span>
              <span className="text-[10px] text-[#6E5C5F] uppercase font-bold">
                Signed Off
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              filter === 'pending'
                ? 'bg-[#EA580C] text-white shadow-xs'
                : 'bg-[#FAF8F6] text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              filter === 'urgent'
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'bg-[#FAF8F6] text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            Urgent Priority ({urgentCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              filter === 'completed'
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'bg-[#FAF8F6] text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            Signed Off ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-[#2E2628] text-white shadow-xs'
                : 'bg-[#FAF8F6] text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            All Cases ({queueItems.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#6E5C5F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient ID or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] text-xs text-[#2E2628] placeholder-[#9E8D91] focus:outline-none focus:border-[#EA580C]"
          />
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EFE4DC] p-12 text-center text-xs text-[#6E5C5F]">
            No cases match the selected filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const gradeInfo = DR_GRADES[item.result.finalGrade];
            const isNoteOpen = selectedCaseForNote === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs hover:border-[#EA580C]/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                      style={{ backgroundColor: gradeInfo.color }}
                    >
                      G{item.result.finalGrade}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2E2628]">
                          {item.id}
                        </span>
                        <span className="text-[11px] text-[#6E5C5F]">
                          (Simulated Case)
                        </span>
                        {item.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Urgent Referral
                          </span>
                        )}
                        {item.reviewed && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Signed Off</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#6E5C5F] mt-0.5">
                        <span>{item.result.gradeLabel}</span>
                        <span>·</span>
                        <span>
                          OCT DME:{' '}
                          <strong
                            className={
                              item.result.oct.dmeDetected
                                ? 'text-[#DC2626]'
                                : 'text-[#15803D]'
                            }
                          >
                            {item.result.oct.dmeDetected ? 'Detected' : 'Negative'}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          HbA1c: {item.result.clinicalInput.hba1cPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onSelectResult(item.result)}
                      className="px-3 py-1.5 rounded-xl border border-[#EFE4DC] bg-[#FAF8F6] text-xs font-semibold text-[#2E2628] hover:border-[#EA580C] hover:text-[#EA580C] transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Scans</span>
                    </button>

                    {!item.reviewed ? (
                      <button
                        onClick={() => setSelectedCaseForNote(isNoteOpen ? null : item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white text-xs font-semibold shadow-xs hover:from-[#C2410C] hover:to-[#BE185D] transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sign Off Case</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#6E5C5F] italic">
                        Verified by {item.reviewedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Recommendation summary */}
                <div className="text-xs text-[#2E2628] bg-[#FAF8F6] p-3 rounded-xl border border-[#EFE4DC] flex items-start gap-2">
                  <Stethoscope className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                  <span>
                    <strong>Suggested Action:</strong> {item.result.recommendation}
                  </span>
                </div>

                {/* Sign-Off Note Drawer */}
                {isNoteOpen && (
                  <div className="p-4 rounded-xl border border-[#FED7AA] bg-[#FFF7ED]/50 space-y-3">
                    <span className="text-xs font-bold text-[#C2410C] block">
                      Physician Review & Clinical Sign-Off
                    </span>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add clinical findings, treatment instructions, or referral notes (e.g. 'Confirmed center-involving DME; dispatch to vitreoretinal clinic')..."
                      className="w-full text-xs p-3 rounded-lg border border-[#EFE4DC] bg-white focus:outline-none focus:border-[#EA580C]"
                      rows={2}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedCaseForNote(null)}
                        className="px-3 py-1 text-xs text-[#6E5C5F] hover:text-[#2E2628]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSignOff(item.id)}
                        className="px-4 py-1.5 rounded-lg bg-[#15803D] text-white text-xs font-bold shadow-xs hover:bg-[#166534] transition-colors"
                      >
                        Confirm Clinical Sign-Off
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
