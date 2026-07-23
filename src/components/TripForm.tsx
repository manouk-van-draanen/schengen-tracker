/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Modal,
  Pressable,
  Image,
  Platform,
  Alert 
} from 'react-native';
import { Trip, CalculationResult, Settings } from '../types';
import { SCHENGEN_COUNTRIES, getCountryImageByName } from '../utils/countries';
import { calculateTripPreview } from '../utils/schengenCalculator';
import { Calendar, ShieldCheck, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatDateString, parseDateToISO, autoFormatDateInput } from '../utils/dateFormatter';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { TRIP_FORM_TEXT } from '../content/ui/tripFormText';
import { createSectionHeaderStyles } from '../styles/sectionHeaderStyles';
import { createModalCloseButtonStyles } from '../styles/modalCloseButtonStyles';
import { createModalFrameStyles } from '../styles/modalFrameStyles';
import { createSurfaceCardStyles } from '../styles/surfaceCardStyles';
import { createActionButtonStyles } from '../styles/actionButtonStyles';
import { SPACING } from '../styles/spacing';
import { useAppTheme } from '../theme/appTheme';

interface TripFormProps {
  existingTrips: Trip[];
  editingTrip: Trip | null;
  onSave: (trip: Trip) => void;
  onCancel: () => void;
  settings: Settings;
  initialCountry?: string | null;
}

