import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { INTERVIEW_TALKING_POINTS } from '../data/benchmarks';

export const InterviewView: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
          <BookOpen className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>System Design & Clinical AI Defence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          Clinical ML Architecture & Interview Talking Points
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1 leading-relaxed">
          Deep-dive justifications for architecture choices, loss functions, late fusion guarantees, missing modality tolerance, and regulatory SaMD strategy.
        </p>
      </div>

      {/* ACCORDION FAQS */}
      <div className="space-y-3">
        {INTERVIEW_TALKING_POINTS.map((item, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#EFE4DC] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FFFDFB] transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FFF7ED] text-[#EA580C] text-xs font-bold flex items-center justify-center shrink-0 border border-[#FED7AA]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-sm sm:text-base font-bold text-[#2E2628] block">
                      {item.title}
                    </span>
                    <span className="text-xs text-[#6E5C5F] line-clamp-1 mt-0.5">
                      {item.summary}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#EA580C] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6E5C5F] shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#2E2628] leading-relaxed border-t border-[#EFE4DC] bg-[#FFFDFB]/60">
                  <div className="space-y-3 pt-3">
                    <div className="p-3 bg-[#FDF2F8]/70 rounded-lg border border-[#FBCFE8] text-xs text-[#BE185D] font-semibold">
                      Executive Summary: {item.summary}
                    </div>
                    <p className="leading-relaxed text-[#2E2628]">{item.detail}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
