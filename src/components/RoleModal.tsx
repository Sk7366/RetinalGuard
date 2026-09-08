import React from 'react';
import {
  Activity,
  ArrowRight,
  Camera,
  Cpu,
  Eye,
  HeartHandshake,
  Microscope,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { UserRole } from '../types';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
  currentRole?: UserRole;
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSelectRole, currentRole }) => {
  if (!isOpen) return null;

  const roles: Array<{
    id: UserRole;
    title: string;
    badge: string;
    badgeColor: string;
    description: string;
    icon: React.ReactNode;
    highlightBorder: string;
  }> = [
    {
      id: 'public',
      title: 'Public User',
      badge: 'Public & Patient',
      badgeColor: 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
      description: 'Explore how AI screens diabetic retinopathy, find accredited screening centers across India, learn warning signs, and run interactive demonstrations.',
      icon: <HeartHandshake className="w-5 h-5 text-[#EA580C]" />,
      highlightBorder: 'hover:border-[#EA580C]',
    },
    {
      id: 'technician',
      title: 'Screening Technician',
      badge: 'Field & Camp Ops',
      badgeColor: 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]',
      description: 'Designed for rural outreach camps: Rapid field queue entry, batch image triage, capture quality verification, and automatic ungradable detection.',
      icon: <Camera className="w-5 h-5 text-[#EA580C]" />,
      highlightBorder: 'hover:border-[#EA580C]',
    },
    {
      id: 'provider',
      title: 'Healthcare Provider',
      badge: 'Clinical Practice',
      badgeColor: 'bg-[#FDF2F8] text-[#BE185D] border-[#FBCFE8]',
      description: 'For optometrists, clinic physicians, and ophthalmologists: Multimodal DR grading, OCT-DME safety overrides, closed-loop referrals, and clinical PDF exports.',
      icon: <Stethoscope className="w-5 h-5 text-[#DB2777]" />,
      highlightBorder: 'hover:border-[#DB2777]',
    },
    {
      id: 'admin',
      title: 'Administrator',
      badge: 'Governance & Ops',
      badgeColor: 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]',
      description: 'Facility oversight, screening throughput analytics, referral adherence auditing, device integration, and clinic settings.',
      icon: <ShieldCheck className="w-5 h-5 text-[#C2410C]" />,
      highlightBorder: 'hover:border-[#C2410C]',
    },
    {
      id: 'researcher',
      title: 'Researcher',
      badge: 'Academic & AI Evaluation',
      badgeColor: 'bg-[#FAF8F6] text-[#6E5C5F] border-[#EFE4DC]',
      description: 'In-depth 6-condition ablation matrix, ROC/PR analysis, SHAP feature attributions, ONNX runtime latency benchmarks, and SaMD validation documents.',
      icon: <Microscope className="w-5 h-5 text-[#6E5C5F]" />,
      highlightBorder: 'hover:border-[#EA580C]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#EFE4DC] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#EFE4DC] flex items-start justify-between bg-gradient-to-r from-[#FFF7ED]/70 to-[#FDF2F8]/70">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#EA580C] to-[#DB2777] flex items-center justify-center text-white">
                <Eye className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C2410C]">
                RetinaGuard Persona Architecture
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2E2628]">
              Select Your Role & Workspace
            </h2>
            <p className="text-xs text-[#6E5C5F] mt-1">
              Switch between Public Patient mode and Provider/Technician/Research cockpits anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6E5C5F] hover:text-[#2E2628] hover:bg-white/80 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Role Options */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-2.5">
          {roles.map((r) => {
            const isSelected = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  onSelectRole(r.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'border-[#EA580C] bg-[#FFF7ED]/40 ring-1 ring-[#EA580C]'
                    : `border-[#EFE4DC] bg-[#FFFDFB] ${r.highlightBorder} hover:bg-[#FAF8F6]`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EFE4DC] shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                    {r.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-[#2E2628] group-hover:text-[#EA580C] transition-colors">
                        {r.title}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${r.badgeColor}`}
                      >
                        {r.badge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EA580C] text-white font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E5C5F] mt-1 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#EA580C] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 px-6 border-t border-[#EFE4DC] bg-[#FAF8F6] flex items-center justify-between text-xs text-[#6E5C5F]">
          <span>You can switch roles anytime from the header pill.</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#EA580C] hover:underline"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
