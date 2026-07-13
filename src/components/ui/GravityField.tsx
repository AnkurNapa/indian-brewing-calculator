'use client';

import { useState } from 'react';
import { NumberField } from './NumberField';
import { sgToPlato, platoToSg, roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

type GravityUnit = 'sg' | 'plato' | 'brix';

const UNIT_OPTIONS: { id: GravityUnit; label: string }[] = [
  { id: 'sg', label: 'SG' },
  { id: 'plato', label: '°P' },
  { id: 'brix', label: '°Bx' },
];

interface GravityFieldProps {
  label: string;
  /** Value is always specific gravity (SG) -- the app's internal canonical unit. */
  value: number;
  onChange: (sg: number) => void;
  allowNegative?: boolean;
  helperText?: string;
}

/**
 * A gravity input that lets the user enter/read in SG, degrees Plato, or
 * degrees Brix, while every calculation elsewhere in the app keeps using
 * SG as the single source of truth -- this component just converts at
 * the display boundary, so switching units never changes what's actually
 * stored in shared state.
 */
export function GravityField({ label, value, onChange, allowNegative, helperText }: GravityFieldProps) {
  const { t } = useLanguage();
  const [unit, setUnit] = useState<GravityUnit>('sg');

  const displayValue = unit === 'sg' ? value : roundForDisplay(sgToPlato(value), 2);
  const step = unit === 'sg' ? 0.001 : 0.1;

  const handleChange = (next: number) => {
    onChange(unit === 'sg' ? next : platoToSg(next));
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-sm font-medium text-amber-900">{label}</span>
        <div className="flex flex-shrink-0 gap-0.5 rounded-full border border-amber-200 bg-amber-50 p-0.5">
          {UNIT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setUnit(opt.id)}
              className={`min-h-[28px] rounded-full px-2 font-body text-[0.65rem] font-semibold transition-colors ${
                unit === opt.id ? 'bg-teal-700 text-parchment' : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <NumberField
        label=""
        ariaLabel={label}
        value={displayValue}
        step={step}
        onChange={handleChange}
        allowNegative={allowNegative}
        helperText={
          unit === 'sg'
            ? helperText
            : `${helperText ? helperText + ' ' : ''}${t('sharedCalc.gravityField.enteredInStoredAsSg', {
                unit: unit === 'plato' ? t('sharedCalc.gravityField.plato') : t('sharedCalc.gravityField.brix'),
              })}`
        }
      />
    </div>
  );
}
