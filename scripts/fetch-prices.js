#!/usr/bin/env node
/**
 * fetch-prices.js — Fetch current market prices + split events from Yahoo Finance
 *
 * Usage:
 *   node scripts/fetch-prices.js AAPL GOOGL META BTC-USD ETH-USD SOL-USD
 *   node scripts/fetch-prices.js --splits AAPL NVDA SCHD   # include recent split data
 *
 * Output (JSON):
 *   {
 *     "AAPL": { "price": 261.73, "name": "Apple Inc.", "previousClose": 275.5 },
 *     "NVDA": { "price": 186.94, "name": "NVIDIA Corporation", "previousClose": 190,
 *               "splits": [{ "date": "2024-06-10", "ratio": "10:1", "numerator": 10, "denominator": 1 }] },
 *     "_errors":  [],
 *     "_timestamp": "2026-02-13T09:15:00.000Z"
 *   }
 *
 * Notes:
 *   - Yahoo Finance v8 chart API (no API key needed)
 *   - Crypto tickers use -USD suffix: BTC-USD, ETH-USD, SOL-USD
 *   - --splits flag queries 2-year split history per ticker
 *   - Parallel fetches with concurrency limit
 */

const CONCURRENCY = 5;
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function fetchPrice(ticker, includeSplits) {
  const range = includeSplits ? '2y' : '1d';
  const events = includeSplits ? '&events=splits' : '';
  const url = `${YAHOO_BASE}/${encodeURIComponent(ticker)}?range=${range}&interval=1d${events}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Capis Wealth Dashboard)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const result = data.chart.result?.[0];
  const meta = result?.meta;
  if (!meta) throw new Error('no data');

  const info = {
    price: meta.regularMarketPrice,
    name: meta.shortName || meta.longName || ticker,
    currency: meta.currency || 'USD',
    previousClose: meta.chartPreviousClose || meta.previousClose || null
  };

  // Parse split events if present
  if (includeSplits && result.events?.splits) {
    info.splits = Object.values(result.events.splits).map(s => ({
      date: new Date(s.date * 1000).toISOString().split('T')[0],
      ratio: s.splitRatio,
      numerator: s.numerator,
      denominator: s.denominator
    }));
  }

  return info;
}

async function fetchAll(tickers, includeSplits) {
  const results = {};
  const errors = [];

  for (let i = 0; i < tickers.length; i += CONCURRENCY) {
    const batch = tickers.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (t) => {
        const info = await fetchPrice(t, includeSplits);
        return { ticker: t, info };
      })
    );
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results[result.value.ticker] = result.value.info;
      } else {
        const ticker = batch[settled.indexOf(result)];
        errors.push(`${ticker}: ${result.reason?.message || 'unknown error'}`);
      }
    }
  }

  results._errors = errors;
  results._timestamp = new Date().toISOString();
  return results;
}

// --- Main ---
const args = process.argv.slice(2);
const includeSplits = args.includes('--splits');
const tickers = args.filter(a => a !== '--splits');

if (tickers.length === 0) {
  console.error('Usage: node scripts/fetch-prices.js [--splits] TICKER1 TICKER2 ...');
  console.error('  Stocks: AAPL GOOGL META VOO');
  console.error('  Crypto: BTC-USD ETH-USD SOL-USD');
  console.error('  --splits: include 2-year split history');
  process.exit(1);
}

fetchAll(tickers, includeSplits).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
