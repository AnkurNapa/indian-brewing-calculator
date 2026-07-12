'use client';

import { GrainBillItem } from '@/lib/waterChemistry';
import { FermentationBatch } from '@/lib/fermentationTracker';
import { ExportImportPanel } from './ExportImportPanel';
import { SyncPanel } from '@/components/sync/SyncPanel';
import { TutorialCallout } from '@/components/ui/TutorialCallout';

interface BackupPanelProps {
  grainBill: GrainBillItem[];
  fermentationBatches: FermentationBatch[];
}

export function BackupPanel({ grainBill, fermentationBatches }: BackupPanelProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Backup & Sync</h2>
      <p className="font-body text-sm text-amber-800">
        Two independent ways to back up your data -- use either or both. Local export needs nothing but this
        browser; Google Sync needs a one-time sign-in and keeps a copy in your own Drive.
      </p>
      <TutorialCallout
        title="How to use Backup & Sync"
        steps={[
          {
            lead: '1. Local Export/Import needs nothing extra.',
            body: 'Download a .json backup (everything) or .csv tables (grain bill, fermentation readings) with one tap -- no account, no sign-in.',
          },
          {
            lead: '2. Google Sync is fully optional.',
            body: 'Sign in with your own Google account and the app writes directly to a spreadsheet it creates in your own Drive -- there is no server in between, and it never sees your data.',
          },
          {
            lead: '3. Use either, both, or neither.',
            body: 'This app never collects data automatically -- if you close the tab without exporting or syncing, your entries stay only in this browser\'s local storage on this device.',
          },
        ]}
      />
      <ExportImportPanel grainBill={grainBill} fermentationBatches={fermentationBatches} />
      <SyncPanel />
    </section>
  );
}
