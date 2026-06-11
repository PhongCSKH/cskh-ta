export const WEBPUSH_VAPID_KEY = "BFjwAUlwacxhmYk0TiQdDTDJYKgvy2ktOS7YjdobmZlTiwqDXuX7WOVSLpm-zZuyQlAcSuG3iAAqtNnkPtJAW_s";

export const defaultFirebaseConfig = {
  apiKey: "AIzaSyBMmXRbUFvXRsUH6anb22sKlY8JlqiF7Lk",
  authDomain: "cskh-ta.firebaseapp.com",
  projectId: "cskh-ta",
  storageBucket: "cskh-ta.firebasestorage.app",
  messagingSenderId: "271160621415",
  appId: "1:271160621415:web:778102be1efcd5ba4717c2"
};

export const mockStaffAccounts = [
  { uid: "acc_admin", email: "admin@vip.com", name: "Nguyễn Minh Trí", title: "IT Admin", role: "admin", pass: "CSKH@abc456", assignedSite: "Tất cả" },
  { uid: "acc_lanhdao", email: "lanhdao@vip.com", name: "Trần Thế Phương", title: "Thành viên HĐQT", role: "lanhdao", pass: "CSKH@abc456", assignedSite: "Tất cả" },
  { uid: "acc_quanly", email: "quanly@vip.com", name: "Lê Thu Thảo", title: "Quản Lý Chăm Sóc VIP", role: "quanly", pass: "CSKH@abc456", assignedSite: "Tất cả" },
  { uid: "acc_qlsite_tsh", email: "qlsite_tsh@vip.com", name: "Trần Tuấn Kiệt", title: "Quản Lý Site Sơn Hòa", role: "quanly_site", pass: "CSKH@abc456", assignedSite: "BV Tâm Anh - Tân Sơn Hòa" },
  { uid: "acc_qlsite_th", email: "qlsite_th@vip.com", name: "Lâm Thùy Dương", title: "Quản Lý Site Tân Hưng", role: "quanly_site", pass: "CSKH@abc456", assignedSite: "PK Tâm Anh - Tân Hưng" },
  { uid: "acc_nhanvien", email: "nhanvien@vip.com", name: "Phạm Hoàng Nam", title: "Lễ Tân Phòng Khám VIP", role: "nhanvien", pass: "CSKH@abc456", assignedSite: "BV Tâm Anh - Tân Sơn Hòa" }
];

export const defaultSpecialties = [
  "CK Chấn thương chỉnh hình",
  "CK Cơ xương khớp",
  "CK Da Liễu",
  "CK Dinh dưỡng",
  "CK Đầu - Mặt - Cổ",
  "CK Điều trị béo phì",
  "CK HEP-D",
  "CK Hô Hấp",
  "CK Hỗ trợ sinh sản",
  "CK Huyết học",
  "CK Mắt",
  "CK Miễn dịch lâm sàng",
  "CK Nam học",
  "CK Ngoại Lồng ngực - Mạch máu",
  "CK Ngoại Nhi",
  "CK Ngoại Thần Kinh",
  "CK Ngoại Tim Mạch",
  "CK Ngoại tổng quát",
  "CK Ngoại Vú",
  "CK Nhi",
  "CK Nội soi",
  "CK Nội Thận",
  "CK Nội tiết",
  "CK Nội tổng quát",
  "CK Phục hồi Chức năng",
  "CK Răng Hàm Mặt",
  "CK Sản phụ khoa",
  "CK Sơ sinh",
  "CK Tai mũi họng",
  "CK Tâm thần",
  "CK Thần kinh",
  "CK Thần kinh - Cột sống",
  "CK Tiết Niệu",
  "CK Tiêu hóa",
  "CK Tim mạch",
  "CK Tim mạch can thiệp",
  "CK Ung Bướu",
  "CK Viêm gan và gan nhiễm mỡ",
  "CK Vista",
  "CK Xạ trị",
  "CK Y học bào thai",
  "Khác",
  "Khám sàng lọc trước tiêm"
];

