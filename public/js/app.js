import { renderSidebar, updateActiveNav } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { renderPortfolio } from './views/portfolio.js';
import { renderFeed } from './views/feed.js';
import { renderLegal } from './views/legal.js';
import { subscribe } from './utils/sse.js';

const views = {
  portfolio: renderPortfolio,
  feed: renderFeed,
  legal: renderLegal
};

const resourceToViews = {
  portfolio: ['portfolio', 'legal'],
  signals: ['feed']
};

async function init() {
  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('header');

  await renderSidebar(sidebar);
  renderHeader(header);
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
  renderHeader(document.getElementById('header'));
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', init);
