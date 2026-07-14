'use client';

import { useMemo, useState } from 'react';
import {
  MIXING_PARAMETERS,
  MixingParameterId,
  solveMixingCross,
  quantitiesFromTotal,
  quantitiesFromComponent,
} from '@/lib/mixingCross';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

type ScaleMode = 'total' | 'componentA' | 'componentB';

const PARAM_LABEL_KEY: Record<MixingParameterId, TranslationKey> = {
  gravityPlato: 'mixingCross.parameter.gravityPlato',
  abv: 'mixingCross.parameter.abv',
  temperature: 'mixingCross.parameter.temperature',
  custom: 'mixingCross.parameter.custom',
};

const SCALE_MODES: { id: ScaleMode; labelKey: TranslationKey }[] = [
  { id: 'total', labelKey: 'mixingCross.scaleMode.total' },
  { id: 'componentA', labelKey: 'mixingCross.scaleMode.componentA' },
  { id: 'componentB', labelKey: 'mixingCross.scaleMode.componentB' },
];

export function MixingCrossPanel() {
  const { t } = useLanguage();

  const [paramId, setParamId] = useState<MixingParameterId>('gravityPlato');
  const preset = MIXING_PARAMETERS.find((p) => p.id === paramId) ?? MIXING_PARAMETERS[0];

  const [paramA, setParamA] = useState(preset.defaults.paramA);
  const [paramB, setParamB] = useState(preset.defaults.paramB);
  const [target, setTarget] = useState(preset.defaults.target);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('total');
  const [totalAmount, setTotalAmount] = useState(100);
  const [knownAmount, setKnownAmount] = useState(preset.defaults.knownAmount);

  // Switching the parameter context resets the three values to that
  // context's recognisable defaults (a 15 °P wort makes no sense left in
  // place when you flip to a 5% ABV blend), while amounts -- being
  // parameter-agnostic kg/L -- are left untouched.
  const changeParameter = (id: MixingParameterId) => {
    const next = MIXING_PARAMETERS.find((p) => p.id === id) ?? MIXING_PARAMETERS[0];
    setParamId(id);
    setParamA(next.defaults.paramA);
    setParamB(next.defaults.paramB);
    setTarget(next.defaults.target);
    setKnownAmount(next.defaults.knownAmount);
  };

  const parts = useMemo(() => solveMixingCross(paramA, paramB, target), [paramA, paramB, target]);

  const quantities = useMemo(() => {
    if (parts.infeasible) return null;
    if (scaleMode === 'total') return quantitiesFromTotal(parts, totalAmount);
    return quantitiesFromComponent(parts, knownAmount, scaleMode === 'componentA' ? 'A' : 'B');
  }, [parts, scaleMode, totalAmount, knownAmount]);

  const unit = preset.unit;
  const fmtParam = (v: number) => roundForDisplay(v, preset.paramDecimals);
  const percentA = Math.round(parts.fractionA * 100);

  const warning = parts.note
    ? parts.note.code === 'parametersEqual'
      ? t('mixingCross.warning.parametersEqual')
      : t('mixingCross.warning.targetOutOfRange', { min: fmtParam(parts.note.min), max: fmtParam(parts.note.max) })
    : null;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-bold text-ink">{t('mixingCross.heading')}</h2>

      <TutorialCallout
        title={t('mixingCross.tutorial.title')}
        steps={[
          { lead: t('mixingCross.tutorial.step1.lead'), body: t('mixingCross.tutorial.step1.body') },
          { lead: t('mixingCross.tutorial.step2.lead'), body: t('mixingCross.tutorial.step2.body') },
          { lead: t('mixingCross.tutorial.step3.lead'), body: t('mixingCross.tutorial.step3.body') },
        ]}
      />

      {/* Parameter-context selector -- reuses the segmented-pill look of the
          IBU formula selector so it reads as the same kind of control. */}
      <div className="flex flex-col gap-2">
        <span className="font-body text-sm font-medium text-amber-900">{t('mixingCross.parameter.label')}</span>
        <div className="flex flex-wrap gap-0.5 rounded-full border border-amber-200 bg-amber-50 p-0.5">
          {MIXING_PARAMETERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => changeParameter(p.id)}
              className={`min-h-[32px] flex-1 rounded-full px-3 font-body text-xs font-semibold transition-colors ${
                paramId === p.id ? 'bg-teal-700 text-parchment' : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              {t(PARAM_LABEL_KEY[p.id])}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          label={t('mixingCross.componentA.label')}
          unit={unit || undefined}
          value={paramA}
          step={preset.step}
          allowNegative
          onChange={setParamA}
        />
        <NumberField
          label={t('mixingCross.target.label')}
          unit={unit || undefined}
          value={target}
          step={preset.step}
          allowNegative
          onChange={setTarget}
        />
        <NumberField
          label={t('mixingCross.componentB.label')}
          unit={unit || undefined}
          value={paramB}
          step={preset.step}
          allowNegative
          onChange={setParamB}
        />
      </div>

      {/* Visual Pearson square: each component's arm crosses to the
          opposite corner, where its parts (= the other component's
          distance from the target) appear -- the classic textbook layout. */}
      <MixingCrossDiagram
        paramA={fmtParam(paramA)}
        paramB={fmtParam(paramB)}
        target={fmtParam(target)}
        partsA={parts.infeasible ? '--' : roundForDisplay(parts.partsA, 2).toString()}
        partsB={parts.infeasible ? '--' : roundForDisplay(parts.partsB, 2).toString()}
        unit={unit}
      />

      {warning ? (
        <ResultCard title={t('mixingCross.ratio.title')} tone="warning">
          {warning}
        </ResultCard>
      ) : (
        <>
          <ResultCard title={t('mixingCross.ratio.title')}>
            <div className="flex flex-col gap-1">
              <span className="font-display text-lg font-bold text-ink">
                {t('mixingCross.ratio.parts', {
                  partsA: roundForDisplay(parts.partsA, 2),
                  partsB: roundForDisplay(parts.partsB, 2),
                })}
              </span>
              <span className="text-ink/70">
                {t('mixingCross.ratio.percent', { percentA, percentB: 100 - percentA })}
              </span>
            </div>
          </ResultCard>

          {/* Scale mode -- know the total, or know how much of one source
              you have. Mirrors the textbook "5 parts = 100 kg, so x = ..." */}
          <div className="flex flex-col gap-2">
            <span className="font-body text-sm font-medium text-amber-900">{t('mixingCross.scaleMode.label')}</span>
            <div className="flex flex-wrap gap-0.5 rounded-full border border-amber-200 bg-amber-50 p-0.5">
              {SCALE_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setScaleMode(m.id)}
                  className={`min-h-[32px] flex-1 rounded-full px-3 font-body text-xs font-semibold transition-colors ${
                    scaleMode === m.id ? 'bg-teal-700 text-parchment' : 'text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {t(m.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {scaleMode === 'total' ? (
            <NumberField
              label={t('mixingCross.amount.total')}
              unit={t('mixingCross.amount.unit')}
              value={totalAmount}
              step={1}
              onChange={setTotalAmount}
            />
          ) : (
            <NumberField
              label={t('mixingCross.amount.known')}
              unit={t('mixingCross.amount.unit')}
              value={knownAmount}
              step={1}
              onChange={setKnownAmount}
            />
          )}

          {quantities ? (
            <ResultCard title={t('mixingCross.result.title')} tone="success">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[280px] text-left text-sm">
                  <tbody>
                    <tr className="border-b border-ink/10">
                      <td className="py-1.5 pr-2">
                        {t('mixingCross.result.componentA')} <span className="text-ink/50">({fmtParam(paramA)}{unit})</span>
                      </td>
                      <td className="py-1.5 text-right font-semibold">{roundForDisplay(quantities.amountA, 2)}</td>
                    </tr>
                    <tr className="border-b border-ink/10">
                      <td className="py-1.5 pr-2">
                        {t('mixingCross.result.componentB')} <span className="text-ink/50">({fmtParam(paramB)}{unit})</span>
                      </td>
                      <td className="py-1.5 text-right font-semibold">{roundForDisplay(quantities.amountB, 2)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-semibold">{t('mixingCross.result.total')}</td>
                      <td className="py-1.5 text-right font-display text-base font-bold text-teal-800">
                        {roundForDisplay(quantities.total, 2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ResultCard>
          ) : null}
        </>
      )}
    </section>
  );
}

