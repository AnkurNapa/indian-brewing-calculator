import { describe, it, expect } from 'vitest';
import { calculateMcu, mcuToSrm, calculateSrm } from '@/lib/srm';

describe('calculateMcu', () => {
  it('computes MCU from grain weight, color, and volume', () => {
    // 5 kg (11.02 lb) at 2L color / 20L (5.28 gal) batch -> MCU = 22.05/5.28 ≈ 4.18
    const mcu = calculateMcu([{ weightKg: 5, colorLovibond: 2 }], 20);
    expect(mcu).toBeCloseTo(4.18, 1);
  });

  it('sums contributions across multiple grains', () => {
    const single = calculateMcu([{ weightKg: 5, colorLovibond: 2 }], 20);
    const withCrystal = calculateMcu(
      [
        { weightKg: 5, colorLovibond: 2 },
        { weightKg: 0.5, colorLovibond: 60 },
      ],
      20,
    );
    expect(withCrystal).toBeGreaterThan(single);
  });

  it('returns 0 for zero/negative volume instead of dividing by zero', () => {
    expect(calculateMcu([{ weightKg: 5, colorLovibond: 2 }], 0)).toBe(0);
    expect(calculateMcu([{ weightKg: 5, colorLovibond: 2 }], -5)).toBe(0);
  });

  it('ignores negative/non-finite weight or color gracefully', () => {
    const mcu = calculateMcu([{ weightKg: NaN as unknown as number, colorLovibond: -5 }], 20);
    expect(mcu).toBe(0);
  });
});

describe('mcuToSrm', () => {
  it('applies the Morey equation', () => {
    expect(mcuToSrm(4.18)).toBeCloseTo(1.4922 * 4.18 ** 0.6859, 3);
  });

  it('returns 0 SRM for 0 MCU', () => {
    expect(mcuToSrm(0)).toBe(0);
  });

  it('increases monotonically with MCU', () => {
    expect(mcuToSrm(20)).toBeGreaterThan(mcuToSrm(10));
  });
});

describe('calculateSrm', () => {
  it('produces a plausible pale-beer SRM for a light grist', () => {
    const srm = calculateSrm([{ weightKg: 5, colorLovibond: 2 }], 20);
    expect(srm).toBeGreaterThan(1);
    expect(srm).toBeLessThan(6);
  });

  it('produces a much higher SRM for a heavily roasted grist', () => {
    const pale = calculateSrm([{ weightKg: 5, colorLovibond: 2 }], 20);
    const dark = calculateSrm([{ weightKg: 5, colorLovibond: 500 }], 20);
    expect(dark).toBeGreaterThan(pale * 5);
  });
});
