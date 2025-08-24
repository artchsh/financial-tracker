// Robust Service Worker for PWA: cache versioning, offline, update flow
const STATIC_CACHE = 'ft-static-v1';
const RUNTIME_CACHE = 'ft-runtime-v1';

// Must match how the app serves the file (we serve it under /public/version.json)
const VERSION_URL = '/public/version.json';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  // The app bundle filename is hashed by bundlers; runtime cache will handle it.
  // Note: assets live under /public in this app
  '/public/manifest.json',
  '/public/icons/icon-192.png',
  '/public/icons/icon-512.png',
  VERSION_URL,
];

// Detect localhost/dev hosts — if true, skip all caching behavior
const isLocalhost = (() => {
  try {
    const host = self.location && self.location.hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host?.endsWith('.localhost')
    );
  } catch {
    return false;
  }
})();

// Utility: fetch with network-first and fallback to cache
async function networkFirst(req) {
  if (isLocalhost) {
    // In dev, always use network only
    return fetch(req);
  }
  try {
    const res = await fetch(req);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw e;
  }
}

// Utility: cache-first for static
async function cacheFirst(req) {
  if (isLocalhost) {
    // In dev, always use network only
    return fetch(req);
  }
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(req, res.clone());
  return res;
}

self.addEventListener('install', (event) => {
  // If running on localhost, do not pre-cache assets
  if (isLocalhost) {
    self.skipWaiting();
    return;
  }

  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS.filter(Boolean))).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  // If running on localhost, skip cache cleanup
  if (isLocalhost) {
    event.waitUntil(self.clients.claim());
    return;
  }

  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      // Take control so clients can message immediately
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // If localhost, don't serve from cache — just pass through to network
  if (isLocalhost) {
    event.respondWith(
      fetch(request).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // Handle version file network-first to detect updates quickly
  if (url.pathname === new URL(VERSION_URL, location.origin).pathname) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Navigation requests: network-first with offline fallback to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put('/index.html', res.clone());
          return res;
        } catch {
          const cached = await caches.match('/index.html');
          return cached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Static assets: cache-first
  if (STATIC_ASSETS.some((p) => url.pathname === new URL(p, location.origin).pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network-first for same-origin, pass-through for cross-origin
  if (url.origin === location.origin) {
    event.respondWith(networkFirst(request));
  }
});

// Listen for SKIP_WAITING and CHECK_VERSION messages from client
self.addEventListener('message', async (event) => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') {
    await self.skipWaiting();
    // Try to include the latest version payload for clients
    let versionPayload = null;
    try {
      const res = await fetch(VERSION_URL, { cache: 'no-store' });
      if (res.ok) versionPayload = await res.json();
    } catch {}

    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.postMessage({ type: 'RELOAD_REQUIRED', version: versionPayload }));
  }
});
