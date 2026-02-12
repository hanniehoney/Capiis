import { getPortfolio, getStats, getCategoryConfig } from '../utils/api.js';
import { renderDonutChart, renderSparkline, setCategoryConfig, getCategoryColor, getCategoryLabel } from '../components/charts.js';

let activeTopTab = 'assets';
let activeClassFilter = 'all';

export async function renderPortfolio(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading portfolio...</p></div>`;

  try {
    const [portfolio, stats, config] = await Promise.all([
      getPortfolio(),
      getStats(),
      getCategoryConfig().catch(() => null)
    ]);

    if (config) setCategoryConfig(config);

    const { assets, liabilities } = portfolio;

    container.innerHTML = `
      <div class="view-container">
        ${renderNetWorthCard(stats)}
        ${renderPortfolioSwitch(stats, assets, liabilities)}

        <div id="portfolio-content" class="animate-in stagger-3">
          ${activeTopTab === 'assets'
            ? renderAssetsView(assets, stats, config)
            : renderLiabilitiesView(liabilities, stats, config)}
        </div>
      </div>
    `;

    bindTopTabs(container, assets, liabilities, stats, config);

  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load portfolio data</p></div>`;
    console.error(e);
  }
}

function renderNetWorthCard(stats) {
  return `
    <div class="net-worth-card animate-in stagger-1">
      <div class="nw-main">
        <div class="nw-label">Net Worth</div>
        <div class="nw-value">${formatCurrency(stats.netWorth)}</div>
      </div>
      <div class="nw-breakdown">
        <div class="nw-item">
          <span class="nw-item-label">Total Assets</span>
          <span class="nw-item-value change-positive">${formatCurrency(stats.totalAssetValue)}</span>
        </div>
        <div class="nw-item">
          <span class="nw-item-label">Total Liabilities</span>
          <span class="nw-item-value change-negative">${formatCurrency(stats.totalLiabilities)}</span>
        </div>
        <div class="nw-item">
          <span class="nw-item-label">Debt-to-Asset</span>
          <span class="nw-item-value">${(stats.debtToAssetRatio * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  `;
}

