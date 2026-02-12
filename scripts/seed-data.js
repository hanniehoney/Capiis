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
  // Check if any row has equity-specific fields
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
      lastUpdated: r.lastUpdated || '2026-02-11'
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

// --- Stocks ---
const stocks = [
  {
    id: 'aapl', name: 'Apple Inc.', ticker: 'AAPL',
    quantity: 150, avgCost: 178.50, currentPrice: 242.30,
    notes: 'Long-term hold. Services revenue accelerating.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2023-03-15', lastUpdated: '2026-02-11'
  },
  {
    id: 'nvda', name: 'NVIDIA Corp.', ticker: 'NVDA',
    quantity: 80, avgCost: 485.00, currentPrice: 892.50,
    notes: 'AI infrastructure leader. High conviction.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-06-20', lastUpdated: '2026-02-11'
  },
  {
    id: 'msft', name: 'Microsoft', ticker: 'MSFT',
    quantity: 100, avgCost: 310.00, currentPrice: 445.80,
    notes: 'Cloud + AI play. Azure growth strong.',
    accountType: 'traditional-401k', accountName: 'Company 401(k)', purchaseDate: '2022-01-10', lastUpdated: '2026-02-11'
  },
  {
    id: 'tsla', name: 'Tesla Inc.', ticker: 'TSLA',
    quantity: 60, avgCost: 195.00, currentPrice: 385.20,
    notes: 'Robotaxi catalyst pending. Volatile.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2024-02-28', lastUpdated: '2026-02-11'
  },
  {
    id: 'amzn', name: 'Amazon', ticker: 'AMZN',
    quantity: 90, avgCost: 145.00, currentPrice: 228.60,
    notes: 'AWS margins expanding. Advertising segment growing.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-09-05', lastUpdated: '2026-02-11'
  }
];

// --- Crypto ---
const crypto = [
  {
    id: 'btc', name: 'Bitcoin', ticker: 'BTC',
    quantity: 2.5, avgCost: 42000, currentPrice: 97500,
    notes: 'Core crypto position. DCA strategy. Halving cycle thesis.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2022-11-15', lastUpdated: '2026-02-11'
  },
  {
    id: 'eth', name: 'Ethereum', ticker: 'ETH',
    quantity: 25, avgCost: 2200, currentPrice: 3180,
    notes: 'Layer 1 ecosystem. Staking yield ~4%. Long-term hold.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2023-01-10', lastUpdated: '2026-02-11'
  },
  {
    id: 'sol', name: 'Solana', ticker: 'SOL',
    quantity: 200, avgCost: 45, currentPrice: 185,
    notes: 'High-performance L1. DeFi/NFT ecosystem growth.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2023-08-22', lastUpdated: '2026-02-11'
  }
];

// --- Angel Investment ---
const angelInvestment = [
  {
    id: 'startup-nexaflow', name: 'NexaFlow', ticker: 'PRIVATE',
    quantity: 1, avgCost: 50000, currentPrice: 120000,
    notes: 'Seed round. AI-powered supply chain. Est. valuation $12M. 1% equity.',
    accountType: 'taxable', accountName: 'Direct Investment', purchaseDate: '2023-04-01', lastUpdated: '2026-02-11'
  },
  {
    id: 'startup-carbonlens', name: 'CarbonLens', ticker: 'PRIVATE',
    quantity: 1, avgCost: 75000, currentPrice: 95000,
    notes: 'Series A. Carbon credit marketplace. Est. valuation $25M. 0.38% equity.',
    accountType: 'taxable', accountName: 'Direct Investment', purchaseDate: '2024-01-15', lastUpdated: '2026-02-11'
  },
  {
    id: 'startup-vaultedge', name: 'VaultEdge', ticker: 'PRIVATE',
    quantity: 1, avgCost: 25000, currentPrice: 25000,
    notes: 'Pre-seed. Decentralized identity for fintech. Earliest stage, highest risk.',
    accountType: 'taxable', accountName: 'Direct Investment', purchaseDate: '2025-06-01', lastUpdated: '2026-02-11'
  }
];

