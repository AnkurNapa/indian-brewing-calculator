/**
 * Two-source water blending math.
 *
 * Given two water sources with independent ion profiles and volumes (or
 * a percentage ratio), computes the resulting volume-weighted average
 * ion profile. This is a straightforward mixing calculation: each ion's
 * blended concentration is the volume-weighted average of the two
 * source concentrations.
 */

import { IonProfile } from './waterChemistry';
import { clamp } from './units';

const ION_FIELDS: (keyof IonProfile)[] = [
  'calcium',
  'magnesium',
  'sodium',
  'sulfate',
  'chloride',
  'bicarbonate',
  'alkalinity',
];

/**
 * Blend two ion profiles using a percentage (0-100) of source A in the
 * final blend (the remainder is source B). This is volume-weighted, not
 * a naive average -- at ratio 0 the result is exactly source B, at 100
 * it is exactly source A, and values in between are weighted by the
 * actual proportion.
 */
export function blendIonProfiles(
  sourceA: IonProfile,
  sourceB: IonProfile,
  percentA: number,
): IonProfile {
  const safePercentA = clamp(Number.isFinite(percentA) ? percentA : 0, 0, 100);
  const fractionA = safePercentA / 100;
  const fractionB = 1 - fractionA;

  const result = {} as IonProfile;
  for (const field of ION_FIELDS) {
    const a = Number.isFinite(sourceA[field]) ? sourceA[field] : 0;
    const b = Number.isFinite(sourceB[field]) ? sourceB[field] : 0;
    result[field] = a * fractionA + b * fractionB;
  }
  return result;
}

/**
 * Blend two ion profiles given explicit volumes (liters) of each source,
 * rather than a percentage. Handles the edge case where both volumes are
 * zero by returning a zeroed profile rather than dividing by zero.
 */
export function blendIonProfilesByVolume(
  sourceA: IonProfile,
  volumeAL: number,
  sourceB: IonProfile,
  volumeBL: number,
): IonProfile {
  const safeVolumeA = Number.isFinite(volumeAL) ? Math.max(0, volumeAL) : 0;
  const safeVolumeB = Number.isFinite(volumeBL) ? Math.max(0, volumeBL) : 0;
  const totalVolume = safeVolumeA + safeVolumeB;

  if (totalVolume <= 0) {
    const zeroed = {} as IonProfile;
    for (const field of ION_FIELDS) zeroed[field] = 0;
    return zeroed;
  }

  const percentA = (safeVolumeA / totalVolume) * 100;
  return blendIonProfiles(sourceA, sourceB, percentA);
}
