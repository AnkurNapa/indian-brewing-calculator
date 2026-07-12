import { describe, it, expect } from 'vitest';
import { checkStyleCompliance } from '@/lib/styleCompliance';
import { BJCP_STYLES } from '@/lib/bjcpStyles';

const americanIpa = BJCP_STYLES.find((s) => s.id === 'american-ipa')!;

describe('checkStyleCompliance', () => {
  it('reports fully compliant when every stat is within the style range', () => {
    const result = checkStyleCompliance({ og: 1.06, fg: 1.011, ibu: 55, srm: 8, abvPercent: 6.5 }, americanIpa);
    expect(result.fullyCompliant).toBe(true);
    expect(result.parametersInRange).toBe(5);
    expect(result.og.inRange).toBe(true);
  });

  it('flags individual out-of-range parameters without marking the whole recipe compliant', () => {
    const result = checkStyleCompliance({ og: 1.06, fg: 1.011, ibu: 10, srm: 8, abvPercent: 6.5 }, americanIpa);
    expect(result.ibu.inRange).toBe(false);
    expect(result.og.inRange).toBe(true);
    expect(result.fullyCompliant).toBe(false);
    expect(result.parametersInRange).toBe(4);
  });

  it('treats range boundaries as inclusive', () => {
    const result = checkStyleCompliance(
      { og: americanIpa.og.min, fg: americanIpa.fg.max, ibu: americanIpa.ibu.min, srm: americanIpa.srm.max, abvPercent: americanIpa.abvPercent.min },
      americanIpa,
    );
    expect(result.fullyCompliant).toBe(true);
  });

  it('handles non-finite stat values without throwing, treating them as out of range', () => {
    const result = checkStyleCompliance(
      { og: NaN as unknown as number, fg: 1.011, ibu: 55, srm: 8, abvPercent: 6.5 },
      americanIpa,
    );
    expect(result.og.inRange).toBe(false);
    expect(Number.isNaN(result.og.value)).toBe(false);
  });

  it('every BJCP_STYLES entry has min <= max for all five ranges (data sanity check)', () => {
    for (const style of BJCP_STYLES) {
      expect(style.og.min).toBeLessThanOrEqual(style.og.max);
      expect(style.fg.min).toBeLessThanOrEqual(style.fg.max);
      expect(style.ibu.min).toBeLessThanOrEqual(style.ibu.max);
      expect(style.srm.min).toBeLessThanOrEqual(style.srm.max);
      expect(style.abvPercent.min).toBeLessThanOrEqual(style.abvPercent.max);
    }
  });
});
