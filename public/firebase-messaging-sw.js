// Service Worker chạy ngầm độc lập của Firebase để hiển thị popup thông báo khi đã tắt App / Khóa màn hình
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Khởi tạo Firebase cấu hình song song trong SW
firebase.initializeApp({
  apiKey: "AIzaSyBMmXRbUFvXRsUH6anb22sKlY8JlqiF7Lk",
  authDomain: "cskh-ta.firebaseapp.com",
  projectId: "cskh-ta",
  storageBucket: "cskh-ta.firebasestorage.app",
  messagingSenderId: "271160621415",
  appId: "1:271160621415:web:778102be1efcd5ba4717c2"
});

const messaging = firebase.messaging();

// Lắng nghe tin nhắn đẩy gửi về từ Firebase Cloud Functions khi thiết bị đang ở chế độ chạy nền/đã đóng hoàn toàn
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Đã nhận thông báo thành công:', payload);

  const notificationTitle = payload.notification?.title || 'Thông báo mới từ CSKH Tâm Anh';
  const notificationOptions = {
    body: payload.notification?.body || 'Có sự thay đổi trong luồng điều phối đón tiếp VIP.',
    icon: 'https://iili.io/F66acRs.png',
    badge: 'https://iili.io/F66acRs.png',
    data: {
      clickAction: payload.data?.click_action || payload.data?.clickAction || payload.notification?.click_action || payload.notification?.clickAction || 'https://cskh-ta.web.app',
      ...payload.data
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// BẮT BUỘC: Xử lý sự kiện nhấp chuột (click) vào thông báo khi ứng dụng đang đóng hoàn toàn
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Người dùng đã nhấp vào thông báo:', event);
  event.notification.close(); // Đóng bong bóng thông báo ngay lập tức

  // Xác định URL cần chuyển hướng (ưu tiên lấy từ payload, nếu không có dùng URL mặc định)
  let targetUrl = 'https://cskh-ta.web.app';
  
  if (event.notification.data) {
    if (event.notification.data.clickAction) {
      targetUrl = event.notification.data.clickAction;
    } else if (event.notification.data.click_action) {
      targetUrl = event.notification.data.click_action;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. Kiểm tra xem tab ứng dụng cskh-ta đã được mở sẵn ở trình duyệt chưa
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        // Nếu tab đang mở sẵn và hỗ trợ tính năng focus, đưa người dùng quay lại tab đó
        if (client.url.indexOf('cskh-ta') !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Nếu tab chưa mở hoặc ứng dụng đã bị đóng hoàn toàn, tiến hành mở tab mới
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
