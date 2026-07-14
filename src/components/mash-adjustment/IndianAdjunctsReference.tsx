'use client';

import { INDIAN_ADJUNCTS, IndianAdjunctKind, BrewStage } from '@/lib/indianIngredients';
import { SectionCard } from '@/components/ui/SectionCard';
import { FermenterIcon } from '@/components/ui/icons';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

const KIND_KEY: Record<IndianAdjunctKind, TranslationKey> = {
  sugar: 'mashAdjustment.indianAdjuncts.kind.sugar',
  fruit: 'mashAdjustment.indianAdjuncts.kind.fruit',
  spice: 'mashAdjustment.indianAdjuncts.kind.spice',
};

const STAGE_KEY: Record<BrewStage, TranslationKey> = {
  boil: 'mashAdjustment.indianAdjuncts.stage.boil',
  whirlpool: 'mashAdjustment.indianAdjuncts.stage.whirlpool',
  fermenter: 'mashAdjustment.indianAdjuncts.stage.fermenter',
  secondary: 'mashAdjustment.indianAdjuncts.stage.secondary',
};

const KIND_BADGE: Record<IndianAdjunctKind, string> = {
  sugar: 'bg-amber-100 text-amber-800',
  fruit: 'bg-[#e08b2d]/15 text-[#c2410c]',
  spice: 'bg-teal-50 text-teal-700',
};

/**
 * Reference table of non-mash Indian adjuncts (sugars, fruits, spices)
 * with their brewing parameters: extract for OG planning, dosing rate,
 * when to add, and flavour. These aren't mashed, so they live here rather
 * than in the grain bill. Uses the shared SectionCard (see docs/DESIGN.md).
 */
export function IndianAdjunctsReference() {
  const { t } = useLanguage();

  return (
    <SectionCard title={t('mashAdjustment.indianAdjuncts.title')} icon={FermenterIcon} tone="teal">
      <p className="font-body text-xs text-ink/70">{t('mashAdjustment.indianAdjuncts.intro')}</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-teal-200 text-xs uppercase tracking-wide text-teal-700">
              <th className="py-1 pr-3">{t('mashAdjustment.indianAdjuncts.col.ingredient')}</th>
              <th className="py-1 pr-3">{t('mashAdjustment.indianAdjuncts.col.extract')}</th>
              <th className="py-1 pr-3">{t('mashAdjustment.indianAdjuncts.col.rate')}</th>
              <th className="py-1 pr-3">{t('mashAdjustment.indianAdjuncts.col.stage')}</th>
              <th className="py-1">{t('mashAdjustment.indianAdjuncts.col.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {INDIAN_ADJUNCTS.map((a) => (
              <tr key={a.id} className="border-b border-teal-100 align-top">
                <td className="py-1.5 pr-3">
                  <span className="font-semibold text-ink">{a.name}</span>
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase ${KIND_BADGE[a.kind]}`}>
                    {t(KIND_KEY[a.kind])}
                  </span>
                </td>
                <td className="py-1.5 pr-3 whitespace-nowrap">
                  {a.fermentable && a.potentialSg
                    ? `${roundForDisplay(a.potentialSg, 3)}`
                    : <span className="text-ink/40">{t('mashAdjustment.indianAdjuncts.noExtract')}</span>}
                </td>
                <td className="py-1.5 pr-3 whitespace-nowrap">
                  ~{roundForDisplay(a.typicalRateGPerL, a.typicalRateGPerL < 1 ? 2 : 1)} g/L
                </td>
                <td className="py-1.5 pr-3 whitespace-nowrap font-medium text-teal-800">{t(STAGE_KEY[a.stage])}</td>
                <td className="py-1.5 text-xs text-ink/70">{a.flavor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
