import { describe, it, expect } from 'vitest';
import { parseSpreadsheetIdFromInput, spreadsheetUrl } from '@/lib/googleSync';

describe('parseSpreadsheetIdFromInput', () => {
  it('extracts the ID from a full Google Sheets edit URL', () => {
    const id = parseSpreadsheetIdFromInput(
      'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit#gid=0',
    );
    expect(id).toBe('1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890');
  });

  it('accepts a bare spreadsheet ID', () => {
    const id = parseSpreadsheetIdFromInput('1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890');
    expect(id).toBe('1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890');
  });

  it('trims whitespace around the input', () => {
    const id = parseSpreadsheetIdFromInput('  1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890  ');
    expect(id).toBe('1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890');
  });

  it('returns null for empty input', () => {
    expect(parseSpreadsheetIdFromInput('')).toBeNull();
    expect(parseSpreadsheetIdFromInput('   ')).toBeNull();
  });

  it('returns null for input that is too short to be a real ID or URL', () => {
    expect(parseSpreadsheetIdFromInput('not-a-real-id')).toBeNull();
  });
});

describe('spreadsheetUrl', () => {
  it('builds a valid Google Sheets edit URL from an ID', () => {
    expect(spreadsheetUrl('abc123')).toBe('https://docs.google.com/spreadsheets/d/abc123/edit');
  });
});
