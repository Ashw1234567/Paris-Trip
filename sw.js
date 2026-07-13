/* Shrishti · Paris — offline service worker
   Caches the whole guide on first visit so it works in airplane mode,
   in the métro, and anywhere she has no signal. */

const CACHE = 'paris-shrishti-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install: cache the shell immediately.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: bin any old versions.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network first (so updates land when she hits wifi),
// falling back to cache the moment the signal drops.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(hit => hit || caches.match('./index.html'))
      )
  );
});
