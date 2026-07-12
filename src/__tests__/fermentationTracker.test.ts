import { describe, it, expect } from 'vitest';
import { calculateFermentationStats, sortEntriesByTime, FermentationEntry } from '@/lib/fermentationTracker';

const DAY_MS = 24 * 60 * 60 * 1000;

function entry(id: string, timestampMs: number, gravitySg: number, temperatureC = 20): FermentationEntry {
  return { id, timestampMs, gravitySg, temperatureC };
}

describe('sortEntriesByTime', () => {
  it('sorts entries oldest-first regardless of input order', () => {
    const entries = [entry('c', 3000, 1.02), entry('a', 1000, 1.05), entry('b', 2000, 1.03)];
    const sorted = sortEntriesByTime(entries);
    expect(sorted.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input array', () => {
    const entries = [entry('b', 2000, 1.03), entry('a', 1000, 1.05)];
    sortEntriesByTime(entries);
    expect(entries[0].id).toBe('b');
  });
});

describe('calculateFermentationStats', () => {
  it('returns all-null/false stats for an empty entry list', () => {
    const stats = calculateFermentationStats([]);
    expect(stats.originalGravity).toBeNull();
    expect(stats.currentGravity).toBeNull();
    expect(stats.abvSoFar).toBeNull();
    expect(stats.apparentAttenuationPercent).toBeNull();
    expect(stats.likelyComplete).toBe(false);
  });

  it('handles a single entry: OG and currentGravity set, ABV/attenuation still null', () => {
    const stats = calculateFermentationStats([entry('a', 1000, 1.05)]);
    expect(stats.originalGravity).toBe(1.05);
    expect(stats.currentGravity).toBe(1.05);
    expect(stats.abvSoFar).toBeNull();
    expect(stats.apparentAttenuationPercent).toBeNull();
  });

  it('computes ABV and attenuation from the first and last entries (order-independent input)', () => {
    const stats = calculateFermentationStats([
      entry('b', 2000, 1.03),
      entry('a', 1000, 1.05),
      entry('c', 3000, 1.01),
    ]);
    expect(stats.originalGravity).toBe(1.05);
    expect(stats.currentGravity).toBe(1.01);
    expect(stats.abvSoFar).toBeGreaterThan(0);
    expect(stats.apparentAttenuationPercent).toBeGreaterThan(0);
  });

  it('flags likelyComplete when the last two readings are >=24h apart with negligible gravity change', () => {
    const stats = calculateFermentationStats([
      entry('a', 0, 1.05),
      entry('b', 5 * DAY_MS, 1.012),
      entry('c', 6 * DAY_MS, 1.011),
    ]);
    expect(stats.likelyComplete).toBe(true);
  });

  it('does not flag likelyComplete when readings are close together in time even if gravity is stable', () => {
    const stats = calculateFermentationStats([
      entry('a', 0, 1.012),
      entry('b', 2 * 60 * 60 * 1000, 1.012), // 2 hours apart
    ]);
    expect(stats.likelyComplete).toBe(false);
  });

  it('does not flag likelyComplete when gravity is still actively dropping', () => {
    const stats = calculateFermentationStats([
      entry('a', 0, 1.05),
      entry('b', 2 * DAY_MS, 1.02),
    ]);
    expect(stats.likelyComplete).toBe(false);
  });
});
