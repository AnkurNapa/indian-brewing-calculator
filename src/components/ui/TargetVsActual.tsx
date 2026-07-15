/**
 * TargetVsActual — the loop-closer for the "set targets, hit them" flow.
 *
 * Renders one row per planning target (captured on /start) showing where the
 * current recipe actually sits versus where the brewer is aiming, plus an
 * in-style badge against the chosen BJCP range. Rows with no target set (0)
 * are hidden, so this whole block only appears once a brew has been planned.
 *
 * Reusable: the home overview passes computed actuals now; individual tool
 * panels can reuse it later (Phase 2) to show target-vs-actual in context.
 */
export interface TargetRow {
  label: string;
  /** The brewer's target. 0 means "not set" and hides the row. */
  target: number;
  /** Computed value from the current recipe. Omit for plan-only rows (CO2). */
  actual?: number | null;
  unit?: string;
  /** Optional BJCP min-max range for an in-style badge on the target. */
  range?: { min: number; max: number };
  decimals?: number;
}

export function TargetVsActual({
  rows,
  inStyleLabel,
  outStyleLabel,
}: {
  rows: TargetRow[];
  inStyleLabel: string;
  outStyleLabel: string;
}) {
  const visible = rows.filter((r) => r.target > 0);
  if (!visible.length) return null;

  return (
    <div className="flex flex-col">
      {visible.map((r) => {
        const dp = r.decimals ?? (r.unit === '%' ? 1 : 0);
        const fmt = (n: number) => n.toFixed(dp);
        const hasActual = r.actual != null && r.actual > 0;
        const gap = hasActual ? (r.actual as number) - r.target : null;
        const meaningfulGap = gap != null && Math.abs(gap) >= (dp > 0 ? 0.1 : 1);
        const inStyle = r.range ? r.target >= r.range.min && r.target <= r.range.max : null;

        return (
          <div
            key={r.label}
            className="flex items-center justify-between gap-2 border-b border-amber-100 py-2 first:pt-0 last:border-0 last:pb-0"
          >
            <span className="font-body text-sm font-semibold text-ink">{r.label}</span>
            <div className="flex items-center gap-2 font-body text-sm">
              {hasActual ? <span className="text-ink/50">{fmt(r.actual as number)}{r.unit}</span> : null}
              {hasActual ? <span aria-hidden="true" className="text-ink/30">&rarr;</span> : null}
              <span className="font-display font-bold text-amber-900">
                {fmt(r.target)}
                {r.unit}
              </span>
              {meaningfulGap ? (
                <span className="rounded-full bg-amber-50 px-1.5 py-0.5 font-body text-[0.6rem] font-semibold text-amber-700">
                  {(gap as number) > 0 ? '+' : ''}
                  {fmt(gap as number)}
                </span>
              ) : null}
              {inStyle != null ? (
                <span
                  className={`rounded-full px-2 py-0.5 font-body text-[0.6rem] font-semibold ${
                    inStyle
                      ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200'
                      : 'bg-[#e08b2d]/10 text-[#c2410c] ring-1 ring-[#e08b2d]/30'
                  }`}
                >
                  {inStyle ? inStyleLabel : outStyleLabel}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
