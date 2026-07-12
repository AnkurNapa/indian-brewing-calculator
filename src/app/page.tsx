'use client';

import { useState } from 'react';
import { Tabs, TabDef } from '@/components/ui/Tabs';
import { SessionSummary } from '@/components/ui/SessionSummary';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { roundForDisplay } from '@/lib/units';
import { WaterReportForm } from '@/components/water-report/WaterReportForm';
import { GrainBillEditor } from '@/components/grain-bill/GrainBillEditor';
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
import { useWaterProfile } from '@/hooks/useWaterProfile';
import {
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
} from '@/components/ui/icons';

/**
 * Ordered to mirror an actual brew-day walk-through, from water prep
 * through to packaging and record-keeping, so swiping/tapping forward
 * through the tabs follows the same order a brewer works the floor.
 */
const TABS: TabDef[] = [
  { id: 'water-report', label: 'Water Report', shortLabel: 'Water', icon: DropletIcon },
  { id: 'mash-adjustment', label: 'Mash Adjustment', shortLabel: 'Mash', icon: FlaskIcon },
  { id: 'sparge-adjustment', label: 'Sparge Adjustment', shortLabel: 'Sparge', icon: FunnelIcon },
  { id: 'water-volumes', label: 'Water Volumes', shortLabel: 'Volumes', icon: JugIcon },
  { id: 'transfer-lautering', label: 'Transfer & Lautering', shortLabel: 'Transfer', icon: PipeFlowIcon },
  { id: 'brewhouse', label: 'Brewhouse Calculators', shortLabel: 'Calcs', icon: CalculatorIcon },
  { id: 'fermentation-tracker', label: 'Fermentation Tracker', shortLabel: 'Ferment', icon: FermenterIcon },
  { id: 'style-check', label: 'BJCP Style Check', shortLabel: 'Style', icon: StyleCheckIcon },
  { id: 'blending', label: 'Blending', shortLabel: 'Blend', icon: BlendIcon },
  { id: 'backup', label: 'Backup & Sync', shortLabel: 'Backup', icon: CloudSyncIcon },
  { id: 'about', label: 'About', shortLabel: 'About', icon: InfoIcon },
];

const TAB_BY_ID = new Map(TABS.map((tab) => [tab.id, tab]));

export default function Home() {
  const [activeTab, setActiveTab] = useState('water-report');
  const { state, setState } = useWaterProfile();
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
    'water-report': totalGrainKg > 0 ? [{ label: 'Grain Bill', value: `${totalGrainKg.toFixed(2)} kg` }] : [],
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
    backup: [],
    about: [],
  };
  const summaryItems = summaryItemsByTab[activeTab] ?? [];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-2 sm:px-6 sm:pb-16 sm:pt-6">
      <header className="hidden flex-col gap-1 text-center sm:flex">
        <h1 className="font-display text-2xl font-extrabold text-amber-900 sm:text-3xl">
          Indian Brewing Water Calculator
        </h1>
        <p className="font-body text-sm text-amber-800">
          A metric (L / HL / mg / g / °C) brewing water chemistry lab notebook.
        </p>
      </header>

      {/* Compact native-style app bar on phones: current screen title only,
          since the bottom tab bar (below) carries navigation. */}
      <div className="sticky top-0 z-20 -mx-4 flex items-center gap-2 border-b-2 border-amber-200 bg-parchment/97 px-4 py-3 backdrop-blur sm:hidden">
        <activeTabDef.icon className="h-5 w-5 flex-shrink-0 text-teal-700" />
        <h1 className="font-display text-base font-bold text-amber-900">{activeTabDef.label}</h1>
      </div>

      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <SessionSummary items={summaryItems} />

      <div className="rounded-2xl border border-[#e2e6ea] bg-white p-4 shadow-sm sm:p-6">
        {activeTab === 'water-report' ? (
          <div className="flex flex-col gap-8">
            <WaterReportForm
              profile={state.sourceProfile}
              onChange={(sourceProfile) => setState((prev) => ({ ...prev, sourceProfile }))}
            />
            <GrainBillEditor
              grainBill={state.grainBill}
              onChange={(grainBill) => setState((prev) => ({ ...prev, grainBill }))}
            />
          </div>
        ) : null}

        {activeTab === 'mash-adjustment' ? (
          <MashAdjustmentPanel
            sourceProfile={state.sourceProfile}
            grainBill={state.grainBill}
            batchVolumeL={state.batchVolumeL}
            onBatchVolumeChange={(batchVolumeL) => setState((prev) => ({ ...prev, batchVolumeL }))}
            targetStyleId={state.targetStyleId}
            onTargetStyleChange={(targetStyleId) => setState((prev) => ({ ...prev, targetStyleId }))}
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

        {activeTab === 'fermentation-tracker' ? <FermentationTrackerPanel /> : null}

        {activeTab === 'brewhouse' ? (
          <BrewhouseCalculatorsPanel
            og={state.ogSg}
            onOgChange={(ogSg) => setState((prev) => ({ ...prev, ogSg }))}
            fg={state.fgSg}
            onFgChange={(fgSg) => setState((prev) => ({ ...prev, fgSg }))}
            batchVolumeL={state.batchVolumeL}
            onBatchVolumeChange={(batchVolumeL) => setState((prev) => ({ ...prev, batchVolumeL }))}
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
          />
        ) : null}

        {activeTab === 'backup' ? <BackupPanel grainBill={state.grainBill} /> : null}

        {activeTab === 'about' ? <AboutPanel /> : null}
      </div>

      <footer className="flex flex-col items-center gap-1 text-center font-body text-xs text-amber-700/70">
        <p>All units metric: Liters, Hectoliters, milligrams, grams, °Celsius, °Lovibond for grain color.</p>
        <p>
          Built by Ankur Napa &middot;{' '}
          <a
            href="https://linkedin.com/in/ankurnapa"
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
