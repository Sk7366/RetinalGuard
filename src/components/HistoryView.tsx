import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
  Stethoscope,
  UserCheck,
} from 'lucide-react';
import { MOCK_REFERRAL_QUEUE } from '../mock/mockData';
import { MultimodalTriageResult, ReferralRecord, ReferralStatus } from '../types';
import { generateClinicalPdfReport } from '../utils/pdfGenerator';
import { RiskChip } from './RiskChip';

interface HistoryViewProps {
  history: MultimodalTriageResult[];
  onSelectResult: (result: MultimodalTriageResult) => void;
  onNewScreening: () => void;
  defaultSubTab?: 'screenings' | 'referrals';
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectResult,
  onNewScreening,
  defaultSubTab = 'screenings',
}) => {
  const [activeTab, setActiveTab] = useState<'screenings' | 'referrals'>(defaultSubTab);

  React.useEffect(() => {
    if (defaultSubTab) {
      setActiveTab(defaultSubTab);
    }
  }, [defaultSubTab]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>(MOCK_REFERRAL_QUEUE);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  const handleUpdateStatus = (id: string, newStatus: ReferralStatus) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : r
      )
    );
  };

  const filteredReferrals = referrals.filter(
    (r) => selectedStatusFilter === 'All' || r.status === selectedStatusFilter
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
            <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Audit Trail & Care Coordination</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
            Screening & Referral Audit Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1">
            Track completed evaluations, closed-loop specialist referrals, and follow-up adherence:
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onNewScreening}
            className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Screening</span>
          </button>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex items-center gap-2 border-b border-[#EFE4DC] pb-2">
        <button
          onClick={() => setActiveTab('screenings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'screenings'
              ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] shadow-xs'
              : 'text-[#6E5C5F] hover:text-[#2E2628]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#EA580C]" />
          <span>Completed Screenings ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'referrals'
              ? 'bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
              : 'text-[#6E5C5F] hover:text-[#2E2628]'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-[#DB2777]" />
          <span>Closed-Loop Referral Queue ({referrals.length})</span>
        </button>
      </div>

      {/* TAB 1: SCREENINGS TABLE */}
      {activeTab === 'screenings' && (
        <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EFE4DC] bg-[#FFFDFB] text-[#6E5C5F] font-semibold">
                  <th className="py-3 px-4">Session & Date</th>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Final DR Grade</th>
                  <th className="py-3 px-3 text-center">OCT DME</th>
                  <th className="py-3 px-4">HbA1c</th>
                  <th className="py-3 px-4">Action Recommendation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE4DC]">
                {history.map((item) => (
                  <tr key={item.sessionId} className="hover:bg-[#FFFDFB] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#6E5C5F]">
                      <span className="font-bold text-[#2E2628] block">{item.sessionId}</span>
                      <span className="text-[10px]">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2E2628]">
                      {item.patientId}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskChip grade={item.finalGrade} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {item.oct.present ? (
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.oct.dmeDetected
                              ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
                              : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                          }`}
                        >
                          {item.oct.dmeDetected ? 'DME Fluid' : 'No DME'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#9E8D91]">Omitted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#2E2628]">
                      {item.clinicalInput.hba1c}%
                    </td>
                    <td className="py-3.5 px-4 text-[#6E5C5F] max-w-xs truncate">
                      {item.recommendation}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => onSelectResult(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] p-1.5 rounded-lg hover:bg-[#FFF7ED]"
                        title="Inspect Triage Results & Heatmap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => generateClinicalPdfReport(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#DB2777] hover:text-[#BE185D] p-1.5 rounded-lg hover:bg-[#FDF2F8]"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: CLOSED-LOOP REFERRAL QUEUE */}
      {activeTab === 'referrals' && (
        <section className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#2E2628]">
                Active Tertiary Clinic Referrals
              </h2>
              <p className="text-xs text-[#6E5C5F]">
                Closing the loop: Tracking patients from screening identification to confirmed ophthalmology visit
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Pending', 'Contacted', 'Scheduled', 'Attended', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    selectedStatusFilter === st
                      ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white shadow-xs'
                      : 'bg-[#FAF8F6] text-[#6E5C5F] hover:text-[#2E2628] border border-[#EFE4DC]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EFE4DC]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EFE4DC] bg-[#FAF8F6] text-[#6E5C5F] font-semibold">
                  <th className="p-3">Referral ID</th>
                  <th className="p-3">Patient Code</th>
                  <th className="p-3">Initial Grade</th>
                  <th className="p-3">Assigned Eye Center</th>
                  <th className="p-3">Timeline Target</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Update Progression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE4DC]">
                {filteredReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-[#FAF8F6]/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#EA580C]">{ref.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-[#2E2628]">{ref.patientCode}</div>
                      <div className="text-[10px] text-[#9E8D91]">Age: {ref.patientAge}</div>
                    </td>
                    <td className="p-3">
                      <RiskChip grade={ref.initialGrade} size="sm" />
                      {ref.dmePresent && (
                        <span className="block text-[10px] font-bold text-[#BE185D] mt-0.5">
                          + DME Detected
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[#2E2628]">
                      <div className="font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#EA580C] shrink-0" />
                        <span>{ref.assignedClinic}</span>
                      </div>
                      <div className="text-[10px] text-[#6E5C5F] truncate max-w-[200px]">
                        {ref.clinicalNotes}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-[#C2410C]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{ref.followUpTimeline}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-block ${
                          ref.status === 'Completed'
                            ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                            : ref.status === 'Attended'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ref.status === 'Scheduled'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : ref.status === 'Contacted'
                            ? 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
                            : 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]'
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={ref.status}
                        onChange={(e) =>
                          handleUpdateStatus(ref.id, e.target.value as ReferralStatus)
                        }
                        className="text-xs bg-[#FFFDFB] border border-[#EFE4DC] rounded-lg px-2 py-1 font-semibold text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Attended">Attended</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] flex items-center justify-between text-xs text-[#6E5C5F]">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#EA580C]" />
              Status updates synchronize directly with community health worker (ASHA) task lists
            </span>
            <span className="text-[11px] font-mono">Simulated API: Active</span>
          </div>
        </section>
      )}
    </div>
  );
};