// --- Employee Equity ---
const employeeEquity = [
  {
    id: 'eq-rsu', name: 'TechCorp RSUs', ticker: 'TCORP',
    quantity: 500, avgCost: 0, currentPrice: 185,
    notes: 'Vesting quarterly over 4 years. Next vest: Apr 2026.',
    accountType: 'taxable', accountName: 'E*TRADE Equity', purchaseDate: '2024-03-01', lastUpdated: '2026-02-11',
    equityType: 'RSU', grantDate: '2024-03-01', vestingSchedule: '4yr quarterly', strikePrice: 0, fmvAtGrant: 165
  },
  {
    id: 'eq-iso', name: 'TechCorp ISOs', ticker: 'TCORP',
    quantity: 1000, avgCost: 120, currentPrice: 185,
    notes: 'ISO grant. Strike $120. Exercisable after 1yr cliff.',
    accountType: 'taxable', accountName: 'E*TRADE Equity', purchaseDate: '2023-06-15', lastUpdated: '2026-02-11',
    equityType: 'ISO', grantDate: '2023-06-15', vestingSchedule: '4yr with 1yr cliff', strikePrice: 120, fmvAtGrant: 120
  },
  {
    id: 'eq-espp', name: 'TechCorp ESPP', ticker: 'TCORP',
    quantity: 200, avgCost: 140, currentPrice: 185,
    notes: 'ESPP shares purchased at 15% discount. 6-month lookback.',
    accountType: 'taxable', accountName: 'E*TRADE Equity', purchaseDate: '2025-06-30', lastUpdated: '2026-02-11',
    equityType: 'ESPP', grantDate: '2025-01-01', vestingSchedule: '6mo purchase period', strikePrice: 140, fmvAtGrant: 165
  }
];

// --- Real Estate ---
const realEstate = [
  {
    id: 're-taipei-apt', name: 'Taipei Apartment (Da\'an)', ticker: 'RE-TPE',
    quantity: 1, avgCost: 320000, currentPrice: 385000,
    notes: '2BR in Da\'an District. Rental yield ~2.8%. Purchased 2022.',
    accountType: 'direct', accountName: 'Direct Ownership', purchaseDate: '', lastUpdated: '2026-02-11'
  },
  {
    id: 're-austin-house', name: 'Austin Rental House', ticker: 'RE-ATX',
    quantity: 1, avgCost: 450000, currentPrice: 520000,
    notes: 'Single-family rental in East Austin. Rental yield ~5.1%. Purchased 2023.',
    accountType: 'direct', accountName: 'Direct Ownership', purchaseDate: '', lastUpdated: '2026-02-11'
  },
  {
    id: 're-reit-vanguard', name: 'Vanguard Real Estate ETF', ticker: 'VNQ',
    quantity: 300, avgCost: 82.50, currentPrice: 91.20,
    notes: 'Broad REIT exposure. Dividend yield ~3.8%.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2024-01-15', lastUpdated: '2026-02-11'
  }
];

// --- Cash ---
const cash = [
  {
    id: 'chase-checking', name: 'Chase Checking', ticker: 'CASH',
    quantity: 1, avgCost: 24500, currentPrice: 24500,
    notes: 'Primary checking account.',
    accountType: 'checking', accountName: 'Chase Checking', purchaseDate: '', lastUpdated: '2026-02-11'
  },
  {
    id: 'schwab-cash', name: 'Schwab Brokerage Cash', ticker: 'CASH',
    quantity: 1, avgCost: 8200, currentPrice: 8200,
    notes: 'Brokerage sweep account.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '', lastUpdated: '2026-02-11'
  }
];

// --- Savings ---
const savings = [
  {
    id: 'marcus-hysa', name: 'Marcus HYSA', ticker: 'HYSA',
    quantity: 1, avgCost: 51200, currentPrice: 51200,
    notes: 'High-yield savings. APY 4.5%.',
    accountType: 'savings', accountName: 'Marcus HYSA', purchaseDate: '', lastUpdated: '2026-02-11'
  },
  {
    id: 'cd-12mo', name: '12-Month CD', ticker: 'CD',
    quantity: 1, avgCost: 25750, currentPrice: 25750,
    notes: 'Matures Aug 2026. APY 4.8%.',
    accountType: 'savings', accountName: 'Marcus HYSA', purchaseDate: '', lastUpdated: '2026-02-11'
  }
];

