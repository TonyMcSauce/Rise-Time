/* Rise Time service worker: makes the whole app available offline.
   Bump VERSION whenever you deploy changes so devices pick up the new files. */
const VERSION = 'rise-time-v1.4.0';
const SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/content.js',
  './js/content-w4.js',
  './js/content-w5.js',
  './js/content-w6.js',
  './js/content-w7.js',
  './js/extras2.js',
  './js/content-w10.js',
  './js/content-w13.js',
  './js/extras.js',
  './js/app.js',
  './js/sims2.js',
  './js/sims3.js',
  './js/features.js',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/chakra-petch-latin-500-normal.woff2',
  './fonts/chakra-petch-latin-600-normal.woff2',
  './fonts/chakra-petch-latin-700-normal.woff2',
  './fonts/ibm-plex-sans-latin-400-normal.woff2',
  './fonts/ibm-plex-sans-latin-500-normal.woff2',
  './fonts/ibm-plex-sans-latin-600-normal.woff2',
  './fonts/ibm-plex-sans-latin-400-italic.woff2',
  './fonts/ibm-plex-sans-greek-400-normal.woff2',
  './fonts/martian-mono-latin-400-normal.woff2',
  './fonts/martian-mono-latin-500-normal.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('rise-time-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Page loads: try the network briefly so updates arrive, fall back to the cached app.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const net = await Promise.race([
          fetch(req),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]);
        if (net && net.ok) cache.put('./index.html', net.clone());
        return net;
      } catch (e) {
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Everything else: serve from cache instantly, refresh the cache in the background.
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });
    const refresh = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { event.waitUntil(refresh); return cached; }
    return (await refresh) || Response.error();
  })());
});

/* Morning reminder: runs from periodic background sync where the browser allows it (installed Chromium apps).
   State is kept in a separate cache so the activate cleanup above never deletes it. */
function localYmd(d){ const f=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+f(d.getMonth()+1)+'-'+f(d.getDate()); }
self.addEventListener('periodicsync', event => {
  if (event.tag !== 'rise-time-daily') return;
  event.waitUntil((async () => {
    const cache = await caches.open('rtstate');
    const res = await cache.match('state.json');
    if (!res) return;
    const st = await res.json().catch(() => null);
    if (!st || !st.remind || !st.remind.on) return;
    const now = new Date(), today = localYmd(now), dow = now.getDay();
    if (dow === 0 || dow === 6) return;
    const [hh, mm] = String(st.remind.time || '06:30').split(':').map(Number);
    if (now.getHours() * 60 + now.getMinutes() < hh * 60 + mm) return;
    if (st.lastDone === today || st.notified === today) return;
    await self.registration.showNotification('Rise Time', {
      body: 'Fifteen minutes this morning keeps the signal clean. Today\'s session is ready.',
      icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: 'rise-time-daily', data: { url: './#today' }
    });
    st.notified = today;
    await cache.put('state.json', new Response(JSON.stringify(st), { headers: { 'Content-Type': 'application/json' } }));
  })());
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './#today';
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if ('focus' in c) { await c.focus(); return; } }
    await self.clients.openWindow(url);
  })());
});
