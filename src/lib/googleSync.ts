/**
 * Google Sheets sync -- browser-only, no backend.
 *
 * Uses Google Identity Services (GIS) for OAuth (a script Google serves
 * at accounts.google.com/gsi/client) to get a short-lived access token
 * directly in the browser, then calls the Sheets API v4 REST endpoints
 * directly with that token. The access token is held only in memory
 * (never persisted to localStorage) and expires automatically; signing
 * in again gets a fresh one. This app never sees the user's Google
 * password and there is no server component involved anywhere.
 */

import { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_SHEETS_SCOPE } from './googleSyncConfig';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken: (opts?: { prompt?: string }) => void };
          revoke(accessToken: string, done: () => void): void;
        };
      };
    };
  }
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let gisLoadPromise: Promise<void> | null = null;

/** Dynamically load the Google Identity Services script exactly once. */
export function loadGoogleIdentityServices(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sync is only available in the browser.'));
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
    document.head.appendChild(script);
  });

  return gisLoadPromise;
}

/**
 * Request a Sheets API access token via the GIS token-client popup flow.
 * Resolves with the access token, or rejects if the user cancels or an
 * error occurs.
 */
export async function requestAccessToken(): Promise<string> {
  await loadGoogleIdentityServices();
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services failed to initialize.');
  }

  return new Promise((resolve, reject) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      scope: GOOGLE_SHEETS_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || 'Sign-in was cancelled or failed.'));
          return;
        }
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken();
  });
}

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

async function sheetsFetch(accessToken: string, path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${SHEETS_API_BASE}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Sheets API error ${response.status}: ${body || response.statusText}`);
  }
  return response;
}

const DATA_SHEET_TITLE = 'Data';
const DATA_RANGE = `${DATA_SHEET_TITLE}!A1`;

/**
 * Create a new private spreadsheet (in the signed-in user's own Google
 * Drive) to hold this app's synced data, and return its ID.
 */
export async function createSyncSpreadsheet(accessToken: string): Promise<string> {
  const response = await sheetsFetch(accessToken, '', {
    method: 'POST',
    body: JSON.stringify({
      properties: { title: 'Indian Brewing Calculator - Synced Data' },
      sheets: [{ properties: { title: DATA_SHEET_TITLE } }],
    }),
  });
  const data = await response.json();
  return data.spreadsheetId as string;
}

/** Write the app's full state (as a JSON string) into the data sheet's single cell. */
export async function writeSyncData(accessToken: string, spreadsheetId: string, jsonPayload: string): Promise<void> {
  await sheetsFetch(
    accessToken,
    `/${spreadsheetId}/values/${encodeURIComponent(DATA_RANGE)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      body: JSON.stringify({ range: DATA_RANGE, values: [[jsonPayload]] }),
    },
  );
}

/** Read the app's synced state back from the data sheet. Returns null if the cell is empty. */
export async function readSyncData(accessToken: string, spreadsheetId: string): Promise<string | null> {
  const response = await sheetsFetch(accessToken, `/${spreadsheetId}/values/${encodeURIComponent(DATA_RANGE)}`);
  const data = await response.json();
  const value = data.values?.[0]?.[0];
  return typeof value === 'string' ? value : null;
}

/** Extract a spreadsheet ID from either a raw ID or a full Google Sheets URL. */
export function parseSpreadsheetIdFromInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch) return urlMatch[1];
  // A bare ID looks like a long alphanumeric/underscore/hyphen token with no slashes.
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) return trimmed;
  return null;
}

export function spreadsheetUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
