/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { parseISO, format, addDays, subDays, eachDayOfInterval, isBefore, isAfter, isEqual } from 'date-fns';
import { Trip, RollingWindowInfo, CalculationResult, BreachInfo } from '../types';
import { CALCULATOR_TEXT } from '../content/ui/calculatorText';

/**
 * Returns all individual dates (as YYYY-MM-DD strings) for a given trip range, inclusive.
 */
export function getDaysForTrip(startDateStr: string, endDateStr: string): string[] {
  try {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    if (isBefore(end, start)) return [];
    
    const days = eachDayOfInterval({ start, end });
    return days.map(d => format(d, 'yyyy-MM-dd'));
  } catch (e) {
    return [];
  }
}

/**
 * Returns a Set of all unique stay days (YYYY-MM-DD) across all given trips (excluding archived ones).
 * Optionally excludes a specific tripId (useful when editing a trip).
 */
export function getAllStayDays(trips: Trip[], excludeTripId?: string): Set<string> {
  const stayDays = new Set<string>();
  trips.forEach(trip => {
    if (trip.archived || (excludeTripId && trip.id === excludeTripId)) {
      return;
    }
    const days = getDaysForTrip(trip.startDate, trip.endDate);
    days.forEach(d => stayDays.add(d));
  });
  return stayDays;
}

/**
 * Calculates the number of Schengen days used in the 180-day window ending on a reference date.
 * The 180-day window ending on D includes [D - 179 days, D].
 */
export function getDaysUsedInWindow(referenceDateStr: string, stayDays: Set<string>): number {
  try {
    const refDate = parseISO(referenceDateStr);
    const windowStart = format(subDays(refDate, 179), 'yyyy-MM-dd');
    let count = 0;
    stayDays.forEach(dayStr => {
      if (dayStr >= windowStart && dayStr <= referenceDateStr) {
        count++;
      }
    });
    return count;
  } catch (e) {
    return 0;
  }
}

/**
 * Scan all trips to detect present or future breaches of the 90-day rule.
 * A breach occurs on any day where the rolling 180-day sum exceeds 90 days.
 */
export function detectBreaches(trips: Trip[]): BreachInfo[] {
  const activeTrips = trips.filter(t => !t.archived);
  if (activeTrips.length === 0) return [];

  // Build a day-to-trip index in one pass to avoid recomputing trip day ranges repeatedly.
  const dayToTrip = new Map<string, Trip>();
  activeTrips.forEach(trip => {
    const tripDays = getDaysForTrip(trip.startDate, trip.endDate);
    tripDays.forEach(dayStr => {
      if (!dayToTrip.has(dayStr)) {
        dayToTrip.set(dayStr, trip);
      }
    });
  });

  const sortedDays = Array.from(dayToTrip.keys()).sort();
  if (sortedDays.length === 0) return [];

  const dayTimestamps = sortedDays.map(dayStr => parseISO(dayStr).getTime());
  const breaches: BreachInfo[] = [];
  const breachedTrips = new Set<string>();

  // Sliding window over unique stay days in sorted order.
  let left = 0;
  for (let right = 0; right < sortedDays.length; right++) {
    while (dayTimestamps[right] - dayTimestamps[left] > 179 * 24 * 60 * 60 * 1000) {
      left++;
    }

    const daysUsed = right - left + 1;
    if (daysUsed > 90) {
      const breachDay = sortedDays[right];
      const matchingTrip = dayToTrip.get(breachDay);

      if (matchingTrip && !breachedTrips.has(matchingTrip.id)) {
        breachedTrips.add(matchingTrip.id);
        breaches.push({
          tripId: matchingTrip.id,
          tripName: matchingTrip.name || `Trip to ${matchingTrip.country}`,
          country: matchingTrip.country,
          breachStartDate: breachDay,
          daysOver: daysUsed - 90
        });
      }
    }
  }

  return breaches;
}

/**
 * Calculates a preview for a new or edited trip before saving it.
 */
