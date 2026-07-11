/**
 * Central unit definitions and conversions.
 *
 * This app is strictly metric/MKS. The only units used anywhere are:
 *   - Volume: Liters (L), Hectoliters (HL)
 *   - Mass: milligrams (mg), grams (g), kilograms (kg)
 *   - Temperature: degrees Celsius (°C)
 *   - Grain color: degrees Lovibond (°L) — a brewing-industry convention,
 *     not an SI unit, but retained because it is the universal grain-color
 *     scale used by maltsters and brewers worldwide (including in metric
 *     countries). No imperial units (gallons, ounces, °F) are used anywhere.
 */

export const HL_TO_L = 100;

/** Convert hectoliters to liters. */
export function hlToL(hl: number): number {
  return hl * HL_TO_L;
}

/** Convert liters to hectoliters. */
export function lToHl(l: number): number {
  return l / HL_TO_L;
}

/** Convert kilograms to grams. */
export function kgToG(kg: number): number {
  return kg * 1000;
}

/** Convert grams to kilograms. */
export function gToKg(g: number): number {
  return g / 1000;
}

/**
 * Round a number to a fixed number of decimal places for *display only*.
 * Internal computation should always use full float precision; only call
 * this at the point of rendering a value to the user.
 */
export function roundForDisplay(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export const UNIT_LABELS = {
  volumeSmall: 'L',
  volumeLarge: 'HL',
  massSmall: 'mg',
  massLarge: 'g',
  temperature: '°C',
  grainColor: '°L',
  concentration: 'mg/L',
} as const;

/** Clamp a value between a min and max, inclusive. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Parse a user-supplied numeric string safely.
 * - Empty / whitespace-only input => 0 (never NaN).
 * - Non-numeric / malformed input => null (caller should treat as invalid).
 * - Negative values are allowed to pass through here; callers that require
 *   non-negative quantities should use parseNonNegative instead.
 */
export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return 0;
  const value = Number(trimmed);
  if (Number.isNaN(value) || !Number.isFinite(value)) return null;
  return value;
}

/**
 * Parse a user-supplied numeric string that must be non-negative
 * (ion concentrations, volumes, weights, etc.).
 * Returns null for malformed input, clamps negatives to 0.
 */
export function parseNonNegative(raw: string): number | null {
  const parsed = parseNumericInput(raw);
  if (parsed === null) return null;
  return Math.max(0, parsed);
}
