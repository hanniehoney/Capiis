import { getPortfolio, getCategoryConfig } from '../utils/api.js';
import { setCategoryConfig, getCategoryColor, getCategoryLabel } from '../components/charts.js';
import { getDisplayProfile, renderCurrency, renderGainLoss, renderMultiple } from '../config/display-profiles.js';

export async function renderCategoryDetail(container, category) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading...</p></div>`;

  try {
    const [portfolio, config] = await Promise.all([
      getPortfolio(),
      getCategoryConfig().catch(() => null)
    ]);

    if (config) setCategoryConfig(config);

    const isLiability = isLiabilityCategory(category, config);

    if (isLiability) {
      renderLiabilityDetail(container, category, portfolio.liabilities, config);
    } else {
      renderAssetDetail(container, category, portfolio.assets, config);
    }
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load category data</p></div>`;
    console.error(e);
  }
}

function isLiabilityCategory(category, config) {
  if (config && config.liabilityClasses) {
    for (const cls of Object.values(config.liabilityClasses)) {
      if (cls.categories.includes(category)) return true;
    }
  }
  return ['credit-cards', 'mortgage', 'auto-loan', 'student-loan'].includes(category);
}

function renderAssetDetail(container, category, assets, config) {
  const items = assets.filter(a => a.category === category);
  const profile = getDisplayProfile(category, config);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="view-container">
        ${renderCategoryHeader(category, 0, 0, 0, false, profile)}
        <div class="empty-state"><div class="empty-icon">\u25C8</div><p>No positions in ${getCategoryLabel(category)}</p></div>
      </div>
    `;
    return;
  }

  const totalValue = items.reduce((s, a) => s + a.quantity * a.currentPrice, 0);
  const totalCost = items.reduce((s, a) => s + (a.costBasis || a.quantity * a.avgCost), 0);
  const gainLoss = totalValue - totalCost;

  // For private-equity, compute aggregate multiple for the header
  const aggregateMultiple = profile.summary.secondaryMetric === 'multiple' && totalCost > 0
    ? totalValue / totalCost
    : 0;

  container.innerHTML = `
    <div class="view-container">
      ${renderCategoryHeader(category, items.length, totalValue, gainLoss, false, profile, aggregateMultiple)}
      ${renderProfileTable(items, profile)}
    </div>
  `;
}

function renderLiabilityDetail(container, category, liabilities, config) {
  const items = liabilities.filter(l => l.category === category);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="view-container">
        ${renderCategoryHeader(category, 0, 0, 0, true)}
        <div class="empty-state"><div class="empty-icon">\u25C8</div><p>No accounts in ${getCategoryLabel(category)}</p></div>
      </div>
    `;
    return;
  }

  const totalBalance = items.reduce((s, l) => s + l.currentBalance, 0);

  container.innerHTML = `
    <div class="view-container">
      ${renderCategoryHeader(category, items.length, totalBalance, 0, true)}
      ${renderLiabilitiesTable(items)}
    </div>
  `;
}

function renderCategoryHeader(category, count, totalValue, gainLoss, isLiability, profile, aggregateMultiple) {
  const label = getCategoryLabel(category);
  const color = getCategoryColor(category);
  const icon = getCategoryIcon(category);

  const valueLabel = profile && profile.summary.valueLabel ? profile.summary.valueLabel : 'Total Value';
  const showGainLoss = profile ? profile.summary.showGainLoss : !isLiability;
  const secondaryMetric = profile ? profile.summary.secondaryMetric : 'gainLoss';

  const unit = isLiability ? 'accounts' : 'positions';
  const gainPct = totalValue > 0 && showGainLoss && gainLoss !== 0
    ? ((gainLoss / (totalValue - gainLoss)) * 100)
    : 0;
  const isGain = gainLoss >= 0;

  let secondaryHtml = '';
  if (isLiability) {
    // No secondary for liabilities
  } else if (secondaryMetric === 'multiple' && aggregateMultiple > 0) {
    const cls = aggregateMultiple >= 1 ? 'change-positive' : 'change-negative';
    secondaryHtml = `<div class="${cls}" style="font-size:0.85rem;font-family:var(--font-mono)">${aggregateMultiple.toFixed(1)}x return</div>`;
  } else if (showGainLoss && gainLoss !== 0) {
    secondaryHtml = `
      <div class="${isGain ? 'change-positive' : 'change-negative'}" style="font-size:0.85rem;font-family:var(--font-mono)">
        ${isGain ? '+' : '-'}$${formatNumber(Math.abs(gainLoss))} (${isGain ? '+' : ''}${gainPct.toFixed(1)}%)
      </div>
    `;
  }

  return `
    <div class="category-detail-header animate-in stagger-1">
      <div class="category-detail-identity">
        <div class="asset-icon ${category}" style="width:40px;height:40px;font-size:0.85rem">${icon}</div>
        <div>
          <h2 style="margin:0;font-size:1.2rem">${label}</h2>
          <span style="font-size:0.8rem;color:var(--text-tertiary)">${count} ${unit}</span>
        </div>
      </div>
      <div class="category-detail-totals">
        <div class="mono" style="font-size:1.3rem;font-weight:700;color:${isLiability ? 'var(--red)' : 'var(--text-primary)'}">
          ${isLiability ? '-' : ''}$${formatNumber(totalValue)}
        </div>
        ${secondaryHtml}
      </div>
    </div>
  `;
}

