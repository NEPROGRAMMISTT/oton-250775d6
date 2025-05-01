
const CACHE_NAME = 'ios-translator-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js',
  '/src/data/dolgan_language.json'
];

// Установка и предварительное кэширование ресурсов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Стратегия кэширования: сначала кэш, затем сеть 
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированный ответ, если он есть
        if (response) {
          return response;
        }

        // Клонируем запрос, так как он может быть использован только один раз
        const fetchRequest = event.request.clone();

        // Пробуем получить ресурс из сети
        return fetch(fetchRequest)
          .then((response) => {
            // Проверяем действительно ли получен ответ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ, так как он тоже может быть использован только один раз
            const responseToCache = response.clone();

            // Добавляем ответ в кэш для будущего использования
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Если произошла ошибка при запросе (например, нет соединения),
            // и запрос был за HTML страницей, возвращаем кэшированную домашнюю страницу
            if (event.request.url.indexOf('.html') > -1 || 
                event.request.url.endsWith('/') ||
                event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Обновление кэша при обновлении ServiceWorker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Удаляем устаревшие кэши
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
