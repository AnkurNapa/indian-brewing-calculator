/**
 * IBU (bitterness) calculator using the Tinseth formula -- a standard,
 * widely-published hop utilization model (Glenn Tinseth, 1997) commonly
 * taught alongside Rager's method in brewing science. Original
 * implementation from the published formula, not sourced from any
 * proprietary tool.
 *
 *   utilization = bignessFactor * boilTimeFactor
 *   bignessFactor = 1.65 * 0.000125^(wortGravity - 1)
 *   boilTimeFactor = (1 - e^(-0.04 * boilTimeMinutes)) / 4.15
 *   IBU = (aaDecimal * grams * utilization * 1000) / batchVolumeL
 *
 * where aaDecimal is the hop's alpha-acid % as a decimal (e.g. 0.12 for
 * 12% AA) and wortGravity is the SG of the boil at the time the hop is
 * added (commonly approximated with the pre-boil or average boil
 * gravity for planning purposes).
 */

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

export interface IbuResult {
  /** Total IBU contribution across all hop additions. */
  totalIbu: number;
  /** Per-addition IBU breakdown, same order as the input array. */
  perAdditionIbu: number[];
}

/**
 * Compute total IBU for a set of hop additions boiled in a batch of the
 * given wort gravity and final batch volume.
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
): IbuResult {
  const safeVolume = safePositive(batchVolumeL, 0);

  if (safeVolume <= 0) {
    return { totalIbu: 0, perAdditionIbu: hopAdditions.map(() => 0) };
  }

  const perAdditionIbu = hopAdditions.map((hop) => {
    const aaDecimal = Number.isFinite(hop.alphaAcidPercent) && hop.alphaAcidPercent > 0 ? hop.alphaAcidPercent / 100 : 0;
    const weightG = Number.isFinite(hop.weightG) && hop.weightG > 0 ? hop.weightG : 0;
    if (aaDecimal <= 0 || weightG <= 0) return 0;

    const utilization = tinsethUtilization(wortGravity, hop.boilTimeMinutes);
    return (aaDecimal * weightG * utilization * 1000) / safeVolume;
  });

  const totalIbu = perAdditionIbu.reduce((sum, ibu) => sum + ibu, 0);

  return { totalIbu, perAdditionIbu };
}

/**
 * Solve for the hop weight (grams) needed to hit a target IBU for a
 * single boil addition -- the inverse of `calculateIbu` for one hop,
 * derived algebraically from the same Tinseth relationship:
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
): number {
  const ibu = Number.isFinite(targetIbu) && targetIbu > 0 ? targetIbu : 0;
  const aaDecimal = Number.isFinite(alphaAcidPercent) && alphaAcidPercent > 0 ? alphaAcidPercent / 100 : 0;
  const volume = safePositive(batchVolumeL, 0);
  const utilization = tinsethUtilization(wortGravity, boilTimeMinutes);

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
