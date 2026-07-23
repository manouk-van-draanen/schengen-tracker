/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Animated, 
  PanResponder, 
  Platform,
  Image
} from 'react-native';
import { Trip, Settings } from '../types';
import { getCountryImageByName } from '../utils/countries';
import { detectBreaches, getAllStayDays, getDaysForTrip, getDaysUsedInWindow } from '../utils/schengenCalculator';
import CalendarView from './CalendarView';
import { Search, ChevronRight, CalendarRange, List, Trash2, X } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { formatDateString } from '../utils/dateFormatter';
import { TRIPS_TEXT } from '../content/ui/tripsText';
import { createSectionHeaderStyles } from '../styles/sectionHeaderStyles';
import { createActionButtonStyles } from '../styles/actionButtonStyles';
import { SPACING } from '../styles/spacing';
import { useAppTheme } from '../theme/appTheme';

interface TripsTabProps {
  trips: Trip[];
  onAddTripClick: () => void;
  onEditTripClick: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onDeleteMultipleTrips: (tripIds: string[]) => void;
  settings: Settings;
}

type TripDotState = 'past' | 'ongoing-safe' | 'ongoing-risk' | 'ongoing-overstay' | 'upcoming-safe' | 'upcoming-risk';

export default function TripsTab({
  trips,
  onAddTripClick,
  onEditTripClick,
  onDeleteTrip,
  onDeleteMultipleTrips,
  settings
}: TripsTabProps) {
  const theme = useAppTheme();
  const sectionHeaderStyles = useMemo(() => createSectionHeaderStyles(theme), [theme]);
  const actionButtonStyles = useMemo(() => createActionButtonStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isBulkEdit, setIsBulkEdit] = useState(false);
  const [isBulkConfirming, setIsBulkConfirming] = useState(false);
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);

  const fillTemplate = (template: string, values: Record<string, string | number>) => {
    return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  };

  const formattedDateRange = (startStr: string, endStr: string): string => {
    try {
      const startFmt = formatDateString(startStr, settings.dateFormat);
      const endFmt = formatDateString(endStr, settings.dateFormat);
      return `${startFmt.toUpperCase()} – ${endFmt.toUpperCase()}`;
    } catch {
      return `${startStr} – ${endStr}`;
    }
  };

  const formattedMonthYear = (startStr: string): string => {
    try {
      const date = parseISO(startStr);
      return format(date, 'MMM yyyy').toUpperCase();
    } catch {
      return '';
    }
  };

  // Filter trips by search query
  const filteredTrips = trips.filter(trip => {
    const query = searchQuery.toLowerCase();
    const nameMatch = (trip.name || '').toLowerCase().includes(query);
    const countryMatch = trip.country.toLowerCase().includes(query);
    const cityMatch = (trip.city || '').toLowerCase().includes(query);
    return nameMatch || countryMatch || cityMatch;
  });

  const hasSearchQuery = searchQuery.trim().length > 0;
  const showNoSearchResults = hasSearchQuery && filteredTrips.length === 0;
  const showNoTripsLogged = !hasSearchQuery && trips.length === 0;

  // Segregate trips: Ongoing, Upcoming, Past, Archived
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const allActiveTrips = useMemo(() => trips.filter(t => !t.archived), [trips]);
  const activeTrips = filteredTrips.filter(t => !t.archived);
  const activeStayDays = useMemo(() => getAllStayDays(allActiveTrips), [allActiveTrips]);
  const isCurrentlyOverstaying = useMemo(
    () => getDaysUsedInWindow(todayStr, activeStayDays) > 90,
    [todayStr, activeStayDays]
  );
  const breachTripIds = useMemo(() => {
    return new Set(detectBreaches(allActiveTrips).map((breach) => breach.tripId));
  }, [allActiveTrips]);

  const getOngoingDotState = (trip: Trip): TripDotState => {
    const willBreachBeforeEnd = breachTripIds.has(trip.id);
    if (isCurrentlyOverstaying && willBreachBeforeEnd) {
      return 'ongoing-overstay';
    }
    if (willBreachBeforeEnd) {
      return 'ongoing-risk';
    }
    return 'ongoing-safe';
  };

  const ongoingTrips: Trip[] = [];
  const upcomingTrips: Trip[] = [];
  const pastTrips: Trip[] = [];

  activeTrips.forEach(trip => {
    if (trip.startDate <= todayStr && trip.endDate >= todayStr) {
      ongoingTrips.push(trip);
    } else if (trip.startDate > todayStr) {
      upcomingTrips.push(trip);
    } else {
      pastTrips.push(trip);
    }
  });

  // Sort trips
  ongoingTrips.sort((a, b) => a.startDate.localeCompare(b.startDate));
  upcomingTrips.sort((a, b) => a.startDate.localeCompare(b.startDate));
  pastTrips.sort((a, b) => b.endDate.localeCompare(a.endDate));

  // Handle bulk selections
  const handleSelectTrip = (tripId: string) => {
    setSelectedTripIds(prev => 
      prev.includes(tripId) ? prev.filter(id => id !== tripId) : [...prev, tripId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedTripIds.length === 0) return;
    if (!isBulkConfirming) {
      setIsBulkConfirming(true);
      return;
    }
    onDeleteMultipleTrips(selectedTripIds);
    setSelectedTripIds([]);
    setIsBulkEdit(false);
    setIsBulkConfirming(false);
  };

  return (
    <View style={styles.tabContainer}>
      {/* Header section with title and switches */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={sectionHeaderStyles.eyebrow}>{TRIPS_TEXT.eyebrow}</Text>
            <Text style={sectionHeaderStyles.title}>{TRIPS_TEXT.title}</Text>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              style={styles.circleBtn}
              accessibilityLabel={TRIPS_TEXT.accessibility.toggleView}
            >
              {viewMode === 'list' ? <CalendarRange size={16} color={theme.colors.textPrimary} /> : <List size={16} color={theme.colors.textPrimary} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {viewMode === 'list' && (
          <View style={styles.searchWrapper}>
            <Search size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={TRIPS_TEXT.searchPlaceholder}
              placeholderTextColor="#a1a1aa"
              style={styles.searchInput}
            />
            {hasSearchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchClearBtn}
                accessibilityLabel={TRIPS_TEXT.accessibility.clearSearch}
              >
                <X size={14} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Sticky Bulk Actions Bar */}
      {isBulkEdit && selectedTripIds.length > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkText}>{fillTemplate(TRIPS_TEXT.bulk.selected, { count: selectedTripIds.length })}</Text>
          <View style={styles.bulkActionsRow}>
            <TouchableOpacity
              onPress={() => {
                setSelectedTripIds([]);
                setIsBulkEdit(false);
                setIsBulkConfirming(false);
              }}
              style={styles.bulkCancelBtn}
            >
              <Text style={styles.bulkCancelBtnText}>{TRIPS_TEXT.bulk.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBulkDelete}
              style={styles.bulkDeleteBtn}
            >
              <Text style={styles.bulkDeleteBtnText}>
                {isBulkConfirming ? TRIPS_TEXT.bulk.confirmDelete : TRIPS_TEXT.bulk.delete}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <CalendarView trips={trips} settings={settings} />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <View style={styles.listContainer}>
          {showNoTripsLogged ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{TRIPS_TEXT.empty.noTrips}</Text>
              <TouchableOpacity onPress={onAddTripClick} style={[actionButtonStyles.primaryButton, styles.emptyBtn]}>
                <Text style={actionButtonStyles.primaryText}>{TRIPS_TEXT.empty.logFirstTrip}</Text>
              </TouchableOpacity>
            </View>
          ) : showNoSearchResults ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{TRIPS_TEXT.empty.noSearchResults}</Text>
              <Text style={styles.emptySubText}>{TRIPS_TEXT.empty.tryDifferent}</Text>
              <TouchableOpacity onPress={() => setSearchQuery('')} style={[actionButtonStyles.secondaryButton, styles.emptySecondaryBtn]}>
                <Text style={actionButtonStyles.secondaryText}>{TRIPS_TEXT.empty.clearSearch}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 24 }}>
              {/* Ongoing section */}
              {ongoingTrips.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderLabel}>{TRIPS_TEXT.sections.ongoing}</Text>
                    <View style={styles.sectionHeaderDivider} />
                  </View>
                  <View style={styles.sectionCardList}>
                    {ongoingTrips.map(trip => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        isBulkEdit={isBulkEdit}
                        isSelected={selectedTripIds.includes(trip.id)}
                        onSelect={() => handleSelectTrip(trip.id)}
                        onEdit={() => onEditTripClick(trip)}
                        onDelete={() => onDeleteTrip(trip.id)}
                        image={getCountryImageByName(trip.country, 'https://placehold.co/300x200?text=No+Image+Found')}
                        dateRangeStr={formattedDateRange(trip.startDate, trip.endDate)}
                        dotState={getOngoingDotState(trip)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Upcoming section */}
              {upcomingTrips.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderLabel}>{TRIPS_TEXT.sections.upcoming}</Text>
                    <View style={styles.sectionHeaderDivider} />
                  </View>
                  <View style={styles.sectionCardList}>
                    {upcomingTrips.map(trip => {
                      const daysUntil = Math.max(0, getDaysForTrip(todayStr, trip.startDate).length - 1);
                      return (
                        <TripCard
                          key={trip.id}
                          trip={trip}
                          isBulkEdit={isBulkEdit}
                          isSelected={selectedTripIds.includes(trip.id)}
                          onSelect={() => handleSelectTrip(trip.id)}
                          onEdit={() => onEditTripClick(trip)}
                          onDelete={() => onDeleteTrip(trip.id)}
                          image={getCountryImageByName(trip.country, 'https://placehold.co/300x200?text=No+Image+Found')}
                          dateRangeStr={formattedDateRange(trip.startDate, trip.endDate)}
                          dotState={breachTripIds.has(trip.id) ? 'upcoming-risk' : 'upcoming-safe'}
                          tagText={daysUntil === 0 ? TRIPS_TEXT.tripCard.startsToday : fillTemplate(TRIPS_TEXT.tripCard.startsInDays, { days: daysUntil })}
                        />
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Past section */}
              {pastTrips.length > 0 && (
                <View style={[styles.section, { opacity: 0.65 }]}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderLabel}>{TRIPS_TEXT.sections.past}</Text>
                    <View style={styles.sectionHeaderDivider} />
                  </View>
                  <View style={styles.sectionCardList}>
                    {pastTrips.map(trip => {
                      const duration = getDaysForTrip(trip.startDate, trip.endDate).length;
                      return (
                        <TripCard
                          key={trip.id}
                          trip={trip}
                          isBulkEdit={isBulkEdit}
                          isSelected={selectedTripIds.includes(trip.id)}
                          onSelect={() => handleSelectTrip(trip.id)}
                          onEdit={() => onEditTripClick(trip)}
                          onDelete={() => onDeleteTrip(trip.id)}
                          image={getCountryImageByName(trip.country, 'https://placehold.co/300x200?text=No+Image+Found')}
                          dateRangeStr={`${duration} ${TRIPS_TEXT.tripCard.daysUpper} • ${formattedMonthYear(trip.startDate)}`}
                          dotState={'past'}
                        />
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Subcomponent: Swipeable TripCard
interface TripCardProps {
  key?: any;
  trip: Trip;
  isBulkEdit: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  image: string;
  dateRangeStr: string;
  dotState: TripDotState;
  tagText?: string;
}

const AnimatedView = Animated.View as any;

function TripCard({
  trip,
  isBulkEdit,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  image,
  dateRangeStr,
  dotState,
  tagText
}: TripCardProps) {
  const theme = useAppTheme();
  const cardStyles = useMemo(() => createCardStyles(theme), [theme]);
  const tripText = TRIPS_TEXT.tripCard;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;

  const dotConfig = useMemo(() => {
    switch (dotState) {
      case 'ongoing-overstay':
        return { color: theme.colors.warningAccent, shouldPulse: true };
      case 'ongoing-risk':
        return { color: '#f59e0b', shouldPulse: true };
      case 'ongoing-safe':
        return { color: '#16a34a', shouldPulse: true };
      case 'upcoming-risk':
        return { color: '#f59e0b', shouldPulse: true };
      case 'upcoming-safe':
        return { color: '#2563eb', shouldPulse: true };
      case 'past':
      default:
        return { color: theme.colors.textMuted, shouldPulse: false };
    }
  }, [dotState, theme]);

  const isPast = React.useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return trip.endDate < todayStr;
  }, [trip.endDate]);

  useEffect(() => {
    pulseValue.stopAnimation();

    if (!dotConfig.shouldPulse) {
      pulseValue.setValue(1);
      return;
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
      pulseValue.setValue(1);
    };
  }, [dotConfig.shouldPulse, pulseValue]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Activate gesture when dragging primarily horizontal and to the left
        return !isBulkEdit && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 8;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Capped leftwards drag
        if (gestureState.dx < 0) {
          const cappedDx = Math.max(-140, gestureState.dx);
          translateX.setValue(cappedDx);
        } else {
          translateX.setValue(0);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -75) {
          // Slide completely off screen leftwards
          Animated.timing(translateX, {
            toValue: -400,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            onDelete();
            translateX.setValue(0); // reset value for reuse
          });
        } else {
          // Cancel delete - snap back to origin
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      }
    })
  ).current;

  const handleCardPress = () => {
    if (isBulkEdit) {
      onSelect();
    } else {
      onEdit();
    }
  };

  return (
    <View style={cardStyles.container}>
      {/* Background container (revealed on drag) */}
      {!isBulkEdit && (
        <View style={cardStyles.background}>
          <View style={cardStyles.deleteIndicator}>
            <Trash2 size={18} color="#ffffff" />
            <Text style={cardStyles.deleteText}>{tripText.delete}</Text>
          </View>
        </View>
      )}

      {/* Main Draggable Front Card */}
      <AnimatedView
        {...panResponder.panHandlers}
        style={[
          cardStyles.frontCard,
          isSelected && cardStyles.frontCardSelected,
          { transform: [{ translateX }] }
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleCardPress}
          style={cardStyles.touchTarget}
        >
          {isBulkEdit && (
            <TouchableOpacity 
              onPress={onSelect}
              style={[cardStyles.checkbox, isSelected && cardStyles.checkboxChecked]}
            >
              {isSelected && <View style={cardStyles.checkboxInner} />}
            </TouchableOpacity>
          )}

          <View style={cardStyles.imageContainer}>
            <Image 
              style={[
                cardStyles.countryThumbnail,
                isPast && ({ filter: 'grayscale(100%)', WebkitFilter: 'grayscale(100%)', opacity: 0.7 } as any)
              ]} 
              source={{ uri: image } as any} 
            />
          </View>

          <View style={cardStyles.infoContainer}>
            <View style={cardStyles.titleRow}>
              <Text style={cardStyles.countryName} numberOfLines={1}>
                {trip.name || trip.country}
              </Text>
              {tagText && (
                <Text style={cardStyles.tagText}>{tagText}</Text>
              )}
            </View>
            <Text style={cardStyles.stayType}>
              {trip.name ? trip.country : tripText.schengenStay}
            </Text>
            <Text style={cardStyles.datesRange}>
              {dateRangeStr}
            </Text>
          </View>

          <View style={cardStyles.statusSlot}>
            <Animated.View
              style={[
                cardStyles.thumbnailStatusDot,
                { backgroundColor: dotConfig.color, opacity: pulseValue },
              ]}
            />
          </View>

          {!isBulkEdit && (
            <ChevronRight size={16} color={theme.colors.textMuted} />
          )}
        </TouchableOpacity>
      </AnimatedView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  tabContainer: {
    flex: 1,
  },
  header: {
    gap: SPACING.cardGap,
    marginBottom: SPACING.pageSectionGap,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceStrong,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
    outlineStyle: 'none',
  } as any,
  searchClearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginLeft: 8,
  },
  bulkBar: {
    backgroundColor: theme.colors.accent,
    borderRadius: 16,
    padding: SPACING.controlPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bulkText: {
    color: theme.colors.accentInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  bulkActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bulkCancelBtnText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  bulkDeleteBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bulkDeleteBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.modalListGap,
    marginTop: 16,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  emptySubText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  emptyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptySecondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  section: {
    gap: SPACING.modalListGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeaderDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderSoft,
  },
  sectionCardList: {
    gap: 10,
  },
});

const createCardStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    position: 'relative',
    height: 76,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.warningAccent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 20,
  },
  deleteIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 8,
    color: theme.colors.accentInverse,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 1,
  },
  frontCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: 16,
    zIndex: 10,
  },
  frontCardSelected: {
    borderColor: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceMuted,
  },
  touchTarget: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    backgroundColor: theme.colors.accentInverse,
    borderRadius: 1,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    position: 'relative',
  },
  countryThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 9,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  thumbnailStatusDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    flexShrink: 0,
    borderWidth: 0,
    zIndex: 5,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  statusSlot: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  countryName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    maxWidth: 120,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  stayType: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  datesRange: {
    fontSize: 8,
    fontWeight: '700',
    color: theme.colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
});
