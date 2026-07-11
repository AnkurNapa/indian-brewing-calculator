'use client';

import { IonProfile } from '@/lib/waterChemistry';
import { blendIonProfiles } from '@/lib/blending';
import { WaterReportForm } from '@/components/water-report/WaterReportForm';
import { ResultCard } from '@/components/ui/ResultCard';
import { roundForDisplay } from '@/lib/units';

interface BlendingPanelProps {
  sourceA: IonProfile;
  sourceB: IonProfile;
  onSourceAChange: (profile: IonProfile) => void;
  onSourceBChange: (profile: IonProfile) => void;
  percentA: number;
  onPercentAChange: (value: number) => void;
}

const ION_ROWS: { key: keyof IonProfile; label: string }[] = [
  { key: 'calcium', label: 'Calcium' },
  { key: 'magnesium', label: 'Magnesium' },
  { key: 'sodium', label: 'Sodium' },
  { key: 'sulfate', label: 'Sulfate' },
  { key: 'chloride', label: 'Chloride' },
  { key: 'bicarbonate', label: 'Bicarbonate' },
  { key: 'alkalinity', label: 'Alkalinity' },
];

export function BlendingPanel({
  sourceA,
  sourceB,
  onSourceAChange,
  onSourceBChange,
  percentA,
  onPercentAChange,
}: BlendingPanelProps) {
  const blended = blendIonProfiles(sourceA, sourceB, percentA);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-bold text-ink">Water Blending</h2>

      <div className="flex flex-col gap-2">
        <label htmlFor="blend-ratio" className="font-body text-sm font-medium text-amber-900">
          Blend Ratio: {percentA}% Source A / {100 - percentA}% Source B
        </label>
        <input
          id="blend-ratio"
          type="range"
          min={0}
          max={100}
          step={1}
          value={percentA}
          onChange={(e) => onPercentAChange(Number(e.target.value))}
          className="h-11 w-full cursor-pointer accent-teal-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WaterReportForm profile={sourceA} onChange={onSourceAChange} title="Source A" />
        <WaterReportForm profile={sourceB} onChange={onSourceBChange} title="Source B" />
      </div>

      <ResultCard title="Blended Result">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/20">
                <th className="py-1 pr-2">Ion</th>
                <th className="py-1">mg/L</th>
              </tr>
            </thead>
            <tbody>
              {ION_ROWS.map(({ key, label }) => (
                <tr key={key} className="border-b border-ink/10">
                  <td className="py-1 pr-2">{label}</td>
                  <td className="py-1 font-semibold">{roundForDisplay(blended[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ResultCard>
    </section>
  );
}
