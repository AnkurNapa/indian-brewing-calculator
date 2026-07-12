'use client';

import { useMemo, useState } from 'react';
import { GrainBillItem } from '@/lib/waterChemistry';
import { calculateTransferTimeMinutes, calculateRequiredFlowRate } from '@/lib/wortTransfer';
import { calculateGrainBedDepth, evaluateRunoffCutoff, DEFAULT_BED_VOLUME_L_PER_KG } from '@/lib/lautering';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { roundForDisplay } from '@/lib/units';

interface TransferLauteringPanelProps {
  grainBill: GrainBillItem[];
}

function TransferTimeCalculator() {
  const [volumeL, setVolumeL] = useState(20);
  const [flowRateLPerMin, setFlowRateLPerMin] = useState(4);

  const timeMinutes = calculateTransferTimeMinutes(volumeL, flowRateLPerMin);
  const requiredFlowRateForTenMin = calculateRequiredFlowRate(volumeL, 10);

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">Transfer Time</h3>
      <p className="mt-1 font-body text-sm text-ink">
        Mash-to-lauter, lauter-to-kettle, or kettle-to-fermenter transfer timing.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Volume to Transfer" unit="L" value={volumeL} step={1} onChange={setVolumeL} />
        <NumberField
          label="Pump / Flow Rate"
          unit="L/min"
          value={flowRateLPerMin}
          step={0.1}
          onChange={setFlowRateLPerMin}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResultCard title="Estimated Transfer Time" value={roundForDisplay(timeMinutes, 1).toString()} unit="min" />
        <ResultCard
          title="Flow Rate for a 10-min Transfer"
          value={roundForDisplay(requiredFlowRateForTenMin, 2).toString()}
          unit="L/min"
        />
      </div>
    </div>
  );
}

function GrainBedDepthCalculator({ totalGrainWeightKg }: { totalGrainWeightKg: number }) {
  const [lauterTunDiameterCm, setLauterTunDiameterCm] = useState(50);
  const [bedVolumeLPerKg, setBedVolumeLPerKg] = useState(DEFAULT_BED_VOLUME_L_PER_KG);

  const result = calculateGrainBedDepth(totalGrainWeightKg, lauterTunDiameterCm, bedVolumeLPerKg);

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
        Grain Bed Depth (Stuck-Mash Check)
      </h3>
      <p className="mt-1 font-body text-sm text-ink">
        Using grist weight from the Grain Bill tab: <span className="font-semibold">{totalGrainWeightKg.toFixed(2)} kg</span>
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Lauter Tun Diameter"
          unit="cm"
          value={lauterTunDiameterCm}
          step={1}
          onChange={setLauterTunDiameterCm}
        />
        <NumberField
          label="Bed Volume Factor"
          unit="L/kg"
          value={bedVolumeLPerKg}
          step={0.05}
          onChange={setBedVolumeLPerKg}
          helperText="Typical 0.65-1.0 L/kg -- calibrate to your crush/malt."
        />
      </div>
      <div className="mt-3">
        <ResultCard
          title="Estimated Bed Depth"
          value={roundForDisplay(result.bedDepthCm, 1).toString()}
          unit="cm"
          tone={result.stuckMashRisk ? 'warning' : 'default'}
        >
          {result.stuckMashRisk
            ? result.notes.join(' ')
            : 'Within the typical safe range for stuck-mash risk.'}
        </ResultCard>
      </div>
    </div>
  );
}

function RunoffCutoffAdvisor() {
  const [currentRunningsSg, setCurrentRunningsSg] = useState(1.012);
  const [cutoffSg, setCutoffSg] = useState(1.008);

  const result = evaluateRunoffCutoff(currentRunningsSg, cutoffSg);

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
        Runoff / Sparge Cutoff
      </h3>
      <p className="mt-1 font-body text-sm text-ink">
        Check current runnings gravity against your stop-collecting threshold to avoid tannin extraction.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Current Runnings Gravity"
          value={currentRunningsSg}
          step={0.001}
          onChange={setCurrentRunningsSg}
        />
        <NumberField label="Cutoff Gravity" value={cutoffSg} step={0.001} onChange={setCutoffSg} />
      </div>
      <div className="mt-3">
        <ResultCard
          title={result.shouldContinueCollecting ? 'Keep Collecting' : 'Stop Collecting'}
          value={roundForDisplay(result.gravityPointsAboveCutoff, 1).toString()}
          unit="pts above cutoff"
          tone={result.shouldContinueCollecting ? 'success' : 'warning'}
        >
          {result.note}
        </ResultCard>
      </div>
    </div>
  );
}

export function TransferLauteringPanel({ grainBill }: TransferLauteringPanelProps) {
  const totalGrainWeightKg = useMemo(
    () => grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? Math.max(0, row.weightKg) : 0), 0),
    [grainBill],
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Mash Transfer & Lautering</h2>
      <p className="font-body text-sm text-amber-800">
        Quick on-the-go checks for transfer timing, stuck-mash risk, and runoff cutoff during brew day.
      </p>
      <TutorialCallout
        title="How to use Transfer & Lautering"
        steps={[
          {
            lead: '1. Transfer Time',
            body: 'is a general timing tool -- use it for any pumped transfer (mash to lauter, lauter to kettle, kettle to fermenter), not just lautering specifically.',
          },
          {
            lead: '2. Grain Bed Depth',
            body: 'flags stuck-mash risk from your lauter tun diameter and grist weight (pulled from the Grain Bill tab) -- a deep, narrow bed is the classic stuck-sparge setup.',
          },
          {
            lead: '3. Runoff / Sparge Cutoff',
            body: 'tells you when to stop collecting wort: enter your current runnings gravity and your cutoff threshold (commonly ~1.008-1.010) to avoid extracting tannins from the grain husks.',
          },
        ]}
      />
      <TransferTimeCalculator />
      <GrainBedDepthCalculator totalGrainWeightKg={totalGrainWeightKg} />
      <RunoffCutoffAdvisor />
    </section>
  );
}
