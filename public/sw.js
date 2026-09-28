const V = 'catfeeder-v1'
self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(V).then((c) => c.addAll(['./', './manifest.webmanifest', './icons/icon-192.png'])))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim()))
})
// Network-first; jika offline pakai cache. MQTT (WebSocket / origin lain) tidak disentuh.
self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return
  e.respondWith(
    fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); return res })
      .catch(() => caches.match(r).then((m) => m || caches.match('./')))
  )
})
