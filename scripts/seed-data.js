const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function write(filename, data) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  console.log(`  wrote data/${filename}`);
}

// --- Portfolio ---
const portfolio = {
  lastUpdated: '2026-02-11T08:00:00Z',
  holdings: [
    {
      id: 'aapl', name: 'Apple Inc.', ticker: 'AAPL', category: 'stocks',
      quantity: 150, avgCost: 178.50, currentPrice: 242.30, change24h: 1.8,
      sparkline7d: [235, 238, 236, 240, 239, 241, 242.3],
      notes: 'Long-term hold. Services revenue accelerating.'
    },
    {
      id: 'nvda', name: 'NVIDIA Corp.', ticker: 'NVDA', category: 'stocks',
      quantity: 80, avgCost: 485.00, currentPrice: 892.50, change24h: 3.2,
      sparkline7d: [845, 860, 855, 870, 878, 885, 892.5],
      notes: 'AI infrastructure leader. High conviction.'
    },
    {
      id: 'msft', name: 'Microsoft', ticker: 'MSFT', category: 'stocks',
      quantity: 100, avgCost: 310.00, currentPrice: 445.80, change24h: -0.5,
      sparkline7d: [448, 450, 447, 446, 445, 446, 445.8],
      notes: 'Cloud + AI play. Azure growth strong.'
    },
    {
      id: 'tsla', name: 'Tesla Inc.', ticker: 'TSLA', category: 'stocks',
      quantity: 60, avgCost: 195.00, currentPrice: 385.20, change24h: -2.1,
      sparkline7d: [395, 392, 390, 388, 387, 386, 385.2],
      notes: 'Robotaxi catalyst pending. Volatile.'
    },
    {
      id: 'amzn', name: 'Amazon', ticker: 'AMZN', category: 'stocks',
      quantity: 90, avgCost: 145.00, currentPrice: 228.60, change24h: 0.9,
      sparkline7d: [224, 225, 226, 225, 227, 228, 228.6],
      notes: 'AWS margins expanding. Advertising segment growing.'
    },
    {
      id: 'btc', name: 'Bitcoin', ticker: 'BTC', category: 'crypto',
      quantity: 2.5, avgCost: 42000, currentPrice: 97500, change24h: -3.2,
      sparkline7d: [101000, 99800, 98200, 99500, 98000, 97800, 97500],
      notes: 'Core crypto position. DCA strategy. Halving cycle thesis.'
    },
    {
      id: 'eth', name: 'Ethereum', ticker: 'ETH', category: 'crypto',
      quantity: 25, avgCost: 2200, currentPrice: 3180, change24h: -1.8,
      sparkline7d: [3280, 3250, 3220, 3200, 3190, 3185, 3180],
      notes: 'Layer 1 ecosystem. Staking yield ~4%. Long-term hold.'
    },
    {
      id: 'sol', name: 'Solana', ticker: 'SOL', category: 'crypto',
      quantity: 200, avgCost: 45, currentPrice: 185, change24h: 2.5,
      sparkline7d: [175, 178, 180, 182, 183, 184, 185],
      notes: 'High-performance L1. DeFi/NFT ecosystem growth.'
    },
    {
      id: 'startup-nexaflow', name: 'NexaFlow', ticker: 'PRIVATE', category: 'startups',
      quantity: 1, avgCost: 50000, currentPrice: 120000, change24h: 0,
      sparkline7d: [120000, 120000, 120000, 120000, 120000, 120000, 120000],
      notes: 'Seed round. AI-powered supply chain. Est. valuation $12M. 1% equity.'
    },
    {
      id: 'startup-carbonlens', name: 'CarbonLens', ticker: 'PRIVATE', category: 'startups',
      quantity: 1, avgCost: 75000, currentPrice: 95000, change24h: 0,
      sparkline7d: [95000, 95000, 95000, 95000, 95000, 95000, 95000],
      notes: 'Series A. Carbon credit marketplace. Est. valuation $25M. 0.38% equity.'
    },
    {
      id: 'startup-vaultedge', name: 'VaultEdge', ticker: 'PRIVATE', category: 'startups',
      quantity: 1, avgCost: 25000, currentPrice: 25000, change24h: 0,
      sparkline7d: [25000, 25000, 25000, 25000, 25000, 25000, 25000],
      notes: 'Pre-seed. Decentralized identity for fintech. Earliest stage, highest risk.'
    }
  ]
};

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
    {
      id: 'f-001', source: 'Bloomberg', headline: 'Bitcoin Falls Below $98K as Crypto Market Faces Profit-Taking',
      summary: 'Major cryptocurrencies declined overnight as traders locked in gains from the recent rally. BTC dropped 3.2% while ETH fell 1.8%.',
      url: '#', timestamp: '2026-02-11T08:00:00Z', category: 'crypto', relevanceScore: 9
    },
    {
      id: 'f-002', source: 'Reuters', headline: 'NVIDIA Set to Report Q4 Earnings Amid AI Spending Boom',
      summary: 'Analysts expect NVIDIA to post record revenue of $38.5B, driven by surging demand for AI training chips from hyperscalers.',
      url: '#', timestamp: '2026-02-11T07:30:00Z', category: 'earnings', relevanceScore: 9
    },
    {
      id: 'f-003', source: 'TechCrunch', headline: 'AI Supply Chain Startup NexaFlow Enters Series A Discussions',
      summary: 'NexaFlow, which uses AI to optimize supply chain logistics, is reportedly in talks with Tier 1 VCs for a $30M Series A round.',
      url: '#', timestamp: '2026-02-11T06:00:00Z', category: 'startups', relevanceScore: 10
    },
    {
      id: 'f-004', source: 'CNBC', headline: 'Fed Officials Signal Patience on Rate Cuts Amid Sticky Inflation',
      summary: 'Federal Reserve governors emphasized data dependency, suggesting rate cuts may be delayed until clear evidence of inflation returning to target.',
      url: '#', timestamp: '2026-02-11T05:45:00Z', category: 'macro', relevanceScore: 7
    },
    {
      id: 'f-005', source: 'CoinDesk', headline: 'Solana DeFi TVL Hits All-Time High of $18B',
      summary: 'Solana ecosystem DeFi protocols reached record total value locked, with Raydium and Marinade leading the charge.',
      url: '#', timestamp: '2026-02-10T22:00:00Z', category: 'crypto', relevanceScore: 8
    },
    {
      id: 'f-006', source: 'WSJ', headline: 'Apple Services Revenue Grows 18% as Hardware Sales Stabilize',
      summary: 'Apple reported strong services growth driven by App Store, Apple TV+, and Apple Pay. iPhone sales showed modest recovery in Greater China.',
      url: '#', timestamp: '2026-02-10T20:00:00Z', category: 'earnings', relevanceScore: 8
    },
    {
      id: 'f-007', source: 'Bloomberg', headline: 'Tesla Robotaxi Approval Expected in Austin by Q2 2026',
      summary: 'Regulatory sources indicate Tesla may receive its first autonomous ride-hailing permit in Austin, Texas, as early as April.',
      url: '#', timestamp: '2026-02-10T18:30:00Z', category: 'earnings', relevanceScore: 8
    },
    {
      id: 'f-008', source: 'Financial Times', headline: 'Global Carbon Credit Market Surges Past $1 Trillion',
      summary: 'The voluntary carbon market has grown 40% year-over-year, with compliance markets driving institutional adoption and price discovery.',
      url: '#', timestamp: '2026-02-10T16:00:00Z', category: 'startups', relevanceScore: 7
    },
    {
      id: 'f-009', source: 'Reuters', headline: 'Microsoft Azure Revenue Grows 32% on AI Workload Demand',
      summary: 'Microsoft cloud segment exceeded expectations with AI-related workloads accounting for over 10% of Azure consumption revenue.',
      url: '#', timestamp: '2026-02-10T14:00:00Z', category: 'earnings', relevanceScore: 8
    },
    {
      id: 'f-010', source: 'CoinDesk', headline: 'Ethereum Layer 2 Networks Process More Transactions Than Mainnet',
      summary: 'Combined L2 throughput now exceeds Ethereum mainnet by 5x, with Arbitrum and Base leading in daily active addresses.',
      url: '#', timestamp: '2026-02-10T12:00:00Z', category: 'crypto', relevanceScore: 6
    },
    {
      id: 'f-011', source: 'TechCrunch', headline: 'Decentralized Identity Startup VaultEdge Joins Y Combinator W26',
      summary: 'VaultEdge, building privacy-preserving identity verification for fintech, was accepted into Y Combinator Winter 2026 batch.',
      url: '#', timestamp: '2026-02-10T10:00:00Z', category: 'startups', relevanceScore: 9
    },
    {
      id: 'f-012', source: 'Bloomberg', headline: 'Amazon AWS Launches Next-Gen Graviton5 Chips',
      summary: 'Amazon Web Services unveiled its latest custom silicon, promising 40% better price-performance for cloud workloads.',
      url: '#', timestamp: '2026-02-10T08:00:00Z', category: 'earnings', relevanceScore: 7
    },
    {
      id: 'f-013', source: 'CNBC', headline: 'US Consumer Confidence Rises for Third Straight Month',
      summary: 'The Conference Board Consumer Confidence Index rose to 118.2, with consumers expressing optimism about the labor market.',
      url: '#', timestamp: '2026-02-09T20:00:00Z', category: 'macro', relevanceScore: 5
    },
    {
      id: 'f-014', source: 'Financial Times', headline: 'Japan Central Bank Hints at Further Rate Normalization',
      summary: 'BOJ Governor signaled readiness for additional rate increases if wage growth continues, potentially strengthening the yen.',
      url: '#', timestamp: '2026-02-09T18:00:00Z', category: 'macro', relevanceScore: 6
    },
    {
      id: 'f-015', source: 'CoinDesk', headline: 'Bitcoin Mining Difficulty Reaches New All-Time High',
      summary: 'Network difficulty adjusted upward 4.2% as hash rate continues to climb post-halving, squeezing less efficient miners.',
      url: '#', timestamp: '2026-02-09T14:00:00Z', category: 'crypto', relevanceScore: 5
    },
    {
      id: 'f-016', source: 'WSJ', headline: 'Private Markets See Record Dry Powder at $4.2 Trillion',
      summary: 'PE and VC firms are sitting on unprecedented levels of uninvested capital, with AI and climate tech attracting the most interest.',
      url: '#', timestamp: '2026-02-09T10:00:00Z', category: 'macro', relevanceScore: 6
    }
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

// --- Write all ---
console.log('\nSeeding Capis data...\n');
write('portfolio.json', portfolio);
write('signals.json', signals);
write('feed.json', feed);
write('watchlist.json', watchlist);
write('tax-summary.json', taxSummary);
console.log('\nDone. All mock data written to data/\n');
