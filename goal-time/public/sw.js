/**
 * GOAL TIME service worker.
 *
 * Cache-first for the app shell so the whole thing works with the network
 * off — which is the normal case for everything except Coach Chat. Bump
 * CACHE on every deploy; the old cache is deleted on activate.
 */
const CACHE = 'goal-time-v1'

const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Never cache the Anthropic API — Coach Chat must always hit the network
  // or fall back to its offline script, never to a stale reply.
  if (url.hostname.endsWith('api.anthropic.com')) return

  // Navigations: network first, cached shell as the offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          void caches.open(CACHE).then((c) => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match('./index.html').then((r) => r ?? Response.error())),
    )
    return
  }

  // Everything else: cache first, then network, filling the cache as it goes.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ??
        fetch(request)
          .then((res) => {
            if (res.ok && (url.origin === location.origin || request.destination === 'font')) {
              const copy = res.clone()
              void caches.open(CACHE).then((c) => c.put(request, copy))
            }
            return res
          })
          .catch(() => hit ?? Response.error()),
    ),
  )
})
