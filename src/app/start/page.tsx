'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { RouteNav } from '@/components/ui/RouteNav';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { seedAppState } from '@/hooks/useWaterProfile';
import { SectionCard } from '@/components/ui/SectionCard';
import { StyleCheckIcon } from '@/components/ui/icons';

const INPUT =
  'w-full rounded-lg border border-amber-200 bg-white px-3 py-2 font-body text-sm text-ink focus:border-[#e08b2d] focus:outline-none focus:ring-1 focus:ring-[#e08b2d]/40';
const LABEL = 'mb-1 block font-body text-xs font-semibold uppercase tracking-wide text-amber-700/80';

/** Small "in style / out of style" chip vs a BJCP min-max range. */
function RangeBadge({ value, min, max, inLabel, outLabel }: { value: number; min: number; max: number; inLabel: string; outLabel: string }) {
  if (!value) return null;
  const ok = value >= min && value <= max;
  return (
    <span
      className={`ml-2 rounded-full px-2 py-0.5 font-body text-[0.65rem] font-semibold ${
        ok ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' : 'bg-[#e08b2d]/10 text-[#c2410c] ring-1 ring-[#e08b2d]/30'
      }`}
    >
      {ok ? inLabel : `${outLabel} (${min}-${max})`}
    </span>
  );
}

export default function StartPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [recipeName, setRecipeName] = useState('');
  const [bjcpStyleId, setBjcpStyleId] = useState(BJCP_STYLES[0].id);
  const [batch, setBatch] = useState('20');
  const [finalVol, setFinalVol] = useState('19');
  const [abv, setAbv] = useState('');
  const [ibu, setIbu] = useState('');
  const [co2, setCo2] = useState('');

  const style = BJCP_STYLES.find((s) => s.id === bjcpStyleId) ?? BJCP_STYLES[0];
  const numAbv = parseFloat(abv) || 0;
  const numIbu = parseFloat(ibu) || 0;

  const handleSave = () => {
    seedAppState({
      bjcpStyleId,
      batchVolumeL: parseFloat(batch) || 20,
      targetFinalVolumeL: parseFloat(finalVol) || 0,
      targetAbvPercent: numAbv,
      targetIbu: numIbu,
      targetCo2Volumes: parseFloat(co2) || 0,
    });
    router.push('/');
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <RouteNav current="start" />
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-900 sm:text-4xl">
          {t('start.title')}
        </h1>
        <p className="mt-1 max-w-prose font-body text-sm text-ink/70">{t('start.subtitle')}</p>
      </div>

      <div className="space-y-5">
        {/* Recipe name */}
        <div>
          <label className={LABEL} htmlFor="recipe-name">
            {t('start.recipeName')} <span className="font-normal text-ink/40">({t('start.optional')})</span>
          </label>
          <input
            id="recipe-name"
            type="text"
            className={INPUT}
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder={t('start.recipeNamePlaceholder')}
          />
        </div>

        {/* BJCP style */}
        <div>
          <label className={LABEL} htmlFor="bjcp-style">
            {t('start.style')}
          </label>
          <select id="bjcp-style" className={INPUT} value={bjcpStyleId} onChange={(e) => setBjcpStyleId(e.target.value)}>
            {BJCP_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* BJCP guidelines for the chosen style */}
        <SectionCard title={t('start.guidelines')} icon={StyleCheckIcon} tone="teal">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-body text-sm text-ink sm:grid-cols-3">
            <div>OG <b>{style.og.min}-{style.og.max}</b></div>
            <div>FG <b>{style.fg.min}-{style.fg.max}</b></div>
            <div>ABV <b>{style.abvPercent.min}-{style.abvPercent.max}%</b></div>
            <div>IBU <b>{style.ibu.min}-{style.ibu.max}</b></div>
            <div>SRM <b>{style.srm.min}-{style.srm.max}</b></div>
          </div>
        </SectionCard>

        {/* Volumes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL} htmlFor="batch">
              {t('start.batchVolume')}
            </label>
            <div className="relative">
              <input id="batch" type="number" inputMode="decimal" className={INPUT} value={batch} onChange={(e) => setBatch(e.target.value)} />
              <span className="pointer-events-none absolute right-3 top-2.5 font-body text-xs font-semibold text-ink/40">L</span>
            </div>
          </div>
          <div>
            <label className={LABEL} htmlFor="final">
              {t('start.finalVolume')}
            </label>
            <div className="relative">
              <input id="final" type="number" inputMode="decimal" className={INPUT} value={finalVol} onChange={(e) => setFinalVol(e.target.value)} />
              <span className="pointer-events-none absolute right-3 top-2.5 font-body text-xs font-semibold text-ink/40">L</span>
            </div>
          </div>
        </div>

        {/* Targets with BJCP in-style feedback */}
        <div>
          <label className={LABEL} htmlFor="abv">
            {t('start.targetAbv')}
            <RangeBadge value={numAbv} min={style.abvPercent.min} max={style.abvPercent.max} inLabel={t('start.inStyle')} outLabel={t('start.outOfStyle')} />
          </label>
          <div className="relative">
            <input id="abv" type="number" inputMode="decimal" className={INPUT} value={abv} onChange={(e) => setAbv(e.target.value)} placeholder={`${style.abvPercent.min} - ${style.abvPercent.max}`} />
            <span className="pointer-events-none absolute right-3 top-2.5 font-body text-xs font-semibold text-ink/40">%</span>
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="ibu">
            {t('start.targetIbu')}
            <RangeBadge value={numIbu} min={style.ibu.min} max={style.ibu.max} inLabel={t('start.inStyle')} outLabel={t('start.outOfStyle')} />
          </label>
          <input id="ibu" type="number" inputMode="decimal" className={INPUT} value={ibu} onChange={(e) => setIbu(e.target.value)} placeholder={`${style.ibu.min} - ${style.ibu.max}`} />
        </div>

        <div>
          <label className={LABEL} htmlFor="co2">
            {t('start.targetCo2')} <span className="font-normal text-ink/40">({t('start.co2Unit')})</span>
          </label>
          <input id="co2" type="number" inputMode="decimal" className={INPUT} value={co2} onChange={(e) => setCo2(e.target.value)} placeholder="2.4" />
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e08b2d] px-5 py-2.5 font-body text-sm font-bold text-parchment shadow-sm transition-colors hover:bg-[#c67722]"
          >
            {t('start.save')}
          </button>
        </div>
      </div>
    </main>
  );
}
