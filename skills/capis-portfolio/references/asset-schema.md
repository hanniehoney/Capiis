# Capis Data Schemas

## portfolio.json

```json
{
  "lastUpdated": "ISO 8601 timestamp",
  "holdings": [
    {
      "id": "unique-lowercase-id (e.g., aapl, btc, startup-nexaflow)",
      "name": "Full asset name",
      "ticker": "TICKER or PRIVATE for startups",
      "category": "stocks | crypto | startups",
      "quantity": "number (shares, coins, or 1 for startup positions)",
      "avgCost": "number (average cost per unit, or total investment for startups)",
      "currentPrice": "number (current price per unit, or estimated value for startups)",
      "change24h": "number (24h percentage change, 0 for startups)",
      "sparkline7d": "[array of 7 numbers representing daily prices]",
      "notes": "string (investment thesis or notes)"
    }
  ]
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
      "category": "crypto | earnings | macro | startups",
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
