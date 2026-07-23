/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext } from 'react';
import { Settings } from '../types';

export type ThemeMode = Settings['themeMode'];
export type ColorScheme = 'light' | 'dark';

export interface AppTheme {
  scheme: ColorScheme;
  colors: {
    appBackground: string;
    surface: string;
    surfaceMuted: string;
    surfaceStrong: string;
    borderSoft: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    accent: string;
    accentInverse: string;
    overlay: string;
    successSurface: string;
    successBorder: string;
    successText: string;
    successMuted: string;
    dangerSurface: string;
    dangerBorder: string;
    dangerText: string;
    warningAccent: string;
  };
}

export const lightTheme: AppTheme = {
  scheme: 'light',
  colors: {
    appBackground: '#fafafa',
    surface: '#ffffff',
    surfaceMuted: '#fafafa',
    surfaceStrong: '#f4f4f5',
    borderSoft: '#f4f4f5',
    borderStrong: '#e4e4e7',
    textPrimary: '#09090b',
    textSecondary: '#52525b',
    textMuted: '#a1a1aa',
    textInverse: '#ffffff',
    accent: '#000000',
    accentInverse: '#ffffff',
    overlay: 'rgba(9, 9, 11, 0.35)',
    successSurface: '#f0fdf4',
    successBorder: '#dcfce7',
    successText: '#15803d',
    successMuted: '#86efac',
    dangerSurface: '#fef2f2',
    dangerBorder: '#fee2e2',
    dangerText: '#b91c1c',
    warningAccent: '#dc2626',
  },
};

export const darkTheme: AppTheme = {
  scheme: 'dark',
  colors: {
    appBackground: '#09090b',
    surface: '#18181b',
    surfaceMuted: '#27272a',
    surfaceStrong: '#3f3f46',
    borderSoft: '#27272a',
    borderStrong: '#3f3f46',
    textPrimary: '#fafafa',
    textSecondary: '#d4d4d8',
    textMuted: '#a1a1aa',
    textInverse: '#09090b',
    accent: '#fafafa',
    accentInverse: '#09090b',
    overlay: 'rgba(9, 9, 11, 0.7)',
    successSurface: '#052e16',
    successBorder: '#166534',
    successText: '#86efac',
    successMuted: '#4ade80',
    dangerSurface: '#450a0a',
    dangerBorder: '#7f1d1d',
    dangerText: '#fca5a5',
    warningAccent: '#f87171',
  },
};

export function resolveTheme(mode: ThemeMode, systemScheme: ColorScheme | null | undefined): AppTheme {
  const resolvedScheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  return resolvedScheme === 'dark' ? darkTheme : lightTheme;
}

const ThemeContext = createContext<AppTheme>(lightTheme);

interface AppThemeProviderProps {
  theme: AppTheme;
  children: React.ReactNode;
}

export function AppThemeProvider({ theme, children }: AppThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
