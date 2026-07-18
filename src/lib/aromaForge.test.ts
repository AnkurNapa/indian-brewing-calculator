import { describe, expect, it } from 'vitest';

import { buildAromaForgeLink, CALC_TO_AROMA_ID, AROMA_FORGE_BASE } from './aromaForge';
import { WEYERMANN_MALTS } from './weyermannMalts';

describe('aromaForge bridge', () => {
  it('maps only real WEYERMANN_MALTS ids', () => {
    const ids = new Set(WEYERMANN_MALTS.map((m) => m.id));
    for (const calcId of Object.keys(CALC_TO_AROMA_ID)) {
      expect(ids.has(calcId), `unknown malt id ${calcId}`).toBe(true);
    }
  });

  it('builds a deep link with mapped malts as id:grams', () => {
    const rows = [
      { name: 'Weyermann Pilsner Malt', weightKg: 4 },
      { name: 'Weyermann CaraMunich I', weightKg: 0.6 },
    ];
    const res = buildAromaForgeLink(rows, { volumeL: 20, efficiencyPercent: 72, lang: 'en' });
    expect(res.mapped).toBe(2);
    expect(res.skipped).toBe(0);
    expect(res.url).toContain(AROMA_FORGE_BASE);
    expect(decodeURIComponent(res.url!)).toContain('pilsner-malt:4000');
    expect(decodeURIComponent(res.url!)).toContain('caramunich-type-1:600');
    expect(res.url).toContain('&b=20-72-78');
    expect(res.url).toContain('&l=en');
    expect(res.url).toContain('&from=ibc');
  });

  it('skips custom grains and zero-weight rows, returns null when nothing maps', () => {
    const res = buildAromaForgeLink([
      { name: 'Bangalore Six-Row', weightKg: 3 },
      { name: 'Weyermann Pilsner Malt', weightKg: 0 },
    ]);
    expect(res.mapped).toBe(0);
    expect(res.skipped).toBe(1);
    expect(res.url).toBeNull();
  });

  it('falls back to en for hi/mr', () => {
    const res = buildAromaForgeLink([{ name: 'Weyermann Pilsner Malt', weightKg: 4 }], { lang: 'hi' });
    expect(res.url).toContain('&l=en');
  });
});
