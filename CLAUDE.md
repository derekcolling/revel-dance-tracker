# Revel Dance Tracker

A single-page PWA for tracking dance competition performances in real time. Parents and audience members add their dances, set the current on-stage number, and instantly see how many dances away each tracked performance is.

## Architecture

**No build system.** Vanilla JS with ES6 modules, Tailwind CSS via CDN, served as static files.

```
index.html              ← Single-page app (entry point)
css/styles.css          ← Custom styles (glow effects, iOS fixes, animations)
js/
  app.js                ← Main app logic (UI, events, rendering, localStorage)
  schedule.js           ← Schedule data layer (load, search, position helpers)
  alerts.js             ← Alert system (sound, vibration, screen flash)
  firebase-config.js    ← Firebase Realtime DB (not yet configured, runs in demo mode)
schedule-optimized.json ← 600+ dance entries keyed by number (supports alphanumeric like "55A")
manifest.json           ← PWA manifest
sw.js                   ← Service worker (cache-first)
```

## Key Concepts

- **Current dance**: The on-stage dance number, editable via tap-to-edit inline UI or +/- buttons. Syncs via Firebase when configured, falls back to localStorage.
- **Tracked dances**: User's saved list of dances to watch. Stored in localStorage (`danceTrack_saved`). Cards show a prominent color-coded badge indicating how many dances away.
- **Schedule data**: Loaded from `schedule-optimized.json`. Dances are keyed by number, sorted numerically with alpha suffixes (e.g. "55" before "55A"). Each entry has `routine_title`, `studio`, `category`, `time`, `day`.
- **Alerts**: Three intensity levels (high/medium/low) triggered when tracked dances approach. Uses Web Audio API tones, vibration, and screen flash.
- **Search**: Type-ahead search by dance number, routine name, or studio name.

## Design System

Dark theme with Manrope font. Custom Tailwind colors:
- `dark: #121212` — background
- `surface: #1E1E1E` — cards
- `electricBlue: #00E5FF` — on-stage / active state
- `glowOrange: #FF4D00` — 1-2 dances away (urgent)
- `neonGreen: #39FF14` — 3-5 dances away, alerts enabled

## Data Persistence

All data is local (no server-side storage needed):
- `danceTrack_saved` — JSON array of tracked dance keys
- `danceTrack_currentDance` — current on-stage dance key
- `danceTrack_alerts` — "on" or "off"

## Firebase (Optional)

Firebase Realtime Database enables multi-device sync of the current dance number. Config in `js/firebase-config.js` is placeholder — the app works fully offline via localStorage when Firebase is not configured.

Path: `competitions/revel2026/currentDance`

## Development Notes

- **Mobile-first**: Designed for `max-w-md` phone viewport. iOS zoom prevention via `font-size: 16px !important` on inputs.
- **No dependencies to install**: Open `index.html` directly or serve with any static server.
- **Schedule updates**: Edit `dance-schedule.csv` then run `node convert_csv.js` to regenerate `schedule-optimized.json`.
- The `manifest.json` start_url still points to `live_dashboard_refined.html` — update to `index.html` before deploying as a PWA.
