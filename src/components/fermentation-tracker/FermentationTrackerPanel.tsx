'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useShareText } from '@/hooks/useShareText';
import { FermentationBatch, FermentationEntry, calculateFermentationStats, sortEntriesByTime } from '@/lib/fermentationTracker';
import { buildFermentationShareText } from '@/lib/fermentationShareText';
import { NumberField } from '@/components/ui/NumberField';
import { GravityField } from '@/components/ui/GravityField';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { ShareIcon } from '@/components/ui/icons';
import { roundForDisplay } from '@/lib/units';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Local "datetime-local" input value <-> epoch ms, in the browser's local timezone. */
function toDatetimeLocalValue(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): number {
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : Date.now();
}

function buildTutorialSteps(t: ReturnType<typeof useLanguage>['t']) {
  const [bodyPrefix1, bodySuffix1] = t('fermentationTracker.tutorial.step1.body').split('{addBatch}');
  const [bodyPrefix2, bodySuffix2] = t('fermentationTracker.tutorial.step2.body').split('{logReading}');
  return [
    {
      lead: t('fermentationTracker.tutorial.step1.lead'),
      body: (
        <>
          {bodyPrefix1}
          <span className="font-semibold">{t('fermentationTracker.batches.add')}</span>
          {bodySuffix1}
        </>
      ),
    },
    {
      lead: t('fermentationTracker.tutorial.step2.lead'),
      body: (
        <>
          {bodyPrefix2}
          <span className="font-semibold">{t('fermentationTracker.reading.log')}</span>
          {bodySuffix2}
        </>
      ),
    },
    {
      lead: t('fermentationTracker.tutorial.step3.lead'),
      body: t('fermentationTracker.tutorial.step3.body'),
    },
    {
      lead: t('fermentationTracker.tutorial.step4.lead'),
      body: t('fermentationTracker.tutorial.step4.body'),
    },
    {
      lead: t('fermentationTracker.tutorial.step5.lead'),
      body: t('fermentationTracker.tutorial.step5.body'),
    },
  ];
}

interface FermentationTrackerPanelProps {
  batches: FermentationBatch[];
  onBatchesChange: (batches: FermentationBatch[]) => void;
}

