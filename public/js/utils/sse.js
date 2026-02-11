const listeners = [];

function connect() {
  const es = new EventSource('/api/events');
  es.onmessage = (event) => {
    try {
      const { resource } = JSON.parse(event.data);
      listeners.forEach(fn => fn(resource));
    } catch (e) {
      console.warn('SSE parse error:', e);
    }
  };
}

export function subscribe(callback) {
  listeners.push(callback);
}

connect();
