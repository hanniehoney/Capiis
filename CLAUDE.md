# Capis -- Project Guide

**Capitalis Apis: Where Wealth Swarms**

A wealth & asset management dashboard built on the Claude Code ecosystem.

## Quick Start

- `npm start` -- starts Express server on http://localhost:3333
- `npm run seed` -- imports default template (Alex). Use `node scripts/seed-data.js --list` to see all personas.
- `npm run clear` -- wipes all user data, preserves empty xlsx shells + categories.json
- `/capis` -- slash command to launch (starts server + opens browser)
- `/capis stop` -- stops the server
- `/capis reset` -- resets template data
- `/capis-data` -- data management (clear / template / guided setup)
- `/capis-data clear` -- wipes all data (confirms first)
- `/capis-data template` -- imports demo data (choose from multiple personas)
- `/capis-data setup` -- guided step-by-step data entry (invokes onboarding skill)

## Project Structure

- `server.js` -- Express server (port 3333), serves static files + read-only JSON API
- `lib/excel.js` -- Excel reader module (xlsx), converts .xlsx to JSON for the API
- `public/` -- Frontend (vanilla HTML/CSS/JS, no build step, ES modules)
- `data/` -- Excel files (portfolio) + JSON files (signals, feed, watchlist, tax, profile)
- `.claude/commands/capis.md` -- Slash command: launch dashboard
- `.claude/commands/capis-data.md` -- Slash command: data management (clear / template / setup)
- `.claude/agents/` -- Independent subagents (tax, etc.) with isolated context
- `skills/portfolio-intel/` -- Portfolio intelligence skill (interactive)
- `skills/onboarding/` -- Guided data entry skill (5-phase: profile → accounts → assets → liabilities → complete)
- `skills/tax-professional/` -- General US tax knowledge base (reference skill)
- `scripts/seed-data.js` -- Multi-persona template seeder. Supports `--list` flag. Personas in `scripts/personas/`.
- `scripts/personas/` -- Persona data modules (alex.js, sophia.js, etc.)
- `scripts/clear-data.js` -- Wipes user data, preserves schema (categories.json + header-only xlsx shells)

## Template Personas

| Persona | Key | Description |
|---------|-----|-------------|
| Alex | `alex` | 37, Taiwanese. Staff Engineer (L7) @ Google, ex-Meta E6. Married, 2 kids. Cupertino homeowner. NW ~$5.5M. Green card holder, no US-Taiwan treaty. META stock concentration. |
| Sophia | `sophia` | 32, British. Staff Research Engineer @ Anthropic (ex-DeepMind London). Single, SF renter. NW ~$4.3M. O-1A visa. Private company stock, ISOs, AMT risk. UK pension/accounts. |

Import with: `node scripts/seed-data.js [persona-key]` or use `/capis-data template` for guided selection.

## Data Architecture (Hybrid)

- **Portfolio data** lives in `data/*.xlsx` -- one Excel file per asset category (stocks.xlsx, crypto.xlsx, angel-investment.xlsx, etc.)
- **Other data** (signals, feed, watchlist, tax) remains in `data/*.json`
- **Profile memory** lives in `data/profile.md` -- narrative context (goals, philosophy, career, family) that agents/skills read for personalized advice. Updated automatically from conversations.
- **Server** reads Excel files (via `lib/excel.js`) and serves as JSON API -- read-only for portfolio
- **Claude Code** handles all portfolio writes using the xlsx skill (add, edit, delete holdings)
- **Dashboard** is pure visualization -- no CRUD operations
- Editing an Excel file in Numbers/Excel triggers auto-refresh via SSE file watcher

## Data Files

**Asset Excel files** (sheet: Holdings):

| File | Category |
|------|----------|
| `data/stocks.xlsx` | Stocks, ETFs, index funds |
| `data/crypto.xlsx` | Cryptocurrency |
| `data/angel-investment.xlsx` | Angel / startup investments |
| `data/employee-equity.xlsx` | RSUs, ISOs, ESPP |
| `data/real-estate.xlsx` | Real estate (physical property only; REIT ETFs go in stocks) |
| `data/cash.xlsx` | Cash & checking |
| `data/savings.xlsx` | Savings, CDs, 529 plans |
| `data/vehicles.xlsx` | Vehicles |
| `data/jewelry.xlsx` | Jewelry & watches |
| `data/art.xlsx` | Art & collectibles |

