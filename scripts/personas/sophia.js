// ============================================================
// PERSONA: Sophia Zhang — Anthropic Staff Research Engineer
// ============================================================
// Age 32, Staff Research Engineer (IC5) at Anthropic, early employee #47
// British citizen (British-Chinese, parents from Hong Kong, raised in London)
// PhD ML from University of Cambridge, BA CS from Imperial College London
// Previously: Research Scientist at DeepMind London (2020-2021)
// Moved to Anthropic SF Jan 2022 on O-1A visa. EB-1A green card pending.
// Base $450K, equity vest ~$375K/yr, bonus $50K → total ~$875K
// Net worth ~$4.3M, heavily concentrated in Anthropic private stock
// Single, no kids, rents in Hayes Valley SF
// UK assets: DeepMind pension (~£35K), ISA + savings (~£50K) — FBAR/FATCA

// --- Stocks ---
// Taxable brokerage at Schwab (~$700K) + 401(k) at Fidelity (~$300K) + Roth IRA (~$50K)
const stocks = [
  // === Taxable — Schwab Brokerage ===
  {
    id: 'vti', name: 'Vanguard Total Stock Market ETF', ticker: 'VTI',
    quantity: 1200, avgCost: 215, currentPrice: 280,
    notes: 'Core diversified holding. Funded by Anthropic tender offer proceeds (2024-2025). Tax-efficient broad market.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2024-12-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'vxus', name: 'Vanguard Total Intl Stock ETF', ticker: 'VXUS',
    quantity: 1500, avgCost: 52, currentPrice: 60,
    notes: 'International diversification. Foreign tax credit eligible.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2024-12-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'qqq', name: 'Invesco QQQ Trust', ticker: 'QQQ',
    quantity: 250, avgCost: 385, currentPrice: 530,
    notes: 'Nasdaq-100 exposure. Tech-heavy tilt — comfortable given domain expertise.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2025-01-10', lastUpdated: '2026-02-12'
  },
  {
    id: 'bnd', name: 'Vanguard Total Bond Market ETF', ticker: 'BND',
    quantity: 500, avgCost: 74, currentPrice: 72,
    notes: 'Bond allocation for stability. Slight loss from rate hikes.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2025-03-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'aapl', name: 'Apple Inc.', ticker: 'AAPL',
    quantity: 150, avgCost: 180, currentPrice: 242,
    notes: 'Long-term conviction hold. On-device AI play.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2024-11-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'nvda', name: 'NVIDIA Corp.', ticker: 'NVDA',
    quantity: 50, avgCost: 490, currentPrice: 892,
    notes: 'AI infrastructure leader. High conviction — understands the compute moat deeply.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2025-01-20', lastUpdated: '2026-02-12'
  },
  {
    id: 'schd', name: 'Schwab US Dividend Equity ETF', ticker: 'SCHD',
    quantity: 300, avgCost: 70, currentPrice: 82,
    notes: 'Dividend ETF for passive income. Diversification from growth tilt.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '2025-06-01', lastUpdated: '2026-02-12'
  },
  // === 401(k) — Fidelity ===
  {
    id: 'voo-401k', name: 'Vanguard S&P 500 ETF', ticker: 'VOO',
    quantity: 450, avgCost: 385, currentPrice: 520,
    notes: 'Core 401(k) holding. DCA via payroll. No employer match at Anthropic.',
    accountType: 'traditional-401k', accountName: 'Fidelity 401(k)', purchaseDate: '2022-02-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'vxus-401k', name: 'Vanguard Total Intl Stock ETF', ticker: 'VXUS',
    quantity: 400, avgCost: 52, currentPrice: 60,
    notes: 'International diversification in 401(k).',
    accountType: 'traditional-401k', accountName: 'Fidelity 401(k)', purchaseDate: '2022-02-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'bnd-401k', name: 'Vanguard Total Bond Market ETF', ticker: 'BND',
    quantity: 600, avgCost: 74, currentPrice: 72,
    notes: 'Bond allocation in 401(k). Slight loss from rate hikes.',
    accountType: 'traditional-401k', accountName: 'Fidelity 401(k)', purchaseDate: '2022-06-01', lastUpdated: '2026-02-12'
  },
  // === Roth IRA — Fidelity ===
  {
    id: 'vti-roth', name: 'Vanguard Total Stock Market ETF', ticker: 'VTI',
    quantity: 100, avgCost: 225, currentPrice: 280,
    notes: 'Core Roth holding. Tax-free growth. Backdoor Roth contributions.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-01-15', lastUpdated: '2026-02-12'
  },
  {
    id: 'nvda-roth', name: 'NVIDIA Corp.', ticker: 'NVDA',
    quantity: 15, avgCost: 490, currentPrice: 892,
    notes: 'High-growth in Roth for tax-free gains. AI thesis.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-06-20', lastUpdated: '2026-02-12'
  },
  {
    id: 'aapl-roth', name: 'Apple Inc.', ticker: 'AAPL',
    quantity: 35, avgCost: 180, currentPrice: 242,
    notes: 'Long-term hold in Roth. Tax-free dividend growth.',
    accountType: 'roth-ira', accountName: 'Fidelity Roth IRA', purchaseDate: '2023-03-15', lastUpdated: '2026-02-12'
  }
];

