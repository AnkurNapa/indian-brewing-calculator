/**
 * Yeast pitch rate calculator.
 *
 * Standard published pitch-rate guidance (widely cited in brewing
 * science, e.g. ~0.75 million cells/mL/°Plato for ales, ~1.5 million
 * cells/mL/°Plato for lagers) converted into a target total cell count
 * for a given batch, then into a practical dose of dry yeast or liquid
 * slurry using published typical cell-density figures for each format.
 */

import { sgToPlato } from './fermentation';

export type YeastStyle = 'ale' | 'lager';

/**
 * Target pitch rate, million cells per mL per degree Plato. These are
 * standard published midpoint figures for clean ale vs. lager
 * fermentation, not sourced from any proprietary tool.
 */
const PITCH_RATE_MILLION_CELLS_PER_ML_PER_PLATO: Record<YeastStyle, number> = {
  ale: 0.75,
  lager: 1.5,
};

/** Typical viable cell density of fresh active dry yeast, billion cells per gram. */
const DRY_YEAST_BILLION_CELLS_PER_G = 10;

/** Typical viable cell density of healthy liquid yeast slurry, billion cells per mL. */
const SLURRY_BILLION_CELLS_PER_ML = 1;

function safePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export interface PitchRateResult {
  /** Total viable cells needed for this batch, in billions. */
  targetCellsBillion: number;
  /** Grams of fresh dry yeast needed to hit the target cell count. */
  dryYeastGrams: number;
  /** mL of healthy liquid slurry needed to hit the target cell count. */
  slurryMl: number;
}

export interface RepitchSlurryResult {
  /** mL of harvested (cropped) slurry needed, accounting for measured viability. */
  slurryMlNeeded: number;
  /** Viable cells actually delivered by that volume, billions -- should equal targetCellsBillion. */
  viableCellsDeliveredBillion: number;
}

/**
 * Compute how much harvested/cropped yeast slurry (e.g. from a
 * conical's cone harvest, common practice when repitching rather than
 * buying fresh dry yeast every batch) is needed to hit a target cell
 * count, accounting for the slurry's measured viable cell density and
 * viability percentage (cropped slurry is never 100% viable -- older
 * generations and stressed harvests read lower).
 *
 * Edge cases handled:
 *  - Non-positive target cells, density, or viability: returns 0 mL
 *    needed rather than dividing by zero or returning a negative/NaN
 *    volume.
 */
export function calculateRepitchSlurryVolume(
  targetCellsBillion: number,
  slurryBillionCellsPerMl: number,
  viabilityPercent: number,
): RepitchSlurryResult {
  const target = safePositive(targetCellsBillion, 0);
  const density = safePositive(slurryBillionCellsPerMl, 0);
  const viability = Number.isFinite(viabilityPercent) ? Math.min(100, Math.max(0, viabilityPercent)) : 0;

  if (target <= 0 || density <= 0 || viability <= 0) {
    return { slurryMlNeeded: 0, viableCellsDeliveredBillion: 0 };
  }

  const viableDensity = density * (viability / 100);
  const slurryMlNeeded = target / viableDensity;
  const viableCellsDeliveredBillion = slurryMlNeeded * viableDensity;

  return { slurryMlNeeded, viableCellsDeliveredBillion };
}

/**
 * Compute the yeast pitch requirement for a batch.
 *
 * Edge cases handled:
 *  - Non-positive OG or volume: returns all-zero result rather than
 *    producing NaN/negative doses.
 */
export function calculatePitchRate(
  og: number,
  batchVolumeL: number,
  style: YeastStyle,
): PitchRateResult {
  const safeOg = safePositive(og, 1.0);
  const safeVolume = safePositive(batchVolumeL, 0);

  if (safeVolume <= 0 || safeOg <= 1.0) {
    return { targetCellsBillion: 0, dryYeastGrams: 0, slurryMl: 0 };
  }

  const plato = sgToPlato(safeOg);
  const millionCellsPerMl = PITCH_RATE_MILLION_CELLS_PER_ML_PER_PLATO[style] * plato;
  const batchVolumeMl = safeVolume * 1000;

  const targetCellsMillion = millionCellsPerMl * batchVolumeMl;
  const targetCellsBillion = targetCellsMillion / 1000;

  const dryYeastGrams = targetCellsBillion / DRY_YEAST_BILLION_CELLS_PER_G;
  const slurryMl = targetCellsBillion / SLURRY_BILLION_CELLS_PER_ML;

  return { targetCellsBillion, dryYeastGrams, slurryMl };
}
