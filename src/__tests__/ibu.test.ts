import { describe, it, expect } from 'vitest';
import { calculateIbu, tinsethUtilization } from '@/lib/ibu';

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
