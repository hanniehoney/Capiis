# Capis -- Project Guide

**Capitalis Apis: Where Wealth Swarms**

A wealth & asset management dashboard built on the Claude Code ecosystem.

## Quick Start

- `npm start` -- starts Express server on http://localhost:3333
- `npm run seed` -- resets all data files to mock defaults (generates Excel + JSON)
- `/capis` -- slash command to launch (starts server + opens browser)
- `/capis stop` -- stops the server
- `/capis reset` -- resets mock data

## Project Structure

- `server.js` -- Express server (port 3333), serves static files + read-only JSON API
- `lib/excel.js` -- Excel reader module (xlsx), converts .xlsx to JSON for the API
- `public/` -- Frontend (vanilla HTML/CSS/JS, no build step, ES modules)
- `data/` -- Excel files (portfolio) + JSON files (signals, feed, watchlist, tax)
- `skills/capis-portfolio/` -- Portfolio intelligence skill
- `scripts/seed-data.js` -- Mock data seeder (generates Excel + JSON)

## Data Architecture (Hybrid)

- **Portfolio data** lives in `data/*.xlsx` -- one Excel file per asset category (stocks.xlsx, crypto.xlsx, startups.xlsx, etc.)
- **Other data** (signals, feed, watchlist, tax) remains in `data/*.json`
- **Server** reads Excel files (via `lib/excel.js`) and serves as JSON API -- read-only for portfolio
- **Claude Code** handles all portfolio writes using the xlsx skill (add, edit, delete holdings)
- **Dashboard** is pure visualization -- no CRUD operations
- Editing an Excel file in Numbers/Excel triggers auto-refresh via SSE file watcher

## Data Files

| File | Format | Description |
|------|--------|-------------|
| `data/stocks.xlsx` | Excel | Stock holdings |
| `data/crypto.xlsx` | Excel | Crypto holdings |
| `data/startups.xlsx` | Excel | Startup investments |
| `data/real-estate.xlsx` | Excel | Real estate (template) |
| `data/signals.json` | JSON | AI-generated signals |
| `data/feed.json` | JSON | News feed |
| `data/watchlist.json` | JSON | Watched assets |
| `data/tax-summary.json` | JSON | Tax planning data |
| `data/profile.json` | JSON | User profile (location, tax, accounts) |

Drop any new `.xlsx` file into `data/` to add a new asset category automatically.

## Excel Schema

See `skills/capis-portfolio/references/asset-schema.md` for the full Excel column spec.

Required columns: `id`, `name`, `ticker`, `quantity`, `avgCost`, `currentPrice`, `change24h`, `notes`

Optional columns: `accountType`, `accountName`, `costBasis`, `purchaseDate`, `Day 1` through `Day 7` (sparkline data)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolio` | All holdings (from Excel files) |
| GET | `/api/portfolio/categories` | List detected asset categories |
| GET | `/api/signals` | All AI signals |
| POST | `/api/signals` | Add a new signal |
| PATCH | `/api/signals/:id` | Update signal (e.g., dismiss) |
| GET | `/api/feed` | News feed items |
| GET | `/api/tax-summary` | Tax planning data |
| GET | `/api/watchlist` | Watched assets |
| GET | `/api/stats` | Computed portfolio statistics |
| GET | `/api/profile` | User profile (location, tax, accounts) |
| GET | `/api/events` | SSE stream for real-time browser sync |

## Real-Time Sync

The server watches `data/*.xlsx` for changes (500ms debounce) and broadcasts SSE events to connected browsers. Editing an Excel file in Numbers/Excel will auto-refresh the dashboard. Signals/feed mutations also broadcast SSE events.

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
| Real Estate | `#6b7d5e` |
| Sparkline up | `#3d7a3d` |
| Sparkline down | `#b5443b` |

New categories get auto-assigned fallback colors from the forest palette.

**Fonts** (loaded from Google Fonts in `public/index.html`)

- Display: `Noto Serif` (--font-display)
- Body: `Noto Sans` (--font-body)
- Mono: `JetBrains Mono` (--font-mono)

**When adding new UI**, use CSS variables (`var(--gold-primary)`, `var(--bg-card)`, etc.) instead of hardcoding hex values. The `--gold-*` variable names are kept for compatibility but map to forest green.

## Key Conventions

- No external APIs or databases -- portfolio in Excel, other data in JSON
- Portfolio CRUD is done by Claude Code via xlsx skill, not via API
- Frontend has no build step -- edit files directly in `public/`
- Port 3333 is the standard port
- Frontend uses ES modules (import/export)
- No framework dependencies -- vanilla JS only
