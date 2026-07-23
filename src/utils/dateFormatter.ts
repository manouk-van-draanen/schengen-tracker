/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format, parseISO } from 'date-fns';

export function formatDateString(dateStr: string | Date, dateFormat: string): string {
  if (!dateStr) return '';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    switch (dateFormat) {
      case 'MM/DD/YYYY':
      case 'MM-DD-YYYY':
        return format(d, 'MM-dd-yyyy');
      case 'YYYY-MM-DD':
        return format(d, 'yyyy-MM-dd');
      case 'DD.MM.YYYY':
        return format(d, 'dd.MM.yyyy');
      case 'DD/MM/YYYY':
      case 'DD-MM-YYYY':
        return format(d, 'dd-MM-yyyy');
      default:
        return format(d, 'dd-MM-yyyy');
    }
  } catch {
    return typeof dateStr === 'string' ? dateStr : '';
  }
}

export function parseDateToISO(displayStr: string, dateFormat: string): string {
  if (!displayStr) return '';
  const cleaned = displayStr.trim();
  
  if (dateFormat === 'YYYY-MM-DD') {
    // Basic regex check for YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return cleaned;
    }
    return '';
  }
  
  // Extract digits
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length !== 8) {
    return '';
  }
  
  let day = '';
  let month = '';
  let year = '';
  
  if (dateFormat === 'MM/DD/YYYY' || dateFormat === 'MM-DD-YYYY') {
    month = digits.substring(0, 2);
    day = digits.substring(2, 4);
    year = digits.substring(4, 8);
  } else {
    // DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
    day = digits.substring(0, 2);
    month = digits.substring(2, 4);
    year = digits.substring(4, 8);
  }
  
  // Basic validation
  const yNum = parseInt(year, 10);
  const mNum = parseInt(month, 10);
  const dNum = parseInt(day, 10);
  
  if (yNum > 1900 && yNum < 2100 && mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
    return `${year}-${month}-${day}`;
  }
  
  return '';
}

export function autoFormatDateInput(text: string, dateFormat: string): string {
  const digits = text.replace(/\D/g, '');
  
  if (dateFormat === 'YYYY-MM-DD') {
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.substring(0, 4)}-${digits.substring(4)}`;
    } else {
      return `${digits.substring(0, 4)}-${digits.substring(4, 6)}-${digits.substring(6, 8)}`;
    }
  } else {
    const separator = dateFormat.includes('.') ? '.' : '-';
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.substring(0, 2)}${separator}${digits.substring(2)}`;
    } else {
      return `${digits.substring(0, 2)}${separator}${digits.substring(2, 4)}${separator}${digits.substring(4, 8)}`;
    }
  }
}
