'use client';

import { IonProfile, calculateResidualAlkalinity } from '@/lib/waterChemistry';
import { StatHero } from '@/components/ui/StatHero';
import { StatTile } from '@/components/ui/StatTile';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

// Ion -> CaCO3 equivalent factors (equivalent-weight ratios to CaCO3).
const CA_TO_CACO3 = 2.497;
const MG_TO_CACO3 = 4.116;

/** SO4:Cl ratio thresholds for the crisp/balanced/malty character read. */
const HOPPY_AT = 1.5;
const MALTY_AT = 0.5;

/**
 * Water Vitals hero: turns raw source-water ions into the three numbers a
 * brewer actually decides on -- residual alkalinity (drives mash pH),
 * total hardness, and the sulfate:chloride ratio (the crisp-vs-round
 * flavour lever) -- plus alkalinity. Built from the shared StatHero /
 * StatTile primitives (see docs/DESIGN.md).
 */
export function WaterVitals({ profile }: { profile: IonProfile }) {
  const { t } = useLanguage();

  const ra = calculateResidualAlkalinity(profile);
  const hardness = profile.calcium * CA_TO_CACO3 + profile.magnesium * MG_TO_CACO3;
  const so4 = profile.sulfate;
  const cl = profile.chloride;

  const hasWater =
    profile.calcium > 0 ||
    profile.magnesium > 0 ||
    profile.sulfate > 0 ||
    profile.chloride > 0 ||
    profile.bicarbonate > 0 ||
    profile.alkalinity > 0;

  let ratioValue = '--';
  let ratioHint = '';
  if (cl > 0) {
    const ratio = so4 / cl;
    ratioValue = roundForDisplay(ratio, 2).toString();
    ratioHint = ratio >= HOPPY_AT ? t('waterVitals.hoppy') : ratio <= MALTY_AT ? t('waterVitals.malty') : t('waterVitals.balanced');
  } else if (so4 > 0) {
    ratioValue = '∞';
    ratioHint = t('waterVitals.hoppy');
  }

  return (
    <StatHero
      title={t('waterVitals.title')}
      empty={!hasWater ? <p className="font-body text-sm text-ink/60">{t('waterVitals.emptyHint')}</p> : undefined}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile label={t('waterVitals.ra')} value={roundForDisplay(ra, 0).toString()} tone={ra > 100 ? 'warn' : 'default'} />
        <StatTile label={t('waterVitals.hardness')} value={roundForDisplay(hardness, 0).toString()} />
        <StatTile label={t('waterVitals.so4cl')} value={ratioValue} hint={ratioHint} />
        <StatTile label={t('waterVitals.alkalinity')} value={roundForDisplay(profile.alkalinity, 0).toString()} />
      </div>
    </StatHero>
  );
}
