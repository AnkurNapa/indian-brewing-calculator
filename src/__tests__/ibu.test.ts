import { describe, it, expect } from 'vitest';
import {
  calculateIbu,
  tinsethUtilization,
  ragerUtilization,
  garetzUtilization,
  computeUtilization,
  calculateHopWeightForTargetIbu,
  calculateDryHopWeight,
  DEFAULT_GARETZ_EXTRAS,
  HopAddition,
} from '@/lib/ibu';

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

describe('ragerUtilization', () => {
  it('increases with boil time', () => {
    const short = ragerUtilization(1.05, 10);
    const long = ragerUtilization(1.05, 60);
    expect(long).toBeGreaterThan(short);
  });

  it('is reduced by high gravity above 1.050', () => {
    const lowGravity = ragerUtilization(1.04, 60);
    const highGravity = ragerUtilization(1.08, 60);
    expect(highGravity).toBeLessThan(lowGravity);
  });

  it('never goes negative even at extreme high gravity', () => {
    expect(ragerUtilization(1.2, 60)).toBeGreaterThanOrEqual(0);
  });
});

describe('garetzUtilization', () => {
  it('increases with boil time', () => {
    const short = garetzUtilization(1.05, 10, 20, DEFAULT_GARETZ_EXTRAS);
    const long = garetzUtilization(1.05, 60, 20, DEFAULT_GARETZ_EXTRAS);
    expect(long).toBeGreaterThan(short);
  });

  it('increases with altitude', () => {
    const seaLevel = garetzUtilization(1.05, 60, 20, DEFAULT_GARETZ_EXTRAS);
    const highAltitude = garetzUtilization(1.05, 60, 20, { ...DEFAULT_GARETZ_EXTRAS, altitudeM: 2000 });
    expect(highAltitude).toBeGreaterThan(seaLevel);
  });

  it('scales down with a lower hop age factor (staler hops)', () => {
    const fresh = garetzUtilization(1.05, 60, 20, DEFAULT_GARETZ_EXTRAS);
    const stale = garetzUtilization(1.05, 60, 20, { ...DEFAULT_GARETZ_EXTRAS, hopAgeFactor: 0.5 });
    expect(stale).toBeCloseTo(fresh * 0.5, 5);
  });

  it('increases with wort concentration (boil volume > batch volume)', () => {
    const noConcentration = garetzUtilization(1.05, 60, 20, DEFAULT_GARETZ_EXTRAS);
    const concentrated = garetzUtilization(1.05, 60, 20, { ...DEFAULT_GARETZ_EXTRAS, boilVolumeL: 25 });
    expect(concentrated).toBeGreaterThan(noConcentration);
  });
});

describe('computeUtilization', () => {
  it('dispatches to the correct formula', () => {
    expect(computeUtilization('tinseth', 1.05, 60, 20)).toBeCloseTo(tinsethUtilization(1.05, 60), 8);
    expect(computeUtilization('rager', 1.05, 60, 20)).toBeCloseTo(ragerUtilization(1.05, 60), 8);
    expect(computeUtilization('garetz', 1.05, 60, 20)).toBeCloseTo(
      garetzUtilization(1.05, 60, 20, DEFAULT_GARETZ_EXTRAS),
      8,
    );
  });
});

describe('calculateIbu with formula selection', () => {
  const hops: HopAddition[] = [{ name: 'Test Hop', alphaAcidPercent: 12, weightG: 20, boilTimeMinutes: 60 }];

  it('defaults to Tinseth when no formula is passed (backward compatible)', () => {
    const withDefault = calculateIbu(hops, 1.05, 20);
    const withExplicitTinseth = calculateIbu(hops, 1.05, 20, 'tinseth');
    expect(withDefault.totalIbu).toBeCloseTo(withExplicitTinseth.totalIbu, 8);
  });

  it('produces different totals for different formulas on the same inputs', () => {
    const tinseth = calculateIbu(hops, 1.05, 20, 'tinseth');
    const rager = calculateIbu(hops, 1.05, 20, 'rager');
    const garetz = calculateIbu(hops, 1.05, 20, 'garetz');
    expect(tinseth.totalIbu).not.toBeCloseTo(rager.totalIbu, 1);
    expect(tinseth.totalIbu).not.toBeCloseTo(garetz.totalIbu, 1);
  });
});
