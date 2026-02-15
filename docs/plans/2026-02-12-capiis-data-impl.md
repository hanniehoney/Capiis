# /capiis-data Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `/capiis-data` slash command with three subcommands: `clear`, `template`, and `setup` for managing all Capiis data.

**Architecture:** Single `.claude/commands/capiis-data.md` slash command routes to subcommands. `clear` runs `scripts/clear-data.js` (new). `template` runs `scripts/seed-data.js` (rewritten with Bay Area family). `setup` invokes the `capiis-onboarding` skill (`skills/capiis-onboarding/SKILL.md`) for multi-phase guided data entry.

**Tech Stack:** Node.js scripts (xlsx library), Claude Code slash command (markdown), Claude Code skill (markdown)

---

### Task 1: Create `scripts/clear-data.js`

**Files:**
- Create: `scripts/clear-data.js`

**Step 1: Write the script**

```js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');

const ASSET_HEADERS = ['id', 'name', 'ticker', 'quantity', 'avgCost', 'currentPrice', 'notes', 'accountType', 'accountName', 'costBasis', 'purchaseDate', 'lastUpdated'];
const EQUITY_HEADERS = [...ASSET_HEADERS, 'equityType', 'grantDate', 'vestingSchedule', 'strikePrice', 'fmvAtGrant'];
const LIABILITY_HEADERS = ['id', 'name', 'type', 'originalAmount', 'currentBalance', 'interestRate', 'monthlyPayment', 'dueDate', 'notes'];

const ASSET_FILES = ['stocks', 'crypto', 'angel-investment', 'real-estate', 'cash', 'savings', 'vehicles', 'jewelry', 'art'];
const EQUITY_FILES = ['employee-equity'];
const LIABILITY_FILES = ['credit-cards', 'mortgage', 'auto-loan', 'student-loan'];
const JSON_FILES = ['profile.json', 'tax-summary.json', 'signals.json', 'feed.json', 'watchlist.json'];

function writeEmptyExcel(filename, headers, sheetName) {
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, path.join(DATA_DIR, filename));
  console.log(`  created empty ${filename}`);
}

console.log('\nClearing Capiis data...\n');

// Delete JSON user data files (keep categories.json)
for (const f of JSON_FILES) {
  const fp = path.join(DATA_DIR, f);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    console.log(`  deleted ${f}`);
  }
}

// Generate header-only xlsx shells
for (const cat of ASSET_FILES) {
  writeEmptyExcel(`${cat}.xlsx`, ASSET_HEADERS, 'Holdings');
}
for (const cat of EQUITY_FILES) {
  writeEmptyExcel(`${cat}.xlsx`, EQUITY_HEADERS, 'Holdings');
}
for (const cat of LIABILITY_FILES) {
  writeEmptyExcel(`${cat}.xlsx`, LIABILITY_HEADERS, 'Liabilities');
}

console.log('\nDone. Data cleared. 14 empty xlsx shells created. categories.json preserved.\n');
```

**Step 2: Run and verify**

Run: `node ~/Desktop/Capiis/scripts/clear-data.js`

Expected output:
```
Clearing Capiis data...

  deleted profile.json
  deleted tax-summary.json
  deleted signals.json
  deleted feed.json
  deleted watchlist.json
  created empty stocks.xlsx
  ...
  created empty student-loan.xlsx

Done. Data cleared. 14 empty xlsx shells created. categories.json preserved.
```

Verify: `ls ~/Desktop/Capiis/data/` should show 14 xlsx + categories.json only.

**Step 3: Re-seed to restore data**

Run: `node ~/Desktop/Capiis/scripts/seed-data.js`

Verify data is restored.

**Step 4: Commit**

```bash
git add scripts/clear-data.js
git commit -m "feat: add clear-data.js script for wiping user data"
```

---

### Task 2: Add npm script

**Files:**
- Modify: `package.json:7-9`

**Step 1: Add clear script**

Change the scripts section to:

```json
"scripts": {
  "start": "node server.js",
  "seed": "node scripts/seed-data.js",
  "clear": "node scripts/clear-data.js"
}
```

**Step 2: Verify**

Run: `npm run clear --prefix ~/Desktop/Capiis`

Expected: same output as Task 1 Step 2.

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add npm run clear script"
```

---

### Task 3: Rewrite `scripts/seed-data.js` with Bay Area family

**Files:**
- Modify: `scripts/seed-data.js` (full rewrite)

**Step 1: Rewrite seed-data.js**

The structure (writeJSON, writeExcel, writeExcelLiability functions) stays identical. Only the data arrays and profile change. Complete replacement:

```js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  console.log(`  wrote data/${filename}`);
}

