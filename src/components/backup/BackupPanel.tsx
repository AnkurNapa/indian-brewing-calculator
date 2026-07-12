'use client';

import { GrainBillItem } from '@/lib/waterChemistry';
import { useFermentationBatches } from '@/hooks/useFermentationBatches';
import { ExportImportPanel } from './ExportImportPanel';
import { SyncPanel } from '@/components/sync/SyncPanel';

interface BackupPanelProps {
  grainBill: GrainBillItem[];
}

export function BackupPanel({ grainBill }: BackupPanelProps) {
  const { batches } = useFermentationBatches();

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Backup & Sync</h2>
      <p className="font-body text-sm text-amber-800">
        Two independent ways to back up your data -- use either or both. Local export needs nothing but this
        browser; Google Sync needs a one-time sign-in and keeps a copy in your own Drive.
      </p>
      <ExportImportPanel grainBill={grainBill} fermentationBatches={batches} />
      <SyncPanel />
    </section>
  );
}
