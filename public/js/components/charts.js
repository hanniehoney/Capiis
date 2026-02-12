const FALLBACK_COLORS = ['#6b8e5a', '#9aad7b', '#b8c49a', '#7a9168', '#5c7a4d', '#8fa67e'];

const DEFAULT_CATEGORY_COLORS = {
  stocks: '#5b7e4a',
  crypto: '#7d8471',
  'angel-investment': '#a4ac86',
  'employee-equity': '#4a7c59',
  cash: '#8a9178',
  'real-estate': '#6b7d5e',
  savings: '#7d9470',
  vehicles: '#6e8b5e',
  jewelry: '#9a8c6e',
  art: '#8b7d6b',
  'credit-cards': '#b5443b',
  mortgage: '#8b5e3c',
  'auto-loan': '#a0734f',
  'student-loan': '#7d6b5e'
};

const DEFAULT_CATEGORY_LABELS = {
  stocks: 'Stocks',
  crypto: 'Crypto',
  'angel-investment': 'Angel Investment',
  'employee-equity': 'Employee Equity',
  cash: 'Cash & Checking',
  'real-estate': 'Real Estate',
  savings: 'Savings & CDs',
  vehicles: 'Vehicles',
  jewelry: 'Jewelry',
  art: 'Art & Collectibles',
  'credit-cards': 'Credit Cards',
  mortgage: 'Mortgage',
  'auto-loan': 'Auto Loan',
  'student-loan': 'Student Loan'
};

let _categoryConfig = null;

export function setCategoryConfig(config) {
  _categoryConfig = config;
}

export function getCategoryColor(cat, idx) {
  if (_categoryConfig && _categoryConfig.categoryMeta && _categoryConfig.categoryMeta[cat]) {
    return _categoryConfig.categoryMeta[cat].color;
  }
  return DEFAULT_CATEGORY_COLORS[cat] || FALLBACK_COLORS[(idx || 0) % FALLBACK_COLORS.length];
}

export function getCategoryLabel(cat) {
  if (_categoryConfig && _categoryConfig.categoryMeta && _categoryConfig.categoryMeta[cat]) {
    return _categoryConfig.categoryMeta[cat].label;
  }
  return DEFAULT_CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
}

export function renderDonutChart(allocation, allocationAbsolute, totalValue, centerLabel = 'Total') {
  const radius = 75;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;

  const categories = Object.entries(allocation)
    .filter(([, pct]) => pct > 0)
    .sort((a, b) => b[1] - a[1]);

  let offset = 0;
  const segments = categories.map(([cat, pct], idx) => {
    const color = getCategoryColor(cat, idx);
    const dashLen = (pct / 100) * circumference;
    const dashArray = `${dashLen} ${circumference - dashLen}`;
    const dashOffset = -offset;
    offset += dashLen;
    return `<circle cx="${cx}" cy="${cy}" r="${radius}"
              fill="none" stroke="${color}" stroke-width="22"
              stroke-dasharray="${dashArray}"
              stroke-dashoffset="${dashOffset}"
              opacity="0.9" />`;
  }).join('');

  const centerText = `
    <text x="${cx}" y="${cy - 6}" text-anchor="middle"
          font-family="var(--font-mono)" font-size="11" fill="#8a9178"
          transform="rotate(90 ${cx} ${cy})">${centerLabel}</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle"
          font-family="var(--font-mono)" font-size="16" font-weight="600" fill="#2d4a2b"
          transform="rotate(90 ${cx} ${cy})">$${formatCompact(totalValue)}</text>
  `;

  const svg = `<svg class="donut-svg" viewBox="0 0 200 200">
    ${segments}
    ${centerText}
  </svg>`;

  const legend = categories.map(([cat, pct], idx) => {
    const color = getCategoryColor(cat, idx);
    const label = getCategoryLabel(cat);
    const absVal = allocationAbsolute[cat] || 0;
    return `
      <div class="legend-item">
        <span class="legend-dot" style="background:${color}"></span>
        <span class="legend-label">${label}</span>
        <span class="legend-value">$${formatNumber(absVal)}</span>
        <span class="legend-pct">${pct.toFixed(1)}%</span>
      </div>
    `;
  }).join('');

  return `
    <div class="chart-container">
      ${svg}
      <div class="chart-legend">${legend}</div>
    </div>
  `;
}

export function renderSparkline(data, isPositive = true, width = 80, height = 24) {
  if (!data || data.length < 2) return '';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const color = isPositive ? '#3d7a3d' : '#b5443b';

  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`
  ).join(' ');

  return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;
}

function formatNumber(n) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

function formatCompact(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(0);
}
