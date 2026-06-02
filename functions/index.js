const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Trigger tự động kích hoạt khi có thao tác Ghi (Tạo mới, Cập nhật, Xóa) trên tài liệu Patient
exports.sendPatientNotification = functions.firestore
  .document('artifacts/{appId}/public/data/patients/{patientId}')
  .onWrite(async (change, context) => {
    const appId = context.params.appId;
    const patientId = context.params.patientId;
    
    const data = change.after.exists ? change.after.data() : null;
    const oldData = change.before.exists ? change.before.data() : null;
    
    // Nếu hồ sơ bị xóa hoàn toàn khỏi database, không làm gì cả
    if (!data) {
      console.log(`Hồ sơ bệnh nhân ${patientId} đã bị xóa.`);
      return null;
    }

    // Chỉ kích hoạt gửi thông báo khi:
    // 1. Tạo mới ca đón tiếp
    // 2. Trạng thái đón tiếp (status) bị thay đổi so với trước đó
    const isNew = !oldData;
    const hasStatusChanged = isNew || (oldData.status !== data.status);
    
    if (!hasStatusChanged) {
      console.log("Trạng thái không thay đổi. Bỏ qua gửi thông báo.");
      return null;
    }

    // Danh sách UID của các nhân sự được chỉ định đón tiếp ca này
    const recipients = data.recipients || [];
    if (recipients.length === 0) {
      console.log("Không có nhân sự nào được chỉ định đón tiếp ca này.");
      return null;
    }

    // Chuyển ID trạng thái sang ngôn ngữ hiển thị tiếng Việt tương ứng
    const workflowLabels = {
      Scheduled: 'Đã lên lịch',
      Preparing: 'Đang chuẩn bị',
      ReceivedInfo: 'Đã nhận thông tin',
      Waiting: 'Chờ Tiếp Đón',
      Received: 'Đã Tiếp Đón',
      Examining: 'Đang Khám',
      Testing: 'Đang Làm CLS/CĐHA',
      Reviewing: 'Chờ Kết Luận',
      Pharmacy: 'Đang Chờ Thuốc/Tiêm Ngừa',
      Inpatient: 'Đang Nằm Viện',
      Completed: 'Đã Hoàn Tất'
    };
    const statusText = workflowLabels[data.status] || data.status;

    const tokens = [];
    const db = admin.firestore();
    
    // Truy vấn song song tất cả User được phân công để lấy mã FCM Token thiết bị của họ
    const userPromises = recipients.map(async (uid) => {
      // Tuân thủ đường dẫn dữ liệu Firestore: /artifacts/{appId}/public/data/users/{userId}
      const userRef = db.doc(`artifacts/${appId}/public/data/users/${uid}`);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      }
    });

    await Promise.all(userPromises);

    if (tokens.length === 0) {
      console.log("Không tìm thấy FCM Token thiết bị hợp lệ nào của nhân viên được phân công.");
      return null;
    }

    // Thiết lập nội dung thông báo đẩy (Đã đồng bộ trường click_action tương thích chạy ngầm)
    const payload = {
      notification: {
        title: isNew ? `🆕 Đón tiếp: ${data.name}` : `🔄 Cập nhật: ${data.name}`,
        body: `Hạng: ${data.tier} • Trạng thái: ${statusText} • PID: ${data.pid}`,
        icon: 'https://iili.io/F66acRs.png',
        click_action: 'https://cskh-ta.web.app' // Định dạng chuẩn snake_case cho Notification Payload
      },
      data: {
        appId: appId,
        patientId: patientId,
        status: data.status,
        click_action: 'https://cskh-ta.web.app' // Gửi kèm trong Data Payload để Service Worker xử lý sự kiện click
      }
    };

    try {
      // Gửi thông báo đến toàn bộ các thiết bị của nhân viên cùng lúc
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log(`Đã gửi thông báo thành công đến ${tokens.length} thiết bị.`);
      return response;
    } catch (error) {
      console.error("Lỗi hệ thống khi gửi Firebase Push Notification:", error);
      return null;
    }
  });
