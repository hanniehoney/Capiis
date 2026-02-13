// ============================================================
// TEMPLATE PERSONA: Alex Chen — Bay Area Chinese Tech Family
// ============================================================
// Age 37, Staff Engineer (L7) at Google, ex-Meta E6 (6 years)
// Base $330K, total cash flow ~$800K (base + regular META/GOOG stock sales)
// Net worth ~$5.5M
// Married, 2 kids (Ethan 5, Mia 3), Cupertino CA

// --- Stocks ---
// Structure: META employer stock $1.5M + diversified taxable $1.2M + 401(k) $0.6M + Roth $0.1M
const stocks = [
  // === META employer stock (vested RSU, now regular shares) ===
  {
    id: 'meta', name: 'Meta Platforms', ticker: 'META',
    quantity: 2500, avgCost: 180, currentPrice: 595,
    notes: 'Vested RSU from 6 years at Meta (E6). Now regular stock. Selling 10-15% annually to diversify. Concentrated position — plan multi-year drawdown.',
    accountType: 'taxable', accountName: 'E*TRADE', purchaseDate: '2018-06-01', lastUpdated: '2026-02-12'
  },
  // === 401(k) — Google 401(k) via Vanguard ===
  {
    id: 'voo-401k', name: 'Vanguard S&P 500 ETF', ticker: 'VOO',
    quantity: 1000, avgCost: 380, currentPrice: 520,
    notes: 'Core 401(k) holding. DCA via payroll. Google matches up to $9,500/yr.',
    accountType: 'traditional-401k', accountName: 'Google 401(k)', purchaseDate: '2020-01-10', lastUpdated: '2026-02-12'
  },
  {
    id: 'vxus-401k', name: 'Vanguard Total Intl Stock ETF', ticker: 'VXUS',
    quantity: 700, avgCost: 52, currentPrice: 60,
    notes: 'International diversification in 401(k). ~7% of retirement allocation.',
    accountType: 'traditional-401k', accountName: 'Google 401(k)', purchaseDate: '2020-01-10', lastUpdated: '2026-02-12'
  },
  {
    id: 'bnd-401k', name: 'Vanguard Total Bond Market ETF', ticker: 'BND',
    quantity: 600, avgCost: 74, currentPrice: 72,
    notes: 'Bond allocation in 401(k). ~7% of retirement. Slight loss from rate hikes.',
    accountType: 'traditional-401k', accountName: 'Google 401(k)', purchaseDate: '2021-06-01', lastUpdated: '2026-02-12'
  },
  // === Taxable diversified (Schwab Brokerage) ===
  {
    id: 'vti', name: 'Vanguard Total Stock Market ETF', ticker: 'VTI',
    quantity: 1800, avgCost: 210, currentPrice: 280,
    notes: 'Core diversified holding. Funded partly by META stock sales. Tax-efficient broad market.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2022-03-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'qqq', name: 'Invesco QQQ Trust', ticker: 'QQQ',
    quantity: 400, avgCost: 380, currentPrice: 530,
    notes: 'Nasdaq-100 exposure. Tech-heavy tilt alongside employer stock.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2023-01-20', lastUpdated: '2026-02-12'
  },
  {
    id: 'vxus', name: 'Vanguard Total Intl Stock ETF', ticker: 'VXUS',
    quantity: 1200, avgCost: 52, currentPrice: 60,
    notes: 'International diversification in taxable. Foreign tax credit eligible.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2022-06-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'vgt', name: 'Vanguard Information Technology ETF', ticker: 'VGT',
    quantity: 150, avgCost: 450, currentPrice: 580,
    notes: 'Sector bet on tech. Overlaps with employer exposure — consider trimming.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2023-06-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'aapl', name: 'Apple Inc.', ticker: 'AAPL',
    quantity: 250, avgCost: 178, currentPrice: 242,
    notes: 'Long-term conviction hold. Services revenue accelerating.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2023-03-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'nvda', name: 'NVIDIA Corp.', ticker: 'NVDA',
    quantity: 80, avgCost: 480, currentPrice: 892,
    notes: 'AI infrastructure leader. High conviction position.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2023-06-20', lastUpdated: '2026-02-12'
  },
  {
    id: 'schd', name: 'Schwab US Dividend Equity ETF', ticker: 'SCHD',
    quantity: 500, avgCost: 70, currentPrice: 82,
    notes: 'Dividend ETF for passive income. Diversification from growth tilt.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2023-09-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'amzn', name: 'Amazon', ticker: 'AMZN',
    quantity: 120, avgCost: 145, currentPrice: 228,
    notes: 'AWS margins expanding. Advertising segment growing.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2023-09-05', lastUpdated: '2026-02-12'
  },
  // === REIT ETF (exchange-traded, belongs in stocks not real-estate) ===
  {
    id: 'vnq', name: 'Vanguard Real Estate ETF', ticker: 'VNQ',
    quantity: 200, avgCost: 82.50, currentPrice: 91.20,
    notes: 'Broad REIT exposure. Dividend yield ~3.8%.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2024-01-15', lastUpdated: '2026-02-12'
  },
  // === Roth IRA (Fidelity) — Backdoor Roth ===
  {
    id: 'vti-roth', name: 'Vanguard Total Stock Market ETF', ticker: 'VTI',
    quantity: 200, avgCost: 220, currentPrice: 280,
    notes: 'Core Roth holding. Tax-free growth. Backdoor Roth contributions.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2022-04-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'nvda-roth', name: 'NVIDIA Corp.', ticker: 'NVDA',
    quantity: 25, avgCost: 480, currentPrice: 892,
    notes: 'High-growth in Roth for tax-free gains. AI thesis.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-06-20', lastUpdated: '2026-02-12'
  },
  {
    id: 'aapl-roth', name: 'Apple Inc.', ticker: 'AAPL',
    quantity: 100, avgCost: 178, currentPrice: 242,
    notes: 'Long-term hold in Roth. Tax-free dividend growth.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-03-15', lastUpdated: '2026-02-12'
  }
];

