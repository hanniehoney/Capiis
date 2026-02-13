---
name: capis-onboarding
description: Guide users through setting up their financial data in the Capis wealth management dashboard. Triggers when the user wants to enter their personal profile, assets, liabilities, or financial accounts — either through conversation or by importing files (xlsx, pdf, docs, csv, txt). Also triggers on "/capis-data setup" or when the user says things like "help me set up my portfolio" or "I want to enter my financial data".
---

# Capis Onboarding — Guided Data Setup

Walk the user through entering all their financial data into Capis, one step at a time.

## Data Location

All data files live in `~/Desktop/Capis/data/`. See `references/data-schema.md` for complete schemas.

## Before Starting: Resume Detection

Check what data already exists:

1. Read `~/Desktop/Capis/data/profile.json`
   - If it has `personal.name` → Phase 1 (Profile) is likely complete
   - If it has a non-empty `accounts` array → Phase 2 (Accounts) is likely complete
2. List xlsx files in `~/Desktop/Capis/data/` and check which have data rows beyond the header
   - Any xlsx with >1 row means that category has been entered
3. Tell the user what you found:
   - "I see you already have profile data and N asset categories filled in. Want to continue from where you left off, or redo a specific section?"
   - If everything is empty, just start from Phase 1

## Phase 1: Profile

Ask ONE question at a time. Never batch multiple questions in one message.

1. "What's your name?"
2. "What do you do? (job title, company, years of experience)"
3. "Where do you live? (city, state, country)"
   - After getting the state, use web search to look up the current state income tax rate
4. "What's your filing status?" — use AskUserQuestion with options:
   - Single
   - Married filing jointly
   - Married filing separately
   - Head of household
5. "How many dependents do you have?"
6. If married: "What's your spouse's name?" and "Do you have children? Names and ages?"

After collecting all answers:
- Calculate tax rates based on location and filing status (verify with web search for current year rates)
- Look up: federal bracket, state rate, LTCG rate, STCG rate, NIIT threshold, standard deduction, contribution limits
- Write `~/Desktop/Capis/data/profile.json` with personal, family (if applicable), location, and tax sections
- Show the user what was saved and confirm it looks right

## Phase 2: Account Inventory

1. Ask: "Let's go through your financial accounts — brokerage, bank, retirement, crypto exchange, anything that holds money or investments. You can list them all at once, or we'll go one by one."

2. For each account, determine:
   - `id`: auto-generate as `acct-{institution-slug}` (e.g., `acct-schwab-brokerage`)
   - `name`: human-readable (e.g., "Schwab Brokerage")
   - `type`: one of — checking, savings, taxable, roth-ira, traditional-ira, traditional-401k, roth-401k, hsa, 529, direct
   - `institution`: (e.g., "Charles Schwab")

3. Read existing profile.json, add/update the accounts array, write back (preserve all other fields)
4. Show the complete account list and ask user to confirm

## Phase 3: Assets

Walk through each asset category in order. For each:

1. Ask: "Do you have any {category}?" — user can say "no" or "skip"

2. If yes, use AskUserQuestion:
   - "How would you like to enter your {category} data?"
   - Options:
     - "I'll tell you" — dialogue mode
     - "I have a file" — file import mode
     - "Skip for now"

3. **Dialogue mode**: For each holding, collect:
   - Name and ticker (PRIVATE for angel/startup investments)
   - Quantity, average cost per unit, current price per unit
   - Which account from Phase 2 (accountType + accountName)
   - Purchase date (approximate is fine)
   - Notes (investment thesis, key details)
   - For employee equity: equityType (RSU/ISO/ESPP), grantDate, vestingSchedule, strikePrice, fmvAtGrant
   - After each holding, ask: "Any more {category}? Or should we move on?"

4. **File import mode**:
   - Ask for the file path
   - Read the file using Claude Code's built-in capabilities:
     - `.xlsx` / `.csv` → read with xlsx skill, map columns to Capis schema
     - `.pdf` → read with Read tool (PDF support is built-in)
     - `.docx` → read with built-in docs skill
     - `.txt` / `.md` → read as plain text, parse structured content
   - Show the extracted data as a table for the user to review
   - Ask user to confirm before writing
   - User can say "fix row 3" or "remove that one" before confirming

5. Write confirmed data to `~/Desktop/Capis/data/{category}.xlsx` using the xlsx skill
6. Move to the next category

**Category order:**

| # | Category | Prompt |
|---|----------|--------|
| 1 | stocks | "Do you have any stock investments? (individual stocks, ETFs, index funds)" |
| 2 | crypto | "Do you hold any cryptocurrency?" |
| 3 | employee-equity | "Do you have employee stock/equity? (RSUs, ISOs, ESPP)" |
| 4 | real-estate | "Do you own any real estate? (homes, rental properties, REITs)" |
| 5 | angel-investment | "Have you made any angel or startup investments?" |
| 6 | cash | "What are your cash balances? (checking accounts, brokerage sweep cash)" |
| 7 | savings | "What about savings? (HYSA, CDs, 529 plans, money market)" |
| 8 | vehicles | "Do you own any vehicles?" |
| 9 | jewelry | "Any jewelry or watches of significant value?" |
| 10 | art | "Any art, collectibles, or other alternative assets?" |

## Phase 4: Liabilities

Same pattern as Phase 3. For each liability, collect:
- Name, type (Revolving / Fixed 30yr / Fixed 60mo / etc.)
- Original amount (0 for revolving credit cards)
- Current balance, interest rate (annual, as percentage like 6.75)
- Monthly payment, due date/maturity date
- Notes

Write to `~/Desktop/Capis/data/{liability}.xlsx`.

**Liability order:**

| # | Category | Prompt |
|---|----------|--------|
| 1 | mortgage | "Do you have a mortgage?" |
| 2 | auto-loan | "Any auto loans?" |
| 3 | student-loan | "Any student loans?" |
| 4 | credit-cards | "Any credit card balances? (include cards you pay in full monthly)" |

## Phase 5: Complete

1. Check if Capis server is running: `lsof -ti:3333`
   - If not running, start it: `node ~/Desktop/Capis/server.js &` and wait 2 seconds

2. Fetch portfolio summary: `curl -s http://localhost:3333/api/stats`
   - Display: total assets, total liabilities, net worth, positions count, allocation breakdown

3. Use AskUserQuestion: "Your portfolio is set up! What would you like to do?"
   - "Open dashboard" → `open http://localhost:3333`
   - "Add more data later" → remind about `/capis-data setup`
   - "Done for now"

## Important Rules

- **One question per message.** Never ask multiple questions at once.
- **Write data after each phase/category.** Never batch all writes to the end.
- **User can go back.** If they say "I want to redo my stocks" or "go back to profile", honor it.
- **Accept approximations.** If user says "about 100 shares, not sure of exact cost", accept it and add a note.
- **Confirm before writing files.** Especially for file imports — always show parsed data first.
- **Preserve existing data.** When updating profile.json, read first, merge changes, write back. Don't overwrite unrelated fields.
