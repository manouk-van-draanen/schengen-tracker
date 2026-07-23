/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from 'react-native';
import { AppTheme } from '../theme/appTheme';
import { SPACING } from './spacing';

export const createSectionHeaderStyles = (theme: AppTheme) =>
  StyleSheet.create({
    header: {
      marginBottom: SPACING.cardGap - 4,
    },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 3,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
  });
