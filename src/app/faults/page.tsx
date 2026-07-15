'use client';

import { useMemo, useState } from 'react';
import { RouteNav } from '@/components/ui/RouteNav';
import faultsData from '../../../public/data/faults.json';

interface Fault {
  name: string;
  detectedIn: string | null;
  describedAs: string | null;
  origins: string | null;
  threshold: string | null;
  discussion: string | null;
  increasedBy: string | null;
  control: string | null;
  appropriate: string | null;
}

const data = faultsData as {
  attribution: { title: string; author: string; copyright: string; licence: string; note: string };
  count: number;
  faults: Fault[];
};

// The senses a fault can show up in, used both as filter chips and as
// per-fault tags. Each gets an on-brand colour so the page reads at a glance.
const SENSES = [
  { key: 'aroma', label: 'Aroma', chip: 'bg-[#36597f]/10 text-[#36597f] ring-[#36597f]/20' },
  { key: 'flavor', label: 'Flavor', chip: 'bg-[#e08b2d]/10 text-[#c2410c] ring-[#e08b2d]/25' },
  { key: 'mouthfeel', label: 'Mouthfeel', chip: 'bg-teal-50 text-teal-700 ring-teal-200' },
  { key: 'appearance', label: 'Appearance', chip: 'bg-amber-100 text-amber-800 ring-amber-200' },
] as const;

const sensesOf = (f: Fault) => SENSES.filter((s) => (f.detectedIn ?? '').toLowerCase().includes(s.key));

function Field({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'fix' | 'ok' }) {
  const border = tone === 'fix' ? 'border-teal-200 bg-teal-50/40' : tone === 'ok' ? 'border-[#e08b2d]/30 bg-[#e08b2d]/5' : 'border-transparent';
  return (
    <div className={`rounded-lg border ${border} ${tone === 'default' ? '' : 'p-2.5'}`}>
      <span className="font-body text-[0.65rem] font-bold uppercase tracking-wide text-amber-700/80">{label}</span>
      <p className="mt-0.5 font-body text-sm leading-relaxed text-ink/80">{value}</p>
    </div>
  );
}

export default function FaultsPage() {
  const [q, setQ] = useState('');
  const [sense, setSense] = useState<string>('all');
  const faults = data.faults;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return faults.filter((f) => {
      if (sense !== 'all' && !(f.detectedIn ?? '').toLowerCase().includes(sense)) return false;
      if (!query) return true;
      return (
        f.name.toLowerCase().includes(query) ||
        (f.describedAs ?? '').toLowerCase().includes(query) ||
        (f.origins ?? '').toLowerCase().includes(query)
      );
    });
  }, [q, sense, faults]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <RouteNav current="faults" />
      <div className="mb-5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-900 sm:text-4xl">
          Beer faults &amp; off-flavors
        </h1>
        <p className="mt-1 max-w-prose font-body text-sm text-ink/70">
          A sensory reference of {data.count} descriptors: what each fault tastes or smells like, where
          it comes from, its perception threshold, and how to control it.
        </p>
      </div>

      {/* Search + sense filters */}
      <div className="sticky top-0 z-10 -mx-4 bg-parchment/95 px-4 pb-3 pt-1 backdrop-blur">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search faults (e.g. diacetyl, oxidation, banana)"
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 font-body text-sm text-ink focus:border-[#e08b2d] focus:outline-none focus:ring-1 focus:ring-[#e08b2d]/40"
        />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {[{ key: 'all', label: 'All' }, ...SENSES].map((s) => {
            const active = sense === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSense(s.key)}
                className={
                  active
                    ? 'rounded-full bg-[#e08b2d] px-3 py-1 font-body text-xs font-bold text-parchment'
                    : 'rounded-full border border-amber-200 bg-white/70 px-3 py-1 font-body text-xs font-semibold text-amber-900 hover:border-[#e08b2d]/60'
                }
              >
                {s.label}
              </button>
            );
          })}
          <span className="ml-auto font-body text-xs text-ink/50">
            {filtered.length} of {data.count}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {filtered.map((f) => {
          const senses = sensesOf(f);
          return (
            <details key={f.name} className="rounded-xl border border-amber-100 bg-white p-3.5 shadow-sm transition-shadow open:shadow-md">
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-base font-bold text-amber-900">{f.name}</span>
                  <div className="mt-0.5 flex flex-shrink-0 flex-wrap justify-end gap-1">
                    {senses.map((s) => (
                      <span key={s.key} className={`rounded-full px-2 py-0.5 font-body text-[0.6rem] font-semibold uppercase tracking-wide ring-1 ${s.chip}`}>
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
                {f.describedAs ? <p className="mt-1 font-body text-xs italic text-ink/60">{f.describedAs}</p> : null}
              </summary>
              <div className="mt-3 flex flex-col gap-2.5 border-t border-amber-100 pt-3">
                {f.origins ? <Field label="Typical origins" value={f.origins} /> : null}
                {f.threshold ? <Field label="Perception threshold" value={f.threshold} /> : null}
                {f.control ? <Field label="How to avoid or control" value={f.control} tone="fix" /> : null}
                {f.appropriate ? <Field label="When it is appropriate" value={f.appropriate} tone="ok" /> : null}
                {f.discussion ? <Field label="Discussion" value={f.discussion} /> : null}
              </div>
            </details>
          );
        })}
        {filtered.length === 0 ? <p className="py-10 text-center font-body text-sm text-ink/50">No faults match that search.</p> : null}
      </div>

      <footer className="mt-8 border-t border-amber-200 pt-4 font-body text-[0.7rem] leading-relaxed text-ink/50">
        {data.attribution.title}. {data.attribution.copyright}. {data.attribution.licence}{' '}
        {data.attribution.note}
      </footer>
    </main>
  );
}
