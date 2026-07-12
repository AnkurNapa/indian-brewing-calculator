'use client';

import { ComponentType } from 'react';

export interface TabDef {
  id: string;
  label: string;
  /** Short label shown under the icon on narrow screens, e.g. "Water" instead of "Water Report". */
  shortLabel?: string;
  icon: ComponentType<{ className?: string }>;
}

interface TabsProps {
  tabs: TabDef[];
  activeId: string;
  onChange: (id: string) => void;
}

/**
 * Mobile-first tab navigation: a horizontally scrollable row of icon +
 * label buttons, sticky to the top of the viewport, so the current
 * section stays identifiable by shape/icon even before reading text.
 * Each tap target is at least 44px tall. On wider screens the row has
 * room to breathe and shows the full label.
 */
export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Brewing calculator sections"
      className="sticky top-0 z-10 -mx-4 flex gap-1.5 overflow-x-auto border-b-2 border-amber-200 bg-parchment/95 px-4 py-2 backdrop-blur sm:mx-0 sm:flex-wrap sm:justify-center sm:rounded-lg sm:border sm:px-2"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-[52px] flex-shrink-0 flex-col items-center gap-0.5 whitespace-nowrap rounded-xl px-3 py-1.5 font-body text-xs font-semibold transition-colors sm:min-h-[44px] sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:py-2 sm:text-sm ${
              isActive
                ? 'bg-teal-700 text-parchment shadow'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200 active:bg-amber-300'
            }`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
