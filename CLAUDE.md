# Capis -- Project Guide

**Capitalis Apis: Where Wealth Swarms**

A wealth & asset management dashboard built on the Claude Code ecosystem.

## Quick Start

- `npm start` -- starts Express server on http://localhost:3333
- `npm run seed` -- resets all data files to mock defaults
- `/capis` -- slash command to launch (starts server + opens browser)
- `/capis stop` -- stops the server
- `/capis reset` -- resets mock data

## Project Structure

- `server.js` -- Express server (port 3333), serves static files + JSON API
- `public/` -- Frontend (vanilla HTML/CSS/JS, no build step, ES modules)
- `data/` -- Local JSON storage (portfolio, signals, feed, watchlist, tax)
- `skills/capis-portfolio/` -- Portfolio intelligence skill
- `scripts/seed-data.js` -- Mock data seeder

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolio` | All holdings |
| POST | `/api/portfolio` | Add a new holding |
| PUT | `/api/portfolio/:id` | Update a holding |
| DELETE | `/api/portfolio/:id` | Remove a holding |
| GET | `/api/signals` | All AI signals |
| POST | `/api/signals` | Add a new signal |
| PATCH | `/api/signals/:id` | Update signal (e.g., dismiss) |
| GET | `/api/feed` | News feed items |
| GET | `/api/tax-summary` | Tax planning data |
| GET | `/api/watchlist` | Watched assets |
| GET | `/api/stats` | Computed portfolio statistics |
| GET | `/api/events` | SSE stream for real-time browser sync |

## Real-Time Sync

Data mutations (POST, PUT, DELETE, PATCH) broadcast SSE events to connected browsers via `/api/events`. The frontend subscribes on load and re-renders the active view automatically. Use the API endpoints (not direct file edits) to trigger live updates.

## Data Files

All data lives in `data/` as JSON. When reading or writing portfolio data, always use the exact schema defined in `skills/capis-portfolio/references/asset-schema.md`.

## Theme: Forest Canopy

Light ivory + forest green earth tones. All theme tokens live in `:root` CSS variables in `public/css/styles.css`.

**Palette**

| Role | Hex | Usage |
|------|-----|-------|
| Forest Green | `#2d4a2b` | Primary accent, text, borders |
| Deep Forest | `#1a2e19` | Dimmed accent |
| Bright Forest | `#3d6339` | Light accent hover |
| Sage | `#7d8471` | Muted secondary (teal) |
| Olive | `#a4ac86` | Tertiary / light accent |
| Ivory | `#faf9f6` | Page background |
| Off-white | `#f0efe8` | Sidebar / header bg |
| White | `#ffffff` | Card backgrounds |

**Semantic colors**

| Token | Hex | Notes |
|-------|-----|-------|
| `--green` | `#3d7a3d` | Positive changes |
| `--red` | `#b5443b` | Negative changes |
| `--blue` | `#5a7d5a` | Links (earthy green) |
| `--teal` | `#7d8471` | Sage secondary |

**Chart colors** (`public/js/components/charts.js`)

| Category | Hex |
|----------|-----|
| Stocks | `#5b7e4a` |
| Crypto | `#7d8471` |
| Startups | `#a4ac86` |
| Cash | `#8a9178` |
| Sparkline up | `#3d7a3d` |
| Sparkline down | `#b5443b` |

**Fonts** (loaded from Google Fonts in `public/index.html`)

- Display: `Noto Serif` (--font-display)
- Body: `Noto Sans` (--font-body)
- Mono: `JetBrains Mono` (--font-mono)

**When adding new UI**, use CSS variables (`var(--gold-primary)`, `var(--bg-card)`, etc.) instead of hardcoding hex values. The `--gold-*` variable names are kept for compatibility but map to forest green.

## Key Conventions

- No external APIs or databases -- all data is local JSON files
- Frontend has no build step -- edit files directly in `public/`
- Port 3333 is the standard port
- Frontend uses ES modules (import/export)
- No framework dependencies -- vanilla JS only
