import { describe, it, expect } from 'vitest';
import { recommendSpargeAcidification, SPARGE_SAFE_PH_TARGET } from '@/lib/spargeAdjustment';
import { ACID_TYPES } from '@/lib/acidAdditions';

describe('recommendSpargeAcidification', () => {
  it('returns "no sparge acidification needed" for zero sparge volume (BIAB/no-sparge)', () => {
    const result = recommendSpargeAcidification(150, 0, ACID_TYPES[0]);
    expect(result.needsAcid).toBe(false);
    expect(result.message.toLowerCase()).toContain('no sparge acidification needed');
    expect(result.dose).toBeNull();
  });

  it('recommends no acid when RA is low', () => {
    const result = recommendSpargeAcidification(10, 15, ACID_TYPES[0]);
    expect(result.needsAcid).toBe(false);
  });

  it('recommends acid when RA is high', () => {
    const result = recommendSpargeAcidification(200, 15, ACID_TYPES[0]);
    expect(result.needsAcid).toBe(true);
    expect(result.dose).not.toBeNull();
    expect(result.dose!.mL).toBeGreaterThan(0);
  });

  it('exposes the safe pH target constant used for planning', () => {
    expect(SPARGE_SAFE_PH_TARGET).toBeLessThan(6.0);
    expect(SPARGE_SAFE_PH_TARGET).toBeGreaterThanOrEqual(5.6);
  });

  it('handles negative RA input gracefully without throwing', () => {
    expect(() => recommendSpargeAcidification(-20, 10, ACID_TYPES[0])).not.toThrow();
  });
});
