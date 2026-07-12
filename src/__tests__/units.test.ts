import { describe, it, expect } from 'vitest';
import {
  hlToL,
  lToHl,
  kgToG,
  gToKg,
  roundForDisplay,
  clamp,
  parseNumericInput,
  parseNonNegative,
  sgToPlato,
  platoToSg,
} from '@/lib/units';

describe('unit conversions', () => {
  it('converts HL to L', () => {
    expect(hlToL(1)).toBe(100);
    expect(hlToL(5)).toBe(500);
  });

  it('converts L to HL', () => {
    expect(lToHl(100)).toBe(1);
    expect(lToHl(500)).toBe(5);
  });

  it('converts kg to g and back', () => {
    expect(kgToG(2)).toBe(2000);
    expect(gToKg(2000)).toBe(2);
  });

  it('rounds for display only, does not affect precision elsewhere', () => {
    expect(roundForDisplay(1.23456, 2)).toBe(1.23);
    expect(roundForDisplay(1.005, 2)).toBeCloseTo(1.0, 1);
  });

  it('rounds NaN/Infinity safely to 0', () => {
    expect(roundForDisplay(NaN)).toBe(0);
    expect(roundForDisplay(Infinity)).toBe(0);
  });

  it('clamps within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('clamp handles NaN by returning min', () => {
    expect(clamp(NaN, 2, 10)).toBe(2);
  });

  describe('parseNumericInput', () => {
    it('empty string parses to 0, not NaN', () => {
      expect(parseNumericInput('')).toBe(0);
      expect(parseNumericInput('   ')).toBe(0);
    });

    it('valid numeric strings parse correctly', () => {
      expect(parseNumericInput('42')).toBe(42);
      expect(parseNumericInput('-3.5')).toBe(-3.5);
    });

    it('malformed input returns null', () => {
      expect(parseNumericInput('abc')).toBeNull();
      expect(parseNumericInput('12x')).toBeNull();
    });
  });

  describe('parseNonNegative', () => {
    it('clamps negative values to 0', () => {
      expect(parseNonNegative('-5')).toBe(0);
    });

    it('empty input is 0', () => {
      expect(parseNonNegative('')).toBe(0);
    });

    it('malformed input returns null', () => {
      expect(parseNonNegative('not a number')).toBeNull();
    });
  });

  describe('sgToPlato / platoToSg', () => {
    it('converts common gravity readings to roughly the expected Plato', () => {
      expect(sgToPlato(1.05)).toBeCloseTo(12.4, 0);
      expect(sgToPlato(1.01)).toBeCloseTo(2.5, 0);
      expect(sgToPlato(1.0)).toBeCloseTo(0, 0);
    });

    it('round-trips SG -> Plato -> SG within a small tolerance', () => {
      const original = 1.052;
      const roundTripped = platoToSg(sgToPlato(original));
      expect(roundTripped).toBeCloseTo(original, 3);
    });
  });
});
