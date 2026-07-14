import { describe, it, expect } from 'vitest';
import {
  solveMixingCross,
  quantitiesFromTotal,
  quantitiesFromComponent,
  MIXING_PARAMETERS,
} from '@/lib/mixingCross';

/** Weighted-average of a blend, used to verify a solved blend hits its target. */
function blendedParameter(paramA: number, fractionA: number, paramB: number, fractionB: number): number {
  return paramA * fractionA + paramB * fractionB;
}

describe('solveMixingCross', () => {
  it('splits arms so each component crosses to the other (15/4 -> 12 is 8:4)', () => {
    const parts = solveMixingCross(15, 4, 12);
    // partsA = |paramB - target| = |4 - 12| = 8 ; partsB = |target - paramA| = |12 - 15| = 3
    expect(parts.partsA).toBeCloseTo(8, 6);
    expect(parts.partsB).toBeCloseTo(3, 6);
    expect(parts.fractionA + parts.fractionB).toBeCloseTo(1, 9);
  });

  it('the solved fractions reproduce the target as their weighted average', () => {
    const parts = solveMixingCross(15, 4, 12);
    expect(blendedParameter(15, parts.fractionA, 4, parts.fractionB)).toBeCloseTo(12, 6);
  });

  it('a target equal to one component is a valid 100/0 blend, not infeasible', () => {
    const parts = solveMixingCross(15, 4, 15);
    expect(parts.infeasible).toBe(false);
    expect(parts.fractionA).toBeCloseTo(1, 9);
    expect(parts.fractionB).toBeCloseTo(0, 9);
  });

  it('flags infeasible when the target is outside the two parameters', () => {
    const parts = solveMixingCross(15, 4, 20);
    expect(parts.infeasible).toBe(true);
    expect(parts.note).toEqual({ code: 'targetOutOfRange', min: 4, max: 15 });
  });

  it('flags infeasible when both parameters are equal', () => {
    const parts = solveMixingCross(10, 10, 10);
    expect(parts.infeasible).toBe(true);
    expect(parts.note).toEqual({ code: 'parametersEqual' });
  });

  it('handles non-finite inputs without NaN', () => {
    const parts = solveMixingCross(NaN as unknown as number, 4, 12);
    expect(Number.isNaN(parts.fractionA)).toBe(false);
    expect(Number.isNaN(parts.fractionB)).toBe(false);
  });

  it('is order-independent (swapping A and B swaps the fractions)', () => {
    const ab = solveMixingCross(15, 4, 12);
    const ba = solveMixingCross(4, 15, 12);
    expect(ab.fractionA).toBeCloseTo(ba.fractionB, 9);
    expect(ab.fractionB).toBeCloseTo(ba.fractionA, 9);
  });
});

describe('quantitiesFromComponent', () => {
  it('solves the textbook example: 100 kg base at 15C + water at 30C -> 25C needs 200 kg (total 300)', () => {
    // Component A = 15 °C (the 100 kg we already have), Component B = 30 °C addition.
    const parts = solveMixingCross(15, 30, 25);
    const q = quantitiesFromComponent(parts, 100, 'A');
    expect(q.amountB).toBeCloseTo(200, 5);
    expect(q.total).toBeCloseTo(300, 5);
    // Round-trip: mixing those amounts really lands at 25 °C.
    expect(blendedParameter(15, q.amountA / q.total, 30, q.amountB / q.total)).toBeCloseTo(25, 5);
  });

  it('scaling from component B gives the matching total', () => {
    const parts = solveMixingCross(15, 30, 25);
    const q = quantitiesFromComponent(parts, 200, 'B');
    expect(q.amountA).toBeCloseTo(100, 5);
    expect(q.total).toBeCloseTo(300, 5);
  });

  it('does not divide by zero when the known component contributes nothing', () => {
    const parts = solveMixingCross(15, 4, 15); // target == A, so fractionB = 0
    const q = quantitiesFromComponent(parts, 50, 'B');
    expect(Number.isFinite(q.total)).toBe(true);
  });
});

describe('quantitiesFromTotal', () => {
  it('splits a total batch by the blend fractions', () => {
    const parts = solveMixingCross(15, 4, 12);
    const q = quantitiesFromTotal(parts, 300);
    expect(q.amountA + q.amountB).toBeCloseTo(300, 6);
    expect(blendedParameter(15, q.amountA / 300, 4, q.amountB / 300)).toBeCloseTo(12, 6);
  });

  it('clamps a negative total to zero', () => {
    const parts = solveMixingCross(15, 4, 12);
    const q = quantitiesFromTotal(parts, -50);
    expect(q.total).toBe(0);
    expect(q.amountA).toBe(0);
  });
});

describe('MIXING_PARAMETERS presets', () => {
  it('has a unit symbol for every non-custom preset', () => {
    for (const p of MIXING_PARAMETERS) {
      if (p.id !== 'custom') expect(p.unit.length).toBeGreaterThan(0);
    }
  });

  it('every preset default target is feasible for its own defaults', () => {
    for (const p of MIXING_PARAMETERS) {
      const parts = solveMixingCross(p.defaults.paramA, p.defaults.paramB, p.defaults.target);
      expect(parts.infeasible).toBe(false);
    }
  });
});
