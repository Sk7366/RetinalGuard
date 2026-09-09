import React from 'react';
import { ArrowUpRight, ExternalLink, Eye, Github, Shield } from 'lucide-react';
import { ProviderRoute, PublicRoute } from '../types';

interface FooterProps {
  onNavigatePublic: (route: PublicRoute) => void;
  onNavigateProvider: (route: ProviderRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePublic, onNavigateProvider }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-14 pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#EA580C] to-[#DB2777]">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-serif font-semibold text-xl text-white tracking-tight">
                RetinaGuard<span className="text-[#EA580C] text-xs font-sans ml-1">AI</span>
              </span>
            </div>

            <p className="text-sm text-stone-300 max-w-sm leading-relaxed font-serif italic">
              "Multimodal AI. Explainable by design."
            </p>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              A research-grade clinical decision support architecture fusing color fundus photography, cross-sectional OCT depth imaging, and structured clinical metadata for explainable diabetic retinopathy triage.
            </p>

            <div className="flex items-center gap-2.5 pt-1 text-xs">
              <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 font-mono text-[11px]">
                PyTorch → ONNX
              </span>
              <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 font-mono text-[11px]">
                FastAPI · Cloud Run
              </span>
            </div>
          </div>

          {/* Col 2: Public Portal */}
          <div className="space-y-3 text-xs">
            <p className="font-semibold uppercase tracking-wider text-white text-[11px]">
              Public Portal
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => onNavigatePublic('get-screened')}
                  className="hover:text-white transition-colors text-left"
                >
                  Get your retina screened
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePublic('find-screening')}
                  className="hover:text-white transition-colors text-left"
                >
                  Find Screening Near Me
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePublic('learn')}
                  className="hover:text-white transition-colors text-left"
                >
                  Learn About Screening
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePublic('explore-demo')}
                  className="hover:text-white transition-colors text-left"
                >
                  Explore Demo
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Provider Workspace */}
          <div className="space-y-3 text-xs">
            <p className="font-semibold uppercase tracking-wider text-white text-[11px]">
              Provider Workspace
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => onNavigateProvider('dashboard')}
                  className="hover:text-white transition-colors text-left"
                >
                  Provider Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateProvider('camp-mode')}
                  className="hover:text-white transition-colors text-left"
                >
                  Screening Camp Mode
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateProvider('start-screening')}
                  className="hover:text-white transition-colors text-left"
                >
                  Start Screening
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateProvider('review-queue')}
                  className="hover:text-white transition-colors text-left"
                >
                  Review Queue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateProvider('referrals')}
                  className="hover:text-white transition-colors text-left"
                >
                  Referrals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateProvider('analytics')}
                  className="hover:text-white transition-colors text-left"
                >
                  Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Standards & Compliance */}
          <div className="space-y-3 text-xs">
            <p className="font-semibold uppercase tracking-wider text-white text-[11px]">
              Compliance & Safety
            </p>
            <ul className="space-y-2 text-stone-400">
              <li className="flex items-center gap-1.5 text-stone-300">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>HIPAA Safe Harbor</span>
              </li>
              <li>FDA SaMD Enforcement Discretion</li>
              <li>ISO 13485 Quality Standards</li>
              <li>WHO Package of Eye Interventions</li>
              <li>Dual-Modality Safety Override</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© 2026 RetinaGuard Multimodal Consortium. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-white font-medium">Research-Grade Demonstrator</span>
            <span>Version 2.4.0-prod</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
