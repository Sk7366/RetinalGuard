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
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  X,
  User,
  Stethoscope,
} from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useTranslation } from '../i18n/I18nContext';
import { voiceService, VoicePlaybackState } from '../services/voiceService';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsPatient: () => void;
  onContinueAsHelper: () => void;
  onContinueAsResearcher: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onContinueAsPatient,
  onContinueAsHelper,
  onContinueAsResearcher,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(voiceService.getState());
  const [step, setStep] = useState<'welcome' | 'chooseRole'>('welcome');

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
    const what = t(
      'welcomeWhatDesc',
      'RetinaGuard is an AI-assisted retinal screening support platform that helps people understand retinal screening and helps screening teams organize and assess screening information.'
    );
    const why = t(
      'welcomeWhyDesc',
      'Some retinal conditions can progress without obvious symptoms and screening can help identify people who may need further professional evaluation.'
    );
    const disclaimer = t(
      'welcomeDisclaimerText',
      'RetinaGuard provides AI-assisted screening support and does not replace professional medical evaluation or provide a definitive diagnosis.'
    );
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

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      <div className="bg-white dark:bg-[#211B1E] rounded-3xl border border-[#EFE4DC] dark:border-[#382E33] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* TOP BAR: BRAND + LANGUAGE SELECTION + CLOSE */}
        <div className="bg-[#FFFDF9] dark:bg-[#211B1E] border-b border-[#EFE4DC] dark:border-[#382E33] px-6 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F05A28] text-white flex items-center justify-center shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#2B2024] dark:text-[#FFF7F2] tracking-tight">
                RetinaGuard<span className="font-sans text-xs text-[#F05A28] ml-1 font-semibold">AI</span>
              </span>
              <span className="block text-[10px] text-[#6F6267] dark:text-[#D8C9CE] font-medium leading-none">
                Multimodal Retinal Screening Support
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PART 5: LANGUAGE SELECTOR (English, Hindi, Kannada, Tamil, Telugu, Malayalam) */}
            <div className="relative">
              <select
                id="welcome-language-select"
                aria-label="Choose your language"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                className="text-xs font-semibold bg-white dark:bg-[#2A2226] border border-[#EFE4DC] dark:border-[#382E33] text-[#2B2024] dark:text-[#FFF7F2] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F05A28]"
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
              className="p-1.5 rounded-xl text-[#6F6267] hover:text-[#2B2024] dark:text-[#D8C9CE] dark:hover:text-white hover:bg-[#FBE4EC]/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STEP 1: WELCOME & EXPLANATION */}
        {step === 'welcome' && (
          <>
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-[#2B2024] dark:text-[#FFF7F2]">
              {/* HEADER & READ ALOUD CONTROLS (Part 6) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE4DC] dark:border-[#382E33]">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE5D8]/40 text-[#F05A28] border border-[#FED7AA] mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
                    <span>{t('welcomeBadge', 'AI-ASSISTED SCREENING SUPPORT')}</span>
                  </div>
                  <h2
                    id="welcome-modal-title"
                    className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2024] dark:text-[#FFF7F2] tracking-tight"
                  >
                    {t('welcomeTitle', 'Welcome to RetinaGuard')}
                  </h2>
                </div>

                {/* Part 6: 🔊 READ ALOUD BAR (Play, Pause, Repeat, Stop) */}
                <div className="bg-[#FFFDF9] dark:bg-[#2A2226] border border-[#EFE4DC] dark:border-[#382E33] rounded-2xl p-2 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto">
                  {!isSpeakingThis && !isPausedThis ? (
                    <button
                      type="button"
                      onClick={handlePlayVoice}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2B2024] hover:bg-black text-white text-xs font-semibold transition-colors shadow-2xs"
                      title="Listen to explanation in selected language"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#F05A28]" />
                      <span>{t('readAloudBtn', '🔊 Read Aloud')}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      {isSpeakingThis ? (
                        <button
                          type="button"
                          onClick={handlePauseVoice}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePlayVoice}
                          className="p-1.5 rounded-lg bg-[#2B2024] text-white transition-colors"
                          title="Resume"
                        >
                          <Play className="w-4 h-4 text-[#F05A28]" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRepeatVoice}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
                        title="Replay"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleStopVoice}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
                        title="Stop"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-semibold text-[#F05A28] px-1 animate-pulse">
                        {currentLangObj.nativeLabel}...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* WHAT IS RETINAGUARD? */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F05A28]">
                  {t('welcomeWhatTitle', 'WHAT IS RETINAGUARD?')}
                </h3>
                <p className="text-sm sm:text-base text-[#2B2024] dark:text-[#FFF7F2] leading-relaxed font-normal">
                  {t(
                    'welcomeWhatDesc',
                    'RetinaGuard is an AI-assisted retinal screening support platform that helps people understand retinal screening and helps screening teams organize and assess screening information.'
                  )}
                </p>
              </div>

              {/* WHY DOES SCREENING MATTER? */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F05A28]">
                  {t('welcomeWhyTitle', 'WHY DOES SCREENING MATTER?')}
                </h3>
                <p className="text-sm sm:text-base text-[#2B2024] dark:text-[#FFF7F2] leading-relaxed">
                  {t(
                    'welcomeWhyDesc',
                    'Some retinal conditions can progress without obvious symptoms and screening can help identify people who may need further professional evaluation before permanent vision changes occur.'
                  )}
                </p>
              </div>

              {/* HOW CAN RETINAGUARD HELP? (For People, For Teams, For Researchers) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F05A28]">
                  {t('welcomeHowTitle', 'HOW CAN RETINAGUARD HELP?')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* For People */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#2A2226] border border-[#EFE4DC] dark:border-[#382E33] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2B2024] dark:text-[#FFF7F2]">
                      <Heart className="w-4 h-4 text-[#F05A28]" />
                      <span>For People</span>
                    </div>
                    <ul className="text-xs text-[#6F6267] dark:text-[#D8C9CE] space-y-1.5 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Learn about retinal screening</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Find participating screening centers</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Upload existing images for informational assessment</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Receive clear reports & follow-up info</span>
                      </li>
                    </ul>
                  </div>

                  {/* For Screening Teams */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#2A2226] border border-[#EFE4DC] dark:border-[#382E33] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2B2024] dark:text-[#FFF7F2]">
                      <Users className="w-4 h-4 text-[#F05A28]" />
                      <span>For Screening Teams</span>
                    </div>
                    <ul className="text-xs text-[#6F6267] dark:text-[#D8C9CE] space-y-1.5 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Capture/upload retinal images</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Real-time image quality feedback</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Organize screening cases & queues</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Assist with triage & referral workflows</span>
                      </li>
                    </ul>
                  </div>

                  {/* For Researchers */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#2A2226] border border-[#EFE4DC] dark:border-[#382E33] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2B2024] dark:text-[#FFF7F2]">
                      <FlaskConical className="w-4 h-4 text-[#F05A28]" />
                      <span>For Researchers</span>
                    </div>
                    <ul className="text-xs text-[#6F6267] dark:text-[#D8C9CE] space-y-1.5 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Explore multimodal fusion models</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Inspect Grad-CAM heatmaps & SHAP</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F6A] shrink-0 mt-0.5" />
                        <span>Evaluate ablation studies & datasets</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* IMPORTANT MEDICAL DISCLAIMER (Part 4) */}
              <div className="p-4 rounded-2xl bg-[#FFE5D8]/40 dark:bg-[#F05A28]/10 border border-[#FED7AA] dark:border-[#382E33] flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#F05A28] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#D84818] uppercase tracking-wider block">
                    Important Safety Notice
                  </span>
                  <p className="text-xs text-[#6F6267] dark:text-[#D8C9CE] leading-relaxed">
                    {t(
                      'welcomeDisclaimerText',
                      'RetinaGuard provides AI-assisted screening support and does not replace professional medical evaluation or provide a definitive diagnosis.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="bg-[#FFFDF9] dark:bg-[#211B1E] border-t border-[#EFE4DC] dark:border-[#382E33] px-6 py-4 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  voiceService.stop();
                  onClose();
                }}
                className="text-xs font-semibold text-[#6F6267] hover:text-[#2B2024] dark:text-[#D8C9CE] dark:hover:text-white px-3 py-2 transition-colors"
              >
                {t('welcomeMaybeLater', 'Close')}
              </button>

              <button
                type="button"
                id="welcome-continue-btn"
                onClick={() => {
                  voiceService.stop();
                  setStep('chooseRole');
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <span>{t('welcomeContinueBtn', 'Continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: HOW WILL YOU USE RETINAGUARD? (Part 7) */}
        {step === 'chooseRole' && (
          <>
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1 text-[#2B2024] dark:text-[#FFF7F2]">
              <div className="text-center max-w-md mx-auto space-y-1.5 pb-2">
                <h2 className="text-2xl font-serif font-bold text-[#2B2024] dark:text-[#FFF7F2]">
                  How will you use RetinaGuard?
                </h2>
                <p className="text-xs text-[#6F6267] dark:text-[#D8C9CE]">
                  Select your primary purpose to configure the appropriate workspace.
                </p>
              </div>

              <div className="space-y-3.5 max-w-lg mx-auto">
                {/* 1. PATIENT / COMMON PERSON */}
                <div className="p-5 rounded-2xl border border-[#FED7AA] bg-[#FFE5D8]/20 dark:bg-[#F05A28]/10 hover:border-[#F05A28] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#F05A28] text-white flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-bold text-[#2B2024] dark:text-[#FFF7F2]">
                        I'M LOOKING FOR SCREENING
                      </div>
                    </div>
                    <p className="text-xs text-[#6F6267] dark:text-[#D8C9CE] pl-9">
                      Patient / Common Person — Learn, find screening centers near you, and check existing screening images.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      voiceService.stop();
                      onContinueAsPatient();
                    }}
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#D84818] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Continue as Patient
                  </button>
                </div>

                {/* 2. SCREENING HELPER */}
                <div className="p-5 rounded-2xl border border-[#EFE4DC] dark:border-[#382E33] bg-white dark:bg-[#2A2226] hover:border-[#F05A28] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-stone-700 text-white flex items-center justify-center">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-bold text-[#2B2024] dark:text-[#FFF7F2]">
                        I HELP WITH SCREENING
                      </div>
                    </div>
                    <p className="text-xs text-[#6F6267] dark:text-[#D8C9CE] pl-9">
                      Screening Helper / Healthcare Worker — Assisted camp capture, real-time quality check, and referral triage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      voiceService.stop();
                      onContinueAsHelper();
                    }}
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Sign In
                  </button>
                </div>

                {/* 3. RESEARCHER */}
                <div className="p-5 rounded-2xl border border-[#EFE4DC] dark:border-[#382E33] bg-white dark:bg-[#2A2226] hover:border-[#F05A28] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-stone-700 text-white flex items-center justify-center">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-bold text-[#2B2024] dark:text-[#FFF7F2]">
                        I'M A RESEARCHER
                      </div>
                    </div>
                    <p className="text-xs text-[#6F6267] dark:text-[#D8C9CE] pl-9">
                      Research Workspace — Multimodal fusion laboratory, explainability metrics, and ablation analytics.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      voiceService.stop();
                      onContinueAsResearcher();
                    }}
                    className="shrink-0 px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 text-[#2B2024] dark:text-[#FFF7F2] text-xs font-semibold transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM BAR WITH BACK BUTTON */}
            <div className="bg-[#FFFDF9] dark:bg-[#211B1E] border-t border-[#EFE4DC] dark:border-[#382E33] px-6 py-4 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="text-xs font-semibold text-[#6F6267] hover:text-[#2B2024] dark:text-[#D8C9CE] dark:hover:text-white px-3 py-2 transition-colors"
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
