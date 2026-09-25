import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageOption } from './translations';
import { applyDomTranslations, lookupTranslation } from './domTranslator';

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

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('retinaguard_lang', lang);
    } catch {
      // Ignore localStorage errors
    }

    // High-end feedback notification for language change
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
    const message =
      lang === 'en'
        ? `Language switched to English`
        : `Language switched to ${langObj.nativeLabel} (${langObj.label}) • Content localized`;
    setToastMessage(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const isVoiceSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const t = (key: string, fallback?: string): string => {
    // 1. Direct translation key in target language dictionary
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && key in langDict && langDict[key]) {
      return langDict[key];
    }

    // 2. Universal lexicon lookup for raw English text or keys
    if (language !== 'en') {
      const transByKey = lookupTranslation(key, language);
      if (transByKey) return transByKey;

      if (fallback) {
        const transByFallback = lookupTranslation(fallback, language);
        if (transByFallback) return transByFallback;
      }
    }

    // 3. Fallback to English dictionary
    if (TRANSLATIONS.en && key in TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }

    return fallback || key;
  };

  // Run DOM-aware live translation on mount and whenever language changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set document language and title attribute
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-current-lang', language);

    const titles: Record<LanguageCode, string> = {
      en: "RetinaGuard • Community Retinal Health & Early Screening",
      hi: "रेटिनागार्ड • सामुदायिक रेटिनल स्वास्थ्य और प्रारंभिक जांच",
      kn: "ರೆಟಿನಾಗಾರ್ಡ್ • ಸಮುದಾಯ ರೆಟಿನಾ ಆರೋಗ್ಯ ಮತ್ತು ಆರಂಭಿಕ ತಪಾಸಣೆ",
      ta: "ரெட்டினாகார்ட் • சமூக விழித்திரை நலம் மற்றும் ஆரம்ப பரிசோதனை",
      te: "రెటీనాగార్డ్ • కమ్యూనిటీ రెటీనా ఆరోగ్యం & ప్రారంభ స్క్రీనింగ్",
      ml: "റെറ്റിനാഗാർഡ് • കമ്മ്യൂണിറ്റി റെറ്റിനൽ ഹെൽത്ത് & ആദ്യകാല സ്ക്രീനിംഗ്",
    };
    if (titles[language]) {
      document.title = titles[language];
    }

    // Initial DOM translation sweep
    const runSweep = () => {
      applyDomTranslations(document.body, language);
    };

    runSweep();

    // Debounced mutation observer to translate dynamically injected nodes (e.g. modals, tabs)
    let debounceTimer: NodeJS.Timeout | null = null;
    const observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          shouldTranslate = true;
          break;
        }
      }
      if (shouldTranslate) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          runSweep();
        }, 60);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [language]);

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

      {/* High-End Floating Language Change Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 pointer-events-none transition-all duration-300 transform translate-y-0 opacity-100"
        >
          <div className="bg-[#1F181A] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2.5 backdrop-blur-md text-xs sm:text-sm font-medium">
            <span className="text-base">🌐</span>
            <span>{toastMessage}</span>
          </div>
        </aside>
      )}
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
