import { LanguageCode } from '../i18n/translations';

// BCP 47 voice tag mappings for the 6 languages
export const LANGUAGE_VOICE_TAGS: Record<LanguageCode, string[]> = {
  en: ['en-IN', 'en-US', 'en-GB'],
  hi: ['hi-IN', 'hi'],
  kn: ['kn-IN', 'kn'],
  ta: ['ta-IN', 'ta'],
  te: ['te-IN', 'te'],
  ml: ['ml-IN', 'ml'],
};

export interface VoicePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  currentTitle: string;
  currentLanguage: LanguageCode;
  speakingSectionId: string | null;
  rate: number;
}

type Listener = (state: VoicePlaybackState) => void;

class VoiceService {
  private state: VoicePlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentText: '',
    currentTitle: '',
    currentLanguage: 'en',
    speakingSectionId: null,
    rate: 1.0,
  };

  private listeners: Set<Listener> = new Set();
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  private findBestVoice(lang: LanguageCode): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    const voices = this.getVoices();
    const tags = LANGUAGE_VOICE_TAGS[lang] || ['en-IN', 'en-US'];

    for (const tag of tags) {
      const match = voices.find(
        (v) => v.lang.toLowerCase() === tag.toLowerCase() || v.lang.toLowerCase().startsWith(tag.toLowerCase())
      );
      if (match) return match;
    }

    // Fallback: search for voice name containing language
    const langNames: Record<LanguageCode, string> = {
      en: 'english',
      hi: 'hindi',
      kn: 'kannada',
      ta: 'tamil',
      te: 'telugu',
      ml: 'malayalam',
    };
    const nameMatch = voices.find((v) =>
      v.name.toLowerCase().includes(langNames[lang] || 'english')
    );
    if (nameMatch) return nameMatch;

    return voices[0] || null;
  }

  public speak(params: {
    text: string;
    title: string;
    lang: LanguageCode;
    sectionId?: string;
    rate?: number;
    onComplete?: () => void;
  }): void {
    if (!this.isSupported()) {
      console.warn('Speech synthesis not supported in this environment');
      return;
    }

    this.stop();

    const textToSpeak = params.text.trim();
    if (!textToSpeak) return;

    const rate = params.rate || this.state.rate || 1.0;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voice = this.findBestVoice(params.lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      const tags = LANGUAGE_VOICE_TAGS[params.lang] || ['en-US'];
      utterance.lang = tags[0];
    }

    this.currentUtterance = utterance;

    this.state = {
      isPlaying: true,
      isPaused: false,
      currentText: textToSpeak,
      currentTitle: params.title || 'Screening Information',
      currentLanguage: params.lang,
      speakingSectionId: params.sectionId || null,
      rate,
    };
    this.notify();

    utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.speakingSectionId = null;
      this.currentUtterance = null;
      this.notify();
      if (params.onComplete) params.onComplete();
    };

    utterance.onerror = (e) => {
      // Don't log canceled speech as an error
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech error:', e.error);
      }
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.speakingSectionId = null;
      this.currentUtterance = null;
      this.notify();
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause(): void {
    if (this.isSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.state.isPaused = true;
      this.state.isPlaying = false;
      this.notify();
    }
  }

  public resume(): void {
    if (this.isSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.state.isPaused = false;
      this.state.isPlaying = true;
      this.notify();
    }
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.speakingSectionId = null;
    this.currentUtterance = null;
    this.notify();
  }

  public setRate(newRate: number): void {
    this.state.rate = newRate;
    this.notify();
    if (this.state.isPlaying && this.currentUtterance) {
      // Replay with new rate
      this.speak({
        text: this.state.currentText,
        title: this.state.currentTitle,
        lang: this.state.currentLanguage,
        sectionId: this.state.speakingSectionId || undefined,
        rate: newRate,
      });
    }
  }

  public getState(): VoicePlaybackState {
    return { ...this.state };
  }
}

export const voiceService = new VoiceService();
