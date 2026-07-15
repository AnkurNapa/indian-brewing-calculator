/**
 * The app's navigation model, in one pure place: the flat list of tabs,
 * how they cluster into named groups (for a scannable tab bar), and the
 * real data-dependency graph -- which page's output usefully flows into
 * which next page. The graph powers the contextual "Where to next" cards
 * that replaced the old linear index+1 button, so the suggested next move
 * follows what the brewer actually just produced, not tab order.
 *
 * This module has no React and no i18n text (only i18n *keys*), so it can
 * be unit-tested for referential integrity -- see navigation.test.ts.
 */

/** Every tab id in the app. The canonical source of truth for what exists. */
export const TAB_IDS = [
  'home',
  'water-report',
  'mash-adjustment',
  'sparge-adjustment',
  'water-volumes',
  'transfer-lautering',
  'blending',
  'mixing-cross',
  'brewhouse',
  'brewhouse-yield',
  'spent-grain',
  'fermentation-tracker',
  'style-check',
  'recipes',
  'backup',
  'about',
] as const;

export type TabId = (typeof TAB_IDS)[number];

/**
 * Tab groups, in display order. Home is intentionally absent: it is the
 * session hub and renders on its own, ahead of the groups, rather than
 * inside one.
 */
export const TAB_GROUP_ORDER = ['water', 'volumes', 'brewhouse', 'ferment', 'session'] as const;

export type TabGroupId = (typeof TAB_GROUP_ORDER)[number];

/** i18n key for each group's short label, shown as the group caption. */
export const TAB_GROUP_LABEL_KEY: Record<TabGroupId, string> = {
  water: 'nav.group.water',
  volumes: 'nav.group.volumes',
  brewhouse: 'nav.group.brewhouse',
  ferment: 'nav.group.ferment',
  session: 'nav.group.session',
};

/**
 * Which group each non-home tab belongs to. Grouping is by concept (all
 * water-chemistry pages together, all volume/transfer pages together, and
 * so on) so a specific page is easy to find, instead of scanning fifteen
 * equal-weight peers.
 */
export const TAB_GROUP_BY_ID: Record<Exclude<TabId, 'home'>, TabGroupId> = {
  'water-report': 'water',
  'mash-adjustment': 'water',
  'sparge-adjustment': 'water',
  'water-volumes': 'volumes',
  'transfer-lautering': 'volumes',
  blending: 'volumes',
  'mixing-cross': 'volumes',
  brewhouse: 'brewhouse',
  'brewhouse-yield': 'brewhouse',
  'spent-grain': 'brewhouse',
  'fermentation-tracker': 'ferment',
  'style-check': 'ferment',
  recipes: 'session',
  backup: 'session',
  about: 'session',
};

export interface NextStep {
  /** Destination tab id. */
  id: TabId;
  /** i18n key for the one-line reason this page's output feeds the destination. */
  reasonKey: string;
}

/**
 * The data-dependency graph. For each tab, the pages its output most
 * usefully flows into, ordered most-relevant first. Reasons are keyed to a
 * small reusable set (nav.reason.*) describing *what* carries across --
 * the source water profile, the grain bill, the batch volume, the OG/FG --
 * so the same phrasing stays consistent everywhere a value is handed off.
 *
 * This is domain knowledge (the brew-day flow), so it is the natural place
 * to tune the suggestions: add, remove, or reorder edges here and the UI
 * follows automatically. Keep every id a real TAB_ID (the test enforces it).
 */
export const NEXT_STEPS: Record<TabId, NextStep[]> = {
  home: [{ id: 'water-report', reasonKey: 'nav.reason.start' }],
  'water-report': [
    { id: 'mash-adjustment', reasonKey: 'nav.reason.water' },
    { id: 'sparge-adjustment', reasonKey: 'nav.reason.water' },
  ],
  'mash-adjustment': [
    { id: 'water-volumes', reasonKey: 'nav.reason.grainBill' },
    { id: 'brewhouse', reasonKey: 'nav.reason.grainBill' },
    { id: 'style-check', reasonKey: 'nav.reason.grainBill' },
  ],
  'sparge-adjustment': [{ id: 'water-volumes', reasonKey: 'nav.reason.volume' }],
  'water-volumes': [
    { id: 'transfer-lautering', reasonKey: 'nav.reason.grainBill' },
    { id: 'brewhouse-yield', reasonKey: 'nav.reason.volume' },
  ],
  'transfer-lautering': [{ id: 'brewhouse', reasonKey: 'nav.reason.continue' }],
  blending: [{ id: 'water-report', reasonKey: 'nav.reason.continue' }],
  'mixing-cross': [{ id: 'water-volumes', reasonKey: 'nav.reason.continue' }],
  brewhouse: [
    { id: 'style-check', reasonKey: 'nav.reason.gravity' },
    { id: 'fermentation-tracker', reasonKey: 'nav.reason.gravity' },
  ],
  'brewhouse-yield': [{ id: 'spent-grain', reasonKey: 'nav.reason.continue' }],
  'spent-grain': [{ id: 'brewhouse', reasonKey: 'nav.reason.continue' }],
  'fermentation-tracker': [
    { id: 'brewhouse', reasonKey: 'nav.reason.gravity' },
    { id: 'style-check', reasonKey: 'nav.reason.gravity' },
  ],
  'style-check': [
    { id: 'recipes', reasonKey: 'nav.reason.record' },
    { id: 'brewhouse', reasonKey: 'nav.reason.gravity' },
  ],
  recipes: [{ id: 'home', reasonKey: 'nav.reason.overview' }],
  backup: [{ id: 'home', reasonKey: 'nav.reason.overview' }],
  about: [{ id: 'home', reasonKey: 'nav.reason.overview' }],
};

/** The contextual next-step suggestions for a tab (empty array if none). */
export function getNextSteps(tabId: string): NextStep[] {
  return NEXT_STEPS[tabId as TabId] ?? [];
}
