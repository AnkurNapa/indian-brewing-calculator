import { AppState } from '@/hooks/useWaterProfile';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { calculateIbu } from '@/lib/ibu';
import { calculateSrm } from '@/lib/srm';
import { calculateAbvAdvanced } from '@/lib/fermentation';

/**
 * BeerXML 1.0 export -- the open, widely-supported interchange format
 * for brewing recipes (readable by BeerSmith, Brewfather, Brewer's
 * Friend, and most other brewing software). Generated directly from the
 * published BeerXML 1.0 spec (original implementation, not sourced from
 * any proprietary tool).
 *
 * Scope note: this app doesn't track a structured yeast strain (only a
 * free-text name entered locally in the Pitch Rate calculator, which
 * isn't part of shared recipe state), so the exported recipe has no
 * <YEASTS> block -- import into other software and add the yeast there.
 */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fermentableCategory(category: string | undefined): string {
  switch (category) {
    case 'crystal':
      return 'Crystal';
    case 'roasted':
      return 'Roasted';
    case 'acidulated':
      return 'Acidulated';
    case 'wheatOrOther':
      return 'Grain';
    case 'base':
    default:
      return 'Grain';
  }
}

export function buildBeerXml(state: AppState, recipeName: string): string {
  const style = BJCP_STYLES.find((s) => s.id === state.bjcpStyleId) ?? BJCP_STYLES[0];
  const srm = state.grainBill.length > 0 ? calculateSrm(state.grainBill, state.batchVolumeL) : 0;
  const ibuResult = calculateIbu(state.hopAdditions, state.wortGravitySg, state.batchVolumeL, state.ibuFormula, state.garetzExtras);
  const abvPercent = calculateAbvAdvanced(state.ogSg, state.fgSg);

  const fermentablesXml = state.grainBill
    .filter((row) => row.weightKg > 0)
    .map(
      (row) => `      <FERMENTABLE>
        <NAME>${escapeXml(row.name || 'Unnamed Grain')}</NAME>
        <VERSION>1</VERSION>
        <TYPE>${escapeXml(fermentableCategory(row.category))}</TYPE>
        <AMOUNT>${(row.weightKg).toFixed(3)}</AMOUNT>
        <YIELD>${row.potentialSg && row.potentialSg > 1 ? (((row.potentialSg - 1) * 1000) / 3.85).toFixed(1) : '75.0'}</YIELD>
        <COLOR>${row.colorLovibond.toFixed(1)}</COLOR>
      </FERMENTABLE>`,
    )
    .join('\n');

  const hopsXml = state.hopAdditions
    .filter((hop) => hop.weightG > 0)
    .map(
      (hop) => `      <HOP>
        <NAME>${escapeXml(hop.name || 'Unnamed Hop')}</NAME>
        <VERSION>1</VERSION>
        <ALPHA>${hop.alphaAcidPercent.toFixed(1)}</ALPHA>
        <AMOUNT>${(hop.weightG / 1000).toFixed(4)}</AMOUNT>
        <USE>Boil</USE>
        <TIME>${hop.boilTimeMinutes}</TIME>
        <FORM>Pellet</FORM>
      </HOP>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>${escapeXml(recipeName)}</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <BREWER>Indian Brewer's Calculator</BREWER>
    <BATCH_SIZE>${state.batchVolumeL.toFixed(2)}</BATCH_SIZE>
    <BOIL_SIZE>${(state.garetzExtras.boilVolumeL > 0 ? state.garetzExtras.boilVolumeL : state.batchVolumeL).toFixed(2)}</BOIL_SIZE>
    <BOIL_TIME>60</BOIL_TIME>
    <EFFICIENCY>${state.assumedEfficiencyPercent.toFixed(1)}</EFFICIENCY>
    <OG>${state.ogSg.toFixed(3)}</OG>
    <FG>${state.fgSg.toFixed(3)}</FG>
    <EST_ABV>${abvPercent.toFixed(2)}</EST_ABV>
    <IBU>${ibuResult.totalIbu.toFixed(1)}</IBU>
    <COLOR>${srm.toFixed(1)}</COLOR>
    <STYLE>
      <NAME>${escapeXml(style.name)}</NAME>
      <VERSION>1</VERSION>
      <CATEGORY>${escapeXml(style.category)}</CATEGORY>
      <OG_MIN>${style.og.min.toFixed(3)}</OG_MIN>
      <OG_MAX>${style.og.max.toFixed(3)}</OG_MAX>
      <FG_MIN>${style.fg.min.toFixed(3)}</FG_MIN>
      <FG_MAX>${style.fg.max.toFixed(3)}</FG_MAX>
      <IBU_MIN>${style.ibu.min.toFixed(1)}</IBU_MIN>
      <IBU_MAX>${style.ibu.max.toFixed(1)}</IBU_MAX>
      <COLOR_MIN>${style.srm.min.toFixed(1)}</COLOR_MIN>
      <COLOR_MAX>${style.srm.max.toFixed(1)}</COLOR_MAX>
      <TYPE>Beer</TYPE>
    </STYLE>
    <FERMENTABLES>
${fermentablesXml || '      <!-- no fermentables entered -->'}
    </FERMENTABLES>
    <HOPS>
${hopsXml || '      <!-- no hop additions entered -->'}
    </HOPS>
    <NOTES>Exported from Indian Brewer's Calculator (ankurnapa.github.io/indian-brewing-calculator). IBU formula: ${state.ibuFormula}. Yeast strain not captured -- add separately.</NOTES>
  </RECIPE>
</RECIPES>
`;
}
