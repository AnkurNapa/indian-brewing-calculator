/**
 * Salt addition solver.
 *
 * Approach (documented): this is a straightforward, sequential per-ion
 * best-fit approach, not a true multi-variable optimizer. For each salt,
 * in a fixed priority order, we compute the grams needed to close the
 * *primary* ion gap it targets, add that many grams to the running
 * total, and update the resulting profile before moving to the next
 * salt. This mirrors how homebrewers actually dose water: one salt at a
 * time, coarse to fine. Because several salts affect more than one ion
 * (e.g. gypsum affects both Ca and SO4), the final result may not hit
 * every target ion exactly -- it is flagged as "approximate" whenever
 * more than one salt influences a shared ion, or when the requested
 * profile cannot be fully reached by addition alone.
 *
 * All "raise per gram per liter" constants below are standard published
 * brewing-salt dissolution constants (mg/L increase per gram of salt
 * dissolved in 1 L of water), scaled linearly by batch volume.
 */

import { IonProfile } from './waterChemistry';

export interface SaltDoseRates {
  /** mg/L increase per gram dissolved in 1 L */
  calcium?: number;
  magnesium?: number;
  sodium?: number;
  sulfate?: number;
  chloride?: number;
  bicarbonate?: number;
}

export interface SaltDefinition {
  id: string;
  name: string;
  formula: string;
  /** Primary ion this salt is normally dosed to control. */
  primaryIon: keyof SaltDoseRates;
  ratesPerGramPerLiter: SaltDoseRates;
}

export const SALTS: SaltDefinition[] = [
  {
    id: 'gypsum',
    name: 'Gypsum',
    formula: 'CaSO4·2H2O',
    primaryIon: 'sulfate',
    ratesPerGramPerLiter: { calcium: 232.5, sulfate: 557.7 },
  },
  {
    id: 'calciumChloride',
    name: 'Calcium Chloride',
    formula: 'CaCl2·2H2O',
    primaryIon: 'chloride',
    ratesPerGramPerLiter: { calcium: 272, chloride: 482 },
  },
  {
    id: 'epsomSalt',
    name: 'Epsom Salt',
    formula: 'MgSO4·7H2O',
    primaryIon: 'magnesium',
    ratesPerGramPerLiter: { magnesium: 98.6, sulfate: 389 },
  },
  {
    id: 'canningSalt',
    name: 'Canning / Non-Iodized Salt',
    formula: 'NaCl',
    primaryIon: 'sodium',
    ratesPerGramPerLiter: { sodium: 393, chloride: 607 },
  },
  {
    id: 'bakingSoda',
    name: 'Baking Soda',
    formula: 'NaHCO3',
    primaryIon: 'bicarbonate',
    ratesPerGramPerLiter: { sodium: 274, bicarbonate: 726 },
  },
  {
    id: 'chalk',
    name: 'Chalk',
    formula: 'CaCO3',
    primaryIon: 'bicarbonate',
    ratesPerGramPerLiter: { calcium: 400, bicarbonate: 1220 },
  },
];

export interface SaltDoseResult {
  saltId: string;
  name: string;
  formula: string;
  /** Grams needed for the whole batch (full float precision). */
  grams: number;
  /** True if this dose could not fully close the gap (approximate result). */
  approximate: boolean;
}

/**
 * Note codes rather than English messages -- this module has no access to
 * the i18n `t()` function, so the one component that renders `notes`
 * (MashAdjustmentPanel) maps each code + its params to a translated string.
 */
export type SaltNote =
  | { code: 'invalidVolume' }
  | { code: 'ionBelowSource'; ion: string; targetValue: number; sourceValue: number }
  | { code: 'multiSaltApproximate'; ions: string[] }
  | { code: 'noAdditionsNeeded' };

export interface SaltSolverResult {
  doses: SaltDoseResult[];
  /** Resulting ion profile (mg/L) after all doses are applied. */
  resultingProfile: IonProfile;
  /** True if any target ion cannot be reached by addition alone. */
  infeasible: boolean;
  /** Notes, including infeasibility / approximation flags -- see SaltNote. */
  notes: SaltNote[];
}

const ION_KEYS: (keyof SaltDoseRates)[] = [
  'calcium',
  'magnesium',
  'sodium',
  'sulfate',
  'chloride',
  'bicarbonate',
];

