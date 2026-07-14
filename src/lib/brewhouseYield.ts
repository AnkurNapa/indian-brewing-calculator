/**
 * Professional (commercial-scale) brewhouse yield & wort-production math,
 * from the standard German applied-brewing-math treatment of wort
 * production (Chapter 7). Everything is metric brewery units: hL
 * (hectoliters), dt (decitonnes = 100 kg), extract as a mass percentage.
 *
 * The chain, with the book's equation numbers:
 *   121  Specific main strike from extract:  W = E_CM(100 - E_FW)/E_FW
 *   122  ...inverted:                         E_FW = E_CM·100/(W + E_CM)
 *   123  Main strike volume:                  W_SV = M_GR · W(hL/dt)
 *   124  Total mash volume:                   V_Ma = W_SV + 0.7·M_GR
 *   125  Gross mash vessel:                   V_CV = V_Ma · (1.1 | 1.4)
 *   (30) Sparge volume from E_FW ratio:       W_SpV = W_SV · ratio(E_FW)
 *   126  Wort retained in spent grains:       W_SG = M_GR · 1.1
 *   127  Recoverable first wort:              V_FW = W_SV - W_SG
 *   128  Kettle-full wort:                    V_KF = (W_SV - W_SG) + W_SpV
 *   129  Brewhouse yield:                     Y_BH = V_HKW·E_C·ρ·0.96 / M_GR
 *   130  ...inverted (projected hot wort):    V_HKW = Y_BH·M_GR/(E_C·ρ·0.96)
 *   131/132 Total evaporation:                E_TE = V_KF - V_HKW; and %
 *   133/134 Spent grain:                      DM_SG = M_GR(100-Y_BH)/100; SG = DM_SG/0.2
 *   135  Total wort water:                    W_t = W_SV + W_SpV
 *
 * Original implementation from the published equations; every function is
 * checked against the book's worked examples (7.1-7.9) in the test file.
 */

const CONTRACTION_FACTOR = 0.96; // hot->20°C contraction + dilution factor (Eq 129/130)
const MASH_DISPLACEMENT_HL_PER_DT = 0.7; // 1 dt of mashed grist displaces ~0.7 hL (Eq 124)
const GRAIN_WORT_RETENTION_HL_PER_DT = 1.1; // spent grains retain ~1.1 hL per dt (Eq 126)
const SPENT_GRAIN_DRY_FRACTION = 0.2; // wet spent grain is ~80% water => 20% dry (Eq 134)

function safePositive(value: number, fallback = 0): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Stirring allowance for the gross mash vessel (Eq 125). */
export type StirringAllowance = 'modern' | 'older'; // +10% vortex-free modern, +40% older units
export type LauterSystem = 'lauterTun' | 'mashFilter';

/**
 * Eq 121 -- specific main strike quantity W, in kg water per 100 kg malt
 * (numerically equal to L per dt), from the malt's fine-meal extract
 * E_CM (%) and the desired first-wort concentration E_FW (%).
 *
 * Both must be positive and E_FW < E_CM (you cannot concentrate the first
 * wort above the malt's own extract); otherwise returns 0.
 */
export function specificMainStrikeKgPer100kg(eCmPercent: number, eFwPercent: number): number {
  const eCm = safePositive(eCmPercent, 0);
  const eFw = safePositive(eFwPercent, 0);
  if (eCm <= 0 || eFw <= 0 || eFw >= eCm) return 0;
  return (eCm * (100 - eFw)) / eFw;
}

/** Convert the specific strike (kg water/100 kg malt) to hL per dt: /100. */
export function specificStrikeToHlPerDt(kgPer100kg: number): number {
  return safePositive(kgPer100kg, 0) / 100;
}

/**
 * Eq 122 -- inverse of Eq 121: the first-wort concentration E_FW (%) that
 * results from a given specific strike W (kg water/100 kg malt) and malt
 * extract E_CM (%).
 */
export function firstWortConcentrationPercent(eCmPercent: number, specificStrikeKgPer100kg: number): number {
  const eCm = safePositive(eCmPercent, 0);
  const w = safePositive(specificStrikeKgPer100kg, 0);
  if (eCm <= 0 || w + eCm <= 0) return 0;
  return (eCm * 100) / (w + eCm);
}

/** Eq 123 -- main strike volume W_SV (hL) = grist (dt) × specific strike (hL/dt). */
export function mainStrikeVolumeHl(mgrDt: number, specificStrikeHlPerDt: number): number {
  return safePositive(mgrDt, 0) * safePositive(specificStrikeHlPerDt, 0);
}

/** Eq 124 -- total mash volume after mashing V_Ma (hL) = W_SV + 0.7·M_GR. */
export function totalMashVolumeHl(wSvHl: number, mgrDt: number): number {
  return safePositive(wSvHl, 0) + MASH_DISPLACEMENT_HL_PER_DT * safePositive(mgrDt, 0);
}

