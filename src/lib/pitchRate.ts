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
