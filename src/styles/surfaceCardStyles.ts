/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StyleSheet } from 'react-native';
import { AppTheme } from '../theme/appTheme';

export const createSurfaceCardStyles = (theme: AppTheme) =>
  StyleSheet.create({
    primary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
      borderRadius: 24,
    },
    secondary: {
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 16,
    },
  });
