'use client';

import { useState } from 'react';
import { IonProfile, calculateResidualAlkalinity } from '@/lib/waterChemistry';
import { recommendSpargeAcidification } from '@/lib/spargeAdjustment';
import { ACID_TYPES } from '@/lib/acidAdditions';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { TutorialCallout } from '@/components/ui/TutorialCallout';

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

      <TutorialCallout
        title="How to use Sparge Water Adjustment"
        steps={[
          {
            lead: '1. Enter your sparge volume.',
            body: 'Use 0 for brew-in-a-bag or no-sparge brewing -- the recommendation adapts automatically.',
          },
          {
            lead: '2. Pick an acid type.',
            body: 'High-alkalinity sparge water can extract tannins from the grain husk late in lautering; acidifying it prevents that.',
          },
          {
            lead: '3. Follow the Recommendation card.',
            body: 'Green means your sparge water is already safe as-is; amber means it flags how much acid to add before you sparge.',
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Sparge Volume"
          unit="L"
          value={spargeVolumeL}
          step={1}
          onChange={onSpargeVolumeChange}
          helperText="Enter 0 for brew-in-a-bag / no-sparge brewing."
        />
        <SearchableSelect
          label="Acid Type"
          value={acidId}
          onChange={setAcidId}
          options={ACID_TYPES.map((a) => ({ id: a.id, label: a.name }))}
        />
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
