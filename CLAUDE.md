# Capiis -- Development Guide

This file is for Claude Code. For human-readable overview, see `README.md`.

## Commands

- `npm start` -- Express server on http://localhost:3333
- `npm run seed` -- import default template (Alex). `node scripts/seed-data.js --list` for all personas.
- `npm run clear` -- wipe all user data, preserve empty xlsx shells + categories.json
- `/capiis` -- launch dashboard (start server + open browser)
- `/capiis-data` -- data management (clear / template / guided setup)

## Data Files

**Portfolio (Excel)** -- one file per category, sheet name: Holdings (assets) or Liabilities:

| File | Type |
|------|------|
| `data/stocks.xlsx` | Asset: stocks, ETFs, index funds |
| `data/crypto.xlsx` | Asset: cryptocurrency |
| `data/angel-investment.xlsx` | Asset: startup investments |
| `data/employee-equity.xlsx` | Asset: RSUs, ISOs, ESPP |
| `data/real-estate.xlsx` | Asset: physical property (REIT ETFs go in stocks) |
| `data/cash.xlsx` | Asset: cash & checking |
| `data/savings.xlsx` | Asset: savings, CDs, 529 |
| `data/vehicles.xlsx` | Asset: vehicles |
| `data/jewelry.xlsx` | Asset: jewelry & watches |
| `data/art.xlsx` | Asset: art & collectibles |
| `data/credit-cards.xlsx` | Liability |
| `data/mortgage.xlsx` | Liability |
| `data/auto-loan.xlsx` | Liability |
| `data/student-loan.xlsx` | Liability |

**JSON files:**

| File | Description |
|------|-------------|
| `data/categories.json` | Schema: asset classes, liability classes, account types (tracked in git) |
| `data/profile.json` | User profile (personal, family, location, tax, accounts) |
| `data/profile.md` | Narrative context: goals, philosophy, career, family. Read by all agents/skills. |
| `data/tax-summary.json` | Tax planning data and taxable events |
| `data/signals.json` | AI-generated signals and alerts |
| `data/feed.json` | News feed (fallback when RSS unavailable) |
| `data/feed-sources.json` | RSS/feed source URLs |
| `data/intel-digest.json` | Feed analyst output |
| `data/watchlist.json` | Watched assets not in portfolio |

Drop any new `.xlsx` into `data/` to add a new asset category automatically.

## Excel Schema

See `skills/onboarding/references/data-schema.md` for full column spec.

Required: `id`, `name`, `ticker`, `quantity`, `avgCost`, `currentPrice`, `notes`

Optional: `accountType`, `accountName`, `costBasis`, `purchaseDate`, `lastUpdated`

Employee equity only: `equityType`, `grantDate`, `vestingSchedule`, `strikePrice`, `fmvAtGrant`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolio` | All holdings (from Excel files) |
| GET | `/api/portfolio/categories` | List detected asset categories |
| GET | `/api/categories` | Category/class metadata config |
| GET | `/api/stats` | Computed portfolio statistics |
| GET | `/api/signals` | All AI signals |
| POST | `/api/signals` | Add a new signal |
| PATCH | `/api/signals/:id` | Update signal (e.g., dismiss) |
| GET | `/api/feed` | News feed items |
| GET | `/api/intel-digest` | Feed analyst output |
| GET | `/api/tax-summary` | Tax planning data |
| GET | `/api/watchlist` | Watched assets |
| GET | `/api/profile` | User profile |
| GET | `/api/profile/memory` | Profile memory narrative (text/markdown) |
| GET | `/api/events` | SSE stream for real-time browser sync |

## Real-Time Sync

Server watches `data/` (500ms debounce) and broadcasts SSE events:

- `*.xlsx` / `categories.json` changes → broadcast `portfolio`
- `profile.json` / `profile.md` → broadcast `profile`
- `tax-summary.json` → broadcast `tax`
- `signals.json` / `intel-digest.json` → broadcast `signals`
- Signal mutations (`POST/PATCH /api/signals`) → broadcast `signals`

Frontend view refresh map: `portfolio` → #portfolio, #legal | `profile` → #profile, #legal | `tax` → #legal | `signals` → #feed

## Theme: Forest Canopy

Light ivory + forest green earth tones. All tokens in `:root` CSS variables in `public/css/styles.css`.

**Palette**

| Role | Hex | Usage |
|------|-----|-------|
| Forest Green | `#2d4a2b` | Primary accent, text, borders |
| Deep Forest | `#1a2e19` | Dimmed accent |
| Bright Forest | `#3d6339` | Light accent hover |
| Sage | `#7d8471` | Muted secondary |
| Olive | `#a4ac86` | Tertiary / light accent |
| Ivory | `#faf9f6` | Page background |
| Off-white | `#f0efe8` | Sidebar / header bg |
| White | `#ffffff` | Card backgrounds |

