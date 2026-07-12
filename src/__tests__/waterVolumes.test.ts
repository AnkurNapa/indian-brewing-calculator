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
});
