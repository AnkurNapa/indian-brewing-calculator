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
import { calculateForceCarbonationPressure } from '@/lib/forceCarbonation';
import { calculatePitchRate, calculateRepitchSlurryVolume, YeastStyle } from '@/lib/pitchRate';
import { calculateIbu, calculateHopWeightForTargetIbu, calculateDryHopWeight, HopAddition } from '@/lib/ibu';
import { calculateSrm, srmToApproxHex } from '@/lib/srm';
import { GrainBillItem } from '@/lib/waterChemistry';
import { NumberField } from '@/components/ui/NumberField';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { HOP_VARIETIES } from '@/lib/hopVarieties';
import { YEAST_STRAINS } from '@/lib/yeastStrains';
import { roundForDisplay } from '@/lib/units';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{title}</h3>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </div>
  );
}

interface SharedRecipeProps {
  og: number;
  onOgChange: (value: number) => void;
  fg: number;
  onFgChange: (value: number) => void;
  batchVolumeL: number;
  onBatchVolumeChange: (value: number) => void;
  grainBill: GrainBillItem[];
  wortGravitySg: number;
  onWortGravityChange: (value: number) => void;
  hopAdditions: HopAddition[];
  onHopAdditionsChange: (hops: HopAddition[]) => void;
}

function AbvAttenuationCalculator({ og, onOgChange, fg, onFgChange }: Pick<SharedRecipeProps, 'og' | 'onOgChange' | 'fg' | 'onFgChange'>) {
  const abvSimple = calculateAbvSimple(og, fg);
  const abvAdvanced = calculateAbvAdvanced(og, fg);
  const attenuation = calculateAttenuation(og, fg);

  return (
    <SectionCard title="OG / FG - ABV & Attenuation">
      <p className="-mt-2 font-body text-xs text-ink/60">Shared with Pitch Rate and BJCP Style Check.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Original Gravity (SG)" value={og} step={0.001} onChange={onOgChange} allowNegative={false} />
        <NumberField label="Final Gravity (SG)" value={fg} step={0.001} onChange={onFgChange} allowNegative={false} />
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

function ForceCarbonationCalculator() {
  const [targetCo2Volumes, setTargetCo2Volumes] = useState(2.6);
  const [temperatureC, setTemperatureC] = useState(4);

  const result = calculateForceCarbonationPressure(targetCo2Volumes, temperatureC);

  return (
    <SectionCard title="Force Carbonation (CO2 Tank Pressure)">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Target CO2"
          unit="volumes"
          value={targetCo2Volumes}
          step={0.1}
          onChange={setTargetCo2Volumes}
        />
        <NumberField label="Tank / Beer Temp" unit="°C" value={temperatureC} step={0.5} onChange={setTemperatureC} allowNegative />
      </div>
      <ResultCard title="Regulator Pressure" value={roundForDisplay(result.pressurePsi, 1).toString()} unit="psi">
        <p>≈ {roundForDisplay(result.pressureBar, 2)} bar.</p>
        <p className="mt-1 text-amber-800">
          Approximate -- cross-check against a physical carbonation chart or your regulator vendor&apos;s chart
          before setting tank pressure.
        </p>
      </ResultCard>
    </SectionCard>
  );
}

function PrimingCalculator({ batchVolumeL, onBatchVolumeChange }: Pick<SharedRecipeProps, 'batchVolumeL' | 'onBatchVolumeChange'>) {
  const [targetCo2Volumes, setTargetCo2Volumes] = useState(2.4);
  const [temperatureC, setTemperatureC] = useState(20);
  const [sugarId, setSugarId] = useState(PRIMING_SUGARS[0].id);

  const sugar = PRIMING_SUGARS.find((s) => s.id === sugarId) ?? PRIMING_SUGARS[0];
  const result = calculatePrimingDose(targetCo2Volumes, temperatureC, batchVolumeL, sugar);

  return (
    <SectionCard title="Priming Sugar (Bottle Conditioning)">
      <p className="-mt-2 font-body text-xs text-ink/60">Batch volume is shared across every calculator below.</p>
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
        <NumberField label="Batch Volume" unit="L" value={batchVolumeL} step={1} onChange={onBatchVolumeChange} />
        <SearchableSelect
          label="Priming Sugar"
          value={sugarId}
          onChange={setSugarId}
          options={PRIMING_SUGARS.map((s) => ({ id: s.id, label: s.name }))}
        />
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

function PitchRateCalculator({ og, onOgChange, batchVolumeL, onBatchVolumeChange }: Pick<SharedRecipeProps, 'og' | 'onOgChange' | 'batchVolumeL' | 'onBatchVolumeChange'>) {
  const [style, setStyle] = useState<YeastStyle>('ale');
  const [strainName, setStrainName] = useState('');

  const result = calculatePitchRate(og, batchVolumeL, style);

  const [slurryDensity, setSlurryDensity] = useState(1.2);
  const [viabilityPercent, setViabilityPercent] = useState(85);
  const repitch = calculateRepitchSlurryVolume(result.targetCellsBillion, slurryDensity, viabilityPercent);

  return (
    <SectionCard title="Yeast Pitch Rate">
      <SearchableSelect
        label="Quick-fill from common yeast strains (optional)"
        placeholder="Search yeast strains..."
        value={YEAST_STRAINS.find((s) => s.name === strainName)?.id ?? ''}
        options={YEAST_STRAINS.map((strain) => ({ id: strain.id, label: strain.name }))}
        onChange={(id) => {
          const strain = YEAST_STRAINS.find((s) => s.id === id);
          if (strain) {
            setStrainName(strain.name);
            setStyle(strain.style);
          }
        }}
      />
      <p className="-mt-2 font-body text-xs text-ink/50">
        Not in the list? Just type any strain name below and pick Ale or Lager.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Strain (optional)"
          value={strainName}
          onChange={setStrainName}
          placeholder="e.g. US-05, WLP001..."
        />
        <SearchableSelect
          label="Style"
          value={style}
          onChange={(id) => setStyle(id as YeastStyle)}
          options={[
            { id: 'ale', label: 'Ale' },
            { id: 'lager', label: 'Lager' },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Original Gravity (SG)" value={og} step={0.001} onChange={onOgChange} />
        <NumberField label="Batch Volume" unit="L" value={batchVolumeL} step={1} onChange={onBatchVolumeChange} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard title="Target Cells" value={roundForDisplay(result.targetCellsBillion, 0).toString()} unit="billion" />
        <ResultCard title="Dry Yeast" value={roundForDisplay(result.dryYeastGrams, 1).toString()} unit="g" />
        <ResultCard title="Fresh Liquid Slurry" value={roundForDisplay(result.slurryMl, 0).toString()} unit="mL" />
      </div>

      <div className="rounded-md border border-teal-300 bg-teal-100/40 p-3">
        <h4 className="font-body text-sm font-semibold text-teal-900">Repitching From Cropped/Cone-Harvested Slurry</h4>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Harvested Slurry Density"
            unit="billion/mL"
            value={slurryDensity}
            step={0.1}
            onChange={setSlurryDensity}
            helperText="Measure with a hemocytometer/cell counter if possible."
          />
          <NumberField
            label="Viability"
            unit="%"
            value={viabilityPercent}
            step={1}
            max={100}
            onChange={setViabilityPercent}
            helperText="Cropped slurry is rarely 100% viable -- check with methylene blue staining."
          />
        </div>
        <p className="mt-2 font-body text-sm text-ink">
          Use approximately{' '}
          <span className="font-semibold">{roundForDisplay(repitch.slurryMlNeeded, 0)} mL</span> of this harvested
          slurry to deliver the target cell count above.
        </p>
      </div>
    </SectionCard>
  );
}

function HopWeightForTargetIbuCalculator({ wortGravity, batchVolumeL }: { wortGravity: number; batchVolumeL: number }) {
  const [targetIbu, setTargetIbu] = useState(40);
  const [alphaAcidPercent, setAlphaAcidPercent] = useState(12);
  const [boilTimeMinutes, setBoilTimeMinutes] = useState(60);

  const grams = calculateHopWeightForTargetIbu(targetIbu, alphaAcidPercent, boilTimeMinutes, wortGravity, batchVolumeL);

  return (
    <div className="rounded-md border border-teal-300 bg-teal-100/40 p-3">
      <h4 className="font-body text-sm font-semibold text-teal-900">Hop Weight For a Target IBU</h4>
      <p className="mt-1 font-body text-xs text-ink/70">
        Uses the wort gravity and batch volume from above.
      </p>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NumberField label="Target IBU" value={targetIbu} step={1} onChange={setTargetIbu} />
        <NumberField label="Alpha Acid" unit="%" value={alphaAcidPercent} step={0.1} onChange={setAlphaAcidPercent} />
        <NumberField label="Boil Time" unit="min" value={boilTimeMinutes} step={1} onChange={setBoilTimeMinutes} />
      </div>
      <p className="mt-2 font-body text-sm text-ink">
        Add <span className="font-semibold">{roundForDisplay(grams, 1)} g</span> of this hop at {boilTimeMinutes} min.
      </p>
    </div>
  );
}

function DryHopCalculator({ batchVolumeL }: { batchVolumeL: number }) {
  const [rateGPerL, setRateGPerL] = useState(2.5);

  const grams = calculateDryHopWeight(rateGPerL, batchVolumeL);

  return (
    <div className="rounded-md border border-teal-300 bg-teal-100/40 p-3">
      <h4 className="font-body text-sm font-semibold text-teal-900">Dry Hop / Whirlpool Addition</h4>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberField
          label="Rate"
          unit="g/L"
          value={rateGPerL}
          step={0.1}
          onChange={setRateGPerL}
          helperText="Typical 1-2 g/L subtle, 5-8+ g/L for heavily dry-hopped styles."
        />
        <ResultCard title="Hop Weight Needed" value={roundForDisplay(grams, 1).toString()} unit="g" />
      </div>
    </div>
  );
}

function IbuCalculator({
  batchVolumeL,
  onBatchVolumeChange,
  wortGravitySg,
  onWortGravityChange,
  hopAdditions,
  onHopAdditionsChange,
}: Pick<SharedRecipeProps, 'batchVolumeL' | 'onBatchVolumeChange' | 'wortGravitySg' | 'onWortGravityChange' | 'hopAdditions' | 'onHopAdditionsChange'>) {
  const result = calculateIbu(hopAdditions, wortGravitySg, batchVolumeL);

  const updateRow = (index: number, patch: Partial<HopAddition>) => {
    onHopAdditionsChange(hopAdditions.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <SectionCard title="IBU (Tinseth)">
      <p className="-mt-2 font-body text-xs text-ink/60">
        Batch volume, wort gravity, and this hop schedule are shared with the BJCP Style Check tab.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Wort Gravity (SG)" value={wortGravitySg} step={0.001} onChange={onWortGravityChange} />
        <NumberField label="Batch Volume" unit="L" value={batchVolumeL} step={1} onChange={onBatchVolumeChange} />
      </div>
      <div className="flex flex-col gap-2">
        {hopAdditions.map((row, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-md border-2 border-amber-200 bg-amber-50/40 p-2 sm:border-0 sm:bg-transparent sm:p-0">
            <SearchableSelect
              label="Quick-fill from common hop varieties (optional)"
              placeholder="Search hop varieties..."
              value={HOP_VARIETIES.find((h) => h.name === row.name)?.id ?? ''}
              options={HOP_VARIETIES.map((hop) => ({ id: hop.id, label: `${hop.name} (~${hop.alphaAcidPercent}% AA)` }))}
              onChange={(id) => {
                const hop = HOP_VARIETIES.find((h) => h.id === id);
                if (hop) updateRow(index, { name: hop.name, alphaAcidPercent: hop.alphaAcidPercent });
              }}
            />
            <p className="-mt-1.5 font-body text-xs text-ink/50">
              Not in the list? Just type any hop name, alpha acid, weight, and boil time directly below.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
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
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onHopAdditionsChange([...hopAdditions, { name: '', alphaAcidPercent: 0, weightG: 0, boilTimeMinutes: 0 }])
          }
          className="min-h-[44px] self-start rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
        >
          + Add Hop
        </button>
      </div>
      <ResultCard title="Total IBU" value={roundForDisplay(result.totalIbu, 1).toString()} />

      <HopWeightForTargetIbuCalculator wortGravity={wortGravitySg} batchVolumeL={batchVolumeL} />
      <DryHopCalculator batchVolumeL={batchVolumeL} />
    </SectionCard>
  );
}

function SrmColorCalculator({ grainBill, batchVolumeL }: { grainBill: GrainBillItem[]; batchVolumeL: number }) {
  const srm = calculateSrm(grainBill, batchVolumeL);
  const hasGrain = grainBill.some((row) => row.weightKg > 0);

  return (
    <SectionCard title="Beer Color (SRM)">
      <p className="-mt-2 font-body text-xs text-ink/60">
        Predicted from the Grain Bill (Water Report tab) and batch volume via the Morey equation -- most accurate
        under ~50 SRM. Add grains there to see a prediction here.
      </p>
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-amber-200 shadow-inner"
          style={{ backgroundColor: hasGrain ? srmToApproxHex(srm) : '#eef1f4' }}
        />
        <ResultCard title="Estimated Color" value={hasGrain ? roundForDisplay(srm, 1).toString() : '--'} unit="SRM" />
      </div>
    </SectionCard>
  );
}

export function BrewhouseCalculatorsPanel({
  og,
  onOgChange,
  fg,
  onFgChange,
  batchVolumeL,
  onBatchVolumeChange,
  grainBill,
  wortGravitySg,
  onWortGravityChange,
  hopAdditions,
  onHopAdditionsChange,
}: SharedRecipeProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Brewhouse Calculators</h2>
      <p className="font-body text-sm text-amber-800">
        Day-to-day production math: gravity/ABV, efficiency, carbonation, pitch rate, bitterness, and color. OG,
        FG, batch volume, hop schedule, and grain bill are all shared with the Home overview and BJCP Style
        Check tabs.
      </p>
      {/* Ordered to match when each reading is actually taken on brew day:
          mash-out efficiency, then gravity corrections, hop bitterness, and
          color during the boil, pitch rate at pitching, OG/FG tracking
          through fermentation, and finally the two packaging-time
          carbonation methods. */}
      <EfficiencyCalculator />
      <HydrometerCorrectionCalculator />
      <IbuCalculator
        batchVolumeL={batchVolumeL}
        onBatchVolumeChange={onBatchVolumeChange}
        wortGravitySg={wortGravitySg}
        onWortGravityChange={onWortGravityChange}
        hopAdditions={hopAdditions}
        onHopAdditionsChange={onHopAdditionsChange}
      />
      <SrmColorCalculator grainBill={grainBill} batchVolumeL={batchVolumeL} />
      <PitchRateCalculator og={og} onOgChange={onOgChange} batchVolumeL={batchVolumeL} onBatchVolumeChange={onBatchVolumeChange} />
      <AbvAttenuationCalculator og={og} onOgChange={onOgChange} fg={fg} onFgChange={onFgChange} />
      <PrimingCalculator batchVolumeL={batchVolumeL} onBatchVolumeChange={onBatchVolumeChange} />
      <ForceCarbonationCalculator />
    </section>
  );
}
