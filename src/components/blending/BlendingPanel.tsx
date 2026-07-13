'use client';

import { IonProfile } from '@/lib/waterChemistry';
import { blendIonProfiles } from '@/lib/blending';
import { WaterReportForm } from '@/components/water-report/WaterReportForm';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

interface BlendingPanelProps {
  sourceA: IonProfile;
  sourceB: IonProfile;
  onSourceAChange: (profile: IonProfile) => void;
  onSourceBChange: (profile: IonProfile) => void;
  percentA: number;
  onPercentAChange: (value: number) => void;
}

const ION_ROWS = [
  { key: 'calcium', labelKey: 'blending.ion.calcium' },
  { key: 'magnesium', labelKey: 'blending.ion.magnesium' },
  { key: 'sodium', labelKey: 'blending.ion.sodium' },
  { key: 'sulfate', labelKey: 'blending.ion.sulfate' },
  { key: 'chloride', labelKey: 'blending.ion.chloride' },
  { key: 'bicarbonate', labelKey: 'blending.ion.bicarbonate' },
  { key: 'alkalinity', labelKey: 'blending.ion.alkalinity' },
] as const satisfies { key: keyof IonProfile; labelKey: string }[];

export function BlendingPanel({
  sourceA,
  sourceB,
  onSourceAChange,
  onSourceBChange,
  percentA,
  onPercentAChange,
}: BlendingPanelProps) {
  const { t } = useLanguage();
  const blended = blendIonProfiles(sourceA, sourceB, percentA);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-bold text-ink">{t('blending.heading')}</h2>

      <TutorialCallout
        title={t('blending.tutorial.title')}
        steps={[
          {
            lead: t('blending.tutorial.step1.lead'),
            body: t('blending.tutorial.step1.body'),
          },
          {
            lead: t('blending.tutorial.step2.lead'),
            body: t('blending.tutorial.step2.body'),
          },
          {
            lead: t('blending.tutorial.step3.lead'),
            body: t('blending.tutorial.step3.body'),
          },
        ]}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="blend-ratio" className="font-body text-sm font-medium text-amber-900">
          {t('blending.ratio.label', { percentA, percentB: 100 - percentA })}
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
        <WaterReportForm profile={sourceA} onChange={onSourceAChange} title={t('blending.sourceA.title')} />
        <WaterReportForm profile={sourceB} onChange={onSourceBChange} title={t('blending.sourceB.title')} />
      </div>

      <ResultCard title={t('blending.result.title')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/20">
                <th className="py-1 pr-2">{t('blending.result.ion')}</th>
                <th className="py-1">mg/L</th>
              </tr>
            </thead>
            <tbody>
              {ION_ROWS.map(({ key, labelKey }) => (
                <tr key={key} className="border-b border-ink/10">
                  <td className="py-1 pr-2">{t(labelKey)}</td>
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
