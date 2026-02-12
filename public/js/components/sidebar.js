import { getSignals } from '../utils/api.js';

let timeIntervalId = null;

export async function renderSidebar(container) {
  let signalCount = 0;

  try {
    const signalsData = await getSignals();
    signalCount = signalsData.signals.filter(s => !s.dismissed).length;
  } catch (e) {
    console.warn('Failed to load sidebar data:', e);
  }

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
      <a href="#portfolio" class="nav-item" data-view="portfolio">
        <span class="nav-icon">\u25C8</span>
        Wealth
      </a>
      <a href="#feed" class="nav-item" data-view="feed">
        <span class="nav-icon">\u25C9</span>
        Feed
        ${signalCount > 0 ? `<span class="nav-badge">${signalCount}</span>` : ''}
      </a>
      <a href="#legal" class="nav-item" data-view="legal">
        <span class="nav-icon">\u25CA</span>
        Tax
      </a>
      <a href="#profile" class="nav-item" data-view="profile">
        <span class="nav-icon">\u2699</span>
        Profile
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-timestamp-label">Local Time</div>
      <div class="sidebar-timestamp" id="sidebar-timestamp">--</div>
    </div>
  `;

  updateActiveNav();
  ensureTimeTicker();
}

export function updateActiveNav() {
  const currentHash = location.hash.slice(1) || 'portfolio';
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === currentHash);
  });
}

function ensureTimeTicker() {
  updateSidebarTimestamp();
  if (timeIntervalId) {
    return;
  }
  timeIntervalId = setInterval(updateSidebarTimestamp, 60_000);
}

function updateSidebarTimestamp() {
  const el = document.getElementById('sidebar-timestamp');
  if (!el) {
    return;
  }
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  el.textContent = `${dateStr} ${timeStr}`;
}
