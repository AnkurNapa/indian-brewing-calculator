'use client';

// The Meilgaard Beer Flavor Wheel families (first-tier classes 1-14, with
// 14/Fullness folded into 13/Mouthfeel). Fault wheel numbers like "0150" or
// "0910" -> class = floor(number / 100) -> family.
export const FLAVOR_FAMILIES = [
  { cls: 1, key: 'fruity', label: 'Fruity', color: '#d98c3f' },
  { cls: 2, key: 'nutty', label: 'Nutty', color: '#a8743a' },
  { cls: 3, key: 'grainy', label: 'Grainy', color: '#c9a24a' },
  { cls: 4, key: 'caramel', label: 'Caramel', color: '#8a5a2b' },
  { cls: 5, key: 'phenolic', label: 'Phenolic', color: '#7a5c8a' },
  { cls: 6, key: 'fatty', label: 'Fatty', color: '#b7a24a' },
  { cls: 7, key: 'sulfury', label: 'Sulfury', color: '#6b8f5a' },
  { cls: 8, key: 'oxidized', label: 'Oxidized', color: '#8a8a7a' },
  { cls: 9, key: 'sour', label: 'Sour', color: '#c85a5a' },
  { cls: 10, key: 'sweet', label: 'Sweet', color: '#d98fa8' },
  { cls: 11, key: 'salty', label: 'Salty', color: '#7fa9b8' },
  { cls: 12, key: 'bitter', label: 'Bitter', color: '#4a6b7a' },
  { cls: 13, key: 'mouthfeel', label: 'Mouthfeel', color: '#9aa0a6' },
] as const;

export function familyOfWheel(wheel: string | null): string | null {
  if (!wheel) return null;
  const m = String(wheel).match(/\d{3,4}/);
  if (!m) return null;
  let cls = Math.floor(parseInt(m[0], 10) / 100);
  if (cls >= 14) cls = 13;
  if (cls < 1) return null;
  return FLAVOR_FAMILIES.find((f) => f.cls === cls)?.key ?? null;
}

const CX = 130;
const CY = 130;
const R_OUT = 122;
const R_IN = 58;
const N = FLAVOR_FAMILIES.length;
const SEG = 360 / N;

// point on a circle where angle 0 = top (12 o'clock), clockwise.
function pt(r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}
function segPath(i: number): string {
  const a0 = i * SEG;
  const a1 = (i + 1) * SEG;
  const [x1, y1] = pt(R_OUT, a0);
  const [x2, y2] = pt(R_OUT, a1);
  const [x3, y3] = pt(R_IN, a1);
  const [x4, y4] = pt(R_IN, a0);
  return `M${x1},${y1} A${R_OUT},${R_OUT} 0 0 1 ${x2},${y2} L${x3},${y3} A${R_IN},${R_IN} 0 0 0 ${x4},${y4} Z`;
}

/**
 * An interactive Meilgaard-style flavor wheel. Tapping a family spins the
 * wheel so that segment is at the top and reports the selection upward, so the
 * faults list can filter to that flavor family. Server-safe SVG; the only
 * client bit is the rotation transition.
 */
export function FlavorWheel({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<string, number>;
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  const selIndex = FLAVOR_FAMILIES.findIndex((f) => f.key === selected);
  // Rotate the selected segment's centre to the top.
  const rotation = selIndex >= 0 ? -((selIndex + 0.5) * SEG) : 0;
  const selFamily = selIndex >= 0 ? FLAVOR_FAMILIES[selIndex] : null;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 260 260" width="100%" style={{ maxWidth: 300 }} role="img" aria-label="Beer flavor wheel">
        {/* fixed pointer at top */}
        <path d="M130,2 l7,12 h-14 Z" fill="#2b3137" />
        <g style={{ transformOrigin: '130px 130px', transform: `rotate(${rotation}deg)`, transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)' }}>
          {FLAVOR_FAMILIES.map((fam, i) => {
            const active = fam.key === selected;
            const n = counts[fam.key] ?? 0;
            const [lx, ly] = pt((R_OUT + R_IN) / 2, (i + 0.5) * SEG);
            return (
              <g key={fam.key} onClick={() => onSelect(active ? null : fam.key)} style={{ cursor: 'pointer' }}>
                <path
                  d={segPath(i)}
                  fill={fam.color}
                  fillOpacity={active ? 1 : n === 0 ? 0.22 : 0.72}
                  stroke="#fffdf8"
                  strokeWidth={active ? 2.5 : 1.2}
                />
                <text
                  x={lx}
                  y={ly}
                  transform={`rotate(${(i + 0.5) * SEG - rotation}, ${lx}, ${ly})`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9.5}
                  fontWeight={700}
                  fill="#fffdf8"
                  style={{ pointerEvents: 'none' }}
                >
                  {fam.label}
                </text>
              </g>
            );
          })}
        </g>
        {/* centre hub */}
        <circle cx={CX} cy={CY} r={R_IN - 4} fill="#fffdf8" stroke="#e2e6ea" strokeWidth={1.5} />
        <text x={CX} y={CY - 8} textAnchor="middle" fontSize={11} fontWeight={800} fill={selFamily ? selFamily.color : '#a35f1c'} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {selFamily ? selFamily.label : 'Flavor'}
        </text>
        <text x={CX} y={CY + 9} textAnchor="middle" fontSize={9} fontWeight={600} fill="#667085">
          {selFamily ? `${counts[selFamily.key] ?? 0} faults` : 'wheel'}
        </text>
      </svg>
      {selected ? (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-1 rounded-full border border-amber-200 bg-white/70 px-3 py-1 font-body text-xs font-semibold text-amber-900 hover:border-[#e08b2d]/60"
        >
          Clear
        </button>
      ) : (
        <p className="mt-1 font-body text-xs text-ink/50">Tap a family to filter</p>
      )}
    </div>
  );
}
