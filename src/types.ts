/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Trip {
  id: string;
  name?: string;
  country: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  city?: string;
  notes?: string;
  archived?: boolean;
}

export interface Settings {
  dateFormat: 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'DD.MM.YYYY';
  themeMode: 'light' | 'dark' | 'system';
}

export interface SchengenCountry {
  id: string;
  name: string;
  code: string; // ISO 3166-1 alpha-2
  capital: string;
  entryDate: string;
  description: string;
  image?: string;
}

export interface RollingWindowInfo {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  daysUsed: number;
  limit: number;
}

export interface CalculationResult {
  daysSelected: number;
  daysUsedInWindow: number;
  remainingDays: number;
  nextResetDate: string | null;
  isValid: boolean;
  message: string;
}

export interface BreachInfo {
  tripId: string;
  tripName: string;
  country: string;
  breachStartDate: string;
  daysOver: number;
}

export interface ReleaseNotesItem {
  version: string;
  date: string;
  changes: string[];
}
