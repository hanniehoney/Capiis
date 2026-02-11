const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3333;
const DATA_DIR = path.join(__dirname, 'data');

// --- SSE ---
const sseClients = [];

function broadcast(resource) {
  const data = JSON.stringify({ resource });
  sseClients.forEach(res => res.write(`data: ${data}\n\n`));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Helpers ---
function readData(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function writeData(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
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

// Portfolio
app.get('/api/portfolio', (req, res) => {
  const data = readData('portfolio.json');
  if (!data) return res.status(404).json({ error: 'No portfolio data' });
  res.json(data);
});

app.put('/api/portfolio/:id', (req, res) => {
  const data = readData('portfolio.json');
  if (!data) return res.status(404).json({ error: 'No portfolio data' });
  const idx = data.holdings.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Holding not found' });
  data.holdings[idx] = { ...data.holdings[idx], ...req.body };
  data.lastUpdated = new Date().toISOString();
  writeData('portfolio.json', data);
  broadcast('portfolio');
  res.json(data.holdings[idx]);
});

app.post('/api/portfolio', (req, res) => {
  const data = readData('portfolio.json') || { lastUpdated: new Date().toISOString(), holdings: [] };
  const holding = { id: req.body.id || `holding-${Date.now()}`, ...req.body };
  data.holdings.push(holding);
  data.lastUpdated = new Date().toISOString();
  writeData('portfolio.json', data);
  broadcast('portfolio');
  res.status(201).json(holding);
});

app.delete('/api/portfolio/:id', (req, res) => {
  const data = readData('portfolio.json');
  if (!data) return res.status(404).json({ error: 'No portfolio data' });
  const idx = data.holdings.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Holding not found' });
  const removed = data.holdings.splice(idx, 1)[0];
  data.lastUpdated = new Date().toISOString();
  writeData('portfolio.json', data);
  broadcast('portfolio');
  res.json(removed);
});

// Signals
app.get('/api/signals', (req, res) => {
  const data = readData('signals.json');
  if (!data) return res.status(404).json({ error: 'No signals data' });
  res.json(data);
});

app.post('/api/signals', (req, res) => {
  const data = readData('signals.json') || { signals: [] };
  const signal = {
    id: `sig-${Date.now()}`,
    timestamp: new Date().toISOString(),
    dismissed: false,
    ...req.body
  };
  data.signals.unshift(signal);
  writeData('signals.json', data);
  broadcast('signals');
  res.status(201).json(signal);
});

app.patch('/api/signals/:id', (req, res) => {
  const data = readData('signals.json');
  if (!data) return res.status(404).json({ error: 'No signals data' });
  const signal = data.signals.find(s => s.id === req.params.id);
  if (!signal) return res.status(404).json({ error: 'Signal not found' });
  Object.assign(signal, req.body);
  writeData('signals.json', data);
  broadcast('signals');
  res.json(signal);
});

// Feed
app.get('/api/feed', (req, res) => {
  const data = readData('feed.json');
  if (!data) return res.status(404).json({ error: 'No feed data' });
  res.json(data);
});

// Tax summary
app.get('/api/tax-summary', (req, res) => {
  const data = readData('tax-summary.json');
  if (!data) return res.status(404).json({ error: 'No tax data' });
  res.json(data);
});

// Watchlist
app.get('/api/watchlist', (req, res) => {
  const data = readData('watchlist.json');
  if (!data) return res.status(404).json({ error: 'No watchlist data' });
  res.json(data);
});

// Aggregated stats
app.get('/api/stats', (req, res) => {
  const portfolio = readData('portfolio.json');
  if (!portfolio) return res.status(404).json({ error: 'No portfolio data' });

  const holdings = portfolio.holdings;
  let totalValue = 0;
  let totalCost = 0;
  let weightedChange = 0;
  const allocation = {};
  let bestPerformer = { name: '-', change: -Infinity };

  for (const h of holdings) {
    const value = h.quantity * h.currentPrice;
    const cost = h.quantity * h.avgCost;
    totalValue += value;
    totalCost += cost;
    weightedChange += value * (h.change24h / 100);

    allocation[h.category] = (allocation[h.category] || 0) + value;

    if (h.change24h > bestPerformer.change) {
      bestPerformer = { name: h.name, ticker: h.ticker, change: h.change24h };
    }
  }

  const change24hPct = totalValue > 0 ? (weightedChange / totalValue) * 100 : 0;

  // Convert allocation to percentages
  const allocationPct = {};
  for (const [cat, val] of Object.entries(allocation)) {
    allocationPct[cat] = totalValue > 0 ? (val / totalValue) * 100 : 0;
  }

  res.json({
    totalValue,
    totalCost,
    totalGainLoss: totalValue - totalCost,
    totalGainLossPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    change24h: weightedChange,
    change24hPct,
    positions: holdings.length,
    allocation: allocationPct,
    allocationAbsolute: allocation,
    bestPerformer
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Capis is running at http://localhost:${PORT}\n`);
});
