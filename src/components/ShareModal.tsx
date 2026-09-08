import React, { useState } from 'react';
import { X, Copy, Check, Share2, Shield, Lock } from 'lucide-react';
import { MultimodalTriageResult } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MultimodalTriageResult;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, result }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const anonymizedShareUrl = `${window.location.origin}/?session=${result.sessionId}&grade=${result.finalGrade}&share=anon`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(anonymizedShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#EFE4DC] shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#EA580C] to-[#DB2777]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6E5C5F] hover:text-[#2E2628] p-1.5 rounded-lg hover:bg-[#FFF7ED] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
            <Share2 className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Secure Clinical Case Sharing</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#2E2628]">
            Share Anonymized Triage
          </h2>
          <p className="text-xs text-[#6E5C5F] leading-relaxed">
            Generate a secure, anonymized link to collaborate with retina specialists or peer researchers.
          </p>
        </div>

        {/* Privacy Shield Notice */}
        <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#FED7AA] mb-4 space-y-1.5 text-xs text-[#6E5C5F]">
          <div className="flex items-center gap-1.5 font-semibold text-[#C2410C]">
            <Lock className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>De-Identification Guarantee</span>
          </div>
          <p className="text-[11px] text-[#2E2628]">
            No protected health information (PHI) or raw personal identifiers are included. Only model attention maps, risk grades, and synthetic metadata drivers are shared.
          </p>
        </div>

        {/* Share Link Input Box */}
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-semibold text-[#2E2628]">
            Anonymized Share Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={anonymizedShareUrl}
              className="flex-1 text-xs font-mono bg-[#FAF8F6] border border-[#EFE4DC] rounded-lg px-3 py-2 text-[#2E2628] select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                copied
                  ? 'bg-[#10B981] text-white'
                  : 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white hover:opacity-90'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Case Summary Preview */}
        <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] text-xs text-[#6E5C5F] flex items-center justify-between">
          <div>
            <span className="font-mono font-bold text-[#2E2628] block">Session {result.sessionId}</span>
            <span className="text-[11px] text-[#9E8D91]">
              Grade {result.finalGrade} ({result.gradeLabel}) · {result.confidence} Confidence
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
            Read-only
          </span>
        </div>
      </div>
    </div>
  );
};
