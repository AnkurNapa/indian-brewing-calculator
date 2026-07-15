'use client';

import { ComponentType, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { TAB_GROUP_ORDER, TAB_GROUP_LABEL_KEY, TabGroupId } from '@/lib/navigation';
import type { TranslationKey } from '@/i18n/translations';

export interface TabDef {
  id: string;
  label: string;
  /** Short label shown under the icon on narrow screens, e.g. "Water" instead of "Water Report". */
  shortLabel?: string;
  icon: ComponentType<{ className?: string }>;
  /** Cluster this tab belongs to. Undefined = standalone (e.g. Home), rendered ahead of the groups. */
  group?: TabGroupId;
}

interface TabsProps {
  tabs: TabDef[];
  activeId: string;
  onChange: (id: string) => void;
}

interface NavSegment {
  /** Group id, or null for the leading standalone tabs (Home). */
  groupId: TabGroupId | null;
  tabs: TabDef[];
}

/**
 * Splits the flat tab list into ordered, captioned segments: any
 * ungrouped tabs (Home) first, then each group in TAB_GROUP_ORDER that has
 * members. This is what turns fifteen equal-weight peers into a handful of
 * labelled clusters you can actually scan.
 */
function toSegments(tabs: TabDef[]): NavSegment[] {
  const segments: NavSegment[] = [];
  const ungrouped = tabs.filter((tab) => !tab.group);
  if (ungrouped.length > 0) segments.push({ groupId: null, tabs: ungrouped });
  for (const groupId of TAB_GROUP_ORDER) {
    const members = tabs.filter((tab) => tab.group === groupId);
    if (members.length > 0) segments.push({ groupId, tabs: members });
  }
  return segments;
}

/**
 * App-shell navigation. On phones: a single fixed bottom bar that holds
 * every section as a swipeable, snap-scrolling strip, now sectioned by
 * group so a small caption precedes each cluster as you flick past it.
 * On wider screens the same tabs render as labelled group rows, so a page
 * is found by its cluster ("it's a Water tool") rather than by scanning
 * the whole set. Every tap target is at least 44px; the active tab
 * auto-centers into view.
 */
export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const { t } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const segments = useMemo(() => toSegments(tabs), [tabs]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const activeButton = scroller.querySelector<HTMLButtonElement>(`[data-tab-id="${activeId}"]`);
    activeButton?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeId]);

  return (
    <>
      {/* Desktop: labelled group rows, all visible, no scrolling needed. */}
      <nav
        role="tablist"
        aria-label={t('sharedUi.tabs.ariaLabel')}
        className="hidden sm:sticky sm:top-0 sm:z-20 sm:mx-auto sm:flex sm:max-w-3xl sm:flex-col sm:gap-1.5 sm:rounded-2xl sm:border sm:border-amber-200 sm:bg-parchment/95 sm:px-3 sm:py-2.5 sm:shadow-sm"
      >
        {segments.map((segment) => (
          <div key={segment.groupId ?? 'home'} className="flex flex-wrap items-center gap-1.5">
            {segment.groupId ? (
              <span className="w-16 flex-shrink-0 font-body text-[0.65rem] font-bold uppercase tracking-wide text-amber-600">
                {t(TAB_GROUP_LABEL_KEY[segment.groupId] as TranslationKey)}
              </span>
            ) : null}
            {segment.tabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} isActive={tab.id === activeId} onClick={() => onChange(tab.id)} />
            ))}
          </div>
        ))}
      </nav>

      {/* Mobile: fixed, swipeable/snap-scrolling bottom bar, sectioned by group. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-amber-200 bg-parchment/97 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur sm:hidden">
        <nav
          ref={scrollerRef}
          role="tablist"
          aria-label={t('sharedUi.tabs.ariaLabel')}
          className="flex snap-x snap-mandatory items-stretch gap-1 overflow-x-auto scroll-px-4 px-4 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {segments.map((segment) => (
            <div key={segment.groupId ?? 'home'} className="flex flex-shrink-0 items-stretch gap-1">
              {segment.groupId ? (
                <span
                  aria-hidden="true"
                  className="flex flex-shrink-0 items-center border-l border-amber-200 pl-1.5 pr-0.5 font-body text-[0.55rem] font-bold uppercase leading-none tracking-wide text-amber-500 [writing-mode:vertical-lr]"
                >
                  {t(TAB_GROUP_LABEL_KEY[segment.groupId] as TranslationKey)}
                </span>
              ) : null}
              {segment.tabs.map((tab) => (
                <TabButton key={tab.id} tab={tab} isActive={tab.id === activeId} onClick={() => onChange(tab.id)} snap />
              ))}
            </div>
          ))}
        </nav>
        {/* Edge hint: a soft dots-style scroll affordance so it reads as swipeable. */}
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
