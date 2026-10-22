/* Le mie app ByCSD: un service worker per ogni app, nota o menu', solo per la sua cartella.
   Prima la rete, e senza Internet la copia salvata dell'ultima apertura. */
const CACHE = 'gazzetta-bycsd-v1';
self.addEventListener('install', e => { self.skipWaiting();
  /* la pagina si salva subito, cosi' funziona senza Internet gia' dalla prima volta */
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([self.registration.scope, 'manifest.json'])).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok && res.type === 'basic') {
        const c = res.clone();
        caches.open(CACHE).then(k => k.put(r, c)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(r, { ignoreSearch: true })
        .then(m => m || (r.mode === 'navigate' ? caches.match(self.registration.scope) : undefined))
        .then(m => m || Response.error())
    )
  );
});
