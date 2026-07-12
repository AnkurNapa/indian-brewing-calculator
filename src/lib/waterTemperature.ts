/**
 * Water temperature mixing calculator.
 *
 * Standard published thermal mixing (energy balance) relationship: when
 * two water volumes at different temperatures are combined, the
 * resulting temperature is the volume-weighted average (water's specific
 * heat is treated as constant across normal brewing temperature ranges,
 * the same simplifying assumption used throughout general brewing
 * strike-water calculations):
 *
 *   Tfinal = (V1*T1 + V2*T2) / (V1 + V2)
 *
 * Solving for V2 (the volume of hot/cold water to add) given a desired
 * Tfinal:
 *
 *   V2 = V1 * (Tfinal - T1) / (T2 - Tfinal)
 *
 * This covers both directions: adding hot water to raise the
 * temperature of a cooler volume, or adding cold water to lower the
 * temperature of a warmer volume (e.g. cooling wort/sparge water).
 */

function safeFinite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export interface WaterMixResult {
  /** Resulting temperature after mixing v1@t1 with v2@t2, °C. */
  resultingTempC: number;
  /** Resulting total volume, L. */
  totalVolumeL: number;
}

/**
 * Compute the resulting temperature when volume1 (L) at temp1 (°C) is
 * mixed with volume2 (L) at temp2 (°C).
 *
 * Edge case: if both volumes are 0, returns temp1 (arbitrary but
 * defined) with totalVolumeL 0, rather than dividing by zero.
 */
export function calculateMixedTemperature(
  volume1L: number,
  temp1C: number,
  volume2L: number,
  temp2C: number,
): WaterMixResult {
  const v1 = Number.isFinite(volume1L) && volume1L >= 0 ? volume1L : 0;
  const v2 = Number.isFinite(volume2L) && volume2L >= 0 ? volume2L : 0;
  const t1 = safeFinite(temp1C, 20);
  const t2 = safeFinite(temp2C, 20);

  const totalVolumeL = v1 + v2;
  if (totalVolumeL <= 0) {
    return { resultingTempC: t1, totalVolumeL: 0 };
  }

  const resultingTempC = (v1 * t1 + v2 * t2) / totalVolumeL;
  return { resultingTempC, totalVolumeL };
}

export interface VolumeToAddResult {
  /** Volume of the addition water (at additionTempC) needed, L. */
  volumeToAddL: number;
  /** Resulting total volume after adding, L. */
  totalVolumeL: number;
  /** True if the target temperature is not reachable by adding this addition water at all (see notes). */
  infeasible: boolean;
  notes: string[];
}

/**
 * Compute how much water at `additionTempC` must be added to
 * `startVolumeL` at `startTempC` to reach `targetTempC` for the
 * combined volume.
 *
 * Edge cases handled:
 *  - targetTempC already equals startTempC (within epsilon): 0 L needed.
 *  - targetTempC is not between startTempC and additionTempC (e.g.
 *    asking to raise the temperature using water that is colder than
 *    the target, or vice versa): flagged infeasible, since no positive
 *    volume of that addition water can reach that target -- a
 *    different-temperature source is needed instead.
 *  - additionTempC equals targetTempC exactly (not equal to start):
 *    mathematically requires infinite volume to shift the average that
 *    last increment toward the target; flagged infeasible with a note
 *    to use a hotter/colder addition water.
 */
export function calculateVolumeToAddForTargetTemp(
  startVolumeL: number,
  startTempC: number,
  targetTempC: number,
  additionTempC: number,
): VolumeToAddResult {
  const notes: string[] = [];
  const v1 = Number.isFinite(startVolumeL) && startVolumeL >= 0 ? startVolumeL : 0;
  const t1 = safeFinite(startTempC, 20);
  const tTarget = safeFinite(targetTempC, t1);
  const tAdd = safeFinite(additionTempC, t1);

  const EPSILON = 0.01;

  if (Math.abs(tTarget - t1) <= EPSILON) {
    return { volumeToAddL: 0, totalVolumeL: v1, infeasible: false, notes: ['Already at target temperature -- no addition needed.'] };
  }

  const raising = tTarget > t1;
  const additionIsUsable = raising ? tAdd > tTarget : tAdd < tTarget;

  if (!additionIsUsable) {
    notes.push(
      raising
        ? `Addition water at ${tAdd.toFixed(1)}°C is not hot enough to raise the mix above ${tTarget.toFixed(1)}°C -- use hotter water (must be > target temperature).`
        : `Addition water at ${tAdd.toFixed(1)}°C is not cold enough to lower the mix below ${tTarget.toFixed(1)}°C -- use colder water (must be < target temperature).`,
    );
    return { volumeToAddL: 0, totalVolumeL: v1, infeasible: true, notes };
  }

  const volumeToAddL = v1 * ((tTarget - t1) / (tAdd - tTarget));
  const totalVolumeL = v1 + volumeToAddL;

  return { volumeToAddL, totalVolumeL, infeasible: false, notes };
}
