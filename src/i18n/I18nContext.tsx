import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageOption } from './translations';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: LanguageOption[];
  isVoiceSupported: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode; initialLanguage?: LanguageCode }> = ({
  children,
  initialLanguage = 'en',
}) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('retinaguard_lang');
    if (saved && ['en', 'hi', 'kn', 'ta', 'te', 'ml'].includes(saved)) {
      return saved as LanguageCode;
    }
    return initialLanguage;
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('retinaguard_lang', lang);
    } catch {
      // Ignore localStorage errors
    }
  };

  const isVoiceSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && key in langDict) {
      return langDict[key];
    }
    // Fallback to English
    if (TRANSLATIONS.en && key in TRANSLATIONS.en) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isVoiceSupported,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    // Return graceful default if used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string, fallback?: string) => {
        if (TRANSLATIONS.en && key in TRANSLATIONS.en) {
          return TRANSLATIONS.en[key];
        }
        return fallback || key;
      },
      supportedLanguages: SUPPORTED_LANGUAGES,
      isVoiceSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    };
  }
  return context;
};
