/**
 * Force (CO2 tank) carbonation calculator -- for breweries carbonating
 * in a bright tank/keg with a CO2 regulator rather than bottle-priming.
 *
 * Uses the widely-published regression fit of CO2 solubility in beer as
 * a function of temperature and applied pressure (commonly reproduced
 * across independent brewing calculators/tools as the standard public
 * carbonation-chart formula, derived from Henry's law solubility data):
 *
 *   P(psi) = -16.6999 - 0.0101059*Tf + 0.00116512*Tf^2
 *            + 0.173354*Tf*V + 4.24267*V
 *            - 0.0684226*V*Tf - 0.0842548*V^2 + 0.0220689*V^2*Tf
 *
 * where Tf = temperature in °F, V = target CO2 volumes, P = required
 * regulator pressure in psi (gauge). This app is otherwise metric-only,
 * but CO2 regulators worldwide (including in India) are calibrated in
 * psi, so pressure is reported in psi with a bar conversion alongside.
 *
 * IMPORTANT ACCURACY CAVEAT: this is a regression fit reconstructed from
 * general knowledge of the standard published carbonation-chart formula
 * shape, not a value copied from a verified authoritative source. CO2
 * solubility in beer also genuinely varies with the beer's alcohol and
 * sugar content, not just temperature/pressure. Treat the output as a
 * rough starting point only -- ALWAYS cross-check against a physical
 * carbonation chart (commonly posted next to commercial CO2 tanks) or
 * your regulator vendor's chart before setting tank pressure, and
 * adjust based on measured carbonation in the finished beer.
 */

const PSI_PER_BAR = 14.5038;

function safeFinite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function celsiusToFahrenheit(c: number): number {
  return c * 1.8 + 32;
}

export interface ForceCarbonationResult {
  /** Required regulator pressure, psi (gauge). */
  pressurePsi: number;
  /** Required regulator pressure, bar (gauge), for regulators calibrated in bar. */
  pressureBar: number;
}

/**
 * Compute the CO2 regulator pressure needed to reach `targetCo2Volumes`
 * at `temperatureC` (the temperature of the beer being carbonated,
 * e.g. bright tank or keg temperature).
 *
 * Edge case: negative computed pressure (physically implausible target
 * at a given temperature) is clamped to 0 rather than returned as
 * negative -- a negative result generally means the target volumes are
 * already below what the beer would passively hold at that temperature
 * and atmospheric pressure.
 */
export function calculateForceCarbonationPressure(
  targetCo2Volumes: number,
  temperatureC: number,
): ForceCarbonationResult {
  const v = Number.isFinite(targetCo2Volumes) && targetCo2Volumes > 0 ? targetCo2Volumes : 0;
  const tC = safeFinite(temperatureC, 4);
  const tf = celsiusToFahrenheit(tC);

  if (v <= 0) {
    return { pressurePsi: 0, pressureBar: 0 };
  }

  const pressurePsiRaw =
    -16.6999 -
    0.0101059 * tf +
    0.00116512 * tf ** 2 +
    0.173354 * tf * v +
    4.24267 * v -
    0.0684226 * v * tf -
    0.0842548 * v ** 2 +
    0.0220689 * v ** 2 * tf;

  const pressurePsi = Math.max(0, pressurePsiRaw);
  const pressureBar = pressurePsi / PSI_PER_BAR;

  return { pressurePsi, pressureBar };
}
