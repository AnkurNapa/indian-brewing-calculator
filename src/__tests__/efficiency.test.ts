import { describe, it, expect } from 'vitest';
import { calculateBrewhouseEfficiency, sgToPoints, pointsToSg } from '@/lib/efficiency';

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
