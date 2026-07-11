/**
 * Sparge water acidification recommendation.
 *
 * High residual alkalinity in sparge water raises pH in the mash/lauter
 * tun as sparging proceeds, increasing the risk of extracting tannins
 * from grain husks. The generally-cited guidance is to keep runnings pH
 * below roughly 5.8-6.0. This module gives a simple, approximate
 * recommendation for how much acid to add to sparge water to keep it
 * near a safe target pH, reusing the same empirical acid-dosing model
 * as mash acid additions.
 */

import { AcidType, calculateAcidDose, AcidDoseResult } from './acidAdditions';

/** Assumed approximate starting pH of untreated sparge water when RA is high. */
const HIGH_RA_SPARGE_PH_ESTIMATE = 6.2;
/** Assumed approximate starting pH of untreated sparge water when RA is low/moderate. */
const LOW_RA_SPARGE_PH_ESTIMATE = 5.7;

export const SPARGE_SAFE_PH_TARGET = 5.8;
/** RA (mg/L as CaCO3) above which sparge water is considered high-risk. */
const HIGH_RA_THRESHOLD = 50;

export interface SpargeRecommendation {
  needsAcid: boolean;
  /** Message describing the recommendation. */
  message: string;
  dose: AcidDoseResult | null;
}

/**
 * Recommend a sparge water acid addition.
 *
 * Edge case: spargeVolumeL === 0 (e.g. BIAB / no-sparge brewing) returns
 * a clear "no sparge acidification needed" result rather than an error
 * or a spurious dose.
 */
export function recommendSpargeAcidification(
  residualAlkalinity: number,
  spargeVolumeL: number,
  acid: AcidType,
): SpargeRecommendation {
  const safeVolume = Number.isFinite(spargeVolumeL) ? Math.max(0, spargeVolumeL) : 0;

  if (safeVolume <= 0) {
    return {
      needsAcid: false,
      message: 'No sparge volume specified (e.g. brew-in-a-bag / no-sparge) -- no sparge acidification needed.',
      dose: null,
    };
  }

  const safeRa = Number.isFinite(residualAlkalinity) ? residualAlkalinity : 0;

  if (safeRa <= HIGH_RA_THRESHOLD) {
    return {
      needsAcid: false,
      message: `Residual alkalinity (${safeRa.toFixed(
        0,
      )} mg/L as CaCO3) is within a safe range for sparging -- no acid addition needed.`,
      dose: null,
    };
  }

  const estimatedSpargePh = HIGH_RA_SPARGE_PH_ESTIMATE;
  const dose = calculateAcidDose(estimatedSpargePh, SPARGE_SAFE_PH_TARGET, safeVolume, acid);

  return {
    needsAcid: !dose.alreadyAtTarget && dose.mL > 0,
    message:
      dose.mL > 0
        ? `Residual alkalinity is high (${safeRa.toFixed(
            0,
          )} mg/L as CaCO3). Add approximately ${dose.mL.toFixed(
            1,
          )} mL of ${acid.name} to your sparge water to help keep runnings pH below ${SPARGE_SAFE_PH_TARGET} and reduce tannin extraction risk.`
        : 'Estimated sparge pH is already near the safe target -- no acid addition needed.',
    dose,
  };
}

// Exported for potential future refinement / testing of the baseline estimate.
export const _internal = { HIGH_RA_SPARGE_PH_ESTIMATE, LOW_RA_SPARGE_PH_ESTIMATE };
