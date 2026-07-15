/**
 * build-ingredients.mjs — assemble the raw-material catalogue for /ingredients.
 *
 * Hops: real data from kasperg3/HopDatabase (MIT), vendored at
 * data/reference/hopdatabase.json — covers Yakima Chief, Hopsteiner, Barth
 * Haas, Crosby. Malts + yeasts: curated representative ranges for the named
 * suppliers. Specs are typical planning values — always verify against the
 * supplier's current spec sheet / COA.
 *
 * Usage: node scripts/build-ingredients.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = join(ROOT, 'public/data');
const OUT = join(OUT_DIR, 'ingredients.json');

// ---- HOPS: real data -------------------------------------------------------
const rawHops = JSON.parse(readFileSync(join(ROOT, 'data/reference/hopdatabase.json'), 'utf8'));
const hops = rawHops.map((h) => ({
  type: 'hop',
  name: h.name,
  supplier: h.source ?? 'Various',
  country: h.country ?? null,
  alphaLow: h.alpha_from ?? null,
  alphaHigh: h.alpha_to ?? null,
  betaLow: h.beta_from ?? null,
  betaHigh: h.beta_to ?? null,
  notes: Array.isArray(h.notes) ? h.notes.join(', ') : null,
}));

// ---- MALTS: curated representative ranges ---------------------------------
// [name, colorLovibond, potentialSg, category]
const M = (supplier, rows) => rows.map(([name, colorLovibond, potentialSg, category]) => ({ type: 'malt', supplier, name, colorLovibond, potentialSg, category }));
const malts = [
  ...M('Weyermann', [
    ['Pilsner', 1.8, 1.037, 'base'], ['Pale Ale', 3.5, 1.037, 'base'], ['Vienna', 3.8, 1.036, 'base'],
    ['Munich Type I', 7, 1.036, 'base'], ['Munich Type II', 9.5, 1.035, 'base'], ['Wheat Malt Pale', 2, 1.038, 'base'],
    ['CaraHell', 11, 1.033, 'crystal'], ['CaraMunich Type II', 46, 1.033, 'crystal'], ['CaraAroma', 130, 1.033, 'crystal'],
    ['Melanoidin', 30, 1.033, 'specialty'], ['Carafa Type II', 425, 1.03, 'roast'], ['Carafa Type III', 535, 1.03, 'roast'],
    ['Chocolate Rye', 250, 1.03, 'roast'], ['Acidulated', 3, 1.027, 'specialty'],
  ]),
  ...M('Castle Malting (Château)', [
    ['Pilsen 2RS', 1.6, 1.037, 'base'], ['Pale Ale', 3, 1.037, 'base'], ['Vienna', 3, 1.036, 'base'],
    ['Munich Light', 6, 1.036, 'base'], ['Wheat Blanc', 2, 1.038, 'base'], ['Cara Blond', 9, 1.034, 'crystal'],
    ['Cara Gold', 12, 1.034, 'crystal'], ['Cara Ruby', 20, 1.033, 'crystal'], ['Special B', 115, 1.03, 'crystal'],
    ['Biscuit', 25, 1.035, 'specialty'], ['Chocolate', 340, 1.03, 'roast'], ['Black', 525, 1.03, 'roast'],
    ['Abbey', 17, 1.035, 'specialty'], ['Aromatic', 20, 1.035, 'specialty'],
  ]),
  ...M('BestMalz', [
    ['Pilsen', 1.7, 1.037, 'base'], ['Heidelberg', 4, 1.037, 'base'], ['Vienna', 3.5, 1.036, 'base'],
    ['Munich Light', 6.5, 1.036, 'base'], ['Munich Dark', 9, 1.035, 'base'], ['Wheat', 2, 1.038, 'base'],
    ['Red X', 12, 1.035, 'specialty'], ['Caramel Light', 9, 1.034, 'crystal'], ['Caramel Munich III', 57, 1.033, 'crystal'],
    ['Caramel Aromatic', 80, 1.033, 'crystal'], ['Chocolate', 340, 1.03, 'roast'], ['Roasted Barley', 300, 1.028, 'roast'],
    ['Acidulated', 3, 1.027, 'specialty'],
  ]),
  ...M('Soufflet', [
    ['Pilsen', 1.7, 1.037, 'base'], ['Pale Ale', 3.2, 1.037, 'base'], ['Vienna', 3.6, 1.036, 'base'],
    ['Munich', 7, 1.036, 'base'], ['Wheat', 2, 1.038, 'base'], ['Aromatic', 20, 1.035, 'specialty'],
    ['Cara Blond', 10, 1.034, 'crystal'], ['Cara Amber', 25, 1.033, 'crystal'], ['Chocolate', 340, 1.03, 'roast'],
  ]),
  ...M('Ireks', [
    ['Pilsner', 1.8, 1.037, 'base'], ['Pale Ale', 3.5, 1.037, 'base'], ['Vienna', 3.8, 1.036, 'base'],
    ['Munich', 7.5, 1.036, 'base'], ['Wheat', 2, 1.038, 'base'], ['Caramel Light', 10, 1.034, 'crystal'],
    ['Caramel Dark', 55, 1.033, 'crystal'], ['Chocolate', 350, 1.03, 'roast'],
  ]),
  ...M('Barmalt (India)', [
    ['Lager / Pilsner', 1.8, 1.037, 'base'], ['Pale Ale', 3.5, 1.037, 'base'], ['Munich', 7, 1.036, 'base'],
    ['Wheat Malt', 2, 1.038, 'base'], ['Vienna', 3.8, 1.036, 'base'], ['Crystal / Caramel', 40, 1.033, 'crystal'],
    ['Amber', 22, 1.034, 'crystal'], ['Chocolate', 350, 1.03, 'roast'], ['Roasted Barley', 300, 1.028, 'roast'],
  ]),
];

// ---- YEASTS: curated representative specs ---------------------------------
// [name, type, attenLow, attenHigh, tempMinC, tempMaxC, flocculation, notes]
const Y = (supplier, rows) => rows.map(([name, kind, attenLow, attenHigh, tempMinC, tempMaxC, flocculation, notes]) =>
  ({ type: 'yeast', supplier, name, yeastType: kind, attenLow, attenHigh, tempMinC, tempMaxC, flocculation, notes }));
const yeasts = [
  ...Y('Fermentis', [
    ['SafAle US-05', 'ale', 78, 82, 15, 24, 'medium', 'Clean American ale, neutral'],
    ['SafAle S-04', 'ale', 72, 78, 15, 24, 'high', 'English ale, fast, clean'],
    ['SafAle S-33', 'ale', 68, 72, 15, 24, 'medium', 'Fruity, low attenuation'],
    ['SafAle T-58', 'ale', 70, 74, 15, 24, 'high', 'Spicy/estery, Belgian/saison'],
    ['SafAle K-97', 'ale', 80, 84, 15, 24, 'low', 'Hefeweizen/altbier, forms krausen'],
    ['SafAle BE-134', 'ale', 88, 92, 18, 28, 'low', 'Saison, very high attenuation'],
    ['SafAle BE-256', 'ale', 82, 86, 15, 25, 'high', 'Abbey/Belgian, fast'],
    ['SafAle WB-06', 'ale', 84, 88, 15, 24, 'low', 'Wheat/witbier, phenolic'],
    ['SafLager W-34/70', 'lager', 80, 84, 12, 18, 'high', 'Classic German lager'],
    ['SafLager S-23', 'lager', 80, 84, 12, 18, 'high', 'Estery West-European lager'],
    ['SafLager S-189', 'lager', 80, 84, 12, 15, 'high', 'Swiss lager, clean'],
  ]),
  ...Y('Lallemand (LalBrew)', [
    ['Nottingham', 'ale', 77, 82, 14, 21, 'high', 'Neutral English ale, versatile'],
    ['Windsor', 'ale', 68, 72, 15, 22, 'low', 'Fruity English, low attenuation'],
    ['London ESB', 'ale', 70, 75, 18, 21, 'high', 'Malty English ale'],
    ['BRY-97', 'ale', 78, 82, 15, 22, 'high', 'West Coast, clean'],
    ['Verdant IPA', 'ale', 75, 82, 18, 23, 'medium', 'Hazy/NEIPA, soft, fruity'],
    ['New England', 'ale', 76, 82, 15, 22, 'medium', 'Juicy hazy ester profile'],
    ['Köln', 'ale', 78, 82, 12, 20, 'high', 'Kölsch, crisp'],
    ['Munich Classic', 'ale', 75, 80, 17, 22, 'low', 'Hefeweizen, banana/clove'],
    ['Belle Saison', 'ale', 85, 92, 18, 26, 'low', 'Saison, very dry'],
    ['Abbaye', 'ale', 82, 86, 17, 25, 'medium', 'Belgian abbey'],
    ['Voss Kveik', 'ale', 77, 82, 25, 40, 'high', 'Kveik, hot ferment, orange'],
    ['Wit', 'ale', 78, 84, 17, 22, 'low', 'Witbier, spicy'],
    ['Diamond Lager', 'lager', 77, 83, 10, 15, 'high', 'Clean German-style lager'],
    ['NovaLager', 'lager', 78, 84, 12, 18, 'high', 'Lager flavour at ale temps'],
  ]),
  ...Y('WHC Lab', [
    ['Saturated', 'ale', 75, 82, 18, 23, 'low', 'Hazy/NEIPA, biotransformation'],
    ['Kölsch Kid', 'ale', 78, 82, 14, 20, 'high', 'Kölsch, clean crisp'],
    ['Loki', 'ale', 78, 85, 22, 38, 'high', 'Kveik, fast warm ferment'],
    ['Vermont', 'ale', 74, 80, 18, 22, 'medium', 'Classic hazy IPA strain'],
    ['West Coast', 'ale', 78, 82, 18, 22, 'high', 'Clean, dry, hop-forward'],
    ['Dry Hop', 'ale', 76, 82, 18, 22, 'medium', 'Hazy, dry-hop friendly'],
    ['Lager Lab', 'lager', 78, 84, 10, 15, 'high', 'Clean lager'],
  ]),
];

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      attribution: {
        hops: 'Hop data from kasperg3/HopDatabase (MIT), aggregating Yakima Chief, Hopsteiner, Barth Haas and Crosby catalogues.',
        maltsYeasts: 'Malt and yeast specs are typical planning values curated per supplier. Always verify against the current supplier spec sheet or COA.',
      },
      counts: { hops: hops.length, malts: malts.length, yeasts: yeasts.length },
      hops,
      malts,
      yeasts,
    },
    null,
    2,
  ),
);
console.log(`[ingredients] ${hops.length} hops, ${malts.length} malts, ${yeasts.length} yeasts -> ${OUT.replace(ROOT, '')}`);
