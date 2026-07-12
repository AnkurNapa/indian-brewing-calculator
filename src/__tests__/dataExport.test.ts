import { describe, it, expect } from 'vitest';
import { grainBillToCsv, fermentationBatchesToCsv, parseBackupPayload, applyBackupPayload, BACKUP_DATA_KEYS } from '@/lib/dataExport';
import { GrainBillItem } from '@/lib/waterChemistry';
import { FermentationBatch } from '@/lib/fermentationTracker';

describe('grainBillToCsv', () => {
  it('produces a header row plus one row per grain', () => {
    const grainBill: GrainBillItem[] = [
      { name: 'Pale Malt', weightKg: 4.5, colorLovibond: 3 },
      { name: 'Crystal 60', weightKg: 0.5, colorLovibond: 60, category: 'crystal' },
    ];
    const csv = grainBillToCsv(grainBill);
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('Name,Weight (kg),Color (°L),Category');
    expect(lines[1]).toBe('Pale Malt,4.5,3,auto');
    expect(lines[2]).toBe('Crystal 60,0.5,60,crystal');
  });

  it('escapes commas and quotes in grain names', () => {
    const grainBill: GrainBillItem[] = [{ name: 'Malt, "Special"', weightKg: 1, colorLovibond: 2 }];
    const csv = grainBillToCsv(grainBill);
    expect(csv).toContain('"Malt, ""Special"""');
  });

  it('handles an empty grain bill (header only)', () => {
    const csv = grainBillToCsv([]);
    expect(csv.split('\r\n')).toHaveLength(1);
  });
});

describe('fermentationBatchesToCsv', () => {
  it('flattens batches and entries into one row per reading', () => {
    const batches: FermentationBatch[] = [
      {
        id: 'b1',
        name: 'IPA Batch 1',
        entries: [
          { id: 'e1', timestampMs: 0, gravitySg: 1.05, temperatureC: 20 },
          { id: 'e2', timestampMs: 86400000, gravitySg: 1.012, temperatureC: 19, note: 'krausen dropping' },
        ],
      },
    ];
    const csv = fermentationBatchesToCsv(batches);
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('IPA Batch 1');
    expect(lines[1]).toContain('1.05');
    expect(lines[2]).toContain('krausen dropping');
  });

  it('handles batches with no entries and no batches at all', () => {
    expect(fermentationBatchesToCsv([{ id: 'b1', name: 'Empty', entries: [] }]).split('\r\n')).toHaveLength(1);
    expect(fermentationBatchesToCsv([]).split('\r\n')).toHaveLength(1);
  });
});

describe('parseBackupPayload', () => {
  it('accepts a well-formed backup JSON string', () => {
    const json = JSON.stringify({ version: 1, exportedAt: '2026-01-01T00:00:00.000Z', data: { [BACKUP_DATA_KEYS[0]]: '{}' } });
    const result = parseBackupPayload(json);
    expect(result.ok).toBe(true);
    expect(result.payload?.data[BACKUP_DATA_KEYS[0]]).toBe('{}');
  });

  it('rejects malformed JSON', () => {
    const result = parseBackupPayload('not json {');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects valid JSON that is not a recognized backup shape', () => {
    const result = parseBackupPayload(JSON.stringify({ foo: 'bar' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a backup with the wrong version number', () => {
    const result = parseBackupPayload(JSON.stringify({ version: 2, data: {} }));
    expect(result.ok).toBe(false);
  });
});

describe('applyBackupPayload', () => {
  it('writes only recognized backup data keys into localStorage', () => {
    const payload = {
      version: 1 as const,
      exportedAt: '2026-01-01T00:00:00.000Z',
      data: {
        [BACKUP_DATA_KEYS[0]]: '{"batchVolumeL":25}',
        'some-unrelated-key': 'should not be written',
      },
    };
    applyBackupPayload(payload);
    expect(window.localStorage.getItem(BACKUP_DATA_KEYS[0])).toBe('{"batchVolumeL":25}');
    expect(window.localStorage.getItem('some-unrelated-key')).toBeNull();
  });
});