interface DiagramProps {
  paramA: string | number;
  paramB: string | number;
  target: string | number;
  partsA: string;
  partsB: string;
  unit: string;
}

function MixingCrossDiagram({ paramA, paramB, target, partsA, partsB, unit }: DiagramProps) {
  return (
    <div className="rounded-lg border border-[#e2e6ea] bg-parchment/40 p-4">
      <svg viewBox="0 0 320 150" className="h-auto w-full" role="img" aria-label="Mixing cross diagram">
        {/* crossing arms */}
        <line x1="70" y1="30" x2="250" y2="120" stroke="#d97706" strokeWidth="2" />
        <line x1="70" y1="120" x2="250" y2="30" stroke="#d97706" strokeWidth="2" />
        {/* left: components */}
        <text x="64" y="26" textAnchor="end" className="fill-ink font-body" fontSize="15" fontWeight="700">
          {paramA}{unit}
        </text>
        <text x="64" y="126" textAnchor="end" className="fill-ink font-body" fontSize="15" fontWeight="700">
          {paramB}{unit}
        </text>
        {/* center: target */}
        <circle cx="160" cy="75" r="26" fill="#0f766e" />
        <text x="160" y="80" textAnchor="middle" fill="#fdf6e3" fontSize="14" fontWeight="700">
          {target}{unit}
        </text>
        {/* right: parts */}
        <text x="256" y="26" textAnchor="start" className="fill-teal-800 font-body" fontSize="15" fontWeight="700">
          {partsA}
        </text>
        <text x="256" y="126" textAnchor="start" className="fill-teal-800 font-body" fontSize="15" fontWeight="700">
          {partsB}
        </text>
      </svg>
    </div>
  );
}
