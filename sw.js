const CACHE_NAME = "my-pwa-v1";
const BASE_PATH = "/practice/"; // Ваш base path
const OFFLINE_URL = BASE_PATH + "offline.html";

// Ресурсы для кеширования с учетом base path
const urlsToCache = [
  BASE_PATH,
  BASE_PATH + "static/js/bundle.js",
  BASE_PATH + "static/css/main.css",
  BASE_PATH + "manifest.json",
  OFFLINE_URL,
];

// Страницы для кеширования (навигационные запросы)
const pagesToCache = ["/", "/about", "/services", "/contact"];

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker устанавливается");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Кеширование ресурсов");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Принудительная активация нового SW
        return self.skipWaiting();
      }),
  );
});

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker активируется");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Удаление старого кеша:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        // Принудительное управление всеми клиентами
        return self.clients.claim();
      }),
  );
});

// Обработка запросов
self.addEventListener("fetch", (event) => {
  // Только для GET-запросов
  if (event.request.method !== "GET") return;

  // Навигационные запросы (переход между страницами)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Если запрос не удался, проверяем кеш
        return caches.match(event.request).then((response) => {
          // Если страница есть в кеше, возвращаем её
          if (response) {
            return response;
          }
          // Иначе возвращаем offline-страницу
          return caches.match(OFFLINE_URL);
        });
      }),
    );
    return;
  }

  // Обычные запросы (изображения, CSS, JS)
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Если ресурс есть в кеше, возвращаем его
      if (response) {
        return response;
      }

      // Пытаемся загрузить из сети
      return fetch(event.request)
        .then((response) => {
          // Проверяем, что ответ валидный
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Клонируем ответ для кеширования
          const responseToCache = response.clone();

          // Кешируем ответ
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Если это изображение, возвращаем placeholder
          if (event.request.destination === "image") {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">Изображение недоступно</text></svg>',
              { headers: { "Content-Type": "image/svg+xml" } },
            );
          }

          // Для остальных ресурсов возвращаем ошибку
          return new Response("Ресурс недоступен офлайн", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
    }),
  );
});

// Обработка сообщений от клиента
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Кеширование посещенных страниц
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Кешируем успешные навигационные запросы
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Возвращаем кешированную версию или offline-страницу
            return cache.match(event.request) || cache.match(OFFLINE_URL);
          });
      }),
    );
  }
});
