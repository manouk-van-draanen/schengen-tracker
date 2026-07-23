/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Platform, StyleSheet } from 'react-native';
import { AppTheme } from '../theme/appTheme';

export const createStayHeroStyles = (theme: AppTheme) =>
  StyleSheet.create({
    imageWrapper: {
      height: 140,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1,
      borderColor: theme.colors.borderSoft,
    },
    tripImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    grayscaleImage: {
      opacity: 0.8,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    imageTextContainer: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
    },
    countryBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 99,
      marginBottom: 4,
    },
    countryBadgeText: {
      fontSize: 8,
      color: '#ffffff',
      fontWeight: '700',
      letterSpacing: 1,
    },
    tripNameText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#ffffff',
      paddingHorizontal: 8,
    },
    tripDatesText: {
      fontSize: 10,
      color: '#d4d4d8',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontWeight: '700',
      marginTop: 2,
      paddingHorizontal: 8,
    },
  });
