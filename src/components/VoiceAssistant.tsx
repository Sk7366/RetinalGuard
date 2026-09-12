import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  X,
  Sparkles,
  HelpCircle,
  Activity,
  Mic,
  Sliders,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { voiceService, VoicePlaybackState } from '../services/voiceService';
import { UserRole } from '../types';

interface VoiceAssistantProps {
  role?: UserRole;
  currentRoute?: string;
  voiceGuidanceEnabled?: boolean;
  onToggleVoiceGuidance?: (enabled: boolean) => void;
  activeScreeningStep?: number;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  role = 'public',
  currentRoute = 'overview',
  voiceGuidanceEnabled = true,
  onToggleVoiceGuidance,
  activeScreeningStep,
}) => {
  const { language, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(voiceService.getState());
  const [rate, setRate] = useState(1.0);
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [currentCaption, setCurrentCaption] = useState<string>('');

  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      setPlaybackState(state);
      if (state.currentText) {
        setCurrentCaption(state.currentText);
        setLastSpokenText(state.currentText);
      }
    });
    return unsubscribe;
  }, []);

  const isHelper = role === 'helper' || role === 'technician' || role === 'provider';
  const isResearcher = role === 'researcher';

  // Contextual prompts based on role and location
  const quickPrompts = useMemo(() => {
    if (isResearcher) {
      return [
        {
          id: 'fusion',
          label: 'Explain Late Fusion Architecture',
          text:
            language === 'hi'
              ? 'लेट फ्यूजन फंडस तस्वीरों और ओसीटी स्कैन को एक साथ जोड़कर 0.942 एयूसी सटीकता प्राप्त करता है।'
              : 'Our multimodal late fusion architecture integrates 2D color fundus features with 3D OCT depth representations and tabular metadata, boosting diagnostic AUC by +0.068 over unimodal fundus classification.',
        },
        {
          id: 'qwk',
          label: 'What does Quadratic Weighted Kappa measure?',
          text:
            language === 'hi'
              ? 'क्वाड्रैटिक वेटेड कापा गंभीरता के स्तरों के बीच चिकित्सकीय सहमति को मापता है।'
              : 'Quadratic Weighted Kappa measures multi-class ordinal agreement across the 5 DR severity stages, penalizing clinical misclassification distance between adjacent grades.',
        },
        {
          id: 'gradcam',
          label: 'How to interpret Grad-CAM heatmaps',
          text:
            language === 'hi'
              ? 'ग्रैड-कैम दिखाता है कि एआई ने रेटिना के किन हिस्सों को देखकर निर्णय लिया।'
              : 'Grad-CAM visualizes gradient activations in the final convolutional layer, highlighting microaneurysms, hemorrhages, and hard exudates driving model prediction.',
        },
      ];
    }

    if (isHelper) {
      return [
        {
          id: 'guidelines',
          label: 'Image Quality Checklist',
          text:
            language === 'hi'
              ? 'जांचें कि मैक्युला और ऑप्टिक डिस्क दोनों साफ दिख रहे हों और फोटो में कोई धुंधलापन या चमक न हो।'
              : 'Ensure the optic disc and macula are in focus, the pupil is centered, and lighting is evenly distributed with zero corneal reflection haze.',
        },
        {
          id: 'oct-need',
          label: 'Is OCT Scan Mandatory?',
          text:
            language === 'hi'
              ? 'नहीं, ओसीटी वैकल्पिक है। ग्रामीण शिविरों में केवल फंडस फोटो से भी पूर्ण स्क्रीनिंग की जा सकती है।'
              : 'No, OCT depth scanning is optional. RetinaGuard is validated to run on non-mydriatic fundus cameras alone in community camps and field clinics.',
        },
        {
          id: 'step-guide',
          label: 'Current Step Instructions',
          text:
            activeScreeningStep
              ? t(`voiceStep${activeScreeningStep}`, `Step ${activeScreeningStep} in progress.`)
              : t('voiceStep1'),
        },
      ];
    }

    // Default Patient Prompts
    return [
      {
        id: 'why-screening',
        label: t('q2Title', 'Why screening matters'),
        text: t('q2Answer'),
      },
      {
        id: 'what-happens',
        label: t('q3Title', 'What happens during screening?'),
        text: t('q3Answer'),
      },
      {
        id: 'concerning-result',
        label: t('q4Title', 'What happens after a concerning result?'),
        text: t('q4Answer'),
      },
      {
        id: 'diagnosis-safety',
        label: 'Do I have diabetic retinopathy?',
        text: t('voiceSafetyNotice'),
      },
    ];
  }, [isResearcher, isHelper, language, activeScreeningStep, t]);

  const speakText = (text: string, title: string) => {
    voiceService.speak({
      text,
      title,
      lang: language,
      rate,
    });
  };

  const handleStop = () => {
    voiceService.stop();
  };

  const handlePauseResume = () => {
    if (playbackState.isPlaying) {
      voiceService.pause();
    } else if (playbackState.isPaused) {
      voiceService.resume();
    }
  };

  const handleRepeat = () => {
    if (lastSpokenText) {
      speakText(lastSpokenText, playbackState.currentTitle || 'RetinaGuard Assistant');
    } else if (quickPrompts.length > 0) {
      speakText(quickPrompts[0].text, quickPrompts[0].label);
    }
  };

  const handleSpeedChange = (newRate: number) => {
    setRate(newRate);
    voiceService.setRate(newRate);
  };

  return (
    <aside aria-label="RetinaGuard Voice Assistant" className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end print:hidden">
      {/* EXPANDED ASSISTANT CARD */}
      {isOpen && (
        <div
          id="retinaguard-voice-panel"
          className="mb-3 w-[92vw] max-w-sm sm:max-w-md bg-white rounded-2xl border border-[#EFE4DC] shadow-xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
        >
          {/* ASSISTANT HEADER */}
          <div className="bg-[#FFFDFB] border-b border-[#EFE4DC] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center text-[#EA580C]">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2E2628] leading-tight">
                  {t('voiceAssistantTitle', 'RetinaGuard Assistant')}
                </h3>
                <span className="text-[11px] font-medium text-[#EA580C] uppercase tracking-wider">
                  {language.toUpperCase()} • {playbackState.isPlaying ? 'Speaking' : 'Ready'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Guidance Toggle for Helper */}
              {onToggleVoiceGuidance && (
                <button
                  type="button"
                  id="toggle-voice-guidance-btn"
                  onClick={() => onToggleVoiceGuidance(!voiceGuidanceEnabled)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                    voiceGuidanceEnabled
                      ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]'
                      : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                  }`}
                  title={voiceGuidanceEnabled ? t('voiceGuidanceOn') : t('voiceGuidanceOff')}
                >
                  {voiceGuidanceEnabled ? 'Guidance ON' : 'Guidance OFF'}
                </button>
              )}

              <button
                type="button"
                id="close-voice-panel-btn"
                onClick={() => {
                  voiceService.stop();
                  setIsOpen(false);
                }}
                className="w-7 h-7 rounded-lg text-[#9E8D91] hover:text-[#2E2628] hover:bg-[#F9F5F1] flex items-center justify-center transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CAPTION & PLAYBACK DISPLAY */}
          <div className="p-4 space-y-3">
            {/* Live Audio Visualizer Banner */}
            <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#EFE4DC] min-h-[80px] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#9E8D91] mb-1">
                <span className="font-medium text-[#6E5C5F] flex items-center gap-1.5">
                  <Activity
                    className={`w-3.5 h-3.5 ${
                      playbackState.isPlaying ? 'text-[#EA580C] animate-pulse' : 'text-stone-400'
                    }`}
                  />
                  {playbackState.isPlaying
                    ? 'Narrating...'
                    : playbackState.isPaused
                    ? 'Paused'
                    : 'Transcript / Explanation'}
                </span>

                {/* Animated waves when playing */}
                {playbackState.isPlaying && (
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-1 bg-[#EA580C] rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 bg-[#EA580C] rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 bg-[#EA580C] rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                    <span className="w-1 bg-[#EA580C] rounded-full animate-bounce h-2.5" style={{ animationDelay: '75ms' }} />
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#2E2628] leading-relaxed line-clamp-4">
                {currentCaption ||
                  (isHelper
                    ? 'Screening helper audio instructions are ready. Tap any question below or start a screening to hear guidance.'
                    : 'Tap any reassuring question below or listen to eye health advice in your preferred language.')}
              </p>
            </div>

            {/* CONTROLS ROW */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                {/* Play / Pause */}
                <button
                  type="button"
                  id="voice-play-pause-btn"
                  onClick={handlePauseResume}
                  disabled={!playbackState.isPlaying && !playbackState.isPaused}
                  className="px-3 py-1.5 rounded-lg bg-[#2E2628] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-[#2E2628] transition-colors"
                >
                  {playbackState.isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>{t('voicePause', 'Pause')}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{playbackState.isPaused ? t('resumeVoice', 'Resume') : t('voicePlay', 'Play')}</span>
                    </>
                  )}
                </button>

                {/* Stop */}
                <button
                  type="button"
                  id="voice-stop-btn"
                  onClick={handleStop}
                  disabled={!playbackState.isPlaying && !playbackState.isPaused}
                  className="px-2.5 py-1.5 rounded-lg border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] text-xs font-medium flex items-center gap-1 disabled:opacity-40 transition-colors"
                  title={t('voiceStop', 'Stop')}
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{t('voiceStop', 'Stop')}</span>
                </button>

                {/* Repeat Instruction */}
                <button
                  type="button"
                  id="voice-repeat-btn"
                  onClick={handleRepeat}
                  className="px-2.5 py-1.5 rounded-lg border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#F9F5F1] text-xs font-medium flex items-center gap-1 transition-colors"
                  title={t('voiceRepeatInstruction', 'Repeat instruction')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('voiceRepeatInstruction', 'Repeat')}</span>
                </button>
              </div>

              {/* Speed rate selector */}
              <div className="flex items-center gap-1 text-[11px] text-[#6E5C5F]">
                <Sliders className="w-3 h-3 text-[#9E8D91]" />
                {([0.85, 1.0, 1.2] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSpeedChange(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      rate === s ? 'bg-[#EA580C] text-white font-bold' : 'hover:bg-stone-100 text-stone-600'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* QUICK TOPIC PROMPTS */}
            <div className="pt-2 border-t border-[#EFE4DC] space-y-1.5">
              <span className="text-[11px] font-semibold text-[#6E5C5F] flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#EA580C]" />
                {isHelper ? 'Screening SOP Questions' : isResearcher ? 'Research Inquiries' : 'Patient Frequently Asked'}
              </span>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {quickPrompts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => speakText(p.text, p.label)}
                    className="w-full text-left p-2 rounded-lg text-xs bg-[#FFFDFB] hover:bg-[#FFF7ED] border border-[#EFE4DC] hover:border-[#FED7AA] text-[#2E2628] transition-colors flex items-start justify-between gap-2"
                  >
                    <span className="font-medium line-clamp-1">{p.label}</span>
                    <Volume2 className="w-3.5 h-3.5 text-[#EA580C] flex-shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* SAFETY NOTICE FOOTER */}
            <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-[10px] text-stone-500 leading-tight">
              {t('voiceSafetyNotice')}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION TRIGGER BUTTON */}
      <button
        type="button"
        id="voice-assistant-floating-btn"
        onClick={() => {
          if (isOpen && playbackState.isPlaying) {
            voiceService.stop();
          }
          setIsOpen(!isOpen);
        }}
        className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg border transition-all duration-200 ${
          isOpen || playbackState.isPlaying
            ? 'bg-[#EA580C] text-white border-[#C2410C] ring-4 ring-[#EA580C]/20 shadow-orange-200'
            : 'bg-[#2E2628] text-white border-stone-700 hover:bg-stone-900 shadow-stone-300'
        }`}
        aria-expanded={isOpen}
        aria-controls="retinaguard-voice-panel"
        aria-label="Toggle RetinaGuard Voice Assistant"
      >
        <div className="relative">
          {playbackState.isPlaying ? (
            <Volume2 className="w-5 h-5 animate-pulse text-white" />
          ) : (
            <Mic className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-300" />
          )}

          {/* Active pulse dot */}
          {playbackState.isPlaying && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          )}
        </div>

        <span className="text-xs font-semibold tracking-wide hidden sm:inline whitespace-nowrap">
          {playbackState.isPlaying
            ? 'Assistant Speaking...'
            : isOpen
            ? 'Close Assistant'
            : t('voiceAssistantTitle', 'Voice Assistant')}
        </span>

        {/* Small badge showing language */}
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            isOpen || playbackState.isPlaying ? 'bg-white/20 text-white' : 'bg-white/10 text-stone-300'
          }`}
        >
          {language.toUpperCase()}
        </span>
      </button>
    </aside>
  );
};
