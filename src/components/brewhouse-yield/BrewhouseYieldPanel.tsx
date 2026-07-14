'use client';

import { useMemo, useState } from 'react';
import { computeBrewhouseYield, LauterSystem, StirringAllowance } from '@/lib/brewhouseYield';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

interface Segmented<T extends string> {
  id: T;
  labelKey: TranslationKey;
}

function SegmentedRow<T extends string>({
  label,
  options,
  value,
  onChange,
  t,
}: {
  label: string;
  options: Segmented<T>[];
  value: T;
  onChange: (v: T) => void;
  t: (k: TranslationKey) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm font-medium text-amber-900">{label}</span>
      <div className="flex flex-wrap gap-0.5 rounded-full border border-amber-200 bg-amber-50 p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`min-h-[32px] flex-1 rounded-full px-3 font-body text-xs font-semibold transition-colors ${
              value === o.id ? 'bg-teal-700 text-parchment' : 'text-amber-800 hover:bg-amber-100'
            }`}
          >
            {t(o.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

const LAUTER_OPTIONS: Segmented<LauterSystem>[] = [
  { id: 'lauterTun', labelKey: 'brewhouseYield.input.lauterTun' },
  { id: 'mashFilter', labelKey: 'brewhouseYield.input.mashFilter' },
];
const STIRRING_OPTIONS: Segmented<StirringAllowance>[] = [
  { id: 'modern', labelKey: 'brewhouseYield.input.stirringModern' },
  { id: 'older', labelKey: 'brewhouseYield.input.stirringOlder' },
];

export function BrewhouseYieldPanel() {
  const { t } = useLanguage();

  // Defaults reproduce the textbook 50 dt worked example (7.1-7.9).
  const [mgrDt, setMgrDt] = useState(50);
  const [eCmPercent, setECmPercent] = useState(77);
  const [eFwPercent, setEFwPercent] = useState(18);
  const [yFfmPercent, setYFfmPercent] = useState(77);
  const [eCPercent, setECPercent] = useState(12);
  const [rhoKgPerL, setRhoKgPerL] = useState(1.04646);
  const [boilHours, setBoilHours] = useState(1.5);
  const [lauter, setLauter] = useState<LauterSystem>('lauterTun');
  const [stirring, setStirring] = useState<StirringAllowance>('modern');

  const r = useMemo(
    () =>
      computeBrewhouseYield({ mgrDt, eCmPercent, eFwPercent, yFfmPercent, lauter, stirring, eCPercent, rhoKgPerL, boilHours }),
    [mgrDt, eCmPercent, eFwPercent, yFfmPercent, lauter, stirring, eCPercent, rhoKgPerL, boilHours],
  );

  const eFwInvalid = eFwPercent <= 0 || eFwPercent >= eCmPercent;
  const hl = (v: number) => `${roundForDisplay(v, 1)}`;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-bold text-ink">{t('brewhouseYield.heading')}</h2>

      <TutorialCallout
        title={t('brewhouseYield.tutorial.title')}
        steps={[
          { lead: t('brewhouseYield.tutorial.step1.lead'), body: t('brewhouseYield.tutorial.step1.body') },
          { lead: t('brewhouseYield.tutorial.step2.lead'), body: t('brewhouseYield.tutorial.step2.body') },
          { lead: t('brewhouseYield.tutorial.step3.lead'), body: t('brewhouseYield.tutorial.step3.body') },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label={t('brewhouseYield.input.mgr')} unit="dt" value={mgrDt} step={1} onChange={setMgrDt} />
        <NumberField label={t('brewhouseYield.input.eCm')} unit="%" value={eCmPercent} step={0.5} onChange={setECmPercent} />
        <NumberField label={t('brewhouseYield.input.eFw')} unit="%" value={eFwPercent} step={0.5} onChange={setEFwPercent} />
        <NumberField label={t('brewhouseYield.input.yFfm')} unit="%" value={yFfmPercent} step={0.5} onChange={setYFfmPercent} />
        <NumberField label={t('brewhouseYield.input.eC')} unit="%" value={eCPercent} step={0.5} onChange={setECPercent} />
        <NumberField label={t('brewhouseYield.input.rho')} unit="kg/L" value={rhoKgPerL} step={0.001} onChange={setRhoKgPerL} />
        <NumberField label={t('brewhouseYield.input.boilHours')} unit="h" value={boilHours} step={0.25} onChange={setBoilHours} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SegmentedRow label={t('brewhouseYield.input.lauter')} options={LAUTER_OPTIONS} value={lauter} onChange={setLauter} t={t} />
        <SegmentedRow label={t('brewhouseYield.input.stirring')} options={STIRRING_OPTIONS} value={stirring} onChange={setStirring} t={t} />
      </div>

      {eFwInvalid ? (
        <ResultCard title={t('brewhouseYield.heading')} tone="warning">
          {t('brewhouseYield.warning.eFw')}
        </ResultCard>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
              {t('brewhouseYield.section.strikeMash')}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ResultCard title={t('brewhouseYield.result.specificStrike')} value={hl(r.specificStrikeHlPerDt)} unit="hL/dt" />
              <ResultCard title={t('brewhouseYield.result.wSv')} value={hl(r.wSvHl)} unit="hL" />
              <ResultCard title={t('brewhouseYield.result.vMa')} value={hl(r.vMaHl)} unit="hL" />
              <ResultCard title={t('brewhouseYield.result.vCv')} value={hl(r.vCvHl)} unit="hL" tone="success" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
              {t('brewhouseYield.section.spargeWort')}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ResultCard title={t('brewhouseYield.result.spargeRatio')} value={`1 : ${roundForDisplay(r.spargeRatio, 2)}`} />
              <ResultCard title={t('brewhouseYield.result.wSpv')} value={hl(r.wSpvHl)} unit="hL" />
              <ResultCard title={t('brewhouseYield.result.wSg')} value={hl(r.wSgHl)} unit="hL" />
              <ResultCard title={t('brewhouseYield.result.vFw')} value={hl(r.vFwHl)} unit="hL" />
              <ResultCard title={t('brewhouseYield.result.vKf')} value={hl(r.vKfHl)} unit="hL" tone="success" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
              {t('brewhouseYield.section.yieldEvap')}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ResultCard title={t('brewhouseYield.result.expectedYBh')} value={`${roundForDisplay(r.expectedYBhPercent, 1)}`} unit="%" tone="success" />
              <ResultCard title={t('brewhouseYield.result.vHkw')} value={hl(r.vHkwHl)} unit="hL" />
              <ResultCard title={t('brewhouseYield.result.evapAbs')} value={hl(r.evaporation.absoluteHl)} unit="hL" />
              <ResultCard title={t('brewhouseYield.result.evapPercent')} value={`${roundForDisplay(r.evaporation.percent, 1)}`} unit="%" />
              <ResultCard title={t('brewhouseYield.result.evapPerHour')} value={`${roundForDisplay(r.evaporation.perHourPercent, 1)}`} unit="%/h" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
              {t('brewhouseYield.section.spentGrain')}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ResultCard title={t('brewhouseYield.result.spentDry')} value={`${roundForDisplay(r.spentGrain.dryDt, 1)}`} unit="dt" />
              <ResultCard title={t('brewhouseYield.result.spentWet')} value={`${roundForDisplay(r.spentGrain.wetDt, 1)}`} unit="dt" />
              <ResultCard title={t('brewhouseYield.result.wt')} value={hl(r.wtHl)} unit="hL" tone="success" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