function renderPortfolioSwitch(stats, assets, liabilities) {
  const scopes = [
    { key: 'assets', label: 'Assets', total: stats.totalAssetValue, count: assets.length, unit: 'positions' },
    { key: 'liabilities', label: 'Liability', total: stats.totalLiabilities, count: liabilities.length, unit: 'accounts' }
  ];

  return `
    <div class="scope-switch animate-in stagger-2">
      ${scopes.map(scope => `
        <button
          class="scope-option ${activeTopTab === scope.key ? 'active' : ''}"
          data-tab="${scope.key}"
          type="button"
        >
          <span class="scope-label">${scope.label}</span>
          <span class="scope-value">${formatCurrency(scope.total)}</span>
          <span class="scope-meta">${scope.count} ${scope.unit}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function renderAssetsView(assets, stats, config) {
  const grouped = groupByHierarchy(assets, config, 'asset');
  const classOrder = config ? Object.keys(config.assetClasses) : ['investment'];

  // Compute account type allocation from assets
  const accountTypeAbsolute = {};
  for (const a of assets) {
    const value = a.quantity * a.currentPrice;
    const acctType = a.accountType || 'taxable';
    accountTypeAbsolute[acctType] = (accountTypeAbsolute[acctType] || 0) + value;
  }
  const totalValue = assets.reduce((s, a) => s + a.quantity * a.currentPrice, 0);
  const accountTypeAllocation = {};
  for (const [key, val] of Object.entries(accountTypeAbsolute)) {
    accountTypeAllocation[key] = totalValue > 0 ? (val / totalValue) * 100 : 0;
  }

  return `
    <div class="card" style="margin-bottom:28px">
      <div class="card-header">
        <span class="card-title">Asset Allocation</span>
      </div>
      ${renderDonutChart(stats.allocation, stats.allocationAbsolute, stats.totalAssetValue, 'Total')}
    </div>

    <div class="card" style="margin-bottom:28px">
      <div class="card-header">
        <span class="card-title">Asset Location</span>
      </div>
      ${renderDonutChart(accountTypeAllocation, accountTypeAbsolute, totalValue, 'By Account')}
    </div>

    <div class="filter-tabs" id="class-tabs">
      <div class="filter-tab ${activeClassFilter === 'all' ? 'active' : ''}" data-class="all">All</div>
      ${classOrder.map(cls => {
        const clsData = grouped[cls];
        if (!clsData || clsData.totalItems === 0) return '';
        const tabLabel = getClassDisplayLabel(clsData.label, cls, 'asset');
        return `<div class="filter-tab ${activeClassFilter === cls ? 'active' : ''}" data-class="${cls}">
          ${tabLabel}
          <span class="tab-count">${clsData.totalItems}</span>
        </div>`;
      }).join('')}
    </div>

    <div id="holdings-container">
      ${renderGroupedAssets(grouped, classOrder, activeClassFilter)}
    </div>
  `;
}

function renderLiabilitiesView(liabilities, stats, config) {
  const grouped = groupByHierarchy(liabilities, config, 'liability');
  const classOrder = config ? Object.keys(config.liabilityClasses) : ['short-term', 'long-term'];

  return `
    <div class="card" style="margin-bottom:28px">
      <div class="card-header">
        <span class="card-title">Liability Breakdown</span>
      </div>
      ${renderDonutChart(stats.liabilityAllocation, stats.liabilityAllocationAbsolute, stats.totalLiabilities, 'Total Debt')}
    </div>

    <div class="filter-tabs" id="class-tabs">
      <div class="filter-tab ${activeClassFilter === 'all' ? 'active' : ''}" data-class="all">All</div>
      ${classOrder.map(cls => {
        const clsData = grouped[cls];
        if (!clsData || clsData.totalItems === 0) return '';
        const tabLabel = getClassDisplayLabel(clsData.label, cls, 'liability');
        return `<div class="filter-tab ${activeClassFilter === cls ? 'active' : ''}" data-class="${cls}">
          ${tabLabel}
          <span class="tab-count">${clsData.totalItems}</span>
        </div>`;
      }).join('')}
    </div>

    <div id="holdings-container">
      ${renderGroupedLiabilities(grouped, classOrder, activeClassFilter)}
    </div>
  `;
}

function bindTopTabs(container, assets, liabilities, stats, config) {
  container.querySelectorAll('.scope-option').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTopTab = tab.dataset.tab;
      activeClassFilter = 'all';
      container.querySelectorAll('.scope-option').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const content = container.querySelector('#portfolio-content');
      content.innerHTML = activeTopTab === 'assets'
        ? renderAssetsView(assets, stats, config)
        : renderLiabilitiesView(liabilities, stats, config);
      bindClassTabs(container, assets, liabilities, stats, config);
    });
  });
  bindClassTabs(container, assets, liabilities, stats, config);
}

function bindClassTabs(container, assets, liabilities, stats, config) {
  container.querySelectorAll('#class-tabs .filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeClassFilter = tab.dataset.class;
      container.querySelectorAll('#class-tabs .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const holdingsContainer = container.querySelector('#holdings-container');
      if (activeTopTab === 'assets') {
        const grouped = groupByHierarchy(assets, config, 'asset');
        const classOrder = config ? Object.keys(config.assetClasses) : ['investment'];
        holdingsContainer.innerHTML = renderGroupedAssets(grouped, classOrder, activeClassFilter);
      } else {
        const grouped = groupByHierarchy(liabilities, config, 'liability');
        const classOrder = config ? Object.keys(config.liabilityClasses) : ['short-term', 'long-term'];
        holdingsContainer.innerHTML = renderGroupedLiabilities(grouped, classOrder, activeClassFilter);
      }
    });
  });
}

