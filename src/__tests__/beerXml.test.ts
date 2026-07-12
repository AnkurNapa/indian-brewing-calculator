import { describe, it, expect } from 'vitest';
import { buildBeerXml } from '@/lib/beerXml';
import { DEFAULT_APP_STATE } from '@/hooks/useWaterProfile';
import { AppState } from '@/hooks/useWaterProfile';

function stateWith(overrides: Partial<AppState>): AppState {
  return { ...DEFAULT_APP_STATE, ...overrides };
}

describe('buildBeerXml', () => {
  it('produces well-formed-looking XML with the recipe name and core stats', () => {
    const state = stateWith({
      batchVolumeL: 20,
      ogSg: 1.052,
      fgSg: 1.012,
      grainBill: [{ name: 'Pilsner Malt', weightKg: 5, colorLovibond: 1.8, potentialSg: 1.037 }],
      hopAdditions: [{ name: 'Cascade', alphaAcidPercent: 5.5, weightG: 20, boilTimeMinutes: 60 }],
    });

    const xml = buildBeerXml(state, 'Test Pilsner');

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<NAME>Test Pilsner</NAME>');
    expect(xml).toContain('<BATCH_SIZE>20.00</BATCH_SIZE>');
    expect(xml).toContain('<OG>1.052</OG>');
    expect(xml).toContain('<FG>1.012</FG>');
    expect(xml).toContain('<NAME>Pilsner Malt</NAME>');
    expect(xml).toContain('<NAME>Cascade</NAME>');
    expect((xml.match(/<RECIPE>/g) ?? []).length).toBe(1);
    expect((xml.match(/<\/RECIPE>/g) ?? []).length).toBe(1);
  });

  it('escapes XML-unsafe characters in names', () => {
    const state = stateWith({
      grainBill: [{ name: 'Grain & <Special>', weightKg: 1, colorLovibond: 2 }],
    });

    const xml = buildBeerXml(state, 'Recipe "Quoted" & More');

    expect(xml).toContain('Recipe &quot;Quoted&quot; &amp; More');
    expect(xml).toContain('Grain &amp; &lt;Special&gt;');
    expect(xml).not.toContain('<Special>');
  });

  it('omits fermentables/hops with zero weight and falls back to a comment placeholder when empty', () => {
    const state = stateWith({ grainBill: [], hopAdditions: [] });
    const xml = buildBeerXml(state, 'Empty Recipe');

    expect(xml).toContain('no fermentables entered');
    expect(xml).toContain('no hop additions entered');
  });
});
