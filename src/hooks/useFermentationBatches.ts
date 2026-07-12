'use client';

import { useLocalStorageState } from './useLocalStorageState';
import { FermentationBatch } from '@/lib/fermentationTracker';

const STORAGE_KEY = 'indian-brewing-calculator/fermentation-batches/v1';

function isValidBatches(value: unknown): value is FermentationBatch[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (b) =>
      typeof b === 'object' &&
      b !== null &&
      typeof (b as FermentationBatch).id === 'string' &&
      typeof (b as FermentationBatch).name === 'string' &&
      Array.isArray((b as FermentationBatch).entries),
  );
}

/**
 * Persists fermentation batches (each with a log of gravity/temp
 * readings) to the browser's local storage only -- see the app footer's
 * privacy note. Nothing here is transmitted anywhere.
 */
export function useFermentationBatches() {
  const [batches, setBatches] = useLocalStorageState<FermentationBatch[]>(STORAGE_KEY, [], isValidBatches);
  return { batches, setBatches };
}
