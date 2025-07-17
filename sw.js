const CACHE_NAME = "my-pwa-v1";
const urlsToCache = ["/", "/static/js/bundle.js", "/static/css/main.css", "/manifest.json"];

// Установка SW
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

// Обработка запросов
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
