'use client';

import { sgToPlato, roundForDisplay } from '@/lib/units';

export type GravityUnit = 'sg' | 'plato' | 'brix';

export const GRAVITY_UNIT_OPTIONS: { id: GravityUnit; label: string }[] = [
  { id: 'sg', label: 'SG' },
  { id: 'plato', label: '°P' },
  { id: 'brix', label: '°Bx' },
];

interface GravityUnitToggleProps {
  unit: GravityUnit;
  onChange: (unit: GravityUnit) => void;
  className?: string;
}

/**
 * The SG/Plato/Brix segmented pill control on its own, so a screen can
 * place ONE toggle that drives every gravity value shown on it (Home)
 * instead of each value having its own independent toggle -- which was
 * confusing (OG in Plato, FG in Brix, on the same screen, at the same
 * time).
 */
export function GravityUnitToggle({ unit, onChange, className }: GravityUnitToggleProps) {
  return (
    <div className={`flex flex-shrink-0 gap-0.5 rounded-full border border-amber-200 bg-amber-50 p-0.5 ${className ?? ''}`}>
      {GRAVITY_UNIT_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`min-h-[28px] rounded-full px-2 font-body text-[0.65rem] font-semibold transition-colors ${
            unit === opt.id ? 'bg-teal-700 text-parchment' : 'text-amber-800 hover:bg-amber-100'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface GravityDisplayProps {
  label: string;
  /** Value is always specific gravity (SG) -- the app's internal canonical unit. */
  valueSg: number;
  /** Which unit to render in -- driven by a single shared GravityUnitToggle, not owned per-value. */
  unit: GravityUnit;
}

/**
 * Read-only gravity value, rendered in whichever unit the screen's
 * single shared GravityUnitToggle is currently set to.
 */
export function GravityDisplay({ label, valueSg, unit }: GravityDisplayProps) {
  const displayValue = unit === 'sg' ? roundForDisplay(valueSg, 3) : roundForDisplay(sgToPlato(valueSg), 2);
  const unitSuffix = unit === 'sg' ? '' : unit === 'plato' ? '°P' : '°Bx';

  return (
    <p>
      {label}: <span className="font-semibold">{displayValue}{unitSuffix}</span>
    </p>
  );
}
