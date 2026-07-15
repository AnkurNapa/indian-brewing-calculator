/**
 * build-ingredients.mjs — assemble the raw-material catalogue for /ingredients.
 *
 * Sources (all vendored in data/reference/):
 *  - hops.csv / fermentables.csv / yeasts.csv — comprehensive reference lists.
 *  - hopdatabase.json (kasperg3/HopDatabase, MIT) — real alpha-acid + supplier
 *    data, merged onto the hop list by name.
 *  - a small curated supplier-malt set with colour/potential specs.
 *
 * We deliberately keep only supplier/lab, origin and spec fields. No brewery
 * names. Malt/yeast numeric specs are typical planning values — verify against
 * the supplier's current spec sheet / COA.
 */
import { parse as parseCsv } from 'csv-parse/sync';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REF = join(ROOT, 'data/reference');
const OUT_DIR = join(ROOT, 'public/data');
const OUT = join(OUT_DIR, 'ingredients.json');

const readCsv = (f) => parseCsv(readFileSync(join(REF, f), 'utf8'), { columns: true, delimiter: ';', skip_empty_lines: true, relax_quotes: true, relax_column_count: true });
const num = (v) => { const n = Number(v); return Number.isFinite(n) && v !== '' ? n : null; };
const clean = (s) => (s && String(s).trim() ? String(s).trim() : null);

// ---- HOPS: reference list + alpha/supplier from HopDatabase ---------------
const hopDb = JSON.parse(readFileSync(join(REF, 'hopdatabase.json'), 'utf8'));
const hopSpec = new Map();
for (const h of hopDb) {
  hopSpec.set(h.name.toLowerCase(), { alphaLow: h.alpha_from ?? null, alphaHigh: h.alpha_to ?? null, supplier: h.source ?? null });
}
const hops = readCsv('hops.csv').map((r) => {
  const spec = hopSpec.get((r.name ?? '').toLowerCase());
  return {
    type: 'hop',
    name: r.name,
    supplier: spec?.supplier ?? clean(r.origin) ?? 'Various',
    origin: clean(r.origin),
    use: clean(r.use),
    alphaLow: spec?.alphaLow ?? null,
    alphaHigh: spec?.alphaHigh ?? null,
    aromas: clean(r.aromas),
    substitutes: clean(r.substitutes),
    altNames: clean(r.alt_names),
  };
});

// ---- MALTS: reference fermentables + curated supplier specs ---------------
// Rough colour (°L) by malt type when the reference list has no spec.
const TYPE_COLOR = { base: 2.5, kilned: 5, toasted: 25, crystal: 45, caramel: 45, roasted: 400, roast: 400, smoked: 4, acidulated: 3, dextrine: 2, wheat: 2, rye: 4, adjunct: 2, sugar: 0, other: 8 };
const M = (supplier, rows) => rows.map(([name, colorLovibond, potentialSg, category]) => ({ type: 'malt', supplier, name, colorLovibond, potentialSg, category, altNames: null }));
const curatedMalts = [
  ...M('Weyermann', [['Pilsner', 1.8, 1.037, 'base'], ['Pale Ale', 3.5, 1.037, 'base'], ['Vienna', 3.8, 1.036, 'base'], ['Munich Type I', 7, 1.036, 'base'], ['Munich Type II', 9.5, 1.035, 'base'], ['CaraHell', 11, 1.033, 'crystal'], ['CaraMunich Type II', 46, 1.033, 'crystal'], ['Carafa Type II', 425, 1.03, 'roast'], ['Melanoidin', 30, 1.033, 'specialty'], ['Acidulated', 3, 1.027, 'specialty']]),
  ...M('Castle Malting (Château)', [['Pilsen 2RS', 1.6, 1.037, 'base'], ['Pale Ale', 3, 1.037, 'base'], ['Munich Light', 6, 1.036, 'base'], ['Cara Gold', 12, 1.034, 'crystal'], ['Special B', 115, 1.03, 'crystal'], ['Chocolate', 340, 1.03, 'roast'], ['Biscuit', 25, 1.035, 'specialty']]),
  ...M('BestMalz', [['Pilsen', 1.7, 1.037, 'base'], ['Vienna', 3.5, 1.036, 'base'], ['Munich Dark', 9, 1.035, 'base'], ['Red X', 12, 1.035, 'specialty'], ['Caramel Munich III', 57, 1.033, 'crystal'], ['Chocolate', 340, 1.03, 'roast']]),
  ...M('Soufflet', [['Pilsen', 1.7, 1.037, 'base'], ['Pale Ale', 3.2, 1.037, 'base'], ['Munich', 7, 1.036, 'base'], ['Cara Blond', 10, 1.034, 'crystal']]),
  ...M('Ireks', [['Pilsner', 1.8, 1.037, 'base'], ['Pale Ale', 3.5, 1.037, 'base'], ['Munich', 7.5, 1.036, 'base'], ['Caramel Dark', 55, 1.033, 'crystal']]),
  ...M('Barmalt (India)', [['Lager / Pilsner', 1.8, 1.037, 'base'], ['Pale Ale', 3.5, 1.037, 'base'], ['Munich', 7, 1.036, 'base'], ['Wheat Malt', 2, 1.038, 'base'], ['Crystal / Caramel', 40, 1.033, 'crystal'], ['Chocolate', 350, 1.03, 'roast']]),
];
const refMalts = readCsv('fermentables.csv').map((r) => {
  const type = (clean(r.type) ?? 'other').toLowerCase();
  return { type: 'malt', supplier: 'Reference (generic)', name: r.name, colorLovibond: TYPE_COLOR[type] ?? 8, potentialSg: null, category: clean(r.category) ?? type, altNames: clean(r.alt_names) };
});
const malts = [...curatedMalts, ...refMalts];

// ---- YEASTS: comprehensive reference list, lab as supplier ----------------
const yeasts = readCsv('yeasts.csv')
  .filter((r) => clean(r.name) && clean(r.lab))
  .map((r) => ({
    type: 'yeast',
    name: r.name,
    supplier: clean(r.lab),
    yeastType: clean(r.type) ?? 'ale',
    form: clean(r.form),
    attenPercent: num(r.attenuation),
    tempMinC: num(r.min_temperature),
    tempMaxC: num(r.max_temperature),
    flocculation: clean(r.flocculation),
    tolerancePercent: num(r.tolerance_percent),
    altNames: clean(r.alt_names),
  }));

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify({
  attribution: {
    hops: 'Hop alpha-acid and supplier data from kasperg3/HopDatabase (MIT); variety, aroma and substitution data from an open reference list.',
    maltsYeasts: 'Yeast and reference-malt data from open brewing reference lists; curated supplier-malt specs are typical planning values. Verify against the current supplier spec sheet or COA.',
  },
  counts: { hops: hops.length, malts: malts.length, yeasts: yeasts.length },
  hops, malts, yeasts,
}, null, 2));
// Tiny counts file so the welcome screen can show totals without importing
// the whole (large) catalogue into its bundle.
writeFileSync(join(OUT_DIR, 'ingredient-counts.json'), JSON.stringify({ hops: hops.length, malts: malts.length, yeasts: yeasts.length }));
console.log(`[ingredients] ${hops.length} hops, ${malts.length} malts, ${yeasts.length} yeasts -> ${OUT.replace(ROOT, '')}`);
