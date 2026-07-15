'use client';

import { useEffect, useState } from 'react';

export interface MaltOption {
  name: string;
  supplier: string;
  colorLovibond: number;
  potentialSg: number;
}
export interface HopOption {
  name: string;
  supplier: string;
  alpha: number | null;
}
export interface YeastOption {
  name: string;
  supplier: string;
  attenuation: number | null;
  tempMinC: number | null;
  tempMaxC: number | null;
}

// Explicit loaders so each trimmed list is its own lazy chunk (loaded only
// when a calculator that uses it mounts) rather than shipping in the landing
// bundle. Keeps the full 400KB catalogue out of the SPA's critical path.
const loaders = {
  malts: () => import('../../public/data/select-malts.json'),
  hops: () => import('../../public/data/select-hops.json'),
  yeasts: () => import('../../public/data/select-yeasts.json'),
} as const;

type Kind = keyof typeof loaders;

/**
 * Lazy-load a trimmed ingredient selection list on mount. Returns [] until the
 * chunk resolves, so callers can merge it with their existing curated options
 * without blocking first render.
 */
export function useCatalog<T>(kind: Kind): T[] {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    let alive = true;
    loaders[kind]()
      .then((m) => {
        if (alive) setItems((m as unknown as { default: T[] }).default);
      })
      .catch(() => {
        /* offline / chunk error: keep the curated fallback list */
      });
    return () => {
      alive = false;
    };
  }, [kind]);
  return items;
}
