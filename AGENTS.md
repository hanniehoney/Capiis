# Capiis

Capiis is a CLI-native personal wealth intelligence workspace for Claude Code
and OpenCode. The user interacts in the terminal, launches `/capiis`, and the
project starts a local dashboard on `127.0.0.1:3333`.

## Product Model

- Treat `data/` as the source of truth. Portfolio holdings live in Excel files;
  profile, tax, feed, and signal state live in JSON or Markdown files.
- Keep all analysis informational. Do not frame responses as investment, tax,
  or legal advice. No buy/sell directives. No trade execution.
- Preserve the public command surface: `/capiis`, `/capiis-data`, and the local
  server address `http://localhost:3333`.

## Core Commands

- `npm start` -> run the local Express server
- `npm run seed` -> load the default Alex persona
- `node scripts/seed-data.js sophia` -> load the Sophia persona
- `npm run clear` -> wipe user data but preserve schema and empty Excel shells
- `/capiis` -> launch, stop, or inspect the dashboard runtime
- `/capiis-data` -> clear data, import templates, or start guided setup

## Repo Layout

- `server.js`: Express server and API surface
- `public/`: browser UI, no frontend build step
- `lib/excel.js`: Excel ingestion helpers
- `scripts/`: data seeding, clearing, and price utilities
- `.claude/skills/`: shared skills for Claude Code and OpenCode
- `.claude/commands/`: Claude Code slash commands
- `.opencode/commands/`: OpenCode slash commands
- `.claude/agents/`: Claude Code only subagents for tax, price, and feed work
- `data/categories.json`: tracked schema file
- Other files under `data/`: user-owned local data, usually git-ignored

## Data Files

### Excel

- `data/stocks.xlsx`
- `data/crypto.xlsx`
- `data/angel-investment.xlsx`
- `data/employee-equity.xlsx`
- `data/real-estate.xlsx`
- `data/cash.xlsx`
- `data/savings.xlsx`
- `data/vehicles.xlsx`
- `data/jewelry.xlsx`
- `data/art.xlsx`
- `data/credit-cards.xlsx`
- `data/mortgage.xlsx`
- `data/auto-loan.xlsx`
- `data/student-loan.xlsx`

### JSON / Markdown

- `data/categories.json`: category and account metadata
- `data/profile.json`: structured personal, family, account, and tax state
- `data/profile.md`: narrative context for goals, philosophy, and life events
- `data/tax-summary.json`: tax planning cache
- `data/signals.json`: generated alerts
- `data/feed.json`: fallback feed data
- `data/feed-sources.json`: RSS sources
- `data/intel-digest.json`: feed analysis cache
- `data/watchlist.json`: watched assets

## API Surface

- `GET /api/portfolio`
- `GET /api/portfolio/categories`
- `GET /api/categories`
- `GET /api/stats`
- `GET /api/signals`
- `POST /api/signals`
- `PATCH /api/signals/:id`
- `GET /api/feed`
- `GET /api/intel-digest`
- `GET /api/tax-summary`
- `GET /api/watchlist`
- `GET /api/profile`
- `GET /api/profile/memory`
- `GET /api/events`

## Skills and References

The canonical shared skills live in `.claude/skills/`:

- `onboarding`
- `portfolio-intel`
- `tax-professional`

Read detailed references only when relevant:

- `.claude/skills/onboarding/references/data-schema.md`
- `.claude/skills/onboarding/references/classification-rules.md`
- `.claude/skills/portfolio-intel/references/asset-schema.md`
- `.claude/skills/tax-professional/references/common-writeoffs.md`

## Runtime Conventions

- Server port is fixed at `127.0.0.1:3333`.
- The browser dashboard consumes cached JSON plus live API responses.
- `fs.watch(data/)` drives server-sent event refreshes for browser views.
- There is no cloud database, no brokerage connection, and no execution engine.

## CLI Compatibility

- Claude Code uses this repo's `CLAUDE.md`, `.claude/commands/`,
  `.claude/skills/`, and `.claude/agents/`.
- OpenCode uses this repo's `AGENTS.md`, `.opencode/commands/`, and the
  Claude-compatible `.claude/skills/`.
- OpenCode support in this repo is command + skills based. Claude-specific
  subagents are not mirrored into `.opencode/agents/` yet.
