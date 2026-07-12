'use client';

import { useMemo, useState } from 'react';
import { useFermentationBatches } from '@/hooks/useFermentationBatches';
import { FermentationEntry, calculateFermentationStats, sortEntriesByTime } from '@/lib/fermentationTracker';
import { NumberField } from '@/components/ui/NumberField';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';
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

function TutorialCallout() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-lg border-2 border-teal-300 bg-teal-50/60">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
          How to use the Fermentation Tracker
        </span>
        <span aria-hidden="true" className="text-teal-700">
          {isOpen ? '▾' : '▸'}
        </span>
      </button>
      {isOpen ? (
        <ol className="flex flex-col gap-2 border-t border-teal-200 px-4 py-3 font-body text-sm text-ink">
          <li>
            <span className="font-semibold text-teal-800">1. Create a batch.</span> Type a name (e.g. &quot;IPA
            Batch 12&quot;) under Batches and tap <span className="font-semibold">+ Add Batch</span>. It becomes
            the active batch automatically.
          </li>
          <li>
            <span className="font-semibold text-teal-800">2. Log your first reading at pitch.</span> Set the
            Date/Time, enter your original gravity and pitching temperature, then tap{' '}
            <span className="font-semibold">+ Log Reading</span>. This becomes your Original Gravity.
          </li>
          <li>
            <span className="font-semibold text-teal-800">3. Keep logging daily (or twice daily).</span> Each new
            reading updates Current Gravity, ABV So Far, and Apparent Attenuation automatically -- no manual math.
          </li>
          <li>
            <span className="font-semibold text-teal-800">4. Watch for &quot;likely finished&quot;.</span> Once
            gravity holds steady for 24h+, the Apparent Attenuation card turns green with a finished note --
            that&apos;s your cue to check for diacetyl/off-flavors before packaging.
          </li>
          <li>
            <span className="font-semibold text-teal-800">5. Switch or delete batches</span> any time using the
            pills under Batches. Everything is saved to this device&apos;s browser storage only (see footer).
          </li>
        </ol>
      ) : null}
    </div>
  );
}

export function FermentationTrackerPanel() {
  const { batches, setBatches } = useFermentationBatches();
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

  const stats = calculateFermentationStats(activeBatch?.entries ?? []);
  const entriesNewestFirst = activeBatch ? [...sortEntriesByTime(activeBatch.entries)].reverse() : [];

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
      <h2 className="font-display text-xl font-bold text-ink">Fermentation Tracker</h2>
      <p className="font-body text-sm text-amber-800">
        Log gravity/temperature readings on the go. Saved only in this phone&apos;s browser storage -- see the
        footer privacy note.
      </p>

      <TutorialCallout />

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">Batches</h3>
        <div className="mt-3 flex flex-col gap-3">
          {batches.length === 0 ? (
            <p className="font-body text-sm text-ink">No batches yet -- create one below.</p>
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
                    aria-label={`Delete batch ${b.name}`}
                    className="min-h-[44px] rounded-md border-2 border-red-300 px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_auto]">
            <Input label="New Batch Name" value={newBatchName} onChange={setNewBatchName} placeholder="e.g. IPA Batch 12" />
            <button
              type="button"
              onClick={createBatch}
              className="min-h-[44px] self-end rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
            >
              + Add Batch
            </button>
          </div>
        </div>
      </div>

      {activeBatch ? (
        <>
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
              Add Reading -- {activeBatch.name}
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="font-body text-sm font-medium text-amber-900">Date / Time</span>
                <input
                  type="datetime-local"
                  value={newTimestampValue}
                  onChange={(e) => setNewTimestampValue(e.target.value)}
                  className="min-h-[44px] w-full rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink shadow-inner outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </label>
              <NumberField label="Gravity (SG)" value={newGravity} step={0.001} onChange={setNewGravity} />
              <NumberField label="Temperature" unit="°C" value={newTemp} step={0.5} onChange={setNewTemp} allowNegative />
              <Input label="Note (optional)" value={newNote} onChange={setNewNote} placeholder="e.g. krausen dropping" />
            </div>
            <button
              type="button"
              onClick={addEntry}
              className="mt-3 min-h-[44px] w-full rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 sm:w-auto"
            >
              + Log Reading
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ResultCard
              title="Original Gravity"
              value={stats.originalGravity !== null ? roundForDisplay(stats.originalGravity, 3).toString() : '--'}
            />
            <ResultCard
              title="Current Gravity"
              value={stats.currentGravity !== null ? roundForDisplay(stats.currentGravity, 3).toString() : '--'}
            />
            <ResultCard
              title="ABV So Far"
              value={stats.abvSoFar !== null ? roundForDisplay(stats.abvSoFar, 2).toString() : '--'}
              unit="%"
            />
            <ResultCard
              title="Apparent Attenuation"
              value={
                stats.apparentAttenuationPercent !== null
                  ? roundForDisplay(stats.apparentAttenuationPercent, 1).toString()
                  : '--'
              }
              unit="%"
              tone={stats.likelyComplete ? 'success' : 'default'}
            >
              {stats.likelyComplete ? 'Gravity stable for 24h+ -- likely finished.' : null}
            </ResultCard>
          </div>

          <div className="flex flex-col gap-2">
            {entriesNewestFirst.length === 0 ? (
              <p className="font-body text-sm text-amber-800">No readings logged yet.</p>
            ) : (
              entriesNewestFirst.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-white p-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {roundForDisplay(entry.gravitySg, 3)} SG @ {entry.temperatureC}°C
                    </p>
                    <p className="text-xs text-amber-700">{formatTimestamp(entry.timestampMs)}</p>
                    {entry.note ? <p className="text-xs text-ink/70">{entry.note}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    aria-label="Delete reading"
                    className="min-h-[44px] rounded-md border-2 border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <p className="rounded-md border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center font-body text-sm text-amber-800">
          Select or create a batch above to start logging readings.
        </p>
      )}
    </section>
  );
}
