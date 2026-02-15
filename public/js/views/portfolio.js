import { getPortfolio, getStats, getCategoryConfig } from '../utils/api.js';
import { renderDonutChart, setCategoryConfig } from '../components/charts.js';

export async function renderPortfolio(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading portfolio...</p></div>`;

  try {
    const [portfolio, stats, config] = await Promise.all([
      getPortfolio(),
      getStats(),
      getCategoryConfig().catch(() => null)
    ]);

    if (config) setCategoryConfig(config);

    const { assets } = portfolio;

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

    container.innerHTML = `
      <div class="view-container">
        ${renderNetWorthCard(stats)}

        <div class="portfolio-chart-grid">
          <div class="card animate-in stagger-2">
            <div class="card-header">
              <span class="card-title">Asset Allocation</span>
            </div>
            ${renderDonutChart(stats.allocation, stats.allocationAbsolute, stats.totalAssetValue, 'Total')}
          </div>

          <div class="card animate-in stagger-3">
            <div class="card-header">
              <span class="card-title">Account Type</span>
            </div>
            ${renderDonutChart(accountTypeAllocation, accountTypeAbsolute, totalValue, 'By Account')}
          </div>

          <div class="card animate-in stagger-4">
            <div class="card-header">
              <span class="card-title">Liability Breakdown</span>
            </div>
            ${renderDonutChart(stats.liabilityAllocation, stats.liabilityAllocationAbsolute, stats.totalLiabilities, 'Total Debt')}
          </div>
        </div>
      </div>
    `;

  } catch (e) {
    if (isNoPortfolioDataError(e)) {
      container.innerHTML = `
        <div class="view-container">
          <div class="empty-state">
            <div class="empty-icon">\u25C8</div>
            <p>No portfolio data yet</p>
            <p style="font-size:0.88rem;color:var(--text-tertiary);margin-top:8px">
              In Claude Code CLI, run <code style="font-family:var(--font-mono);color:var(--gold-primary)">/capis-data</code><br>
              to start guided onboarding.
            </p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load portfolio data</p></div>`;
    console.error(e);
  }
}

function isNoPortfolioDataError(error) {
  return error?.status === 404 && error?.payload?.error === 'No portfolio data';
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

function formatCurrency(n) {
  if (Math.abs(n) >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatNumber(n) {
  return Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