function getCategoryIcon(category) {
  const icons = {
    stocks: 'ST',
    crypto: 'CR',
    'angel-investment': 'AI',
    'employee-equity': 'EQ',
    'real-estate': 'RE',
    cash: 'CA',
    savings: 'SA',
    vehicles: 'VH',
    jewelry: 'JW',
    art: 'AR',
    'credit-cards': 'CC',
    mortgage: 'MG',
    'auto-loan': 'AL',
    'student-loan': 'SL'
  };
  return icons[category] || category.slice(0, 2).toUpperCase();
}

// --- Unified profile-based table renderer ---

function renderProfileTable(holdings, profile) {
  // Sort by computed sortValue descending
  const computed = holdings.map(h => ({ h, row: profile.computeRow(h) }));
  computed.sort((a, b) => b.row.sortValue - a.row.sortValue);

  const rows = computed.map(({ h, row }) => {
    const cells = profile.columns.map(col => renderCell(col, h, row)).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const headerCells = profile.columns.map(col => {
    const align = col.align === 'right' ? ' class="align-right"' : '';
    return `<th${align}>${col.label}</th>`;
  }).join('');

  return `
    <div class="card animate-in stagger-2">
      <table class="asset-table">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderCell(col, h, row) {
  switch (col.key) {
    // --- Complex cells that need raw holding ---
    case 'asset':
      return `
        <td>
          <div class="asset-name-cell">
            <div class="asset-icon ${h.category}">${h.ticker.slice(0, 2)}</div>
            <div>
              <div class="asset-name">${h.name}</div>
              <div class="asset-ticker">${h.ticker}</div>
            </div>
          </div>
        </td>`;

    case 'cashAccount':
      return `
        <td>
          <div class="asset-name-cell">
            <div class="asset-icon ${h.category}">${h.name.slice(0, 2)}</div>
            <div>
              <div class="asset-name">${h.name}</div>
              ${h.accountName && h.accountName !== h.name ? `<div class="asset-ticker">${h.accountName}</div>` : ''}
            </div>
          </div>
        </td>`;

    case 'account': {
      const badgeClass = getAccountBadgeClass(h.accountType);
      const badgeLabel = getAccountShortLabel(h.accountType);
      return `
        <td>
          <span class="account-type-badge ${badgeClass}">${badgeLabel}</span>
          ${h.accountName ? `<div style="font-size:0.7rem;color:var(--text-tertiary);margin-top:2px">${h.accountName}</div>` : ''}
        </td>`;
    }

    case 'grant':
      return `
        <td>
          <div class="asset-name-cell">
            <div class="asset-icon ${h.category}">${h.ticker.slice(0, 2)}</div>
            <div>
              <div class="asset-name">${h.name}</div>
              <div class="asset-ticker">${h.ticker}</div>
            </div>
          </div>
        </td>`;

    case 'equityType': {
      const typeBadge = h.equityType
        ? `<span class="equity-type-badge equity-${h.equityType.toLowerCase()}">${h.equityType}</span>`
        : '';
      return `<td>${typeBadge}</td>`;
    }

    case 'company':
      return `
        <td>
          <div class="asset-name-cell">
            <div class="asset-icon ${h.category}">${h.name.slice(0, 2)}</div>
            <div>
              <div class="asset-name">${h.name}</div>
              <div class="asset-ticker">${h.ticker === 'PRIVATE' ? 'Private' : h.ticker}</div>
            </div>
          </div>
        </td>`;

    case 'item':
      return `
        <td>
          <div class="asset-name-cell">
            <div class="asset-icon ${h.category}">${h.name.slice(0, 2)}</div>
            <div>
              <div class="asset-name">${h.name}</div>
              <div class="asset-ticker">${h.ticker}</div>
            </div>
          </div>
        </td>`;

    // --- Simple computed value cells ---
    case 'value':
      return `<td class="mono align-right">$${formatNumber(row.value)}</td>`;

    case 'costBasis':
      return `<td class="mono align-right">$${formatNumber(row.cost)}</td>`;

    case 'gainLoss': {
      const gl = row.gainLoss;
      const pct = row.gainLossPct;
      const isGain = gl >= 0;
      const cls = gl > 0 ? 'change-positive' : gl < 0 ? 'change-negative' : 'change-neutral';
      return `
        <td class="mono align-right ${cls}">
          ${isGain ? '+' : '-'}$${formatNumber(Math.abs(gl))}<br>
          <small style="opacity:0.7">${isGain ? '+' : ''}${pct.toFixed(1)}%</small>
        </td>`;
    }

    case 'balance':
      return `<td class="mono align-right">$${formatNumber(row.balance)}</td>`;

    case 'type': {
      const badgeClass = getAccountBadgeClass(h.accountType);
      const badgeLabel = getAccountShortLabel(h.accountType);
      return `<td><span class="account-type-badge ${badgeClass}">${badgeLabel}</span></td>`;
    }

    case 'growth': {
      const g = row.growth;
      const gPct = row.growthPct;
      if (g === 0) return `<td class="mono align-right change-neutral">-</td>`;
      const isGain = g >= 0;
      const cls = g > 0 ? 'change-positive' : g < 0 ? 'change-negative' : 'change-neutral';
      return `
        <td class="mono align-right ${cls}">
          ${isGain ? '+' : '-'}$${formatNumber(Math.abs(g))}<br>
          <small style="opacity:0.7">${isGain ? '+' : ''}${gPct.toFixed(1)}%</small>
        </td>`;
    }

    case 'invested':
      return `<td class="mono align-right">$${formatNumber(row.invested)}</td>`;

    case 'estValue':
      return `<td class="mono align-right">$${formatNumber(row.estValue)}</td>`;

    case 'returnMultiple': {
      const m = row.multiple;
      const cls = m >= 1 ? 'change-positive' : 'change-negative';
      return `<td class="mono align-right ${cls}">${m.toFixed(1)}x</td>`;
    }

    case 'strike':
      return `<td class="mono align-right">${h.strikePrice != null ? '$' + formatNumber(h.strikePrice) : '-'}</td>`;

    case 'vesting':
      return `<td class="mono align-right">${h.vestingSchedule || '-'}</td>`;

    case 'originalValue':
      return `<td class="mono align-right">$${formatNumber(row.originalValue)}</td>`;

    case 'currentValue':
      return `<td class="mono align-right">$${formatNumber(row.currentValue)}</td>`;

    case 'appreciation': {
      const a = row.appreciation;
      const aPct = row.appreciationPct;
      const isGain = a >= 0;
      const cls = a > 0 ? 'change-positive' : a < 0 ? 'change-negative' : 'change-neutral';
      return `
        <td class="mono align-right ${cls}">
          ${isGain ? '+' : '-'}$${formatNumber(Math.abs(a))}<br>
          <small style="opacity:0.7">${isGain ? '+' : ''}${aPct.toFixed(1)}%</small>
        </td>`;
    }

    default:
      return `<td>-</td>`;
  }
}

// --- Liabilities table (unchanged) ---

function renderLiabilitiesTable(liabilities) {
  const sorted = [...liabilities].sort((a, b) => b.currentBalance - a.currentBalance);

  const rows = sorted.map(l => {
    return `
      <tr>
        <td>
          <div class="asset-name-cell">
            <div class="asset-icon liability ${l.category}">${l.name.slice(0, 2)}</div>
            <div>
              <div class="asset-name">${l.name}</div>
              <div class="asset-ticker">${l.type}</div>
            </div>
          </div>
        </td>
        <td class="mono align-right change-negative">$${formatNumber(l.currentBalance)}</td>
        <td class="mono align-right">${l.interestRate.toFixed(2)}%</td>
        <td class="mono align-right">$${formatNumber(l.monthlyPayment)}</td>
        <td class="mono align-right">${formatDueDate(l.dueDate)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="card animate-in stagger-2">
      <table class="asset-table">
        <thead>
          <tr>
            <th>Name</th>
            <th class="align-right">Balance</th>
            <th class="align-right">Rate</th>
            <th class="align-right">Payment</th>
            <th class="align-right">Due Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// --- Utility functions ---

function formatNumber(n) {
  return Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatDueDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getAccountBadgeClass(accountType) {
  const map = {
    'taxable': 'taxable',
    'traditional-ira': 'tax-deferred',
    'roth-ira': 'tax-exempt',
    'traditional-401k': 'tax-deferred',
    'roth-401k': 'tax-exempt',
    'hsa': 'tax-advantaged',
    '529': 'tax-advantaged',
    'direct': 'taxable',
    'checking': 'taxable',
    'savings': 'taxable'
  };
  return map[accountType] || 'taxable';
}

function getAccountShortLabel(accountType) {
  const map = {
    'taxable': 'Taxable',
    'traditional-ira': 'Trad IRA',
    'roth-ira': 'Roth IRA',
    'traditional-401k': '401(k)',
    'roth-401k': 'Roth 401k',
    'hsa': 'HSA',
    '529': '529',
    'direct': 'Direct',
    'checking': 'Checking',
    'savings': 'Savings'
  };
  return map[accountType] || accountType || 'Taxable';
}
