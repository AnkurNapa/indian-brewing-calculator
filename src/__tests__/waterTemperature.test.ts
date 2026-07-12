import { describe, it, expect } from 'vitest';
import { calculateMixedTemperature, calculateVolumeToAddForTargetTemp } from '@/lib/waterTemperature';

describe('calculateMixedTemperature', () => {
  it('computes the volume-weighted average temperature', () => {
    const result = calculateMixedTemperature(50, 40, 25, 100);
    // (50*40 + 25*100) / 75 = (2000 + 2500) / 75 = 60
    expect(result.resultingTempC).toBeCloseTo(60, 5);
    expect(result.totalVolumeL).toBeCloseTo(75, 5);
  });

  it('returns temp1 with 0 total volume when both volumes are 0', () => {
    const result = calculateMixedTemperature(0, 40, 0, 100);
    expect(result.totalVolumeL).toBe(0);
    expect(Number.isNaN(result.resultingTempC)).toBe(false);
  });

  it('equal volumes at different temps average exactly to the midpoint', () => {
    const result = calculateMixedTemperature(10, 20, 10, 80);
    expect(result.resultingTempC).toBeCloseTo(50, 5);
  });
});

describe('calculateVolumeToAddForTargetTemp', () => {
  it('solves the worked example: 50L at 40C + boiling water -> 60C needs 25L', () => {
    const result = calculateVolumeToAddForTargetTemp(50, 40, 60, 100);
    expect(result.infeasible).toBe(false);
    expect(result.volumeToAddL).toBeCloseTo(25, 5);
    expect(result.totalVolumeL).toBeCloseTo(75, 5);
  });

  it('verifies the solved volume actually produces the target temperature when mixed', () => {
    const result = calculateVolumeToAddForTargetTemp(50, 40, 60, 100);
    const mixed = calculateMixedTemperature(50, 40, result.volumeToAddL, 100);
    expect(mixed.resultingTempC).toBeCloseTo(60, 3);
  });

  it('returns 0 L when already at target temperature', () => {
    const result = calculateVolumeToAddForTargetTemp(50, 60, 60, 100);
    expect(result.volumeToAddL).toBe(0);
    expect(result.infeasible).toBe(false);
  });

  it('flags infeasible when addition water is not hot enough to reach a higher target', () => {
    const result = calculateVolumeToAddForTargetTemp(50, 40, 60, 55);
    expect(result.infeasible).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('handles cooling: colder addition water lowers the mix temperature', () => {
    const result = calculateVolumeToAddForTargetTemp(50, 80, 60, 20);
    expect(result.infeasible).toBe(false);
    expect(result.volumeToAddL).toBeGreaterThan(0);
    const mixed = calculateMixedTemperature(50, 80, result.volumeToAddL, 20);
    expect(mixed.resultingTempC).toBeCloseTo(60, 3);
  });

  it('flags infeasible when addition water is not cold enough to reach a lower target', () => {
    const result = calculateVolumeToAddForTargetTemp(50, 80, 60, 65);
    expect(result.infeasible).toBe(true);
  });

  it('handles non-finite inputs without NaN', () => {
    const result = calculateVolumeToAddForTargetTemp(NaN as unknown as number, 40, 60, 100);
    expect(Number.isNaN(result.volumeToAddL)).toBe(false);
  });
});
