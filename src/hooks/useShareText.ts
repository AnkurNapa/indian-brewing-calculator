'use client';

import { useEffect, useState } from 'react';

export type ShareStatus = 'idle' | 'shared' | 'copied' | 'error';

/**
 * Shared Web Share API / clipboard-fallback logic, extracted so every
 * "Share" button in the app (Home's full recipe, Fermentation Tracker's
 * batch log, etc.) behaves identically instead of each screen
 * reimplementing its own try/catch and status timer.
 */
export function useShareText(title: string) {
  const [status, setStatus] = useState<ShareStatus>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  const share = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text });
        setStatus('shared');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
      } else {
        setStatus('error');
      }
    } catch {
      // User cancelled the native share sheet, or clipboard write was denied -- not an error worth surfacing.
    }
  };

  return { share, status };
}
