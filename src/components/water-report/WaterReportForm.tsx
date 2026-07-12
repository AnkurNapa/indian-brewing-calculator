'use client';

import { useState } from 'react';
import { IonProfile, calculateResidualAlkalinity } from '@/lib/waterChemistry';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { SOURCE_WATER_PROFILES } from '@/lib/waterProfiles';
import { roundForDisplay } from '@/lib/units';

interface WaterReportFormProps {
  profile: IonProfile;
  onChange: (profile: IonProfile) => void;
  title?: string;
}

const ION_FIELDS: { key: keyof IonProfile; label: string }[] = [
  { key: 'calcium', label: 'Calcium (Ca)' },
  { key: 'magnesium', label: 'Magnesium (Mg)' },
  { key: 'sodium', label: 'Sodium (Na)' },
  { key: 'sulfate', label: 'Sulfate (SO4)' },
  { key: 'chloride', label: 'Chloride (Cl)' },
  { key: 'bicarbonate', label: 'Bicarbonate (HCO3)' },
  { key: 'alkalinity', label: 'Total Alkalinity (as CaCO3)' },
];

export function WaterReportForm({ profile, onChange, title = 'Source Water Report' }: WaterReportFormProps) {
  const ra = calculateResidualAlkalinity(profile);
  const [selectedPresetId, setSelectedPresetId] = useState('');

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        <SearchableSelect
          label="Quick-fill from a known water type"
          placeholder="Choose a preset..."
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
        {ION_FIELDS.map(({ key, label }) => (
          <NumberField
            key={key}
            label={label}
            unit="mg/L"
            value={profile[key]}
            onChange={(value) => onChange({ ...profile, [key]: value })}
          />
        ))}
      </div>

      <ResultCard
        title="Residual Alkalinity"
        value={roundForDisplay(ra).toString()}
        unit="mg/L as CaCO3"
        tone={ra > 100 ? 'warning' : 'default'}
      >
        RA = Alkalinity - (Ca/1.4 + Mg/1.7). Higher RA pushes mash pH up; very low or
        negative RA (e.g. RO water) allows dark malt acidity to dominate.
      </ResultCard>
    </section>
  );
}
