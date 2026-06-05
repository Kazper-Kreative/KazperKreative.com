/* The Lab — service worker.
 * Goals: make the app installable, give the games offline-after-first-play,
 * and keep updates effectively instant. Strategy by request type:
 *   - navigations (HTML): network-first, fall back to cache when offline.
 *     Network-first means a fresh deploy shows up the next time you open it.
 *   - static assets (Next build output, icons, images, game bundles):
 *     stale-while-revalidate — instant from cache, refreshed in the background.
 *   - everything else (Supabase REST/Auth/Realtime, POSTs, cross-origin):
 *     passthrough, never cached (don't stash auth/session responses).
 * Bump CACHE to force a clean sweep of old entries.
 */
const CACHE = "lab-v2";

// Same-origin path prefixes that are safe to cache (static, public, immutable-ish).
const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/assets/", "/images/", "/lab-assets/"];

// Per-game logic (the iframe documents) changes deploy-to-deploy — always serve
// it network-first so a new game build lands immediately, not on the 2nd open.
function isGameDoc(url) {
  return url.pathname.startsWith("/lab-assets/") && url.pathname.endsWith(".html");
}

self.addEventListener("install", (event) => {
  // Activate this SW immediately rather than waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

function isStaticAsset(url) {
  return STATIC_PREFIXES.some((p) => url.pathname.startsWith(p));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never touch POST/PUT (form posts, auth)

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase & other origins: passthrough

  // HTML navigations AND game iframe documents: network-first so new deploys win,
  // cache as offline fallback.
  if (request.mode === "navigate" || isGameDoc(url)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          // Only cache successful, non-redirected page loads.
          if (fresh && fresh.ok && fresh.type === "basic") {
            const cache = await caches.open(CACHE);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Last resort: the Lab hub, if we've ever cached it.
          return (await caches.match("/lab")) || Response.error();
        }
      })()
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => null);
        return cached || (await network) || Response.error();
      })()
    );
  }
});
