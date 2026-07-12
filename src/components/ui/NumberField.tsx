'use client';

import { useState, useId, useEffect, useRef } from 'react';
import { parseNonNegative } from '@/lib/units';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  allowNegative?: boolean;
  helperText?: string;
}

/**
 * A validated numeric input. Rejects non-numeric/malformed input at the
 * UI boundary with an inline error message rather than silently
 * coercing to NaN or 0. Empty input is treated as 0 once the field is
 * blurred/committed, per the app's "empty => 0, never NaN" convention.
 */
export function NumberField({
  label,
  value,
  onChange,
  unit,
  min = 0,
  max,
  step = 1,
  allowNegative = false,
  helperText,
}: NumberFieldProps) {
  const [raw, setRaw] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const isFocusedRef = useRef(false);

  // Re-sync the displayed text when `value` changes from outside this
  // field (e.g. a water preset fills the ion fields, or another tab
  // updates a shared value like OG/FG while this field stays mounted).
  // Skipped while the user is actively typing so we don't clobber their
  // in-progress edit before they blur to commit it.
  useEffect(() => {
    if (isFocusedRef.current) return;
    setRaw(String(value));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (text: string) => {
    const parsed = allowNegative
      ? text.trim() === ''
        ? 0
        : Number.isFinite(Number(text))
          ? Number(text)
          : null
      : parseNonNegative(text);

    if (parsed === null) {
      setError('Enter a valid number.');
      return;
    }

    let bounded = parsed;
    if (typeof min === 'number' && !allowNegative) bounded = Math.max(min, bounded);
    if (typeof max === 'number') bounded = Math.min(max, bounded);

    setError(null);
    onChange(bounded);
    setRaw(String(bounded));
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="font-body text-sm font-medium text-amber-900">
        {label}
        {unit ? <span className="ml-1 text-amber-600">({unit})</span> : null}
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="decimal"
        step={step}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={(e) => {
          isFocusedRef.current = false;
          commit(e.target.value);
        }}
        className={`min-h-[44px] w-full rounded-md border-2 bg-parchment px-3 py-2 text-base text-ink shadow-inner outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-200 ${
          error ? 'border-red-400' : 'border-amber-200'
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-amber-700/80">{helperText}</p>
      ) : null}
    </div>
  );
}
