'use client';

import { useEffect, useState } from 'react';
import { useWaterProfile } from '@/hooks/useWaterProfile';
import { calculateAbvAdvanced } from '@/lib/fermentation';
import { calculateIbu } from '@/lib/ibu';
import { calculateSrm } from '@/lib/srm';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { SectionCard } from '@/components/ui/SectionCard';
import stylesData from '../../../public/analytics/styles.json';

interface Dist {
  p10: number | null;
  p50: number | null;
  p90: number | null;
}
interface StyleStat {
  style: string;
  count: number;
  abv: Dist;
  ibu: Dist;
  srm: Dist;
}

/**
 * Personalised header for /analytics: reads the brewer's current recipe from
 * localStorage (client-only, so it renders nothing during static prerender)
 * and compares its computed ABV/IBU/SRM against the community distribution
 * for the recipe's chosen BJCP style. Hides itself when there's no recipe yet
 * or no community data for that style, so it never shows an empty shell.
 */
export function YourRecipeVsTypical() {
  const { state } = useWaterProfile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const hasRecipe = Boolean(state.recipeName) || state.grainBill.length > 0;
  if (!hasRecipe) return null;

  const styleName = BJCP_STYLES.find((s) => s.id === state.bjcpStyleId)?.name ?? '';
  const match = (stylesData as StyleStat[]).find((r) => r.style.toLowerCase() === styleName.toLowerCase());
  if (!match) return null;

  const abv = calculateAbvAdvanced(state.ogSg, state.fgSg);
  const ibu = calculateIbu(state.hopAdditions, state.wortGravitySg, state.batchVolumeL, state.ibuFormula, state.garetzExtras).totalIbu;
  const srm = calculateSrm(state.grainBill, state.batchVolumeL);

  const rows: { label: string; you: number; dist: Dist; unit: string; dp: number }[] = [
    { label: 'ABV', you: abv, dist: match.abv, unit: '%', dp: 1 },
    { label: 'IBU', you: ibu, dist: match.ibu, unit: '', dp: 0 },
    { label: 'SRM', you: srm, dist: match.srm, unit: '', dp: 1 },
  ];

  const title = state.recipeName ? `${state.recipeName} vs typical ${match.style}` : `Your recipe vs typical ${match.style}`;

  return (
    <SectionCard title={title} tone="teal">
      <p className="mb-3 text-xs text-ink/60">Your current recipe against {match.count} recipes in this style.</p>
      <div className="flex flex-col">
        {rows.map((r) => {
          const you = r.you.toFixed(r.dp);
          const inBand = r.dist.p10 != null && r.dist.p90 != null && r.you >= r.dist.p10 && r.you <= r.dist.p90;
          return (
            <div key={r.label} className="flex items-center justify-between gap-2 border-b border-amber-100 py-2 first:pt-0 last:border-0 last:pb-0">
              <span className="font-body text-sm font-semibold text-ink">{r.label}</span>
              <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-0.5 font-body text-sm">
                <span className="font-display font-bold text-amber-900">
                  {you}
                  {r.unit}
                </span>
                <span className="text-ink/40">
                  vs {r.dist.p50 ?? '-'}
                  {r.unit}
                </span>
                <span className="text-[0.7rem] text-ink/30">
                  ({r.dist.p10 ?? '-'}-{r.dist.p90 ?? '-'})
                </span>
                {r.you > 0 ? (
                  <span
                    className={`rounded-full px-2 py-0.5 font-body text-[0.6rem] font-semibold ${
                      inBand ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' : 'bg-[#e08b2d]/10 text-[#c2410c] ring-1 ring-[#e08b2d]/30'
                    }`}
                  >
                    {inBand ? 'typical' : 'outlier'}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
