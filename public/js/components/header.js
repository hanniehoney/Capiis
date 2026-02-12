const VIEW_TITLES = {
  portfolio: 'Wealth',
  feed: 'Intelligence Feed',
  legal: 'Tax & Legal Planning'
};

export function renderHeader(container) {
  const currentView = location.hash.slice(1) || 'portfolio';
  const title = VIEW_TITLES[currentView] || 'Dashboard';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <button class="sidebar-toggle" id="sidebar-toggle">\u2630</button>
      <span class="header-title">${title}</span>
    </div>
    <div class="header-right">
      <span class="header-timestamp">${dateStr} ${timeStr}</span>
      <div class="header-status">
        <span class="status-dot"></span>
        Live
      </div>
    </div>
  `;

  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }
}
