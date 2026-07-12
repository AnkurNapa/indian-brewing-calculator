import { describe, it, expect } from 'vitest';
import { calculateForceCarbonationPressure } from '@/lib/forceCarbonation';

describe('calculateForceCarbonationPressure', () => {
  it('requires more pressure for higher target CO2 volumes at the same temperature', () => {
    const low = calculateForceCarbonationPressure(2.0, 4);
    const high = calculateForceCarbonationPressure(3.0, 4);
    expect(high.pressurePsi).toBeGreaterThan(low.pressurePsi);
  });

  it('requires more pressure at a warmer temperature for the same target volumes', () => {
    const cold = calculateForceCarbonationPressure(2.5, 2);
    const warm = calculateForceCarbonationPressure(2.5, 15);
    expect(warm.pressurePsi).toBeGreaterThan(cold.pressurePsi);
  });

  it('converts psi to bar consistently', () => {
    const result = calculateForceCarbonationPressure(2.5, 4);
    expect(result.pressureBar).toBeCloseTo(result.pressurePsi / 14.5038, 5);
  });

  it('returns 0 pressure for non-positive target volumes instead of NaN', () => {
    expect(calculateForceCarbonationPressure(0, 4).pressurePsi).toBe(0);
    expect(calculateForceCarbonationPressure(-1, 4).pressurePsi).toBe(0);
  });

  it('never returns negative pressure', () => {
    const result = calculateForceCarbonationPressure(0.5, 4);
    expect(result.pressurePsi).toBeGreaterThanOrEqual(0);
  });

  it('handles non-finite temperature without NaN', () => {
    const result = calculateForceCarbonationPressure(2.5, NaN as unknown as number);
    expect(Number.isNaN(result.pressurePsi)).toBe(false);
  });
});
