const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onPatientWrite = functions.firestore
  .document('artifacts/{appId}/public/data/patients/{patientId}')
  .onWrite(async (change, context) => {
    const appId = context.params.appId;
    const patientId = context.params.patientId;

    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    if (!afterData) {
      return null;
    }

    const beforeStatus = beforeData ? beforeData.status : null;
    const afterStatus = afterData.status;

    let title = '';
    let body = '';

    if (!beforeData) {
      title = `🆕 Tiếp nhận khách VIP`;
      body = `Bệnh nhân: ${afterData.name || '---'} (PID: ${afterData.pid || '---'}) đã được tiếp đón.`;
    } else if (beforeStatus !== afterStatus) {
      const statusLabels = {
        'Scheduled': 'Đã lên lịch',
        'Preparing': 'Đang chuẩn bị',
        'ReceivedInfo': 'Đã nhận thông tin',
        'Waiting': 'Chờ Tiếp Đón',
        'Received': 'Đã Tiếp Đón',
        'Examining': 'Đang Khám',
        'Testing': 'Đang Làm CLS/CĐHA',
        'Reviewing': 'Chờ Kết Luận',
        'Pharmacy': 'Đang Chờ Thuốc/Tiêm Ngừa',
        'Inpatient': 'Đang Nằm Viện',
        'Completed': 'Đã Hoàn Tất'
      };
      const newStatusLabel = statusLabels[afterStatus] || afterStatus;
      title = `🔄 Cập nhật hành trình`;
      body = `Hồ sơ khách hàng ${afterData.name || '---'} vừa đổi trạng thái sang: ${newStatusLabel}.`;
    } else {
      return null;
    }

    const recipients = afterData.recipients || [];
    if (recipients.length === 0) {
      const staffSnapshot = await admin.firestore()
        .collection(`artifacts/${appId}/public/data/users`)
        .get();
      
      staffSnapshot.forEach(doc => {
        const staff = doc.data();
        if (staff.role === 'admin' || staff.role === 'quanly' || staff.role === 'lanhdao') {
          recipients.push(doc.id);
        } else if (staff.role === 'quanly_site' && staff.assignedSite === afterData.site) {
          recipients.push(doc.id);
        }
      });
    } else {
      const adminStaffSnapshot = await admin.firestore()
        .collection(`artifacts/${appId}/public/data/users`)
        .get();
      
      adminStaffSnapshot.forEach(doc => {
        const staff = doc.data();
        if ((staff.role === 'admin' || staff.role === 'quanly') && !recipients.includes(doc.id)) {
          recipients.push(doc.id);
        }
      });
    }

    const tokens = [];
    for (const uid of recipients) {
      const userDoc = await admin.firestore()
        .doc(`artifacts/${appId}/public/data/users/${uid}`)
        .get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      }
    }

    const uniqueTokens = [...new Set(tokens)];
    if (uniqueTokens.length === 0) {
      return null;
    }

    const message = {
      tokens: uniqueTokens,
      notification: {
        title: title,
        body: body
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          title: title,
          body: body,
          icon: 'https://iili.io/F66acRs.png',
          badge: 'https://iili.io/F66acRs.png'
        },
        data: {
          patientId: patientId
        }
      }
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      return null;
    } catch (error) {
      return null;
    }
  });