// 2-level grouping: class → category → items
function groupByHierarchy(items, config, type) {
  const result = {};
  const classes = type === 'asset'
    ? (config && config.assetClasses ? config.assetClasses : {})
    : (config && config.liabilityClasses ? config.liabilityClasses : {});

  // Initialize groups
  for (const [cls, def] of Object.entries(classes)) {
    result[cls] = { label: def.label, categories: {}, totalItems: 0 };
    for (const cat of def.categories) {
      result[cls].categories[cat] = [];
    }
  }

  for (const item of items) {
    let placed = false;
    for (const [cls, def] of Object.entries(classes)) {
      if (def.categories.includes(item.category)) {
        if (!result[cls].categories[item.category]) {
          result[cls].categories[item.category] = [];
        }
        result[cls].categories[item.category].push(item);
        result[cls].totalItems++;
        placed = true;
        break;
      }
    }
    // Default to 'investment' for unknown asset categories
    if (!placed && type === 'asset') {
      if (!result.investment) {
        result.investment = { label: 'Investment', categories: {}, totalItems: 0 };
      }
      if (!result.investment.categories[item.category]) {
        result.investment.categories[item.category] = [];
      }
      result.investment.categories[item.category].push(item);
      result.investment.totalItems++;
    }
  }

  return result;
}

