/* eslint-disable no-restricted-globals */

const ignored = self.__WB_MANIFEST;

const CACHE_NAME = 'melife-app-v2'; // bump version when you update assets
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-512x512.png',
];

// ── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  // Force this SW to become active immediately (skip waiting)
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

// ── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      )
    ).then(() => {
      // Take control of all open clients immediately
      return self.clients.claim();
    })
  );
});

// ── FETCH ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (e.g. analytics, APIs)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache hit — return immediately
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not cached — fetch from network, then cache it
      return fetch(event.request).then((networkResponse) => {
        // Only cache valid same-origin basic responses
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // ── FIXED: Offline fallbacks must ALWAYS return a valid Response ──
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }

        // If an asset, chunk, or fetch utility fails offline, return a clean 503 error response
        return new Response('Network error occurred (Offline)', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});
