'use client';

import { useLocalStorageState } from './useLocalStorageState';
import { EMPTY_ION_PROFILE, GrainBillItem, IonProfile } from '@/lib/waterChemistry';
import { HopAddition, IbuFormula, GaretzExtras, DEFAULT_GARETZ_EXTRAS } from '@/lib/ibu';
import { BJCP_STYLES } from '@/lib/bjcpStyles';

export interface AppState {
  /** The current brew's name, set on the /start intake; '' when unnamed. */
  recipeName: string;
  sourceProfile: IonProfile;
  secondSourceProfile: IonProfile;
  grainBill: GrainBillItem[];
  batchVolumeL: number;
  spargeVolumeL: number;
  blendPercentA: number;
  targetStyleId: string;
  /** Shared recipe original gravity, used by ABV, pitch rate, and BJCP style check panels. */
  ogSg: number;
  /** Shared recipe final/current gravity, used by ABV and BJCP style check panels. */
  fgSg: number;
  /** Shared hop schedule, used by the IBU calculator and BJCP style check -- one list, not a copy per panel. */
  hopAdditions: HopAddition[];
  /** Wort/boil gravity for the IBU calculation, kept separate from OG since it can differ. */
  wortGravitySg: number;
  /** Selected BJCP style (for numeric-range compliance), separate from the water-chemistry targetStyleId. */
  bjcpStyleId: string;
  /** Assumed brewhouse efficiency %, used to predict OG from the grain bill before brew day. */
  assumedEfficiencyPercent: number;
  /** Selected IBU formula (Tinseth/Rager/Garetz) -- stored per recipe, not global, since a locked recipe should keep whichever formula it was calculated with. */
  ibuFormula: IbuFormula;
  /** Extra inputs only the Garetz formula uses (altitude, hop freshness, boil volume). */
  garetzExtras: GaretzExtras;
  /**
   * Brewer's planning targets, captured on the "Start a brew" intake and
   * used for target-vs-actual guidance. 0 means "not set". Kept separate
   * from the computed OG/FG/IBU so the tools can show the goal alongside
   * what the current recipe actually produces.
   */
  targetAbvPercent: number;
  targetIbu: number;
  /** Target carbonation, CO2 volumes. */
  targetCo2Volumes: number;
  /** Target packaged/final volume, litres (may differ from batch volume). */
  targetFinalVolumeL: number;
}

export const DEFAULT_APP_STATE: AppState = {
  recipeName: '',
  sourceProfile: { ...EMPTY_ION_PROFILE },
  secondSourceProfile: { ...EMPTY_ION_PROFILE },
  grainBill: [],
  batchVolumeL: 20,
  spargeVolumeL: 10,
  blendPercentA: 100,
  targetStyleId: 'pale-ale',
  ogSg: 1.05,
  fgSg: 1.012,
  hopAdditions: [{ name: 'Bittering Hop', alphaAcidPercent: 12, weightG: 20, boilTimeMinutes: 60 }],
  wortGravitySg: 1.05,
  bjcpStyleId: BJCP_STYLES[0].id,
  assumedEfficiencyPercent: 72,
  ibuFormula: 'tinseth',
  garetzExtras: { ...DEFAULT_GARETZ_EXTRAS },
  targetAbvPercent: 0,
  targetIbu: 0,
  targetCo2Volumes: 0,
  targetFinalVolumeL: 0,
};

function isValidAppState(value: unknown): value is AppState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.sourceProfile === 'object' &&
    typeof v.secondSourceProfile === 'object' &&
    Array.isArray(v.grainBill) &&
    typeof v.batchVolumeL === 'number' &&
    typeof v.spargeVolumeL === 'number' &&
    typeof v.blendPercentA === 'number' &&
    typeof v.targetStyleId === 'string' &&
    typeof v.ogSg === 'number' &&
    typeof v.fgSg === 'number'
  );
}

const STORAGE_KEY = 'indian-brewing-calculator/app-state/v1';

/**
 * Merge defaults for any field added after a user's state was last
 * persisted (isValidAppState intentionally only checks the original
 * fields, so older stored payloads still pass validation) -- avoids
 * wiping an existing session's data just because the app shape grew.
 */
export function useWaterProfile() {
  const [state, setState] = useLocalStorageState<AppState>(
    STORAGE_KEY,
    DEFAULT_APP_STATE,
    isValidAppState,
  );

  return { state: { ...DEFAULT_APP_STATE, ...state }, setState };
}

/**
 * Write partial recipe fields into the persisted app state from OUTSIDE the
 * React tree -- used by the /start intake page (a separate route). Merges
 * with any existing saved recipe so we seed the chosen style/volume/targets
 * without clobbering other fields; the app picks them up on its next load.
 */
export function seedAppState(partial: Partial<AppState>): void {
  if (typeof window === 'undefined') return;
  let current: AppState = DEFAULT_APP_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidAppState(parsed)) current = { ...DEFAULT_APP_STATE, ...parsed };
    }
  } catch {
    // ignore corrupt storage; fall back to defaults
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }));
  } catch {
    // storage full/unavailable -- non-fatal for the intake flow
  }
}