// --- Crypto ---
// Small allocation, BTC + ETH only. Under 3% of portfolio.
const crypto = [
  {
    id: 'btc', name: 'Bitcoin', ticker: 'BTC',
    quantity: 0.5, avgCost: 42000, currentPrice: 97500,
    notes: 'Small BTC position. Bought during 2022 bear market. Digital gold thesis.',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2022-12-01', lastUpdated: '2026-02-12'
  },
  {
    id: 'eth', name: 'Ethereum', ticker: 'ETH',
    quantity: 8, avgCost: 2200, currentPrice: 3180,
    notes: 'Layer 1 ecosystem. Intellectual interest. Not a "crypto person."',
    accountType: 'taxable', accountName: 'Coinbase', purchaseDate: '2023-02-10', lastUpdated: '2026-02-12'
  }
];

// --- Angel Investment ---
const angelInvestment = [
  {
    id: 'startup-safeguard', name: 'SafeGuard AI', ticker: 'PRIVATE',
    quantity: 1, avgCost: 25000, currentPrice: 25000,
    notes: 'Seed round. AI safety startup — alignment research commercialization. Ex-Google DeepMind founder. Invested through Anthropic colleague. Too early to mark up.',
    accountType: 'taxable', accountName: 'Direct Investment', purchaseDate: '2025-08-01', lastUpdated: '2026-02-12'
  }
];

// --- Employee Equity ---
// Anthropic stock — the core of her wealth (~$3.32M)
const employeeEquity = [
  {
    id: 'eq-anthropic-iso', name: 'Anthropic ISOs (Vested)', ticker: 'ANTH-PRIV',
    quantity: 75000, avgCost: 3, currentPrice: 40,
    notes: 'Initial grant: 120K ISOs over 4 years (joined Jan 2022). ~90K vested, sold ~15K through 2024 tender offer. Holding 75K. Strike $3, 409A FMV $40. AMT exposure on exercise.',
    accountType: 'taxable', accountName: 'Carta (Anthropic Equity)',
    purchaseDate: '2022-01-15', lastUpdated: '2026-02-12',
    equityType: 'ISO', grantDate: '2022-01-15', vestingSchedule: '4yr with 1yr cliff, monthly after', strikePrice: 3, fmvAtGrant: 5
  },
  {
    id: 'eq-anthropic-refresh', name: 'Anthropic RSUs (Refresh)', ticker: 'ANTH-PRIV',
    quantity: 8000, avgCost: 0, currentPrice: 40,
    notes: 'Refresh grants 2023-2025. ~8K vested and held. Additional ~12K unvested over next 2-3 years.',
    accountType: 'taxable', accountName: 'Carta (Anthropic Equity)',
    purchaseDate: '2023-06-01', lastUpdated: '2026-02-12',
    equityType: 'RSU', grantDate: '2023-06-01', vestingSchedule: '4yr quarterly', strikePrice: 0, fmvAtGrant: 20
  }
];
// Total employee equity: 83K shares x $40 = $3.32M

// --- Real Estate ---
// Renter — no property
const realEstate = [];

