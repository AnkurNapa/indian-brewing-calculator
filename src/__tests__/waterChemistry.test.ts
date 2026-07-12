import { describe, it, expect } from 'vitest';
import {
  calculateResidualAlkalinity,
  toMeqPerL,
  ionProfileToMeq,
  predictMashPh,
  classifyMaltCategory,
  EMPTY_ION_PROFILE,
  MASH_PH_MIN,
  MASH_PH_MAX,
  GrainBillItem,
} from '@/lib/waterChemistry';

describe('calculateResidualAlkalinity', () => {
  it('computes RA correctly with typical values', () => {
    const ra = calculateResidualAlkalinity({ alkalinity: 100, calcium: 50, magnesium: 10 });
    // 50/1.4 = 35.71..., 10/1.7 = 5.88..., RA = 100 - 41.6 approx
    expect(ra).toBeCloseTo(100 - (50 / 1.4 + 10 / 1.7), 5);
  });

  it('handles Ca = Mg = 0 (RO/distilled water) with no divide-by-zero/NaN', () => {
    const ra = calculateResidualAlkalinity({ alkalinity: 0, calcium: 0, magnesium: 0 });
    expect(ra).toBe(0);
    expect(Number.isNaN(ra)).toBe(false);
  });

  it('clamps negative/missing ion inputs to 0 instead of producing NaN', () => {
    const ra = calculateResidualAlkalinity({ alkalinity: 50, calcium: -10, magnesium: NaN as unknown as number });
    expect(Number.isNaN(ra)).toBe(false);
    expect(ra).toBe(50);
  });

  it('can be negative when hardness contribution exceeds alkalinity', () => {
    const ra = calculateResidualAlkalinity({ alkalinity: 10, calcium: 200, magnesium: 50 });
    expect(ra).toBeLessThan(0);
  });
});

describe('mEq/L conversions', () => {
  it('converts each ion using the documented divisor', () => {
    expect(toMeqPerL(20.04, 'calcium')).toBeCloseTo(1, 5);
    expect(toMeqPerL(12.15, 'magnesium')).toBeCloseTo(1, 5);
    expect(toMeqPerL(23.0, 'sodium')).toBeCloseTo(1, 5);
    expect(toMeqPerL(48.03, 'sulfate')).toBeCloseTo(1, 5);
    expect(toMeqPerL(35.45, 'chloride')).toBeCloseTo(1, 5);
    expect(toMeqPerL(61.02, 'bicarbonate')).toBeCloseTo(1, 5);
  });

  it('negative mg/L input clamps to 0 meq/L, never negative or NaN', () => {
    expect(toMeqPerL(-100, 'calcium')).toBe(0);
  });

  it('ionProfileToMeq converts a full profile', () => {
    const meq = ionProfileToMeq({ ...EMPTY_ION_PROFILE, calcium: 20.04, sodium: 23 });
    expect(meq.calcium).toBeCloseTo(1, 5);
    expect(meq.sodium).toBeCloseTo(1, 5);
    expect(meq.magnesium).toBe(0);
  });
});

