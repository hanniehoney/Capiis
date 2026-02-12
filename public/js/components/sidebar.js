import { getSignals, getCategoryConfig } from '../utils/api.js';
import { getCategoryColor, getCategoryLabel, setCategoryConfig } from './charts.js';

let wealthExpanded = true;
let assetsExpanded = true;
let liabilitiesExpanded = true;

export async function renderSidebar(container) {
  let signalCount = 0;
  let config = null;

  try {
    const [signalsData, configData] = await Promise.all([
      getSignals().catch(() => ({ signals: [] })),
      getCategoryConfig().catch(() => null)
    ]);
    signalCount = signalsData.signals.filter(s => !s.dismissed).length;
    config = configData;
    if (config) setCategoryConfig(config);
  } catch (e) {
    console.warn('Failed to load sidebar data:', e);
  }

  const currentHash = location.hash.slice(1) || 'portfolio';
  const isWealthSection = currentHash === 'portfolio' || currentHash.startsWith('category-');
  const activeCategory = currentHash.startsWith('category-') ? currentHash.slice('category-'.length) : '';

  if (!isWealthSection) {
    wealthExpanded = false;
  }

  // Build category sub-items from config
  const assetCategories = getAssetCategories(config);
  const liabilityCategories = getLiabilityCategories(config);
  const isAssetCategoryActive = assetCategories.includes(activeCategory);
  const isLiabilityCategoryActive = liabilityCategories.includes(activeCategory);

  if (isAssetCategoryActive) assetsExpanded = true;
  if (isLiabilityCategoryActive) liabilitiesExpanded = true;

  const assetSubItems = assetCategories.map(cat => {
    const color = getCategoryColor(cat);
    const label = getCategoryLabel(cat);
    const isActive = currentHash === `category-${cat}`;
    return `<a href="#category-${cat}" class="nav-sub-item ${isActive ? 'active' : ''}" data-view="category-${cat}">
      <span class="nav-dot" style="background:${color}"></span>
      ${label}
    </a>`;
  }).join('');

  const liabilitySubItems = liabilityCategories.map(cat => {
    const color = getCategoryColor(cat);
    const label = getCategoryLabel(cat);
    const isActive = currentHash === `category-${cat}`;
    return `<a href="#category-${cat}" class="nav-sub-item ${isActive ? 'active' : ''}" data-view="category-${cat}">
      <span class="nav-dot" style="background:${color}"></span>
      ${label}
    </a>`;
  }).join('');

  const showWealthDetails = isWealthSection && wealthExpanded;

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
      <a href="#portfolio" class="nav-item ${isWealthSection ? 'active' : ''}" data-view="portfolio">
        <span class="nav-icon">\u25C8</span>
        Wealth
      </a>

      ${showWealthDetails ? `
        <div class="nav-sub-section">
          <button class="sidebar-section-label section-toggle ${assetsExpanded ? '' : 'is-collapsed'}" data-toggle="assets" type="button">
            <span>Assets</span>
            <span class="section-chevron">\u25BE</span>
          </button>
          ${assetsExpanded ? assetSubItems : ''}
          <button class="sidebar-section-label section-toggle ${liabilitiesExpanded ? '' : 'is-collapsed'}" data-toggle="liabilities" type="button">
            <span>Liabilities</span>
            <span class="section-chevron">\u25BE</span>
          </button>
          ${liabilitiesExpanded ? liabilitySubItems : ''}
        </div>
      ` : ''}

      <a href="#feed" class="nav-item ${currentHash === 'feed' ? 'active' : ''}" data-view="feed">
        <span class="nav-icon">\u25C9</span>
        Feed
        ${signalCount > 0 ? `<span class="nav-badge">${signalCount}</span>` : ''}
      </a>
      <a href="#legal" class="nav-item ${currentHash === 'legal' ? 'active' : ''}" data-view="legal">
        <span class="nav-icon">\u25CA</span>
        Tax
      </a>
    </nav>

    <div class="sidebar-footer">
      <a href="#profile" class="nav-item nav-item-footer ${currentHash === 'profile' ? 'active' : ''}" data-view="profile">
        <span class="nav-icon">\u2699</span>
        Profile
      </a>
    </div>
  `;

  const wealthLink = container.querySelector('a[data-view="portfolio"]');
  if (wealthLink) {
    wealthLink.addEventListener('click', (e) => {
      const hash = location.hash.slice(1) || 'portfolio';
      const inWealthSection = hash === 'portfolio' || hash.startsWith('category-');
      if (inWealthSection) {
        e.preventDefault();
        wealthExpanded = !wealthExpanded;
        renderSidebar(container);
        return;
      }
      wealthExpanded = true;
    });
  }

  container.querySelectorAll('[data-toggle="assets"], [data-toggle="liabilities"]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.dataset.toggle;
      if (target === 'assets') {
        assetsExpanded = !assetsExpanded;
      } else if (target === 'liabilities') {
        liabilitiesExpanded = !liabilitiesExpanded;
      }
      renderSidebar(container);
    });
  });
}

function getAssetCategories(config) {
  if (config && config.assetClasses) {
    const cats = [];
    for (const cls of Object.values(config.assetClasses)) {
      cats.push(...cls.categories);
    }
    return cats;
  }
  return ['stocks', 'crypto', 'angel-investment', 'employee-equity', 'real-estate', 'cash', 'savings', 'vehicles', 'jewelry', 'art'];
}

function getLiabilityCategories(config) {
  if (config && config.liabilityClasses) {
    const cats = [];
    for (const cls of Object.values(config.liabilityClasses)) {
      cats.push(...cls.categories);
    }
    return cats;
  }
  return ['credit-cards', 'mortgage', 'auto-loan', 'student-loan'];
}

export function updateActiveNav() {
  const hash = location.hash.slice(1) || 'portfolio';
  const isWealthSection = hash === 'portfolio' || hash.startsWith('category-');

  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(item => {
    const view = item.dataset.view;
    if (view === 'portfolio') {
      item.classList.toggle('active', isWealthSection);
    } else {
      item.classList.toggle('active', view === hash);
    }
  });
}
