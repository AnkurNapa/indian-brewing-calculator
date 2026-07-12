import { describe, it, expect } from 'vitest';
import { calculateGrainBedDepth, evaluateRunoffCutoff, STUCK_MASH_RISK_DEPTH_CM } from '@/lib/lautering';

describe('calculateGrainBedDepth', () => {
  it('computes depth from grain weight and tun diameter', () => {
    // 20 kg grain * 0.7 L/kg = 14 L = 14000 cm^3 bed volume.
    // Tun diameter 50 cm -> radius 25 cm -> area = pi*625 = 1963.5 cm^2
    // depth = 14000 / 1963.5 = 7.13 cm
    const result = calculateGrainBedDepth(20, 50);
    expect(result.bedVolumeL).toBeCloseTo(14, 5);
    expect(result.bedDepthCm).toBeCloseTo(7.13, 1);
    expect(result.stuckMashRisk).toBe(false);
  });

  it('flags stuck-mash risk for a very deep bed (narrow tun, heavy grist)', () => {
    const result = calculateGrainBedDepth(50, 30);
    expect(result.bedDepthCm).toBeGreaterThan(STUCK_MASH_RISK_DEPTH_CM);
    expect(result.stuckMashRisk).toBe(true);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('returns 0 depth for zero grain weight or zero diameter instead of NaN', () => {
    expect(calculateGrainBedDepth(0, 50).bedDepthCm).toBe(0);
    expect(calculateGrainBedDepth(20, 0).bedDepthCm).toBe(0);
  });

  it('a wider tun produces a shallower bed for the same grain weight', () => {
    const narrow = calculateGrainBedDepth(20, 30);
    const wide = calculateGrainBedDepth(20, 60);
    expect(wide.bedDepthCm).toBeLessThan(narrow.bedDepthCm);
  });

  it('respects a custom bed-volume-per-kg calibration', () => {
    const defaultResult = calculateGrainBedDepth(20, 50);
    const customResult = calculateGrainBedDepth(20, 50, 1.0);
    expect(customResult.bedVolumeL).toBeGreaterThan(defaultResult.bedVolumeL);
    expect(customResult.bedDepthCm).toBeGreaterThan(defaultResult.bedDepthCm);
  });
});

describe('evaluateRunoffCutoff', () => {
  it('recommends continuing when runnings are above the cutoff', () => {
    const result = evaluateRunoffCutoff(1.015, 1.008);
    expect(result.shouldContinueCollecting).toBe(true);
    expect(result.gravityPointsAboveCutoff).toBeCloseTo(7, 5);
  });

  it('recommends stopping when runnings are at or below the cutoff', () => {
    const result = evaluateRunoffCutoff(1.006, 1.008);
    expect(result.shouldContinueCollecting).toBe(false);
    expect(result.gravityPointsAboveCutoff).toBe(0);
  });

  it('uses a sensible default cutoff of 1.008 when not specified', () => {
    const result = evaluateRunoffCutoff(1.009);
    expect(result.shouldContinueCollecting).toBe(true);
  });

  it('handles non-finite current gravity without NaN', () => {
    const result = evaluateRunoffCutoff(NaN as unknown as number);
    expect(Number.isNaN(result.gravityPointsAboveCutoff)).toBe(false);
  });
});
