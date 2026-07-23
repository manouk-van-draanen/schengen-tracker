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
  Pressable,
  Modal, 
  ScrollView, 
  Linking,
  Platform
} from 'react-native';
import { SCHENGEN_COUNTRIES } from '../utils/countries';
import { BookOpen, Calendar, FileText, CheckCircle2, ArrowRightLeft, ExternalLink, X } from 'lucide-react-native';
import { RULES_TEXT } from '../content/ui/rulesText';
import { createSectionHeaderStyles } from '../styles/sectionHeaderStyles';
import { createModalCloseButtonStyles } from '../styles/modalCloseButtonStyles';
import { createModalFrameStyles } from '../styles/modalFrameStyles';
import { createSurfaceCardStyles } from '../styles/surfaceCardStyles';
import { createActionButtonStyles } from '../styles/actionButtonStyles';
import { SPACING } from '../styles/spacing';
import { useAppTheme } from '../theme/appTheme';

interface RulesTabProps {
  onSelectCountry?: (countryName: string) => void;
}

export default function RulesTab({ onSelectCountry }: RulesTabProps) {
  const theme = useAppTheme();
  const sectionHeaderStyles = useMemo(() => createSectionHeaderStyles(theme), [theme]);
  const modalCloseButtonStyles = useMemo(() => createModalCloseButtonStyles(theme), [theme]);
  const modalFrameStyles = useMemo(() => createModalFrameStyles(theme), [theme]);
  const surfaceCardStyles = useMemo(() => createSurfaceCardStyles(theme), [theme]);
  const actionButtonStyles = useMemo(() => createActionButtonStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedCountry, setSelectedCountry] = useState<typeof SCHENGEN_COUNTRIES[0] | null>(null);

  const fillTemplate = (template: string, values: Record<string, string>) => {
    return Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, value), template);
  };

  const handleOpenEULink = () => {
    Linking.openURL('https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en');
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={sectionHeaderStyles.header}>
        <Text style={sectionHeaderStyles.eyebrow}>{RULES_TEXT.eyebrow}</Text>
        <Text style={sectionHeaderStyles.title}>{RULES_TEXT.title}</Text>
      </View>

      {/* Hero Card */}
      <View style={[surfaceCardStyles.primary, styles.heroCard]}>
        <View style={styles.heroLayout}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>{RULES_TEXT.hero.title}</Text>
            <Text style={styles.heroDesc}>
              {RULES_TEXT.hero.descriptionPrefix} <Text style={styles.boldText}>{RULES_TEXT.hero.highlightDays}</Text> {RULES_TEXT.hero.descriptionMiddle} <Text style={styles.boldText}>{RULES_TEXT.hero.highlightPeriod}</Text> {RULES_TEXT.hero.descriptionSuffix}
            </Text>
          </View>
          <View style={styles.heroBadgeBox}>
            <View style={styles.heroBadgeIcon}>
              <Calendar size={18} color={theme.colors.accentInverse} />
            </View>
            <Text style={styles.heroBadgeLabel}>{RULES_TEXT.hero.badgeLabel}</Text>
            <Text style={styles.heroBadgeValue}>{RULES_TEXT.hero.badgeValue}</Text>
            <Text style={styles.heroBadgeDesc}>{RULES_TEXT.hero.badgeDescription}</Text>
          </View>
        </View>
      </View>

      {/* Entry & Exit Days Info Block */}
      <View style={[surfaceCardStyles.primary, styles.card]}>
        <View style={styles.cardHeader}>
          <ArrowRightLeft size={16} color={theme.colors.textPrimary} />
          <Text style={styles.cardTitle}>{RULES_TEXT.entryExit.title}</Text>
        </View>
        <Text style={styles.cardDesc}>
          {RULES_TEXT.entryExit.description}
        </Text>
        <View style={styles.list}>
          {RULES_TEXT.entryExit.items.map((item) => (
            <View key={item} style={styles.listItem}>
              <CheckCircle2 size={14} color={theme.colors.textPrimary} style={styles.listIcon} />
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* The Rolling Window dark card */}
      <View style={styles.darkCard}>
        <View style={styles.darkCardContent}>
          <Text style={styles.darkCardTitle}>{RULES_TEXT.rollingWindow.title}</Text>
          <Text style={styles.darkCardDesc}>
            {RULES_TEXT.rollingWindow.description}
          </Text>
          <Text style={styles.darkCardLabel}>{RULES_TEXT.rollingWindow.label}</Text>
        </View>
      </View>

      {/* Applicable Countries List */}
      <View style={[surfaceCardStyles.primary, styles.card]}>
        <View style={styles.cardHeader}>
          <BookOpen size={16} color={theme.colors.textPrimary} />
          <Text style={styles.cardTitle}>{RULES_TEXT.countries.title}</Text>
        </View>
        <Text style={styles.cardDesc}>
          {RULES_TEXT.countries.description}
        </Text>

        <View style={styles.grid}>
          {SCHENGEN_COUNTRIES.map(country => (
            <TouchableOpacity
              key={country.id}
              onPress={() => setSelectedCountry(country)}
              style={styles.gridBtn}
            >
              <Text style={styles.gridBtnText} numberOfLines={1}>{country.name}</Text>
              <Text style={styles.gridBtnCode}>{country.code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Official Link */}
      <View style={styles.linkCard}>
        <View style={styles.linkCardInfo}>
          <View style={styles.linkIconWrapper}>
            <FileText size={18} color={theme.colors.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkTitle}>{RULES_TEXT.officialGuidance.title}</Text>
            <Text style={styles.linkDesc}>{RULES_TEXT.officialGuidance.description}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleOpenEULink} style={[actionButtonStyles.primaryButton, styles.linkButton]}>
          <Text style={actionButtonStyles.primaryText}>{RULES_TEXT.officialGuidance.button}</Text>
          <ExternalLink size={12} color={theme.colors.accentInverse} />
        </TouchableOpacity>
      </View>

      {/* Overstay Consequences and long term info */}
      <View style={[surfaceCardStyles.primary, styles.card]}>
        <Text style={styles.cardTitle}>{RULES_TEXT.importantInfo.title}</Text>
        <View style={styles.infoSplitRow}>
          <View style={styles.infoSplitCol}>
            <Text style={styles.infoLabel}>{RULES_TEXT.importantInfo.overstayTitle}</Text>
            <Text style={styles.infoText}>
              {RULES_TEXT.importantInfo.overstayText}
            </Text>
          </View>
          <View style={styles.infoSplitCol}>
            <Text style={styles.infoLabel}>{RULES_TEXT.importantInfo.residenceTitle}</Text>
            <Text style={styles.infoText}>
              {RULES_TEXT.importantInfo.residenceText}
            </Text>
          </View>
        </View>
      </View>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedCountry(null)}
        >
          <View style={modalFrameStyles.backdrop}>
            <Pressable style={modalFrameStyles.pressableBackdrop} onPress={() => setSelectedCountry(null)} />
            <View style={[modalFrameStyles.card, styles.modalContent]}>
              <View style={[modalFrameStyles.header, styles.modalHeader]}>
                <Text style={modalFrameStyles.title}>{selectedCountry.name}</Text>
                <TouchableOpacity onPress={() => setSelectedCountry(null)} style={modalCloseButtonStyles.button}>
                  <X size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>{RULES_TEXT.countryModal.capital}</Text>
                  <Text style={styles.modalMetaVal}>{selectedCountry.capital}</Text>
                </View>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>{RULES_TEXT.countryModal.code}</Text>
                  <Text style={styles.modalMetaVal}>{selectedCountry.code}</Text>
                </View>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalMetaLabel}>{RULES_TEXT.countryModal.schengenEntry}</Text>
                  <Text style={styles.modalMetaVal}>{selectedCountry.entryDate}</Text>
                </View>

                <View style={styles.modalDivider} />

                <Text style={styles.modalSectionLabel}>{RULES_TEXT.countryModal.about}</Text>
                <Text style={styles.modalDescription}>{selectedCountry.description}</Text>
              </ScrollView>

              {onSelectCountry && (
                <TouchableOpacity
                  onPress={() => {
                    const countryName = selectedCountry.name;
                    setSelectedCountry(null);
                    onSelectCountry(countryName);
                  }}
                  style={[actionButtonStyles.primaryButton, styles.modalActionBtn]}
                >
                  <Text style={actionButtonStyles.primaryText}>{fillTemplate(RULES_TEXT.countryModal.logStay, { country: selectedCountry.name })}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    gap: 28,
  },
  heroCard: {
    padding: 20,
  },
  heroLayout: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  heroLeft: {
    flex: 1,
    minWidth: 200,
    gap: 10,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  heroDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  heroBadgeBox: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 180 : '100%',
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeIcon: {
    padding: 6,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    marginBottom: 4,
  },
  heroBadgeLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  heroBadgeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  heroBadgeDesc: {
    fontSize: 8,
    color: theme.colors.textMuted,
  },
  card: {
    padding: 20,
    gap: 14,
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
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  listIcon: {
    marginTop: 2,
  },
  listItemText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 15,
    textAlign: 'justify',
  },
  darkCard: {
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 24,
    padding: 24,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  darkCardContent: {
    gap: 10,
  },
  darkCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  darkCardDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    textAlign: 'justify',
  },
  darkCardLabel: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.textMuted,
    marginTop: 14,
  },
  grid: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    gap: 8,
    marginTop: 8,
  },
  gridBtn: {
    width: '100%',
    flexGrow: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  gridBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    maxWidth: 90,
  },
  gridBtnCode: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: theme.colors.textMuted,
  },
  linkCard: {
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  linkCardInfo: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  linkIconWrapper: {
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 10,
  },
  linkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  linkDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
    textAlign: 'justify',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  infoSplitRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  infoSplitCol: {
    flex: 1,
    minWidth: 150,
    gap: 8,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    textAlign: 'justify',
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: SPACING.modalPadding,
    maxHeight: '82%',
    gap: SPACING.modalGap,
  },
  modalHeader: {
    marginBottom: SPACING.modalHeaderBottom,
  },
  modalBody: {
    maxHeight: 420,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.modalRowPadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  modalMetaLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  modalMetaVal: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  modalDivider: {
    height: SPACING.modalListGap,
  },
  modalSectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    textAlign: 'justify',
  },
  modalActionBtn: {
    marginTop: SPACING.modalListGap,
  },
});
