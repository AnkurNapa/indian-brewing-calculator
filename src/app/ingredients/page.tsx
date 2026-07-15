'use client';

import { useMemo, useState } from 'react';
import { RouteNav } from '@/components/ui/RouteNav';
import { srmToApproxHex } from '@/lib/srm';
import data from '../../../public/data/ingredients.json';

type Kind = 'hops' | 'malts' | 'yeasts';

interface Hop { type: string; name: string; supplier: string; origin: string | null; use: string | null; alphaLow: number | null; alphaHigh: number | null; aromas: string | null; substitutes: string | null; altNames: string | null }
interface Malt { type: string; name: string; supplier: string; colorLovibond: number; potentialSg: number | null; category: string; altNames: string | null }
interface Yeast { type: string; name: string; supplier: string; yeastType: string; form: string | null; attenPercent: number | null; tempMinC: number | null; tempMaxC: number | null; flocculation: string | null; tolerancePercent: number | null; altNames: string | null }

const dataset = data as {
  attribution: { hops: string; maltsYeasts: string };
  counts: { hops: number; malts: number; yeasts: number };
  hops: Hop[]; malts: Malt[]; yeasts: Yeast[];
};

const KINDS: { key: Kind; label: string }[] = [
  { key: 'hops', label: `Hops (${dataset.counts.hops})` },
  { key: 'malts', label: `Malts (${dataset.counts.malts})` },
  { key: 'yeasts', label: `Yeasts (${dataset.counts.yeasts})` },
];

function Spec({ label, value }: { label: string; value: string }) {
  return <span className="font-body text-xs text-ink/70"><span className="font-semibold text-amber-700/80">{label}</span> {value}</span>;
}
function More({ label, value }: { label: string; value: string }) {
  return <div><span className="font-body text-[0.6rem] font-bold uppercase tracking-wide text-amber-700/80">{label}</span> <span className="font-body text-xs text-ink/75">{value}</span></div>;
}

