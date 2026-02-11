import { getStats, getSignals } from '../utils/api.js';

export async function renderSidebar(container) {
  let stats = null;
  let signalCount = 0;

  try {
    const [statsData, signalsData] = await Promise.all([getStats(), getSignals()]);
    stats = statsData;
    signalCount = signalsData.signals.filter(s => !s.dismissed).length;
  } catch (e) {
    console.warn('Failed to load sidebar data:', e);
  }

  const totalValue = stats ? formatCurrency(stats.totalValue) : '--';
  const changeValue = stats ? stats.change24h : 0;
  const changePct = stats ? stats.change24hPct : 0;
  const changeClass = changeValue >= 0 ? 'positive' : 'negative';
  const changeSign = changeValue >= 0 ? '+' : '';
  const changeArrow = changeValue >= 0 ? '\u25B2' : '\u25BC';

  container.innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-mark">
        <svg class="brand-icon" viewBox="0 0 36 36" fill="none">
          <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" stroke="#2d4a2b" stroke-width="1.5" fill="rgba(45,74,43,0.08)" />
          <polygon points="18,8 27,13 27,23 18,28 9,23 9,13" stroke="#2d4a2b" stroke-width="1" fill="rgba(45,74,43,0.12)" />
          <circle cx="18" cy="18" r="3" fill="#2d4a2b" />
        </svg>
        <h1>Capis</h1>
      </div>
      <div class="brand-tagline">Where Wealth Swarms</div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Dashboard</div>
      <a href="#portfolio" class="nav-item" data-view="portfolio">
        <span class="nav-icon">\u25C8</span>
        Portfolio
      </a>
      <a href="#feed" class="nav-item" data-view="feed">
        <span class="nav-icon">\u25C9</span>
        Intel Feed
        ${signalCount > 0 ? `<span class="nav-badge">${signalCount}</span>` : ''}
      </a>
      <a href="#legal" class="nav-item" data-view="legal">
        <span class="nav-icon">\u25CA</span>
        Tax & Legal
      </a>
    </nav>

    <div class="sidebar-summary">
      <div class="summary-label">Portfolio Value</div>
      <div class="summary-value">${totalValue}</div>
      <div class="summary-change ${changeClass}">
        ${changeArrow} ${changeSign}$${Math.abs(changeValue).toLocaleString('en-US', { maximumFractionDigits: 0 })} (${changeSign}${changePct.toFixed(2)}%) 24h
      </div>
    </div>
  `;

  updateActiveNav();
}

export function updateActiveNav() {
  const currentHash = location.hash.slice(1) || 'portfolio';
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === currentHash);
  });
}

function formatCurrency(n) {
  if (n >= 1_000_000) {
    return '$' + (n / 1_000_000).toFixed(2) + 'M';
  }
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
