/**
 * Bridge from this calculator's grain bill to Aroma Forge
 * (https://ankurnapa.github.io/aroma-forge/), a companion tool that predicts a
 * beer's aroma by superimposing the Weyermann Malt Aroma Wheels of the grist.
 *
 * Both apps use the Weyermann malt range but with independent id schemes, so we
 * keep an explicit map from this app's WEYERMANN_MALTS ids to Aroma Forge ids.
 * Grain-bill rows only carry the malt *name*, so we resolve name -> local id ->
 * Aroma Forge id. Rows that aren't a mapped Weyermann malt (custom grains, Indian
 * adjuncts, oat malt which has no aroma wheel) are skipped.
 *
 * Pure module, no React -- see aromaForge.test.ts for the id integrity check.
 */
import { WEYERMANN_MALTS } from './weyermannMalts';

export const AROMA_FORGE_BASE = 'https://ankurnapa.github.io/aroma-forge/';

/** This app's WEYERMANN_MALTS id -> Aroma Forge malt id. */
export const CALC_TO_AROMA_ID: Record<string, string> = {
  pilsner: 'pilsner-malt',
  'barke-pilsner': 'barke-pilsner-malt',
  'pale-ale': 'pale-ale-malt',
  vienna: 'vienna-malt',
  'munich-light': 'munich-malt-type-1',
  'munich-dark': 'munich-malt-type-2',
  'barke-munich': 'barke-munich-malt',
  melanoidin: 'melanoidin-malt',
  'rauch-beechwood': 'beech-smoked-barley-malt',
  'wheat-light': 'wheat-malt-pale',
  'wheat-dark': 'wheat-malt-dark',
  rye: 'rye-malt-pale',
  // oat: no Weyermann aroma wheel -> intentionally unmapped
  carafoam: 'carafoam',
  carahell: 'carahell',
  carared: 'carared',
  'caramunich-1': 'caramunich-type-1',
  'caramunich-2': 'caramunich-type-2',
  'caramunich-3': 'caramunich-type-3',
  caraaroma: 'caraaroma',
  abbey: 'abbey-malt',
  'carafa-1': 'carafa-special-type-1',
  'carafa-2': 'carafa-special-type-2',
  'carafa-3': 'carafa-special-type-3',
  'chocolate-wheat': 'chocolate-wheat-malt',
  'chocolate-rye': 'chocolate-rye-malt',
  'roasted-barley': 'roasted-barley',
  acidulated: 'acidulated-malt',
};

/** Malt name (as stored on a grain-bill row) -> Aroma Forge id. */
const NAME_TO_AROMA_ID: Record<string, string> = Object.fromEntries(
  WEYERMANN_MALTS.filter((m) => CALC_TO_AROMA_ID[m.id]).map((m) => [m.name, CALC_TO_AROMA_ID[m.id]]),
);

export interface AromaBridgeRow {
  name: string;
  weightKg: number;
}

export interface AromaBridgeResult {
  /** Deep link into Aroma Forge with the grist pre-loaded, or null if nothing mapped. */
  url: string | null;
  /** How many grain-bill rows mapped to a Weyermann aroma wheel. */
  mapped: number;
  /** Rows with a name and weight that could not be mapped (custom/other grains). */
  skipped: number;
}

/** Aroma Forge only speaks en/de; fall back to en for hi/mr. */
function aromaLang(lang?: string): string {
  return lang === 'de' ? 'de' : 'en';
}

export function buildAromaForgeLink(
  rows: AromaBridgeRow[],
  opts?: { volumeL?: number; efficiencyPercent?: number; lang?: string },
): AromaBridgeResult {
  const parts: string[] = [];
  let mapped = 0;
  let skipped = 0;
  for (const row of rows) {
    const name = (row.name ?? '').trim();
    const grams = Math.round((row.weightKg ?? 0) * 1000);
    if (grams <= 0 || !name) continue;
    const aromaId = NAME_TO_AROMA_ID[name];
    if (aromaId) {
      parts.push(`${aromaId}:${grams}`);
      mapped += 1;
    } else {
      skipped += 1;
    }
  }
  if (parts.length === 0) return { url: null, mapped, skipped };

  const eff = Math.round(opts?.efficiencyPercent ?? 72);
  const vol = opts?.volumeL ? Math.round(opts.volumeL) : null;
  const batch = vol ? `&b=${vol}-${eff}-78` : '';
  // `from=ibc` tells Aroma Forge it was opened from this calculator, so it can
  // show a "Back to calculator" link for a two-way round trip.
  const url = `${AROMA_FORGE_BASE}#g=${encodeURIComponent(parts.join(','))}${batch}&l=${aromaLang(opts?.lang)}&from=ibc`;
  return { url, mapped, skipped };
}