// --- Cash ---
const cash = [
  {
    id: 'schwab-checking', name: 'Schwab Checking', ticker: 'CASH',
    quantity: 1, avgCost: 50000, currentPrice: 50000,
    notes: 'Primary checking account.',
    accountType: 'checking', accountName: 'Schwab Checking', purchaseDate: '', lastUpdated: '2026-02-12'
  },
  {
    id: 'schwab-cash', name: 'Schwab Brokerage Cash', ticker: 'CASH',
    quantity: 1, avgCost: 25000, currentPrice: 25000,
    notes: 'Brokerage sweep account.',
    accountType: 'taxable', accountName: 'Schwab Brokerage', purchaseDate: '', lastUpdated: '2026-02-12'
  }
];

// --- Savings ---
const savings = [
  {
    id: 'marcus-hysa', name: 'Marcus HYSA', ticker: 'HYSA',
    quantity: 1, avgCost: 200000, currentPrice: 200000,
    notes: 'High-yield savings. APY 4.5%. Large emergency fund — single income, biggest asset is illiquid private stock. Covers ~4+ years of rent.',
    accountType: 'savings', accountName: 'Marcus HYSA', purchaseDate: '', lastUpdated: '2026-02-12'
  }
];

// --- Vehicles ---
// No car — uses transit, Uber, walks in SF
const vehicles = [];

// --- Jewelry ---
const jewelry = [];

// --- Art ---
const art = [];

// --- Credit Cards (Liability) ---
const creditCards = [
  {
    id: 'amex-gold', name: 'Amex Gold', type: 'Revolving',
    originalAmount: 0, currentBalance: 3500, interestRate: 22.99,
    monthlyPayment: 3500, dueDate: '2026-03-01',
    notes: 'Paid in full monthly. Dining & grocery rewards. SF restaurant spending.'
  }
];

// --- Mortgage (Liability) ---
// No property
const mortgage = [];

// --- Auto Loan (Liability) ---
// No car
const autoLoan = [];

// --- Student Loan (Liability) ---
// PhD was fully funded (Cambridge Gates Scholarship + RA)
const studentLoan = [];

// --- Signals ---
const signals = {
  signals: [
    {
      id: 'sig-001', timestamp: '2026-02-12T08:30:00Z', priority: 'high',
      title: 'Anthropic concentration: $3.3M = 70%+ of net worth',
      body: 'Your 83,000 Anthropic shares (75K ISOs + 8K RSUs) are worth ~$3.32M at current 409A FMV ($40/share). This private stock concentration is ~77% of your total net worth ($4.3M). You cannot freely sell — watch for the next tender offer window to reduce concentration.',
      relatedAssets: ['eq-anthropic-iso', 'eq-anthropic-refresh'], category: 'risk', dismissed: false
    },
    {
      id: 'sig-002', timestamp: '2026-02-12T07:15:00Z', priority: 'high',
      title: 'AMT risk: exercising remaining ISOs could trigger $200K+ in AMT',
      body: 'You hold 75K vested ISOs with $3 strike and $40 FMV. The AMT spread is $37/share. Exercising all at once would create $2.775M in AMT preference income, triggering massive AMT liability. Consider partial exercise strategy — spread over 3-4 tax years. Note: on O-1A visa — if you leave the US, you typically have 90 days to exercise vested ISOs before they convert to NSOs. Plan exercises while employed. Consult cross-border tax advisor given UK ties.',
      relatedAssets: ['eq-anthropic-iso'], category: 'tax', dismissed: false
    },
    {
      id: 'sig-003', timestamp: '2026-02-11T22:00:00Z', priority: 'medium',
      title: 'Next Anthropic tender offer window — plan your strategy',
      body: 'Anthropic has historically offered annual secondary sale opportunities. The last tender was Nov 2025 at ~$38/share. With the new $60B valuation round, the next tender could be at $45-50/share. Plan which lots to sell (ISOs vs RSUs) and estimate tax implications. Target selling $500-750K worth to reduce concentration.',
      relatedAssets: ['eq-anthropic-iso', 'eq-anthropic-refresh'], category: 'startup', dismissed: false
    },
    {
      id: 'sig-004', timestamp: '2026-02-11T16:00:00Z', priority: 'medium',
      title: 'Emergency fund: $200K adequate? Review single-income risk',
      body: 'Your $200K Marcus HYSA covers ~4+ years of rent ($3,800/mo) but consider total monthly expenses including food, insurance, estimated taxes, etc. As a single income earner with 77% of net worth in illiquid stock, maintaining a robust cash buffer is critical. Target $250K.',
      relatedAssets: ['marcus-hysa'], category: 'risk', dismissed: false
    },
    {
      id: 'sig-005', timestamp: '2026-02-11T14:30:00Z', priority: 'medium',
      title: '401(k) max out: $24,500 for 2026 tax deferral',
      body: 'Anthropic does not offer a 401(k) match, but you should still max out your $24,500 contribution for tax deferral. At your 37% federal bracket, this saves ~$9,065 in current-year federal tax. Verify payroll is on track to hit the max by December.',
      relatedAssets: [], category: 'tax', dismissed: false
    },
    {
      id: 'sig-006', timestamp: '2026-02-11T10:00:00Z', priority: 'medium',
      title: 'NVIDIA earnings Feb 18 — combined position ~$58K',
      body: 'NVDA reports Q4 earnings on Feb 18. Your combined position (50 taxable + 15 Roth = 65 shares, ~$58K) is up 82% from avg cost. Consider trimming 10-20% of the taxable lot before earnings to lock in gains and rebalance.',
      relatedAssets: ['nvda', 'nvda-roth'], category: 'earnings', dismissed: false
    },
    {
      id: 'sig-007', timestamp: '2026-02-10T20:00:00Z', priority: 'low',
      title: 'Macro: Fed rate decision in March',
      body: 'The Federal Reserve meets March 18-19. Markets pricing 65% chance of rate hold. Impacts your growth stocks, crypto, and HYSA yield. Current Marcus APY 4.5% — may decline if cuts resume.',
      relatedAssets: [], category: 'macro', dismissed: true
    },
    {
      id: 'sig-008', timestamp: '2026-02-10T12:00:00Z', priority: 'medium',
      title: 'FBAR deadline April 15 — UK accounts reportable',
      body: 'You have 3 UK financial accounts (pension, ISA, savings) with aggregate value ~$107K, well above the $10K FBAR threshold. File FinCEN Form 114 by April 15 (auto-extends to Oct 15). Also file FATCA Form 8938 with your 1040.',
      relatedAssets: [], category: 'tax', dismissed: false
    }
  ]
};

