# Capis

**Capitalis Apis – Where Wealth Swarms.**

A wealth & asset management dashboard built on the Claude Code ecosystem. Not for trading or detailed accounting — Capis is your **big-picture command center** for portfolio overview, market intelligence, and financial decision-making.

## About

Capis combines *Capital* with *Apis* (Latin for "bee"), embodying the concept of a wealth swarm hive — a professional incubation ecosystem where capital and intelligence converge.

Like bees working in perfect coordination, Capis harnesses collective intelligence and swarm dynamics to optimize capital allocation and investment decisions.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Seed mock data
npm run seed

# 3. Launch
npm start
# → http://localhost:3333
```

Or from Claude Code:

```
/capis          # Launch dashboard (installs deps, starts server, opens browser)
/capis stop     # Stop the server
/capis reset    # Reset to mock data
/capis status   # Check if server is running
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Claude Code                        │
│  ┌──────────────┐  ┌────────────────────────────┐   │
│  │ /capis       │  │ capis-portfolio Skill       │   │
│  │ Slash Command│  │ Portfolio analysis, signals, │   │
│  │              │  │ rebalancing, position mgmt   │   │
│  └──────┬───────┘  └─────────────┬──────────────┘   │
│         │                        │                   │
└─────────┼────────────────────────┼───────────────────┘
          │                        │
          ▼                        ▼
