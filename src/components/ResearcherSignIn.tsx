import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building,
  CheckCircle2,
  Cpu,
  FileCode2,
  GitBranch,
  KeyRound,
  Layers,
  Lock,
  Mail,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { authService } from '../auth/authService';
import { User } from '../types';
import { useTranslation } from '../i18n/I18nContext';

interface ResearcherSignInProps {
  onAuthenticate: (user: User) => void;
  onCancel?: () => void;
}

const DEMO_RESEARCHERS = [
  {
    name: 'Dr. Sai Krishnan, PhD',
    role: 'Senior AI Research Fellow',
    org: 'Indian Institute of Science / AIIMS Lab',
    department: 'Medical Vision & Deep Learning Division',
    email: 'sai.krishnan@visionai.edu',
    project: 'Multimodal Late Fusion DR Trial (IRB #2024-AI-0418)',
    initials: 'SK',
  },
  {
    name: 'Prof. Rebecca Chen, MD',
    role: 'Principal Investigator',
    org: 'Global Eye AI Consortium',
    department: 'Department of Vitreoretinal Diseases',
    email: 'rebecca.chen@eyeconsortium.org',
    project: 'Cross-Attention OCT DME Benchmarks',
    initials: 'RC',
  },
  {
    name: 'Dr. Vikram Adiga, MSc',
    role: 'Clinical Biostatistician & SaMD Validator',
    org: 'Indian Council of Medical Research (ICMR)',
    department: 'Biomedical Informatics Unit',
    email: 'vikram.adiga@icmr.gov.in',
    project: 'Responsible AI Fairness & Demographic Parity',
    initials: 'VA',
  },
];

export const ResearcherSignIn: React.FC<ResearcherSignInProps> = ({
  onAuthenticate,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'quick' | 'custom'>('quick');

  // Custom form state
  const [name, setName] = useState('Dr. Sai Krishnan');
  const [email, setEmail] = useState('sai.krishnan@visionai.edu');
  const [org, setOrg] = useState('Indian Institute of Science / AIIMS Lab');
  const [department, setDepartment] = useState('Medical Vision & Deep Learning Division');
  const [title, setTitle] = useState('Senior AI Research Fellow');
  const [accessCode, setAccessCode] = useState('IRB-RETINAGUARD-2024');

  const handleSelectDemo = async (demo: typeof DEMO_RESEARCHERS[0]) => {
    const user = await authService.login(demo.email, 'researcher', {
      name: demo.name,
      organization: demo.org,
      location: demo.department,
      verificationStatus: 'verified',
      isDemoVerification: true,
    });
    onAuthenticate(user);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await authService.login(email, 'researcher', {
      name: name,
      organization: org,
      location: department,
      verificationStatus: 'verified',
      isDemoVerification: true,
    });
    onAuthenticate(user);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-[#EFE4DC] shadow-xl overflow-hidden">
        {/* TOP INSTITUTIONAL HEADER */}
        <div className="bg-gradient-to-r from-[#2E2628] via-[#3D3235] to-[#2E2628] p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-orange-200 border border-white/15">
              <Lock className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>RESTRICTED RESEARCH ACCESS</span>
            </div>
            <span className="font-mono text-[11px] text-stone-300">
              IRB Protocol #2024-AI-0418
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Researcher Sign In & Workspace Access
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1.5 max-w-2xl leading-relaxed">
            Authentication is required to access the multimodal deep learning architecture, Grad-CAM attention maps, TreeSHAP attributions, ablation matrices, and MLflow model registry.
          </p>

          {/* Research security notice */}
          <div className="mt-4 p-3 rounded-xl bg-black/25 border border-white/10 text-xs text-stone-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#FED7AA] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Research telemetry and raw latent model representations are restricted from ordinary patient accounts to ensure patient safety and maintain scientific audit standards.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#EFE4DC] px-6 bg-[#FFFDFB]">
          <button
            type="button"
            onClick={() => setTab('quick')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              tab === 'quick'
                ? 'border-[#EA580C] text-[#EA580C]'
                : 'border-transparent text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authorized Research Personas (Instant Access)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              tab === 'custom'
                ? 'border-[#EA580C] text-[#EA580C]'
                : 'border-transparent text-[#6E5C5F] hover:text-[#2E2628]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Custom Institutional Credentials</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 sm:p-8 space-y-6">
          {tab === 'quick' ? (
            <div className="space-y-4">
              <div className="text-xs text-[#6E5C5F]">
                Select an accredited investigator profile to authenticate and unlock the scientific workspace:
              </div>

              <div className="space-y-3">
                {DEMO_RESEARCHERS.map((res) => (
                  <button
                    key={res.email}
                    type="button"
                    onClick={() => handleSelectDemo(res)}
                    className="w-full text-left p-4 rounded-2xl border border-[#EFE4DC] hover:border-[#FED7AA] bg-[#FFFDFB] hover:bg-[#FFF7ED]/30 transition-all shadow-2xs group flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#2E2628] group-hover:bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-2xs">
                        {res.initials}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#2E2628] group-hover:text-[#EA580C] transition-colors">
                            {res.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            IRB Certified
                          </span>
                        </div>
                        <div className="text-xs font-medium text-[#EA580C]">
                          {res.role}
                        </div>
                        <div className="text-[11px] text-[#6E5C5F]">
                          {res.org} · {res.department}
                        </div>
                        <div className="text-[10px] text-[#8E7E81] font-mono mt-1">
                          Research Focus: {res.project}
                        </div>
                      </div>
                    </div>

                    <div className="self-center px-3 py-1.5 rounded-xl bg-white border border-[#EFE4DC] group-hover:border-[#FED7AA] text-xs font-bold text-[#2E2628] group-hover:text-[#EA580C] flex items-center gap-1 shrink-0 transition-colors">
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Full Name & Credentials <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sai Krishnan, PhD"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Institutional Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. investigator@university.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Affiliated Institution / Hospital <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="e.g. AIIMS / IISc Medical AI Lab"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Academic Role / Title
                  </label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628] bg-white"
                  >
                    <option value="Senior AI Research Fellow">Senior AI Research Fellow</option>
                    <option value="Principal Investigator">Principal Investigator</option>
                    <option value="Clinical AI Validator">Clinical AI Validator</option>
                    <option value="Biostatistician & Epidemiologist">Biostatistician & Epidemiologist</option>
                    <option value="Machine Learning Scientist">Machine Learning Scientist</option>
                    <option value="Postdoctoral Scholar">Postdoctoral Scholar</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    Department / Laboratory
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Medical Vision & Deep Learning Division"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#2E2628] mb-1">
                    IRB Protocol / Evaluation Access Token
                  </label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DC] focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] text-xs text-[#2E2628] font-mono"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2E2628] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate & Unlock Research Workspace</span>
                </button>
              </div>
            </form>
          )}

          {/* BACK TO PATIENT PORTAL LINK */}
          <div className="pt-4 border-t border-[#EFE4DC] flex items-center justify-between text-xs">
            <span className="text-[#8E7E81]">
              Looking for patient eye screening or clinic booking?
            </span>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="font-bold text-[#EA580C] hover:text-[#C2410C] transition-colors cursor-pointer"
              >
                ← Return to Patient Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
