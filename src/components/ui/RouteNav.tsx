'use client';

import Link from 'next/link';
import { ComponentType } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { CalculatorIcon, GridIcon, ChartBarIcon, FlaskIcon, JugIcon } from '@/components/ui/icons';

type RouteKey = 'app' | 'start' | 'welcome' | 'analytics' | 'faults' | 'ingredients';

/**
 * The shared top wayfinding bar for the standalone routes (/start, /welcome,
 * /analytics) so they read as one product rather than orphan pages. The
 * current route is highlighted; everything else links across. Kept slim so
 * each page still owns its own hero/CTAs below it.
 */
export function RouteNav({ current }: { current: RouteKey }) {
  const { t } = useLanguage();

  const items: { key: RouteKey; href: string; label: string; icon?: ComponentType<{ className?: string }> }[] = [
    { key: 'app', href: '/', label: t('welcome.openApp'), icon: CalculatorIcon },
    { key: 'start', href: '/start', label: t('app.startBrew') },
    { key: 'welcome', href: '/welcome', label: t('app.guide'), icon: GridIcon },
    { key: 'analytics', href: '/analytics', label: t('app.analytics'), icon: ChartBarIcon },
    { key: 'faults', href: '/faults', label: t('app.faults'), icon: FlaskIcon },
    { key: 'ingredients', href: '/ingredients', label: t('app.ingredients'), icon: JugIcon },
  ];

  return (
    <nav aria-label="Sections" className="mb-6 flex flex-wrap items-center gap-1.5">
      {items.map(({ key, href, label, icon: Icon }) => {
        const active = key === current;
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'inline-flex items-center gap-1.5 rounded-full bg-[#e08b2d] px-3 py-1.5 font-body text-xs font-bold text-parchment shadow-sm'
                : 'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/70 px-3 py-1.5 font-body text-xs font-semibold text-amber-900 transition-colors hover:border-[#e08b2d]/60 hover:text-[#e08b2d]'
            }
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
