'use client';

import { useEffect, useState } from 'react';
import {
  calculateAbvSimple,
  calculateAbvAdvanced,
  calculateAttenuation,
  correctHydrometerReading,
} from '@/lib/fermentation';
import { calculateBrewhouseEfficiency, pointsToSg, GrainPotentialItem } from '@/lib/efficiency';
import { calculatePrimingDose, PRIMING_SUGARS } from '@/lib/priming';
import { calculateForceCarbonationPressure } from '@/lib/forceCarbonation';
import { calculatePitchRate, calculateRepitchSlurryVolume, YeastStyle } from '@/lib/pitchRate';
import {
  calculateIbu,
  calculateHopWeightForTargetIbu,
  calculateDryHopWeight,
  HopAddition,
  IbuFormula,
  GaretzExtras,
  IBU_FORMULAS,
} from '@/lib/ibu';
import { calculateSrm, srmToApproxHex } from '@/lib/srm';
import { GrainBillItem } from '@/lib/waterChemistry';
import { NumberField } from '@/components/ui/NumberField';
import { GravityField } from '@/components/ui/GravityField';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { IbuFormulaSelector } from '@/components/ui/IbuFormulaSelector';
import { HOP_VARIETIES } from '@/lib/hopVarieties';
import { YEAST_STRAINS } from '@/lib/yeastStrains';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{title}</h3>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </div>
  );
}

interface SharedRecipeProps {
  og: number;
  onOgChange: (value: number) => void;
  fg: number;
  onFgChange: (value: number) => void;
  batchVolumeL: number;
  onBatchVolumeChange: (value: number) => void;
  grainBill: GrainBillItem[];
  wortGravitySg: number;
  onWortGravityChange: (value: number) => void;
  hopAdditions: HopAddition[];
  onHopAdditionsChange: (hops: HopAddition[]) => void;
  ibuFormula: IbuFormula;
  onIbuFormulaChange: (formula: IbuFormula) => void;
  garetzExtras: GaretzExtras;
  onGaretzExtrasChange: (extras: GaretzExtras) => void;
}

function AbvAttenuationCalculator({ og, onOgChange, fg, onFgChange }: Pick<SharedRecipeProps, 'og' | 'onOgChange' | 'fg' | 'onFgChange'>) {
  const { t } = useLanguage();
  const abvSimple = calculateAbvSimple(og, fg);
  const abvAdvanced = calculateAbvAdvanced(og, fg);
  const attenuation = calculateAttenuation(og, fg);

  return (
    <SectionCard title={t('brewhouse.abv.title')}>
      <p className="-mt-2 font-body text-xs text-ink/60">{t('brewhouse.abv.sharedNote')}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GravityField label={t('brewhouse.abv.originalGravity')} value={og} onChange={onOgChange} />
        <GravityField label={t('brewhouse.abv.finalGravity')} value={fg} onChange={onFgChange} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResultCard title={t('brewhouse.abv.simple')} value={roundForDisplay(abvSimple, 2).toString()} unit="%" />
        <ResultCard title={t('brewhouse.abv.advanced')} value={roundForDisplay(abvAdvanced, 2).toString()} unit="%" />
        <ResultCard
          title={t('brewhouse.abv.apparentAttenuation')}
          value={roundForDisplay(attenuation.apparentAttenuationPercent, 1).toString()}
          unit="%"
        />
        <ResultCard
          title={t('brewhouse.abv.realAttenuation')}
          value={roundForDisplay(attenuation.realAttenuationPercent, 1).toString()}
          unit="%"
        />
      </div>
    </SectionCard>
  );
}

