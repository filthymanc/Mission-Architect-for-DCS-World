
const CACHE_NAME = 'dcs-architect-v2.2-phase10';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install: Cache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for external resources (ESM, Fonts, CDN)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if request is for external dependencies
  const isExternalAsset = 
    url.hostname.includes('esm.sh') || 
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isExternalAsset || event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // 1. Try to find in cache
        const cachedResponse = await cache.match(event.request);
        
        // 2. Fetch from network and update cache
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Check if valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
            return networkResponse;
          }
          // Clone and cache
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
            // Network failed. If we have a cached response, great. If not, we are offline and failed.
            if (cachedResponse) return cachedResponse;
            throw new Error('Offline and resource not cached');
        });

        // 3. Strategy: Return cached response immediately if available (fast), 
        //    otherwise wait for network.
        return cachedResponse || fetchPromise;
      })
    );
  } else {
    // Default: Network falling back to cache
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
    