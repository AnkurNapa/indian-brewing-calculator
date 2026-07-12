/**
 * Brewhouse / mash efficiency calculator.
 *
 * Standard published relationship: each malt has a maximum theoretical
 * extract potential (points per kg per liter, derived from its
 * published "potential SG" or PPG-equivalent), and brewhouse efficiency
 * is the fraction of that theoretical maximum actually captured into
 * the kettle/fermenter for a given batch, measured via actual gravity.
 *
 * Gravity "points" convention: SG 1.050 = 50 points. This module uses
 * metric units throughout (kg grain, L wort), computing efficiency from
 * gravity points rather than the imperial PPG convention.
 */

function safePositive(value: number, fallback = 0): number {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/** Convert SG (e.g. 1.050) to gravity points (e.g. 50). */
export function sgToPoints(sg: number): number {
  const safe = Number.isFinite(sg) && sg > 0 ? sg : 1.0;
  return (safe - 1.0) * 1000;
}

/** Convert gravity points (e.g. 50) back to SG (e.g. 1.050). */
export function pointsToSg(points: number): number {
  const safe = Number.isFinite(points) ? points : 0;
  return 1.0 + safe / 1000;
}

export interface GrainPotentialItem {
  name: string;
  weightKg: number;
  /**
   * Potential extract, expressed as the SG this malt would produce if
   * 1 kg were fully converted into 1 L of water (a standard maltster
   * "potential" spec, typically 1.030-1.038 for base malts).
   */
  potentialSg: number;
}

export interface EfficiencyResult {
  /** Maximum theoretical gravity points achievable from the grist, for this batch volume. */
  maxTheoreticalPoints: number;
  /** Actual gravity points measured/achieved. */
  actualPoints: number;
  /** Brewhouse efficiency, % (actual / theoretical maximum). */
  efficiencyPercent: number;
}

/**
 * Compute brewhouse efficiency from a grain bill (with per-grain
 * potential SG), the actual measured gravity, and the batch volume the
 * gravity was measured at (typically pre-boil or post-boil volume,
 * whichever the brewer measures).
 *
 * Edge cases handled:
 *  - Zero grain weight or zero volume: returns 0% efficiency rather
 *    than dividing by zero.
 */
export function calculateBrewhouseEfficiency(
  grainBill: GrainPotentialItem[],
  actualMeasuredSg: number,
  measuredVolumeL: number,
): EfficiencyResult {
  const safeVolume = safePositive(measuredVolumeL);
  const validItems = grainBill.filter(
    (item) => Number.isFinite(item.weightKg) && item.weightKg > 0 && Number.isFinite(item.potentialSg) && item.potentialSg > 1,
  );

  const totalPotentialPointsPerLiter = validItems.reduce(
    (sum, item) => sum + sgToPoints(item.potentialSg) * item.weightKg,
    0,
  );

  if (safeVolume <= 0 || totalPotentialPointsPerLiter <= 0) {
    return { maxTheoreticalPoints: 0, actualPoints: 0, efficiencyPercent: 0 };
  }

  const maxTheoreticalPoints = totalPotentialPointsPerLiter / safeVolume;
  const actualPoints = sgToPoints(safePositive(actualMeasuredSg, 1.0));

  const efficiencyPercent =
    maxTheoreticalPoints > 0 ? Math.max(0, (actualPoints / maxTheoreticalPoints) * 100) : 0;

  return { maxTheoreticalPoints, actualPoints, efficiencyPercent };
}

/**
 * Predict OG from a grain bill's extract potential, an assumed brewhouse
 * efficiency, and the batch volume -- the inverse of
 * calculateBrewhouseEfficiency, useful before brew day when there's no
 * measured gravity yet, just a planned grist and a target volume.
 *
 * Grist rows without a potentialSg are silently skipped (contribute 0
 * points) rather than treated as an error, since potentialSg is optional
 * on GrainBillItem -- a partially-specified grain bill still gets a
 * partial-but-honest estimate instead of failing outright.
 */
export function predictOriginalGravity(
  grainBill: GrainPotentialItem[],
  batchVolumeL: number,
  assumedEfficiencyPercent: number,
): number {
  const safeVolume = safePositive(batchVolumeL);
  const safeEfficiency = Math.max(0, Math.min(100, Number.isFinite(assumedEfficiencyPercent) ? assumedEfficiencyPercent : 0));

  const validItems = grainBill.filter(
    (item) => Number.isFinite(item.weightKg) && item.weightKg > 0 && Number.isFinite(item.potentialSg) && item.potentialSg > 1,
  );
  const totalPotentialPointsPerLiter = validItems.reduce(
    (sum, item) => sum + sgToPoints(item.potentialSg) * item.weightKg,
    0,
  );

  if (safeVolume <= 0 || totalPotentialPointsPerLiter <= 0) return 1.0;

  const maxTheoreticalPoints = totalPotentialPointsPerLiter / safeVolume;
  const predictedPoints = maxTheoreticalPoints * (safeEfficiency / 100);

  return pointsToSg(predictedPoints);
}
