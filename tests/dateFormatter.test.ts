import { describe, expect, it } from 'vitest';
import { autoFormatDateInput, formatDateString, parseDateToISO } from '../src/utils/dateFormatter';

describe('formatDateString', () => {
  it('formats ISO dates as DD-MM-YYYY by default', () => {
    expect(formatDateString('2026-07-23', 'DD-MM-YYYY')).toBe('23-07-2026');
  });

  it('formats ISO dates as MM-DD-YYYY', () => {
    expect(formatDateString('2026-07-23', 'MM-DD-YYYY')).toBe('07-23-2026');
  });

  it('returns empty string for empty input', () => {
    expect(formatDateString('', 'DD-MM-YYYY')).toBe('');
  });
});

describe('parseDateToISO', () => {
  it('parses DD-MM-YYYY values to ISO format', () => {
    expect(parseDateToISO('23-07-2026', 'DD-MM-YYYY')).toBe('2026-07-23');
  });

  it('parses MM-DD-YYYY values to ISO format', () => {
    expect(parseDateToISO('07-23-2026', 'MM-DD-YYYY')).toBe('2026-07-23');
  });

  it('returns empty string for invalid date text', () => {
    expect(parseDateToISO('abcd', 'DD-MM-YYYY')).toBe('');
  });

  it('accepts valid YYYY-MM-DD input as-is', () => {
    expect(parseDateToISO('2026-07-23', 'YYYY-MM-DD')).toBe('2026-07-23');
  });
});

describe('autoFormatDateInput', () => {
  it('formats DD-MM-YYYY progressively', () => {
    expect(autoFormatDateInput('23072026', 'DD-MM-YYYY')).toBe('23-07-2026');
  });

  it('formats DD.MM.YYYY progressively', () => {
    expect(autoFormatDateInput('23072026', 'DD.MM.YYYY')).toBe('23.07.2026');
  });

  it('formats YYYY-MM-DD progressively', () => {
    expect(autoFormatDateInput('20260723', 'YYYY-MM-DD')).toBe('2026-07-23');
  });
});