import { describe, expect, it } from 'vitest';
import {
  calculateTripPreview,
  detectBreaches,
  getAllStayDays,
  getCurrentStatus,
  getDaysForTrip,
  getDaysUsedInWindow,
} from '../src/utils/schengenCalculator';
import { Trip } from '../src/types';

function trip(id: string, country: string, startDate: string, endDate: string, archived = false): Trip {
  return { id, country, startDate, endDate, archived };
}

describe('getDaysForTrip', () => {
  it('returns all days in a range inclusive', () => {
    expect(getDaysForTrip('2026-01-01', '2026-01-03')).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });

  it('returns empty array when end date is before start date', () => {
    expect(getDaysForTrip('2026-01-03', '2026-01-01')).toEqual([]);
  });
});

describe('getAllStayDays', () => {
  it('ignores archived trips and optionally excludes a trip id', () => {
    const stays = getAllStayDays([
      trip('a', 'France', '2026-01-01', '2026-01-03'),
      trip('b', 'Spain', '2026-01-04', '2026-01-04', true),
      trip('c', 'Italy', '2026-01-05', '2026-01-06'),
    ], 'c');

    expect(Array.from(stays).sort()).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
  });
});

describe('getDaysUsedInWindow', () => {
  it('counts only days inside the trailing 180-day window', () => {
    const stayDays = new Set(['2026-01-03', '2026-01-04', '2026-07-01']);
    expect(getDaysUsedInWindow('2026-07-01', stayDays)).toBe(3);
  });
});

describe('detectBreaches', () => {
  it('detects a 91-day stay breach', () => {
    const breaches = detectBreaches([trip('a', 'France', '2026-01-01', '2026-04-01')]);

    expect(breaches).toHaveLength(1);
    expect(breaches[0].tripId).toBe('a');
    expect(breaches[0].country).toBe('France');
    expect(breaches[0].breachStartDate).toBe('2026-04-01');
    expect(breaches[0].daysOver).toBe(1);
  });

  it('returns no breaches for short stays', () => {
    const breaches = detectBreaches([trip('a', 'France', '2026-01-01', '2026-01-10')]);
    expect(breaches).toEqual([]);
  });
});

describe('calculateTripPreview', () => {
  it('returns guidance when dates are missing', () => {
    const result = calculateTripPreview('', '', []);

    expect(result.isValid).toBe(true);
    expect(result.remainingDays).toBe(90);
    expect(result.message).toContain('Pick your dates');
  });

  it('returns invalid result when end date is before start date', () => {
    const result = calculateTripPreview('2026-07-23', '2026-07-20', []);

    expect(result.isValid).toBe(false);
    expect(result.message).toContain('end date');
  });

  it('returns valid summary and next reset date for a normal trip', () => {
    const existingTrips = [trip('a', 'France', '2026-01-01', '2026-01-10')];
    const result = calculateTripPreview('2026-01-15', '2026-01-19', existingTrips);

    expect(result.isValid).toBe(true);
    expect(result.daysSelected).toBe(5);
    expect(result.daysUsedInWindow).toBe(15);
    expect(result.remainingDays).toBe(75);
    expect(result.nextResetDate).toBe('2026-06-30');
    expect(result.message).toContain('Great news');
  });

  it('returns invalid result when a trip breaks the 90-day rule', () => {
    const existingTrips = [trip('a', 'France', '2026-01-01', '2026-03-31')];
    const result = calculateTripPreview('2026-04-01', '2026-04-01', existingTrips);

    expect(result.isValid).toBe(false);
    expect(result.daysUsedInWindow).toBeGreaterThan(90);
    expect(result.message).toContain('90/180-day rule');
  });
});

describe('getCurrentStatus', () => {
  it('reports inside status and remaining days for a reference date', () => {
    const trips = [trip('a', 'France', '2026-02-01', '2026-02-03')];
    const status = getCurrentStatus(trips, '2026-02-02');

    expect(status.isInside).toBe(true);
    expect(status.daysUsed).toBe(2);
    expect(status.daysRemaining).toBe(88);
    expect(status.windowEnd).toBe('2026-02-02');
  });
});