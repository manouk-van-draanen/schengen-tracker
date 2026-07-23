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
  Image,
  Platform
} from 'react-native';
import { Trip, Settings } from '../types';
import { getCountryImageByName } from '../utils/countries';
import { getDaysForTrip, getAllStayDays, getDaysUsedInWindow } from '../utils/schengenCalculator';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isBefore, parseISO, subDays } from 'date-fns';
import { formatDateString } from '../utils/dateFormatter';
import { CALENDAR_TEXT } from '../content/ui/calendarText';
import { createStayHeroStyles } from '../styles/stayHeroStyles';
import { createSurfaceCardStyles } from '../styles/surfaceCardStyles';
import { SPACING } from '../styles/spacing';
import { useAppTheme } from '../theme/appTheme';

interface CalendarViewProps {
  trips: Trip[];
  settings: Settings;
}

export default function CalendarView({ trips, settings }: CalendarViewProps) {
  const theme = useAppTheme();
  const stayHeroStyles = useMemo(() => createStayHeroStyles(theme), [theme]);
  const surfaceCardStyles = useMemo(() => createSurfaceCardStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const activeTrips = useMemo(() => trips.filter(t => !t.archived), [trips]);
  const stayDaysSet = useMemo(() => getAllStayDays(activeTrips), [activeTrips]);
  const stayDayTripMap = useMemo(() => {
    const map = new Map<string, Trip>();
    activeTrips.forEach((trip) => {
      const tripDays = getDaysForTrip(trip.startDate, trip.endDate);
      tripDays.forEach((dayStr) => {
        if (!map.has(dayStr)) {
          map.set(dayStr, trip);
        }
      });
    });
    return map;
  }, [activeTrips]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calendar dates generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Monday-based calendar offset: Mon=0, Tue=1, ..., Sun=6
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;
  const fillers = Array.from({ length: startDayOfWeek });

  // Check which trip covers a date string
  const getTripForDate = (dateStr: string): Trip | undefined => stayDayTripMap.get(dateStr);

  const fillTemplate = (template: string, values: Record<string, string>) => {
    return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, value), template);
  };

  const formattedDate = (dateStr: string): string => {
    return formatDateString(dateStr, settings.dateFormat);
  };

  const formattedShortDateRange = (startStr: string, endStr: string): string => {
    try {
      const startFmt = formatDateString(startStr, settings.dateFormat);
      const endFmt = formatDateString(endStr, settings.dateFormat);
      return `${startFmt} – ${endFmt}`;
    } catch {
      return `${startStr} – ${endStr}`;
    }
  };

  const selectedDayCalculations = selectedDay ? (() => {
    const used = getDaysUsedInWindow(selectedDay, stayDaysSet);
    const trip = getTripForDate(selectedDay);
    return {
      used,
      trip,
      remaining: Math.max(0, 90 - used)
    };
  })() : null;

  const isSelectedDayUsageOverLimit = Boolean(
    selectedDayCalculations?.trip && selectedDayCalculations.used > 90
  );
  const isSelectedDayWindowIrrelevant = Boolean(
    selectedDayCalculations?.trip && selectedDay && isBefore(parseISO(selectedDay), subDays(new Date(), 179))
  );


  return (
    <View style={[surfaceCardStyles.primary, styles.calendarCard]}>
      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <View style={styles.headerTitleRow}>
          <CalendarIcon size={16} color={theme.colors.textPrimary} />
          
          <Text style={styles.headerTitle}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.chevronBtn}>
            <ChevronLeft size={14} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} style={styles.chevronBtn}>
            <ChevronRight size={14} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdaysRow}>
        {CALENDAR_TEXT.weekdays.map((weekday, index) => (
          <Text key={`weekday-${weekday}-${index}`} style={styles.weekdayLabel}>{weekday}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {fillers.map((_, idx) => (
          <View key={`filler-${idx}`} style={styles.gridCellSlot}>
            <View style={styles.gridCellFiller} />
          </View>
        ))}
        {daysInMonth.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isStay = stayDaysSet.has(dateStr);
          const isSelected = selectedDay === dateStr;
          const isDayToday = isToday(day);
          const isOverstay = isStay && getDaysUsedInWindow(dateStr, stayDaysSet) > 90;

          return (
            <View key={dateStr} style={styles.gridCellSlot}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedDay(isSelected ? null : dateStr)}
                style={[
                  styles.gridCell,
                  isStay && styles.gridCellStay,
                  isOverstay && styles.gridCellOverstay,
                  isDayToday && styles.gridCellToday,
                  isSelected && styles.gridCellSelected
                ]}
              >
                <Text 
                  style={[
                    styles.dayNumber,
                    isStay && styles.dayNumberStay,
                    isOverstay && styles.dayNumberOverstay,
                    isSelected && styles.dayNumberSelected,
                    isDayToday && !isSelected && styles.dayNumberToday
                  ]}
                >
                  {format(day, 'd')}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Selected Day Info Card */}
      {selectedDay && selectedDayCalculations && (
        <View style={[surfaceCardStyles.secondary, styles.infoBox]}>
          <View style={styles.infoBoxRow}>
            <Text style={styles.infoBoxLabel}>{CALENDAR_TEXT.selectedDate}</Text>
            <Text style={styles.infoBoxValue}>{formattedDate(selectedDay)}</Text>
          </View>

          <View style={styles.divider} />

          {selectedDayCalculations.trip ? (
            <View style={styles.tripBlock}>
              <View style={stayHeroStyles.imageWrapper}>
                <Image
                  source={{ uri: getCountryImageByName(selectedDayCalculations.trip.country) }}
                  style={stayHeroStyles.tripImage}
                />
                <View style={stayHeroStyles.imageOverlay} />
                <View style={stayHeroStyles.imageTextContainer}>
                  <View style={stayHeroStyles.countryBadge}>
                    <Text style={stayHeroStyles.countryBadgeText}>
                      {selectedDayCalculations.trip.country.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={stayHeroStyles.tripNameText} numberOfLines={1}>
                    {selectedDayCalculations.trip.name || fillTemplate(CALENDAR_TEXT.tripTo, { country: selectedDayCalculations.trip.country })}
                  </Text>
                  <Text style={stayHeroStyles.tripDatesText}>
                    {formattedShortDateRange(selectedDayCalculations.trip.startDate, selectedDayCalculations.trip.endDate)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.tripBlock}>
              <Text style={styles.noTripText}>{CALENDAR_TEXT.noStayScheduled}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {isSelectedDayWindowIrrelevant ? (
            <View style={[
              styles.relevanceNote,
              isSelectedDayUsageOverLimit && styles.relevanceNoteOverstay,
            ]}>
              <Text style={[
                styles.relevanceNoteText,
                isSelectedDayUsageOverLimit && styles.relevanceNoteTextOverstay,
              ]}>
                {isSelectedDayUsageOverLimit
                  ? CALENDAR_TEXT.pastOverstayIndicator
                  : CALENDAR_TEXT.pastWindowIrrelevant}
              </Text>
            </View>
          ) : (
            <View style={styles.metricsGrid}>
              <View style={[surfaceCardStyles.primary, styles.metricItem]}>
                <Text style={styles.metricEyebrow}>{CALENDAR_TEXT.windowUsage}</Text>
                <Text style={[styles.metricBigText, isSelectedDayUsageOverLimit && styles.metricBigTextOverLimit]}>
                  {selectedDayCalculations.used} {CALENDAR_TEXT.days}
                </Text>
                <Text style={styles.metricSubText}>{CALENDAR_TEXT.inWindow}</Text>
              </View>
              <View style={[surfaceCardStyles.primary, styles.metricItem]}>
                <Text style={styles.metricEyebrow}>{CALENDAR_TEXT.availableAllowance}</Text>
                <Text style={styles.metricBigText}>{selectedDayCalculations.remaining} {CALENDAR_TEXT.days}</Text>
                <Text style={styles.metricSubText}>{CALENDAR_TEXT.remainingBuffer}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  calendarCard: {
    padding: SPACING.cardPadding,
    gap: SPACING.cardGap,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 6,
  },
  chevronBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
    paddingBottom: 6,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCellSlot: {
    width: '14.28%',
    height: 56,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  gridCellFiller: {
    width: '100%',
    height: '100%',
  },
  gridCell: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    borderRadius: 8,
    position: 'relative',
  },
  gridCellStay: {
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: 'rgba(9, 9, 11, 0.05)',
  },
  gridCellOverstay: {
    backgroundColor: theme.colors.dangerSurface,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
  },
  gridCellToday: {
    borderWidth: 1,
    borderColor: theme.colors.textPrimary,
  },
  gridCellSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
    zIndex: 10,
  },
  dayNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  dayNumberStay: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  dayNumberOverstay: {
    color: theme.colors.warningAccent,
    fontWeight: '800',
  },
  dayNumberSelected: {
    color: theme.colors.accentInverse,
    fontWeight: '700',
  },
  dayNumberToday: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
  },
  infoBox: {
    padding: SPACING.controlPadding,
    gap: 10,
    marginTop: 8,
  },
  infoBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  infoBoxValue: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSoft,
  },
  tripBlock: {
    paddingVertical: 2,
    gap: 4,
  },
  noTripText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  relevanceNote: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: 12,
    padding: SPACING.controlPadding,
  },
  relevanceNoteOverstay: {
    backgroundColor: theme.colors.dangerSurface,
    borderColor: theme.colors.dangerBorder,
  },
  relevanceNoteText: {
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSecondary,
    textAlign: 'justify',
  },
  relevanceNoteTextOverstay: {
    color: theme.colors.dangerText,
  },
  metricItem: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  metricEyebrow: {
    fontSize: 8,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricBigText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  metricBigTextOverLimit: {
    color: theme.colors.warningAccent,
  },
  metricSubText: {
    fontSize: 8,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