**Liability Excel files** (sheet: Liabilities):

| File | Category |
|------|----------|
| `data/credit-cards.xlsx` | Credit cards |
| `data/mortgage.xlsx` | Mortgage |
| `data/auto-loan.xlsx` | Auto loans |
| `data/student-loan.xlsx` | Student loans |

**JSON files**:

| File | Description |
|------|-------------|
| `data/profile.json` | User profile (personal, family, location, tax, accounts) |
| `data/categories.json` | Schema: asset classes, liability classes, account types, category metadata |
| `data/tax-summary.json` | Tax planning data and taxable events |
| `data/signals.json` | AI-generated signals and alerts |
| `data/feed.json` | News and market intelligence feed (fallback when RSS unavailable) |
| `data/feed-sources.json` | RSS/feed source URLs -- the user's trusted intel sources |
| `data/intel-digest.json` | Feed analyst output: full analysis with relevance reasons and portfolio impact |
| `data/watchlist.json` | Watched assets not in portfolio |

**Markdown files**:

| File | Description |
|------|-------------|
| `data/profile.md` | Profile memory -- narrative context, life goals, investment philosophy, key decisions. Read by all agents/skills. |

Drop any new `.xlsx` file into `data/` to add a new asset category automatically.

## Excel Schema

See `skills/onboarding/references/data-schema.md` for the full column spec (assets, liabilities, profile).

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
| GET | `/api/intel-digest` | Feed analyst output (intel analysis digest) |
| GET | `/api/tax-summary` | Tax planning data |
| GET | `/api/watchlist` | Watched assets |
| GET | `/api/stats` | Computed portfolio statistics |
| GET | `/api/profile` | User profile (location, tax, accounts) |
| GET | `/api/profile/memory` | Profile memory narrative (text/markdown) |
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

## UI Notes

- 在設計前端 UI 的時候要考量到有些資訊不用補充太多在 UI 上面,因為大部分的文字資訊是可以透過命令行那邊去做文字的補充的。比如說用戶想要知道什麼叫做 Tax-Free Gains,他就直接在命令行問了。

## Agent Architecture

Capis uses independent subagents defined in `.claude/agents/`. Each agent has its own isolated context, reads data autonomously, and returns a structured analysis. Agents can run **in parallel** -- Claude delegates to multiple agents simultaneously.

### Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| **Tax Analyst** | `.claude/agents/tax-analyst.md` | Reads tax + portfolio data, calculates time-sensitive deadlines, returns tax briefing |
| **Price Tracker** | `.claude/agents/price-tracker.md` | Fetches live market prices for stocks/ETFs/crypto, updates portfolio xlsx files |
| **Feed Analyst** | `.claude/agents/feed-analyst.md` | Scans RSS feeds, cross-references against portfolio/profile, generates intel signals |

### How Agents Work

Agents are Markdown files with YAML frontmatter in `.claude/agents/`:

```yaml
---
name: tax-analyst
description: Tax analysis agent...
tools: Read, Grep, Bash, Glob, WebSearch
model: sonnet
memory: project
maxTurns: 20
skills: tax-professional
---

# Agent instructions here...
```

Claude auto-delegates based on the `description` field, or you can request explicitly:
- "Analyze my tax situation" (auto-delegation)
- "Use the tax-analyst agent to check my taxes" (explicit)
- "Run tax and portfolio agents in parallel" (parallel execution)

### Parallel Execution

Multiple agents run concurrently when invoked together. Each agent reads its own data sources independently -- no shared state. Coordination happens in the main conversation after all agents return.

**Important**: Agents cannot spawn other agents (no nesting). All parallel agents are launched from the main conversation.

### Session Hook: Auto-Orchestration

