import React from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Eye,
  HelpCircle,
  Lightbulb,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { generateFundusSvg } from '../data/sampleCases';

interface ImageCaptureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageCaptureGuideModal: React.FC<ImageCaptureGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#EFE4DC] shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#EFE4DC] flex items-center justify-between bg-gradient-to-r from-[#FFF7ED]/70 to-[#FDF2F8]/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#DB2777] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2E2628]">
                How to Capture an Analysable Fundus Image
              </h3>
              <p className="text-xs text-[#6E5C5F]">
                Technician & Community Worker Best Practices for Quality Screening
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6E5C5F] hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#2E2628]">
          {/* Side-by-side Visual Comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C2410C] mb-3">
              Visual Comparison: Good vs Inadequate Image Quality
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GOOD EXAMPLE */}
              <div className="p-4 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#059669] font-bold text-xs mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>GOOD: Suitable for AI Screening</span>
                  </div>

                  <div className="aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border border-[#A7F3D0] bg-black shadow-xs mb-3">
                    <img
                      src={generateFundusSvg(0, 'normal')}
                      alt="Good fundus photograph"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <ul className="space-y-1 text-[11px] text-[#047857]">
                    <li>• Sharp, visible vessel bifurcations & optic disc</li>
                    <li>• Even, balanced illumination across macula</li>
                    <li>• No corneal reflex obscuring temporal arcades</li>
                    <li>• Centered on fovea (45°–50° field)</li>
                  </ul>
                </div>
              </div>

              {/* BAD EXAMPLE */}
              <div className="p-4 rounded-xl border border-[#FECDD3] bg-[#FFF1F2]/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#E11D48] font-bold text-xs mb-2">
                    <XCircle className="w-4 h-4" />
                    <span>BAD: Blurry, Glare, or Underexposed</span>
                  </div>

                  <div className="aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border border-[#FECDD3] bg-black/90 shadow-xs mb-3 relative flex items-center justify-center">
                    <img
                      src={generateFundusSvg(2, 'normal')}
                      alt="Suboptimal fundus photograph"
                      className="w-full h-full object-cover blur-[2px] opacity-70"
                    />
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none" />
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/70 blur-xs pointer-events-none" />
                  </div>

                  <ul className="space-y-1 text-[11px] text-[#BE123C]">
                    <li>• Motion blur softens microaneurysms</li>
                    <li>• Glare / corneal reflection masks pathology</li>
                    <li>• Dark periphery prevents quadrant grading</li>
                    <li>• Inadequate pupil coverage / ungradable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Crucial Capture Steps */}
          <div className="p-4 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC]">
            <h4 className="font-serif font-bold text-sm text-[#2E2628] mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#EA580C]" />
              Capture Protocols for Non-Mydriatic Cameras
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
                <strong className="text-[#EA580C] block mb-1">1. Ambient Lighting</strong>
                Dim the examination room lights or pull curtains. Darkness allows natural physiological pupil dilation without drops.
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
                <strong className="text-[#EA580C] block mb-1">2. Patient Instructions</strong>
                "Please look directly at the green target star inside the lens. Keep both eyes open wide. Don't blink until the flash."
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
                <strong className="text-[#EA580C] block mb-1">3. Working Distance</strong>
                Maintain the camera’s alignment donuts/crosshairs centered in the pupil aperture before pressing capture.
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#EFE4DC]">
                <strong className="text-[#EA580C] block mb-1">4. Retake Threshold</strong>
                If the immediate preview shows motion streak or glare over the macula, retake immediately before dismissing the patient.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EFE4DC] bg-[#FAF8F6] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white hover:opacity-95"
          >
            Understood, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