/**
 * Solve for salt additions to move `source` toward `target` for the given
 * batch volume (liters). Salts can only ever *raise* ion concentrations
 * (this models real brewing salts -- there is no salt here that removes
 * ions). If a target ion is below the source ion, that ion cannot be
 * reduced by addition; the result is flagged infeasible for that ion and
 * a dilution/RO-blend suggestion is returned instead of a negative dose.
 */
export function solveSaltAdditions(
  source: IonProfile,
  target: Partial<Record<keyof SaltDoseRates, number>>,
  batchVolumeL: number,
): SaltSolverResult {
  const notes: SaltNote[] = [];
  const volume = Number.isFinite(batchVolumeL) && batchVolumeL > 0 ? batchVolumeL : 0;

  if (volume <= 0) {
    return {
      doses: [],
      resultingProfile: { ...source },
      infeasible: true,
      notes: [{ code: 'invalidVolume' }],
    };
  }

  // Track a running mutable-looking profile via successive immutable updates.
  let runningProfile: IonProfile = { ...source };
  let infeasible = false;

  // Detect ions where the target is below the source -- no salt can
  // *lower* an ion, so this can only be achieved by dilution/RO blending.
  for (const ion of ION_KEYS) {
    const targetValue = target[ion];
    if (targetValue === undefined) continue;
    const sourceValue = (runningProfile as unknown as Record<string, number>)[
      ion === 'bicarbonate' ? 'bicarbonate' : ion
    ];
    if (targetValue < sourceValue - 1e-9) {
      infeasible = true;
      notes.push({ code: 'ionBelowSource', ion, targetValue, sourceValue });
    }
  }

  const doses: SaltDoseResult[] = [];
  const contributingSaltsPerIon: Record<string, number> = {};

  for (const salt of SALTS) {
    const primaryIon = salt.primaryIon;
    const targetValue = target[primaryIon];
    if (targetValue === undefined) continue;

    const currentValue = (runningProfile as unknown as Record<string, number>)[primaryIon];
    const gapMgPerL = targetValue - currentValue;

    if (gapMgPerL <= 1e-9) {
      // Already at or above target for this ion via this salt's primary axis.
      continue;
    }

    const rate = salt.ratesPerGramPerLiter[primaryIon] ?? 0;
    if (rate <= 0) continue;

    // grams needed = (mg/L gap * volume L) / (mg/L per gram-per-L * volume L)
    // simplifies to gap / rate-per-liter, then scaled by volume for total grams.
    const gramsForWholeBatch = (gapMgPerL / rate) * volume;

    if (gramsForWholeBatch <= 0 || !Number.isFinite(gramsForWholeBatch)) continue;

    doses.push({
      saltId: salt.id,
      name: salt.name,
      formula: salt.formula,
      grams: gramsForWholeBatch,
      approximate: false,
    });

    // Apply this dose's effect on every ion it touches.
    const perLiterGrams = gramsForWholeBatch / volume;
    const updatedProfile: IonProfile = { ...runningProfile };
    for (const affectedIon of ION_KEYS) {
      const affectedRate = salt.ratesPerGramPerLiter[affectedIon];
      if (!affectedRate) continue;
      const increase = perLiterGrams * affectedRate;
      (updatedProfile as unknown as Record<string, number>)[affectedIon] =
        (runningProfile as unknown as Record<string, number>)[affectedIon] + increase;
      contributingSaltsPerIon[affectedIon] = (contributingSaltsPerIon[affectedIon] ?? 0) + 1;
    }
    runningProfile = updatedProfile;
  }

  // Flag ions influenced by more than one salt as approximate, since the
  // sequential solver cannot guarantee an exact multi-salt fit.
  const approximateIons = Object.entries(contributingSaltsPerIon)
    .filter(([, count]) => count > 1)
    .map(([ion]) => ion);

  const dosesWithFlags = doses.map((dose) => ({
    ...dose,
    approximate: approximateIons.length > 0,
  }));

  if (approximateIons.length > 0) {
    notes.push({ code: 'multiSaltApproximate', ions: approximateIons });
  }

  if (doses.length === 0 && !infeasible) {
    notes.push({ code: 'noAdditionsNeeded' });
  }

  return {
    doses: dosesWithFlags,
    resultingProfile: runningProfile,
    infeasible,
    notes,
  };
}
