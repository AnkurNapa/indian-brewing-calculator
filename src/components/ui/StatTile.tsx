import { ReactNode } from 'react';

export type StatTone = 'default' | 'good' | 'warn';

/**
 * A single headline stat: a big value with a small uppercase caption, and
 * optional unit, color swatch, and semantic tone. The atom of the "vitals"
 * pattern (see StatHero) -- reused across Home, Water, and any page that
 * wants a scannable at-a-glance number row. Part of the app design system;
 * see docs/DESIGN.md.
 */
export function StatTile({
  label,
  value,
  unit,
  swatch,
  tone = 'default',
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  /** CSS color for a small dot before the label (e.g. the beer's SRM color). */
  swatch?: string;
  tone?: StatTone;
  /** Optional one-word qualifier under the value (e.g. "hoppy", "soft"). */
  hint?: ReactNode;
}) {
  const valueColor = tone === 'good' ? 'text-teal-700' : tone === 'warn' ? 'text-[#c2410c]' : 'text-ink';
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-100 bg-white/70 px-2 py-3 text-center shadow-sm backdrop-blur-sm">
      <span className="flex items-center gap-1.5 font-body text-[0.6rem] font-semibold uppercase tracking-wider text-amber-700/80">
        {swatch ? <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: swatch }} /> : null}
        {label}
      </span>
      <span className={`font-display text-2xl font-extrabold leading-none ${valueColor}`}>
        {value}
        {unit ? <span className="ml-0.5 text-sm font-bold text-ink/40">{unit}</span> : null}
      </span>
      {hint ? <span className="font-body text-[0.65rem] font-medium text-ink/50">{hint}</span> : null}
    </div>
  );
}