// --- Feed ---
const feed = {
  items: [
    { id: 'f-001', source: 'Bloomberg', headline: 'Anthropic Raises $5B Series E at $60B Valuation', summary: 'Anthropic has closed a $5 billion Series E round led by Google and Spark Capital, valuing the AI safety company at $60 billion. The round follows rapid enterprise adoption of Claude. For early employees like #47, this marks the third major valuation step-up since joining.', url: '#', timestamp: '2026-02-12T08:00:00Z', category: 'startup', relevanceScore: 10 },
    { id: 'f-002', source: 'Reuters', headline: 'AI Safety Regulation Bill Advances in Senate', summary: 'A bipartisan Senate bill requiring frontier AI labs to conduct independent safety evaluations before deployment advanced out of committee. Could impact Anthropic operations and compliance costs.', url: '#', timestamp: '2026-02-12T07:30:00Z', category: 'macro', relevanceScore: 10 },
    { id: 'f-003', source: 'TechCrunch', headline: 'Anthropic Claude Achieves Record Enterprise Adoption', summary: 'Anthropic reports Claude is now used by 60% of Fortune 500 companies, up from 35% a year ago. Enterprise ARR exceeded $1.5B in Q4 2025.', url: '#', timestamp: '2026-02-11T20:00:00Z', category: 'startup', relevanceScore: 9 },
    { id: 'f-004', source: 'WSJ', headline: 'AI Startup Employee Stock Liquidity Improves as Secondary Markets Grow', summary: 'Secondary market platforms report record volume in AI company shares, with Anthropic, OpenAI, and xAI among the most traded. Employees gain more options for pre-IPO liquidity.', url: '#', timestamp: '2026-02-11T18:00:00Z', category: 'startup', relevanceScore: 9 },
    { id: 'f-005', source: 'CNBC', headline: 'SF Rents Stabilize After Two Years of Decline', summary: 'San Francisco rental prices have plateaued, with 1BR median rents at $3,700-$3,900. Hayes Valley and Mission remain the most competitive neighborhoods.', url: '#', timestamp: '2026-02-11T16:00:00Z', category: 'macro', relevanceScore: 7 },
    { id: 'f-006', source: 'Reuters', headline: 'NVIDIA Set to Report Q4 Earnings Amid AI Spending Boom', summary: 'Analysts expect NVIDIA to post record revenue of $38.5B, driven by surging demand for AI training chips from hyperscalers including Anthropic.', url: '#', timestamp: '2026-02-11T14:00:00Z', category: 'earnings', relevanceScore: 8 },
    { id: 'f-007', source: 'Bloomberg', headline: 'OpenAI and Anthropic Compete for Enterprise AI Market', summary: 'The two leading AI labs are in a fierce competition for enterprise contracts, with Anthropic winning on safety reputation and OpenAI on brand recognition.', url: '#', timestamp: '2026-02-11T10:00:00Z', category: 'startup', relevanceScore: 8 },
    { id: 'f-008', source: 'CNBC', headline: 'Fed Officials Signal Patience on Rate Cuts Amid Sticky Inflation', summary: 'Federal Reserve governors emphasized data dependency, suggesting rate cuts may be delayed until clear evidence of inflation returning to target.', url: '#', timestamp: '2026-02-10T18:00:00Z', category: 'macro', relevanceScore: 6 },
    { id: 'f-009', source: 'CoinDesk', headline: 'Bitcoin Falls Below $98K as Crypto Market Faces Profit-Taking', summary: 'Major cryptocurrencies declined overnight as traders locked in gains. BTC dropped 3.2% while ETH fell 1.8%.', url: '#', timestamp: '2026-02-10T14:00:00Z', category: 'crypto', relevanceScore: 6 },
    { id: 'f-010', source: 'TechCrunch', headline: 'SafeGuard AI Accepted to Y Combinator W26 Batch', summary: 'SafeGuard AI, an AI safety startup founded by ex-Google DeepMind researchers, was accepted into Y Combinator Winter 2026. The company is commercializing alignment evaluation tools.', url: '#', timestamp: '2026-02-10T10:00:00Z', category: 'angel-investment', relevanceScore: 9 },
    { id: 'f-011', source: 'WSJ', headline: 'Private Company Employees Face Tax Complexity from Stock Options', summary: 'As AI startups reach massive valuations, early employees confront AMT exposure, ISO exercise timing, and multi-year tax planning challenges. Experts recommend spreading exercises over 3-5 years.', url: '#', timestamp: '2026-02-09T16:00:00Z', category: 'macro', relevanceScore: 9 },
    { id: 'f-012', source: 'Financial Times', headline: 'AI Lab Compensation Arms Race Continues', summary: 'Top AI researchers command $1M+ total compensation packages as Anthropic, OpenAI, Google DeepMind, and Meta AI compete for talent. Staff-level researchers see the largest increases.', url: '#', timestamp: '2026-02-09T10:00:00Z', category: 'macro', relevanceScore: 8 },
    { id: 'f-013', source: 'Financial Times', headline: 'IRS Increases FBAR Enforcement Against US-Based Foreign Account Holders', summary: 'The IRS announced expanded enforcement of FBAR and FATCA obligations for US taxpayers with foreign financial accounts. Penalties for non-willful violations increased to $16,117 per account per year. British expats in the US with UK pensions, ISAs, and bank accounts are particularly affected.', url: '#', timestamp: '2026-02-08T14:00:00Z', category: 'tax', relevanceScore: 9 },
    { id: 'f-014', source: 'The Guardian', headline: 'UK Workplace Pension Reporting Requirements Tighten for US Expats', summary: 'US tax practitioners warn that HMRC and IRS data sharing under FATCA is catching more British citizens abroad who fail to report UK pensions as foreign trusts. Form 3520 penalties can reach 35% of pension value. Cross-border tax specialists recommend proactive disclosure.', url: '#', timestamp: '2026-02-08T10:00:00Z', category: 'tax', relevanceScore: 9 }
  ]
};

