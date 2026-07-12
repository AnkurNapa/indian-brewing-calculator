import { describe, it, expect } from 'vitest';
import { solveDilutionRatio, dilutionResultToVolumes } from '@/lib/dilutionOptimizer';
import { EMPTY_ION_PROFILE, IonProfile } from '@/lib/waterChemistry';

const hardTap: IonProfile = {
  calcium: 150,
  magnesium: 20,
  sodium: 25,
  sulfate: 60,
  chloride: 40,
  bicarbonate: 280,
  alkalinity: 230,
};

describe('solveDilutionRatio', () => {
  it('returns no dilution needed when source already meets every ceiling', () => {
    const result = solveDilutionRatio(hardTap, EMPTY_ION_PROFILE, { calcium: 300, alkalinity: 300 });
    expect(result.noDilutionNeeded).toBe(true);
    expect(result.sourceFraction).toBe(1);
    expect(result.dilutantFraction).toBe(0);
  });

  it('solves a single-ion constraint exactly via the linear blend equation', () => {
    // alkalinity ceiling of 115 is exactly half of 230, diluting with 0 alkalinity RO water.
    const result = solveDilutionRatio(hardTap, EMPTY_ION_PROFILE, { alkalinity: 115 });
    expect(result.noDilutionNeeded).toBe(false);
    expect(result.bindingIon).toBe('alkalinity');
    expect(result.sourceFraction).toBeCloseTo(0.5, 5);
    expect(result.resultingProfile.alkalinity).toBeCloseTo(115, 5);
  });

  it('picks the tightest (most-diluting) constraint when multiple ions need dilution', () => {
    const result = solveDilutionRatio(hardTap, EMPTY_ION_PROFILE, {
      alkalinity: 115, // requires sourceFraction 0.5
      calcium: 30, // requires sourceFraction 0.2 -- tighter
    });
    expect(result.bindingIon).toBe('calcium');
    expect(result.sourceFraction).toBeCloseTo(0.2, 5);
    // Satisfying the tighter constraint should also satisfy the looser one.
    expect(result.resultingProfile.alkalinity).toBeLessThanOrEqual(115 + 1e-9);
  });

  it('flags an ion as unsatisfiable when the dilutant is not lower for that ion', () => {
    const saltyDilutant: IonProfile = { ...EMPTY_ION_PROFILE, sodium: 50 };
    const result = solveDilutionRatio({ ...EMPTY_ION_PROFILE, sodium: 40 }, saltyDilutant, { sodium: 10 });
    expect(result.notes.some((n) => n.includes('sodium'))).toBe(true);
  });

  it('never returns a negative or >1 source fraction', () => {
    const result = solveDilutionRatio(hardTap, EMPTY_ION_PROFILE, { calcium: -50 });
    expect(result.sourceFraction).toBeGreaterThanOrEqual(0);
    expect(result.sourceFraction).toBeLessThanOrEqual(1);
  });

  it('dilutionResultToVolumes splits a total volume proportionally', () => {
    const result = solveDilutionRatio(hardTap, EMPTY_ION_PROFILE, { alkalinity: 115 });
    const volumes = dilutionResultToVolumes(result, 20);
    expect(volumes.sourceVolumeL).toBeCloseTo(10, 5);
    expect(volumes.dilutantVolumeL).toBeCloseTo(10, 5);
    expect(volumes.sourceVolumeL + volumes.dilutantVolumeL).toBeCloseTo(20, 5);
  });

  it('handles zero/negative total volume without NaN', () => {
    const result = solveDilutionRatio(hardTap, EMPTY_ION_PROFILE, { alkalinity: 115 });
    const volumes = dilutionResultToVolumes(result, -5);
    expect(volumes.sourceVolumeL).toBe(0);
    expect(volumes.dilutantVolumeL).toBe(0);
  });
});
