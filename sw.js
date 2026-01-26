importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

// 1. Initialize Firebase inside the Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyATGWLqyjWJUaDXwudubIc_Hvh5yPVDyOI",
  authDomain: "campus-bite-9dbaa.firebaseapp.com",
  projectId: "campus-bite-9dbaa",
  messagingSenderId: "294389261625",
  appId: "1:294389261625:web:095d6e5f85f4e8"
});

const messaging = firebase.messaging();

// 2. Background Notification Handler
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/tent.jpeg', // Your app icon
    badge: '/images/tent.jpeg', // Small icon for status bar
    data: { url: payload.data?.url || '/order-history.html' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 3. Handle Notification Click (Open the App)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// 4. Offline Caching (Cache-First Strategy)
const CACHE_NAME = 'campus-bite-v1';
const ASSETS = [
  '/',
  '/home.html',
  '/profile.html',
  '/comments.html',
  '/budget.html',
  '/order-history.html',
  '/ingredients.js',
  '/meals.js',
  '/images/tent.jpeg',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});