/**
 * Mash/wort transfer (pump & gravity flow) calculators.
 *
 * Simple, standard rate/time/volume relationships used for on-the-go
 * brewhouse timing: volume = flowRate * time. Exposed as separate
 * "solve for time" / "solve for flow rate" helpers so either can be the
 * known quantity.
 */

function safePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Minutes needed to transfer `volumeL` at a given flow rate (L/min). */
export function calculateTransferTimeMinutes(volumeL: number, flowRateLPerMin: number): number {
  const v = safePositive(volumeL, 0);
  const rate = safePositive(flowRateLPerMin, 0);
  if (v <= 0 || rate <= 0) return 0;
  return v / rate;
}

/** Flow rate (L/min) needed to transfer `volumeL` within `timeMinutes`. */
export function calculateRequiredFlowRate(volumeL: number, timeMinutes: number): number {
  const v = safePositive(volumeL, 0);
  const t = safePositive(timeMinutes, 0);
  if (v <= 0 || t <= 0) return 0;
  return v / t;
}

/** Volume (L) transferred after `timeMinutes` at a given flow rate (L/min). */
export function calculateVolumeTransferred(flowRateLPerMin: number, timeMinutes: number): number {
  const rate = Number.isFinite(flowRateLPerMin) && flowRateLPerMin >= 0 ? flowRateLPerMin : 0;
  const t = Number.isFinite(timeMinutes) && timeMinutes >= 0 ? timeMinutes : 0;
  return rate * t;
}
