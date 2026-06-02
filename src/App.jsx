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
import { getMessaging, getToken } from 'firebase/messaging';
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
  Image as ImageIcon,
  Scan,
  Smartphone,
  Copy,
  History,
  ChevronLeft
} from 'lucide-react';

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
    console.error(e);
  }
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'cskh-ta';
let app, auth, db, messaging;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn(error);
}

const formatCurrency = (number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number || 0);
};

const formatDateVN = (dateStr) => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const mockStaffAccounts = [
  { uid: "acc_admin", email: "admin@vip.com", name: "Nguyễn Minh Trí", title: "IT Admin", role: "admin", pass: "CSKH@abc456" },
  { uid: "acc_lanhdao", email: "lanhdao@vip.com", name: "Trần Thế Phương", title: "Thành viên HĐQT", role: "lanhdao", pass: "CSKH@abc456" },
  { uid: "acc_quanly", email: "quanly@vip.com", name: "Lê Thu Thảo", title: "Quản Lý Chăm Sóc VIP", role: "quanly", pass: "CSKH@abc456" },
  { uid: "acc_qlsite_tsh", email: "qlsite_tsh@vip.com", name: "Trần Tuấn Kiệt", title: "Quản Lý Site Sơn Hòa", role: "quanly_site", pass: "CSKH@abc456" },
  { uid: "acc_qlsite_th", email: "qlsite_th@vip.com", name: "Lâm Thùy Dương", title: "Quản Lý Site Tân Hưng", role: "quanly_site", pass: "CSKH@abc456" },
  { uid: "acc_nhanvien", email: "nhanvien@vip.com", name: "Phạm Hoàng Nam", title: "Lễ Tân Phòng Khám VIP", role: "nhanvien", pass: "CSKH@abc456" }
];

