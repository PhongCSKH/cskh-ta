import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Users, 
  Plus, 
  Settings, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Check, 
  Trash2, 
  Search, 
  Filter, 
  Upload, 
  X, 
  Sparkles, 
  TrendingUp, 
  Building, 
  Activity, 
  CreditCard, 
  FileSpreadsheet, 
  Edit3, 
  ChevronRight, 
  Info,
  Lock,
  UserCheck,
  LogOut,
  Eye,
  EyeOff,
  UserPlus,
  ShieldAlert,
  ClipboardList,
  LayoutDashboard,
  ArrowRight,
  Bell,
  BellRing,
  Clock,
  CheckCircle2,
  ChevronDown,
  ArrowRightLeft,
  Image as ImageIcon
} from 'lucide-react';

// =========================================================================
// ĐỒNG BỘ CẤU HÌNH FIREBASE THỰC TẾ CSKH-TA
// =========================================================================
const defaultFirebaseConfig = {
  apiKey: "AIzaSyBMmXRbUFvXRsUH6anb22sKlY8JlqiF7Lk",
  authDomain: "cskh-ta.firebaseapp.com",
  projectId: "cskh-ta",
  storageBucket: "cskh-ta.firebasestorage.app",
  messagingSenderId: "271160621415",
  appId: "1:271160621415:web:778102be1efcd5ba4717c2"
};

const isFirebaseConfigured = true;

let firebaseConfig = defaultFirebaseConfig;
if (typeof __firebase_config !== 'undefined') {
  try {
    firebaseConfig = JSON.parse(__firebase_config);
  } catch (e) {
    console.error("Lỗi parse cấu hình Firebase:", e);
  }
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'cskh-ta';

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Lỗi khởi tạo Firebase, đang sử dụng chế độ dự phòng LocalStorage.");
}

// 4 tài khoản nhân viên mặc định tương thích hoàn toàn với image_ba8ec5.png
const mockStaffAccounts = [
  { uid: "acc_admin", email: "admin@vip.com", name: "Nguyễn Minh Trí", title: "IT Admin", role: "admin", pass: "123456" },
  { uid: "acc_lanhdao", email: "lanhdao@vip.com", name: "Trần Thế Phương", title: "Thành viên HĐQT", role: "lanhdao", pass: "123456" },
  { uid: "acc_quanly", email: "quanly@vip.com", name: "Lê Thu Thảo", title: "Quản Lý Chăm Sóc VIP", role: "quanly", pass: "123456" },
  { uid: "acc_nhanvien", email: "nhanvien@vip.com", name: "Phạm Hoàng Nam", title: "Lễ Tân Phòng Khám VIP", role: "nhanvien", pass: "123456" }
];

const defaultSystemSettings = {
  specialties: [
    "Nội tổng quát",
    "Ngoại khoa",
    "Nhi khoa",
    "Sản phụ khoa",
    "Tai Mũi Họng",
    "Răng Hàm Mặt",
    "Mắt",
    "Tim mạch",
    "Da liễu",
    "Hồi sức cấp cứu (ICU)",
    "Khám VIP Theo Yêu Cầu"
  ],
  totalFormulaFields: {
    phiKham: true,
    ngoaiTru: true,
    capCuu: true,
    noiTru: true,
    ngoaiVien: true,
    clsCdha: true,
    thuocVacxin: true
  },
  discountFormulaType: 'total_minus_insurance_advance'
};

