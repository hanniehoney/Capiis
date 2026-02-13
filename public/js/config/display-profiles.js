// Display Profile System
// Each asset category maps to a display profile that determines
// which columns render in the category detail table.

const DISPLAY_PROFILES = {
  'market-traded': {
    columns: [
      { key: 'asset', label: 'Asset', align: 'left' },
      { key: 'account', label: 'Account', align: 'left' },
      { key: 'value', label: 'Value', align: 'right' },
      { key: 'costBasis', label: 'Cost Basis', align: 'right' },
      { key: 'gainLoss', label: 'P&L', align: 'right' }
    ],
    summary: { showGainLoss: true, valueLabel: 'Total Value', secondaryMetric: 'gainLoss' },
    computeRow(h) {
      const value = h.quantity * h.currentPrice;
      const cost = h.costBasis || (h.quantity * h.avgCost);
      const gainLoss = value - cost;
      const gainLossPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
      return { value, cost, gainLoss, gainLossPct, sortValue: value };
    }
  },

  'cash-like': {
    columns: [
      { key: 'account', label: 'Account', align: 'left' },
      { key: 'type', label: 'Type', align: 'left' },
      { key: 'balance', label: 'Balance', align: 'right' }
    ],
    summary: { showGainLoss: false, valueLabel: 'Total Balance', secondaryMetric: null },
    computeRow(h) {
      const balance = h.quantity * h.currentPrice;
      return { balance, sortValue: balance };
    }
  },

  'yield-bearing': {
    columns: [
      { key: 'account', label: 'Account', align: 'left' },
      { key: 'type', label: 'Type', align: 'left' },
      { key: 'balance', label: 'Balance', align: 'right' },
      { key: 'growth', label: 'Growth', align: 'right' }
    ],
    summary: { showGainLoss: true, valueLabel: 'Total Balance', secondaryMetric: 'gainLoss' },
    computeRow(h) {
      const balance = h.quantity * h.currentPrice;
      const deposited = h.costBasis || (h.quantity * h.avgCost);
      const growth = balance - deposited;
      const growthPct = deposited > 0 ? ((balance - deposited) / deposited) * 100 : 0;
      return { balance, deposited, growth, growthPct, sortValue: balance };
    }
  },

  'private-equity': {
    columns: [
      { key: 'company', label: 'Company', align: 'left' },
      { key: 'invested', label: 'Invested', align: 'right' },
      { key: 'estValue', label: 'Est. Value', align: 'right' },
      { key: 'returnMultiple', label: 'Return', align: 'right' }
    ],
    summary: { showGainLoss: false, valueLabel: 'Est. Total Value', secondaryMetric: 'multiple' },
    computeRow(h) {
      const invested = h.costBasis || (h.quantity * h.avgCost);
      const estValue = h.quantity * h.currentPrice;
      const multiple = invested > 0 ? estValue / invested : 0;
      return { invested, estValue, multiple, sortValue: estValue };
    }
  },

  'employee-equity': {
    columns: [
      { key: 'grant', label: 'Grant', align: 'left' },
      { key: 'equityType', label: 'Type', align: 'left' },
      { key: 'value', label: 'Value', align: 'right' },
      { key: 'strike', label: 'Strike', align: 'right' },
      { key: 'vesting', label: 'Vesting', align: 'right' },
      { key: 'gainLoss', label: 'P&L', align: 'right' }
    ],
    summary: { showGainLoss: true, valueLabel: 'Total Value', secondaryMetric: 'gainLoss' },
    computeRow(h) {
      const value = h.quantity * h.currentPrice;
      const cost = h.costBasis || (h.quantity * h.avgCost);
      const gainLoss = value - cost;
      const gainLossPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
      return { value, cost, gainLoss, gainLossPct, sortValue: value };
    }
  },

  'physical-asset': {
    columns: [
      { key: 'item', label: 'Item', align: 'left' },
      { key: 'originalValue', label: 'Original Value', align: 'right' },
      { key: 'currentValue', label: 'Current Value', align: 'right' },
      { key: 'appreciation', label: 'Appreciation', align: 'right' }
    ],
    summary: { showGainLoss: true, valueLabel: 'Total Value', secondaryMetric: 'gainLoss' },
    computeRow(h) {
      const originalValue = h.costBasis || (h.quantity * h.avgCost);
      const currentValue = h.quantity * h.currentPrice;
      const appreciation = currentValue - originalValue;
      const appreciationPct = originalValue > 0 ? ((currentValue - originalValue) / originalValue) * 100 : 0;
      return { originalValue, currentValue, appreciation, appreciationPct, sortValue: currentValue };
    }
  }
};

// Hardcoded fallback map for categories without displayProfile in config
const CATEGORY_PROFILE_MAP = {
  stocks: 'market-traded',
  crypto: 'market-traded',
  cash: 'cash-like',
  savings: 'yield-bearing',
  'angel-investment': 'private-equity',
  'employee-equity': 'employee-equity',
  'real-estate': 'physical-asset',
  vehicles: 'physical-asset',
  jewelry: 'physical-asset',
  art: 'physical-asset'
};

export function getDisplayProfile(category, config) {
  // 1. Check categoryMeta in config for displayProfile field
  if (config && config.categoryMeta && config.categoryMeta[category] && config.categoryMeta[category].displayProfile) {
    const profileKey = config.categoryMeta[category].displayProfile;
    if (DISPLAY_PROFILES[profileKey]) return DISPLAY_PROFILES[profileKey];
  }
  // 2. Hardcoded fallback map
  const mapped = CATEGORY_PROFILE_MAP[category];
  if (mapped && DISPLAY_PROFILES[mapped]) return DISPLAY_PROFILES[mapped];
  // 3. Default to market-traded
  return DISPLAY_PROFILES['market-traded'];
}

export function renderCurrency(n) {
  return '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function renderGainLoss(value, pct) {
  const isGain = value >= 0;
  const cls = value > 0 ? 'change-positive' : value < 0 ? 'change-negative' : 'change-neutral';
  return `<span class="mono ${cls}">${isGain ? '+' : '-'}$${renderNumber(Math.abs(value))}<br><small style="opacity:0.7">${isGain ? '+' : ''}${pct.toFixed(1)}%</small></span>`;
}

export function renderMultiple(multiple) {
  const formatted = multiple.toFixed(1) + 'x';
  const cls = multiple >= 1 ? 'change-positive' : 'change-negative';
  return `<span class="mono ${cls}">${formatted}</span>`;
}

function renderNumber(n) {
  return Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export { DISPLAY_PROFILES };
