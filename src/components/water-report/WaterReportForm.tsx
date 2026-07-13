'use client';

import { useState } from 'react';
import { IonProfile, calculateResidualAlkalinity } from '@/lib/waterChemistry';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { SOURCE_WATER_PROFILES } from '@/lib/waterProfiles';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

interface WaterReportFormProps {
  profile: IonProfile;
  onChange: (profile: IonProfile) => void;
  title?: string;
}

const ION_FIELD_KEYS: { key: keyof IonProfile; labelKey: TranslationKey }[] = [
  { key: 'calcium', labelKey: 'waterReportForm.ion.calcium' },
  { key: 'magnesium', labelKey: 'waterReportForm.ion.magnesium' },
  { key: 'sodium', labelKey: 'waterReportForm.ion.sodium' },
  { key: 'sulfate', labelKey: 'waterReportForm.ion.sulfate' },
  { key: 'chloride', labelKey: 'waterReportForm.ion.chloride' },
  { key: 'bicarbonate', labelKey: 'waterReportForm.ion.bicarbonate' },
  { key: 'alkalinity', labelKey: 'waterReportForm.ion.alkalinity' },
];

export function WaterReportForm({ profile, onChange, title }: WaterReportFormProps) {
  const { t } = useLanguage();
  const ra = calculateResidualAlkalinity(profile);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const resolvedTitle = title ?? t('waterReportForm.title');

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold text-ink">{resolvedTitle}</h2>
        <SearchableSelect
          label={t('waterReportForm.presetPicker.label')}
          placeholder={t('waterReportForm.presetPicker.placeholder')}
          value={selectedPresetId}
          options={SOURCE_WATER_PROFILES.map((preset) => ({ id: preset.id, label: preset.name }))}
          onChange={(id) => {
            const preset = SOURCE_WATER_PROFILES.find((p) => p.id === id);
            if (preset) {
              onChange({ ...preset.profile });
              setSelectedPresetId(id);
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ION_FIELD_KEYS.map(({ key, labelKey }) => (
          <NumberField
            key={key}
            label={t(labelKey)}
            unit="mg/L"
            value={profile[key]}
            onChange={(value) => onChange({ ...profile, [key]: value })}
          />
        ))}
      </div>

      <ResultCard
        title={t('waterReportForm.residualAlkalinity.title')}
        value={roundForDisplay(ra).toString()}
        unit="mg/L as CaCO3"
        tone={ra > 100 ? 'warning' : 'default'}
      >
        {t('waterReportForm.residualAlkalinity.explanation')}
      </ResultCard>
    </section>
  );
}
