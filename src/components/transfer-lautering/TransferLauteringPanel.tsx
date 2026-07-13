'use client';

import { useMemo, useState } from 'react';
import { GrainBillItem } from '@/lib/waterChemistry';
import { calculateTransferTimeMinutes, calculateRequiredFlowRate } from '@/lib/wortTransfer';
import { calculateGrainBedDepth, evaluateRunoffCutoff, DEFAULT_BED_VOLUME_L_PER_KG } from '@/lib/lautering';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

interface TransferLauteringPanelProps {
  grainBill: GrainBillItem[];
}

function TransferTimeCalculator() {
  const { t } = useLanguage();
  const [volumeL, setVolumeL] = useState(20);
  const [flowRateLPerMin, setFlowRateLPerMin] = useState(4);

  const timeMinutes = calculateTransferTimeMinutes(volumeL, flowRateLPerMin);
  const requiredFlowRateForTenMin = calculateRequiredFlowRate(volumeL, 10);

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
        {t('transferLautering.transferTime.heading')}
      </h3>
      <p className="mt-1 font-body text-sm text-ink">{t('transferLautering.transferTime.description')}</p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('transferLautering.transferTime.volume.label')}
          unit="L"
          value={volumeL}
          step={1}
          onChange={setVolumeL}
        />
        <NumberField
          label={t('transferLautering.transferTime.flowRate.label')}
          unit="L/min"
          value={flowRateLPerMin}
          step={0.1}
          onChange={setFlowRateLPerMin}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResultCard
          title={t('transferLautering.transferTime.result.estimatedTime')}
          value={roundForDisplay(timeMinutes, 1).toString()}
          unit="min"
        />
        <ResultCard
          title={t('transferLautering.transferTime.result.flowRateForTenMin')}
          value={roundForDisplay(requiredFlowRateForTenMin, 2).toString()}
          unit="L/min"
        />
      </div>
    </div>
  );
}

function GrainBedDepthCalculator({ totalGrainWeightKg }: { totalGrainWeightKg: number }) {
  const { t } = useLanguage();
  const [lauterTunDiameterCm, setLauterTunDiameterCm] = useState(50);
  const [bedVolumeLPerKg, setBedVolumeLPerKg] = useState(DEFAULT_BED_VOLUME_L_PER_KG);

  const result = calculateGrainBedDepth(totalGrainWeightKg, lauterTunDiameterCm, bedVolumeLPerKg);

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
        {t('transferLautering.grainBedDepth.heading')}
      </h3>
      <p className="mt-1 font-body text-sm text-ink">
        {t('transferLautering.grainBedDepth.grainWeightNote')}{' '}
        <span className="font-semibold">{totalGrainWeightKg.toFixed(2)} kg</span>
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('transferLautering.grainBedDepth.diameter.label')}
          unit="cm"
          value={lauterTunDiameterCm}
          step={1}
          onChange={setLauterTunDiameterCm}
        />
        <NumberField
          label={t('transferLautering.grainBedDepth.bedVolumeFactor.label')}
          unit="L/kg"
          value={bedVolumeLPerKg}
          step={0.05}
          onChange={setBedVolumeLPerKg}
          helperText={t('transferLautering.grainBedDepth.bedVolumeFactor.helperText')}
        />
      </div>
      <div className="mt-3">
        <ResultCard
          title={t('transferLautering.grainBedDepth.result.title')}
          value={roundForDisplay(result.bedDepthCm, 1).toString()}
          unit="cm"
          tone={result.stuckMashRisk ? 'warning' : 'default'}
        >
          {result.stuckMashRisk
            ? result.notes.join(' ')
            : t('transferLautering.grainBedDepth.result.safeRange')}
        </ResultCard>
      </div>
    </div>
  );
}

function RunoffCutoffAdvisor() {
  const { t } = useLanguage();
  const [currentRunningsSg, setCurrentRunningsSg] = useState(1.012);
  const [cutoffSg, setCutoffSg] = useState(1.008);

  const result = evaluateRunoffCutoff(currentRunningsSg, cutoffSg);

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
        {t('transferLautering.runoffCutoff.heading')}
      </h3>
      <p className="mt-1 font-body text-sm text-ink">{t('transferLautering.runoffCutoff.description')}</p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('transferLautering.runoffCutoff.currentGravity.label')}
          value={currentRunningsSg}
          step={0.001}
          onChange={setCurrentRunningsSg}
        />
        <NumberField
          label={t('transferLautering.runoffCutoff.cutoffGravity.label')}
          value={cutoffSg}
          step={0.001}
          onChange={setCutoffSg}
        />
      </div>
      <div className="mt-3">
        <ResultCard
          title={
            result.shouldContinueCollecting
              ? t('transferLautering.runoffCutoff.result.keepCollecting')
              : t('transferLautering.runoffCutoff.result.stopCollecting')
          }
          value={roundForDisplay(result.gravityPointsAboveCutoff, 1).toString()}
          unit={t('transferLautering.runoffCutoff.result.unit')}
          tone={result.shouldContinueCollecting ? 'success' : 'warning'}
        >
          {result.note}
        </ResultCard>
      </div>
    </div>
  );
}

export function TransferLauteringPanel({ grainBill }: TransferLauteringPanelProps) {
  const { t } = useLanguage();
  const totalGrainWeightKg = useMemo(
    () => grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? Math.max(0, row.weightKg) : 0), 0),
    [grainBill],
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('transferLautering.heading')}</h2>
      <p className="font-body text-sm text-amber-800">{t('transferLautering.description')}</p>
      <TutorialCallout
        title={t('transferLautering.tutorial.title')}
        steps={[
          {
            lead: t('transferLautering.tutorial.step1.lead'),
            body: t('transferLautering.tutorial.step1.body'),
          },
          {
            lead: t('transferLautering.tutorial.step2.lead'),
            body: t('transferLautering.tutorial.step2.body'),
          },
          {
            lead: t('transferLautering.tutorial.step3.lead'),
            body: t('transferLautering.tutorial.step3.body'),
          },
        ]}
      />
      <TransferTimeCalculator />
      <GrainBedDepthCalculator totalGrainWeightKg={totalGrainWeightKg} />
      <RunoffCutoffAdvisor />
    </section>
  );
}
