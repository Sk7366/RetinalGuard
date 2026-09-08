import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCheck,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sliders,
  XCircle,
} from 'lucide-react';
import { ImageQualityAssessment, QualityStatus } from '../types';
import { imageQualityService } from '../services/imageQualityService';

export interface ImageQualityStepProps {
  fundusImageName: string;
  fundusImageUrl: string | null;
  onProceed: () => void;
  onBackToFundus: () => void;
  onRetake: () => void;
  onQualityAssessed?: (report: ImageQualityAssessment) => void;
}

export const ImageQualityStep: React.FC<ImageQualityStepProps> = ({
  fundusImageName,
  fundusImageUrl,
  onProceed,
  onBackToFundus,
  onRetake,
  onQualityAssessed,
}) => {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<ImageQualityAssessment | null>(null);
  const [selectedPresetStatus, setSelectedPresetStatus] = useState<QualityStatus | null>(null);
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const [showIssuesExpanded, setShowIssuesExpanded] = useState(true);

  // Evaluate quality on mount or when preset is changed
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    imageQualityService
      .assessQuality({
        fileName: fundusImageName,
        imageDataUrl: fundusImageUrl,
        forcedPreset: selectedPresetStatus || undefined,
      })
      .then((report) => {
        if (!isCancelled) {
          setAssessment(report);
          setLoading(false);
          if (onQualityAssessed) {
            onQualityAssessed(report);
          }
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [fundusImageName, fundusImageUrl, selectedPresetStatus]);

  const handleSimulateStatus = (status: QualityStatus) => {
    setSelectedPresetStatus(status);
    setShowOverrideWarning(false);
  };

  const status = assessment?.status || 'GOOD';
  const isGood = status === 'GOOD';
  const isUncertain = status === 'UNCERTAIN';
  const isUngradable = status === 'UNGRADABLE';

  const retakeSteps = imageQualityService.getRetakeInstructions(status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="image-quality-step-root">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#2E2628]">Step 03: Image Quality Assessment</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFEDD5] text-[#EA580C]">
              Pre-Analysis QC Gate
            </span>
          </div>
          <p className="text-xs text-[#6E5C5F] mt-1">
            Automated pre-screening quality gate evaluating retinal illumination, motion blur, and foveal field coverage.
          </p>
        </div>

        {/* Status Simulator Pills (Demo & QA Testing) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC]">
          <span className="text-[10px] font-bold text-[#6E5C5F] px-2 uppercase tracking-wider">
            Test State:
          </span>
          <button
            type="button"
            id="btn-simulate-good"
            onClick={() => handleSimulateStatus('GOOD')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              status === 'GOOD'
                ? 'bg-[#15803D] text-white shadow-2xs'
                : 'bg-white text-[#2E2628] hover:bg-[#DCFCE7] border border-[#EFE4DC]'
            }`}
          >
            Good
          </button>
          <button
            type="button"
            id="btn-simulate-uncertain"
            onClick={() => handleSimulateStatus('UNCERTAIN')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              status === 'UNCERTAIN'
                ? 'bg-[#D97706] text-white shadow-2xs'
                : 'bg-white text-[#2E2628] hover:bg-[#FEF3C7] border border-[#EFE4DC]'
            }`}
          >
            Uncertain
          </button>
          <button
            type="button"
            id="btn-simulate-ungradable"
            onClick={() => handleSimulateStatus('UNGRADABLE')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              status === 'UNGRADABLE'
                ? 'bg-[#DC2626] text-white shadow-2xs'
                : 'bg-white text-[#2E2628] hover:bg-[#FEE2E2] border border-[#EFE4DC]'
            }`}
          >
            Ungradable
          </button>
        </div>
      </div>

      {/* Backend Honesty Notice */}
      <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] flex items-start gap-3 text-xs text-[#6E5C5F]">
        <Info className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-[#2E2628]">Heuristic Quality Verification Notice:</span>
          <p className="leading-relaxed">
            Evaluates image heuristics (contrast, Laplacian blur metric, corneal specular reflection) client-side.
            Dedicated deep-learning quality CNN (e.g., MobileNetV3 QC) is configured in cloud microservices.
          </p>
        </div>
      </div>

      {/* Main Status & Preview Card */}
      {loading ? (
        <div className="p-12 rounded-3xl bg-white border border-[#EFE4DC] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#EA580C] animate-spin" />
          <div className="text-sm font-semibold text-[#2E2628]">Analyzing Retinal Optical Quality...</div>
          <p className="text-xs text-[#6E5C5F]">Scanning foveal field, pupillary illumination, and motion blur</p>
        </div>
      ) : assessment ? (
        <div className="space-y-6">
          {/* Primary Status Banner */}
          <div
            className={`rounded-3xl border p-6 sm:p-7 shadow-xs space-y-4 ${
              isGood
                ? 'bg-[#F0FDF4] border-[#86EFAC]'
                : isUncertain
                ? 'bg-[#FFFBEB] border-[#FCD34D]'
                : 'bg-[#FEF2F2] border-[#FCA5A5]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    isGood
                      ? 'bg-[#15803D] text-white'
                      : isUncertain
                      ? 'bg-[#D97706] text-white'
                      : 'bg-[#DC2626] text-white'
                  }`}
                >
                  {isGood ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : isUncertain ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isGood
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : isUncertain
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#FEE2E2] text-[#B91C1C]'
                      }`}
                    >
                      Quality Status: {status}
                    </span>
                    <span className="text-xs font-bold text-[#2E2628]">
                      Score: {assessment.overallScore}/100
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#2E2628] mt-1">
                    {isGood
                      ? 'Scan Quality Meets Diagnostic Standards'
                      : isUncertain
                      ? 'Uncertain Diagnostic Quality (Motion Blur / Illumination Deficit)'
                      : 'Ungradable Retinal Scan (Corneal Glare / Vignetting)'}
                  </h3>
                </div>
              </div>

              {/* Action Chip */}
              <div className="sm:self-center">
                {isGood ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#15803D] text-xs font-bold border border-[#86EFAC] shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Safe for AI Grading</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#DC2626] text-xs font-bold border border-[#FCA5A5] shadow-2xs">
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Strongly Recommended</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#2E2628] leading-relaxed">
              {assessment.primaryGuidance}
            </p>
          </div>

          {/* Side-by-Side: Image Preview & Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Fundus Preview */}
            <div className="md:col-span-5 space-y-3">
              <div className="rounded-2xl border border-[#EFE4DC] bg-[#181517] overflow-hidden aspect-square flex items-center justify-center p-2 shadow-inner relative">
                {fundusImageUrl ? (
                  <img
                    src={fundusImageUrl}
                    alt="Fundus Scan"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-xs text-[#EFE4DC]">No Image Available</div>
                )}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white px-2 py-0.5 rounded border border-white/10">
                  {fundusImageName || 'fundus_scan.png'}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6E5C5F]">
                <span>Retinal Photo Quality Map</span>
                <button
                  type="button"
                  id="btn-trigger-retake-from-preview"
                  onClick={onRetake}
                  className="text-[#EA580C] font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retake Scan</span>
                </button>
              </div>
            </div>

            {/* Quality Metrics Matrix */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DC]">
                  <h4 className="text-xs font-bold text-[#2E2628] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Optical Metric Breakdown</span>
                  </h4>
                  <span className="text-[11px] font-mono text-[#6E5C5F]">Threshold: ≥70%</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Sharpness */}
                  <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
                    <div className="text-[10px] font-bold text-[#6E5C5F] uppercase">Sharpness</div>
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-lg font-black font-mono ${
                          assessment.metrics.sharpness >= 70 ? 'text-[#15803D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {assessment.metrics.sharpness}%
                      </span>
                      <span className="text-[10px] text-[#6E5C5F]">Laplacian</span>
                    </div>
                    <div className="w-full bg-[#E5D7CE] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          assessment.metrics.sharpness >= 70 ? 'bg-[#15803D]' : 'bg-[#DC2626]'
                        }`}
                        style={{ width: `${assessment.metrics.sharpness}%` }}
                      />
                    </div>
                  </div>

                  {/* Illumination */}
                  <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
                    <div className="text-[10px] font-bold text-[#6E5C5F] uppercase">Illumination</div>
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-lg font-black font-mono ${
                          assessment.metrics.illumination >= 70 ? 'text-[#15803D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {assessment.metrics.illumination}%
                      </span>
                      <span className="text-[10px] text-[#6E5C5F]">Uniformity</span>
                    </div>
                    <div className="w-full bg-[#E5D7CE] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          assessment.metrics.illumination >= 70 ? 'bg-[#15803D]' : 'bg-[#DC2626]'
                        }`}
                        style={{ width: `${assessment.metrics.illumination}%` }}
                      />
                    </div>
                  </div>

                  {/* Field Coverage */}
                  <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
                    <div className="text-[10px] font-bold text-[#6E5C5F] uppercase">Field View</div>
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-lg font-black font-mono ${
                          assessment.metrics.fieldCoverage >= 75 ? 'text-[#15803D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {assessment.metrics.fieldCoverage}%
                      </span>
                      <span className="text-[10px] text-[#6E5C5F]">≥45° FOV</span>
                    </div>
                    <div className="w-full bg-[#E5D7CE] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          assessment.metrics.fieldCoverage >= 75 ? 'bg-[#15803D]' : 'bg-[#DC2626]'
                        }`}
                        style={{ width: `${assessment.metrics.fieldCoverage}%` }}
                      />
                    </div>
                  </div>

                  {/* Glare Index */}
                  <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
                    <div className="text-[10px] font-bold text-[#6E5C5F] uppercase">Corneal Glare</div>
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-lg font-black font-mono ${
                          assessment.metrics.glareIndex <= 20 ? 'text-[#15803D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {assessment.metrics.glareIndex}%
                      </span>
                      <span className="text-[10px] text-[#6E5C5F]">Target &lt;20%</span>
                    </div>
                    <div className="w-full bg-[#E5D7CE] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          assessment.metrics.glareIndex <= 20 ? 'bg-[#15803D]' : 'bg-[#DC2626]'
                        }`}
                        style={{ width: `${Math.min(100, assessment.metrics.glareIndex * 1.5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Contrast */}
                  <div className="p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] space-y-1">
                    <div className="text-[10px] font-bold text-[#6E5C5F] uppercase">Contrast</div>
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-lg font-black font-mono ${
                          assessment.metrics.contrast >= 70 ? 'text-[#15803D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {assessment.metrics.contrast}%
                      </span>
                      <span className="text-[10px] text-[#6E5C5F]">Arcade Diff</span>
                    </div>
                    <div className="w-full bg-[#E5D7CE] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          assessment.metrics.contrast >= 70 ? 'bg-[#15803D]' : 'bg-[#DC2626]'
                        }`}
                        style={{ width: `${assessment.metrics.contrast}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detected Optical Issues */}
                {assessment.issues && assessment.issues.length > 0 && (
                  <div className="pt-2 border-t border-[#EFE4DC] space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowIssuesExpanded(!showIssuesExpanded)}
                      className="w-full flex items-center justify-between text-xs font-bold text-[#2E2628]"
                    >
                      <span className="text-[#DC2626]">
                        {assessment.issues.length} Optical Defects Flagged
                      </span>
                      {showIssuesExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#6E5C5F]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6E5C5F]" />
                      )}
                    </button>

                    {showIssuesExpanded && (
                      <div className="space-y-2 pt-1">
                        {assessment.issues.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-3 rounded-xl bg-[#FFFDFB] border border-[#FEE2E2] space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#991B1B]">{issue.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] uppercase">
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-[#6E5C5F] text-[11px] leading-relaxed">
                              {issue.description}
                            </p>
                            <div className="text-[11px] text-[#2E2628] font-medium pt-0.5 flex items-start gap-1">
                              <span className="text-[#EA580C]">↳ Fix:</span>
                              <span>{issue.guidance}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Retake Guidance Section (If status is UNCERTAIN or UNGRADABLE) */}
          {!isGood && (
            <div className="rounded-3xl border border-[#FDBA74] bg-[#FFF7ED] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#EA580C] uppercase tracking-wider">
                  <Camera className="w-4 h-4" />
                  <span>Screener Retake Protocol &amp; Optical Guidance</span>
                </div>
                <button
                  type="button"
                  id="btn-retake-action"
                  onClick={onRetake}
                  className="px-3.5 py-1.5 rounded-xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Fundus Scan Now</span>
                </button>
              </div>

              <p className="text-xs text-[#2E2628] leading-relaxed">
                To ensure microaneurysms and faint exudates are accurately graded by the deep learning pipeline, follow this 4-point realignment protocol before proceeding:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {retakeSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[#FDBA74]/60 flex items-start gap-3 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#FFEDD5] text-[#EA580C] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-[#2E2628] leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-4 border-t border-[#EFE4DC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              id="btn-back-to-fundus"
              onClick={onBackToFundus}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white border border-[#EFE4DC] text-[#2E2628] text-xs font-bold hover:bg-[#FAF8F6] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 02 (Fundus)</span>
            </button>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              {!isGood && (
                <button
                  type="button"
                  id="btn-retake-footer"
                  onClick={onRetake}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white border border-[#EA580C] text-[#EA580C] text-xs font-bold hover:bg-[#FFF7ED] transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Retinal Photo</span>
                </button>
              )}

              {isGood ? (
                <button
                  type="button"
                  id="btn-quality-proceed"
                  onClick={onProceed}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#C2410C] transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Quality Approved · Proceed to Step 04 (Optional OCT)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : isUncertain ? (
                <button
                  type="button"
                  id="btn-quality-override-uncertain"
                  onClick={() => {
                    if (!showOverrideWarning) {
                      setShowOverrideWarning(true);
                    } else {
                      onProceed();
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {showOverrideWarning ? 'Confirm Override & Proceed' : 'Proceed with Caution (Override)'}
                  </span>
                </button>
              ) : (
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <span className="text-[11px] text-[#DC2626] font-medium hidden sm:inline">
                    Ungradable scans must be retaken.
                  </span>
                  <button
                    type="button"
                    id="btn-quality-force-retake"
                    onClick={onRetake}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Required</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Override Warning Confirmation Alert */}
          {showOverrideWarning && (
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FCD34D] text-xs text-[#92400E] space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>Clinical Override Acknowledgment</span>
              </div>
              <p className="leading-relaxed">
                You are proceeding with an UNCERTAIN quality image. The deep learning model will note this optical uncertainty in the final audit trail. If you are in a field camp and cannot retake, click <strong>"Confirm Override &amp; Proceed"</strong> above to continue.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
