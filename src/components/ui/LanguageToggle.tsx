'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { LANGUAGE_NAMES, LANGUAGE_ORDER, Language } from '@/i18n/translations';

/**
 * A native <select> rather than custom dropdown markup: with four
 * languages (and room to add more), a select gives free keyboard/a11y
 * support and native mobile picker UI without extra listbox plumbing.
 */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className={`flex h-8 items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 shadow-sm ${className}`}>
      <span className="sr-only">{t('app.language.label')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label={t('app.language.label')}
        className="h-full cursor-pointer appearance-none bg-transparent font-body text-xs font-semibold text-teal-700 focus:outline-none"
      >
        {LANGUAGE_ORDER.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_NAMES[lang]}
          </option>
        ))}
      </select>
    </label>
  );
}
