// Robust Service Worker for PWA: cache versioning, offline, update flow
const STATIC_CACHE = 'ft-static-v1';
const RUNTIME_CACHE = 'ft-runtime-v1';

const VERSION_URL = '/version.json';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  // The app bundle filename is hashed by bundlers; runtime cache will handle it.
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  VERSION_URL,
];

// Utility: fetch with network-first and fallback to cache
async function networkFirst(req) {
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
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(req, res.clone());
  return res;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS.filter(Boolean))).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
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
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.postMessage({ type: 'RELOAD_REQUIRED' }));
  }
});
