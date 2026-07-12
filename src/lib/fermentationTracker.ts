/**
 * Fermentation tracking data model and pure calculations. Storage
 * (localStorage persistence) lives in the useFermentationBatches hook;
 * this module only handles the data shape and derived stats so the math
 * is independently testable.
 */

import { calculateAbvAdvanced, calculateAttenuation } from './fermentation';

export interface FermentationEntry {
  id: string;
  /** Unix epoch milliseconds. */
  timestampMs: number;
  gravitySg: number;
  temperatureC: number;
  note?: string;
}

export interface FermentationBatch {
  id: string;
  name: string;
  entries: FermentationEntry[];
}

/** Sort entries oldest-first, a stable ordering used by every derived calculation below. */
export function sortEntriesByTime(entries: FermentationEntry[]): FermentationEntry[] {
  return [...entries].sort((a, b) => a.timestampMs - b.timestampMs);
}

export interface FermentationStats {
  /** First recorded gravity (treated as OG), or null if no entries. */
  originalGravity: number | null;
  /** Most recent recorded gravity (treated as current/final gravity), or null if no entries. */
  currentGravity: number | null;
  /** ABV so far, using the advanced formula, or null if fewer than 2 entries. */
  abvSoFar: number | null;
  /** Apparent attenuation %, or null if fewer than 2 entries. */
  apparentAttenuationPercent: number | null;
  /** True if the two most recent entries are >=24h apart with negligible gravity change (likely finished). */
  likelyComplete: boolean;
}

/** Minimum gravity-point change (SG*1000) below which fermentation is considered "stalled/done" between two readings. */
const STABLE_GRAVITY_POINTS_THRESHOLD = 1;
/** Minimum time gap (ms) between the two most recent readings to trust a "stable" call. */
const MIN_STABLE_GAP_MS = 24 * 60 * 60 * 1000;

/**
 * Compute derived fermentation stats from a batch's entries.
 *
 * Edge cases handled:
 *  - Empty entries: every stat is null/false rather than throwing.
 *  - Single entry: OG/currentGravity both equal that entry's gravity;
 *    ABV/attenuation/likelyComplete require at least 2 entries.
 */
export function calculateFermentationStats(entries: FermentationEntry[]): FermentationStats {
  const sorted = sortEntriesByTime(entries);

  if (sorted.length === 0) {
    return {
      originalGravity: null,
      currentGravity: null,
      abvSoFar: null,
      apparentAttenuationPercent: null,
      likelyComplete: false,
    };
  }

  const originalGravity = sorted[0].gravitySg;
  const currentGravity = sorted[sorted.length - 1].gravitySg;

  if (sorted.length < 2) {
    return {
      originalGravity,
      currentGravity,
      abvSoFar: null,
      apparentAttenuationPercent: null,
      likelyComplete: false,
    };
  }

  const abvSoFar = calculateAbvAdvanced(originalGravity, currentGravity);
  const apparentAttenuationPercent = calculateAttenuation(originalGravity, currentGravity).apparentAttenuationPercent;

  const last = sorted[sorted.length - 1];
  const secondLast = sorted[sorted.length - 2];
  const gapMs = last.timestampMs - secondLast.timestampMs;
  const gravityPointsChange = Math.abs((last.gravitySg - secondLast.gravitySg) * 1000);

  const FLOAT_EPSILON = 1e-6;
  const likelyComplete =
    gapMs >= MIN_STABLE_GAP_MS && gravityPointsChange <= STABLE_GRAVITY_POINTS_THRESHOLD + FLOAT_EPSILON;

  return { originalGravity, currentGravity, abvSoFar, apparentAttenuationPercent, likelyComplete };
}
