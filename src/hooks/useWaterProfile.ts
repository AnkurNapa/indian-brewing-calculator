'use client';

import { useLocalStorageState } from './useLocalStorageState';
import { EMPTY_ION_PROFILE, GrainBillItem, IonProfile } from '@/lib/waterChemistry';
import { HopAddition } from '@/lib/ibu';
import { BJCP_STYLES } from '@/lib/bjcpStyles';

export interface AppState {
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
}

export const DEFAULT_APP_STATE: AppState = {
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
