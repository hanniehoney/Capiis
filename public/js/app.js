import { renderSidebar, updateActiveNav } from './components/sidebar.js';
import { renderPortfolio } from './views/portfolio.js';
import { renderCategoryDetail } from './views/category-detail.js';
import { renderFeed } from './views/feed.js';
import { renderLegal } from './views/legal.js';
import { renderProfile } from './views/profile.js';
import { subscribe } from './utils/sse.js';

const views = {
  portfolio: renderPortfolio,
  feed: renderFeed,
  legal: renderLegal,
  profile: renderProfile
};

const resourceToViews = {
  portfolio: ['portfolio'],
  signals: ['feed'],
  profile: ['profile', 'legal'],
  tax: ['legal']
};

async function init() {
  const sidebar = document.getElementById('sidebar');

  await renderSidebar(sidebar);
  bindSidebarToggle();
  route();

  subscribe((resource) => {
    const currentView = location.hash.slice(1) || 'portfolio';

    // Handle category detail pages — refresh on portfolio changes
    if (currentView.startsWith('category-') && resource === 'portfolio') {
      const category = currentView.slice('category-'.length);
      renderCategoryDetail(document.getElementById('main-content'), category);
      return;
    }

    const affectedViews = resourceToViews[resource] || [];
    if (affectedViews.includes(currentView)) {
      views[currentView](document.getElementById('main-content'));
    }
    renderSidebar(document.getElementById('sidebar'));
  });
}

function bindSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  if (!toggle) {
    return;
  }
  toggle.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  });
}

async function route() {
  const hash = location.hash.slice(1) || 'portfolio';
  const mainContent = document.getElementById('main-content');
  const sidebar = document.getElementById('sidebar');

  if (hash.startsWith('category-')) {
    const category = hash.slice('category-'.length);
    renderCategoryDetail(mainContent, category);
  } else {
    const renderView = views[hash];
    if (renderView) {
      renderView(mainContent);
    } else {
      location.hash = '#portfolio';
      return;
    }
  }

  if (sidebar) {
    await renderSidebar(sidebar);
  }
  updateActiveNav();
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', init);