const defaultSpecialties = [
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

const defaultSystemSettings = {
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
  discountFormulaType: 'total_minus_insurance_advance'
};

const workflowStatuses = [
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

const sites = [
  { id: 'tsh', label: 'BV Tâm Anh - Tân Sơn Hòa', bg: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500', cardBg: 'bg-[#f0f9ff] border-[#bae6fd] hover:border-[#7dd3fc]' },
  { id: 'th', label: 'PK Tâm Anh - Tân Hưng', bg: 'bg-violet-50 text-violet-700 border-violet-200/80', dot: 'bg-violet-500', cardBg: 'bg-[#faf5ff] border-[#e9d5ff] hover:border-[#d8b4fe]' },
  { id: 'ch', label: 'BV Tâm Anh - Chánh Hưng', bg: 'bg-teal-50 text-teal-700 border-teal-200/80', dot: 'bg-teal-500', cardBg: 'bg-[#f0fdf4] border-[#bbf7d0] hover:border-[#86efac]' }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('nhanvien');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [systemSettings, setSystemSettings] = useState(defaultSystemSettings);
  const [isLoading, setIsLoading] = useState(true);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, message: '', title: '' });
  const [copyConfirmModal, setCopyConfirmModal] = useState({ show: false, visitToCopy: null });
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const html5QrCodeRef = useRef(null);

  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'nhanvien', uid: '', title: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSite, setFilterSite] = useState('');

  const [calendarMode, setCalendarMode] = useState('list');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const [currentId, setCurrentId] = useState(null);
  const [formRightTab, setFormRightTab] = useState('billing');
  const [leftFormTab, setLeftFormTab] = useState('visitHistory');
  const [isHistoryPanelExpanded, setIsHistoryPanelExpanded] = useState(false);

  // States cho bộ lọc Thống kê Báo cáo ở Dashboard
  const [dashFilterMode, setDashFilterMode] = useState('today'); // 'today' hoặc 'range'
  const [dashStartDate, setDashStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dashEndDate, setDashEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    name: '',
    tier: 'VIP',
    boardApproval: '',
    notes: '',
    pid: '',
    date: new Date().toISOString().split('T')[0],
    specialties: [],
    site: 'BV Tâm Anh - Tân Sơn Hòa',
    examinationArea: 'Khu VIP',
    ngoaiTru: true,
    capCuu: false,
    noiTru: false,
    ngoaiVien: false,
    treatmentType: 'Ngoại trú',
    phiKham: 0,
    clsCdha: 0,
    thuocVacxin: 0,
    insuranceAdvance: 0,
    discountRate: 0,
    approvedDiscountAmount: 0,
    totalAmount: 0,
    approvalImages: [],
    status: 'Waiting',
    recipients: [],
    history: []
  });

  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');
  const [notification, setNotification] = useState(null);
  const [iosNotificationStatus, setIosNotificationStatus] = useState('unknown');

  const [notifications, setNotifications] = useState([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [activePushAlerts, setActivePushAlerts] = useState([]);
  const isInitialMount = useRef(true);
  const notificationCenterRef = useRef(null);

  const [specSearch, setSpecSearch] = useState('');
  const [isSpecDropdownOpen, setIsSpecDropdownOpen] = useState(false);
  const specRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const triggerPushAlert = (title, message, dataRecipients = [], type = 'info') => {
    const hasTargetedRecipients = Array.isArray(dataRecipients) && dataRecipients.length > 0;

    if (currentUser) {
      const isManagerOrAdmin = ['admin', 'lanhdao', 'quanly'].includes(currentUser?.role);
      const isAssigned = hasTargetedRecipients && dataRecipients.includes(currentUser?.uid);
      
      if (hasTargetedRecipients && !isManagerOrAdmin && !isAssigned) {
        return;
      }
    }

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

    if (Notification.permission === 'granted') {
      try {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body: message,
            icon: 'https://iili.io/F66acRs.png',
            badge: 'https://iili.io/F66acRs.png'
          });
        });
      } catch (e) {
        try {
          new Notification(title, { body: message, icon: 'https://iili.io/F66acRs.png' });
        } catch (err) {
          console.warn(err);
        }
      }
    }

    setTimeout(() => {
      setActivePushAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 6000);
  };

  const checkIosPermissionStatus = () => {
    if ('Notification' in window) {
      setIosNotificationStatus(Notification.permission);
    }
  };

  const saveFcmTokenToDatabase = async (userId) => {
    if (!db || !messaging) return;
    try {
      const token = await getToken(messaging, {
        vapidKey: "BFjwAUlwacxhmYk0TiQdDTDYJKgvy2ktOS7YjdobmZlTiwqDXuX7WOVSLpm-zZuyQIAcSuG3iAAqtNnkPtJAW_s"
      });
      if (token) {
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', userId);
        await updateDoc(userDocRef, { fcmToken: token }).catch(async (e) => {
          await setDoc(userDocRef, { fcmToken: token }, { merge: true }).catch(err => console.warn(err));
        });
      }
    } catch (err) {
      console.warn("Lỗi đồng bộ mã thông báo FCM thiết bị:", err);
    }
  };

  const requestIosNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showNotification("Thiết bị không hỗ trợ thông báo đẩy.", "error");
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }
      
      const permission = await Notification.requestPermission();
      setIosNotificationStatus(permission);
      
      if (permission === 'granted') {
        showNotification("Đã kích hoạt thành công thông báo!");
        if (currentUser && currentUser?.uid) {
          await saveFcmTokenToDatabase(currentUser?.uid);
        }
        triggerPushAlert("🟢 Đã bật thông báo", "Hệ thống sẵn sàng nhận dữ liệu thời gian thực.");
      } else {
        showNotification("Quyền thông báo bị từ chối.", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Không thể xin quyền. Hãy mở ứng dụng từ Màn hình chính.", "error");
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        setIsScanning(false);
        setScannerError('');
      }).catch(err => {
        console.error(err);
        setIsScanning(false);
        setScannerError('');
      });
    } else {
      setIsScanning(false);
      setScannerError('');
    }
  };

  const resetForm = () => {
    setCurrentId(null);
    setFormRightTab('billing');
    setIsHistoryPanelExpanded(false);
    setFormData({
      name: '',
      tier: 'VIP',
      boardApproval: '',
      notes: '',
      pid: '',
      date: new Date().toISOString().split('T')[0],
      specialties: [],
      site: 'BV Tâm Anh - Tân Sơn Hòa',
      examinationArea: 'Khu VIP',
      ngoaiTru: true,
      capCuu: false,
      noiTru: false,
      ngoaiVien: false,
      treatmentType: 'Ngoại trú',
      phiKham: 0,
      clsCdha: 0,
      thuocVacxin: 0,
      insuranceAdvance: 0,
      discountRate: 0,
      approvedDiscountAmount: 0,
      totalAmount: 0,
      approvalImages: [],
      status: 'Waiting',
      recipients: [],
      history: []
    });
  };

  const handleLogout = async () => {
    if (isFirebaseConnected && auth && currentUser) {
      try {
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser?.uid);
        await updateDoc(userDocRef, { fcmToken: null }).catch(e => console.warn(e));
      } catch (err) {
        console.warn(err);
      }
      signOut(auth).catch(e => console.warn(e));
    }
    setCurrentUser(null);
    setUserRole('nhanvien');
    localStorage.removeItem('crm_current_user');
    showNotification("Đăng xuất thành công. Đã khóa phiên làm việc.");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError("Email và mật khẩu không được bỏ trống.");
      return;
    }

    const localAccount = staffList.find(
      (acc) => acc?.email?.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (isFirebaseConnected && auth) {
      signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          let userData = {
            uid: user.uid,
            email: user.email,
            role: 'nhanvien',
            name: user.email ? user.email.split('@')[0] : 'Nhân viên',
            title: 'Nhân viên chuyên ban'
          };
          if (userDoc.exists()) {
            userData = userDoc.data();
          }
          setCurrentUser(userData);
          setUserRole(userData?.role || 'nhanvien');
          localStorage.setItem('crm_current_user', JSON.stringify(userData));
          setAuthError('');
          showNotification(`Đăng nhập thành công! Chào ${userData?.name}`);
        })
        .catch((error) => {
          if (localAccount && localAccount.pass === loginPassword) {
            setCurrentUser(localAccount);
            setUserRole(localAccount?.role || 'nhanvien');
            localStorage.setItem('crm_current_user', JSON.stringify(localAccount));
            setAuthError('');
            showNotification(`Đăng nhập (Chế độ Dự Phòng): Chào ${localAccount?.name}`);
            return;
          }
          console.error(error);
          setAuthError("Sai thông tin tài khoản hoặc mật khẩu.");
        });
    } else {
      if (localAccount && localAccount.pass === loginPassword) {
        setCurrentUser(localAccount);
        setUserRole(localAccount?.role || 'nhanvien');
        localStorage.setItem('crm_current_user', JSON.stringify(localAccount));
        setAuthError('');
        showNotification(`Đăng nhập ngoại tuyến thành công: Chào ${localAccount?.name}`);
      } else {
        setAuthError("Sai thông tin tài khoản hoặc hệ thống offline.");
      }
    }
  };

  useEffect(() => {
    function handleClickOutsideSpec(event) {
      if (specRef.current && !specRef.current.contains(event.target)) {
        setIsSpecDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSpec);
    return () => document.removeEventListener("mousedown", handleClickOutsideSpec);
  }, []);

  const filteredSpecialties = useMemo(() => {
    return (systemSettings?.specialties || []).filter(s =>
      s?.toLowerCase().includes(specSearch.toLowerCase())
    );
  }, [systemSettings?.specialties, specSearch]);

  const handleTreatmentTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      treatmentType: value,
      ngoaiTru: value === 'Ngoại trú',
      capCuu: value === 'Cấp cứu/Daycare',
      noiTru: value === 'Nội trú/ICU',
      ngoaiVien: value === 'Ngoài viện'
    }));
  };

  useEffect(() => {
    let html5QrCode;
    if (isScanning) {
      const startCamera = async () => {
        if (typeof window.Html5Qrcode === 'undefined') {
          await new Promise(resolve => setTimeout(resolve, 800));
          if (typeof window.Html5Qrcode === 'undefined') {
            setScannerError("Chưa tải xong thư viện quét mã. Vui lòng thử lại.");
            return;
          }
        }

        try {
          html5QrCode = new window.Html5Qrcode("reader");
          html5QrCodeRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 15,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.75;
                return { width: size, height: size };
              }
            },
            (decodedText) => {
              handleInputChange('pid', decodedText);
              showNotification("Đã quét thành công mã: " + decodedText);
              stopScanner();
            },
            (errorMessage) => {
            }
          );
        } catch (err) {
          console.error(err);
          setScannerError("Không thể truy cập camera. Vui lòng cấp quyền camera trong cài đặt trình duyệt.");
        }
      };
      
      startCamera();
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        }).catch(e => console.warn(e));
      }
    };
  }, [isScanning]);

  useEffect(() => {
    checkIosPermissionStatus();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log("Firebase SW registered context scope:", registration.scope);
        })
        .catch((err) => {
          console.warn("Lỗi đăng ký Firebase Service Worker:", err);
        });
    }

    if (!document.getElementById('html5-qrcode-script')) {
      const script = document.createElement('script');
      script.id = 'html5-qrcode-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    function handleClickOutside(event) {
      if (notificationCenterRef.current && !notificationCenterRef.current.contains(event.target)) {
        setShowNotificationCenter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser) {
          setCurrentUser(parsedUser);
          setUserRole(parsedUser?.role || 'nhanvien');
        }
      } catch (err) {
        console.error("Error parsing local user:", err);
      }
    }

    if (auth && db && isFirebaseConfigured) {
      setIsFirebaseConnected(true);
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setCurrentUser(userData);
              setUserRole(userData?.role || 'nhanvien');
              saveFcmTokenToDatabase(firebaseUser.uid).catch(e => console.warn(e));
            } else {
              const fallbackUser = { 
                uid: firebaseUser.uid, 
                email: firebaseUser.email, 
                role: 'nhanvien', 
                name: firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Nhân viên',
                title: 'Nhân viên chuyên ban'
              };
              setCurrentUser(fallbackUser);
              setUserRole('nhanvien');
            }
          } catch (e) {
            console.error(e);
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

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);

    if (isFirebaseConnected && db) {
      const patientsCol = collection(db, 'artifacts', appId, 'public', 'data', 'patients');
      const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
      const usersCol = collection(db, 'artifacts', appId, 'public', 'data', 'users');

      const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setSystemSettings(docSnap.data());
        } else {
          setDoc(settingsDocRef, systemSettings).catch(e => console.warn(e));
        }
      }, (err) => console.error(err));

      const unsubscribeUsers = onSnapshot(usersCol, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ uid: docSnap.id, ...docSnap.data() });
        });
        setStaffList(list);
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
            const statusLabel = workflowStatuses.find(s => s.id === data.status)?.label || data.status;
            if (change.type === "added") {
              triggerPushAlert(
                `🆕 Tiếp nhận khách ${data?.tier || 'VIP'}`,
                `Bệnh nhân: ${data?.name || 'Chưa rõ'} (PID: ${data?.pid || '---'}) đã được xếp trạng thái: ${statusLabel}.`,
                data?.recipients || [],
                'info'
              );
            }
            if (change.type === "modified") {
              triggerPushAlert(
                `🔄 Cập nhật hành trình`,
                `Hồ sơ khách hàng ${data?.name || 'Chưa rõ'} (PID: ${data?.pid || '---'}) vừa đổi trạng thái sang: ${statusLabel}.`,
                data?.recipients || [],
                'success'
              );
            }
            if (change.type === "removed") {
              triggerPushAlert(
                `⚠️ Gỡ bỏ hồ sơ`,
                `Hồ sơ của một bệnh nhân VIP vừa bị gỡ khỏi hệ thống.`,
                data?.recipients || [],
                'error'
              );
            }
          });
        }

        setPatients(list);
        setIsLoading(false);
      }, (error) => {
        console.warn(error);
        const savedPatients = localStorage.getItem('local_patients');
        if (savedPatients) {
          setPatients(JSON.parse(savedPatients));
        }
        setIsLoading(false);
      });

      return () => {
        unsubscribeSettings();
        unsubscribeUsers();
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
    if (formData?.tier === 'VIP') {
      return { totalAmount: 0, approvedDiscountAmount: 0 };
    }
    const formulas = systemSettings?.totalFormulaFields || {};
    let total = 0;

    if (formulas.phiKham) total += Number(formData?.phiKham || 0);
    if (formulas.clsCdha) total += Number(formData?.clsCdha || 0);
    if (formulas.thuocVacxin) total += Number(formData?.thuocVacxin || 0);

    let discountBase = total;
    if (systemSettings?.discountFormulaType === 'total_minus_insurance_advance') {
      discountBase = Math.max(0, total - Number(formData?.insuranceAdvance || 0));
    }

    const discountAmount = Math.round(discountBase * (Number(formData?.discountRate || 0) / 100));

    return {
      totalAmount: total,
      approvedDiscountAmount: discountAmount
    };
  }, [formData, systemSettings]);

  useEffect(() => {
    if (formData?.totalAmount !== calculatedSums.totalAmount || formData?.approvedDiscountAmount !== calculatedSums.approvedDiscountAmount) {
      setFormData(prev => ({
        ...prev,
        totalAmount: calculatedSums.totalAmount,
        approvedDiscountAmount: calculatedSums.approvedDiscountAmount
      }));
    }
  }, [calculatedSums.totalAmount, calculatedSums.approvedDiscountAmount]);

  const matchedPatientProfile = useMemo(() => {
    if (!formData?.pid?.trim()) return null;
    return patients.find(p => p?.pid?.trim().toLowerCase() === formData?.pid?.trim().toLowerCase());
  }, [formData?.pid, patients]);

  const patientVisitHistory = useMemo(() => {
    if (!formData?.pid?.trim()) return [];
    return patients.filter(p => p?.pid?.trim().toLowerCase() === formData?.pid?.trim().toLowerCase() && p.id !== currentId);
  }, [formData?.pid, patients, currentId]);

  useEffect(() => {
    if (patientVisitHistory.length > 0) {
      setLeftFormTab('visitHistory');
    } else {
      setLeftFormTab('timeline');
    }
  }, [patientVisitHistory.length]);

  useEffect(() => {
    if (matchedPatientProfile && !currentId) {
      setFormData(prev => {
        if (prev?.name !== matchedPatientProfile?.name) {
          return { ...prev, name: matchedPatientProfile?.name || '' };
        }
        return prev;
      });
    }
  }, [matchedPatientProfile, currentId]);

  const handleInputChange = (field, val) => {
    if (field === 'discountRate' && userRole === 'nhanvien') {
      showNotification("Tài khoản nhân viên không có quyền duyệt chiết khấu!", "error");
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
      const exists = prev?.specialties?.includes(spec);
      if (exists) {
        return { ...prev, specialties: prev?.specialties?.filter(s => s !== spec) };
      } else {
        return { ...prev, specialties: [...(prev?.specialties || []), spec] };
      }
    });
  };

  const handleMultipleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const readers = files.map(file => {
      return new Promise((resolve) => {
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
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImages) => {
      setFormData(prev => ({
        ...prev,
        approvalImages: [...(prev?.approvalImages || []), ...newImages]
      }));
      showNotification("Đã thêm các ảnh phê duyệt thành công!");
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const isFutureOrPreArrival = (patient) => {
    if (!patient) return false;
    const isPreArrivalStatus = ['Scheduled', 'Preparing', 'ReceivedInfo'].includes(patient?.status);
    const isFutureDate = patient?.date > todayStr;
    return isPreArrivalStatus || isFutureDate;
  };

  const isUserAssignedToPatient = (patient) => {
    if (!currentUser || !patient) return false;
    if (Array.isArray(patient?.recipients) && patient?.recipients.includes(currentUser?.uid)) {
      return true;
    }
    return false;
  };

  const visiblePatients = useMemo(() => {
    return patients.filter(p => {
      if (!p) return false;
      if (currentUser && ['nhanvien', 'quanly_site'].includes(currentUser?.role)) {
        if (isFutureOrPreArrival(p)) {
          return isUserAssignedToPatient(p);
        }
      }
      return true;
    });
  }, [patients, currentUser]);

  const filteredPatients = useMemo(() => {
    return visiblePatients.filter(p => {
      if (!p) return false;
      const matchSearch =
        p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p?.pid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p?.boardApproval?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p?.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSpecialty = !filterSpecialty || p?.specialties?.includes(filterSpecialty);
      const matchTier = !filterTier || p?.tier === filterTier;
      const matchDate = !filterDate || p?.date === filterDate;
      const matchSite = !filterSite || p?.site === filterSite;

      return matchSearch && matchSpecialty && matchTier && matchDate && matchSite;
    });
  }, [visiblePatients, searchTerm, filterSpecialty, filterTier, filterDate, filterSite]);

  const dashMetrics = useMemo(() => {
    const filtered = visiblePatients.filter(p => {
      if (!p) return false;
      if (dashFilterMode === 'today') {
        return p?.date === todayStr;
      } else {
        return p?.date >= dashStartDate && p?.date <= dashEndDate;
      }
    });

    let totalPatients = filtered.length;
    let vipCount = filtered.filter(p => p?.tier === 'VIP').length;
    let vvipCount = filtered.filter(p => p?.tier === 'VVIP').length;
    let totalRevenue = filtered.reduce((sum, p) => sum + (p?.totalAmount || 0), 0);
    let totalDiscount = filtered.reduce((sum, p) => sum + (p?.approvedDiscountAmount || 0), 0);
    let totalCollected = filtered.reduce((sum, p) => sum + Math.max(0, (p?.totalAmount || 0) - (p?.approvedDiscountAmount || 0)), 0);

    return { totalPatients, vipCount, vvipCount, totalRevenue, totalDiscount, totalCollected };
  }, [visiblePatients, dashFilterMode, dashStartDate, dashEndDate, todayStr]);

  const metrics = useMemo(() => {
    let totalPatients = filteredPatients.length;
    let vipCount = filteredPatients.filter(p => p?.tier === 'VIP').length;
    let vvipCount = filteredPatients.filter(p => p?.tier === 'VVIP').length;
    let totalRevenue = filteredPatients.reduce((sum, p) => sum + (p?.totalAmount || 0), 0);
    let totalDiscount = filteredPatients.reduce((sum, p) => sum + (p?.approvedDiscountAmount || 0), 0);
    let totalCollected = filteredPatients.reduce((sum, p) => sum + Math.max(0, (p?.totalAmount || 0) - (p?.approvedDiscountAmount || 0)), 0);

    return { totalPatients, vipCount, vvipCount, totalRevenue, totalDiscount, totalCollected };
  }, [filteredPatients]);

  const kanbanPatients = useMemo(() => {
    return visiblePatients.filter(p => {
      if (!p) return false;
      const isToday = p?.date === todayStr;
      const isNotCompleted = p?.status !== 'Completed';
      const matchDate = !filterDate ? (isToday || isNotCompleted) : p?.date === filterDate;
      const matchSite = !filterSite || p?.site === filterSite;
      return matchDate && matchSite;
    });
  }, [visiblePatients, filterDate, filterSite, todayStr]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentCalendarDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [currentCalendarDate]);

  const monthDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < adjustedFirstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentCalendarDate]);

  const briefingStats = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const tomorrowPatients = visiblePatients.filter(p => p && p?.date === tomorrowStr);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 8);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

    const nextWeekPatients = visiblePatients.filter(p => p && p?.date > tomorrowStr && p?.date <= sevenDaysStr);

    return {
      tomorrowPatients,
      nextWeekCount: nextWeekPatients.length,
      tomorrowDateFormatted: tomorrow.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
    };
  }, [visiblePatients]);

  const savePatient = async (e) => {
    e.preventDefault();
    if (!formData?.name?.trim()) {
      showNotification("Họ & Tên khách hàng không được để trống!", "error");
      return;
    }
    if (!formData?.pid?.trim()) {
      showNotification("Mã PID là bắt buộc!", "error");
      return;
    }

    const currentHistory = formData?.history || [];
    let newLog = {};
    if (currentId) {
      newLog = {
        timestamp: new Date().toISOString(),
        action: "Cập nhật thông tin hồ sơ",
        user: currentUser?.name || 'Hệ thống'
      };
    } else {
      newLog = {
        timestamp: new Date().toISOString(),
        action: "Tiếp đón khởi tạo hành trình",
        user: currentUser?.name || 'Hệ thống'
      };
    }

    let payload = {
      ...formData,
      status: formData?.status || 'Waiting',
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Hệ thống',
      history: [...currentHistory, newLog]
    };

    if (formData?.tier === 'VIP') {
      payload = {
        ...payload,
        phiKham: 0,
        clsCdha: 0,
        thuocVacxin: 0,
        insuranceAdvance: 0,
        discountRate: 0,
        approvedDiscountAmount: 0,
        totalAmount: 0
      };
    }

    const firstImg = payload.approvalImages && payload.approvalImages.length > 0 ? payload.approvalImages[0] : '';
    payload.approvalImage = firstImg;

    try {
      if (isFirebaseConnected && db) {
        const patientsCol = collection(db, 'artifacts', appId, 'public', 'data', 'patients');
        if (currentId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'patients', currentId), payload);
          showNotification("Cập nhật thành công!");
        } else {
          await addDoc(patientsCol, { ...payload, createdAt: new Date().toISOString() });
          showNotification("Đăng ký thành công!");
        }
      } else {
        let updatedList = [...patients];
        if (currentId) {
          updatedList = updatedList.map(p => p.id === currentId ? { ...p, ...payload } : p);
          showNotification("Cập nhật thành công!");
        } else {
          const newDoc = { id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
          updatedList.unshift(newDoc);
          showNotification("Đã lưu hồ sơ thành công!");
        }
        setPatients(updatedList);
        localStorage.setItem('local_patients', JSON.stringify(updatedList));
      }
      resetForm();
      setActiveTab('monitoring');
    } catch (err) {
      console.warn(err);
      let updatedList = [...patients];
      if (currentId) {
        updatedList = updatedList.map(p => p.id === currentId ? { ...p, ...payload } : p);
        showNotification("Đã lưu cập nhật vào thiết bị (Chế độ Dự Phòng)!");
      } else {
        const newDoc = { id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
        updatedList.unshift(newDoc);
        showNotification("Đã lưu hồ sơ mới vào thiết bị (Chế độ Dự Phòng)!");
      }
      setPatients(updatedList);
      localStorage.setItem('local_patients', JSON.stringify(updatedList));
      resetForm();
      setActiveTab('monitoring');
    }
  };

  const handleLoginSubmit = (e) => {
    handleLogin(e);
  };

  const initiateEdit = (patient) => {
    if (!patient) return;
    setCurrentId(patient.id);
    setFormRightTab(patient.tier === 'VIP' ? 'timeline' : 'billing');
    setIsHistoryPanelExpanded(false);
    let initTreatmentType = 'Ngoại trú';
    if (patient.capCuu) initTreatmentType = 'Cấp cứu/Daycare';
    else if (patient.noiTru) initTreatmentType = 'Nội trú/ICU';
    else if (patient.ngoaiVien) initTreatmentType = 'Ngoài viện';
    else if (patient.treatmentType) initTreatmentType = patient.treatmentType;

    setFormData({
      name: patient?.name || '',
      tier: patient?.tier || 'VIP',
      boardApproval: patient?.boardApproval || '',
      notes: patient?.notes || '',
      pid: patient?.pid || '',
      date: patient?.date || new Date().toISOString().split('T')[0],
      specialties: patient?.specialties || [],
      site: patient?.site || 'BV Tâm Anh - Tân Sơn Hòa',
      examinationArea: patient?.examinationArea || 'Khu VIP',
      ngoaiTru: patient?.ngoaiTru !== undefined ? patient?.ngoaiTru : (initTreatmentType === 'Ngoại trú'),
      capCuu: patient?.capCuu !== undefined ? patient?.capCuu : (initTreatmentType === 'Cấp cứu/Daycare'),
      noiTru: patient?.noiTru !== undefined ? patient?.noiTru : (initTreatmentType === 'Nội trú/ICU'),
      ngoaiVien: patient?.ngoaiVien !== undefined ? patient?.ngoaiVien : (initTreatmentType === 'Ngoài viện'),
      treatmentType: initTreatmentType,
      phiKham: patient?.phiKham || 0,
      clsCdha: patient?.clsCdha || 0,
      thuocVacxin: patient?.thuocVacxin || 0,
      insuranceAdvance: patient?.insuranceAdvance || 0,
      discountRate: patient?.discountRate || 0,
      approvedDiscountAmount: patient?.approvedDiscountAmount || 0,
      totalAmount: patient?.totalAmount || 0,
      approvalImages: patient?.approvalImages || (patient?.approvalImage ? [patient?.approvalImage] : []),
      status: patient?.status || 'Waiting',
      recipients: patient?.recipients || [],
      history: patient?.history || []
    });
    setActiveTab('register');
  };

  const handleUpdateStatus = async (patientId, newStatus) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    if (userRole === 'nhanvien') {
      const currentStatus = patient?.status || 'Waiting';
      const isAllowed = 
        (currentStatus === 'Waiting' && newStatus === 'Examining') || 
        (currentStatus === 'Pharmacy' && newStatus === 'Completed');

      if (!isAllowed) {
        showNotification("Lỗi: Tài khoản nhân viên chỉ được phép chuyển trạng thái theo đúng luồng bàn giao quy định!", "error");
        return;
      }
    }

    const statusLabel = workflowStatuses.find(s => s.id === newStatus)?.label || newStatus;
    const currentHistory = patient?.history || [];
    const newLog = {
      timestamp: new Date().toISOString(),
      action: "Chuyển trạng thái hành trình sang: " + statusLabel,
      user: currentUser?.name || 'Hệ thống'
    };
    const updatedHistory = [...currentHistory, newLog];

    try {
      if (isFirebaseConnected && db) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'patients', patientId);
        await updateDoc(docRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.name || 'Hệ thống',
          history: updatedHistory
        });
      } else {
        const updatedList = patients.map(p => {
          if (p.id === patientId) {
            return { 
              ...p, 
              status: newStatus, 
              updatedAt: new Date().toISOString(), 
              updatedBy: currentUser?.name || 'Hệ thống',
              history: updatedHistory
            };
          }
          return p;
        });
        setPatients(updatedList);
        localStorage.setItem('local_patients', JSON.stringify(updatedList));
        triggerPushAlert("🔄 Cập nhật hành trình (Cục bộ)", `Khách hàng ${patient?.name || 'VIP'} đã được cập nhật trạng thái mới.`, patient?.recipients || [], "success");
      }
      showNotification("Đã cập nhật trạng thái hành trình khám!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi đồng bộ trạng thái lên database!", "error");
    }
  };

  const executeCopyVisit = (visit) => {
    if (!visit) return;
    const previousImages = visit?.approvalImages || (visit?.approvalImage ? [visit?.approvalImage] : []);
    setFormData(prev => ({
      ...prev,
      specialties: visit?.specialties || [],
      site: visit?.site || 'BV Tâm Anh - Tân Sơn Hòa',
      examinationArea: visit?.examinationArea || 'Khu VIP',
      boardApproval: visit?.boardApproval || '',
      notes: visit?.notes || '',
      treatmentType: visit?.treatmentType || 'Ngoại trú',
      ngoaiTru: visit?.ngoaiTru !== undefined ? visit?.ngoaiTru : (visit?.treatmentType === 'Ngoại trú'),
      capCuu: visit?.capCuu !== undefined ? visit?.capCuu : (visit?.treatmentType === 'Cấp cứu/Daycare'),
      noiTru: visit?.noiTru !== undefined ? visit?.noiTru : (visit?.treatmentType === 'Nội trú/ICU'),
      ngoaiVien: visit?.ngoaiVien !== undefined ? visit?.ngoaiVien : (visit?.treatmentType === 'Ngoài viện'),
      approvalImages: previousImages,
      recipients: visit?.recipients || []
    }));
    showNotification("Đã sao chép lịch sử thăm khám cũ kèm chứng từ phê duyệt!");
    setCopyConfirmModal({ show: false, visitToCopy: null });
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      showNotification("Chỉ IT Admin mới được phép thao tác!", "error");
      return;
    }
    if (!newStaff?.name?.trim() || !newStaff?.email?.trim() || !newStaff?.uid?.trim()) {
      showNotification("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    const created = {
      uid: newStaff?.uid?.trim(),
      name: newStaff?.name?.trim(),
      email: newStaff?.email?.trim(),
      role: newStaff?.role || 'nhanvien',
      title: newStaff?.title?.trim() || 'Nhân viên chuyên ban'
    };

    if (isFirebaseConnected && db) {
      try {
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', created.uid);
        await setDoc(userDocRef, created);
        showNotification("Đã đăng ký và đẩy phân quyền lên Firebase Cloud!");
      } catch (err) {
        console.error(err);
        showNotification("Lỗi đồng bộ phân quyền lên Firebase Cloud!", "error");
      }
    } else {
      const updatedList = [...staffList, created];
      setStaffList(updatedList);
      localStorage.setItem('crm_staff_accounts', JSON.stringify(updatedList));
      showNotification("Đã lưu tài khoản nhân viên cục bộ!");
    }

    setNewStaff({ name: '', email: '', role: 'nhanvien', uid: '', title: '' });
  };

  const handleDeleteStaff = (uid) => {
    if (uid === currentUser?.uid || uid === "acc_admin") {
      showNotification("Không thể tự xóa tài khoản chính đang hoạt động!", "error");
      return;
    }

    setConfirmModal({
      show: true,
      title: "Xác nhận gỡ bỏ tài khoản",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn quyền truy cập của tài khoản này khỏi hệ thống database không?",
      action: async () => {
        try {
          if (isFirebaseConnected && db) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', uid));
            showNotification("Đã xóa quyền tài khoản khỏi Firebase Cloud!");
          } else {
            const updated = staffList.filter(s => s.uid !== uid);
            setStaffList(updated);
            localStorage.setItem('crm_staff_accounts', JSON.stringify(updated));
            showNotification("Đã xóa quyền tài khoản cục bộ!");
          }
        } catch (err) {
          console.error(err);
          showNotification("Gặp sự cố khi gỡ bỏ tài khoản!", "error");
        }
        setConfirmModal({ show: false, action: null, message: '', title: '' });
      }
    });
  };

  const saveSettingsOnDb = async (newSettings) => {
    setSystemSettings(newSettings);
    if (isFirebaseConnected && db) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), newSettings);
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('local_settings', JSON.stringify(newSettings));
    }
  };

  const handleAddSpecialty = () => {
    if (!newSpecialtyInput.trim()) return;

    const inputParts = newSpecialtyInput.split(',').map(p => p.trim()).filter(p => p !== '');
    let addedCount = 0;
    let updatedSpecialties = [...(systemSettings?.specialties || [])];

    inputParts.forEach(spec => {
      if (!updatedSpecialties.includes(spec)) {
        updatedSpecialties.push(spec);
        addedCount++;
      }
    });

    if (addedCount === 0) {
      showNotification("Các chuyên khoa đã tồn tại!", "error");
      return;
    }

    saveSettingsOnDb({ ...systemSettings, specialties: updatedSpecialties });
    setNewSpecialtyInput('');
    showNotification(`Đã thêm mới ${addedCount} chuyên khoa!`);
  };

  const handleRemoveSpecialty = (spec) => {
    const updated = (systemSettings?.specialties || []).filter(s => s !== spec);
    saveSettingsOnDb({ ...systemSettings, specialties: updated });
    showNotification("Đã gỡ bỏ chuyên khoa.");
  };

  const handleFormulaCheckboxChange = (field) => {
    const updatedFormula = {
      ...(systemSettings?.totalFormulaFields || {}),
      [field]: !systemSettings?.totalFormulaFields?.[field]
    };
    saveSettingsOnDb({ ...systemSettings, totalFormulaFields: updatedFormula });
    showNotification("Công thức tổng cộng đã được cập nhật!");
  };

  const handleDiscountFormulaChange = (type) => {
    saveSettingsOnDb({ ...systemSettings, discountFormulaType: type });
    showNotification("Phương thức tính miễn giảm đã thay đổi!");
  };

  const handleToggleRecipient = (uid) => {
    setFormData(prev => {
      const exist = prev?.recipients || [];
      const updated = exist.includes(uid) ? exist.filter(id => id !== uid) : [...exist, uid];
      return { ...prev, recipients: updated };
    });
  };

  const registrableStaffList = useMemo(() => {
    return staffList.filter(s => s && ['nhanvien', 'quanly_site'].includes(s?.role));
  }, [staffList]);

  const handleCalendarNavigate = (direction) => {
    const nextDate = new Date(currentCalendarDate);
    if (calendarMode === 'week') {
      nextDate.setDate(nextDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarMode === 'month') {
      nextDate.setMonth(nextDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentCalendarDate(nextDate);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-[#1e293b] to-indigo-950 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden text-slate-100">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl translate-x-12 translate-y-12"></div>

        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-white p-2.5 shadow-sm border border-slate-800 mx-auto">
              <img 
                src="https://iili.io/F66acRs.png" 
                alt="Hospital Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                QL KH VIP-VVIP
              </h1>
              <p className="text-xs text-amber-500 font-bold tracking-wide uppercase">Phòng Chăm Sóc Khách Hàng</p>
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-450 text-center font-bold flex items-center gap-1.5 justify-center">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-500" />
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email </label>
              <input 
                type="email" 
                placeholder="nhập email tại đây"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-hidden text-white font-medium shadow-inner"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mật khẩu</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-hidden text-white font-medium shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => { setShowPassword(!showPassword); }}
                  className="absolute right-3 top-3.5 text-slate-550 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-amber-950/10 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Xác thực tài khoản
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-20 md:pb-12 relative">
      
      {lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button 
              onClick={() => { setLightboxImages([]); }}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(prev => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
                }}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            <img 
              src={lightboxImages[lightboxIndex]} 
              alt="Chứng từ văn bản phê duyệt" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-scaleIn"
            />

            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
          <p className="text-white/60 text-xs font-semibold mt-4">
            Ảnh {lightboxIndex + 1} / {lightboxImages.length}
          </p>
        </div>
      )}

      {copyConfirmModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-2.5 text-amber-500">
              <Copy className="w-5 h-5 flex-shrink-0 text-amber-500" />
              <h3 className="text-base font-extrabold text-white">Xác nhận sao chép lịch sử</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Hệ thống sẽ tự động điền sẵn các thông tin cũ (gồm Chuyên khoa, Site khám, Khu vực khám, Chỉ đạo phê duyệt, Ghi chú và chứng từ đính kèm) của lượt thăm khám trước vào biểu mẫu hiện tại để bạn có thể xem lại hoặc chỉnh sửa trước khi đăng ký lượt tiếp đón mới. Bạn có chắc chắn muốn thực hiện không?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => { setCopyConfirmModal({ show: false, visitToCopy: null }); }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => { executeCopyVisit(copyConfirmModal.visitToCopy); }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-slate-950 rounded-xl transition shadow-xs"
              >
                Xác nhận sao chép
              </button>
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <style>{`
            #reader video {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              border-radius: 1rem;
            }
            #reader {
              border: none !important;
            }
          `}</style>
          <div className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border border-slate-800 shadow-2xl animate-scaleIn">
            <div>
              <h4 className="text-sm font-black text-amber-500 uppercase tracking-wide flex items-center justify-center gap-1.5">
                <Scan className="w-4 h-4 text-amber-500 animate-pulse" /> Trình quét mã camera
              </h4>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {scannerError ? "Lỗi truy cập thiết bị" : "Đặt mã vạch hoặc mã QR của bệnh nhân vào giữa khung hình"}
              </p>
            </div>

            {scannerError ? (
              <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-2xl text-[11px] text-rose-300 font-semibold space-y-2">
                <p>{scannerError}</p>
                <button 
                  type="button"
                  onClick={() => {
                    setScannerError('');
                    setIsScanning(false);
                    setTimeout(() => { setIsScanning(true); }, 200);
                  }}
                  className="px-3 py-1 bg-rose-650 text-white rounded-lg font-bold"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                <div id="reader" className="absolute inset-0 w-full h-full"></div>
                
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-4 border-l-4 border-amber-500 rounded-tl-xs"></div>
                    <div className="w-4 h-4 border-t-4 border-r-4 border-amber-500 rounded-tr-xs"></div>
                  </div>
                  <div className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" style={{ top: '45%' }}></div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-4 border-l-4 border-amber-500 rounded-bl-xs"></div>
                    <div className="w-4 h-4 border-b-4 border-r-4 border-amber-500 rounded-tr-xs"></div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={stopScanner}
              className="px-4 py-1.5 border border-slate-850 text-slate-300 hover:bg-slate-800 text-[11px] font-bold rounded-xl transition w-full"
            >
              Hủy bỏ quét
            </button>
          </div>
        </div>
      )}

      {/* Thông báo góc trên */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 pointer-events-none space-y-2 max-w-sm ml-auto">
        {activePushAlerts.map(alert => (
          <div 
            key={alert.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex gap-3 items-start transition-all transform duration-300 bg-slate-900/95 ${
              alert.type === 'success' ? 'border-emerald-500/30' :
              alert.type === 'error' ? 'border-rose-500/30' : 'border-amber-500/30'
            }`}
          >
            <div className={`p-1.5 rounded-lg text-slate-950 ${
              alert.type === 'success' ? 'bg-emerald-500' :
              alert.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'
            }`}>
              <BellRing className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-extrabold text-white">{alert.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 font-medium leading-relaxed">{alert.message}</p>
            </div>
            <button 
              onClick={() => { setActivePushAlerts(prev => prev.filter(a => a.id !== alert.id)); }}
              className="text-slate-400 hover:text-slate-100 p-0.5 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {confirmModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-500">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <h3 className="text-base font-extrabold text-white">{confirmModal.title || "Xác nhận tác vụ"}</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">{confirmModal.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => { setConfirmModal({ show: false, action: null, message: '', title: '' }); }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmModal.action}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-750 text-xs font-bold text-white rounded-xl transition shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl transition-all transform duration-300 translate-y-0 bg-slate-900 border border-slate-800 text-white">
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span className="font-bold text-xs">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-850 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 bg-white p-1">
                <img 
                  src="https://iili.io/F66acRs.png" 
                  alt="Hospital Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 uppercase">
                  QL KH VIP-VVIP
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    {userRole}
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Phòng Chăm Sóc Khách Hàng</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => { resetForm(); setActiveTab('dashboard'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Bảng điều khiển
              </button>
              
              <button 
                onClick={() => { resetForm(); setActiveTab('register'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'register' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Plus className="w-4 h-4" /> Tiếp nhận hồ sơ
              </button>

              <button 
                onClick={() => { resetForm(); setActiveTab('monitoring'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'monitoring' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ClipboardList className="w-4 h-4" /> Theo dõi hồ sơ
              </button>

              {(userRole === 'admin' || userRole === 'lanhdao' || userRole === 'quanly') && (
                <button 
                  onClick={() => { setActiveTab('settings'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" /> Cấu hình hệ thống
                </button>
              )}
            </nav>

            <div className="flex items-center gap-3 relative" ref={notificationCenterRef}>
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`}></span>
                {isFirebaseConnected ? 'Live Connection' : 'Local Offline'}
              </div>

              <button 
                onClick={() => { setShowNotificationCenter(!showNotificationCenter); }}
                className={`p-2 rounded-xl transition-all relative border ${
                  showNotificationCenter ? 'bg-slate-800 border-amber-500 text-amber-500' : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationCenter && (
                <div className="absolute right-0 top-12 w-80 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-scaleIn text-slate-105">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Trung tâm thông báo</h4>
                    <div className="flex gap-2">
                      <button onClick={markAllAsRead} className="text-[10px] text-amber-500 font-bold hover:underline">Đọc hết</button>
                      <span className="text-slate-600">|</span>
                      <button onClick={clearAllNotifications} className="text-[10px] text-slate-400 font-bold hover:underline">Xóa hết</button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 space-y-1">
                        <Bell className="w-8 h-8 mx-auto stroke-1 text-slate-600" />
                        <p className="text-[11px] font-semibold">Không có thông báo mới nào</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-xl border text-[11px] transition-all relative ${n.read ? 'border-slate-800 bg-slate-950/50' : 'border-indigo-900/30 bg-indigo-950/10'}`}>
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-extrabold text-white leading-tight block">{n.title}</span>
                            <span className="text-[9px] text-slate-450 font-bold flex-shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-300 mt-1 font-semibold leading-relaxed">{n.message}</p>
                          {!n.read && (
                            <button 
                              onClick={() => { setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item)); }}
                              className="absolute top-1.5 right-1.5 text-amber-500 hover:text-amber-400"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <button 
                onClick={handleLogout}
                className="p-2 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-900/50 hover:text-rose-500 rounded-xl transition-all"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Bộ lọc Thống kê Báo cáo */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-500" /> Báo cáo thống kê tổng hợp
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">Tự động tổng hợp và cập nhật dữ liệu tiếp đón thời gian thực</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex border border-slate-800 rounded-lg p-0.5 bg-slate-950">
                  <button 
                    onClick={() => setDashFilterMode('today')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${dashFilterMode === 'today' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Hôm nay
                  </button>
                  <button 
                    onClick={() => setDashFilterMode('range')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${dashFilterMode === 'range' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Khoảng ngày
                  </button>
                </div>

                {dashFilterMode === 'range' && (
                  <div className="flex items-center gap-2 animate-scaleIn">
                    <input 
                      type="date" 
                      value={dashStartDate}
                      onChange={(e) => setDashStartDate(e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-200"
                    />
                    <span className="text-slate-500 text-xs">đến</span>
                    <input 
                      type="date" 
                      value={dashEndDate}
                      onChange={(e) => setDashEndDate(e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full"></div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tổng lượt đón tiếp</span>
                    <span className="text-2xl font-black text-white block">{dashMetrics?.totalPatients}</span>
                  </div>
                  <div className="p-2 bg-indigo-550/10 rounded-xl text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-sky-950/40 border border-sky-900/30 text-sky-400 text-[9px] font-extrabold rounded-md">
                    {dashMetrics?.vipCount} VIP
                  </span>
                  <span className="px-2 py-0.5 bg-amber-950/40 border border-amber-900/30 text-amber-400 text-[9px] font-extrabold rounded-md">
                    {dashMetrics?.vvipCount} VVIP
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full"></div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Doanh thu tạm tính</span>
                    <span className="text-lg sm:text-2xl font-black text-emerald-450 block">{formatCurrency(dashMetrics?.totalRevenue)}</span>
                  </div>
                  <div className="p-2 bg-emerald-550/10 rounded-xl text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 text-[9px] text-slate-450 font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Chưa khấu trừ bảo hiểm & miễn giảm
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full"></div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tổng tiền miễn giảm</span>
                    <span className="text-lg sm:text-2xl font-black text-rose-500 block">{formatCurrency(dashMetrics?.totalDiscount)}</span>
                  </div>
                  <div className="p-2 bg-rose-550/10 rounded-xl text-rose-450">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 text-[9px] text-slate-450 font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Chỉ tính trên hồ sơ thuộc nhóm VVIP
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full"></div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Thực thu dự kiến</span>
                    <span className="text-lg sm:text-2xl font-black text-amber-550 block">{formatCurrency(dashMetrics?.totalCollected)}</span>
                  </div>
                  <div className="p-2 bg-amber-550/10 rounded-xl text-amber-500">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 text-[9px] text-slate-400 font-black flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-455" /> Đã cập nhật dòng tiền sạch
                </div>
              </div>
            </div>

            {/* Phân tích kế hoạch ngày mai & Tuần tới */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Lịch trình ngày mai */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-400" /> Kế hoạch đón tiếp ngày mai ({briefingStats?.tomorrowDateFormatted})
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold">Danh sách đã lên lịch, chuẩn bị trước hồ sơ chuyên khoa</p>
                  </div>
                  <span className="px-3 py-1 bg-sky-950/40 border border-sky-900/30 text-sky-400 text-xs font-black rounded-xl">
                    {briefingStats?.tomorrowPatients.length} ca đón tiếp
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {briefingStats?.tomorrowPatients.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Clock className="w-10 h-10 mx-auto stroke-1 text-slate-600" />
                      <p className="text-xs font-semibold">Chưa ghi nhận ca đăng ký lịch trước cho ngày mai</p>
                    </div>
                  ) : (
                    briefingStats?.tomorrowPatients.map(p => (
                      <div key={p.id} className="p-4 border border-slate-800 hover:border-slate-700 bg-slate-950/30 rounded-2xl space-y-3 relative flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <span className="text-xs font-extrabold text-white hover:text-amber-500 cursor-pointer block truncate" onClick={() => initiateEdit(p)}>
                            {p?.name}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 font-semibold">
                            <span className="font-bold text-slate-200">PID: {p?.pid || '---'}</span>
                            <span>•</span>
                            <span className="text-amber-500 truncate max-w-[200px]">{p?.specialties?.join(', ') || 'Chưa chọn khoa'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${p?.tier === 'VVIP' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' : 'bg-sky-950 text-sky-400 border border-sky-900/30'}`}>
                            {p?.tier}
                          </span>
                          <button 
                            onClick={() => initiateEdit(p)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tóm tắt tuần tới & Phím nhanh */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">Tóm tắt tuần kế tiếp</h3>
                  
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 block">Đăng ký mới (7 ngày tới)</span>
                      <span className="text-3xl font-black text-white block">{briefingStats?.nextWeekCount}</span>
                    </div>
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-950/40">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tác vụ nhanh hệ thống</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => { resetForm(); setActiveTab('register'); }}
                      className="w-full p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-955 text-xs font-black uppercase tracking-wide rounded-2xl transition flex items-center justify-between shadow-md"
                    >
                      <span>Tiếp đón hồ sơ mới</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { resetForm(); setActiveTab('monitoring'); }}
                      className="w-full p-3 border border-slate-800 hover:bg-slate-800 text-slate-250 text-xs font-bold rounded-2xl transition flex items-center justify-between"
                    >
                      <span>Mở bảng theo dõi Kanban</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab Register */}
        {activeTab === 'register' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-scaleIn">
            
            {/* Cột Trái: Lịch sử & Đơn vị liên kết */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-4">
                <div className="flex border-b border-slate-800 pb-0.5">
                  <button 
                    onClick={() => setLeftFormTab('visitHistory')}
                    className={`flex-1 pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${leftFormTab === 'visitHistory' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500'}`}
                  >
                    Lịch sử ({patientVisitHistory.length})
                  </button>
                  <button 
                    onClick={() => setLeftFormTab('timeline')}
                    className={`flex-1 pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition ${leftFormTab === 'timeline' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500'}`}
                  >
                    Tiến trình
                  </button>
                </div>

                {leftFormTab === 'visitHistory' && (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {patientVisitHistory.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 space-y-2">
                        <History className="w-10 h-10 mx-auto stroke-1 text-slate-600" />
                        <p className="text-xs font-semibold leading-relaxed">
                          {!formData?.pid ? "Nhập PID để tìm kiếm" : "Không tìm thấy dữ liệu lượt khám cũ"}
                        </p>
                      </div>
                    ) : (
                      patientVisitHistory.map(visit => (
                        <div key={visit.id} className="p-3.5 border border-slate-800 rounded-2xl bg-slate-950/30 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-0.5">
                              <span className="text-xs font-extrabold text-white block">Ngày khám: {formatDateVN(visit?.date)}</span>
                              <span className="text-[10px] text-amber-500 font-bold block truncate max-w-[150px]">
                                {visit?.specialties?.join(', ') || 'Chưa chọn khoa'}
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => { setCopyConfirmModal({ show: true, visitToCopy: visit }); }}
                              className="p-1.5 hover:bg-slate-800 hover:text-amber-500 text-slate-400 rounded-lg transition"
                              title="Sao chép dữ liệu lượt khám này"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {(visit?.boardApproval || visit?.notes) && (
                            <div className="p-2 bg-slate-950 rounded-xl border border-slate-850 text-[10px] space-y-1 text-slate-300 font-semibold leading-relaxed">
                              {visit?.boardApproval && <p className="text-slate-100">📌 Phê duyệt: {visit?.boardApproval}</p>}
                              {visit?.notes && <p className="text-slate-400">✍️ Ghi chú: {visit?.notes}</p>}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {leftFormTab === 'timeline' && (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {(!formData?.history || formData?.history.length === 0) ? (
                      <div className="py-12 text-center text-slate-500 space-y-2">
                        <Activity className="w-10 h-10 mx-auto stroke-1 text-slate-600" />
                        <p className="text-xs font-semibold">Chưa ghi nhận tiến trình hoạt động của lượt khám này</p>
                      </div>
                    ) : (
                      <div className="relative pl-4 border-l border-slate-800 space-y-4 py-2 ml-2 text-slate-200">
                        {formData?.history.map((log, idx) => (
                          <div key={idx} className="relative text-[11px] space-y-1">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-amber-500 border-2 border-slate-900 rounded-full"></div>
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-white leading-tight block">{log.action}</span>
                              <span className="text-[9px] text-slate-450 font-semibold flex-shrink-0">
                                {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-400 font-bold">Thực hiện: {log.user}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Cột Phải: Biểu mẫu Tiếp đón */}
            <div className="lg:col-span-2">
              <form onSubmit={savePatient} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                  <div className="space-y-1">
                    <h2 className="text-base font-black text-white uppercase tracking-wide">
                      {currentId ? "📝 Hiệu chỉnh hành trình tiếp đón" : "🆕 Đăng ký lượt tiếp đón mới"}
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold">
                      {currentId ? "Cập nhật thông tin chi tiết và chứng từ hành trình" : "Điền đầy đủ thông tin hoặc quét mã để ghi nhận khách hàng"}
                    </p>
                  </div>
                  {currentId && (
                    <button 
                      type="button" 
                      onClick={resetForm}
                      className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-black rounded-xl transition"
                    >
                      Hủy cập nhật
                    </button>
                  )}
                </div>

                {/* Hạng & Mã PID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Hạng phân lớp khách hàng</label>
                    <div className="flex border border-slate-800 rounded-xl p-1 bg-slate-950">
                      <button 
                        type="button"
                        onClick={() => handleInputChange('tier', 'VIP')}
                        className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${formData?.tier === 'VIP' ? 'bg-slate-850 text-sky-400 border border-sky-900/30' : 'text-slate-500'}`}
                      >
                        Khách VIP
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleInputChange('tier', 'VVIP')}
                        className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${formData?.tier === 'VVIP' ? 'bg-slate-850 text-amber-500 border border-amber-900/30' : 'text-slate-500'}`}
                      >
                        Khách VVIP
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Mã định danh bệnh nhân (PID)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="nhập mã PID hoặc bấm quét"
                        value={formData?.pid}
                        onChange={(e) => handleInputChange('pid', e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs focus:outline-hidden text-white font-semibold"
                      />
                      <button 
                        type="button"
                        onClick={() => setIsScanning(true)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-amber-500 transition"
                        title="Quét mã vạch qua Camera"
                      >
                        <Scan className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Họ tên & Ngày khám */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Họ & Tên khách hàng</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Họ & Tên in hoa viết dấu"
                      value={formData?.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs focus:outline-hidden text-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Ngày tiếp đón chuyên khoa</label>
                    <input 
                      type="date" 
                      required
                      value={formData?.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs focus:outline-hidden text-white font-semibold"
                    />
                  </div>
                </div>

                {/* Site khám & Khu vực khám */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Site cơ sở tiếp đón</label>
                    <select 
                      value={formData?.site}
                      onChange={(e) => handleInputChange('site', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs focus:outline-hidden text-slate-300 font-semibold"
                    >
                      {sites.map(s => (
                        <option key={s.id} value={s.label}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Phân vùng đón tiếp</label>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Khu VIP tầng 1"
                      value={formData?.examinationArea}
                      onChange={(e) => handleInputChange('examinationArea', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs focus:outline-hidden text-white font-semibold"
                    />
                  </div>
                </div>

                {/* Chọn chuyên khoa */}
                <div className="space-y-1.5" ref={specRef}>
                  <label className="text-xs font-bold text-slate-400 block">Các chuyên khoa tiếp nhận</label>
                  <div className="relative">
                    <div 
                      onClick={() => setIsSpecDropdownOpen(true)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 rounded-xl text-xs text-slate-200 cursor-pointer min-h-[42px] flex items-center justify-between"
                    >
                      <span className="font-semibold truncate">
                        {formData?.specialties && formData?.specialties.length > 0 ? formData?.specialties.join(', ') : "Bấm để chọn chuyên khoa"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>

                    {isSpecDropdownOpen && (
                      <div className="absolute left-0 right-0 top-12 mt-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-30 animate-scaleIn text-slate-105">
                        <input 
                          type="text" 
                          placeholder="Tìm nhanh chuyên khoa..."
                          value={specSearch}
                          onChange={(e) => setSpecSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-hidden font-semibold"
                        />
                        <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {filteredSpecialties.map(spec => {
                            const isSelected = formData?.specialties?.includes(spec);
                            return (
                              <div 
                                key={spec}
                                onClick={() => toggleSpecialtySelection(spec)}
                                className={`p-2 rounded-xl text-[11px] font-bold cursor-pointer transition flex items-center justify-between ${isSelected ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/30' : 'hover:bg-slate-800 text-slate-400'}`}
                              >
                                <span>{spec}</span>
                                {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Loại hình điều trị */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Phương án điều trị chuyên ban</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Ngoại trú', 'Cấp cứu/Daycare', 'Nội trú/ICU', 'Ngoài viện'].map(type => {
                      const isSelected = formData?.treatmentType === type;
                      return (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => handleTreatmentTypeChange(type)}
                          className={`py-2.5 px-3 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${isSelected ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md' : 'border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phân quyền Nhân viên: Chọn người phân công hỗ trợ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Chỉ định nhân sự đón tiếp trực tiếp (FCM Push Target)</label>
                  <div className="p-3 border border-slate-800 rounded-2xl max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/20">
                    {registrableStaffList.length === 0 ? (
                      <div className="col-span-2 py-6 text-center text-slate-500 text-[11px] font-semibold">Chưa có danh sách nhân viên tiếp đón</div>
                    ) : (
                      registrableStaffList.map(staff => {
                        const isAssigned = formData?.recipients?.includes(staff.uid);
                        return (
                          <div 
                            key={staff.uid}
                            onClick={() => handleToggleRecipient(staff.uid)}
                            className={`p-2 border rounded-xl flex items-center justify-between cursor-pointer transition text-[11px] font-semibold ${isAssigned ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 font-extrabold' : 'border-slate-800 hover:bg-slate-800 text-slate-400'}`}
                          >
                            <div className="space-y-0.5">
                              <span>{staff.name}</span>
                              <span className="text-[9px] text-slate-500 block font-normal">{staff.title}</span>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={isAssigned} 
                              onChange={() => {}} 
                              className="rounded-sm border-slate-800 text-amber-500 focus:ring-amber-500 pointer-events-none bg-slate-950" 
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Chỉ đạo và Ghi chú */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Chỉ đạo phê duyệt của Hội Đồng Quản Trị</label>
                    <input 
                      type="text" 
                      placeholder="Ý kiến phê duyệt từ ban giám đốc"
                      value={formData?.boardApproval}
                      onChange={(e) => handleInputChange('boardApproval', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs focus:outline-hidden text-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Ghi chú hành trình / Hồ sơ bệnh án</label>
                    <input 
                      type="text" 
                      placeholder="Ghi chú quan trọng đón tiếp"
                      value={formData?.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs focus:outline-hidden text-white font-semibold"
                    />
                  </div>
                </div>

                {/* Vùng Chi phí (Ẩn nếu là khách VIP bình thường - Chỉ hiển thị cho VVIP) */}
                {formData?.tier === 'VVIP' && (
                  <div className="p-5 bg-slate-950/30 border border-slate-800 rounded-2xl space-y-4 animate-scaleIn text-slate-200">
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
                      <span>Dự toán & Miễn giảm chi phí điều trị (VVIP)</span>
                      <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 font-extrabold px-1.5 py-0.5 rounded-sm">BẢN DỰ TOÁN CHI TIẾT</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-450">Khám lâm sàng (VND)</span>
                        <input 
                          type="text" 
                          value={formData?.phiKham === 0 ? '' : formData?.phiKham.toLocaleString('vi-VN')}
                          onChange={(e) => handleCurrencyChange('phiKham', e.target.value)}
                          placeholder="0 ₫"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold focus:outline-hidden text-white"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-450">CLS & CĐHA (VND)</span>
                        <input 
                          type="text" 
                          value={formData?.clsCdha === 0 ? '' : formData?.clsCdha.toLocaleString('vi-VN')}
                          onChange={(e) => handleCurrencyChange('clsCdha', e.target.value)}
                          placeholder="0 ₫"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold focus:outline-hidden text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-450">Thuốc & Vắc-xin (VND)</span>
                        <input 
                          type="text" 
                          value={formData?.thuocVacxin === 0 ? '' : formData?.thuocVacxin.toLocaleString('vi-VN')}
                          onChange={(e) => handleCurrencyChange('thuocVacxin', e.target.value)}
                          placeholder="0 ₫"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold focus:outline-hidden text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-450">Tạm ứng bảo hiểm (VND)</span>
                        <input 
                          type="text" 
                          value={formData?.insuranceAdvance === 0 ? '' : formData?.insuranceAdvance.toLocaleString('vi-VN')}
                          onChange={(e) => handleCurrencyChange('insuranceAdvance', e.target.value)}
                          placeholder="0 ₫"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold focus:outline-hidden text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-450">Tỷ lệ miễn giảm (%)</span>
                        <input 
                          type="number" 
                          max="100"
                          min="0"
                          disabled={userRole === 'nhanvien'}
                          value={formData?.discountRate || ''}
                          onChange={(e) => handleInputChange('discountRate', e.target.value === '' ? 0 : Math.min(100, parseInt(e.target.value, 10)))}
                          placeholder="Ví dụ: 20%"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold focus:outline-hidden disabled:bg-slate-900 disabled:text-slate-500 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-450">Tiền được giảm (Tự tính)</span>
                        <div className="w-full px-3 py-2.5 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-lg text-xs font-extrabold">
                          {formatCurrency(formData?.approvedDiscountAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs font-black uppercase text-slate-300">
                      <span>Tổng giá trị hành trình trước miễn giảm:</span>
                      <span className="text-sm font-black text-amber-500">{formatCurrency(formData?.totalAmount)}</span>
                    </div>
                  </div>
                )}

                {/* Văn bản đính kèm phê duyệt */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">
                    Chứng từ, văn bản phê duyệt đính kèm ({formData?.approvalImages ? formData?.approvalImages.length : 0} ảnh)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-4 py-3 border border-dashed border-slate-800 hover:border-amber-500 hover:bg-slate-850 rounded-2xl cursor-pointer transition flex flex-col items-center justify-center gap-1">
                      <Upload className="w-5 h-5 text-slate-550" />
                      <span className="text-[10px] text-slate-400 font-bold">Tải lên các ảnh</span>
                      <input 
                        type="file" 
                        multiple
                        accept="image/*"
                        onChange={handleMultipleImagesUpload}
                        className="hidden" 
                      />
                    </label>

                    {formData?.approvalImages && formData?.approvalImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-800 group">
                        <img 
                          src={img} 
                          alt="Đính kèm" 
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => { setLightboxImages(formData?.approvalImages); setLightboxIndex(idx); }} 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              approvalImages: prev?.approvalImages?.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Save */}
                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Check className="w-4 h-4" /> {currentId ? "Lưu cập nhật thay đổi" : "Tiếp đón & đẩy thông báo (Push Notify)"}
                </button>

              </form>
            </div>

          </div>
        )}

        {/* Tab Monitoring */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            
            {/* Bộ lọc Monitoring */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">
                    Hành trình đón tiếp thời gian thực ({filteredPatients.length} ca)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Tự động kết nối và đồng bộ trạng thái luồng tiếp đón khách hàng</p>
                </div>

                <div className="flex border border-slate-800 rounded-lg p-0.5 bg-slate-950">
                  <button 
                    onClick={() => setCalendarMode('list')}
                    className={`px-3.5 py-1 text-[10px] font-bold rounded-md transition-all ${calendarMode === 'list' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Kanban / Danh sách
                  </button>
                  <button 
                    onClick={() => setCalendarMode('calendar')}
                    className={`px-3.5 py-1 text-[10px] font-bold rounded-md transition-all ${calendarMode === 'calendar' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Lịch tuần / Tháng
                  </button>
                </div>
              </div>

              {calendarMode === 'list' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-550 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="Tìm tên, PID, chỉ đạo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] focus:outline-hidden font-semibold text-white"
                    />
                  </div>

                  <select 
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] focus:outline-hidden font-semibold text-slate-300"
                  >
                    <option value="">-- Tất cả Chuyên khoa --</option>
                    {(systemSettings?.specialties || []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <select 
                    value={filterSite}
                    onChange={(e) => setFilterSite(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] focus:outline-hidden font-semibold text-slate-300"
                  >
                    <option value="">-- Tất cả Site cơ sở --</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.label}>{s.label}</option>
                    ))}
                  </select>

                  <select 
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] focus:outline-hidden font-semibold text-slate-300"
                  >
                    <option value="">-- Hạng Khách hàng --</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                  </select>

                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] focus:outline-hidden font-semibold text-slate-300"
                  />
                </div>
              )}
            </div>

            {/* Chế độ Lịch tuần / tháng (Calendar View) */}
            {calendarMode === 'calendar' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4 animate-scaleIn text-slate-200">
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleCalendarNavigate('prev')}
                      className="p-1.5 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-300 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-sm font-black text-white uppercase tracking-wide">
                      {currentCalendarDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button 
                      onClick={() => handleCalendarNavigate('next')}
                      className="p-1.5 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-300 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex border border-slate-800 rounded-lg p-0.5 bg-slate-950">
                    <button 
                      onClick={() => setCalendarMode('calendar')}
                      className="px-3.5 py-1 text-[10px] font-bold rounded-md bg-slate-800 text-white shadow-2xs"
                    >
                      Tuần làm việc
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-2">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black uppercase text-slate-500 py-1">{d}</div>
                  ))}
                  
                  {weekDays.map((day, idx) => {
                    const dayStr = day.toISOString().split('T')[0];
                    const patientsOnDay = visiblePatients.filter(p => p && p?.date === dayStr);
                    const isToday = dayStr === todayStr;

                    return (
                      <div key={idx} className={`p-3 border rounded-2xl min-h-[120px] flex flex-col justify-between ${isToday ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-955/20'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold ${isToday ? 'text-amber-500 font-extrabold' : 'text-slate-450'}`}>{day.getDate()}</span>
                          {patientsOnDay.length > 0 && (
                            <span className="w-4 h-4 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center">
                              {patientsOnDay.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-2 flex-1 overflow-y-auto max-h-[100px] pr-0.5">
                          {patientsOnDay.map(p => (
                            <div 
                              key={p.id}
                              onClick={() => initiateEdit(p)}
                              className={`p-1.5 rounded-lg border text-[9px] font-black cursor-pointer truncate ${p?.tier === 'VVIP' ? 'bg-amber-950 text-amber-400 border-amber-900/30' : 'bg-sky-950 text-sky-400 border-sky-900/30'}`}
                              title={p?.name}
                            >
                              {p?.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              /* Chế độ Bảng Kanban đón tiếp (Kanban View) */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* Cột 1: Đăng ký / Chờ đón tiếp */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">1. Chờ đón tiếp</span>
                    <span className="px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 text-[9px] font-bold rounded-md">
                      {kanbanPatients.filter(p => ['Scheduled', 'Preparing', 'ReceivedInfo', 'Waiting'].includes(p.status)).length} ca
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {kanbanPatients.filter(p => ['Scheduled', 'Preparing', 'ReceivedInfo', 'Waiting'].includes(p.status)).map(p => (
                      <div key={p.id} className="p-4 border border-slate-800 hover:border-slate-750 bg-slate-955/30 rounded-2xl space-y-3 relative group">
                        
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-white group-hover:text-amber-500 cursor-pointer block leading-snug" onClick={() => initiateEdit(p)}>
                              {p?.name}
                            </span>
                            <span className="text-[10px] text-slate-450 font-bold block">PID: {p?.pid} • Hạng: {p?.tier}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded-sm ${p?.tier === 'VVIP' ? 'bg-amber-955 text-amber-400 border border-amber-900/30' : 'bg-sky-955 text-sky-400 border border-sky-900/30'}`}>
                            {p?.tier}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 space-y-1 text-[10px] text-slate-400 font-bold">
                          <p className="text-amber-500">🏥 {p?.specialties?.join(', ') || 'Chưa chọn khoa'}</p>
                          {p?.boardApproval && <p className="text-slate-200">📌 Phê duyệt: {p?.boardApproval}</p>}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={() => handleUpdateStatus(p.id, 'Examining')}
                            className="flex-1 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-[10px] font-black rounded-xl transition shadow-sm"
                          >
                            Bàn giao Khám
                          </button>
                          <button 
                            onClick={() => initiateEdit(p)}
                            className="px-2.5 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl transition"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cột 2: Đang Khám / Cận lâm sàng */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">2. Đang khám / CLS</span>
                    <span className="px-2 py-0.5 bg-slate-955 text-indigo-400 border border-slate-800 text-[9px] font-bold rounded-md">
                      {kanbanPatients.filter(p => ['Received', 'Examining', 'Testing', 'Reviewing'].includes(p.status)).length} ca
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {kanbanPatients.filter(p => ['Received', 'Examining', 'Testing', 'Reviewing'].includes(p.status)).map(p => (
                      <div key={p.id} className="p-4 border border-slate-800 hover:border-slate-750 bg-slate-955/30 rounded-2xl space-y-3 relative group">
                        
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-white group-hover:text-amber-500 cursor-pointer block leading-snug" onClick={() => initiateEdit(p)}>
                              {p?.name}
                            </span>
                            <span className="text-[10px] text-slate-450 font-bold block">PID: {p?.pid} • Hạng: {p?.tier}</span>
                          </div>
                          <span className="px-2 py-0.5 text-[8px] font-black rounded-sm bg-indigo-950 text-indigo-400 border border-indigo-900/30">
                            {workflowStatuses.find(s => s.id === p.status)?.label || p.status}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 space-y-1 text-[10px] text-slate-400 font-bold">
                          <p className="text-amber-500">🏥 {p?.specialties?.join(', ') || 'Chưa chọn khoa'}</p>
                          <p>📍 Phân vùng: {p?.examinationArea || 'Phòng VIP'}</p>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={() => handleUpdateStatus(p.id, 'Pharmacy')}
                            className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-xl transition shadow-sm"
                          >
                            Bàn giao Nhà Thuốc
                          </button>
                          <button 
                            onClick={() => initiateEdit(p)}
                            className="px-2.5 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl transition"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cột 3: Nhà Thuốc / Hoàn Tất */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">3. Chờ thuốc / Hoàn tất</span>
                    <span className="px-2 py-0.5 bg-slate-955 text-emerald-400 border border-slate-800 text-[9px] font-bold rounded-md">
                      {kanbanPatients.filter(p => ['Pharmacy', 'Inpatient', 'Completed'].includes(p.status)).length} ca
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {kanbanPatients.filter(p => ['Pharmacy', 'Inpatient', 'Completed'].includes(p.status)).map(p => (
                      <div key={p.id} className="p-4 border border-slate-800 hover:border-slate-750 bg-slate-955/30 rounded-2xl space-y-3 relative group">
                        
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-white group-hover:text-amber-500 cursor-pointer block leading-snug" onClick={() => initiateEdit(p)}>
                              {p?.name}
                            </span>
                            <span className="text-[10px] text-slate-450 font-bold block">PID: {p?.pid} • Hạng: {p?.tier}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded-sm ${p.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-yellow-950 text-yellow-450 border border-yellow-900/30'}`}>
                            {workflowStatuses.find(s => s.id === p.status)?.label || p.status}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 space-y-1 text-[10px] text-slate-400 font-bold">
                          <p className="text-amber-500">🏥 {p?.specialties?.join(', ') || 'Chưa chọn khoa'}</p>
                          <p className="text-slate-300 font-black">💰 Thực thu: {formatCurrency(p?.totalAmount - p?.approvedDiscountAmount)}</p>
                        </div>

                        <div className="flex gap-2 pt-1">
                          {p.status !== 'Completed' && (
                            <button 
                              onClick={() => handleUpdateStatus(p.id, 'Completed')}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition"
                            >
                              Xác nhận Hoàn Tất
                            </button>
                          )}
                          <button 
                            onClick={() => initiateEdit(p)}
                            className="px-2.5 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl transition w-full"
                          >
                            Chi tiết hồ sơ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab Settings */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-scaleIn">
            
            {/* Mục 1: Quản lý Chuyên khoa & Công thức */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
                <div className="space-y-1 pb-4 border-b border-slate-850">
                  <h3 className="text-base font-black text-white uppercase tracking-wide">Cấu hình tham số điều trị</h3>
                  <p className="text-xs text-slate-400 font-semibold">Tùy biến danh mục chuyên khoa và công thức thanh toán miễn giảm</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-450">Danh mục Chuyên Khoa ({systemSettings?.specialties ? systemSettings?.specialties.length : 0})</h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập tên chuyên khoa mới (ví dụ: CK Tim mạch)"
                      value={newSpecialtyInput}
                      onChange={(e) => setNewSpecialtyInput(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-hidden font-semibold text-white"
                    />
                    <button 
                      onClick={handleAddSpecialty}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {(systemSettings?.specialties || []).map(spec => (
                      <div key={spec} className="p-2 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] font-bold bg-slate-950/40">
                        <span className="truncate text-slate-250">{spec}</span>
                        <button 
                          onClick={() => handleRemoveSpecialty(spec)}
                          className="text-rose-500 hover:text-rose-400 p-0.5 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-850">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-450">Thiết lập công thức tính tổng số tiền trước giảm</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'phiKham', label: 'Tính tiền Khám Lâm Sàng' },
                      { id: 'clsCdha', label: 'Tính tiền CLS / CĐHA' },
                      { id: 'thuocVacxin', label: 'Tính tiền Thuốc / Vắc-xin' }
                    ].map(field => (
                      <label key={field.id} className="p-3 border border-slate-800 hover:border-slate-750 rounded-2xl flex items-center gap-2.5 text-[11px] font-semibold cursor-pointer transition bg-slate-950/20 text-slate-300">
                        <input 
                          type="checkbox" 
                          checked={!!systemSettings?.totalFormulaFields?.[field.id]} 
                          onChange={() => handleFormulaCheckboxChange(field.id)}
                          className="rounded-sm border-slate-800 text-amber-500 focus:ring-amber-500 bg-slate-950" 
                        />
                        <span>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-850">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-450">Thiết lập phương thức tính chiết khấu</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex-1 p-3 border border-slate-800 hover:border-slate-750 rounded-2xl flex items-center gap-2.5 text-[11px] font-semibold cursor-pointer transition bg-slate-950/20 text-slate-300">
                      <input 
                        type="radio" 
                        name="discountFormula"
                        checked={systemSettings?.discountFormulaType === 'total_minus_insurance_advance'}
                        onChange={() => handleDiscountFormulaChange('total_minus_insurance_advance')}
                        className="text-amber-500 focus:ring-amber-500 bg-slate-950" 
                      />
                      <span>Miễn giảm sau khi trừ bảo hiểm</span>
                    </label>
                    <label className="flex-1 p-3 border border-slate-800 hover:border-slate-750 rounded-2xl flex items-center gap-2.5 text-[11px] font-semibold cursor-pointer transition bg-slate-950/20 text-slate-300">
                      <input 
                        type="radio" 
                        name="discountFormula"
                        checked={systemSettings?.discountFormulaType === 'total_direct'}
                        onChange={() => handleDiscountFormulaChange('total_direct')}
                        className="text-amber-500 focus:ring-amber-500 bg-slate-950" 
                      />
                      <span>Miễn giảm trực tiếp trên hoá đơn</span>
                    </label>
                  </div>
                </div>

              </div>

            </div>

            {/* Mục 2: Quản lý Nhân viên phân quyền (Chỉ Admin) */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
                
                <div className="space-y-1 pb-4 border-b border-slate-850">
                  <h3 className="text-base font-black text-white uppercase tracking-wide">Quản lý Tài khoản (IT Admin)</h3>
                  <p className="text-xs text-slate-400 font-semibold">Cấp và gỡ bỏ quyền truy cập hệ thống của nhân viên</p>
                </div>

                {userRole === 'admin' ? (
                  <form onSubmit={handleCreateStaff} className="space-y-4 text-slate-200">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">Mã UID Firebase Auth</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Chuỗi ID tài khoản Firebase"
                        value={newStaff?.uid}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, uid: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-hidden font-semibold text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">Họ & Tên nhân viên</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Nguyễn Văn A"
                        value={newStaff?.name}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-hidden font-semibold text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">Email làm việc</label>
                      <input 
                        type="email" 
                        required
                        placeholder="email@vip.com"
                        value={newStaff?.email}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-hidden font-semibold text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">Vai trò trên hệ thống</label>
                      <select 
                        value={newStaff?.role}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-hidden font-semibold text-slate-300"
                      >
                        <option value="nhanvien">Lễ tân tiếp đón (nhanvien)</option>
                        <option value="quanly_site">Quản lý site cơ sở (quanly_site)</option>
                        <option value="quanly">Quản lý chuyên ban (quanly)</option>
                        <option value="lanhdao">Hội đồng quản trị (lanhdao)</option>
                        <option value="admin">IT Admin (admin)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block">Chức danh / Tiêu đề hiển thị</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Quản lý chuyên ban Sơn Hòa"
                        value={newStaff?.title}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-hidden font-semibold text-white"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase rounded-xl transition flex items-center justify-center gap-1 shadow-md"
                    >
                      <UserPlus className="w-4 h-4" /> Kích hoạt tài khoản
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-500 font-semibold flex items-start gap-1.5 leading-relaxed">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                    Chức năng quản trị và cấp quyền tài khoản bị hạn chế. Chỉ có IT Admin mới được phép thao tác.
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-slate-850">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Danh sách tài khoản ({staffList.length})</h4>
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {staffList.map(staff => (
                      <div key={staff.uid} className="p-3 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 text-[11px] bg-slate-955/20">
                        <div className="min-w-0 space-y-0.5">
                          <span className="font-extrabold text-white block truncate">{staff.name}</span>
                          <span className="text-[9px] text-slate-450 font-semibold block uppercase tracking-wider">{staff.role} • {staff.title}</span>
                        </div>
                        {userRole === 'admin' && (
                          <button 
                            onClick={() => handleDeleteStaff(staff.uid)}
                            className="p-1 hover:bg-rose-950/30 text-rose-500 rounded-lg transition flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* Mobile Footer Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-850 shadow-2xl md:hidden">
        <div className="grid grid-cols-4 h-16">
          <button 
            onClick={() => { resetForm(); setActiveTab('dashboard'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase ${activeTab === 'dashboard' ? 'text-amber-500' : 'text-slate-500'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Tổng quan</span>
          </button>

          <button 
            onClick={() => { resetForm(); setActiveTab('register'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase ${activeTab === 'register' ? 'text-amber-500' : 'text-slate-500'}`}
          >
            <Plus className="w-5 h-5" />
            <span>Tiếp đón</span>
          </button>

          <button 
            onClick={() => { resetForm(); setActiveTab('monitoring'); }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase ${activeTab === 'monitoring' ? 'text-amber-500' : 'text-slate-500'}`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>Theo dõi</span>
          </button>

          <button 
            onClick={() => {
              if (['admin', 'lanhdao', 'quanly'].includes(userRole)) {
                setActiveTab('settings');
              } else {
                showNotification("Phân quyền nhân viên bị hạn chế chức năng cài đặt!", "error");
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase ${activeTab === 'settings' ? 'text-amber-500' : 'text-slate-500'}`}
          >
            <Settings className="w-5 h-5" />
            <span>Cấu hình</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
