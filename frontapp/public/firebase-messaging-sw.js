importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAKY9r4AGNOkXNLWd2Oe54itljRe3Fdhr0',
  authDomain: 'lyrium-a346b.firebaseapp.com',
  projectId: 'lyrium-a346b',
  storageBucket: 'lyrium-a346b.firebasestorage.app',
  messagingSenderId: '323514461084',
  appId: '1:323514461084:web:81a5ee3bd887851ff0f659',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { notification, data } = payload;

  const title = notification?.title || 'Lyrium';
  const options = {
    body: notification?.body || '',
    icon: notification?.icon || '/img/iconologo.png',
    badge: '/img/iconologo.png',
    data: data || {},
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/customer/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
