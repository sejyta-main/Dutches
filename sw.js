/* Rekenreis offline cache. Online-first for app code prevents old iPad versions. */
const CACHE = 'rekenreis-v7-online-first';
const APP = [
  './', './index.html', './style.css', './adventures.css',
  './rewards.css', './pet-world.css', './pet-home-install.css',
  './app.js', './dictee.js', './memory-game.js', './activities.js',
  './rewards.js', './pet-core.js', './pet-world.js', './pet-entry.js',
  './install-mobile.js', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png',
  './icons/icon-512.png', './icons/apple-touch-icon.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key.startsWith('rekenreis-') && key !== CACHE).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const fresh = request.mode === 'navigate' || /\.(?:js|css|html|webmanifest)$/i.test(url.pathname);
  const cached = () => caches.match(request, {ignoreSearch: true}).then(response =>
    response || (request.mode === 'navigate' ? caches.match('./index.html') : undefined)
  );
  const network = () => fetch(request, {cache: 'no-store'}).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
    }
    return response;
  });
  event.respondWith(fresh
    ? network().catch(() => cached().then(r => r || Response.error()))
    : cached().then(r => r || network()));
});
