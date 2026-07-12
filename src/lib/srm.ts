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
