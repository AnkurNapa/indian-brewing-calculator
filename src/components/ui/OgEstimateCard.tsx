'use client';

import { GrainBillItem } from '@/lib/waterChemistry';
import { predictOriginalGravity } from '@/lib/efficiency';
import { NumberField } from './NumberField';
import { ResultCard } from './ResultCard';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

interface OgEstimateCardProps {
  grainBill: GrainBillItem[];
  batchVolumeL: number;
  assumedEfficiencyPercent: number;
  onAssumedEfficiencyChange: (value: number) => void;
}

/**
 * Predicts OG from the grain bill's extract potential before brew day --
 * the Brewhouse Efficiency calculator only works backward from a
 * measured gravity, which doesn't exist yet at the planning stage. This
 * answers "if I mash this grist at roughly my usual efficiency, what OG
 * should I expect for this batch size?"
 */
export function OgEstimateCard({
  grainBill,
  batchVolumeL,
  assumedEfficiencyPercent,
  onAssumedEfficiencyChange,
}: OgEstimateCardProps) {
  const { t } = useLanguage();
  const hasPotential = grainBill.some((row) => row.weightKg > 0 && (row.potentialSg ?? 0) > 1);
  const predictedOg = predictOriginalGravity(
    grainBill.map((row) => ({ name: row.name, weightKg: row.weightKg, potentialSg: row.potentialSg ?? 0 })),
    batchVolumeL,
    assumedEfficiencyPercent,
  );

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{t('sharedCalc.ogEstimate.title')}</h3>
      <p className="mt-1 font-body text-xs text-ink/70">
        {t('sharedCalc.ogEstimate.description')}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('sharedCalc.ogEstimate.assumedEfficiency')}
          unit="%"
          value={assumedEfficiencyPercent}
          step={1}
          max={100}
          onChange={onAssumedEfficiencyChange}
          helperText={t('sharedCalc.ogEstimate.assumedEfficiencyHelper')}
        />
        <ResultCard title={t('sharedCalc.ogEstimate.predictedOg')} value={hasPotential ? roundForDisplay(predictedOg, 3).toString() : '--'} unit="SG" />
      </div>
    </div>
  );
}