// --- Watchlist ---
const watchlist = {
  items: [
    { id: 'w-googl', name: 'Alphabet Inc.', ticker: 'GOOGL', category: 'stocks', currentPrice: 185.00, change24h: 1.2, note: 'Potential employer if leaving Anthropic' },
    { id: 'w-msft', name: 'Microsoft Corp.', ticker: 'MSFT', category: 'stocks', currentPrice: 420.00, change24h: 0.8, note: 'Azure AI competitor, benchmark for AI market' },
    { id: 'w-pltr', name: 'Palantir Technologies', ticker: 'PLTR', category: 'stocks', currentPrice: 78.50, change24h: 4.1, note: 'Enterprise AI play, government contracts' },
    { id: 'w-coin', name: 'Coinbase Global', ticker: 'COIN', category: 'stocks', currentPrice: 245.00, change24h: -2.3, note: 'Crypto exchange — monitor for BTC/ETH exposure correlation' }
  ]
};

// --- Tax Summary ---
const taxSummary = {
  taxYear: 2026,
  jurisdiction: 'US',
  realizedGains: 35000,
  realizedLosses: -2400,
  netRealizedGainLoss: 32600,
  unrealizedGains: 180000,
  unrealizedLosses: -8000,
  estimatedTaxLiability: 12000,
  longTermRate: 0.20,
  shortTermRate: 0.37,
  taxLossHarvestingOpportunities: [
    { asset: 'BND', currentLoss: -1000, potentialSavings: 370, note: 'Bond ETF down from rate hikes. Small loss available.' }
  ],
  taxableEvents: [
    { date: '2026-01-20', type: 'sell', asset: 'VTI', shares: 50, amount: 14000, costBasis: 10750, gain: 3250, term: 'long' },
    { date: '2026-02-03', type: 'sell', asset: 'NVDA', shares: 10, amount: 8920, costBasis: 4900, gain: 4020, term: 'long' },
    { date: '2026-01-15', type: 'sell', asset: 'ETH', units: 2, amount: 6360, costBasis: 4400, gain: 1960, term: 'short' },
    { date: '2026-02-08', type: 'sell', asset: 'BTC', units: 0.1, amount: 9750, costBasis: 4200, gain: 5550, term: 'long' },
    { date: '2026-01-28', type: 'loss', asset: 'BND', units: 100, amount: 7200, costBasis: 7400, gain: -200, term: 'short' }
  ],
  notes: 'Single filer, CA resident. Federal 37% bracket. Key tax risk: AMT from ISO exercise. 2024 tender offer sale of 15K Anthropic shares was taxed as ISO disposition — verify AMT credit carryforward. Plan multi-year ISO exercise strategy to minimize AMT impact. UK cross-border obligations: FBAR (FinCEN 114) for 3 UK accounts >$10K aggregate. FATCA Form 8938 (threshold $200K for single filers abroad, $50K domestic). UK pension (Aviva, ~£35K) reportable as foreign trust — Form 3520/3520-A may apply. US-UK tax treaty Article 17 governs pension taxation. UK ISA has no US tax-free status — gains/income fully taxable. On O-1A visa, EB-1A pending — no long-term resident status yet, so no exit tax risk currently.'
};

