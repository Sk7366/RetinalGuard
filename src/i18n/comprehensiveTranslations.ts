import { LanguageCode, TRANSLATIONS } from './translations';
import { MULTILINGUAL_LEXICON } from './domTranslator';
import { EXTENDED_LEXICON } from './extendedLexicon';

/**
 * Universal phrase map for speech synthesis and full-phrase translation,
 * built directly from the application's existing translation lexicons and dictionaries.
 */
function buildPhraseMap(): Record<LanguageCode, Record<string, string>> {
  const map: Record<LanguageCode, Record<string, string>> = {
    en: {},
    hi: {},
    kn: {},
    ta: {},
    te: {},
    ml: {},
  };

  const targetLangs: Array<Exclude<LanguageCode, 'en'>> = ['hi', 'kn', 'ta', 'te', 'ml'];

  // 1. Ingest key-value UI translations from TRANSLATIONS
  const enTranslations = TRANSLATIONS.en || {};
  for (const lang of targetLangs) {
    const langTranslations = TRANSLATIONS[lang] || {};
    for (const [key, enText] of Object.entries(enTranslations)) {
      if (typeof enText === 'string' && enText.trim()) {
        const localized = langTranslations[key];
        if (typeof localized === 'string' && localized.trim()) {
          map[lang][enText.trim()] = localized.trim();
        }
      }
    }
  }

  // 2. Ingest domain phrases from MULTILINGUAL_LEXICON
  for (const [enPhrase, transObj] of Object.entries(MULTILINGUAL_LEXICON)) {
    const trimmedPhrase = enPhrase.trim();
    if (!trimmedPhrase) continue;
    for (const lang of targetLangs) {
      if (transObj && transObj[lang]) {
        map[lang][trimmedPhrase] = transObj[lang];
      }
    }
  }

  // 3. Ingest medical and extended clinical terms from EXTENDED_LEXICON
  for (const [enPhrase, transObj] of Object.entries(EXTENDED_LEXICON)) {
    const trimmedPhrase = enPhrase.trim();
    if (!trimmedPhrase) continue;
    for (const lang of targetLangs) {
      if (transObj && transObj[lang]) {
        map[lang][trimmedPhrase] = transObj[lang];
      }
    }
  }

  return map;
}

export const PHRASE_MAP: Record<LanguageCode, Record<string, string>> = buildPhraseMap();
