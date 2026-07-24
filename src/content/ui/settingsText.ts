import { Settings } from '../../types';

export const DATE_FORMAT_OPTIONS: Array<{
  value: Settings['dateFormat'];
  label: string;
  example: string;
}> = [
  { value: 'DD-MM-YYYY', label: 'DD - MM - YYYY', example: '21 - 07 - 2026' },
  { value: 'MM-DD-YYYY', label: 'MM - DD - YYYY', example: '07 - 21 - 2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY - MM - DD', example: '2026 - 07 - 21' },
];

export const THEME_MODE_OPTIONS: Array<{
  value: Settings['themeMode'];
  label: string;
  description: string;
}> = [
  { value: 'light', label: 'Light', description: 'Keep the app in light mode all the time.' },
  { value: 'dark', label: 'Dark', description: 'Keep the app in dark mode all the time.' },
  { value: 'system', label: 'System', description: 'Automatically match your device appearance.' },
];

export const SETTINGS_TEXT = {
  eyebrow: 'Preferences',
  title: 'Settings',
  planTitle: 'Plan',
  planDescription: 'See whether this app instance is currently running on Free or Pro access.',
  planStatusLabel: 'Current access',
  planStatusFree: 'Free',
  planStatusPro: 'Pro',
  planOverrideLabel: 'Testing override',
  planOverrideNone: 'Store-driven entitlement',
  planOverrideFree: 'Forced Free via environment variable',
  planOverridePro: 'Forced Pro via environment variable',
  appearanceTitle: 'Appearance',
  chooseAppearance: 'Choose your look',
  chooseAppearanceAccessibility: 'Choose appearance mode',
  dateFormatTitle: 'Date Format',
  chooseDateFormat: 'Choose how dates appear',
  chooseDateFormatAccessibility: 'Choose date format',
  backupTitle: 'Backup and Reports',
  backupDescription: 'Keep your travel history safe by exporting a polished PDF report or a CSV backup.',
  exportPdf: 'Export PDF Report',
  exportCsv: 'Export CSV Backup',
  restoreCsv: 'Restore Trips from CSV Backup',
  importSuccess: 'Your trips were imported successfully.',
  importErrors: {
    unsupportedFile: 'That file type is not supported. Please choose a CSV backup file.',
    noTripsFound: 'No valid trips were found in that backup file.',
    parseFailed: 'We could not read that backup file. Please check the format and try again.',
  },
  exportAlerts: {
    completeTitle: 'Export Ready',
    errorTitle: 'Error',
    pdfError: 'Something went wrong while creating your PDF report. Please try again.',
    csvError: 'Something went wrong while exporting your CSV backup.',
    pdfCreatedAt: 'PDF saved to: {path}',
    csvCreatedAt: 'CSV saved to: {path}',
  },
  danger: {
    title: 'Danger Zone',
    description: 'Permanently remove all local trips and app preferences from this device. This cannot be undone.',
    cancel: 'Cancel',
    confirmDelete: 'Delete Everything Permanently',
    clearAll: 'Clear All Local Data',
  },
  releaseNotes: {
    title: 'Release Notes',
    close: 'Close',
  },
  report: {
    title: 'Schengen Tracker - Trip History Report',
    generatedOn: 'Generated on:',
    summary: 'Total trips: {total} ({active} active, {archived} archived)',
    unnamedTrip: 'Unnamed Trip',
    headers: {
      trip: 'Trip Name or Purpose',
      country: 'Country',
      startDate: 'Start Date',
      endDate: 'End Date',
      days: 'Days',
    },
    sharePdf: 'Share PDF Report',
    shareCsv: 'Share CSV Backup',
  },
  csvHeaders: ['ID', 'Trip Name', 'Country', 'Start Date', 'End Date', 'Archived'],
};
