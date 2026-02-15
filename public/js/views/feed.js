import { getFeed, getSignals, dismissSignal, getPortfolio } from '../utils/api.js';

const TAG_KEYWORDS = [
  { tag: 'AI', keywords: ['AI', 'ARTIFICIAL INTELLIGENCE', 'GPU', 'LLM', 'CHIP', 'HYPERSCALER'] },
  { tag: 'Rates', keywords: ['RATE', 'RATES', 'INFLATION', 'FED', 'YIELD', 'CUTS'] },
  { tag: 'Housing', keywords: ['HOUSING', 'HOME', 'MORTGAGE', 'REAL ESTATE'] },
  { tag: 'Crypto', keywords: ['CRYPTO', 'BITCOIN', 'BTC', 'ETH', 'ETHEREUM', 'SOLANA', 'DEFI'] },
  { tag: 'Private Markets', keywords: ['STARTUP', 'SEED', 'SERIES', 'VC', 'VENTURE', 'FUNDING'] },
  { tag: 'Tax', keywords: ['TAX', 'DEDUCTION', 'IRS', 'CAPITAL GAINS', '529'] }
];

const ASSET_TOKEN_STOPWORDS = new Set([
  'INC', 'CORP', 'CORPORATION', 'CO', 'LTD', 'LLC', 'PLC', 'HOLDINGS', 'GROUP',
  'THE', 'AND', 'COMPANY', 'CLASS', 'TRUST', 'ETF', 'FUND'
]);

export async function renderFeed(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading intel feed...</p></div>`;

  try {
    const [feedData, signalsData, portfolioData] = await Promise.all([
      getFeed(),
      getSignals(),
      getPortfolio().catch(() => null)
    ]);
    const feed = Array.isArray(feedData?.items) ? feedData.items : [];
    const signals = Array.isArray(signalsData?.signals) ? signalsData.signals : [];
    const activeSignals = signals.filter(s => !s.dismissed);
    const assetIndex = buildAssetIndex(portfolioData?.assets || []);
    const decoratedFeed = feed.map(item => ({
      ...item,
      relation: buildFeedRelation(item, assetIndex)
    }));
    const decoratedSignals = activeSignals.map(signal => ({
      ...signal,
      relation: buildSignalRelation(signal, assetIndex)
    }));
    const filters = buildFeedFilters(decoratedFeed, decoratedSignals);
    const summary = buildFeedSummary(decoratedFeed, decoratedSignals);

    container.innerHTML = `
      <div class="view-container">
        ${renderFeedHeader(summary)}
        ${renderFilterTabs(filters, 'all')}

        <!-- Feed Content -->
        <div class="feed-grid" id="feed-content">
          ${renderMixedFeed(decoratedSignals, decoratedFeed, 'all')}
        </div>
      </div>
    `;

    // Filter tab handlers
    const filtersEl = document.getElementById('feed-filters');
    if (filtersEl) {
      filtersEl.addEventListener('click', (e) => {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;
        filtersEl.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        document.getElementById('feed-content').innerHTML = renderMixedFeed(
          decoratedSignals,
          decoratedFeed,
          filter
        );
        attachDismissHandlers();
      });
    }

    attachDismissHandlers();
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">\u26A0</div><p>Failed to load feed</p></div>`;
    console.error(e);
  }
}

