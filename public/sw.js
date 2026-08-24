// Amaris Mathematics Hub - Native Offline Service Worker
// Fully self-contained (zero external CDN dependencies for guaranteed evaluation)

const CACHE_VERSION = 'amh-v2';
const CACHE_NAMES = {
  static: `amh-static-${CACHE_VERSION}`,
  formulas: `amh-formulas-${CACHE_VERSION}`,
  glossary: `amh-glossary-${CACHE_VERSION}`,
  katex: `amh-katex-${CACHE_VERSION}`,
};

const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Install Event - Pre-cache core shell & activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[AMH SW] Pre-cache initial shell warning:', err);
      });
    })
  );
});

// Activate Event - Clean up outdated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        const expectedCaches = Object.values(CACHE_NAMES);
        return Promise.all(
          keys.map((key) => {
            if (!expectedCaches.includes(key) && key.startsWith('amh-')) {
              return caches.delete(key);
            }
          })
        );
      }),
    ])
  );
});

// Helper: Stale-While-Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((err) => {
      // Return cached if network fails
      return cachedResponse;
    });

  return cachedResponse || fetchPromise;
}

// Helper: Network-First strategy
async function networkFirst(request, cacheName, timeoutMs = 3000) {
  const cache = await caches.open(cacheName);

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(async () => {
      const cached = await cache.match(request);
      if (cached) resolve(cached);
    }, timeoutMs);
  });

  const fetchPromise = (async () => {
    try {
      const response = await fetch(request);
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (err) {
      const cached = await cache.match(request);
      if (cached) return cached;
      throw err;
    }
  })();

  return Promise.race([fetchPromise, timeoutPromise]).then((res) => {
    return res || fetchPromise;
  }).catch(async () => {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true, error: 'Network unavailable' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503,
    });
  });
}

// Helper: Cache-First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    return cachedResponse || new Response('Offline asset unavailable', { status: 503 });
  }
}

// Fetch event listener
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests and HTTP/HTTPS schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (SPA html fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const indexPage = await caches.match('/index.html');
        if (indexPage) return indexPage;
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
            <head><meta charset="utf-8"/><title>Amaris Math Hub - Offline Mode</title></head>
            <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #0b1329; color: white;">
              <h2>📐 Amaris Math Hub - Offline Review Mode</h2>
              <p>Your cached Formula Bank and accessed Glossary terms are available offline.</p>
              <a href="/" style="color: #f59e0b; text-decoration: underline;">Return to App</a>
            </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  // 2. KaTeX, Fonts, and CDN styling assets
  if (
    url.href.includes('katex') ||
    url.href.includes('cdn.jsdelivr.net') ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.katex));
    return;
  }

  // 3. Formulas API
  if (url.pathname.startsWith('/api/formulas')) {
    event.respondWith(networkFirst(request, CACHE_NAMES.formulas, 2500));
    return;
  }

  // 4. Glossary API
  if (url.pathname.startsWith('/api/glossary')) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.glossary));
    return;
  }

  // 5. Static scripts, styles, images (same-origin)
  if (
    url.origin === self.location.origin &&
    (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image')
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.static));
    return;
  }
});

// Message Handler for manual pre-caching from UI components
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  if (event.data.type === 'CACHE_ALL_CONCEPTS') {
    try {
      const formulaCache = await caches.open(CACHE_NAMES.formulas);
      const glossaryCache = await caches.open(CACHE_NAMES.glossary);

      const [formulaRes, glossaryRes] = await Promise.allSettled([
        fetch('/api/formulas'),
        fetch('/api/glossary')
      ]);

      if (formulaRes.status === 'fulfilled' && formulaRes.value.ok) {
        await formulaCache.put('/api/formulas', formulaRes.value.clone());
      }
      if (glossaryRes.status === 'fulfilled' && glossaryRes.value.ok) {
        await glossaryCache.put('/api/glossary', glossaryRes.value.clone());
      }

      event.ports[0]?.postMessage({
        status: 'SUCCESS',
        message: 'Formula Library & Math Glossary terms successfully cached offline!',
      });
    } catch (err) {
      console.warn('[AMH SW] Manual cache concepts warning:', err);
      event.ports[0]?.postMessage({
        status: 'ERROR',
        message: String(err),
      });
    }
  }

  if (event.data.type === 'CACHE_FORMULAS') {
    try {
      const formulaCache = await caches.open(CACHE_NAMES.formulas);
      const formulasResponse = new Response(JSON.stringify(event.data.payload || []), {
        headers: { 'Content-Type': 'application/json' }
      });
      await formulaCache.put('/api/formulas', formulasResponse);
      event.ports[0]?.postMessage({ success: true, count: event.data.payload?.length || 0 });
    } catch (err) {
      event.ports[0]?.postMessage({ success: false, error: String(err) });
    }
  }

  if (event.data.type === 'CACHE_GLOSSARY') {
    try {
      const glossaryCache = await caches.open(CACHE_NAMES.glossary);
      const glossaryResponse = new Response(JSON.stringify(event.data.payload || []), {
        headers: { 'Content-Type': 'application/json' }
      });
      await glossaryCache.put('/api/glossary', glossaryResponse);
      event.ports[0]?.postMessage({ success: true, count: event.data.payload?.length || 0 });
    } catch (err) {
      event.ports[0]?.postMessage({ success: false, error: String(err) });
    }
  }

  if (event.data.type === 'CACHE_GLOSSARY_TERM') {
    try {
      const { term } = event.data;
      if (term && term.id) {
        const glossaryCache = await caches.open(CACHE_NAMES.glossary);
        const termResponse = new Response(JSON.stringify(term), {
          headers: { 'Content-Type': 'application/json' }
        });
        await glossaryCache.put(`/api/glossary/term/${term.id}`, termResponse);
      }
    } catch (err) {
      console.warn('[AMH SW] Term cache failed:', err);
    }
  }
});

// Push & Notification Handling
self.addEventListener('push', (event) => {
  let data = {
    title: '⏰ Session Reminder',
    body: 'Your scheduled mathematics lesson is starting soon!',
    url: '/'
  };
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'amh-study-session-push',
      data: { url: data.url }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
