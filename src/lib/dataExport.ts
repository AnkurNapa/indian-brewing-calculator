/**
 * Local data export/import -- a dependency-free backup mechanism that
 * works without any account or network access. Two shapes:
 *
 *  - Full JSON backup: round-trips every localStorage key this app
 *    uses, safe to Import later to fully restore state (used for
 *    device-to-device migration or just peace of mind).
 *  - CSV exports: grain bill and fermentation log, flattened into
 *    spreadsheet-friendly tables that open directly in Excel/Sheets
 *    for record-keeping, but are read-only (not re-imported).
 */

import { GrainBillItem } from './waterChemistry';
import { FermentationBatch } from './fermentationTracker';

export const BACKUP_DATA_KEYS = [
  'indian-brewing-calculator/app-state/v1',
  'indian-brewing-calculator/fermentation-batches/v1',
] as const;

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

export function buildBackupPayload(): BackupPayload {
  const data: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    for (const key of BACKUP_DATA_KEYS) {
      const value = window.localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
  }
  return { version: 1, exportedAt: new Date().toISOString(), data };
}

/**
 * Error codes rather than English messages -- this module runs outside
 * React and has no access to the i18n `t()` function, so callers (which
 * do have `t()`) map a code to a translated string for display.
 */
export type ParsedBackupErrorCode = 'invalidJson' | 'unrecognizedFormat';

export interface ParsedBackupResult {
  ok: boolean;
  payload?: BackupPayload;
  errorCode?: ParsedBackupErrorCode;
}

/** Parse and structurally validate a previously-exported backup JSON string. */
export function parseBackupPayload(text: string): ParsedBackupResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, errorCode: 'invalidJson' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, errorCode: 'unrecognizedFormat' };
  }
  const candidate = parsed as Record<string, unknown>;
  if (candidate.version !== 1 || typeof candidate.data !== 'object' || candidate.data === null) {
    return { ok: false, errorCode: 'unrecognizedFormat' };
  }

  return { ok: true, payload: candidate as unknown as BackupPayload };
}

/** Apply a validated backup payload's data back into localStorage. */
export function applyBackupPayload(payload: BackupPayload): void {
  if (typeof window === 'undefined') return;
  for (const key of BACKUP_DATA_KEYS) {
    const value = payload.data[key];
    if (typeof value === 'string') {
      window.localStorage.setItem(key, value);
    }
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map((h) => csvEscape(h)).join(',')];
  for (const row of rows) {
    lines.push(row.map((cell) => csvEscape(String(cell))).join(','));
  }
  return lines.join('\r\n');
}

export function grainBillToCsv(grainBill: GrainBillItem[]): string {
  return toCsv(
    ['Name', 'Weight (kg)', 'Color (°L)', 'Category'],
    grainBill.map((item) => [item.name, item.weightKg, item.colorLovibond, item.category ?? 'auto']),
  );
}

export function fermentationBatchesToCsv(batches: FermentationBatch[]): string {
  const rows: (string | number)[][] = [];
  for (const batch of batches) {
    for (const entry of batch.entries) {
      rows.push([batch.name, new Date(entry.timestampMs).toISOString(), entry.gravitySg, entry.temperatureC, entry.note ?? '']);
    }
  }
  return toCsv(['Batch', 'Timestamp', 'Gravity (SG)', 'Temperature (°C)', 'Note'], rows);
}

/** Trigger a browser file download for the given text content. */
export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
