'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabDef } from '@/components/ui/Tabs';
import { SessionSummary } from '@/components/ui/SessionSummary';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { roundForDisplay } from '@/lib/units';
import { WaterReportForm } from '@/components/water-report/WaterReportForm';
import { TargetStyleReference } from '@/components/water-report/TargetStyleReference';
import { MashAdjustmentPanel } from '@/components/mash-adjustment/MashAdjustmentPanel';
import { SpargeAdjustmentPanel } from '@/components/sparge-adjustment/SpargeAdjustmentPanel';
import { BlendingPanel } from '@/components/blending/BlendingPanel';
import { WaterVolumesPanel } from '@/components/water-volumes/WaterVolumesPanel';
import { BrewhouseCalculatorsPanel } from '@/components/brewhouse/BrewhouseCalculatorsPanel';
import { TransferLauteringPanel } from '@/components/transfer-lautering/TransferLauteringPanel';
import { FermentationTrackerPanel } from '@/components/fermentation-tracker/FermentationTrackerPanel';
import { StyleCheckPanel } from '@/components/style-check/StyleCheckPanel';
import { AboutPanel } from '@/components/about/AboutPanel';
import { BackupPanel } from '@/components/backup/BackupPanel';
import { HomeSummaryPanel } from '@/components/home/HomeSummaryPanel';
import { RecipeSnapshotsPanel } from '@/components/recipes/RecipeSnapshotsPanel';
import { useWaterProfile } from '@/hooks/useWaterProfile';
import { useFermentationBatches } from '@/hooks/useFermentationBatches';
import { useRecipeSnapshots } from '@/hooks/useRecipeSnapshots';
import {
  HomeIcon,
  DropletIcon,
  FlaskIcon,
  FunnelIcon,
  BlendIcon,
  JugIcon,
  PipeFlowIcon,
  FermenterIcon,
  CalculatorIcon,
  StyleCheckIcon,
  InfoIcon,
  CloudSyncIcon,
  BookmarkIcon,
} from '@/components/ui/icons';

/**
 * Ordered to mirror an actual brew-day walk-through, from water prep
 * through to packaging and record-keeping, so swiping/tapping forward
 * through the tabs follows the same order a brewer works the floor. Home
 * comes first as the session overview / checkpoint screen.
 */
const TABS: TabDef[] = [
  { id: 'home', label: 'Home', shortLabel: 'Home', icon: HomeIcon },
  { id: 'water-report', label: 'Water Report', shortLabel: 'Water', icon: DropletIcon },
  { id: 'mash-adjustment', label: 'Mash Adjustment', shortLabel: 'Mash', icon: FlaskIcon },
  { id: 'sparge-adjustment', label: 'Sparge Adjustment', shortLabel: 'Sparge', icon: FunnelIcon },
  { id: 'water-volumes', label: 'Water Volumes', shortLabel: 'Volumes', icon: JugIcon },
  { id: 'transfer-lautering', label: 'Transfer & Lautering', shortLabel: 'Transfer', icon: PipeFlowIcon },
  { id: 'brewhouse', label: 'Brewhouse Calculators', shortLabel: 'Calcs', icon: CalculatorIcon },
  { id: 'fermentation-tracker', label: 'Fermentation Tracker', shortLabel: 'Ferment', icon: FermenterIcon },
  { id: 'style-check', label: 'BJCP Style Check', shortLabel: 'Style', icon: StyleCheckIcon },
  { id: 'blending', label: 'Blending', shortLabel: 'Blend', icon: BlendIcon },
  { id: 'recipes', label: 'Recipes', shortLabel: 'Recipes', icon: BookmarkIcon },
  { id: 'backup', label: 'Backup & Sync', shortLabel: 'Backup', icon: CloudSyncIcon },
  { id: 'about', label: 'About', shortLabel: 'About', icon: InfoIcon },
];

