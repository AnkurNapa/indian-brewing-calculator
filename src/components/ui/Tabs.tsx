'use client';

export interface TabDef {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabDef[];
  activeId: string;
  onChange: (id: string) => void;
}

/**
 * Mobile-first tab navigation: a horizontally scrollable row of pill
 * buttons, sticky to the top of the viewport. Each tap target is at
 * least 44px tall. On wider screens the row simply has room to breathe
 * and no longer needs to scroll.
 */
export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Water chemistry sections"
      className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto border-b-2 border-amber-200 bg-parchment/95 px-4 py-2 backdrop-blur sm:mx-0 sm:justify-center sm:rounded-lg sm:border sm:px-2"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`min-h-[44px] flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-teal-700 text-parchment shadow'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200 active:bg-amber-300'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
