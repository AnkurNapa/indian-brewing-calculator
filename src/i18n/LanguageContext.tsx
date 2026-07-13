'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Language, LANGUAGE_ORDER, TranslationKey, translations } from './translations';

const STORAGE_KEY = 'ibc-language';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Looks up `key` and substitutes any `{token}` placeholders from `vars`. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (result, [token, value]) => result.replaceAll(`{${token}}`, String(value)),
    template,
  );
}

function isLanguage(value: string | null): value is Language {
  return value !== null && (LANGUAGE_ORDER as string[]).includes(value);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English on first paint (matches server-rendered markup);
  // swap to a stored preference right after mount to avoid a hydration
  // mismatch between server and client HTML.
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback<LanguageContextValue['t']>(
    (key, vars) => {
      const entry = translations[key];
      if (!entry) {
        // Missing key: fail loud in dev-visible console rather than silently
        // rendering "undefined" in the UI.
        console.warn(`[i18n] missing translation key: ${key}`);
        return key;
      }
      return interpolate(entry[language], vars);
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
