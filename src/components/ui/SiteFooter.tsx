'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

/**
 * One footer for every screen (SPA + standalone routes), mounted in the root
 * layout so the header/footer chrome stays consistent app-wide. Carries the
 * full-feature navigation plus the build credit and privacy note.
 */
export function SiteFooter() {
  const { t } = useLanguage();

  const links = [
    { href: '/', label: t('welcome.openApp') },
    { href: '/start', label: t('app.startBrew') },
    { href: '/welcome', label: t('app.guide') },
    { href: '/analytics', label: t('app.analytics') },
    { href: '/faults', label: t('app.faults') },
    { href: '/ingredients', label: t('app.ingredients') },
  ];

  return (
    <footer className="mt-12 border-t-2 border-amber-200 bg-amber-50/40">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-7 text-center">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-xs font-semibold text-amber-800 transition-colors hover:text-[#e08b2d]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-1 font-body text-xs text-amber-700/70">
          <p>{t('app.footer.units')}</p>
          <p>
            {t('app.footer.builtBy')} &middot;{' '}
            <a
              href="https://www.linkedin.com/in/ankur-napa"
              className="underline hover:text-amber-900"
              rel="noopener noreferrer"
              target="_blank"
            >
              Ankur Napa
            </a>{' '}
            &middot;{' '}
            <a href="mailto:napaankur@gmail.com" className="underline hover:text-amber-900">
              napaankur@gmail.com
            </a>
          </p>
          <p className="max-w-md text-amber-700/60">{t('app.footer.privacy')}</p>
        </div>
      </div>
    </footer>
  );
}