function HydrometerCorrectionCalculator() {
  const { t } = useLanguage();
  const [measuredSg, setMeasuredSg] = useState(1.05);
  const [sampleTempC, setSampleTempC] = useState(25);
  const [calibrationTempC, setCalibrationTempC] = useState(20);

  const corrected = correctHydrometerReading(measuredSg, sampleTempC, calibrationTempC);

  return (
    <SectionCard title={t('brewhouse.hydrometer.title')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label={t('brewhouse.hydrometer.measuredSg')} value={measuredSg} step={0.001} onChange={setMeasuredSg} />
        <NumberField label={t('brewhouse.hydrometer.sampleTemp')} unit="°C" value={sampleTempC} step={1} onChange={setSampleTempC} allowNegative />
        <NumberField
          label={t('brewhouse.hydrometer.calibrationTemp')}
          unit="°C"
          value={calibrationTempC}
          step={1}
          onChange={setCalibrationTempC}
        />
      </div>
      <ResultCard title={t('brewhouse.hydrometer.correctedSg')} value={roundForDisplay(corrected, 4).toString()} />
    </SectionCard>
  );
}

function EfficiencyCalculator() {
  const { t } = useLanguage();
  const [grainBill, setGrainBill] = useState<GrainPotentialItem[]>([
    { name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 },
  ]);
  const [actualMeasuredSg, setActualMeasuredSg] = useState(1.045);
  const [measuredVolumeL, setMeasuredVolumeL] = useState(20);

  const result = calculateBrewhouseEfficiency(grainBill, actualMeasuredSg, measuredVolumeL);

  const updateRow = (index: number, patch: Partial<GrainPotentialItem>) => {
    setGrainBill(grainBill.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <SectionCard title={t('brewhouse.efficiency.title')}>
      <div className="flex flex-col gap-2">
        {grainBill.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label={t('brewhouse.efficiency.grainLabel')} value={row.name} onChange={(value) => updateRow(index, { name: value })} />
            <NumberField
              label={t('brewhouse.efficiency.weight')}
              unit="kg"
              value={row.weightKg}
              step={0.1}
              onChange={(value) => updateRow(index, { weightKg: value })}
            />
            <NumberField
              label={t('brewhouse.efficiency.potentialSg')}
              value={row.potentialSg}
              step={0.001}
              onChange={(value) => updateRow(index, { potentialSg: value })}
              helperText={t('brewhouse.efficiency.potentialSgHelper')}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setGrainBill([...grainBill, { name: '', weightKg: 0, potentialSg: 1.037 }])}
          className="min-h-[44px] self-start rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
        >
          {t('brewhouse.efficiency.addGrain')}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('brewhouse.efficiency.actualMeasuredSg')}
          value={actualMeasuredSg}
          step={0.001}
          onChange={setActualMeasuredSg}
        />
        <NumberField label={t('brewhouse.efficiency.measuredAtVolume')} unit="L" value={measuredVolumeL} step={1} onChange={setMeasuredVolumeL} />
      </div>
      <ResultCard title={t('brewhouse.efficiency.result')} value={roundForDisplay(result.efficiencyPercent, 1).toString()} unit="%">
        {t('brewhouse.efficiency.maxTheoretical', { value: roundForDisplay(pointsToSg(result.maxTheoreticalPoints), 4).toString() })}
      </ResultCard>
    </SectionCard>
  );
}

function ForceCarbonationCalculator() {
  const { t } = useLanguage();
  const [targetCo2Volumes, setTargetCo2Volumes] = useState(2.6);
  const [temperatureC, setTemperatureC] = useState(4);

  const result = calculateForceCarbonationPressure(targetCo2Volumes, temperatureC);

  return (
    <SectionCard title={t('brewhouse.forceCarb.title')}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('brewhouse.forceCarb.targetCo2')}
          unit={t('brewhouse.forceCarb.volumes')}
          value={targetCo2Volumes}
          step={0.1}
          onChange={setTargetCo2Volumes}
        />
        <NumberField label={t('brewhouse.forceCarb.tankTemp')} unit="°C" value={temperatureC} step={0.5} onChange={setTemperatureC} allowNegative />
      </div>
      <ResultCard title={t('brewhouse.forceCarb.regulatorPressure')} value={roundForDisplay(result.pressurePsi, 1).toString()} unit="psi">
        <p>{t('brewhouse.forceCarb.approxBar', { value: roundForDisplay(result.pressureBar, 2).toString() })}</p>
        <p className="mt-1 text-amber-800">
          {t('brewhouse.forceCarb.disclaimer')}
        </p>
      </ResultCard>
    </SectionCard>
  );
}

