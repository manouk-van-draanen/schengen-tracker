/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Pressable,
  Alert 
} from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Settings, Trip } from '../types';
import { RELEASE_NOTES_DATA, APP_VERSION } from '../content/releaseNotesData';
import { APP_TEXT } from '../content/ui/appText';
import { DATE_FORMAT_OPTIONS, SETTINGS_TEXT, THEME_MODE_OPTIONS } from '../content/ui/settingsText';
import { Calendar, Download, Upload, AlertTriangle, ChevronRight, Check, ChevronDown, X } from 'lucide-react-native';
import { createSectionHeaderStyles } from '../styles/sectionHeaderStyles';
import { createSurfaceCardStyles } from '../styles/surfaceCardStyles';
import { createModalFrameStyles } from '../styles/modalFrameStyles';
import { createActionButtonStyles } from '../styles/actionButtonStyles';
import { createModalCloseButtonStyles } from '../styles/modalCloseButtonStyles';
import { SPACING } from '../styles/spacing';
import { useAppTheme } from '../theme/appTheme';

interface SettingsTabProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  trips: Trip[];
  onImportTrips: (imported: Trip[]) => void;
  onClearAllData: () => void;
}

export default function SettingsTab({
  settings,
  setSettings,
  trips,
  onImportTrips,
  onClearAllData
}: SettingsTabProps) {
  const theme = useAppTheme();
  const sectionHeaderStyles = useMemo(() => createSectionHeaderStyles(theme), [theme]);
  const surfaceCardStyles = useMemo(() => createSurfaceCardStyles(theme), [theme]);
  const modalFrameStyles = useMemo(() => createModalFrameStyles(theme), [theme]);
  const actionButtonStyles = useMemo(() => createActionButtonStyles(theme), [theme]);
  const modalCloseButtonStyles = useMemo(() => createModalCloseButtonStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showDateFormatPicker, setShowDateFormatPicker] = useState(false);
  const [showThemeModePicker, setShowThemeModePicker] = useState(false);
  const latestRelease = RELEASE_NOTES_DATA[0];

  const selectedDateFormat = DATE_FORMAT_OPTIONS.find(option => option.value === settings.dateFormat) ?? DATE_FORMAT_OPTIONS[0];
  const selectedThemeMode = THEME_MODE_OPTIONS.find(option => option.value === settings.themeMode) ?? THEME_MODE_OPTIONS[2];

  const fillTemplate = (template: string, values: Record<string, string | number>) => {
    return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  };

  const buildCsvContent = () => {
    let csvContent = `${SETTINGS_TEXT.csvHeaders.join(',')}\n`;

    trips.forEach(trip => {
      const row = [
        trip.id,
        `"${(trip.name || '').replace(/"/g, '""')}"`,
        `"${trip.country.replace(/"/g, '""')}"`,
        trip.startDate,
        trip.endDate,
        trip.archived ? 'TRUE' : 'FALSE'
      ].join(',');
      csvContent += row + '\n';
    });

    return csvContent;
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleExportPDF = async () => {
    try {
      const activeTrips = trips.filter(t => !t.archived);
      const dateText = new Date().toLocaleDateString();
      const tableRows = trips.map((trip) => {
        let durationDays = 0;
        if (trip.startDate && trip.endDate) {
          const start = new Date(trip.startDate);
          const end = new Date(trip.endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        return `
          <tr>
            <td>${escapeHtml(trip.name || SETTINGS_TEXT.report.unnamedTrip)}</td>
            <td>${escapeHtml(trip.country)}</td>
            <td>${escapeHtml(trip.startDate)}</td>
            <td>${escapeHtml(trip.endDate)}</td>
            <td>${durationDays}</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; }
              h1 { margin: 0; font-size: 24px; }
              .sub { margin-top: 8px; color: #6b7280; font-size: 12px; }
              .summary { margin-top: 20px; font-size: 13px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
              th { background: #f3f4f6; text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; }
              td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
            </style>
          </head>
          <body>
            <h1>${SETTINGS_TEXT.report.title}</h1>
            <div class="sub">${SETTINGS_TEXT.report.generatedOn} ${escapeHtml(dateText)}</div>
            <div class="summary">${fillTemplate(SETTINGS_TEXT.report.summary, { total: trips.length, active: activeTrips.length, archived: trips.length - activeTrips.length })}</div>
            <table>
              <thead>
                <tr>
                  <th>${SETTINGS_TEXT.report.headers.trip}</th>
                  <th>${SETTINGS_TEXT.report.headers.country}</th>
                  <th>${SETTINGS_TEXT.report.headers.startDate}</th>
                  <th>${SETTINGS_TEXT.report.headers.endDate}</th>
                  <th>${SETTINGS_TEXT.report.headers.days}</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const pdf = await Print.printToFileAsync({ html });
      const reportPath = `${FileSystem.cacheDirectory}schengen_travel_history_${new Date().toISOString().split('T')[0]}.pdf`;
      await FileSystem.copyAsync({ from: pdf.uri, to: reportPath });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(SETTINGS_TEXT.exportAlerts.completeTitle, fillTemplate(SETTINGS_TEXT.exportAlerts.pdfCreatedAt, { path: reportPath }));
        return;
      }

      await Sharing.shareAsync(reportPath, {
        mimeType: 'application/pdf',
        dialogTitle: SETTINGS_TEXT.report.sharePdf
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      Alert.alert(SETTINGS_TEXT.exportAlerts.errorTitle, SETTINGS_TEXT.exportAlerts.pdfError);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = buildCsvContent();
      const filePath = `${FileSystem.cacheDirectory}schengen_tracker_trips_${new Date().toISOString().split('T')[0]}.csv`;
      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(SETTINGS_TEXT.exportAlerts.completeTitle, fillTemplate(SETTINGS_TEXT.exportAlerts.csvCreatedAt, { path: filePath }));
        return;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: SETTINGS_TEXT.report.shareCsv
      });
    } catch (e) {
      console.error(e);
      Alert.alert(SETTINGS_TEXT.exportAlerts.errorTitle, SETTINGS_TEXT.exportAlerts.csvError);
    }
  };

  const parseCsvTrips = (content: string) => {
    const parsedTrips: Trip[] = [];
    const lines = content.split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error('CSV file is empty or missing headers.');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const idIndex = headers.indexOf('id');
    const nameIndex = headers.indexOf('trip name');
    const countryIndex = headers.indexOf('country');
    const startIndex = headers.indexOf('start date');
    const endIndex = headers.indexOf('end date');
    const archivedIndex = headers.indexOf('archived');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }

      const cols: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      cols.push(cur.trim().replace(/^["']|["']$/g, ''));

      const country = (countryIndex !== -1 && cols[countryIndex]) ? cols[countryIndex] : '';
      const startDate = (startIndex !== -1 && cols[startIndex]) ? cols[startIndex] : '';
      const endDate = (endIndex !== -1 && cols[endIndex]) ? cols[endIndex] : '';

      if (country && startDate && endDate) {
        const id = (idIndex !== -1 && cols[idIndex]) ? cols[idIndex] : Math.random().toString(36).substring(7);
        const name = (nameIndex !== -1 && cols[nameIndex]) ? cols[nameIndex] : undefined;
        const archived = (archivedIndex !== -1 && cols[archivedIndex]) ? (cols[archivedIndex].toUpperCase() === 'TRUE') : false;

        parsedTrips.push({
          id,
          name,
          country,
          startDate,
          endDate,
          archived
        });
      }
    }

    return parsedTrips;
  };

  const handleImportFile = async () => {
    setImportError(null);
    setImportSuccess(false);

    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        multiple: false,
        copyToCacheDirectory: true
      });

      if (picked.canceled || !picked.assets.length) {
        return;
      }

      const selectedFile = picked.assets[0];
      const fileName = selectedFile.name?.toLowerCase() ?? '';
      if (!fileName.endsWith('.csv')) {
        setImportError(SETTINGS_TEXT.importErrors.unsupportedFile);
        return;
      }

      const content = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.UTF8
      });
      const parsedTrips = parseCsvTrips(content);

      if (parsedTrips.length > 0) {
        onImportTrips(parsedTrips);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError(SETTINGS_TEXT.importErrors.noTripsFound);
      }
    } catch (err) {
      console.error(err);
      setImportError(SETTINGS_TEXT.importErrors.parseFailed);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={sectionHeaderStyles.header}>
        <Text style={sectionHeaderStyles.eyebrow}>{SETTINGS_TEXT.eyebrow}</Text>
        <Text style={sectionHeaderStyles.title}>{SETTINGS_TEXT.title}</Text>
      </View>

      <View style={[surfaceCardStyles.primary, styles.card]}>
        <View style={styles.cardHeader}>
          <Calendar size={16} color={theme.colors.textPrimary} />
          <Text style={styles.cardTitle}>{SETTINGS_TEXT.appearanceTitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.selectField}
          onPress={() => setShowThemeModePicker(true)}
          accessibilityLabel={SETTINGS_TEXT.chooseAppearanceAccessibility}
        >
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionName}>{selectedThemeMode.label}</Text>
            <Text style={styles.optionExample}>{selectedThemeMode.description}</Text>
          </View>
          <ChevronDown size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Date Format Setting */}
      <View style={[surfaceCardStyles.primary, styles.card]}>
        <View style={styles.cardHeader}>
          <Calendar size={16} color={theme.colors.textPrimary} />
          <Text style={styles.cardTitle}>{SETTINGS_TEXT.dateFormatTitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.selectField}
          onPress={() => setShowDateFormatPicker(true)}
          accessibilityLabel={SETTINGS_TEXT.chooseDateFormatAccessibility}
        >
          <View>
            <Text style={styles.optionName}>{selectedDateFormat.label}</Text>
            <Text style={styles.optionExample}>Example: {selectedDateFormat.example}</Text>
          </View>
          <ChevronDown size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Backup & Data Management */}
      <View style={[surfaceCardStyles.primary, styles.card]}>
        <View style={styles.cardHeader}>
          <Download size={16} color={theme.colors.textPrimary} />
          <Text style={styles.cardTitle}>{SETTINGS_TEXT.backupTitle}</Text>
        </View>
        <Text style={styles.cardDesc}>{SETTINGS_TEXT.backupDescription}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleExportPDF} style={[actionButtonStyles.primaryButton, styles.actionBtn]}>
            <Text style={actionButtonStyles.primaryText}>{SETTINGS_TEXT.exportPdf}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExportCSV} style={[actionButtonStyles.primaryButton, styles.actionBtn]}>
            <Text style={actionButtonStyles.primaryText}>{SETTINGS_TEXT.exportCsv}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity onPress={handleImportFile} style={[actionButtonStyles.secondaryButton, styles.importBtn]}>
          <Upload size={14} color={theme.colors.textPrimary} />
          <Text style={actionButtonStyles.secondaryText}>{SETTINGS_TEXT.restoreCsv}</Text>
        </TouchableOpacity>

        {importError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{importError}</Text>
          </View>
        )}

        {importSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{SETTINGS_TEXT.importSuccess}</Text>
          </View>
        )}
      </View>

      {/* Danger Zone */}
      <View style={[surfaceCardStyles.primary, styles.card, styles.dangerCard]}>
        <View style={styles.cardHeader}>
          <AlertTriangle size={16} color={theme.colors.dangerText} />
          <Text style={[styles.cardTitle, styles.dangerTitle]}>{SETTINGS_TEXT.danger.title}</Text>
        </View>
        <Text style={[styles.cardDesc, styles.dangerDesc]}>
          {SETTINGS_TEXT.danger.description}
        </Text>

        {showClearConfirm ? (
          <View style={styles.confirmClearRow}>
            <TouchableOpacity onPress={() => setShowClearConfirm(false)} style={[actionButtonStyles.dangerSecondaryButton, styles.cancelClearBtn]}>
                <Text style={actionButtonStyles.dangerSecondaryText}>{SETTINGS_TEXT.danger.cancel}</Text>
            </TouchableOpacity>
              <TouchableOpacity onPress={() => { onClearAllData(); setShowClearConfirm(false); }} style={[actionButtonStyles.dangerButton, styles.confirmClearBtn]}>
                <Text style={actionButtonStyles.dangerText}>{SETTINGS_TEXT.danger.confirmDelete}</Text>
            </TouchableOpacity>
          </View>
        ) : (
            <TouchableOpacity onPress={() => setShowClearConfirm(true)} style={actionButtonStyles.dangerButton}>
              <Text style={actionButtonStyles.dangerText}>{SETTINGS_TEXT.danger.clearAll}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Version Info footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => setShowReleaseNotes(true)} style={styles.versionBtn}>
          <Text style={styles.versionText}>{`${APP_TEXT.versionPrefix}${APP_VERSION}`}</Text>
          <ChevronRight size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Release Notes Modal */}
      {showReleaseNotes && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowReleaseNotes(false)}
        >
          <View style={modalFrameStyles.backdrop}>
            <Pressable style={modalFrameStyles.pressableBackdrop} onPress={() => setShowReleaseNotes(false)} />
            <View style={[modalFrameStyles.card, styles.modalContent]}>
              <View style={[modalFrameStyles.header, styles.modalHeader]}>
                <Text style={[modalFrameStyles.title, styles.modalTitle]}>{SETTINGS_TEXT.releaseNotes.title}</Text>
                <TouchableOpacity onPress={() => setShowReleaseNotes(false)} style={modalCloseButtonStyles.button}>
                  <X size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.releaseNotesItem}>
                <View style={styles.releaseNotesHeader}>
                  <Text style={styles.releaseNotesVersion}>v{latestRelease.version}</Text>
                  <Text style={styles.releaseNotesDate}>{latestRelease.date}</Text>
                </View>
                <View style={styles.changesList}>
                  {latestRelease.changes.map((change, cIdx) => (
                    <View key={cIdx} style={styles.changeRow}>
                      <Check size={10} color={theme.colors.textPrimary} style={{ marginTop: 3 }} />
                      <Text style={styles.changeText}>{change}</Text>
                    </View>
                  ))}
                </View>
              </View>

            </View>
          </View>
        </Modal>
      )}

      <Modal
        visible={showThemeModePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModePicker(false)}
      >
        <View style={modalFrameStyles.backdrop}>
          <Pressable style={modalFrameStyles.pressableBackdrop} onPress={() => setShowThemeModePicker(false)} />
          <View style={[modalFrameStyles.card, styles.pickerModalContent]}>
            <View style={[modalFrameStyles.header, styles.modalHeader]}>
              <Text style={[modalFrameStyles.title, styles.modalTitle]}>{SETTINGS_TEXT.chooseAppearance}</Text>
              <TouchableOpacity onPress={() => setShowThemeModePicker(false)} style={modalCloseButtonStyles.button}>
                <X size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsList}>
              {THEME_MODE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setSettings({ ...settings, themeMode: option.value });
                    setShowThemeModePicker(false);
                  }}
                  style={styles.optionRow}
                >
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionName}>{option.label}</Text>
                    <Text style={styles.optionExample}>{option.description}</Text>
                  </View>
                  {settings.themeMode === option.value && <Check size={14} color={theme.colors.textPrimary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDateFormatPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDateFormatPicker(false)}
      >
          <View style={modalFrameStyles.backdrop}>
          <Pressable style={modalFrameStyles.pressableBackdrop} onPress={() => setShowDateFormatPicker(false)} />
          <View style={[modalFrameStyles.card, styles.pickerModalContent]}>
            <View style={[modalFrameStyles.header, styles.modalHeader]}>
              <Text style={[modalFrameStyles.title, styles.modalTitle]}>{SETTINGS_TEXT.chooseDateFormat}</Text>
              <TouchableOpacity onPress={() => setShowDateFormatPicker(false)} style={modalCloseButtonStyles.button}>
                <X size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsList}>
              {DATE_FORMAT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setSettings({ ...settings, dateFormat: option.value });
                    setShowDateFormatPicker(false);
                  }}
                  style={styles.optionRow}
                >
                  <View>
                    <Text style={styles.optionName}>{option.label}</Text>
                    <Text style={styles.optionExample}>Example: {option.example}</Text>
                  </View>
                  {settings.dateFormat === option.value && <Check size={14} color={theme.colors.textPrimary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    gap: SPACING.pageSectionGap,
  },
  card: {
    padding: SPACING.cardPadding,
    gap: SPACING.cardGap,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  cardDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    textAlign: 'justify',
  },
  optionsList: {
    gap: SPACING.modalListGap,
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: 12,
    padding: SPACING.controlPadding,
  },
  optionTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: 12,
    padding: SPACING.controlPadding,
  },
  optionName: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  optionExample: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSoft,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorBox: {
    backgroundColor: theme.colors.dangerSurface,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    fontSize: 11,
    color: theme.colors.dangerText,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: theme.colors.successSurface,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    borderRadius: 10,
    padding: 10,
  },
  successText: {
    fontSize: 11,
    color: theme.colors.successText,
    textAlign: 'center',
    fontWeight: '600',
  },
  dangerCard: {
    backgroundColor: theme.colors.dangerSurface,
    borderColor: theme.colors.dangerBorder,
  },
  dangerTitle: {
    color: theme.colors.dangerText,
  },
  dangerDesc: {
    color: theme.colors.dangerText,
  },
  confirmClearRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelClearBtn: {
    flex: 1,
  },
  confirmClearBtn: {
    flex: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  versionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    padding: SPACING.modalPadding,
    gap: SPACING.modalGap,
    maxHeight: 540,
  },
  pickerModalContent: {
    width: '100%',
    maxWidth: 360,
    padding: SPACING.modalPadding,
    gap: SPACING.modalGap,
  },
  modalTitle: {
    fontSize: 15,
  },
  modalHeader: {
    marginBottom: SPACING.modalHeaderBottom,
  },
  releaseNotesItem: {
    marginBottom: 8,
    gap: SPACING.modalListGap,
  },
  releaseNotesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  releaseNotesVersion: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  releaseNotesDate: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  changesList: {
    paddingLeft: 10,
    gap: 10,
  },
  changeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  changeText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
    flex: 1,
    textAlign: 'justify',
  },
});
