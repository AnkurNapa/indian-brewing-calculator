export type Language = 'en' | 'de' | 'hi' | 'mr';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  hi: 'हिंदी',
  mr: 'मराठी',
};

export const LANGUAGE_ORDER: Language[] = ['en', 'de', 'hi', 'mr'];

/** Every translation fragment file exports a dict shaped like this. */
export type TranslationDict = Record<string, Record<Language, string>>;
