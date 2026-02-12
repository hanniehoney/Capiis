# Capis Data Schemas

## Portfolio Data (Excel)

Portfolio data lives in `data/*.xlsx` files. Each file represents one asset category (filename = category). The server reads these on every API request via `lib/excel.js`.

**To manage portfolio data, use Claude Code's xlsx skill to read/write the Excel files directly.**

### Excel Column Schema

Each `.xlsx` file has a single sheet named "Holdings" with these columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | yes | Unique lowercase ID (e.g., aapl, btc, startup-nexaflow) |
| `name` | string | yes | Full asset name |
| `ticker` | string | yes | Ticker symbol, or PRIVATE for angel investments |
| `quantity` | number | yes | Number of shares/coins/units |
| `avgCost` | number | yes | Average cost per unit (total investment for angel investments) |
| `currentPrice` | number | yes | Current price per unit (estimated value for angel investments) |
| `notes` | string | yes | Investment thesis or notes |
| `accountType` | string | no | Account type: taxable, roth-ira, traditional-401k, hsa, etc. Defaults to "taxable" |
| `accountName` | string | no | Human-readable account name (e.g., "Schwab Brokerage") |
| `costBasis` | number | no | Total cost basis. Defaults to quantity * avgCost |
| `purchaseDate` | string | no | ISO date of purchase (e.g., "2023-03-15"). Used for short/long-term determination |
| `lastUpdated` | string | no | ISO date when the row was last updated (e.g., "2026-02-11") |

### Employee Equity Fields (Phase 1)

These columns are specific to `employee-equity.xlsx`:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `equityType` | string | no | RSU, ISO, or ESPP |
| `grantDate` | string | no | ISO date of the grant |
| `vestingSchedule` | string | no | Human-readable vesting schedule (e.g., "4yr quarterly", "4yr with 1yr cliff") |
| `strikePrice` | number | no | Strike/exercise price (0 for RSUs) |
| `fmvAtGrant` | number | no | Fair market value per share at grant date |

### Current Excel Files

| File | Category | Contents |
|------|----------|----------|
| `stocks.xlsx` | stocks | Public stock holdings |
| `crypto.xlsx` | crypto | Cryptocurrency holdings |
| `angel-investment.xlsx` | angel-investment | Angel investments |
| `employee-equity.xlsx` | employee-equity | Employee equity (RSUs/ISOs/ESPP) |
| `real-estate.xlsx` | real-estate | Real estate holdings |
| `cash.xlsx` | cash | Cash & checking accounts |
| `savings.xlsx` | savings | Savings & CDs |
| `vehicles.xlsx` | vehicles | Vehicles |
| `jewelry.xlsx` | jewelry | Jewelry & watches |
| `art.xlsx` | art | Art & collectibles |

Drop any new `.xlsx` with valid columns into `data/` to add a new category.

---

## profile.json

```json
{
  "personal": {
    "name": "string",
    "occupation": "string",
    "company": "string",
    "yearsOfExperience": "number",
    "title": "string"
  },
  "location": {
    "country": "string (e.g., US)",
    "state": "string (e.g., TX)",
    "city": "string",
    "zipCode": "string",
    "fullAddress": "string"
  },
  "tax": {
    "filingStatus": "single | married-joint | married-separate | head-of-household",
    "dependents": "number",
    "federalTaxBracket": "decimal (e.g., 0.24)",
    "stateTaxRate": "decimal (e.g., 0 for Texas)",
    "longTermCapitalGainsRate": "decimal",
    "shortTermCapitalGainsRate": "decimal",
    "niit": "decimal (Net Investment Income Tax, 0.038)",
    "notes": "string"
  },
  "accounts": [
    {
      "id": "string",
      "name": "string",
      "type": "checking | taxable | roth-ira | traditional-401k | hsa | savings",
      "institution": "string"
    }
  ],
  "lastUpdated": "ISO 8601"
}
```

## signals.json

```json
{
  "signals": [
    {
      "id": "sig-{timestamp}",
      "timestamp": "ISO 8601",
      "priority": "high | medium | low",
      "title": "Short alert headline",
      "body": "Detailed context and recommendation",
      "relatedAssets": ["array of holding ids"],
      "category": "rebalance | earnings | tax | risk | macro | momentum | startup",
      "dismissed": "boolean"
    }
  ]
}
```

## feed.json

```json
{
  "items": [
    {
      "id": "f-{number}",
      "source": "Source name (Bloomberg, Reuters, CoinDesk, TechCrunch, etc.)",
      "headline": "Article headline",
      "summary": "2-3 sentence summary",
      "url": "Link to source",
      "timestamp": "ISO 8601",
      "category": "crypto | earnings | macro | angel-investment",
      "relevanceScore": "1-10 integer"
    }
  ]
}
```

## watchlist.json

```json
{
  "items": [
    {
      "id": "w-{ticker}",
      "name": "Asset name",
      "ticker": "TICKER",
      "category": "stocks | crypto",
      "currentPrice": "number",
      "change24h": "number (percentage)",
      "note": "Why watching this asset"
    }
  ]
}
```

## tax-summary.json

```json
{
  "taxYear": "number",
  "jurisdiction": "string (e.g., US, TW)",
  "realizedGains": "number",
  "realizedLosses": "number (negative)",
  "netRealizedGainLoss": "number",
  "unrealizedGains": "number",
  "unrealizedLosses": "number",
  "estimatedTaxLiability": "number",
  "longTermRate": "decimal (e.g., 0.15)",
  "shortTermRate": "decimal (e.g., 0.30)",
  "taxLossHarvestingOpportunities": [
    {
      "asset": "TICKER",
      "currentLoss": "number",
      "potentialSavings": "number",
      "note": "string"
    }
  ],
  "taxableEvents": [
    {
      "date": "YYYY-MM-DD",
      "type": "sell | loss",
      "asset": "TICKER",
      "shares": "number (optional)",
      "units": "number (optional)",
      "amount": "number (sale proceeds)",
      "costBasis": "number",
      "gain": "number (can be negative for losses)",
      "term": "long | short"
    }
  ],
  "notes": "string"
}
```