┌─────────────────────────────────────────────────────┐
│              Express Server (:3333)                   │
│                                                       │
│  Static Files (public/)     JSON API (/api/*)         │
│  ┌─────────────────┐    ┌──────────────────────┐     │
│  │ SPA Frontend    │    │ GET  /api/portfolio   │     │
│  │ (vanilla JS)    │◄──►│ GET  /api/signals     │     │
│  │                 │    │ GET  /api/feed         │     │
│  │ Hash Router:    │    │ GET  /api/stats        │     │
│  │ #portfolio      │    │ GET  /api/tax-summary  │     │
│  │ #feed           │◄───│ GET  /api/events (SSE) │     │
│  │ #legal          │    │ PUT  /api/portfolio/:id│     │
│  └─────────────────┘    │ POST /api/portfolio    │     │
│                          │ DELETE /api/portfolio/:id│    │
│                          │ POST /api/signals      │     │
│                          │ PATCH/api/signals/:id  │     │
│                          └──────────┬───────────┘     │
└─────────────────────────────────────┼─────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │   data/ (JSON)    │
                            │                    │
                            │  portfolio.json    │
                            │  signals.json      │
                            │  feed.json         │
                            │  watchlist.json    │
                            │  tax-summary.json  │
                            └──────────────────┘
```

## Project Structure

```
Capis/
├── .claude/
│   └── commands/
│       └── capis.md                  # /capis slash command
├── public/                            # Frontend (no build step)
│   ├── index.html                     # SPA shell
│   ├── css/styles.css                 # "Hive Vault" theme
│   ├── js/
│   │   ├── app.js                     # Hash router + init
│   │   ├── views/
│   │   │   ├── portfolio.js           # Portfolio dashboard
│   │   │   ├── feed.js                # Intelligence feed
│   │   │   └── legal.js               # Tax & legal planning
│   │   ├── components/
│   │   │   ├── sidebar.js             # Navigation sidebar
│   │   │   ├── header.js              # Top bar
│   │   │   └── charts.js              # SVG donut chart + sparklines
│   │   └── utils/
│   │       ├── api.js                 # Fetch wrapper
│   │       └── sse.js                 # Server-Sent Events client
│   └── assets/
│       └── favicon.svg                # Hexagonal bee icon
├── data/                               # Local JSON storage
│   ├── portfolio.json                  # Holdings (stocks, crypto, startups)
│   ├── signals.json                    # AI-generated alerts
│   ├── feed.json                       # News & market intel
│   ├── watchlist.json                  # Tracked assets
│   └── tax-summary.json               # Tax planning data
├── skills/
│   └── capis-portfolio/
│       ├── SKILL.md                    # Portfolio intelligence skill
│       └── references/
│           └── asset-schema.md         # Data schema documentation
├── scripts/
│   └── seed-data.js                    # Mock data generator
├── server.js                           # Express server
├── package.json                        # Single dependency: Express
├── CLAUDE.md                           # Project conventions for Claude
└── .gitignore
```

## Dashboard Views

### Portfolio & Assets (`#portfolio`)
- **Stat cards**: Total portfolio value, 24h change, position count, best performer
- **Allocation donut chart**: Visual breakdown by category (stocks / crypto / startups)
- **Holdings table**: All positions with price, quantity, value, P&L, 24h change, 7-day sparkline

### Intelligence Feed (`#feed`)
- **AI Signal cards**: Actionable alerts with priority levels (high/medium/low) and dismiss functionality
- **News feed**: Market news from mock sources (Bloomberg, Reuters, CoinDesk, TechCrunch)
- **Filter tabs**: All, Signals, Crypto, Earnings, Macro, Startups

### Tax & Legal (`#legal`)
- **Tax overview**: Realized gains/losses, estimated tax liability, unrealized gains
- **Tax-loss harvesting**: Opportunities to offset gains
- **Taxable events table**: All sell/loss events with cost basis and gain/loss calculations

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Server | Express (Node.js) | Single dependency, zero config |
| Frontend | Vanilla HTML/CSS/JS | No build step, ES modules, instant iteration |
| Charts | Pure SVG | Donut chart + sparklines, no charting library |
| Storage | JSON files | Human-readable, git-friendly, zero setup |
| Fonts | Playfair Display, DM Sans, JetBrains Mono | Distinctive financial aesthetic |
| Theme | "Hive Vault" | Dark terminal + gold honeycomb accents |
| Integration | Claude Code slash command + skill | Native AI-powered portfolio intelligence |

## Claude Code Integration

### Slash Command (`/capis`)
Handles the full lifecycle: dependency install, server start, browser launch, and server stop. Defined in `.claude/commands/capis.md`.

### Portfolio Skill
Located in `skills/capis-portfolio/SKILL.md`. Enables Claude to:
- Analyze portfolio allocation and performance
- Generate investment signals and alerts
- Add, update, or remove positions via natural language
- Suggest rebalancing actions with tax implications
- Read and write all data files following the defined schema

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/portfolio` | All holdings with prices and metadata |
| `POST` | `/api/portfolio` | Add a new holding |
| `PUT` | `/api/portfolio/:id` | Update a specific holding |
| `DELETE` | `/api/portfolio/:id` | Remove a holding |
| `GET` | `/api/signals` | All AI-generated signals |
| `POST` | `/api/signals` | Create a new signal |
| `PATCH` | `/api/signals/:id` | Update a signal (e.g., dismiss) |
| `GET` | `/api/feed` | News and market intelligence items |
| `GET` | `/api/tax-summary` | Tax planning data and events |
| `GET` | `/api/watchlist` | Tracked assets not yet owned |
| `GET` | `/api/stats` | Computed portfolio statistics (total value, allocation %, 24h change, best performer) |
| `GET` | `/api/events` | SSE stream — pushes real-time data change events to the browser |

## Real-Time Sync (SSE)

Data changes made through the CLI conversation are pushed to the browser instantly via Server-Sent Events — no page refresh needed.

```
CLI conversation → AI calls API → server writes JSON + broadcasts SSE → browser re-renders
```

When you tell the AI about a new investment, position update, or signal in the Claude Code terminal, the dashboard updates live. The browser subscribes to `/api/events` on page load and re-renders the active view whenever the underlying data changes.

## Mock Data

The seed script (`npm run seed`) generates a realistic portfolio:

- **5 stocks**: AAPL, NVDA, MSFT, TSLA, AMZN
- **3 crypto**: BTC, ETH, SOL
- **3 startups**: NexaFlow (AI supply chain), CarbonLens (carbon credits), VaultEdge (decentralized identity)
- **7 signals**: Rebalance alerts, earnings warnings, tax harvesting, concentration risk
- **16 news items**: Across crypto, earnings, macro, and startups categories
- **6 taxable events**: Mix of long/short term gains and losses

## Roadmap

- [ ] **Phase 2**: MCP servers for live market data (Alpha Vantage, CoinGecko)
- [ ] **Phase 2**: Background agents for continuous monitoring and signal generation
- [ ] **Phase 2**: SQLite migration for data persistence
- [ ] **Phase 3**: Multi-portfolio support
- [ ] **Phase 3**: PWA support for mobile
- [ ] **Phase 3**: Open source skill ecosystem (community strategies and MCP connectors)

---

*Built for Claude Code Hackathon*