// Định nghĩa 6 trạng thái trong hành trình khách hàng VIP
const workflowStatuses = [
  { id: 'Waiting', label: 'Chờ Tiếp Đón', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  { id: 'Examining', label: 'Đang Khám Lâm Sàng', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { id: 'Testing', label: 'Đang Làm CLS/CĐHA', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { id: 'Reviewing', label: 'Chờ Kết Luận', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  { id: 'Pharmacy', label: 'Đang Chờ Thuốc', color: 'bg-yellow-50 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  { id: 'Completed', label: 'Đã Hoàn Tất', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('nhanvien');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'register', 'monitoring', 'settings'
  const [patients, setPatients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [systemSettings, setSystemSettings] = useState(defaultSystemSettings);
  const [isLoading, setIsLoading] = useState(true);

  // States Đăng nhập
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Modals tùy biến (Tránh dùng alert/confirm của trình duyệt)
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, message: '', title: '' });

  // Quản lý tạo tài khoản nhân sự (Chỉ dành cho Admin)
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'nhanvien', pass: '123456', title: '' });

  // Tìm kiếm & Lọc hồ sơ khách VIP (Giao diện 3: Theo dõi hồ sơ)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form Khách hàng VIP
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tier: 'VIP',
    boardApproval: '',
    notes: '',
    pid: '',
    date: new Date().toISOString().split('T')[0],
    specialties: [],
    ngoaiTru: 0,
    capCuu: 0,
    noiTru: 0,
    ngoaiVien: 0,
    phiKham: 0,
    clsCdha: 0,
    thuocVacxin: 0,
    insuranceAdvance: 0,
    discountRate: 0,
    approvedDiscountAmount: 0,
    totalAmount: 0,
    approvalImage: '',
    status: 'Waiting' // Mặc định trạng thái chờ tiếp đón
  });

  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');
  const [notification, setNotification] = useState(null);

  // --- TRUNG TÂM THÔNG BÁO (NOTIFICATION CENTER) ---
  const [notifications, setNotifications] = useState([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [activePushAlerts, setActivePushAlerts] = useState([]);
  const isInitialMount = useRef(true);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Hàm kích hoạt đẩy thông báo trực tiếp lên màn hình
  const triggerPushAlert = (title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newAlert = { id, title, message, type };
    
    setActivePushAlerts(prev => [newAlert, ...prev]);
    
    setNotifications(prev => [
      {
        id,
        title,
        message,
        type,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        read: false
      },
      ...prev
    ]);

    setTimeout(() => {
      setActivePushAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 6000);
  };

  // --- THIẾT LẬP FAVICON & PHIÊN ĐĂNG NHẬP ---
  useEffect(() => {
    const faviconUrl = 'https://iili.io/F66acRs.png';
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);

    const savedStaff = localStorage.getItem('crm_staff_accounts');
    if (!savedStaff) {
      localStorage.setItem('crm_staff_accounts', JSON.stringify(mockStaffAccounts));
      setStaffList(mockStaffAccounts);
    } else {
      setStaffList(JSON.parse(savedStaff));
    }

    const savedSettings = localStorage.getItem('local_settings');
    if (!savedSettings) {
      localStorage.setItem('local_settings', JSON.stringify(defaultSystemSettings));
      setSystemSettings(defaultSystemSettings);
    } else {
      setSystemSettings(JSON.parse(savedSettings));
    }

    const savedUser = localStorage.getItem('crm_current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setUserRole(parsedUser.role || 'nhanvien');
    }

    if (auth && db && (isFirebaseConfigured || typeof __firebase_config !== 'undefined')) {
      setIsFirebaseConnected(true);
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setCurrentUser(userData);
              setUserRole(userData.role);
            } else {
              const fallbackUser = { 
                uid: firebaseUser.uid, 
                email: firebaseUser.email, 
                role: 'nhanvien', 
                name: firebaseUser.email.split('@')[0],
                title: 'Nhân viên chuyên ban'
              };
              setCurrentUser(fallbackUser);
              setUserRole('nhanvien');
            }
          } catch (e) {
            console.error("Lỗi đồng bộ Firebase Auth:", e);
          }
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsFirebaseConnected(false);
      setIsLoading(false);
    }
  }, []);

  // --- THEO DÕI THAY ĐỔI ĐỒNG BỘ FIRESTORE & ĐẨY THÔNG BÁO ---
  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);

    if (isFirebaseConnected && db) {
      const patientsCol = collection(db, 'artifacts', appId, 'public', 'data', 'patients');
      const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');

      const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setSystemSettings(docSnap.data());
        } else {
          setDoc(settingsDocRef, systemSettings);
        }
      }, (err) => console.error(err));

      const unsubscribePatients = onSnapshot(patientsCol, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        list.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (isInitialMount.current) {
          isInitialMount.current = false;
        } else {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            if (change.type === "added") {
              triggerPushAlert(
                `🆕 Tiếp nhận khách ${data.tier}`,
                `Bệnh nhân: ${data.name} (PID: ${data.pid}) đã được tiếp đón.`,
                'info'
              );
            }
            if (change.type === "modified") {
              triggerPushAlert(
                `🔄 Cập nhật hành trình`,
                `Hồ sơ khách hàng ${data.name} (PID: ${data.pid}) vừa đổi trạng thái: ${data.status || 'Chờ Tiếp Đón'}.`,
                'success'
              );
            }
            if (change.type === "removed") {
              triggerPushAlert(
                `⚠️ Gỡ bỏ hồ sơ`,
                `Hồ sơ của một bệnh nhân VIP vừa bị gỡ khỏi hệ thống.`,
                'error'
              );
            }
          });
        }

        setPatients(list);
        setIsLoading(false);
      }, (error) => {
        console.error("Lỗi bảo mật hoặc đường dẫn Firestore:", error);
        setIsLoading(false);
      });

      return () => {
        unsubscribeSettings();
        unsubscribePatients();
      };
    } else {
      const savedPatients = localStorage.getItem('local_patients');
      if (savedPatients) {
        setPatients(JSON.parse(savedPatients));
      }
      setIsLoading(false);
    }
  }, [currentUser, isFirebaseConnected]);

  const calculatedSums = useMemo(() => {
    const formulas = systemSettings.totalFormulaFields;
    let total = 0;
    
    if (formulas.phiKham) total += Number(formData.phiKham || 0);
    if (formulas.ngoaiTru) total += Number(formData.ngoaiTru || 0);
    if (formulas.capCuu) total += Number(formData.capCuu || 0);
    if (formulas.noiTru) total += Number(formData.noiTru || 0);
    if (formulas.ngoaiVien) total += Number(formData.ngoaiVien || 0);
    if (formulas.clsCdha) total += Number(formData.clsCdha || 0);
    if (formulas.thuocVacxin) total += Number(formData.thuocVacxin || 0);

    let discountBase = total;
    if (systemSettings.discountFormulaType === 'total_minus_insurance_advance') {
      discountBase = Math.max(0, total - Number(formData.insuranceAdvance || 0));
    }

    const discountAmount = Math.round(discountBase * (Number(formData.discountRate || 0) / 100));

    return {
      totalAmount: total,
      approvedDiscountAmount: discountAmount
    };
  }, [formData, systemSettings]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      totalAmount: calculatedSums.totalAmount,
      approvedDiscountAmount: calculatedSums.approvedDiscountAmount
    }));
  }, [calculatedSums.totalAmount, calculatedSums.approvedDiscountAmount]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail || !loginPassword) {
      setAuthError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (isFirebaseConnected && auth) {
      try {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        showNotification("Đăng nhập đám mây Cloud thành công!");
      } catch (err) {
        console.warn("Lỗi đăng nhập Firebase, kiểm tra danh mục nhân sự local...", err);
        performLocalLogin();
      }
    } else {
      performLocalLogin();
    }
  };

  const performLocalLogin = () => {
    const account = staffList.find(
      a => a.email.toLowerCase() === loginEmail.toLowerCase() && a.pass === loginPassword
    );
    if (account) {
      setCurrentUser(account);
      setUserRole(account.role);
      localStorage.setItem('crm_current_user', JSON.stringify(account));
      showNotification(`Chào mừng ${account.name} (${account.title}) quay trở lại!`);
      triggerPushAlert("👋 Đăng nhập thành công", `Chào mừng ${account.name} đã truy cập CRM.`);
    } else {
      setAuthError('Email hoặc mật khẩu không chính xác. Thử chọn nhanh tài khoản mẫu bên dưới.');
    }
  };

  const handleLogout = () => {
    if (isFirebaseConnected && auth) {
      signOut(auth);
    }
    setCurrentUser(null);
    setUserRole('nhanvien');
    localStorage.removeItem('crm_current_user');
    showNotification("Đăng xuất thành công. Đã khóa phiên làm việc.");
  };

  // --- CẬP NHẬT TRẠNG THÁI KANBAN (Phân quyền chuẩn image_ba8ec5.png) ---
  const handleUpdateStatus = async (patientId, newStatus) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    // Ràng buộc nghiêm ngặt vai trò nhanvien
    if (userRole === 'nhanvien') {
      const currentStatus = patient.status || 'Waiting';
      const isAllowed = 
        (currentStatus === 'Waiting' && newStatus === 'Examining') || 
        (currentStatus === 'Pharmacy' && newStatus === 'Completed');

      if (!isAllowed) {
        showNotification("Lỗi: Tài khoản NHÂN VIÊN chỉ được phép chuyển [Chờ Tiếp Đón ➔ Đang Khám] và [Chờ Thuốc ➔ Hoàn Tất]!", "error");
        return;
      }
    }

    try {
      if (isFirebaseConnected && db) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'patients', patientId);
        await updateDoc(docRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.name
        });
      } else {
        const updatedList = patients.map(p => {
          if (p.id === patientId) {
            return { 
              ...p, 
              status: newStatus, 
              updatedAt: new Date().toISOString(), 
              updatedBy: currentUser.name 
            };
          }
          return p;
        });
        setPatients(updatedList);
        localStorage.setItem('local_patients', JSON.stringify(updatedList));
        triggerPushAlert("🔄 Cập nhật hành trình (Local)", `Bệnh nhân ${patient.name} đã được chuyển sang trạng thái mới.`, "success");
      }
      showNotification("Đã cập nhật trạng thái hành trình khám!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi đồng bộ trạng thái lên database!", "error");
    }
  };

  const handleInputChange = (field, val) => {
    if (field === 'discountRate' && userRole === 'nhanvien') {
      showNotification("Tài khoản NHÂN VIÊN không có quyền duyệt chiết khấu/giảm giá!", "error");
      return;
    }
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleCurrencyChange = (field, rawValue) => {
    const cleanValue = rawValue.replace(/\D/g, '');
    const numValue = cleanValue === '' ? 0 : parseInt(cleanValue, 10);
    handleInputChange(field, numValue);
  };

  const toggleSpecialtySelection = (spec) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(spec);
      if (exists) {
        return { ...prev, specialties: prev.specialties.filter(s => s !== spec) };
      } else {
        return { ...prev, specialties: [...prev.specialties, spec] };
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotification("Ảnh công văn vượt quá 2MB!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        canvas.height = img.width > MAX_WIDTH ? img.height * scale : img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        handleInputChange('approvalImage', compressedBase64);
        showNotification("Đã đính kèm ảnh công văn thành công!");
      };
    };
    reader.readAsDataURL(file);
  };

  const savePatient = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification("Họ tên khách VIP không được bỏ trống!", "error");
      return;
    }
    if (!formData.pid.trim()) {
      showNotification("Mã bệnh nhân PID là bắt buộc!", "error");
      return;
    }

    const payload = {
      ...formData,
      status: formData.status || 'Waiting',
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name
    };

    try {
      if (isFirebaseConnected && db) {
        const patientsCol = collection(db, 'artifacts', appId, 'public', 'data', 'patients');
        if (currentId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'patients', currentId), payload);
          showNotification("Đã cập nhật hồ sơ khách VIP thành công!");
        } else {
          await addDoc(patientsCol, { ...payload, createdAt: new Date().toISOString() });
          showNotification("Đăng ký thành công hồ sơ khách VIP mới!");
        }
      } else {
        let updatedList = [...patients];
        if (currentId) {
          updatedList = updatedList.map(p => p.id === currentId ? { ...p, ...payload } : p);
          showNotification("Cập nhật thành công (Lưu cục bộ)!");
          triggerPushAlert("🔄 Cập nhật hồ sơ (Offline)", `Hồ sơ khách VIP ${payload.name} vừa được thay đổi thành công.`, "success");
        } else {
          const newDoc = { id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
          updatedList.unshift(newDoc);
          showNotification("Đã lưu hồ sơ mới vào thiết bị!");
          triggerPushAlert("🆕 Tiếp nhận khách VIP (Offline)", `Hồ sơ khách ${payload.name} (PID: ${payload.pid}) đã được lưu trữ cục bộ.`, "info");
        }
        setPatients(updatedList);
        localStorage.setItem('local_patients', JSON.stringify(updatedList));
      }
      resetForm();
      setActiveTab('monitoring'); // Chuyển sang Giao diện 3: Theo dõi hồ sơ ngay khi lưu
    } catch (err) {
      console.error("Lỗi ghi dữ liệu:", err);
      showNotification("Có lỗi xảy ra hoặc bạn không đủ quyền ghi dữ liệu lên Cloud.", "error");
    }
  };

  const initiateEdit = (patient) => {
    setCurrentId(patient.id);
    setFormData({
      name: patient.name || '',
      tier: patient.tier || 'VIP',
      boardApproval: patient.boardApproval || '',
      notes: patient.notes || '',
      pid: patient.pid || '',
      date: patient.date || new Date().toISOString().split('T')[0],
      specialties: patient.specialties || [],
      ngoaiTru: patient.ngoaiTru || 0,
      capCuu: patient.capCuu || 0,
      noiTru: patient.noiTru || 0,
      ngoaiVien: patient.ngoaiVien || 0,
      phiKham: patient.phiKham || 0,
      clsCdha: patient.clsCdha || 0,
      thuocVacxin: patient.thuocVacxin || 0,
      insuranceAdvance: patient.insuranceAdvance || 0,
      discountRate: patient.discountRate || 0,
      approvedDiscountAmount: patient.approvedDiscountAmount || 0,
      totalAmount: patient.totalAmount || 0,
      approvalImage: patient.approvalImage || '',
      status: patient.status || 'Waiting'
    });
    setActiveTab('register'); // Chuyển sang Giao diện 2 khi bấm sửa
  };

  const deletePatient = (id) => {
    if (userRole === 'nhanvien') {
      showNotification("Lỗi: Quyền NHÂN VIÊN không được phép xóa hồ sơ khách VIP!", "error");
      return;
    }

    setConfirmModal({
      show: true,
      title: "Xác nhận xóa hồ sơ bệnh nhân VIP",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ này không? Toàn bộ chứng từ và số liệu đính kèm sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.",
      action: async () => {
        try {
          if (isFirebaseConnected && db) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'patients', id));
            showNotification("Đã xóa hồ sơ khỏi Cloud Database!");
          } else {
            const updated = patients.filter(p => p.id !== id);
            setPatients(updated);
            localStorage.setItem('local_patients', JSON.stringify(updated));
            showNotification("Đã xóa hồ sơ khỏi bộ nhớ thiết bị!");
            triggerPushAlert("⚠️ Đã xóa hồ sơ (Offline)", "Hồ sơ của một khách hàng vừa bị gỡ bỏ.", "error");
          }
        } catch (err) {
          console.error(err);
          showNotification("Không thể xóa. Vui lòng kiểm tra quyền truy cập database.", "error");
        }
        setConfirmModal({ show: false, action: null, message: '', title: '' });
      }
    });
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      showNotification("Chỉ Quản trị viên cao cấp (T Admin) mới được phép quản trị nhân sự!", "error");
      return;
    }
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.pass.trim()) {
      showNotification("Vui lòng điền đầy đủ các thông tin nhân viên bắt buộc!", "error");
      return;
    }

    const created = {
      uid: "staff_" + Date.now(),
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      pass: newStaff.pass,
      title: newStaff.title || 'Nhân viên chuyên ban'
    };

    const updatedList = [...staffList, created];
    setStaffList(updatedList);
    localStorage.setItem('crm_staff_accounts', JSON.stringify(updatedList));
    showNotification(`Đã tạo và phân quyền thành công cho ${newStaff.name}!`);
    setNewStaff({ name: '', email: '', role: 'nhanvien', pass: '123456', title: '' });
  };

  const handleDeleteStaff = (uid) => {
    if (uid === currentUser.uid || uid === "acc_admin") {
      showNotification("Không thể xóa tài khoản Quản trị mặc định hoặc tài khoản đang sử dụng!", "error");
      return;
    }
    const updated = staffList.filter(s => s.uid !== uid);
    setStaffList(updated);
    localStorage.setItem('crm_staff_accounts', JSON.stringify(updated));
    showNotification("Đã gỡ quyền truy cập của tài khoản nhân sự.");
  };

  const saveSettingsOnDb = async (newSettings) => {
    setSystemSettings(newSettings);
    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), newSettings);
      } catch (e) {
        console.error("Lỗi đồng bộ cấu hình:", e);
      }
    } else {
      localStorage.setItem('local_settings', JSON.stringify(newSettings));
    }
  };

  const handleAddSpecialty = () => {
    if (!newSpecialtyInput.trim()) return;
    if (systemSettings.specialties.includes(newSpecialtyInput.trim())) {
      showNotification("Chuyên khoa này đã có trong hệ thống!", "error");
      return;
    }
    const updated = [...systemSettings.specialties, newSpecialtyInput.trim()];
    saveSettingsOnDb({ ...systemSettings, specialties: updated });
    setNewSpecialtyInput('');
    showNotification("Đã thêm chuyên khoa mới!");
  };

  const handleRemoveSpecialty = (spec) => {
    const updated = systemSettings.specialties.filter(s => s !== spec);
    saveSettingsOnDb({ ...systemSettings, specialties: updated });
    showNotification("Đã loại bỏ chuyên khoa!");
  };

  const handleFormulaCheckboxChange = (field) => {
    const updatedFormula = { 
      ...systemSettings.totalFormulaFields, 
      [field]: !systemSettings.totalFormulaFields[field] 
    };
    saveSettingsOnDb({ ...systemSettings, totalFormulaFields: updatedFormula });
    showNotification("Cấu hình công thức tổng cộng mới được áp dụng!");
  };

  const handleDiscountFormulaChange = (type) => {
    saveSettingsOnDb({ ...systemSettings, discountFormulaType: type });
    showNotification("Công thức tính số tiền miễn giảm đã được cập nhật!");
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number || 0);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchSearch = 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.boardApproval?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSpecialty = !filterSpecialty || p.specialties?.includes(filterSpecialty);
      const matchTier = !filterTier || p.tier === filterTier;
      const matchDate = !filterDate || p.date === filterDate;

      return matchSearch && matchSpecialty && matchTier && matchDate;
    });
  }, [patients, searchTerm, filterSpecialty, filterTier, filterDate]);

  const metrics = useMemo(() => {
    let totalPatients = filteredPatients.length;
    let vipCount = filteredPatients.filter(p => p.tier === 'VIP').length;
    let vvipCount = filteredPatients.filter(p => p.tier === 'VVIP').length;
    let totalRevenue = filteredPatients.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    let totalDiscount = filteredPatients.reduce((sum, p) => sum + (p.approvedDiscountAmount || 0), 0);
    let totalCollected = filteredPatients.reduce((sum, p) => sum + Math.max(0, (p.totalAmount || 0) - (p.approvedDiscountAmount || 0)), 0);

    return { totalPatients, vipCount, vvipCount, totalRevenue, totalDiscount, totalCollected };
  }, [filteredPatients]);

  // Bộ lọc chuyên sâu chỉ lấy những bệnh nhân VIP đang ở trong quy trình Kanban của ngày hôm nay
  const kanbanPatients = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return patients.filter(p => {
      // Chỉ hiển thị trên Kanban nếu là ngày hôm nay, HOẶC trạng thái chưa hoàn tất (đang khám dở dang)
      const isToday = p.date === today;
      const isNotCompleted = p.status !== 'Completed';
      return isToday || isNotCompleted;
    });
  }, [patients]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Hàm xóa dữ liệu Form
  const resetForm = () => {
    setCurrentId(null);
    setFormData({
      name: '',
      tier: 'VIP',
      boardApproval: '',
      notes: '',
      pid: '',
      date: new Date().toISOString().split('T')[0],
      specialties: [],
      ngoaiTru: 0,
      capCuu: 0,
      noiTru: 0,
      ngoaiVien: 0,
      phiKham: 0,
      clsCdha: 0,
      thuocVacxin: 0,
      insuranceAdvance: 0,
      discountRate: 0,
      approvedDiscountAmount: 0,
      totalAmount: 0,
      approvalImage: '',
      status: 'Waiting'
    });
  };

  // ==========================================
  // GIAO DIỆN ĐĂNG NHẬP (PREMIUM LIGHT LOGIN SCREEN)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-indigo-50/20 to-slate-200 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden text-slate-800">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl translate-x-12 translate-y-12"></div>

        <div className="max-w-md w-full bg-white/95 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6 animate-scaleIn">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-white p-2.5 shadow-sm border border-slate-100 mx-auto">
              <img 
                src="https://iili.io/F66acRs.png" 
                alt="Hospital Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                VIP CARE CRM
              </h1>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">Hệ thống phân quyền chuẩn hóa - Tiếp đón VIP</p>
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 text-center font-bold flex items-center gap-1.5 justify-center">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-500" />
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email định danh</label>
              <input 
                type="email" 
                placeholder="ten@phongkham.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-hidden text-slate-800 font-medium shadow-2xs"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mật khẩu bảo mật</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-hidden text-slate-800 font-medium shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Xác thực & Đăng nhập
            </button>
          </form>

          {/* KHU VỰC CHỌN TÀI KHOẢN MẪU THU GỌN - CHUYÊN NGHIỆP */}
          <div className="border-t border-slate-100 pt-4">
            <details className="group">
              <summary className="list-none flex items-center justify-center gap-1.5 cursor-pointer text-xs text-slate-400 font-bold hover:text-slate-600 transition select-none">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Tài khoản kiểm thử phân quyền</span>
                <ChevronDown className="w-3.5 h-3.5 transition transform group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-2 gap-2 mt-3 animate-fadeIn">
                {staffList.map((acc) => (
                  <button
                    key={acc.uid}
                    onClick={() => {
                      setLoginEmail(acc.email);
                      setLoginPassword(acc.pass);
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl text-left transition hover:border-indigo-300 focus:ring-1 focus:ring-indigo-400"
                  >
                    <span className="font-extrabold text-slate-800 block text-xs truncate">{acc.name}</span>
                    <span className="text-[10px] text-slate-400 block font-medium truncate">{acc.title}</span>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-sm uppercase">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN CHÍNH SAU KHI ĐĂNG NHẬP THÀNH CÔNG (LIGHT THEME)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased pb-20 md:pb-12 relative">
      
      {/* 🟢 KHU VỰC THÔNG BÁO ĐẨY POPUP TRÊN MÀN HÌNH DI ĐỘNG / DESKTOP */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 pointer-events-none space-y-2 max-w-sm ml-auto">
        {activePushAlerts.map(alert => (
          <div 
            key={alert.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex gap-3 items-start transition-all transform duration-300 animate-slideIn bg-white ${
              alert.type === 'success' ? 'border-emerald-100 bg-emerald-50/95' :
              alert.type === 'error' ? 'border-rose-100 bg-rose-50/95' : 'border-indigo-100 bg-indigo-50/95'
            }`}
          >
            <div className={`p-1.5 rounded-lg text-white ${
              alert.type === 'success' ? 'bg-emerald-500' :
              alert.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
            }`}>
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900">{alert.title}</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium leading-relaxed">{alert.message}</p>
            </div>
            <button 
              onClick={() => setActivePushAlerts(prev => prev.filter(a => a.id !== alert.id))}
              className="text-slate-400 hover:text-slate-600 p-0.5 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL CUSTOM CONFIRMATION */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-2.5 text-rose-600">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <h3 className="text-base font-extrabold text-slate-950">{confirmModal.title || "Xác nhận tác vụ"}</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{confirmModal.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setConfirmModal({ show: false, action: null, message: '', title: '' })}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmModal.action}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white rounded-xl transition shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THÔNG BÁO TOAST */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl transition-all transform duration-300 translate-y-0 ${
          notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'
        }`}>
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span className="font-bold text-xs">{notification.message}</span>
        </div>
      )}

      {/* HEADER ĐIỀU HƯỚNG TÁC VỤ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 bg-white p-1">
                <img 
                  src="https://iili.io/F66acRs.png" 
                  alt="Hospital Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  VIP CARE CRM
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    {userRole}
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold">Hệ thống Tiếp Đón Đặc Quyền VIP</p>
              </div>
            </div>

            {/* MENU 4 GIAO DIỆN THEO ĐÚNG YÊU CẦU */}
            <nav className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => { setActiveTab('dashboard'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Bảng điều khiển
              </button>
              
              <button 
                onClick={() => { resetForm(); setActiveTab('register'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'register' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-4 h-4" /> Tiếp nhận hồ sơ
              </button>

              <button 
                onClick={() => { setActiveTab('monitoring'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'monitoring' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ClipboardList className="w-4 h-4" /> Theo dõi hồ sơ
              </button>

              {(userRole === 'admin' || userRole === 'lanhdao') && (
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4" /> Cấu hình hệ thống
                </button>
              )}
            </nav>

            <div className="flex items-center gap-3 relative">
              {/* Trạng thái kết nối Cloud */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`}></span>
                {isFirebaseConnected ? 'Cloud Online' : 'Local Offline'}
              </div>

              {/* 🔔 BIỂU TƯỢNG TRUNG TÂM THÔNG BÁO (BELL) */}
              <button 
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className={`p-2 rounded-xl transition-all relative ${
                  showNotificationCenter ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Trung tâm thông báo"
              >
                {unreadCount > 0 ? (
                  <>
                    <BellRing className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white font-black text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                      {unreadCount}
                    </span>
                  </>
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </button>

              {/* 🛑 TRUNG TÂM THÔNG BÁO DROPDOWN PANEL */}
              {showNotificationCenter && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 p-4 space-y-3 animate-scaleIn">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-1.5">
                      <BellRing className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-black text-slate-900">Trung tâm thông báo</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold transition"
                      >
                        Đã đọc tất cả
                      </button>
                      <button 
                        onClick={clearAllNotifications}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-extrabold transition"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                        <p className="text-[11px] font-bold">Hệ thống chưa ghi nhận thông báo mới.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id}
                          className={`p-3 rounded-2xl border text-xs transition flex gap-2 items-start ${
                            n.read ? 'border-slate-50 bg-slate-50/50' : 'border-indigo-50 bg-indigo-50/30'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            n.type === 'success' ? 'bg-emerald-500' :
                            n.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
                          }`} />
                          <div className="flex-1 space-y-0.5">
                            <strong className="text-slate-800 block leading-tight">{n.title}</strong>
                            <p className="text-[11px] text-slate-500 leading-normal font-medium">{n.message}</p>
                            <span className="text-[9px] text-slate-400 font-bold block flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {n.timestamp}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="hidden sm:block text-right">
                <div className="text-xs font-extrabold text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wide">{currentUser.title || userRole}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ĐIỀU HƯỚNG CỐ ĐỊNH PHÍA DƯỚI CHO MOBILE (MOBILE TAB BAR) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around py-3 shadow-xl rounded-t-3xl">
        <button 
          onClick={() => { setActiveTab('dashboard'); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Bảng điều khiển</span>
        </button>
        <button 
          onClick={() => { resetForm(); setActiveTab('register'); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'register' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Plus className="w-5 h-5" />
          <span>Tiếp nhận VIP</span>
        </button>
        <button 
          onClick={() => { setActiveTab('monitoring'); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'monitoring' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Theo dõi hồ sơ</span>
        </button>
        {(userRole === 'admin' || userRole === 'lanhdao') && (
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Settings className="w-5 h-5" />
            <span>Cấu hình</span>
          </button>
        )}
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ====================================================== */}
        {/* GIAO DIỆN 1: BẢNG ĐIỀU KHIỂN (DASHBOARD) */}
        {/* ====================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Banner chào mừng & Khơi mào hành động */}
            <div className="bg-gradient-to-tr from-[#1e293b] to-[#4f46e5] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-100">
              <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl opacity-10 translate-x-20 -translate-y-20"></div>
              <div className="relative z-10 space-y-4 max-w-2xl">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Hệ thống Tiếp Đón & Quản Lý Đặc Quyền
                </span>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                  Chào mừng trở lại, {currentUser.name}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                  Mọi sự thay đổi trên hồ sơ khách hàng VIP và VVIP đều được cập nhật thời gian thực và thông báo trực tiếp tới các thiết bị của ban lãnh đạo.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => { resetForm(); setActiveTab('register'); }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 hover:from-amber-500 hover:to-amber-400 text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition transform active:scale-95"
                  >
                    <Plus className="w-4.5 h-4.5 stroke-[3px]" /> Tiếp nhận hồ sơ mới <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* HIỂN THỊ CHỈ SỐ TÀI CHÍNH */}
            {(userRole === 'admin' || userRole === 'lanhdao') ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Thống kê hoạt động VIP thời gian thực
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-extrabold">
                    {isFirebaseConnected ? 'Live Syncing Active' : 'Offline Mode (Local Only)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Khách hàng VIP */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition duration-200">
                    <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Khách hàng VIP</span>
                      <span className="text-xl font-black text-slate-900">{metrics.totalPatients}</span>
                      <span className="text-[11px] text-slate-500 block">
                        VIP: {metrics.vipCount} | VVIP: {metrics.vvipCount}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Tổng phí phát sinh */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition duration-200">
                    <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Tổng phí phát sinh</span>
                      <span className="text-xl font-black text-slate-900">{formatCurrency(metrics.totalRevenue)}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Phí y khoa gốc
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Tổng duyệt giảm */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition duration-200">
                    <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Tổng duyệt giảm</span>
                      <span className="text-xl font-black text-rose-600">-{formatCurrency(metrics.totalDiscount)}</span>
                      <span className="text-[11px] text-rose-400 block font-bold">
                        Ban lãnh đạo duyệt
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Thực thu phòng VIP */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition duration-200">
                    <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Thực thu phòng VIP</span>
                      <span className="text-xl font-black text-emerald-600">{formatCurrency(metrics.totalCollected)}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Sau khi giảm trừ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50/50 border border-yellow-200/60 rounded-3xl p-5 text-xs text-yellow-800 font-bold flex items-center gap-3">
                <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                {"Phiên làm việc: Bạn đăng nhập bằng quyền "}{userRole.toUpperCase()}{". Các chỉ số thống kê từ hình ảnh \"{98517A7C-1401-4F6A-A33B-5D86B5B98B39}.png\" bị ẩn vì lý do bảo mật tài chính y khoa nội bộ."}
              </div>
            )}

            {/* ====================================================== */}
            {/* 🆕 BẢNG KANBAN WORKFLOW HÀNH TRÌNH KHÁM TRONG NGÀY (CHỈ HIỂN THỊ TẠI GIAO DIỆN 1) */}
            {/* ====================================================== */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                    Bản Đồ Hành Trình Khám & Điều Trị VIP (Realtime Kanban)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Cập nhật tiến độ tiếp đón trong ngày của từng khách hàng. Kéo thả ảo hoặc chuyển nhanh trạng thái.</p>
                </div>
                <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg">
                  Tổng lượt khám: {kanbanPatients.length}
                </div>
              </div>

              {/* Layout Kanban Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
                {workflowStatuses.map(col => {
                  // Lọc bệnh nhân thuộc cột này
                  const colPatients = kanbanPatients.filter(p => (p.status || 'Waiting') === col.id);

                  return (
                    <div 
                      key={col.id} 
                      className="bg-slate-50/60 rounded-2xl p-3 border border-slate-100 flex flex-col min-w-[180px] min-h-[350px]"
                    >
                      {/* Tiêu đề cột */}
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 mb-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                          <span className="text-[10px] font-black text-slate-700 truncate">{col.label}</span>
                        </div>
                        <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-md border border-slate-100 text-slate-500">
                          {colPatients.length}
                        </span>
                      </div>

                      {/* Danh sách thẻ bệnh nhân của cột */}
                      <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px]">
                        {colPatients.map(p => (
                          <div 
                            key={p.id}
                            className="bg-white p-3 rounded-xl border border-slate-150/80 shadow-2xs hover:shadow-xs transition duration-150 space-y-2.5 relative group"
                          >
                            {/* Header của thẻ */}
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-[8px] text-indigo-600 font-mono font-black truncate">PID: {p.pid}</span>
                              <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase ${
                                p.tier === 'VVIP' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {p.tier}
                              </span>
                            </div>

                            {/* Tên khách hàng */}
                            <div className="font-extrabold text-[11px] text-slate-800 leading-tight truncate" title={p.name}>
                              {p.name}
                            </div>

                            {/* Chuyên khoa tiếp nhận */}
                            <div className="flex flex-wrap gap-0.5">
                              {p.specialties?.slice(0, 2).map((spec, i) => (
                                <span key={i} className="text-[8px] bg-slate-50 text-slate-500 px-1 py-0.2 rounded font-semibold truncate max-w-[80px]">
                                  {spec}
                                </span>
                              ))}
                              {p.specialties?.length > 2 && (
                                <span className="text-[8px] text-slate-400 font-bold px-1">+{p.specialties.length - 2}</span>
                              )}
                            </div>

                            {/* Dropdown điều phối hành trình nhanh */}
                            <div className="space-y-1">
                              <label className="text-[8px] text-slate-400 font-bold block uppercase">Chuyển trạng thái:</label>
                              <select
                                value={p.status || 'Waiting'}
                                onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                                className="w-full px-1.5 py-1 text-[9px] font-black border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                              >
                                {workflowStatuses.map(st => (
                                  <option key={st.id} value={st.id}>{st.label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Footer thông tin thời gian cập nhật */}
                            <div className="flex justify-between items-center text-[8px] text-slate-400 border-t border-slate-100 pt-1.5 font-semibold">
                              <span className="truncate">By: {p.updatedBy?.split(' ')[0] || 'Lễ tân'}</span>
                              <span className="flex-shrink-0 text-slate-300">
                                {p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---'}
                              </span>
                            </div>
                          </div>
                        ))}

                        {colPatients.length === 0 && (
                          <div className="text-center py-8 text-slate-300 text-[10px] font-bold border-2 border-dashed border-slate-100 rounded-xl">
                            Trống
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Khối quản lý lối tắt tác vụ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" /> Giao diện 3: Theo dõi hồ sơ khách VIP
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Truy cập nhanh danh sách bệnh nhân VIP/VVIP đang điều trị tại phòng khám và bệnh viện chuyên khoa. Thực hiện tra cứu tiến trình và biên lai đính kèm.
                </p>
                <button 
                  onClick={() => setActiveTab('monitoring')}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                >
                  Đến bảng giám sát <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {(userRole === 'admin' || userRole === 'lanhdao') && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" /> Giao diện 4: Cấu hình hệ thống & nhân sự
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Thiết lập công thức tính tổng phí điều trị, cấu hình các chuyên khoa tiếp nhận và phân quyền tài khoản cho đội ngũ tiếp đón.
                  </p>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                  >
                    Đến trang cấu hình <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ====================================================== */}
        {/* GIAO DIỆN 2: TIẾP NHẬN HỒ SƠ MỚI */}
        {/* ====================================================== */}
        {activeTab === 'register' && (
          <form onSubmit={savePatient} className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-slate-950 flex items-center gap-1.5">
                  {currentId ? "Cập Nhật Hồ Sơ Khách Hàng VIP" : "Đăng Ký Hồ Sơ Khách VIP/VVIP Mới"}
                </h2>
                <p className="text-xs text-slate-400 font-semibold">Khai báo thông tin hành chính, danh mục chỉ định khám, biểu phí phát sinh thực tế.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => { resetForm(); setActiveTab('monitoring'); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
                >
                  <Check className="w-4 h-4" /> {currentId ? "Cập nhật dữ liệu" : "Hoàn tất đăng ký"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form trái */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Thông Tin Hành Chính Khách VIP (Nhập Tay)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Họ & Tên khách VIP/VVIP <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="Nhập tay họ và tên..."
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold bg-white text-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Mã PID <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="Nhập tay mã bệnh nhân PID..."
                        value={formData.pid}
                        onChange={(e) => handleInputChange('pid', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-mono font-black bg-white text-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Phân Hạng Tiếp Đón</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleInputChange('tier', 'VIP')}
                          className={`py-2 px-4 rounded-xl text-xs font-bold border transition ${
                            formData.tier === 'VIP' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          Hạng VIP
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('tier', 'VVIP')}
                          className={`py-2 px-4 rounded-xl text-xs font-bold border transition ${
                            formData.tier === 'VVIP' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          Hạng VVIP (Đặc biệt)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Ngày khám / Điều trị</label>
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-800 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600 block">HĐQT Phê Duyệt <span className="text-slate-400 font-semibold">(Nhập tay)</span></label>
                      <input 
                        type="text" 
                        placeholder="Thành viên hội đồng quản trị duyệt..."
                        value={formData.boardApproval}
                        onChange={(e) => handleInputChange('boardApproval', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-semibold bg-white text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600 block">Ghi chú <span className="text-slate-400 font-semibold">(Nhập tay)</span></label>
                      <textarea 
                        rows="2"
                        placeholder="Mô tả ghi chú tiếp đón lâm sàng..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-medium bg-white text-slate-800"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Chọn 1 hoặc nhiều Chuyên khoa */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Chỉ Định Chuyên Khoa <span className="text-slate-400 font-semibold">(Chọn 1 hoặc nhiều)</span>
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {systemSettings.specialties.map((spec, idx) => {
                      const isSelected = formData.specialties.includes(spec);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleSpecialtySelection(spec)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isSelected ? 'bg-slate-950 border-slate-950 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chi phí lâm sàng */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Chi Phí Điều Trị & Lâm Sàng Thực Tế (VND)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Phí Khám/Điều trị */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Phí khám/Điều trị</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.phiKham ? formData.phiKham.toLocaleString('vi-VN') : ''}
                          onChange={(e) => handleCurrencyChange('phiKham', e.target.value)}
                          placeholder="0"
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-900 bg-white"
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">VNĐ</span>
                      </div>
                    </div>

                    {/* Ngoại Trú */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Ngoại trú</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.ngoaiTru ? formData.ngoaiTru.toLocaleString('vi-VN') : ''}
                          onChange={(e) => handleCurrencyChange('ngoaiTru', e.target.value)}
                          placeholder="0"
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-900 bg-white"
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">VNĐ</span>
                      </div>
                    </div>

                    {/* Cấp cứu / daycare */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Cấp cứu/Daycare</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.capCuu ? formData.capCuu.toLocaleString('vi-VN') : ''}
                          onChange={(e) => handleCurrencyChange('capCuu', e.target.value)}
                          placeholder="0"
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-900 bg-white"
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">VNĐ</span>
                      </div>
                    </div>

                    {/* Nội trú / ICU */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Nội trú/ICU</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.noiTru ? formData.noiTru.toLocaleString('vi-VN') : ''}
                          onChange={(e) => handleCurrencyChange('noiTru', e.target.value)}
                          placeholder="0"
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-900 bg-white"
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">VNĐ</span>
                      </div>
                    </div>

                    {/* Ngoại viện */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Nội trú ngoài viện</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.ngoaiVien ? formData.ngoaiVien.toLocaleString('vi-VN') : ''}
                          onChange={(e) => handleCurrencyChange('ngoaiVien', e.target.value)}
                          placeholder="0"
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-900 bg-white"
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">VNĐ</span>
                      </div>
                    </div>

                    {/* CLS/CDHA */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">CLS/CDHA</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.clsCdha ? formData.clsCdha.toLocaleString('vi-VN') : ''}
                          onChange={(e) => handleCurrencyChange('clsCdha', e.target.value)}
                          placeholder="0"
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-900 bg-white"
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">VNĐ</span>
                      </div>
                    </div>

                    {/* Thuốc/vắc-xin */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Thuốc/vacxin</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.thuocVacxin ? formData.thuocVacxin.toLocaleString('vi-VN') : ''}
                          onChange={(e) => handleCurrencyChange('thuocVacxin', e.target.value)}
                          placeholder="0"
                          className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-900 bg-white"
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-bold">VNĐ</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Form phải */}
              <div className="space-y-6">
                
                {/* Biên lai đồng bộ chi phí */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500 rounded-full filter blur-2xl opacity-20 translate-x-10 -translate-y-10"></div>
                  
                  <h3 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 relative z-10">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                    Biên lai đồng bộ chi phí VIP
                  </h3>

                  {/* BHYT/BHTN/Tạm ứng */}
                  <div className="space-y-1.5 pt-2 relative z-10">
                    <label className="text-[10px] font-bold text-slate-300 block">BHYT/BHTN/Tạm ứng (VNĐ)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.insuranceAdvance ? formData.insuranceAdvance.toLocaleString('vi-VN') : ''}
                        onChange={(e) => handleCurrencyChange('insuranceAdvance', e.target.value)}
                        placeholder="0"
                        className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-white placeholder-slate-500"
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-slate-500 font-bold">VNĐ</span>
                    </div>
                  </div>

                  {/* Duyệt giảm */}
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-300 block flex items-center gap-1">
                        Duyệt giảm (%) {userRole === 'nhanvien' && '🔒'}
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={formData.discountRate || ''}
                          disabled={userRole === 'nhanvien'} 
                          onChange={(e) => handleInputChange('discountRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          placeholder="0"
                          className={`w-full pl-4 pr-10 py-2.5 rounded-xl border text-xs font-black placeholder-slate-500 ${
                            userRole === 'nhanvien'
                              ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-slate-800 border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500'
                          }`}
                        />
                        <span className="absolute right-3 top-3 text-[10px] text-slate-500 font-bold">%</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-300 block">Hạng hiện tại</label>
                      <div className="py-2.5 px-3 bg-slate-800 rounded-xl border border-slate-700 text-xs font-black text-center text-amber-400 uppercase tracking-widest">
                        {formData.tier}
                      </div>
                    </div>
                  </div>

                  {/* Các chỉ số hiển thị tự động */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-3 relative z-10">
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Tổng phí tự động:</span>
                      <span className="font-extrabold text-slate-100">{formatCurrency(formData.totalAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Số tiền duyệt giảm tự động:</span>
                      <span className="font-extrabold text-rose-400">-{formatCurrency(formData.approvedDiscountAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Khấu trừ BHYT/Tạm ứng:</span>
                      <span className="font-extrabold text-indigo-400">-{formatCurrency(formData.insuranceAdvance)}</span>
                    </div>

                    <div className="border-t border-dashed border-slate-800 pt-3 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-white">BỆNH NHÂN THỰC TRẢ:</span>
                      <span className="text-lg font-black text-emerald-400">
                        {formatCurrency(Math.max(0, formData.totalAmount - formData.approvedDiscountAmount - formData.insuranceAdvance))}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Đính kèm ảnh phê duyệt */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Ảnh Phê Duyệt Gửi Kèm
                  </h3>

                  <div className="space-y-4">
                    {formData.approvalImage ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                        <img src={formData.approvalImage} alt="Công văn" className="w-full h-48 object-cover" />
                        <button 
                          type="button"
                          onClick={() => handleInputChange('approvalImage', '')}
                          className="absolute right-2 top-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md"
                          title="Gỡ bỏ ảnh"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition duration-200">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700 text-center">Bấm để tải ảnh công văn phê duyệt</span>
                        <span className="text-[10px] text-slate-400 text-center">Được mã hóa và lưu trữ trực tuyến</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </form>
        )}

        {/* ====================================================== */}
        {/* GIAO DIỆN 3: THEO DÕI HỒ SƠ */}
        {/* ====================================================== */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header của bảng theo dõi */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600 animate-pulse" /> Giao diện 3: Theo Dõi Hồ Sơ Khách VIP
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Giám sát hoạt động khám bệnh, tra cứu nhanh thông tin và bảo lưu lịch sử duyệt giảm.</p>
              </div>
              <button 
                onClick={() => { resetForm(); setActiveTab('register'); }}
                className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" /> Tiếp nhận hồ sơ mới
              </button>
            </div>

            {/* Bộ lọc tìm kiếm */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Tìm theo tên bệnh nhân, mã PID, ghi chú lâm sàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-xs font-bold"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="">Tất cả hạng VIP</option>
                    <option value="VIP">Hạng VIP</option>
                    <option value="VVIP">Hạng VVIP</option>
                  </select>

                  <select 
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="">Tất cả chuyên khoa</option>
                    {systemSettings.specialties.map((spec, idx) => (
                      <option key={idx} value={spec}>{spec}</option>
                    ))}
                  </select>

                  <input 
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  />

                  {(searchTerm || filterTier || filterSpecialty || filterDate) && (
                    <button 
                      onClick={() => { setSearchTerm(''); setFilterTier(''); setFilterSpecialty(''); setFilterDate(''); }}
                      className="px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* DANH SÁCH BỆNH NHÂN */}
            {isLoading ? (
              <div className="bg-white p-16 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-semibold text-xs">Đang đồng bộ dữ liệu bảo mật...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-slate-100 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy hồ sơ phù hợp</h3>
                  <p className="text-slate-400 text-xs mt-1 font-medium">Hệ thống chưa ghi nhận hoặc từ khóa lọc không trùng khớp.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          <th className="py-4 px-5">PID / Khách Hàng</th>
                          <th className="py-4 px-3">Phân hạng</th>
                          <th className="py-4 px-3">Ngày Khám</th>
                          <th className="py-4 px-3">Chuyên Khoa</th>
                          <th className="py-4 px-3">HĐQT Phê Duyệt</th>
                          <th className="py-4 px-3 text-right">Tổng Chi Phí</th>
                          <th className="py-4 px-3 text-right">Duyệt Giảm</th>
                          <th className="py-4 px-3 text-right">Thực Thu</th>
                          <th className="py-4 px-5 text-right">Tác vụ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredPatients.map((p) => {
                          const realCollected = Math.max(0, (p.totalAmount || 0) - (p.approvedDiscountAmount || 0));
                          return (
                            <tr key={p.id} className="hover:bg-[#f8fafc]/50 transition duration-150">
                              <td className="py-4 px-5">
                                <div className="font-extrabold text-slate-950 text-sm">{p.name}</div>
                                <div className="text-[10px] text-indigo-600 font-mono font-black mt-0.5">PID: {p.pid}</div>
                              </td>
                              <td className="py-4 px-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide ${
                                  p.tier === 'VVIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-50 text-indigo-700'
                                }`}>
                                  <Sparkles className="w-3 h-3" />
                                  {p.tier}
                                </span>
                              </td>
                              <td className="py-4 px-3 text-slate-500 font-bold">
                                {p.date ? new Date(p.date).toLocaleDateString('vi-VN') : 'Trong ngày'}
                              </td>
                              <td className="py-4 px-3">
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {p.specialties?.map((s, idx) => (
                                    <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-3">
                                <div className="font-bold text-slate-700">{p.boardApproval || '---'}</div>
                                {p.notes && <div className="text-[10px] text-slate-400 max-w-[150px] truncate" title={p.notes}>{p.notes}</div>}
                              </td>
                              <td className="py-4 px-3 text-right font-bold text-slate-900">
                                {formatCurrency(p.totalAmount)}
                              </td>
                              <td className="py-4 px-3 text-right">
                                <div className="font-bold text-rose-600">-{formatCurrency(p.approvedDiscountAmount)}</div>
                                <div className="text-[9px] text-slate-400 font-black">Tỷ lệ: {p.discountRate || 0}%</div>
                              </td>
                              <td className="py-4 px-3 text-right font-extrabold text-emerald-600">
                                {formatCurrency(realCollected)}
                              </td>
                              <td className="py-4 px-5 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-1.5">
                                  {p.approvalImage && (
                                    <a href={p.approvalImage} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition" title="Xem ảnh phê duyệt">
                                      <ImageIcon className="w-4 h-4" />
                                    </a>
                                  )}
                                  <button onClick={() => initiateEdit(p)} className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-950 hover:text-white rounded-xl transition" title="Chỉnh sửa hồ sơ">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  
                                  {/* Quyền nhanvien bị ẩn nút xóa */}
                                  {userRole !== 'nhanvien' ? (
                                    <button onClick={() => deletePatient(p.id)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition" title="Xóa hồ sơ">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <span className="p-1.5 text-slate-300 cursor-not-allowed" title="Nhân viên không được gỡ">
                                      <Lock className="w-4 h-4" />
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Responsive Grid Card View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                  {filteredPatients.map((p) => {
                    const realCollected = Math.max(0, (p.totalAmount || 0) - (p.approvedDiscountAmount || 0));
                    return (
                      <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-indigo-600 font-mono font-black block">PID: {p.pid}</span>
                            <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Khám ngày: {p.date ? new Date(p.date).toLocaleDateString('vi-VN') : 'Trong ngày'}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                            p.tier === 'VVIP' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {p.tier}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {p.specialties?.map((s, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-bold">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl text-[11px] space-y-1 text-slate-600">
                          <div>Phê duyệt: <strong className="text-slate-900">{p.boardApproval || '---'}</strong></div>
                          {p.notes && <div className="text-slate-500 italic">"{p.notes}"</div>}
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3 text-center">
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Tổng phí</span>
                            <span className="text-[11px] font-bold text-slate-900">{formatCurrency(p.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Duyệt giảm</span>
                            <span className="text-[11px] font-bold text-rose-600">-{formatCurrency(p.approvedDiscountAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Thực Thu</span>
                            <span className="text-[11px] font-black text-emerald-600">{formatCurrency(realCollected)}</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          {p.approvalImage && (
                            <a href={p.approvalImage} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] rounded-xl font-bold flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" /> Bản duyệt
                            </a>
                          )}
                          <button onClick={() => initiateEdit(p)} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-[10px] rounded-xl font-bold flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5" /> Sửa
                          </button>
                          
                          {/* Quyền nhanvien bị ẩn nút xóa */}
                          {userRole !== 'nhanvien' && (
                            <button onClick={() => deletePatient(p.id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[10px] rounded-xl font-bold flex items-center gap-1">
                              <Trash2 className="w-3.5 h-3.5" /> Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ====================================================== */}
        {/* GIAO DIỆN 4: CẤU HÌNH HỆ THỐNG */}
        {/* ====================================================== */}
        {activeTab === 'settings' && (userRole === 'admin' || userRole === 'lanhdao') && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
              <h2 className="text-lg font-black text-slate-900">Giao diện 4: Cấu Hình Tham Số & Phân Quyền CRM VIP</h2>
              <p className="text-xs text-slate-400 mt-1">Cài đặt công thức tính tổng phí điều trị, cấu hình danh mục chuyên khoa và gán quyền nhân viên.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Bên trái: Công thức tính tiền tổng cộng */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-sm inline-block"></span>
                    Cấu Hinh Các Trường Cộng Tổng
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Lựa chọn các loại chi phí phát sinh để tự động tính vào [Tổng cộng]:</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'phiKham', label: 'Phí khám/Điều trị' },
                    { key: 'ngoaiTru', label: 'Ngoại trú' },
                    { key: 'capCuu', label: 'Cấp cứu/daycare' },
                    { key: 'noiTru', label: 'Nội trú/ICU' },
                    { key: 'ngoaiVien', label: 'Ngoại viện' },
                    { key: 'clsCdha', label: 'CLS/CDHA' },
                    { key: 'thuocVacxin', label: 'Thuốc/vacxin' }
                  ].map((field) => (
                    <label key={field.key} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 cursor-pointer transition">
                      <input 
                        type="checkbox"
                        checked={systemSettings.totalFormulaFields[field.key] || false}
                        onChange={() => handleFormulaCheckboxChange(field.key)}
                        className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-700">{field.label}</span>
                    </label>
                  ))}
                </div>

                {/* Công thức tính duyệt giảm */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-amber-500 rounded-sm inline-block"></span>
                      Phương Thức Tính Số Tiền Duyệt Giảm
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleDiscountFormulaChange('only_total')}
                      className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                        systemSettings.discountFormulaType === 'only_total' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mt-0.5 ${
                        systemSettings.discountFormulaType === 'only_total' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                        {systemSettings.discountFormulaType === 'only_total' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>
                      <div>
                        <strong className="text-xs text-slate-800 block">Duyệt giảm trên tổng gốc</strong>
                        <span className="text-[10px] text-slate-400 block mt-1">Biểu thức: <code>Số tiền duyệt giảm = [Tổng cộng] × [% giảm]</code></span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDiscountFormulaChange('total_minus_insurance_advance')}
                      className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                        systemSettings.discountFormulaType === 'total_minus_insurance_advance' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mt-0.5 ${
                        systemSettings.discountFormulaType === 'total_minus_insurance_advance' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                        {systemSettings.discountFormulaType === 'total_minus_insurance_advance' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>
                      <div>
                        <strong className="text-xs text-slate-800 block">Khấu trừ bảo hiểm & tạm ứng trước khi giảm</strong>
                        <span className="text-[10px] text-slate-400 block mt-1">Biểu thức: <code>Số tiền duyệt giảm = ([Tổng cộng] - [BHYT/Tạm ứng]) × [% giảm]</code></span>
                      </div>
                    </button>
                  </div>
                </div>

              </div>

              {/* Bên phải: Chuyên khoa & Phân quyền nhân sự */}
              <div className="space-y-6">
                
                {/* Quản lý danh mục chuyên khoa */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Quản Lý Danh Mục Chuyên Khoa
                  </h3>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Thêm chuyên khoa mới..."
                      value={newSpecialtyInput}
                      onChange={(e) => setNewSpecialtyInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecialty}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {systemSettings.specialties.map((spec, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition">
                        <span className="text-xs font-bold text-slate-700">{spec}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(spec)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quản lý danh sách nhân sự */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                      Quản Trị Phân Quyền Nhân Sự {userRole !== 'admin' && '🔒'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {userRole === 'admin' 
                        ? 'Tạo mới, sửa đổi vai trò và phân bổ quyền truy cập hệ thống.' 
                        : 'Yêu cầu quyền T Admin mới được thao tác thêm/bớt nhân sự.'}
                    </p>
                  </div>

                  {userRole === 'admin' ? (
                    <form onSubmit={handleCreateStaff} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Họ tên nhân viên..." 
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold"
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Chức danh (VD: Lễ tân VIP)" 
                          value={newStaff.title}
                          onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="email" 
                          placeholder="Email đăng nhập..." 
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                          required
                        />
                        <input 
                          type="password" 
                          placeholder="Mật khẩu (mặc định 123456)" 
                          value={newStaff.pass}
                          onChange={(e) => setNewStaff({ ...newStaff, pass: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Chọn Vai Trò (Role) Theo image_ba8ec5.png</label>
                        <select 
                          value={newStaff.role}
                          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold"
                        >
                          <option value="nhanvien">nhanvien (Lễ tân VIP, Chăm sóc khách hàng)</option>
                          <option value="quanly">quanly (Lễ tân VIP, Chăm sóc khách hàng - Quản lý)</option>
                          <option value="lanhdao">lanhdao (HĐQT, Ban Giám Đốc)</option>
                          <option value="admin">admin (T Admin)</option>
                        </select>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1"
                      >
                        <UserPlus className="w-4 h-4" /> Đăng ký tài khoản nhân viên
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-xs text-yellow-800 font-semibold leading-relaxed">
                      🔒 Tài khoản của bạn giữ vai trò <strong className="text-amber-700 uppercase">lanhdao</strong>. Được cấu hình toàn bộ nghiệp vụ lâm sàng & tài chính nhưng **bị giới hạn quyền quản lý thông tin nhân sự** theo tài liệu image_ba8ec5.png.
                    </div>
                  )}

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {staffList.map((staff) => (
                      <div key={staff.uid} className="flex justify-between items-center p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                        <div>
                          <div className="text-xs font-bold text-slate-800">{staff.name}</div>
                          <div className="text-[9px] text-slate-400">{staff.email} | {staff.title}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-sm uppercase">
                            {staff.role}
                          </span>
                          {userRole === 'admin' && staff.uid !== "acc_admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteStaff(staff.uid)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded"
                              title="Thu hồi tài khoản"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="hidden md:block mt-12 py-8 bg-slate-100 text-center border-t border-t-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-400 space-y-1 font-semibold">
          <p className="text-slate-500">CÔNG CỤ NỘI BỘ - PHÒNG CSKH v2.3</p>
          <p>Phòng Chăm Sóc Khách Hàng © 2026.</p>
        </div>
      </footer>
    </div>
  );
}
