'use client';

import { useRef, useState } from 'react';
import { GrainBillItem } from '@/lib/waterChemistry';
import { FermentationBatch } from '@/lib/fermentationTracker';
import {
  buildBackupPayload,
  grainBillToCsv,
  fermentationBatchesToCsv,
  parseBackupPayload,
  applyBackupPayload,
  downloadTextFile,
} from '@/lib/dataExport';
import { useLanguage } from '@/i18n/LanguageContext';

interface ExportImportPanelProps {
  grainBill: GrainBillItem[];
  fermentationBatches: FermentationBatch[];
}

function timestampedFilename(base: string, extension: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${base}-${stamp}.${extension}`;
}

export function ExportImportPanel({ grainBill, fermentationBatches }: ExportImportPanelProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const exportFullBackup = () => {
    const payload = buildBackupPayload();
    downloadTextFile(timestampedFilename('brewing-calculator-backup', 'json'), JSON.stringify(payload, null, 2), 'application/json');
  };

  const exportGrainBillCsv = () => {
    downloadTextFile(timestampedFilename('grain-bill', 'csv'), grainBillToCsv(grainBill), 'text/csv');
  };

  const exportFermentationCsv = () => {
    downloadTextFile(timestampedFilename('fermentation-log', 'csv'), fermentationBatchesToCsv(fermentationBatches), 'text/csv');
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const result = parseBackupPayload(text);
    if (!result.ok || !result.payload) {
      setImportMessage({ text: result.error ?? t('backup.import.genericError'), isError: true });
      return;
    }
    applyBackupPayload(result.payload);
    setImportMessage({ text: t('backup.import.success'), isError: false });
    window.location.reload();
  };

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">
        {t('backup.export.title')}
      </h3>
      <p className="mt-1 font-body text-sm text-ink">{t('backup.export.description')}</p>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={exportFullBackup}
          className="min-h-[44px] rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
        >
          {t('backup.export.fullBackup')}
        </button>
        <button
          type="button"
          onClick={exportGrainBillCsv}
          className="min-h-[44px] rounded-md border-2 border-teal-700 px-4 py-2 font-body text-sm font-semibold text-teal-800 hover:bg-teal-100"
        >
          {t('backup.export.grainBillCsv')}
        </button>
        <button
          type="button"
          onClick={exportFermentationCsv}
          className="min-h-[44px] rounded-md border-2 border-teal-700 px-4 py-2 font-body text-sm font-semibold text-teal-800 hover:bg-teal-100"
        >
          {t('backup.export.fermentationCsv')}
        </button>
      </div>

      <div className="mt-4 border-t border-amber-200 pt-3">
        <label className="flex flex-col gap-1">
          <span className="font-body text-sm font-medium text-amber-900">{t('backup.import.label')}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
            }}
            className="font-body text-sm text-ink"
          />
        </label>
        {importMessage ? (
          <p className={`mt-2 text-sm ${importMessage.isError ? 'text-red-600' : 'text-teal-800'}`}>
            {importMessage.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