// --- Profile ---
const profile = {
  personal: {
    name: 'Sophia',
    age: 32,
    occupation: 'Research Engineer',
    company: 'Anthropic',
    previousCompany: 'DeepMind (London)',
    previousTitle: 'Research Scientist',
    previousTenure: '2 years (2020-2021)',
    yearsOfExperience: 6,
    title: 'Staff Research Engineer',
    baseSalary: 450000,
    totalCashFlow: 875000,
    cashFlowNotes: 'Base $450K + annual equity vest ~$375K (Anthropic options, secondary sales when available) + $50K bonus. Early employee — large initial grant at low strike.',
    nationality: 'British',
    immigration: 'O-1A visa. EB-1A green card pending (filed 2024). No green card yet — no exit tax clock started.',
    education: 'PhD ML, University of Cambridge (2016-2020). BA Computer Science, Imperial College London (2012-2016).'
  },
  family: {
    spouse: null,
    children: []
  },
  location: {
    country: 'US',
    state: 'CA',
    city: 'San Francisco',
    zipCode: '94102',
    fullAddress: '450 Hayes St, San Francisco, CA 94102'
  },
  tax: {
    filingStatus: 'single',
    dependents: 0,
    federalTaxBracket: 0.37,
    stateTaxRate: 0.113,
    longTermCapitalGainsRate: 0.20,
    shortTermCapitalGainsRate: 0.37,
    niit: 0.038,
    niitThreshold: 200000,
    standardDeduction: 16100,
    contributionLimits: {
      traditional401k: 24500,
      catchUp401k: 0,
      ira: 7500,
      catchUpIRA: 0,
      hsaSelf: 4400,
      hsaFamily: 0
    },
    notes: 'California resident — effective ~11.3% state tax. Federal 37% bracket (single, >$609K). LTCG 20%. NIIT 3.8% at $200K. Anthropic ISO/NSO mix — AMT risk on ISO exercise. On O-1A visa, EB-1A green card pending. US-UK tax treaty applies — pension treatment under Article 17. Must file FBAR + FATCA for UK bank accounts (ISA + savings ~£50K). UK DeepMind pension (~£35K) reportable as foreign trust (Form 3520). UK ISA loses tax-free status in US. No UK tax on US income while US-resident (UK SRT non-resident).'
  },
  accounts: [
    { id: 'acct-schwab-checking', name: 'Schwab Checking', type: 'checking', institution: 'Charles Schwab' },
    { id: 'acct-schwab-brokerage', name: 'Schwab Brokerage', type: 'taxable', institution: 'Charles Schwab' },
    { id: 'acct-fidelity-roth', name: 'Fidelity Roth IRA', type: 'roth-ira', institution: 'Fidelity' },
    { id: 'acct-fidelity-401k', name: 'Fidelity 401(k)', type: 'traditional-401k', institution: 'Fidelity' },
    { id: 'acct-coinbase', name: 'Coinbase', type: 'taxable', institution: 'Coinbase' },
    { id: 'acct-carta', name: 'Carta (Anthropic Equity)', type: 'taxable', institution: 'Carta' },
    { id: 'acct-uk-pension', name: 'DeepMind Workplace Pension', type: 'foreign-pension', institution: 'Aviva (UK)' },
    { id: 'acct-uk-isa', name: 'Stocks & Shares ISA', type: 'foreign-taxable', institution: 'Hargreaves Lansdown (UK)' },
    { id: 'acct-uk-savings', name: 'UK Savings Account', type: 'foreign-savings', institution: 'Barclays (UK)' }
  ],
  lastUpdated: '2026-02-12T00:00:00Z'
};

