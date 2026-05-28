importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

// Cấu hình Firebase đồng bộ hệ thống CSKH-TA
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

// Lắng nghe và hiển thị thông báo khi trình duyệt đóng hoặc chạy ngầm
messaging.onBackgroundMessage((payload) => {
  console.log("[Service Worker] Nhận thông báo chạy ngầm:", payload);

  const notificationTitle = payload.notification?.title || "Yêu cầu duyệt VIP khẩn cấp";
  const notificationOptions = {
    body: payload.notification?.body || "Có hồ sơ mới cần ban lãnh đạo phê duyệt.",
    icon: "https://iili.io/F66acRs.png",
    badge: "https://iili.io/F66acRs.png",
    tag: "vip-approval-alert",
    requireInteraction: true, // Ghim thông báo trên màn hình cho đến khi bấm
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
