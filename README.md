<p align="center">
  <img src="docs/assets/capiis-banner.png" alt="Capiis banner" width="900" />
</p>

# Capiis

*Originally built as a Cloud Code Hackathon open-source project ([Built with Opus 4.6: a Claude Code hackathon](https://cerebralvalley.ai/e/claude-code-hackathon)). You can see the [Build Log](https://www.hannieliu.com/story/260210-cc-hackathon) and the [3-min Demo Video](https://youtu.be/8f0CH2Tf1Dg).*

Capiis is a CLI-native personal wealth intelligence workspace for individual investors
and high-net-worth households. You interact with it from your coding CLI using [Claude Code](https://docs.anthropic.com/en/docs/claude-code) or [OpenCode](https://opencode.ai), and
it opens a real-time local browser dashboard backed by your own Excel and JSON
data.
It uses a built-in visualization dashboard, so you can review allocation once and see how taxes and market signals change without vibe coding a UI.

Capiis focuses on personal asset allocation and wealth management. It is not
personal tax filing software, not a trading execution bot, and not an advisor-side
client reporting tool. It helps you allocate wealth and assets more intelligently.

### Features:

- **Onboarding**: Start from a persona template if you are new, or build your data through
  guided CLI conversations that progressively structure your local files.
- **Portfolio**: A clean, visual view of holdings, liabilities, concentration risk, and allocation
  across accounts and asset classes so you can review your balance sheet quickly.
- **Tax**: Shows how different allocation choices can change tax exposure, with attention to
  tax events and timing. It supports planning but does not prepare or file returns.
- **Feed**: Add trusted RSS sources (news, analysis, reports). Capiis generates signals
  tied to your own assets so market context stays personal and actionable.


## Quick Start

### Option A: Scaffold a new workspace

```bash
npx create-capiis my-wealth
cd my-wealth
claude      # or: opencode
```

Inside either CLI:

```text
/capiis
/capiis-data
/capiis status
```

### Option B: Clone this repository

```bash
git clone https://github.com/hanniehoney/Capiis.git
cd Capiis
npm install
claude      # or: opencode
```

Next steps:

1. Start `claude` or `opencode` in your Capiis project directory.
2. Run `/capiis` to launch the dashboard at `http://localhost:3333`.
3. Run `/capiis status` when you want a terminal summary instead of reading the browser.
4. Use `/capiis-data` any time you need guided setup, templates, or data management.

Fastest first-run setup:

```text
/capiis-data template
/capiis-data setup
```

Optional: seed sample data:

```bash
npm run seed
node scripts/seed-data.js sophia
```

Claude Code and OpenCode are supported; both launch the local server on `127.0.0.1:3333`.
For agent and CLI internals, see `AGENTS.md` and `CLAUDE.md`.

## Requirements

- Node.js 18+ and npm
- Claude Code or OpenCode
- Any modern browser
- Optional: Perplexity API key for live fact-checking in Claude Code


## Optional Setup

### Live fact-checking (Perplexity MCP)

Tax and price workflows can fact-check figures against live sources. Add
Perplexity MCP to your Claude Code config:

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

Get a key at https://www.perplexity.ai/settings/api.

### Feed intelligence (RSS sources)

Portfolio decisions do not happen in a vacuum. Capiis includes an Intel Feed
that connects your RSS sources to your holdings, profile, and generated
signals, turning general market news into personal relevance.

- RSS source definitions live in `data/feed-sources.json`
- Live feed items are served from `GET /api/feed`
- If RSS fetches fail, Capiis falls back to `data/feed.json`
- Generated signals appear in the Feed view alongside the raw articles

You can manage feed sources directly from either Claude Code or OpenCode by
asking the CLI to update `data/feed-sources.json`.

Example prompts:

```text
Add this RSS feed to Capiis: https://www.ft.com/rss/home/us
Name it "Financial Times US" and note "US macro and markets"
```

```text
Update my Capiis feed sources. Add Stratechery, keep my macro feeds, and remove any duplicate Bloomberg source.
```

If you prefer editing by hand, each source entry looks like this:

```json
{
  "id": "fs-004",
  "url": "https://example.com/feed.xml",
  "name": "Example Feed",
  "addedAt": "2026-03-08T00:00:00Z",
  "note": "Why this source matters to my portfolio"
}
```

Good feed examples:

- company or sector analysis newsletters
- macro, rates, and policy feeds
- crypto or startup market feeds
- niche industry sources tied to your largest positions

After you add a source, run `/capiis` again or refresh the Feed view in the
browser to confirm the items are loading.

## Template Personas

Start with a persona template if you want a guided dataset before importing
your own files.

| Persona | Command | Description |
|---------|---------|-------------|
| **Alex** | `npm run seed` | 37, Taiwanese. Staff Engineer (L7) at Google. Married, 2 kids. Cupertino homeowner. Net worth about $5.5M. META stock concentration and cross-border tax complexity. |
| **Sophia** | `node scripts/seed-data.js sophia` | 32, British. Staff Research at Anthropic. Single, SF renter. Net worth about $4.3M. O-1A visa, ISO concentration, AMT exposure, UK accounts. |

## Example Scenarios

### High-net-worth allocation review

Scenario: you want a clearer view of concentration risk, idle cash, and how to
allocate across taxable and tax-advantaged buckets before committing more
capital to funds or public markets.

What Capiis helps with: reviewing holdings, liabilities, account-type exposure,
allocation mix, and concentration patterns from your local files so you can see
where your next allocation decision should start.

```text
Review my current allocation in Capiis. Show my largest concentrations, cash available for deployment, and the account buckets I should evaluate before adding to a new fund position.
```

### High-income tax planning

Scenario: you have W-2 income, brokerage activity, and possible capital gains,
and you want to understand timing, quarterly tax exposure, and where your main
tax sensitivities are.

What Capiis helps with: framing quarterly estimate awareness, capital gains
timing, tax bucket visibility, and tax-aware planning signals without claiming
to file or finalize returns.

```text
Use Capiis to review my tax exposure. Focus on quarterly estimate risk, capital gains timing, and the biggest tax-sensitive parts of my current portfolio.
```

### DIY filing prep

Scenario: you are preparing for tax season and want help organizing documents,
comparing software options, and identifying what to verify before you file.

What Capiis helps with: building a document checklist, mapping likely inputs,
and deciding when DIY software is sufficient versus when you should confirm with
a CPA. It helps you prepare, not file.

```text
Help me prepare for filing with Capiis. Build a document checklist from my current accounts, highlight tax items I should verify, and tell me whether this looks like a DIY software case or a CPA case.
```

## Architecture

### System Architecture

```text
Claude Code or OpenCode (CLI layer)
  |- /capiis              launch / stop / status
  |- /capiis-data         clear / template / setup
  |- onboarding           shared skill - guided 5-phase data entry
  |- portfolio-intel      shared skill - portfolio analysis and management
  |- tax-professional     shared skill - US tax reference and workflows
  `- .claude/agents/*     Claude Code-only subagents for tax / price / feed tasks
        |
        v
Express Server (server.js, 127.0.0.1:3333)
  |- SPA frontend (public/)
  |- REST API (/api/*)
  |- SSE stream (/api/events)
  `- fs.watch(data/) -> live browser refresh
        |
        v
Local Data Layer
  |- data/*.xlsx          holdings and liabilities
  |- data/*.json          profile, tax, signals, feed, watchlist
  `- data/categories.json tracked schema
```

### Project Structure

```text
Capiis/
|- AGENTS.md                        Shared project instructions for OpenCode
|- CLAUDE.md                        Claude Code specific supplement
|- server.js                        Express server (port 3333)
|- lib/excel.js                     Excel -> JSON reader
|- public/                          Frontend (vanilla HTML/CSS/JS, no build step)
|- data/                            User data (git-ignored except schema)
|- scripts/
|  |- seed-data.js                  Template seeder (--list for options)
|  |- clear-data.js                 Wipe data, keep schema + empty xlsx shells
|  `- personas/                     Persona data modules (alex.js, sophia.js)
|- .claude/
|  |- agents/                       Claude Code subagents (tax, price, feed)
|  |- commands/                     Claude Code slash commands
|  |- hooks/                        Session auto-orchestration
|  `- skills/                       Shared skills for Claude Code and OpenCode
|- .opencode/
|  `- commands/                     OpenCode native slash commands
|- packages/create-capiis/          npx scaffolding tool
|- CONTRIBUTING.md
`- SECURITY.md
```

### API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | All holdings from Excel |
| GET | `/api/stats` | Net worth, allocations, tax buckets |
| GET | `/api/signals` | AI-generated alerts |
| GET | `/api/feed` | RSS intelligence feed |
| GET | `/api/tax-summary` | Tax data and events |
| GET | `/api/profile` | User profile |
| GET | `/api/events` | SSE stream |

### Tech Stack

| Layer | Choice |
|-------|--------|
| Server | Express (Node.js) |
| Frontend | Vanilla HTML/CSS/JS (ES modules, no build step) |
| Charts | SVG-based components |
| Storage | Excel + JSON (local files) |
| Excel I/O | `exceljs` |
| Realtime | SSE + `fs.watch` |
| AI | Claude Code commands + skills + agents, OpenCode commands + skills |
| Fact-checking | Perplexity MCP (optional) |

## Roadmap

- [ ] Portfolio allocation intelligence: account-aware allocation across taxable, retirement, and cash buckets; concentration management; multi-portfolio support.
- [ ] Tax scenario simulator: sale timing analysis; withholding vs estimated payment planning; RSU/ISO/AMT-aware scenarios.
- [ ] Liquidity and leverage: cash planning around concentrated positions; stock-backed borrowing; downside and maintenance-risk modeling.
- [ ] DIY filing copilot: document checklist and form-mapping support; software-choice guidance; filing-prep assistance without e-file or return preparation.
- [ ] Confidence and escalation: clear guidance boundaries; escalation prompts for CPA/tax attorney/lender/broker review; stronger confidence cues.
- [ ] Multi-agent workspace: dedicated portfolio, tax, and allocation agents; coordinated analysis across signals, tax context, and portfolio state.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=hanniehoney/Capiis&type=Date)](https://star-history.com/#hanniehoney/Capiis&Date)

## License

MIT