// --- Vehicles ---
const vehicles = [
  {
    id: 'tesla-model3', name: 'Tesla Model 3', ticker: 'VEHICLE',
    quantity: 1, avgCost: 42000, currentPrice: 35500,
    notes: '2024 Model 3 Long Range. Purchased new.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '', lastUpdated: '2026-02-11'
  }
];

// --- Jewelry ---
const jewelry = [
  {
    id: 'rolex-sub', name: 'Rolex Submariner', ticker: 'WATCH',
    quantity: 1, avgCost: 12800, currentPrice: 16200,
    notes: 'Ref. 126610LN. Purchased 2023. Appreciating.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '', lastUpdated: '2026-02-11'
  },
  {
    id: 'diamond-ring', name: 'Diamond Engagement Ring', ticker: 'JEWEL',
    quantity: 1, avgCost: 8500, currentPrice: 7200,
    notes: '1.5ct round brilliant. Appraised value.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '', lastUpdated: '2026-02-11'
  }
];

// --- Art ---
const art = [
  {
    id: 'kaws-companion', name: 'KAWS Companion', ticker: 'ART',
    quantity: 1, avgCost: 3200, currentPrice: 4800,
    notes: 'Open Edition. Secondary market value.',
    accountType: 'direct', accountName: 'Personal Property', purchaseDate: '', lastUpdated: '2026-02-11'
  }
];

// --- Credit Cards (Liability) ---
const creditCards = [
  {
    id: 'amex-gold', name: 'Amex Gold', type: 'Revolving',
    originalAmount: 0, currentBalance: 3420, interestRate: 24.99,
    monthlyPayment: 3420, dueDate: '2026-03-01',
    notes: 'Paid in full monthly. Points earning card.'
  },
  {
    id: 'chase-sapphire', name: 'Chase Sapphire Reserve', type: 'Revolving',
    originalAmount: 0, currentBalance: 1850, interestRate: 22.49,
    monthlyPayment: 1850, dueDate: '2026-03-15',
    notes: 'Travel rewards card. Paid in full.'
  }
];

// --- Mortgage (Liability) ---
const mortgage = [
  {
    id: 'austin-mortgage', name: 'Austin Home Mortgage', type: 'Fixed 30yr',
    originalAmount: 360000, currentBalance: 338500, interestRate: 6.25,
    monthlyPayment: 2216, dueDate: '2053-09-01',
    notes: 'Wells Fargo. Austin rental property. Purchased 2023.'
  }
];

// --- Auto Loan (Liability) ---
const autoLoan = [
  {
    id: 'tesla-loan', name: 'Tesla Model 3 Loan', type: 'Fixed 60mo',
    originalAmount: 30000, currentBalance: 22400, interestRate: 4.99,
    monthlyPayment: 566, dueDate: '2029-01-15',
    notes: 'Tesla financing. $8K down payment.'
  }
];

// --- Student Loan (Liability) ---
const studentLoan = [
  {
    id: 'fed-loan', name: 'Federal Student Loan', type: 'Fixed 10yr',
    originalAmount: 28000, currentBalance: 18200, interestRate: 4.50,
    monthlyPayment: 290, dueDate: '2032-06-01',
    notes: 'Direct unsubsidized. Standard repayment plan.'
  }
];

