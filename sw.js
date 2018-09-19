var version = 'rev-1.0';
var urlsToCache = [
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
];

self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] install event in progress.');
  event.waitUntil(
    caches.open(version).then(function(cache) {
      console.log('Opened Cache');
        return cache.addAll(urlsToCache);
      })
      .catch(function() {
        console.log('[ServiceWorker] install completed');
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] start activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('rev-') && cacheName != version;
        }).map(function(cacheName) {
          /* Return a promise that's fulfilled
             when each outdated cache is deleted.
          */
          console.log('[ServiceWorker] Removing old cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
    .then(function() {
      console.log('[ServiceWorker] activate completed.');
    })
  );
});

//reference https://ponyfoo.com/articles/serviceworker-revolution
self.addEventListener("fetch", function(event) {
  console.log('[ServiceWorker] fetch event in progress.');

  /* We should only cache GET requests, and deal with the rest of method in the
     client-side, by handling failed POST,PUT,PATCH,etc. requests.
  */
  if (event.request.method !== 'GET') {
    /* If we don't block the event as shown below, then the request will go to
       the network as usual.
    */
    console.log('!!![ServiceWorker] fetch event ignored.', event.request.method, event.request.url);
    return;
  }
  /* Similar to event.waitUntil in that it blocks the fetch event on a promise.
     Fulfillment result will be used as the response, and rejection will end in a
     HTTP response indicating failure.
  */
  event.respondWith(
    caches
      /* This method returns a promise that resolves to a cache entry matching
         the request. Once the promise is settled, we can then provide a response
         to the fetch request.
      */
      .match(event.request)
      .then(function(cached) {
        /* Even if the response is in our cache, we go to the network as well.
           This pattern is known for producing "eventually fresh" responses,
           where we return cached responses immediately, and meanwhile pull
           a network response and store that in the cache.
           Read more:
           https://ponyfoo.com/articles/progressive-networking-serviceworker
        */
        var networked = fetch(event.request)
          // We handle the network request with success and failure scenarios.
          .then(fetchedFromNetwork, unableToResolve)
          // We should catch errors on the fetchedFromNetwork handler as well.
          .catch(unableToResolve);

        /* We return the cached response immediately if there is one, and fall
           back to waiting on the network as usual.
        */
    //    console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
        return cached || networked;

        function fetchedFromNetwork(response) {
          /* We copy the response before replying to the network request.
             This is the response that will be stored on the ServiceWorker cache.
          */
          var cacheCopy = response.clone();

          console.log('WORKER: fetch response from network.', event.request.url);

          caches
            // We open a cache to store the response for this request.
            .open(version + 'pages')
            .then(function add(cache) {
              /* We store the response for this request. It'll later become
                 available to caches.match(event.request) calls, when looking
                 for cached responses.
              */
              cache.put(event.request, cacheCopy);
            })
            .then(function() {
              console.log('WORKER: fetch response stored in cache.', event.request.url);
            });

          // Return the response so that the promise is settled in fulfillment.
          return response;
        }

        /* When this method is called, it means we were unable to produce a response
           from either the cache or the network. This is our opportunity to produce
           a meaningful response even when all else fails. It's the last chance, so
           you probably want to display a "Service Unavailable" view or a generic
           error response.
        */
        function unableToResolve () {
          /* There's a couple of things we can do here.
             - Test the Accept header and then return one of the `offlineFundamentals`
               e.g: `return caches.match('/some/cached/image.png')`
             - You should also consider the origin. It's easier to decide what
               "unavailable" means for requests against your origins than for requests
               against a third party, such as an ad provider
             - Generate a Response programmaticaly, as shown below, and return that
          */

          console.log('!!![ServiceWorker] fetch request failed in both cache and network.');

          /* Here we're creating a response programmatically. The first parameter is the
             response body, and the second one defines the options for the response.
          */
          return new Response('<h1>Service Unavailable</h1>', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        }
      })
  );
});
