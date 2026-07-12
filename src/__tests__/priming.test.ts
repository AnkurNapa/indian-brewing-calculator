import { describe, it, expect } from 'vitest';
import { calculatePrimingDose, estimateResidualCo2Volumes, PRIMING_SUGARS } from '@/lib/priming';

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
