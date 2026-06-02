const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPatientNotification = functions.firestore
  .document('artifacts/{appId}/public/data/patients/{patientId}')
  .onWrite(async (change, context) => {
    const appId = context.params.appId;
    const patientId = context.params.patientId;
    
    const data = change.after.exists ? change.after.data() : null;
    const oldData = change.before.exists ? change.before.data() : null;
    
    if (!data) {
      console.log(`Khách hàng ${patientId} đã bị xóa.`);
      return null;
    }

    const isNew = !oldData;
    const hasStatusChanged = isNew || (oldData.status !== data.status);
    
    if (!hasStatusChanged) {
      console.log("Trạng thái không thay đổi. Bỏ qua gửi thông báo.");
      return null;
    }

    const recipients = data.recipients || [];
    if (recipients.length === 0) {
      console.log("Không có nhân sự nào được chỉ định đón tiếp ca này.");
      return null;
    }

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
    
    const userPromises = recipients.map(async (uid) => {
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

    const payload = {
      notification: {
        title: isNew ? `🆕 Đón tiếp: ${data.name}` : `🔄 Cập nhật: ${data.name}`,
        body: `Hạng: ${data.tier} • Trạng thái: ${statusText} • PID: ${data.pid}`,
        icon: 'https://iili.io/F66acRs.png',
        clickAction: 'https://cskh-ta.firebaseapp.com'
      },
      data: {
        appId: appId,
        patientId: patientId,
        status: data.status
      }
    };

    try {
      const response = await admin.messaging().sendToDevice(tokens, payload);
      console.log(`Đã gửi thông báo thành công đến ${tokens.length} thiết bị:`, JSON.stringify(response));
      return response;
    } catch (error) {
      console.error("Lỗi hệ thống khi gửi Firebase Push Notification:", error);
      return null;
    }
  });
