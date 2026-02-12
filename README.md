# Capis

**Capitalis Apis - Where Wealth Swarms.**

Capis is a local-first wealth and asset management dashboard built for the Claude Code ecosystem.  
It focuses on portfolio visibility, tax-aware analysis, and decision support (not execution/trading).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Seed local demo data (Excel + JSON)
npm run seed

# 3. Launch
npm start
# -> http://localhost:3333
```

Or from Claude Code:

```text
/capis          # Launch dashboard
/capis stop     # Stop server
/capis reset    # Re-seed local data
/capis status   # Check server status
```

## Data Architecture

Capis uses a hybrid local data model:

- Portfolio holdings and liabilities are stored in `data/*.xlsx`.
- Category/class definitions are stored in `data/categories.json`.
- Other app data is stored in JSON (`signals`, `feed`, `watchlist`, `tax-summary`, `profile`).

### Portfolio Files (Excel)

Asset categories:
- `cash.xlsx`
- `savings.xlsx`
- `stocks.xlsx`
- `crypto.xlsx`
- `startups.xlsx`
- `real-estate.xlsx`
- `vehicles.xlsx`
- `jewelry.xlsx`
- `art.xlsx`

Liability categories:
- `credit-cards.xlsx`
- `mortgage.xlsx`
- `auto-loan.xlsx`
- `student-loan.xlsx`

### Non-Portfolio Files (JSON)

- `categories.json`
- `signals.json`
- `feed.json`
- `watchlist.json`
- `tax-summary.json`
- `profile.json`

Detailed architecture snapshots and structure notes were moved to `DEVLOG.md` (Day 2 supplement).

## Tech Stack

| Layer | Choice |
|------|--------|
| Server | Express (Node.js) |
| Frontend | Vanilla HTML/CSS/JS (ES modules, no build step) |
| Charts | SVG-based components |
| Storage | Excel + JSON (local files) |
| Excel I/O | `xlsx` (SheetJS) |
| Realtime | SSE (`/api/events`) + `fs.watch` |
| AI Integration | Claude Code slash command + local skill |

## Claude Code Integration

### Slash Command

`/capis` is defined in `.claude/commands/capis.md` and supports:

- launch
- status
- stop
- reset

### Portfolio Skill

Skill path: `skills/capis-portfolio/SKILL.md`

Use cases:
- portfolio analysis
- signals and rebalancing support
- Excel-backed portfolio updates through Claude workflows

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/portfolio` | Full portfolio payload (assets + liabilities, read from Excel) |
| `GET` | `/api/portfolio/categories` | Detected Excel categories |
| `GET` | `/api/categories` | Category/class metadata config |
| `GET` | `/api/stats` | Aggregated stats (net worth, allocations, tax-bucket aggregates) |
| `GET` | `/api/signals` | Signals list |
| `POST` | `/api/signals` | Create signal |
| `PATCH` | `/api/signals/:id` | Update signal (for example dismiss) |
| `GET` | `/api/feed` | Intelligence feed |
| `GET` | `/api/watchlist` | Watchlist data |
| `GET` | `/api/tax-summary` | Tax summary and events |
| `GET` | `/api/profile` | User profile (location/tax/accounts) |
| `GET` | `/api/events` | SSE event stream |

## Real-Time Sync (SSE)

Server-side watchers and events:

- `*.xlsx` and `categories.json` changes -> broadcast `portfolio`
- `profile.json` changes -> broadcast `profile`
- `tax-summary.json` changes -> broadcast `tax`
- signal mutations (`POST/PATCH /api/signals`) -> broadcast `signals`

Frontend view refresh map:

- `portfolio` -> `#portfolio`, `#legal`
- `profile` -> `#profile`, `#legal`
- `tax` -> `#legal`
- `signals` -> `#feed`

## Roadmap

- [ ] MCP-backed live market data connectors
- [ ] Background monitoring agents for signals
- [ ] `/capis` evolution from slash command into MCP-native tooling
- [ ] Multi-portfolio support
- [ ] Open skill ecosystem for strategy extensions

---

Built for Claude Code Hackathon