export const defaultSystemSettings = {
  specialties: defaultSpecialties,
  totalFormulaFields: {
    phiKham: true,
    ngoaiTru: true,
    capCuu: true,
    noiTru: true,
    ngoaiVien: true,
    clsCdha: true,
    thuocVacxin: true
  },
  discountFormulaType: 'total_minus_insurance_advance',
  permissions: {
    'patients:view': { nhanvien: 'view_assigned', quanly_site: 'view_assigned', quanly: 'all', lanhdao: 'all', admin: 'all' },
    'patients:create': { nhanvien: 'write_assigned', quanly_site: 'write_assigned', quanly: 'all', lanhdao: 'none', admin: 'all' },
    'patients:update': { nhanvien: 'write_assigned', quanly_site: 'write_assigned', quanly: 'all', lanhdao: 'none', admin: 'all' },
    'patients:delete': { nhanvien: 'none', quanly_site: 'none', quanly: 'all', lanhdao: 'none', admin: 'all' },
    'billing:view': { nhanvien: 'none', quanly_site: 'view_assigned', quanly: 'all', lanhdao: 'all', admin: 'all' },
    'billing:discount': { nhanvien: 'none', quanly_site: 'write_assigned', quanly: 'all', lanhdao: 'all', admin: 'all' }
  },
  notificationPermissions: {
    'notify:create': { nhanvien: 'assigned_only', quanly_site: 'assigned_site', quanly: 'all', lanhdao: 'all', admin: 'all' },
    'notify:status': { nhanvien: 'assigned_only', quanly_site: 'assigned_site', quanly: 'all', lanhdao: 'all', admin: 'all' }
  }
};

export const workflowStatuses = [
  { id: 'Scheduled', label: 'Đã lên lịch', color: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500' },
  { id: 'Preparing', label: 'Đang chuẩn bị', color: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  { id: 'ReceivedInfo', label: 'Đã nhận thông tin', color: 'bg-teal-50 text-teal-700 border-teal-200/80', dot: 'bg-teal-500' },
  { id: 'Waiting', label: 'Chờ Tiếp Đón', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  { id: 'Received', label: 'Đã Tiếp Đón', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/80', dot: 'bg-indigo-500' },
  { id: 'Examining', label: 'Đang Khám', color: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' },
  { id: 'Testing', label: 'Đang Làm CLS/CĐHA', color: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  { id: 'Reviewing', label: 'Chờ Kết Luận', color: 'bg-purple-50 text-purple-700 border-purple-200/80', dot: 'bg-purple-500' },
  { id: 'Pharmacy', label: 'Đang Chờ Thuốc/Tiêm Ngừa', color: 'bg-yellow-50 text-yellow-850 border-yellow-200/80', dot: 'bg-yellow-500' },
  { id: 'Inpatient', label: 'Đang Nằm Viện', color: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  { id: 'Completed', label: 'Đã Hoàn Tất', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' }
];

export const sites = [
  { id: 'tsh', label: 'BV Tâm Anh - Tân Sơn Hòa', bg: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500', cardBg: 'bg-[#f0f9ff] border-[#bae6fd] hover:border-[#7dd3fc]' },
  { id: 'th', label: 'PK Tâm Anh - Tân Hưng', bg: 'bg-violet-50 text-violet-700 border-violet-200/80', dot: 'bg-violet-500', cardBg: 'bg-[#faf5ff] border-[#e9d5ff] hover:border-[#d8b4fe]' },
  { id: 'ch', label: 'BV Tâm Anh - Chánh Hưng', bg: 'bg-teal-50 text-teal-700 border-teal-200/80', dot: 'bg-teal-500', cardBg: 'bg-[#f0fdf4] border-[#bbf7d0] hover:border-[#86efac]' }
];
