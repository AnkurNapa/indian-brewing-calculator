'use client';

import { useLocalStorageState } from './useLocalStorageState';
import { EMPTY_ION_PROFILE, GrainBillItem, IonProfile } from '@/lib/waterChemistry';

export interface AppState {
  sourceProfile: IonProfile;
  secondSourceProfile: IonProfile;
  grainBill: GrainBillItem[];
  batchVolumeL: number;
  spargeVolumeL: number;
  blendPercentA: number;
  targetStyleId: string;
}

export const DEFAULT_APP_STATE: AppState = {
  sourceProfile: { ...EMPTY_ION_PROFILE },
  secondSourceProfile: { ...EMPTY_ION_PROFILE },
  grainBill: [],
  batchVolumeL: 20,
  spargeVolumeL: 10,
  blendPercentA: 100,
  targetStyleId: 'pale-ale',
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
    typeof v.targetStyleId === 'string'
  );
}

const STORAGE_KEY = 'indian-brewing-calculator/app-state/v1';

export function useWaterProfile() {
  const [state, setState] = useLocalStorageState<AppState>(
    STORAGE_KEY,
    DEFAULT_APP_STATE,
    isValidAppState,
  );

  return { state, setState };
}
