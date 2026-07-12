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
