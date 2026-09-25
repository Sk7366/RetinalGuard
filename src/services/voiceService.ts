import { LanguageCode } from '../i18n/translations';
import { PHRASE_MAP } from '../i18n/comprehensiveTranslations';

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
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

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
    if (this.cachedVoices.length > 0) return this.cachedVoices;
    this.cachedVoices = window.speechSynthesis.getVoices();
    return this.cachedVoices;
  }

  private findBestVoice(lang: LanguageCode): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    const voices = this.getVoices();
    if (voices.length === 0) return null;

    const tags = LANGUAGE_VOICE_TAGS[lang] || ['en-IN', 'en-US'];

    // 1. Exact or prefix tag match
    for (const tag of tags) {
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase() === tag.toLowerCase() ||
          v.lang.toLowerCase().replace('_', '-').startsWith(tag.toLowerCase())
      );
      if (match) return match;
    }

    // 2. Language name match
    const langNames: Record<LanguageCode, string> = {
      en: 'english',
      hi: 'hindi',
      kn: 'kannada',
      ta: 'tamil',
      te: 'telugu',
      ml: 'malayalam',
    };
    const targetName = langNames[lang];
    if (targetName) {
      const nameMatch = voices.find((v) =>
        v.name.toLowerCase().includes(targetName)
      );
      if (nameMatch) return nameMatch;
    }

    // If English, voices[0] is acceptable
    if (lang === 'en') {
      return voices[0] || null;
    }

    // For non-English: do NOT return an English voice! Return null so utterance.lang tag is used directly.
    return null;
  }

  public translateForSpeech(text: string, lang: LanguageCode): string {
    if (lang === 'en' || !text.trim()) return text;

    const phrases = PHRASE_MAP[lang];
    if (!phrases) return text;

    const trimmed = text.trim();
    if (phrases[trimmed]) {
      return phrases[trimmed];
    }

    // Replace known sentences or clauses
    let result = text;
    for (const [enPhrase, localized] of Object.entries(phrases)) {
      if (enPhrase.length > 8 && result.includes(enPhrase)) {
        result = result.split(enPhrase).join(localized);
      }
    }
    return result;
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

    const rawText = params.text.trim();
    if (!rawText) return;

    // Automatically ensure the spoken text is in the requested language
    const textToSpeak = this.translateForSpeech(rawText, params.lang);

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

  public replay(): void {
    if (this.state.currentText) {
      this.speak({
        text: this.state.currentText,
        title: this.state.currentTitle,
        lang: this.state.currentLanguage,
        sectionId: this.state.speakingSectionId || undefined,
        rate: this.state.rate,
      });
    }
  }

  public getState(): VoicePlaybackState {
    return { ...this.state };
  }
}

export const voiceService = new VoiceService();