// --- Categories config (shared schema, identical across all personas) ---
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

// --- Profile Memory (narrative context for agents/skills) ---
const profileMemory = `# Sophia — Profile Memory

> Last updated: 2026-02-12

## Career & Identity
- 32 years old, British citizen (British-Chinese, parents from Hong Kong, raised in London)
- Staff Research Engineer at Anthropic, San Francisco
- PhD in ML from University of Cambridge (2016-2020). BA CS from Imperial College London (2012-2016).
- Published 12 papers on alignment and interpretability during PhD and at DeepMind.
- Joined DeepMind London in 2020 as Research Scientist. Worked on safety evaluations and mechanistic interpretability.
- Moved to Anthropic Jan 2022 on O-1A visa. Employee #47. Promoted to Staff (IC5) in 2024.
- EB-1A green card application filed 2024, pending approval. Currently on O-1A.
- No prior US ties before Anthropic — moved directly from London.
- Loves SF but sometimes misses London. Occasionally considers returning to UK long-term.

## Family & Life Stage
- Single, no partner, no kids.
- Parents in London — dad is a retired NHS doctor (originally from Hong Kong), mum is a secondary school maths teacher (originally from Hong Kong).
- One younger sister in London, works in finance (Goldman Sachs, associate level).
- Close friends split between London and SF Bay Area.
- Rents a 1BR in Hayes Valley ($3,800/mo). Walkable lifestyle, no car.
- No plans to buy property in SF — not sure she'll stay long-term. Might return to UK eventually.

## Financial Philosophy & Risk
- Highly analytical but emotionally cautious with money.
- Core belief: diversify away from employer stock ASAP. Knows Anthropic concentration is dangerous but limited by private stock liquidity.
- Sells 15-25% of vested shares whenever tender offer opens, deploys into index funds.
- Keeps large cash reserve ($200K+) — single, no safety net in the US, biggest asset is illiquid.
- Still has UK bank accounts and a DeepMind pension — creates annual FBAR/FATCA headache.
- UK ISA no longer tax-advantaged in the US — should probably liquidate but hasn't gotten around to it.
- Crypto: small speculative position, BTC and ETH only, under 3% of portfolio.
- Risk tolerance: moderate overall. Conservative with emergency fund. Accepts Anthropic concentration as "already happened."
- Rent over own: views rent as "buying optionality" given uncertainty about staying in the US.

## Goals & Priorities

### Short-term (2026)
- Max out 401(k) ($24,500) and backdoor Roth ($7,500).
- Sell Anthropic shares in next tender offer ($500-750K target).
- File FBAR and FATCA for UK accounts (April 15 deadline).
- Engage cross-border tax specialist for UK pension reporting (Form 3520, Form 8833).
- Get EB-1A green card approved — simplifies future planning.

### Medium-term (2027-2030)
- If Anthropic IPOs: structured selling plan to diversify over 18-24 months.
- Target: employer stock below 40% of net worth.
- NW target $8M by 2030.
- Decide: stay in US long-term or return to UK? This affects green card strategy and exit tax planning.
- Consider liquidating UK ISA and consolidating into US accounts.

### Long-term (2030+)
- Financial independence: $6M in diversified assets.
- If staying in US: naturalize? Or keep green card? (Green card = easier exit if she changes her mind.)
- If returning to UK: plan exit BEFORE 8-year long-term resident threshold to avoid US exit tax on Anthropic equity.
- Sabbatical year for independent research or writing.
- Increase charitable giving (EA-aligned, $50K+/year).

## Key Decisions & Context
- **Why Anthropic over staying at DeepMind?** Mission-aligned. Believed Anthropic's approach to safety research was more impactful. Also wanted the US experience. The equity was a bonus, not the primary motivation.
- **Why hold so much Anthropic stock?** Not by choice — private and illiquid. Sells at every tender offer. Would diversify much faster if she could.
- **O-1A vs H-1B?** O-1A was the only realistic option — Anthropic couldn't do L-1 transfer (not same company as DeepMind). Strong publication record made O-1A straightforward.
- **Why no property?** SF too expensive for a single buyer. Doesn't want to anchor herself if she might return to the UK.
- **UK pension:** Small amount (~£35K) from DeepMind. Not worth transferring to the US — would lose tax advantages. But creates annual reporting burden. Considering just leaving it until retirement.
- **ISO exercise strategy:** Has exercised ~30K ISOs in batches across tax years to manage AMT. Planning more in 2026-2027. The AMT trap is her #1 tax anxiety.
- **Exit tax awareness:** Knows about the 8-year long-term resident rule. Her green card (once approved) starts the clock. If she decides to return to UK, she has an 8-year window before exit tax applies to Anthropic equity.

## Recent Changes & Events
- **2026-02-03**: Sold 10 NVDA shares ($8.9K) to rebalance.
- **2026-01-20**: Sold 50 VTI shares ($14K) to fund Q1 estimated tax payment.
- **2025-11**: Anthropic tender offer — sold 15K ISOs at ~$38/share ($570K gross). Deployed into VTI + HYSA for taxes.
- **2025-06**: Promoted to Staff Research Engineer (IC5). 10K RSU refresh grant.
- **2024-11**: Anthropic tender offer — sold 10K ISOs at ~$30/share ($300K gross). First major liquidity event.
- **2024-03**: Exercised 15K ISOs (batch 1). Triggered ~$80K AMT.
- **2024-01**: Filed EB-1A green card petition. Pending.
- **2022-01**: Joined Anthropic on O-1A visa. Grant: 120K ISOs, strike $3, 4yr vest.
- **2020-09**: Joined DeepMind London. Started DeepMind workplace pension.
`;

// --- Export ---
module.exports = {
  meta: {
    key: 'sophia',
    name: 'Sophia Zhang',
    tagline: 'British-Chinese, ex-DeepMind London → Anthropic SF on O-1A, Staff RE, single, NW ~$4.3M'
  },
  stocks,
  crypto,
  angelInvestment,
  employeeEquity,
  realEstate,
  cash,
  savings,
  vehicles,
  jewelry,
  art,
  creditCards,
  mortgage,
  autoLoan,
  studentLoan,
  signals,
  feed,
  watchlist,
  taxSummary,
  profile,
  categoriesConfig,
  profileMemory
};
