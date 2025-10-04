// Name of our cache container
const CACHE_NAME = 'gemini-movie-app-v1';

// List of files to cache (the "app shell")
// IMPORTANT: You must include the name of your main HTML file here.
const urlsToCache = [
    './movie_app_pwa_updates.html', // Your main file
    './manifest.json',
    './', // Caches the root file (index)
    // Add any crucial CSS/JS library URLs or your own compiled files here
    // e.g., 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js'
];

// --- Installation Phase: Caching the App Shell ---
self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('PWA: Opened cache and adding shell assets');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Forces the new service worker to activate immediately
});

// --- Activation Phase: Cleaning up old caches ---
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('PWA: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // This claim allows the service worker to take control of the page immediately
    return self.clients.claim();
});


// --- Fetch Phase: Serving cached or network content ---
self.addEventListener('fetch', (event) => {
    // For every network request (fetch event), try to find a response in the cache first.
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request).catch((error) => {
                    // This is where you could return an offline page if the fetch fails
                    console.error('Fetch failed and no cache available:', error);
                    // For now, we return a simple error response
                    return new Response('Network error or resource not found in cache.', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});