export function calculateTripPreview(
  startDateStr: string,
  endDateStr: string,
  existingTrips: Trip[],
  editingTripId?: string
): CalculationResult {
  const fillTemplate = (template: string, values: Record<string, string | number>) => {
    return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  };

  if (!startDateStr || !endDateStr) {
    return {
      daysSelected: 0,
      daysUsedInWindow: 0,
      remainingDays: 90,
      nextResetDate: null,
      isValid: true,
      message: CALCULATOR_TEXT.preview.selectDates
    };
  }

  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  
  if (isBefore(end, start)) {
    return {
      daysSelected: 0,
      daysUsedInWindow: 0,
      remainingDays: 0,
      nextResetDate: null,
      isValid: false,
      message: CALCULATOR_TEXT.preview.endDateAfterStart
    };
  }

  // 1. Calculate duration of this trip
  const tripDays = getDaysForTrip(startDateStr, endDateStr);
  const daysSelected = tripDays.length;

  // 2. Get other stays
  const otherStays = getAllStayDays(existingTrips, editingTripId);
  
  // 3. Create simulated set of stay days (other stays + this trip's stays)
  const simulatedStays = new Set<string>(otherStays);
  tripDays.forEach(day => simulatedStays.add(day));

  // 4. Find the maximum days used in any 180-day window ending on any day of this trip
  let maxDaysUsed = 0;
  let breachDate: string | null = null;
  
  tripDays.forEach(day => {
    const used = getDaysUsedInWindow(day, simulatedStays);
    if (used > maxDaysUsed) {
      maxDaysUsed = used;
    }
    if (used > 90 && !breachDate) {
      breachDate = day;
    }
  });

  // If no stays yet, the max stays in the window ending on the end date
  const finalUsed = getDaysUsedInWindow(endDateStr, simulatedStays);
  const remainingDays = Math.max(0, 90 - finalUsed);

  // 5. Calculate Next Reset Date
  // Next reset date is the earliest date after the end of this trip when past stay days roll off,
  // causing the rolling 180-day sum to decrease below the current final count (if above 0).
  let nextResetDate: string | null = null;
  if (finalUsed > 0) {
    // Find the oldest stay within the 180-day window of the end date
    const windowStart = subDays(end, 179);
    const staysInCurrentWindow = Array.from(simulatedStays)
      .map(d => parseISO(d))
      .filter(d => !isBefore(d, windowStart) && !isAfter(d, end))
      .sort((a, b) => a.getTime() - b.getTime());

    if (staysInCurrentWindow.length > 0) {
      const oldestStay = staysInCurrentWindow[0];
      // This stay will roll out of the window 180 days after its date, meaning on oldestStay + 180 days
      const rollOffDate = addDays(oldestStay, 180);
      nextResetDate = format(rollOffDate, 'yyyy-MM-dd');
    }
  }

  const isValid = maxDaysUsed <= 90;
  let message = '';
  if (isValid) {
    message = fillTemplate(CALCULATOR_TEXT.preview.valid, { daysUsed: maxDaysUsed });
  } else {
    message = fillTemplate(CALCULATOR_TEXT.preview.invalid, {
      breachDate: breachDate ? format(parseISO(breachDate), 'MMM dd, yyyy') : CALCULATOR_TEXT.preview.fallbackBreachDate,
    });
  }

  return {
    daysSelected,
    daysUsedInWindow: maxDaysUsed,
    remainingDays,
    nextResetDate,
    isValid,
    message
  };
}

/**
 * Calculates current Schengen status based on a given date (default to today).
 */
export interface CurrentStatus {
  isInside: boolean;
  daysRemaining: number;
  daysUsed: number;
  windowStart: string;
  windowEnd: string;
  lastExitDate: string | null;
}

export function getCurrentStatus(trips: Trip[], referenceDateStr: string = format(new Date(), 'yyyy-MM-dd')): CurrentStatus {
  const stayDays = getAllStayDays(trips);
  const refDate = parseISO(referenceDateStr);
  
  const isInside = stayDays.has(referenceDateStr);
  const daysUsed = getDaysUsedInWindow(referenceDateStr, stayDays);
  const daysRemaining = Math.max(0, 90 - daysUsed);
  const windowStart = format(subDays(refDate, 179), 'yyyy-MM-dd');
  
  // Find last exit date (last day of any past trip before referenceDate)
  let lastExitDate: string | null = null;
  const sortedStays = Array.from(stayDays)
    .map(d => parseISO(d))
    .filter(d => isBefore(d, refDate) || isEqual(d, refDate))
    .sort((a, b) => b.getTime() - a.getTime()); // newest first

  // If currently inside, find the end of the current trip or last exit in history
  if (sortedStays.length > 0) {
    // If not inside, the newest stay before reference date is our last exit
    if (!isInside) {
      lastExitDate = format(sortedStays[0], 'yyyy-MM-dd');
    } else {
      // Find first stay day where the day after is NOT a stay day
      for (let i = 0; i < sortedStays.length; i++) {
        const nextDay = addDays(sortedStays[i], 1);
        if (!stayDays.has(format(nextDay, 'yyyy-MM-dd'))) {
          lastExitDate = format(sortedStays[i], 'yyyy-MM-dd');
          break;
        }
      }
    }
  }

  return {
    isInside,
    daysRemaining,
    daysUsed,
    windowStart,
    windowEnd: referenceDateStr,
    lastExitDate
  };
}
