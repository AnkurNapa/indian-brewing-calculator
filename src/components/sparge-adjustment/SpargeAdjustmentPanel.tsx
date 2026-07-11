'use client';

import { useState } from 'react';
import { IonProfile, calculateResidualAlkalinity } from '@/lib/waterChemistry';
import { recommendSpargeAcidification } from '@/lib/spargeAdjustment';
import { ACID_TYPES } from '@/lib/acidAdditions';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';

interface SpargeAdjustmentPanelProps {
  sourceProfile: IonProfile;
  spargeVolumeL: number;
  onSpargeVolumeChange: (value: number) => void;
}

export function SpargeAdjustmentPanel({
  sourceProfile,
  spargeVolumeL,
  onSpargeVolumeChange,
}: SpargeAdjustmentPanelProps) {
  const [acidId, setAcidId] = useState(ACID_TYPES[0].id);
  const acid = ACID_TYPES.find((a) => a.id === acidId) ?? ACID_TYPES[0];

  const ra = calculateResidualAlkalinity(sourceProfile);
  const recommendation = recommendSpargeAcidification(ra, spargeVolumeL, acid);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Sparge Water Adjustment</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Sparge Volume"
          unit="L"
          value={spargeVolumeL}
          step={1}
          onChange={onSpargeVolumeChange}
          helperText="Enter 0 for brew-in-a-bag / no-sparge brewing."
        />
        <label className="flex flex-col gap-1">
          <span className="font-body text-sm font-medium text-amber-900">Acid Type</span>
          <select
            className="min-h-[44px] rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink"
            value={acidId}
            onChange={(e) => setAcidId(e.target.value)}
          >
            {ACID_TYPES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ResultCard
        title="Recommendation"
        tone={recommendation.needsAcid ? 'warning' : 'success'}
      >
        {recommendation.message}
      </ResultCard>
    </section>
  );
}
