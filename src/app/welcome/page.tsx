'use client';

import { ComponentType } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { RouteNav } from '@/components/ui/RouteNav';
import { TAB_GROUP_ORDER, TAB_GROUP_BY_ID, TAB_GROUP_LABEL_KEY, type TabId } from '@/lib/navigation';
import {
  DropletIcon,
  FlaskIcon,
  FunnelIcon,
  JugIcon,
  PipeFlowIcon,
  CalculatorIcon,
  KettleIcon,
  FermenterIcon,
  StyleCheckIcon,
  BlendIcon,
  MixingCrossIcon,
  BookmarkIcon,
  CloudSyncIcon,
  InfoIcon,
} from '@/components/ui/icons';

type IconType = ComponentType<{ className?: string }>;

// Module catalogue: id -> its i18n label key + icon. Mirrors the TABS list
// in app/page.tsx (kept in sync manually; the grouping comes from navigation.ts,
// the single source of truth for which cluster each tool belongs to).
const MODULE_META: Record<Exclude<TabId, 'home'>, { labelKey: string; icon: IconType }> = {
  'water-report': { labelKey: 'tab.waterReport.label', icon: DropletIcon },
  'mash-adjustment': { labelKey: 'tab.mashAdjustment.label', icon: FlaskIcon },
  'sparge-adjustment': { labelKey: 'tab.spargeAdjustment.label', icon: FunnelIcon },
  'water-volumes': { labelKey: 'tab.waterVolumes.label', icon: JugIcon },
  'transfer-lautering': { labelKey: 'tab.transferLautering.label', icon: PipeFlowIcon },
  blending: { labelKey: 'tab.blending.label', icon: BlendIcon },
  'mixing-cross': { labelKey: 'tab.mixingCross.label', icon: MixingCrossIcon },
  brewhouse: { labelKey: 'tab.brewhouse.label', icon: CalculatorIcon },
  'brewhouse-yield': { labelKey: 'tab.brewhouseYield.label', icon: KettleIcon },
  'fermentation-tracker': { labelKey: 'tab.fermentationTracker.label', icon: FermenterIcon },
  'style-check': { labelKey: 'tab.styleCheck.label', icon: StyleCheckIcon },
  recipes: { labelKey: 'tab.recipes.label', icon: BookmarkIcon },
  backup: { labelKey: 'tab.backup.label', icon: CloudSyncIcon },
  about: { labelKey: 'tab.about.label', icon: InfoIcon },
};

export default function WelcomePage() {
  const { t } = useLanguage();
  // Module/group label keys are dynamic strings; cast to the t() key type.
  type TKey = Parameters<typeof t>[0];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <RouteNav current="welcome" />
      {/* header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-900 sm:text-4xl">
          {t('welcome.title')}
        </h1>
        <p className="mt-1 max-w-prose font-body text-sm text-ink/70">{t('welcome.subtitle')}</p>
        <div className="mt-4">
          <Link
            href="/start"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e08b2d] px-4 py-2 font-body text-sm font-bold text-parchment shadow-sm transition-colors hover:bg-[#c67722]"
          >
            {t('app.startBrew')}
          </Link>
        </div>
      </div>

      {/* module groups */}
      <div className="space-y-7">
        {TAB_GROUP_ORDER.map((group) => {
          const ids = (Object.keys(MODULE_META) as Exclude<TabId, 'home'>[]).filter(
            (id) => TAB_GROUP_BY_ID[id] === group,
          );
          if (!ids.length) return null;
          return (
            <section key={group} aria-labelledby={`grp-${group}`}>
              <h2
                id={`grp-${group}`}
                className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-amber-700/80"
              >
                {t(TAB_GROUP_LABEL_KEY[group] as TKey)}
              </h2>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {ids.map((id) => {
                  const { labelKey, icon: Icon } = MODULE_META[id];
                  return (
                    <Link
                      key={id}
                      href={`/#${id}`}
                      className="group flex items-center gap-3 rounded-xl border border-amber-100 bg-white px-3 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#e08b2d]/50 hover:shadow-md"
                    >
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100 transition-colors group-hover:bg-[#e08b2d]/10 group-hover:text-[#e08b2d]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-body text-sm font-semibold leading-tight text-ink">
                        {t(labelKey as TKey)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
