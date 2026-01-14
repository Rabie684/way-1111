const CACHE_NAME = 'your-digital-university-way-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.svg',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.tsx',
  '/services/geminiService.ts',
  '/context/AppContext.tsx',
  '/components/Login.tsx',
  '/components/ProfessorDashboard.tsx',
  '/components/StudentDashboard.tsx',
  '/components/ChannelView.tsx',
  '/components/ChatWindow.tsx',
  '/components/JarvisAI.tsx',
  '/components/DirectMessagesView.tsx',
  '/components/CreateChannelModal.tsx',
  '/components/SubscriptionModal.tsx',
  '/components/ProfileSettingsModal.tsx',
  '/components/WelcomeToast.tsx',
  '/components/icons/IconComponents.tsx',
  '/components/QRCodeModal.tsx',
  '/components/InstallPWAModal.tsx'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Failed to cache urls:', err);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response.
            // Opaque responses are for cross-origin requests that we can't inspect but can still cache.
            if (!response || (response.status !== 200 && response.type !== 'opaque')) {
              return response;
            }

            // Clone the response because it's also a stream.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});