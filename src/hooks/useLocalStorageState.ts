'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A safe localStorage-backed state hook.
 *
 * Handles:
 *  - localStorage being unavailable (private browsing, disabled storage,
 *    SSR/build-time rendering): falls back to in-memory state only.
 *  - Corrupted or schema-mismatched stored JSON (e.g. after an app
 *    update changed the shape of the stored value): falls back to the
 *    provided default rather than throwing.
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  isValid?: (value: unknown) => value is T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const storageAvailableRef = useRef<boolean | null>(null);

  const readStoredValue = useCallback((): T => {
    if (storageAvailableRef.current === null) {
      storageAvailableRef.current = isLocalStorageAvailable();
    }
    if (!storageAvailableRef.current) return defaultValue;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultValue;
      const parsed = JSON.parse(raw);
      if (isValid && !isValid(parsed)) {
        return defaultValue;
      }
      return parsed as T;
    } catch {
      // Corrupted JSON or schema mismatch -- fail safe to defaults.
      return defaultValue;
    }
  }, [defaultValue, isValid, key]);

  // Lazy init avoids SSR/client hydration mismatches by starting with the
  // default on the server and reading real storage after mount.
  const [state, setState] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredValue());
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPersistedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        if (storageAvailableRef.current === null) {
          storageAvailableRef.current = isLocalStorageAvailable();
        }
        if (storageAvailableRef.current) {
          try {
            window.localStorage.setItem(key, JSON.stringify(next));
          } catch {
            // Storage write failed (quota exceeded, private mode edge
            // cases, etc.) -- continue with in-memory state only.
          }
        }
        return next;
      });
    },
    [key],
  );

  // Avoid flashing stale/default content before hydration completes; the
  // caller can ignore `hydrated` if not needed, it's not part of the
  // public return signature to keep the hook's contract simple.
  void hydrated;

  return [state, setPersistedState];
}
