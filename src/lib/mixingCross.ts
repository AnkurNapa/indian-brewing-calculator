/**
 * General mixing cross (Pearson Square) calculation.
 *
 * A two-component blend where each component carries a single, linearly-
 * mixing parameter (extract in °P, ABV %, temperature °C, or any custom
 * quantity that averages by mass/volume). Given both component parameters
 * and a desired mixture parameter, the cross yields the ratio ("parts")
 * of each component required, and -- when a batch size or one component's
 * quantity is supplied -- the actual amounts of each.
 *
 * Classic form (see any brewing/distilling calculations text):
 *
 *   Component A (paramA) ------\        /------ parts of A = |paramB - target|
 *                          target (mixture)
 *   Component B (paramB) ------/        \------ parts of B = |target - paramA|
 *
 * Each arm crosses: A's share is the *distance from B to the target*, and
 * vice-versa, because the component further from the target must be used
 * in the smaller proportion.
 *
 * Feasibility: the target must lie between the two component parameters
 * (a blend can be no stronger than the strongest component nor weaker
 * than the weakest). If both parameters are equal, or the target lies
 * outside their range, no positive blend reaches it -- flagged rather
 * than returning a nonsensical negative or NaN amount. This mirrors the
 * `additionIsUsable` guard in `waterTemperature.ts`, generalized.
 *
 * This module has no access to the i18n `t()` function, so the panel that
 * renders warnings maps each note `code` (+ its params) to a translated
 * string, the same pattern used by `waterTemperature.ts`.
 */

const EPSILON = 1e-9;

function safeFinite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export type MixingParameterId = 'gravityPlato' | 'abv' | 'temperature' | 'custom';

export interface MixingParameterPreset {
  id: MixingParameterId;
  /** Display unit symbol -- universal, not translated. Empty for custom. */
  unit: string;
  /** Sensible input step for this parameter's typical magnitude. */
  step: number;
  /** Decimal places to show for the parameter values. */
  paramDecimals: number;
  /** Starting values, chosen to be recognisable worked examples. */
  defaults: { paramA: number; paramB: number; target: number; knownAmount: number };
}

/**
 * Preset parameter contexts. `temperature` defaults reproduce the
 * textbook worked example (100 kg at 15 °C + water at 30 °C -> 25 °C
 * needs 200 kg, total 300 kg); `gravityPlato` reproduces the panel's
 * preview (15 °P + 4 °P -> 12 °P is 4:8 parts).
 */
export const MIXING_PARAMETERS: readonly MixingParameterPreset[] = [
  { id: 'gravityPlato', unit: '°P', step: 0.5, paramDecimals: 1, defaults: { paramA: 15, paramB: 4, target: 12, knownAmount: 20 } },
  { id: 'abv', unit: '%', step: 0.1, paramDecimals: 1, defaults: { paramA: 8, paramB: 4, target: 5, knownAmount: 20 } },
  { id: 'temperature', unit: '°C', step: 1, paramDecimals: 1, defaults: { paramA: 15, paramB: 30, target: 25, knownAmount: 100 } },
  { id: 'custom', unit: '', step: 1, paramDecimals: 2, defaults: { paramA: 100, paramB: 0, target: 50, knownAmount: 10 } },
] as const;

export type MixingCrossNote =
  | { code: 'parametersEqual' }
  | { code: 'targetOutOfRange'; min: number; max: number };

export interface MixingCrossParts {
  /** Parts (arms of the cross) of component A. */
  partsA: number;
  /** Parts of component B. */
  partsB: number;
  /** Fraction of the blend that is component A, 0..1. */
  fractionA: number;
  /** Fraction of the blend that is component B, 0..1. */
  fractionB: number;
  /** True if no positive two-component blend can hit the target. */
  infeasible: boolean;
  note: MixingCrossNote | null;
}

/**
 * Solve the cross: from the two component parameters and the desired
 * mixture parameter, return the parts (arm lengths) and the resulting
 * blend fractions.
 *
 * Endpoints are inclusive: a target equal to one component's parameter
 * yields a valid 100%/0% answer (just use that one component). Only a
 * target strictly outside the two parameters, or two equal parameters,
 * is infeasible.
 */
export function solveMixingCross(
  paramA: number,
  paramB: number,
  targetParam: number,
): MixingCrossParts {
  const pA = safeFinite(paramA, 0);
  const pB = safeFinite(paramB, 0);
  const pM = safeFinite(targetParam, 0);

  const empty = { partsA: 0, partsB: 0, fractionA: 0, fractionB: 0 };

  if (Math.abs(pA - pB) <= EPSILON) {
    return { ...empty, infeasible: true, note: { code: 'parametersEqual' } };
  }

  const min = Math.min(pA, pB);
  const max = Math.max(pA, pB);
  if (pM < min - EPSILON || pM > max + EPSILON) {
    return { ...empty, infeasible: true, note: { code: 'targetOutOfRange', min, max } };
  }

  const partsA = Math.abs(pB - pM);
  const partsB = Math.abs(pM - pA);
  const total = partsA + partsB;
  const fractionA = total > 0 ? partsA / total : 0;
  const fractionB = total > 0 ? partsB / total : 0;

  return { partsA, partsB, fractionA, fractionB, infeasible: false, note: null };
}

export interface MixingCrossQuantities {
  amountA: number;
  amountB: number;
  total: number;
}

/**
 * Split a known total batch size into the two component amounts using the
 * solved blend fractions.
 */
export function quantitiesFromTotal(
  parts: MixingCrossParts,
  total: number,
): MixingCrossQuantities {
  const q = Math.max(0, safeFinite(total, 0));
  return { amountA: parts.fractionA * q, amountB: parts.fractionB * q, total: q };
}

/**
 * Given a known amount of one component, scale up to the full blend --
 * the classic "I have 100 kg of this, how much of the other and what's
 * the total?" question the textbook example poses.
 *
 * Edge case: if the known component's fraction is ~0 (the target equals
 * the *other* component's parameter, so this component contributes
 * nothing), the blend can't be scaled from it -- return the known amount
 * as-is with the other at 0 rather than dividing by zero.
 */
export function quantitiesFromComponent(
  parts: MixingCrossParts,
  knownAmount: number,
  which: 'A' | 'B',
): MixingCrossQuantities {
  const q = Math.max(0, safeFinite(knownAmount, 0));
  const knownFraction = which === 'A' ? parts.fractionA : parts.fractionB;

  if (knownFraction <= EPSILON) {
    return which === 'A'
      ? { amountA: q, amountB: 0, total: q }
      : { amountA: 0, amountB: q, total: q };
  }

  const total = q / knownFraction;
  return { amountA: parts.fractionA * total, amountB: parts.fractionB * total, total };
}
