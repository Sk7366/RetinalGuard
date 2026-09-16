import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Globe,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Sliders,
  LogOut,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { User } from '../types';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

interface PatientProfileViewProps {
  currentUser: User;
  onNavigateToFindScreening: () => void;
  onNavigateToReports: () => void;
  onNavigateToJourney: () => void;
  onOpenAccessibility: () => void;
  onSwitchWorkspace?: () => void;
  onLogout: () => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  currentUser,
  onNavigateToFindScreening,
  onNavigateToReports,
  onNavigateToJourney,
  onOpenAccessibility,
  onSwitchWorkspace,
  onLogout,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-[#2E2628]">
      {/* HEADER */}
      <div className="pb-4 border-b border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
            <UserIcon className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>PATIENT ACCOUNT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628]">
            Patient Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5C5F] mt-1">
            Personal details, verified contact information, and screening preferences.
          </p>
        </div>

        {/* PRIMARY CTA: GET SCREENED */}
        <button
          type="button"
          onClick={onNavigateToFindScreening}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>Get Screened</span>
        </button>
      </div>

      {/* PATIENT INFO CARD */}
      <div className="bg-white rounded-3xl border border-[#EFE4DC] shadow-2xs p-6 sm:p-7 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] flex items-center justify-center font-serif font-bold text-xl">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2E2628]">
              {currentUser.name || 'Patient'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-[#9E8D91]">
                ID: {currentUser.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-[11px] text-[#EA580C] hover:underline"
              >
                {copiedId ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          {/* Email */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-1">
            <div className="flex items-center justify-between text-[#9E8D91]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Mail className="w-3.5 h-3.5 text-[#EA580C]" />
                Email Address
              </span>
              {currentUser.emailVerified ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified ✓
                </span>
              ) : (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Unverified
                </span>
              )}
            </div>
            <div className="font-semibold text-sm text-[#2E2628] font-mono break-all">
              {currentUser.email}
            </div>
          </div>

          {/* Phone */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-1">
            <div className="flex items-center justify-between text-[#9E8D91]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Phone className="w-3.5 h-3.5 text-[#EA580C]" />
                Mobile Phone
              </span>
              {currentUser.phoneVerified ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified ✓
                </span>
              ) : (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Unverified
                </span>
              )}
            </div>
            <div className="font-semibold text-sm text-[#2E2628] font-mono">
              {currentUser.phone || '+91 98450 12345'}
            </div>
          </div>

          {/* Preferred Language */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#9E8D91]">
              <Globe className="w-3.5 h-3.5 text-[#EA580C]" />
              Preferred Language
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#2E2628]">
                {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeLabel || 'English'}
              </span>
              <select
                aria-label="Change language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-xs bg-white border border-[#EFE4DC] rounded-lg px-2 py-1"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.nativeLabel}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date of Birth / Registration */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#9E8D91]">
              <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
              Registered Member
            </div>
            <div className="font-semibold text-sm text-[#2E2628]">
              {currentUser.registeredAt
                ? new Date(currentUser.registeredAt).toLocaleDateString()
                : '12 September 2026'}
            </div>
          </div>
        </div>

        {/* QUICK SHORTCUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={onNavigateToReports}
            className="p-4 rounded-2xl border border-[#EFE4DC] hover:border-[#EA580C] bg-[#FAF8F6] text-left transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <FileText className="w-4 h-4 text-[#EA580C]" />
              <span className="text-[10px] font-bold text-[#EA580C] group-hover:underline">View →</span>
            </div>
            <div className="text-xs font-bold text-[#2E2628]">My Reports</div>
            <div className="text-[11px] text-[#6E5C5F]">View and download past screening letters</div>
          </button>

          <button
            type="button"
            onClick={onNavigateToJourney}
            className="p-4 rounded-2xl border border-[#EFE4DC] hover:border-[#EA580C] bg-[#FAF8F6] text-left transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-4 h-4 text-[#EA580C]" />
              <span className="text-[10px] font-bold text-[#EA580C] group-hover:underline">Track →</span>
            </div>
            <div className="text-xs font-bold text-[#2E2628]">Screening Journey</div>
            <div className="text-[11px] text-[#6E5C5F]">Check care continuum and clinic steps</div>
          </button>

          <button
            type="button"
            onClick={onOpenAccessibility}
            className="p-4 rounded-2xl border border-[#EFE4DC] hover:border-[#EA580C] bg-[#FAF8F6] text-left transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <Sliders className="w-4 h-4 text-[#EA580C]" />
              <span className="text-[10px] font-bold text-[#EA580C] group-hover:underline">Adjust →</span>
            </div>
            <div className="text-xs font-bold text-[#2E2628]">Accessibility</div>
            <div className="text-[11px] text-[#6E5C5F]">Change text size, contrast, or color vision</div>
          </button>
        </div>

        {/* ACTIONS: SWITCH WORKSPACE & LOGOUT */}
        <div className="pt-4 border-t border-[#EFE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {onSwitchWorkspace && (
            <button
              type="button"
              onClick={onSwitchWorkspace}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] border border-[#EFE4DC] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Switch Workspace</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors self-end sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Patient Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
