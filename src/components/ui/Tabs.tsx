'use client';

import { ComponentType, useEffect, useRef } from 'react';

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
 * App-shell navigation. On phones: a single fixed bottom bar that holds
 * every section as a swipeable, snap-scrolling strip -- short icon +
 * label chips the user can flick through with a thumb, like a native
 * app's tab/segment control, with the active one auto-centered so it's
 * always in view without having to swipe to find it. On wider screens the
 * same tabs render as a centered wrapping pill row, since there's room
 * for all of them without scrolling. Every tap target is at least 44px.
 */
export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const activeButton = scroller.querySelector<HTMLButtonElement>(`[data-tab-id="${activeId}"]`);
    activeButton?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeId]);

  return (
    <>
      {/* Desktop: every tab, always visible, no scrolling needed. */}
      <nav
        role="tablist"
        aria-label="Brewing calculator sections"
        className="hidden sm:sticky sm:top-0 sm:z-20 sm:mx-auto sm:flex sm:max-w-3xl sm:flex-wrap sm:justify-center sm:gap-1.5 sm:rounded-full sm:border sm:border-amber-200 sm:bg-parchment/95 sm:px-2 sm:py-2 sm:shadow-sm"
      >
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} isActive={tab.id === activeId} onClick={() => onChange(tab.id)} />
        ))}
      </nav>

      {/* Mobile: fixed, swipeable/snap-scrolling bottom bar. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-amber-200 bg-parchment/97 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur sm:hidden">
        <nav
          ref={scrollerRef}
          role="tablist"
          aria-label="Brewing calculator sections"
          className="flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-px-4 px-4 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeId}
              onClick={() => onChange(tab.id)}
              snap
            />
          ))}
        </nav>
        {/* Edge hint: a soft fade + dots-style scroll affordance so it reads as
            swipeable rather than as a cut-off list. */}
        <div className="pointer-events-none flex justify-center gap-1 pb-1">
          {tabs.map((tab) => (
            <span
              key={tab.id}
              aria-hidden="true"
              className={`h-1 w-1 rounded-full transition-colors ${tab.id === activeId ? 'bg-teal-700' : 'bg-amber-200'}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function TabButton({
  tab,
  isActive,
  onClick,
  snap = false,
}: {
  tab: TabDef;
  isActive: boolean;
  onClick: () => void;
  snap?: boolean;
}) {
  const Icon = tab.icon;
  return (
    <button
      data-tab-id={tab.id}
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={onClick}
      className={`flex min-h-[54px] flex-shrink-0 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-xl px-3 py-1.5 font-body text-[0.65rem] font-semibold transition-colors sm:min-h-[40px] sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:py-2 sm:text-sm ${
        snap ? 'snap-center' : ''
      } ${
        isActive
          ? 'bg-teal-100/70 text-teal-700 sm:bg-teal-700 sm:text-parchment sm:shadow'
          : 'text-amber-800/80 sm:bg-amber-100 sm:text-amber-900 sm:hover:bg-amber-200'
      }`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110 sm:scale-100' : ''}`} />
      <span className="max-w-[4.2rem] truncate leading-tight sm:hidden">{tab.shortLabel ?? tab.label}</span>
      <span className="hidden sm:inline">{tab.label}</span>
    </button>
  );
}
