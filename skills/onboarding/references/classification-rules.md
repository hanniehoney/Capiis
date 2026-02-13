# Asset Classification Rules

## Core Principle

**Classify by how the asset is held and traded, not by its thematic exposure.**

A REIT ETF tracks real estate but trades on an exchange — it's a stock. A gold coin sits in a safe — it's a physical asset. The trading mechanism determines the category.

## Decision Tree

When classifying an asset, walk through these questions in order:

```
1. Is it a debt you owe?
   → YES: Liability (mortgage, auto-loan, student-loan, credit-cards)

2. Is it cash or a bank deposit?
   → Checking/sweep account → cash
   → Savings account, HYSA, CD, money market, 529 plan → savings

3. Is it employee compensation equity?
   → RSU, ISO, ESPP, stock options from your employer → employee-equity

4. Does it trade on a public exchange?
   → YES: stocks (this includes ALL ETFs, index funds, REITs, bond ETFs,
          commodity ETFs, individual stocks, ADRs, closed-end funds)
   → Cryptocurrency on an exchange → crypto

5. Is it a private company investment?
   → Angel investment, seed round, SAFE, convertible note → angel-investment

6. Is it physically held property?
   → Land, house, rental property, commercial building → real-estate
   → Car, motorcycle, boat → vehicles
   → Watch, ring, necklace → jewelry
   → Painting, sculpture, collectible, NFT (if valued as art) → art
```

## Common Mistakes

| Asset | WRONG category | RIGHT category | Why |
|-------|---------------|----------------|-----|
| Vanguard Real Estate ETF (VNQ) | real-estate | stocks | Trades on NYSE |
| iShares Gold Trust (IAU) | jewelry | stocks | Trades on NYSE |
| SPDR Bloomberg Bond ETF (BND) | savings | stocks | Trades on NYSE |
| Bitcoin ETF (IBIT) | crypto | stocks | Trades on Nasdaq |
| Actual Bitcoin on Coinbase | stocks | crypto | Crypto exchange |
| REIT (physical property investment) | stocks | real-estate | Direct ownership |
| Private company stock (pre-IPO) | stocks | angel-investment | Not publicly traded |
| Employer RSUs (even if vested & tradeable) | stocks | employee-equity | Employer compensation |
| 529 education savings | cash | savings | Growth-bearing savings |
| Brokerage sweep cash | savings | cash | No yield intent |

## When to Apply These Rules

- **Onboarding (Phase 3)**: Before writing each asset to its xlsx file, verify the category matches these rules. If the user says "I have a REIT ETF" during the real-estate phase, redirect it to stocks.
- **Position management**: When adding a new position, determine the correct xlsx file using this decision tree before writing.
- **File imports**: When parsing imported files (xlsx, csv, pdf), classify each row before writing. Flag ambiguous items for user confirmation.

## Edge Cases — Ask the User

If classification is genuinely ambiguous, ask:

- "Is [asset] traded on a public exchange, or is it a direct/private holding?"
- "Is this through your employer's equity compensation, or did you buy it independently?"

Never guess on edge cases. One question resolves it.
