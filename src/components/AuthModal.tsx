import React, { useState } from 'react';
import { X, Lock, Mail, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLoginSuccess(email);
    onClose();
  };

  const handleDemoSignIn = () => {
    setIsDemoLoading(true);
    setTimeout(() => {
      setIsDemoLoading(false);
      onLoginSuccess('researcher@retinaguard.ai');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#EFE4DC] shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F05A28] to-[#DB2777]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6F6267] hover:text-[#2B2024] p-1.5 rounded-lg hover:bg-[#FFE5D8] transition-colors"
          aria-label={t('closeModal', 'Close modal')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFE5D8] text-[#D84818] border border-[#FED7AA]">
            <Shield className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>{t('researchClinicalPortalBadge', 'Research & Clinical Portal')}</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#2B2024]">
            {t('signInRetinaGuardTitle', 'Sign in to RetinaGuard')}
          </h2>
          <p className="text-xs text-[#6F6267] leading-relaxed">
            {t('signInRetinaGuardSub', 'Access past screening audit trails, export aggregated datasets, or continue research demonstration.')}
          </p>
        </div>

        {/* Free Screening Notice */}
        <div className="p-3 bg-[#FFFDF9] rounded-xl border border-[#FED7AA] mb-5 text-xs text-[#6F6267] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>
            <strong>{t('noLoginRequiredBold', 'No login required')}</strong> {t('noLoginRequiredText', 'to try the 3-step multimodal screening workflow or view benchmark results.')}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2B2024] mb-1">
              {t('workInstitutionalEmail', 'Work / Institutional Email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9E8D91] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder', 'name@hospital.org or university.edu')}
                className="w-full text-xs bg-[#FFFDF9] border border-[#EFE4DC] rounded-lg pl-9 pr-3 py-2.5 text-[#2B2024] placeholder-[#9E8D91] focus:outline-none focus:border-[#F05A28] focus:ring-1 focus:ring-[#F05A28]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B2024] mb-1">
              {t('passwordLabel', 'Password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9E8D91] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-[#FFFDF9] border border-[#EFE4DC] rounded-lg pl-9 pr-3 py-2.5 text-[#2B2024] placeholder-[#9E8D91] focus:outline-none focus:border-[#F05A28] focus:ring-1 focus:ring-[#F05A28]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#F05A28] to-[#DB2777] hover:from-[#D84818] hover:to-[#D94A78] text-white text-xs font-semibold py-2.5 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>{t('signInButton', 'Sign In')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EFE4DC]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#9E8D91]">{t('orForRecruiters', 'or for recruiters / judges')}</span>
          </div>
        </div>

        {/* Demo User CTA */}
        <button
          onClick={handleDemoSignIn}
          disabled={isDemoLoading}
          className="w-full bg-[#FFE5D8] hover:bg-[#FED7AA]/40 text-[#D84818] border border-[#FED7AA] text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>{isDemoLoading ? t('connectingEllipsis', 'Connecting...') : t('continueAsDemoResearcher', 'Continue as Demo Researcher')}</span>
        </button>

        <p className="text-[10px] text-center text-[#9E8D91] mt-4 leading-relaxed">
          {t('demoAccountNotice', 'Demo accounts have preloaded patient history and synthetic clinical metadata for evaluation purposes.')}
        </p>
      </div>
    </div>
  );
};
