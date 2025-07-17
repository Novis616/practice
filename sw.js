const CACHE_NAME = "my-pwa-v1";
const BASE_PATH = "/practice/";
const OFFLINE_URL = BASE_PATH + "offline.html";

// Ресурсы для кеширования (для Vite структуры)
const urlsToCache = [BASE_PATH, BASE_PATH + "manifest.json", OFFLINE_URL];

// Страницы для кеширования с правильными путями
const pagesToCache = [BASE_PATH, BASE_PATH + "about", BASE_PATH + "services", BASE_PATH + "contact"];

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker устанавливается");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Кеширование ресурсов");
        // Кешируем только гарантированно существующие ресурсы
        return cache.addAll([BASE_PATH, BASE_PATH + "manifest.json", OFFLINE_URL]);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Ошибка при кешировании:", error);
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
        return self.clients.claim();
      }),
  );
});

// Единый обработчик запросов
self.addEventListener("fetch", (event) => {
  // Только для GET-запросов
  if (event.request.method !== "GET") return;

  // Навигационные запросы (переход между страницами)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Кешируем успешные навигационные запросы
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
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

  // Обычные запросы (изображения, CSS, JS, assets)
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

          // Кешируем ответ (особенно для assets)
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
