/*
 * Mission Architect for DCS
 * Copyright (C) 2026 the filthymanc
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// --- CONFIGURATION ---
const APP_VERSION = "2.5.0"; // Sync with package.json
const CACHE_NAME = `mission-architect-v${APP_VERSION}`;
const REPO_PATH = "/Mission-Architect-for-DCS-World"; // GitHub Pages Repository Name

// --- ASSETS TO PRE-CACHE ---
// We use relative paths to ensure compatibility with both Localhost and GitHub Pages
const PRECACHE_URLS = ["./", "./index.html", "./manifest.json"];

// --- INSTALL PHASE ---
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Force activation immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[SW] Pre-caching App Shell: ${CACHE_NAME}`);
      return cache.addAll(PRECACHE_URLS);
    }),
  );
});

// --- ACTIVATE PHASE ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log(`[SW] Deleting old cache: ${cache}`);
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => self.clients.claim()), // Take control of all clients immediately
  );
});

// --- FETCH PHASE ---
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // STRATEGY 1: IGNORE API CALLS (Network Only)
  // We never want to cache Google Gemini responses
  if (url.hostname.includes("googleapis.com")) {
    return;
  }

  // STRATEGY 2: HTML NAVIGATION (Network First -> Cache Fallback)
  // Try to get the latest page from the server. If offline, serve the App Shell.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("./index.html");
      }),
    );
    return;
  }

  // STRATEGY 3: STATIC ASSETS (Stale-While-Revalidate)
  // Serve from cache immediately for speed, but update the cache in the background.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Only cache valid responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, suppress error as we might have a cache hit
          });

        return cachedResponse || fetchPromise;
      });
    }),
  );
});
