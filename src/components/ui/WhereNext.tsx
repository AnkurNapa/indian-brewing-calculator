'use client';

import { TabDef } from '@/components/ui/Tabs';
import { getNextSteps } from '@/lib/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

interface WhereNextProps {
  /** The tab currently being viewed. */
  currentTab: string;
  /** Every tab, keyed by id, so we can resolve each suggestion's label + icon. */
  tabsById: Map<string, TabDef>;
  onNavigate: (tabId: string) => void;
}

/**
 * Contextual navigation footer. Instead of a single linear "next tab"
 * button, this reads the data-dependency graph (see lib/navigation.ts) and
 * surfaces the pages the current page's output actually feeds into -- each
 * with a one-line reason for *why* it's the next place to look. The first
 * suggestion is emphasised as the primary path; any others are quieter
 * alternatives, so there's always an obvious "forward" without hiding the
 * useful side-routes.
 */
export function WhereNext({ currentTab, tabsById, onNavigate }: WhereNextProps) {
  const { t } = useLanguage();

  const steps = getNextSteps(currentTab)
    .map((step) => ({ tab: tabsById.get(step.id), reasonKey: step.reasonKey }))
    .filter((step): step is { tab: TabDef; reasonKey: string } => step.tab !== undefined);

  if (steps.length === 0) return null;

  const go = (tabId: string) => {
    onNavigate(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="mt-6 border-t border-amber-200 pt-4" aria-label={t('nav.whereNext')}>
      <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-amber-700">
        {t('nav.whereNext')}
      </p>
      <div className="flex flex-col gap-2">
        {steps.map(({ tab, reasonKey }, i) => {
          const Icon = tab.icon;
          const isPrimary = i === 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => go(tab.id)}
              className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left font-body shadow-sm transition-colors ${
                isPrimary
                  ? 'bg-teal-700 text-parchment hover:bg-teal-800 active:bg-teal-900'
                  : 'border border-teal-300 bg-teal-50 text-teal-900 hover:bg-teal-100'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className={`h-5 w-5 flex-shrink-0 ${isPrimary ? 'text-parchment' : 'text-teal-700'}`} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">{tab.label}</span>
                  <span className={`truncate text-xs ${isPrimary ? 'text-parchment/75' : 'text-teal-700/80'}`}>
                    {t(reasonKey as TranslationKey)}
                  </span>
                </span>
              </span>
              <span aria-hidden="true" className="flex-shrink-0 text-lg">
                →
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
