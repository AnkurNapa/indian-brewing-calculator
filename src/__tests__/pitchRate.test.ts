import { describe, it, expect } from 'vitest';
import { calculatePitchRate } from '@/lib/pitchRate';

describe('calculatePitchRate', () => {
  it('requires more cells for lager than ale at the same gravity/volume', () => {
    const ale = calculatePitchRate(1.05, 20, 'ale');
    const lager = calculatePitchRate(1.05, 20, 'lager');
    expect(lager.targetCellsBillion).toBeGreaterThan(ale.targetCellsBillion);
  });

  it('requires more cells for higher gravity at the same volume/style', () => {
    const low = calculatePitchRate(1.04, 20, 'ale');
    const high = calculatePitchRate(1.08, 20, 'ale');
    expect(high.targetCellsBillion).toBeGreaterThan(low.targetCellsBillion);
  });

  it('scales linearly with batch volume', () => {
    const small = calculatePitchRate(1.05, 10, 'ale');
    const large = calculatePitchRate(1.05, 20, 'ale');
    expect(large.targetCellsBillion).toBeCloseTo(small.targetCellsBillion * 2, 5);
  });

  it('returns zero doses for non-positive volume or gravity instead of NaN', () => {
    const result = calculatePitchRate(1.05, 0, 'ale');
    expect(result.targetCellsBillion).toBe(0);
    expect(result.dryYeastGrams).toBe(0);
    expect(result.slurryMl).toBe(0);
  });

  it('dry yeast grams and slurry mL are both positive for a valid batch', () => {
    const result = calculatePitchRate(1.05, 20, 'ale');
    expect(result.dryYeastGrams).toBeGreaterThan(0);
    expect(result.slurryMl).toBeGreaterThan(0);
  });
});
