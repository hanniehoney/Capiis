import { getSignals, getCategoryConfig } from '../utils/api.js';
import { getCategoryColor, getCategoryLabel, setCategoryConfig } from './charts.js';

let assetsExpanded = true;
let liabilitiesExpanded = true;
let taxExpanded = true;
const taxDetailViews = ['tax-hidden-liability', 'tax-taxable-events'];

function isWealthView(hash) {
  return hash === 'portfolio';
}

function isTaxView(hash) {
  return hash === 'legal' || taxDetailViews.includes(hash);
}

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
  const isWealthSection = isWealthView(currentHash);
  const isTaxSection = isTaxView(currentHash);
  const activeCategory = currentHash.startsWith('category-') ? currentHash.slice('category-'.length) : '';

  if (!isTaxSection) {
    taxExpanded = false;
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
    return `<a href="#category-${cat}" class="nav-sub-item ${isActive ? 'active' : ''}" data-view="category-${cat}" data-group="assets">
      <span class="nav-dot" style="background:${color}"></span>
      ${label}
    </a>`;
  }).join('');

  const liabilitySubItems = liabilityCategories.map(cat => {
    const color = getCategoryColor(cat);
    const label = getCategoryLabel(cat);
    const isActive = currentHash === `category-${cat}`;
    return `<a href="#category-${cat}" class="nav-sub-item ${isActive ? 'active' : ''}" data-view="category-${cat}" data-group="liabilities">
      <span class="nav-dot" style="background:${color}"></span>
      ${label}
    </a>`;
  }).join('');

  const taxSubItems = [
    { view: 'tax-hidden-liability', label: 'Hidden Liabilities' },
    { view: 'tax-taxable-events', label: 'Taxable Events' }
  ].map(item => `
    <a href="#${item.view}" class="nav-sub-item ${currentHash === item.view ? 'active' : ''}" data-view="${item.view}">
      <span class="nav-dot" style="background:var(--gold-primary)"></span>
      ${item.label}
    </a>
  `).join('');

  const showAssetsDetails = assetsExpanded;
  const showLiabilitiesDetails = liabilitiesExpanded;
  const showTaxDetails = isTaxSection && taxExpanded;

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

      <button class="nav-item nav-toggle ${isAssetCategoryActive ? 'active' : ''} ${assetsExpanded ? '' : 'is-collapsed'}" data-toggle="assets" data-view="assets" type="button">
        <span class="nav-icon">\u25C6</span>
        Assets
        <span class="section-chevron nav-chevron">\u25BE</span>
      </button>
      ${showAssetsDetails ? `
        <div class="nav-sub-section">
          ${assetSubItems}
        </div>
      ` : ''}

      <button class="nav-item nav-toggle ${isLiabilityCategoryActive ? 'active' : ''} ${liabilitiesExpanded ? '' : 'is-collapsed'}" data-toggle="liabilities" data-view="liabilities" type="button">
        <span class="nav-icon">\u25C7</span>
        Liabilities
        <span class="section-chevron nav-chevron">\u25BE</span>
      </button>
      ${showLiabilitiesDetails ? `
        <div class="nav-sub-section">
          ${liabilitySubItems}
        </div>
      ` : ''}

      <a href="#legal" class="nav-item ${isTaxSection ? 'active' : ''}" data-view="legal">
        <span class="nav-icon">\u25CA</span>
        Tax
      </a>
      ${showTaxDetails ? `
        <div class="nav-sub-section">
          ${taxSubItems}
        </div>
      ` : ''}
      <a href="#feed" class="nav-item ${currentHash === 'feed' ? 'active' : ''}" data-view="feed">
        <span class="nav-icon">\u25C9</span>
        Feed
        ${signalCount > 0 ? `<span class="nav-badge">${signalCount}</span>` : ''}
      </a>
    </nav>

    <div class="sidebar-footer">
      <a href="#profile" class="nav-item nav-item-footer ${currentHash === 'profile' ? 'active' : ''}" data-view="profile">
        <span class="nav-icon">\u2699</span>
        Profile
      </a>
    </div>
  `;

  const taxLink = container.querySelector('a[data-view="legal"]');
  if (taxLink) {
    taxLink.addEventListener('click', (e) => {
      const hash = location.hash.slice(1) || 'portfolio';
      const inTaxSection = isTaxView(hash);
      if (inTaxSection) {
        e.preventDefault();
        taxExpanded = !taxExpanded;
        renderSidebar(container);
        return;
      }
      taxExpanded = true;
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
  const isWealthSection = isWealthView(hash);
  const isTaxSection = isTaxView(hash);
  const assetActive = document.querySelector('.nav-sub-item[data-group="assets"].active');
  const liabilityActive = document.querySelector('.nav-sub-item[data-group="liabilities"].active');

  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(item => {
    const view = item.dataset.view;
    if (view === 'portfolio') {
      item.classList.toggle('active', isWealthSection);
    } else if (view === 'legal' && item.classList.contains('nav-item')) {
      item.classList.toggle('active', isTaxSection);
    } else if (view === 'assets') {
      item.classList.toggle('active', !!assetActive);
    } else if (view === 'liabilities') {
      item.classList.toggle('active', !!liabilityActive);
    } else {
      item.classList.toggle('active', view === hash);
    }
  });
}
