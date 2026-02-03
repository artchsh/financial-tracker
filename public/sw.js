// Robust Service Worker for PWA: cache versioning, offline, update flow
const STATIC_CACHE = 'ft-static-v2';
const RUNTIME_CACHE = 'ft-runtime-v2';

// Must match how the app serves the file (we serve it under /public/version.json)
const VERSION_URL = '/public/version.json';
const VERSION_PATHNAME = new URL(VERSION_URL, location.origin).pathname;

// Build timestamp for cache-busting (will be replaced during build)
const BUILD_TIMESTAMP = '__BUILD_TIMESTAMP__';

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

// Always cache, including localhost, to ensure consistent update flow

// Utility: fetch with network-first and fallback to cache
async function networkFirst(req) {
  try {
    // For version.json, add cache-busting query parameter
    let fetchUrl = req;
    const reqUrl = new URL(req.url || req);
    if (reqUrl.pathname === VERSION_PATHNAME) {
      // Add timestamp as query parameter to bypass cache
      const bustUrl = new URL(reqUrl);
      bustUrl.searchParams.set('t', BUILD_TIMESTAMP !== '__BUILD_TIMESTAMP__' ? BUILD_TIMESTAMP : Date.now().toString());
      fetchUrl = new Request(bustUrl.toString(), {
        method: req.method,
        headers: req.headers,
        mode: req.mode,
        credentials: req.credentials,
        cache: 'no-store',
      });
    }
    const res = await fetch(fetchUrl);
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
  // Do not auto-activate the new SW; wait for user action via SKIP_WAITING
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Add cache-busting for version.json during install
      const assetsToCache = STATIC_ASSETS.filter(Boolean).map(url => {
        if (url === VERSION_URL) {
          const bustUrl = new URL(url, location.origin);
          bustUrl.searchParams.set('t', BUILD_TIMESTAMP !== '__BUILD_TIMESTAMP__' ? BUILD_TIMESTAMP : Date.now().toString());
          return bustUrl.toString();
        }
        return url;
      });
      return cache.addAll(assetsToCache);
    }).catch(() => {})
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
  // Clear runtime cache to ensure fresh shell/assets load after update activation
  await caches.delete(RUNTIME_CACHE);
  await caches.open(RUNTIME_CACHE);
      // Take control so clients can message immediately
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle version file network-first to detect updates quickly
  if (url.pathname === VERSION_PATHNAME) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Navigation requests: cache-first to keep app stable until explicit update
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cached = await caches.match('/index.html');
        if (cached) return cached;
        // If not cached yet, fetch and cache
        try {
          const res = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put('/index.html', res.clone());
          return res;
        } catch {
          return new Response('Offline', { status: 503 });
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

  // Default: cache-first for same-origin, pass-through for cross-origin
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  }
});

// Listen for SKIP_WAITING and CHECK_VERSION messages from client
self.addEventListener('message', async (event) => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') {
    await self.skipWaiting();
    // Try to include the latest version payload for clients with cache-busting
    let versionPayload = null;
    try {
      const versionUrl = new URL(VERSION_URL, location.origin);
      versionUrl.searchParams.set('t', BUILD_TIMESTAMP !== '__BUILD_TIMESTAMP__' ? BUILD_TIMESTAMP : Date.now().toString());
      const res = await fetch(versionUrl.toString(), { cache: 'no-store' });
      if (res.ok) versionPayload = await res.json();
    } catch {}

    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.postMessage({ type: 'RELOAD_REQUIRED', version: versionPayload }));
  }
});
