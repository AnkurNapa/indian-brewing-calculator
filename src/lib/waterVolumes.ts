/**
 * Mash/sparge water volume split calculator.
 *
 * Splits a target final (post-boil, into-fermenter) volume into the mash
 * water and sparge water volumes needed, working backward through the
 * standard published brewing water-loss chain:
 *
 *   mash water = grist weight * mash thickness ratio
 *   grain absorption loss = grist weight * absorption rate
 *   pre-boil volume = final volume + boil-off volume + trub/chiller loss
 *   total water needed = pre-boil volume + grain absorption loss
 *   sparge water = total water needed - mash water
 *
 * All rate constants (grain absorption ~1.0-1.1 L/kg, boil-off rate,
 * trub loss) are widely-published typical figures from general brewing
 * literature, not sourced from any proprietary tool -- and are exposed
 * as function parameters with sensible defaults so a brewer can
 * calibrate them to their own system.
 */

import { clamp } from './units';

export interface WaterVolumeInputs {
  /** Total grist weight, kg */
  grainWeightKg: number;
  /** Desired final volume into the fermenter, L */
  targetFinalVolumeL: number;
  /** Mash thickness, L of mash water per kg of grist. Typical: 2.5-3.5 L/kg. */
  mashThicknessLPerKg?: number;
  /** Grain absorption rate, L of water retained per kg of grist. Typical: 1.0-1.1 L/kg. */
  grainAbsorptionLPerKg?: number;
  /** Boil duration, minutes. */
  boilTimeMinutes?: number;
  /** Boil-off rate, L lost to evaporation per hour of boil. */
  boilOffRateLPerHour?: number;
  /** Trub/chiller/hose deadspace loss after the boil, L. */
  postBoilLossL?: number;
}

export interface WaterVolumeResult {
  /** Mash water volume, L. */
  mashWaterL: number;
  /** Sparge water volume, L. */
  spargeWaterL: number;
  /** Total water needed (mash + sparge), L. */
  totalWaterL: number;
  /** Volume in the kettle at the start of the boil, L. */
  preBoilVolumeL: number;
  /** Water absorbed and retained by the spent grain, L. */
  grainAbsorptionLossL: number;
  /** Water lost to evaporation during the boil, L. */
  boilOffLossL: number;
  /** True if the computed sparge water would be negative (mash alone exceeds total water needed) -- clamped to 0 and flagged. */
  spargeVolumeClamped: boolean;
  notes: string[];
}

const DEFAULT_MASH_THICKNESS_L_PER_KG = 3.0;
const DEFAULT_GRAIN_ABSORPTION_L_PER_KG = 1.04;
const DEFAULT_BOIL_TIME_MINUTES = 60;
const DEFAULT_BOIL_OFF_RATE_L_PER_HOUR = 4;
const DEFAULT_POST_BOIL_LOSS_L = 1.5;

function safePositive(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/**
 * Compute the mash and sparge water split needed to hit a target final
 * (into-fermenter) volume, given a grain bill weight and system loss
 * parameters.
 *
 * Edge cases handled:
 *  - Zero/negative grain weight: mash water and grain absorption loss
 *    are both 0; all pre-boil volume must come from sparge (single
 *    infusion/no-sparge brewing, e.g. extract brewing).
 *  - If mash water alone already exceeds total water needed (very thick
 *    mash relative to a small target volume), sparge water is clamped
 *    to 0 rather than returning negative, and `spargeVolumeClamped` is
 *    set with an explanatory note.
 */
export function calculateWaterVolumes(inputs: WaterVolumeInputs): WaterVolumeResult {
  const grainWeightKg = safePositive(inputs.grainWeightKg, 0);
  const targetFinalVolumeL = safePositive(inputs.targetFinalVolumeL, 0);
  const mashThicknessLPerKg = safePositive(inputs.mashThicknessLPerKg, DEFAULT_MASH_THICKNESS_L_PER_KG);
  const grainAbsorptionLPerKg = safePositive(inputs.grainAbsorptionLPerKg, DEFAULT_GRAIN_ABSORPTION_L_PER_KG);
  const boilTimeMinutes = safePositive(inputs.boilTimeMinutes, DEFAULT_BOIL_TIME_MINUTES);
  const boilOffRateLPerHour = safePositive(inputs.boilOffRateLPerHour, DEFAULT_BOIL_OFF_RATE_L_PER_HOUR);
  const postBoilLossL = safePositive(inputs.postBoilLossL, DEFAULT_POST_BOIL_LOSS_L);

  const notes: string[] = [];

  const mashWaterL = grainWeightKg * mashThicknessLPerKg;
  const grainAbsorptionLossL = grainWeightKg * grainAbsorptionLPerKg;
  const boilOffLossL = (boilTimeMinutes / 60) * boilOffRateLPerHour;

  const preBoilVolumeL = targetFinalVolumeL + boilOffLossL + postBoilLossL;
  const totalWaterL = preBoilVolumeL + grainAbsorptionLossL;

  const rawSpargeWaterL = totalWaterL - mashWaterL;
  const spargeVolumeClamped = rawSpargeWaterL < 0;
  const spargeWaterL = clamp(rawSpargeWaterL, 0, Number.MAX_SAFE_INTEGER);

  if (spargeVolumeClamped) {
    notes.push(
      `Mash water (${mashWaterL.toFixed(1)} L) alone exceeds the total water needed (${totalWaterL.toFixed(
        1,
      )} L) for this target volume -- sparge water clamped to 0. Consider a thinner mash or a smaller batch relative to grist weight.`,
    );
  }

  if (grainWeightKg <= 0) {
    notes.push('No grain weight entered -- mash water and grain absorption loss are 0 (e.g. extract brewing or full sparge-only planning).');
  }

  return {
    mashWaterL,
    spargeWaterL,
    totalWaterL,
    preBoilVolumeL,
    grainAbsorptionLossL,
    boilOffLossL,
    spargeVolumeClamped,
    notes,
  };
}
