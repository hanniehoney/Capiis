import { getSignals, getCategoryConfig, getPortfolio } from '../utils/api.js';
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
  let portfolio = null;

  try {
    const [signalsData, configData, portfolioData] = await Promise.all([
      getSignals().catch(() => ({ signals: [] })),
      getCategoryConfig().catch(() => null),
      getPortfolio().catch(() => null)
    ]);
    signalCount = signalsData.signals.filter(s => !s.dismissed).length;
    config = configData;
    portfolio = portfolioData;
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

  const visibleAssetCategories = getVisibleAssetCategories(
    assetCategories,
    portfolio ? portfolio.assets : null,
    isAssetCategoryActive ? activeCategory : ''
  );
  const visibleLiabilityCategories = getVisibleLiabilityCategories(
    liabilityCategories,
    portfolio ? portfolio.liabilities : null,
    isLiabilityCategoryActive ? activeCategory : ''
  );

  const assetSubItems = visibleAssetCategories.map(cat => {
    const color = getCategoryColor(cat);
    const label = getCategoryLabel(cat);
    const isActive = currentHash === `category-${cat}`;
    return `<a href="#category-${cat}" class="nav-sub-item ${isActive ? 'active' : ''}" data-view="category-${cat}" data-group="assets">
      <span class="nav-dot" style="background:${color}"></span>
      ${label}
    </a>`;
  }).join('');

  const liabilitySubItems = visibleLiabilityCategories.map(cat => {
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
        <img class="brand-icon" src="/assets/favicon.svg" alt="Capiis" width="36" height="36">
        <h1>Capiis</h1>
      </div>
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
          ${assetSubItems || `<div class="nav-sub-item is-muted"><span class="nav-dot" style="opacity:0.4"></span>No active categories</div>`}
        </div>
      ` : ''}

      <button class="nav-item nav-toggle ${isLiabilityCategoryActive ? 'active' : ''} ${liabilitiesExpanded ? '' : 'is-collapsed'}" data-toggle="liabilities" data-view="liabilities" type="button">
        <span class="nav-icon">\u25C7</span>
        Liabilities
        <span class="section-chevron nav-chevron">\u25BE</span>
      </button>
      ${showLiabilitiesDetails ? `
        <div class="nav-sub-section">
          ${liabilitySubItems || `<div class="nav-sub-item is-muted"><span class="nav-dot" style="opacity:0.4"></span>No active categories</div>`}
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

function getVisibleAssetCategories(allCategories, assets, activeCategory) {
  if (!Array.isArray(assets)) return allCategories;

  const active = new Set();
  for (const asset of assets) {
    if (!asset || !allCategories.includes(asset.category)) continue;
    if (getAssetEffectiveValue(asset) > 0) active.add(asset.category);
  }
  if (activeCategory) active.add(activeCategory);

  return allCategories.filter(cat => active.has(cat));
}

function getVisibleLiabilityCategories(allCategories, liabilities, activeCategory) {
  if (!Array.isArray(liabilities)) return allCategories;

  const active = new Set();
  for (const liability of liabilities) {
    if (!liability || !allCategories.includes(liability.category)) continue;
    if (getLiabilityEffectiveValue(liability) > 0) active.add(liability.category);
  }
  if (activeCategory) active.add(activeCategory);

  return allCategories.filter(cat => active.has(cat));
}

function getAssetEffectiveValue(asset) {
  const quantity = Number(asset.quantity) || 0;
  const currentPrice = Number(asset.currentPrice) || 0;
  const avgCost = Number(asset.avgCost) || 0;
  const costBasis = Number(asset.costBasis) || 0;

  const marketValue = quantity * currentPrice;
  const costValue = costBasis || (quantity * avgCost);
  return Math.max(Math.abs(marketValue), Math.abs(costValue));
}

function getLiabilityEffectiveValue(liability) {
  return Math.abs(Number(liability.currentBalance) || 0);
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
