<p align="center">
  <img src="docs/assets/capiis-banner.png" alt="Capiis banner" width="900" />
</p>

# Capiis

Local-first wealth and asset management dashboard for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Tracks portfolio holdings, runs tax analysis, updates prices, and generates insights — all through the CLI. No cloud database, no trading, no execution. Your data stays on your machine in Excel and JSON files.

Built during the [Built with Opus 4.6: A Claude Code Hackathon](https://cerebralvalley.ai/e/claude-code-hackathon) hosted by Cerebral Valley × Anthropic (Feb 10–16, 2026).

**[Build Log →](https://www.hannieliu.com/story/260210-cc-hackathon)** · **[3-min Demo Video →](https://youtu.be/8f0CH2Tf1Dg)**

## Quick Start

Requires [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and Node.js 18+.

```bash
npx create-capiis my-wealth
cd my-wealth
claude
```

Or clone manually:

```bash
git clone https://github.com/hanniehoney/Capiis.git
cd Capiis
npm install
claude
```

Then inside Claude Code:

```
/capiis                  # Launch dashboard (auto-starts server + opens browser)
```

First launch detects empty data and offers guided setup — import a demo persona or enter your own data step by step.

```
/capiis-data             # Data management menu
/capiis-data template    # Import demo persona (Alex or Sophia)
/capiis-data setup       # Guided step-by-step data entry
```

## Requirements

- Node.js 18+ and npm
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- Any modern browser
- Optional: Perplexity API key for faster fact-checking

## Architecture

```
Claude Code (AI layer)
  ├─ /capiis              slash command — launch / stop / status
  ├─ /capiis-data         slash command — clear / template / setup
  ├─ portfolio-intel      skill — portfolio analysis & management
  ├─ onboarding           skill — guided 5-phase data entry
  ├─ tax-analyst          agent — tax briefing with live rate verification
  ├─ price-tracker        agent — Yahoo Finance price updates
  └─ feed-analyst         agent — RSS intel cross-referenced with portfolio
        │
        ▼
Express Server (server.js, :3333)
  ├─ SPA frontend (public/)
  ├─ REST API (/api/*)
  ├─ SSE stream (/api/events)
  └─ fs.watch(data/) → live browser refresh
        │
        ▼
Local Data Layer
  ├─ data/*.xlsx          10 asset + 4 liability categories
  ├─ data/*.json          profile, tax, signals, feed, watchlist
  └─ data/categories.json schema (tracked in git)
```

## Project Structure

```
Capiis/
├── server.js                         Express server (port 3333)
├── lib/excel.js                      Excel → JSON reader
├── public/                           Frontend (vanilla HTML/CSS/JS, no build step)
│   ├── css/styles.css
│   └── js/
│       ├── app.js
│       ├── views/                    portfolio, feed, legal, profile
│       ├── components/               sidebar, header, charts
│       └── utils/                    api, sse
├── data/                             All user data (git-ignored except schema)
│   └── categories.json              Category/account type definitions
├── scripts/
│   ├── seed-data.js                  Template seeder (--list for options)
│   ├── clear-data.js                 Wipe data, keep schema + empty xlsx
│   └── personas/                     Persona data modules (alex.js, sophia.js)
├── skills/
│   ├── portfolio-intel/              Portfolio analysis & management
│   ├── onboarding/                   Guided data entry (5-phase)
│   └── tax-professional/             US tax knowledge base
├── .claude/
│   ├── commands/                     Slash commands (capiis, capiis-data)
│   ├── agents/                       Subagents (tax, price, feed)
│   └── hooks/                        Session auto-orchestration
├── packages/create-capiis/           npx scaffolding tool
└── CLAUDE.md                         AI development guide
```

## Template Personas

| Persona | Command | Description |
|---------|---------|-------------|
| **Alex** | `npm run seed` | 37, Taiwanese. Staff Engineer (L7) @ Google. Married, 2 kids. Cupertino homeowner. NW ~$5.5M. META stock concentration, cross-border tax. |
| **Sophia** | `node scripts/seed-data.js sophia` | 32, British. Staff Research @ Anthropic. Single, SF renter. NW ~$4.3M. O-1A visa, ISOs, AMT risk, UK accounts. |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Server | Express (Node.js) |
| Frontend | Vanilla HTML/CSS/JS (ES modules, no build step) |
| Charts | SVG-based components |
| Storage | Excel + JSON (local files) |
| Excel I/O | `xlsx` (SheetJS) |
| Realtime | SSE + `fs.watch` |
| AI | Claude Code commands + skills + agents |
| Fact-Checking | Perplexity MCP (Sonar Pro) |

## Optional Setup

### Perplexity API Key (Recommended)

Tax and price agents fact-check figures against live data. Add to your Claude Code MCP config:

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

Get a key at https://www.perplexity.ai/settings/api. Without it, agents fall back to web search (slower, less accurate).

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | All holdings (from Excel) |
| GET | `/api/stats` | Net worth, allocations, tax buckets |
| GET | `/api/signals` | AI-generated alerts |
| GET | `/api/feed` | RSS intelligence feed |
| GET | `/api/tax-summary` | Tax data & events |
| GET | `/api/profile` | User profile |
| GET | `/api/events` | SSE stream |

## Roadmap

- [ ] Identity architecture: Individual / Family / Institution profiles
- [ ] Tax lifecycle: pre-acquisition planning, holding-period checks, year-end workflows
- [ ] Asset expansion: bonds, treasuries, commodities, multi-portfolio
- [ ] Agent suite: split tax agent, add wealth planning agent, real-time query agent
- [ ] Commercial model for advanced tax outcomes

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=hanniehoney/Capiis&type=Date)](https://star-history.com/#hanniehoney/Capiis&Date)

## License

MIT
