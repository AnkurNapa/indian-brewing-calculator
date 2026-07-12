/**
 * Fermentation and gravity calculators: ABV, attenuation, hydrometer
 * temperature correction. All formulas here are standard, widely
 * published brewing-science relationships (the same ones taught in
 * general brewing science education, including IBD coursework) -- an
 * original implementation, not sourced from any proprietary tool.
 *
 * Gravity is expressed as Specific Gravity (SG), e.g. 1.050, throughout.
 */

import { clamp } from './units';

function safeSg(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * ABV via the standard simple formula: ABV% = (OG - FG) * 131.25.
 * Accurate to roughly +/-0.2% ABV for typical beer gravities; less
 * accurate at very high OG (>1.100) where `calculateAbvAdvanced` should
 * be preferred.
 */
export function calculateAbvSimple(og: number, fg: number): number {
  const safeOg = safeSg(og, 1.0);
  const safeFg = safeSg(fg, safeOg);
  return Math.max(0, (safeOg - safeFg) * 131.25);
}

/**
 * ABV via the more accurate quadratic formula (Balling/Berry-derived),
 * which corrects for the nonlinearity that the simple formula ignores
 * at higher original gravities:
 *
 *   ABV% = (76.08 * (OG - FG) / (1.775 - OG)) * (FG / 0.794)
 *
 * This is the standard "advanced" ABV formula widely published in
 * brewing-science references and used when OG exceeds ~1.070.
 */
export function calculateAbvAdvanced(og: number, fg: number): number {
  const safeOg = safeSg(og, 1.0);
  const safeFg = safeSg(fg, safeOg);
  if (safeOg <= safeFg) return 0;
  const denominator = 1.775 - safeOg;
  if (denominator <= 0) return 0;
  const abv = ((76.08 * (safeOg - safeFg)) / denominator) * (safeFg / 0.794);
  return Math.max(0, abv);
}

export interface AttenuationResult {
  /** Apparent attenuation, % -- based on raw OG/FG hydrometer readings. */
  apparentAttenuationPercent: number;
  /**
   * Real attenuation, % -- corrects for alcohol's effect on the
   * hydrometer reading (alcohol is less dense than water, so FG reads
   * artificially low). Real attenuation is always less than apparent.
   * Real Extract = 0.1808*OE + 0.8192*AE (standard published relationship,
   * OE/AE in degrees Plato), converted back to attenuation %.
   */
  realAttenuationPercent: number;
}

/**
 * Convert SG to degrees Plato using the standard published polynomial
 * approximation (accurate to within ~0.1 °P across normal brewing
 * gravity ranges).
 */
export function sgToPlato(sg: number): number {
  const safe = safeSg(sg, 1.0);
  return -616.868 + 1111.14 * safe - 630.272 * safe ** 2 + 135.997 * safe ** 3;
}

/**
 * Compute apparent and real attenuation from OG/FG (as SG).
 */
export function calculateAttenuation(og: number, fg: number): AttenuationResult {
  const safeOg = safeSg(og, 1.0);
  const safeFg = safeSg(fg, safeOg);

  const apparentAttenuationPercent =
    safeOg > 1.0 ? clamp(((safeOg - safeFg) / (safeOg - 1.0)) * 100, 0, 100) : 0;

  const oe = sgToPlato(safeOg);
  const ae = sgToPlato(safeFg);
  const realExtract = 0.1808 * oe + 0.8192 * ae;
  const realAttenuationPercent = oe > 0 ? clamp(((oe - realExtract) / oe) * 100, 0, 100) : 0;

  return { apparentAttenuationPercent, realAttenuationPercent };
}

/**
 * Hydrometer temperature correction. Hydrometers are calibrated at a
 * reference temperature (typically 20°C); readings taken at other
 * temperatures need correction because water/wort density changes with
 * temperature. Uses the standard published correction formula:
 *
 *   correctedSG = measuredSG *
 *     ((1.00130346 - 0.000134722124*T + 0.00000204052596*T^2 - 0.00000000232820948*T^3) /
 *      (1.00130346 - 0.000134722124*Tc + 0.00000204052596*Tc^2 - 0.00000000232820948*Tc^3))
 *
 * where T = sample temperature (°F) and Tc = calibration temperature (°F).
 * Inputs/outputs here are in °C for consistency with the rest of this
 * metric-only app; internally converted to °F to apply the published
 * formula, then the ratio is applied to the measured SG.
 */
export function correctHydrometerReading(
  measuredSg: number,
  sampleTempC: number,
  calibrationTempC = 20,
): number {
  const safeSgValue = safeSg(measuredSg, 1.0);
  const safeSampleC = Number.isFinite(sampleTempC) ? sampleTempC : calibrationTempC;
  const safeCalibrationC = Number.isFinite(calibrationTempC) ? calibrationTempC : 20;

  const toF = (c: number) => c * 1.8 + 32;
  const densityFactor = (tF: number) =>
    1.00130346 - 0.000134722124 * tF + 0.00000204052596 * tF ** 2 - 0.00000000232820948 * tF ** 3;

  const sampleF = toF(safeSampleC);
  const calibrationF = toF(safeCalibrationC);

  const numerator = densityFactor(sampleF);
  const denominator = densityFactor(calibrationF);

  if (denominator === 0) return safeSgValue;

  return safeSgValue * (numerator / denominator);
}
