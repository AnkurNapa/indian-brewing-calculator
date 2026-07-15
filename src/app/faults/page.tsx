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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-body text-[0.65rem] font-bold uppercase tracking-wide text-amber-700/80">{label}</span>
      <p className="font-body text-sm leading-relaxed text-ink/80">{value}</p>
    </div>
  );
}

export default function FaultsPage() {
  const [q, setQ] = useState('');
  const faults = data.faults;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return faults;
    return faults.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        (f.describedAs ?? '').toLowerCase().includes(query) ||
        (f.origins ?? '').toLowerCase().includes(query),
    );
  }, [q, faults]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <RouteNav current="faults" />
      <div className="mb-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-900 sm:text-4xl">
          Beer faults &amp; off-flavors
        </h1>
        <p className="mt-1 max-w-prose font-body text-sm text-ink/70">
          What each fault tastes like, where it comes from, and how to control it. A searchable
          reference of {data.count} sensory descriptors.
        </p>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search faults (e.g. diacetyl, oxidation, banana)"
        className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 font-body text-sm text-ink focus:border-[#e08b2d] focus:outline-none focus:ring-1 focus:ring-[#e08b2d]/40"
      />
      <p className="mt-2 font-body text-xs text-ink/50">
        {filtered.length} of {data.count}
      </p>

      <div className="mt-3 space-y-2">
        {filtered.map((f) => (
          <details key={f.name} className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm transition-shadow open:shadow-md">
            <summary className="cursor-pointer list-none">
              <span className="font-display text-base font-bold text-amber-900">{f.name}</span>
              {f.describedAs ? (
                <span className="mt-0.5 block font-body text-xs text-ink/60">{f.describedAs}</span>
              ) : null}
            </summary>
            <div className="mt-3 flex flex-col gap-2.5 border-t border-amber-100 pt-3">
              {f.origins ? <Field label="Typical origins" value={f.origins} /> : null}
              {f.threshold ? <Field label="Perception threshold" value={f.threshold} /> : null}
              {f.control ? <Field label="How to avoid or control" value={f.control} /> : null}
              {f.appropriate ? <Field label="When it is appropriate" value={f.appropriate} /> : null}
              {f.discussion ? <Field label="Discussion" value={f.discussion} /> : null}
            </div>
          </details>
        ))}
        {filtered.length === 0 ? <p className="py-8 text-center font-body text-sm text-ink/50">No faults match that search.</p> : null}
      </div>

      <footer className="mt-8 border-t border-amber-200 pt-4 font-body text-[0.7rem] leading-relaxed text-ink/50">
        {data.attribution.title}. {data.attribution.copyright}. {data.attribution.licence}{' '}
        {data.attribution.note}
      </footer>
    </main>
  );
}
