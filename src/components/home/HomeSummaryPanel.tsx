'use client';

import { ComponentType } from 'react';
import { AppState } from '@/hooks/useWaterProfile';
import { FermentationBatch, calculateFermentationStats } from '@/lib/fermentationTracker';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { calculateSrm } from '@/lib/srm';
import { roundForDisplay } from '@/lib/units';
import { DropletIcon, FlaskIcon, CalculatorIcon, FermenterIcon } from '@/components/ui/icons';

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
          className="min-h-[36px] flex-shrink-0 rounded-full border border-teal-300 px-3 py-1 font-body text-xs font-semibold text-teal-800 hover:bg-teal-50"
        >
          Edit
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-1 font-body text-sm text-ink">{children}</div>
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
  const targetStyleName = TARGET_STYLE_PROFILES.find((s) => s.id === state.targetStyleId)?.name ?? '--';
  const totalGrainKg = state.grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? row.weightKg : 0), 0);
  const srm = state.grainBill.length > 0 ? calculateSrm(state.grainBill, state.batchVolumeL) : null;
  const abvSoFar = state.fgSg > 0 && state.ogSg > 0 ? ((state.ogSg - state.fgSg) * 131.25).toFixed(2) : null;

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
    </section>
  );
}
