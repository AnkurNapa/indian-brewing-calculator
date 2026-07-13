'use client';

import { useMemo, useState } from 'react';
import { GrainBillItem } from '@/lib/waterChemistry';
import { calculateWaterVolumes } from '@/lib/waterVolumes';
import { calculateVolumeToAddForTargetTemp } from '@/lib/waterTemperature';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

interface WaterVolumesPanelProps {
  grainBill: GrainBillItem[];
}

function StrikeTemperatureMixCalculator() {
  const { t } = useLanguage();
  const [startVolumeL, setStartVolumeL] = useState(50);
  const [startTempC, setStartTempC] = useState(40);
  const [targetTempC, setTargetTempC] = useState(60);
  const [additionTempC, setAdditionTempC] = useState(100);

  const result = calculateVolumeToAddForTargetTemp(startVolumeL, startTempC, targetTempC, additionTempC);

  return (
    <section className="flex flex-col gap-4 rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
        {t('waterVolumes.strikeMix.heading')}
      </h3>
      <p className="font-body text-sm text-ink">{t('waterVolumes.strikeMix.description')}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('waterVolumes.strikeMix.startVolume.label')}
          unit="L"
          value={startVolumeL}
          step={1}
          onChange={setStartVolumeL}
        />
        <NumberField
          label={t('waterVolumes.strikeMix.startTemp.label')}
          unit="°C"
          value={startTempC}
          step={1}
          onChange={setStartTempC}
          allowNegative
        />
        <NumberField
          label={t('waterVolumes.strikeMix.targetTemp.label')}
          unit="°C"
          value={targetTempC}
          step={1}
          onChange={setTargetTempC}
          allowNegative
        />
        <NumberField
          label={t('waterVolumes.strikeMix.additionTemp.label')}
          unit="°C"
          value={additionTempC}
          step={1}
          onChange={setAdditionTempC}
          allowNegative
          helperText={t('waterVolumes.strikeMix.additionTemp.helperText')}
        />
      </div>
      <ResultCard
        title={t('waterVolumes.strikeMix.result.title')}
        value={result.infeasible ? '--' : roundForDisplay(result.volumeToAddL, 1).toString()}
        unit="L"
        tone={result.infeasible ? 'warning' : 'default'}
      >
        {result.infeasible
          ? result.notes.join(' ')
          : t('waterVolumes.strikeMix.result.totalVolumeNote', {
              volume: roundForDisplay(result.totalVolumeL, 1),
              temp: targetTempC,
            })}
      </ResultCard>
    </section>
  );
}

export function WaterVolumesPanel({ grainBill }: WaterVolumesPanelProps) {
  const { t } = useLanguage();
  const totalGrainWeightKg = useMemo(
    () => grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? Math.max(0, row.weightKg) : 0), 0),
    [grainBill],
  );

  const [targetFinalVolumeL, setTargetFinalVolumeL] = useState(20);
  const [mashThicknessLPerKg, setMashThicknessLPerKg] = useState(3.0);
  const [grainAbsorptionLPerKg, setGrainAbsorptionLPerKg] = useState(1.04);
  const [boilTimeMinutes, setBoilTimeMinutes] = useState(60);
  const [boilOffRateLPerHour, setBoilOffRateLPerHour] = useState(4);
  const [postBoilLossL, setPostBoilLossL] = useState(1.5);

  const result = calculateWaterVolumes({
    grainWeightKg: totalGrainWeightKg,
    targetFinalVolumeL,
    mashThicknessLPerKg,
    grainAbsorptionLPerKg,
    boilTimeMinutes,
    boilOffRateLPerHour,
    postBoilLossL,
  });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('waterVolumes.heading')}</h2>
      <p className="font-body text-sm text-amber-800">
        {t('waterVolumes.grainWeightNote')} <span className="font-semibold">{totalGrainWeightKg.toFixed(2)} kg</span>
      </p>

      <TutorialCallout
        title={t('waterVolumes.tutorial.title')}
        steps={[
          {
            lead: t('waterVolumes.tutorial.step1.lead'),
            body: t('waterVolumes.tutorial.step1.body'),
          },
          {
            lead: t('waterVolumes.tutorial.step2.lead'),
            body: t('waterVolumes.tutorial.step2.body'),
          },
          {
            lead: t('waterVolumes.tutorial.step3.lead'),
            body: t('waterVolumes.tutorial.step3.body'),
          },
          {
            lead: t('waterVolumes.tutorial.step4.lead'),
            body: t('waterVolumes.tutorial.step4.body'),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('waterVolumes.targetFinalVolume.label')}
          unit="L"
          value={targetFinalVolumeL}
          step={1}
          onChange={setTargetFinalVolumeL}
          helperText={t('waterVolumes.targetFinalVolume.helperText')}
        />
        <NumberField
          label={t('waterVolumes.mashThickness.label')}
          unit="L/kg"
          value={mashThicknessLPerKg}
          step={0.1}
          onChange={setMashThicknessLPerKg}
          helperText={t('waterVolumes.mashThickness.helperText')}
        />
        <NumberField
          label={t('waterVolumes.grainAbsorption.label')}
          unit="L/kg"
          value={grainAbsorptionLPerKg}
          step={0.01}
          onChange={setGrainAbsorptionLPerKg}
          helperText={t('waterVolumes.grainAbsorption.helperText')}
        />
        <NumberField
          label={t('waterVolumes.boilTime.label')}
          unit="min"
          value={boilTimeMinutes}
          step={5}
          onChange={setBoilTimeMinutes}
        />
        <NumberField
          label={t('waterVolumes.boilOffRate.label')}
          unit="L/hr"
          value={boilOffRateLPerHour}
          step={0.5}
          onChange={setBoilOffRateLPerHour}
          helperText={t('waterVolumes.boilOffRate.helperText')}
        />
        <NumberField
          label={t('waterVolumes.postBoilLoss.label')}
          unit="L"
          value={postBoilLossL}
          step={0.5}
          onChange={setPostBoilLossL}
          helperText={t('waterVolumes.postBoilLoss.helperText')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResultCard title={t('waterVolumes.result.mashWater')} value={roundForDisplay(result.mashWaterL, 1).toString()} unit="L" />
        <ResultCard
          title={t('waterVolumes.result.spargeWater')}
          value={roundForDisplay(result.spargeWaterL, 1).toString()}
          unit="L"
          tone={result.spargeVolumeClamped ? 'warning' : 'default'}
        />
        <ResultCard title={t('waterVolumes.result.preBoilVolume')} value={roundForDisplay(result.preBoilVolumeL, 1).toString()} unit="L" />
        <ResultCard title={t('waterVolumes.result.totalWaterNeeded')} value={roundForDisplay(result.totalWaterL, 1).toString()} unit="L" />
      </div>

      {result.notes.length > 0 ? (
        <ul className="flex flex-col gap-1 text-xs text-amber-800">
          {result.notes.map((note, i) => (
            <li key={i}>* {note}</li>
          ))}
        </ul>
      ) : null}

      <StrikeTemperatureMixCalculator />
    </section>
  );
}
