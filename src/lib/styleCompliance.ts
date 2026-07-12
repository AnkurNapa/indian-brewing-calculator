/**
 * Compares computed recipe vital statistics (OG, FG, IBU, SRM, ABV)
 * against a BJCP-style numeric range and reports per-parameter and
 * overall compliance.
 */

import { BjcpStyleRange, RangeMinMax } from './bjcpStyles';

export interface RecipeStats {
  og: number;
  fg: number;
  ibu: number;
  srm: number;
  abvPercent: number;
}

export interface ParameterCompliance {
  value: number;
  range: RangeMinMax;
  inRange: boolean;
}

export interface StyleComplianceResult {
  og: ParameterCompliance;
  fg: ParameterCompliance;
  ibu: ParameterCompliance;
  srm: ParameterCompliance;
  abvPercent: ParameterCompliance;
  /** True only if every parameter is within its style range. */
  fullyCompliant: boolean;
  /** Count of parameters within range, 0-5. */
  parametersInRange: number;
}

function evaluate(value: number, range: RangeMinMax): ParameterCompliance {
  const safeValue = Number.isFinite(value) ? value : 0;
  const inRange = safeValue >= range.min && safeValue <= range.max;
  return { value: safeValue, range, inRange };
}

/**
 * Check a recipe's computed stats against a BJCP style's numeric
 * ranges. Every field is evaluated independently so the UI can show
 * exactly which parameters are out of range, not just a pass/fail.
 */
export function checkStyleCompliance(stats: RecipeStats, style: BjcpStyleRange): StyleComplianceResult {
  const og = evaluate(stats.og, style.og);
  const fg = evaluate(stats.fg, style.fg);
  const ibu = evaluate(stats.ibu, style.ibu);
  const srm = evaluate(stats.srm, style.srm);
  const abvPercent = evaluate(stats.abvPercent, style.abvPercent);

  const parameterList = [og, fg, ibu, srm, abvPercent];
  const parametersInRange = parameterList.filter((p) => p.inRange).length;

  return {
    og,
    fg,
    ibu,
    srm,
    abvPercent,
    fullyCompliant: parametersInRange === parameterList.length,
    parametersInRange,
  };
}
