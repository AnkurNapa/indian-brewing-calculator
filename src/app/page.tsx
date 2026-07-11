'use client';

import { useState } from 'react';
import { Tabs, TabDef } from '@/components/ui/Tabs';
import { WaterReportForm } from '@/components/water-report/WaterReportForm';
import { GrainBillEditor } from '@/components/grain-bill/GrainBillEditor';
import { MashAdjustmentPanel } from '@/components/mash-adjustment/MashAdjustmentPanel';
import { SpargeAdjustmentPanel } from '@/components/sparge-adjustment/SpargeAdjustmentPanel';
import { BlendingPanel } from '@/components/blending/BlendingPanel';
import { useWaterProfile } from '@/hooks/useWaterProfile';

const TABS: TabDef[] = [
  { id: 'water-report', label: 'Water Report' },
  { id: 'mash-adjustment', label: 'Mash Adjustment' },
  { id: 'sparge-adjustment', label: 'Sparge Adjustment' },
  { id: 'blending', label: 'Blending' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('water-report');
  const { state, setState } = useWaterProfile();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="font-display text-2xl font-extrabold text-amber-900 sm:text-3xl">
          Indian Brewing Water Calculator
        </h1>
        <p className="font-body text-sm text-amber-800">
          A metric (L / HL / mg / g / °C) brewing water chemistry lab notebook.
        </p>
      </header>

      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

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
      </div>

      <footer className="text-center font-body text-xs text-amber-700/70">
        All units metric: Liters, Hectoliters, milligrams, grams, °Celsius, °Lovibond for grain color.
      </footer>
    </main>
  );
}
