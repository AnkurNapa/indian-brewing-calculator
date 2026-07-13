'use client';

import { GrainBillItem } from '@/lib/waterChemistry';
import { FermentationBatch } from '@/lib/fermentationTracker';
import { ExportImportPanel } from './ExportImportPanel';
import { SyncPanel } from '@/components/sync/SyncPanel';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { useLanguage } from '@/i18n/LanguageContext';

interface BackupPanelProps {
  grainBill: GrainBillItem[];
  fermentationBatches: FermentationBatch[];
}

export function BackupPanel({ grainBill, fermentationBatches }: BackupPanelProps) {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('backup.heading')}</h2>
      <p className="font-body text-sm text-amber-800">{t('backup.intro')}</p>
      <TutorialCallout
        title={t('backup.tutorial.title')}
        steps={[
          {
            lead: t('backup.tutorial.step1.lead'),
            body: t('backup.tutorial.step1.body'),
          },
          {
            lead: t('backup.tutorial.step2.lead'),
            body: t('backup.tutorial.step2.body'),
          },
          {
            lead: t('backup.tutorial.step3.lead'),
            body: t('backup.tutorial.step3.body'),
          },
        ]}
      />
      <ExportImportPanel grainBill={grainBill} fermentationBatches={fermentationBatches} />
      <SyncPanel />
    </section>
  );
}
