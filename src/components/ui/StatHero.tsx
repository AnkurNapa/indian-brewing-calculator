import { ReactNode } from 'react';

/**
 * The "vitals" hero band: a titled panel that shows a page's headline
 * numbers big and scannable, with an optional atmospheric color wash
 * bleeding in from the corner (e.g. the beer's SRM color on Home, a
 * balance color on Water). Give it StatTile children in a grid.
 *
 * This is the top-of-page anchor in the app's page rhythm
 * (hero -> guidance -> detail sections); see docs/DESIGN.md.
 */
export function StatHero({
  title,
  accentColor,
  children,
  empty,
}: {
  title: string;
  /** CSS color washed in behind the tiles as atmosphere. Omit for none. */
  accentColor?: string;
  /** StatTile grid (rendered when not empty). */
  children?: ReactNode;
  /** Shown instead of the tiles when there's nothing to summarize yet. */
  empty?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/70 shadow-sm">
      {accentColor ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-25 blur-2xl"
          style={{ backgroundColor: accentColor }}
        />
      ) : null}
      <div className="relative p-4 sm:p-5">
        <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-amber-700/80">{title}</h3>
        {empty ?? children}
      </div>
    </div>
  );
}