describe('predictMashPh', () => {
  it('returns fallback for an empty grain bill without dividing by zero', () => {
    const result = predictMashPh(50, []);
    expect(result.isFallback).toBe(true);
    expect(Number.isNaN(result.predictedPh)).toBe(false);
    expect(result.totalGristWeightKg).toBe(0);
  });

  it('returns fallback when all grain bill weights are zero', () => {
    const grainBill: GrainBillItem[] = [{ name: 'Pilsner', weightKg: 0, colorLovibond: 2 }];
    const result = predictMashPh(50, grainBill);
    expect(result.isFallback).toBe(true);
  });

  it('predicts a plausible pH for a typical pale ale grist', () => {
    const grainBill: GrainBillItem[] = [
      { name: 'Pale Malt', weightKg: 4, colorLovibond: 3 },
      { name: 'Crystal 40', weightKg: 0.3, colorLovibond: 40 },
    ];
    const result = predictMashPh(30, grainBill);
    expect(result.isFallback).toBe(false);
    expect(result.predictedPh).toBeGreaterThanOrEqual(MASH_PH_MIN);
    expect(result.predictedPh).toBeLessThanOrEqual(MASH_PH_MAX);
    expect(result.totalGristWeightKg).toBeCloseTo(4.3, 5);
  });

  it('clamps predicted pH for extreme all-black-malt grist', () => {
    const grainBill: GrainBillItem[] = [{ name: 'Black Malt', weightKg: 5, colorLovibond: 500 }];
    const result = predictMashPh(200, grainBill);
    expect(result.predictedPh).toBeGreaterThanOrEqual(MASH_PH_MIN);
    expect(result.predictedPh).toBeLessThanOrEqual(MASH_PH_MAX);
  });

  it('clamps predicted pH for extreme all-base-malt grist with very high RA', () => {
    const grainBill: GrainBillItem[] = [{ name: 'Base Malt', weightKg: 0.01, colorLovibond: 1.5 }];
    const result = predictMashPh(100000, grainBill);
    expect(result.predictedPh).toBeLessThanOrEqual(MASH_PH_MAX);
  });

  it('handles negative residual alkalinity gracefully', () => {
    const grainBill: GrainBillItem[] = [{ name: 'Pale Malt', weightKg: 5, colorLovibond: 3 }];
    const result = predictMashPh(-50, grainBill);
    expect(Number.isNaN(result.predictedPh)).toBe(false);
    expect(result.predictedPh).toBeGreaterThanOrEqual(MASH_PH_MIN);
  });

  it('ignores rows with negative or non-finite weight when computing totals', () => {
    const grainBill: GrainBillItem[] = [
      { name: 'Bad Row', weightKg: -3, colorLovibond: 10 },
      { name: 'Good Row', weightKg: 2, colorLovibond: 5 },
    ];
    const result = predictMashPh(30, grainBill);
    expect(result.totalGristWeightKg).toBeCloseTo(2, 5);
  });

  it('an all-roasted grist predicts a lower pH than an all-base grist at the same RA and weight', () => {
    const baseGrist: GrainBillItem[] = [{ name: 'Pilsner', weightKg: 5, category: 'base', colorLovibond: 2 }];
    const roastedGrist: GrainBillItem[] = [{ name: 'Roasted Barley', weightKg: 5, category: 'roasted', colorLovibond: 500 }];
    const baseResult = predictMashPh(30, baseGrist);
    const roastedResult = predictMashPh(30, roastedGrist);
    expect(roastedResult.predictedPh).toBeLessThan(baseResult.predictedPh);
  });

  it('an explicit category overrides color-based inference (pale acidulated malt is more acidic than pale base malt)', () => {
    const baseGrist: GrainBillItem[] = [{ name: 'Pilsner', weightKg: 5, category: 'base', colorLovibond: 2 }];
    const acidulatedGrist: GrainBillItem[] = [{ name: 'Acidulated Malt', weightKg: 5, category: 'acidulated', colorLovibond: 2 }];
    const baseResult = predictMashPh(30, baseGrist);
    const acidulatedResult = predictMashPh(30, acidulatedGrist);
    expect(acidulatedResult.predictedPh).toBeLessThan(baseResult.predictedPh);
  });

  it('a grist with more crystal/roasted buffering capacity resists RA-driven pH shifts more than an all-base grist', () => {
    const allBase: GrainBillItem[] = [{ name: 'Pilsner', weightKg: 5, category: 'base', colorLovibond: 2 }];
    const mixedGrist: GrainBillItem[] = [
      { name: 'Pilsner', weightKg: 4, category: 'base', colorLovibond: 2 },
      { name: 'Crystal 60', weightKg: 1, category: 'crystal', colorLovibond: 60 },
    ];
    const highRa = 150;
    const baseShift = predictMashPh(highRa, allBase).predictedPh - predictMashPh(0, allBase).predictedPh;
    const mixedShift = predictMashPh(highRa, mixedGrist).predictedPh - predictMashPh(0, mixedGrist).predictedPh;
    expect(mixedShift).toBeLessThan(baseShift);
  });

  it('classifyMaltCategory buckets by color as documented', () => {
    expect(classifyMaltCategory(2)).toBe('base');
    expect(classifyMaltCategory(19.9)).toBe('base');
    expect(classifyMaltCategory(20)).toBe('crystal');
    expect(classifyMaltCategory(79.9)).toBe('crystal');
    expect(classifyMaltCategory(80)).toBe('roasted');
    expect(classifyMaltCategory(500)).toBe('roasted');
  });

  it('accepts an explicit mash water volume to compute the RA buffering term', () => {
    const grainBill: GrainBillItem[] = [{ name: 'Pilsner', weightKg: 5, category: 'base', colorLovibond: 2 }];
    const thin = predictMashPh(100, grainBill, 20);
    const thick = predictMashPh(100, grainBill, 5);
    // More mash water carries more alkalinity to neutralize -> higher pH shift.
    expect(thin.predictedPh).toBeGreaterThan(thick.predictedPh);
  });
});
