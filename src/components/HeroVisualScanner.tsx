import React, { useState, useEffect } from 'react';
import { Layers, Activity, Eye, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { generateFundusSvg, generateOctSvg } from '../data/sampleCases';

export const HeroVisualScanner: React.FC<{ onExploreDemo: () => void }> = ({ onExploreDemo }) => {
  const [activeLayer, setActiveLayer] = useState<'fundus' | 'gradcam' | 'oct'>('gradcam');
  const [scanPosition, setScanPosition] = useState<number>(0);
  const [scanActive, setScanActive] = useState<boolean>(true);

  // Subtle scanning sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanPosition((prev) => (prev >= 100 ? 0 : prev + 1.2));
    }, 45);
    return () => clearInterval(interval);
  }, []);

  const fundusOriginal = generateFundusSvg(3, 'normal');
  const fundusGradCam = generateFundusSvg(3, 'gradcam');
  const octScan = generateOctSvg('DME', 'scan');

  return (
    <div className="relative rounded-2xl bg-white border border-[#EFE4DC] p-4 sm:p-5 shadow-sm overflow-hidden group">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DC] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse" />
          <span className="font-mono font-semibold text-[#2E2628] text-[11px]">
            SYNTH_RETINA_9942 // TRI-MODAL SCAN
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#C2410C] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FED7AA]">
          <Zap className="w-3 h-3 text-[#EA580C]" />
          <span>ONNX RUNTIME</span>
        </div>
      </div>

      {/* Main Retinal & OCT Stage */}
      <div className="relative my-3 rounded-xl overflow-hidden bg-[#1E1B1D] border border-[#EFE4DC] aspect-square max-h-[300px] sm:max-h-[340px] flex items-center justify-center">
        {/* Layer Content */}
        {activeLayer === 'fundus' && (
          <img
            src={fundusOriginal}
            alt="Retinal Fundus Scan"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}
        {activeLayer === 'gradcam' && (
          <img
            src={fundusGradCam}
            alt="Grad-CAM Activation Heatmap"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}
        {activeLayer === 'oct' && (
          <div className="w-full h-full flex flex-col justify-center bg-[#100D10] p-4">
            <div className="text-[10px] font-mono text-[#DB2777] mb-1 flex items-center justify-between">
              <span>OCT B-Scan Cross Section</span>
              <span>Kermany Retinal Model</span>
            </div>
            <img
              src={octScan}
              alt="OCT Cross-Section"
              className="w-full h-auto rounded border border-[#FBCFE8]/40"
            />
            <p className="text-[10px] text-[#A8BDD5] mt-2 font-mono">
              Findings: Intraretinal Cystoid Fluid pockets detected (DME Flag: TRUE)
            </p>
          </div>
        )}

        {/* Laser / Scanner Line Effect */}
        {scanActive && (
          <div
            className="absolute left-0 right-0 pointer-events-none transition-all duration-75"
            style={{
              top: `${scanPosition}%`,
              height: '2px',
              background: 'linear-gradient(90deg, rgba(234, 88, 12, 0) 0%, rgba(234, 88, 12, 0.8) 30%, rgba(219, 39, 119, 1) 50%, rgba(234, 88, 12, 0.8) 70%, rgba(234, 88, 12, 0) 100%)',
              boxShadow: '0 0 12px 3px rgba(234, 88, 12, 0.45)',
            }}
          />
        )}

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 backdrop-blur-xs text-white border border-white/20">
            {activeLayer === 'gradcam'
              ? 'Grad-CAM Attention (Vascular Arcades)'
              : activeLayer === 'fundus'
              ? 'Color Fundus 512×512'
              : 'DenseNet-121 Depth Map'}
          </span>
          {activeLayer === 'gradcam' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#BE185D]/80 text-white border border-[#FBCFE8]/30">
              Hotspots: Blot Hemorrhages + IRMA
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EA580C] text-white shadow-md">
            Grade 3 · Severe NPDR
          </span>
        </div>
      </div>

      {/* Layer Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF8F6] rounded-xl border border-[#EFE4DC] text-xs">
        <button
          onClick={() => setActiveLayer('fundus')}
          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center text-[11px] ${
            activeLayer === 'fundus'
              ? 'bg-white text-[#EA580C] shadow-xs font-bold border border-[#FED7AA]'
              : 'text-[#6E5C5F] hover:text-[#2E2628]'
          }`}
        >
          Fundus 2D
        </button>
        <button
          onClick={() => setActiveLayer('gradcam')}
          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center text-[11px] ${
            activeLayer === 'gradcam'
              ? 'bg-white text-[#EA580C] shadow-xs font-bold border border-[#FED7AA]'
              : 'text-[#6E5C5F] hover:text-[#2E2628]'
          }`}
        >
          Grad-CAM Heatmap
        </button>
        <button
          onClick={() => setActiveLayer('oct')}
          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center text-[11px] ${
            activeLayer === 'oct'
              ? 'bg-white text-[#DB2777] shadow-xs font-bold border border-[#FBCFE8]'
              : 'text-[#6E5C5F] hover:text-[#2E2628]'
          }`}
        >
          OCT B-Scan (DME)
        </button>
      </div>

      {/* Tri-Modal Probability Indicators */}
      <div className="mt-3 pt-3 border-t border-[#EFE4DC] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#6E5C5F] font-medium">Fundus Prediction</span>
          <span className="font-bold text-[#EA580C]">Grade 3 (Severe)</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#6E5C5F] font-medium">OCT Biomarker</span>
          <span className="font-bold text-[#DB2777]">DME Positive (p=0.91)</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#6E5C5F] font-medium">Metadata Prior</span>
          <span className="font-bold text-[#2E2628]">HbA1c 9.4% (Top SHAP Driver)</span>
        </div>

        <button
          onClick={onExploreDemo}
          className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold bg-[#FFF7ED] hover:bg-[#FED7AA]/40 text-[#C2410C] border border-[#FED7AA] flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Explore Live Triage Demo Result</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#EA580C]" />
        </button>
      </div>
    </div>
  );
};
