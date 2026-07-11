/**
 * Core brewing water chemistry math: residual alkalinity, ion mEq/L
 * conversions, and mash pH prediction.
 *
 * These formulas implement generally-published, public brewing water
 * chemistry science (the same science underlying widely-cited brewing
 * water chemistry references). They are an original implementation and
 * are NOT copied from any proprietary tool or spreadsheet.
 */

import { clamp } from './units';

export interface IonProfile {
  /** Calcium, mg/L */
  calcium: number;
  /** Magnesium, mg/L */
  magnesium: number;
  /** Sodium, mg/L */
  sodium: number;
  /** Sulfate, mg/L */
  sulfate: number;
  /** Chloride, mg/L */
  chloride: number;
  /** Bicarbonate, mg/L (as HCO3-) */
  bicarbonate: number;
  /** Total alkalinity, mg/L as CaCO3 */
  alkalinity: number;
}

export const EMPTY_ION_PROFILE: IonProfile = {
  calcium: 0,
  magnesium: 0,
  sodium: 0,
  sulfate: 0,
  chloride: 0,
  bicarbonate: 0,
  alkalinity: 0,
};

/** mEq/L conversion divisors (mg/L per mEq/L) for each ion. */
export const MEQ_DIVISORS = {
  calcium: 20.04,
  magnesium: 12.15,
  sodium: 23.0,
  sulfate: 48.03,
  chloride: 35.45,
  bicarbonate: 61.02,
} as const;

/** Convert an ion concentration (mg/L) to milliequivalents/L. */
export function toMeqPerL(mgPerL: number, ion: keyof typeof MEQ_DIVISORS): number {
  const safe = Number.isFinite(mgPerL) ? Math.max(0, mgPerL) : 0;
  return safe / MEQ_DIVISORS[ion];
}

export interface IonMeqProfile {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
}

/** Convert an entire ion profile (mg/L) to mEq/L for each listed ion. */
export function ionProfileToMeq(profile: IonProfile): IonMeqProfile {
  return {
    calcium: toMeqPerL(profile.calcium, 'calcium'),
    magnesium: toMeqPerL(profile.magnesium, 'magnesium'),
    sodium: toMeqPerL(profile.sodium, 'sodium'),
    sulfate: toMeqPerL(profile.sulfate, 'sulfate'),
    chloride: toMeqPerL(profile.chloride, 'chloride'),
    bicarbonate: toMeqPerL(profile.bicarbonate, 'bicarbonate'),
  };
}

/**
 * Residual Alkalinity (RA), mg/L as CaCO3.
 *
 *   RA = Alkalinity - (Ca/1.4 + Mg/1.7)
 *
 * Ca and Mg are in mg/L; Alkalinity is total alkalinity as CaCO3 (mg/L).
 * The 1.4 and 1.7 divisors convert Ca and Mg mg/L into CaCO3-equivalent
 * mg/L (based on their respective equivalent weights relative to CaCO3).
 *
 * Edge case: Ca = Mg = 0 (RO/distilled water) is handled naturally since
 * this is pure arithmetic (no division by Ca or Mg) -- there is no
 * divide-by-zero risk here. Negative or missing inputs are clamped to 0
 * before the calculation so the result is never NaN.
 */
export function calculateResidualAlkalinity(profile: Pick<IonProfile, 'alkalinity' | 'calcium' | 'magnesium'>): number {
  const alkalinity = Number.isFinite(profile.alkalinity) ? Math.max(0, profile.alkalinity) : 0;
  const calcium = Number.isFinite(profile.calcium) ? Math.max(0, profile.calcium) : 0;
  const magnesium = Number.isFinite(profile.magnesium) ? Math.max(0, profile.magnesium) : 0;

  const hardnessContribution = calcium / 1.4 + magnesium / 1.7;
  return alkalinity - hardnessContribution;
}

export interface GrainBillItem {
  name: string;
  /** Weight of this grain, kg */
  weightKg: number;
  /** Color, degrees Lovibond (°L) -- Bru'n Water's convention. */
  colorLovibond: number;
}

export interface MashPhResult {
  /** Predicted mash pH, clamped to the physically plausible range 4.0-6.5 */
  predictedPh: number;
  /** Whether a fallback was used because the grist was empty */
  isFallback: boolean;
  /** Human-readable note about the calculation */
  note: string;
  /** Weighted average grist color used in the calculation, °L */
  weightedColorLovibond: number;
  /** Total grist weight, kg */
  totalGristWeightKg: number;
}

