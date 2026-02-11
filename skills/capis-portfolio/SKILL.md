---
name: capis-portfolio
description: Analyze and manage portfolio data for the Capis wealth management dashboard. Use this skill when the user asks about their investment portfolio, wants to check allocation, asks for rebalancing suggestions, wants to add/remove positions, or needs portfolio performance analysis. Also triggers when the user mentions stocks, crypto, startup investments, or asset allocation in the context of their personal finances.
---

# Capis Portfolio Intelligence

Analyze portfolio holdings, generate signals, and provide investment overview intelligence for the Capis wealth dashboard.

## Data Location

All portfolio data is stored as JSON files in the project's `data/` directory:
- `data/portfolio.json` -- Current holdings with prices, quantities, and notes
- `data/signals.json` -- AI-generated alerts and investment signals
- `data/watchlist.json` -- Tracked assets not yet in the portfolio
- `data/feed.json` -- News and market intelligence feed
- `data/tax-summary.json` -- Tax planning data and taxable events

## Portfolio Analysis

When asked about portfolio status:
1. Read `data/portfolio.json`
2. Calculate: total value, allocation percentages by category (stocks/crypto/startups), unrealized P&L per position and overall
3. Identify top performers and underperformers by % gain
4. Present a clear summary with key metrics in a concise format

## Signal Generation

When analyzing the portfolio or market conditions:
1. Read current holdings from `data/portfolio.json`
2. Compare current allocation to balanced targets (guideline: ~40% stocks, ~30% crypto, ~20% startups, ~10% cash)
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
1. Read current `data/portfolio.json`
2. Apply the change (add new holding, update quantity/price, or remove)
3. Maintain the schema: id, name, ticker, category, quantity, avgCost, currentPrice, change24h, sparkline7d, notes
4. Write the updated file
5. Generate any relevant signals triggered by the change

## Rebalancing

When asked about rebalancing:
1. Calculate current vs target allocation
2. Suggest specific actions (buy/sell amounts) to rebalance
3. Prioritize tax-efficient rebalancing (sell losers first, avoid short-term gains)
4. Present trade-offs clearly so the user can decide quickly