const TAB_BY_ID = new Map(TABS.map((tab) => [tab.id, tab]));

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const { state, setState } = useWaterProfile();
  const { batches: fermentationBatches, setBatches: setFermentationBatches } = useFermentationBatches();
  const { snapshots: recipeSnapshots, addSnapshot: addRecipeSnapshot, deleteSnapshot: deleteRecipeSnapshot } = useRecipeSnapshots();
  const activeTabDef = TAB_BY_ID.get(activeTab) ?? TABS[0];

  const targetStyleName = TARGET_STYLE_PROFILES.find((s) => s.id === state.targetStyleId)?.name ?? '--';
  const totalGrainKg = state.grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? row.weightKg : 0), 0);

  /**
   * What's shown depends on the active tab: each panel only recaps the
   * selections that actually feed it (and were most likely made on an
   * earlier tab), so the strip reads as "here's what's carrying into this
   * step" rather than a generic, always-identical dashboard.
   */
  const summaryItemsByTab: Record<string, { label: string; value: string }[]> = {
    home: [],
    'water-report': [
      { label: 'Target Style', value: targetStyleName },
      ...(totalGrainKg > 0 ? [{ label: 'Grain Bill', value: `${totalGrainKg.toFixed(2)} kg` }] : []),
    ],
    'mash-adjustment': [
      { label: 'Batch Volume', value: `${state.batchVolumeL} L` },
      { label: 'Target Style', value: targetStyleName },
    ],
    'sparge-adjustment': [{ label: 'Sparge Volume', value: `${state.spargeVolumeL} L` }],
    'water-volumes': [
      { label: 'Batch Volume', value: `${state.batchVolumeL} L` },
      { label: 'Grain Bill', value: `${totalGrainKg.toFixed(2)} kg` },
    ],
    'transfer-lautering': [{ label: 'Grain Bill', value: `${totalGrainKg.toFixed(2)} kg` }],
    brewhouse: [
      { label: 'Batch Volume', value: `${state.batchVolumeL} L` },
      { label: 'OG', value: roundForDisplay(state.ogSg, 3).toString() },
      { label: 'FG', value: roundForDisplay(state.fgSg, 3).toString() },
    ],
    'fermentation-tracker': [],
    'style-check': [
      { label: 'Target Style', value: targetStyleName },
      { label: 'OG', value: roundForDisplay(state.ogSg, 3).toString() },
      { label: 'FG', value: roundForDisplay(state.fgSg, 3).toString() },
    ],
    blending: [],
    recipes: [],
    backup: [],
    about: [],
  };
  const summaryItems = summaryItemsByTab[activeTab] ?? [];

  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);
  const nextTab = activeIndex >= 0 && activeIndex < TABS.length - 1 ? TABS[activeIndex + 1] : null;

  useEffect(() => {
    document.title =
      activeTab === 'home' ? "Indian Brewer's Calculator" : `${activeTabDef.label} - Indian Brewer's Calculator`;
  }, [activeTab, activeTabDef.label]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-2 sm:px-6 sm:pb-16 sm:pt-6">
      <header className="hidden flex-col items-center gap-1 text-center sm:flex">
        <div className="flex items-center gap-2">
          <DropletIcon className="h-7 w-7 flex-shrink-0 text-teal-700" />
          <h1 className="font-display text-2xl font-extrabold text-amber-900 sm:text-3xl">
            Indian Brewer&apos;s Calculator
          </h1>
        </div>
        <p className="font-body text-sm text-amber-800">
          A metric (L / HL / mg / g / °C) brewing water chemistry lab notebook.
        </p>
      </header>

      {/* Compact native-style app bar on phones: a short (2-3 word) screen
          title plus a "step X of N" progress readout, so the current
          location in the brew-day flow is always legible at a glance --
          instead of the long full tab label, which doesn't fit a phone
          title bar cleanly. */}
      <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-2 border-b-2 border-amber-200 bg-parchment/97 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-2">
          {activeTab !== 'home' ? (
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              aria-label="Go to Home overview"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-teal-700 hover:bg-teal-50 active:bg-teal-100"
            >
              <HomeIcon className="h-5 w-5" />
            </button>
          ) : (
            <activeTabDef.icon className="h-5 w-5 flex-shrink-0 text-teal-700" />
          )}
          <h1 className="font-display text-base font-bold text-amber-900">
            {activeTabDef.shortLabel ?? activeTabDef.label}
          </h1>
        </div>
        {activeTab !== 'home' ? (
          <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-1 font-body text-[0.65rem] font-semibold text-amber-700">
            Step {activeIndex} of {TABS.length - 1}
          </span>
        ) : null}
      </div>

      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <SessionSummary items={summaryItems} />

      <div className="rounded-2xl border border-[#e2e6ea] bg-white p-4 shadow-sm sm:p-6">
        {activeTab === 'home' ? (
          <HomeSummaryPanel
            state={state}
            fermentationBatches={fermentationBatches}
            onJumpToTab={setActiveTab}
            processSteps={TABS.filter((tab) => tab.id !== 'home' && tab.id !== 'backup' && tab.id !== 'about' && tab.id !== 'recipes')}
          />
        ) : null}

        {activeTab === 'water-report' ? (
          <div className="flex flex-col gap-8">
            <TutorialCallout
              title="How to use Water Report"
              steps={[
                {
                  lead: '1. Pick which style you\'re brewing.',
                  body: 'This shows a matching target water profile right away, and sets the same target Mash Adjustment uses for salt additions.',
                },
                {
                  lead: '2. Quick-fill or enter your source water.',
                  body: 'Pick a known water type from the preset, or type your own ion values (Ca, Mg, Na, SO4, Cl, HCO3, alkalinity) from a water report/COA.',
                },
                {
                  lead: '3. Check Residual Alkalinity.',
                  body: 'Higher RA pushes mash pH up; very low or negative RA (like RO water) lets dark malt acidity dominate -- this feeds directly into Mash Adjustment.',
                },
                {
                  lead: '4. Build your Grain Bill on Mash Adjustment.',
                  body: 'The Grain Bill editor lives on the Mash Adjustment tab, right next to Predicted Mash pH, since grist is what actually drives that number.',
                },
              ]}
            />
            <TargetStyleReference
              targetStyleId={state.targetStyleId}
              onTargetStyleChange={(targetStyleId) => setState((prev) => ({ ...prev, targetStyleId }))}
              sourceProfile={state.sourceProfile}
            />
            <WaterReportForm
              profile={state.sourceProfile}
              onChange={(sourceProfile) => setState((prev) => ({ ...prev, sourceProfile }))}
            />
          </div>
        ) : null}

        {activeTab === 'mash-adjustment' ? (
          <MashAdjustmentPanel
            sourceProfile={state.sourceProfile}
            grainBill={state.grainBill}
            onGrainBillChange={(grainBill) => setState((prev) => ({ ...prev, grainBill }))}
            batchVolumeL={state.batchVolumeL}
            onBatchVolumeChange={(batchVolumeL) => setState((prev) => ({ ...prev, batchVolumeL }))}
            targetStyleId={state.targetStyleId}
            onTargetStyleChange={(targetStyleId) => setState((prev) => ({ ...prev, targetStyleId }))}
            assumedEfficiencyPercent={state.assumedEfficiencyPercent}
            onAssumedEfficiencyChange={(assumedEfficiencyPercent) => setState((prev) => ({ ...prev, assumedEfficiencyPercent }))}
            ogSg={state.ogSg}
            onOgChange={(ogSg) => setState((prev) => ({ ...prev, ogSg }))}
          />
        ) : null}

        {activeTab === 'sparge-adjustment' ? (
          <SpargeAdjustmentPanel
            sourceProfile={state.sourceProfile}
            spargeVolumeL={state.spargeVolumeL}
            onSpargeVolumeChange={(spargeVolumeL) => setState((prev) => ({ ...prev, spargeVolumeL }))}
          />
        ) : null}

        {activeTab === 'blending' ? (
          <BlendingPanel
            sourceA={state.sourceProfile}
            sourceB={state.secondSourceProfile}
            onSourceAChange={(sourceProfile) => setState((prev) => ({ ...prev, sourceProfile }))}
            onSourceBChange={(secondSourceProfile) => setState((prev) => ({ ...prev, secondSourceProfile }))}
            percentA={state.blendPercentA}
            onPercentAChange={(blendPercentA) => setState((prev) => ({ ...prev, blendPercentA }))}
          />
        ) : null}

        {activeTab === 'water-volumes' ? <WaterVolumesPanel grainBill={state.grainBill} /> : null}

        {activeTab === 'transfer-lautering' ? <TransferLauteringPanel grainBill={state.grainBill} /> : null}

        {activeTab === 'fermentation-tracker' ? (
          <FermentationTrackerPanel batches={fermentationBatches} onBatchesChange={setFermentationBatches} />
        ) : null}

        {activeTab === 'brewhouse' ? (
          <BrewhouseCalculatorsPanel
            og={state.ogSg}
            onOgChange={(ogSg) => setState((prev) => ({ ...prev, ogSg }))}
            fg={state.fgSg}
            onFgChange={(fgSg) => setState((prev) => ({ ...prev, fgSg }))}
            batchVolumeL={state.batchVolumeL}
            onBatchVolumeChange={(batchVolumeL) => setState((prev) => ({ ...prev, batchVolumeL }))}
            grainBill={state.grainBill}
            wortGravitySg={state.wortGravitySg}
            onWortGravityChange={(wortGravitySg) => setState((prev) => ({ ...prev, wortGravitySg }))}
            hopAdditions={state.hopAdditions}
            onHopAdditionsChange={(hopAdditions) => setState((prev) => ({ ...prev, hopAdditions }))}
            ibuFormula={state.ibuFormula}
            onIbuFormulaChange={(ibuFormula) => setState((prev) => ({ ...prev, ibuFormula }))}
            garetzExtras={state.garetzExtras}
            onGaretzExtrasChange={(garetzExtras) => setState((prev) => ({ ...prev, garetzExtras }))}
          />
        ) : null}

        {activeTab === 'style-check' ? (
          <StyleCheckPanel
            grainBill={state.grainBill}
            batchVolumeL={state.batchVolumeL}
            og={state.ogSg}
            onOgChange={(ogSg) => setState((prev) => ({ ...prev, ogSg }))}
            fg={state.fgSg}
            onFgChange={(fgSg) => setState((prev) => ({ ...prev, fgSg }))}
            bjcpStyleId={state.bjcpStyleId}
            onBjcpStyleChange={(bjcpStyleId) => setState((prev) => ({ ...prev, bjcpStyleId }))}
            wortGravitySg={state.wortGravitySg}
            onWortGravityChange={(wortGravitySg) => setState((prev) => ({ ...prev, wortGravitySg }))}
            hopAdditions={state.hopAdditions}
            onHopAdditionsChange={(hopAdditions) => setState((prev) => ({ ...prev, hopAdditions }))}
            ibuFormula={state.ibuFormula}
            onIbuFormulaChange={(ibuFormula) => setState((prev) => ({ ...prev, ibuFormula }))}
            garetzExtras={state.garetzExtras}
            onGaretzExtrasChange={(garetzExtras) => setState((prev) => ({ ...prev, garetzExtras }))}
          />
        ) : null}

        {activeTab === 'recipes' ? (
          <RecipeSnapshotsPanel
            currentState={state}
            snapshots={recipeSnapshots}
            onAddSnapshot={addRecipeSnapshot}
            onDeleteSnapshot={deleteRecipeSnapshot}
            onLoadSnapshot={(loadedState) => setState(loadedState)}
          />
        ) : null}

        {activeTab === 'backup' ? (
          <BackupPanel grainBill={state.grainBill} fermentationBatches={fermentationBatches} />
        ) : null}

        {activeTab === 'about' ? <AboutPanel /> : null}

        {nextTab ? (
          <div className="mt-6 border-t border-amber-200 pt-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab(nextTab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex min-h-[52px] w-full items-center justify-between gap-2 rounded-xl bg-teal-700 px-4 py-3 text-left font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 active:bg-teal-900"
            >
              <span className="flex flex-col">
                <span className="text-xs font-normal uppercase tracking-wide text-parchment/70">Next Step</span>
                <span className="flex items-center gap-1.5">
                  <nextTab.icon className="h-4 w-4 flex-shrink-0" />
                  {nextTab.label}
                </span>
              </span>
              <span aria-hidden="true" className="text-lg">
                →
              </span>
            </button>
          </div>
        ) : null}
      </div>

      <footer className="flex flex-col items-center gap-2 border-t border-amber-200 pt-6 text-center font-body text-xs text-amber-700/70">
        <p className="font-display text-sm font-bold text-amber-900">Indian Brewer&apos;s Calculator</p>
        <p>All units metric: Liters, Hectoliters, milligrams, grams, °Celsius, °Lovibond for grain color.</p>
        <p>
          Built by Ankur Napa &middot;{' '}
          <a
            href="https://www.linkedin.com/in/ankur-napa"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-900"
          >
            LinkedIn
          </a>{' '}
          &middot;{' '}
          <a href="mailto:napaankur@gmail.com" className="underline hover:text-amber-900">
            napaankur@gmail.com
          </a>
        </p>
        <p className="max-w-md text-amber-700/60">
          By default, this app does not collect or transmit your data anywhere -- all entries are saved only in
          your own browser&apos;s local storage on this device, and clearing your browser data will erase it. If
          you choose to use Google Sync (Backup &amp; Sync tab), your data is written to a private spreadsheet
          in your own Google Drive -- never to any server we run. We take no responsibility for the
          confidentiality or backup of data stored either way.
        </p>
      </footer>
    </main>
  );
}
