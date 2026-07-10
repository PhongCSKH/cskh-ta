importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBMmXRbUFvXRsUH6anb22sKlY8JlqiF7Lk",
  authDomain: "cskh-ta.firebaseapp.com",
  projectId: "cskh-ta",
  storageBucket: "cskh-ta.firebasestorage.app",
  messagingSenderId: "271160621415",
  appId: "1:271160621415:web:778102be1efcd5ba4717c2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Bạn có thông báo mới.',
    icon: payload.notification?.icon || payload.data?.icon || 'https://sv2.anhsieuviet.com/2026/05/29/LOGO-APP-QLKHVIP.png',
    badge: payload.notification?.badge || payload.data?.badge || 'https://sv2.anhsieuviet.com/2026/05/29/LOGO-APP-QLKHVIP.png',
    data: payload.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let patientId = null;
  if (event.notification.data) {
    if (event.notification.data.patientId) {
      patientId = event.notification.data.patientId;
    } else if (event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.data) {
      patientId = event.notification.data.FCM_MSG.data.patientId;
    }
  }
  const targetUrl = patientId ? `/?patientId=${patientId}` : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        const targetUrlParsed = new URL(targetUrl, clientUrl.origin);
        if (clientUrl.pathname === targetUrlParsed.pathname && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
