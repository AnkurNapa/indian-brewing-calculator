/**
 * Spent grain estimation.
 *
 * After the mash, the extractable sugars leave with the wort; what stays in
 * the mash tun is the insoluble husk/protein solids plus a lot of retained
 * water. The wet mass a brewer actually shovels out is dominated by that
 * water (spent grain is ~75-85% moisture), which is why it weighs far more
 * than the "lost" dry solids suggest.
 */
export interface SpentGrainInputs {
  /** Total grist weight, kg. */
  grainKg: number;
  /** Share of grist dry mass that dissolves into wort as extract, %. */
  extractYieldPercent: number;
  /** Moisture of the wet spent grain as removed, %. */
  moisturePercent: number;
  /** Bulk density of wet spent grain, kg/L, for the volume estimate. */
  wetDensityKgL: number;
}

export interface SpentGrainResult {
  /** Insoluble dry solids remaining, kg. */
  dryKg: number;
  /** Water retained in the spent grain, kg. */
  waterKg: number;
  /** Total wet spent grain as removed, kg. */
  wetKg: number;
  /** Approximate wet volume, L. */
  volumeL: number;
}

export const DEFAULT_SPENT_GRAIN: Omit<SpentGrainInputs, 'grainKg'> = {
  extractYieldPercent: 75,
  moisturePercent: 80,
  wetDensityKgL: 0.9,
};

const clampNonNeg = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

export function calculateSpentGrain(inputs: SpentGrainInputs): SpentGrainResult {
  const grain = clampNonNeg(inputs.grainKg);
  const extract = Math.min(Math.max(inputs.extractYieldPercent, 0), 99) / 100;
  const moisture = Math.min(Math.max(inputs.moisturePercent, 0), 95) / 100;
  const density = clampNonNeg(inputs.wetDensityKgL);

  // Dry solids that stay behind = grist not converted to extract.
  const dryKg = grain * (1 - extract);
  // Wet mass at the given moisture: dry / (1 - moisture).
  const wetKg = moisture < 1 ? dryKg / (1 - moisture) : dryKg;
  const waterKg = Math.max(0, wetKg - dryKg);
  const volumeL = density > 0 ? wetKg / density : 0;

  return {
    dryKg: +dryKg.toFixed(2),
    waterKg: +waterKg.toFixed(2),
    wetKg: +wetKg.toFixed(2),
    volumeL: +volumeL.toFixed(1),
  };
}
