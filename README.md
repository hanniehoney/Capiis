<p align="center">
  <img src="docs/assets/capiis-banner.png" alt="Capiis banner" width="900" />
</p>

# Capiis

*Originally built as a Claude Code Hackathon open-source project, Capiis has since evolved into a CLI-native personal wealth intelligence workspace for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [OpenCode](https://opencode.ai).*

**[Build Log ->](https://www.hannieliu.com/story/260210-cc-hackathon)** ·
**[3-min Demo Video ->](https://youtu.be/8f0CH2Tf1Dg)**

Capiis is a personal-side wealth intelligence workspace for individual investors
and high-net-worth households. You interact with it from your coding CLI, and
it opens a real-time local browser dashboard backed by your own Excel and JSON
files.

It helps you review assets, tax exposure, and market signals in one place using
your local data rather than institutional data platforms. Capiis is not tax
filing software, not trading execution infrastructure, and not an advisor-side
client reporting tool. It helps you understand your assets, tax exposure, and
allocation choices more clearly.

## Core Workflows

### Portfolio

Personal wealth management starts with a clean view of holdings, liabilities,
concentration risk, and allocation across account types and asset classes.
Capiis helps you inspect the current state of your balance sheet so you can make
better allocation decisions with your own local data.

### Tax

Asset decisions create tax consequences, so tax belongs inside portfolio
intelligence rather than outside it. Capiis surfaces capital gains timing,
quarterly tax awareness, tax bucket visibility, and tax-loss harvesting cues to
support planning and ongoing management. It does not prepare or file returns.

### Onboarding

Most people start with scattered spreadsheets, account exports, and partial
notes. Capiis onboarding is designed to turn those local files into a working
wealth intelligence workspace quickly, so the system can reason over a usable
baseline instead of a pile of disconnected documents.

Onboarding organizes the data, portfolio makes the assets legible, and tax
makes the consequences legible.

## Feed Intelligence

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

Then launch the workspace:

```text
/capiis
/capiis-data
/capiis status
```

## Requirements

- Node.js 18+ and npm
- Claude Code or OpenCode
- Any modern browser
- Optional: Perplexity API key for live fact-checking in Claude Code

## Project Setup

### Minimal operating flow

1. Start `claude` or `opencode` in your Capiis project directory.
2. Seed a demo persona or import your own local files.
3. Run `/capiis` to launch the dashboard at `http://localhost:3333`.
4. Run `/capiis status` when you want a terminal summary instead of reading the browser.
5. Use `/capiis-data` any time you need guided setup, templates, or data management.

For first-run setup, these commands are the fastest path:

```text
/capiis-data template
/capiis-data setup
```

You can also seed sample data directly:

```bash
npm run seed
node scripts/seed-data.js sophia
```

### Repo and CLI behavior

- Claude Code reads `CLAUDE.md`, `.claude/commands/`, `.claude/skills/`, and
  `.claude/agents/` from this repo.
- OpenCode reads `AGENTS.md`, `.opencode/commands/`, and the shared
  `.claude/skills/` from this repo.
- Both CLIs launch the same local Express server on `127.0.0.1:3333` and open
  the browser dashboard at `http://localhost:3333`.
- Shared product logic lives in the app itself and the shared skills; Claude
  Code currently has additional Claude-only subagents for tax, price, and feed
  tasks.

## Example Workflows

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

## Template Personas

Use the personas below to explore the workflows above before importing your own
files.

| Persona | Command | Description |
|---------|---------|-------------|
| **Alex** | `npm run seed` | 37, Taiwanese. Staff Engineer (L7) at Google. Married, 2 kids. Cupertino homeowner. Net worth about $5.5M. META stock concentration and cross-border tax complexity. |
| **Sophia** | `node scripts/seed-data.js sophia` | 32, British. Staff Research at Anthropic. Single, SF renter. Net worth about $4.3M. O-1A visa, ISO concentration, AMT exposure, UK accounts. |

## Optional Setup

### Perplexity API Key for live fact-checking

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

## Technical Appendix

### Architecture

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

### Portfolio Allocation Intelligence

- Account-aware allocation across taxable, retirement, and cash buckets
- Concentration management and deployment planning for large positions
- Multi-portfolio support and fund-allocation workflows

### Tax Scenario Simulator

- Sale timing analysis for short-term versus long-term gains
- Withholding versus estimated payment planning
- RSU, ISO, and AMT-aware scenario modeling

### Liquidity and Leverage

- Cash planning around concentrated positions
- Stock-backed borrowing and margin-aware stress analysis
- Downside and maintenance-risk modeling for leverage decisions

### DIY Filing Copilot

- Document checklist and form-mapping support
- Software-choice guidance and common error flags
- Filing-prep assistance without becoming e-file or return-preparation software

### Confidence and Escalation

- Clear boundaries for when Capiis can guide directly
- Explicit escalation prompts for CPA, tax attorney, lender, or broker review
- Better confidence cues around tax-sensitive recommendations

### Multi-Agent Workspace

- Dedicated portfolio, tax, and allocation agents over the same local dataset
- More coordinated analysis between market signals, tax context, and portfolio state
- Stronger cross-workflow orchestration inside Claude Code and OpenCode

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=hanniehoney/Capiis&type=Date)](https://star-history.com/#hanniehoney/Capiis&Date)

## License

MIT
