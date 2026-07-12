'use client';

import { useState } from 'react';
import {
  calculateAbvSimple,
  calculateAbvAdvanced,
  calculateAttenuation,
  correctHydrometerReading,
} from '@/lib/fermentation';
import { calculateBrewhouseEfficiency, pointsToSg, GrainPotentialItem } from '@/lib/efficiency';
import { calculatePrimingDose, PRIMING_SUGARS } from '@/lib/priming';
import { calculatePitchRate, YeastStyle } from '@/lib/pitchRate';
import { calculateIbu, HopAddition } from '@/lib/ibu';
import { NumberField } from '@/components/ui/NumberField';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';
import { roundForDisplay } from '@/lib/units';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{title}</h3>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function AbvAttenuationCalculator() {
  const [og, setOg] = useState(1.05);
  const [fg, setFg] = useState(1.01);

  const abvSimple = calculateAbvSimple(og, fg);
  const abvAdvanced = calculateAbvAdvanced(og, fg);
  const attenuation = calculateAttenuation(og, fg);

  return (
    <SectionCard title="OG / FG - ABV & Attenuation">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Original Gravity (SG)" value={og} step={0.001} onChange={setOg} allowNegative={false} />
        <NumberField label="Final Gravity (SG)" value={fg} step={0.001} onChange={setFg} allowNegative={false} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResultCard title="ABV (Simple)" value={roundForDisplay(abvSimple, 2).toString()} unit="%" />
        <ResultCard title="ABV (Advanced)" value={roundForDisplay(abvAdvanced, 2).toString()} unit="%" />
        <ResultCard
          title="Apparent Attenuation"
          value={roundForDisplay(attenuation.apparentAttenuationPercent, 1).toString()}
          unit="%"
        />
        <ResultCard
          title="Real Attenuation"
          value={roundForDisplay(attenuation.realAttenuationPercent, 1).toString()}
          unit="%"
        />
      </div>
    </SectionCard>
  );
}

function HydrometerCorrectionCalculator() {
  const [measuredSg, setMeasuredSg] = useState(1.05);
  const [sampleTempC, setSampleTempC] = useState(25);
  const [calibrationTempC, setCalibrationTempC] = useState(20);

  const corrected = correctHydrometerReading(measuredSg, sampleTempC, calibrationTempC);

  return (
    <SectionCard title="Hydrometer Temperature Correction">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label="Measured SG" value={measuredSg} step={0.001} onChange={setMeasuredSg} />
        <NumberField label="Sample Temp" unit="°C" value={sampleTempC} step={1} onChange={setSampleTempC} allowNegative />
        <NumberField
          label="Calibration Temp"
          unit="°C"
          value={calibrationTempC}
          step={1}
          onChange={setCalibrationTempC}
        />
      </div>
      <ResultCard title="Corrected SG" value={roundForDisplay(corrected, 4).toString()} />
    </SectionCard>
  );
}

