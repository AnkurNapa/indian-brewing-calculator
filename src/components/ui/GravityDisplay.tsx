'use client';

import { useState } from 'react';
import { sgToPlato, roundForDisplay } from '@/lib/units';

type GravityUnit = 'sg' | 'plato' | 'brix';

const UNIT_OPTIONS: { id: GravityUnit; label: string }[] = [
  { id: 'sg', label: 'SG' },
  { id: 'plato', label: '°P' },
  { id: 'brix', label: '°Bx' },
];

interface GravityDisplayProps {
  label: string;
  /** Value is always specific gravity (SG) -- the app's internal canonical unit. */
  valueSg: number;
}

/**
 * Read-only counterpart to GravityField, for screens (like Home) that
 * show gravity values without letting them be edited inline -- same
 * SG/Plato/Brix toggle buttons so a brewer who thinks in Plato isn't
 * stuck converting OG/FG by hand just because it's on an overview
 * screen instead of an input field.
 */
export function GravityDisplay({ label, valueSg }: GravityDisplayProps) {
  const [unit, setUnit] = useState<GravityUnit>('sg');
  const displayValue = unit === 'sg' ? roundForDisplay(valueSg, 3) : roundForDisplay(sgToPlato(valueSg), 2);
  const unitSuffix = unit === 'sg' ? '' : unit === 'plato' ? '°P' : '°Bx';

  return (
    <div className="flex items-center justify-between gap-2">
      <span>
        {label}: <span className="font-semibold">{displayValue}{unitSuffix}</span>
      </span>
      <div className="flex flex-shrink-0 gap-0.5 rounded-full border border-amber-200 bg-amber-50 p-0.5">
        {UNIT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setUnit(opt.id)}
            className={`min-h-[24px] rounded-full px-1.5 font-body text-[0.6rem] font-semibold transition-colors ${
              unit === opt.id ? 'bg-teal-700 text-parchment' : 'text-amber-800 hover:bg-amber-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
