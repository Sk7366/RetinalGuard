import React, { useState, useEffect } from 'react';
import {
  Eye,
  Volume2,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sparkles,
  ShieldAlert,
  Heart,
  Users,
  CheckCircle2,
  ArrowRight,
  Globe,
  X,
} from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useTranslation } from '../i18n/I18nContext';
import { voiceService, VoicePlaybackState } from '../services/voiceService';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onOpenAuth?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  onOpenAuth,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());

  useEffect(() => {
    const unsub = voiceService.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleLanguageChange = (lang: LanguageCode) => {
    voiceService.stop();
    setLanguage(lang);
  };

  const getWelcomeSpeechText = () => {
    const what = t('welcomeWhatDesc', 'RetinaGuard is an AI-assisted retinal screening support platform designed to help people understand the importance of screening and help screening teams identify cases that may need further clinical review.');
    const why = t('welcomeWhyDesc', 'Many eye conditions can progress without obvious symptoms. Early screening can help identify people who may need further evaluation.');
    const disclaimer = t('welcomeDisclaimerText', 'RetinaGuard is a screening and decision-support tool. It does not replace a qualified healthcare professional or provide a definitive diagnosis.');
    return `${t('welcomeTitle', 'Welcome to RetinaGuard')}. ${what}. ${why}. ${disclaimer}`;
  };

  const isSpeakingThis = voiceState.isPlaying && voiceState.speakingSectionId === 'welcome-modal';
  const isPausedThis = voiceState.isPaused && voiceState.speakingSectionId === 'welcome-modal';

  const handlePlayVoice = () => {
    if (isPausedThis) {
      voiceService.resume();
    } else {
      voiceService.speak({
        text: getWelcomeSpeechText(),
        title: t('welcomeTitle', 'Welcome to RetinaGuard'),
        lang: language,
        sectionId: 'welcome-modal',
      });
    }
  };

  const handlePauseVoice = () => {
    voiceService.pause();
  };

  const handleStopVoice = () => {
    voiceService.stop();
  };

  const handleRepeatVoice = () => {
    voiceService.stop();
    voiceService.speak({
      text: getWelcomeSpeechText(),
      title: t('welcomeTitle', 'Welcome to RetinaGuard'),
      lang: language,
      sectionId: 'welcome-modal',
    });
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      <div className="bg-white rounded-3xl border border-[#EFE4DC] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* TOP BAR: BRAND + LANGUAGE + CLOSE */}
        <div className="bg-[#FFFDFB] border-b border-[#EFE4DC] px-6 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#2E2628] tracking-tight">
                RetinaGuard<span className="font-sans text-xs text-[#EA580C] ml-1">AI</span>
              </span>
              <span className="block text-[10px] text-[#9E8D91] font-medium leading-none">
                Community Retinal Health
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <select
                id="welcome-language-select"
                aria-label="Choose your language"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                className="text-xs font-semibold bg-white border border-[#EFE4DC] text-[#2E2628] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                voiceService.stop();
                onClose();
              }}
              aria-label="Close welcome modal"
              className="p-1.5 rounded-xl text-[#9E8D91] hover:text-[#2E2628] hover:bg-[#F9F5F1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-[#2E2628]">
          {/* HEADER & READ ALOUD CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE4DC]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>{t('welcomeBadge', 'AI-ASSISTED SCREENING SUPPORT')}</span>
              </div>
              <h2 id="welcome-modal-title" className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
                {t('welcomeTitle', 'Welcome to RetinaGuard')}
              </h2>
            </div>

            {/* Read Aloud Bar */}
            <div className="bg-[#FFFDFB] border border-[#EFE4DC] rounded-2xl p-2 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto">
              {!isSpeakingThis && !isPausedThis ? (
                <button
                  type="button"
                  onClick={handlePlayVoice}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E2628] hover:bg-black text-white text-xs font-semibold transition-colors"
                  title="Listen to explanation in selected language"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{t('readAloudBtn', 'Listen')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  {isSpeakingThis ? (
                    <button
                      type="button"
                      onClick={handlePauseVoice}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                      title="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePlayVoice}
                      className="p-1.5 rounded-lg bg-[#2E2628] text-white transition-colors"
                      title="Resume"
                    >
                      <Play className="w-4 h-4 text-[#EA580C]" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRepeatVoice}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                    title="Replay"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleStopVoice}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                    title="Stop"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold text-[#EA580C] px-1 animate-pulse">
                    Speaking in {currentLangObj.nativeLabel}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 1: WHAT IS RETINAGUARD */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
              {t('welcomeWhatTitle', '1. WHAT IS RETINAGUARD?')}
            </h3>
            <p className="text-sm sm:text-base text-[#2E2628] leading-relaxed font-normal">
              {t(
                'welcomeWhatDesc',
                'RetinaGuard is an AI-assisted retinal screening support platform designed to help people understand the importance of screening and help screening teams identify cases that may need further clinical review.'
              )}
            </p>
          </div>

          {/* SECTION 2: WHY DOES IT MATTER? */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
              {t('welcomeWhyTitle', '2. WHY DOES IT MATTER?')}
            </h3>
            <p className="text-sm sm:text-base text-[#2E2628] leading-relaxed">
              {t(
                'welcomeWhyDesc',
                'Many eye conditions can progress without obvious symptoms. Early screening can help identify people who may need further evaluation before permanent vision loss occurs.'
              )}
            </p>
          </div>

          {/* SECTION 3: HOW CAN IT HELP? */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
              {t('welcomeHowTitle', '3. HOW CAN IT HELP?')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* For People */}
              <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2E2628]">
                  <Heart className="w-4 h-4 text-[#EA580C]" />
                  <span>{t('welcomeForPeople', 'For You & Your Family')}</span>
                </div>
                <ul className="text-xs text-[#6E5C5F] space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span>Understand retinal eye screening without confusing medical jargon</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span>Find free or low-cost screening camps and clinics nearby</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span>Receive clear, plain-language results and digital reports</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span>Receive helpful follow-up information and clinic reminders</span>
                  </li>
                </ul>
              </div>

              {/* For Screening Teams */}
              <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#EFE4DC] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2E2628]">
                  <Users className="w-4 h-4 text-[#EA580C]" />
                  <span>{t('welcomeForTeams', 'For Community Screening Teams')}</span>
                </div>
                <ul className="text-xs text-[#6E5C5F] space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span>Real-time non-mydriatic camera image quality assessment</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span>Assisted risk triage to prioritize cases requiring ophthalmologist review</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span>Direct referral routing and structured clinical handovers</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                    <span>Offline camp mode for rural outreach without reliable internet</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 4: IMPORTANT MEDICAL DISCLAIMER */}
          <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider block">
                {t('welcomeDisclaimerTitle', 'Important Safety Notice')}
              </span>
              <p className="text-xs text-[#6E5C5F] leading-relaxed">
                {t(
                  'welcomeDisclaimerText',
                  'RetinaGuard is an AI-assisted screening and decision-support tool. It does not replace a qualified healthcare professional or provide a definitive medical diagnosis.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="bg-[#FFFDFB] border-t border-[#EFE4DC] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              voiceService.stop();
              onClose();
            }}
            className="text-xs font-semibold text-[#6E5C5F] hover:text-[#2E2628] px-3 py-2 transition-colors order-2 sm:order-1"
          >
            {t('welcomeMaybeLater', 'Maybe Later')}
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              id="welcome-continue-btn"
              onClick={() => {
                voiceService.stop();
                onContinue();
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <span>{t('welcomeContinueBtn', 'Continue to Screening')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
