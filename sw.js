const CACHE_NAME = 'hashira-app-v6-accounts';

/** Directory containing this script, e.g. /hashira (no trailing slash). */
const HASHIRA_BASE = self.location.pathname.replace(/\/[^/]+$/, '') || '/hashira';

function isHashiraPath(pathname) {
  return pathname === HASHIRA_BASE || pathname.startsWith(HASHIRA_BASE + '/');
}

function isHashiraOwnedCache(key) {
  return key.startsWith('hashira-app-') || key.startsWith('duo-trainer-');
}

const APP_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/storage-migrate.js',
  './js/library.js',
  './js/state.js',
  './js/user-profile.js',
  './js/timer.js',
  './js/presets.js',
  './js/ui-router.js',
  './js/ui-library.js',
  './js/progression.js',
  './js/expeditions.js',
  './js/community.js',
  './js/app.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && isHashiraOwnedCache(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !isHashiraPath(url.pathname)) {
    return;
  }
  const relativePath = url.pathname.slice(HASHIRA_BASE.length);
  if (
    relativePath.startsWith('/api/') ||
    relativePath.startsWith('/auth/') ||
    relativePath.startsWith('/includes/') ||
    relativePath === '/setup.php' ||
    relativePath.endsWith('.php')
  ) {
    return;
  }

  const indexRequest = new Request(new URL('index.html', self.location).href);

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(indexRequest));
    })
  );
});
