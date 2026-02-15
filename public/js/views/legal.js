import { getTaxSummary, getProfile, getPortfolio } from '../utils/api.js';

export async function renderLegal(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading tax data...</p></div>`;

  try {
    const [tax, profile, portfolio] = await Promise.all([
      getTaxSummary(),
      getProfile().catch(() => null),
      getPortfolio().catch(() => null)
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
                  Tax calculations require your location and filing status. Tell Claude Code: <code style="font-family:var(--font-mono);color:var(--gold-primary)">"Set up my Capiis profile"</code>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Tax Overview Stats -->
        <div class="tax-priority-grid">
          <div class="stat-card highlight tax-key-card animate-in stagger-1">
            <div class="stat-label">Est. Tax Liability</div>
            <div class="stat-value" style="color:var(--gold-primary)">$${formatNumber(tax.estimatedTaxLiability)}</div>
            <div class="stat-change" style="color:var(--text-tertiary)">
              Amount likely owed for tax year ${tax.taxYear} (${tax.jurisdiction})${tax.lastComputed ? ` · as of ${new Date(tax.lastComputed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
            </div>
          </div>

          <div class="tax-support-grid">
            <div class="stat-card animate-in stagger-2">
              <div class="stat-label">Unrealized Gains</div>
              <div class="stat-value change-positive">+$${formatNumber(tax.unrealizedGains)}</div>
              <div class="stat-change" style="color:var(--text-tertiary)">
                Not yet taxable
              </div>
            </div>

            <div class="stat-card animate-in stagger-3">
              <div class="stat-label">Net Realized Gain/Loss</div>
              <div class="stat-value ${tax.netRealizedGainLoss >= 0 ? 'change-positive' : 'change-negative'}">
                ${tax.netRealizedGainLoss >= 0 ? '+' : ''}$${formatNumber(tax.netRealizedGainLoss)}
              </div>
              <div class="stat-change" style="color:var(--text-tertiary)">
                Realized this year
              </div>
            </div>

            <div class="stat-card animate-in stagger-4">
              <div class="stat-label">Realized Gains</div>
              <div class="stat-value change-positive">+$${formatNumber(tax.realizedGains)}</div>
              <div class="stat-change" style="color:var(--text-tertiary)">
                Long-term rate: ${((profile ? profile.tax.longTermCapitalGainsRate : tax.longTermRate) * 100).toFixed(0)}%
              </div>
            </div>

            <div class="stat-card animate-in stagger-5">
              <div class="stat-label">Realized Losses</div>
              <div class="stat-value change-negative">-$${formatNumber(Math.abs(tax.realizedLosses))}</div>
              <div class="stat-change" style="color:var(--text-tertiary)">
                Short-term rate: ${((profile ? profile.tax.shortTermCapitalGainsRate : tax.shortTermRate) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Location Analysis -->
        ${renderAssetLocationAnalysis(assets)}

      </div>
    `;

    bindInfoTips(container);
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load tax data</p></div>`;
    console.error(e);
  }
}

export async function renderTaxHiddenLiability(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading hidden tax liability...</p></div>`;

  try {
    const [profile, portfolio] = await Promise.all([
      getProfile().catch(() => null),
      getPortfolio().catch(() => ({ assets: [] }))
    ]);
    const assets = portfolio ? portfolio.assets : [];
    const hiddenTax = calculateHiddenTaxLiability(assets, profile);

    container.innerHTML = `
      <div class="view-container">
        <div class="section-header animate-in stagger-1">
          <span class="section-title card-title-row">
            Hidden Liabilities
            ${renderInfoTip('Estimated tax if all taxable-account gains were realized today. Collectibles (jewelry, art) use the 28% LTCG rate. Primary residence gains exclude the first $500K (MFJ Section 121).')}
          </span>
        </div>

        <div class="tax-priority-grid">
          <div class="stat-card highlight tax-key-card animate-in stagger-2">
            <div class="stat-label">Est. Total Tax</div>
            <div class="stat-value change-negative">$${formatNumber(hiddenTax.totalEstTax)}</div>
          </div>
          <div class="tax-support-grid">
            <div class="stat-card animate-in stagger-3">
              <div class="stat-label">Total Unrealized Gains</div>
              <div class="stat-value change-positive">+$${formatNumber(hiddenTax.totalUnrealizedTaxableGains)}</div>
            </div>
            <div class="stat-card animate-in stagger-4">
              <div class="stat-label">Tax-Free Gains</div>
              <div class="stat-value change-positive">+$${formatNumber(hiddenTax.taxFreeGains)}</div>
            </div>
          </div>
        </div>

        ${hiddenTax.positions.length > 0 ? `
          <div class="animate-in stagger-3">
            ${renderHiddenTaxLiabilityTable(hiddenTax.positions)}
          </div>
        ` : `
          <div class="empty-state animate-in stagger-3">
            <div class="empty-icon">\u2713</div>
            <p>No taxable unrealized gains found.</p>
          </div>
        `}
      </div>
    `;
    bindInfoTips(container);
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load hidden tax liability</p></div>`;
    console.error(e);
  }
}

export async function renderTaxableEvents(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading taxable events...</p></div>`;

  try {
    const tax = await getTaxSummary();

    container.innerHTML = `
      <div class="view-container">
        <div class="section-header animate-in stagger-1">
          <div style="display:flex;flex-direction:column;gap:4px">
            <span class="section-title">Taxable Events</span>
            <span class="section-subtitle">All Recorded Events</span>
          </div>
        </div>
        ${renderTaxableEventsTable(tax, 'animate-in stagger-2')}
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load taxable events</p></div>`;
    console.error(e);
  }
}

function renderAssetLocationAnalysis(assets) {
  if (!assets.length) return '';

  const groupInfo = {
    'Taxable': 'Gains are subject to capital gains tax when sold. Includes brokerage accounts, direct holdings, checking, and savings.',
    'Tax-Deferred': 'No tax on gains until withdrawal. Contributions may be tax-deductible. Includes Traditional IRA and 401(k).',
    'Tax-Exempt': 'Gains grow tax-free and qualified withdrawals are not taxed. Includes Roth IRA and Roth 401(k).',
    'Special (Triple Tax-Advantaged)': 'Tax-deductible contributions, tax-free growth, and tax-free withdrawals for qualified expenses. Includes HSA and 529 plans.'
  };

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
          <span style="flex:1;font-weight:500;display:inline-flex;align-items:center;gap:6px">${name} ${renderInfoTip(groupInfo[name])}</span>
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

function calculateHiddenTaxLiability(assets, profile) {
  const taxableTypes = ['taxable', 'direct', 'checking', 'savings'];
  const taxFreeTypes = ['roth-ira', 'roth-401k', 'hsa', '529'];
  const collectibleCategories = ['jewelry', 'art'];
  const collectibleLtcgRate = 0.28;
  const primaryResidenceExclusion = 500000; // MFJ Section 121 exclusion
  const now = new Date();

  const ltcgRate = profile ? profile.tax.longTermCapitalGainsRate : 0.15;
  const stcgRate = profile ? profile.tax.shortTermCapitalGainsRate : 0.24;
  const niit = profile ? profile.tax.niit : 0.038;
  const stateTaxRate = profile ? profile.tax.stateTaxRate : 0;

  let totalEstTax = 0;
  let taxFreeGains = 0;
  let totalUnrealizedTaxableGains = 0;
  const positions = [];

  for (const a of assets) {
    const value = a.quantity * a.currentPrice;
    const cost = a.costBasis || (a.quantity * a.avgCost);
    let gain = value - cost;
    const acctType = a.accountType || 'taxable';
    const category = (a.category || '').toLowerCase();

    if (taxFreeTypes.includes(acctType) && gain > 0) {
      taxFreeGains += gain;
      continue;
    }

    if (!taxableTypes.includes(acctType)) continue;
    if (gain <= 0) continue;

    // Primary residence: apply Section 121 exclusion ($500K MFJ, $250K single)
    const isPrimaryResidence = category === 'real-estate' &&
      ((a.tags && a.tags.includes('primary-residence')) ||
       (a.name && /primary/i.test(a.name)) ||
       (a.notes && /primary\s*resid/i.test(a.notes)));
    if (isPrimaryResidence) {
      gain = Math.max(0, gain - primaryResidenceExclusion);
      if (gain <= 0) continue;
    }

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

    // Collectibles (jewelry, art) use 28% LTCG rate instead of standard 20%
    const isCollectible = collectibleCategories.includes(category);
    if (isCollectible && term === 'Long') {
      rate = collectibleLtcgRate;
    }

    const effectiveRate = rate + niit + stateTaxRate;
    const estTax = gain * effectiveRate;
    totalEstTax += estTax;
    totalUnrealizedTaxableGains += gain;

    positions.push({
      name: a.name,
      ticker: a.ticker,
      accountName: a.accountName || acctType,
      gain,
      term,
      effectiveRate,
      isCollectible,
      estTax
    });
  }

  positions.sort((a, b) => b.estTax - a.estTax);

  return {
    totalEstTax,
    taxFreeGains,
    totalUnrealizedTaxableGains,
    positions
  };
}

function renderHiddenTaxLiabilityTable(positions) {
  return `
    <table class="tax-events-table">
      <thead>
        <tr>
          <th>Asset</th>
          <th>Account</th>
          <th class="align-right">Unrealized Gain</th>
          <th>Term</th>
          <th class="align-right">Rate</th>
          <th class="align-right">Est. Tax</th>
        </tr>
      </thead>
      <tbody>
        ${positions.map(p => `
          <tr>
            <td><strong>${p.name}</strong> <span style="color:var(--text-tertiary);font-size:0.78rem">${p.ticker}</span>${p.isCollectible ? ' <span style="font-size:0.7rem;color:var(--teal);font-style:italic">collectible</span>' : ''}</td>
            <td style="font-size:0.82rem">${p.accountName}</td>
            <td class="mono align-right change-positive">+$${formatNumber(p.gain)}</td>
            <td><span class="feed-category-tag">${p.term}</span></td>
            <td class="mono align-right" style="font-size:0.82rem;color:var(--text-tertiary)">${(p.effectiveRate * 100).toFixed(1)}%</td>
            <td class="mono align-right change-negative">$${formatNumber(p.estTax)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderTaxableEventsTable(tax, animationClass = 'animate-in stagger-7') {
  const sorted = [...tax.taxableEvents].sort((a, b) => new Date(b.date) - new Date(a.date));
  let lastYear = null;
  const rows = sorted.map(evt => {
    const evtYear = new Date(evt.date).getFullYear();
    const isGain = evt.gain >= 0;
    const gainClass = isGain ? 'change-positive' : 'change-negative';
    let yearRow = '';
    if (evtYear !== lastYear) {
      lastYear = evtYear;
      yearRow = `<tr class="year-separator"><td colspan="7" style="padding:16px 0 8px;font-weight:600;color:var(--gold-primary);font-size:0.85rem;border-bottom:1px solid var(--border-color)">${evtYear}</td></tr>`;
    }
    return `${yearRow}
      <tr>
        <td class="mono">${formatDate(evt.date)}</td>
        <td><span class="feed-category-tag ${evt.type === 'loss' ? 'crypto' : 'earnings'}">${evt.type.toUpperCase()}</span></td>
        <td><strong>${evt.asset}</strong></td>
        <td class="mono align-right">$${formatNumber(evt.amount)}</td>
        <td class="mono align-right">$${formatNumber(evt.costBasis)}</td>
        <td class="mono align-right ${gainClass}">${isGain ? '+' : ''}$${formatNumber(evt.gain)}</td>
        <td><span class="feed-category-tag">${evt.term}</span></td>
      </tr>`;
  }).join('');

  return `
    <div class="${animationClass}">
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
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderInfoTip(text) {
  const safe = escapeHTML(text);
  return `
    <span class="info-popover" data-info="${safe}">
      <button type="button" class="inline-info-tip" aria-label="Show info">i</button>
    </span>
  `;
}

function getGlobalInfoPanel() {
  let panel = document.getElementById('global-info-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'global-info-panel';
    panel.className = 'inline-info-panel';
    panel.setAttribute('role', 'note');
    document.body.appendChild(panel);
  }
  return panel;
}

function positionInfoPanel(text, button) {
  if (!button) return;
  const panel = getGlobalInfoPanel();
  panel.textContent = text || '';

  const padding = 12;
  const maxWidth = 520;
  const width = Math.min(maxWidth, window.innerWidth - padding * 2);

  panel.style.display = 'block';
  panel.style.width = `${width}px`;

  const buttonRect = button.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();

  let left = buttonRect.left + (buttonRect.width / 2) - (width / 2);
  left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));

  let top = buttonRect.bottom + 8;
  if (top + panelRect.height + padding > window.innerHeight) {
    top = Math.max(padding, buttonRect.top - panelRect.height - 8);
  }

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

function closeInfoPanel() {
  const panel = document.getElementById('global-info-panel');
  if (panel) {
    panel.style.display = 'none';
  }
}

function bindInfoTips(container) {
  if (container.dataset.infoTipsBound === 'true') return;
  container.dataset.infoTipsBound = 'true';

  container.addEventListener('click', (e) => {
    const popover = e.target.closest('.info-popover');
    const button = e.target.closest('.inline-info-tip');

    if (!popover) {
      container.querySelectorAll('.info-popover.open').forEach(p => p.classList.remove('open'));
      closeInfoPanel();
      return;
    }
    if (!button) return;

    const isOpen = popover.classList.contains('open');
    container.querySelectorAll('.info-popover.open').forEach(p => p.classList.remove('open'));
    if (isOpen) {
      closeInfoPanel();
      return;
    }

    const text = popover.dataset.info || '';
    positionInfoPanel(text, button);
    popover.classList.add('open');
  });
}

function escapeHTML(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatNumber(n) {
  return Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
