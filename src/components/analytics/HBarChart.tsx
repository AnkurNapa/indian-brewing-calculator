import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';

/**
 * A static, server-rendered horizontal bar chart (visx scales + shapes).
 *
 * No 'use client', no hooks, no ResizeObserver: it renders to plain SVG at
 * build time and ships zero JS. Responsiveness comes from the viewBox +
 * width:100% — the whole chart (bars and labels) scales with its container.
 *
 * Used for the "top hops / pairings / fermentables / yeasts" rankings.
 */
export interface BarDatum {
  label: string;
  value: number;
}

const COPPER = '#e08b2d';
const COPPER_DARK = '#a35f1c';
const LABEL = '#667085';
const TRACK = '#eef1f4';

export function HBarChart({
  data,
  valueSuffix = '',
  ariaLabel,
}: {
  data: BarDatum[];
  valueSuffix?: string;
  ariaLabel: string;
}) {
  if (!data.length) return null;

  // viewBox coordinate space — everything scales proportionally via CSS.
  const W = 640;
  const rowH = 30;
  const labelW = 168;
  const valueW = 52;
  const gap = 6;
  const H = data.length * rowH;
  const barMax = W - labelW - valueW;

  const y = scaleBand<string>({
    domain: data.map((d) => d.label),
    range: [0, H],
    padding: 0.28,
  });
  const x = scaleLinear<number>({
    domain: [0, Math.max(...data.map((d) => d.value))],
    range: [0, barMax],
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMinYMin meet"
      className="overflow-visible"
    >
      {data.map((d, i) => {
        const barY = y(d.label) ?? 0;
        const bh = y.bandwidth();
        const bw = Math.max(2, x(d.value));
        return (
          <Group key={d.label} top={barY}>
            {/* left label */}
            <text
              x={labelW - gap}
              y={bh / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={600}
              fill="#2b3137"
            >
              {d.label}
            </text>
            {/* track */}
            <Bar x={labelW} y={0} width={barMax} height={bh} rx={4} fill={TRACK} />
            {/* value bar (gradient copper) */}
            <Bar x={labelW} y={0} width={bw} height={bh} rx={4} fill={`url(#hbar-grad)`} />
            {/* value */}
            <text
              x={labelW + bw + gap}
              y={bh / 2}
              dominantBaseline="central"
              fontSize={12}
              fontWeight={700}
              fill={i === 0 ? COPPER_DARK : LABEL}
            >
              {d.value}
              {valueSuffix}
            </text>
          </Group>
        );
      })}
      <defs>
        <linearGradient id="hbar-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={COPPER} stopOpacity={0.85} />
          <stop offset="1" stopColor={COPPER_DARK} stopOpacity={0.95} />
        </linearGradient>
      </defs>
    </svg>
  );
}
