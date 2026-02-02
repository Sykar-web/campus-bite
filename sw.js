/* Campus Bite - Service Worker 
   Version: 2.0.1
*/

// 1. Import Firebase Scripts for Background Messaging
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

// 2. Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyATGWLqyjWJUaDXwudubIc_Hvh5yPVDyOI",
  authDomain: "campus-bite-9dbaa.firebaseapp.com",
  projectId: "campus-bite-9dbaa",
  messagingSenderId: "294389261625",
  appId: "1:294389261625:web:095d6e5f85f4e8"
});

const messaging = firebase.messaging();

// 3. Asset Configuration
const CACHE_NAME = 'campus-bite-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/home.html',
  '/profile.html',
  '/comments.html',
  '/budget.html',
  '/order-history.html',
  '/images/tent.jpeg',
  '/manifest.json',
  '/meals.js',
  '/ingredients.js',
  // Add '/ingredients.js' and '/meals.js' here ONLY if they are in your root folder
];

// 4. Install Event: Cache Assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the waiting service worker to become active
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching system assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 5. Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all open tabs immediately
});

// 6. Fetch Event: Offline Support (Network falling back to Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// 7. Firebase Background Message Handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received: ', payload);
  
  const notificationTitle = payload.notification.title || 'Campus Bite Update';
  const notificationOptions = {
    body: payload.notification.body || 'Open the app to see your order status.',
    icon: '/images/tent.jpeg',
    badge: '/images/tent.jpeg',
    vibrate: [200, 100, 200],
    tag: 'order-status', // Groups similar notifications
    data: {
      url: payload.data?.url || '/order-history.html'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 8. Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
self.addEventListener('fetch', (event) => {
  // ADD THIS BLOCK: Skip Firestore and Google APIs
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('google.firestore')) {
    return; // Let the browser handle these normally
  }

  // Your existing cache logic goes here...
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});