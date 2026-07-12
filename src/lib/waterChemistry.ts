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

/**
 * Malt category, used to select a distilled-water (DI) mash pH and
 * buffering-capacity baseline. Categories reflect well-documented,
 * generally-published differences in how base, caramelized (crystal),
 * roasted/dark, acidulated, and wheat/other malts behave when mashed in
 * distilled water -- kilning chemistry (Maillard vs. caramelization vs.
 * roasting), not just color, drives mash acidity. If a grain bill row
 * omits `category`, it is auto-classified from `colorLovibond` using the
 * thresholds in `classifyMaltCategory` below as a reasonable default.
 */
export type MaltCategory = 'base' | 'crystal' | 'roasted' | 'acidulated' | 'wheatOrOther';

export interface GrainBillItem {
  name: string;
  /** Weight of this grain, kg */
  weightKg: number;
  /** Color, degrees Lovibond (°L). */
  colorLovibond: number;
  /**
   * Optional malt category. When omitted, it is inferred from
   * colorLovibond via `classifyMaltCategory`. Explicit category should be
   * preferred when known (e.g. acidulated malt is pale but very acidic,
   * and color-only inference cannot detect that).
   */
  category?: MaltCategory;
  /**
   * Optional extract potential, expressed as the SG this malt would
   * produce if 1 kg were fully converted into 1 L of water (a standard
   * maltster "potential" spec, typically 1.030-1.038 for base malts,
   * lower for crystal/roasted malts). Not required for the water
   * chemistry/mash pH/SRM calculations in this file, but recorded here
   * so it travels with the rest of the grain bill (recipe recap, Home
   * overview, share/export) instead of being a separate, disconnected
   * entry in the Brewhouse Efficiency calculator.
   */
  potentialSg?: number;
}

/**
 * Per-category distilled-water mash pH and buffering capacity.
 *
 * - `diPh`: typical mash pH when this malt type is mashed alone in
 *   distilled/RO water (no alkalinity to neutralize).
 * - `bufferingMeqPerKgPerPh`: approximate milliequivalents of
 *   acid/alkali this malt exerts per kilogram per pH unit of mash
 *   buffering capacity -- roasted and crystal malts buffer (and
 *   acidify) far more strongly per kg than base malt.
 *
 * These are generic, widely-published ranges from public brewing water
 * chemistry literature (e.g. the well-known distinction that dark/crystal
 * malts run substantially more acidic in DI water than base malts), not
 * figures copied from any proprietary spreadsheet or tool. Values are
 * representative midpoints intended for planning-grade estimates.
 */
interface MaltCategoryProfile {
  diPh: number;
  bufferingMeqPerKgPerPh: number;
}

export const MALT_CATEGORY_PROFILES: Record<MaltCategory, MaltCategoryProfile> = {
  base: { diPh: 5.75, bufferingMeqPerKgPerPh: 40 },
  wheatOrOther: { diPh: 5.85, bufferingMeqPerKgPerPh: 38 },
  crystal: { diPh: 4.75, bufferingMeqPerKgPerPh: 70 },
  roasted: { diPh: 4.35, bufferingMeqPerKgPerPh: 90 },
  acidulated: { diPh: 3.2, bufferingMeqPerKgPerPh: 120 },
};

/**
 * Classify a malt into a category from its color alone, for grain bill
 * rows that don't specify a category explicitly. This is a reasonable
 * default, not a substitute for explicit classification -- pale
 * specialty malts like acidulated malt cannot be distinguished from base
 * malt by color alone, which is exactly why `category` can be set
 * explicitly to override this inference.
 */
export function classifyMaltCategory(colorLovibond: number): MaltCategory {
  const color = Number.isFinite(colorLovibond) ? Math.max(0, colorLovibond) : 0;
  if (color < 20) return 'base';
  if (color < 80) return 'crystal';
  return 'roasted';
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
  /** Weighted-average distilled-water pH of the grist (before RA adjustment) */
  weightedDiPh: number;
  /** Total mash buffering capacity of the grist, mEq per pH unit */
  totalBufferingMeqPerPh: number;
}

/**
 * Base distilled-water mash pH for a "typical" base malt, before any
 * residual-alkalinity or grain-color adjustment is applied. Retained as
 * the fallback value for an empty grain bill, and equal to the `base`
 * category's `diPh` in MALT_CATEGORY_PROFILES.
 */
export const BASE_MALT_DISTILLED_PH = MALT_CATEGORY_PROFILES.base.diPh;

export const MASH_PH_MIN = 4.0;
export const MASH_PH_MAX = 6.5;

/**
 * Convert residual alkalinity (mg/L as CaCO3) for a given mash water
 * volume into milliequivalents of alkalinity to be neutralized by the
 * grist's buffering capacity. 1 mEq of CaCO3 alkalinity corresponds to
 * 50.04 mg (its equivalent weight), so mEq = (RA_mgL * volumeL) / 50.04.
 */
function residualAlkalinityToMeq(residualAlkalinity: number, mashWaterVolumeL: number): number {
  const safeRa = Number.isFinite(residualAlkalinity) ? residualAlkalinity : 0;
  const safeVolume = Number.isFinite(mashWaterVolumeL) && mashWaterVolumeL > 0 ? mashWaterVolumeL : 0;
  return (safeRa * safeVolume) / 50.04;
}

