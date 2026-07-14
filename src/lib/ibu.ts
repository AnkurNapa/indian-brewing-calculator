/**
 * IBU (bitterness) calculators -- three standard, widely-published hop
 * utilization models, selectable per recipe:
 *
 *   - Tinseth (Glenn Tinseth, 1997): the modern default, generally
 *     regarded as the most accurate for typical pellet/whole-cone hops.
 *   - Rager (Jackie Rager, 1990): an older, simpler model that tends to
 *     estimate higher IBU than Tinseth, especially for long boils.
 *   - Garetz (Ray Garetz): adjusts additionally for wort concentration
 *     (boil volume vs. final volume), altitude (lower boiling point at
 *     elevation reduces utilization), and hop freshness/storage --
 *     more inputs, marketed as more precise for those who track them.
 *
 * All three are implemented directly from their published formulas
 * (original implementation, not sourced from any proprietary tool) and
 * expressed in this app's metric units throughout (grams, liters) --
 * the same mg/L-style constant (weight * AA-decimal * utilization *
 * 1000 / volumeL) used by all three, since that conversion is
 * formula-agnostic; only the utilization function differs per formula.
 */

export type IbuFormula = 'tinseth' | 'rager' | 'garetz';

export interface IbuFormulaInfo {
  id: IbuFormula;
  label: string;
  description: string;
}

export const IBU_FORMULAS: IbuFormulaInfo[] = [
  { id: 'tinseth', label: 'Tinseth', description: 'Most accurate for modern hops -- the industry default.' },
  { id: 'rager', label: 'Rager', description: 'Simpler, older model -- tends to estimate higher IBU.' },
  {
    id: 'garetz',
    label: 'Garetz',
    description: 'Adjusts for altitude, wort concentration, and hop freshness -- most inputs, most precise.',
  },
];

/** Extra inputs only the Garetz formula uses, beyond the standard hop/batch fields. */
export interface GaretzExtras {
  /** Brewery elevation, meters above sea level. Higher altitude lowers boiling point and utilization. */
  altitudeM: number;
  /** Hop freshness/storage factor -- 1.0 = fresh, lower for aged/poorly-stored hops. */
  hopAgeFactor: number;
  /** Kettle volume at the start of the boil, liters -- more concentrated wort utilizes hops less efficiently. */
  boilVolumeL: number;
}

export const DEFAULT_GARETZ_EXTRAS: GaretzExtras = {
  altitudeM: 0,
  hopAgeFactor: 1.0,
  boilVolumeL: 0, // 0 => no concentration adjustment (treated as equal to batch volume)
};

function safePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export interface HopAddition {
  name: string;
  /** Alpha acid %, e.g. 12 for 12% AA. */
  alphaAcidPercent: number;
  /** Weight of this addition, grams. */
  weightG: number;
  /** Boil time remaining when this addition goes in, minutes (0 = flameout). */
  boilTimeMinutes: number;
}

/** Tinseth "bigness factor": higher-gravity worts extract bitterness less efficiently. */
function bignessFactor(wortGravity: number): number {
  const safeGravity = safePositive(wortGravity, 1.0);
  return 1.65 * 0.000125 ** (safeGravity - 1);
}

/** Tinseth "boil time factor": utilization rises asymptotically with boil time. */
function boilTimeFactor(boilTimeMinutes: number): number {
  const safeTime = Number.isFinite(boilTimeMinutes) ? Math.max(0, boilTimeMinutes) : 0;
  return (1 - Math.exp(-0.04 * safeTime)) / 4.15;
}

/** Compute the Tinseth utilization fraction for a single hop addition. */
export function tinsethUtilization(wortGravity: number, boilTimeMinutes: number): number {
  return bignessFactor(wortGravity) * boilTimeFactor(boilTimeMinutes);
}

/**
 * Rager utilization (published formula): a tanh curve over boil time,
 * with a high-gravity correction. Rager's published gravity adjustment
 * is GA = (OG - 1.050) / 0.2 for worts over 1.050 SG, and the base
 * utilization is DIVIDED by (1 + GA) -- not reduced by GA percentage
 * points. Dividing is what Rager specifies and keeps the correction
 * proportional (a 1.090 wort is penalized far more than a 1.055 wort),
 * whereas subtracting GA*100 points collapses utilization to ~0 for
 * strong worts and badly under-predicts their bitterness.
 */
