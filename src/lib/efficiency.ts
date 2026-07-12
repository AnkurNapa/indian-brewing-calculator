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

export interface GrainPercentItem {
  /** Percent of the total grist by weight, e.g. 80 for 80%. Rows should sum to 100 across the bill. */
  percentOfBill: number;
  potentialSg: number;
}

/**
 * Solve grain weights (kg) from a target OG, batch volume, assumed
 * efficiency, and each malt's percent-of-bill -- the inverse of
 * `predictOriginalGravity`, for planning a recipe backward from "I want
 * this OG, using roughly this base/specialty malt ratio" instead of
 * guessing weights and checking the resulting OG.
 *
 *   totalPoints = (targetOG - 1) * 1000 * batchVolumeL
 *   maltPoints_i = totalPoints * (percentOfBill_i / 100)
 *   maltWeightKg_i = maltPoints_i / (sgToPoints(potentialSg_i) * efficiencyDecimal)
 *
 * Percentages are NOT required to already sum to 100 -- each row's
 * effective share is normalized against the actual sum, so entering
 * 40/40/40 (120 total) is treated the same as 33.3/33.3/33.3, rather
 * than silently producing a grist 20% too big. Callers that want a
 * strict validation error instead of silent normalization should check
 * the sum themselves before calling.
 *
 * Edge cases handled:
 *  - Non-positive batch volume, target OG <= 1.0, or a percent sum of
 *    0: every row returns 0 kg rather than dividing by zero.
 *  - A row with a non-positive potentialSg contributes 0 kg for that
 *    row specifically (can't solve a weight for an unknown-potential
 *    malt), without failing the other rows.
 */
export function solveGrainWeightsByPercent(
  items: GrainPercentItem[],
  targetOgSg: number,
  batchVolumeL: number,
  assumedEfficiencyPercent: number,
): number[] {
  const safeVolume = safePositive(batchVolumeL);
  const safeEfficiency = Math.max(0, Math.min(100, Number.isFinite(assumedEfficiencyPercent) ? assumedEfficiencyPercent : 0));
  const efficiencyDecimal = safeEfficiency / 100;

  const percentSum = items.reduce((sum, item) => sum + (Number.isFinite(item.percentOfBill) && item.percentOfBill > 0 ? item.percentOfBill : 0), 0);

  if (safeVolume <= 0 || targetOgSg <= 1.0 || percentSum <= 0 || efficiencyDecimal <= 0) {
    return items.map(() => 0);
  }

  const totalPoints = sgToPoints(targetOgSg) * safeVolume;

  return items.map((item) => {
    const rawPercent = Number.isFinite(item.percentOfBill) && item.percentOfBill > 0 ? item.percentOfBill : 0;
    const normalizedPercent = rawPercent / percentSum;
    const potentialPoints = Number.isFinite(item.potentialSg) && item.potentialSg > 1 ? sgToPoints(item.potentialSg) : 0;
    if (potentialPoints <= 0) return 0;

    const maltPoints = totalPoints * normalizedPercent;
    return maltPoints / (potentialPoints * efficiencyDecimal);
  });
}
