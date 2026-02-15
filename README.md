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
/capis                  # Launch dashboard
/capis stop             # Stop server
/capis reset            # Re-seed template data
/capis status           # Check server status

/capis-data             # Data management menu
/capis-data clear       # Wipe all data (keeps schema + empty xlsx shells)
/capis-data template    # Import demo data (Bay Area tech family)
/capis-data setup       # Guided step-by-step data entry
```

## Runtime Architecture Snapshot

```text
Claude Code
  ├─ /capis command (.claude/commands/capis.md)        # launch / stop / status
  ├─ /capis-data command (.claude/commands/capis-data.md)  # clear / template / setup
  ├─ portfolio-intel skill (skills/portfolio-intel/)      # portfolio analysis & management
  ├─ onboarding skill (skills/onboarding/)               # guided data entry (5-phase)
  ├─ tax-analyst agent (.claude/agents/tax-analyst.md)    # tax analysis
  └─ price-tracker agent (.claude/agents/price-tracker.md) # live price updates
          │
          ▼
Express server (server.js, :3333)
  ├─ serves SPA (public/)
  ├─ REST API (/api/*)
  ├─ SSE stream (/api/events)
  └─ fs.watch(data/) -> broadcasts: portfolio, profile, tax, signals
          │
          ▼
Data layer (local files)
  ├─ Excel: 10 asset categories + 4 liability categories (data/*.xlsx)
  ├─ categories config: data/categories.json (schema)
  └─ JSON: profile, tax-summary, signals, feed, watchlist
```

## Project Structure Snapshot

```text
Capis/
├── .claude/
│   ├── agents/
│   │   └── tax-analyst.md             # Tax analysis agent
│   └── commands/
│       ├── capis.md                   # /capis — launch dashboard
│       └── capis-data.md             # /capis-data — data management
├── data/                              # All user data (Excel + JSON)
│   ├── stocks.xlsx                    # Asset: stocks, ETFs
│   ├── crypto.xlsx                    # Asset: cryptocurrency
│   ├── angel-investment.xlsx          # Asset: startup investments
│   ├── employee-equity.xlsx           # Asset: RSUs, ISOs, ESPP
│   ├── real-estate.xlsx               # Asset: real estate (physical property)
│   ├── cash.xlsx                      # Asset: cash & checking
│   ├── savings.xlsx                   # Asset: savings, CDs, 529
│   ├── vehicles.xlsx                  # Asset: vehicles
│   ├── jewelry.xlsx                   # Asset: jewelry & watches
│   ├── art.xlsx                       # Asset: art & collectibles
│   ├── credit-cards.xlsx              # Liability: credit cards
│   ├── mortgage.xlsx                  # Liability: mortgage
│   ├── auto-loan.xlsx                 # Liability: auto loans
│   ├── student-loan.xlsx              # Liability: student loans
│   ├── categories.json                # Schema: asset/liability classes, account types
│   ├── profile.json                   # User profile (personal, family, tax, accounts)
│   ├── tax-summary.json               # Tax data & taxable events
│   ├── signals.json                   # AI-generated alerts
│   ├── feed.json                      # News & market intelligence
│   └── watchlist.json                 # Watched assets
├── lib/
│   └── excel.js                       # Excel reader (xlsx → JSON for API)
├── public/                            # Frontend (vanilla HTML/CSS/JS, no build step)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── app.js
│       ├── views/
│       │   ├── portfolio.js
│       │   ├── feed.js
│       │   ├── legal.js
│       │   └── profile.js
│       ├── components/
│       │   ├── sidebar.js
│       │   ├── header.js
│       │   └── charts.js
│       └── utils/
│           ├── api.js
│           └── sse.js
├── scripts/
│   ├── seed-data.js                   # Template data seeder (Bay Area family)
│   └── clear-data.js                  # Wipe data, keep schema + empty xlsx shells
├── skills/
│   ├── portfolio-intel/               # Portfolio analysis & management skill
│   │   ├── SKILL.md
│   │   └── references/asset-schema.md
│   ├── onboarding/                    # Guided data entry skill (5-phase)
│   │   ├── SKILL.md
│   │   └── references/data-schema.md
│   └── tax-professional/              # US tax knowledge base skill
│       ├── SKILL.md
│       └── references/common-writeoffs.md
├── server.js                          # Express server (port 3333)
├── README.md
└── DEVLOG.md
```

## Data Architecture

Capis uses a hybrid local data model:

- Portfolio holdings and liabilities are stored in `data/*.xlsx`.
- Category/class definitions are stored in `data/categories.json`.
- Other app data is stored in JSON (`signals`, `feed`, `watchlist`, `tax-summary`, `profile`).

### Portfolio Files (Excel)

Asset categories (10):
- `stocks.xlsx`
- `crypto.xlsx`
- `angel-investment.xlsx`
- `employee-equity.xlsx`
- `real-estate.xlsx`
- `cash.xlsx`
- `savings.xlsx`
- `vehicles.xlsx`
- `jewelry.xlsx`
- `art.xlsx`

Liability categories (4):
- `credit-cards.xlsx`
- `mortgage.xlsx`
- `auto-loan.xlsx`
- `student-loan.xlsx`

Drop any new `.xlsx` file into `data/` to add a new category automatically.

### Non-Portfolio Files (JSON)

- `categories.json`
- `signals.json`
- `feed.json`
- `watchlist.json`
- `tax-summary.json`
- `profile.json`

## Tech Stack

| Layer | Choice |
|------|--------|
| Server | Express (Node.js) |
| Frontend | Vanilla HTML/CSS/JS (ES modules, no build step) |
| Charts | SVG-based components |
| Storage | Excel + JSON (local files) |
| Excel I/O | `xlsx` (SheetJS) |
| Realtime | SSE (`/api/events`) + `fs.watch` |
| AI Integration | Claude Code slash commands + skills + agents |
| Fact-Checking | Perplexity MCP (Sonar Pro) for real-time tax/rate verification |

## Claude Code Integration

### Slash Commands

| Command | File | Purpose |
|---------|------|---------|
| `/capis` | `.claude/commands/capis.md` | Launch / stop / status / reset |
| `/capis-data` | `.claude/commands/capis-data.md` | Data management: clear, template, guided setup |

### Skills

| Skill | Path | Purpose |
|-------|------|---------|
| **Portfolio Intelligence** | `skills/portfolio-intel/` | Portfolio analysis, position management, signal generation |
| **Onboarding** | `skills/onboarding/` | 5-phase guided data entry (profile → accounts → assets → liabilities → complete). Supports file import (xlsx/pdf/docs/csv/txt) |
| **Tax Professional** | `skills/tax-professional/` | US tax knowledge base (deductions, strategies, audit risk) |

### Agents

| Agent | File | Purpose |
|-------|------|---------|
| **Tax Analyst** | `.claude/agents/tax-analyst.md` | Reads tax + portfolio data, returns tax briefing |
| **Price Tracker** | `.claude/agents/price-tracker.md` | Fetches live market prices, updates portfolio xlsx |

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

## Prerequisites

### Perplexity API Key (Recommended)

Capis agents fact-check tax rates, contribution limits, and deadlines against live data before presenting numbers. This requires a Perplexity API key.

1. Get an API key at https://www.perplexity.ai/settings/api
2. Add to your Claude Code MCP config (`~/.claude/mcp.json` or project-level `.claude/mcp.json`):

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@anthropic/perplexity-mcp"],
      "env": {
        "PERPLEXITY_API_KEY": "pplx-..."
      }
    }
  }
}
```

Without Perplexity, agents fall back to `WebSearch`/`WebFetch` (slower, less accurate) or cached data in the tax-professional skill (may be outdated due to new legislation).

## Roadmap

- [ ] Identity and Profile Architecture
  - [ ] `Profile` mode selection: `Individual` / `Family` / `Institution`
  - [ ] Detailed tax identity modeling across personal, pre-company, and company-owner states
  - [ ] Advanced profile settings for entity-aware tax planning

- [ ] Tax Intelligence and Planning Lifecycle
  - [ ] Pre-acquisition tax planning (before entering positions)
  - [ ] Holding-period tax opportunity/risk checks
  - [ ] Post-transaction and year-end/finalization tax workflows
  - [ ] Advanced tax optimization recommendations for high-complexity cases

- [ ] Asset Management Expansion
  - [ ] Introduce higher-level asset classification (for example: equities, fixed income, commodities, cash/cash equivalents)
  - [ ] Extend commodity coverage (for example gold, silver, copper) and map to clear portfolio buckets
  - [ ] Expand fixed-income coverage (for example bonds and treasuries) as first-class portfolio categories
  - [ ] Broader asset universe coverage (equities, bonds/treasuries, commodities/precious metals, cash equivalents)
  - [ ] Scalable navigation IA as asset surfaces grow
  - [ ] Multi-portfolio support

- [ ] Agent System Expansion
  - [ ] Onboarding investigation agent (for empty profile state; asks guided questions and backfills missing data)
  - [ ] Profile/composition agent (responsible for identity/profile configuration workflow)
  - [ ] Tax agent suite (split current tax agent into clearer sub-agents by stage/use case)
  - [ ] Real-time portfolio query agent
  - [ ] Wealth planning agent

- [ ] Commercial model for advanced tax outcomes (explore value-based pricing, for example savings-share style pricing instead of pure tier pricing)