function PrimingCalculator({ batchVolumeL, onBatchVolumeChange }: Pick<SharedRecipeProps, 'batchVolumeL' | 'onBatchVolumeChange'>) {
  const { t } = useLanguage();
  const [targetCo2Volumes, setTargetCo2Volumes] = useState(2.4);
  const [temperatureC, setTemperatureC] = useState(20);
  const [sugarId, setSugarId] = useState(PRIMING_SUGARS[0].id);

  const sugar = PRIMING_SUGARS.find((s) => s.id === sugarId) ?? PRIMING_SUGARS[0];
  const result = calculatePrimingDose(targetCo2Volumes, temperatureC, batchVolumeL, sugar);

  return (
    <SectionCard title={t('brewhouse.priming.title')}>
      <p className="-mt-2 font-body text-xs text-ink/60">{t('brewhouse.priming.sharedNote')}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('brewhouse.priming.targetCo2')}
          unit={t('brewhouse.forceCarb.volumes')}
          value={targetCo2Volumes}
          step={0.1}
          onChange={setTargetCo2Volumes}
        />
        <NumberField
          label={t('brewhouse.priming.conditioningTemp')}
          unit="°C"
          value={temperatureC}
          step={1}
          onChange={setTemperatureC}
        />
        <NumberField label={t('brewhouse.priming.batchVolume')} unit="L" value={batchVolumeL} step={1} onChange={onBatchVolumeChange} />
        <SearchableSelect
          label={t('brewhouse.priming.sugarSelect')}
          value={sugarId}
          onChange={setSugarId}
          options={PRIMING_SUGARS.map((s) => ({ id: s.id, label: s.name }))}
        />
      </div>
      <ResultCard
        title={t('brewhouse.priming.needed')}
        value={result.alreadyAtTarget ? '0' : roundForDisplay(result.primingSugarGrams, 1).toString()}
        unit="g"
      >
        {t('brewhouse.priming.residual', { temp: temperatureC.toString(), value: roundForDisplay(result.residualCo2Volumes, 2).toString() })}
      </ResultCard>
    </SectionCard>
  );
}

