import { describe, it, expect } from 'vitest';
import { SOURCE_WATER_PROFILES, TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { hlToL, lToHl } from '@/lib/units';

describe('seed water profiles', () => {
  it('includes an RO/distilled profile with all-zero ions', () => {
    const ro = SOURCE_WATER_PROFILES.find((p) => p.id === 'ro-distilled');
    expect(ro).toBeDefined();
    expect(ro!.profile.calcium).toBe(0);
    expect(ro!.profile.alkalinity).toBe(0);
  });

  it('includes soft, medium, and hard tap water examples with increasing alkalinity', () => {
    const soft = SOURCE_WATER_PROFILES.find((p) => p.id === 'soft-tap')!;
    const medium = SOURCE_WATER_PROFILES.find((p) => p.id === 'medium-tap')!;
    const hard = SOURCE_WATER_PROFILES.find((p) => p.id === 'hard-tap')!;
    expect(soft.profile.alkalinity).toBeLessThan(medium.profile.alkalinity);
    expect(medium.profile.alkalinity).toBeLessThan(hard.profile.alkalinity);
  });

  it('includes Pale Ale, Pilsner, and Stout target style profiles', () => {
    const ids = TARGET_STYLE_PROFILES.map((p) => p.id);
    expect(ids).toContain('pale-ale');
    expect(ids).toContain('pilsner');
    expect(ids).toContain('stout');
  });
});

describe('HL <-> L conversion for commercial-scale entries', () => {
  it('converts hectoliter batch sizes to liters before any per-liter math', () => {
    const commercialBatchHl = 20;
    const volumeL = hlToL(commercialBatchHl);
    expect(volumeL).toBe(2000);
    expect(lToHl(volumeL)).toBe(commercialBatchHl);
  });
});