/** Eq 125 -- gross mash vessel volume V_CV (hL): +10% (modern) or +40% (older stirring units). */
export function grossVesselVolumeHl(vMaHl: number, stirring: StirringAllowance): number {
  const factor = stirring === 'older' ? 1.4 : 1.1;
  return safePositive(vMaHl, 0) * factor;
}

/**
 * Table 30 -- guideline W_SV : W_SpV ratio (sparge volume per unit of main
 * strike) as a function of the first-wort concentration E_FW (%), for
 * 12%-original-wort full beers in a lauter tun. Linearly interpolated
 * between the tabulated points, clamped at the ends.
 */
const SPARGE_RATIO_TABLE: [number, number][] = [
  [14, 0.7],
  [16, 1.0],
  [18, 1.2],
  [20, 1.5],
  [22, 1.9],
];

export function spargeRatioFromEfw(eFwPercent: number): number {
  const eFw = Number.isFinite(eFwPercent) ? eFwPercent : SPARGE_RATIO_TABLE[0][0];
  const table = SPARGE_RATIO_TABLE;
  if (eFw <= table[0][0]) return table[0][1];
  if (eFw >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i += 1) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (eFw >= x0 && eFw <= x1) {
      return y0 + ((y1 - y0) * (eFw - x0)) / (x1 - x0);
    }
  }
  return table[table.length - 1][1];
}

/** Sparge volume W_SpV (hL) = main strike volume × Table-30 ratio. */
export function spargeVolumeHl(wSvHl: number, ratio: number): number {
  return safePositive(wSvHl, 0) * safePositive(ratio, 0);
}

/** Eq 126 -- wort/water retained in the spent grains W_SG (hL) = M_GR × 1.1. */
export function retainedWortHl(mgrDt: number): number {
  return safePositive(mgrDt, 0) * GRAIN_WORT_RETENTION_HL_PER_DT;
}

/** Eq 127 -- recoverable first wort V_FW (hL) = W_SV − W_SG (clamped ≥ 0). */
export function firstWortVolumeHl(wSvHl: number, wSgHl: number): number {
  return Math.max(0, safePositive(wSvHl, 0) - safePositive(wSgHl, 0));
}

/** Eq 128 -- kettle-full wort V_KF (hL) = (W_SV − W_SG) + W_SpV. */
export function kettleFullWortHl(wSvHl: number, wSgHl: number, wSpvHl: number): number {
  return firstWortVolumeHl(wSvHl, wSgHl) + safePositive(wSpvHl, 0);
}

/**
 * Eq 129 -- brewhouse yield Y_BH (%) from the measured hot knockout wort:
 *   Y_BH = V_HKW[hL] · ρ[kg/L] · E_C[%] · 0.96 / M_GR[dt]
 * (extract mass captured, as a percentage of grist mass). E_C is the
 * knockout-wort extract measured at 20 °C; ρ is that wort's density.
 */
export function brewhouseYieldPercent(
  vHkwHl: number,
  eCPercent: number,
  rhoKgPerL: number,
  mgrDt: number,
  contraction: number = CONTRACTION_FACTOR,
): number {
  const mgr = safePositive(mgrDt, 0);
  if (mgr <= 0) return 0;
  return (safePositive(vHkwHl, 0) * safePositive(rhoKgPerL, 0) * safePositive(eCPercent, 0) * contraction) / mgr;
}

/**
 * Eq 130 -- projected hot knockout wort V_HKW (hL), inverting Eq 129 from
 * an expected brewhouse yield Y_BH (%).
 */
export function projectedHotWortHl(
  yBhPercent: number,
  mgrDt: number,
  eCPercent: number,
  rhoKgPerL: number,
  contraction: number = CONTRACTION_FACTOR,
): number {
  const denom = safePositive(eCPercent, 0) * safePositive(rhoKgPerL, 0) * contraction;
  if (denom <= 0) return 0;
  return (safePositive(yBhPercent, 0) * safePositive(mgrDt, 0)) / denom;
}

/**
 * Expected brewhouse yield from the malt's fine-flour (air-dried) yield
 * Y_ffm, per the book's guide values: a lauter tun loses ~1.0 percentage
 * point, a mash filter ~0.5.
 */
export function expectedBrewhouseYieldPercent(yFfmPercent: number, lauter: LauterSystem): number {
  const yFfm = safePositive(yFfmPercent, 0);
  return Math.max(0, yFfm - (lauter === 'mashFilter' ? 0.5 : 1.0));
}

export interface EvaporationResult {
  absoluteHl: number;
  percent: number;
  perHourPercent: number;
}

/**
 * Eq 131/132 -- total evaporation from kettle-full wort to hot knockout
 * wort: absolute (hL), relative to kettle-full (%), and per hour of boil.
 */
