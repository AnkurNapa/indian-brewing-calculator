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
 * App-shell navigation: on phones, a fixed bottom tab bar (iOS/Android
 * pattern) so the current section is always one thumb-reach away and the
 * screen reads like an installed app rather than a scrolling web page. On
 * wider screens it becomes a centered pill row near the top, since there's
 * no need to reserve thumb-reach space. Each tap target is at least 44px.
 */
export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Brewing calculator sections"
      className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t-2 border-amber-200 bg-parchment/97 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur sm:sticky sm:top-0 sm:mx-auto sm:mt-0 sm:max-w-3xl sm:flex-wrap sm:justify-center sm:gap-1.5 sm:rounded-full sm:border sm:bg-parchment/95 sm:px-2 sm:py-2 sm:pb-2 sm:shadow-sm"
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
            className={`flex min-h-[54px] flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 py-1.5 font-body text-[0.65rem] font-semibold transition-colors sm:min-h-[40px] sm:flex-none sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:py-2 sm:text-sm ${
              isActive ? 'text-teal-700 sm:bg-teal-700 sm:text-parchment sm:shadow' : 'text-amber-800/80 sm:bg-amber-100 sm:text-amber-900 sm:hover:bg-amber-200'
            }`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110 sm:scale-100' : ''}`} />
            <span className="max-w-[4.2rem] truncate leading-tight sm:hidden">{tab.shortLabel ?? tab.label}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
