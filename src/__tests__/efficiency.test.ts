import { describe, it, expect } from 'vitest';
import {
  calculateBrewhouseEfficiency,
  predictOriginalGravity,
  solveGrainWeightsByPercent,
  sgToPoints,
  pointsToSg,
} from '@/lib/efficiency';

describe('sgToPoints / pointsToSg', () => {
  it('round-trips correctly', () => {
    expect(sgToPoints(1.05)).toBeCloseTo(50, 5);
    expect(pointsToSg(50)).toBeCloseTo(1.05, 5);
  });
});

describe('calculateBrewhouseEfficiency', () => {
  it('computes 100% efficiency when actual gravity equals full theoretical potential', () => {
    // 5 kg of 37 PPG malt (potentialSg 1.037) in 20 L:
    // maxTheoreticalPoints = (37 * 5 / 20) * 8.3454 (PPG -> points/kg/L) = 77.2 points -> SG ~1.0772
    const result = calculateBrewhouseEfficiency(
      [{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }],
      pointsToSg(9.25 * (2.20462 / 0.264172)),
      20,
    );
    expect(result.efficiencyPercent).toBeCloseTo(100, 1);
  });

  it('computes a lower efficiency when actual gravity is below theoretical max', () => {
    // Measured OG 1.054 against a ~77.2-point theoretical max ~= 70% efficiency.
    const result = calculateBrewhouseEfficiency(
      [{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }],
      1.054,
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
      pointsToSg(9.25 * (2.20462 / 0.264172)),
      20,
    );
    expect(result.efficiencyPercent).toBeCloseTo(100, 1);
  });

  it('reads a realistic (not ~500%) efficiency for a normal all-grain OG measurement', () => {
    // 5 kg base malt / 20 L measuring OG 1.050 should be a sane ~65%, not ~540%.
    const result = calculateBrewhouseEfficiency(
      [{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }],
      1.05,
      20,
    );
    expect(result.efficiencyPercent).toBeGreaterThan(50);
    expect(result.efficiencyPercent).toBeLessThan(80);
  });
});

describe('predictOriginalGravity', () => {
  it('is the inverse of calculateBrewhouseEfficiency at a given efficiency', () => {
    const grainBill = [{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }];
    const predicted = predictOriginalGravity(grainBill, 20, 75);
    const backCalculated = calculateBrewhouseEfficiency(grainBill, predicted, 20);
    expect(backCalculated.efficiencyPercent).toBeCloseTo(75, 1);
  });

  it('predicts a physically correct OG (~1.058), not the ~1.007 the unit bug produced', () => {
    const og = predictOriginalGravity([{ name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 }], 20, 75);
    expect(og).toBeCloseTo(1.058, 2);
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

describe('solveGrainWeightsByPercent', () => {
  it('is the inverse of predictOriginalGravity for a single-malt bill', () => {
    const weights = solveGrainWeightsByPercent([{ percentOfBill: 100, potentialSg: 1.037 }], 1.05, 20, 75);
    const predicted = predictOriginalGravity(
      [{ name: 'Malt', weightKg: weights[0], potentialSg: 1.037 }],
      20,
      75,
    );
    expect(predicted).toBeCloseTo(1.05, 3);
  });

  it('solves a realistic grain weight (~4.3 kg, not ~36 kg) for OG 1.050 in 20 L at 75%', () => {
    const weights = solveGrainWeightsByPercent([{ percentOfBill: 100, potentialSg: 1.037 }], 1.05, 20, 75);
    expect(weights[0]).toBeGreaterThan(3.5);
    expect(weights[0]).toBeLessThan(5.5);
  });

  it('splits weight proportionally to percent of bill', () => {
    const weights = solveGrainWeightsByPercent(
      [
        { percentOfBill: 80, potentialSg: 1.037 },
        { percentOfBill: 20, potentialSg: 1.037 },
      ],
      1.05,
      20,
      75,
    );
    expect(weights[0] / weights[1]).toBeCloseTo(4, 5);
  });

  it('normalizes percentages that do not sum to 100', () => {
    const notNormalized = solveGrainWeightsByPercent(
      [
        { percentOfBill: 40, potentialSg: 1.037 },
        { percentOfBill: 40, potentialSg: 1.037 },
        { percentOfBill: 40, potentialSg: 1.037 },
      ],
      1.05,
      20,
      75,
    );
    const equalThirds = solveGrainWeightsByPercent(
      [
        { percentOfBill: 33.333, potentialSg: 1.037 },
        { percentOfBill: 33.333, potentialSg: 1.037 },
        { percentOfBill: 33.333, potentialSg: 1.037 },
      ],
      1.05,
      20,
      75,
    );
    expect(notNormalized[0]).toBeCloseTo(equalThirds[0], 2);
  });

  it('returns 0 for every row when batch volume or target OG is invalid', () => {
    const items = [{ percentOfBill: 100, potentialSg: 1.037 }];
    expect(solveGrainWeightsByPercent(items, 1.05, 0, 75)).toEqual([0]);
    expect(solveGrainWeightsByPercent(items, 1.0, 20, 75)).toEqual([0]);
  });

  it('returns 0 for a row with no usable potentialSg without failing other rows', () => {
    const weights = solveGrainWeightsByPercent(
      [
        { percentOfBill: 50, potentialSg: 0 },
        { percentOfBill: 50, potentialSg: 1.037 },
      ],
      1.05,
      20,
      75,
    );
    expect(weights[0]).toBe(0);
    expect(weights[1]).toBeGreaterThan(0);
  });
});
