/**
 * Google Sync configuration.
 *
 * To enable cloud sync, you need a free Google Cloud OAuth 2.0 Client ID:
 *
 *   1. Go to https://console.cloud.google.com/apis/credentials
 *   2. Create a project (or pick an existing one).
 *   3. Enable the "Google Sheets API" under APIs & Services > Library.
 *   4. Configure the OAuth consent screen (External, Testing mode is fine
 *      for personal use -- add your own Google account as a test user).
 *   5. Create an OAuth Client ID of type "Web application".
 *   6. Under "Authorized JavaScript origins", add:
 *        https://ankurnapa.github.io
 *      (and http://localhost:3000 if you want to test sync locally)
 *   7. Copy the generated Client ID and paste it below.
 *
 * No client secret is needed -- this uses Google Identity Services'
 * browser-side token flow, so the app never sees or stores your Google
 * password, and no backend server is involved.
 */
export const GOOGLE_OAUTH_CLIENT_ID = '';

/** Sheets API scope: create/read/write spreadsheets the user owns or has been given access to. */
export const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

export function isGoogleSyncConfigured(): boolean {
  return GOOGLE_OAUTH_CLIENT_ID.trim().length > 0;
}
