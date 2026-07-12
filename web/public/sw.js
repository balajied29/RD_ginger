/**
 * LEDGER service worker — offline SHELL ONLY (Section 2: no offline
 * writes in v1). Navigations fall back to the cached shell when the
 * network is unreachable; API calls are never cached.
 */
const CACHE = 'ledger-shell-v1';
const SHELL = ['/', '/manifest.json', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')));
  }
});
