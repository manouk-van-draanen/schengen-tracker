# Schengly

Plan your trips with confidence and stay safely within the Schengen 90/180-day rule.

Schengly is a friendly travel-planning app for short-stay travelers who want clear answers, fewer surprises, and more peace of mind.

## Why This App Exists

The Schengen rule sounds simple: you can stay up to 90 days in any rolling 180-day window.

In real life, it gets confusing fast because the 180-day window moves every day. This app helps by doing the hard math for you and showing your status in a way that is easy to understand.

## What You Can Do

### Get a clear overview in seconds
- See your remaining Schengen days in a prominent gauge.
- View your current rolling-window usage at a glance.
- Open a quick explanation modal for the active 180-day window dates.
- Get instant overstay-risk warnings when planned trips would break the limit.

### Plan trips with confidence
- Add a new trip or edit an existing one.
- Select destination country from a built-in Schengen list.
- Use the in-app date picker for start and end dates.
- See live allowance preview while entering dates.
- Catch overlap issues early with clear validation messages.

### Manage your trips your way
- Switch between list view and calendar view.
- Search by trip name, country, or city.
- See trips grouped into current, upcoming, and past.
- Bulk-select and delete multiple trips quickly.
- Swipe to delete individual trips in list view.

### Explore travel days in calendar detail
- Browse months and tap any date to inspect that day.
- See whether the selected date belongs to a trip.
- View rolling-window usage and remaining allowance for that day.
- Highlight historically overstayed days for context.

### Learn the rules without legal jargon
- Read a simple, practical guide to Schengen stay rules.
- Review entry/exit counting, rolling-window basics, and common pitfalls.
- Browse all Schengen countries with quick details.
- Jump from a country detail modal straight into trip logging.

### Keep control of your data
- Export your trips to CSV.
- Export a clean PDF report of your trip history.
- Import trips from CSV backup.
- Clear all local data when needed.

### Personalize the experience
- Choose Light, Dark, or System appearance mode.
- Pick your preferred date format.
- View release notes directly in the app.

## Built For Real-World Use

- Local-first data storage (your trip data stays on your device).
- Responsive layout and mobile-first experience.
- Works across web and Expo React Native workflows.

## Tech Stack

- React + React Native + Expo
- TypeScript
- date-fns
- react-native-svg
- Async storage via local storage compatibility layer

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run (Expo)

```bash
npm run start
```

For purchase testing, use a native iOS/Android build (development build, TestFlight, or internal testing track). Purchases are not available in Expo Go and web builds.

### Run Web Dev Server (Vite)

```bash
npm run dev
```

### Type Check

```bash
npm run lint
```

### Run Tests

```bash
npm test
```

### Run Tests With Coverage

```bash
npm run test:coverage
```

Current test coverage focuses on core app logic in:
- `src/utils/schengenCalculator.ts`
- `src/utils/dateFormatter.ts`
- `src/utils/releaseNotesParser.ts`

Tests live in:
- `tests/utils/`

## Project Structure (High Level)

- src/components: App screens and UI flows (Overview, Trips, Rules, Settings, Trip Form)
- src/utils: Calculation logic, date formatting, country metadata, storage helpers
- src/content: End-user text and release notes
- src/theme and src/styles: Theme system and shared design tokens/styles

## Privacy Note

This app is a planning assistant, not legal advice. Always verify final travel eligibility with official government or EU sources.

## Version

Current app version: 1.0.1
