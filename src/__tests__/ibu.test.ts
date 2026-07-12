import { describe, it, expect } from 'vitest';
import { calculateIbu, tinsethUtilization, calculateHopWeightForTargetIbu, calculateDryHopWeight } from '@/lib/ibu';

describe('tinsethUtilization', () => {
  it('increases with boil time', () => {
    const short = tinsethUtilization(1.05, 10);
    const long = tinsethUtilization(1.05, 60);
    expect(long).toBeGreaterThan(short);
  });

  it('decreases with higher wort gravity (bigness factor)', () => {
    const lowGravity = tinsethUtilization(1.04, 60);
    const highGravity = tinsethUtilization(1.08, 60);
    expect(highGravity).toBeLessThan(lowGravity);
  });

  it('is 0 at 0 boil time (flameout)', () => {
    expect(tinsethUtilization(1.05, 0)).toBeCloseTo(0, 5);
  });
});

describe('calculateIbu', () => {
  it('computes a plausible IBU for a typical 60-min bittering addition', () => {
    const result = calculateIbu(
      [{ name: 'Magnum', alphaAcidPercent: 12, weightG: 20, boilTimeMinutes: 60 }],
      1.05,
      20,
    );
    expect(result.totalIbu).toBeGreaterThan(10);
    expect(result.totalIbu).toBeLessThan(60);
  });

  it('a flameout/whirlpool addition contributes near-zero IBU', () => {
    const result = calculateIbu(
      [{ name: 'Citra', alphaAcidPercent: 12, weightG: 30, boilTimeMinutes: 0 }],
      1.05,
      20,
    );
    expect(result.totalIbu).toBeCloseTo(0, 5);
  });

  it('sums multiple additions correctly', () => {
    const additions = [
      { name: 'Bittering', alphaAcidPercent: 12, weightG: 20, boilTimeMinutes: 60 },
      { name: 'Flavor', alphaAcidPercent: 5, weightG: 20, boilTimeMinutes: 15 },
    ];
    const result = calculateIbu(additions, 1.05, 20);
    expect(result.totalIbu).toBeCloseTo(result.perAdditionIbu[0] + result.perAdditionIbu[1], 5);
  });

  it('returns all zeros for non-positive batch volume instead of dividing by zero', () => {
    const result = calculateIbu(
      [{ name: 'Magnum', alphaAcidPercent: 12, weightG: 20, boilTimeMinutes: 60 }],
      1.05,
      0,
    );
    expect(result.totalIbu).toBe(0);
    expect(result.perAdditionIbu).toEqual([0]);
  });

  it('ignores invalid hop rows (zero/negative alpha acid or weight)', () => {
    const result = calculateIbu(
      [{ name: 'Bad Hop', alphaAcidPercent: 0, weightG: 20, boilTimeMinutes: 60 }],
      1.05,
      20,
    );
    expect(result.totalIbu).toBe(0);
  });
});

describe('calculateHopWeightForTargetIbu', () => {
  it('is the algebraic inverse of calculateIbu for a single addition', () => {
    const grams = calculateHopWeightForTargetIbu(40, 12, 60, 1.05, 20);
    const result = calculateIbu([{ name: 'Test', alphaAcidPercent: 12, weightG: grams, boilTimeMinutes: 60 }], 1.05, 20);
    expect(result.totalIbu).toBeCloseTo(40, 3);
  });

  it('requires more grams for a higher target IBU', () => {
    const low = calculateHopWeightForTargetIbu(20, 12, 60, 1.05, 20);
    const high = calculateHopWeightForTargetIbu(60, 12, 60, 1.05, 20);
    expect(high).toBeGreaterThan(low);
  });

  it('requires fewer grams for a higher alpha acid hop at the same target IBU', () => {
    const lowAa = calculateHopWeightForTargetIbu(40, 5, 60, 1.05, 20);
    const highAa = calculateHopWeightForTargetIbu(40, 15, 60, 1.05, 20);
    expect(highAa).toBeLessThan(lowAa);
  });

  it('returns 0 for a flameout addition (0 min) since utilization is ~0, instead of Infinity', () => {
    const grams = calculateHopWeightForTargetIbu(20, 12, 0, 1.05, 20);
    expect(grams).toBe(0);
  });

  it('returns 0 for non-positive target IBU, alpha acid, or batch volume', () => {
    expect(calculateHopWeightForTargetIbu(0, 12, 60, 1.05, 20)).toBe(0);
    expect(calculateHopWeightForTargetIbu(40, 0, 60, 1.05, 20)).toBe(0);
    expect(calculateHopWeightForTargetIbu(40, 12, 60, 1.05, 0)).toBe(0);
  });
});

describe('calculateDryHopWeight', () => {
  it('computes grams = rate * volume', () => {
    expect(calculateDryHopWeight(3, 20)).toBeCloseTo(60, 5);
  });

  it('returns 0 for non-positive rate or volume instead of negative/NaN', () => {
    expect(calculateDryHopWeight(0, 20)).toBe(0);
    expect(calculateDryHopWeight(3, 0)).toBe(0);
    expect(calculateDryHopWeight(-3, 20)).toBe(0);
  });
});
