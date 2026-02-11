const API_BASE = '/api';

async function fetchJSON(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
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
export function addHolding(holding) { return postJSON('/portfolio', holding); }
export function deleteHolding(id) {
  return fetch(`${API_BASE}/portfolio/${id}`, { method: 'DELETE' }).then(r => {
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    return r.json();
  });
}
