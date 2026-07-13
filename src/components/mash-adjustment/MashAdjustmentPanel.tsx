'use client';

import { useMemo, useState } from 'react';
import {
  IonProfile,
  EMPTY_ION_PROFILE,
  GrainBillItem,
  calculateResidualAlkalinity,
  predictMashPh,
  estimateMashWaterVolumeL,
} from '@/lib/waterChemistry';
import { solveSaltAdditions } from '@/lib/saltAdditions';
import { ACID_TYPES, calculateAcidDose } from '@/lib/acidAdditions';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { solveDilutionRatio } from '@/lib/dilutionOptimizer';
import { NumberField } from '@/components/ui/NumberField';
import { ResultCard } from '@/components/ui/ResultCard';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { OgEstimateCard } from '@/components/ui/OgEstimateCard';
import { GrainBillEditor } from '@/components/grain-bill/GrainBillEditor';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

interface MashAdjustmentPanelProps {
  sourceProfile: IonProfile;
  grainBill: GrainBillItem[];
  onGrainBillChange: (grainBill: GrainBillItem[]) => void;
  batchVolumeL: number;
  onBatchVolumeChange: (value: number) => void;
  targetStyleId: string;
  onTargetStyleChange: (id: string) => void;
  assumedEfficiencyPercent: number;
  onAssumedEfficiencyChange: (value: number) => void;
  ogSg: number;
  onOgChange: (value: number) => void;
}

export function MashAdjustmentPanel({
  sourceProfile,
  grainBill,
  onGrainBillChange,
  batchVolumeL,
  onBatchVolumeChange,
  targetStyleId,
  onTargetStyleChange,
  assumedEfficiencyPercent,
  onAssumedEfficiencyChange,
  ogSg,
  onOgChange,
}: MashAdjustmentPanelProps) {
  const { t } = useLanguage();
  const [targetMashPh, setTargetMashPh] = useState(5.4);
  const [acidId, setAcidId] = useState(ACID_TYPES[0].id);

  const targetStyle = useMemo(
    () => TARGET_STYLE_PROFILES.find((s) => s.id === targetStyleId) ?? TARGET_STYLE_PROFILES[0],
    [targetStyleId],
  );

  const residualAlkalinity = calculateResidualAlkalinity(sourceProfile);
  const mashPhResult = predictMashPh(residualAlkalinity, grainBill);
  const mashWaterVolumeL = estimateMashWaterVolumeL(mashPhResult.totalGristWeightKg);

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
  // Acid is dosed into the mash (strike water), not the full batch --
  // batchVolumeL also includes sparge water added later, so using it
  // here would overdose acid relative to what's actually in the mash tun.
  const acidDose = calculateAcidDose(mashPhResult.predictedPh, targetMashPh, mashWaterVolumeL, acid);

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
      <h2 className="font-display text-xl font-bold text-ink">{t('mashAdjustment.heading')}</h2>

      <TutorialCallout
        title={t('mashAdjustment.tutorial.title')}
        steps={[
          {
            lead: t('mashAdjustment.tutorial.step1.lead'),
            body: t('mashAdjustment.tutorial.step1.body'),
          },
          {
            lead: t('mashAdjustment.tutorial.step2.lead'),
            body: t('mashAdjustment.tutorial.step2.body'),
          },
          {
            lead: t('mashAdjustment.tutorial.step3.lead'),
            body: t('mashAdjustment.tutorial.step3.body'),
          },
          {
            lead: t('mashAdjustment.tutorial.step4.lead'),
            body: t('mashAdjustment.tutorial.step4.body'),
          },
          {
            lead: t('mashAdjustment.tutorial.step5.lead'),
            body: t('mashAdjustment.tutorial.step5.body'),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('summary.batchVolume')}
          unit="L"
          value={batchVolumeL}
          step={1}
          onChange={onBatchVolumeChange}
          helperText={t('mashAdjustment.batchVolume.helper')}
        />
        <SearchableSelect
          label={t('mashAdjustment.targetStyleProfile.label')}
          value={targetStyleId}
          onChange={onTargetStyleChange}
          options={TARGET_STYLE_PROFILES.map((style) => ({ id: style.id, label: style.name }))}
        />
      </div>

      <GrainBillEditor
        grainBill={grainBill}
        onChange={onGrainBillChange}
        batchVolumeL={batchVolumeL}
        targetOgSg={ogSg}
        onTargetOgChange={onOgChange}
        assumedEfficiencyPercent={assumedEfficiencyPercent}
        onAssumedEfficiencyChange={onAssumedEfficiencyChange}
      />

      <OgEstimateCard
        grainBill={grainBill}
        batchVolumeL={batchVolumeL}
        assumedEfficiencyPercent={assumedEfficiencyPercent}
        onAssumedEfficiencyChange={onAssumedEfficiencyChange}
      />

      <ResultCard
        title={t('mashAdjustment.predictedMashPh.title')}
        value={roundForDisplay(mashPhResult.predictedPh, 2).toString()}
        tone={mashPhResult.isFallback ? 'warning' : 'default'}
      >
        {mashPhResult.note}
      </ResultCard>

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">
          {t('mashAdjustment.saltAdditions.title', { style: targetStyle.name })}
        </h3>
        {saltResult.infeasible ? (
          <p className="mt-2 text-sm text-amber-800">
            {t('mashAdjustment.saltAdditions.infeasibleWarning')}
          </p>
        ) : null}
        <ul className="mt-2 flex flex-col gap-1 font-body text-sm text-ink">
          {saltResult.doses.length === 0 ? (
            <li>{t('mashAdjustment.saltAdditions.none')}</li>
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
              {t('mashAdjustment.dilution.instructionPrefix')}
              <span className="font-semibold">
                {t('mashAdjustment.dilution.instructionRatio', {
                  sourcePercent: roundForDisplay(dilutionResult.sourceFraction * 100, 0),
                  roPercent: roundForDisplay(dilutionResult.dilutantFraction * 100, 0),
                })}
              </span>
              {t('mashAdjustment.dilution.instructionMiddle', {
                batchVolume: batchVolumeL,
                sourceVolume: roundForDisplay(dilutionResult.sourceFraction * batchVolumeL, 1),
                roVolume: roundForDisplay(dilutionResult.dilutantFraction * batchVolumeL, 1),
              })}
              <span className="font-semibold">{dilutionResult.bindingIon}</span>
              {t('mashAdjustment.dilution.instructionSuffix')}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
          {t('mashAdjustment.acidDosing.title')}
        </h3>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label={t('mashAdjustment.targetMashPh.label')}
            value={targetMashPh}
            step={0.05}
            min={4}
            max={6.5}
            onChange={setTargetMashPh}
          />
          <SearchableSelect
            label={t('mashAdjustment.acidType.label')}
            value={acidId}
            onChange={setAcidId}
            options={ACID_TYPES.map((a) => ({ id: a.id, label: a.name }))}
          />
        </div>
        <p className="mt-3 font-body text-sm text-ink">
          {acidDose.alreadyAtTarget
            ? t('mashAdjustment.acidDosing.alreadyAtTarget')
            : t('mashAdjustment.acidDosing.addApprox', {
                amount: roundForDisplay(acidDose.mL, 1),
                acidName: acid.name,
              })}
        </p>
        <p className="mt-1 font-body text-xs text-ink/60">
          {t('mashAdjustment.acidDosing.dosedNote', {
            mashWaterVolume: roundForDisplay(mashWaterVolumeL, 1),
            factor: estimateMashWaterVolumeL(1),
            batchVolume: batchVolumeL,
          })}
        </p>
      </div>
    </section>
  );
}
