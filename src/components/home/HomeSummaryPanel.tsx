'use client';

import { ComponentType, useEffect, useState } from 'react';
import { AppState } from '@/hooks/useWaterProfile';
import { FermentationBatch, calculateFermentationStats } from '@/lib/fermentationTracker';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { checkStyleCompliance, ParameterCompliance } from '@/lib/styleCompliance';
import { calculateSrm } from '@/lib/srm';
import { calculateIbu } from '@/lib/ibu';
import { calculateAbvAdvanced } from '@/lib/fermentation';
import { roundForDisplay } from '@/lib/units';
import { DropletIcon, FlaskIcon, CalculatorIcon, FermenterIcon, StyleCheckIcon, ShareIcon } from '@/components/ui/icons';
import { buildRecipeShareText } from '@/lib/recipeShareText';

interface HomeSummaryPanelProps {
  state: AppState;
  fermentationBatches: FermentationBatch[];
  onJumpToTab: (tabId: string) => void;
}

function SummarySection({
  title,
  icon: Icon,
  tabId,
  onJumpToTab,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  tabId: string;
  onJumpToTab: (tabId: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border-2 border-amber-200 bg-amber-50/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-amber-900">
          <Icon className="h-4 w-4 flex-shrink-0 text-teal-700" />
          {title}
        </h3>
        <button
          type="button"
          onClick={() => onJumpToTab(tabId)}
          className="min-h-[44px] flex-shrink-0 rounded-full border-2 border-teal-300 px-3 py-2 font-body text-xs font-semibold text-teal-800 hover:bg-teal-50"
        >
          Edit
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-1 font-body text-sm text-ink">{children}</div>
    </div>
  );
}

function deviationText(compliance: ParameterCompliance, unit: string): string {
  if (compliance.inRange) return 'in range';
  const delta = compliance.value < compliance.range.min ? compliance.range.min - compliance.value : compliance.value - compliance.range.max;
  const direction = compliance.value < compliance.range.min ? 'under' : 'over';
  return `${roundForDisplay(delta, 2)}${unit} ${direction} range`;
}

function DeviationRow({ label, unit, compliance }: { label: string; unit: string; compliance: ParameterCompliance }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
        compliance.inRange ? 'border-teal-300 bg-teal-50' : 'border-red-300 bg-red-50'
      }`}
    >
      <span className="font-medium text-ink">{label}</span>
      <span className={compliance.inRange ? 'text-teal-800' : 'text-red-700'}>
        {roundForDisplay(compliance.value, 3)}
        {unit} <span className="text-xs text-ink/60">({deviationText(compliance, unit)})</span>
      </span>
    </div>
  );
}

/**
 * A single "come back and see everything" screen: every reading/input
 * entered anywhere in the app, recapped top-to-bottom in the same order
 * as the brew-day flow, each with a jump-back link to edit it. This is
 * the checkpoint a brewer reaches for mid-session ("what did I set the
 * batch volume to again?") or at the end of the day to review the whole
 * session at a glance, instead of re-visiting every tab one by one.
 */
export function HomeSummaryPanel({ state, fermentationBatches, onJumpToTab }: HomeSummaryPanelProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (shareStatus === 'idle') return;
    const timer = setTimeout(() => setShareStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [shareStatus]);

  const targetStyleName = TARGET_STYLE_PROFILES.find((s) => s.id === state.targetStyleId)?.name ?? '--';
  const totalGrainKg = state.grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? row.weightKg : 0), 0);
  const srm = state.grainBill.length > 0 ? calculateSrm(state.grainBill, state.batchVolumeL) : null;
  const abvSoFar = state.fgSg > 0 && state.ogSg > 0 ? ((state.ogSg - state.fgSg) * 131.25).toFixed(2) : null;

  const bjcpStyle = BJCP_STYLES.find((s) => s.id === state.bjcpStyleId) ?? BJCP_STYLES[0];
  const ibuResult = calculateIbu(state.hopAdditions, state.wortGravitySg, state.batchVolumeL);
  const advancedAbv = calculateAbvAdvanced(state.ogSg, state.fgSg);
  const compliance = checkStyleCompliance(
    { og: state.ogSg, fg: state.fgSg, ibu: ibuResult.totalIbu, srm: srm ?? 0, abvPercent: advancedAbv },
    bjcpStyle,
  );

  const handleShare = async () => {
    const text = buildRecipeShareText(state, {
      bjcpStyleName: bjcpStyle.name,
      targetWaterStyleName: targetStyleName,
      ibu: ibuResult.totalIbu,
      srm,
      abvPercent: advancedAbv,
      parametersInRange: compliance.parametersInRange,
      fermentationBatches: fermentationBatches.map((batch) => {
        const stats = calculateFermentationStats(batch.entries);
        return {
          name: batch.name,
          entryCount: batch.entries.length,
          currentGravity: stats.currentGravity,
          apparentAttenuationPercent: stats.apparentAttenuationPercent,
          likelyComplete: stats.likelyComplete,
        };
      }),
    });
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Brew Recipe Summary', text });
        setShareStatus('shared');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShareStatus('copied');
      } else {
        setShareStatus('error');
      }
    } catch {
      // User cancelled the native share sheet, or clipboard write was denied -- not an error worth surfacing.
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Brew Session Overview</h2>
      <p className="font-body text-sm text-amber-800">
        Everything entered so far, in brew-day order. Tap Edit on any card to jump back and change it.
      </p>

      <SummarySection title="Water Source" icon={DropletIcon} tabId="water-report" onJumpToTab={onJumpToTab}>
        <p>
          Calcium {state.sourceProfile.calcium} &middot; Magnesium {state.sourceProfile.magnesium} &middot; Sulfate{' '}
          {state.sourceProfile.sulfate} &middot; Chloride {state.sourceProfile.chloride} mg/L
        </p>
      </SummarySection>

      <SummarySection title="Grain Bill" icon={DropletIcon} tabId="water-report" onJumpToTab={onJumpToTab}>
        {state.grainBill.length === 0 ? (
          <p className="text-amber-700">No grains added yet.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-0.5">
              {state.grainBill.map((row, i) => (
                <li key={i}>
                  {row.name || 'Unnamed grain'} -- {row.weightKg} kg @ {row.colorLovibond}°L
                  {Number.isFinite(row.potentialSg) && (row.potentialSg as number) > 0
                    ? `, ${row.potentialSg} SG potential`
                    : ''}
                </li>
              ))}
            </ul>
            <p className="mt-1 font-semibold">
              Total: {totalGrainKg.toFixed(2)} kg {srm !== null ? `-- ~${roundForDisplay(srm, 1)} SRM` : ''}
            </p>
          </>
        )}
      </SummarySection>

      <SummarySection title="Mash & Sparge" icon={FlaskIcon} tabId="mash-adjustment" onJumpToTab={onJumpToTab}>
        <p>Batch Volume: {state.batchVolumeL} L</p>
        <p>Target Style Profile: {targetStyleName}</p>
        <p>Sparge Volume: {state.spargeVolumeL} L</p>
      </SummarySection>

      <SummarySection title="Recipe Gravity" icon={CalculatorIcon} tabId="brewhouse" onJumpToTab={onJumpToTab}>
        <p>OG: {roundForDisplay(state.ogSg, 3)}</p>
        <p>FG: {roundForDisplay(state.fgSg, 3)}</p>
        {abvSoFar !== null ? <p>ABV (simple): {abvSoFar}%</p> : null}
      </SummarySection>

      <SummarySection title="Hops & IBU" icon={CalculatorIcon} tabId="brewhouse" onJumpToTab={onJumpToTab}>
        {state.hopAdditions.length === 0 || state.hopAdditions.every((h) => h.weightG === 0) ? (
          <p className="text-amber-700">No hop additions logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {state.hopAdditions.map((hop, i) => (
              <li key={i}>
                {hop.name || 'Unnamed hop'} -- {hop.weightG} g @ {hop.alphaAcidPercent}% AA, {hop.boilTimeMinutes} min
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 font-semibold">Total IBU: {roundForDisplay(ibuResult.totalIbu, 1)}</p>
      </SummarySection>

      <div className="rounded-lg border-2 border-teal-300 bg-teal-50/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-teal-800">
            <StyleCheckIcon className="h-4 w-4 flex-shrink-0 text-teal-700" />
            Deviation vs {bjcpStyle.name}
          </h3>
          <button
            type="button"
            onClick={() => onJumpToTab('style-check')}
            className="min-h-[44px] flex-shrink-0 rounded-full border-2 border-teal-300 px-3 py-2 font-body text-xs font-semibold text-teal-800 hover:bg-teal-50"
          >
            Change Style
          </button>
        </div>
        <p className="mt-1 font-body text-xs text-ink/70">
          Matches {compliance.parametersInRange}/5 parameters -- built from Grain Bill, Hops, and Recipe
          Gravity above.
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          <DeviationRow label="Original Gravity" unit=" SG" compliance={compliance.og} />
          <DeviationRow label="Final Gravity" unit=" SG" compliance={compliance.fg} />
          <DeviationRow label="IBU" unit="" compliance={compliance.ibu} />
          <DeviationRow label="Color (SRM)" unit="" compliance={compliance.srm} />
          <DeviationRow label="ABV" unit="%" compliance={compliance.abvPercent} />
        </div>
      </div>

      <SummarySection title="Fermentation Batches" icon={FermenterIcon} tabId="fermentation-tracker" onJumpToTab={onJumpToTab}>
        {fermentationBatches.length === 0 ? (
          <p className="text-amber-700">No batches logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {fermentationBatches.map((batch) => {
              const stats = calculateFermentationStats(batch.entries);
              return (
                <li key={batch.id}>
                  <span className="font-semibold">{batch.name}</span> -- {batch.entries.length} reading
                  {batch.entries.length === 1 ? '' : 's'}
                  {stats.apparentAttenuationPercent !== null
                    ? `, ${roundForDisplay(stats.apparentAttenuationPercent, 1)}% attenuation`
                    : ''}
                  {stats.likelyComplete ? ' -- likely finished' : ''}
                </li>
              );
            })}
          </ul>
        )}
      </SummarySection>

      <div className="mt-2 border-t border-amber-200 pt-4">
        <button
          type="button"
          onClick={handleShare}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 active:bg-teal-900"
        >
          <ShareIcon className="h-5 w-5 flex-shrink-0" />
          Share / Export Recipe
        </button>
        <p className="mt-2 text-center font-body text-xs text-amber-700" role="status" aria-live="polite">
          {shareStatus === 'shared'
            ? 'Shared.'
            : shareStatus === 'copied'
              ? 'Copied to clipboard -- paste into any app.'
              : shareStatus === 'error'
                ? 'Sharing not supported on this browser -- try the Print/Save as PDF option in your browser menu.'
                : "Opens your device's share sheet (WhatsApp, Email, etc.), or copies a text summary if sharing isn't available. For a PDF, use your browser's Print -> Save as PDF."}
        </p>
      </div>
    </section>
  );
}
