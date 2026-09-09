export type LanguageCode = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  localeTag: string;
}
