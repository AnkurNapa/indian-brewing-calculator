/**
 * Acid dosing approximation.
 *
 * This uses a simple empirical mEq-based approximation: each pH unit we
 * need to move the mash requires neutralizing a certain amount of
 * residual alkalinity, expressed in mEq. We convert that mEq requirement
 * into a volume of acid using the acid's normality (mEq of H+ per mL).
 * This is NOT a full titration-curve model -- it is a linear
 * approximation intended for planning purposes. Always titrate
 * empirically and confirm with a calibrated pH meter.
 */

import { clamp } from './units';

export interface AcidType {
  id: string;
  name: string;
  /** mEq of titratable acidity per mL of concentrate, approximate. */
  meqPerMl: number;
}

export const ACID_TYPES: AcidType[] = [
  { id: 'lactic88', name: 'Lactic Acid 88%', meqPerMl: 11.7 },
  { id: 'phosphoric10', name: 'Phosphoric Acid 10%', meqPerMl: 1.4 },
  { id: 'phosphoric85', name: 'Phosphoric Acid 85%', meqPerMl: 14.4 },
];

/** Minimum meaningful pH difference; below this we treat as "already at target". */
const PH_EPSILON = 0.02;

/**
 * Empirical mEq required per liter of mash water per 0.1 pH unit to be
 * neutralized. This is a planning approximation, not a literature-exact
 * buffering constant.
 */
const MEQ_PER_LITER_PER_TENTH_PH = 0.5;

export interface AcidDoseResult {
  acidId: string;
  acidName: string;
  /** mL of acid concentrate needed for the whole volume. */
  mL: number;
  /** True if current pH is already at/below target (no acid needed). */
  alreadyAtTarget: boolean;
}

/**
 * Compute the acid dose (mL) needed to move `currentPh` down to
 * `targetPh` across `volumeL` liters of water/mash.
 *
 * Edge case: if currentPh <= targetPh + epsilon, returns 0 mL exactly
 * (uses an epsilon threshold so float noise never produces a spurious
 * nonzero dose).
 */
export function calculateAcidDose(
  currentPh: number,
  targetPh: number,
  volumeL: number,
  acid: AcidType,
): AcidDoseResult {
  const safeCurrent = Number.isFinite(currentPh) ? currentPh : targetPh;
  const safeTarget = Number.isFinite(targetPh) ? targetPh : safeCurrent;
  const safeVolume = Number.isFinite(volumeL) && volumeL > 0 ? volumeL : 0;

  const phDelta = safeCurrent - safeTarget;

  if (phDelta <= PH_EPSILON || safeVolume <= 0 || acid.meqPerMl <= 0) {
    return {
      acidId: acid.id,
      acidName: acid.name,
      mL: 0,
      alreadyAtTarget: phDelta <= PH_EPSILON,
    };
  }

  const tenthsOfPh = phDelta / 0.1;
  const meqRequired = tenthsOfPh * MEQ_PER_LITER_PER_TENTH_PH * safeVolume;
  const mL = meqRequired / acid.meqPerMl;

  return {
    acidId: acid.id,
    acidName: acid.name,
    mL: clamp(mL, 0, Number.MAX_SAFE_INTEGER),
    alreadyAtTarget: false,
  };
}