**Semantic:** `--green` #3d7a3d (positive) | `--red` #b5443b (negative) | `--blue` #5a7d5a (links) | `--teal` #7d8471 (secondary)

**Chart colors** (`public/js/components/charts.js`): Stocks #5b7e4a | Crypto #7d8471 | Angel #a4ac86 | Employee Equity #4a7c59 | Cash #8a9178 | Real Estate #6b7d5e. New categories auto-assigned from forest palette.

**Fonts** (Google Fonts): Display `Noto Serif` | Body `Noto Sans` | Mono `JetBrains Mono`

Use CSS variables (`var(--gold-primary)`, `var(--bg-card)`, etc.) not hardcoded hex. The `--gold-*` names map to forest green (kept for compatibility).

## Agent Architecture

Independent subagents in `.claude/agents/`. Each has isolated context, reads data autonomously, returns structured analysis. Can run in parallel.

| Agent | File | Purpose |
|-------|------|---------|
| **Tax Analyst** | `.claude/agents/tax-analyst.md` | Tax + portfolio data → tax briefing with verified rates |
| **Price Tracker** | `.claude/agents/price-tracker.md` | Yahoo Finance prices → update portfolio xlsx |
| **Feed Analyst** | `.claude/agents/feed-analyst.md` | RSS feeds × portfolio/profile → intel signals |

### Agent vs Skill

- **Agent** (`.claude/agents/`): isolated subagent, returns complete analysis, no back-and-forth. For structured briefings and parallel execution.
- **Skill** (`skills/`): instructions in main conversation, supports interactive dialogue. For portfolio management, data entry, conversational guidance.

| Skill | Path | Purpose |
|-------|------|---------|
| **Portfolio Intelligence** | `skills/portfolio-intel/SKILL.md` | Interactive portfolio analysis, position management, signal generation |
| **Onboarding** | `skills/onboarding/SKILL.md` | Guided data entry: 5-phase (profile → accounts → assets → liabilities → complete). Supports file import. |
| **Tax Professional** | `skills/tax-professional/SKILL.md` | US tax knowledge base (deductions, strategies, audit risk) |

Agents preload skills via `skills` frontmatter. All agents/skills should read `data/profile.md` at startup for narrative context.

### Session Hook: Auto-Orchestration

`SessionStart` hook (`.claude/hooks/session-check.sh`) checks data freshness and outputs `[capiis-auto]` triggers:

| Trigger | Action |
|---------|--------|
| `STALE_PRICES` | Run price-tracker agent |
| `TAX_SEASON` | Run tax-analyst agent |
| `STALE_INTEL` | Run feed-analyst agent (intel >12h stale) |
| Multiple | Run applicable agents **in parallel**, merge into unified briefing |

**Unified briefing order:** 1) Most impactful change 2) Time-sensitive actions 3) Tax position 4) Market moves. Do NOT present separate reports.

## Intel Feed

The Feed page is an **intelligence capture layer**, not a content reader. Aggregates user's trusted RSS sources so agents can cross-reference against portfolio.

