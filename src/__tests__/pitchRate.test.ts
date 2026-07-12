import { describe, it, expect } from 'vitest';
import { calculatePitchRate, calculateRepitchSlurryVolume } from '@/lib/pitchRate';

describe('calculatePitchRate', () => {
  it('requires more cells for lager than ale at the same gravity/volume', () => {
    const ale = calculatePitchRate(1.05, 20, 'ale');
    const lager = calculatePitchRate(1.05, 20, 'lager');
    expect(lager.targetCellsBillion).toBeGreaterThan(ale.targetCellsBillion);
  });

  it('requires more cells for higher gravity at the same volume/style', () => {
    const low = calculatePitchRate(1.04, 20, 'ale');
    const high = calculatePitchRate(1.08, 20, 'ale');
    expect(high.targetCellsBillion).toBeGreaterThan(low.targetCellsBillion);
  });

  it('scales linearly with batch volume', () => {
    const small = calculatePitchRate(1.05, 10, 'ale');
    const large = calculatePitchRate(1.05, 20, 'ale');
    expect(large.targetCellsBillion).toBeCloseTo(small.targetCellsBillion * 2, 5);
  });

  it('returns zero doses for non-positive volume or gravity instead of NaN', () => {
    const result = calculatePitchRate(1.05, 0, 'ale');
    expect(result.targetCellsBillion).toBe(0);
    expect(result.dryYeastGrams).toBe(0);
    expect(result.slurryMl).toBe(0);
  });

  it('dry yeast grams and slurry mL are both positive for a valid batch', () => {
    const result = calculatePitchRate(1.05, 20, 'ale');
    expect(result.dryYeastGrams).toBeGreaterThan(0);
    expect(result.slurryMl).toBeGreaterThan(0);
  });
});

describe('calculateRepitchSlurryVolume', () => {
  it('computes the slurry volume needed accounting for density and viability', () => {
    // 400 billion cells needed, slurry at 1 billion/mL, 100% viable -> 400 mL.
    const result = calculateRepitchSlurryVolume(400, 1, 100);
    expect(result.slurryMlNeeded).toBeCloseTo(400, 5);
    expect(result.viableCellsDeliveredBillion).toBeCloseTo(400, 5);
  });

  it('requires more slurry volume when viability is lower for the same target', () => {
    const highViability = calculateRepitchSlurryVolume(400, 1, 90);
    const lowViability = calculateRepitchSlurryVolume(400, 1, 50);
    expect(lowViability.slurryMlNeeded).toBeGreaterThan(highViability.slurryMlNeeded);
  });

  it('returns 0 mL for non-positive target, density, or viability instead of NaN/Infinity', () => {
    expect(calculateRepitchSlurryVolume(0, 1, 90).slurryMlNeeded).toBe(0);
    expect(calculateRepitchSlurryVolume(400, 0, 90).slurryMlNeeded).toBe(0);
    expect(calculateRepitchSlurryVolume(400, 1, 0).slurryMlNeeded).toBe(0);
  });

  it('clamps viability above 100% instead of under-delivering the required volume', () => {
    const result = calculateRepitchSlurryVolume(400, 1, 150);
    expect(result.slurryMlNeeded).toBeCloseTo(400, 5);
  });

  it('chains naturally with calculatePitchRate to size a repitch from a target batch', () => {
    const pitchTarget = calculatePitchRate(1.05, 20, 'ale');
    const repitch = calculateRepitchSlurryVolume(pitchTarget.targetCellsBillion, 1.2, 85);
    expect(repitch.slurryMlNeeded).toBeGreaterThan(0);
    expect(repitch.viableCellsDeliveredBillion).toBeCloseTo(pitchTarget.targetCellsBillion, 3);
  });
});
