---
name: capis-portfolio
description: Analyze and manage portfolio data for the Capis wealth management dashboard. Use this skill when the user asks about their investment portfolio, wants to check allocation, asks for rebalancing suggestions, wants to add/remove positions, or needs portfolio performance analysis. Also triggers when the user mentions stocks, crypto, startup investments, or asset allocation in the context of their personal finances.
---

# Capis Portfolio Intelligence

Analyze portfolio holdings, generate signals, and provide investment overview intelligence for the Capis wealth dashboard.

## Data Location

Portfolio data is stored as Excel files in `data/`, one per asset category. Other data remains as JSON:

- `data/stocks.xlsx` -- Stock holdings
- `data/crypto.xlsx` -- Crypto holdings
- `data/angel-investment.xlsx` -- Angel investments
- `data/employee-equity.xlsx` -- Employee equity (RSUs/ISOs/ESPP)
- `data/real-estate.xlsx` -- Real estate (template)
- `data/signals.json` -- AI-generated alerts and investment signals
- `data/watchlist.json` -- Tracked assets not yet in the portfolio
- `data/feed.json` -- News and market intelligence feed
- `data/tax-summary.json` -- Tax planning data and taxable events

New categories are added by dropping a new `.xlsx` file into `data/`.

### Excel Column Schema

Each `.xlsx` file uses these columns: `id`, `name`, `ticker`, `quantity`, `avgCost`, `currentPrice`, `notes`, `lastUpdated` (optional).

Employee equity (`employee-equity.xlsx`) has additional columns: `equityType` (RSU/ISO/ESPP), `grantDate`, `vestingSchedule`, `strikePrice`, `fmvAtGrant`.

See `references/asset-schema.md` for full schema details.

## Portfolio Analysis

When asked about portfolio status:
1. Read the Excel files in `data/` (via the server API at `GET /api/portfolio` or directly)
2. Calculate: total value, allocation percentages by category (stocks/crypto/angel-investment/employee-equity/etc.), unrealized P&L per position and overall
3. Identify top performers and underperformers by % gain
4. Present a clear summary with key metrics in a concise format

## Signal Generation

When analyzing the portfolio or market conditions:
1. Read current holdings from the Excel files
2. Compare current allocation to balanced targets (guideline: ~40% stocks, ~30% crypto, ~15% angel-invest, ~10% employee-equity, ~5% cash)
3. Flag positions with significant daily moves (>3%)
4. Identify concentration risks (any single position >20% of portfolio)
5. Check for tax-loss harvesting opportunities
6. Write new signals to `data/signals.json` using this format:
```json
{
  "priority": "high|medium|low",
  "title": "Brief alert headline",
  "body": "Detailed context and suggested action",
  "relatedAssets": ["asset-id"],
  "category": "rebalance|earnings|tax|risk|macro|momentum|startup"
}
```

## Position Management

When the user wants to add, remove, or update a position:
1. Read the appropriate Excel file in `data/` (e.g., `stocks.xlsx` for stocks)
2. Apply the change using Claude Code's xlsx skill (add row, update values, or remove row)
3. Maintain the schema: id, name, ticker, quantity, avgCost, currentPrice, notes
4. The server's file watcher will auto-detect changes and broadcast SSE to refresh the dashboard
5. Generate any relevant signals triggered by the change

## Profile Management

The user's financial profile lives in `data/profile.json`. It contains:
- **Personal info**: name, occupation, company, title
- **Location**: country, state, city, zip (state matters for state tax)
- **Tax info**: filing status, dependents, federal bracket, state rate, LTCG/STCG rates, NIIT
- **Accounts**: list of financial accounts with type and institution

When the user asks to set up or update their profile:
1. Gather relevant info through conversation
2. Write/update `data/profile.json` with the profile structure
3. The server's file watcher will auto-detect changes and broadcast SSE to refresh the dashboard
4. Profile is read-only in the dashboard — all edits happen through Claude Code

Account types for holdings: `taxable`, `roth-ira`, `traditional-401k`, `traditional-ira`, `roth-401k`, `hsa`, `529`, `direct`, `checking`, `savings`

When adding or editing holdings, include the `accountType`, `accountName`, `costBasis`, and `purchaseDate` fields in the Excel row.

## Rebalancing

When asked about rebalancing:
1. Calculate current vs target allocation
2. Suggest specific actions (buy/sell amounts) to rebalance
3. Prioritize tax-efficient rebalancing (sell losers first, avoid short-term gains)
4. Present trade-offs clearly so the user can decide quickly
