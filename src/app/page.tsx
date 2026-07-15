'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabDef } from '@/components/ui/Tabs';
import { WhereNext } from '@/components/ui/WhereNext';
import { TAB_GROUP_BY_ID } from '@/lib/navigation';
import { SessionSummary } from '@/components/ui/SessionSummary';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ShareAppButton } from '@/components/ui/ShareAppButton';
import { useLanguage } from '@/i18n/LanguageContext';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { roundForDisplay } from '@/lib/units';
import { WaterReportForm } from '@/components/water-report/WaterReportForm';
import { WaterVitals } from '@/components/water-report/WaterVitals';
import { TargetStyleReference } from '@/components/water-report/TargetStyleReference';
import { MashAdjustmentPanel } from '@/components/mash-adjustment/MashAdjustmentPanel';
import { SpargeAdjustmentPanel } from '@/components/sparge-adjustment/SpargeAdjustmentPanel';
import { BlendingPanel } from '@/components/blending/BlendingPanel';
import { MixingCrossPanel } from '@/components/mixing-cross/MixingCrossPanel';
import { BrewhouseYieldPanel } from '@/components/brewhouse-yield/BrewhouseYieldPanel';
import { WaterVolumesPanel } from '@/components/water-volumes/WaterVolumesPanel';
import { BrewhouseCalculatorsPanel } from '@/components/brewhouse/BrewhouseCalculatorsPanel';
import { TransferLauteringPanel } from '@/components/transfer-lautering/TransferLauteringPanel';
import { FermentationTrackerPanel } from '@/components/fermentation-tracker/FermentationTrackerPanel';
import { StyleCheckPanel } from '@/components/style-check/StyleCheckPanel';
import { AboutPanel } from '@/components/about/AboutPanel';
import { BackupPanel } from '@/components/backup/BackupPanel';
import { HomeSummaryPanel } from '@/components/home/HomeSummaryPanel';
import { RecipeSnapshotsPanel } from '@/components/recipes/RecipeSnapshotsPanel';
import { trackTabView } from '@/lib/analytics';
import { useWaterProfile } from '@/hooks/useWaterProfile';
import { useFermentationBatches } from '@/hooks/useFermentationBatches';
import { useRecipeSnapshots } from '@/hooks/useRecipeSnapshots';
import {
  HomeIcon,
  DropletIcon,
  FlaskIcon,
  FunnelIcon,
  BlendIcon,
  MixingCrossIcon,
  KettleIcon,
  JugIcon,
  PipeFlowIcon,
  FermenterIcon,
  CalculatorIcon,
  StyleCheckIcon,
  InfoIcon,
  CloudSyncIcon,
  BookmarkIcon,
  ChartBarIcon,
} from '@/components/ui/icons';

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const { state, setState } = useWaterProfile();
  const { batches: fermentationBatches, setBatches: setFermentationBatches } = useFermentationBatches();
  const { snapshots: recipeSnapshots, addSnapshot: addRecipeSnapshot, deleteSnapshot: deleteRecipeSnapshot } = useRecipeSnapshots();

  /**
   * Ordered to mirror an actual brew-day walk-through, from water prep
   * through to packaging and record-keeping, so swiping/tapping forward
   * through the tabs follows the same order a brewer works the floor. Home
   * comes first as the session overview / checkpoint screen. Rebuilt on
   * every language change so labels stay in sync with the toggle.
   */
  const TABS: TabDef[] = useMemo(
    () => [
      { id: 'home', label: t('tab.home.label'), shortLabel: t('tab.home.short'), icon: HomeIcon },
      { id: 'water-report', label: t('tab.waterReport.label'), shortLabel: t('tab.waterReport.short'), icon: DropletIcon },
      { id: 'mash-adjustment', label: t('tab.mashAdjustment.label'), shortLabel: t('tab.mashAdjustment.short'), icon: FlaskIcon },
      { id: 'sparge-adjustment', label: t('tab.spargeAdjustment.label'), shortLabel: t('tab.spargeAdjustment.short'), icon: FunnelIcon },
      { id: 'water-volumes', label: t('tab.waterVolumes.label'), shortLabel: t('tab.waterVolumes.short'), icon: JugIcon },
      { id: 'transfer-lautering', label: t('tab.transferLautering.label'), shortLabel: t('tab.transferLautering.short'), icon: PipeFlowIcon },
      { id: 'brewhouse', label: t('tab.brewhouse.label'), shortLabel: t('tab.brewhouse.short'), icon: CalculatorIcon },
      { id: 'brewhouse-yield', label: t('tab.brewhouseYield.label'), shortLabel: t('tab.brewhouseYield.short'), icon: KettleIcon },
      { id: 'fermentation-tracker', label: t('tab.fermentationTracker.label'), shortLabel: t('tab.fermentationTracker.short'), icon: FermenterIcon },
      { id: 'style-check', label: t('tab.styleCheck.label'), shortLabel: t('tab.styleCheck.short'), icon: StyleCheckIcon },
      { id: 'blending', label: t('tab.blending.label'), shortLabel: t('tab.blending.short'), icon: BlendIcon },
      { id: 'mixing-cross', label: t('tab.mixingCross.label'), shortLabel: t('tab.mixingCross.short'), icon: MixingCrossIcon },
      { id: 'recipes', label: t('tab.recipes.label'), shortLabel: t('tab.recipes.short'), icon: BookmarkIcon },
      { id: 'backup', label: t('tab.backup.label'), shortLabel: t('tab.backup.short'), icon: CloudSyncIcon },
      { id: 'about', label: t('tab.about.label'), shortLabel: t('tab.about.short'), icon: InfoIcon },
    ].map((tab) => ({ ...tab, group: TAB_GROUP_BY_ID[tab.id as keyof typeof TAB_GROUP_BY_ID] })),
    [t],
  );

  const TAB_BY_ID = useMemo(() => new Map(TABS.map((tab) => [tab.id, tab])), [TABS]);
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
      { label: t('summary.targetStyle'), value: targetStyleName },
      ...(totalGrainKg > 0 ? [{ label: t('summary.grainBill'), value: `${totalGrainKg.toFixed(2)} kg` }] : []),
    ],
    'mash-adjustment': [
      { label: t('summary.batchVolume'), value: `${state.batchVolumeL} L` },
      { label: t('summary.targetStyle'), value: targetStyleName },
    ],
    'sparge-adjustment': [{ label: t('summary.spargeVolume'), value: `${state.spargeVolumeL} L` }],
    'water-volumes': [
      { label: t('summary.batchVolume'), value: `${state.batchVolumeL} L` },
      { label: t('summary.grainBill'), value: `${totalGrainKg.toFixed(2)} kg` },
    ],
    'transfer-lautering': [{ label: t('summary.grainBill'), value: `${totalGrainKg.toFixed(2)} kg` }],
    brewhouse: [
      { label: t('summary.batchVolume'), value: `${state.batchVolumeL} L` },
      { label: t('summary.og'), value: roundForDisplay(state.ogSg, 3).toString() },
      { label: t('summary.fg'), value: roundForDisplay(state.fgSg, 3).toString() },
    ],
    'fermentation-tracker': [],
    'style-check': [
      { label: t('summary.targetStyle'), value: targetStyleName },
      { label: t('summary.og'), value: roundForDisplay(state.ogSg, 3).toString() },
      { label: t('summary.fg'), value: roundForDisplay(state.fgSg, 3).toString() },
    ],
    blending: [],
    'mixing-cross': [],
    'brewhouse-yield': [],
    recipes: [],
    backup: [],
    about: [],
  };
  const summaryItems = summaryItemsByTab[activeTab] ?? [];

  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);

  useEffect(() => {
    document.title = activeTab === 'home' ? t('app.title') : `${activeTabDef.label} - ${t('app.title')}`;
  }, [activeTab, activeTabDef.label, t]);

  // Per-tab analytics. The initial home load is already captured by GA's
  // automatic pageview (in layout), so we skip the first effect run and
  // send a virtual pageview only on subsequent tab switches -- this is what
  // makes each calculator show up separately in GA's "Pages and screens".
  const analyticsFirstRun = useRef(true);
  useEffect(() => {
    if (analyticsFirstRun.current) {
      analyticsFirstRun.current = false;
      return;
    }
    trackTabView(activeTab, activeTabDef.label);
  }, [activeTab, activeTabDef.label]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-2 sm:px-6 sm:pb-16 sm:pt-6">
      <header className="relative hidden flex-col items-center gap-1 text-center sm:flex">
        <ShareAppButton className="absolute left-0 top-0" />
        <LanguageToggle className="absolute right-0 top-0" />
        <div className="flex items-center gap-2">
          <DropletIcon className="h-7 w-7 flex-shrink-0 text-teal-700" />
          <h1 className="font-display text-2xl font-extrabold text-amber-900 sm:text-3xl">{t('app.title')}</h1>
        </div>
        <p className="font-body text-sm text-amber-800">{t('app.tagline')}</p>
        <Link
          href="/analytics"
          className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/70 px-3 py-1 font-body text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:border-[#e08b2d]/60 hover:text-[#e08b2d]"
        >
          <ChartBarIcon className="h-3.5 w-3.5" />
          {t('app.analytics')}
        </Link>
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
              aria-label={t('app.goHome')}
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
        <div className="flex flex-shrink-0 items-center gap-2">
          {activeTab !== 'home' ? (
            <span className="rounded-full bg-amber-100 px-2 py-1 font-body text-[0.65rem] font-semibold text-amber-700">
              {t('app.stepOf', { current: activeIndex, total: TABS.length - 1 })}
            </span>
          ) : null}
          <Link
            href="/analytics"
            aria-label={t('app.analytics')}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-teal-700 hover:bg-teal-50 active:bg-teal-100"
          >
            <ChartBarIcon className="h-5 w-5" />
          </Link>
          <ShareAppButton compact />
          <LanguageToggle />
        </div>
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
          <div className="flex flex-col gap-6">
            <WaterVitals profile={state.sourceProfile} />
            <TutorialCallout
              title={t('waterReport.tutorial.title')}
              steps={[
                { lead: t('waterReport.tutorial.step1.lead'), body: t('waterReport.tutorial.step1.body') },
                { lead: t('waterReport.tutorial.step2.lead'), body: t('waterReport.tutorial.step2.body') },
                { lead: t('waterReport.tutorial.step3.lead'), body: t('waterReport.tutorial.step3.body') },
                { lead: t('waterReport.tutorial.step4.lead'), body: t('waterReport.tutorial.step4.body') },
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

        {activeTab === 'mixing-cross' ? <MixingCrossPanel /> : null}

        {activeTab === 'brewhouse-yield' ? <BrewhouseYieldPanel /> : null}

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

        {activeTab !== 'home' ? (
          <WhereNext currentTab={activeTab} tabsById={TAB_BY_ID} onNavigate={setActiveTab} />
        ) : null}
      </div>

      <footer className="flex flex-col items-center gap-2 border-t border-amber-200 pt-6 text-center font-body text-xs text-amber-700/70">
        <p className="font-display text-sm font-bold text-amber-900">{t('app.title')}</p>
        <p>{t('app.footer.units')}</p>
        <p>
          {t('app.footer.builtBy')} &middot;{' '}
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
        <p className="max-w-md text-amber-700/60">{t('app.footer.privacy')}</p>
      </footer>
    </main>
  );
}