export function ragerUtilization(wortGravity: number, boilTimeMinutes: number): number {
  const safeTime = Number.isFinite(boilTimeMinutes) ? Math.max(0, boilTimeMinutes) : 0;
  const safeGravity = safePositive(wortGravity, 1.0);

  const utilizationPercent = 18.11 + 13.86 * Math.tanh((safeTime - 31.32) / 18.27);
  const gravityAdjustment = safeGravity > 1.05 ? (safeGravity - 1.05) / 0.2 : 0;
  const adjustedPercent = Math.max(0, utilizationPercent / (1 + gravityAdjustment));

  return adjustedPercent / 100;
}

/**
 * Garetz base utilization by boil time -- a published lookup table
 * (linearly interpolated between the listed minutes), before the
 * concentration/gravity/altitude/freshness multipliers are applied.
 * Representative planning-grade values, not a lab-exact table.
 */
const GARETZ_BASE_UTILIZATION_TABLE: [number, number][] = [
  [0, 0],
  [10, 0.06],
  [15, 0.08],
  [20, 0.101],
  [25, 0.122],
  [30, 0.153],
  [35, 0.188],
  [40, 0.226],
  [45, 0.266],
  [50, 0.284],
  [60, 0.303],
  [70, 0.31],
  [90, 0.31],
];

function garetzBaseUtilization(boilTimeMinutes: number): number {
  const safeTime = Number.isFinite(boilTimeMinutes) ? Math.max(0, boilTimeMinutes) : 0;
  const table = GARETZ_BASE_UTILIZATION_TABLE;

  if (safeTime <= table[0][0]) return table[0][1];
  if (safeTime >= table[table.length - 1][0]) return table[table.length - 1][1];

  for (let i = 0; i < table.length - 1; i += 1) {
    const [t0, u0] = table[i];
    const [t1, u1] = table[i + 1];
    if (safeTime >= t0 && safeTime <= t1) {
      const fraction = (safeTime - t0) / (t1 - t0);
      return u0 + (u1 - u0) * fraction;
    }
  }
  return table[table.length - 1][1];
}

/**
 * Garetz utilization: base utilization (by boil time) scaled by wort
 * concentration (boil volume vs. final batch volume -- more
 * concentrated boils utilize hops less efficiently), gravity, altitude
 * (lower boiling point at elevation reduces utilization), and hop
 * freshness.
 */
export function garetzUtilization(
  wortGravity: number,
  boilTimeMinutes: number,
  batchVolumeL: number,
  extras: GaretzExtras,
): number {
  const safeGravity = safePositive(wortGravity, 1.0);
  const safeVolume = safePositive(batchVolumeL, 1);
  const baseUtil = garetzBaseUtilization(boilTimeMinutes);

  const boilVolumeL = extras.boilVolumeL > 0 ? extras.boilVolumeL : safeVolume;
  const concentrationFactor = Math.min(1.4, Math.max(1, boilVolumeL / safeVolume));

  const gravityFactor = safeGravity > 1.05 ? 1 + (safeGravity - 1.05) / 0.2 : 1;

  // Garetz's published altitude correction is stated in feet; converted
  // here so the input field itself can stay in meters (this app is
  // metric-only) -- 1 m = 3.28084 ft, so ft/550000 == m/167640 approx.
  const altitudeFactor = 1 + Math.max(0, extras.altitudeM) / 167640;

  const hopAgeFactor = safePositive(extras.hopAgeFactor, 1);

  return baseUtil * concentrationFactor * gravityFactor * altitudeFactor * hopAgeFactor;
}

/** Compute utilization for a single hop addition under the selected formula. */
export function computeUtilization(
  formula: IbuFormula,
  wortGravity: number,
  boilTimeMinutes: number,
  batchVolumeL: number,
  garetzExtras: GaretzExtras = DEFAULT_GARETZ_EXTRAS,
): number {
  switch (formula) {
    case 'rager':
      return ragerUtilization(wortGravity, boilTimeMinutes);
    case 'garetz':
      return garetzUtilization(wortGravity, boilTimeMinutes, batchVolumeL, garetzExtras);
    case 'tinseth':
    default:
      return tinsethUtilization(wortGravity, boilTimeMinutes);
  }
}

