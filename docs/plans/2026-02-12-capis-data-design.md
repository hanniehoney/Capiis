# /capis-data — Data Management Slash Command

## Overview

A single slash command `/capis-data` with three subcommands for managing all Capis data: clear, template import, and guided user input.

**File**: `.claude/commands/capis-data.md`

## Command Interface

| Invocation | Action |
|------------|--------|
| `/capis-data` | Interactive menu (AskUserQuestion) to pick subcommand |
| `/capis-data clear` | Clear all data with confirmation |
| `/capis-data template` | Import Bay Area family template |
| `/capis-data setup` | Guided step-by-step data entry |

---

## Subcommand: `clear`

### Flow

1. **Confirm** via `AskUserQuestion` (default: cancel)
   - Warn: "All data in data/ will be deleted. Please back up to iCloud / Google Drive first."
   - Options: "Cancel (safe)" vs "Confirm clear"

2. **Execute** on confirmation:
   - Delete all `data/*.xlsx` (14 files) and user JSON files (profile, tax-summary, signals, feed, watchlist)
   - **Keep** `data/categories.json` (schema/config, not user data)
   - **Generate** 14 empty-shell xlsx files with header rows only (no data rows)
     - 10 asset files: stocks, crypto, angel-investment, employee-equity, real-estate, cash, savings, vehicles, jewelry, art
     - 4 liability files: credit-cards, mortgage, auto-loan, student-loan
   - This requires a new script or extending seed-data.js with a `--clear` flag

3. **Report**: list deleted files, suggest `/capis-data template` or `/capis-data setup`

### What Gets Cleared

| Cleared | Kept |
|---------|------|
| `*.xlsx` data rows (replaced with header-only shells) | `categories.json` (schema) |
| `profile.json` | `scripts/seed-data.js` (code) |
| `tax-summary.json` | `skills/` (code) |
| `signals.json` | `server.js` (code) |
| `feed.json` | |
| `watchlist.json` | |

---

## Subcommand: `template`

### Template Persona: Bay Area Chinese Tech Family

| Field | Value |
|-------|-------|
| **Name** | Alex Chen |
| **Role** | Senior Software Engineer @ Google |
| **Previous** | Meta (has vested Meta shares) |
| **Family** | Married, wife + 2 kids |
| **Filing** | Married filing jointly, 2 dependents |
| **Location** | Cupertino, CA 95014 |
| **State tax** | California ~9.3% |
| **House** | Recently purchased in Cupertino (~$2.2M) |
| **Cars** | Tesla Model Y + family car (e.g., BMW X3 / Toyota Highlander) |
| **Equity** | Google RSUs (current) + Meta vested shares (previous) |
| **Accounts** | Google 401(k), Roth IRA, 529 Plan x2 (kids), HSA, Schwab taxable, Chase checking, Marcus HYSA, Coinbase |
| **Liabilities** | Cupertino mortgage (~$1.7M), auto loan, credit cards |
| **Tax** | CA state income tax, married-joint federal brackets, LTCG, NIIT, AMT considerations |

### Flow

1. Check if `data/` has existing data (any xlsx with >1 row)
   - If yes → `AskUserQuestion`: "Existing data detected. Template import will overwrite everything. Continue?"
   - If empty → proceed directly

2. Run `node ~/Desktop/Capis/scripts/seed-data.js` (seed script will be rewritten with new template persona)

3. Report: "Template imported — Alex Chen's Bay Area family portfolio. Run `/capis` to open dashboard."

### Implementation

Rewrite `scripts/seed-data.js` entirely with the new Bay Area family persona data. All 20 data files regenerated.

---

## Subcommand: `setup` — Guided Input (Core Feature)

### 5-Phase Guided Flow

#### Phase 1: Profile

Claude asks one question at a time:
- Name, occupation, company, title
- Location (country/state/city) → Claude auto-looks up state tax rate
- Marital status, dependents
- Filing status

→ Writes `data/profile.json`

#### Phase 2: Account Inventory

Claude asks:
- What financial accounts do you have? (brokerage, bank, retirement...)
- For each: institution name, account type (taxable / roth-ira / 401k / hsa / 529 / checking / savings)

→ Writes to `data/profile.json` accounts array

#### Phase 3: Assets

Walk through categories one by one:
1. Stocks → crypto → real estate → employee equity → angel investments → cash/savings → vehicles → jewelry → art
2. For each: "Do you have {category}?" → user can skip with "no"
3. User can provide data by:
   - Answering Claude's questions directly
   - Providing a file path → Claude uses built-in xlsx/pdf/docs reading skills to parse, shows summary for confirmation, then converts to Capis xlsx format
4. Each category written immediately to `data/{category}.xlsx`

#### Phase 4: Liabilities

Same pattern:
1. Credit cards → mortgage → auto loan → student loan → other
2. For each: name, original amount, current balance, interest rate, monthly payment, due date
3. File import supported same as Phase 3

→ Writes to `data/{liability}.xlsx`

#### Phase 5: Confirm & Complete

1. Call `curl localhost:3333/api/stats` to show portfolio overview (net worth, allocation)
2. Ask if user wants to open dashboard (`/capis`)
3. Suggest `/capis-data setup` to add more later

### File-Assisted Input

When user provides a file path during Phase 3 or 4:
- The command doc instructs Claude to use built-in xlsx / pdf / docs reading skills
- Claude reads file → summarizes extracted data → user confirms → writes Capis-format xlsx
- Supported: .xlsx, .csv, .pdf, .docx, .txt, .md

### Resume Support

- Each phase writes data immediately to disk
- On next `/capis-data setup`, Claude checks which data files exist and have content
- Skips completed phases, resumes from first missing section
- User can override: "I want to redo my stocks"

---

## Implementation Notes

### Files to Create/Modify

| File | Action |
|------|--------|
| `.claude/commands/capis-data.md` | **Create** — slash command with full instructions |
| `scripts/seed-data.js` | **Rewrite** — new Bay Area family template persona |
| `scripts/clear-data.js` | **Create** — generates header-only xlsx shells + keeps categories.json |

### Allowed Tools (for slash command)

```
Bash(node:*), Bash(npm:*), Bash(curl:*), Bash(ls:*), Bash(rm:*)
```

Plus Claude's built-in Read, Write, Edit, Glob, Grep, AskUserQuestion tools (always available).

### Dependencies on Built-in Skills

The `setup` subcommand's file import relies on Claude Code's built-in capabilities:
- xlsx reading (built-in xlsx skill)
- PDF reading (Read tool supports PDF)
- docs/docx reading (built-in docs skill)

These are referenced in the command doc as instructions, not as external dependencies.