function writeExcel(filename, rows) {
  const hasEquityFields = rows.some(r => r.equityType);
  const headers = [
    'id', 'name', 'ticker', 'quantity', 'avgCost', 'currentPrice', 'notes',
    'accountType', 'accountName', 'costBasis', 'purchaseDate', 'lastUpdated',
    ...(hasEquityFields ? ['equityType', 'grantDate', 'vestingSchedule', 'strikePrice', 'fmvAtGrant'] : [])
  ];
  const data = rows.map(r => {
    const row = {
      id: r.id, name: r.name, ticker: r.ticker,
      quantity: r.quantity, avgCost: r.avgCost,
      currentPrice: r.currentPrice,
      notes: r.notes || '',
      accountType: r.accountType || 'taxable',
      accountName: r.accountName || '',
      costBasis: (r.quantity || 0) * (r.avgCost || 0),
      purchaseDate: r.purchaseDate || '',
      lastUpdated: r.lastUpdated || '2026-02-12'
    };
    if (hasEquityFields) {
      row.equityType = r.equityType || '';
      row.grantDate = r.grantDate || '';
      row.vestingSchedule = r.vestingSchedule || '';
      row.strikePrice = r.strikePrice != null ? r.strikePrice : '';
      row.fmvAtGrant = r.fmvAtGrant != null ? r.fmvAtGrant : '';
    }
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  const cols = [
    { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 14 }, { wch: 50 },
    { wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  if (hasEquityFields) {
    cols.push({ wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 });
  }
  ws['!cols'] = cols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Holdings');
  XLSX.writeFile(wb, path.join(DATA_DIR, filename));
  console.log(`  wrote data/${filename} (${rows.length} rows)`);
}

function writeExcelLiability(filename, rows) {
  const headers = ['id', 'name', 'type', 'originalAmount', 'currentBalance', 'interestRate', 'monthlyPayment', 'dueDate', 'notes'];
  const data = rows.map(r => ({
    id: r.id, name: r.name, type: r.type,
    originalAmount: r.originalAmount, currentBalance: r.currentBalance,
    interestRate: r.interestRate, monthlyPayment: r.monthlyPayment,
    dueDate: r.dueDate, notes: r.notes || ''
  }));
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  ws['!cols'] = [
    { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 50 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Liabilities');
  XLSX.writeFile(wb, path.join(DATA_DIR, filename));
  console.log(`  wrote data/${filename} (${rows.length} rows)`);
}

// ============================================================
// TEMPLATE PERSONA: Alex Chen — Bay Area Chinese Tech Family
// ============================================================

// --- Stocks ---
const stocks = [
  {
    id: 'aapl', name: 'Apple Inc.', ticker: 'AAPL',
    quantity: 200, avgCost: 178.50, currentPrice: 242.30,
    notes: 'Long-term hold. Services revenue accelerating.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2023-03-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'nvda', name: 'NVIDIA Corp.', ticker: 'NVDA',
    quantity: 100, avgCost: 480.00, currentPrice: 892.50,
    notes: 'AI infrastructure leader. High conviction.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-06-20', lastUpdated: '2026-02-12'
  },
  {
    id: 'amzn', name: 'Amazon', ticker: 'AMZN',
    quantity: 80, avgCost: 145.00, currentPrice: 228.60,
    notes: 'AWS margins expanding. Advertising segment growing.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-09-05', lastUpdated: '2026-02-12'
  },
  {
    id: 'tsla', name: 'Tesla Inc.', ticker: 'TSLA',
    quantity: 50, avgCost: 195.00, currentPrice: 385.20,
    notes: 'Robotaxi catalyst pending. Volatile.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2024-02-28', lastUpdated: '2026-02-12'
  },
  {
    id: 'voo', name: 'Vanguard S&P 500 ETF', ticker: 'VOO',
    quantity: 200, avgCost: 380.00, currentPrice: 520.00,
    notes: 'Core index holding in 401(k). DCA monthly.',
    accountType: 'traditional-401k', accountName: 'Google 401(k)', purchaseDate: '2022-01-10', lastUpdated: '2026-02-12'
  },
  {
    id: 'vti', name: 'Vanguard Total Stock Market', ticker: 'VTI',
    quantity: 150, avgCost: 195.00, currentPrice: 280.00,
    notes: 'Broad market exposure. Tax-efficient.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2022-06-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'meta', name: 'Meta Platforms', ticker: 'META',
    quantity: 300, avgCost: 280.00, currentPrice: 580.00,
    notes: 'Vested shares from previous Meta employment. Long-term hold.',
    accountType: 'taxable', accountName: 'E*TRADE', purchaseDate: '2022-01-01', lastUpdated: '2026-02-12'
  }
];

// --- Crypto ---
const crypto = [
  {
    id: 'btc', name: 'Bitcoin', ticker: 'BTC',
    quantity: 1.5, avgCost: 42000, currentPrice: 97500,
    notes: 'Core crypto position. DCA strategy. Halving cycle thesis.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2022-11-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'eth', name: 'Ethereum', ticker: 'ETH',
    quantity: 20, avgCost: 2200, currentPrice: 3180,
    notes: 'Layer 1 ecosystem. Staking yield ~4%. Long-term hold.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2023-01-10', lastUpdated: '2026-02-12'
  },
  {
    id: 'sol', name: 'Solana', ticker: 'SOL',
    quantity: 150, avgCost: 45, currentPrice: 185,
    notes: 'High-performance L1. DeFi/NFT ecosystem growth.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2023-08-22', lastUpdated: '2026-02-12'
  }
];

// --- Angel Investment ---
const angelInvestment = [
  {
    id: 'startup-nexaflow', name: 'NexaFlow', ticker: 'PRIVATE',
    quantity: 1, avgCost: 50000, currentPrice: 120000,
    notes: 'Seed round. AI-powered supply chain. Est. valuation $12M. 1% equity.',
    accountType: 'taxable', accountName: 'Direct Investment', purchaseDate: '2023-04-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'startup-vaultedge', name: 'VaultEdge', ticker: 'PRIVATE',
    quantity: 1, avgCost: 25000, currentPrice: 25000,
    notes: 'Pre-seed. Decentralized identity for fintech. Earliest stage, highest risk.',
    accountType: 'taxable', accountName: 'Direct Investment', purchaseDate: '2025-06-01', lastUpdated: '2026-02-12'
  }
];

// --- Employee Equity ---
const employeeEquity = [
  {
    id: 'eq-googl-rsu', name: 'Google RSUs', ticker: 'GOOGL',
    quantity: 400, avgCost: 0, currentPrice: 185,
    notes: 'Vesting quarterly over 4 years. Next vest: Apr 2026.',
    accountType: 'taxable', accountName: 'E*TRADE Equity', purchaseDate: '2024-03-01', lastUpdated: '2026-02-12',
    equityType: 'RSU', grantDate: '2024-03-01', vestingSchedule: '4yr quarterly', strikePrice: 0, fmvAtGrant: 165
  },
  {
    id: 'eq-googl-espp', name: 'Google ESPP', ticker: 'GOOGL',
    quantity: 150, avgCost: 155, currentPrice: 185,
    notes: 'ESPP shares purchased at 15% discount. 6-month lookback.',
    accountType: 'taxable', accountName: 'E*TRADE Equity', purchaseDate: '2025-06-30', lastUpdated: '2026-02-12',
    equityType: 'ESPP', grantDate: '2025-01-01', vestingSchedule: '6mo purchase period', strikePrice: 155, fmvAtGrant: 178
  }
];

// --- Real Estate ---
const realEstate = [
  {
    id: 're-cupertino', name: 'Cupertino Home (Primary)', ticker: 'RE-CPT',
    quantity: 1, avgCost: 2200000, currentPrice: 2300000,
    notes: 'Primary residence. 4BR in Cupertino. Purchased Sep 2025. School district: CUSD.',
    accountType: 'direct', accountName: 'Direct Ownership', purchaseDate: '2025-09-01', lastUpdated: '2026-02-12'
  },
  {
    id: 're-reit-vnq', name: 'Vanguard Real Estate ETF', ticker: 'VNQ',
    quantity: 200, avgCost: 82.50, currentPrice: 91.20,
    notes: 'Broad REIT exposure. Dividend yield ~3.8%.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2024-01-15', lastUpdated: '2026-02-12'
  }
];

// --- Cash ---
const cash = [
  {
    id: 'chase-checking', name: 'Chase Checking', ticker: 'CASH',
    quantity: 1, avgCost: 35000, currentPrice: 35000,
    notes: 'Primary family checking account.',
    accountType: 'checking', accountName: 'Chase Checking', purchaseDate: '', lastUpdated: '2026-02-12'
  },
  {
    id: 'schwab-cash', name: 'Schwab Brokerage Cash', ticker: 'CASH',
    quantity: 1, avgCost: 12000, currentPrice: 12000,
    notes: 'Brokerage sweep account.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '', lastUpdated: '2026-02-12'
  }
];

// --- Savings ---
const savings = [
  {
    id: 'marcus-hysa', name: 'Marcus HYSA', ticker: 'HYSA',
    quantity: 1, avgCost: 85000, currentPrice: 85000,
    notes: 'High-yield savings. APY 4.5%. Emergency fund + house reserve.',
    accountType: 'savings', accountName: 'Marcus HYSA', purchaseDate: '', lastUpdated: '2026-02-12'
  },
  {
    id: 'cd-12mo', name: '12-Month CD', ticker: 'CD',
    quantity: 1, avgCost: 30000, currentPrice: 30000,
    notes: 'Matures Aug 2026. APY 4.8%.',
    accountType: 'savings', accountName: 'Marcus HYSA', purchaseDate: '', lastUpdated: '2026-02-12'
  },
  {
    id: '529-kid1', name: '529 Plan — Ethan', ticker: '529',
    quantity: 1, avgCost: 35000, currentPrice: 45000,
    notes: 'College savings for Ethan (age 5). Target-date fund.',
    accountType: '529', accountName: 'Vanguard 529', purchaseDate: '2021-06-01', lastUpdated: '2026-02-12'
  },
  {
    id: '529-kid2', name: '529 Plan — Mia', ticker: '529',
    quantity: 1, avgCost: 20000, currentPrice: 28000,
    notes: 'College savings for Mia (age 3). Target-date fund.',
    accountType: '529', accountName: 'Vanguard 529', purchaseDate: '2023-03-01', lastUpdated: '2026-02-12'
  }
];

// --- Vehicles ---
const vehicles = [
  {
    id: 'tesla-model-y', name: 'Tesla Model Y', ticker: 'VEHICLE',
    quantity: 1, avgCost: 58000, currentPrice: 45000,
    notes: '2024 Model Y Long Range. Family primary car.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '2024-03-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'bmw-x3', name: 'BMW X3', ticker: 'VEHICLE',
    quantity: 1, avgCost: 52000, currentPrice: 38000,
    notes: '2023 BMW X3 xDrive30i. Commute & weekend car.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '2023-06-01', lastUpdated: '2026-02-12'
  }
];

// --- Jewelry ---
const jewelry = [
  {
    id: 'rolex-sub', name: 'Rolex Submariner', ticker: 'WATCH',
    quantity: 1, avgCost: 14000, currentPrice: 17500,
    notes: 'Ref. 126610LN. Purchased 2023. Appreciating.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '2023-08-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'diamond-ring', name: 'Diamond Engagement Ring', ticker: 'JEWEL',
    quantity: 1, avgCost: 12000, currentPrice: 10000,
    notes: '1.5ct round brilliant. Appraised value.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '2018-12-01', lastUpdated: '2026-02-12'
  }
];

// --- Art ---
const art = [
  {
    id: 'kaws-companion', name: 'KAWS Companion', ticker: 'ART',
    quantity: 1, avgCost: 3200, currentPrice: 4800,
    notes: 'Open Edition. Secondary market value.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '2022-04-01', lastUpdated: '2026-02-12'
  }
];

// --- Credit Cards (Liability) ---
const creditCards = [
  {
    id: 'amex-plat', name: 'Amex Platinum', type: 'Revolving',
    originalAmount: 0, currentBalance: 4200, interestRate: 24.99,
    monthlyPayment: 4200, dueDate: '2026-03-01',
    notes: 'Paid in full monthly. Travel & dining rewards.'
  },
  {
    id: 'chase-sapphire', name: 'Chase Sapphire Reserve', type: 'Revolving',
    originalAmount: 0, currentBalance: 2800, interestRate: 22.49,
    monthlyPayment: 2800, dueDate: '2026-03-15',
    notes: 'Travel rewards card. Paid in full.'
  }
];

// --- Mortgage (Liability) ---
const mortgage = [
  {
    id: 'cupertino-mortgage', name: 'Cupertino Home Mortgage', type: 'Fixed 30yr',
    originalAmount: 1760000, currentBalance: 1720000, interestRate: 6.75,
    monthlyPayment: 11413, dueDate: '2055-09-01',
    notes: 'Wells Fargo. Primary residence. Purchased Sep 2025. $440K down payment.'
  }
];

// --- Auto Loan (Liability) ---
const autoLoan = [
  {
    id: 'tesla-loan', name: 'Tesla Model Y Loan', type: 'Fixed 60mo',
    originalAmount: 42000, currentBalance: 35000, interestRate: 5.49,
    monthlyPayment: 805, dueDate: '2029-03-15',
    notes: 'Tesla financing. $16K down payment.'
  },
  {
    id: 'bmw-loan', name: 'BMW X3 Loan', type: 'Fixed 60mo',
    originalAmount: 40000, currentBalance: 28000, interestRate: 4.99,
    monthlyPayment: 755, dueDate: '2028-06-01',
    notes: 'BMW Financial Services. $12K down payment.'
  }
];

// --- Student Loan (Liability) ---
// None — paid off. Empty array keeps the xlsx shell.
const studentLoan = [];

// --- Signals ---
const signals = {
  signals: [
    {
      id: 'sig-001', timestamp: '2026-02-12T08:30:00Z', priority: 'high',
      title: 'META shares up 107% — consider trimming',
      body: 'Your 300 vested Meta shares are now worth $174K (cost basis $84K). This is a concentrated single-stock position from your previous employer. Consider trimming 30-50% to diversify and lock in gains.',
      relatedAssets: ['meta'], category: 'risk', dismissed: false
    },
    {
      id: 'sig-002', timestamp: '2026-02-12T07:15:00Z', priority: 'medium',
      title: 'Google RSU vest coming in April',
      body: 'Your next quarterly RSU vest is ~100 shares of GOOGL in April 2026. At current price ($185), that is ~$18,500 of ordinary income. Plan for tax withholding.',
      relatedAssets: ['eq-googl-rsu'], category: 'tax', dismissed: false
    },
    {
      id: 'sig-003', timestamp: '2026-02-11T22:00:00Z', priority: 'high',
      title: 'Mortgage payment is 59% of estimated take-home',
      body: 'Your $11,413/mo mortgage represents a significant portion of cash flow. Ensure 6-month emergency fund ($85K in Marcus HYSA covers ~7.4 months of mortgage). Consider accelerating savings.',
      relatedAssets: ['cupertino-mortgage'], category: 'risk', dismissed: false
    },
    {
      id: 'sig-004', timestamp: '2026-02-11T16:00:00Z', priority: 'medium',
      title: 'NexaFlow milestone: Series A talks initiated',
      body: 'NexaFlow has begun Series A discussions. If successful at a $30M+ valuation, your seed position would 2.5x. Consider your follow-on investment strategy.',
      relatedAssets: ['startup-nexaflow'], category: 'startup', dismissed: false
    },
    {
      id: 'sig-005', timestamp: '2026-02-11T14:30:00Z', priority: 'low',
      title: '529 contributions: maximize before tax deadline',
      body: 'California allows state tax deduction for 529 contributions. Consider maximizing contributions for both Ethan and Mia before April 15. CA deduction up to $10K/yr per beneficiary for MFJ.',
      relatedAssets: ['529-kid1', '529-kid2'], category: 'tax', dismissed: false
    },
    {
      id: 'sig-006', timestamp: '2026-02-11T10:00:00Z', priority: 'medium',
      title: 'NVIDIA earnings next week (Feb 18)',
      body: 'NVDA reports Q4 earnings on Feb 18. Current position is up 86%. Consider trimming 10-20% before earnings to lock in gains, or hold through if you are bullish on guidance.',
      relatedAssets: ['nvda'], category: 'earnings', dismissed: false
    },
    {
      id: 'sig-007', timestamp: '2026-02-10T20:00:00Z', priority: 'low',
      title: 'Macro: Fed rate decision in March',
      body: 'The Federal Reserve meets March 18-19. Markets pricing 65% chance of rate hold. This could impact your growth stocks, crypto, and mortgage refi opportunities.',
      relatedAssets: [], category: 'macro', dismissed: true
    }
  ]
};

// --- Feed ---
const feed = {
  items: [
    { id: 'f-001', source: 'Bloomberg', headline: 'Google Parent Alphabet Reports Record Cloud Revenue', summary: 'Google Cloud revenue surged 35% YoY to $12.4B, driven by AI workloads. Alphabet shares rose 3% in after-hours trading.', url: '#', timestamp: '2026-02-12T08:00:00Z', category: 'earnings', relevanceScore: 10 },
    { id: 'f-002', source: 'Reuters', headline: 'NVIDIA Set to Report Q4 Earnings Amid AI Spending Boom', summary: 'Analysts expect NVIDIA to post record revenue of $38.5B, driven by surging demand for AI training chips from hyperscalers.', url: '#', timestamp: '2026-02-12T07:30:00Z', category: 'earnings', relevanceScore: 9 },
    { id: 'f-003', source: 'CNBC', headline: 'Bay Area Home Prices Hit New Record in January 2026', summary: 'Median home price in Santa Clara County reached $2.1M, up 8% YoY. Cupertino and Palo Alto led gains driven by tech sector demand.', url: '#', timestamp: '2026-02-12T06:00:00Z', category: 'macro', relevanceScore: 9 },
    { id: 'f-004', source: 'TechCrunch', headline: 'AI Supply Chain Startup NexaFlow Enters Series A Discussions', summary: 'NexaFlow, which uses AI to optimize supply chain logistics, is reportedly in talks with Tier 1 VCs for a $30M Series A round.', url: '#', timestamp: '2026-02-11T06:00:00Z', category: 'angel-investment', relevanceScore: 10 },
    { id: 'f-005', source: 'WSJ', headline: 'Meta Revenue Jumps 22% as AI Ad Targeting Boosts Results', summary: 'Meta Platforms reported better-than-expected quarterly results, with AI-driven ad recommendations driving higher engagement and revenue per user.', url: '#', timestamp: '2026-02-11T20:00:00Z', category: 'earnings', relevanceScore: 9 },
    { id: 'f-006', source: 'CoinDesk', headline: 'Bitcoin Falls Below $98K as Crypto Market Faces Profit-Taking', summary: 'Major cryptocurrencies declined overnight as traders locked in gains from the recent rally. BTC dropped 3.2% while ETH fell 1.8%.', url: '#', timestamp: '2026-02-11T08:00:00Z', category: 'crypto', relevanceScore: 8 },
    { id: 'f-007', source: 'Bloomberg', headline: 'Tesla Robotaxi Approval Expected in Austin by Q2 2026', summary: 'Regulatory sources indicate Tesla may receive its first autonomous ride-hailing permit in Austin, Texas, as early as April.', url: '#', timestamp: '2026-02-10T18:30:00Z', category: 'earnings', relevanceScore: 7 },
    { id: 'f-008', source: 'CNBC', headline: 'Fed Officials Signal Patience on Rate Cuts Amid Sticky Inflation', summary: 'Federal Reserve governors emphasized data dependency, suggesting rate cuts may be delayed until clear evidence of inflation returning to target.', url: '#', timestamp: '2026-02-10T05:45:00Z', category: 'macro', relevanceScore: 7 },
    { id: 'f-009', source: 'Financial Times', headline: 'California Expands 529 Plan Tax Benefits for 2026', summary: 'California now allows state income tax deductions up to $10,000 per beneficiary for 529 plan contributions, effective for tax year 2026.', url: '#', timestamp: '2026-02-10T16:00:00Z', category: 'macro', relevanceScore: 8 },
    { id: 'f-010', source: 'CoinDesk', headline: 'Solana DeFi TVL Hits All-Time High of $18B', summary: 'Solana ecosystem DeFi protocols reached record total value locked, with Raydium and Marinade leading the charge.', url: '#', timestamp: '2026-02-10T22:00:00Z', category: 'crypto', relevanceScore: 7 },
    { id: 'f-011', source: 'TechCrunch', headline: 'Decentralized Identity Startup VaultEdge Joins Y Combinator W26', summary: 'VaultEdge, building privacy-preserving identity verification for fintech, was accepted into Y Combinator Winter 2026 batch.', url: '#', timestamp: '2026-02-10T10:00:00Z', category: 'angel-investment', relevanceScore: 9 },
    { id: 'f-012', source: 'WSJ', headline: 'Private Markets See Record Dry Powder at $4.2 Trillion', summary: 'PE and VC firms are sitting on unprecedented levels of uninvested capital, with AI and climate tech attracting the most interest.', url: '#', timestamp: '2026-02-09T10:00:00Z', category: 'macro', relevanceScore: 5 }
  ]
};

// --- Watchlist ---
const watchlist = {
  items: [
    { id: 'w-goog', name: 'Alphabet Inc.', ticker: 'GOOGL', category: 'stocks', currentPrice: 185.00, change24h: 1.2, note: 'Employer stock — monitor for ESPP timing and RSU vest windows' },
    { id: 'w-avax', name: 'Avalanche', ticker: 'AVAX', category: 'crypto', currentPrice: 42.80, change24h: -1.2, note: 'Potential L1 diversification play' },
    { id: 'w-pltr', name: 'Palantir', ticker: 'PLTR', category: 'stocks', currentPrice: 78.50, change24h: 4.1, note: 'Government AI contracts expanding. Valuation concern.' },
    { id: 'w-schd', name: 'Schwab US Dividend Equity', ticker: 'SCHD', category: 'stocks', currentPrice: 82.30, change24h: 0.3, note: 'Dividend ETF for passive income. Consider for taxable account.' }
  ]
};

// --- Tax Summary ---
const taxSummary = {
  taxYear: 2026,
  jurisdiction: 'US',
  realizedGains: 45708,
  realizedLosses: -3200,
  netRealizedGainLoss: 42508,
  unrealizedGains: 603542,
  unrealizedLosses: -27000,
  estimatedTaxLiability: 15250,
  longTermRate: 0.15,
  shortTermRate: 0.32,
  taxLossHarvestingOpportunities: [
    { asset: 'TSLA', currentLoss: 0, potentialSavings: 0, note: 'Monitor for short-term dips below cost basis' }
  ],
  taxableEvents: [
    { date: '2026-01-15', type: 'sell', asset: 'TSLA', shares: 20, amount: 7800, costBasis: 3900, gain: 3900, term: 'long' },
    { date: '2026-01-22', type: 'sell', asset: 'ETH', units: 5, amount: 16200, costBasis: 11000, gain: 5200, term: 'short' },
    { date: '2026-02-01', type: 'sell', asset: 'BTC', units: 0.5, amount: 50000, costBasis: 21000, gain: 29000, term: 'long' },
    { date: '2026-02-05', type: 'sell', asset: 'META', shares: 10, amount: 5800, costBasis: 2800, gain: 3000, term: 'long' },
    { date: '2026-01-10', type: 'sell', asset: 'SOL', units: 50, amount: 8500, costBasis: 2250, gain: 6250, term: 'short' },
    { date: '2026-01-28', type: 'loss', asset: 'AVAX', units: 100, amount: 3800, costBasis: 7000, gain: -3200, term: 'short' }
  ],
  notes: 'California state income tax applies on all gains. Consider harvesting losses before year-end. RSU vesting creates ordinary income — withholding may be insufficient.'
};

// --- Profile ---
const profile = {
  personal: {
    name: 'Alex Chen',
    occupation: 'Software Engineer',
    company: 'Google',
    yearsOfExperience: 10,
    title: 'Senior Software Engineer (L5)'
  },
  family: {
    spouse: 'Emily Chen',
    children: [
      { name: 'Ethan', age: 5 },
      { name: 'Mia', age: 3 }
    ]
  },
  location: {
    country: 'US',
    state: 'CA',
    city: 'Cupertino',
    zipCode: '95014',
    fullAddress: '10500 Vista Dr, Cupertino, CA 95014'
  },
  tax: {
    filingStatus: 'married-joint',
    dependents: 2,
    federalTaxBracket: 0.32,
    stateTaxRate: 0.093,
    longTermCapitalGainsRate: 0.15,
    shortTermCapitalGainsRate: 0.32,
    niit: 0.038,
    niitThreshold: 250000,
    standardDeduction: 32200,
    contributionLimits: {
      traditional401k: 24500,
      catchUp401k: 0,
      ira: 7500,
      catchUpIRA: 0,
      hsaSelf: 4400,
      hsaFamily: 8750
    },
    notes: 'California resident — 9.3% state income tax. Federal bracket 32% (MFJ, ~$383K-$487K). NIIT applies at $250K MAGI threshold for MFJ. Google 401(k) match up to $9,500. Previously at Meta — has vested META shares. 2026 rates web-verified.'
  },
  accounts: [
    { id: 'acct-chase-checking', name: 'Chase Checking', type: 'checking', institution: 'Chase' },
    { id: 'acct-schwab-brokerage', name: 'Schwab Brokerage', type: 'taxable', institution: 'Charles Schwab' },
    { id: 'acct-fidelity-roth', name: 'Fidelity Roth IRA', type: 'roth-ira', institution: 'Fidelity' },
    { id: 'acct-google-401k', name: 'Google 401(k)', type: 'traditional-401k', institution: 'Vanguard' },
    { id: 'acct-fidelity-hsa', name: 'Health Savings Account', type: 'hsa', institution: 'Fidelity' },
    { id: 'acct-marcus-savings', name: 'Marcus HYSA', type: 'savings', institution: 'Goldman Sachs' },
    { id: 'acct-coinbase', name: 'Coinbase', type: 'taxable', institution: 'Coinbase' },
    { id: 'acct-etrade', name: 'E*TRADE Equity', type: 'taxable', institution: 'E*TRADE' },
    { id: 'acct-529-ethan', name: '529 Plan — Ethan', type: '529', institution: 'Vanguard' },
    { id: 'acct-529-mia', name: '529 Plan — Mia', type: '529', institution: 'Vanguard' }
  ],
  lastUpdated: '2026-02-12T00:00:00Z'
};

// --- Categories config ---
const categoriesConfig = {
  assetClasses: {
    liquid: { label: 'Liquid Assets', categories: ['cash', 'savings'] },
    'public-markets': { label: 'Public Markets', categories: ['stocks', 'crypto'] },
    'private-equity': { label: 'Private Equity', categories: ['angel-investment'] },
    'employee-equity': { label: 'Employee Equity', categories: ['employee-equity'] },
    fixed: { label: 'Fixed Assets', categories: ['real-estate'] },
    personal: { label: 'Personal Assets', categories: ['vehicles', 'jewelry', 'art'] }
  },
  liabilityClasses: {
    'short-term': { label: 'Short-Term Liabilities', categories: ['credit-cards'] },
    'long-term': { label: 'Long-Term Liabilities', categories: ['mortgage', 'auto-loan', 'student-loan'] }
  },
  accountTypes: {
    '529': { label: '529 Plan', taxTreatment: 'tax-advantaged', description: 'Tax-free growth for qualified education expenses' },
    taxable: { label: 'Taxable', taxTreatment: 'taxable', description: 'Standard brokerage account — gains taxed when realized' },
    'traditional-ira': { label: 'Traditional IRA', taxTreatment: 'tax-deferred', description: 'Tax-deferred — contributions may be deductible, withdrawals taxed as income' },
    'roth-ira': { label: 'Roth IRA', taxTreatment: 'tax-exempt', description: 'Tax-exempt growth — qualified withdrawals are tax-free' },
    'traditional-401k': { label: '401(k)', taxTreatment: 'tax-deferred', description: 'Employer-sponsored tax-deferred retirement account' },
    'roth-401k': { label: 'Roth 401(k)', taxTreatment: 'tax-exempt', description: 'After-tax contributions, tax-free qualified withdrawals' },
    hsa: { label: 'HSA', taxTreatment: 'tax-advantaged', description: 'Triple tax-advantaged — deductible contributions, tax-free growth and medical withdrawals' },
    direct: { label: 'Direct', taxTreatment: 'varies', description: 'Directly held asset — tax treatment varies by type' },
    checking: { label: 'Checking', taxTreatment: 'taxable', description: 'Bank checking account — interest taxable' },
    savings: { label: 'Savings', taxTreatment: 'taxable', description: 'Savings account — interest taxable as ordinary income' }
  },
  categoryMeta: {
    cash: { label: 'Cash & Checking', color: '#8a9178' },
    savings: { label: 'Savings & CDs', color: '#7d9470' },
    stocks: { label: 'Stocks', color: '#5b7e4a' },
    crypto: { label: 'Crypto', color: '#7d8471' },
    'angel-investment': { label: 'Angel Investment', color: '#a4ac86' },
    'employee-equity': { label: 'Employee Equity', color: '#4a7c59' },
    'real-estate': { label: 'Real Estate', color: '#6b7d5e' },
    vehicles: { label: 'Vehicles', color: '#6e8b5e' },
    jewelry: { label: 'Jewelry', color: '#9a8c6e' },
    art: { label: 'Art & Collectibles', color: '#8b7d6b' },
    'credit-cards': { label: 'Credit Cards', color: '#b5443b' },
    mortgage: { label: 'Mortgage', color: '#8b5e3c' },
    'auto-loan': { label: 'Auto Loan', color: '#a0734f' },
    'student-loan': { label: 'Student Loan', color: '#7d6b5e' },
    taxable: { label: 'Taxable', color: '#b5443b' },
    'traditional-ira': { label: 'Traditional IRA', color: '#a0734f' },
    'roth-ira': { label: 'Roth IRA', color: '#3d7a3d' },
    'traditional-401k': { label: '401(k)', color: '#a0734f' },
    'roth-401k': { label: 'Roth 401(k)', color: '#3d7a3d' },
    hsa: { label: 'HSA', color: '#2d4a2b' },
    '529': { label: '529 Plan', color: '#6b7d5e' },
    direct: { label: 'Direct', color: '#7d8471' },
    checking: { label: 'Checking', color: '#8a9178' }
  }
};

// --- Write all ---
console.log('\nSeeding Capiis data (Bay Area family template)...\n');

writeJSON('categories.json', categoriesConfig);

// Asset xlsx
writeExcel('stocks.xlsx', stocks);
writeExcel('crypto.xlsx', crypto);
writeExcel('angel-investment.xlsx', angelInvestment);
writeExcel('employee-equity.xlsx', employeeEquity);
writeExcel('real-estate.xlsx', realEstate);
writeExcel('cash.xlsx', cash);
writeExcel('savings.xlsx', savings);
writeExcel('vehicles.xlsx', vehicles);
writeExcel('jewelry.xlsx', jewelry);
writeExcel('art.xlsx', art);

// Liability xlsx
writeExcelLiability('credit-cards.xlsx', creditCards);
writeExcelLiability('mortgage.xlsx', mortgage);
writeExcelLiability('auto-loan.xlsx', autoLoan);
writeExcelLiability('student-loan.xlsx', studentLoan);

// JSON
writeJSON('signals.json', signals);
writeJSON('feed.json', feed);
writeJSON('watchlist.json', watchlist);
writeJSON('tax-summary.json', taxSummary);
writeJSON('profile.json', profile);

console.log('\nDone. Alex Chen family (Cupertino, CA) template seeded.\n');
```

**Step 2: Run and verify**

Run: `node ~/Desktop/Capiis/scripts/seed-data.js`

Expected: 20 files written, "Alex Chen family (Cupertino, CA) template seeded."

Verify: `curl -s http://localhost:3333/api/profile | python3 -m json.tool | head -20` should show Google, Cupertino, married-joint.

Verify: `curl -s http://localhost:3333/api/stats | python3 -m json.tool` should show ~$3.6M total assets, ~$1.79M liabilities, ~$1.86M net worth.

**Step 3: Commit**

```bash
git add scripts/seed-data.js
git commit -m "feat: rewrite seed data with Bay Area Chinese tech family template"
```

---

### Task 4: Create `.claude/commands/capiis-data.md` (routing only)

**Files:**
- Create: `.claude/commands/capiis-data.md`

The slash command handles routing and the `clear`/`template` subcommands directly. The `setup` subcommand delegates to the `capiis-onboarding` skill (Task 5).

**Step 1: Write the slash command**

```markdown
---
description: Manage Capiis data — clear, import template, or guided setup
allowed-tools: Bash(node:*), Bash(npm:*), Bash(curl:*), Bash(ls:*), Bash(rm:*), Bash(lsof:*)
---

# /capiis-data — Data Management

Manage data for the Capiis wealth & asset management dashboard.

The Capiis project lives at `~/Desktop/Capiis`. Data files are in `~/Desktop/Capiis/data/`.

## Routing

Based on $ARGUMENTS:

- **clear**: Go to [Clear Data](#clear-data)
- **template**: Go to [Import Template](#import-template)
- **setup**: Invoke the `capiis-onboarding` skill, then follow its instructions
- **No arguments**: Use AskUserQuestion to show a menu:
  - "What would you like to do with your Capiis data?"
  - Options:
    1. "Clear all data" — wipe everything and start fresh
    2. "Import template" — load demo data (Bay Area family)
    3. "Guided setup" — enter your own data step by step
  - Then route to the appropriate section based on the user's choice.

---

## Clear Data

1. Use AskUserQuestion to confirm:
   - Question: "This will delete ALL data in data/ (profile, assets, liabilities, tax, signals, feed, watchlist). categories.json (schema) and empty xlsx shells will be preserved. Please back up to iCloud / Google Drive first. Proceed?"
   - Options: "Cancel — keep my data" (first/default) / "Confirm — clear everything"

2. If user cancels, stop and say "No changes made."

3. If confirmed, run:
   ```
   node ~/Desktop/Capiis/scripts/clear-data.js
   ```

4. Report:
   - "Data cleared. Empty xlsx templates preserved in data/ with column headers."
   - Suggest: "Use `/capiis-data template` to load demo data, or `/capiis-data setup` to enter your own."

---

## Import Template

1. Check if data/ already has user data:
   - Check if `~/Desktop/Capiis/data/profile.json` exists and has a `personal.name` value
   - If existing data found, use AskUserQuestion:
     - "Existing data detected. Importing the template will OVERWRITE all current data with the demo portfolio (Alex Chen family, Cupertino CA). Continue?"
     - Options: "Cancel" / "Overwrite and import"

2. If confirmed (or no existing data), run:
   ```
   node ~/Desktop/Capiis/scripts/seed-data.js
   ```

3. Report: "Template imported — Alex Chen family, Senior SWE @ Google, Cupertino CA. Net worth ~$1.86M across 28 positions."
4. Ask: "Want to open the dashboard? (`/capiis`)"
```

**Step 2: Verify**

Run: `ls -la ~/Desktop/Capiis/.claude/commands/capiis-data.md`

Expected: file exists.

**Step 3: Commit**

```bash
git add .claude/commands/capiis-data.md
git commit -m "feat: add /capiis-data slash command (routing + clear + template)"
```

---

### Task 5: Create `skills/capiis-onboarding/` skill

**Files:**
- Create: `skills/capiis-onboarding/SKILL.md`
- Create: `skills/capiis-onboarding/references/data-schema.md` (copy from `skills/capiis-portfolio/references/asset-schema.md` with additions)

**Step 1: Create the skill directory**

```bash
mkdir -p ~/Desktop/Capiis/skills/capiis-onboarding/references
```

**Step 2: Create `references/data-schema.md`**

Copy the existing `skills/capiis-portfolio/references/asset-schema.md` content, then append the liability schema and profile schema. This gives the onboarding skill full awareness of all data formats.

```markdown
# Capiis Data Schemas

## Portfolio Data (Excel)

Portfolio data lives in `data/*.xlsx` files. Each file represents one asset category (filename = category). The server reads these on every API request via `lib/excel.js`.

**To manage portfolio data, use Claude Code's built-in xlsx skill to read/write the Excel files directly.**

### Asset Excel Column Schema

Each asset `.xlsx` file has a single sheet named "Holdings" with these columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | yes | Unique lowercase ID (e.g., aapl, btc, startup-nexaflow) |
| `name` | string | yes | Full asset name |
| `ticker` | string | yes | Ticker symbol, or PRIVATE for angel investments |
| `quantity` | number | yes | Number of shares/coins/units |
| `avgCost` | number | yes | Average cost per unit (total investment for angel investments) |
| `currentPrice` | number | yes | Current price per unit (estimated value for angel investments) |
| `notes` | string | yes | Investment thesis or notes |
| `accountType` | string | no | Account type: taxable, roth-ira, traditional-401k, hsa, 529, etc. Defaults to "taxable" |
| `accountName` | string | no | Human-readable account name (e.g., "Schwab Brokerage") |
| `costBasis` | number | no | Total cost basis. Defaults to quantity * avgCost |
| `purchaseDate` | string | no | ISO date of purchase (e.g., "2023-03-15") |
| `lastUpdated` | string | no | ISO date when the row was last updated |

### Employee Equity Additional Columns

These columns are specific to `employee-equity.xlsx`:

| Column | Type | Description |
|--------|------|-------------|
| `equityType` | string | RSU, ISO, or ESPP |
| `grantDate` | string | ISO date of the grant |
| `vestingSchedule` | string | Human-readable (e.g., "4yr quarterly", "4yr with 1yr cliff") |
| `strikePrice` | number | Strike/exercise price (0 for RSUs) |
| `fmvAtGrant` | number | Fair market value per share at grant date |

### Liability Excel Column Schema

Each liability `.xlsx` file has a single sheet named "Liabilities" with these columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | yes | Unique lowercase ID (e.g., amex-plat, cupertino-mortgage) |
| `name` | string | yes | Full liability name |
| `type` | string | yes | Revolving, Fixed 30yr, Fixed 60mo, etc. |
| `originalAmount` | number | yes | Original loan/credit amount (0 for revolving credit) |
| `currentBalance` | number | yes | Current outstanding balance |
| `interestRate` | number | yes | Annual interest rate as percentage (e.g., 6.75) |
| `monthlyPayment` | number | yes | Monthly payment amount |
| `dueDate` | string | yes | Maturity date or next payment date (ISO date) |
| `notes` | string | yes | Additional notes |

### Asset Files

| File | Category |
|------|----------|
| `stocks.xlsx` | stocks |
| `crypto.xlsx` | crypto |
| `angel-investment.xlsx` | angel-investment |
| `employee-equity.xlsx` | employee-equity |
| `real-estate.xlsx` | real-estate |
| `cash.xlsx` | cash |
| `savings.xlsx` | savings |
| `vehicles.xlsx` | vehicles |
| `jewelry.xlsx` | jewelry |
| `art.xlsx` | art |

### Liability Files

| File | Category |
|------|----------|
| `credit-cards.xlsx` | credit-cards |
| `mortgage.xlsx` | mortgage |
| `auto-loan.xlsx` | auto-loan |
| `student-loan.xlsx` | student-loan |

## profile.json Schema

```json
{
  "personal": {
    "name": "string",
    "occupation": "string",
    "company": "string",
    "yearsOfExperience": "number",
    "title": "string"
  },
  "family": {
    "spouse": "string (optional)",
    "children": [
      { "name": "string", "age": "number" }
    ]
  },
  "location": {
    "country": "string (e.g., US)",
    "state": "string (e.g., CA)",
    "city": "string",
    "zipCode": "string",
    "fullAddress": "string"
  },
  "tax": {
    "filingStatus": "single | married-joint | married-separate | head-of-household",
    "dependents": "number",
    "federalTaxBracket": "decimal (e.g., 0.32)",
    "stateTaxRate": "decimal (e.g., 0.093 for California)",
    "longTermCapitalGainsRate": "decimal",
    "shortTermCapitalGainsRate": "decimal",
    "niit": "decimal (Net Investment Income Tax, 0.038)",
    "niitThreshold": "number (250000 for MFJ, 200000 for single)",
    "standardDeduction": "number",
    "contributionLimits": {
      "traditional401k": "number",
      "catchUp401k": "number",
      "ira": "number",
      "catchUpIRA": "number",
      "hsaSelf": "number",
      "hsaFamily": "number"
    },
    "notes": "string"
  },
  "accounts": [
    {
      "id": "acct-{slug}",
      "name": "string",
      "type": "checking | savings | taxable | roth-ira | traditional-ira | traditional-401k | roth-401k | hsa | 529 | direct",
      "institution": "string"
    }
  ],
  "lastUpdated": "ISO 8601"
}
```

## Account Types

| Type | Tax Treatment |
|------|--------------|
| `taxable` | Gains taxed when realized |
| `roth-ira` | Tax-exempt growth, qualified withdrawals tax-free |
| `traditional-401k` | Tax-deferred, contributions may reduce taxable income |
| `traditional-ira` | Tax-deferred |
| `roth-401k` | After-tax contributions, tax-free qualified withdrawals |
| `hsa` | Triple tax-advantaged (deductible, tax-free growth, tax-free medical) |
| `529` | Tax-free growth for qualified education expenses |
| `direct` | Directly held, tax varies |
| `checking` | Bank account, interest taxable |
| `savings` | Savings account, interest taxable |
```

**Step 3: Create `SKILL.md`**

```markdown
---
name: capiis-onboarding
description: Guide users through setting up their financial data in the Capiis wealth management dashboard. Triggers when the user wants to enter their personal profile, assets, liabilities, or financial accounts — either through conversation or by importing files (xlsx, pdf, docs, csv, txt). Also triggers on "/capiis-data setup" or when the user says things like "help me set up my portfolio" or "I want to enter my financial data".
---

# Capiis Onboarding — Guided Data Setup

Walk the user through entering all their financial data into Capiis, one step at a time.

## Data Location

All data files live in `~/Desktop/Capiis/data/`. See `references/data-schema.md` for complete schemas.

## Before Starting: Resume Detection

Check what data already exists:

1. Read `~/Desktop/Capiis/data/profile.json`
   - If it has `personal.name` → Phase 1 (Profile) is likely complete
   - If it has a non-empty `accounts` array → Phase 2 (Accounts) is likely complete
2. List xlsx files in `~/Desktop/Capiis/data/` and check which have data rows beyond the header
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
- Write `~/Desktop/Capiis/data/profile.json` with personal, family (if applicable), location, and tax sections
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
     - `.xlsx` / `.csv` → read with xlsx skill, map columns to Capiis schema
     - `.pdf` → read with Read tool (PDF support is built-in)
     - `.docx` → read with built-in docs skill
     - `.txt` / `.md` → read as plain text, parse structured content
   - Show the extracted data as a table for the user to review
   - Ask user to confirm before writing
   - User can say "fix row 3" or "remove that one" before confirming

5. Write confirmed data to `~/Desktop/Capiis/data/{category}.xlsx` using the xlsx skill
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

Write to `~/Desktop/Capiis/data/{liability}.xlsx`.

**Liability order:**

| # | Category | Prompt |
|---|----------|--------|
| 1 | mortgage | "Do you have a mortgage?" |
| 2 | auto-loan | "Any auto loans?" |
| 3 | student-loan | "Any student loans?" |
| 4 | credit-cards | "Any credit card balances? (include cards you pay in full monthly)" |

## Phase 5: Complete

1. Check if Capiis server is running: `lsof -ti:3333`
   - If not running, start it: `node ~/Desktop/Capiis/server.js &` and wait 2 seconds

2. Fetch portfolio summary: `curl -s http://localhost:3333/api/stats`
   - Display: total assets, total liabilities, net worth, positions count, allocation breakdown

3. Use AskUserQuestion: "Your portfolio is set up! What would you like to do?"
   - "Open dashboard" → `open http://localhost:3333`
   - "Add more data later" → remind about `/capiis-data setup`
   - "Done for now"

## Important Rules

- **One question per message.** Never ask multiple questions at once.
- **Write data after each phase/category.** Never batch all writes to the end.
- **User can go back.** If they say "I want to redo my stocks" or "go back to profile", honor it.
- **Accept approximations.** If user says "about 100 shares, not sure of exact cost", accept it and add a note.
- **Confirm before writing files.** Especially for file imports — always show parsed data first.
- **Preserve existing data.** When updating profile.json, read first, merge changes, write back. Don't overwrite unrelated fields.
```

**Step 4: Verify**

Run: `ls -la ~/Desktop/Capiis/skills/capiis-onboarding/`

Expected: SKILL.md and references/data-schema.md exist.

**Step 5: Commit**

```bash
git add skills/capiis-onboarding/
git commit -m "feat: add capiis-onboarding skill for guided data setup"
```

---

### Task 6: Integration verification

**Step 1: Test clear**

Run: `node ~/Desktop/Capiis/scripts/clear-data.js`

Verify:
- `ls ~/Desktop/Capiis/data/` shows 14 xlsx + categories.json
- `curl -s http://localhost:3333/api/portfolio` returns 404 (no data rows)
- `curl -s http://localhost:3333/api/profile` returns 404

**Step 2: Test template**

Run: `node ~/Desktop/Capiis/scripts/seed-data.js`

Verify:
- `curl -s http://localhost:3333/api/profile | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['personal']['company'])"` prints "Google"
- `curl -s http://localhost:3333/api/stats | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Net worth: ${d[\"netWorth\"]:,.0f}')"` prints approximately "Net worth: $1,858,000"
- Dashboard at http://localhost:3333 shows updated data

**Step 3: Test profile.json has family field**

Run: `curl -s http://localhost:3333/api/profile | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('family', {}))"` should show spouse and children.

Note: server.js already serves profile.json as-is, so the new `family` field is automatically available.

**Step 4: Final commit**

Only if any fixes were needed during verification.