A `SessionStart` hook (`.claude/hooks/session-check.sh`) runs on every new/resumed session. It checks data freshness and upcoming deadlines, then outputs `[capis-auto]` triggers.

**When you see `[capis-auto]` output, act on it:**

| Trigger | Action |
|---------|--------|
| `STALE_PRICES` | Run the price-tracker agent (`.claude/agents/price-tracker.md`) |
| `TAX_SEASON` | Run the tax-analyst agent (`.claude/agents/tax-analyst.md`) |
| `STALE_INTEL` | Run the feed-analyst agent (`.claude/agents/feed-analyst.md`) — intel >12h stale |
| Multiple triggers | Run applicable agents **in parallel**, then merge results into a unified briefing |

**Unified briefing format** (when both agents return):
1. Most impactful change first (e.g., valuation event, large price move)
2. Time-sensitive action items (e.g., ISO holding period milestone, tax deadline)
3. Tax position summary (deadlines, estimated liability, cross-border obligations)
4. Market moves (significant movers, portfolio impact)

Do NOT present two separate reports. Merge agent results into one coherent, priority-ordered briefing. The user doesn't need to know which agent produced which data.

### Agent vs Skill

- **Agent** (in `.claude/agents/`): independent subagent with isolated context, returns complete analysis. Cannot have back-and-forth conversation. Used for structured briefings and parallel execution.
- **Skill** (in `skills/`): instructions Claude follows in the main conversation. Supports interactive dialogue. Used for portfolio management, data entry, and conversational guidance.

### Supporting Skills (non-agent)

| Skill | Path | Purpose |
|-------|------|---------|
| **Portfolio Intelligence** | `skills/portfolio-intel/SKILL.md` | Interactive portfolio analysis, position management, signal generation |
| **Onboarding** | `skills/onboarding/SKILL.md` | Guided data entry: 5-phase flow (profile → accounts → assets → liabilities → complete). Supports dialogue + file import (xlsx/pdf/docs/csv/txt). Invoked by `/capis-data setup` |
| **Tax Professional** | `skills/tax-professional/SKILL.md` | General US tax knowledge base (deductions, strategies, audit risk) |

Agents can preload skills for domain knowledge via the `skills` frontmatter field. The Tax Agent preloads Tax Professional for deep tax law questions.

**All agents and skills should read `data/profile.md`** at startup for narrative context (goals, philosophy, career, family). This enables personalized advice without requiring the user to repeat background information.

## Intel Feed

The Feed page is not a content reader — it's an **intelligence capture layer**. It aggregates the user's trusted information sources (RSS, blogs, newsletters) so that future agents/skills can cross-reference incoming intel against the user's actual portfolio.

### Design Principles

- **情報捕捉層，不是內容閱讀器。** The feed surfaces headlines and action signals. Deep reading happens at the source (external links).
- **Sources are curated in CLI, not in UI.** The user adds trusted RSS/blog URLs via Claude Code conversation. The frontend only filters and displays.
- **Signals drive action.** AI-generated signals have priority levels, affected assets, and dismiss capability. Feed items are passive context.

### Feed UI Structure

Two tabs:

- **All** — Chronological RSS articles. Each card: source, date (time if today, date otherwise), headline (clickable → original article ↗), 1-2 line summary. No tags, scores, or relation blocks.
- **Signals** — Undismissed AI signals. Each card: priority dot (colored by level) + label, title, "Affects: TICKER, TICKER" line (from `relatedAssets[]`), preview body with expand/collapse, × dismiss button.

Dismiss animation: opacity fade → max-height collapse → DOM remove. Does NOT trigger full re-render or tab switch.

Module-level `currentTab` variable preserves tab state across SSE-triggered re-renders.

### Signal Schema Compatibility

Signals have two formats. The renderer handles both via fallback:
- **New format**: `priority` (high/medium/low) + `body`
- **Legacy format**: `severity` (high/medium/info) + `message`

### How Sources Work

