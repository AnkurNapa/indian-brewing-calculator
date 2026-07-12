'use client';

import { ComponentType, useEffect, useState } from 'react';

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

/** Icon shown for the "More" tab that opens the overflow sheet. */
function MoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * How many sections get a permanent, always-visible slot in the phone
 * bottom bar. The rest live behind "More" -- mirrors the iOS/Android
 * pattern (Instagram, Facebook, etc.) of 4-5 primary destinations plus an
 * overflow sheet, rather than cramming every section into one row where
 * labels truncate and targets get too small to tap reliably.
 */
const PRIMARY_COUNT = 4;

/**
 * App-shell navigation. On phones: a fixed bottom tab bar with up to
 * PRIMARY_COUNT primary destinations plus a "More" tab that opens a full
 * list of the remaining sections as a bottom sheet. On wider screens,
 * every tab is shown as a centered pill row near the top -- there's room,
 * and hiding items behind "More" would only cost clicks. Every tap target
 * is at least 44px.
 */
export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const primaryTabs = tabs.slice(0, PRIMARY_COUNT);
  const overflowTabs = tabs.slice(PRIMARY_COUNT);
  const isOverflowActive = overflowTabs.some((tab) => tab.id === activeId);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [activeId]);

  useEffect(() => {
    if (!isMoreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMoreOpen]);

  return (
    <>
      {/* Desktop: every tab, always visible. */}
      <nav
        role="tablist"
        aria-label="Brewing calculator sections"
        className="hidden sm:sticky sm:top-0 sm:z-20 sm:mx-auto sm:flex sm:max-w-3xl sm:flex-wrap sm:justify-center sm:gap-1.5 sm:rounded-full sm:border sm:border-amber-200 sm:bg-parchment/95 sm:px-2 sm:py-2 sm:shadow-sm"
      >
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} isActive={tab.id === activeId} onClick={() => onChange(tab.id)} />
        ))}
      </nav>

      {/* Mobile: primary tabs + "More" overflow, fixed to the bottom like a native app. */}
      <nav
        role="tablist"
        aria-label="Brewing calculator sections"
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t-2 border-amber-200 bg-parchment/97 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur sm:hidden"
      >
        {primaryTabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} isActive={tab.id === activeId} onClick={() => onChange(tab.id)} />
        ))}
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isMoreOpen}
          onClick={() => setIsMoreOpen(true)}
          className={`flex min-h-[54px] flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 py-1.5 font-body text-[0.65rem] font-semibold transition-colors ${
            isOverflowActive ? 'text-teal-700' : 'text-amber-800/80'
          }`}
        >
          <MoreIcon className={`h-5 w-5 flex-shrink-0 transition-transform ${isOverflowActive ? 'scale-110' : ''}`} />
          <span className="leading-tight">More</span>
        </button>
      </nav>

      {isMoreOpen ? (
        <MoreSheet tabs={overflowTabs} activeId={activeId} onSelect={onChange} onClose={() => setIsMoreOpen(false)} />
      ) : null}
    </>
  );
}

function TabButton({ tab, isActive, onClick }: { tab: TabDef; isActive: boolean; onClick: () => void }) {
  const Icon = tab.icon;
  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={onClick}
      className={`flex min-h-[54px] flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 py-1.5 font-body text-[0.65rem] font-semibold transition-colors sm:min-h-[40px] sm:flex-none sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:py-2 sm:text-sm ${
        isActive
          ? 'text-teal-700 sm:bg-teal-700 sm:text-parchment sm:shadow'
          : 'text-amber-800/80 sm:bg-amber-100 sm:text-amber-900 sm:hover:bg-amber-200'
      }`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110 sm:scale-100' : ''}`} />
      <span className="max-w-[4.2rem] truncate leading-tight sm:hidden">{tab.shortLabel ?? tab.label}</span>
      <span className="hidden sm:inline">{tab.label}</span>
    </button>
  );
}

function MoreSheet({
  tabs,
  activeId,
  onSelect,
  onClose,
}: {
  tabs: TabDef[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end sm:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <div className="relative rounded-t-2xl border-t-2 border-amber-200 bg-parchment pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-amber-200" aria-hidden="true" />
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">More Sections</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-amber-700 hover:bg-amber-100"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 px-3 pb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                className={`flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-center font-body text-xs font-semibold transition-colors ${
                  isActive ? 'bg-teal-700 text-parchment shadow' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span className="leading-tight">{tab.shortLabel ?? tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
