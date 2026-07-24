/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  Alert,
  useColorScheme
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trip, Settings } from './types';
import StatusTab from './components/StatusTab';
import TripsTab from './components/TripsTab';
import RulesTab from './components/RulesTab';
import SettingsTab from './components/SettingsTab';
import TripForm from './components/TripForm';
import { LayoutDashboard, Plane, Settings as SettingsIcon, CircleHelp, Plus } from 'lucide-react-native';
import { storage } from './utils/storage';
import { APP_TEXT } from './content/ui/appText';
import { AppThemeProvider, resolveTheme } from './theme/appTheme';
import { SPACING } from './styles/spacing';

const VALID_THEME_MODES: Settings['themeMode'][] = ['light', 'dark', 'system'];
const VALID_DATE_FORMATS: Settings['dateFormat'][] = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'];

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeThemeMode(themeMode: unknown): Settings['themeMode'] {
  if (typeof themeMode === 'string' && VALID_THEME_MODES.includes(themeMode as Settings['themeMode'])) {
    return themeMode as Settings['themeMode'];
  }

  return 'system';
}

function normalizeDateFormat(dateFormat: Settings['dateFormat']): Settings['dateFormat'] {
  switch (dateFormat) {
    case 'DD/MM/YYYY':
    case 'DD.MM.YYYY':
      return 'DD-MM-YYYY';
    case 'MM/DD/YYYY':
      return 'MM-DD-YYYY';
    default:
      return dateFormat;
  }
}

function normalizeStoredDateFormat(dateFormat: unknown): Settings['dateFormat'] {
  if (typeof dateFormat === 'string' && VALID_DATE_FORMATS.includes(dateFormat as Settings['dateFormat'])) {
    return dateFormat as Settings['dateFormat'];
  }

  return 'DD-MM-YYYY';
}

function sanitizeSettings(rawSettings: unknown): Settings {
  const settings = rawSettings && typeof rawSettings === 'object' ? (rawSettings as Partial<Settings>) : {};

  return {
    dateFormat: normalizeStoredDateFormat(settings.dateFormat),
    themeMode: normalizeThemeMode(settings.themeMode),
  };
}

function sanitizeTrip(rawTrip: unknown): Trip | null {
  if (!rawTrip || typeof rawTrip !== 'object') {
    return null;
  }

  const trip = rawTrip as Partial<Trip>;

  if (
    typeof trip.id !== 'string' ||
    typeof trip.country !== 'string' ||
    !isIsoDateString(trip.startDate) ||
    !isIsoDateString(trip.endDate)
  ) {
    return null;
  }

  return {
    id: trip.id,
    name: typeof trip.name === 'string' && trip.name.trim() ? trip.name : undefined,
    country: trip.country,
    startDate: trip.startDate,
    endDate: trip.endDate,
    city: typeof trip.city === 'string' && trip.city.trim() ? trip.city : undefined,
    notes: typeof trip.notes === 'string' && trip.notes.trim() ? trip.notes : undefined,
    archived: Boolean(trip.archived),
  };
}

