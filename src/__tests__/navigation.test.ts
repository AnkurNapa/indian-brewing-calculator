import { describe, it, expect } from 'vitest';
import {
  TAB_IDS,
  TAB_GROUP_ORDER,
  TAB_GROUP_BY_ID,
  TAB_GROUP_LABEL_KEY,
  NEXT_STEPS,
  getNextSteps,
} from '@/lib/navigation';

const TAB_ID_SET = new Set<string>(TAB_IDS);

describe('tab grouping', () => {
  it('assigns every non-home tab to a known group', () => {
    for (const id of TAB_IDS) {
      if (id === 'home') continue;
      const group = TAB_GROUP_BY_ID[id as Exclude<(typeof TAB_IDS)[number], 'home'>];
      expect(TAB_GROUP_ORDER).toContain(group);
    }
  });

  it('only groups real tabs (no stray ids)', () => {
    for (const id of Object.keys(TAB_GROUP_BY_ID)) {
      expect(TAB_ID_SET.has(id)).toBe(true);
    }
  });

  it('does not group home (it renders standalone as the hub)', () => {
    expect(Object.keys(TAB_GROUP_BY_ID)).not.toContain('home');
  });

  it('provides a label key for every group', () => {
    for (const group of TAB_GROUP_ORDER) {
      expect(TAB_GROUP_LABEL_KEY[group]).toMatch(/^nav\.group\./);
    }
  });
});

describe('next-step graph', () => {
  it('defines suggestions for every tab', () => {
    for (const id of TAB_IDS) {
      expect(NEXT_STEPS[id]).toBeDefined();
    }
  });

  it('only ever points at real tabs', () => {
    for (const steps of Object.values(NEXT_STEPS)) {
      for (const step of steps) {
        expect(TAB_ID_SET.has(step.id)).toBe(true);
      }
    }
  });

  it('never suggests navigating to the current page', () => {
    for (const [from, steps] of Object.entries(NEXT_STEPS)) {
      for (const step of steps) {
        expect(step.id).not.toBe(from);
      }
    }
  });

  it('tags every edge with a nav.reason.* i18n key', () => {
    for (const steps of Object.values(NEXT_STEPS)) {
      for (const step of steps) {
        expect(step.reasonKey).toMatch(/^nav\.reason\./);
      }
    }
  });

  it('getNextSteps returns an empty array for unknown tabs', () => {
    expect(getNextSteps('does-not-exist')).toEqual([]);
  });
});