/**
 * Assumed mash water volume per kilogram of grist (L/kg) when the caller
 * does not supply an explicit mash water volume. This is a typical
 * homebrew/small-commercial mash thickness, used only to estimate the
 * residual-alkalinity buffering term when volume isn't otherwise known.
 * Matches the default used by the Water Volumes calculator so the two
 * stay consistent.
 */
export const DEFAULT_MASH_THICKNESS_L_PER_KG = 3.0;

/**
 * Estimate mash (strike) water volume from total grist weight, using the
 * default mash thickness. Exported so any caller needing "the water the
 * mash pH/acid dose is actually happening in" -- as opposed to the final
 * batch volume, which also includes sparge water added later -- uses the
 * same basis `predictMashPh` uses internally, instead of accidentally
 * substituting the much larger total batch volume.
 */
export function estimateMashWaterVolumeL(totalGristWeightKg: number): number {
  const safeWeight = Number.isFinite(totalGristWeightKg) && totalGristWeightKg > 0 ? totalGristWeightKg : 0;
  return safeWeight * DEFAULT_MASH_THICKNESS_L_PER_KG;
}

/**
 * Predict mash pH from the source water's residual alkalinity and the
 * grain bill's per-malt-category distilled-water pH and buffering
 * capacity.
 *
 * Model (documented approximation):
 *   1. Each grist row is classified into a MaltCategory (explicit
 *      `category`, or inferred from color via `classifyMaltCategory`).
 *   2. weightedDiPh = weight-weighted average of each category's DI pH.
 *   3. totalBufferingMeqPerPh = sum of (category buffering meq/kg/pH *
 *      row weight kg) across the grist -- this replaces the old flat
 *      "35 per kg" constant with a grist-composition-aware capacity, so
 *      a crystal/roasted-heavy grist correctly buffers (resists pH
 *      swings from RA) much more strongly than an all-base-malt grist.
 *   4. raShiftPh = mEq of residual alkalinity to neutralize / total
 *      buffering capacity -- alkalinity pushes pH up, so this is added.
 *   5. predictedPh = weightedDiPh + raShiftPh, clamped to [4.0, 6.5].
 *
 * This is still a planning-grade linear approximation of a genuinely
 * nonlinear titration relationship (real mash buffering curves flatten
 * near the malt's natural pH and steepen away from it), but it is
 * substantially closer to real behavior than a single color-only slope
 * because it separates "how acidic is this malt" (diPh) from "how hard
 * is it to move" (buffering capacity) per malt category.
 *
 * Edge cases handled:
 *  - Empty grain bill / zero total weight: returns a defined fallback
 *    result (isFallback = true) using BASE_MALT_DISTILLED_PH with no RA
 *    term, rather than dividing by zero.
 *  - Extreme grists (all roasted, all acidulated, all base with huge
 *    RA): the final predicted pH is always clamped to [4.0, 6.5].
 */
export function predictMashPh(
  residualAlkalinity: number,
  grainBill: GrainBillItem[],
  mashWaterVolumeL?: number,
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
      weightedDiPh: BASE_MALT_DISTILLED_PH,
      totalBufferingMeqPerPh: 0,
    };
  }

  const weightedColorLovibond =
    validItems.reduce((sum, item) => {
      const color = Number.isFinite(item.colorLovibond) ? Math.max(0, item.colorLovibond) : 0;
      return sum + color * item.weightKg;
    }, 0) / totalGristWeightKg;

  let weightedDiPhSum = 0;
  let totalBufferingMeqPerPh = 0;
  for (const item of validItems) {
    const category = item.category ?? classifyMaltCategory(item.colorLovibond);
    const categoryProfile = MALT_CATEGORY_PROFILES[category];
    weightedDiPhSum += categoryProfile.diPh * item.weightKg;
    totalBufferingMeqPerPh += categoryProfile.bufferingMeqPerKgPerPh * item.weightKg;
  }
  const weightedDiPh = weightedDiPhSum / totalGristWeightKg;

  const mashWaterVolume =
    Number.isFinite(mashWaterVolumeL) && (mashWaterVolumeL as number) > 0
      ? (mashWaterVolumeL as number)
      : estimateMashWaterVolumeL(totalGristWeightKg);

  const raMeq = residualAlkalinityToMeq(residualAlkalinity, mashWaterVolume);
  const raShiftPh = totalBufferingMeqPerPh > 0 ? raMeq / totalBufferingMeqPerPh : 0;

  const rawPredictedPh = weightedDiPh + raShiftPh;
  const predictedPh = clamp(rawPredictedPh, MASH_PH_MIN, MASH_PH_MAX);

  return {
    predictedPh,
    isFallback: false,
    note:
      predictedPh !== rawPredictedPh
        ? 'Predicted pH was clamped to the plausible brewing range (4.0-6.5).'
        : 'Predicted using per-malt-category DI pH and buffering-capacity model -- verify with a pH meter.',
    weightedColorLovibond,
    totalGristWeightKg,
    weightedDiPh,
    totalBufferingMeqPerPh,
  };
}