- **Sources** are stored in `data/feed-sources.json`. The server reads this file on each request (hot-reload, no restart needed after cache TTL expires).
- **Adding a source**: When the user shares an RSS/feed/blog URL in conversation, ask if they want to add it to their Intel Feed. If yes, append to `data/feed-sources.json`.
- **Server** fetches all sources in parallel, deduplicates, and sorts by timestamp. Individual feed failures don't break others. Results are cached for 5 minutes.
- **Fallback**: If all RSS feeds fail, the server falls back to `data/feed.json` (static seed data).

### Intel Relevance: Feed Analyst Agent

The **feed-analyst** agent (`.claude/agents/feed-analyst.md`) scans RSS feeds, cross-references items against the user's portfolio and profile, and generates intel signals.

**How it works:**
1. Fetches RSS feed items via `/api/feed` and reads portfolio + profile data
2. Builds a relevance keyword set from tickers, company names, employer, goals
3. Single-pass analysis: classifies each feed item as high/medium/low/skip
4. Deduplicates against existing signals (title similarity + sourceUrl)
5. Writes high/medium signals to `data/signals.json` (source: `feed-analyst`)
6. Writes full analysis to `data/intel-digest.json` (including low-priority items)

**Auto-trigger:** Session hook detects `STALE_INTEL` when `intel-digest.json` is >12h stale or has never been analyzed. The feed-analyst agent can run in parallel with other agents.

**Outputs:**
- `data/signals.json` — new signals with `"source": "feed-analyst"`, high/medium priority only
- `data/intel-digest.json` — complete analysis log with relevance reasons, portfolio impact, and source URLs
- `/api/intel-digest` — API endpoint serves the digest for downstream consumers

**Future:** Asset allocation observations (e.g., "BTC volatility elevated — current exposure is X%") with proper compliance disclaimers. No trade recommendations.

## Data Backfill Convention (Project-Wide)

**Every agent and skill MUST write back any new or corrected information to the appropriate data files.** This is a core architectural principle -- the system learns and self-corrects through use.

### Write-Through Cache Pattern

The dashboard reads JSON files as a **static cache** -- it never triggers agents or spends tokens. Agents are the compute engine. Every agent run MUST update the relevant JSON cache so the dashboard always shows the latest numbers without re-computation.

```
Agent runs (expensive) → writes to JSON → Dashboard reads JSON (free)
```

**Key rule:** Any file that feeds the dashboard (`tax-summary.json`, `signals.json`, `profile.json`) must include a `lastComputed` or `lastUpdated` timestamp. The dashboard displays this as "as of {date}" so the user knows data freshness. Agents MUST update this timestamp on every run.

### Rules

1. **If an agent discovers missing data** (e.g., profile has no tax rates), it should flag it, ask the user if needed, and backfill the data file once confirmed.
2. **If an agent computes a corrected value** (e.g., recalculated tax liability differs from stored value), it should update the data file and note the change.
3. **If the user provides new information during conversation** (e.g., "I just sold 10 shares of AAPL"), the relevant data file should be updated (e.g., add a taxable event to `tax-summary.json`, update portfolio Excel).
4. **Always read before writing** -- merge changes carefully, never overwrite unrelated fields.
5. **Always log what was changed** in the response so the user knows what was updated.
6. **Always update `lastComputed` / `lastUpdated` timestamps** so the dashboard can show data freshness.

### Backfill Targets

| Information Type | Write To |
|-----------------|----------|
| Tax rates, filing status, accounts | `data/profile.json` |
| Taxable events, estimated liability | `data/tax-summary.json` |
| Portfolio positions | `data/*.xlsx` (via xlsx skill) |
| Signals and alerts | `data/signals.json` |
| Market intelligence | `data/feed.json` |
| Intel analysis & digest | `data/intel-digest.json` |
| Feed sources (RSS/blog URLs) | `data/feed-sources.json` |
| Category config | `data/categories.json` |
| Life events, goals, philosophy, career changes | `data/profile.md` |

### Web Verification

Agents with web search access (e.g., Tax Agent) should verify data against current sources on every run. Web-verified data is the source of truth; stored data is the cache. If they differ, update the cache.

## Compliance Guardrails

