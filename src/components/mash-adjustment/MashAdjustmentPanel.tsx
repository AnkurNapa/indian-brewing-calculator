'use client';

import { useMemo, useState } from 'react';
import { IonProfile, EMPTY_ION_PROFILE, GrainBillItem, calculateResidualAlkalinity, predictMashPh } from '@/lib/waterChemistry';
import { solveSaltAdditions } from '@/lib/saltAdditions';
import { ACID_TYPES, calculateAcidDose } from '@/lib/acidAdditions';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { solveDilutionRatio } from '@/lib/dilutionOptimizer';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { roundForDisplay } from '@/lib/units';

interface MashAdjustmentPanelProps {
  sourceProfile: IonProfile;
  grainBill: GrainBillItem[];
  batchVolumeL: number;
  onBatchVolumeChange: (value: number) => void;
  targetStyleId: string;
  onTargetStyleChange: (id: string) => void;
}

export function MashAdjustmentPanel({
  sourceProfile,
  grainBill,
  batchVolumeL,
  onBatchVolumeChange,
  targetStyleId,
  onTargetStyleChange,
}: MashAdjustmentPanelProps) {
  const [targetMashPh, setTargetMashPh] = useState(5.4);
  const [acidId, setAcidId] = useState(ACID_TYPES[0].id);

  const targetStyle = useMemo(
    () => TARGET_STYLE_PROFILES.find((s) => s.id === targetStyleId) ?? TARGET_STYLE_PROFILES[0],
    [targetStyleId],
  );

  const residualAlkalinity = calculateResidualAlkalinity(sourceProfile);
  const mashPhResult = predictMashPh(residualAlkalinity, grainBill);

  const saltResult = solveSaltAdditions(
    sourceProfile,
    {
      calcium: targetStyle.profile.calcium,
      magnesium: targetStyle.profile.magnesium,
      sodium: targetStyle.profile.sodium,
      sulfate: targetStyle.profile.sulfate,
      chloride: targetStyle.profile.chloride,
      bicarbonate: targetStyle.profile.bicarbonate,
    },
    batchVolumeL,
  );

  const acid = ACID_TYPES.find((a) => a.id === acidId) ?? ACID_TYPES[0];
  const acidDose = calculateAcidDose(mashPhResult.predictedPh, targetMashPh, batchVolumeL, acid);

  const dilutionResult = saltResult.infeasible
    ? solveDilutionRatio(sourceProfile, EMPTY_ION_PROFILE, {
        calcium: targetStyle.profile.calcium,
        magnesium: targetStyle.profile.magnesium,
        sodium: targetStyle.profile.sodium,
        sulfate: targetStyle.profile.sulfate,
        chloride: targetStyle.profile.chloride,
        bicarbonate: targetStyle.profile.bicarbonate,
        alkalinity: targetStyle.profile.alkalinity,
      })
    : null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Mash Adjustment</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Batch Volume"
          unit="L"
          value={batchVolumeL}
          step={1}
          onChange={onBatchVolumeChange}
          helperText="Enter commercial volumes in HL x 100 to convert to L."
        />
        <label className="flex flex-col gap-1">
          <span className="font-body text-sm font-medium text-amber-900">Target Style Profile</span>
          <select
            className="min-h-[44px] rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink"
            value={targetStyleId}
            onChange={(e) => onTargetStyleChange(e.target.value)}
          >
            {TARGET_STYLE_PROFILES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ResultCard
        title="Predicted Mash pH"
        value={roundForDisplay(mashPhResult.predictedPh, 2).toString()}
        tone={mashPhResult.isFallback ? 'warning' : 'default'}
      >
        {mashPhResult.note}
      </ResultCard>

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
          Salt Additions ({targetStyle.name})
        </h3>
        {saltResult.infeasible ? (
          <p className="mt-2 text-sm text-amber-800">
            Some targets are not achievable by salt addition alone -- see notes below.
          </p>
        ) : null}
        <ul className="mt-2 flex flex-col gap-1 font-body text-sm text-ink">
          {saltResult.doses.length === 0 ? (
            <li>No salt additions needed for this target.</li>
          ) : (
            saltResult.doses.map((dose) => (
              <li key={dose.saltId} className="flex justify-between border-b border-teal-100 py-1">
                <span>
                  {dose.name} ({dose.formula}){dose.approximate ? ' *' : ''}
                </span>
                <span className="font-semibold">{roundForDisplay(dose.grams, 2)} g</span>
              </li>
            ))
          )}
        </ul>
        {saltResult.notes.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1 text-xs text-amber-800">
            {saltResult.notes.map((note, i) => (
              <li key={i}>* {note}</li>
            ))}
          </ul>
        ) : null}
        {dilutionResult && !dilutionResult.noDilutionNeeded ? (
          <div className="mt-3 rounded-md border border-teal-300 bg-teal-100/60 p-3 text-sm text-teal-900">
            <p>
              Dilute source water with RO/distilled at{' '}
              <span className="font-semibold">
                {roundForDisplay(dilutionResult.sourceFraction * 100, 0)}% source /{' '}
                {roundForDisplay(dilutionResult.dilutantFraction * 100, 0)}% RO
              </span>{' '}
              (for a {batchVolumeL} L batch: {roundForDisplay(dilutionResult.sourceFraction * batchVolumeL, 1)} L source +{' '}
              {roundForDisplay(dilutionResult.dilutantFraction * batchVolumeL, 1)} L RO) before adding salts, driven by{' '}
              <span className="font-semibold">{dilutionResult.bindingIon}</span>. Then re-solve salt additions against the diluted profile.
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
          Acid Dosing (approximate)
        </h3>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Target Mash pH"
            value={targetMashPh}
            step={0.05}
            min={4}
            max={6.5}
            onChange={setTargetMashPh}
          />
          <label className="flex flex-col gap-1">
            <span className="font-body text-sm font-medium text-amber-900">Acid Type</span>
            <select
              className="min-h-[44px] rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink"
              value={acidId}
              onChange={(e) => setAcidId(e.target.value)}
            >
              {ACID_TYPES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 font-body text-sm text-ink">
          {acidDose.alreadyAtTarget
            ? 'Already at or below target pH -- no acid needed.'
            : `Add approximately ${roundForDisplay(acidDose.mL, 1)} mL of ${acid.name} to the mash.`}
        </p>
      </div>
    </section>
  );
}