// --- Signals ---
const signals = {
  signals: [
    {
      id: 'sig-001', timestamp: '2026-02-11T08:30:00Z', priority: 'high',
      title: 'Bitcoin dropped 3.2% overnight',
      body: 'BTC is down to $97,500 from $100,720. Your crypto allocation shifted to 28.1% vs target 30%. Consider a small buy to rebalance, or hold if you expect further downside.',
      relatedAssets: ['btc'], category: 'rebalance', dismissed: false
    },
    {
      id: 'sig-002', timestamp: '2026-02-11T07:15:00Z', priority: 'medium',
      title: 'NVIDIA earnings next week (Feb 18)',
      body: 'NVDA reports Q4 earnings on Feb 18. Current position is up 84%. Consider trimming 10-20% before earnings to lock in gains, or hold through if you\'re bullish on guidance.',
      relatedAssets: ['nvda'], category: 'earnings', dismissed: false
    },
    {
      id: 'sig-003', timestamp: '2026-02-10T22:00:00Z', priority: 'low',
      title: 'Tax-loss harvesting: SOL has unrealized loss potential',
      body: 'While SOL is currently profitable, recent volatility may create short-term loss windows. Monitor for tax-loss harvesting if it dips below your cost basis.',
      relatedAssets: ['sol'], category: 'tax', dismissed: false
    },
    {
      id: 'sig-004', timestamp: '2026-02-10T16:00:00Z', priority: 'medium',
      title: 'NexaFlow milestone: Series A talks initiated',
      body: 'NexaFlow has begun Series A discussions. If successful at a $30M+ valuation, your seed position would 2.5x. Consider your follow-on investment strategy.',
      relatedAssets: ['startup-nexaflow'], category: 'startup', dismissed: false
    },
    {
      id: 'sig-005', timestamp: '2026-02-10T14:30:00Z', priority: 'high',
      title: 'Portfolio concentration alert: Tech stocks at 68%',
      body: 'Your combined tech stock exposure (AAPL, NVDA, MSFT, TSLA, AMZN) represents 68% of your portfolio. Consider diversifying into other sectors or asset classes.',
      relatedAssets: ['aapl', 'nvda', 'msft', 'tsla', 'amzn'], category: 'risk', dismissed: false
    },
    {
      id: 'sig-006', timestamp: '2026-02-10T10:00:00Z', priority: 'low',
      title: 'Macro: Fed rate decision in March',
      body: 'The Federal Reserve meets March 18-19. Markets are pricing in a 65% chance of a rate hold. This could impact your growth stocks and crypto positions.',
      relatedAssets: [], category: 'macro', dismissed: true
    },
    {
      id: 'sig-007', timestamp: '2026-02-09T20:00:00Z', priority: 'medium',
      title: 'Solana ecosystem surging',
      body: 'SOL up 12% this week on strong DeFi volume. Your position is now profitable. Consider setting a trailing stop or taking partial profits.',
      relatedAssets: ['sol'], category: 'momentum', dismissed: true
    }
  ]
};

