/* letscode offline cache. Bump CACHE to invalidate. See docs/ARCHITECTURE.md. */
const CACHE = 'letscode-v3';
const CM = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16';

const SHELL = [
  '.',
  'index.html',
  'styles.css',
  'app.js',
  'challenges.js',
  'py-worker.js',
  'manifest.webmanifest',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  CM + '/codemirror.min.css',
  CM + '/codemirror.min.js',
  CM + '/theme/material-darker.min.css',
  CM + '/mode/xml/xml.min.js',
  CM + '/mode/javascript/javascript.min.js',
  CM + '/mode/css/css.min.js',
  CM + '/mode/htmlmixed/htmlmixed.min.js',
  CM + '/mode/python/python.min.js',
  CM + '/addon/edit/closebrackets.min.js',
  CM + '/addon/edit/matchbrackets.min.js'
];

// One bad URL must not fail the whole install, so add them one by one.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((url) => c.add(new Request(url, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first, then network, caching whatever comes back. Pyodide (~10MB) is
// never precached but is cached the first time it is actually used.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      }
      return res;
    }))
  );
});
