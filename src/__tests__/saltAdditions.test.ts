import { describe, it, expect } from 'vitest';
import { solveSaltAdditions } from '@/lib/saltAdditions';
import { EMPTY_ION_PROFILE, IonProfile } from '@/lib/waterChemistry';

const roSource: IonProfile = { ...EMPTY_ION_PROFILE };

describe('solveSaltAdditions', () => {
  it('computes gypsum dose to raise sulfate from RO water', () => {
    const result = solveSaltAdditions(roSource, { sulfate: 557.7 }, 1);
    const gypsum = result.doses.find((d) => d.saltId === 'gypsum');
    expect(gypsum).toBeDefined();
    expect(gypsum!.grams).toBeCloseTo(1, 5);
  });

  it('scales linearly with batch volume for a 5000 L batch', () => {
    const result = solveSaltAdditions(roSource, { sulfate: 557.7 }, 5000);
    const gypsum = result.doses.find((d) => d.saltId === 'gypsum');
    expect(gypsum!.grams).toBeCloseTo(5000, 3);
  });

  it('scales linearly for a very small 1 L batch without rounding artifacts', () => {
    const result = solveSaltAdditions(roSource, { sulfate: 557.7 }, 1);
    const gypsum = result.doses.find((d) => d.saltId === 'gypsum');
    expect(gypsum!.grams).toBeCloseTo(1, 5);
  });

  it('detects infeasible target (target lower than source) and does not return negative grams', () => {
    const hardSource: IonProfile = { ...EMPTY_ION_PROFILE, calcium: 300 };
    const result = solveSaltAdditions(hardSource, { calcium: 50 }, 20);
    expect(result.infeasible).toBe(true);
    expect(result.notes.some((n) => n.code === 'ionBelowSource')).toBe(true);
    for (const dose of result.doses) {
      expect(dose.grams).toBeGreaterThanOrEqual(0);
    }
  });

  it('flags approximate results when multiple salts affect a shared ion', () => {
    const result = solveSaltAdditions(
      roSource,
      { calcium: 232.5, sulfate: 557.7, chloride: 482 },
      10,
    );
    const anyApproximate = result.doses.some((d) => d.approximate);
    expect(anyApproximate).toBe(true);
  });

  it('returns zero volume result as infeasible rather than dividing by zero', () => {
    const result = solveSaltAdditions(roSource, { calcium: 100 }, 0);
    expect(result.infeasible).toBe(true);
    expect(result.doses.length).toBe(0);
  });

  it('reports no additions needed and no infeasibility when source exactly meets target', () => {
    const source: IonProfile = { ...EMPTY_ION_PROFILE, calcium: 100, sulfate: 100 };
    const result = solveSaltAdditions(source, { calcium: 100, sulfate: 100 }, 20);
    expect(result.doses.length).toBe(0);
    expect(result.infeasible).toBe(false);
  });
});
