const express = require('express');
const path = require('path');
const fs = require('fs');
const { readAllPortfolioData, readCategoriesConfig, discoverExcelFiles, DATA_DIR } = require('./lib/excel');

const app = express();
const PORT = 3333;

// --- SSE ---
const sseClients = [];

function broadcast(resource) {
  const data = JSON.stringify({ resource });
  sseClients.forEach(res => res.write(`data: ${data}\n\n`));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Helpers (JSON files only: signals, feed, watchlist, tax) ---
function readJSON(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// --- Watch data/ for changes → broadcast SSE ---
let watchDebounce = null;
try {
  fs.watch(DATA_DIR, (eventType, filename) => {
    if (!filename || filename.startsWith('~$')) return;
    if (filename.endsWith('.xlsx')) {
      clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => {
        broadcast('portfolio');
      }, 500);
    } else if (filename === 'categories.json') {
      clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => {
        broadcast('portfolio');
      }, 500);
    } else if (filename === 'profile.json') {
      clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => broadcast('profile'), 500);
    } else if (filename === 'tax-summary.json') {
      clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => broadcast('tax'), 500);
    }
  });
} catch (e) {
  console.error('fs.watch not available:', e.message);
}

// --- SSE Endpoint ---
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.write('\n');
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// --- API Routes ---

// Portfolio (read-only, from Excel)
app.get('/api/portfolio', (req, res) => {
  try {
    const data = readAllPortfolioData();
    if (!data.assets.length && !data.liabilities.length) return res.status(404).json({ error: 'No portfolio data' });
    res.json({
      lastUpdated: data.lastUpdated,
      holdings: data.holdings,
      assets: data.assets,
      liabilities: data.liabilities
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Portfolio categories (detected from Excel files)
app.get('/api/portfolio/categories', (req, res) => {
  const files = discoverExcelFiles();
  res.json(files.map(f => f.category));
});

// Categories config
app.get('/api/categories', (req, res) => {
  const config = readCategoriesConfig();
  if (!config) return res.status(404).json({ error: 'No categories config' });
  res.json(config);
});

// Signals
app.get('/api/signals', (req, res) => {
  const data = readJSON('signals.json');
  if (!data) return res.status(404).json({ error: 'No signals data' });
  res.json(data);
});

app.post('/api/signals', (req, res) => {
  const data = readJSON('signals.json') || { signals: [] };
  const signal = {
    id: `sig-${Date.now()}`,
    timestamp: new Date().toISOString(),
    dismissed: false,
    ...req.body
  };
  data.signals.unshift(signal);
  writeJSON('signals.json', data);
  broadcast('signals');
  res.status(201).json(signal);
});

app.patch('/api/signals/:id', (req, res) => {
  const data = readJSON('signals.json');
  if (!data) return res.status(404).json({ error: 'No signals data' });
  const signal = data.signals.find(s => s.id === req.params.id);
  if (!signal) return res.status(404).json({ error: 'Signal not found' });
  Object.assign(signal, req.body);
  writeJSON('signals.json', data);
  broadcast('signals');
  res.json(signal);
});

// Feed
app.get('/api/feed', (req, res) => {
  const data = readJSON('feed.json');
  if (!data) return res.status(404).json({ error: 'No feed data' });
  res.json(data);
});

// Tax summary
app.get('/api/tax-summary', (req, res) => {
  const data = readJSON('tax-summary.json');
  if (!data) return res.status(404).json({ error: 'No tax data' });
  res.json(data);
});

// Watchlist
app.get('/api/watchlist', (req, res) => {
  const data = readJSON('watchlist.json');
  if (!data) return res.status(404).json({ error: 'No watchlist data' });
  res.json(data);
});

// Profile
app.get('/api/profile', (req, res) => {
  const data = readJSON('profile.json');
  if (!data) return res.status(404).json({ error: 'No profile data' });
  res.json(data);
});

// Aggregated stats (from Excel)
app.get('/api/stats', (req, res) => {
  try {
    const portfolio = readAllPortfolioData();
    if (!portfolio.assets.length && !portfolio.liabilities.length) {
      return res.status(404).json({ error: 'No portfolio data' });
    }

    const holdings = portfolio.assets;
    let totalValue = 0;
    let totalCost = 0;
    const allocation = {};
    const allocationAbsolute = {};

    for (const h of holdings) {
      const value = h.quantity * h.currentPrice;
      const cost = h.quantity * h.avgCost;
      totalValue += value;
      totalCost += cost;

      allocation[h.category] = (allocation[h.category] || 0) + value;
    }

    const allocationPct = {};
    for (const [cat, val] of Object.entries(allocation)) {
      allocationPct[cat] = totalValue > 0 ? (val / totalValue) * 100 : 0;
      allocationAbsolute[cat] = val;
    }

    // Liability stats
    let totalLiabilities = 0;
    let totalMonthlyPayments = 0;
    const liabilityAllocation = {};
    const liabilityAllocationAbsolute = {};

    for (const l of portfolio.liabilities) {
      totalLiabilities += l.currentBalance;
      totalMonthlyPayments += l.monthlyPayment;
      liabilityAllocationAbsolute[l.category] = (liabilityAllocationAbsolute[l.category] || 0) + l.currentBalance;
    }

    for (const [cat, val] of Object.entries(liabilityAllocationAbsolute)) {
      liabilityAllocation[cat] = totalLiabilities > 0 ? (val / totalLiabilities) * 100 : 0;
    }

    // Account type aggregations
    const accountTypeAllocationAbsolute = {};
    let taxableGains = 0, taxDeferredValue = 0, taxFreeValue = 0;

    for (const h of holdings) {
      const value = h.quantity * h.currentPrice;
      const cost = h.costBasis || (h.quantity * h.avgCost);
      const acctType = h.accountType || 'taxable';
      accountTypeAllocationAbsolute[acctType] = (accountTypeAllocationAbsolute[acctType] || 0) + value;

      if (['taxable', 'direct', 'checking', 'savings'].includes(acctType)) {
        if (value > cost) taxableGains += (value - cost);
      } else if (['traditional-ira', 'traditional-401k'].includes(acctType)) {
        taxDeferredValue += value;
      } else if (['roth-ira', 'roth-401k', 'hsa', '529'].includes(acctType)) {
        taxFreeValue += value;
      }
    }

    const accountTypeAllocation = {};
    for (const [acctType, val] of Object.entries(accountTypeAllocationAbsolute)) {
      accountTypeAllocation[acctType] = totalValue > 0 ? (val / totalValue) * 100 : 0;
    }

    const netWorth = totalValue - totalLiabilities;
    const debtToAssetRatio = totalValue > 0 ? totalLiabilities / totalValue : 0;

    res.json({
      totalValue,
      totalCost,
      totalGainLoss: totalValue - totalCost,
      totalGainLossPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      positions: holdings.length,
      allocation: allocationPct,
      allocationAbsolute,
      totalAssetValue: totalValue,
      totalLiabilities,
      totalMonthlyPayments,
      netWorth,
      debtToAssetRatio,
      liabilityAllocation,
      liabilityAllocationAbsolute,
      accountTypeAllocation,
      accountTypeAllocationAbsolute,
      taxableGains,
      taxDeferredValue,
      taxFreeValue
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Capis is running at http://localhost:${PORT}\n`);
});
