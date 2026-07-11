'use client';

import { useId } from 'react';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Input({ label, value, onChange, placeholder }: InputProps) {
  const inputId = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="font-body text-sm font-medium text-amber-900">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink shadow-inner outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
      />
    </div>
  );
}
