import { getFeed, getSignals, dismissSignal } from '../utils/api.js';

export async function renderFeed(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading intel feed...</p></div>`;

  try {
    const [feedData, signalsData] = await Promise.all([getFeed(), getSignals()]);
    const feed = feedData.items;
    const signals = signalsData.signals;
    const activeSignals = signals.filter(s => !s.dismissed);

    container.innerHTML = `
      <div class="view-container">
        <!-- Filter Tabs -->
        <div class="filter-tabs" id="feed-filters">
          <div class="filter-tab active" data-filter="all">All</div>
          <div class="filter-tab" data-filter="signals">Signals (${activeSignals.length})</div>
          <div class="filter-tab" data-filter="crypto">Crypto</div>
          <div class="filter-tab" data-filter="earnings">Earnings</div>
          <div class="filter-tab" data-filter="macro">Macro</div>
          <div class="filter-tab" data-filter="startups">Startups</div>
        </div>

        <!-- Feed Content -->
        <div class="feed-grid" id="feed-content">
          ${renderMixedFeed(activeSignals, feed, 'all')}
        </div>
      </div>
    `;

    // Filter tab handlers
    const filtersEl = document.getElementById('feed-filters');
    filtersEl.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      filtersEl.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.getElementById('feed-content').innerHTML = renderMixedFeed(
        filter === 'signals' ? activeSignals : (filter === 'all' ? activeSignals : []),
        feed,
        filter
      );
      attachDismissHandlers();
    });

    attachDismissHandlers();
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load feed</p></div>`;
    console.error(e);
  }
}

function renderMixedFeed(signals, feed, filter) {
  let items = [];

  // Add signals
  if (filter === 'all' || filter === 'signals') {
    signals.forEach((s, i) => {
      items.push({
        type: 'signal',
        data: s,
        time: new Date(s.timestamp).getTime(),
        idx: i
      });
    });
  }

  // Add feed items
  if (filter !== 'signals') {
    const filteredFeed = filter === 'all' ? feed :
      feed.filter(f => f.category === filter);
    filteredFeed.forEach((f, i) => {
      items.push({
        type: 'feed',
        data: f,
        time: new Date(f.timestamp).getTime(),
        idx: i
      });
    });
  }

  // Sort by time, newest first
  items.sort((a, b) => b.time - a.time);

  if (items.length === 0) {
    return `<div class="empty-state"><div class="empty-icon">\u25C7</div><p>No items in this category</p></div>`;
  }

  return items.map((item, i) => {
    const staggerClass = `animate-in stagger-${Math.min(i + 1, 8)}`;
    if (item.type === 'signal') {
      return `<div class="${staggerClass}">${renderSignalCard(item.data)}</div>`;
    }
    return `<div class="${staggerClass}">${renderFeedCard(item.data)}</div>`;
  }).join('');
}

function renderSignalCard(signal) {
  const priorityClass = `priority-${signal.priority}`;
  const dismissedClass = signal.dismissed ? 'dismissed' : '';
  const timeAgo = formatTimeAgo(signal.timestamp);
  const categoryLabel = signal.category.charAt(0).toUpperCase() + signal.category.slice(1);

  return `
    <div class="signal-card ${priorityClass} ${dismissedClass}">
      <div class="signal-badge">
        <span class="pulse-ring"></span>
        AI Signal \u2022 ${signal.priority.toUpperCase()}
      </div>
      <div class="signal-title">${signal.title}</div>
      <div class="signal-body">${signal.body}</div>
      <div class="signal-meta">
        <span>${timeAgo}</span>
        <span class="feed-category-tag ${signal.category}">${categoryLabel}</span>
        ${signal.relatedAssets.length ? `<span>Assets: ${signal.relatedAssets.join(', ').toUpperCase()}</span>` : ''}
        ${!signal.dismissed ? `<button class="signal-dismiss" data-signal-id="${signal.id}">Dismiss</button>` : ''}
      </div>
    </div>
  `;
}

function renderFeedCard(item) {
  const timeAgo = formatTimeAgo(item.timestamp);
  const categoryLabel = item.category.charAt(0).toUpperCase() + item.category.slice(1);

  return `
    <div class="feed-card">
      <div class="feed-source">${item.source}</div>
      <div class="feed-headline">${item.headline}</div>
      <div class="feed-summary">${item.summary}</div>
      <div class="feed-meta">
        <span>${timeAgo}</span>
        <span class="feed-category-tag ${item.category}">${categoryLabel}</span>
        <span>Relevance: ${item.relevanceScore}/10</span>
      </div>
    </div>
  `;
}

function attachDismissHandlers() {
  document.querySelectorAll('.signal-dismiss').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.signalId;
      try {
        await dismissSignal(id);
        const card = e.target.closest('.signal-card');
        card.classList.add('dismissed');
        e.target.remove();
      } catch (err) {
        console.error('Failed to dismiss signal:', err);
      }
    });
  });
}

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
