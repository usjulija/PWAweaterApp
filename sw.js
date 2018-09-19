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
          '/css/mixins.css',
          '/images/01d.svg',
          '/images/01n.svg',
          '/images/02d.svg',
          '/images/02n.svg',
          '/images/03d.svg',
          '/images/03n.svg',
          '/images/04d.svg',
          '/images/04n.svg',
          '/images/09d.svg',
          '/images/09n.svg',
          '/images/10d.svg',
          '/images/10n.svg',
          '/images/11d.svg',
          '/images/11n.svg',
          '/images/13d.svg',
          '/images/13n.svg',
          '/images/50d.svg',
          '/images/50n.svg',
          '/images/celsius.svg',
          '/images/error.svg',
          '/images/fahrenheit.svg',
          '/images/umbrella.svg',
          '/js/app.js',
          '/js/localforage-1.4.0.js',
          '/index.html',
          'https://fonts.googleapis.com/icon?family=Material+Icons'
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