export function totalEvaporation(vKfHl: number, vHkwHl: number, boilHours: number): EvaporationResult {
  const vKf = safePositive(vKfHl, 0);
  const vHkw = safePositive(vHkwHl, 0);
  const absoluteHl = Math.max(0, vKf - vHkw);
  const percent = vKf > 0 ? (absoluteHl / vKf) * 100 : 0;
  const hours = safePositive(boilHours, 0);
  const perHourPercent = hours > 0 ? percent / hours : 0;
  return { absoluteHl, percent, perHourPercent };
}

export interface SpentGrainResult {
  /** Dry substance of spent grain, dt (Eq 133). */
  dryDt: number;
  /** Wet spent grain at ~80% water content, dt (Eq 134). */
  wetDt: number;
}

/** Eq 133/134 -- spent grain dry substance and wet (80%-water) quantity. */
export function spentGrain(mgrDt: number, yBhPercent: number): SpentGrainResult {
  const mgr = safePositive(mgrDt, 0);
  const yBh = Math.max(0, Math.min(100, Number.isFinite(yBhPercent) ? yBhPercent : 0));
  const dryDt = (mgr * (100 - yBh)) / 100;
  const wetDt = dryDt / SPENT_GRAIN_DRY_FRACTION;
  return { dryDt, wetDt };
}

/** Eq 135 -- total water for wort production W_t (hL) = W_SV + W_SpV. */
export function totalWortWaterHl(wSvHl: number, wSpvHl: number): number {
  return safePositive(wSvHl, 0) + safePositive(wSpvHl, 0);
}

export interface BrewhouseYieldInputs {
  mgrDt: number;
  eCmPercent: number; // malt fine-meal extract
  eFwPercent: number; // desired first-wort concentration
  yFfmPercent: number; // malt fine-flour yield (air-dried), for expected Y_BH
  lauter: LauterSystem;
  stirring: StirringAllowance;
  eCPercent: number; // knockout-wort extract at 20°C
  rhoKgPerL: number; // knockout-wort density at 20°C
  boilHours: number;
}

export interface BrewhouseYieldResult {
  specificStrikeKgPer100kg: number;
  specificStrikeHlPerDt: number;
  wSvHl: number;
  vMaHl: number;
  vCvHl: number;
  spargeRatio: number;
  wSpvHl: number;
  wSgHl: number;
  vFwHl: number;
  vKfHl: number;
  expectedYBhPercent: number;
  vHkwHl: number;
  evaporation: EvaporationResult;
  spentGrain: SpentGrainResult;
  wtHl: number;
}

/**
 * Run the whole chapter-7 chain from a single input set, so the panel can
 * show the full brew-day mass balance at once. Uses the *expected* yield
 * (from Y_ffm and lauter system) to project hot knockout wort, then the
 * evaporation and spent-grain figures that follow from it.
 */
export function computeBrewhouseYield(inputs: BrewhouseYieldInputs): BrewhouseYieldResult {
  const specificStrikeKgPer100kg = specificMainStrikeKgPer100kg(inputs.eCmPercent, inputs.eFwPercent);
  const specificStrikeHlPerDt = specificStrikeToHlPerDt(specificStrikeKgPer100kg);

  const wSvHl = mainStrikeVolumeHl(inputs.mgrDt, specificStrikeHlPerDt);
  const vMaHl = totalMashVolumeHl(wSvHl, inputs.mgrDt);
  const vCvHl = grossVesselVolumeHl(vMaHl, inputs.stirring);

  const spargeRatio = spargeRatioFromEfw(inputs.eFwPercent);
  const wSpvHl = spargeVolumeHl(wSvHl, spargeRatio);

  const wSgHl = retainedWortHl(inputs.mgrDt);
  const vFwHl = firstWortVolumeHl(wSvHl, wSgHl);
  const vKfHl = kettleFullWortHl(wSvHl, wSgHl, wSpvHl);

  const expectedYBhPercent = expectedBrewhouseYieldPercent(inputs.yFfmPercent, inputs.lauter);
  const vHkwHl = projectedHotWortHl(expectedYBhPercent, inputs.mgrDt, inputs.eCPercent, inputs.rhoKgPerL);

  const evaporation = totalEvaporation(vKfHl, vHkwHl, inputs.boilHours);
  const spentGrainResult = spentGrain(inputs.mgrDt, expectedYBhPercent);
  const wtHl = totalWortWaterHl(wSvHl, wSpvHl);

  return {
    specificStrikeKgPer100kg,
    specificStrikeHlPerDt,
    wSvHl,
    vMaHl,
    vCvHl,
    spargeRatio,
    wSpvHl,
    wSgHl,
    vFwHl,
    vKfHl,
    expectedYBhPercent,
    vHkwHl,
    evaporation,
    spentGrain: spentGrainResult,
    wtHl,
  };
}
