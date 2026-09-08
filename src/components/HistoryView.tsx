import React from 'react';
import { Clock, Download, Eye, FileText, RefreshCw } from 'lucide-react';
import { MultimodalTriageResult } from '../types';
import { generateClinicalPdfReport } from '../utils/pdfGenerator';
import { RiskChip } from './RiskChip';

interface HistoryViewProps {
  history: MultimodalTriageResult[];
  onSelectResult: (result: MultimodalTriageResult) => void;
  onNewScreening: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectResult,
  onNewScreening,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
            <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Session Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
            Clinical Screening History
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1">
            Historical multimodal triage evaluations recorded during this demonstration session:
          </p>
        </div>

        <button
          onClick={onNewScreening}
          className="bg-gradient-to-r from-[#EA580C] to-[#DB2777] hover:from-[#C2410C] hover:to-[#BE185D] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Screening</span>
        </button>
      </div>

      {/* TABLE */}
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
    </div>
  );
};
