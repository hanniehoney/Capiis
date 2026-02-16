import { getFeed, getSignals, dismissSignal } from '../utils/api.js';

let currentTab = 'all';

export async function renderFeed(container) {
  const isRefresh = container?.dataset?.feedLoaded === 'true';
  if (!isRefresh) {
    container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading intel feed...</p></div>`;
  }

  try {
    const [feedData, signalsData] = await Promise.all([
      getFeed(),
      getSignals()
    ]);
    const feed = Array.isArray(feedData?.items) ? feedData.items : [];
    const signals = Array.isArray(signalsData?.signals) ? signalsData.signals : [];
    const activeSignals = signals.filter(s => !s.dismissed);

    container.innerHTML = `
      <div class="view-container">
        <div class="feed-header">
          <div>
            <div class="feed-title">Intel Feed</div>
            <div class="feed-note">Sources managed in Claude Code CLI.</div>
          </div>
        </div>

        <div class="filter-tabs" id="feed-filters">
          <div class="filter-tab ${currentTab === 'all' ? 'active' : ''}" data-filter="all">All</div>
          <div class="filter-tab ${currentTab === 'signals' ? 'active' : ''}" data-filter="signals">Signals${activeSignals.length ? ` (${activeSignals.length})` : ''}</div>
        </div>

        <div class="feed-grid" id="feed-content">
          ${currentTab === 'signals'
            ? renderSignalsTab(activeSignals, !isRefresh)
            : renderAllTab(feed, !isRefresh)}
        </div>
      </div>
    `;

    const filtersEl = document.getElementById('feed-filters');
    if (filtersEl) {
      filtersEl.addEventListener('click', (e) => {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;
        const filter = tab.dataset.filter;
        currentTab = filter;
        filtersEl.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const content = document.getElementById('feed-content');
        content.innerHTML = filter === 'signals'
          ? renderSignalsTab(activeSignals, false)
          : renderAllTab(feed, false);
        if (filter === 'signals') bindDismissHandlers();
      });
    }

    if (currentTab === 'signals') bindDismissHandlers();
    container.dataset.feedLoaded = 'true';
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load feed</p></div>`;
    console.error(e);
  }
}

