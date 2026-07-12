import { describe, it, expect } from 'vitest';
import { calculateBrewhouseEfficiency, predictOriginalGravity, sgToPoints, pointsToSg } from '@/lib/efficiency';

describe('sgToPoints / pointsToSg', () => {
  it('round-trips correctly', () => {
    expect(sgToPoints(1.05)).toBeCloseTo(50, 5);
    expect(pointsToSg(50)).toBeCloseTo(1.05, 5);
  });
});

describe('calculateBrewhouseEfficiency', () => {
  it('computes 100% efficiency when actual gravity equals full theoretical potential', () => {
    // 5 kg of malt with potential 1.037 dissolved fully into 20 L should give
    // maxTheoreticalPoints = (37 * 5) / 20 = 9.25 points -> SG 1.00925
    const result = calculateBrewhouseEfficiency(
      [{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }],
      pointsToSg(9.25),
      20,
    );
    expect(result.efficiencyPercent).toBeCloseTo(100, 1);
  });

  it('computes a lower efficiency when actual gravity is below theoretical max', () => {
    const result = calculateBrewhouseEfficiency(
      [{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }],
      pointsToSg(6.5),
      20,
    );
    expect(result.efficiencyPercent).toBeGreaterThan(60);
    expect(result.efficiencyPercent).toBeLessThan(80);
  });

  it('returns 0% for empty grain bill or zero volume instead of dividing by zero', () => {
    expect(calculateBrewhouseEfficiency([], 1.05, 20).efficiencyPercent).toBe(0);
    expect(
      calculateBrewhouseEfficiency([{ name: 'Malt', weightKg: 5, potentialSg: 1.037 }], 1.05, 0).efficiencyPercent,
    ).toBe(0);
  });

  it('ignores invalid grain rows (zero/negative weight or potential)', () => {
    const result = calculateBrewhouseEfficiency(
      [
        { name: 'Bad', weightKg: -1, potentialSg: 1.037 },
        { name: 'Good', weightKg: 5, potentialSg: 1.037 },
      ],
      pointsToSg(9.25),
      20,
    );
    expect(result.efficiencyPercent).toBeCloseTo(100, 1);
  });
});

describe('predictOriginalGravity', () => {
  it('is the inverse of calculateBrewhouseEfficiency at a given efficiency', () => {
    const grainBill = [{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }];
    const predicted = predictOriginalGravity(grainBill, 20, 75);
    const backCalculated = calculateBrewhouseEfficiency(grainBill, predicted, 20);
    expect(backCalculated.efficiencyPercent).toBeCloseTo(75, 1);
  });

  it('returns 1.0 for an empty grain bill', () => {
    expect(predictOriginalGravity([], 20, 75)).toBe(1.0);
  });

  it('skips rows without a usable potentialSg', () => {
    const grainBill = [{ name: 'No Potential', weightKg: 5, potentialSg: 0 }];
    expect(predictOriginalGravity(grainBill, 20, 75)).toBe(1.0);
  });

  it('clamps efficiency to 0-100%', () => {
    const grainBill = [{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }];
    const overOne = predictOriginalGravity(grainBill, 20, 150);
    const atFull = predictOriginalGravity(grainBill, 20, 100);
    expect(overOne).toBeCloseTo(atFull, 5);
  });
});