function sanitizeTrips(rawTrips: unknown): Trip[] {
  if (!Array.isArray(rawTrips)) {
    return [];
  }

  const cleanedTrips: Trip[] = [];
  for (const rawTrip of rawTrips) {
    const trip = sanitizeTrip(rawTrip);
    if (trip) {
      cleanedTrips.push(trip);
    }
  }

  return cleanedTrips;
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [settings, setSettings] = useState<Settings>({ dateFormat: 'DD-MM-YYYY', themeMode: 'system' });
  const [currentTab, setCurrentTab] = useState<'overview' | 'trips' | 'rules' | 'settings'>('overview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [initialFormCountry, setInitialFormCountry] = useState<string | null>(null);
  const topInset = insets.top;
  const shellInsetStyle = {
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  // Load from persistent storage
  useEffect(() => {
    async function loadData() {
      try {
        const storedTrips = await storage.getItem('schengen_trips');
        if (storedTrips) {
          setTrips(sanitizeTrips(JSON.parse(storedTrips)));
        } else {
          setTrips([]);
        }

        const storedSettings = await storage.getItem('schengen_settings');
        if (storedSettings) {
          setSettings(sanitizeSettings(JSON.parse(storedSettings)));
        }
      } catch (e) {
        console.error("Failed to load data from storage", e);
        setTrips([]);
      }
    }
    loadData();
  }, []);

  // Save to persistent storage when state changes
  const saveTrips = async (newTrips: Trip[]) => {
    const cleanedTrips = sanitizeTrips(newTrips);
    setTrips(cleanedTrips);
    try {
      await storage.setItem('schengen_trips', JSON.stringify(cleanedTrips));
    } catch (e) {
      console.error("Failed to save trips to storage", e);
    }
  };

  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      await storage.setItem('schengen_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings to storage", e);
    }
  };

  const requestCreateTrip = (countryName?: string) => {
    setEditingTrip(null);
    setInitialFormCountry(countryName ?? null);
    setCurrentTab('trips');
    setIsFormOpen(true);
  };

  const handleSaveTrip = (trip: Trip) => {
    let newTrips = [];
    if (editingTrip) {
      newTrips = trips.map(t => t.id === trip.id ? trip : t);
    } else {
      newTrips = [...trips, trip];
    }
    saveTrips(newTrips);
    setIsFormOpen(false);
    setEditingTrip(null);
    setInitialFormCountry(null);
  };

  const handleDeleteTrip = (tripId: string) => {
    const newTrips = trips.filter(t => t.id !== tripId);
    saveTrips(newTrips);
  };

  const handleDeleteMultipleTrips = (tripIds: string[]) => {
    const newTrips = trips.filter(t => !tripIds.includes(t.id));
    saveTrips(newTrips);
  };

  const handleImportTrips = (imported: Trip[]) => {
    saveTrips(imported);
  };

  const handleClearAllData = async () => {
    try {
      await storage.removeItem('schengen_trips');
      await storage.removeItem('schengen_settings');
      setTrips([]);
      setSettings({ dateFormat: 'DD-MM-YYYY', themeMode: 'system' });
      Alert.alert(APP_TEXT.alerts.successTitle, APP_TEXT.alerts.clearDataSuccess);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogTripFromCountry = (countryName: string) => {
    requestCreateTrip(countryName);
  };

  const renderActiveTab = () => {
    if (isFormOpen) {
      return (
        <TripForm
          existingTrips={trips}
          editingTrip={editingTrip}
          onSave={handleSaveTrip}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTrip(null);
            setInitialFormCountry(null);
          }}
          settings={settings}
          initialCountry={initialFormCountry}
        />
      );
    }

    switch (currentTab) {
      case 'overview':
        return (
          <StatusTab
            trips={trips}
            onEditTripClick={(trip) => {
              setEditingTrip(trip);
              setIsFormOpen(true);
            }}
            onNavigateToTrips={() => setCurrentTab('trips')}
            settings={settings}
          />
        );
      case 'trips':
        return (
          <TripsTab
            trips={trips}
            onAddTripClick={() => {
              requestCreateTrip();
            }}
            onEditTripClick={(trip) => {
              setEditingTrip(trip);
              setIsFormOpen(true);
            }}
            onDeleteTrip={handleDeleteTrip}
            onDeleteMultipleTrips={handleDeleteMultipleTrips}
            settings={settings}
          />
        );
      case 'rules':
        return <RulesTab onSelectCountry={handleLogTripFromCountry} />;
      case 'settings':
        return (
          <SettingsTab
            settings={settings}
            setSettings={handleSaveSettings}
            trips={trips}
            onImportTrips={handleImportTrips}
            onClearAllData={handleClearAllData}
          />
        );
    }
  };

  const theme = resolveTheme(settings.themeMode, systemScheme);
  const styles = createStyles(theme);

  const mainAppContainer = (
    <AppThemeProvider theme={theme}>
    <View style={[styles.appContainer, shellInsetStyle]}>
      <StatusBar barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.appBackground} />
      
      {/* Dynamic Top App Bar */}
      <View style={[styles.header, { height: 60 + topInset, paddingTop: topInset }]}>
        <Text style={styles.headerTitle}>{APP_TEXT.headerTitle}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => { setCurrentTab('rules'); setIsFormOpen(false); }}
            style={styles.headerActionButton}
            accessibilityLabel={APP_TEXT.accessibility.openRules}
          >
            <CircleHelp size={18} color={theme.colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setCurrentTab('settings'); setIsFormOpen(false); }}
            style={styles.headerActionButton}
            accessibilityLabel={APP_TEXT.accessibility.openSettings}
          >
            <SettingsIcon size={18} color={theme.colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView 
        style={styles.contentScroll} 
        contentContainerStyle={isFormOpen ? styles.contentScrollContentForm : styles.contentScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderActiveTab()}
      </ScrollView>

      {/* Dynamic Bottom Tab Navigation Bar */}
      <View style={[styles.tabBar, { height: 80 }]}>
        <TouchableOpacity
          onPress={() => { setCurrentTab('overview'); setIsFormOpen(false); }}
          style={[styles.tabButton, currentTab === 'overview' && !isFormOpen && styles.tabButtonActive]}
        >
          <LayoutDashboard 
            size={22} 
            color={currentTab === 'overview' && !isFormOpen ? theme.colors.textPrimary : theme.colors.textMuted} 
            strokeWidth={2}
          />
          <Text style={[styles.tabLabel, currentTab === 'overview' && !isFormOpen && styles.tabLabelActive]}>{APP_TEXT.tabLabels.overview}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            requestCreateTrip();
          }}
          style={[styles.tabButton, isFormOpen && styles.tabButtonActive]}
          accessibilityLabel={APP_TEXT.accessibility.addTrip}
        >
          <View style={styles.addTabIconCircle}>
            <Plus
              size={20}
              color={theme.colors.accentInverse}
              strokeWidth={2.75}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setCurrentTab('trips'); setIsFormOpen(false); }}
          style={[styles.tabButton, currentTab === 'trips' && !isFormOpen && styles.tabButtonActive]}
        >
          <Plane 
            size={22} 
            color={currentTab === 'trips' && !isFormOpen ? theme.colors.textPrimary : theme.colors.textMuted} 
            strokeWidth={2}
          />
          <Text style={[styles.tabLabel, currentTab === 'trips' && !isFormOpen && styles.tabLabelActive]}>{APP_TEXT.tabLabels.trips}</Text>
        </TouchableOpacity>

      </View>
    </View>
    </AppThemeProvider>
  );

  return <View style={styles.safeArea}>{mainAppContainer}</View>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const createStyles = (theme: ReturnType<typeof resolveTheme>) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  appContainer: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    position: 'relative',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.pagePadding,
    backgroundColor: theme.colors.appBackground,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  contentScroll: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  contentScrollContent: {
    padding: SPACING.pagePadding,
    paddingBottom: 40,
  },
  contentScrollContentForm: {
    paddingHorizontal: SPACING.pagePadding,
    paddingTop: SPACING.pagePadding,
    paddingBottom: 40,
    flexGrow: 1,
  },
  tabBar: {
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 10,
    position: 'relative',
  },
  tabButton: {
    width: '33.333333%',
    flexGrow: 0,
    flexShrink: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabButtonActive: {
    opacity: 1,
  },
  addTabIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: theme.colors.textPrimary,
  },
});
