/* ==========================================================================
   Elite TripPlay — service worker
   Stratégie : cache-first pour l'app shell, avec repli réseau puis, à
   défaut, une réponse offline générique. Incrémente CACHE_VERSION à chaque
   déploiement pour forcer la mise à jour du cache chez les utilisateurs.
   ========================================================================== */

const CACHE_VERSION = "v2";
const CACHE_NAME = "elite-tripplay-" + CACHE_VERSION;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./app.js",
  "./i18n.js",
  "./icon-96.png",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("elite-tripplay-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          const url = new URL(request.url);
          const cacheable = response.ok && (url.origin === self.location.origin || url.hostname === "unpkg.com");
          if (cacheable) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Repli hors-ligne : renvoie l'app shell pour les navigations
          if (request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return new Response("", { status: 504, statusText: "Offline" });
        });
    })
  );
});
