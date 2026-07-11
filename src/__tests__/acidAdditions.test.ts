import { describe, it, expect } from 'vitest';
import { calculateAcidDose, ACID_TYPES } from '@/lib/acidAdditions';

describe('calculateAcidDose', () => {
  it('returns 0 mL when already at target pH (epsilon threshold, no float noise)', () => {
    const dose = calculateAcidDose(5.4, 5.4, 20, ACID_TYPES[0]);
    expect(dose.mL).toBe(0);
    expect(dose.alreadyAtTarget).toBe(true);
  });

  it('returns 0 mL for a tiny float-noise difference under epsilon', () => {
    const dose = calculateAcidDose(5.4 + 1e-9, 5.4, 20, ACID_TYPES[0]);
    expect(dose.mL).toBe(0);
    expect(dose.alreadyAtTarget).toBe(true);
  });

  it('returns 0 mL when current pH is already below target', () => {
    const dose = calculateAcidDose(5.2, 5.4, 20, ACID_TYPES[0]);
    expect(dose.mL).toBe(0);
    expect(dose.alreadyAtTarget).toBe(true);
  });

  it('computes a positive dose when current pH is above target', () => {
    const dose = calculateAcidDose(5.8, 5.4, 20, ACID_TYPES[0]);
    expect(dose.mL).toBeGreaterThan(0);
  });

  it('scales linearly with volume', () => {
    const small = calculateAcidDose(5.8, 5.4, 20, ACID_TYPES[0]);
    const large = calculateAcidDose(5.8, 5.4, 200, ACID_TYPES[0]);
    expect(large.mL).toBeCloseTo(small.mL * 10, 5);
  });

  it('returns 0 mL for zero volume', () => {
    const dose = calculateAcidDose(5.8, 5.4, 0, ACID_TYPES[0]);
    expect(dose.mL).toBe(0);
  });

  it('different acid types produce different mL for the same pH shift', () => {
    const lactic = calculateAcidDose(5.8, 5.4, 20, ACID_TYPES.find((a) => a.id === 'lactic88')!);
    const phosphoric10 = calculateAcidDose(5.8, 5.4, 20, ACID_TYPES.find((a) => a.id === 'phosphoric10')!);
    expect(lactic.mL).not.toBeCloseTo(phosphoric10.mL, 3);
  });
});