Capis is a **Personal Financial Management (PFM)** tool — it organizes, visualizes, and analyzes the user's own data. It is NOT an investment advisor. All agents and skills must stay within these boundaries.

### Role: Financial Analyst Assistant

- **Present facts, not recommendations.** "Your tech allocation is 65%" (fact) vs "You should reduce tech exposure" (advice — avoid).
- **Describe deviations, don't prescribe actions.** "Your cash is 5%, below the typical 10-20% range" (insight with external benchmark) vs "Move money to cash now" (CTA — forbidden).
- **Scenario analysis is OK, directives are not.** "If NVDA drops 20%, your portfolio impact would be ~$X" (simulation) vs "Sell NVDA before earnings" (trade recommendation — forbidden).

### Required Disclaimers

When any agent or skill outputs analysis that touches investment decisions, tax strategy, or portfolio changes, append:

> *This analysis is for informational purposes only and does not constitute investment, tax, or legal advice. Consult a qualified professional before making financial decisions.*

### Fact vs Insight Labeling

Agents should distinguish between:
- **Fact**: derived directly from user data or verified external sources ("Your realized gains are $140K")
- **Insight**: interpretation using external benchmarks or general principles ("A 20%+ single-stock concentration is above typical diversification thresholds")

Never present AI-generated interpretations as facts.

### Forbidden Patterns

- No "call to action" (CTA): never say "buy", "sell", "hold", "switch to", "move into"
- No return predictions: never forecast specific price targets or percentage returns
- No urgency language: never say "act now", "before it's too late", "don't miss this"
- No product recommendations: never suggest specific financial products, brokers, or services
- If future features add advisory capabilities, they MUST include proper disclaimers and avoid triggering fiduciary duty under the Investment Advisers Act of 1940

## MCP: Perplexity for Fact-Checking

Capis agents that output financial figures (tax liability, deduction amounts, contribution limits) **must fact-check against current data before presenting numbers to the user.** Users may act on these numbers — incorrect figures cause real financial harm.

### Why Perplexity over WebFetch/WebSearch

| | Perplexity MCP (`mcp__perplexity__search`) | WebFetch / WebSearch |
|---|---|---|
| **Speed** | Direct answer in seconds | Crawls full page, then summarizes — slow |
| **Accuracy** | Returns cited, structured answers | May pull irrelevant content from page |
| **Multi-topic** | Reliable when queries are single-topic | Same limitation |
| **Best for** | Verifying specific tax rates, limits, deadlines | General browsing, reading full articles |

### Usage Pattern

**Always use single-topic parallel queries** (not one mega-query):

```
# BAD — multi-topic query returns incomplete answers
"2025 standard deduction AND SALT cap AND HSA limit AND NIIT threshold"

# GOOD — 3-4 focused queries, run in parallel
Search 1: "2025 standard deduction MFJ, SALT cap MFJ MAGI phase-out"
Search 2: "2025 401k HSA IRA contribution limits"
Search 3: "2025 California state tax $800K MFJ bracket by bracket"
Search 4: "2025 FBAR deadline, Form 8938 threshold MFJ"
```

### Setup

Requires Perplexity API key. Add to Claude Code MCP config:

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

Get an API key at https://www.perplexity.ai/settings/api

### Available Tools

| Tool | Model | Use When | Cost |
|------|-------|----------|------|
| `mcp__perplexity__search` | Sonar Pro | Fact-checking rates, limits, deadlines | Low |
| `mcp__perplexity__reason` | Sonar Reasoning Pro | Complex tax scenarios, multi-step calculations | Medium |
| `mcp__perplexity__deep_research` | Sonar Deep Research | Comprehensive research reports | High — avoid unless needed |

Agents should default to `search`. Use `reason` only for complex scenarios that require multi-step reasoning.

## Key Conventions

- No external APIs or databases -- portfolio in Excel, other data in JSON
- Portfolio CRUD is done by Claude Code via xlsx skill, not via API
- Frontend has no build step -- edit files directly in `public/`
- Port 3333 is the standard port
- Frontend uses ES modules (import/export)
- No framework dependencies -- vanilla JS only
