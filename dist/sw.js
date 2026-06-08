// Service Worker — Hader PWA
// يخزن الأصول الثابتة ويسمح للتطبيق بالعمل بدون إنترنت

const CACHE_NAME = 'hader-v1';
const STATIC_CACHE = 'hader-static-v1';
const API_CACHE = 'hader-api-v1';

// ملفات يتم تخزينها عند التثبيت
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ─── التثبيت ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ─── التفعيل — حذف الـ cache القديم ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── استراتيجية الجلب (Fetch Strategy) ───────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // الصور من /uploads → cache أولاً ثم الشبكة (مناسب للإنترنت البطيء)
  if (url.pathname.startsWith('/uploads/') || request.destination === 'image') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // طلبات API → الشبكة أولاً مع fallback على الـ cache
  if (url.pathname.startsWith('/api/') || url.hostname.includes('railway.app')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, 5 * 60 * 1000));
    return;
  }

  // الأصول الثابتة (JS, CSS, fonts) → cache أولاً
  if (['script', 'style', 'font'].includes(request.destination)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // الصفحات → الشبكة أولاً مع fallback
  event.respondWith(networkFirst(request));
});

// ─── Cache First: يقرأ من الـ cache، يرجع للشبكة إذا لم يجد ─────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

// ─── Network First: يجرب الشبكة، يرجع للـ cache عند الفشل ─────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/');
  }
}

// ─── Network First مع TTL للـ API ────────────────────────────────────────────
async function networkFirstWithCache(request, cacheName, ttl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      // نضيف timestamp للتحقق من صلاحية الـ cache
      const cloned = response.clone();
      const headers = new Headers(cloned.headers);
      headers.append('sw-cache-timestamp', Date.now().toString());
      const cachedResponse = new Response(await cloned.blob(), {
        status: cloned.status,
        headers,
      });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (!cached) return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
    // تحقق من صلاحية الـ cache
    const ts = cached.headers.get('sw-cache-timestamp');
    if (ts && Date.now() - parseInt(ts) < ttl) return cached;
    return cached;
  }
}
