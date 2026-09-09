import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Volume2, X, Gauge } from 'lucide-react';
import { voiceService, VoicePlaybackState } from '../services/voiceService';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

export const VoiceReaderBar: React.FC = () => {
  const [state, setState] = useState<VoicePlaybackState>(voiceService.getState());

  useEffect(() => {
    const unsubscribe = voiceService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  if (!state.isPlaying && !state.isPaused) {
    return null;
  }

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === state.currentLanguage);

  return (
    <div
      role="region"
      aria-label="Voice reading controls"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-stone-900/95 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-stone-800 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-stone-800 border border-stone-700/60 text-[#EA580C] flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 truncate">
                Voice Reader
              </span>
              <span className="text-[10px] bg-stone-800 border border-stone-700/60 px-1.5 py-0.5 rounded font-medium text-stone-300">
                {currentLangObj?.nativeLabel || state.currentLanguage}
              </span>
            </div>
            <h4 className="text-sm font-serif font-medium text-stone-100 truncate">
              {state.currentTitle}
            </h4>
          </div>
        </div>

        <button
          onClick={() => voiceService.stop()}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          aria-label="Close voice reader"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Snippet text */}
      <p className="text-xs text-stone-300/90 line-clamp-2 italic mb-3 bg-stone-950/60 border border-stone-800/80 p-2.5 rounded-xl">
        "{state.currentText}"
      </p>

      {/* Playback Controls */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-800">
        <div className="flex items-center gap-2">
          {state.isPlaying ? (
            <button
              onClick={() => voiceService.pause()}
              className="px-3 py-1.5 rounded-xl bg-white text-stone-900 hover:bg-stone-200 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              aria-label="Pause voice reading"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => voiceService.resume()}
              className="px-3 py-1.5 rounded-xl bg-[#EA580C] text-white hover:bg-[#C2410C] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              aria-label="Resume voice reading"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={() => voiceService.stop()}
            className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
            aria-label="Stop reading"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-stone-800 border border-stone-700/60 rounded-xl p-1 text-[11px]">
          <Gauge className="w-3 h-3 text-stone-400 ml-1 mr-0.5" />
          {[0.8, 1.0, 1.2].map((spd) => (
            <button
              key={spd}
              onClick={() => voiceService.setRate(spd)}
              className={`px-1.5 py-0.5 rounded-lg font-medium transition-all ${
                state.rate === spd ? 'bg-stone-950 text-white font-semibold shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