// --- Feed ---
const feed = {
  items: [
    { id: 'f-001', source: 'Bloomberg', headline: 'Bitcoin Falls Below $98K as Crypto Market Faces Profit-Taking', summary: 'Major cryptocurrencies declined overnight as traders locked in gains from the recent rally. BTC dropped 3.2% while ETH fell 1.8%.', url: '#', timestamp: '2026-02-11T08:00:00Z', category: 'crypto', relevanceScore: 9 },
    { id: 'f-002', source: 'Reuters', headline: 'NVIDIA Set to Report Q4 Earnings Amid AI Spending Boom', summary: 'Analysts expect NVIDIA to post record revenue of $38.5B, driven by surging demand for AI training chips from hyperscalers.', url: '#', timestamp: '2026-02-11T07:30:00Z', category: 'earnings', relevanceScore: 9 },
    { id: 'f-003', source: 'TechCrunch', headline: 'AI Supply Chain Startup NexaFlow Enters Series A Discussions', summary: 'NexaFlow, which uses AI to optimize supply chain logistics, is reportedly in talks with Tier 1 VCs for a $30M Series A round.', url: '#', timestamp: '2026-02-11T06:00:00Z', category: 'angel-investment', relevanceScore: 10 },
    { id: 'f-004', source: 'CNBC', headline: 'Fed Officials Signal Patience on Rate Cuts Amid Sticky Inflation', summary: 'Federal Reserve governors emphasized data dependency, suggesting rate cuts may be delayed until clear evidence of inflation returning to target.', url: '#', timestamp: '2026-02-11T05:45:00Z', category: 'macro', relevanceScore: 7 },
    { id: 'f-005', source: 'CoinDesk', headline: 'Solana DeFi TVL Hits All-Time High of $18B', summary: 'Solana ecosystem DeFi protocols reached record total value locked, with Raydium and Marinade leading the charge.', url: '#', timestamp: '2026-02-10T22:00:00Z', category: 'crypto', relevanceScore: 8 },
    { id: 'f-006', source: 'WSJ', headline: 'Apple Services Revenue Grows 18% as Hardware Sales Stabilize', summary: 'Apple reported strong services growth driven by App Store, Apple TV+, and Apple Pay. iPhone sales showed modest recovery in Greater China.', url: '#', timestamp: '2026-02-10T20:00:00Z', category: 'earnings', relevanceScore: 8 },
    { id: 'f-007', source: 'Bloomberg', headline: 'Tesla Robotaxi Approval Expected in Austin by Q2 2026', summary: 'Regulatory sources indicate Tesla may receive its first autonomous ride-hailing permit in Austin, Texas, as early as April.', url: '#', timestamp: '2026-02-10T18:30:00Z', category: 'earnings', relevanceScore: 8 },
    { id: 'f-008', source: 'Financial Times', headline: 'Global Carbon Credit Market Surges Past $1 Trillion', summary: 'The voluntary carbon market has grown 40% year-over-year, with compliance markets driving institutional adoption and price discovery.', url: '#', timestamp: '2026-02-10T16:00:00Z', category: 'angel-investment', relevanceScore: 7 },
    { id: 'f-009', source: 'Reuters', headline: 'Microsoft Azure Revenue Grows 32% on AI Workload Demand', summary: 'Microsoft cloud segment exceeded expectations with AI-related workloads accounting for over 10% of Azure consumption revenue.', url: '#', timestamp: '2026-02-10T14:00:00Z', category: 'earnings', relevanceScore: 8 },
    { id: 'f-010', source: 'CoinDesk', headline: 'Ethereum Layer 2 Networks Process More Transactions Than Mainnet', summary: 'Combined L2 throughput now exceeds Ethereum mainnet by 5x, with Arbitrum and Base leading in daily active addresses.', url: '#', timestamp: '2026-02-10T12:00:00Z', category: 'crypto', relevanceScore: 6 },
    { id: 'f-011', source: 'TechCrunch', headline: 'Decentralized Identity Startup VaultEdge Joins Y Combinator W26', summary: 'VaultEdge, building privacy-preserving identity verification for fintech, was accepted into Y Combinator Winter 2026 batch.', url: '#', timestamp: '2026-02-10T10:00:00Z', category: 'angel-investment', relevanceScore: 9 },
    { id: 'f-012', source: 'Bloomberg', headline: 'Amazon AWS Launches Next-Gen Graviton5 Chips', summary: 'Amazon Web Services unveiled its latest custom silicon, promising 40% better price-performance for cloud workloads.', url: '#', timestamp: '2026-02-10T08:00:00Z', category: 'earnings', relevanceScore: 7 },
    { id: 'f-013', source: 'CNBC', headline: 'US Consumer Confidence Rises for Third Straight Month', summary: 'The Conference Board Consumer Confidence Index rose to 118.2, with consumers expressing optimism about the labor market.', url: '#', timestamp: '2026-02-09T20:00:00Z', category: 'macro', relevanceScore: 5 },
    { id: 'f-014', source: 'Financial Times', headline: 'Japan Central Bank Hints at Further Rate Normalization', summary: 'BOJ Governor signaled readiness for additional rate increases if wage growth continues, potentially strengthening the yen.', url: '#', timestamp: '2026-02-09T18:00:00Z', category: 'macro', relevanceScore: 6 },
    { id: 'f-015', source: 'CoinDesk', headline: 'Bitcoin Mining Difficulty Reaches New All-Time High', summary: 'Network difficulty adjusted upward 4.2% as hash rate continues to climb post-halving, squeezing less efficient miners.', url: '#', timestamp: '2026-02-09T14:00:00Z', category: 'crypto', relevanceScore: 5 },
    { id: 'f-016', source: 'WSJ', headline: 'Private Markets See Record Dry Powder at $4.2 Trillion', summary: 'PE and VC firms are sitting on unprecedented levels of uninvested capital, with AI and climate tech attracting the most interest.', url: '#', timestamp: '2026-02-09T10:00:00Z', category: 'macro', relevanceScore: 6 }
  ]
};

