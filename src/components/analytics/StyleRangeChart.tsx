import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { srmToApproxHex } from '@/lib/srm';

/**
 * Per-style metric "range strips": one row per style showing the p10–p90
 * spread of a chosen metric (ABV/IBU/SRM) as a bar, with the median (p50)
 * as a tick, an SRM color dot, and the recipe count. This is the core
 * Beer-Analytics "style vitals" visualization.
 *
 * Server-rendered SVG (visx scales), zero client JS — see HBarChart.
 */
export interface StyleRow {
  style: string;
  count: number;
  srmP50: number | null;
  p10: number | null;
  p50: number | null;
  p90: number | null;
}

const COPPER = '#e08b2d';
const LABEL = '#667085';
const TRACK = '#eef1f4';
const INK = '#2b3137';

export function StyleRangeChart({
  rows,
  unit,
  ariaLabel,
}: {
  rows: StyleRow[];
  unit: string;
  ariaLabel: string;
}) {
  const usable = rows.filter((r) => r.p10 != null && r.p90 != null);
  if (!usable.length) return null;

  const W = 640;
  const rowH = 34;
  const labelW = 190;
  const trackX = labelW;
  const trackW = W - labelW - 16;
  const H = usable.length * rowH;

  const domainMax = Math.max(...usable.map((r) => r.p90 ?? 0)) * 1.05;
  const x = scaleLinear<number>({ domain: [0, domainMax], range: [0, trackW] });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMinYMin meet"
      className="overflow-visible"
    >
      {usable.map((r) => {
        const top = usable.indexOf(r) * rowH;
        const bandH = 14;
        const bandY = (rowH - bandH) / 2;
        const x10 = x(r.p10 ?? 0);
        const x90 = x(r.p90 ?? 0);
        const x50 = x(r.p50 ?? r.p10 ?? 0);
        const dot = srmToApproxHex(r.srmP50 ?? 4);
        return (
          <Group key={r.style} top={top}>
            {/* SRM color dot */}
            <circle cx={9} cy={rowH / 2} r={5} fill={dot} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
            {/* style label */}
            <text x={20} y={rowH / 2} dominantBaseline="central" fontSize={12.5} fontWeight={600} fill={INK}>
              {truncate(r.style, 26)}
            </text>
            {/* track */}
            <rect x={trackX} y={bandY} width={trackW} height={bandH} rx={7} fill={TRACK} />
            {/* p10–p90 range */}
            <rect
              x={trackX + x10}
              y={bandY}
              width={Math.max(3, x90 - x10)}
              height={bandH}
              rx={7}
              fill={COPPER}
              fillOpacity={0.3}
            />
            {/* p50 median marker */}
            <rect x={trackX + x50 - 1.5} y={bandY - 3} width={3} height={bandH + 6} rx={1.5} fill={COPPER} />
            {/* median value */}
            <text
              x={trackX + trackW}
              y={rowH / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={11.5}
              fontWeight={700}
              fill={LABEL}
            >
              {r.p50 ?? '-'}
              {unit}
            </text>
          </Group>
        );
      })}
    </svg>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
