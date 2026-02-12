import { getTaxSummary, getProfile, getPortfolio, getStats } from '../utils/api.js';

export async function renderLegal(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading tax data...</p></div>`;

  try {
    const [tax, profile, portfolio, stats] = await Promise.all([
      getTaxSummary(),
      getProfile().catch(() => null),
      getPortfolio().catch(() => null),
      getStats().catch(() => null)
    ]);

    const assets = portfolio ? portfolio.assets : [];

    container.innerHTML = `
      <div class="view-container">
        <!-- Profile Check Banner -->
        ${!profile ? `
          <div class="card animate-in stagger-1" style="margin-bottom:20px;border-left:4px solid #a0734f;border-color:#a0734f">
            <div style="display:flex;align-items:flex-start;gap:12px">
              <span style="font-size:1.2rem">\u26A0</span>
              <div>
                <div style="font-weight:600;margin-bottom:4px">Profile not configured</div>
                <div style="font-size:0.85rem;color:var(--text-secondary)">
                  Tax calculations require your location and filing status. Tell Claude Code: <code style="font-family:var(--font-mono);color:var(--gold-primary)">"Set up my Capis profile"</code>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Tax Overview Stats -->
        <div class="tax-grid">
          <div class="stat-card highlight animate-in stagger-1">
            <div class="stat-label">Net Realized Gain/Loss</div>
            <div class="stat-value ${tax.netRealizedGainLoss >= 0 ? 'change-positive' : 'change-negative'}">
              ${tax.netRealizedGainLoss >= 0 ? '+' : ''}$${formatNumber(tax.netRealizedGainLoss)}
            </div>
            <div class="stat-change" style="color:var(--text-tertiary)">
              Tax year ${tax.taxYear}
            </div>
          </div>
          <div class="stat-card animate-in stagger-2">
            <div class="stat-label">Realized Gains</div>
            <div class="stat-value change-positive">+$${formatNumber(tax.realizedGains)}</div>
            <div class="stat-change" style="color:var(--text-tertiary)">
              Long-term rate: ${(tax.longTermRate * 100).toFixed(0)}%
            </div>
          </div>
          <div class="stat-card animate-in stagger-3">
            <div class="stat-label">Realized Losses</div>
            <div class="stat-value change-negative">-$${formatNumber(Math.abs(tax.realizedLosses))}</div>
            <div class="stat-change" style="color:var(--text-tertiary)">
              Short-term rate: ${(tax.shortTermRate * 100).toFixed(0)}%
            </div>
          </div>
          <div class="stat-card animate-in stagger-4">
            <div class="stat-label">Est. Tax Liability</div>
            <div class="stat-value" style="color:var(--gold-primary)">$${formatNumber(tax.estimatedTaxLiability)}</div>
            <div class="stat-change" style="color:var(--text-tertiary)">
              ${tax.jurisdiction} jurisdiction
            </div>
          </div>
        </div>

        <!-- Unrealized Gains -->
        <div class="stats-grid" style="margin-bottom:28px">
          <div class="stat-card animate-in stagger-5">
            <div class="stat-label">Unrealized Gains</div>
            <div class="stat-value change-positive">+$${formatNumber(tax.unrealizedGains)}</div>
            <div class="stat-change" style="color:var(--text-tertiary)">
              Not yet taxable
            </div>
          </div>
        </div>

        <!-- Asset Location Analysis -->
        ${renderAssetLocationAnalysis(assets, stats)}

        <!-- Hidden Liability: Unrealized Capital Gains Tax -->
        ${renderHiddenTaxLiability(assets, profile)}

        <!-- Tax-Loss Harvesting -->
        ${tax.taxLossHarvestingOpportunities.length > 0 ? `
          <div class="card animate-in stagger-5" style="margin-bottom:28px;border-color:var(--border-gold)">
            <div class="card-header">
              <span class="card-title" style="color:var(--gold-primary)">\u2618 Tax-Loss Harvesting Opportunities</span>
            </div>
            <div style="font-size:0.85rem;color:var(--text-secondary)">
              <div style="padding:8px 0;border-bottom:1px solid var(--border-light);font-style:italic;color:var(--text-tertiary)">
                Tax-loss harvesting only applies to holdings in taxable accounts.
              </div>
              ${tax.taxLossHarvestingOpportunities.map(opp => `
                <div style="padding:8px 0;border-bottom:1px solid var(--border-light)">
                  <strong style="color:var(--text-primary)">${opp.asset}</strong> \u2014 ${opp.note}
                  ${opp.potentialSavings > 0 ? `<span style="color:var(--green);margin-left:8px">Potential savings: $${formatNumber(opp.potentialSavings)}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Taxable Events Table -->
        <div class="section-header animate-in stagger-6">
          <span class="section-title">Taxable Events</span>
          <span class="section-subtitle">${tax.taxableEvents.length} events in ${tax.taxYear}</span>
        </div>
        <div class="animate-in stagger-7">
          <table class="tax-events-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Asset</th>
                <th class="align-right">Amount</th>
                <th class="align-right">Cost Basis</th>
                <th class="align-right">Gain/Loss</th>
                <th>Term</th>
              </tr>
            </thead>
            <tbody>
              ${tax.taxableEvents.map(evt => {
                const isGain = evt.gain >= 0;
                const gainClass = isGain ? 'change-positive' : 'change-negative';
                return `
                  <tr>
                    <td class="mono">${formatDate(evt.date)}</td>
                    <td><span class="feed-category-tag ${evt.type === 'loss' ? 'crypto' : 'earnings'}">${evt.type.toUpperCase()}</span></td>
                    <td><strong>${evt.asset}</strong></td>
                    <td class="mono align-right">$${formatNumber(evt.amount)}</td>
                    <td class="mono align-right">$${formatNumber(evt.costBasis)}</td>
                    <td class="mono align-right ${gainClass}">${isGain ? '+' : ''}$${formatNumber(evt.gain)}</td>
                    <td><span class="feed-category-tag">${evt.term}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Notes -->
        ${tax.notes ? `
          <div class="card animate-in stagger-8" style="margin-top:28px">
            <div class="card-header">
              <span class="card-title">Planning Notes</span>
            </div>
            <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6">${tax.notes}</p>
          </div>
        ` : ''}
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load tax data</p></div>`;
    console.error(e);
  }
}

function renderAssetLocationAnalysis(assets, stats) {
  if (!assets.length) return '';

  const groups = {
    'Taxable': { types: ['taxable', 'direct', 'checking', 'savings'], value: 0, items: [] },
    'Tax-Deferred': { types: ['traditional-ira', 'traditional-401k'], value: 0, items: [] },
    'Tax-Exempt': { types: ['roth-ira', 'roth-401k'], value: 0, items: [] },
    'Special (Triple Tax-Advantaged)': { types: ['hsa', '529'], value: 0, items: [] }
  };

  let totalValue = 0;
  for (const a of assets) {
    const value = a.quantity * a.currentPrice;
    totalValue += value;
    const acctType = a.accountType || 'taxable';
    for (const [groupName, group] of Object.entries(groups)) {
      if (group.types.includes(acctType)) {
        group.value += value;
        group.items.push(a);
        break;
      }
    }
  }

  const groupColors = {
    'Taxable': 'var(--red)',
    'Tax-Deferred': '#a0734f',
    'Tax-Exempt': 'var(--green)',
    'Special (Triple Tax-Advantaged)': 'var(--gold-primary)'
  };

  const rows = Object.entries(groups)
    .filter(([, g]) => g.value > 0)
    .map(([name, g]) => {
      const pct = totalValue > 0 ? (g.value / totalValue * 100).toFixed(1) : '0.0';
      const color = groupColors[name];
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-light)">
          <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></span>
          <span style="flex:1;font-weight:500">${name}</span>
          <span class="mono" style="font-size:0.85rem">$${formatNumber(g.value)}</span>
          <span class="mono" style="font-size:0.78rem;color:var(--text-tertiary);width:50px;text-align:right">${pct}%</span>
        </div>
      `;
    }).join('');

  return `
    <div class="card animate-in stagger-5" style="margin-bottom:28px">
      <div class="card-header">
        <span class="card-title">Asset Location Analysis</span>
      </div>
      <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">
        Holdings grouped by tax treatment
      </div>
      ${rows}
    </div>
  `;
}

function renderHiddenTaxLiability(assets, profile) {
  if (!assets.length) return '';

  const taxableTypes = ['taxable', 'direct', 'checking', 'savings'];
  const taxFreeTypes = ['roth-ira', 'roth-401k', 'hsa'];
  const now = new Date();

  const ltcgRate = profile ? profile.tax.longTermCapitalGainsRate : 0.15;
  const stcgRate = profile ? profile.tax.shortTermCapitalGainsRate : 0.24;
  const niit = profile ? profile.tax.niit : 0.038;
  const stateTaxRate = profile ? profile.tax.stateTaxRate : 0;

  let totalEstTax = 0;
  let taxFreeGains = 0;
  const positions = [];

  for (const a of assets) {
    const value = a.quantity * a.currentPrice;
    const cost = a.costBasis || (a.quantity * a.avgCost);
    const gain = value - cost;
    const acctType = a.accountType || 'taxable';

    if (taxFreeTypes.includes(acctType) && gain > 0) {
      taxFreeGains += gain;
      continue;
    }

    if (!taxableTypes.includes(acctType)) continue;
    if (gain <= 0) continue;

    let term = 'Long';
    let rate = ltcgRate;
    if (a.purchaseDate) {
      const purchaseDate = new Date(a.purchaseDate);
      const holdingDays = (now - purchaseDate) / (1000 * 60 * 60 * 24);
      if (holdingDays < 365) {
        term = 'Short';
        rate = stcgRate;
      }
    }

    const effectiveRate = rate + niit + stateTaxRate;
    const estTax = gain * effectiveRate;
    totalEstTax += estTax;

    positions.push({
      name: a.name,
      ticker: a.ticker,
      accountName: a.accountName || acctType,
      gain,
      term,
      estTax
    });
  }

  if (positions.length === 0 && taxFreeGains === 0) return '';

  positions.sort((a, b) => b.estTax - a.estTax);

  return `
    <div class="card animate-in stagger-6" style="margin-bottom:28px;border-left:4px solid var(--red)">
      <div class="card-header">
        <span class="card-title" style="color:var(--red)">Hidden Liability: Unrealized Capital Gains Tax</span>
      </div>
      <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
        Estimated tax if all taxable-account gains were realized today
      </div>

      <div style="display:flex;gap:24px;margin-bottom:20px;flex-wrap:wrap">
        <div class="stat-card" style="flex:1;min-width:180px">
          <div class="stat-label">Est. Total Tax</div>
          <div class="stat-value change-negative">$${formatNumber(totalEstTax)}</div>
        </div>
        ${taxFreeGains > 0 ? `
          <div class="stat-card" style="flex:1;min-width:180px">
            <div class="stat-label">Tax-Free Gains (Roth/HSA)</div>
            <div class="stat-value change-positive">+$${formatNumber(taxFreeGains)}</div>
            <div class="stat-change" style="color:var(--text-tertiary)">Sheltered from taxes</div>
          </div>
        ` : ''}
      </div>

      ${positions.length > 0 ? `
        <table class="tax-events-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Account</th>
              <th class="align-right">Unrealized Gain</th>
              <th>Term</th>
              <th class="align-right">Est. Tax</th>
            </tr>
          </thead>
          <tbody>
            ${positions.map(p => `
              <tr>
                <td><strong>${p.name}</strong> <span style="color:var(--text-tertiary);font-size:0.78rem">${p.ticker}</span></td>
                <td style="font-size:0.82rem">${p.accountName}</td>
                <td class="mono align-right change-positive">+$${formatNumber(p.gain)}</td>
                <td><span class="feed-category-tag">${p.term}</span></td>
                <td class="mono align-right change-negative">$${formatNumber(p.estTax)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
    </div>
  `;
}

function formatNumber(n) {
  return Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
