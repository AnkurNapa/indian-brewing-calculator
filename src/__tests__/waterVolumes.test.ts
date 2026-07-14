import { describe, it, expect } from 'vitest';
import { calculateWaterVolumes } from '@/lib/waterVolumes';

describe('calculateWaterVolumes', () => {
  it('computes a typical 5kg grist / 20L batch split with default rates', () => {
    const result = calculateWaterVolumes({ grainWeightKg: 5, targetFinalVolumeL: 20 });
    // mashWater = 5 * 3.0 = 15
    expect(result.mashWaterL).toBeCloseTo(15, 5);
    // grainAbsorption = 5 * 1.04 = 5.2
    expect(result.grainAbsorptionLossL).toBeCloseTo(5.2, 5);
    // boilOff = (60/60) * 4 = 4
    expect(result.boilOffLossL).toBeCloseTo(4, 5);
    // preBoil = 20 + 4 + 1.5 = 25.5
    expect(result.preBoilVolumeL).toBeCloseTo(25.5, 5);
    // total = 25.5 + 5.2 = 30.7
    expect(result.totalWaterL).toBeCloseTo(30.7, 5);
    // sparge = 30.7 - 15 = 15.7
    expect(result.spargeWaterL).toBeCloseTo(15.7, 5);
    expect(result.spargeVolumeClamped).toBe(false);
  });

  it('respects custom mash thickness, absorption, boil time, boil-off, and post-boil loss', () => {
    const result = calculateWaterVolumes({
      grainWeightKg: 10,
      targetFinalVolumeL: 40,
      mashThicknessLPerKg: 2.5,
      grainAbsorptionLPerKg: 1.1,
      boilTimeMinutes: 90,
      boilOffRateLPerHour: 5,
      postBoilLossL: 2,
    });
    expect(result.mashWaterL).toBeCloseTo(25, 5);
    expect(result.grainAbsorptionLossL).toBeCloseTo(11, 5);
    expect(result.boilOffLossL).toBeCloseTo(7.5, 5);
    expect(result.preBoilVolumeL).toBeCloseTo(49.5, 5);
    expect(result.totalWaterL).toBeCloseTo(60.5, 5);
    expect(result.spargeWaterL).toBeCloseTo(35.5, 5);
  });

  it('handles zero grain weight (e.g. extract brewing) without negative or NaN loss terms', () => {
    const result = calculateWaterVolumes({ grainWeightKg: 0, targetFinalVolumeL: 20 });
    expect(result.mashWaterL).toBe(0);
    expect(result.grainAbsorptionLossL).toBe(0);
    expect(Number.isNaN(result.spargeWaterL)).toBe(false);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('clamps sparge water to 0 and flags it when mash water alone exceeds total water needed', () => {
    const result = calculateWaterVolumes({
      grainWeightKg: 20,
      targetFinalVolumeL: 5,
      mashThicknessLPerKg: 5, // 100 L mash water for a tiny 5L batch
    });
    expect(result.spargeWaterL).toBe(0);
    expect(result.spargeVolumeClamped).toBe(true);
    expect(result.notes.some((n) => n.includes('clamped'))).toBe(true);
  });

  it('clamps negative/non-finite inputs to defaults or zero instead of producing NaN', () => {
    const result = calculateWaterVolumes({
      grainWeightKg: NaN as unknown as number,
      targetFinalVolumeL: -5,
    });
    expect(Number.isNaN(result.mashWaterL)).toBe(false);
    expect(Number.isNaN(result.spargeWaterL)).toBe(false);
    expect(result.mashWaterL).toBeGreaterThanOrEqual(0);
  });

  it('total water always equals mash water plus sparge water when not clamped', () => {
    const result = calculateWaterVolumes({ grainWeightKg: 5, targetFinalVolumeL: 20 });
    expect(result.mashWaterL + result.spargeWaterL).toBeCloseTo(result.totalWaterL, 5);
  });

  it('defaults to fly sparge with a single batch (backward compatible)', () => {
    const result = calculateWaterVolumes({ grainWeightKg: 5, targetFinalVolumeL: 20 });
    expect(result.spargeMethod).toBe('fly');
    expect(result.spargeBatchCount).toBe(1);
    expect(result.spargeBatchVolumeL).toBeCloseTo(result.spargeWaterL, 5);
  });
});

describe('calculateWaterVolumes sparge methods', () => {
  const base = { grainWeightKg: 5, targetFinalVolumeL: 20 }; // sparge = 15.7 L with defaults

  it('batch sparge splits the same total sparge water into N equal batches', () => {
    const fly = calculateWaterVolumes(base);
    const batch = calculateWaterVolumes({ ...base, spargeMethod: 'batch', spargeBatchCount: 2 });
    // Same mash and same total sparge water as fly -- only the split differs.
    expect(batch.mashWaterL).toBeCloseTo(fly.mashWaterL, 5);
    expect(batch.spargeWaterL).toBeCloseTo(fly.spargeWaterL, 5);
    expect(batch.spargeBatchCount).toBe(2);
    expect(batch.spargeBatchVolumeL).toBeCloseTo(fly.spargeWaterL / 2, 5);
    // Each batch summed back equals the total sparge water.
    expect(batch.spargeBatchVolumeL * batch.spargeBatchCount).toBeCloseTo(batch.spargeWaterL, 5);
  });

  it('batch count is clamped to at least 1 and floored to a whole number', () => {
    const zero = calculateWaterVolumes({ ...base, spargeMethod: 'batch', spargeBatchCount: 0 });
    expect(zero.spargeBatchCount).toBeGreaterThanOrEqual(1);
    const frac = calculateWaterVolumes({ ...base, spargeMethod: 'batch', spargeBatchCount: 3.9 });
    expect(frac.spargeBatchCount).toBe(3);
  });

  it('no-sparge puts all water in the mash and zeroes the sparge', () => {
    const result = calculateWaterVolumes({ ...base, spargeMethod: 'noSparge' });
    expect(result.spargeWaterL).toBe(0);
    expect(result.spargeBatchCount).toBe(0);
    expect(result.mashWaterL).toBeCloseTo(result.totalWaterL, 5);
    // Effective thickness is total water / grist, thinner than a fly mash.
    expect(result.effectiveMashThicknessLPerKg).toBeCloseTo(result.totalWaterL / 5, 5);
    expect(result.notes.some((n) => n.toLowerCase().includes('no-sparge'))).toBe(true);
  });

  it('mash + sparge == total for every method (mass balance holds)', () => {
    for (const spargeMethod of ['fly', 'batch', 'noSparge'] as const) {
      const r = calculateWaterVolumes({ ...base, spargeMethod, spargeBatchCount: 3 });
      expect(r.mashWaterL + r.spargeWaterL).toBeCloseTo(r.totalWaterL, 5);
    }
  });
});