export default function TripForm({
  existingTrips,
  editingTrip,
  onSave,
  onCancel,
  settings,
  initialCountry
}: TripFormProps) {
  const theme = useAppTheme();
  const sectionHeaderStyles = useMemo(() => createSectionHeaderStyles(theme), [theme]);
  const modalCloseButtonStyles = useMemo(() => createModalCloseButtonStyles(theme), [theme]);
  const modalFrameStyles = useMemo(() => createModalFrameStyles(theme), [theme]);
  const surfaceCardStyles = useMemo(() => createSurfaceCardStyles(theme), [theme]);
  const actionButtonStyles = useMemo(() => createActionButtonStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);
  const [pickerMonth, setPickerMonth] = useState<Date>(new Date());

  const [preview, setPreview] = useState<CalculationResult>({
    daysSelected: 0,
    daysUsedInWindow: 0,
    remainingDays: 90,
    nextResetDate: null,
    isValid: true,
    message: TRIP_FORM_TEXT.initialPreview
  });

  const fillTemplate = (template: string, values: Record<string, string | number>) => {
    return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  };

  // Pre-populate if editing
  useEffect(() => {
    if (editingTrip) {
      setName(editingTrip.name || '');
      setCountry(editingTrip.country);
      setStartDate(formatDateString(editingTrip.startDate, settings.dateFormat));
      setEndDate(formatDateString(editingTrip.endDate, settings.dateFormat));
    } else if (initialCountry) {
      setName('');
      setCountry(initialCountry);
      setStartDate('');
      setEndDate('');
    } else {
      setName('');
      setCountry('');
      setStartDate('');
      setEndDate('');
    }
  }, [editingTrip, initialCountry, settings.dateFormat]);

  // Real-time calculation preview
  useEffect(() => {
    const isoStart = parseDateToISO(startDate, settings.dateFormat);
    const isoEnd = parseDateToISO(endDate, settings.dateFormat);

    if (isoStart && isoEnd && isoStart.length === 10 && isoEnd.length === 10) {
      // Basic check for overlap first
      const activeTrips = existingTrips.filter(t => !t.archived && t.id !== editingTrip?.id);
      let overlapTripName = '';
      let overlapDaysCount = 0;
      
      for (const otherTrip of activeTrips) {
        const maxStart = isoStart > otherTrip.startDate ? isoStart : otherTrip.startDate;
        const minEnd = isoEnd < otherTrip.endDate ? isoEnd : otherTrip.endDate;
        if (maxStart <= minEnd) {
          const sDate = new Date(maxStart);
          const eDate = new Date(minEnd);
          const diffMs = eDate.getTime() - sDate.getTime();
          const overlap = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
          if (overlap > 1) {
            overlapTripName = otherTrip.country;
            overlapDaysCount = overlap;
            break;
          }
        }
      }

      if (overlapDaysCount > 1) {
        setPreview({
          daysSelected: 0,
          daysUsedInWindow: 0,
          remainingDays: 90,
          nextResetDate: null,
          isValid: false,
          message: fillTemplate(TRIP_FORM_TEXT.errors.overlapPreview, {
            country: overlapTripName,
            days: overlapDaysCount,
          })
        });
      } else {
        const calc = calculateTripPreview(isoStart, isoEnd, existingTrips, editingTrip?.id);
        setPreview(calc);
      }
    } else {
      setPreview({
        daysSelected: 0,
        daysUsedInWindow: 0,
        remainingDays: 90,
        nextResetDate: null,
        isValid: true,
        message: fillTemplate(TRIP_FORM_TEXT.validDatePreview, { format: settings.dateFormat })
      });
    }
  }, [startDate, endDate, country, existingTrips, editingTrip, settings.dateFormat]);

  const openDatePicker = (target: 'start' | 'end') => {
    const source = target === 'start' ? startDate : endDate;
    const iso = parseDateToISO(source, settings.dateFormat);
    const seed = iso ? new Date(`${iso}T00:00:00`) : new Date();
    setPickerMonth(seed);
    setDatePickerTarget(target);
  };

  const handleSelectDate = (selectedDate: Date) => {
    const iso = format(selectedDate, 'yyyy-MM-dd');
    const formatted = formatDateString(iso, settings.dateFormat);
    if (datePickerTarget === 'start') {
      setStartDate(formatted);
    } else if (datePickerTarget === 'end') {
      setEndDate(formatted);
    }
    setDatePickerTarget(null);
  };

  const handleSelectTodayInPicker = () => {
    handleSelectDate(new Date());
  };

  const handleSelectCountry = (countryName: string) => {
    setCountry(countryName);
    setShowCountrySelector(false);
    setCountrySearch('');
  };

  const handleSubmit = () => {
    if (!country) {
      Alert.alert(TRIP_FORM_TEXT.errors.title, TRIP_FORM_TEXT.errors.selectCountry);
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert(TRIP_FORM_TEXT.errors.title, TRIP_FORM_TEXT.errors.fillDates);
      return;
    }

    const isoStart = parseDateToISO(startDate, settings.dateFormat);
    const isoEnd = parseDateToISO(endDate, settings.dateFormat);

    if (!isoStart || !isoEnd) {
      Alert.alert(TRIP_FORM_TEXT.errors.title, fillTemplate(TRIP_FORM_TEXT.errors.validDates, { format: settings.dateFormat }));
      return;
    }

    if (isoStart > isoEnd) {
      Alert.alert(TRIP_FORM_TEXT.errors.title, TRIP_FORM_TEXT.errors.endBeforeStart);
      return;
    }

    // Overlap verification
    const activeTrips = existingTrips.filter(t => !t.archived && t.id !== editingTrip?.id);
    for (const otherTrip of activeTrips) {
      const maxStart = isoStart > otherTrip.startDate ? isoStart : otherTrip.startDate;
      const minEnd = isoEnd < otherTrip.endDate ? isoEnd : otherTrip.endDate;
      if (maxStart <= minEnd) {
        const sDate = new Date(maxStart);
        const eDate = new Date(minEnd);
        const diffMs = eDate.getTime() - sDate.getTime();
        const overlap = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
        if (overlap > 1) {
          const formattedOtherStart = formatDateString(otherTrip.startDate, settings.dateFormat);
          const formattedOtherEnd = formatDateString(otherTrip.endDate, settings.dateFormat);
          Alert.alert(
            TRIP_FORM_TEXT.errors.overlapTitle,
            fillTemplate(TRIP_FORM_TEXT.errors.overlapAlert, {
              country: otherTrip.country,
              start: formattedOtherStart,
              end: formattedOtherEnd,
              days: overlap,
            })
          );
          return;
        }
      }
    }

    const tripData: Trip = {
      id: editingTrip ? editingTrip.id : Math.random().toString(36).substring(7),
      name: name.trim() || undefined,
      country,
      startDate: isoStart,
      endDate: isoEnd,
      archived: editingTrip ? editingTrip.archived : false
    };

    onSave(tripData);
  };

  const filteredCountries = SCHENGEN_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountryImage = useMemo(() => {
    if (!country) return null;
    return getCountryImageByName(country, '');
  }, [country]);

  const selectedCountryMeta = useMemo(() => {
    if (!country) return null;
    return SCHENGEN_COUNTRIES.find((c) => c.name === country) || null;
  }, [country]);

  const selectedStartIso = parseDateToISO(startDate, settings.dateFormat);
  const selectedEndIso = parseDateToISO(endDate, settings.dateFormat);
  const activeSelectedIso = datePickerTarget === 'start' ? selectedStartIso : selectedEndIso;
  const pickerMonthStart = startOfMonth(pickerMonth);
  const pickerMonthEnd = endOfMonth(pickerMonth);
  const pickerDays = eachDayOfInterval({ start: pickerMonthStart, end: pickerMonthEnd });
  const pickerStartOffset = getDay(pickerMonthStart);

  return (
    <View style={styles.formShell}>
      <View style={styles.formShellContent}>
        <View style={styles.formTopRow}>
          <View style={sectionHeaderStyles.header}>
            <Text style={sectionHeaderStyles.eyebrow}>{TRIP_FORM_TEXT.header.eyebrow}</Text>
            <Text style={sectionHeaderStyles.title}>
              {editingTrip ? TRIP_FORM_TEXT.header.edit : TRIP_FORM_TEXT.header.add}
            </Text>
          </View>
        </View>

      <View style={[surfaceCardStyles.primary, styles.formCard]}>

      {/* Inputs Scroll container */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.inputsList}>
        
          {/* Stay Name Field */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{TRIP_FORM_TEXT.fields.stayName}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={TRIP_FORM_TEXT.fields.stayPlaceholder}
              placeholderTextColor="#a1a1aa"
              style={styles.textInput}
            />
          </View>
          
          {/* Destination Country Field */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{TRIP_FORM_TEXT.fields.destinationCountry}</Text>
            <TouchableOpacity
              onPress={() => setShowCountrySelector(true)}
              style={[styles.selectorBtn, country && selectedCountryImage && styles.selectorBtnSelected]}
            >
              {country && selectedCountryImage ? (
                <>
                  <View style={styles.selectorSelectedMain}>
                    <Image
                      source={{ uri: selectedCountryImage }}
                      style={styles.selectorSelectedThumb}
                      resizeMode="cover"
                    />
                    <View style={styles.selectorSelectedTextWrap}>
                      <Text style={styles.selectorBtnText}>{country}</Text>
                      <Text style={styles.selectorSelectedSubText}>Tap to change destination</Text>
                    </View>
                  </View>
                  <View style={styles.selectorSelectedRight}>
                    {selectedCountryMeta?.code && (
                      <View style={styles.countryCodePill}>
                        <Text style={styles.countryCodePillText}>{selectedCountryMeta.code}</Text>
                      </View>
                    )}
                    <Text style={styles.selectorCaret}>▼</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.selectorBtnText, !country && styles.selectorBtnPlaceholder]}>
                    {country || TRIP_FORM_TEXT.fields.selectDestinationCountry}
                  </Text>
                  <Text style={styles.selectorCaret}>▼</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Dates layout */}
          <View style={styles.datesRow}>
            {/* Start Date */}
            <View style={[styles.fieldBlock, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>{TRIP_FORM_TEXT.fields.startDate}</Text>
              <View style={styles.dateInputWrapper}>
                <TextInput
                  value={startDate}
                  onChangeText={(val) => setStartDate(autoFormatDateInput(val, settings.dateFormat))}
                  placeholder={settings.dateFormat}
                  placeholderTextColor="#a1a1aa"
                  maxLength={10}
                  style={styles.textInput}
                />
                <TouchableOpacity onPress={() => openDatePicker('start')} style={styles.datePickerBtn}>
                  <Calendar size={14} color="#71717a" />
                </TouchableOpacity>
              </View>
            </View>

            {/* End Date */}
            <View style={[styles.fieldBlock, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>{TRIP_FORM_TEXT.fields.endDate}</Text>
              <View style={styles.dateInputWrapper}>
                <TextInput
                  value={endDate}
                  onChangeText={(val) => setEndDate(autoFormatDateInput(val, settings.dateFormat))}
                  placeholder={settings.dateFormat}
                  placeholderTextColor="#a1a1aa"
                  maxLength={10}
                  style={styles.textInput}
                />
                <TouchableOpacity onPress={() => openDatePicker('end')} style={styles.datePickerBtn}>
                  <Calendar size={14} color="#71717a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Real-time preview panel */}
          <View style={[styles.previewPanel, !preview.isValid && styles.previewPanelError]}>
            <View style={styles.previewHeader}>
              {preview.isValid ? (
                <ShieldCheck size={16} color="#16a34a" />
              ) : (
                <AlertTriangle size={16} color="#dc2626" />
              )}
              <Text style={[styles.previewTitle, !preview.isValid && styles.previewTitleError]}>
                {preview.isValid ? TRIP_FORM_TEXT.preview.validTitle : TRIP_FORM_TEXT.preview.invalidTitle}
              </Text>
            </View>

            <Text style={[styles.previewDesc, !preview.isValid && styles.previewDescError]}>
              {preview.message}
            </Text>

            {preview.isValid && preview.daysSelected > 0 && (
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricEyebrow}>{TRIP_FORM_TEXT.preview.selectedStay}</Text>
                  <Text style={styles.metricVal}>{preview.daysSelected} {TRIP_FORM_TEXT.preview.days}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricEyebrow}>{TRIP_FORM_TEXT.preview.windowStays}</Text>
                  <Text style={styles.metricVal}>{preview.daysUsedInWindow} {TRIP_FORM_TEXT.preview.days}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricEyebrow}>{TRIP_FORM_TEXT.preview.bufferLeft}</Text>
                  <Text style={styles.metricVal}>{preview.remainingDays} {TRIP_FORM_TEXT.preview.days}</Text>
                </View>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Save / Cancel buttons */}
      <View style={styles.formActions}>
        <TouchableOpacity onPress={onCancel} style={[actionButtonStyles.secondaryButton, styles.cancelBtn]}>
          <Text style={actionButtonStyles.secondaryText}>{TRIP_FORM_TEXT.actions.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={[actionButtonStyles.primaryButton, styles.saveBtn]}>
          <Text style={actionButtonStyles.primaryText}>
            {editingTrip ? TRIP_FORM_TEXT.actions.update : TRIP_FORM_TEXT.actions.save}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
      </View>

      <Modal
        visible={showCountrySelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountrySelector(false)}
      >
        <View style={styles.countryModalRoot}>
          <Pressable style={modalFrameStyles.pressableBackdrop} onPress={() => setShowCountrySelector(false)} />
          <View style={[modalFrameStyles.card, styles.countryModalCard]}>
            <View style={[modalFrameStyles.header, styles.countryModalHeader]}>
              <Text style={modalFrameStyles.title}>{TRIP_FORM_TEXT.fields.selectDestinationCountry}</Text>
              <TouchableOpacity onPress={() => setShowCountrySelector(false)} style={modalCloseButtonStyles.button}>
                <X size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerWrapper}>
              <TextInput
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder={TRIP_FORM_TEXT.fields.searchCountries}
                placeholderTextColor="#a1a1aa"
                style={styles.pickerSearch}
              />
              <ScrollView style={styles.pickerList} nestedScrollEnabled={true}>
                {filteredCountries.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => handleSelectCountry(c.name)}
                    style={styles.pickerItem}
                  >
                    <Text style={styles.pickerItemText}>{c.name}</Text>
                    <Text style={styles.pickerItemCode}>{c.code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={datePickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerTarget(null)}
      >
        <View style={styles.dateModalRoot}>
          <Pressable style={modalFrameStyles.pressableBackdrop} onPress={() => setDatePickerTarget(null)} />
          <View style={[modalFrameStyles.card, styles.dateModalCard]}>
            <View style={[modalFrameStyles.header, styles.dateModalHeader]}>
              <Text style={modalFrameStyles.title}>
                {datePickerTarget === 'start' ? TRIP_FORM_TEXT.actions.selectStartDate : TRIP_FORM_TEXT.actions.selectEndDate}
              </Text>
              <TouchableOpacity onPress={() => setDatePickerTarget(null)} style={modalCloseButtonStyles.button}>
                <X size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.dateMonthNav}>
              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => setPickerMonth(prev => subMonths(prev, 1))}
              >
                <ChevronLeft size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{format(pickerMonth, 'MMMM yyyy')}</Text>
              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => setPickerMonth(prev => addMonths(prev, 1))}
              >
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdaysRow}>
              {TRIP_FORM_TEXT.weekdays.map((d, idx) => (
                <Text key={`weekday-${d}-${idx}`} style={styles.weekdayLabel}>{d}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: pickerStartOffset }).map((_, i) => (
                <View key={`blank-${i}`} style={styles.dayCellBlank} />
              ))}
              {pickerDays.map((day) => {
                const iso = format(day, 'yyyy-MM-dd');
                const isActive = activeSelectedIso === iso;
                return (
                  <TouchableOpacity
                    key={iso}
                    style={[styles.dayCell, isActive && styles.dayCellActive]}
                    onPress={() => handleSelectDate(day)}
                  >
                    <Text style={[styles.dayCellText, isActive && styles.dayCellTextActive]}>
                      {format(day, 'd')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.todayInModalBtn} onPress={handleSelectTodayInPicker}>
              <Text style={styles.todayInModalBtnText}>{TRIP_FORM_TEXT.actions.useToday}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  formShell: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.appBackground,
  },
  formShellContent: {
  },
  formTopRow: {
    marginBottom: 12,
  },
  formCard: {
    position: 'relative',
    padding: SPACING.modalPadding,
    gap: SPACING.pageSectionGap,
    maxHeight: 720,
    overflow: 'hidden',
  },
  scroll: {
    maxHeight: 500,
  },
  inputsList: {
    gap: SPACING.pageSectionGap,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: theme.colors.surfaceStrong,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: theme.colors.textPrimary,
    outlineStyle: 'none',
  } as any,
  selectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  selectorBtnSelected: {
    height: 72,
    paddingHorizontal: 8,
    gap: 8,
  },
  selectorBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  selectorBtnPlaceholder: {
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  selectorCaret: {
    fontSize: 9,
    color: theme.colors.textSecondary,
  },
  selectorSelectedMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectorSelectedThumb: {
    width: 48,
    height: 48,
    borderRadius: 9,
  },
  selectorSelectedTextWrap: {
    flex: 1,
    gap: 2,
  },
  selectorSelectedSubText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  selectorSelectedRight: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  countryCodePill: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.surface,
  },
  countryCodePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  pickerWrapper: {
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 16,
    padding: SPACING.modalListGap,
    gap: 10,
    flex: 1,
  },
  pickerSearch: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 12,
    color: theme.colors.textPrimary,
    outlineStyle: 'none',
  } as any,
  pickerList: {
    flex: 1,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.modalRowPadding,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  pickerItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  pickerItemCode: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: theme.colors.textMuted,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  dateInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  datePickerBtn: {
    position: 'absolute',
    right: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPanel: {
    backgroundColor: theme.colors.successSurface,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginTop: 6,
  },
  previewPanelError: {
    backgroundColor: theme.colors.dangerSurface,
    borderColor: theme.colors.dangerBorder,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.colors.successText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewTitleError: {
    color: theme.colors.dangerText,
  },
  previewDesc: {
    fontSize: 11,
    color: theme.colors.successText,
    lineHeight: 15,
    fontWeight: '500',
    textAlign: 'justify',
  },
  previewDescError: {
    color: theme.colors.dangerText,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.1)',
  },
  metricEyebrow: {
    fontSize: 7,
    fontWeight: '700',
    color: theme.colors.successMuted,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.successText,
    marginTop: 2,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    paddingTop: SPACING.modalListGap + 4,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
  dateModalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.modalBackdropPadding,
  },
  dateModalCard: {
    padding: SPACING.modalPadding,
    gap: SPACING.modalGap,
  },
  dateModalHeader: {
    marginBottom: SPACING.modalHeaderBottom,
  },
  dateMonthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  weekdayLabel: {
    width: '14.285%',
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  dayCellBlank: {
    width: '14.285%',
    height: 34,
  },
  dayCell: {
    width: '14.285%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellActive: {
    backgroundColor: theme.colors.accent,
  },
  dayCellText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  dayCellTextActive: {
    color: theme.colors.accentInverse,
  },
  todayInModalBtn: {
    marginTop: SPACING.modalListGap,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.surfaceMuted,
  },
  todayInModalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  countryModalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.modalBackdropPadding,
  },
  countryModalCard: {
    padding: SPACING.modalPadding,
    gap: SPACING.modalGap,
    width: '100%',
    maxHeight: '82%',
    minHeight: 520,
  },
  countryModalHeader: {
    marginBottom: SPACING.modalHeaderBottom,
  },
});
