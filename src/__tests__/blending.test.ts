import { describe, it, expect } from 'vitest';
import { blendIonProfiles, blendIonProfilesByVolume } from '@/lib/blending';
import { EMPTY_ION_PROFILE, IonProfile } from '@/lib/waterChemistry';

const soft: IonProfile = { ...EMPTY_ION_PROFILE, calcium: 20, alkalinity: 25 };
const hard: IonProfile = { ...EMPTY_ION_PROFILE, calcium: 200, alkalinity: 300 };

describe('blendIonProfiles', () => {
  it('reduces cleanly to source A at 100%', () => {
    const blended = blendIonProfiles(soft, hard, 100);
    expect(blended.calcium).toBeCloseTo(soft.calcium, 5);
    expect(blended.alkalinity).toBeCloseTo(soft.alkalinity, 5);
  });

  it('reduces cleanly to source B at 0%', () => {
    const blended = blendIonProfiles(soft, hard, 0);
    expect(blended.calcium).toBeCloseTo(hard.calcium, 5);
  });

  it('is volume-weighted, not naive 50/50, for two very different sources', () => {
    const blended = blendIonProfiles(soft, hard, 25);
    // 25% soft + 75% hard
    const expectedCalcium = soft.calcium * 0.25 + hard.calcium * 0.75;
    expect(blended.calcium).toBeCloseTo(expectedCalcium, 5);
    // Verify it is NOT the naive 50/50 average.
    const naive5050 = (soft.calcium + hard.calcium) / 2;
    expect(blended.calcium).not.toBeCloseTo(naive5050, 1);
  });

  it('clamps percentA outside 0-100 range', () => {
    const over = blendIonProfiles(soft, hard, 150);
    expect(over.calcium).toBeCloseTo(soft.calcium, 5);
    const under = blendIonProfiles(soft, hard, -50);
    expect(under.calcium).toBeCloseTo(hard.calcium, 5);
  });
});

describe('blendIonProfilesByVolume', () => {
  it('computes a volume-weighted blend from explicit volumes', () => {
    const blended = blendIonProfilesByVolume(soft, 10, hard, 30);
    // 10/(10+30) = 25% soft
    const expectedCalcium = soft.calcium * 0.25 + hard.calcium * 0.75;
    expect(blended.calcium).toBeCloseTo(expectedCalcium, 5);
  });

  it('returns a zeroed profile when both volumes are zero, no divide-by-zero', () => {
    const blended = blendIonProfilesByVolume(soft, 0, hard, 0);
    expect(blended.calcium).toBe(0);
    expect(Number.isNaN(blended.calcium)).toBe(false);
  });
});