function PitchRateCalculator({ og, onOgChange, batchVolumeL, onBatchVolumeChange }: Pick<SharedRecipeProps, 'og' | 'onOgChange' | 'batchVolumeL' | 'onBatchVolumeChange'>) {
  const { t } = useLanguage();
  const [style, setStyle] = useState<YeastStyle>('ale');
  const [strainName, setStrainName] = useState('');

  const result = calculatePitchRate(og, batchVolumeL, style);

  const [slurryDensity, setSlurryDensity] = useState(1.2);
  const [viabilityPercent, setViabilityPercent] = useState(85);
  const repitch = calculateRepitchSlurryVolume(result.targetCellsBillion, slurryDensity, viabilityPercent);

  return (
    <SectionCard title={t('brewhouse.pitchRate.title')}>
      <SearchableSelect
        label={t('brewhouse.pitchRate.quickFill')}
        placeholder={t('brewhouse.pitchRate.searchPlaceholder')}
        value={YEAST_STRAINS.find((s) => s.name === strainName)?.id ?? ''}
        options={YEAST_STRAINS.map((strain) => ({ id: strain.id, label: strain.name }))}
        onChange={(id) => {
          const strain = YEAST_STRAINS.find((s) => s.id === id);
          if (strain) {
            setStrainName(strain.name);
            setStyle(strain.style);
          }
        }}
      />
      <p className="-mt-2 font-body text-xs font-semibold text-amber-700/80">
        {t('brewhouse.pitchRate.notInList')}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t('brewhouse.pitchRate.strainLabel')}
          value={strainName}
          onChange={setStrainName}
          placeholder={t('brewhouse.pitchRate.strainPlaceholder')}
        />
        <SearchableSelect
          label={t('brewhouse.pitchRate.styleLabel')}
          value={style}
          onChange={(id) => setStyle(id as YeastStyle)}
          options={[
            { id: 'ale', label: t('brewhouse.pitchRate.ale') },
            { id: 'lager', label: t('brewhouse.pitchRate.lager') },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GravityField label={t('brewhouse.pitchRate.originalGravity')} value={og} onChange={onOgChange} />
        <NumberField label={t('brewhouse.pitchRate.batchVolume')} unit="L" value={batchVolumeL} step={1} onChange={onBatchVolumeChange} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard title={t('brewhouse.pitchRate.targetCells')} value={roundForDisplay(result.targetCellsBillion, 0).toString()} unit={t('brewhouse.pitchRate.billion')} />
        <ResultCard title={t('brewhouse.pitchRate.dryYeast')} value={roundForDisplay(result.dryYeastGrams, 1).toString()} unit="g" />
        <ResultCard title={t('brewhouse.pitchRate.freshSlurry')} value={roundForDisplay(result.slurryMl, 0).toString()} unit="mL" />
      </div>

      <div className="rounded-md border border-teal-300 bg-teal-100/40 p-3">
        <h4 className="font-body text-sm font-semibold text-teal-900">{t('brewhouse.pitchRate.repitchTitle')}</h4>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label={t('brewhouse.pitchRate.slurryDensity')}
            unit="billion/mL"
            value={slurryDensity}
            step={0.1}
            onChange={setSlurryDensity}
            helperText={t('brewhouse.pitchRate.slurryDensityHelper')}
          />
          <NumberField
            label={t('brewhouse.pitchRate.viability')}
            unit="%"
            value={viabilityPercent}
            step={1}
            max={100}
            onChange={setViabilityPercent}
            helperText={t('brewhouse.pitchRate.viabilityHelper')}
          />
        </div>
        <p className="mt-2 font-body text-sm text-ink">
          {t('brewhouse.pitchRate.useApprox', { amount: roundForDisplay(repitch.slurryMlNeeded, 0).toString() })}
        </p>
      </div>
    </SectionCard>
  );
}

function HopWeightForTargetIbuCalculator({
  wortGravity,
  batchVolumeL,
  ibuFormula,
  garetzExtras,
}: {
  wortGravity: number;
  batchVolumeL: number;
  ibuFormula: IbuFormula;
  garetzExtras: GaretzExtras;
}) {
  const { t } = useLanguage();
  const [targetIbu, setTargetIbu] = useState(40);
  const [alphaAcidPercent, setAlphaAcidPercent] = useState(12);
  const [boilTimeMinutes, setBoilTimeMinutes] = useState(60);

  const grams = calculateHopWeightForTargetIbu(
    targetIbu,
    alphaAcidPercent,
    boilTimeMinutes,
    wortGravity,
    batchVolumeL,
    ibuFormula,
    garetzExtras,
  );

  return (
    <div className="rounded-md border border-teal-300 bg-teal-100/40 p-3">
      <h4 className="font-body text-sm font-semibold text-teal-900">{t('brewhouse.hopTarget.title')}</h4>
      <p className="mt-1 font-body text-xs text-ink/70">
        {t('brewhouse.hopTarget.usesAbove')}
      </p>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NumberField label={t('brewhouse.hopTarget.targetIbu')} value={targetIbu} step={1} onChange={setTargetIbu} />
        <NumberField label={t('brewhouse.hopTarget.alphaAcid')} unit="%" value={alphaAcidPercent} step={0.1} onChange={setAlphaAcidPercent} />
        <NumberField label={t('brewhouse.hopTarget.boilTime')} unit="min" value={boilTimeMinutes} step={1} onChange={setBoilTimeMinutes} />
      </div>
      <p className="mt-2 font-body text-sm text-ink">
        {t('brewhouse.hopTarget.addResult', { grams: roundForDisplay(grams, 1).toString(), minutes: boilTimeMinutes.toString() })}
      </p>
    </div>
  );
}

function DryHopCalculator({ batchVolumeL }: { batchVolumeL: number }) {
  const { t } = useLanguage();
  const [rateGPerL, setRateGPerL] = useState(2.5);

  const grams = calculateDryHopWeight(rateGPerL, batchVolumeL);

  return (
    <div className="rounded-md border border-teal-300 bg-teal-100/40 p-3">
      <h4 className="font-body text-sm font-semibold text-teal-900">{t('brewhouse.dryHop.title')}</h4>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberField
          label={t('brewhouse.dryHop.rate')}
          unit="g/L"
          value={rateGPerL}
          step={0.1}
          onChange={setRateGPerL}
          helperText={t('brewhouse.dryHop.rateHelper')}
        />
        <ResultCard title={t('brewhouse.dryHop.weightNeeded')} value={roundForDisplay(grams, 1).toString()} unit="g" />
      </div>
    </div>
  );
}

function IbuCalculator({
  batchVolumeL,
  onBatchVolumeChange,
  wortGravitySg,
  onWortGravityChange,
  hopAdditions,
  onHopAdditionsChange,
  ibuFormula,
  onIbuFormulaChange,
  garetzExtras,
  onGaretzExtrasChange,
}: Pick<
  SharedRecipeProps,
  | 'batchVolumeL'
  | 'onBatchVolumeChange'
  | 'wortGravitySg'
  | 'onWortGravityChange'
  | 'hopAdditions'
  | 'onHopAdditionsChange'
  | 'ibuFormula'
  | 'onIbuFormulaChange'
  | 'garetzExtras'
  | 'onGaretzExtrasChange'
>) {
  const { t } = useLanguage();
  const result = calculateIbu(hopAdditions, wortGravitySg, batchVolumeL, ibuFormula, garetzExtras);
  const formulaLabel = IBU_FORMULAS.find((f) => f.id === ibuFormula)?.label ?? 'Tinseth';

  // Briefly highlight the Total IBU card whenever the formula changes, so
  // the resulting jump in the number (e.g. Tinseth -> Rager can shift IBU
  // noticeably) doesn't slip by unnoticed.
  const [justChangedFormula, setJustChangedFormula] = useState(false);
  useEffect(() => {
    setJustChangedFormula(true);
    const timer = setTimeout(() => setJustChangedFormula(false), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ibuFormula]);

  const updateRow = (index: number, patch: Partial<HopAddition>) => {
    onHopAdditionsChange(hopAdditions.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <SectionCard title={t('brewhouse.ibu.title', { formula: formulaLabel })}>
      <p className="-mt-2 font-body text-xs text-ink/60">
        {t('brewhouse.ibu.sharedNote')}
      </p>
      <IbuFormulaSelector
        formula={ibuFormula}
        onFormulaChange={onIbuFormulaChange}
        garetzExtras={garetzExtras}
        onGaretzExtrasChange={onGaretzExtrasChange}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label={t('brewhouse.ibu.wortGravity')} value={wortGravitySg} step={0.001} onChange={onWortGravityChange} />
        <NumberField label={t('brewhouse.ibu.batchVolume')} unit="L" value={batchVolumeL} step={1} onChange={onBatchVolumeChange} />
      </div>
      <div className="flex flex-col gap-2">
        {hopAdditions.map((row, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-md border-2 border-amber-200 bg-amber-50/40 p-2 sm:border-0 sm:bg-transparent sm:p-0">
            <SearchableSelect
              label={t('brewhouse.ibu.quickFillHop')}
              placeholder={t('brewhouse.ibu.searchHopPlaceholder')}
              value={HOP_VARIETIES.find((h) => h.name === row.name)?.id ?? ''}
              options={HOP_VARIETIES.map((hop) => ({ id: hop.id, label: `${hop.name} (~${hop.alphaAcidPercent}% AA)` }))}
              onChange={(id) => {
                const hop = HOP_VARIETIES.find((h) => h.id === id);
                if (hop) updateRow(index, { name: hop.name, alphaAcidPercent: hop.alphaAcidPercent });
              }}
            />
            <p className="-mt-1.5 font-body text-xs font-semibold text-amber-700/80">
              {t('brewhouse.ibu.notInListHop')}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Input
              label={t('brewhouse.ibu.hopLabel')}
              value={row.name}
              onChange={(value) => updateRow(index, { name: value })}
              placeholder={t('brewhouse.ibu.hopPlaceholder')}
            />
            <NumberField
              label={t('brewhouse.ibu.alphaAcid')}
              unit="%"
              value={row.alphaAcidPercent}
              step={0.1}
              onChange={(value) => updateRow(index, { alphaAcidPercent: value })}
            />
            <NumberField
              label={t('brewhouse.ibu.weight')}
              unit="g"
              value={row.weightG}
              step={1}
              onChange={(value) => updateRow(index, { weightG: value })}
            />
            <NumberField
              label={t('brewhouse.ibu.boilTime')}
              unit="min"
              value={row.boilTimeMinutes}
              step={1}
              onChange={(value) => updateRow(index, { boilTimeMinutes: value })}
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
          {t('brewhouse.ibu.addHop')}
        </button>
      </div>
      <div className={`rounded-lg transition-shadow duration-500 ${justChangedFormula ? 'ring-2 ring-teal-400' : ''}`}>
        <ResultCard title={t('brewhouse.ibu.totalIbu')} value={roundForDisplay(result.totalIbu, 1).toString()} />
      </div>

      <HopWeightForTargetIbuCalculator
        wortGravity={wortGravitySg}
        batchVolumeL={batchVolumeL}
        ibuFormula={ibuFormula}
        garetzExtras={garetzExtras}
      />
      <DryHopCalculator batchVolumeL={batchVolumeL} />
    </SectionCard>
  );
}

function SrmColorCalculator({ grainBill, batchVolumeL }: { grainBill: GrainBillItem[]; batchVolumeL: number }) {
  const { t } = useLanguage();
  const srm = calculateSrm(grainBill, batchVolumeL);
  const hasGrain = grainBill.some((row) => row.weightKg > 0);

  return (
    <SectionCard title={t('brewhouse.srm.title')}>
      <p className="-mt-2 font-body text-xs text-ink/60">
        {t('brewhouse.srm.description')}
      </p>
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-amber-200 shadow-inner"
          style={{ backgroundColor: hasGrain ? srmToApproxHex(srm) : '#eef1f4' }}
        />
        <ResultCard title={t('brewhouse.srm.estimatedColor')} value={hasGrain ? roundForDisplay(srm, 1).toString() : '--'} unit="SRM" />
      </div>
    </SectionCard>
  );
}

export function BrewhouseCalculatorsPanel({
  og,
  onOgChange,
  fg,
  onFgChange,
  batchVolumeL,
  onBatchVolumeChange,
  grainBill,
  wortGravitySg,
  onWortGravityChange,
  hopAdditions,
  onHopAdditionsChange,
  ibuFormula,
  onIbuFormulaChange,
  garetzExtras,
  onGaretzExtrasChange,
}: SharedRecipeProps) {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('brewhouse.title')}</h2>
      <p className="font-body text-sm text-amber-800">
        {t('brewhouse.tagline')}
      </p>
      <TutorialCallout
        title={t('brewhouse.tutorial.title')}
        steps={[
          {
            lead: t('brewhouse.tutorial.step1.lead'),
            body: t('brewhouse.tutorial.step1.body'),
          },
          {
            lead: t('brewhouse.tutorial.step2.lead'),
            body: t('brewhouse.tutorial.step2.body'),
          },
          {
            lead: t('brewhouse.tutorial.step3.lead'),
            body: t('brewhouse.tutorial.step3.body'),
          },
        ]}
      />
      {/* Ordered to match when each reading is actually taken on brew day:
          mash-out efficiency, then gravity corrections, hop bitterness, and
          color during the boil, pitch rate at pitching, OG/FG tracking
          through fermentation, and finally the two packaging-time
          carbonation methods. */}
      <EfficiencyCalculator />
      <HydrometerCorrectionCalculator />
      <IbuCalculator
        batchVolumeL={batchVolumeL}
        onBatchVolumeChange={onBatchVolumeChange}
        wortGravitySg={wortGravitySg}
        onWortGravityChange={onWortGravityChange}
        hopAdditions={hopAdditions}
        onHopAdditionsChange={onHopAdditionsChange}
        ibuFormula={ibuFormula}
        onIbuFormulaChange={onIbuFormulaChange}
        garetzExtras={garetzExtras}
        onGaretzExtrasChange={onGaretzExtrasChange}
      />
      <SrmColorCalculator grainBill={grainBill} batchVolumeL={batchVolumeL} />
      <PitchRateCalculator og={og} onOgChange={onOgChange} batchVolumeL={batchVolumeL} onBatchVolumeChange={onBatchVolumeChange} />
      <AbvAttenuationCalculator og={og} onOgChange={onOgChange} fg={fg} onFgChange={onFgChange} />
      <PrimingCalculator batchVolumeL={batchVolumeL} onBatchVolumeChange={onBatchVolumeChange} />
      <ForceCarbonationCalculator />
    </section>
  );
}
