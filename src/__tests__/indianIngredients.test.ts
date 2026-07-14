import { describe, it, expect } from 'vitest';
import { INDIAN_GRAINS, INDIAN_ADJUNCTS } from '@/lib/indianIngredients';

describe('INDIAN_GRAINS', () => {
  it('every grain has a plausible imperial-PPG extract (1.02-1.05) and non-negative colour', () => {
    for (const g of INDIAN_GRAINS) {
      expect(g.potentialSg).toBeGreaterThan(1.02);
      expect(g.potentialSg).toBeLessThan(1.05);
      expect(g.colorLovibond).toBeGreaterThanOrEqual(0);
      expect(g.name.length).toBeGreaterThan(0);
    }
  });

  it('has unique ids', () => {
    const ids = INDIAN_GRAINS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes rice, wheat, and 6-row barley', () => {
    const names = INDIAN_GRAINS.map((g) => g.name.toLowerCase()).join(' | ');
    expect(names).toContain('rice');
    expect(names).toContain('wheat');
    expect(names).toContain('6-row');
  });
});

describe('INDIAN_ADJUNCTS', () => {
  it('fermentable adjuncts carry an extract; flavour-only ones do not', () => {
    for (const a of INDIAN_ADJUNCTS) {
      if (a.fermentable) {
        expect(a.potentialSg).toBeGreaterThan(1.0);
      } else {
        expect(a.potentialSg).toBeUndefined();
      }
      expect(a.typicalRateGPerL).toBeGreaterThan(0);
    }
  });

  it('includes honey, jaggery, mango, kokum, and coriander', () => {
    const ids = INDIAN_ADJUNCTS.map((a) => a.id);
    for (const want of ['honey', 'jaggery', 'mango', 'kokum', 'coriander']) {
      expect(ids).toContain(want);
    }
  });
});
