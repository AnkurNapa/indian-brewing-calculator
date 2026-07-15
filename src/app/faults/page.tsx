'use client';

import { useEffect, useMemo, useState } from 'react';
import { RouteNav } from '@/components/ui/RouteNav';
import { useWaterProfile } from '@/hooks/useWaterProfile';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
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

// Senses a fault shows up in — shown as per-card tags.
const SENSES = [
  { key: 'aroma', label: 'Aroma', chip: 'bg-[#36597f]/10 text-[#36597f] ring-[#36597f]/20' },
  { key: 'flavor', label: 'Flavor', chip: 'bg-[#e08b2d]/10 text-[#c2410c] ring-[#e08b2d]/25' },
  { key: 'mouthfeel', label: 'Mouthfeel', chip: 'bg-teal-50 text-teal-700 ring-teal-200' },
  { key: 'appearance', label: 'Appearance', chip: 'bg-amber-100 text-amber-800 ring-amber-200' },
] as const;
const sensesOf = (f: Fault) => SENSES.filter((s) => (f.detectedIn ?? '').toLowerCase().includes(s.key));

// Four broad causes, derived from each fault's stated origins. "Process" is
// the catch-all for anything that isn't a yeast, contamination or oxidation
// signature. A fault can carry more than one.
const CAUSES = [
  { key: 'yeast', label: 'Yeast' },
  { key: 'infection', label: 'Infection' },
  { key: 'oxidation', label: 'Oxidation' },
  { key: 'process', label: 'Process' },
] as const;
function causesOf(f: Fault): string[] {
  const o = (f.origins ?? '').toLowerCase();
  const tags: string[] = [];
  if (/yeast|ferment/.test(o)) tags.push('yeast');
  if (/microbial|contaminat|bacteri|wild|infection|brett|lacto|pedio|acetobacter|zymomonas|lactic/.test(o)) tags.push('infection');
  if (/oxidation|oxidi|aeration|stal|aged|aging|light-?struck/.test(o)) tags.push('oxidation');
  if (!tags.length) tags.push('process');
  return tags;
}

// Universally worth-checking faults, plus any whose style notes match the
// brewer's current style. Names are filtered to what actually exists.
const CORE_CHECKS = ['Acetaldehyde', 'Buttery', 'Acetic (Sour)', 'Cardboard', 'Astringent', 'Metallic'];

function Field({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'fix' | 'ok' }) {
  const box = tone === 'fix' ? 'border-teal-200 bg-teal-50/50 p-2.5' : tone === 'ok' ? 'border-[#e08b2d]/30 bg-[#e08b2d]/5 p-2.5' : 'border-transparent';
  return (
    <div className={`rounded-lg border ${box}`}>
      <span className="font-body text-[0.65rem] font-bold uppercase tracking-wide text-amber-700/80">{label}</span>
      <p className="mt-0.5 font-body text-sm leading-relaxed text-ink/80">{value}</p>
    </div>
  );
}

export default function FaultsPage() {
  const { state } = useWaterProfile();
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState('');
  const [cause, setCause] = useState<string>('all');
  useEffect(() => setMounted(true), []);

  const faults = data.faults;

  // Phase 2: "watch for in your beer". Style-specific notes (faults whose
  // "when appropriate" text mentions a distinctive token of the brewer's
  // style) plus the core checks. Only when a brew has been planned.
  const styleName = BJCP_STYLES.find((s) => s.id === state.bjcpStyleId)?.name ?? '';
  const hasBrew = mounted && (Boolean(state.recipeName) || state.grainBill.length > 0);
  const relevant = useMemo(() => {
    if (!hasBrew) return [];
    const stop = new Set(['american', 'english', 'belgian', 'german', 'czech', 'irish', 'standard', 'strong', 'dark', 'pale', 'light', 'international', 'specialty', 'historical', 'other', 'style', 'premium']);
    const tokens = styleName.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 3 && !stop.has(w));
    const byStyle = tokens.length
      ? faults.filter((f) => tokens.some((tok) => (f.appropriate ?? '').toLowerCase().includes(tok)))
      : [];
    const core = CORE_CHECKS.map((n) => faults.find((f) => f.name === n)).filter(Boolean) as Fault[];
    const seen = new Set<string>();
    return [...byStyle, ...core].filter((f) => (seen.has(f.name) ? false : seen.add(f.name))).slice(0, 8);
  }, [hasBrew, styleName, faults]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return faults.filter((f) => {
      if (cause !== 'all' && !causesOf(f).includes(cause)) return false;
      if (!query) return true;
      return (
        f.name.toLowerCase().includes(query) ||
        (f.describedAs ?? '').toLowerCase().includes(query) ||
        (f.origins ?? '').toLowerCase().includes(query)
      );
    });
  }, [q, cause, faults]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <RouteNav current="faults" />
      <div className="mb-5">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-900 sm:text-4xl">
          Beer faults &amp; off-flavors
        </h1>
        <p className="mt-1 max-w-prose font-body text-sm text-ink/70">
          A sensory reference of {data.count} descriptors: what each fault tastes or smells like, where
          it comes from, and how to fix it. Suspect a problem? Filter by cause or search what you taste.
        </p>
      </div>

      {/* Phase 2: relevance to the current brew */}
      {hasBrew && relevant.length ? (
        <div className="mb-5 rounded-xl border border-teal-200 bg-teal-50/50 p-3.5">
          <h2 className="font-display text-xs font-bold uppercase tracking-wide text-teal-800">
            Watch for in {styleName || 'your beer'}
          </h2>
          <p className="mb-2 mt-0.5 font-body text-xs text-ink/60">Tap a fault to see how to spot and fix it.</p>
          <div className="flex flex-wrap gap-1.5">
            {relevant.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => {
                  setCause('all');
                  setQ(f.name);
                  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-full border border-teal-300 bg-white px-2.5 py-1 font-body text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100"
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Search + cause filter */}
      <div className="sticky top-0 z-10 -mx-4 bg-parchment/95 px-4 pb-3 pt-1 backdrop-blur">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search faults (e.g. diacetyl, oxidation, banana)"
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 font-body text-sm text-ink focus:border-[#e08b2d] focus:outline-none focus:ring-1 focus:ring-[#e08b2d]/40"
        />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="font-body text-[0.65rem] font-bold uppercase tracking-wide text-ink/40">Cause</span>
          {[{ key: 'all', label: 'All' }, ...CAUSES].map((c) => {
            const active = cause === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCause(c.key)}
                className={
                  active
                    ? 'rounded-full bg-[#e08b2d] px-3 py-1 font-body text-xs font-bold text-parchment'
                    : 'rounded-full border border-amber-200 bg-white/70 px-3 py-1 font-body text-xs font-semibold text-amber-900 hover:border-[#e08b2d]/60'
                }
              >
                {c.label}
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
                {/* Fix-forward: the actionable part first. */}
                {f.control ? <Field label="How to fix / avoid" value={f.control} tone="fix" /> : null}
                {f.origins ? <Field label="Typical origins" value={f.origins} /> : null}
                {f.threshold ? <Field label="Perception threshold" value={f.threshold} /> : null}
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