function EfficiencyCalculator() {
  const [grainBill, setGrainBill] = useState<GrainPotentialItem[]>([
    { name: 'Pale Malt', weightKg: 5, potentialSg: 1.037 },
  ]);
  const [actualMeasuredSg, setActualMeasuredSg] = useState(1.045);
  const [measuredVolumeL, setMeasuredVolumeL] = useState(20);

  const result = calculateBrewhouseEfficiency(grainBill, actualMeasuredSg, measuredVolumeL);

  const updateRow = (index: number, patch: Partial<GrainPotentialItem>) => {
    setGrainBill(grainBill.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <SectionCard title="Brewhouse / Mash Efficiency">
      <div className="flex flex-col gap-2">
        {grainBill.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Grain" value={row.name} onChange={(value) => updateRow(index, { name: value })} />
            <NumberField
              label="Weight"
              unit="kg"
              value={row.weightKg}
              step={0.1}
              onChange={(value) => updateRow(index, { weightKg: value })}
            />
            <NumberField
              label="Potential SG"
              value={row.potentialSg}
              step={0.001}
              onChange={(value) => updateRow(index, { potentialSg: value })}
              helperText="Maltster spec, typically 1.030-1.038."
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setGrainBill([...grainBill, { name: '', weightKg: 0, potentialSg: 1.037 }])}
          className="min-h-[44px] self-start rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
        >
          + Add Grain
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Actual Measured SG"
          value={actualMeasuredSg}
          step={0.001}
          onChange={setActualMeasuredSg}
        />
        <NumberField label="Measured At Volume" unit="L" value={measuredVolumeL} step={1} onChange={setMeasuredVolumeL} />
      </div>
      <ResultCard title="Brewhouse Efficiency" value={roundForDisplay(result.efficiencyPercent, 1).toString()} unit="%">
        Max theoretical: {roundForDisplay(pointsToSg(result.maxTheoreticalPoints), 4)} SG at this volume.
      </ResultCard>
    </SectionCard>
  );
}

function PrimingCalculator() {
  const [targetCo2Volumes, setTargetCo2Volumes] = useState(2.4);
  const [temperatureC, setTemperatureC] = useState(20);
  const [batchVolumeL, setBatchVolumeL] = useState(20);
  const [sugarId, setSugarId] = useState(PRIMING_SUGARS[0].id);

  const sugar = PRIMING_SUGARS.find((s) => s.id === sugarId) ?? PRIMING_SUGARS[0];
  const result = calculatePrimingDose(targetCo2Volumes, temperatureC, batchVolumeL, sugar);

  return (
    <SectionCard title="Priming Sugar / Carbonation">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Target CO2"
          unit="volumes"
          value={targetCo2Volumes}
          step={0.1}
          onChange={setTargetCo2Volumes}
        />
        <NumberField
          label="Conditioning Temp"
          unit="°C"
          value={temperatureC}
          step={1}
          onChange={setTemperatureC}
        />
        <NumberField label="Batch Volume" unit="L" value={batchVolumeL} step={1} onChange={setBatchVolumeL} />
        <label className="flex flex-col gap-1">
          <span className="font-body text-sm font-medium text-amber-900">Priming Sugar</span>
          <select
            className="min-h-[44px] rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink"
            value={sugarId}
            onChange={(e) => setSugarId(e.target.value)}
          >
            {PRIMING_SUGARS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ResultCard
        title="Priming Sugar Needed"
        value={result.alreadyAtTarget ? '0' : roundForDisplay(result.primingSugarGrams, 1).toString()}
        unit="g"
      >
        Residual CO2 at {temperatureC}°C: {roundForDisplay(result.residualCo2Volumes, 2)} volumes.
      </ResultCard>
    </SectionCard>
  );
}

function PitchRateCalculator() {
  const [og, setOg] = useState(1.05);
  const [batchVolumeL, setBatchVolumeL] = useState(20);
  const [style, setStyle] = useState<YeastStyle>('ale');

  const result = calculatePitchRate(og, batchVolumeL, style);

  return (
    <SectionCard title="Yeast Pitch Rate">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label="Original Gravity (SG)" value={og} step={0.001} onChange={setOg} />
        <NumberField label="Batch Volume" unit="L" value={batchVolumeL} step={1} onChange={setBatchVolumeL} />
        <label className="flex flex-col gap-1">
          <span className="font-body text-sm font-medium text-amber-900">Style</span>
          <select
            className="min-h-[44px] rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink"
            value={style}
            onChange={(e) => setStyle(e.target.value as YeastStyle)}
          >
            <option value="ale">Ale</option>
            <option value="lager">Lager</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard title="Target Cells" value={roundForDisplay(result.targetCellsBillion, 0).toString()} unit="billion" />
        <ResultCard title="Dry Yeast" value={roundForDisplay(result.dryYeastGrams, 1).toString()} unit="g" />
        <ResultCard title="Liquid Slurry" value={roundForDisplay(result.slurryMl, 0).toString()} unit="mL" />
      </div>
    </SectionCard>
  );
}

function IbuCalculator() {
  const [wortGravity, setWortGravity] = useState(1.05);
  const [batchVolumeL, setBatchVolumeL] = useState(20);
  const [hopAdditions, setHopAdditions] = useState<HopAddition[]>([
    { name: 'Bittering Hop', alphaAcidPercent: 12, weightG: 20, boilTimeMinutes: 60 },
  ]);

  const result = calculateIbu(hopAdditions, wortGravity, batchVolumeL);

  const updateRow = (index: number, patch: Partial<HopAddition>) => {
    setHopAdditions(hopAdditions.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <SectionCard title="IBU (Tinseth)">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Wort Gravity (SG)" value={wortGravity} step={0.001} onChange={setWortGravity} />
        <NumberField label="Batch Volume" unit="L" value={batchVolumeL} step={1} onChange={setBatchVolumeL} />
      </div>
      <div className="flex flex-col gap-2">
        {hopAdditions.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Input label="Hop" value={row.name} onChange={(value) => updateRow(index, { name: value })} />
            <NumberField
              label="Alpha Acid"
              unit="%"
              value={row.alphaAcidPercent}
              step={0.1}
              onChange={(value) => updateRow(index, { alphaAcidPercent: value })}
            />
            <NumberField
              label="Weight"
              unit="g"
              value={row.weightG}
              step={1}
              onChange={(value) => updateRow(index, { weightG: value })}
            />
            <NumberField
              label="Boil Time"
              unit="min"
              value={row.boilTimeMinutes}
              step={1}
              onChange={(value) => updateRow(index, { boilTimeMinutes: value })}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setHopAdditions([...hopAdditions, { name: '', alphaAcidPercent: 0, weightG: 0, boilTimeMinutes: 0 }])
          }
          className="min-h-[44px] self-start rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
        >
          + Add Hop
        </button>
      </div>
      <ResultCard title="Total IBU" value={roundForDisplay(result.totalIbu, 1).toString()} />
    </SectionCard>
  );
}

export function BrewhouseCalculatorsPanel() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Brewhouse Calculators</h2>
      <p className="font-body text-sm text-amber-800">
        Day-to-day production math: gravity/ABV, efficiency, carbonation, pitch rate, and bitterness.
      </p>
      <AbvAttenuationCalculator />
      <HydrometerCorrectionCalculator />
      <EfficiencyCalculator />
      <PrimingCalculator />
      <PitchRateCalculator />
      <IbuCalculator />
    </section>
  );
}
