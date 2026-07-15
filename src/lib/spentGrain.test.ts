import { describe, expect, test } from 'vitest';
import { calculateSpentGrain, DEFAULT_SPENT_GRAIN } from './spentGrain';

describe('calculateSpentGrain', () => {
  test('at defaults, wet spent grain is ~1.25x the grist weight', () => {
    // 5 kg grist, 75% extract -> 1.25 kg dry; at 80% moisture -> 6.25 kg wet.
    const r = calculateSpentGrain({ grainKg: 5, ...DEFAULT_SPENT_GRAIN });
    expect(r.dryKg).toBe(1.25);
    expect(r.wetKg).toBe(6.25);
    expect(r.waterKg).toBe(5);
  });

  test('volume uses the wet density', () => {
    const r = calculateSpentGrain({ grainKg: 9, ...DEFAULT_SPENT_GRAIN });
    // dry 2.25 -> wet 11.25 kg -> /0.9 = 12.5 L
    expect(r.wetKg).toBe(11.25);
    expect(r.volumeL).toBe(12.5);
  });

  test('zero grain yields zero', () => {
    const r = calculateSpentGrain({ grainKg: 0, ...DEFAULT_SPENT_GRAIN });
    expect(r.wetKg).toBe(0);
    expect(r.volumeL).toBe(0);
  });

  test('negative / non-finite grain is treated as zero', () => {
    expect(calculateSpentGrain({ grainKg: -3, ...DEFAULT_SPENT_GRAIN }).wetKg).toBe(0);
    expect(calculateSpentGrain({ grainKg: NaN, ...DEFAULT_SPENT_GRAIN }).wetKg).toBe(0);
  });
});
