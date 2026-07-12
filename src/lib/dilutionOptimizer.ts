/**
 * RO/distilled-water dilution ratio optimizer.
 *
 * Salts can only ever raise an ion's concentration (see saltAdditions.ts).
 * When a source water's ion is already above a target ceiling, the only
 * way to bring it down is to dilute the source with a lower-mineral
 * water (typically RO or distilled) before adding salts back up to the
 * target. This module solves for the dilution ratio needed to bring
 * every "must not exceed" ion at or below its ceiling, using the
 * standard linear water-blending relationship:
 *
 *   blended_ion = source_ion * sourceFraction + dilutant_ion * (1 - sourceFraction)
 *
 * Solved for sourceFraction per ion:
 *   sourceFraction = (target_ion - dilutant_ion) / (source_ion - dilutant_ion)
 *
 * When multiple ions each require dilution, the binding constraint is
 * the ion that requires the *most* dilution (the smallest sourceFraction)
 * -- diluting enough to satisfy that ion automatically satisfies the
 * others (since dilution lowers every ion proportionally).
 */

import { IonProfile } from './waterChemistry';

const ION_KEYS: (keyof IonProfile)[] = [
  'calcium',
  'magnesium',
  'sodium',
  'sulfate',
  'chloride',
  'bicarbonate',
  'alkalinity',
];

export interface DilutionConstraintDetail {
  ion: keyof IonProfile;
  /** Maximum allowed concentration for this ion, mg/L. */
  ceiling: number;
  /** Source fraction (0-1) that would exactly satisfy this ion alone. */
  requiredSourceFraction: number;
}

export interface DilutionResult {
  /** Fraction (0-1) of the final water volume that should be the source (undiluted) water. */
  sourceFraction: number;
  /** Fraction (0-1) of the final water volume that should be the dilutant (RO/distilled). */
  dilutantFraction: number;
  /** True if no dilution is needed (source already meets every ceiling). */
  noDilutionNeeded: boolean;
  /** The ion that determined the final ratio (the tightest constraint), if any. */
  bindingIon: keyof IonProfile | null;
  /** Per-ion breakdown of what fraction each ceiling alone would require. */
  constraints: DilutionConstraintDetail[];
  /** Resulting ion profile after blending at the solved ratio. */
  resultingProfile: IonProfile;
  notes: string[];
}

/**
 * Given liters of blended water desired, compute how many liters of
 * source and dilutant to combine for a solved DilutionResult.
 */
export interface DilutionVolumes {
  sourceVolumeL: number;
  dilutantVolumeL: number;
}

export function dilutionResultToVolumes(result: DilutionResult, totalVolumeL: number): DilutionVolumes {
  const safeVolume = Number.isFinite(totalVolumeL) && totalVolumeL > 0 ? totalVolumeL : 0;
  return {
    sourceVolumeL: safeVolume * result.sourceFraction,
    dilutantVolumeL: safeVolume * result.dilutantFraction,
  };
}

/**
 * Solve for the source-water fraction needed so that every ion in
 * `ceilings` is at or below its specified maximum, blending `source`
 * water with `dilutant` water (typically RO/distilled, but any
 * lower-mineral water works).
 *
 * Edge cases handled:
 *  - Ions not present in `ceilings` are ignored (no constraint).
 *  - If source is already at/below every ceiling, returns
 *    sourceFraction = 1 (no dilution) with noDilutionNeeded = true.
 *  - If dilutant_ion >= source_ion for a given ion (dilutant isn't
 *    actually lower in that ion), that ion is skipped as an
 *    unsatisfiable-by-dilution constraint and a note is added --
 *    dilution cannot help an ion where the dilutant is equal or higher.
 *  - If the tightest required fraction is negative (target below what
 *    even 100% dilutant achieves), it's clamped to 0.
 */
export function solveDilutionRatio(
  source: IonProfile,
  dilutant: IonProfile,
  ceilings: Partial<Record<keyof IonProfile, number>>,
): DilutionResult {
  const notes: string[] = [];
  const constraints: DilutionConstraintDetail[] = [];

  for (const ion of ION_KEYS) {
    const ceiling = ceilings[ion];
    if (ceiling === undefined) continue;

    const sourceValue = source[ion];
    const dilutantValue = dilutant[ion];

    if (sourceValue <= ceiling + 1e-9) {
      // Already satisfied at full strength; not a binding constraint.
      continue;
    }

    if (dilutantValue >= sourceValue - 1e-9) {
      notes.push(
        `${ion}: dilutant water (${dilutantValue.toFixed(1)} mg/L) is not lower than the source (${sourceValue.toFixed(
          1,
        )} mg/L) for this ion, so dilution cannot bring it below the ${ceiling.toFixed(1)} mg/L ceiling. Choose a lower-mineral dilutant or accept this ion above target.`,
      );
      continue;
    }

    const requiredSourceFraction = Math.max(
      0,
      (ceiling - dilutantValue) / (sourceValue - dilutantValue),
    );

    constraints.push({ ion, ceiling, requiredSourceFraction });
  }

  if (constraints.length === 0) {
    return {
      sourceFraction: 1,
      dilutantFraction: 0,
      noDilutionNeeded: true,
      bindingIon: null,
      constraints: [],
      resultingProfile: { ...source },
      notes: notes.length > 0 ? notes : ['Source water already meets every specified ceiling -- no dilution needed.'],
    };
  }

  const tightest = constraints.reduce((min, c) => (c.requiredSourceFraction < min.requiredSourceFraction ? c : min));

  const sourceFraction = clampFraction(tightest.requiredSourceFraction);
  const dilutantFraction = 1 - sourceFraction;

  const resultingProfile = ION_KEYS.reduce((acc, ion) => {
    acc[ion] = source[ion] * sourceFraction + dilutant[ion] * dilutantFraction;
    return acc;
  }, {} as IonProfile);

  return {
    sourceFraction,
    dilutantFraction,
    noDilutionNeeded: false,
    bindingIon: tightest.ion,
    constraints,
    resultingProfile,
    notes,
  };
}

function clampFraction(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
