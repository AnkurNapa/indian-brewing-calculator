import { AppState } from '@/hooks/useWaterProfile';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { calculateIbu, IBU_FORMULAS } from '@/lib/ibu';
import { calculateSrm } from '@/lib/srm';
import { calculateAbvAdvanced } from '@/lib/fermentation';
import { roundForDisplay } from '@/lib/units';
import { TranslationKey } from '@/i18n/translations';

/** Matches the `t()` shape from `useLanguage()` -- passed in since this module runs outside React. */
type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/**
 * Builds a clean, self-contained, print-ready HTML document for a
 * recipe -- opened in a new tab so the browser's native Print -> Save
 * as PDF produces a real PDF without adding a PDF-generation
 * dependency (jsPDF, etc.) to the app.
 */
export function buildRecipePrintHtml(recipeName: string, state: AppState, lockedAtMs: number | null, t: Translate): string {
  const style = BJCP_STYLES.find((s) => s.id === state.bjcpStyleId) ?? BJCP_STYLES[0];
  const formulaLabel = IBU_FORMULAS.find((f) => f.id === state.ibuFormula)?.label ?? 'Tinseth';
  const srm = state.grainBill.length > 0 ? calculateSrm(state.grainBill, state.batchVolumeL) : null;
  const ibuResult = calculateIbu(state.hopAdditions, state.wortGravitySg, state.batchVolumeL, state.ibuFormula, state.garetzExtras);
  const abvPercent = calculateAbvAdvanced(state.ogSg, state.fgSg);
  const htmlLang = t('recipes.print.htmlLang');

  const grainRows = state.grainBill
    .filter((row) => row.weightKg > 0)
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.name || t('recipes.print.unnamedGrain'))}</td><td>${row.weightKg} kg</td><td>${row.colorLovibond}°L</td><td>${row.potentialSg ?? '--'}</td></tr>`,
    )
    .join('');

  const hopRows = state.hopAdditions
    .filter((hop) => hop.weightG > 0)
    .map(
      (hop) =>
        `<tr><td>${escapeHtml(hop.name || t('recipes.print.unnamedHop'))}</td><td>${hop.weightG} g</td><td>${hop.alphaAcidPercent}%</td><td>${hop.boilTimeMinutes} min</td></tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="${htmlLang}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(recipeName)} -- ${escapeHtml(t('recipes.print.titleSuffix'))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #2b3137; max-width: 720px; margin: 0 auto; padding: 32px 24px; }
  h1 { font-size: 26px; margin: 0 0 4px; color: #36597f; }
  .meta { color: #667085; font-size: 13px; margin-bottom: 24px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.04em; color: #a35f1c; border-bottom: 2px solid #e2e6ea; padding-bottom: 4px; margin: 24px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e6ea; }
  th { color: #667085; font-weight: 600; font-size: 12px; text-transform: uppercase; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 8px 0; }
  .stat { border: 1px solid #e2e6ea; border-radius: 8px; padding: 10px 12px; }
  .stat .label { font-size: 11px; text-transform: uppercase; color: #667085; }
  .stat .value { font-size: 20px; font-weight: 700; color: #2b3137; }
  footer { margin-top: 32px; font-size: 11px; color: #667085; }
  @media print {
    body { padding: 0; }
    button { display: none; }
  }
</style>
</head>
<body>
  <button onclick="window.print()" style="margin-bottom:16px;padding:10px 16px;font-size:14px;border-radius:6px;border:none;background:#e08b2d;color:white;font-weight:600;cursor:pointer;">
    ${escapeHtml(t('recipes.print.button'))}
  </button>
  <h1>${escapeHtml(recipeName)}</h1>
  <p class="meta">
    ${lockedAtMs !== null ? escapeHtml(t('recipes.print.lockedAt', { date: new Date(lockedAtMs).toLocaleString() })) : ''}${escapeHtml(style.name)} &middot; ${escapeHtml(t('recipes.print.ibuFormula', { formula: formulaLabel }))}
  </p>

  <div class="stats">
    <div class="stat"><div class="label">OG</div><div class="value">${roundForDisplay(state.ogSg, 3)}</div></div>
    <div class="stat"><div class="label">FG</div><div class="value">${roundForDisplay(state.fgSg, 3)}</div></div>
    <div class="stat"><div class="label">ABV</div><div class="value">${roundForDisplay(abvPercent, 2)}%</div></div>
    <div class="stat"><div class="label">IBU</div><div class="value">${roundForDisplay(ibuResult.totalIbu, 1)}</div></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="label">${escapeHtml(t('recipes.print.batchVolume'))}</div><div class="value">${state.batchVolumeL} L</div></div>
    <div class="stat"><div class="label">${escapeHtml(t('recipes.print.color'))}</div><div class="value">${srm !== null ? `${roundForDisplay(srm, 1)} SRM` : '--'}</div></div>
    <div class="stat"><div class="label">${escapeHtml(t('recipes.print.efficiency'))}</div><div class="value">${state.assumedEfficiencyPercent}%</div></div>
    <div class="stat"><div class="label">${escapeHtml(t('recipes.print.sparge'))}</div><div class="value">${state.spargeVolumeL} L</div></div>
  </div>

  <h2>${escapeHtml(t('recipes.print.grainBillHeading'))}</h2>
  <table>
    <thead><tr><th>${escapeHtml(t('recipes.print.grainColHeader'))}</th><th>${escapeHtml(t('recipes.print.weightColHeader'))}</th><th>${escapeHtml(t('recipes.print.colorColHeader'))}</th><th>${escapeHtml(t('recipes.print.potentialColHeader'))}</th></tr></thead>
    <tbody>${grainRows || `<tr><td colspan="4">${escapeHtml(t('recipes.print.noGrains'))}</td></tr>`}</tbody>
  </table>

  <h2>${escapeHtml(t('recipes.print.hopScheduleHeading'))}</h2>
  <table>
    <thead><tr><th>${escapeHtml(t('recipes.print.hopColHeader'))}</th><th>${escapeHtml(t('recipes.print.weightColHeader'))}</th><th>${escapeHtml(t('recipes.print.alphaAcidColHeader'))}</th><th>${escapeHtml(t('recipes.print.boilTimeColHeader'))}</th></tr></thead>
    <tbody>${hopRows || `<tr><td colspan="4">${escapeHtml(t('recipes.print.noHops'))}</td></tr>`}</tbody>
  </table>

  <h2>${escapeHtml(t('recipes.print.sourceWaterHeading'))}</h2>
  <table>
    <thead><tr><th>Ca</th><th>Mg</th><th>Na</th><th>SO4</th><th>Cl</th><th>HCO3</th></tr></thead>
    <tbody><tr>
      <td>${state.sourceProfile.calcium}</td>
      <td>${state.sourceProfile.magnesium}</td>
      <td>${state.sourceProfile.sodium}</td>
      <td>${state.sourceProfile.sulfate}</td>
      <td>${state.sourceProfile.chloride}</td>
      <td>${state.sourceProfile.bicarbonate}</td>
    </tr></tbody>
  </table>

  <footer>${escapeHtml(t('recipes.print.footer'))}</footer>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
