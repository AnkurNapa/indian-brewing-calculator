'use client';

import { useLocalStorageState } from './useLocalStorageState';
import { RecipeSnapshot } from '@/lib/recipeSnapshot';

const STORAGE_KEY = 'indian-brewing-calculator/recipe-snapshots/v1';

function isValidSnapshots(value: unknown): value is RecipeSnapshot[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (s) =>
      typeof s === 'object' &&
      s !== null &&
      typeof (s as RecipeSnapshot).id === 'string' &&
      typeof (s as RecipeSnapshot).name === 'string' &&
      typeof (s as RecipeSnapshot).lockedAtMs === 'number' &&
      typeof (s as RecipeSnapshot).state === 'object',
  );
}

/**
 * Persists locked recipe snapshots to the browser's local storage only
 * -- see the app footer's privacy note. Each snapshot is a frozen copy
 * of the full session state at the moment it was locked; nothing here
 * is transmitted anywhere.
 */
export function useRecipeSnapshots() {
  const [snapshots, setSnapshots] = useLocalStorageState<RecipeSnapshot[]>(STORAGE_KEY, [], isValidSnapshots);

  const addSnapshot = (snapshot: RecipeSnapshot) => {
    setSnapshots((prev) => [snapshot, ...prev]);
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  return { snapshots, setSnapshots, addSnapshot, deleteSnapshot };
}
