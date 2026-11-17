// Keeps the game playable without a network: sound clips are kept once fetched (a clip never
// changes under its name), and the pages are fetched fresh when there is a network.
const CACHE = 'zoo-2';   // a new name when clips have been recorded again under their old names
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (u.pathname.includes('/audio/')) {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }
    try { const res = await fetch(e.request); if (res.ok) cache.put(e.request, res.clone()); return res; }
    catch (err) { const hit = await cache.match(e.request, { ignoreSearch: true }); if (hit) return hit; throw err; }
  })());
});