function renderAllTab(feed, animate = true) {
  if (!feed.length) {
    return `<div class="empty-state"><div class="empty-icon">\u25C7</div><p>No feed items yet</p></div>`;
  }

  const sorted = [...feed].sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp));

  return sorted.map((item, i) => {
    const date = formatFeedDate(item.timestamp);
    const headline = escapeHTML(item.headline || item.title || '');
    const summary = escapeHTML(item.summary || '');
    const source = escapeHTML(item.source || '');
    const url = item.url && item.url !== '#' ? item.url : '';
    const stagger = animate ? `animate-in stagger-${Math.min(i + 1, 8)}` : '';

    const titleHTML = url
      ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener">${headline} <span class="feed-external-icon">\u2197</span></a>`
      : headline;

    return `
      <div class="${stagger}">
        <div class="feed-card">
          <div class="feed-card-top">
            <span class="feed-source">${source}</span>
            <span class="feed-date">${date}</span>
          </div>
          <div class="feed-headline">${titleHTML}</div>
          <div class="feed-summary">${summary}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSignalsTab(signals, animate = true) {
  if (!signals.length) {
    return `<div class="empty-state"><div class="empty-icon">\u25C7</div><p>No active signals</p></div>`;
  }

  const sorted = [...signals].sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp));

  return sorted.map((signal, i) => {
    const date = formatFeedDate(signal.timestamp);
    const title = escapeHTML(signal.title || '');
    const body = signal.body || signal.message || '';
    const fullBody = escapeHTML(body);
    const stagger = animate ? `animate-in stagger-${Math.min(i + 1, 8)}` : '';

    const affects = [...new Set(
      (signal.relatedAssets || [])
        .map(formatRelatedAssetLabel)
        .filter(Boolean)
    )];
    const affectsHTML = affects.length
      ? `<div class="signal-affects">${affects.map(a => `<span class="signal-asset-tag">${escapeHTML(a)}</span>`).join('')}</div>`
      : '';

    const refs = Array.isArray(signal.sourceRef) ? signal.sourceRef
      : signal.sourceRef ? [signal.sourceRef] : [];
    const sourceHTML = refs.length
      ? `<div class="signal-source-ref">${refs.map(r => escapeHTML(r)).join(' · ')}</div>`
      : '';

    return `
      <div class="${stagger}">
        <div class="signal-card" data-signal-id="${signal.id}">
          <div class="signal-card-header">
            <span class="signal-date">${date}</span>
            <button class="signal-dismiss-x" data-signal-id="${signal.id}" title="Dismiss">\u00D7</button>
          </div>
          <div class="signal-title">${title}</div>
          ${affectsHTML}
          <div class="signal-body">${fullBody}</div>
          ${sourceHTML}
        </div>
      </div>
    `;
  }).join('');
}

function bindDismissHandlers() {
  document.querySelectorAll('.signal-dismiss-x').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = e.target.dataset.signalId;
      const card = e.target.closest('.signal-card');
      const wrapper = card.parentElement;

      try {
        await dismissSignal(id);
        // Animate out: fade then collapse
        card.style.transition = 'opacity 0.3s ease';
        card.style.opacity = '0';
        setTimeout(() => {
          wrapper.style.transition = 'max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease';
          wrapper.style.maxHeight = wrapper.offsetHeight + 'px';
          wrapper.style.overflow = 'hidden';
          requestAnimationFrame(() => {
            wrapper.style.maxHeight = '0';
            wrapper.style.marginBottom = '0';
            wrapper.style.paddingTop = '0';
            wrapper.style.paddingBottom = '0';
          });
          setTimeout(() => wrapper.remove(), 300);
        }, 300);
      } catch (err) {
        console.error('Failed to dismiss signal:', err);
      }
    });
  });
}

function formatFeedDate(timestamp) {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday = d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();

  if (isToday) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


const ASSET_LABEL_MAP = {
  'eq-googl-rsu': 'GOOGL RSU',
  'eq-googl-espp': 'GOOGL ESPP',
  'voo-401k': 'VOO 401k',
  'vxus-401k': 'VXUS 401k',
  'bnd-401k': 'BND 401k',
  'vti-roth': 'VTI Roth',
  'nvda-roth': 'NVDA Roth',
  'aapl-roth': 'AAPL Roth',
  '529-kid1': '529 Ethan',
  '529-kid2': '529 Mia',
  'marcus-hysa': 'HYSA',
  'chase-checking': 'Checking',
  'schwab-cash': 'Schwab Cash',
  're-cupertino': 'Home',
  'tesla-model-y': 'Tesla Y',
  'bmw-x3': 'BMW X3',
  'startup-nexaflow': 'NexaFlow',
  'startup-vaultedge': 'VaultEdge',
  'cupertino-mortgage': 'Mortgage',
  'rolex-sub': 'Rolex',
  'diamond-ring': 'Ring',
  'kaws-companion': 'KAWS',
};

function formatRelatedAssetLabel(raw) {
  if (!raw) return '';
  const text = String(raw);
  if (ASSET_LABEL_MAP[text]) return ASSET_LABEL_MAP[text];
  // Fallback: uppercase if it looks like a ticker
  if (/^[a-z]{2,5}$/i.test(text)) return text.toUpperCase();
  return text;
}

function truncate(text, len) {
  if (!text || text.length <= len) return text || '';
  return text.slice(0, len).replace(/\s+\S*$/, '') + '...';
}

function parseTimestamp(timestamp) {
  const time = new Date(timestamp).getTime();
  return Number.isFinite(time) ? time : 0;
}

function escapeHTML(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