// --- Watchlist ---
const watchlist = {
  items: [
    { id: 'w-goog', name: 'Alphabet Inc.', ticker: 'GOOGL', category: 'stocks', currentPrice: 182.40, change24h: 0.6, note: 'Watching for AI search monetization clarity' },
    { id: 'w-avax', name: 'Avalanche', ticker: 'AVAX', category: 'crypto', currentPrice: 42.80, change24h: -1.2, note: 'Potential L1 diversification play' },
    { id: 'w-pltr', name: 'Palantir', ticker: 'PLTR', category: 'stocks', currentPrice: 78.50, change24h: 4.1, note: 'Government AI contracts expanding. Valuation concern.' },
    { id: 'w-link', name: 'Chainlink', ticker: 'LINK', category: 'crypto', currentPrice: 22.30, change24h: 1.8, note: 'Oracle infrastructure for DeFi. Key enabler.' }
  ]
};

// --- Tax Summary ---
const taxSummary = {
  taxYear: 2026,
  jurisdiction: 'US',
  realizedGains: 12450,
  realizedLosses: -3200,
  netRealizedGainLoss: 9250,
  unrealizedGains: 289750,
  unrealizedLosses: 0,
  estimatedTaxLiability: 2775,
  longTermRate: 0.15,
  shortTermRate: 0.30,
  taxLossHarvestingOpportunities: [
    { asset: 'TSLA', currentLoss: 0, potentialSavings: 0, note: 'Monitor for short-term dips below cost basis' }
  ],
  taxableEvents: [
    { date: '2026-01-15', type: 'sell', asset: 'TSLA', shares: 20, amount: 7800, costBasis: 3900, gain: 3900, term: 'long' },
    { date: '2026-01-22', type: 'sell', asset: 'ETH', units: 5, amount: 16200, costBasis: 11000, gain: 5200, term: 'short' },
    { date: '2026-02-01', type: 'sell', asset: 'BTC', units: 0.5, amount: 50000, costBasis: 21000, gain: 29000, term: 'long' },
    { date: '2026-02-05', type: 'sell', asset: 'MSFT', shares: 10, amount: 4458, costBasis: 3100, gain: 1358, term: 'long' },
    { date: '2026-01-10', type: 'sell', asset: 'SOL', units: 50, amount: 8500, costBasis: 2250, gain: 6250, term: 'short' },
    { date: '2026-01-28', type: 'loss', asset: 'AVAX', units: 100, amount: 3800, costBasis: 7000, gain: -3200, term: 'short' }
  ],
  notes: 'Consider harvesting losses in volatile crypto positions before year-end. Long-term capital gains rate applies to holdings >1 year.'
};