export function FermentationTrackerPanel({ batches, onBatchesChange: setBatches }: FermentationTrackerPanelProps) {
  const { t } = useLanguage();
  const [activeBatchId, setActiveBatchId] = useState<string | null>(batches[0]?.id ?? null);
  const [newBatchName, setNewBatchName] = useState('');

  const [newGravity, setNewGravity] = useState(1.05);
  const [newTemp, setNewTemp] = useState(20);
  const [newTimestampValue, setNewTimestampValue] = useState(() => toDatetimeLocalValue(Date.now()));
  const [newNote, setNewNote] = useState('');

  const activeBatch = useMemo(
    () => batches.find((b) => b.id === activeBatchId) ?? null,
    [batches, activeBatchId],
  );

  const { share, status: shareStatus } = useShareText('Fermentation Log');
  const handleShareBatch = () => {
    if (!activeBatch) return;
    share(buildFermentationShareText(activeBatch));
  };

  const stats = calculateFermentationStats(activeBatch?.entries ?? []);
  const entriesNewestFirst = activeBatch ? [...sortEntriesByTime(activeBatch.entries)].reverse() : [];
  const tutorialSteps = useMemo(() => buildTutorialSteps(t), [t]);

  const createBatch = () => {
    const trimmed = newBatchName.trim();
    if (!trimmed) return;
    const batch = { id: generateId(), name: trimmed, entries: [] };
    setBatches([...batches, batch]);
    setActiveBatchId(batch.id);
    setNewBatchName('');
  };

  const deleteBatch = (id: string) => {
    setBatches(batches.filter((b) => b.id !== id));
    if (activeBatchId === id) setActiveBatchId(null);
  };

  const addEntry = () => {
    if (!activeBatch) return;
    const entry: FermentationEntry = {
      id: generateId(),
      timestampMs: fromDatetimeLocalValue(newTimestampValue),
      gravitySg: newGravity,
      temperatureC: newTemp,
      note: newNote.trim() || undefined,
    };
    setBatches(
      batches.map((b) => (b.id === activeBatch.id ? { ...b, entries: [...b.entries, entry] } : b)),
    );
    setNewNote('');
    setNewTimestampValue(toDatetimeLocalValue(Date.now()));
  };

  const deleteEntry = (entryId: string) => {
    if (!activeBatch) return;
    setBatches(
      batches.map((b) =>
        b.id === activeBatch.id ? { ...b, entries: b.entries.filter((e) => e.id !== entryId) } : b,
      ),
    );
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('fermentationTracker.title')}</h2>
      <p className="font-body text-sm text-amber-800">{t('fermentationTracker.intro')}</p>

      <TutorialCallout title={t('fermentationTracker.tutorial.title')} steps={tutorialSteps} />

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
          {t('fermentationTracker.batches.title')}
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {batches.length === 0 ? (
            <p className="font-body text-sm text-ink">{t('fermentationTracker.batches.empty')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {batches.map((b) => (
                <div key={b.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveBatchId(b.id)}
                    className={`min-h-[44px] rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors ${
                      b.id === activeBatchId
                        ? 'bg-teal-700 text-parchment shadow'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    {b.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBatch(b.id)}
                    aria-label={t('fermentationTracker.batches.deleteLabel', { name: b.name })}
                    className="min-h-[44px] rounded-md border-2 border-red-300 px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    {t('fermentationTracker.batches.delete')}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_auto]">
            <Input
              label={t('fermentationTracker.batches.newNameLabel')}
              value={newBatchName}
              onChange={setNewBatchName}
              placeholder={t('fermentationTracker.batches.newNamePlaceholder')}
            />
            <button
              type="button"
              onClick={createBatch}
              className="min-h-[44px] self-end rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
            >
              {t('fermentationTracker.batches.add')}
            </button>
          </div>
        </div>
      </div>

      {activeBatch ? (
        <>
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
              {t('fermentationTracker.reading.title', { batchName: activeBatch.name })}
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="font-body text-sm font-medium text-amber-900">
                  {t('fermentationTracker.reading.dateTime')}
                </span>
                <input
                  type="datetime-local"
                  value={newTimestampValue}
                  onChange={(e) => setNewTimestampValue(e.target.value)}
                  className="min-h-[44px] w-full rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink shadow-inner outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <GravityField label={t('fermentationTracker.reading.gravity')} value={newGravity} onChange={setNewGravity} />
              <NumberField
                label={t('fermentationTracker.reading.temperature')}
                unit="°C"
                value={newTemp}
                step={0.5}
                onChange={setNewTemp}
                allowNegative
              />
              <Input
                label={t('fermentationTracker.reading.noteLabel')}
                value={newNote}
                onChange={setNewNote}
                placeholder={t('fermentationTracker.reading.notePlaceholder')}
              />
            </div>
            <button
              type="button"
              onClick={addEntry}
              className="mt-3 min-h-[44px] w-full rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 sm:w-auto"
            >
              {t('fermentationTracker.reading.log')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ResultCard
              title={t('fermentationTracker.stats.originalGravity')}
              value={stats.originalGravity !== null ? roundForDisplay(stats.originalGravity, 3).toString() : '--'}
            />
            <ResultCard
              title={t('fermentationTracker.stats.currentGravity')}
              value={stats.currentGravity !== null ? roundForDisplay(stats.currentGravity, 3).toString() : '--'}
            />
            <ResultCard
              title={t('fermentationTracker.stats.abvSoFar')}
              value={stats.abvSoFar !== null ? roundForDisplay(stats.abvSoFar, 2).toString() : '--'}
              unit="%"
            />
            <ResultCard
              title={t('fermentationTracker.stats.apparentAttenuation')}
              value={
                stats.apparentAttenuationPercent !== null
                  ? roundForDisplay(stats.apparentAttenuationPercent, 1).toString()
                  : '--'
              }
              unit="%"
              tone={stats.likelyComplete ? 'success' : 'default'}
            >
              {stats.likelyComplete ? t('fermentationTracker.stats.likelyFinished') : null}
            </ResultCard>
          </div>

          <div>
            <button
              type="button"
              onClick={handleShareBatch}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border-2 border-teal-300 px-4 py-2 font-body text-sm font-semibold text-teal-800 hover:bg-teal-50 sm:w-auto"
            >
              <ShareIcon className="h-4 w-4 flex-shrink-0" />
              {t('fermentationTracker.share.button')}
            </button>
            <p className="mt-1 font-body text-xs text-amber-700" role="status" aria-live="polite">
              {shareStatus === 'shared'
                ? t('fermentationTracker.share.shared')
                : shareStatus === 'copied'
                  ? t('fermentationTracker.share.copied')
                  : shareStatus === 'error'
                    ? t('fermentationTracker.share.error')
                    : ''}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {entriesNewestFirst.length === 0 ? (
              <p className="font-body text-sm text-amber-800">{t('fermentationTracker.entries.empty')}</p>
            ) : (
              entriesNewestFirst.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-white p-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {t('fermentationTracker.entries.gravityAtTemp', {
                        gravity: roundForDisplay(entry.gravitySg, 3),
                        temp: entry.temperatureC,
                      })}
                    </p>
                    <p className="text-xs text-amber-700">{formatTimestamp(entry.timestampMs)}</p>
                    {entry.note ? <p className="text-xs text-ink/70">{entry.note}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    aria-label={t('fermentationTracker.entries.deleteLabel')}
                    className="min-h-[44px] rounded-md border-2 border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    {t('fermentationTracker.entries.delete')}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <p className="rounded-md border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center font-body text-sm text-amber-800">
          {t('fermentationTracker.noBatch.selectPrompt')}
        </p>
      )}
    </section>
  );
}
