/**
 * extract-bjcp2015.mjs — one-time generator.
 *
 * Reads the official BJCP 2015 styleguide JSON and emits a lean, build-only
 * style reference (`data/reference/bjcp2015-styles.json`) containing ONLY the
 * numeric vital-stat ranges per sub-style. We deliberately drop the prose
 * (impression/aroma/flavor/…): the numeric ranges are uncopyrightable facts
 * and are all the analytics style-inference needs; the descriptions are the
 * copyrighted part and would bloat the repo.
 *
 * Usage:
 *   node scripts/extract-bjcp2015.mjs [path-to-styleguide-2015.json]
 * Default source: ~/Downloads/styleguide-2015.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = process.argv[2] ?? join(homedir(), 'Downloads/styleguide-2015.json');
const OUT_DIR = join(ROOT, 'data/reference');
const OUT = join(OUT_DIR, 'bjcp2015-styles.json');

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const range = (r) => {
  // A stat is usable only if it has concrete low+high (flexible styles omit them).
  if (!r) return null;
  const min = Number(r.low);
  const max = Number(r.high);
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
};

const data = JSON.parse(readFileSync(SRC, 'utf8'));
const beer = data.styleguide.class.find((c) => c.type === 'beer');
if (!beer) throw new Error('No beer class found in styleguide');

const styles = [];
let skipped = 0;
for (const category of asArray(beer.category)) {
  for (const sub of asArray(category.subcategory)) {
    const s = sub.stats ?? {};
    const og = range(s.og);
    const fg = range(s.fg);
    const ibu = range(s.ibu);
    const srm = range(s.srm);
    const abvPercent = range(s.abv);
    // Need all five to participate in nearest-style inference.
    if (!og || !fg || !ibu || !srm || !abvPercent) {
      skipped++;
      continue;
    }
    styles.push({
      id: String(sub.id ?? '').toLowerCase(), // e.g. "1a"
      name: sub.name,
      category: category.name,
      og,
      fg,
      ibu,
      srm,
      abvPercent,
    });
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(styles, null, 2));
console.log(`[bjcp2015] extracted ${styles.length} styles with full numeric ranges (skipped ${skipped} flexible/specialty)`);
console.log('sample:', JSON.stringify(styles[0]));
console.log(`wrote ${OUT.replace(ROOT, '')}`);
