importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ── correct init — initializeApp first, then getMessaging() ──────
firebase.initializeApp({
  apiKey: "AIzaSyDi2Sq2NTwOantWOzMA0hPYpnjFXFDrT50",
  authDomain: "melifecoaching-v1.firebaseapp.com",
  projectId: "melifecoaching-v1",
  storageBucket: "melifecoaching-v1.firebasestorage.app",
  messagingSenderId: "375595864401",
  appId: "1:375595864401:web:4d723dc6643022d8030370",
  measurementId: "G-BRH57PCFYZ"
});

const messaging = firebase.messaging(); // ← no config here, just call it

// Background push → show notification
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Daily Insight ✨';
  const body  = payload.notification?.body  || 'Your flashcard is ready!';

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'flashcard-daily',
    renotify: true,
    data: { url: '/splash' },
  });
});

// Tap → open PWA at /splash
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/splash';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
