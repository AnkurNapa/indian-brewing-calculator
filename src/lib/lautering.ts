/**
 * Lautering calculators: grain bed depth (stuck-mash risk check) and a
 * runoff gravity cutoff advisor for deciding when to stop collecting
 * sparge runnings. Standard, generally-published brewing-operations
 * guidance, original implementation.
 */

function safePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Typical packed grain-bed volume per kg of grist, liters -- accounts
 * for the grain husks/particles plus the liquid held in the interstitial
 * spaces between them once mashed in. Widely cited approximate range is
 * 0.65-1.0 L/kg depending on crush and malt type; 0.7 L/kg is used as a
 * reasonable default here and is exposed as a parameter for calibration.
 */
export const DEFAULT_BED_VOLUME_L_PER_KG = 0.7;

/**
 * Grain bed depth beyond which stuck-mash/compaction risk rises
 * significantly on typical lauter tun designs, per generally-published
 * brewing-operations guidance (commonly cited around 45-60 cm / 18-24
 * inches). Used only as an advisory threshold, not a hard limit --
 * actual risk also depends on crush, false-bottom design, and rake use.
 */
export const STUCK_MASH_RISK_DEPTH_CM = 45;

export interface GrainBedDepthResult {
  /** Estimated packed grain bed volume, L. */
  bedVolumeL: number;
  /** Estimated grain bed depth in the lauter tun, cm. */
  bedDepthCm: number;
  /** True if bed depth exceeds the stuck-mash risk threshold. */
  stuckMashRisk: boolean;
  notes: string[];
}

/**
 * Estimate grain bed depth in a cylindrical lauter tun of the given
 * internal diameter, from total grist weight.
 *
 * Edge cases handled:
 *  - Zero/negative grain weight or diameter: returns 0 depth rather
 *    than dividing by zero or producing NaN.
 */
export function calculateGrainBedDepth(
  grainWeightKg: number,
  lauterTunDiameterCm: number,
  bedVolumeLPerKg: number = DEFAULT_BED_VOLUME_L_PER_KG,
): GrainBedDepthResult {
  const weight = Number.isFinite(grainWeightKg) && grainWeightKg > 0 ? grainWeightKg : 0;
  const diameter = safePositive(lauterTunDiameterCm, 0);
  const perKg = safePositive(bedVolumeLPerKg, DEFAULT_BED_VOLUME_L_PER_KG);

  const bedVolumeL = weight * perKg;

  if (weight <= 0 || diameter <= 0) {
    return { bedVolumeL, bedDepthCm: 0, stuckMashRisk: false, notes: [] };
  }

  const radiusCm = diameter / 2;
  const crossSectionAreaCm2 = Math.PI * radiusCm ** 2;
  const bedVolumeCm3 = bedVolumeL * 1000;
  const bedDepthCm = bedVolumeCm3 / crossSectionAreaCm2;

  const stuckMashRisk = bedDepthCm > STUCK_MASH_RISK_DEPTH_CM;
  const notes = stuckMashRisk
    ? [
        `Estimated bed depth (${bedDepthCm.toFixed(0)} cm) exceeds the typical stuck-mash risk threshold (${STUCK_MASH_RISK_DEPTH_CM} cm) -- consider a wider tun, a coarser crush, or rely more on continuous recirculation/rake use.`,
      ]
    : [];

  return { bedVolumeL, bedDepthCm, stuckMashRisk, notes };
}

export interface RunoffCutoffResult {
  /** True if runnings should continue being collected (current gravity still above cutoff). */
  shouldContinueCollecting: boolean;
  /** Gravity points remaining above the cutoff (0 if at/below cutoff). */
  gravityPointsAboveCutoff: number;
  note: string;
}

/**
 * Advise whether to continue collecting sparge runnings based on the
 * current runnings gravity vs. a cutoff gravity. Standard brewing
 * practice: stop collecting once runnings gravity drops to roughly
 * 1.008-1.010 SG to avoid extracting tannins from the grain husks.
 */
export function evaluateRunoffCutoff(currentRunningsSg: number, cutoffSg = 1.008): RunoffCutoffResult {
  const current = Number.isFinite(currentRunningsSg) && currentRunningsSg > 0 ? currentRunningsSg : 1.0;
  const cutoff = Number.isFinite(cutoffSg) && cutoffSg > 0 ? cutoffSg : 1.008;

  const gravityPointsAboveCutoff = Math.max(0, (current - cutoff) * 1000);
  const shouldContinueCollecting = current > cutoff;

  return {
    shouldContinueCollecting,
    gravityPointsAboveCutoff,
    note: shouldContinueCollecting
      ? `Runnings still above the ${cutoff.toFixed(3)} SG cutoff -- keep collecting.`
      : `Runnings at or below the ${cutoff.toFixed(3)} SG cutoff -- stop collecting to avoid extracting tannins from the grain husks.`,
  };
}
