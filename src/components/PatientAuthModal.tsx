import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Eye,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { authService } from '../auth/authService';
import { User } from '../types';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToStaffLogin?: () => void;
}

export const PatientAuthModal: React.FC<PatientAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToStaffLogin,
}) => {
  const { t, language } = useTranslation();

  // Mode: 'register' | 'signin'
  const [mode, setMode] = useState<'register' | 'signin'>('register');

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  // Verification stage: 'form' | 'verify-email' | 'verify-phone' | 'completed'
  const [step, setStep] = useState<'form' | 'verify-email' | 'verify-phone' | 'completed'>('form');

  // Verification codes
  const [emailCode, setEmailCode] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStartVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg(t('errEnterAllFields', 'Please enter your full name, email, and mobile phone number.'));
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg(t('errValidEmail', 'Please enter a valid email address for receiving reports.'));
      return;
    }
    setErrorMsg('');
    setStep('verify-email');
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow demo code 123456 or any 6-digit number
    if (emailCode.length < 4) {
      setErrorMsg(t('errEnterEmailCode', 'Please enter the 6-digit verification code sent to your email.'));
      return;
    }
    setEmailVerified(true);
    setErrorMsg('');
    setStep('verify-phone');
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneOtp.length < 4) {
      setErrorMsg(t('errEnterPhoneOtp', 'Please enter the 6-digit SMS OTP sent to your phone.'));
      return;
    }
    setPhoneVerified(true);
    setErrorMsg('');
    setStep('completed');

    // Register patient in authService
    const registeredUser = await authService.registerPatient({
      name: fullName,
      email,
      phone,
      dateOfBirth: dob,
      preferredLanguage: language,
      emailVerified: true,
      phoneVerified: true,
    });

    setTimeout(() => {
      onSuccess(registeredUser);
      onClose();
    }, 1200);
  };

  const handleQuickDemoPatient = async () => {
    const demoPatient = await authService.registerPatient({
      name: 'Suresh Kumar',
      email: 'suresh.kumar@community-patient.in',
      phone: '+91 98450 12345',
      dateOfBirth: '1968-05-14',
      preferredLanguage: language,
      emailVerified: true,
      phoneVerified: true,
    });
    setEmailVerified(true);
    setPhoneVerified(true);
    setStep('completed');
    setTimeout(() => {
      onSuccess(demoPatient);
      onClose();
    }, 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-auth-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-3xl border border-[#EFE4DC] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2B2024]">
        {/* HEADER */}
        <div className="bg-[#FFFDF9] border-b border-[#EFE4DC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F05A28] text-white flex items-center justify-center shadow-2xs">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif font-bold text-base text-[#2B2024]">
              RetinaGuard<span className="text-[#F05A28] text-xs font-sans ml-1">{t('patientPortalBadge', 'Patient Portal')}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9E8D91] hover:text-[#2B2024] hover:bg-[#FFFDF9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="bg-[#FAF8F6] px-6 py-2.5 border-b border-[#EFE4DC] flex items-center justify-between text-[11px] font-semibold">
          <span className={`flex items-center gap-1 ${step === 'form' ? 'text-[#F05A28]' : 'text-[#059669]'}`}>
            {t('authStepDetails', '1. Details')} {emailVerified && '✓'}
          </span>
          <span className="text-[#D6D3D1]">→</span>
          <span className={`flex items-center gap-1 ${step === 'verify-email' ? 'text-[#F05A28]' : emailVerified ? 'text-[#059669]' : 'text-[#9E8D91]'}`}>
            {t('authStepEmail', '2. Email')} {emailVerified && '✓'}
          </span>
          <span className="text-[#D6D3D1]">→</span>
          <span className={`flex items-center gap-1 ${step === 'verify-phone' ? 'text-[#F05A28]' : phoneVerified ? 'text-[#059669]' : 'text-[#9E8D91]'}`}>
            {t('authStepPhone', '3. Phone OTP')} {phoneVerified && '✓'}
          </span>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: REGISTRATION / SIGN IN FORM */}
          {step === 'form' && (
            <form onSubmit={handleStartVerification} className="space-y-4">
              <div>
                <h3 id="patient-auth-title" className="text-xl font-serif font-bold text-[#2B2024]">
                  {mode === 'register' ? t('patientAuthHeading', 'Patient Sign In & Follow-Up Registration') : t('patientSignIn', 'Patient Sign In')}
                </h3>
                <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                  {t('patientAuthSubheading', 'Verify your email and mobile number so your screening results and referral letters can be securely delivered to you.')}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    {t('fullNameRequired', 'Full Name *')}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#9E8D91] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder={t('namePlaceholder', 'e.g. Suresh Kumar')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#EFE4DC] focus:outline-none focus:ring-2 focus:ring-[#F05A28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    {t('emailReportsRequired', 'Email Address * (For receiving screening reports)')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9E8D91] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder={t('emailPlaceholder', 'name@example.com')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#EFE4DC] focus:outline-none focus:ring-2 focus:ring-[#F05A28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    {t('phoneAlertsRequired', 'Mobile Phone Number * (For SMS reminders & clinic alerts)')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#9E8D91] absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder={t('phonePlaceholder', '+91 98450 12345')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#EFE4DC] focus:outline-none focus:ring-2 focus:ring-[#F05A28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                    {t('dobOptional', 'Date of Birth (Optional)')}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#9E8D91] absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#EFE4DC] focus:outline-none focus:ring-2 focus:ring-[#F05A28]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>{t('continueToVerification', 'Continue to Verification')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* QUICK DEMO PATIENT */}
              <div className="pt-2 border-t border-[#EFE4DC] text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoPatient}
                  className="w-full py-2 rounded-xl bg-[#FFE5D8] hover:bg-[#FFEDD5] border border-[#FED7AA] text-[#D84818] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
                  <span>{t('oneClickDemoPatient', '1-Click Demo Patient (Suresh Kumar, Verified)')}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY EMAIL */}
          {step === 'verify-email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <span className="text-xs font-bold text-[#F05A28] uppercase tracking-wider block mb-1">
                  {t('step2EmailConfirm', 'Step 2 of 3 • Email Confirmation')}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2B2024]">
                  {t('verifyYourEmailTitle', 'Verify Your Email')}
                </h3>
                <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                  {t('emailSentCodeDesc', 'We sent a 6-digit confirmation code to')} <span className="font-semibold text-[#2B2024]">{email}</span>.
                </p>
              </div>

              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-[#EFE4DC] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2B2024]">{t('demoTestCodeLabel', 'Demo Test Code:')}</span>
                  <span className="font-mono font-bold bg-[#FFE5D8] text-[#F05A28] px-2 py-0.5 rounded border border-[#FED7AA]">
                    123456
                  </span>
                </div>
                <p className="text-[11px] text-[#9E8D91]">
                  {t('demoCodeHelp', 'Click the demo code to auto-fill or enter any 6 digits.')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                  {t('enterEmailCodeLabel', 'Enter 6-Digit Email Code')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className="w-full px-3 py-2.5 text-center tracking-widest font-mono text-base rounded-xl border border-[#EFE4DC] focus:outline-none focus:ring-2 focus:ring-[#F05A28]"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setEmailCode('123456')}
                  className="text-[#F05A28] font-semibold hover:underline"
                >
                  {t('fillDemoCodeBtn', 'Fill Demo Code (123456)')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-[#6F6267] hover:underline"
                >
                  {t('changeEmailBtn', 'Change Email')}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {t('verifyEmailContinueBtn', 'Verify Email & Continue')}
              </button>
            </form>
          )}

          {/* STEP 3: VERIFY PHONE OTP */}
          {step === 'verify-phone' && (
            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <div>
                <span className="text-xs font-bold text-[#F05A28] uppercase tracking-wider block mb-1">
                  {t('step3PhoneOtp', 'Step 3 of 3 • Mobile OTP')}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2B2024]">
                  {t('verifyYourPhoneTitle', 'Verify Your Phone Number')}
                </h3>
                <p className="text-xs text-[#6F6267] mt-1 leading-relaxed">
                  {t('smsOtpSentDesc', 'We sent an SMS OTP to')} <span className="font-semibold text-[#2B2024]">{phone}</span> {t('forClinicNotifications', 'for clinic notifications.')}
                </p>
              </div>

              <div className="p-3 bg-[#FFFDF9] rounded-xl border border-[#EFE4DC] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2B2024]">{t('demoSmsOtpLabel', 'Demo SMS OTP:')}</span>
                  <span className="font-mono font-bold bg-[#FFE5D8] text-[#F05A28] px-2 py-0.5 rounded border border-[#FED7AA]">
                    789012
                  </span>
                </div>
                <p className="text-[11px] text-[#9E8D91]">
                  {t('demoOtpHelp', 'Click the demo OTP to auto-fill or enter any 6 digits.')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2024] mb-1">
                  {t('enterSmsOtpLabel', 'Enter 6-Digit SMS OTP')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="789012"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  className="w-full px-3 py-2.5 text-center tracking-widest font-mono text-base rounded-xl border border-[#EFE4DC] focus:outline-none focus:ring-2 focus:ring-[#F05A28]"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setPhoneOtp('789012')}
                  className="text-[#F05A28] font-semibold hover:underline"
                >
                  {t('fillDemoOtpBtn', 'Fill Demo OTP (789012)')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('verify-email')}
                  className="text-[#6F6267] hover:underline"
                >
                  {t('backBtn', 'Back')}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {t('completeVerificationBtn', 'Complete Verification')}
              </button>
            </form>
          )}

          {/* STEP 4: COMPLETED */}
          {step === 'completed' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2B2024]">
                  {t('accountVerifiedSuccess', 'Account Verified Successfully!')}
                </h3>
                <p className="text-xs text-[#6F6267] mt-1">
                  {t('welcomeToRetinaGuard', 'Welcome to RetinaGuard')}, {fullName || t('patientRole', 'Patient')}.
                </p>
              </div>

              <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#EFE4DC] text-left text-xs space-y-2 max-w-xs mx-auto">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('emailVerifiedBadge', 'Email verified ✓')} ({email})</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('phoneVerifiedBadge', 'Mobile phone verified ✓')} ({phone})</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('secureDeliveryBadge', 'Secure report delivery enabled ✓')}</span>
                </div>
              </div>
            </div>
          )}

          {/* HEALTHCARE TEAM LOGIN SWITCH */}
          {step === 'form' && onSwitchToStaffLogin && (
            <div className="pt-3 border-t border-[#EFE4DC] text-center">
              <span className="text-xs text-[#9E8D91]">
                {t('areYouStaffOrResearcher', 'Are you a healthcare worker or researcher?')}
              </span>
              <button
                type="button"
                onClick={onSwitchToStaffLogin}
                className="text-xs font-semibold text-[#F05A28] hover:underline ml-1"
              >
                {t('staffResearcherLoginBtn', 'Staff / Researcher Login')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
