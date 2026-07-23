/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal,
  Pressable,
  Image, 
  Platform,
  Animated
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Trip, Settings } from '../types';
import { getCurrentStatus, detectBreaches } from '../utils/schengenCalculator';
import { getCountryImageByName } from '../utils/countries';
import { AlertTriangle, ChevronRight, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { formatDateString } from '../utils/dateFormatter';
import { STATUS_TEXT } from '../content/ui/statusText';
import { createStayHeroStyles } from '../styles/stayHeroStyles';
import { createSectionHeaderStyles } from '../styles/sectionHeaderStyles';
import { createModalCloseButtonStyles } from '../styles/modalCloseButtonStyles';
import { createSurfaceCardStyles } from '../styles/surfaceCardStyles';
import { createModalFrameStyles } from '../styles/modalFrameStyles';
import { SPACING } from '../styles/spacing';
import { useAppTheme } from '../theme/appTheme';

interface StatusTabProps {
  trips: Trip[];
  onEditTripClick: (trip: Trip) => void;
  onNavigateToTrips: () => void;
  settings: Settings;
}

export default function StatusTab({
  trips,
  onEditTripClick,
  onNavigateToTrips,
  settings
}: StatusTabProps) {
  const theme = useAppTheme();
  const sectionHeaderStyles = useMemo(() => createSectionHeaderStyles(theme), [theme]);
  const stayHeroStyles = useMemo(() => createStayHeroStyles(theme), [theme]);
  const modalCloseButtonStyles = useMemo(() => createModalCloseButtonStyles(theme), [theme]);
  const surfaceCardStyles = useMemo(() => createSurfaceCardStyles(theme), [theme]);
  const modalFrameStyles = useMemo(() => createModalFrameStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const pulseValue = useRef(new Animated.Value(1)).current;
  const [showWindowInfo, setShowWindowInfo] = useState(false);

  const status = useMemo(() => getCurrentStatus(trips, todayStr), [trips, todayStr]);
  const breaches = useMemo(() => detectBreaches(trips), [trips]);

  const fillTemplate = (template: string, values: Record<string, string | number>) => {
    return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  };

  const activeTrips = useMemo(() => trips.filter(t => !t.archived), [trips]);
  const featuredStay = useMemo(() => {
    const upcomingTrip = [...activeTrips]
      .filter(trip => trip.startDate > todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

    if (upcomingTrip) {
      return { trip: upcomingTrip, title: STATUS_TEXT.featuredStay.upcomingTitle, isPast: false };
    }

    const ongoingTrip = [...activeTrips]
      .filter(trip => trip.startDate <= todayStr && trip.endDate >= todayStr)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];

    if (ongoingTrip) {
      return { trip: ongoingTrip, title: STATUS_TEXT.featuredStay.ongoingTitle, isPast: false };
    }

    const recentPastTrip = [...activeTrips]
      .filter(trip => trip.endDate < todayStr)
      .sort((a, b) => b.endDate.localeCompare(a.endDate))[0];

    if (recentPastTrip) {
      return { trip: recentPastTrip, title: STATUS_TEXT.featuredStay.lastTitle, isPast: true };
    }

    return null;
  }, [activeTrips, todayStr]);

  const formattedDate = (dateStr: string): string => {
    if (!dateStr) return STATUS_TEXT.shared.notAvailable;
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

  // Calculate gauge parameters
  const remainingPercent = useMemo(() => Math.round((status.daysRemaining / 90) * 100), [status.daysRemaining]);
  const strokeDashoffset = useMemo(() => 282.6 - (282.6 * remainingPercent) / 100, [remainingPercent]);
  const isCurrentlyOverstaying = status.isInside && status.daysUsed > 90;
  const shouldPulseStatus = status.isInside;
  const statusDotColor = isCurrentlyOverstaying ? theme.colors.warningAccent : status.isInside ? '#16a34a' : theme.colors.textMuted;
  const statusText = isCurrentlyOverstaying
    ? STATUS_TEXT.status.overstaying
    : status.isInside
      ? STATUS_TEXT.status.inside
      : STATUS_TEXT.status.outside;

  useEffect(() => {
    pulseValue.stopAnimation();

    if (!shouldPulseStatus) {
      pulseValue.setValue(1);
      return;
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.45,
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
  }, [pulseValue, shouldPulseStatus, statusDotColor]);

  return (
    <View style={styles.container}>
      <View style={[sectionHeaderStyles.header, styles.pageHeader]}>
        <Text style={sectionHeaderStyles.eyebrow}>{STATUS_TEXT.eyebrow}</Text>
        <Text style={sectionHeaderStyles.title}>{STATUS_TEXT.title}</Text>
      </View>

      {/* 1. Gauge section */}
      <View style={styles.gaugeSection}>
        <View style={styles.gaugeContainer}>
          <Svg width="176" height="176" viewBox="0 0 100 100" style={styles.svg}>
            <Circle
              cx="50"
              cy="50"
              r="45"
              stroke={theme.scheme === 'dark' ? theme.colors.surfaceStrong : theme.colors.borderStrong}
              strokeWidth="6"
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="45"
              stroke={theme.colors.accent}
              strokeWidth="6"
              strokeDasharray="282.6"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 50 50)"
            />
          </Svg>
          <View style={styles.gaugeTextContainer}>
            <Text style={styles.gaugeValue}>{status.daysRemaining}</Text>
            <Text style={styles.gaugeLabel}>{STATUS_TEXT.gauge.daysRemaining}</Text>
          </View>
        </View>

        <View style={styles.gaugeInfoTextContainer}>
          <TouchableOpacity
            onPress={() => setShowWindowInfo(true)}
            style={styles.gaugeInfoSentenceButton}
            accessibilityRole="button"
            accessibilityLabel={STATUS_TEXT.gauge.helpAccessibility}
          >
            <Text style={styles.gaugeInfoParagraph}>
              {STATUS_TEXT.gauge.usedAllowancePrefix}
              <Text style={styles.boldText}>{status.daysUsed}</Text>
              {STATUS_TEXT.gauge.usedAllowanceMiddle}
              <Text style={styles.boldText}>90-day</Text>
              {STATUS_TEXT.gauge.usedAllowanceSuffix}
            </Text>
            <View style={styles.gaugeInfoHelpButton}>
              <Text style={styles.gaugeInfoHelpText}>?</Text>
            </View>
          </TouchableOpacity>
          <Modal
            transparent
            visible={showWindowInfo}
            animationType="fade"
            onRequestClose={() => setShowWindowInfo(false)}
          >
            <View style={modalFrameStyles.backdrop}>
              <Pressable style={modalFrameStyles.pressableBackdrop} onPress={() => setShowWindowInfo(false)} />
              <View style={[modalFrameStyles.card, styles.gaugeOverlayCard]}>
                <View style={[modalFrameStyles.header, styles.gaugeOverlayHeader]}>
                  <Text style={[modalFrameStyles.title, styles.gaugeOverlayTitle]}>{STATUS_TEXT.gauge.overlayTitle}</Text>
                  <TouchableOpacity
                    onPress={() => setShowWindowInfo(false)}
                    style={modalCloseButtonStyles.button}
                    accessibilityLabel="Close rolling window details"
                  >
                    <X size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.gaugeOverlayText}>
                  {fillTemplate(STATUS_TEXT.gauge.overlayText, {
                    windowStart: formattedDate(status.windowStart),
                    today: formattedDate(todayStr),
                  })}
                </Text>
              </View>
            </View>
          </Modal>
        </View>
      </View>

      {/* 7. Current Location Status row */}
      <View style={[surfaceCardStyles.primary, styles.statusRow]}>
        <View style={styles.statusRowLeft}>
          <View style={styles.statusIconContainer}>
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusDotColor,
                  opacity: pulseValue,
                  transform: [{ scale: pulseValue.interpolate({ inputRange: [0.45, 1], outputRange: [0.9, 1.12] }) }],
                },
              ]}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.statusLabel} numberOfLines={1}>{STATUS_TEXT.status.currentLabel}</Text>
            <Text style={styles.statusValue} numberOfLines={1} ellipsizeMode="tail">
              {statusText}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Overstay Risk Alert */}
      {breaches.length > 0 && (
        <View style={styles.alertBanner}>
          <View style={styles.alertHeaderRow}>
            <View style={styles.alertIconContainer}>
              <AlertTriangle size={20} color={theme.colors.warningAccent} />
            </View>
            <Text style={styles.alertTitle}>{STATUS_TEXT.breach.title}</Text>
          </View>
          {breaches.length === 1 ? (
            <Text style={styles.alertDesc}>
              {fillTemplate(STATUS_TEXT.breach.single, {
                country: breaches[0].country,
                breachDate: formattedDate(breaches[0].breachStartDate),
              })}
            </Text>
          ) : (
            <View>
              <Text style={styles.alertDesc}>
                {STATUS_TEXT.breach.multipleIntro}
              </Text>
              {breaches.map((b, idx) => (
                <Text key={idx} style={styles.alertDescItem}>
                    {`• ${fillTemplate(STATUS_TEXT.breach.multipleItem, {
                      country: b.country,
                      breachDate: formattedDate(b.breachStartDate),
                    })}`}
                </Text>
              ))}
            </View>
          )}
          <TouchableOpacity
            onPress={() => {
              if (breaches.length === 1) {
                const fullTrip = activeTrips.find(t => t.id === breaches[0].tripId);
                if (fullTrip) {
                  onEditTripClick(fullTrip);
                  return;
                }
              }
              onNavigateToTrips();
            }}
            style={styles.alertButton}
          >
            <Text style={styles.alertButtonText}>
              {breaches.length === 1 ? STATUS_TEXT.breach.modifyPlan : STATUS_TEXT.breach.viewTripsList}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Stay Card */}
      {featuredStay && (
        <View style={[surfaceCardStyles.primary, styles.lastTripCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>{featuredStay.title}</Text>
            <TouchableOpacity onPress={onNavigateToTrips} style={styles.historyLink}>
              <Text style={styles.historyLinkText}>{STATUS_TEXT.featuredStay.history}</Text>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={stayHeroStyles.imageWrapper}>
            <Image 
              style={[stayHeroStyles.tripImage, featuredStay.isPast && stayHeroStyles.grayscaleImage]} 
              source={{ uri: getCountryImageByName(featuredStay.trip.country, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300') }}
            />
            <View style={stayHeroStyles.imageOverlay} />
            <View style={stayHeroStyles.imageTextContainer}>
              <View style={stayHeroStyles.countryBadge}>
                <Text style={stayHeroStyles.countryBadgeText}>{featuredStay.trip.country.toUpperCase()}</Text>
              </View>
              <Text style={stayHeroStyles.tripNameText} numberOfLines={1}>
                {featuredStay.trip.name || fillTemplate(STATUS_TEXT.featuredStay.tripTo, { country: featuredStay.trip.country })}
              </Text>
              <Text style={stayHeroStyles.tripDatesText}>
                {formattedShortDateRange(featuredStay.trip.startDate, featuredStay.trip.endDate)}
              </Text>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    gap: SPACING.pageSectionGap,
  },
  pageHeader: {
    marginBottom: 2,
  },
  gaugeSection: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  },
  gaugeContainer: {
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  gaugeTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.colors.textPrimary,
  },
  gaugeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  gaugeInfoTextContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  gaugeInfoSentenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  gaugeInfoParagraph: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    flexShrink: 1,
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  gaugeInfoHelpButton: {
    marginLeft: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  gaugeInfoHelpText: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.colors.textSecondary,
    lineHeight: 12,
    marginTop: -1,
  },
  gaugeOverlayCard: {
    maxWidth: 340,
    paddingVertical: SPACING.modalPadding,
    paddingHorizontal: SPACING.modalPadding,
    gap: SPACING.modalListGap,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  gaugeOverlayHeader: {
    marginBottom: SPACING.modalHeaderBottom,
  },
  gaugeOverlayTitle: {
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textPrimary,
  },
  gaugeOverlayText: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    textAlign: 'justify',
  },
  alertBanner: {
    backgroundColor: theme.colors.dangerSurface,
    borderColor: theme.colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    gap: 18,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  alertIconContainer: {
    padding: 8,
    backgroundColor: theme.colors.dangerBorder,
    borderRadius: 16,
  },
  alertTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.dangerText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  alertDesc: {
    fontSize: 12,
    color: theme.colors.dangerText,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'justify',
  },
  alertDescItem: {
    fontSize: 11,
    color: theme.colors.dangerText,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'justify',
  },
  alertButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertButtonText: {
    color: theme.colors.accentInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  lastTripCard: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  historyLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  addTripButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  addTripTitle: {
    color: theme.colors.accentInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  addTripSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  statusRow: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  statusRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
});