// --- Crypto ---
const crypto = [
  {
    id: 'btc', name: 'Bitcoin', ticker: 'BTC',
    quantity: 1.2, avgCost: 42000, currentPrice: 97500,
    notes: 'Core crypto position. DCA strategy. Halving cycle thesis.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2022-11-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'eth', name: 'Ethereum', ticker: 'ETH',
    quantity: 15, avgCost: 2200, currentPrice: 3180,
    notes: 'Layer 1 ecosystem. Staking yield ~4%. Long-term hold.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2023-01-10', lastUpdated: '2026-02-12'
  },
  {
    id: 'sol', name: 'Solana', ticker: 'SOL',
    quantity: 100, avgCost: 45, currentPrice: 185,
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
// Google RSU: L7 initial grant ~6,000 shares over 4 years. ~3,000 vested, holding ~2,000 (sold ~1,000 to diversify).
const employeeEquity = [
  {
    id: 'eq-googl-rsu', name: 'Google RSUs', ticker: 'GOOGL',
    quantity: 2000, avgCost: 0, currentPrice: 185,
    notes: 'L7 initial grant: 6,000 shares over 4 years. ~3,000 vested as of Feb 2026. Holding ~2,000 vested; sold ~1,000 to diversify. Next vest: Apr 2026 (~375 shares).',
    accountType: 'taxable', accountName: 'E*TRADE Equity', purchaseDate: '2024-03-01', lastUpdated: '2026-02-12',
    equityType: 'RSU', grantDate: '2024-03-01', vestingSchedule: '4yr quarterly (~375 shares/quarter)', strikePrice: 0, fmvAtGrant: 165
  },
  {
    id: 'eq-googl-espp', name: 'Google ESPP', ticker: 'GOOGL',
    quantity: 200, avgCost: 155, currentPrice: 185,
    notes: 'ESPP shares purchased at 15% discount. 6-month lookback.',
    accountType: 'taxable', accountName: 'E*TRADE Equity', purchaseDate: '2025-06-30', lastUpdated: '2026-02-12',
    equityType: 'ESPP', grantDate: '2025-01-01', vestingSchedule: '6mo purchase period', strikePrice: 155, fmvAtGrant: 178
  }
];

// --- Real Estate ---
const realEstate = [
  {
    id: 're-cupertino', name: 'Cupertino Home (Primary)', ticker: 'RE-CPT',
    quantity: 1, avgCost: 3000000, currentPrice: 3000000,
    notes: 'Primary residence. 4BR in Cupertino. Purchased Sep 2025. $1.2M down payment (funded by META stock sales). School district: CUSD.',
    accountType: 'direct', accountName: 'Direct Ownership', purchaseDate: '2025-09-01', lastUpdated: '2026-02-12'
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
    quantity: 1, avgCost: 15000, currentPrice: 15000,
    notes: 'Brokerage sweep account.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '', lastUpdated: '2026-02-12'
  }
];

// --- Savings ---
const savings = [
  {
    id: 'marcus-hysa', name: 'Marcus HYSA', ticker: 'HYSA',
    quantity: 1, avgCost: 150000, currentPrice: 150000,
    notes: 'High-yield savings. APY 4.5%. Emergency fund — covers ~2-3 months total expenses + tax reserves.',
    accountType: 'savings', accountName: 'Marcus HYSA', purchaseDate: '', lastUpdated: '2026-02-12'
  },
  {
    id: '529-kid1', name: '529 Plan — Ethan', ticker: '529',
    quantity: 1, avgCost: 45000, currentPrice: 55000,
    notes: 'College savings for Ethan (age 5). Target-date fund. CA state tax deduction up to $10K/yr.',
    accountType: '529', accountName: 'Vanguard 529', purchaseDate: '2021-06-01', lastUpdated: '2026-02-12'
  },
  {
    id: '529-kid2', name: '529 Plan — Mia', ticker: '529',
    quantity: 1, avgCost: 28000, currentPrice: 35000,
    notes: 'College savings for Mia (age 3). Target-date fund. CA state tax deduction up to $10K/yr.',
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
// $3.0M home, $1.2M down (from META sales), $1.8M mortgage
const mortgage = [
  {
    id: 'cupertino-mortgage', name: 'Cupertino Home Mortgage', type: 'Fixed 30yr',
    originalAmount: 1800000, currentBalance: 1790000, interestRate: 6.75,
    monthlyPayment: 11674, dueDate: '2055-09-01',
    notes: 'Wells Fargo. Primary residence. $1.2M down payment funded by META stock sales. Purchased Sep 2025.'
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
      title: 'META concentrated position: $1.49M (20% of portfolio)',
      body: 'Your 2,500 vested Meta shares are worth $1.49M (cost basis $450K). This single-stock concentration from your previous employer represents ~20% of total assets. Financial planning best practice suggests <10% in any single stock. Consider accelerating annual trim to 15-20% and reallocating to diversified index funds.',
      relatedAssets: ['meta'], category: 'risk', dismissed: false
    },
    {
      id: 'sig-002', timestamp: '2026-02-12T07:15:00Z', priority: 'high',
      title: 'Google RSU vest: ~375 shares ($69K) in April',
      body: 'Your next quarterly RSU vest is ~375 shares of GOOGL in April 2026. At current price ($185), that is ~$69,375 of ordinary income taxed at your marginal rate (35% federal + 9.3% CA). Google auto-sells ~45% for withholding, but verify this covers your actual liability given NIIT.',
      relatedAssets: ['eq-googl-rsu'], category: 'tax', dismissed: false
    },
    {
      id: 'sig-003', timestamp: '2026-02-11T22:00:00Z', priority: 'medium',
      title: 'META unrealized gains: $1.04M — plan multi-year exit',
      body: 'Your META position has $1.04M in unrealized long-term gains ($595 current vs $180 avg cost). Selling all at once would trigger ~$245K in federal LTCG + NIIT + CA state tax. Consider spreading sales over 3-5 years and pairing with tax-loss harvesting.',
      relatedAssets: ['meta'], category: 'tax', dismissed: false
    },
    {
      id: 'sig-004', timestamp: '2026-02-11T16:00:00Z', priority: 'medium',
      title: 'NexaFlow milestone: Series A talks initiated',
      body: 'NexaFlow has begun Series A discussions. If successful at a $30M+ valuation, your seed position would 2.5x. Consider your follow-on investment strategy.',
      relatedAssets: ['startup-nexaflow'], category: 'startup', dismissed: false
    },
    {
      id: 'sig-005', timestamp: '2026-02-11T14:30:00Z', priority: 'medium',
      title: '529 contributions: maximize before tax deadline',
      body: 'California allows state tax deduction for 529 contributions up to $10K/yr per beneficiary for MFJ. Consider maximizing contributions for both Ethan and Mia before April 15. Current balances: Ethan $55K, Mia $35K.',
      relatedAssets: ['529-kid1', '529-kid2'], category: 'tax', dismissed: false
    },
    {
      id: 'sig-006', timestamp: '2026-02-11T10:00:00Z', priority: 'medium',
      title: 'NVIDIA earnings next week (Feb 18)',
      body: 'NVDA reports Q4 earnings on Feb 18. Your combined position (80 taxable + 25 Roth = 105 shares, ~$93.7K) is up 86%. Consider trimming 10-20% of the taxable lot before earnings to lock in gains.',
      relatedAssets: ['nvda', 'nvda-roth'], category: 'earnings', dismissed: false
    },
    {
      id: 'sig-007', timestamp: '2026-02-10T20:00:00Z', priority: 'low',
      title: 'Macro: Fed rate decision in March',
      body: 'The Federal Reserve meets March 18-19. Markets pricing 65% chance of rate hold. This could impact your growth stocks, crypto, and mortgage refi opportunities. Current mortgage rate 6.75% — monitor for potential refinancing window.',
      relatedAssets: [], category: 'macro', dismissed: true
    },
    {
      id: 'sig-008', timestamp: '2026-02-10T15:00:00Z', priority: 'high',
      title: 'Long-term resident threshold in 2027 — exit tax planning',
      body: 'Your green card was issued in 2019. In 2027 you will reach the 8-year "long-term resident" threshold under IRC 877A. After that, relinquishing your green card triggers exit tax (mark-to-market on all worldwide assets). With ~$5.5M net worth and $1M+ unrealized META gains, this could be a significant tax event. If there is ANY chance you might return to Taiwan long-term, consult an immigration tax specialist NOW.',
      relatedAssets: [], category: 'tax', dismissed: false
    },
    {
      id: 'sig-009', timestamp: '2026-02-10T11:00:00Z', priority: 'medium',
      title: 'FBAR due April 15 — Taiwan bank account reportable',
      body: 'Your Cathay United Bank account in Taiwan (~NTD 500K / ~$16K) exceeds the $10K FBAR threshold. File FinCEN Form 114 by April 15 (auto-extends to Oct 15). No US-Taiwan tax treaty means no streamlined reporting — ensure compliance.',
      relatedAssets: [], category: 'tax', dismissed: false
    },
    // --- 2025 resolved/dismissed signals ---
    { id: 'sig-010', type: 'action', severity: 'info', title: 'Year-End Tax Planning Complete', message: 'Completed 2025 tax-loss harvesting review. No significant losses to harvest — portfolio broadly up. Confirmed estimated tax payments on track.', timestamp: '2025-12-15T10:00:00Z', dismissed: true, source: 'tax-agent' },
    { id: 'sig-011', type: 'milestone', severity: 'info', title: 'Home Purchase Closed', message: 'Cupertino home purchase closed on Sept 1. $3M purchase, $1.2M down from META sales, $1.8M mortgage at 6.75%. Property tax ~$37.5K/year (1.25% Mello-Roos).', timestamp: '2025-09-01T18:00:00Z', dismissed: true, source: 'portfolio-agent' },
    { id: 'sig-012', type: 'action', severity: 'medium', title: 'META Diversification — 2025 Target Met', message: 'Sold 500 META shares in 2025 ($277.5K proceeds). META concentration reduced from ~28% to ~20% of portfolio. Continue trimming in 2026 toward <10% target.', timestamp: '2025-12-20T14:00:00Z', dismissed: true, source: 'portfolio-agent' },
    { id: 'sig-013', type: 'action', severity: 'info', title: '529 Annual Contributions Complete', message: 'Funded $10K to each 529 plan (Ethan + Mia) for 2025. CA state tax deduction of $20K claimed.', timestamp: '2025-12-28T09:00:00Z', dismissed: true, source: 'tax-agent' },
    { id: 'sig-014', type: 'alert', severity: 'high', title: 'FBAR Filed — 2024 Tax Year', message: 'FinCEN Form 114 filed for Taiwan Cathay United Bank account. Balance ~NTD 500K ($16K). Deadline was April 15, filed March 20.', timestamp: '2025-03-20T11:00:00Z', dismissed: true, source: 'tax-agent' },
    { id: 'sig-015', type: 'action', severity: 'medium', title: 'Google RSU Vest — Q4 2025', message: 'Q4 2025 RSU vest: 375 GOOG shares (~$66K at vest). Federal + CA withholding applied. Verify withholding covers marginal rate.', timestamp: '2025-10-01T08:00:00Z', dismissed: true, source: 'portfolio-agent' }
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
    { id: 'f-012', source: 'WSJ', headline: 'Private Markets See Record Dry Powder at $4.2 Trillion', summary: 'PE and VC firms are sitting on unprecedented levels of uninvested capital, with AI and climate tech attracting the most interest.', url: '#', timestamp: '2026-02-09T10:00:00Z', category: 'macro', relevanceScore: 5 },
    // --- Late 2025 and early January 2026 items ---
    { id: 'f-013', source: 'Bloomberg', headline: 'Alphabet Q3 2025: Cloud Growth Accelerates to 40%', summary: 'Google Cloud posted $11.2B revenue, beating estimates. AI-driven enterprise adoption cited as primary growth driver.', url: '#', timestamp: '2025-10-29T20:00:00Z', category: 'earnings', relevanceScore: 9 },
    { id: 'f-014', source: 'WSJ', headline: 'Meta Q3 Earnings Top Estimates, Metaverse Losses Narrow', summary: 'Meta reported revenue of $42B, up 19% YoY. Reality Labs losses narrowed to $3.6B as Quest headset sales improved.', url: '#', timestamp: '2025-10-30T20:00:00Z', category: 'earnings', relevanceScore: 8 },
    { id: 'f-015', source: 'CNBC', headline: 'Fed Holds Rates Steady at 4.75% — Signals Two Cuts in 2026', summary: 'The Federal Reserve kept rates unchanged at its December meeting but projected two 25bp cuts in the first half of 2026, citing moderating inflation.', url: '#', timestamp: '2025-12-18T19:00:00Z', category: 'macro', relevanceScore: 8 },
    { id: 'f-016', source: 'CoinDesk', headline: 'Bitcoin Breaks $90K for First Time, Fueled by ETF Inflows', summary: 'Bitcoin surged past $90,000 as spot ETFs recorded $2.1B in net inflows in November. Institutional allocation continues to increase.', url: '#', timestamp: '2025-11-21T14:00:00Z', category: 'crypto', relevanceScore: 8 },
    { id: 'f-017', source: 'Reuters', headline: 'Bay Area Housing: Cupertino Median Hits $2.8M in 2025', summary: 'Annual housing data shows Cupertino median home price reached $2.8M, driven by Apple and Google employee demand. Inventory remains at historic lows.', url: '#', timestamp: '2025-12-28T10:00:00Z', category: 'macro', relevanceScore: 8 },
    { id: 'f-018', source: 'TechCrunch', headline: 'NexaFlow Closes $30M Series A Led by Sequoia', summary: 'AI supply chain startup NexaFlow closed its Series A at a $150M valuation. Alex Chen, an early angel investor, holds a $75K seed position now valued at ~$100K.', url: '#', timestamp: '2026-01-08T12:00:00Z', category: 'angel-investment', relevanceScore: 10 },
    { id: 'f-019', source: 'Financial Times', headline: 'Taiwan Dollar Strengthens as Tech Exports Boom', summary: 'The Taiwan dollar rose to 30.5 per USD, its strongest level since 2022, as semiconductor exports hit record highs. Impact on cross-border transfers noted.', url: '#', timestamp: '2025-11-15T08:00:00Z', category: 'macro', relevanceScore: 7 },
    { id: 'f-020', source: 'Bloomberg', headline: 'S&P 500 Closes 2025 Up 22%, Led by AI and Mega-Cap Tech', summary: 'The S&P 500 finished 2025 with a 22% annual return. Magnificent Seven stocks contributed over half of the gains.', url: '#', timestamp: '2025-12-31T21:00:00Z', category: 'macro', relevanceScore: 7 }
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
// Higher income = higher tax events. META trimming + RSU vesting + crypto sales.
const taxSummary = {
  taxYear: 2026,
  jurisdiction: 'US',
  realizedGains: 143150,
  realizedLosses: -3200,
  netRealizedGainLoss: 139950,
  unrealizedGains: 1200000,
  unrealizedLosses: -15000,
  estimatedTaxLiability: 48000,
  longTermRate: 0.20,
  shortTermRate: 0.35,
  taxLossHarvestingOpportunities: [
    { asset: 'BND', currentLoss: -1200, potentialSavings: 450, note: 'Bond ETF in 401(k) — not harvestable in tax-deferred. Monitor taxable lots.' },
    { asset: 'VXUS', currentLoss: 0, potentialSavings: 0, note: 'Near breakeven. Monitor for dips below $52 cost basis for harvesting.' }
  ],
  taxableEvents: [
    // --- 2025 events (prior year) ---
    { date: '2025-03-15', type: 'sell', asset: 'META', shares: 150, amount: 82500, costBasis: 27000, gain: 55500, term: 'long' },
    { date: '2025-04-01', type: 'sell', asset: 'VTI', shares: 50, amount: 14500, costBasis: 12500, gain: 2000, term: 'long' },
    { date: '2025-06-20', type: 'sell', asset: 'META', shares: 150, amount: 87000, costBasis: 27000, gain: 60000, term: 'long' },
    { date: '2025-08-15', type: 'sell', asset: 'ETH', units: 3, amount: 8400, costBasis: 6600, gain: 1800, term: 'long' },
    { date: '2025-09-10', type: 'sell', asset: 'META', shares: 200, amount: 108000, costBasis: 36000, gain: 72000, term: 'long' },
    { date: '2025-11-20', type: 'sell', asset: 'SOL', units: 100, amount: 16000, costBasis: 4500, gain: 11500, term: 'short' },
    // --- 2026 events (current year) ---
    { date: '2026-01-15', type: 'sell', asset: 'META', shares: 200, amount: 119000, costBasis: 36000, gain: 83000, term: 'long' },
    { date: '2026-01-22', type: 'sell', asset: 'ETH', units: 5, amount: 16200, costBasis: 11000, gain: 5200, term: 'short' },
    { date: '2026-02-01', type: 'sell', asset: 'BTC', units: 0.3, amount: 29250, costBasis: 12600, gain: 16650, term: 'long' },
    { date: '2026-02-05', type: 'sell', asset: 'META', shares: 100, amount: 59500, costBasis: 18000, gain: 41500, term: 'long' },
    { date: '2026-01-10', type: 'sell', asset: 'SOL', units: 50, amount: 9250, costBasis: 2250, gain: 7000, term: 'short' },
    { date: '2026-01-28', type: 'loss', asset: 'AVAX', units: 100, amount: 3800, costBasis: 7000, gain: -3200, term: 'short' }
  ],
  priorYear: {
    taxYear: 2025,
    totalGrossIncome: 772000,
    w2Income: 510000,
    rsuVestIncome: 262000,
    capitalGains: { longTerm: 191300, shortTerm: 11500, total: 202800 },
    realizedGains: 202800,
    realizedLosses: 0,
    netRealizedGainLoss: 202800,
    totalTaxableIncome: 680000,
    federalTaxOwed: 178000,
    stateTaxOwed: 63200,
    totalTaxOwed: 241200,
    totalWithheld: 186000,
    estimatedPaymentsMade: 89000,
    totalPaid: 275000,
    refundOrOwed: -33800,
    effectiveFederalRate: 0.262,
    effectiveTotalRate: 0.355,
    notes: 'MFJ with 2 dependents. W-2 income: Alex $330K base + $262K RSU vests + Emily $180K = $772K gross. Capital gains from META diversification ($277.5K proceeds, $187.5K LTCG) plus ETH/VTI/SOL sales. Maxed 401(k) ($23.5K), backdoor Roth ($14K both spouses), HSA ($8.3K), 529s ($20K). SALT capped at $10K. Standard deduction $29,200 was less favorable than itemizing (mortgage interest ~$120K + SALT $10K + charitable $15K). Estimated overpayment of ~$33.8K — applied to 2026 estimated taxes.'
  },
  estimatedPayments: [
    // 2025 quarterly payments (all paid)
    { date: '2025-04-15', quarter: '2025-Q1', amount: 25000, status: 'paid', note: 'Federal estimated payment. Covers Q1 RSU vest + capital gains from META sales.' },
    { date: '2025-06-15', quarter: '2025-Q2', amount: 22000, status: 'paid', note: 'Federal estimated payment.' },
    { date: '2025-09-15', quarter: '2025-Q3', amount: 22000, status: 'paid', note: 'Federal estimated payment. Includes gain from Sept META sale.' },
    { date: '2026-01-15', quarter: '2025-Q4', amount: 20000, status: 'paid', note: 'Federal estimated payment for Q4 2025. Paid Jan 15, 2026.' },
    // 2025 CA state payments (all paid)
    { date: '2025-04-15', quarter: '2025-Q1-CA', amount: 8000, status: 'paid', note: 'California estimated payment.' },
    { date: '2025-06-15', quarter: '2025-Q2-CA', amount: 7500, status: 'paid', note: 'California estimated payment.' },
    { date: '2025-09-15', quarter: '2025-Q3-CA', amount: 7500, status: 'paid', note: 'California estimated payment.' },
    { date: '2026-01-15', quarter: '2025-Q4-CA', amount: 7000, status: 'paid', note: 'California estimated payment for Q4 2025.' },
    // 2026 quarterly payments (upcoming)
    { date: '2026-04-15', quarter: '2026-Q1', amount: 28000, status: 'scheduled', note: 'Federal estimated payment. Higher due to increased META sales + crypto gains in Q1.' },
    { date: '2026-04-15', quarter: '2026-Q1-CA', amount: 9000, status: 'scheduled', note: 'California estimated payment for Q1 2026.' },
    { date: '2026-06-15', quarter: '2026-Q2', amount: 25000, status: 'upcoming', note: 'Federal estimated payment Q2.' },
    { date: '2026-06-15', quarter: '2026-Q2-CA', amount: 8000, status: 'upcoming', note: 'California estimated payment Q2.' }
  ],
  ordinaryIncomeEvents: [
    // 2025 RSU vests (ordinary income, taxes withheld by employer)
    { date: '2025-03-01', type: 'rsu-vest', asset: 'GOOG', shares: 375, vestValue: 62500, withheld: 27500, note: 'Q1 2025 Google RSU vest. 375 shares at ~$167/share. Fed+CA+FICA withheld.' },
    { date: '2025-06-01', type: 'rsu-vest', asset: 'GOOG', shares: 375, vestValue: 65600, withheld: 28900, note: 'Q2 2025 Google RSU vest. 375 shares at ~$175/share.' },
    { date: '2025-09-01', type: 'rsu-vest', asset: 'GOOG', shares: 375, vestValue: 66400, withheld: 29200, note: 'Q3 2025 Google RSU vest. 375 shares at ~$177/share.' },
    { date: '2025-12-01', type: 'rsu-vest', asset: 'GOOG', shares: 375, vestValue: 67500, withheld: 29700, note: 'Q4 2025 Google RSU vest. 375 shares at ~$180/share.' },
    // 2026 RSU vests
    { date: '2026-03-01', type: 'rsu-vest', asset: 'GOOG', shares: 375, vestValue: 69400, withheld: 30500, note: 'Q1 2026 Google RSU vest. 375 shares at ~$185/share.' },
    // 2025 ESPP purchase
    { date: '2025-06-30', type: 'espp-purchase', asset: 'GOOG', shares: 120, purchasePrice: 148.75, fmv: 175, discount: 3150, note: 'ESPP purchase at 15% discount. Ordinary income on discount portion ($3,150).' },
    // Emily W-2 (spouse)
    { date: '2025-12-31', type: 'w2', source: 'Emily — Startup', grossIncome: 180000, withheld: 54000, note: 'Emily W-2 income from startup. $180K gross, ~$54K total fed+state+FICA withheld.' },
    { date: '2025-12-31', type: 'w2', source: 'Alex — Google', grossIncome: 330000, withheld: 132000, note: 'Alex W-2 base salary. $330K gross, ~$132K total fed+state+FICA withheld. RSU income reported separately.' }
  ],
  retirementContributions: [
    // 2025
    { year: 2025, type: '401k', account: 'Google 401(k)', amount: 23500, employerMatch: 9500, note: 'Maxed out 2025 401(k) limit ($23,500). Google matches 50% up to $9,500.' },
    { year: 2025, type: 'backdoor-roth', account: 'Fidelity Roth IRA', amount: 7000, note: 'Backdoor Roth IRA for Alex. Contributed to traditional IRA then converted (income too high for direct Roth).' },
    { year: 2025, type: 'backdoor-roth', account: 'Emily Roth IRA', amount: 7000, note: 'Backdoor Roth IRA for Emily.' },
    { year: 2025, type: 'hsa', account: 'Fidelity HSA', amount: 8300, note: 'Maxed family HSA ($8,300 for 2025). Invested in VTI inside HSA.' },
    { year: 2025, type: '529', account: '529 — Ethan', amount: 10000, note: 'CA state deduction up to $10K per beneficiary.' },
    { year: 2025, type: '529', account: '529 — Mia', amount: 10000, note: 'CA state deduction up to $10K per beneficiary.' },
    // 2026 (in progress)
    { year: 2026, type: '401k', account: 'Google 401(k)', amount: 4100, employerMatch: 1580, note: '2026 contributions through Feb. On track to max ($24,500 limit for 2026). Google match ongoing.' },
    { year: 2026, type: 'backdoor-roth', account: 'Fidelity Roth IRA', amount: 7500, note: 'Completed backdoor Roth for 2026 in January. New limit $7,500.' },
    { year: 2026, type: 'hsa', account: 'Fidelity HSA', amount: 1460, note: '2026 HSA contributions through Feb. Family limit $8,750 for 2026.' },
    { year: 2026, type: '529', account: '529 — Ethan', amount: 0, note: 'Not yet contributed for 2026. Plan to fund $10K by Dec.' },
    { year: 2026, type: '529', account: '529 — Mia', amount: 0, note: 'Not yet contributed for 2026. Plan to fund $10K by Dec.' }
  ],
  crossBorderFiling: {
    nationality: 'Taiwan (ROC)',
    residencyStatus: 'US permanent resident (green card since 2019)',
    taxTreaty: 'NONE — no US-Taiwan income tax treaty',
    exitTaxRisk: {
      thresholdDate: '2027-06-01',
      status: 'approaching',
      netWorth: 5500000,
      unrealizedGains: 1200000,
      note: 'IRC 877A: 8-year long-term resident threshold hits ~2027. Relinquishing green card after this date triggers mark-to-market exit tax on worldwide assets. With $5.5M NW and $1.2M unrealized gains, estimated exit tax could be $200K-$300K. Must decide before 2027.'
    },
    fbar: {
      required: true,
      accounts: [{ institution: 'Cathay United Bank', country: 'Taiwan', maxBalance2025: 16000, currency: 'NTD ~500K' }],
      filed2024: { date: '2025-03-20', status: 'filed', note: 'Filed for 2024 tax year.' },
      due2025: { deadline: '2026-04-15', autoExtension: '2026-10-15', status: 'not-filed', note: 'Must file by April 15, 2026 for 2025 tax year. Auto-extension to Oct 15 available.' }
    },
    fatca: {
      required: false,
      note: 'FATCA Form 8938 threshold is $100K for MFJ at year-end. Taiwan account ~$16K — below threshold. Not required.'
    },
    foreignTaxCredit: {
      paid2025: 0,
      note: 'No Taiwan-source income in 2025. No foreign tax credit claimed. If Taiwan inheritance materializes, Form 3520 reporting required.'
    },
    giftToParents: {
      amount2025: 10000,
      amount2026: 0,
      note: 'Sends ~$10K/year to parents in Taipei. Under $19K gift tax exclusion per recipient — no Form 709 required.'
    }
  },
  propertyTax: {
    property: '10500 Vista Dr, Cupertino, CA 95014',
    assessedValue: 3000000,
    taxRate: 0.0125,
    annualAmount: 37500,
    payments: [
      { date: '2025-11-01', amount: 18750, status: 'paid', note: 'First installment 2025-26 property tax. Due Nov 1, delinquent Dec 10.' },
      { date: '2026-02-01', amount: 18750, status: 'paid', note: 'Second installment 2025-26 property tax. Due Feb 1, delinquent Apr 10.' }
    ],
    saltDeduction: { cap: 10000, claimed2025: 10000, note: 'SALT deduction capped at $10K (MFJ). Property tax $37.5K + state income tax far exceeds cap.' }
  },
  notes: 'California state income tax applies on all gains. Federal LTCG rate 20% (income >$583K MFJ). NIIT 3.8% applies. RSU vesting creates ordinary income — verify withholding covers marginal rate (35% fed + 9.3% CA). Plan multi-year META diversification to spread tax impact. No US-Taiwan tax treaty — rely on foreign tax credit only. FBAR required for Taiwan account. Green card 8-year long-term resident threshold approaching (2027).'
};

// --- Profile ---
const profile = {
  personal: {
    name: 'Alex',
    age: 37,
    nationality: 'Taiwanese (ROC)',
    immigration: 'Green card holder since 2019 (EB-2, Meta-sponsored). F-1 → OPT → H-1B → GC. 7 years as permanent resident — approaching 8-year long-term resident threshold for exit tax.',
    education: 'BS Computer Science, UC Berkeley (2010-2014).',
    occupation: 'Software Engineer',
    company: 'Google',
    previousCompany: 'Meta',
    previousTitle: 'Senior Engineer (E6)',
    previousTenure: '6 years (2018-2024)',
    yearsOfExperience: 12,
    title: 'Staff Engineer (L7)',
    baseSalary: 330000,
    totalCashFlow: 800000,
    cashFlowNotes: 'Base $330K + annual stock sales (~$450-550K from META trimming + GOOG RSU sells). Total annual cash inflow ~$800K.'
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
    federalTaxBracket: 0.35,
    stateTaxRate: 0.093,
    longTermCapitalGainsRate: 0.20,
    shortTermCapitalGainsRate: 0.35,
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
    notes: 'California resident — 9.3% state income tax. Federal bracket 35% (MFJ, ~$487K-$731K taxable income). LTCG rate 20% (income >$583K MFJ). NIIT 3.8% applies at $250K MAGI threshold. Google 401(k) match up to $9,500. Previously at Meta 6 years — holds ~$1.5M in vested META shares. Green card since 2019 — approaching 8-year long-term resident threshold (2027) for exit tax. NO US-Taiwan tax treaty — no treaty-based relief for double taxation. Must file FBAR for Taiwan bank account (~NTD 500K). Future inheritance from Taiwan parents (Taipei apartment ~$950K) will require Form 3520 reporting and enters US estate. Sends ~$10K/yr to parents (under $19K gift exclusion). 2026 rates.'
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
    { id: 'acct-529-mia', name: '529 Plan — Mia', type: '529', institution: 'Vanguard' },
    { id: 'acct-tw-savings', name: 'Taiwan Bank Account', type: 'foreign-savings', institution: 'Cathay United Bank (Taiwan)' }
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
    savings: { label: 'Savings', taxTreatment: 'taxable', description: 'Savings account — interest taxable as ordinary income' },
    'foreign-pension': { label: 'Foreign Pension', taxTreatment: 'foreign', description: 'Foreign retirement account — US reporting required (FBAR, FATCA, Form 3520)' },
    'foreign-taxable': { label: 'Foreign Taxable', taxTreatment: 'foreign', description: 'Foreign investment account — no US tax advantages, FBAR/FATCA reportable' },
    'foreign-savings': { label: 'Foreign Savings', taxTreatment: 'foreign', description: 'Foreign savings account — interest taxable in US, FBAR/FATCA reportable' }
  },
  categoryMeta: {
    cash: { label: 'Cash & Checking', color: '#8a9178', displayProfile: 'cash-like' },
    savings: { label: 'Savings & CDs', color: '#7d9470', displayProfile: 'yield-bearing' },
    stocks: { label: 'Stocks', color: '#5b7e4a', displayProfile: 'market-traded' },
    crypto: { label: 'Crypto', color: '#7d8471', displayProfile: 'market-traded' },
    'angel-investment': { label: 'Angel Investment', color: '#a4ac86', displayProfile: 'private-equity' },
    'employee-equity': { label: 'Employee Equity', color: '#4a7c59', displayProfile: 'employee-equity' },
    'real-estate': { label: 'Real Estate', color: '#6b7d5e', displayProfile: 'physical-asset' },
    vehicles: { label: 'Vehicles', color: '#6e8b5e', displayProfile: 'physical-asset' },
    jewelry: { label: 'Jewelry', color: '#9a8c6e', displayProfile: 'physical-asset' },
    art: { label: 'Art & Collectibles', color: '#8b7d6b', displayProfile: 'physical-asset' },
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

// --- Profile Memory (narrative context for agents/skills) ---
const profileMemory = `# Alex — Profile Memory

> Last updated: 2026-02-12

## Career & Identity

- 37 years old, Taiwanese citizen, born and raised in Taipei. Came to the US for college at UC Berkeley (BS Computer Science, 2010–2014).
- Immigration path: F-1 student visa (2010) → OPT (2014) → H-1B sponsored by first employer (2015) → Green card EB-2 sponsored by Meta (2019). Has held green card for ~7 years.
- Still holds Taiwan (ROC) citizenship alongside US green card — Taiwan allows dual nationality for non-government roles.
- Staff Engineer (L7) at Google, Mountain View.
- Previously Senior Engineer (E6) at Meta for 6 years (2018–2024). Built infra for Ads ranking team.
- Joined Google in Mar 2024 for a senior IC role on Cloud AI platform. L7 promo within first year.
- Total YOE: 12 years. Started career at a YC startup (2014–2018) after Berkeley, before Meta.
- Dual-income household. Emily (spouse) is a product designer at a mid-stage startup, ~$180K TC.
- No immediate plans to leave Google. Exploring staff+ IC track vs. eng management.

## Family & Life Stage

- Married to Emily Chen. Together since 2017, married 2019.
- Two kids: Ethan (5, 大班) and Mia (3, 小班, starting fall 2026).
- School district (CUSD) was the primary reason for buying in Cupertino.
- No plans for a third child. Family feels complete.
- Parents in Taipei, Taiwan. Dad is a retired EE professor at NTHU (清華大學), mom is a retired high school teacher. Both healthy, mid-60s. No near-term elder care burden but long-term consideration.
- Maintains a Taiwan bank account at Cathay United Bank (~NTD 500K / ~$16K) for family transfers. Sends ~$10K/year to parents (under $19K gift exclusion).
- May inherit parents' apartment in Taipei someday (worth ~NTD 30M / ~$950K). Not factored into current net worth.
- Still holds Taiwan citizenship (dual nationality) — no conflict with green card status.
- Emily's parents may relocate to Bay Area in 2–3 years.

## Financial Philosophy & Risk

- Self-identifies as "pragmatic indexer with a gambling pocket."
- Core: 80%+ in diversified index funds (VTI, VOO, VXUS). Believes in long-term passive compounding.
- Satellite: allows 10–15% in individual stocks (NVDA, AAPL) and crypto (BTC, ETH) for upside.
- Angel investing: considers it "tuition" — max $50–75K/check, only in domains he understands (AI infra, developer tools).
- Risk tolerance: moderate-high for long-term holdings, conservative for anything touching the kids' education or emergency fund.
- Strong aversion to leverage and margin trading. Will not use portfolio margin.
- Acutely aware of cross-border tax complexity as a Taiwanese green card holder. No US-Taiwan tax treaty is a major concern — relies on foreign tax credit only. Knows he needs specialized cross-border tax advice but hasn't found the right advisor yet.
- Believes real estate is a hedge, not a growth asset. Not interested in rental properties — too much hassle.

## Goals & Priorities

### Short-term (2026)
- Max out 401(k) and backdoor Roth for both Alex and Emily.
- Continue META diversification: sell ~$200–300K/year, redirect to VTI/VXUS.
- Build emergency fund to $200K (currently $150K, target is 3 months all-in expenses).
- Fully fund 529 plans for both kids ($10K each, CA deduction).
- File FBAR (FinCEN Form 114) for Taiwan bank account by April 15.

### Medium-term (2027–2030)
- Reduce META concentration to <10% of portfolio (currently ~20%).
- Target net worth $8M by 2030 (currently ~$5.5M).
- Evaluate whether to refinance mortgage if rates drop below 5.5%.
- Start thinking about Ethan's middle school options (private vs. public).
- **Exit tax planning before 2027**: Green card 8-year long-term resident threshold hits in 2027 (IRC 877A). Must decide well before then whether there is any chance of relinquishing green card. With ~$5.5M net worth and $1M+ unrealized META gains, exit tax would be severe. Consult immigration tax specialist in 2026.

### Long-term (2030+)
- Coast FIRE target: $10M invested by age 45, then optionality to downshift.
- Would like to eventually angel invest more seriously ($200K+/year) once core portfolio is de-risked.
- Possible sabbatical or startup attempt in early 40s, but only if financially secure.
- College funding: target $250K per child in 529 by age 18.

## Key Decisions & Context

- **Why so much META stock?** Accumulated 6 years of RSU vesting at Meta. Sold ~40% over the years but still concentrated. Emotionally attached ("it funded our house"). Intellectually knows he should sell faster.
- **Why the $3M Cupertino house?** School district + proximity to both Google (Mountain View) and Emily's startup (Palo Alto). Put $1.2M down from META sales to keep mortgage manageable.
- **Why Google over other offers?** Had competing offers from Stripe (L5 equivalent) and a Series B startup. Chose Google for stability (two young kids), L7 scope, and RSU liquidity.
- **Crypto stance:** Entered BTC/ETH in 2022 bear market. Treats it as a 5% asymmetric bet. Will not go above 5% of portfolio. SOL is more speculative — would sell on a 3x.
- **Angel investments:** NexaFlow was through a Stanford GSB friend. VaultEdge was a YC referral. Both in domains Alex knows (infra, identity). Will do 1–2 deals/year max.
- **Why Alex stays in the US:** Career opportunities at Google, kids' education (Cupertino schools), established financial and social life. But there is a quiet tension — aging parents in Taipei with no siblings nearby. Long-term, Alex would like to spend more time in Taiwan, maybe eventually split time. This creates a real planning dilemma around the 8-year green card threshold: if there is even a small chance of returning to Taiwan, the exit tax clock matters enormously.

## Recent Changes & Events

- **2026-01-15**: Sold 200 META shares ($119K) as part of annual diversification plan. Reallocated to VTI.
- **2026-02-05**: Sold 100 more META shares ($59.5K). Accelerating trim due to high valuation.
- **2026-02-01**: Sold 0.3 BTC ($29.25K) to take partial profits after rally above $95K.
- **2025-09**: Purchased Cupertino home. $3M purchase, $1.2M down, $1.8M mortgage at 6.75%.
- **2024-03**: Joined Google as L7. Initial RSU grant: 6,000 shares over 4 years.
`;

module.exports = {
  meta: {
    key: 'alex',
    name: 'Alex Chen',
    tagline: 'Staff Engineer (L7) @ Google, ex-Meta E6, Taiwanese immigrant, Cupertino, married, NW ~$5.5M'
  },
  stocks, crypto, angelInvestment, employeeEquity, realEstate,
  cash, savings, vehicles, jewelry, art,
  creditCards, mortgage, autoLoan, studentLoan,
  signals, feed, watchlist, taxSummary, profile, categoriesConfig,
  profileMemory
};
