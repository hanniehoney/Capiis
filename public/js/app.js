import { renderSidebar, updateActiveNav } from './components/sidebar.js';
import { renderPortfolio } from './views/portfolio.js';
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
  portfolio: ['portfolio', 'legal'],
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

function route() {
  const hash = location.hash.slice(1) || 'portfolio';
  const mainContent = document.getElementById('main-content');
  const renderView = views[hash];

  if (renderView) {
    renderView(mainContent);
  } else {
    // Fallback to portfolio
    location.hash = '#portfolio';
    return;
  }

  updateActiveNav();
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', init);
