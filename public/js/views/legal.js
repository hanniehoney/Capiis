import { getTaxSummary } from '../utils/api.js';

export async function renderLegal(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading tax data...</p></div>`;

  try {
    const tax = await getTaxSummary();

    container.innerHTML = `
      <div class="view-container">
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

        <!-- Tax-Loss Harvesting -->
        ${tax.taxLossHarvestingOpportunities.length > 0 ? `
          <div class="card animate-in stagger-5" style="margin-bottom:28px;border-color:var(--border-gold)">
            <div class="card-header">
              <span class="card-title" style="color:var(--gold-primary)">\u2618 Tax-Loss Harvesting Opportunities</span>
            </div>
            <div style="font-size:0.85rem;color:var(--text-secondary)">
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

function formatNumber(n) {
  return Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
