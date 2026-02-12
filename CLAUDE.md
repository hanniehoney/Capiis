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
- `.claude/agents/` -- Independent subagents (tax, etc.) with isolated context
- `skills/capis-portfolio/` -- Portfolio intelligence skill (interactive)
- `skills/tax-professional/` -- General US tax knowledge base (reference skill)
- `scripts/seed-data.js` -- Mock data seeder (generates Excel + JSON)

## Data Architecture (Hybrid)

- **Portfolio data** lives in `data/*.xlsx` -- one Excel file per asset category (stocks.xlsx, crypto.xlsx, angel-investment.xlsx, etc.)
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
| `data/angel-investment.xlsx` | Excel | Angel investments |
| `data/employee-equity.xlsx` | Excel | Employee equity (RSUs/ISOs/ESPP) |
| `data/real-estate.xlsx` | Excel | Real estate (template) |
| `data/signals.json` | JSON | AI-generated signals |
| `data/feed.json` | JSON | News feed |
| `data/watchlist.json` | JSON | Watched assets |
| `data/tax-summary.json` | JSON | Tax planning data |
| `data/profile.json` | JSON | User profile (location, tax, accounts) |

Drop any new `.xlsx` file into `data/` to add a new asset category automatically.

## Excel Schema

See `skills/capis-portfolio/references/asset-schema.md` for the full Excel column spec.

Required columns: `id`, `name`, `ticker`, `quantity`, `avgCost`, `currentPrice`, `notes`

Optional columns: `accountType`, `accountName`, `costBasis`, `purchaseDate`, `lastUpdated`

Employee equity columns (employee-equity.xlsx only): `equityType`, `grantDate`, `vestingSchedule`, `strikePrice`, `fmvAtGrant`

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
| Angel Investment | `#a4ac86` |
| Employee Equity | `#4a7c59` |
| Cash | `#8a9178` |
| Real Estate | `#6b7d5e` |

New categories get auto-assigned fallback colors from the forest palette.

**Fonts** (loaded from Google Fonts in `public/index.html`)

- Display: `Noto Serif` (--font-display)
- Body: `Noto Sans` (--font-body)
- Mono: `JetBrains Mono` (--font-mono)

**When adding new UI**, use CSS variables (`var(--gold-primary)`, `var(--bg-card)`, etc.) instead of hardcoding hex values. The `--gold-*` variable names are kept for compatibility but map to forest green.

## Agent Architecture

Capis uses independent subagents defined in `.claude/agents/`. Each agent has its own isolated context, reads data autonomously, and returns a structured analysis. Agents can run **in parallel** -- Claude delegates to multiple agents simultaneously.

### Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| **Tax Agent** | `.claude/agents/capis-tax.md` | Reads tax + portfolio data, calculates time-sensitive deadlines, returns tax briefing |
| *(more agents coming)* | | |

### How Agents Work

Agents are Markdown files with YAML frontmatter in `.claude/agents/`:

```yaml
---
name: capis-tax
description: Tax analysis agent...
tools: Read, Grep, Bash, Glob
model: sonnet
memory: project
maxTurns: 15
skills: tax-professional
---

# Agent instructions here...
```

Claude auto-delegates based on the `description` field, or you can request explicitly:
- "Analyze my tax situation" (auto-delegation)
- "Use the capis-tax agent to check my taxes" (explicit)
- "Run tax and portfolio agents in parallel" (parallel execution)

### Parallel Execution

Multiple agents run concurrently when invoked together. Each agent reads its own data sources independently -- no shared state. Coordination happens in the main conversation after all agents return.

**Important**: Agents cannot spawn other agents (no nesting). All parallel agents are launched from the main conversation.

### Agent vs Skill

- **Agent** (in `.claude/agents/`): independent subagent with isolated context, returns complete analysis. Cannot have back-and-forth conversation. Used for structured briefings and parallel execution.
- **Skill** (in `skills/`): instructions Claude follows in the main conversation. Supports interactive dialogue. Used for portfolio management, data entry, and conversational guidance.

### Supporting Skills (non-agent)

| Skill | Path | Purpose |
|-------|------|---------|
| **Portfolio Intelligence** | `skills/capis-portfolio/SKILL.md` | Interactive portfolio analysis, position management, signal generation |
| **Tax Professional** | `skills/tax-professional/SKILL.md` | General US tax knowledge base (deductions, strategies, audit risk) |

Agents can preload skills for domain knowledge via the `skills` frontmatter field. The Tax Agent preloads Tax Professional for deep tax law questions.

## Data Backfill Convention (Project-Wide)

**Every agent and skill MUST write back any new or corrected information to the appropriate data files.** This is a core architectural principle -- the system learns and self-corrects through use.

### Rules

1. **If an agent discovers missing data** (e.g., profile has no tax rates), it should flag it, ask the user if needed, and backfill the data file once confirmed.
2. **If an agent computes a corrected value** (e.g., recalculated tax liability differs from stored value), it should update the data file and note the change.
3. **If the user provides new information during conversation** (e.g., "I just sold 10 shares of AAPL"), the relevant data file should be updated (e.g., add a taxable event to `tax-summary.json`, update portfolio Excel).
4. **Always read before writing** -- merge changes carefully, never overwrite unrelated fields.
5. **Always log what was changed** in the response so the user knows what was updated.

### Backfill Targets

| Information Type | Write To |
|-----------------|----------|
| Tax rates, filing status, accounts | `data/profile.json` |
| Taxable events, estimated liability | `data/tax-summary.json` |
| Portfolio positions | `data/*.xlsx` (via xlsx skill) |
| Signals and alerts | `data/signals.json` |
| Market intelligence | `data/feed.json` |
| Category config | `data/categories.json` |

### Web Verification

Agents with web search access (e.g., Tax Agent) should verify data against current sources on every run. Web-verified data is the source of truth; stored data is the cache. If they differ, update the cache.

## Key Conventions

- No external APIs or databases -- portfolio in Excel, other data in JSON
- Portfolio CRUD is done by Claude Code via xlsx skill, not via API
- Frontend has no build step -- edit files directly in `public/`
- Port 3333 is the standard port
- Frontend uses ES modules (import/export)
- No framework dependencies -- vanilla JS only
