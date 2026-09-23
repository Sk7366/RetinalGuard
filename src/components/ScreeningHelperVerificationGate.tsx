import React from 'react';
import {
  ShieldAlert,
  Clock,
  XCircle,
  AlertTriangle,
  User as UserIcon,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { User, VerificationStatus } from '../types';
import { authService } from '../auth/authService';

interface ScreeningHelperVerificationGateProps {
  currentUser: User;
  onVerificationUpdated: (updatedUser: User) => void;
  onOpenSignInModal: () => void;
  onNavigateToPatientPortal: () => void;
}

export const ScreeningHelperVerificationGate: React.FC<ScreeningHelperVerificationGateProps> = ({
  currentUser,
  onVerificationUpdated,
  onOpenSignInModal,
  onNavigateToPatientPortal,
}) => {
  const rawStatus = currentUser.verificationStatus || 'Pending Verification';
  const statusNormalized = rawStatus.toLowerCase();

  const isPending = statusNormalized.includes('pending');
  const isRejected = statusNormalized.includes('reject');
  const isSuspended = statusNormalized.includes('suspend');

  const handleSimulateStatus = (newStatus: VerificationStatus) => {
    const updated = authService.setVerificationStatus(newStatus);
    onVerificationUpdated(updated);
  };

  const handleActivateDemoVerified = () => {
    const updated = authService.setVerificationStatus('Verified');
    onVerificationUpdated(updated);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 animate-in fade-in" id="helper-verification-gate">
      {/* HEADER NOTICE */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]">
          <Lock className="w-3.5 h-3.5" />
          <span>Screening Helper Access Restricted</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628]">
          Verification Required for Clinical Workspace
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5C5F] max-w-xl mx-auto">
          To protect patient confidentiality and ensure clinical diagnostic accuracy, only accredited and{' '}
          <strong className="text-[#2E2628]">VERIFIED Screening Helpers</strong> can access patient imaging,
          AI triage results, and referral dispatch.
        </p>
      </div>

      {/* STATUS CARD */}
      <div
        className={`rounded-2xl border p-6 sm:p-7 shadow-xs space-y-5 ${
          isPending
            ? 'bg-[#FFFBEB] border-[#FDE68A]'
            : isRejected
            ? 'bg-[#FEF2F2] border-[#FECACA]'
            : 'bg-[#FDF4FF] border-[#F5D0FE]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPending
                  ? 'bg-[#FDE68A] text-[#B45309]'
                  : isRejected
                  ? 'bg-[#FEE2E2] text-[#DC2626]'
                  : 'bg-[#F5D0FE] text-[#A21CAF]'
              }`}
            >
              {isPending ? (
                <Clock className="w-6 h-6" />
              ) : isRejected ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5C5F]">
                Current Account Status
              </span>
              <h2 className="text-lg font-bold text-[#2E2628] flex items-center gap-2">
                <span>
                  {isPending
                    ? 'Pending Verification'
                    : isRejected
                    ? 'Verification Rejected'
                    : 'Access Suspended'}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    isPending
                      ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                      : isRejected
                      ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                      : 'bg-[#FCE7F3] text-[#831843] border border-[#F472B6]'
                  }`}
                >
                  {rawStatus}
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* STATUS EXPLANATION */}
        <div className="text-xs text-[#4A3B32] space-y-2 leading-relaxed">
          {isPending && (
            <p>
              Your registration as a <strong>{currentUser.helperRoleTitle || 'Screening Helper'}</strong> with{' '}
              <strong>{currentUser.organization || 'your organization'}</strong> has been recorded and is queued
              for review by the District Health Mission Coordinator. Standard credential accreditation typically takes 24–48 hours.
            </p>
          )}
          {isRejected && (
            <p>
              Your credentials or affiliation with <strong>{currentUser.organization || 'the submitted organization'}</strong> could not be verified by the program coordinator. If this was submitted in error, please register with verified clinical contact details or contact the coordinator.
            </p>
          )}
          {isSuspended && (
            <p>
              Your Screening Helper credentials have been temporarily suspended pending annual re-certification or audit compliance. Contact your health program supervisor to re-enable clinical screening intake privileges.
            </p>
          )}
        </div>

        {/* SUBMITTED HELPER PROFILE DETAILS */}
        <div className="bg-white/80 rounded-xl p-4 border border-black/5 space-y-2">
          <div className="text-[11px] font-bold text-[#8E7E81] uppercase tracking-wider mb-2">
            Collected Registration Information
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Full Name</span>
                <span className="font-semibold text-[#2E2628]">{currentUser.name || 'Not provided'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Role</span>
                <span className="font-semibold text-[#2E2628]">
                  {currentUser.helperRoleTitle || 'Community Health Worker'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Organization</span>
                <span className="font-semibold text-[#2E2628] truncate max-w-[170px] block">
                  {currentUser.organization || 'Not provided'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Work Email</span>
                <span className="font-semibold text-[#2E2628] truncate max-w-[170px] block font-mono text-[11px]">
                  {currentUser.email || 'Not provided'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Phone</span>
                <span className="font-semibold text-[#2E2628] font-mono text-[11px]">
                  {currentUser.phone || '+91 98450 67890'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              <div>
                <span className="text-[#8E7E81] block text-[10px]">Location</span>
                <span className="font-semibold text-[#2E2628] truncate max-w-[170px] block">
                  {currentUser.location || 'Bengaluru, Karnataka'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROTOTYPE / DEMO VERIFICATION TOOLBAR */}
      <div className="bg-[#FFFDFB] rounded-2xl border-2 border-dashed border-[#FED7AA] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-[#EA580C] text-white tracking-wider uppercase">
              DEMO / EVALUATION CONTROLS
            </span>
            <span className="text-xs font-semibold text-[#6E5C5F]">
              Test verification gating & transitions:
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#8E7E81]">
            Prototype Mode Active
          </span>
        </div>

        <p className="text-xs text-[#6E5C5F] leading-relaxed">
          In this evaluation applet, you can simulate administrative approval or switch verification states to verify that only a verified helper can enter the clinical screening workspace.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Primary Demo Verified Button */}
          <button
            type="button"
            onClick={handleActivateDemoVerified}
            className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-black shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ACTIVATE DEMO VERIFIED (Unlock Workspace)</span>
          </button>

          {/* Test Pending */}
          <button
            type="button"
            onClick={() => handleSimulateStatus('Pending Verification')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              isPending
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
                : 'bg-white hover:bg-stone-50 text-[#6E5C5F] border-[#EFE4DC]'
            }`}
          >
            Simulate Pending
          </button>

          {/* Test Rejected */}
          <button
            type="button"
            onClick={() => handleSimulateStatus('Rejected')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              isRejected
                ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]'
                : 'bg-white hover:bg-stone-50 text-[#6E5C5F] border-[#EFE4DC]'
            }`}
          >
            Simulate Rejected
          </button>

          {/* Test Suspended */}
          <button
            type="button"
            onClick={() => handleSimulateStatus('Suspended')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              isSuspended
                ? 'bg-[#FCE7F3] text-[#831843] border-[#F472B6]'
                : 'bg-white hover:bg-stone-50 text-[#6E5C5F] border-[#EFE4DC]'
            }`}
          >
            Simulate Suspended
          </button>
        </div>
      </div>

      {/* SECONDARY ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
        <button
          type="button"
          onClick={onOpenSignInModal}
          className="text-[#EA580C] hover:text-[#C2410C] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sign In / Register with Different Credentials</span>
        </button>

        <button
          type="button"
          onClick={onNavigateToPatientPortal}
          className="text-[#6E5C5F] hover:text-[#2E2628] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Return to Patient Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