export default function IngredientsPage() {
  const [kind, setKind] = useState<Kind>('hops');
  const [q, setQ] = useState('');
  const [supplier, setSupplier] = useState('all');

  const items = dataset[kind] as (Hop | Malt | Yeast)[];

  const suppliers = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) String(it.supplier).split(' / ').forEach((s) => set.add(s.trim()));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      if (supplier !== 'all' && !String(it.supplier).includes(supplier)) return false;
      if (!query) return true;
      const alt = 'altNames' in it ? (it.altNames ?? '') : '';
      const extra = 'aromas' in it ? (it.aromas ?? '') : '';
      return it.name.toLowerCase().includes(query) || alt.toLowerCase().includes(query) || extra.toLowerCase().includes(query);
    });
  }, [items, q, supplier]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <RouteNav current="ingredients" />
      <div className="mb-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-900 sm:text-4xl">Raw materials</h1>
        <p className="mt-1 max-w-prose font-body text-sm text-ink/70">
          {dataset.counts.hops} hops, {dataset.counts.malts} malts and {dataset.counts.yeasts} yeasts from the major
          suppliers. Tap any item for more detail.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button key={k.key} type="button" onClick={() => { setKind(k.key); setSupplier('all'); }}
            className={kind === k.key ? 'rounded-full bg-[#e08b2d] px-4 py-1.5 font-body text-sm font-bold text-parchment' : 'rounded-full border border-amber-200 bg-white/70 px-4 py-1.5 font-body text-sm font-semibold text-amber-900 hover:border-[#e08b2d]/60'}>
            {k.label}
          </button>
        ))}
      </div>

      <div className="sticky top-0 z-10 -mx-4 bg-parchment/95 px-4 pb-3 pt-1 backdrop-blur">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${kind}`}
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 font-body text-sm text-ink focus:border-[#e08b2d] focus:outline-none focus:ring-1 focus:ring-[#e08b2d]/40" />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => setSupplier('all')}
            className={supplier === 'all' ? 'rounded-full bg-[#e08b2d] px-3 py-1 font-body text-xs font-bold text-parchment' : 'rounded-full border border-amber-200 bg-white/70 px-3 py-1 font-body text-xs font-semibold text-amber-900 hover:border-[#e08b2d]/60'}>All</button>
          {suppliers.map((s) => (
            <button key={s} type="button" onClick={() => setSupplier(s)}
              className={supplier === s ? 'rounded-full bg-[#e08b2d] px-3 py-1 font-body text-xs font-bold text-parchment' : 'rounded-full border border-amber-200 bg-white/70 px-3 py-1 font-body text-xs font-semibold text-amber-900 hover:border-[#e08b2d]/60'}>{s}</button>
          ))}
          <span className="ml-auto font-body text-xs text-ink/50">{filtered.length} of {items.length}</span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {filtered.map((it, i) => (
          <details key={`${it.name}-${i}`} className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm open:shadow-md">
            <summary className="cursor-pointer list-none">
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-sm font-bold text-amber-900">{it.name}</span>
                {kind === 'malts' ? <span className="h-4 w-4 flex-shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: srmToApproxHex((it as Malt).colorLovibond) }} /> : null}
              </div>
              <p className="mt-0.5 font-body text-[0.65rem] font-semibold uppercase tracking-wide text-ink/40">{it.supplier}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                {kind === 'hops' && (it as Hop).alphaLow != null ? <Spec label="Alpha" value={`${(it as Hop).alphaLow}-${(it as Hop).alphaHigh}%`} /> : null}
                {kind === 'hops' && (it as Hop).origin ? <Spec label="Origin" value={(it as Hop).origin as string} /> : null}
                {kind === 'malts' ? <><Spec label="Colour" value={`${(it as Malt).colorLovibond} °L`} />{(it as Malt).potentialSg ? <Spec label="Potential" value={(it as Malt).potentialSg!.toFixed(3)} /> : null}</> : null}
                {kind === 'yeasts' ? <><Spec label="Type" value={(it as Yeast).yeastType} />{(it as Yeast).attenPercent != null ? <Spec label="Atten." value={`${(it as Yeast).attenPercent}%`} /> : null}{(it as Yeast).tempMinC != null ? <Spec label="Temp" value={`${(it as Yeast).tempMinC}-${(it as Yeast).tempMaxC} °C`} /> : null}</> : null}
              </div>
            </summary>
            <div className="mt-2 flex flex-col gap-1.5 border-t border-amber-100 pt-2">
              {kind === 'hops' ? <>
                {(it as Hop).aromas ? <More label="Aroma" value={(it as Hop).aromas as string} /> : null}
                {(it as Hop).substitutes ? <More label="Substitutes" value={(it as Hop).substitutes as string} /> : null}
                {(it as Hop).use ? <More label="Typical use" value={(it as Hop).use as string} /> : null}
              </> : null}
              {kind === 'malts' ? <More label="Category" value={(it as Malt).category} /> : null}
              {kind === 'yeasts' ? <>
                {(it as Yeast).form ? <More label="Form" value={(it as Yeast).form as string} /> : null}
                {(it as Yeast).flocculation ? <More label="Flocculation" value={(it as Yeast).flocculation as string} /> : null}
                {(it as Yeast).tolerancePercent != null ? <More label="Alcohol tolerance" value={`${(it as Yeast).tolerancePercent}%`} /> : null}
              </> : null}
              {'altNames' in it && it.altNames ? <More label="Also known as" value={it.altNames} /> : null}
            </div>
          </details>
        ))}
      </div>
      {filtered.length === 0 ? <p className="py-10 text-center font-body text-sm text-ink/50">Nothing matches that search.</p> : null}

      <footer className="mt-8 border-t border-amber-200 pt-4 font-body text-[0.7rem] leading-relaxed text-ink/50">
        {dataset.attribution.hops} {dataset.attribution.maltsYeasts}
      </footer>
    </main>
  );
}
