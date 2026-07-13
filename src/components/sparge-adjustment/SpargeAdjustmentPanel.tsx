'use client';

import { useState } from 'react';
import { IonProfile, calculateResidualAlkalinity } from '@/lib/waterChemistry';
import { recommendSpargeAcidification } from '@/lib/spargeAdjustment';
import { ACID_TYPES } from '@/lib/acidAdditions';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { useLanguage } from '@/i18n/LanguageContext';

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
  const { t } = useLanguage();
  const [acidId, setAcidId] = useState(ACID_TYPES[0].id);
  const acid = ACID_TYPES.find((a) => a.id === acidId) ?? ACID_TYPES[0];

  const ra = calculateResidualAlkalinity(sourceProfile);
  const recommendation = recommendSpargeAcidification(ra, spargeVolumeL, acid);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('spargeAdjustment.heading')}</h2>

      <TutorialCallout
        title={t('spargeAdjustment.tutorial.title')}
        steps={[
          {
            lead: t('spargeAdjustment.tutorial.step1.lead'),
            body: t('spargeAdjustment.tutorial.step1.body'),
          },
          {
            lead: t('spargeAdjustment.tutorial.step2.lead'),
            body: t('spargeAdjustment.tutorial.step2.body'),
          },
          {
            lead: t('spargeAdjustment.tutorial.step3.lead'),
            body: t('spargeAdjustment.tutorial.step3.body'),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('spargeAdjustment.spargeVolume.label')}
          unit="L"
          value={spargeVolumeL}
          step={1}
          onChange={onSpargeVolumeChange}
          helperText={t('spargeAdjustment.spargeVolume.helperText')}
        />
        <SearchableSelect
          label={t('spargeAdjustment.acidType.label')}
          value={acidId}
          onChange={setAcidId}
          options={ACID_TYPES.map((a) => ({ id: a.id, label: a.name }))}
        />
      </div>

      <ResultCard
        title={t('spargeAdjustment.recommendation.title')}
        tone={recommendation.needsAcid ? 'warning' : 'success'}
      >
        {recommendation.message}
      </ResultCard>
    </section>
  );
}
