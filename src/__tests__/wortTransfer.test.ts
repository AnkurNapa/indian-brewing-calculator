import { describe, it, expect } from 'vitest';
import {
  calculateTransferTimeMinutes,
  calculateRequiredFlowRate,
  calculateVolumeTransferred,
} from '@/lib/wortTransfer';

describe('calculateTransferTimeMinutes', () => {
  it('computes time = volume / flow rate', () => {
    expect(calculateTransferTimeMinutes(60, 10)).toBeCloseTo(6, 5);
  });

  it('returns 0 for zero/negative volume or flow rate instead of NaN/Infinity', () => {
    expect(calculateTransferTimeMinutes(0, 10)).toBe(0);
    expect(calculateTransferTimeMinutes(60, 0)).toBe(0);
    expect(calculateTransferTimeMinutes(-5, 10)).toBe(0);
  });
});

describe('calculateRequiredFlowRate', () => {
  it('computes flow rate = volume / time', () => {
    expect(calculateRequiredFlowRate(60, 6)).toBeCloseTo(10, 5);
  });

  it('returns 0 for zero/negative volume or time', () => {
    expect(calculateRequiredFlowRate(0, 6)).toBe(0);
    expect(calculateRequiredFlowRate(60, 0)).toBe(0);
  });

  it('is the mathematical inverse of calculateTransferTimeMinutes', () => {
    const time = calculateTransferTimeMinutes(45, 7.5);
    const rate = calculateRequiredFlowRate(45, time);
    expect(rate).toBeCloseTo(7.5, 5);
  });
});

describe('calculateVolumeTransferred', () => {
  it('computes volume = flow rate * time', () => {
    expect(calculateVolumeTransferred(10, 6)).toBeCloseTo(60, 5);
  });

  it('handles zero/negative inputs without NaN', () => {
    expect(calculateVolumeTransferred(-10, 6)).toBe(0);
    expect(calculateVolumeTransferred(10, -6)).toBe(0);
  });
});
