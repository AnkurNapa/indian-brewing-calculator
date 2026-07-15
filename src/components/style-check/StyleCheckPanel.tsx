'use client';

import { useMemo } from 'react';
import { GrainBillItem } from '@/lib/waterChemistry';
import { calculateSrm } from '@/lib/srm';
import { calculateAbvAdvanced } from '@/lib/fermentation';
import { calculateIbu, HopAddition, IbuFormula, GaretzExtras } from '@/lib/ibu';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { checkStyleCompliance, ParameterCompliance } from '@/lib/styleCompliance';
import { TargetVsActual, TargetRow } from '@/components/ui/TargetVsActual';
import { NumberField } from '@/components/ui/NumberField';
import { GravityField } from '@/components/ui/GravityField';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useCatalog, HopOption } from '@/hooks/useCatalog';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { IbuFormulaSelector } from '@/components/ui/IbuFormulaSelector';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

interface StyleCheckPanelProps {
  grainBill: GrainBillItem[];
  batchVolumeL: number;
  og: number;
  onOgChange: (value: number) => void;
  fg: number;
  onFgChange: (value: number) => void;
  bjcpStyleId: string;
  onBjcpStyleChange: (id: string) => void;
  wortGravitySg: number;
  onWortGravityChange: (value: number) => void;
  hopAdditions: HopAddition[];
  onHopAdditionsChange: (hops: HopAddition[]) => void;
  ibuFormula: IbuFormula;
  onIbuFormulaChange: (formula: IbuFormula) => void;
  garetzExtras: GaretzExtras;
  onGaretzExtrasChange: (extras: GaretzExtras) => void;
  /** Planning targets from /start (0 = not set); shown as target-vs-actual. */
  targetAbvPercent?: number;
  targetIbu?: number;
  targetCo2Volumes?: number;
  targetFinalVolumeL?: number;
}

function ParameterRow({ label, unit, compliance }: { label: string; unit: string; compliance: ParameterCompliance }) {
  const { t } = useLanguage();
  return (
    <div
      className={`flex items-center justify-between rounded-md border p-2 text-sm ${
        compliance.inRange ? 'border-teal-300 bg-teal-50' : 'border-red-300 bg-red-50'
      }`}
    >
      <span className="font-medium text-ink">{label}</span>
      <span className={compliance.inRange ? 'text-teal-800' : 'text-red-700'}>
        {roundForDisplay(compliance.value, 3)} {unit}
        <span className="ml-2 text-xs text-ink/60">
          ({t('styleCheck.param.target', { min: compliance.range.min, max: compliance.range.max })})
        </span>
      </span>
    </div>
  );
}