// --- Profile ---
const profile = {
  personal: {
    name: 'Alex Chen',
    occupation: 'Software Engineer',
    company: 'Tech Corp',
    yearsOfExperience: 8,
    title: 'Senior Engineer'
  },
  location: {
    country: 'US',
    state: 'TX',
    city: 'Austin',
    zipCode: '78701',
    fullAddress: '1200 S Lamar Blvd, Austin, TX 78704'
  },
  tax: {
    filingStatus: 'single',
    dependents: 0,
    federalTaxBracket: 0.24,
    stateTaxRate: 0,
    longTermCapitalGainsRate: 0.15,
    shortTermCapitalGainsRate: 0.24,
    niit: 0.038,
    notes: 'Texas resident — no state income tax. Federal bracket 24% (single, ~$100K–$191K).'
  },
  accounts: [
    { id: 'acct-chase-checking', name: 'Chase Checking', type: 'checking', institution: 'Chase' },
    { id: 'acct-schwab-brokerage', name: 'Schwab Brokerage', type: 'taxable', institution: 'Charles Schwab' },
    { id: 'acct-fidelity-roth', name: 'Fidelity Roth IRA', type: 'roth-ira', institution: 'Fidelity' },
    { id: 'acct-vanguard-401k', name: 'Company 401(k)', type: 'traditional-401k', institution: 'Vanguard' },
    { id: 'acct-fidelity-hsa', name: 'Health Savings Account', type: 'hsa', institution: 'Fidelity' },
    { id: 'acct-marcus-savings', name: 'Marcus HYSA', type: 'savings', institution: 'Goldman Sachs' },
    { id: 'acct-coinbase', name: 'Coinbase', type: 'taxable', institution: 'Coinbase' }
  ],
  lastUpdated: '2026-02-11T00:00:00Z'
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
    'taxable': { label: 'Taxable', taxTreatment: 'taxable', description: 'Standard brokerage account — gains taxed when realized' },
    'traditional-ira': { label: 'Traditional IRA', taxTreatment: 'tax-deferred', description: 'Tax-deferred — contributions may be deductible, withdrawals taxed as income' },
    'roth-ira': { label: 'Roth IRA', taxTreatment: 'tax-exempt', description: 'Tax-exempt growth — qualified withdrawals are tax-free' },
    'traditional-401k': { label: '401(k)', taxTreatment: 'tax-deferred', description: 'Employer-sponsored tax-deferred retirement account' },
    'roth-401k': { label: 'Roth 401(k)', taxTreatment: 'tax-exempt', description: 'After-tax contributions, tax-free qualified withdrawals' },
    'hsa': { label: 'HSA', taxTreatment: 'tax-advantaged', description: 'Triple tax-advantaged — deductible contributions, tax-free growth and medical withdrawals' },
    '529': { label: '529 Plan', taxTreatment: 'tax-advantaged', description: 'Tax-free growth for qualified education expenses' },
    'direct': { label: 'Direct', taxTreatment: 'varies', description: 'Directly held asset — tax treatment varies by type' },
    'checking': { label: 'Checking', taxTreatment: 'taxable', description: 'Bank checking account — interest taxable' },
    'savings': { label: 'Savings', taxTreatment: 'taxable', description: 'Savings account — interest taxable as ordinary income' }
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
    'taxable': { label: 'Taxable', color: '#b5443b' },
    'traditional-ira': { label: 'Traditional IRA', color: '#a0734f' },
    'roth-ira': { label: 'Roth IRA', color: '#3d7a3d' },
    'traditional-401k': { label: '401(k)', color: '#a0734f' },
    'roth-401k': { label: 'Roth 401(k)', color: '#3d7a3d' },
    'hsa': { label: 'HSA', color: '#2d4a2b' },
    '529': { label: '529 Plan', color: '#6b7d5e' },
    'direct': { label: 'Direct', color: '#7d8471' },
    'checking': { label: 'Checking', color: '#8a9178' }
  }
};

// --- Write all ---
console.log('\nSeeding Capis data...\n');

// Categories config
writeJSON('categories.json', categoriesConfig);

// Excel files — Asset holdings
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

// Excel files — Liabilities
writeExcelLiability('credit-cards.xlsx', creditCards);
writeExcelLiability('mortgage.xlsx', mortgage);
writeExcelLiability('auto-loan.xlsx', autoLoan);
writeExcelLiability('student-loan.xlsx', studentLoan);

// JSON files (non-portfolio data)
writeJSON('signals.json', signals);
writeJSON('feed.json', feed);
writeJSON('watchlist.json', watchlist);
writeJSON('tax-summary.json', taxSummary);
writeJSON('profile.json', profile);

// Remove old portfolio.json if it exists
const oldPortfolio = path.join(DATA_DIR, 'portfolio.json');
if (fs.existsSync(oldPortfolio)) {
  fs.unlinkSync(oldPortfolio);
  console.log('  removed data/portfolio.json (migrated to Excel)');
}

// Remove old startups.xlsx (renamed to angel-investment.xlsx)
const oldStartups = path.join(DATA_DIR, 'startups.xlsx');
if (fs.existsSync(oldStartups)) {
  fs.unlinkSync(oldStartups);
  console.log('  removed data/startups.xlsx (renamed to angel-investment.xlsx)');
}

// Remove old venture.xlsx (renamed to angel-investment.xlsx)
const oldVenture = path.join(DATA_DIR, 'venture.xlsx');
if (fs.existsSync(oldVenture)) {
  fs.unlinkSync(oldVenture);
  console.log('  removed data/venture.xlsx (renamed to angel-investment.xlsx)');
}

console.log('\nDone. 14 Excel files + categories.json + profile.json + other JSON data seeded.\n');