function renderMixedFeed(signals, feed, filter) {
  let items = [];

  const isRelated = (item) => hasRelationMatch(item.relation);
  const matchesCategory = (item) => item.category === filter;

  if (filter === 'signals') {
    signals.forEach((s, i) => {
      items.push({
        type: 'signal',
        data: s,
        time: parseTimestamp(s.timestamp),
        idx: i
      });
    });
  } else if (filter === 'related') {
    signals.filter(isRelated).forEach((s, i) => {
      items.push({
        type: 'signal',
        data: s,
        time: parseTimestamp(s.timestamp),
        idx: i
      });
    });
    feed.filter(isRelated).forEach((f, i) => {
      items.push({
        type: 'feed',
        data: f,
        time: parseTimestamp(f.timestamp),
        idx: i
      });
    });
  } else {
    const signalSubset = filter === 'all' ? signals : signals.filter(matchesCategory);
    const feedSubset = filter === 'all' ? feed : feed.filter(matchesCategory);

    signalSubset.forEach((s, i) => {
      items.push({
        type: 'signal',
        data: s,
        time: parseTimestamp(s.timestamp),
        idx: i
      });
    });
    feedSubset.forEach((f, i) => {
      items.push({
        type: 'feed',
        data: f,
        time: parseTimestamp(f.timestamp),
        idx: i
      });
    });
  }

  // Sort by time, newest first
  items.sort((a, b) => b.time - a.time);

  if (items.length === 0) {
    const message = filter === 'related'
      ? 'No items matched your portfolio yet'
      : 'No items in this category';
    return `<div class="empty-state"><div class="empty-icon">\u25C7</div><p>${message}</p></div>`;
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
  const priority = signal.priority || signal.severity || 'low';
  const priorityClass = ['high', 'medium', 'low'].includes(priority)
    ? `priority-${priority}`
    : 'priority-low';
  const dismissedClass = signal.dismissed ? 'dismissed' : '';
  const timeAgo = formatTimeAgo(signal.timestamp);
  const categoryLabel = signal.category ? formatCategoryLabel(signal.category) : 'Signal';
  const body = signal.body || signal.message || '';

  return `
    <div class="signal-card ${priorityClass} ${dismissedClass}">
      <div class="signal-badge">
        <span class="pulse-ring"></span>
        AI Signal \u2022 ${priority.toUpperCase()}
      </div>
      <div class="signal-title">${signal.title}</div>
      <div class="signal-body">${body}</div>
      ${renderRelationBlock(signal.relation)}
      <div class="signal-meta">
        <span>${timeAgo}</span>
        <span class="feed-category-tag ${signal.category}">${categoryLabel}</span>
        ${!signal.dismissed ? `<button class="signal-dismiss" data-signal-id="${signal.id}">Dismiss</button>` : ''}
      </div>
    </div>
  `;
}

function renderFeedCard(item) {
  const timeAgo = formatTimeAgo(item.timestamp);
  const categoryLabel = item.category ? formatCategoryLabel(item.category) : 'General';

  return `
    <div class="feed-card">
      <div class="feed-source">${item.source}</div>
      <div class="feed-headline">${item.headline}</div>
      <div class="feed-summary">${item.summary}</div>
      ${renderRelationBlock(item.relation)}
      <div class="feed-meta">
        <span>${timeAgo}</span>
        <span class="feed-category-tag ${item.category}">${categoryLabel}</span>
        <span>Score: ${item.relevanceScore}/10</span>
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

function renderFeedHeader(summary) {
  const sourceLabel = summary.sourceCount === 1 ? 'Source' : 'Sources';
  const signalLabel = summary.signalCount === 1 ? 'Signal' : 'Signals';
  const relationLabel = summary.assetMatchCount > 0
    ? `Holdings Matched: ${summary.assetMatchCount}`
    : `Related Items: ${summary.relatedItemCount}`;

  return `
    <div class="feed-header">
      <div>
        <div class="feed-title">Intel Feed</div>
        <div class="feed-subtitle">RSS updates mapped to your assets and tags.</div>
        <div class="feed-note">RSS sources are managed in Claude Code CLI.</div>
      </div>
      <div class="feed-context">
        <span class="context-chip">${sourceLabel}: ${summary.sourceCount}</span>
        <span class="context-chip">${signalLabel}: ${summary.signalCount}</span>
        <span class="context-chip">${relationLabel}</span>
      </div>
    </div>
  `;
}

function renderFilterTabs(filters, activeFilter) {
  return `
    <div class="filter-tabs" id="feed-filters">
      ${filters.map(filter => `
        <div class="filter-tab ${filter.id === activeFilter ? 'active' : ''}" data-filter="${filter.id}">
          ${filter.label}
          <span class="tab-count">${filter.count}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRelationBlock(relation) {
  if (!relation || (!relation.assets.length && !relation.tags.length)) {
    return '';
  }

  const chips = [
    ...relation.assets.map(asset => `<span class="relation-chip asset">${escapeHTML(asset)}</span>`),
    ...relation.tags.map(tag => `<span class="relation-chip tag">${escapeHTML(tag)}</span>`)
  ];

  return `
    <div class="feed-relation">
      <div class="feed-relation-label">${relation.reason}</div>
      <div class="feed-relation-chips">
        ${chips.join('')}
      </div>
    </div>
  `;
}

function buildAssetIndex(assets) {
  if (!Array.isArray(assets)) return [];
  return assets.map(asset => {
    const ticker = String(asset.ticker || '').toUpperCase().trim();
    const name = String(asset.name || '').trim();
    const tokens = new Set();

    if (ticker && ticker !== 'PRIVATE') {
      tokens.add(ticker);
    }

    name.split(/[^a-z0-9]+/i).forEach(word => {
      const token = word.toUpperCase();
      if (token.length >= 4 && !ASSET_TOKEN_STOPWORDS.has(token)) {
        tokens.add(token);
      }
    });

    return { ticker, name, tokens };
  }).filter(asset => asset.tokens.size > 0);
}

function buildFeedRelation(item, assetIndex) {
  const text = `${item.headline || ''} ${item.summary || ''} ${item.source || ''}`.trim();
  const assets = findAssetMatches(text, assetIndex);
  const tags = new Set();

  if (item.category) {
    tags.add(formatCategoryLabel(item.category));
  }

  extractTags(text).forEach(tag => tags.add(tag));

  const assetList = assets.slice(0, 3);
  const tagList = Array.from(tags).slice(0, 3);
  const reason = assetList.length ? 'Matched holdings' : (tagList.length ? 'Matched themes' : 'General market context');

  return { assets: assetList, tags: tagList, reason };
}

function buildSignalRelation(signal, assetIndex) {
  const assets = (signal.relatedAssets || []).map(formatRelatedAssetLabel).filter(Boolean);
  const tags = new Set();
  const text = `${signal.title || ''} ${signal.body || signal.message || ''}`.trim();

  if (signal.category) {
    tags.add(formatCategoryLabel(signal.category));
  }

  extractTags(text).forEach(tag => tags.add(tag));

  const assetList = assets.slice(0, 3);
  const tagList = Array.from(tags).slice(0, 3);
  const reason = assetList.length ? 'Linked to your portfolio' : (tagList.length ? 'Portfolio themes' : 'Portfolio context');

  return { assets: assetList, tags: tagList, reason };
}

function buildFeedFilters(feedItems, signals) {
  const filters = [];
  const totalCount = feedItems.length + signals.length;
  const relatedCount = countRelatedItems(feedItems, signals);

  filters.push({ id: 'all', label: 'All', count: totalCount });
  filters.push({ id: 'signals', label: 'Signals', count: signals.length });
  filters.push({ id: 'related', label: 'Related', count: relatedCount });

  const categoryCounts = new Map();
  feedItems.forEach(item => {
    if (!item.category) return;
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  });
  signals.forEach(signal => {
    if (!signal.category) return;
    categoryCounts.set(signal.category, (categoryCounts.get(signal.category) || 0) + 1);
  });

  Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .forEach(([category, count]) => {
      filters.push({ id: category, label: formatCategoryLabel(category), count });
    });

  return filters;
}

function buildFeedSummary(feedItems, signals) {
  const sources = new Set(feedItems.map(item => item.source).filter(Boolean));
  const relatedItemCount = countRelatedItems(feedItems, signals);
  const assetMatches = new Set();

  feedItems.forEach(item => {
    item.relation.assets.forEach(asset => assetMatches.add(asset));
  });
  signals.forEach(signal => {
    signal.relation.assets.forEach(asset => assetMatches.add(asset));
  });

  return {
    sourceCount: sources.size,
    signalCount: signals.length,
    relatedItemCount,
    assetMatchCount: assetMatches.size
  };
}

function countRelatedItems(feedItems, signals) {
  const feedRelated = feedItems.filter(item => hasRelationMatch(item.relation)).length;
  const signalRelated = signals.filter(signal => hasRelationMatch(signal.relation)).length;
  return feedRelated + signalRelated;
}

function hasRelationMatch(relation) {
  if (!relation) return false;
  return relation.assets.length > 0 || relation.tags.length > 0;
}

function findAssetMatches(text, assetIndex) {
  const textUpper = String(text || '').toUpperCase();
  const matches = [];
  const seen = new Set();

  for (const asset of assetIndex) {
    if (!asset.tokens.size) continue;
    for (const token of asset.tokens) {
      if (token.length <= 5) {
        const re = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'i');
        if (!re.test(textUpper)) continue;
      } else if (!textUpper.includes(token)) {
        continue;
      }

      const label = asset.ticker && asset.ticker !== 'PRIVATE' ? asset.ticker : asset.name;
      if (label && !seen.has(label)) {
        seen.add(label);
        matches.push(label);
      }
      break;
    }
  }

  return matches;
}

function extractTags(text) {
  const upper = String(text || '').toUpperCase();
  const tags = [];
  TAG_KEYWORDS.forEach(({ tag, keywords }) => {
    if (keywords.some(keyword => upper.includes(keyword))) {
      tags.push(tag);
    }
  });
  return tags;
}

function formatRelatedAssetLabel(raw) {
  if (!raw) return '';
  const text = String(raw);
  const parts = text.split('-').filter(Boolean);
  const stop = new Set(['eq', 'rsu', 'roth', 'ira', '401k', 'startup', 'portfolio', 'tax', 'acct', 'account', 'plan']);
  const ticker = parts.find(part => /^[a-z]{1,6}$/i.test(part) && !stop.has(part.toLowerCase()));
  if (ticker) return ticker.toUpperCase();
  const fallback = parts[parts.length - 1] || text;
  return fallback.charAt(0).toUpperCase() + fallback.slice(1);
}

function formatCategoryLabel(category) {
  return String(category || '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseTimestamp(timestamp) {
  const time = new Date(timestamp).getTime();
  return Number.isFinite(time) ? time : 0;
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

function escapeHTML(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
