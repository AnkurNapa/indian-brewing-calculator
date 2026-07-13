'use client';

import { IonProfile } from '@/lib/waterChemistry';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

interface TargetStyleReferenceProps {
  targetStyleId: string;
  onTargetStyleChange: (id: string) => void;
  sourceProfile: IonProfile;
}

const ION_ROW_KEYS: { key: keyof IonProfile; labelKey: TranslationKey }[] = [
  { key: 'calcium', labelKey: 'targetStyleReference.ion.calcium' },
  { key: 'magnesium', labelKey: 'targetStyleReference.ion.magnesium' },
  { key: 'sodium', labelKey: 'targetStyleReference.ion.sodium' },
  { key: 'sulfate', labelKey: 'targetStyleReference.ion.sulfate' },
  { key: 'chloride', labelKey: 'targetStyleReference.ion.chloride' },
  { key: 'bicarbonate', labelKey: 'targetStyleReference.ion.bicarbonate' },
  { key: 'alkalinity', labelKey: 'targetStyleReference.ion.alkalinity' },
];

/** Within this +/- percent of target counts as "on target" rather than over/under. */
const ON_TARGET_TOLERANCE_PERCENT = 15;

type Comparison =
  | { tone: 'onTarget' }
  | { tone: 'over'; kind: 'plusValue'; value: number }
  | { tone: 'over'; kind: 'percent'; value: number }
  | { tone: 'under'; kind: 'percent'; value: number };

function compareToTarget(source: number, target: number): Comparison {
  if (target <= 0) {
    return source <= 0
      ? { tone: 'onTarget' }
      : { tone: 'over', kind: 'plusValue', value: roundForDisplay(source, 0) };
  }
  const percentOff = ((source - target) / target) * 100;
  if (Math.abs(percentOff) <= ON_TARGET_TOLERANCE_PERCENT) {
    return { tone: 'onTarget' };
  }
  return percentOff > 0
    ? { tone: 'over', kind: 'percent', value: roundForDisplay(percentOff, 0) }
    : { tone: 'under', kind: 'percent', value: roundForDisplay(Math.abs(percentOff), 0) };
}

/**
 * Lets the brewer pick which beer style they're brewing right from Water
 * Report -- before this, the style choice only lived on Mash Adjustment,
 * so there was no way to see a matching water target while still looking
 * at the source water itself. Picking a style here writes the same
 * shared targetStyleId used by Mash Adjustment's salt-addition solver, so
 * choosing it early doesn't create a second, disconnected setting.
 */
export function TargetStyleReference({ targetStyleId, onTargetStyleChange, sourceProfile }: TargetStyleReferenceProps) {
  const { t } = useLanguage();
  const style = TARGET_STYLE_PROFILES.find((s) => s.id === targetStyleId) ?? TARGET_STYLE_PROFILES[0];

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
        {t('targetStyleReference.heading')}
      </h3>
      <p className="mt-1 font-body text-xs text-ink/70">{t('targetStyleReference.description')}</p>
      <div className="mt-3">
        <SearchableSelect
          label={t('targetStyleReference.picker.label')}
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
              <th className="py-1 pr-2">{t('targetStyleReference.table.ion')}</th>
              <th className="py-1 pr-2">{t('targetStyleReference.table.yourSource')}</th>
              <th className="py-1 pr-2">
                {style.name.split(' (')[0]} {t('targetStyleReference.table.target')}
              </th>
              <th className="py-1">{t('targetStyleReference.table.vsTarget')}</th>
            </tr>
          </thead>
          <tbody>
            {ION_ROW_KEYS.map(({ key, labelKey }) => {
              const comparison = compareToTarget(sourceProfile[key], style.profile[key]);
              const label =
                comparison.tone === 'onTarget'
                  ? t('targetStyleReference.compare.onTarget')
                  : comparison.kind === 'plusValue'
                    ? t('targetStyleReference.compare.plusValue', { value: comparison.value })
                    : comparison.tone === 'over'
                      ? t('targetStyleReference.compare.percentOver', { percent: comparison.value })
                      : t('targetStyleReference.compare.percentUnder', { percent: comparison.value });
              return (
                <tr key={key} className="border-b border-teal-100">
                  <td className="py-1 pr-2">{t(labelKey)}</td>
                  <td className="py-1 pr-2">{roundForDisplay(sourceProfile[key])}</td>
                  <td className="py-1 pr-2 font-semibold text-teal-800">{roundForDisplay(style.profile[key])}</td>
                  <td
                    className={`py-1 text-xs font-semibold ${
                      comparison.tone === 'onTarget'
                        ? 'text-teal-700'
                        : comparison.tone === 'over'
                          ? 'text-red-700'
                          : 'text-amber-700'
                    }`}
                  >
                    {comparison.tone === 'onTarget' ? '✓ ' : comparison.tone === 'over' ? '↑ ' : '↓ '}
                    {label}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