export function StyleCheckPanel({
  grainBill,
  batchVolumeL,
  og,
  onOgChange,
  fg,
  onFgChange,
  bjcpStyleId,
  onBjcpStyleChange,
  wortGravitySg,
  onWortGravityChange,
  hopAdditions,
  onHopAdditionsChange,
  ibuFormula,
  onIbuFormulaChange,
  garetzExtras,
  onGaretzExtrasChange,
  targetAbvPercent = 0,
  targetIbu = 0,
  targetCo2Volumes = 0,
  targetFinalVolumeL = 0,
}: StyleCheckPanelProps) {
  const { t } = useLanguage();
  const catalogHops = useCatalog<HopOption>('hops');

  const style = BJCP_STYLES.find((s) => s.id === bjcpStyleId) ?? BJCP_STYLES[0];

  const srm = useMemo(() => calculateSrm(grainBill, batchVolumeL), [grainBill, batchVolumeL]);
  const abvPercent = calculateAbvAdvanced(og, fg);
  const ibuResult = calculateIbu(hopAdditions, wortGravitySg, batchVolumeL, ibuFormula, garetzExtras);

  const compliance = checkStyleCompliance(
    { og, fg, ibu: ibuResult.totalIbu, srm, abvPercent },
    style,
  );

  const updateHopRow = (index: number, patch: Partial<HopAddition>) => {
    onHopAdditionsChange(hopAdditions.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('styleCheck.title')}</h2>
      <p className="font-body text-sm text-amber-800">{t('styleCheck.intro')}</p>

      <TutorialCallout
        title={t('styleCheck.tutorial.title')}
        steps={[
          {
            lead: t('styleCheck.tutorial.step1.lead'),
            body: t('styleCheck.tutorial.step1.body'),
          },
          {
            lead: t('styleCheck.tutorial.step2.lead'),
            body: t('styleCheck.tutorial.step2.body'),
          },
          {
            lead: t('styleCheck.tutorial.step3.lead'),
            body: t('styleCheck.tutorial.step3.body'),
          },
        ]}
      />

      <div className="flex flex-col gap-2">
        <SearchableSelect
          label={t('styleCheck.targetStyle.label')}
          placeholder={t('styleCheck.targetStyle.searchPlaceholder', { count: BJCP_STYLES.length })}
          value={bjcpStyleId}
          options={BJCP_STYLES.map((s) => ({ id: s.id, label: s.name }))}
          onChange={onBjcpStyleChange}
        />
        <p className="rounded-md border-2 border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-700/80">
          {t('styleCheck.selected')} <span className="font-semibold text-teal-800">{style.name}</span>. {style.description}
        </p>
      </div>

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{t('styleCheck.gravityAbv.title')}</h3>
        <p className="mt-1 font-body text-xs text-ink/70">
          {t('styleCheck.gravityAbv.subtitle', { volume: batchVolumeL })}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GravityField label={t('styleCheck.originalGravity')} value={og} onChange={onOgChange} />
          <GravityField label={t('styleCheck.finalGravity')} value={fg} onChange={onFgChange} />
        </div>
      </div>

      <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">{t('styleCheck.hopsForIbu.title')}</h3>
        <div className="mt-3">
          <IbuFormulaSelector
            formula={ibuFormula}
            onFormulaChange={onIbuFormulaChange}
            garetzExtras={garetzExtras}
            onGaretzExtrasChange={onGaretzExtrasChange}
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label={t('styleCheck.wortGravity')} value={wortGravitySg} step={0.001} onChange={onWortGravityChange} />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {hopAdditions.map((row, index) => (
            <div key={index} className="flex flex-col gap-2 rounded-lg border border-amber-100 bg-amber-50/30 p-2">
              <SearchableSelect
                label={t('styleCheck.hop.pick')}
                placeholder={t('styleCheck.hop.pickPlaceholder')}
                value={row.name}
                options={catalogHops.map((h) => ({ id: h.name, label: h.alpha != null ? `${h.name} (${h.alpha}% AA)` : h.name }))}
                onChange={(name) => {
                  const h = catalogHops.find((x) => x.name === name);
                  if (h) updateHopRow(index, h.alpha != null ? { name: h.name, alphaAcidPercent: h.alpha } : { name: h.name });
                }}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Input
                label={t('styleCheck.hop.label')}
                value={row.name}
                onChange={(value) => updateHopRow(index, { name: value })}
                placeholder={t('styleCheck.hop.placeholder')}
              />
              <NumberField
                label={t('styleCheck.alphaAcid')}
                unit="%"
                value={row.alphaAcidPercent}
                step={0.1}
                onChange={(value) => updateHopRow(index, { alphaAcidPercent: value })}
              />
              <NumberField
                label={t('styleCheck.weight')}
                unit="g"
                value={row.weightG}
                step={1}
                onChange={(value) => updateHopRow(index, { weightG: value })}
              />
              <NumberField
                label={t('styleCheck.boilTime')}
                unit="min"
                value={row.boilTimeMinutes}
                step={1}
                onChange={(value) => updateHopRow(index, { boilTimeMinutes: value })}
              />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onHopAdditionsChange([...hopAdditions, { name: '', alphaAcidPercent: 0, weightG: 0, boilTimeMinutes: 0 }])
            }
            className="min-h-[44px] self-start rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
          >
            {t('styleCheck.addHop')}
          </button>
        </div>
      </div>

      <ResultCard
        title={t('styleCheck.styleMatch.title')}
        value={`${compliance.parametersInRange}/5`}
        tone={compliance.fullyCompliant ? 'success' : compliance.parametersInRange >= 3 ? 'default' : 'warning'}
      >
        {t('styleCheck.styleMatch.summary', { srm: roundForDisplay(srm, 1), ibu: roundForDisplay(ibuResult.totalIbu, 1) })}
      </ResultCard>

      <div className="flex flex-col gap-2">
        <ParameterRow label={t('styleCheck.originalGravity')} unit="SG" compliance={compliance.og} />
        <ParameterRow label={t('styleCheck.finalGravity')} unit="SG" compliance={compliance.fg} />
        <ParameterRow label={t('styleCheck.param.ibu')} unit="" compliance={compliance.ibu} />
        <ParameterRow label={t('styleCheck.param.colorSrm')} unit="" compliance={compliance.srm} />
        <ParameterRow label={t('styleCheck.param.abv')} unit="%" compliance={compliance.abvPercent} />
      </div>

      {(() => {
        const targetRows: TargetRow[] = [
          { label: t('styleCheck.param.abv'), target: targetAbvPercent, actual: abvPercent, unit: '%', range: style.abvPercent, decimals: 1 },
          { label: t('styleCheck.param.ibu'), target: targetIbu, actual: ibuResult.totalIbu, unit: '', range: style.ibu, decimals: 0 },
          { label: t('home.targets.finalVolume'), target: targetFinalVolumeL, actual: batchVolumeL, unit: ' L', decimals: 0 },
          { label: t('home.targets.co2'), target: targetCo2Volumes, unit: '', decimals: 1 },
        ];
        if (!targetRows.some((r) => r.target > 0)) return null;
        return (
          <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-3">
            <h4 className="mb-1.5 font-display text-xs font-bold uppercase tracking-wide text-teal-800">
              {t('home.targets.title')}
            </h4>
            <TargetVsActual rows={targetRows} inStyleLabel={t('start.inStyle')} outStyleLabel={t('start.outOfStyle')} />
          </div>
        );
      })()}
    </section>
  );
}
