# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Revel Dance Tracker — a PWA for parents and audience at the Revel 2026 dance competition (Tulsa, OK, Mar 6–8). Shows the full dance schedule, lets users save dances they don't want to miss, and displays real-time proximity badges when a saved dance is coming up.

## Architecture

**No build system.** Vanilla JS with ES6 modules, served as static files. No npm, no bundler.

### Primary Pages

- **`schedule.html`** — Main parent-facing interface. Scrollable dance list with swipe-to-save, proximity badges, day tabs (Sat/Sun), Premier filter, live stream toggle. Current dance is read-only from Firebase.
- **`premier-saturday.html`** — Identical copy of `schedule.html` (kept for existing bookmarks/links).
- **`index.html`** — Power-user tracker with search-to-track, manual current dance controls (+/- buttons, tap-to-edit), alert system. Uses Tailwind CSS via CDN.
- **`watcher.html`** — Admin tool: captures screen share of live stream, uses Tesseract.js OCR to read the current dance number, pushes it to Firebase.

### JS Modules

- **`js/schedule.js`** — Data layer. Loads `schedule-optimized.json`, provides `getDance()`, `dancesAway()`, `getOrderedKeys()`, `getPosition()`, `searchDances()`, etc.
- **`js/firebase-config.js`** — Firebase Realtime DB init. Exports `database`, `ref`, `onValue`, `set`, `get`. Falls back gracefully when Firebase is unavailable.
- **`js/app.js`** — Controller for `index.html` only (search, tracking, alerts, rendering).
- **`js/alerts.js`** — Web Audio API tones + Vibration API + screen flash. Used by `index.html`.

### Data Flow

```
watcher.html (admin) --[writes]--> Firebase: competitions/revel2026/currentDance
schedule.html (parents) --[reads]--> Firebase: competitions/revel2026/currentDance
                                     Falls back to localStorage: danceTrack_currentDance
```

## Commands

```bash
# Regenerate schedule JSON from CSV
node convert_csv.js    # reads dance-schedule.csv → outputs schedule-optimized.json

# Serve locally (any static server works)
npx serve .            # or python3 -m http.server
```

## Key Data

- **Schedule source**: `dance-schedule.csv` → `schedule-optimized.json` via `convert_csv.js`
- **Dance keys**: Numeric strings with optional alpha suffix ("55", "55A"). Sorted numerically.
- **Each dance entry**: `{ day, time, category, routine_title, studio }`

## localStorage Keys

- `highlightedDances` — JSON array of saved dance keys (used by schedule.html / premier-saturday.html)
- `danceTrack_saved` — JSON array of tracked dance keys (used by index.html)
- `danceTrack_currentDance` — Current on-stage dance key (Firebase fallback)
- `danceTrack_alerts` — "on" or "off"

## Design System

Dark theme (`#0a0a0a` background), Manrope font (Google Fonts CDN).

| Color | Hex | Usage |
|-------|-----|-------|
| Blue | `#254EF0` | Primary accent, highlighted dances, on-stage row |
| Orange | `#FF4D00` | 1-2 dances away (urgent) |
| Green | `#39FF14` | 3-5 dances away |
| Yellow | `#facc15` | Out-of-order / schedule change |

## Development Notes

- **schedule.html uses inline CSS** (no Tailwind CDN) for faster load on spotty venue WiFi.
- **index.html uses Tailwind v4 via CDN** with custom colors in tailwind config.
- **schedule.html and premier-saturday.html must stay in sync** — after editing one, copy to the other.
- **Mobile-first**: 480px max-width. iOS zoom prevention via 16px minimum font-size on inputs.
- **manifest.json `start_url`** points to `/schedule.html`.
- **Service worker (`sw.js`)** is outdated — only caches legacy files. Needs update before deploying as PWA.
