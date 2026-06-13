// Service Worker מינימלי - מאפשר התקנה כ-PWA ושמירת מעטפת האפליקציה במטמון.
// בקשות API (/api) תמיד עוברות לרשת (נתונים עדכניים), שאר הבקשות: network-first עם נפילה למטמון.
const CACHE = 'nova-shell-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // נתוני API - תמיד מהרשת
  if (url.pathname.startsWith('/api')) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
