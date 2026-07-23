/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from 'react-native';
import { AppTheme } from '../theme/appTheme';
import { SPACING } from './spacing';

export const createActionButtonStyles = (theme: AppTheme) =>
  StyleSheet.create({
    primaryButton: {
      backgroundColor: theme.colors.accent,
      borderRadius: 12,
      paddingVertical: SPACING.controlPadding - 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: {
      color: theme.colors.accentInverse,
      fontSize: 11,
      fontWeight: '700',
    },
    secondaryButton: {
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 12,
      paddingVertical: SPACING.controlPadding - 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    dangerButton: {
      backgroundColor: theme.colors.warningAccent,
      borderRadius: 12,
      paddingVertical: SPACING.controlPadding - 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dangerText: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: '700',
    },
    dangerSecondaryButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dangerBorder,
      borderRadius: 12,
      paddingVertical: SPACING.controlPadding - 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dangerSecondaryText: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
  });