**Design:** 情報捕捉層，不是內容閱讀器。Headlines + signals only. Sources curated in CLI, not UI.

**Feed UI:** Two tabs — **All** (chronological RSS cards) and **Signals** (undismissed AI signals with priority dots, affected tickers, expand/collapse body, dismiss button).

**Signal schema compatibility:** New format (`priority` + `body`) and legacy (`severity` + `message`). Renderer handles both via fallback.

**Sources:** Stored in `data/feed-sources.json`. Server hot-reloads on each request (after cache TTL). Fetches in parallel, deduplicates, caches 5 min. Falls back to `data/feed.json` if all feeds fail.

## Data Backfill Convention

**Every agent and skill MUST write back corrections to data files.** Core architectural principle.

### Write-Through Cache Pattern

```
Agent runs (expensive) → writes to JSON → Dashboard reads JSON (free)
```

Dashboard files (`tax-summary.json`, `signals.json`, `profile.json`) must include `lastComputed` / `lastUpdated` timestamp. Agents MUST update on every run.

### Rules

1. Agent discovers missing data → flag it, ask user, backfill once confirmed
2. Agent computes corrected value → update data file, note the change
3. User provides new info in conversation → update relevant data file
4. Always read before writing — merge carefully, never overwrite unrelated fields
5. Always log what changed in response
6. Always update timestamps

### Backfill Targets

| Information Type | Write To |
|-----------------|----------|
| Tax rates, filing status, accounts | `data/profile.json` |
| Taxable events, estimated liability | `data/tax-summary.json` |
| Portfolio positions | `data/*.xlsx` (via xlsx skill) |
| Signals and alerts | `data/signals.json` |
| Market intelligence | `data/feed.json` |
| Intel analysis | `data/intel-digest.json` |
| Feed sources | `data/feed-sources.json` |
| Category config | `data/categories.json` |
| Life events, goals, philosophy | `data/profile.md` |

### Web Verification

Agents with web search should verify data against current sources on every run. Web-verified = source of truth; stored data = cache. If they differ, update the cache.

## Compliance Guardrails

Capiis is a **Personal Financial Management (PFM)** tool, NOT an investment advisor.

**Role: Financial Analyst Assistant**
- Present facts, not recommendations
- Describe deviations, don't prescribe actions
- Scenario analysis OK, directives forbidden

**Required disclaimer** (append when analysis touches investment/tax/portfolio decisions):
> *This analysis is for informational purposes only and does not constitute investment, tax, or legal advice. Consult a qualified professional before making financial decisions.*

**Forbidden patterns:** No CTAs (buy/sell/hold), no return predictions, no urgency language, no product recommendations.

**Fact vs Insight:** Label clearly. "Your realized gains are $140K" (fact) vs "20%+ single-stock concentration is above typical thresholds" (insight). Never present AI interpretations as facts.

## MCP: Perplexity for Fact-Checking

Agents outputting financial figures MUST fact-check via Perplexity before presenting to user.

**Always single-topic parallel queries:**
```
Search 1: "2025 standard deduction MFJ, SALT cap MFJ MAGI phase-out"
Search 2: "2025 401k HSA IRA contribution limits"
Search 3: "2025 California state tax $800K MFJ bracket by bracket"
```

| Tool | Use When |
|------|----------|
| `mcp__perplexity__search` | Fact-checking rates, limits, deadlines (default) |
| `mcp__perplexity__reason` | Complex multi-step tax scenarios |
| `mcp__perplexity__deep_research` | Comprehensive reports (avoid unless needed) |

## Key Conventions

- No external APIs or databases — portfolio in Excel, other data in JSON
- Portfolio CRUD via Claude Code xlsx skill, not via API
- Frontend has no build step — edit `public/` directly
- Port 3333 is standard
- Frontend uses ES modules (import/export)
- No framework dependencies — vanilla JS only
