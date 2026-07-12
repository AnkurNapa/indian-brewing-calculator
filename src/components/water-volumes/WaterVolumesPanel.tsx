'use client';

import { useMemo, useState } from 'react';
import { GrainBillItem } from '@/lib/waterChemistry';
import { calculateWaterVolumes } from '@/lib/waterVolumes';
import { calculateVolumeToAddForTargetTemp } from '@/lib/waterTemperature';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { roundForDisplay } from '@/lib/units';

interface WaterVolumesPanelProps {
  grainBill: GrainBillItem[];
}

function StrikeTemperatureMixCalculator() {
  const [startVolumeL, setStartVolumeL] = useState(50);
  const [startTempC, setStartTempC] = useState(40);
  const [targetTempC, setTargetTempC] = useState(60);
  const [additionTempC, setAdditionTempC] = useState(100);

  const result = calculateVolumeToAddForTargetTemp(startVolumeL, startTempC, targetTempC, additionTempC);

  return (
    <section className="flex flex-col gap-4 rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
        Water Temperature Mixing
      </h3>
      <p className="font-body text-sm text-ink">
        How much hot (or cold) water to add to reach a target temperature -- e.g. raising strike/sparge water, or
        cooling wort with cold water additions.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Starting Volume" unit="L" value={startVolumeL} step={1} onChange={setStartVolumeL} />
        <NumberField label="Starting Temp" unit="°C" value={startTempC} step={1} onChange={setStartTempC} allowNegative />
        <NumberField label="Target Temp" unit="°C" value={targetTempC} step={1} onChange={setTargetTempC} allowNegative />
        <NumberField
          label="Addition Water Temp"
          unit="°C"
          value={additionTempC}
          step={1}
          onChange={setAdditionTempC}
          allowNegative
          helperText="e.g. 100°C for boiling water, or cold tap/ice water to cool down."
        />
      </div>
      <ResultCard
        title="Water To Add"
        value={result.infeasible ? '--' : roundForDisplay(result.volumeToAddL, 1).toString()}
        unit="L"
        tone={result.infeasible ? 'warning' : 'default'}
      >
        {result.infeasible
          ? result.notes.join(' ')
          : `Resulting total volume: ${roundForDisplay(result.totalVolumeL, 1)} L at ${targetTempC}°C.`}
      </ResultCard>
    </section>
  );
}

export function WaterVolumesPanel({ grainBill }: WaterVolumesPanelProps) {
  const totalGrainWeightKg = useMemo(
    () => grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? Math.max(0, row.weightKg) : 0), 0),
    [grainBill],
  );

  const [targetFinalVolumeL, setTargetFinalVolumeL] = useState(20);
  const [mashThicknessLPerKg, setMashThicknessLPerKg] = useState(3.0);
  const [grainAbsorptionLPerKg, setGrainAbsorptionLPerKg] = useState(1.04);
  const [boilTimeMinutes, setBoilTimeMinutes] = useState(60);
  const [boilOffRateLPerHour, setBoilOffRateLPerHour] = useState(4);
  const [postBoilLossL, setPostBoilLossL] = useState(1.5);

  const result = calculateWaterVolumes({
    grainWeightKg: totalGrainWeightKg,
    targetFinalVolumeL,
    mashThicknessLPerKg,
    grainAbsorptionLPerKg,
    boilTimeMinutes,
    boilOffRateLPerHour,
    postBoilLossL,
  });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Mash / Sparge Water Volumes</h2>
      <p className="font-body text-sm text-amber-800">
        Using grist weight from the Grain Bill tab: <span className="font-semibold">{totalGrainWeightKg.toFixed(2)} kg</span>
      </p>

      <TutorialCallout
        title="How to use Water Volumes"
        steps={[
          {
            lead: '1. Add grain first.',
            body: 'Grist weight comes from the Water Report tab\'s Grain Bill -- add your grains there so Mash Water and Sparge Water below aren\'t zero.',
          },
          {
            lead: '2. Set your target final volume.',
            body: 'How much you want in the fermenter after the boil -- everything else works backward from this number.',
          },
          {
            lead: '3. Calibrate to your system.',
            body: 'Boil-off rate and post-boil/trub loss vary a lot by kettle and burner -- adjust these to match your actual equipment for accurate numbers.',
          },
          {
            lead: '4. Use Water Temperature Mixing separately.',
            body: 'The card below answers a different question: how much hot or cold water to add to hit a target temperature, for heating strike water or cooling wort.',
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Target Final Volume"
          unit="L"
          value={targetFinalVolumeL}
          step={1}
          onChange={setTargetFinalVolumeL}
          helperText="Volume you want in the fermenter after the boil."
        />
        <NumberField
          label="Mash Thickness"
          unit="L/kg"
          value={mashThicknessLPerKg}
          step={0.1}
          onChange={setMashThicknessLPerKg}
          helperText="Typical: 2.5-3.5 L/kg."
        />
        <NumberField
          label="Grain Absorption Rate"
          unit="L/kg"
          value={grainAbsorptionLPerKg}
          step={0.01}
          onChange={setGrainAbsorptionLPerKg}
          helperText="Water retained by spent grain. Typical: 1.0-1.1 L/kg."
        />
        <NumberField
          label="Boil Time"
          unit="min"
          value={boilTimeMinutes}
          step={5}
          onChange={setBoilTimeMinutes}
        />
        <NumberField
          label="Boil-Off Rate"
          unit="L/hr"
          value={boilOffRateLPerHour}
          step={0.5}
          onChange={setBoilOffRateLPerHour}
          helperText="Calibrate to your kettle/burner for accuracy."
        />
        <NumberField
          label="Post-Boil / Trub Loss"
          unit="L"
          value={postBoilLossL}
          step={0.5}
          onChange={setPostBoilLossL}
          helperText="Kettle deadspace, chiller, hose loss after the boil."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResultCard title="Mash Water" value={roundForDisplay(result.mashWaterL, 1).toString()} unit="L" />
        <ResultCard
          title="Sparge Water"
          value={roundForDisplay(result.spargeWaterL, 1).toString()}
          unit="L"
          tone={result.spargeVolumeClamped ? 'warning' : 'default'}
        />
        <ResultCard title="Pre-Boil Volume" value={roundForDisplay(result.preBoilVolumeL, 1).toString()} unit="L" />
        <ResultCard title="Total Water Needed" value={roundForDisplay(result.totalWaterL, 1).toString()} unit="L" />
      </div>

      {result.notes.length > 0 ? (
        <ul className="flex flex-col gap-1 text-xs text-amber-800">
          {result.notes.map((note, i) => (
            <li key={i}>* {note}</li>
          ))}
        </ul>
      ) : null}

      <StrikeTemperatureMixCalculator />
    </section>
  );
}
