var version = 'rev-1.0';

// installing the service worker
self.addEventListener('install', function(event) {
  console.log('SWORKER: install event in progress.');
  event.waitUntil(
    caches.open(version).then(function(cache) {
      console.log('Opened Cache');
        return cache.addAll([
          '/',
          '/css/styles.css',
          '/js/app.js',
          '/index.html'
        ]);
      })
      .catch(function() {
        console.log('SWORKER: install completed');
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('rev-') &&
                 cacheName != version;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(version + 'pages').then(function(cache) {
      return caches.match(event.request).then(function(response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
