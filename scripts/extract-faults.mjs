/**
 * extract-faults.mjs — one-time generator for the Beer Faults reference.
 *
 * Parses "The Complete Beer Fault Guide" (© Thomas Barnes, 2011-2013,
 * reprintable for personal/non-profit use) into structured JSON for the
 * /faults page. Attribution + licence are carried in the output and MUST be
 * shown on the page.
 *
 * Usage: node scripts/extract-faults.mjs [path-to-guide.md]
 * Default source: the vault copy under Beer/Off-Flavor/.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = process.argv[2] ?? join(homedir(), 'Documents/obsidian/Beer/Off-Flavor/Complete Beer Fault Guide.md');
const OUT_DIR = join(ROOT, 'public/data');
const OUT = join(OUT_DIR, 'faults.json');

const raw = readFileSync(SRC, 'utf8');
// Drop YAML frontmatter.
const body = raw.replace(/^---[\s\S]*?---\n/, '');

// Split into "## " sections; the first chunk is the title/intro before any.
const chunks = body.split(/\n## /).slice(1);

const pick = (fields, needle) => {
  const key = Object.keys(fields).find((k) => k.toLowerCase().includes(needle));
  return key ? fields[key] : undefined;
};

const faults = [];
for (const chunk of chunks) {
  const nl = chunk.indexOf('\n');
  const name = chunk.slice(0, nl === -1 ? undefined : nl).trim();
  const rest = nl === -1 ? '' : chunk.slice(nl + 1);

  // Each field is a paragraph beginning with **Label:**.
  const fields = {};
  for (const para of rest.split(/\n\n+/)) {
    const m = para.match(/^\*\*(.+?):\*\*\s*([\s\S]*)$/);
    if (m) fields[m[1].trim()] = m[2].trim().replace(/\s+/g, ' ');
  }

  // Keep only real fault entries (they always describe how they're detected).
  if (!fields['Detected In'] && !fields['Described As']) continue;

  faults.push({
    name,
    detectedIn: fields['Detected In'] ?? null,
    describedAs: fields['Described As'] ?? null,
    origins: fields['Typical Origins'] ?? null,
    threshold: fields['Perception Threshold'] ?? null,
    discussion: fields['Discussion'] ?? null,
    increasedBy: pick(fields, 'increased by') ?? null,
    control: pick(fields, 'avoid or control') ?? null,
    appropriate: pick(fields, 'appropriate') ?? null,
  });
}

faults.sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      attribution: {
        title: 'The Complete Beer Fault Guide',
        author: 'Thomas Barnes',
        copyright: '© Thomas Barnes, 2011-2013',
        licence: 'Reprinted for non-profit use, with permission granted in the guide.',
        note: 'Compiled from multiple sources, notably George Fix, Principles of Brewing Science (2nd ed.).',
      },
      count: faults.length,
      faults,
    },
    null,
    2,
  ),
);
console.log(`[faults] extracted ${faults.length} faults -> ${OUT.replace(ROOT, '')}`);
console.log('sample:', faults[0]?.name, '|', (faults[0]?.describedAs ?? '').slice(0, 60));
