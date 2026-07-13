'use client';

import { useState } from 'react';
import { useGoogleSync } from '@/hooks/useGoogleSync';
import { isGoogleSyncConfigured } from '@/lib/googleSyncConfig';
import { parseSpreadsheetIdFromInput, spreadsheetUrl } from '@/lib/googleSync';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';
import { useLanguage } from '@/i18n/LanguageContext';

export function SyncPanel() {
  const { t } = useLanguage();
  const { spreadsheetId, linkSpreadsheet, syncNow, restoreFromSheet, status, error, lastSyncedAt } =
    useGoogleSync();
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const busy = status === 'signing-in' || status === 'syncing' || status === 'restoring';

  const handleLink = () => {
    const id = parseSpreadsheetIdFromInput(linkInput);
    if (!id) {
      setLinkError(t('sync.link.error'));
      return;
    }
    setLinkError(null);
    linkSpreadsheet(id);
    setLinkInput('');
  };

  if (!isGoogleSyncConfigured()) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-ink">{t('sync.heading')}</h2>
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4 font-body text-sm text-ink">
          <p className="font-semibold">{t('sync.notConfigured.title')}</p>
          <p className="mt-2">
            {t('sync.notConfigured.bodyBefore')}{' '}
            <code className="rounded bg-amber-100 px-1">src/lib/googleSyncConfig.ts</code>{' '}
            {t('sync.notConfigured.bodyAfter')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('sync.heading')}</h2>
      <p className="font-body text-sm text-amber-800">{t('sync.intro')}</p>

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{t('sync.section.title')}</h3>
        <p className="mt-1 font-body text-sm text-ink">
          {spreadsheetId ? t('sync.status.linked') : t('sync.status.notLinked')}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={syncNow}
            className="min-h-[44px] rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 disabled:opacity-50"
          >
            {status === 'syncing' ? t('sync.button.syncing') : status === 'signing-in' ? t('sync.button.signingIn') : t('sync.button.syncNow')}
          </button>
          <button
            type="button"
            disabled={busy || !spreadsheetId}
            onClick={restoreFromSheet}
            className="min-h-[44px] rounded-md border-2 border-teal-700 px-4 py-2 font-body text-sm font-semibold text-teal-800 hover:bg-teal-100 disabled:opacity-50"
          >
            {status === 'restoring' ? t('sync.button.restoring') : t('sync.button.restore')}
          </button>
          {spreadsheetId ? (
            <a
              href={spreadsheetUrl(spreadsheetId)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] rounded-md border-2 border-amber-300 px-4 py-2 font-body text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              {t('sync.button.openSheet')}
            </a>
          ) : null}
        </div>

        {lastSyncedAt ? (
          <ResultCard title={t('sync.lastSynced')} value={new Date(lastSyncedAt).toLocaleString()} tone="success" />
        ) : null}
        {error ? (
          <p className="mt-3 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">{error}</p>
        ) : null}
      </div>

      <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
          {t('sync.link.title')}
        </h3>
        <p className="mt-1 font-body text-sm text-ink">{t('sync.link.description')}</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input label={t('sync.link.inputLabel')} value={linkInput} onChange={setLinkInput} placeholder="https://docs.google.com/spreadsheets/d/..." />
          </div>
          <button
            type="button"
            onClick={handleLink}
            className="min-h-[44px] rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
          >
            {t('sync.link.button')}
          </button>
        </div>
        {linkError ? <p className="mt-2 text-sm text-red-600">{linkError}</p> : null}
      </div>
    </section>
  );
}
