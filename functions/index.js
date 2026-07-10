const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.onPatientWrite = functions.firestore
  .document("artifacts/cskh-ta/public/data/patients/{patientId}")
  .onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;

    if (!data) return null;

    if (previousData && previousData.status === data.status) {
      return null;
    }

    const recipients = data.recipients || [];
    const status = data.status || "Waiting";
    const tier = data.tier || "VIP";
    const name = data.name || "---";
    const pid = data.pid || "---";

    let statusLabel = status;
    const statuses = [
      { id: "Scheduled", label: "Đã lên lịch" },
      { id: "Preparing", label: "Đang chuẩn bị" },
      { id: "ReceivedInfo", label: "Đã nhận thông tin" },
      { id: "Waiting", label: "Chờ Tiếp Đón" },
      { id: "Received", label: "Đã Tiếp Đón" },
      { id: "Examining", label: "Đang Khám" },
      { id: "Testing", label: "Đang Làm CLS/CĐHA" },
      { id: "Reviewing", label: "Chờ Kết Luận" },
      { id: "Pharmacy", label: "Đang Chờ Thuốc/Tiêm Ngừa" },
      { id: "Inpatient", label: "Đang Nằm Viện" },
      { id: "Completed", label: "Đã Hoàn Tất" }
    ];

    const matchedStatus = statuses.find(s => s.id === status);
    if (matchedStatus) {
      statusLabel = matchedStatus.label;
    }

    const tokens = [];
    const db = admin.firestore();

    // 1. Quét toàn bộ users có quyền quản lý/lãnh đạo/admin trong hệ thống để luôn gửi thông báo cho họ
    const usersSnapshot = await db.collection("artifacts/cskh-ta/public/data/users").get();
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData) {
        const isManagerOrAdmin = ["admin", "lanhdao", "quanly"].includes(userData.role);
        if (isManagerOrAdmin && userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      }
    });

    // 2. Thêm các tokens của người nhận tin chuyên trách (recipients) được chỉ định trong ca bệnh
    if (recipients.length > 0) {
      for (const uid of recipients) {
        const userDoc = await db.collection("artifacts/cskh-ta/public/data/users").doc(uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData && userData.fcmToken && !tokens.includes(userData.fcmToken)) {
            tokens.push(userData.fcmToken);
          }
        }
      }
    } else {
      // Nếu không có recipients chỉ định, gửi cho toàn bộ nhân sự có token
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData && userData.fcmToken && !tokens.includes(userData.fcmToken)) {
          tokens.push(userData.fcmToken);
        }
      });
    }

    if (tokens.length === 0) return null;

    const title = tier === "VVIP" ? "⚠️ Cập nhật hành trình VVIP khẩn" : "🔄 Cập nhật hành trình VIP";
    const body = `Khách hàng: ${name} (PID: ${pid}) vừa chuyển sang trạng thái: ${statusLabel}.`;

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: {
        patientId: context.params.patientId
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            "mutable-content": 1
          }
        }
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          title: title,
          body: body,
          icon: "https://sv2.anhsieuviet.com/2026/05/29/LOGO-APP-QLKHVIP.png",
          badge: "https://sv2.anhsieuviet.com/2026/05/29/LOGO-APP-QLKHVIP.png",
          requireInteraction: true
        }
      },
      tokens: tokens
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`FCM Multicast sent. Success count: ${response.successCount}, Failure count: ${response.failureCount}`);
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Token at index ${idx} failed to send. Error:`, resp.error);
        } else {
          console.log(`Token at index ${idx} sent successfully.`);
        }
      });
      return { success: true, responses: response.responses };
    } catch (error) {
      console.error("Error sending FCM Multicast:", error);
      return { success: false, error: error.message };
    }
  });