export interface IbuResult {
  /** Total IBU contribution across all hop additions. */
  totalIbu: number;
  /** Per-addition IBU breakdown, same order as the input array. */
  perAdditionIbu: number[];
}

/**
 * Compute total IBU for a set of hop additions boiled in a batch of the
 * given wort gravity and final batch volume, under the selected formula
 * (Tinseth by default, matching prior behavior for existing callers).
 *
 * Edge cases handled:
 *  - Non-positive batch volume: returns 0 for every addition rather
 *    than dividing by zero.
 *  - Non-finite/negative alpha acid or weight on a given addition:
 *    that addition contributes 0 IBU rather than NaN.
 */
export function calculateIbu(
  hopAdditions: HopAddition[],
  wortGravity: number,
  batchVolumeL: number,
  formula: IbuFormula = 'tinseth',
  garetzExtras: GaretzExtras = DEFAULT_GARETZ_EXTRAS,
): IbuResult {
  const safeVolume = safePositive(batchVolumeL, 0);

  if (safeVolume <= 0) {
    return { totalIbu: 0, perAdditionIbu: hopAdditions.map(() => 0) };
  }

  const perAdditionIbu = hopAdditions.map((hop) => {
    const aaDecimal = Number.isFinite(hop.alphaAcidPercent) && hop.alphaAcidPercent > 0 ? hop.alphaAcidPercent / 100 : 0;
    const weightG = Number.isFinite(hop.weightG) && hop.weightG > 0 ? hop.weightG : 0;
    if (aaDecimal <= 0 || weightG <= 0) return 0;

    const utilization = computeUtilization(formula, wortGravity, hop.boilTimeMinutes, batchVolumeL, garetzExtras);
    return (aaDecimal * weightG * utilization * 1000) / safeVolume;
  });

  const totalIbu = perAdditionIbu.reduce((sum, ibu) => sum + ibu, 0);

  return { totalIbu, perAdditionIbu };
}

/**
 * Solve for the hop weight (grams) needed to hit a target IBU for a
 * single boil addition -- the inverse of `calculateIbu` for one hop,
 * derived algebraically from the same formula-agnostic relationship:
 *
 *   grams = (targetIBU * batchVolumeL) / (aaDecimal * utilization * 1000)
 *
 * Useful on brew day for "I want 40 IBU from this 5.5% AA hop at 60 min
 * -- how many grams do I need?" instead of guessing a weight and
 * checking the resulting IBU.
 *
 * Edge cases handled:
 *  - Non-positive target IBU, alpha acid, batch volume, or a 0-minute
 *    (flameout) addition where utilization is ~0: returns 0 grams
 *    rather than dividing by zero or returning Infinity/NaN.
 */
export function calculateHopWeightForTargetIbu(
  targetIbu: number,
  alphaAcidPercent: number,
  boilTimeMinutes: number,
  wortGravity: number,
  batchVolumeL: number,
  formula: IbuFormula = 'tinseth',
  garetzExtras: GaretzExtras = DEFAULT_GARETZ_EXTRAS,
): number {
  const ibu = Number.isFinite(targetIbu) && targetIbu > 0 ? targetIbu : 0;
  const aaDecimal = Number.isFinite(alphaAcidPercent) && alphaAcidPercent > 0 ? alphaAcidPercent / 100 : 0;
  const volume = safePositive(batchVolumeL, 0);
  const utilization = computeUtilization(formula, wortGravity, boilTimeMinutes, batchVolumeL, garetzExtras);

  if (ibu <= 0 || aaDecimal <= 0 || volume <= 0 || utilization <= 0) {
    return 0;
  }

  return (ibu * volume) / (aaDecimal * utilization * 1000);
}

/**
 * Dry-hop (or other post-boil/whirlpool, no-bitterness) addition rate
 * calculator: grams = rate (g/L) * batch volume (L). Typical published
 * dry-hop rates range roughly 1-2 g/L for a subtle aroma addition up to
 * 5-8+ g/L for heavily dry-hopped hazy/NEIPA styles.
 */
export function calculateDryHopWeight(rateGPerL: number, batchVolumeL: number): number {
  const rate = Number.isFinite(rateGPerL) && rateGPerL > 0 ? rateGPerL : 0;
  const volume = safePositive(batchVolumeL, 0);
  return rate * volume;
}
