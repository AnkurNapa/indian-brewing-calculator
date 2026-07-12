/**
 * Beer color (SRM) calculator using the Morey equation -- the standard,
 * widely-published formula relating grain bill color contribution to
 * finished beer color, developed by Daniel Morey and commonly taught
 * alongside Tinseth's IBU formula in general brewing science. Original
 * implementation from the published formula, not sourced from any
 * proprietary tool.
 *
 *   MCU = sum(grainWeightLb * colorLovibond) / volumeGal
 *   SRM = 1.4922 * MCU^0.6859
 *
 * This app is metric-only elsewhere, so weights/volumes are accepted in
 * kg/L and converted internally to the lb/gal the published formula
 * uses; SRM itself has no metric equivalent and is reported as-is (the
 * universal brewing color scale).
 */

const KG_TO_LB = 2.20462;
const L_TO_GAL = 0.264172;

export interface SrmGrainItem {
  weightKg: number;
  colorLovibond: number;
}

function safeNonNegative(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

/**
 * Compute Malt Color Units (MCU) for a grain bill and batch volume.
 *
 * Edge case: zero/negative volume returns 0 rather than dividing by
 * zero.
 */
export function calculateMcu(grainBill: SrmGrainItem[], volumeL: number): number {
  const volumeGal = safeNonNegative(volumeL) * L_TO_GAL;
  if (volumeGal <= 0) return 0;

  const totalColorLb = grainBill.reduce((sum, item) => {
    const weightLb = safeNonNegative(item.weightKg) * KG_TO_LB;
    const color = safeNonNegative(item.colorLovibond);
    return sum + weightLb * color;
  }, 0);

  return totalColorLb / volumeGal;
}

/**
 * Compute SRM (Standard Reference Method) color from Malt Color Units
 * via the Morey equation. Most accurate for MCU values roughly under
 * ~50 (very dark/high-MCU grists increasingly underpredict actual
 * color per the well-documented limitation of the Morey equation at
 * extremes) -- still the standard planning-grade estimate used
 * throughout general brewing software and education.
 */
export function mcuToSrm(mcu: number): number {
  const safeMcu = safeNonNegative(mcu);
  if (safeMcu <= 0) return 0;
  return 1.4922 * safeMcu ** 0.6859;
}

/** Convenience: compute SRM directly from a grain bill and batch volume. */
export function calculateSrm(grainBill: SrmGrainItem[], volumeL: number): number {
  return mcuToSrm(calculateMcu(grainBill, volumeL));
}

/**
 * A small set of SRM reference points (straw to black), each an approximate
 * sRGB hex commonly used across homebrew color charts to represent that SRM
 * value when viewed through ~1 inch of beer. Interpolated linearly between
 * the nearest two points -- a visual approximation for a color swatch, not
 * a colorimetric conversion.
 */
const SRM_COLOR_STOPS: { srm: number; hex: [number, number, number] }[] = [
  { srm: 0, hex: [255, 230, 153] },
  { srm: 2, hex: [255, 216, 120] },
  { srm: 4, hex: [250, 190, 66] },
  { srm: 6, hex: [242, 162, 39] },
  { srm: 8, hex: [230, 135, 27] },
  { srm: 10, hex: [211, 112, 21] },
  { srm: 13, hex: [189, 94, 19] },
  { srm: 17, hex: [161, 74, 17] },
  { srm: 20, hex: [138, 60, 16] },
  { srm: 24, hex: [120, 48, 15] },
  { srm: 29, hex: [96, 36, 14] },
  { srm: 35, hex: [74, 27, 13] },
  { srm: 40, hex: [58, 20, 12] },
  { srm: 50, hex: [37, 14, 11] },
  { srm: 60, hex: [22, 10, 9] },
];

/** Approximate CSS hex color for a given SRM, for a visual color swatch. */
export function srmToApproxHex(srm: number): string {
  const safeSrm = Math.max(0, Number.isFinite(srm) ? srm : 0);
  const clamped = Math.min(safeSrm, SRM_COLOR_STOPS[SRM_COLOR_STOPS.length - 1].srm);

  let lower = SRM_COLOR_STOPS[0];
  let upper = SRM_COLOR_STOPS[SRM_COLOR_STOPS.length - 1];
  for (let i = 0; i < SRM_COLOR_STOPS.length - 1; i += 1) {
    if (clamped >= SRM_COLOR_STOPS[i].srm && clamped <= SRM_COLOR_STOPS[i + 1].srm) {
      lower = SRM_COLOR_STOPS[i];
      upper = SRM_COLOR_STOPS[i + 1];
      break;
    }
  }

  const range = upper.srm - lower.srm;
  const t = range > 0 ? (clamped - lower.srm) / range : 0;
  const [r, g, b] = lower.hex.map((channel, i) => Math.round(channel + (upper.hex[i] - channel) * t));
  return `rgb(${r}, ${g}, ${b})`;
}
