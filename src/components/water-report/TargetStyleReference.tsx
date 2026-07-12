'use client';

import { IonProfile } from '@/lib/waterChemistry';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { roundForDisplay } from '@/lib/units';

interface TargetStyleReferenceProps {
  targetStyleId: string;
  onTargetStyleChange: (id: string) => void;
  sourceProfile: IonProfile;
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

/**
 * Lets the brewer pick which beer style they're brewing right from Water
 * Report -- before this, the style choice only lived on Mash Adjustment,
 * so there was no way to see a matching water target while still looking
 * at the source water itself. Picking a style here writes the same
 * shared targetStyleId used by Mash Adjustment's salt-addition solver, so
 * choosing it early doesn't create a second, disconnected setting.
 */
export function TargetStyleReference({ targetStyleId, onTargetStyleChange, sourceProfile }: TargetStyleReferenceProps) {
  const style = TARGET_STYLE_PROFILES.find((s) => s.id === targetStyleId) ?? TARGET_STYLE_PROFILES[0];

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
        Which Beer Style Are You Brewing?
      </h3>
      <p className="mt-1 font-body text-xs text-ink/70">
        Pick a style to see its target water profile alongside your source water -- this also sets the target for
        Mash Adjustment&apos;s salt additions.
      </p>
      <div className="mt-3">
        <SearchableSelect
          label="Target Style Profile"
          value={targetStyleId}
          onChange={onTargetStyleChange}
          options={TARGET_STYLE_PROFILES.map((s) => ({ id: s.id, label: s.name }))}
        />
      </div>
      <p className="mt-2 font-body text-xs text-teal-800">{style.description}</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-teal-200 text-xs uppercase tracking-wide text-teal-700">
              <th className="py-1 pr-2">Ion (mg/L)</th>
              <th className="py-1 pr-2">Your Source</th>
              <th className="py-1">{style.name.split(' (')[0]} Target</th>
            </tr>
          </thead>
          <tbody>
            {ION_ROWS.map(({ key, label }) => (
              <tr key={key} className="border-b border-teal-100">
                <td className="py-1 pr-2">{label}</td>
                <td className="py-1 pr-2">{roundForDisplay(sourceProfile[key])}</td>
                <td className="py-1 font-semibold text-teal-800">{roundForDisplay(style.profile[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
