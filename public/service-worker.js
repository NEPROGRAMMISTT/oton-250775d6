
const CACHE_NAME = 'ios-translator-cache-v2';
const MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB limit for iOS
let currentCacheSize = 0;

// Resources that should always be cached
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js'
];

// Get current cache size
async function getCacheSize() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const promises = keys.map(async (request) => {
      const response = await cache.match(request);
      if (!response) return 0;
      const blob = await response.blob();
      return blob.size;
    });
    
    const sizes = await Promise.all(promises);
    const totalSize = sizes.reduce((acc, size) => acc + size, 0);
    currentCacheSize = totalSize;
    
    // Post message to client about current cache size
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_SIZE_UPDATED',
          payload: {
            size: currentCacheSize,
            maxSize: MAX_CACHE_SIZE_BYTES,
            percentage: (currentCacheSize / MAX_CACHE_SIZE_BYTES) * 100
          }
        });
      });
    });
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
}

// Get list of cached dictionaries
async function getCachedDictionaries() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const dictionaryFiles = keys
      .filter(request => 
        request.url.includes('/data/') && 
        request.url.includes('.json')
      )
      .map(request => {
        // Extract just the filename from the URL
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        return pathParts[pathParts.length - 1];
      });
      
    return dictionaryFiles;
  } catch (error) {
    console.error('Error getting cached dictionaries:', error);
    return [];
  }
}

// Check if cache will exceed the limit after adding a new item
async function willExceedCacheLimit(newItemSize) {
  const currentSize = await getCacheSize();
  return (currentSize + newItemSize) > MAX_CACHE_SIZE_BYTES;
}

// Установка и предварительное кэширование ресурсов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache)
          .then(() => getCacheSize());
      })
  );
});

// Intercept cache management messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'GET_CACHE_INFO') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({
        size: currentCacheSize,
        maxSize: MAX_CACHE_SIZE_BYTES,
        percentage: (currentCacheSize / MAX_CACHE_SIZE_BYTES) * 100
      });
    });
  }
  
  if (event.data && event.data.action === 'GET_CACHED_DICTIONARIES') {
    getCachedDictionaries().then(dictionaries => {
      event.ports[0].postMessage({
        dictionaries
      });
    });
  }
  
  if (event.data && event.data.action === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      caches.open(CACHE_NAME).then(cache => {
        cache.addAll(urlsToCache).then(() => {
          getCacheSize().then(size => {
            event.ports[0].postMessage({ success: true, newSize: size });
          });
        });
      });
    });
  }
});

// Стратегия кэширования с проверкой размера кэша
self.addEventListener('fetch', (event) => {
  // Skip browser-extension requests and non-GET requests
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.method !== 'GET') {
    return;
  }
  
  // For dictionary files, apply special caching logic
  const isDictionary = event.request.url.includes('/data/') && 
                       event.request.url.includes('.json');
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if it exists
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request.clone())
          .then(async (response) => {
            // Check if we got a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();
            
            // For dictionary files, check cache size before storing
            if (isDictionary) {
              const blob = await responseToCache.clone().blob();
              const willExceed = await willExceedCacheLimit(blob.size);
              
              if (willExceed) {
                console.warn('Cache limit would be exceeded. Not caching:', event.request.url);
                
                // Notify clients that cache limit would be exceeded
                self.clients.matchAll().then(clients => {
                  clients.forEach(client => {
                    client.postMessage({
                      type: 'CACHE_LIMIT_EXCEEDED',
                      payload: {
                        url: event.request.url,
                        fileSize: blob.size,
                        currentSize: currentCacheSize,
                        maxSize: MAX_CACHE_SIZE_BYTES
                      }
                    });
                  });
                });
                
                return response;
              }
            }
            
            // Store the fetched response in cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache).then(() => {
                  // Update cache size after adding new item
                  getCacheSize();
                  
                  // If it's a dictionary, update the dictionary list
                  if (isDictionary) {
                    getCachedDictionaries().then(dictionaries => {
                      self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                          client.postMessage({
                            type: 'DICTIONARIES_UPDATED',
                            payload: {
                              dictionaries
                            }
                          });
                        });
                      });
                    });
                  }
                });
              });

            return response;
          })
          .catch(() => {
            // If network request fails, try to return cached homepage for navigation requests
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
    }).then(() => {
      // Update cache size after activation
      getCacheSize();
    })
  );
});
