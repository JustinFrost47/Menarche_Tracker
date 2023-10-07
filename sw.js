// The version of the cache.
const VERSION = "v1.011";

// The name of the cache
const CACHE_NAME = `period-tracker-${VERSION}`;

// The static resources that the app needs to function.
const APP_STATIC_RESOURCES = [
  "/",
  "/index.html",
  "/script.js",
  "/style.css",
  "/icons/wheel.svg",
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        for (const resource of APP_STATIC_RESOURCES) {
          await cache.add(resource);
          console.log(`Cached resource: ${resource}`);
        }
        console.log('Static resources cached successfully.');
      } catch (error) {
        console.error('Cache installation error:', error);
      }
    })()
  );
});


// delete old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
      await clients.claim();
    })()
  );
});

// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      // Try to serve the cached HTML page for navigation requests.
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
      
        return fetch(event.request).then((fetchResponse) => {
          // Clone the response before doing anything that reads its body.
          const clonedResponse = fetchResponse.clone();
      
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
      
          return fetchResponse;
        });
      })
      
    );
    return;
  }

  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
          });
          return fetchResponse;
        });
      }).catch(() => {
        // For other requests (e.g., images, scripts), serve from cache if available.
        return new Response(null, { status: 404 });
      })
    );
    return;
  }
});