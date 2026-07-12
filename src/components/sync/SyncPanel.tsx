'use client';

import { useState } from 'react';
import { useGoogleSync } from '@/hooks/useGoogleSync';
import { isGoogleSyncConfigured } from '@/lib/googleSyncConfig';
import { parseSpreadsheetIdFromInput, spreadsheetUrl } from '@/lib/googleSync';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';

export function SyncPanel() {
  const { spreadsheetId, linkSpreadsheet, syncNow, restoreFromSheet, status, error, lastSyncedAt } =
    useGoogleSync();
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const busy = status === 'signing-in' || status === 'syncing' || status === 'restoring';

  const handleLink = () => {
    const id = parseSpreadsheetIdFromInput(linkInput);
    if (!id) {
      setLinkError('Paste a full Google Sheets URL or a valid spreadsheet ID.');
      return;
    }
    setLinkError(null);
    linkSpreadsheet(id);
    setLinkInput('');
  };

  if (!isGoogleSyncConfigured()) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-ink">Google Sync</h2>
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4 font-body text-sm text-ink">
          <p className="font-semibold">Not set up yet.</p>
          <p className="mt-2">
            Cloud sync needs a free Google Cloud OAuth Client ID before it can be used. See the setup steps in{' '}
            <code className="rounded bg-amber-100 px-1">src/lib/googleSyncConfig.ts</code> -- create an OAuth
            Client ID, add it there, and redeploy.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Google Sync</h2>
      <p className="font-body text-sm text-amber-800">
        Optional: sign in with Google to back up and sync your data (water profiles, grain bills, batch settings,
        fermentation logs) to a private spreadsheet in your own Google Drive. Nothing goes to any server we run --
        the app talks to Google&apos;s Sheets API directly from your browser. Everything still works fully offline
        without signing in.
      </p>

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">Sync</h3>
        <p className="mt-1 font-body text-sm text-ink">
          {spreadsheetId
            ? 'Linked to a spreadsheet. Sync writes your current data to it; Restore pulls it back down (useful on a new device).'
            : 'Not linked yet. Tap Sync Now to sign in and create a private spreadsheet automatically.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={syncNow}
            className="min-h-[44px] rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 disabled:opacity-50"
          >
            {status === 'syncing' ? 'Syncing...' : status === 'signing-in' ? 'Signing in...' : 'Sync Now'}
          </button>
          <button
            type="button"
            disabled={busy || !spreadsheetId}
            onClick={restoreFromSheet}
            className="min-h-[44px] rounded-md border-2 border-teal-700 px-4 py-2 font-body text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:opacity-50"
          >
            {status === 'restoring' ? 'Restoring...' : 'Restore From Sheet'}
          </button>
          {spreadsheetId ? (
            <a
              href={spreadsheetUrl(spreadsheetId)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] rounded-md border-2 border-amber-300 px-4 py-2 font-body text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Open Sheet
            </a>
          ) : null}
        </div>

        {lastSyncedAt ? (
          <ResultCard title="Last Synced" value={new Date(lastSyncedAt).toLocaleString()} tone="success" />
        ) : null}
        {error ? (
          <p className="mt-3 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">{error}</p>
        ) : null}
      </div>

      <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
          Link an Existing Sheet (Other Devices)
        </h3>
        <p className="mt-1 font-body text-sm text-ink">
          On a second device, paste the same spreadsheet URL from &quot;Open Sheet&quot; here, then tap Restore
          From Sheet to pull your data down.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input label="Spreadsheet URL or ID" value={linkInput} onChange={setLinkInput} placeholder="https://docs.google.com/spreadsheets/d/..." />
          </div>
          <button
            type="button"
            onClick={handleLink}
            className="min-h-[44px] rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
          >
            Link
          </button>
        </div>
        {linkError ? <p className="mt-2 text-sm text-red-600">{linkError}</p> : null}
      </div>
    </section>
  );
}
