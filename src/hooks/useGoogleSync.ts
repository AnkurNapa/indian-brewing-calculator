'use client';

import { useCallback, useState } from 'react';
import {
  requestAccessToken,
  createSyncSpreadsheet,
  writeSyncData,
  readSyncData,
} from '@/lib/googleSync';

const SPREADSHEET_ID_KEY = 'indian-brewing-calculator/google-sync-spreadsheet-id/v1';
const LOCAL_STORAGE_DATA_KEYS = [
  'indian-brewing-calculator/app-state/v1',
  'indian-brewing-calculator/fermentation-batches/v1',
];

interface SyncPayload {
  version: 1;
  syncedAt: string;
  data: Record<string, string>;
}

function readLocalSpreadsheetId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(SPREADSHEET_ID_KEY);
  } catch {
    return null;
  }
}

function saveLocalSpreadsheetId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SPREADSHEET_ID_KEY, id);
  } catch {
    // Storage unavailable -- sync still works for this session, just won't remember the sheet next visit.
  }
}

function gatherLocalData(): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof window === 'undefined') return result;
  for (const key of LOCAL_STORAGE_DATA_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) result[key] = value;
  }
  return result;
}

function applyRemoteData(data: Record<string, string>) {
  if (typeof window === 'undefined') return;
  for (const [key, value] of Object.entries(data)) {
    if (LOCAL_STORAGE_DATA_KEYS.includes(key)) {
      window.localStorage.setItem(key, value);
    }
  }
}

export type SyncStatus = 'idle' | 'signing-in' | 'syncing' | 'restoring' | 'error';

export function useGoogleSync() {
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => readLocalSpreadsheetId());
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const linkSpreadsheet = useCallback((id: string) => {
    saveLocalSpreadsheetId(id);
    setSpreadsheetId(id);
  }, []);

  const syncNow = useCallback(async () => {
    setError(null);
    setStatus('signing-in');
    try {
      const accessToken = await requestAccessToken();

      let activeSpreadsheetId = spreadsheetId;
      setStatus('syncing');
      if (!activeSpreadsheetId) {
        activeSpreadsheetId = await createSyncSpreadsheet(accessToken);
        linkSpreadsheet(activeSpreadsheetId);
      }

      const payload: SyncPayload = {
        version: 1,
        syncedAt: new Date().toISOString(),
        data: gatherLocalData(),
      };
      await writeSyncData(accessToken, activeSpreadsheetId, JSON.stringify(payload));
      setLastSyncedAt(payload.syncedAt);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed.');
      setStatus('error');
    }
  }, [spreadsheetId, linkSpreadsheet]);

  const restoreFromSheet = useCallback(async () => {
    if (!spreadsheetId) {
      setError('No linked spreadsheet to restore from yet -- sync at least once, or link an existing sheet.');
      setStatus('error');
      return;
    }
    setError(null);
    setStatus('signing-in');
    try {
      const accessToken = await requestAccessToken();
      setStatus('restoring');
      const raw = await readSyncData(accessToken, spreadsheetId);
      if (!raw) {
        setError('The linked spreadsheet has no synced data yet.');
        setStatus('error');
        return;
      }
      const payload = JSON.parse(raw) as SyncPayload;
      applyRemoteData(payload.data);
      setLastSyncedAt(payload.syncedAt);
      setStatus('idle');
      // Reload so every hook re-reads the newly-restored localStorage values.
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed.');
      setStatus('error');
    }
  }, [spreadsheetId]);

  return {
    spreadsheetId,
    linkSpreadsheet,
    syncNow,
    restoreFromSheet,
    status,
    error,
    lastSyncedAt,
  };
}