/**
 * Base distilled-water mash pH for a "typical" base malt, before any
 * residual-alkalinity or grain-color adjustment is applied.
 *
 * Real base malts mashed in distilled water typically land around
 * pH 5.6-5.8. We use 5.7 as a single configurable constant per the
 * project's approximation model.
 */
export const BASE_MALT_DISTILLED_PH = 5.7;

/**
 * Buffering capacity constant used to scale how strongly residual
 * alkalinity shifts mash pH per kilogram of grist.
 *
 * NOTE ON ACCURACY: this is a simplified linear approximation of the
 * real (nonlinear) mash buffering behavior described in the
 * Kolbach / Palmer brewing-water-chemistry literature. It is NOT a
 * precise reproduction of any published model's exact coefficients --
 * it is tuned to give plausible, monotonic, bounded output for a
 * homebrew-to-small-commercial scale (a few kg to a few hundred kg of
 * grist). Treat predicted pH as a planning estimate, always verify with
 * a calibrated pH meter at mash-in.
 */
const BASE_BUFFERING_CAPACITY = 35; // (mg/L CaCO3) per pH-unit-per-kg equivalent scaling
const RA_TO_PH_SCALING_CONSTANT = 1;

/**
 * Linear color-darkening adjustment: for every 1 degree Lovibond of
 * weighted grist color, predicted pH decreases by 0.01, reflecting the
 * acidifying effect of kilned/roasted malts. This is clamped so
 * extreme grists (all black malt) cannot push the result outside the
 * plausible pH range before final clamping.
 */
const COLOR_ADJUSTMENT_PER_LOVIBOND = -0.01;

export const MASH_PH_MIN = 4.0;
export const MASH_PH_MAX = 6.5;

/**
 * Predict mash pH from the source water's residual alkalinity and the
 * grain bill's weight/color composition.
 *
 * Formula (documented approximation, see constants above):
 *   predictedPh = BASE_MALT_DISTILLED_PH
 *               + (RA / (BASE_BUFFERING_CAPACITY * totalGristWeightKg)) * RA_TO_PH_SCALING_CONSTANT
 *               + colorAdjustment
 *
 * Edge cases handled:
 *  - Empty grain bill / zero total weight: returns a defined fallback
 *    result (isFallback = true) using BASE_MALT_DISTILLED_PH with no RA
 *    term, rather than dividing by zero.
 *  - Extreme grist color (all black malt or all base malt): the final
 *    predicted pH is always clamped to [4.0, 6.5].
 */
export function predictMashPh(
  residualAlkalinity: number,
  grainBill: GrainBillItem[],
): MashPhResult {
  const validItems = grainBill.filter(
    (item) => Number.isFinite(item.weightKg) && item.weightKg > 0,
  );
  const totalGristWeightKg = validItems.reduce((sum, item) => sum + item.weightKg, 0);

  if (totalGristWeightKg <= 0) {
    return {
      predictedPh: BASE_MALT_DISTILLED_PH,
      isFallback: true,
      note: 'No grain bill entered -- showing base distilled-water malt pH as a fallback. Add grain weights to get a real prediction.',
      weightedColorLovibond: 0,
      totalGristWeightKg: 0,
    };
  }

  const weightedColorLovibond =
    validItems.reduce((sum, item) => {
      const color = Number.isFinite(item.colorLovibond) ? Math.max(0, item.colorLovibond) : 0;
      return sum + color * item.weightKg;
    }, 0) / totalGristWeightKg;

  const safeRa = Number.isFinite(residualAlkalinity) ? residualAlkalinity : 0;
  const raTerm = (safeRa / (BASE_BUFFERING_CAPACITY * totalGristWeightKg)) * RA_TO_PH_SCALING_CONSTANT;

  const colorAdjustment = clamp(
    COLOR_ADJUSTMENT_PER_LOVIBOND * weightedColorLovibond,
    -1.5,
    0,
  );

  const rawPredictedPh = BASE_MALT_DISTILLED_PH + raTerm + colorAdjustment;
  const predictedPh = clamp(rawPredictedPh, MASH_PH_MIN, MASH_PH_MAX);

  return {
    predictedPh,
    isFallback: false,
    note:
      predictedPh !== rawPredictedPh
        ? 'Predicted pH was clamped to the plausible brewing range (4.0-6.5).'
        : 'Predicted using approximate linear RA/buffering model -- verify with a pH meter.',
    weightedColorLovibond,
    totalGristWeightKg,
  };
}
