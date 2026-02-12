import { getPortfolio, getCategoryConfig } from '../utils/api.js';
import { setCategoryConfig, getCategoryColor, getCategoryLabel } from '../components/charts.js';

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

  if (items.length === 0) {
    container.innerHTML = `
      <div class="view-container">
        ${renderCategoryHeader(category, 0, 0, 0, false)}
        <div class="empty-state"><div class="empty-icon">\u25C8</div><p>No positions in ${getCategoryLabel(category)}</p></div>
      </div>
    `;
    return;
  }

  const totalValue = items.reduce((s, a) => s + a.quantity * a.currentPrice, 0);
  const totalCost = items.reduce((s, a) => s + (a.costBasis || a.quantity * a.avgCost), 0);
  const gainLoss = totalValue - totalCost;

  const isEquity = category === 'employee-equity';
  container.innerHTML = `
    <div class="view-container">
      ${renderCategoryHeader(category, items.length, totalValue, gainLoss, false)}
      ${isEquity ? renderEquityTable(items) : renderHoldingsTable(items)}
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

function renderCategoryHeader(category, count, totalValue, gainLoss, isLiability) {
  const label = getCategoryLabel(category);
  const color = getCategoryColor(category);
  const icon = getCategoryIcon(category);
  const unit = isLiability ? 'accounts' : 'positions';
  const gainPct = totalValue > 0 && !isLiability && gainLoss !== 0
    ? ((gainLoss / (totalValue - gainLoss)) * 100)
    : 0;
  const isGain = gainLoss >= 0;

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
        ${!isLiability && gainLoss !== 0 ? `
          <div class="${isGain ? 'change-positive' : 'change-negative'}" style="font-size:0.85rem;font-family:var(--font-mono)">
            ${isGain ? '+' : '-'}$${formatNumber(Math.abs(gainLoss))} (${isGain ? '+' : ''}${gainPct.toFixed(1)}%)
          </div>
        ` : ''}
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

function renderHoldingsTable(holdings) {
  const sorted = [...holdings].sort((a, b) => {
    const valA = a.quantity * a.currentPrice;
    const valB = b.quantity * b.currentPrice;
    return valB - valA;
  });

  const rows = sorted.map(h => {
    const value = h.quantity * h.currentPrice;
    const cost = h.costBasis || (h.quantity * h.avgCost);
    const gainLoss = value - cost;
    const gainLossPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
    const isGain = gainLoss >= 0;
    const gainClass = gainLoss > 0 ? 'change-positive' : gainLoss < 0 ? 'change-negative' : 'change-neutral';

    const badgeClass = getAccountBadgeClass(h.accountType);
    const badgeLabel = getAccountShortLabel(h.accountType);

    return `
      <tr>
        <td>
          <div class="asset-name-cell">
            <div class="asset-icon ${h.category}">${h.ticker.slice(0, 2)}</div>
            <div>
              <div class="asset-name">${h.name}</div>
              <div class="asset-ticker">${h.ticker}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="account-type-badge ${badgeClass}">${badgeLabel}</span>
          ${h.accountName ? `<div style="font-size:0.7rem;color:var(--text-tertiary);margin-top:2px">${h.accountName}</div>` : ''}
        </td>
        <td class="mono align-right">$${formatNumber(value)}</td>
        <td class="mono align-right">$${formatNumber(cost)}</td>
        <td class="mono align-right ${gainClass}">
          ${isGain ? '+' : '-'}$${formatNumber(Math.abs(gainLoss))}<br>
          <small style="opacity:0.7">${isGain ? '+' : ''}${gainLossPct.toFixed(1)}%</small>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="card animate-in stagger-2">
      <table class="asset-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Account</th>
            <th class="align-right">Value</th>
            <th class="align-right">Cost Basis</th>
            <th class="align-right">P&L</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderEquityTable(holdings) {
  const sorted = [...holdings].sort((a, b) => {
    const valA = a.quantity * a.currentPrice;
    const valB = b.quantity * b.currentPrice;
    return valB - valA;
  });

  const rows = sorted.map(h => {
    const value = h.quantity * h.currentPrice;
    const cost = h.costBasis || (h.quantity * h.avgCost);
    const gainLoss = value - cost;
    const gainLossPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
    const isGain = gainLoss >= 0;
    const gainClass = gainLoss > 0 ? 'change-positive' : gainLoss < 0 ? 'change-negative' : 'change-neutral';

    const typeBadge = h.equityType
      ? `<span class="equity-type-badge equity-${h.equityType.toLowerCase()}">${h.equityType}</span>`
      : '';

    return `
      <tr>
        <td>
          <div class="asset-name-cell">
            <div class="asset-icon ${h.category}">${h.ticker.slice(0, 2)}</div>
            <div>
              <div class="asset-name">${h.name}</div>
              <div class="asset-ticker">${h.ticker}</div>
            </div>
          </div>
        </td>
        <td>${typeBadge}</td>
        <td class="mono align-right">$${formatNumber(value)}</td>
        <td class="mono align-right">${h.strikePrice != null ? '$' + formatNumber(h.strikePrice) : '-'}</td>
        <td class="mono align-right">${h.vestingSchedule || '-'}</td>
        <td class="mono align-right ${gainClass}">
          ${isGain ? '+' : '-'}$${formatNumber(Math.abs(gainLoss))}<br>
          <small style="opacity:0.7">${isGain ? '+' : ''}${gainLossPct.toFixed(1)}%</small>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="card animate-in stagger-2">
      <table class="asset-table">
        <thead>
          <tr>
            <th>Grant</th>
            <th>Type</th>
            <th class="align-right">Value</th>
            <th class="align-right">Strike</th>
            <th class="align-right">Vesting</th>
            <th class="align-right">P&L</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

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

function formatCurrency(n) {
  if (Math.abs(n) >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

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
