import { describe, it, expect } from 'vitest';
import {
  specificMainStrikeKgPer100kg,
  specificStrikeToHlPerDt,
  firstWortConcentrationPercent,
  mainStrikeVolumeHl,
  totalMashVolumeHl,
  grossVesselVolumeHl,
  spargeRatioFromEfw,
  spargeVolumeHl,
  retainedWortHl,
  firstWortVolumeHl,
  kettleFullWortHl,
  brewhouseYieldPercent,
  projectedHotWortHl,
  expectedBrewhouseYieldPercent,
  totalEvaporation,
  spentGrain,
  totalWortWaterHl,
  computeBrewhouseYield,
} from '@/lib/brewhouseYield';

describe('specific main strike (Eq 121/122) -- book Example 7.1', () => {
  it('W = E_CM(100-E_FW)/E_FW = 77(100-18)/18 = 350.8 kg/100kg (~3.5 hL/dt)', () => {
    const w = specificMainStrikeKgPer100kg(77, 18);
    expect(w).toBeCloseTo(350.78, 1);
    expect(specificStrikeToHlPerDt(w)).toBeCloseTo(3.5, 1);
  });

  it('inverts back to E_FW = 18%', () => {
    expect(firstWortConcentrationPercent(77, 350.78)).toBeCloseTo(18, 1);
  });

  it('returns 0 when E_FW >= E_CM (cannot concentrate above the malt extract)', () => {
    expect(specificMainStrikeKgPer100kg(77, 80)).toBe(0);
  });
});

describe('mash & vessel volumes (Eq 123/124/125) -- book Examples 7.2', () => {
  it('W_SV = 50 dt × 3.5 hL/dt = 175 hL', () => {
    expect(mainStrikeVolumeHl(50, 3.5)).toBeCloseTo(175, 5);
  });
  it('V_Ma = 175 + 0.7×50 = 210 hL', () => {
    expect(totalMashVolumeHl(175, 50)).toBeCloseTo(210, 5);
  });
  it('V_CV = 210 × 1.1 (modern) = 231 hL; older = 294 hL', () => {
    expect(grossVesselVolumeHl(210, 'modern')).toBeCloseTo(231, 5);
    expect(grossVesselVolumeHl(210, 'older')).toBeCloseTo(294, 5);
  });
});

describe('sparge volume (Table 30) -- book Example 7.3', () => {
  it('E_FW 18% -> ratio 1.2 -> W_SpV = 175 × 1.2 = 210 hL', () => {
    expect(spargeRatioFromEfw(18)).toBeCloseTo(1.2, 5);
    expect(spargeVolumeHl(175, 1.2)).toBeCloseTo(210, 5);
  });
  it('interpolates between tabulated points and clamps the ends', () => {
    expect(spargeRatioFromEfw(15)).toBeCloseTo(0.85, 5); // midpoint of 0.7 and 1.0
    expect(spargeRatioFromEfw(10)).toBeCloseTo(0.7, 5); // clamp low
    expect(spargeRatioFromEfw(25)).toBeCloseTo(1.9, 5); // clamp high
  });
});

describe('first wort & kettle-full wort (Eq 126/127/128) -- book Example 7.4', () => {
  it('W_SG = 50 × 1.1 = 55 hL; V_KF = (175-55) + 210 = 330 hL', () => {
    expect(retainedWortHl(50)).toBeCloseTo(55, 5);
    expect(firstWortVolumeHl(175, 55)).toBeCloseTo(120, 5);
    expect(kettleFullWortHl(175, 55, 210)).toBeCloseTo(330, 5);
  });
});

describe('brewhouse yield (Eq 129/130) -- book Examples 7.5 & 7.6', () => {
  it('Y_BH = 485 hL × 1.04646 × 12% × 0.96 / 75 dt ≈ 78%', () => {
    expect(brewhouseYieldPercent(485, 12, 1.04646, 75)).toBeCloseTo(77.96, 1);
  });
  it('projected V_HKW = 76 × 50 / (12 × 1.04646 × 0.96) ≈ 315 hL', () => {
    expect(projectedHotWortHl(76, 50, 12, 1.04646)).toBeCloseTo(315, 0);
  });
  it('expected Y_BH from Y_ffm 77%: lauter tun -> 76%, mash filter -> 76.5%', () => {
    expect(expectedBrewhouseYieldPercent(77, 'lauterTun')).toBeCloseTo(76, 5);
    expect(expectedBrewhouseYieldPercent(77, 'mashFilter')).toBeCloseTo(76.5, 5);
  });
});

describe('evaporation (Eq 131/132) -- book Example 7.7', () => {
  it('E_TE = 330 - 315 = 15 hL = 4.5% over 1.5 h = 3%/h', () => {
    const e = totalEvaporation(330, 315, 1.5);
    expect(e.absoluteHl).toBeCloseTo(15, 5);
    expect(e.percent).toBeCloseTo(4.5, 1);
    expect(e.perHourPercent).toBeCloseTo(3, 1);
  });
});

describe('spent grain (Eq 133/134) -- book Example 7.8', () => {
  it('DM_SG = 50(100-76)/100 = 12 dt dry; wet = 12/0.2 = 60 dt', () => {
    const sg = spentGrain(50, 76);
    expect(sg.dryDt).toBeCloseTo(12, 5);
    expect(sg.wetDt).toBeCloseTo(60, 5);
  });
});

describe('total wort water (Eq 135) -- book Example 7.9', () => {
  it('W_t = 175 + 210 = 385 hL', () => {
    expect(totalWortWaterHl(175, 210)).toBeCloseTo(385, 5);
  });
});

describe('computeBrewhouseYield -- full chain reproduces the book examples end to end', () => {
  it('reproduces the 50 dt worked example (full precision; book rounds intermediates)', () => {
    const r = computeBrewhouseYield({
      mgrDt: 50,
      eCmPercent: 77,
      eFwPercent: 18,
      yFfmPercent: 77,
      lauter: 'lauterTun',
      stirring: 'modern',
      eCPercent: 12,
      rhoKgPerL: 1.04646,
      boilHours: 1.5,
    });
    // The chain uses the unrounded specific strike 3.50778 hL/dt (the book
    // rounds to 3.5), so volumes are ~0.4-0.9 hL above the book's rounded
    // figures -- correct, just more precise. Each figure is asserted within
    // that intermediate-rounding drift of the book value.
    expect(r.wSvHl).toBeCloseTo(175.4, 1); // book 175
    expect(r.vMaHl).toBeCloseTo(210.4, 1); // book 210
    expect(r.vCvHl).toBeCloseTo(231.4, 1); // book 231
    expect(r.wSpvHl).toBeCloseTo(210.5, 1); // book 210
    expect(r.vKfHl).toBeCloseTo(330.9, 1); // book 330
    expect(r.expectedYBhPercent).toBeCloseTo(76, 5);
    expect(r.vHkwHl).toBeCloseTo(315.2, 1); // book 315
    expect(r.evaporation.absoluteHl).toBeCloseTo(15.6, 1); // book 15
    expect(r.spentGrain.wetDt).toBeCloseTo(60, 5);
    expect(r.wtHl).toBeCloseTo(385.9, 1); // book 385
  });
});
