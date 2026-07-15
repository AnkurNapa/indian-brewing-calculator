'use client';

import { useState } from 'react';
import { calculateSpentGrain, DEFAULT_SPENT_GRAIN } from '@/lib/spentGrain';
import { StatHero } from '@/components/ui/StatHero';
import { StatTile } from '@/components/ui/StatTile';
import { SectionCard } from '@/components/ui/SectionCard';
import { KettleIcon } from '@/components/ui/icons';
import { useLanguage } from '@/i18n/LanguageContext';

const INPUT =
  'w-full rounded-lg border border-amber-200 bg-white px-3 py-2 font-body text-sm text-ink focus:border-[#e08b2d] focus:outline-none focus:ring-1 focus:ring-[#e08b2d]/40';
const LABEL = 'mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-amber-700/80';

export function SpentGrainPanel({ grainBillKg }: { grainBillKg: number }) {
  const { t } = useLanguage();
  const [grain, setGrain] = useState<string>(grainBillKg > 0 ? String(+grainBillKg.toFixed(2)) : '5');
  const [extract, setExtract] = useState<string>(String(DEFAULT_SPENT_GRAIN.extractYieldPercent));
  const [moisture, setMoisture] = useState<string>(String(DEFAULT_SPENT_GRAIN.moisturePercent));

  const result = calculateSpentGrain({
    grainKg: parseFloat(grain) || 0,
    extractYieldPercent: parseFloat(extract) || DEFAULT_SPENT_GRAIN.extractYieldPercent,
    moisturePercent: parseFloat(moisture) || DEFAULT_SPENT_GRAIN.moisturePercent,
    wetDensityKgL: DEFAULT_SPENT_GRAIN.wetDensityKgL,
  });

  const usedBill = grainBillKg > 0 && String(+grainBillKg.toFixed(2)) === grain;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">{t('spentGrain.title')}</h2>
        <p className="font-body text-sm text-amber-800">{t('spentGrain.subtitle')}</p>
      </div>

      <StatHero title={t('spentGrain.title')} accentColor="#a35f1c">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatTile label={t('spentGrain.wetWeight')} value={String(result.wetKg)} unit="kg" tone="good" />
          <StatTile label={t('spentGrain.volume')} value={String(result.volumeL)} unit="L" />
          <StatTile label={t('spentGrain.drySolids')} value={String(result.dryKg)} unit="kg" />
          <StatTile label={t('spentGrain.water')} value={String(result.waterKg)} unit="kg" />
        </div>
      </StatHero>

      <SectionCard title={t('spentGrain.inputs')} icon={KettleIcon}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL} htmlFor="sg-grain">
              {t('spentGrain.grainWeight')}
            </label>
            <div className="relative">
              <input id="sg-grain" type="number" inputMode="decimal" className={INPUT} value={grain} onChange={(e) => setGrain(e.target.value)} />
              <span className="pointer-events-none absolute right-3 top-2.5 font-body text-xs font-semibold text-ink/40">kg</span>
            </div>
            {usedBill ? <p className="mt-1 font-body text-[0.65rem] text-teal-700">{t('spentGrain.fromGrainBill')}</p> : null}
          </div>
          <div>
            <label className={LABEL} htmlFor="sg-extract">
              {t('spentGrain.extractYield')}
            </label>
            <div className="relative">
              <input id="sg-extract" type="number" inputMode="decimal" className={INPUT} value={extract} onChange={(e) => setExtract(e.target.value)} />
              <span className="pointer-events-none absolute right-3 top-2.5 font-body text-xs font-semibold text-ink/40">%</span>
            </div>
          </div>
          <div>
            <label className={LABEL} htmlFor="sg-moisture">
              {t('spentGrain.moisture')}
            </label>
            <div className="relative">
              <input id="sg-moisture" type="number" inputMode="decimal" className={INPUT} value={moisture} onChange={(e) => setMoisture(e.target.value)} />
              <span className="pointer-events-none absolute right-3 top-2.5 font-body text-xs font-semibold text-ink/40">%</span>
            </div>
          </div>
        </div>
        <p className="mt-3 font-body text-xs text-ink/60">{t('spentGrain.uses')}</p>
      </SectionCard>
    </section>
  );
}
