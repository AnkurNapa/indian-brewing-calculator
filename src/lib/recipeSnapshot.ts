import { AppState } from '@/hooks/useWaterProfile';

export interface RecipeSnapshot {
  id: string;
  name: string;
  /** Epoch ms when this recipe was locked. */
  lockedAtMs: number;
  /** A full, independent copy of the recipe at lock time -- editing the live session afterward never changes this. */
  state: AppState;
}

function generateSnapshotId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Build a locked recipe snapshot from the current live session state.
 * Deep-clones `state` (via JSON round-trip, safe here since AppState is
 * plain data -- no functions/dates/etc.) so later edits to the live
 * session can never mutate a locked snapshot.
 */
export function createRecipeSnapshot(name: string, state: AppState, lockedAtMs: number): RecipeSnapshot {
  return {
    id: generateSnapshotId(),
    name: name.trim() || 'Untitled Recipe',
    lockedAtMs,
    state: JSON.parse(JSON.stringify(state)) as AppState,
  };
}

/** Duplicate an existing snapshot as a new, independent one (new id, new name, re-stamped lock time). */
export function duplicateRecipeSnapshot(snapshot: RecipeSnapshot, newName: string, lockedAtMs: number): RecipeSnapshot {
  return createRecipeSnapshot(newName, snapshot.state, lockedAtMs);
}
