'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export interface SearchableSelectOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function SearchableSelect({ label, options, value, onChange, placeholder }: SearchableSelectProps) {
  const { t } = useLanguage();
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Briefly pulses the closed button right after a pick, so the user gets
  // an unmistakable "yes, that registered" moment instead of having to
  // trust that the label quietly changing was the confirmation.
  const [justSelected, setJustSelected] = useState(false);

  const selected = options.find((opt) => opt.id === value);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!justSelected) return;
    const timer = setTimeout(() => setJustSelected(false), 900);
    return () => clearTimeout(timer);
  }, [justSelected]);

  const selectOption = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
    setJustSelected(true);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label htmlFor={inputId} className="font-body text-sm font-medium text-amber-900">
        {label}
      </label>
      <button
        id={inputId}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex min-h-[44px] w-full items-center justify-between rounded-md border-2 bg-parchment px-3 py-2 text-left text-base text-ink outline-none transition-colors duration-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 ${
          justSelected ? 'border-teal-500 ring-2 ring-teal-200 bg-teal-50' : 'border-amber-200'
        }`}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {selected ? (
            <span aria-hidden="true" className="flex-shrink-0 text-teal-700">
              ✓
            </span>
          ) : null}
          <span className={`truncate ${selected ? '' : 'text-ink/50'}`}>
            {selected ? selected.label : placeholder ?? t('sharedUi.searchableSelect.selectPlaceholder')}
          </span>
        </span>
        <span aria-hidden="true" className="ml-2 flex-shrink-0 text-amber-700">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-md border-2 border-amber-200 bg-white shadow-lg">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sharedUi.searchableSelect.searchPlaceholder')}
            className="w-full border-b border-amber-100 px-3 py-2 text-base text-ink outline-none"
          />
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 font-body text-sm text-ink/60">{t('sharedUi.searchableSelect.noMatches')}</li>
            ) : (
              filteredOptions.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => selectOption(opt.id)}
                    className={`flex w-full items-center gap-1.5 px-3 py-2 text-left font-body text-sm hover:bg-teal-50 ${
                      opt.id === value ? 'bg-teal-100/60 font-semibold text-teal-900' : 'text-ink'
                    }`}
                  >
                    {opt.id === value ? (
                      <span aria-hidden="true" className="flex-shrink-0">
                        ✓
                      </span>
                    ) : null}
                    <span className="truncate">{opt.label}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