function getClassDisplayLabel(rawLabel, classKey, type) {
  const assetLabels = {
    liquid: 'Liquid',
    investment: 'Investment',
    fixed: 'Fixed',
    personal: 'Other'
  };
  const liabilityLabels = {
    'short-term': 'Short',
    'long-term': 'Long'
  };

  if (type === 'asset' && assetLabels[classKey]) return assetLabels[classKey];
  if (type === 'liability' && liabilityLabels[classKey]) return liabilityLabels[classKey];

  const stripped = (rawLabel || '')
    .replace(/\s+Assets?$/i, '')
    .replace(/\s+Liabilities?$/i, '')
    .trim();
  if (stripped) return stripped;
  return classKey
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function getClassAccent(type, classKey) {
  if (type === 'asset') {
    const map = {
      liquid: '#7d9470',
      investment: '#5b7e4a',
      fixed: '#6b7d5e',
      personal: '#8b7d6b'
    };
    return map[classKey] || '#8a9178';
  }

  const map = {
    'short-term': '#b5443b',
    'long-term': '#8b5e3c'
  };
  return map[classKey] || '#a0734f';
}

function renderClassHeader(classKey, group, type) {
  const label = getClassDisplayLabel(group.label, classKey, type);
  const unit = type === 'asset' ? 'items' : 'accounts';
  return `
    <div class="asset-class-header" style="--class-accent:${getClassAccent(type, classKey)}">
      <span class="asset-class-accent"></span>
      <span class="asset-class-label">${label}</span>
      <span class="asset-class-size">${group.totalItems} ${unit}</span>
    </div>
  `;
}

function renderGroupedAssets(grouped, classOrder, filter) {
  const classes = filter === 'all' ? classOrder : [filter];

  return classes.map(cls => {
    const group = grouped[cls];
    if (!group || group.totalItems === 0) return '';

    const categorySections = Object.entries(group.categories)
      .filter(([, items]) => items.length > 0)
      .map(([cat, items]) => {
        const catValue = items.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
        const catCost = items.reduce((s, h) => s + h.quantity * h.avgCost, 0);
        const catGainPct = catCost > 0 ? ((catValue - catCost) / catCost) * 100 : 0;
        const isGain = catGainPct >= 0;

        return `
          <div class="category-section">
            <div class="category-header">
              <div class="category-header-left">
                <span class="asset-icon-dot" style="background:${getCategoryColor(cat)}"></span>
                <span class="category-name">${getCategoryLabel(cat)}</span>
                <span class="category-count">${items.length} position${items.length > 1 ? 's' : ''}</span>
              </div>
              <div class="category-header-right">
                <span class="category-value">$${formatNumber(catValue)}</span>
                <span class="category-gain ${isGain ? 'change-positive' : 'change-negative'}">
                  ${isGain ? '+' : ''}${catGainPct.toFixed(1)}%
                </span>
              </div>
            </div>
            ${renderHoldingsTable(items)}
          </div>
        `;
      }).join('');

    const showClassHeader = filter === 'all';

    return `
      <div class="asset-class-group ${showClassHeader ? '' : 'single-class'}">
        ${showClassHeader ? renderClassHeader(cls, group, 'asset') : ''}
        ${categorySections}
      </div>
    `;
  }).join('');
}

function renderGroupedLiabilities(grouped, classOrder, filter) {
  const classes = filter === 'all' ? classOrder : [filter];

  return classes.map(cls => {
    const group = grouped[cls];
    if (!group || group.totalItems === 0) return '';

    const categorySections = Object.entries(group.categories)
      .filter(([, items]) => items.length > 0)
      .map(([cat, items]) => {
        const catBalance = items.reduce((s, l) => s + l.currentBalance, 0);

        return `
          <div class="category-section liability">
            <div class="category-header liability">
              <div class="category-header-left">
                <span class="asset-icon-dot liability" style="background:${getCategoryColor(cat)}"></span>
                <span class="category-name">${getCategoryLabel(cat)}</span>
                <span class="category-count">${items.length} account${items.length > 1 ? 's' : ''}</span>
              </div>
              <div class="category-header-right">
                <span class="category-value change-negative">$${formatNumber(catBalance)}</span>
              </div>
            </div>
            ${renderLiabilitiesTable(items)}
          </div>
        `;
      }).join('');

    const showClassHeader = filter === 'all';

    return `
      <div class="asset-class-group ${showClassHeader ? '' : 'single-class'}">
        ${showClassHeader ? renderClassHeader(cls, group, 'liability') : ''}
        ${categorySections}
      </div>
    `;
  }).join('');
}

function renderHoldingsTable(holdings) {
  const sorted = [...holdings].sort((a, b) => {
    const valA = a.quantity * a.currentPrice;
    const valB = b.quantity * b.currentPrice;
    return valB - valA;
  });

  const rows = sorted.map(h => {
    const value = h.quantity * h.currentPrice;
    const cost = h.quantity * h.avgCost;
    const gainLoss = value - cost;
    const gainLossPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
    const isPositive = h.change24h >= 0;
    const isGain = gainLoss >= 0;
    const changeClass = h.change24h > 0 ? 'change-positive' : h.change24h < 0 ? 'change-negative' : 'change-neutral';
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
        <td class="mono align-right">$${formatPrice(h.currentPrice)}</td>
        <td class="mono align-right">${formatQuantity(h.quantity, h.category)}</td>
        <td class="mono align-right">$${formatNumber(value)}</td>
        <td class="mono align-right ${gainClass}">
          ${isGain ? '+' : ''}$${formatNumber(gainLoss)}<br>
          <small style="opacity:0.7">${isGain ? '+' : ''}${gainLossPct.toFixed(1)}%</small>
        </td>
        <td class="mono align-right ${changeClass}">
          ${h.change24h > 0 ? '+' : ''}${h.change24h.toFixed(1)}%
        </td>
        <td class="align-right">
          ${renderSparkline(h.sparkline7d, isPositive)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table class="asset-table">
      <thead>
        <tr>
          <th>Asset</th>
          <th>Account</th>
          <th class="align-right">Price</th>
          <th class="align-right">Qty</th>
          <th class="align-right">Value</th>
          <th class="align-right">P&L</th>
          <th class="align-right">24h</th>
          <th class="align-right">7d</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
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
  `;
}

function formatCurrency(n) {
  if (Math.abs(n) >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatNumber(n) {
  return Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatPrice(n) {
  if (n >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 100) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatQuantity(q, category) {
  if (['startups', 'real-estate', 'cash', 'savings', 'vehicles', 'jewelry', 'art'].includes(category)) {
    if (q === 1) return '1 position';
  }
  if (q < 1) return q.toFixed(4);
  if (q % 1 !== 0) return q.toFixed(2);
  return q.toLocaleString('en-US');
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
