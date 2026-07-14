import { describe, it, expect } from 'vitest';
import { calculatePrimingDose, estimateResidualCo2Volumes, PRIMING_SUGARS } from '@/lib/priming';

describe('estimateResidualCo2Volumes (°F fit applied to °C input)', () => {
  it('returns ~0.86 volumes at 20 °C (the published value), not the raw-°C ~2.14', () => {
    // 20 °C = 68 °F -> 3.0378 - 0.050062*68 + 0.00026555*68^2 = 0.8615 vol.
    expect(estimateResidualCo2Volumes(20)).toBeCloseTo(0.86, 1);
  });
  it('returns ~0.76 volumes at 25 °C', () => {
    expect(estimateResidualCo2Volumes(25)).toBeCloseTo(0.76, 1);
  });
});

describe('estimateResidualCo2Volumes', () => {
  it('decreases as temperature increases (less CO2 stays dissolved when warm)', () => {
    const cold = estimateResidualCo2Volumes(2);
    const warm = estimateResidualCo2Volumes(25);
    expect(warm).toBeLessThan(cold);
  });

  it('never returns negative volumes', () => {
    expect(estimateResidualCo2Volumes(100)).toBeGreaterThanOrEqual(0);
  });
});

describe('calculatePrimingDose', () => {
  const dextrose = PRIMING_SUGARS.find((s) => s.id === 'dextrose')!;

  it('computes a positive priming dose for a typical ale target above residual CO2', () => {
    const result = calculatePrimingDose(2.5, 20, 20, dextrose);
    expect(result.alreadyAtTarget).toBe(false);
    expect(result.primingSugarGrams).toBeGreaterThan(0);
  });

  it('returns zero dose when target is already at/below residual CO2', () => {
    const result = calculatePrimingDose(0.5, 2, 20, dextrose);
    expect(result.alreadyAtTarget).toBe(true);
    expect(result.primingSugarGrams).toBe(0);
  });

  it('a higher CO2 target requires more sugar than a lower target, all else equal', () => {
    const low = calculatePrimingDose(2.2, 20, 20, dextrose);
    const high = calculatePrimingDose(2.8, 20, 20, dextrose);
    expect(high.primingSugarGrams).toBeGreaterThan(low.primingSugarGrams);
  });

  it('handles zero batch volume without NaN', () => {
    const result = calculatePrimingDose(2.5, 20, 0, dextrose);
    expect(Number.isNaN(result.primingSugarGrams)).toBe(false);
    expect(result.primingSugarGrams).toBe(0);
  });
});
