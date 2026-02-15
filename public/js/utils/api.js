const API_BASE = '/api';

async function fetchJSON(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  let payload = null;
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    payload = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => '');
    payload = text ? { error: text } : null;
  }

  if (!res.ok) {
    const error = new Error(payload?.error || `API error: ${res.status}`);
    error.status = res.status;
    error.payload = payload;
    error.endpoint = endpoint;
    throw error;
  }

  return payload;
}

async function postJSON(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function patchJSON(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getPortfolio() { return fetchJSON('/portfolio'); }
export function getSignals() { return fetchJSON('/signals'); }
export function getFeed() { return fetchJSON('/feed'); }
export function getTaxSummary() { return fetchJSON('/tax-summary'); }
export function getWatchlist() { return fetchJSON('/watchlist'); }
export function getStats() { return fetchJSON('/stats'); }
export function dismissSignal(id) { return patchJSON(`/signals/${id}`, { dismissed: true }); }
export function addSignal(signal) { return postJSON('/signals', signal); }
export function getCategories() { return fetchJSON('/portfolio/categories'); }
export function getCategoryConfig() { return fetchJSON('/categories'); }
export function getProfile() { return fetchJSON('/profile'); }
