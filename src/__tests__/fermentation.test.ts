import { describe, it, expect } from 'vitest';
import {
  calculateAbvSimple,
  calculateAbvAdvanced,
  calculateAttenuation,
  correctHydrometerReading,
  sgToPlato,
} from '@/lib/fermentation';

describe('calculateAbvSimple', () => {
  it('computes ABV via the standard 131.25 formula', () => {
    expect(calculateAbvSimple(1.05, 1.01)).toBeCloseTo((1.05 - 1.01) * 131.25, 5);
  });

  it('returns 0 when FG >= OG instead of a negative ABV', () => {
    expect(calculateAbvSimple(1.01, 1.01)).toBe(0);
    expect(calculateAbvSimple(1.01, 1.05)).toBe(0);
  });
});

describe('calculateAbvAdvanced', () => {
  it('returns a plausible ABV for a typical beer', () => {
    const abv = calculateAbvAdvanced(1.05, 1.01);
    expect(abv).toBeGreaterThan(4);
    expect(abv).toBeLessThan(6);
  });

  it('returns 0 for FG >= OG', () => {
    expect(calculateAbvAdvanced(1.01, 1.01)).toBe(0);
  });

  it('is close to the simple formula for typical-gravity beers', () => {
    const simple = calculateAbvSimple(1.05, 1.01);
    const advanced = calculateAbvAdvanced(1.05, 1.01);
    expect(Math.abs(simple - advanced)).toBeLessThan(0.3);
  });
});

describe('calculateAttenuation', () => {
  it('computes apparent attenuation between 0-100%', () => {
    const result = calculateAttenuation(1.05, 1.01);
    expect(result.apparentAttenuationPercent).toBeGreaterThan(0);
    expect(result.apparentAttenuationPercent).toBeLessThanOrEqual(100);
  });

  it('real attenuation is always less than or equal to apparent attenuation', () => {
    const result = calculateAttenuation(1.06, 1.012);
    expect(result.realAttenuationPercent).toBeLessThanOrEqual(result.apparentAttenuationPercent + 1e-6);
  });

  it('handles FG >= OG without NaN or negative attenuation', () => {
    const result = calculateAttenuation(1.01, 1.01);
    expect(Number.isNaN(result.apparentAttenuationPercent)).toBe(false);
    expect(result.apparentAttenuationPercent).toBeGreaterThanOrEqual(0);
  });
});

describe('sgToPlato', () => {
  it('converts water (SG 1.000) to approximately 0 °P', () => {
    expect(sgToPlato(1.0)).toBeCloseTo(0, 0);
  });

  it('converts a typical wort gravity to a plausible Plato value', () => {
    const plato = sgToPlato(1.05);
    expect(plato).toBeGreaterThan(10);
    expect(plato).toBeLessThan(14);
  });
});

describe('correctHydrometerReading', () => {
  it('returns the same reading when sample temp equals calibration temp', () => {
    const corrected = correctHydrometerReading(1.05, 20, 20);
    expect(corrected).toBeCloseTo(1.05, 5);
  });

  it('corrects a warm sample reading upward (true gravity higher than measured)', () => {
    const corrected = correctHydrometerReading(1.05, 30, 20);
    expect(corrected).toBeGreaterThan(1.05);
  });

  it('corrects a cold sample reading downward (true gravity lower than measured)', () => {
    const corrected = correctHydrometerReading(1.05, 10, 20);
    expect(corrected).toBeLessThan(1.05);
  });

  it('handles non-finite sample temperature without NaN', () => {
    const corrected = correctHydrometerReading(1.05, NaN as unknown as number, 20);
    expect(Number.isNaN(corrected)).toBe(false);
  });
});
