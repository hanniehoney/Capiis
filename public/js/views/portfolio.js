import { getPortfolio, getStats } from '../utils/api.js';
import { renderDonutChart, renderSparkline } from '../components/charts.js';

export async function renderPortfolio(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading portfolio...</p></div>`;

  try {
    const [portfolio, stats] = await Promise.all([getPortfolio(), getStats()]);
    const { holdings } = portfolio;

    container.innerHTML = `
      <div class="view-container">
        <!-- Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card highlight animate-in stagger-1">
            <div class="stat-label">Total Portfolio Value</div>
            <div class="stat-value gold">${formatCurrency(stats.totalValue)}</div>
            <div class="stat-change ${stats.totalGainLossPct >= 0 ? 'positive' : 'negative'}">
              ${stats.totalGainLossPct >= 0 ? '\u25B2' : '\u25BC'} ${stats.totalGainLossPct >= 0 ? '+' : ''}${stats.totalGainLossPct.toFixed(2)}% all time
            </div>
          </div>
          <div class="stat-card animate-in stagger-2">
            <div class="stat-label">24h Change</div>
            <div class="stat-value ${stats.change24hPct >= 0 ? 'change-positive' : 'change-negative'}">
              ${stats.change24hPct >= 0 ? '+' : ''}${stats.change24hPct.toFixed(2)}%
            </div>
            <div class="stat-change ${stats.change24h >= 0 ? 'positive' : 'negative'}">
              ${stats.change24h >= 0 ? '+' : ''}$${Math.abs(stats.change24h).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div class="stat-card animate-in stagger-3">
            <div class="stat-label">Positions</div>
            <div class="stat-value">${stats.positions}</div>
            <div class="stat-change" style="color:var(--text-tertiary)">
              ${Object.keys(stats.allocation).length} categories
            </div>
          </div>
          <div class="stat-card animate-in stagger-4">
            <div class="stat-label">Best Performer (24h)</div>
            <div class="stat-value" style="font-size:1.2rem">${stats.bestPerformer.name}</div>
            <div class="stat-change positive">
              \u25B2 +${stats.bestPerformer.change.toFixed(1)}%
            </div>
          </div>
        </div>

        <!-- Allocation Chart -->
        <div class="card animate-in stagger-3" style="margin-bottom:28px">
          <div class="card-header">
            <span class="card-title">Asset Allocation</span>
          </div>
          ${renderDonutChart(stats.allocation, stats.allocationAbsolute, stats.totalValue)}
        </div>

        <!-- Holdings Table -->
        <div class="section-header animate-in stagger-4">
          <span class="section-title">Holdings</span>
          <span class="section-subtitle">${holdings.length} positions</span>
        </div>
        <div class="animate-in stagger-5">
          ${renderHoldingsTable(holdings)}
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load portfolio data</p></div>`;
    console.error(e);
  }
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

function formatCurrency(n) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
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
  if (category === 'startups') return '1 position';
  if (q < 1) return q.toFixed(4);
  if (q % 1 !== 0) return q.toFixed(2);
  return q.toLocaleString('en-US');
}
