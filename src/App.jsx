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
  Smartphone
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

const mockStaffAccounts = [
  { uid: "acc_admin", email: "admin@vip.com", name: "Nguyễn Minh Trí", title: "IT Admin", role: "admin", pass: "CSKH@abc456" },
  { uid: "acc_lanhdao", email: "lanhdao@vip.com", name: "Trần Thế Phương", title: "Thành viên HĐQT", role: "lanhdao", pass: "CSKH@abc456" },
  { uid: "acc_quanly", email: "quanly@vip.com", name: "Lê Thu Thảo", title: "Quản Lý Chăm Sóc VIP", role: "quanly", pass: "CSKH@abc456" },
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
  { id: 'Waiting', label: 'Chờ Tiếp Đón', color: 'bg-slate-100 text-slate-700 border-slate-250', dot: 'bg-slate-400' },
  { id: 'Received', label: 'Đã Tiếp Đón', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/80', dot: 'bg-indigo-500' },
  { id: 'Examining', label: 'Đang Khám', color: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' },
  { id: 'Testing', label: 'Đang Làm CLS/CĐHA', color: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  { id: 'Reviewing', label: 'Chờ Kết Luận', color: 'bg-purple-50 text-purple-700 border-purple-200/80', dot: 'bg-purple-500' },
  { id: 'Pharmacy', label: 'Đang Chờ Thuốc/Tiêm Ngừa', color: 'bg-yellow-50 text-yellow-850 border-yellow-200/80', dot: 'bg-yellow-500' },
  { id: 'Completed', label: 'Đã Hoàn Tất', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' }
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
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const html5QrCodeRef = useRef(null);

  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'nhanvien', uid: '', title: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterDate, setFilterDate] = useState('');

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
    status: 'Waiting'
  });

  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');
  const [notification, setNotification] = useState(null);
  const [iosNotificationStatus, setIosNotificationStatus] = useState('unknown');

  const [notifications, setNotifications] = useState([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [activePushAlerts, setActivePushAlerts] = useState([]);
  const isInitialMount = useRef(true);
  const notificationCenterRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
        await updateDoc(userDocRef, { fcmToken: token });
      }
    } catch (err) {
      console.warn(err);
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
        if (currentUser && currentUser.uid) {
          await saveFcmTokenToDatabase(currentUser.uid);
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

    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(e => console.warn(e));
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
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setUserRole(parsedUser.role || 'nhanvien');
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
              setUserRole(userData.role);
              await saveFcmTokenToDatabase(firebaseUser.uid);
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
                `🆕 Tiếp nhận khách ${data.tier}`,
                `Bệnh nhân: ${data.name} (PID: ${data.pid}) đã được tiếp đón trạng thái: ${statusLabel}.`,
                'info'
              );
            }
            if (change.type === "modified") {
              triggerPushAlert(
                `🔄 Cập nhật hành trình`,
                `Hồ sơ khách hàng ${data.name} (PID: ${data.pid}) vừa đổi trạng thái sang: ${statusLabel}.`,
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
    if (formData.totalAmount !== calculatedSums.totalAmount || formData.approvedDiscountAmount !== calculatedSums.approvedDiscountAmount) {
      setFormData(prev => ({
        ...prev,
        totalAmount: calculatedSums.totalAmount,
        approvedDiscountAmount: calculatedSums.approvedDiscountAmount
      }));
    }
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
        showNotification("Đăng nhập thành công!");
      } catch (err) {
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
      showNotification(`Chào mừng ${account.name} quay trở lại!`);
      triggerPushAlert("👋 Đăng nhập thành công", `Chào mừng ${account.name} đã truy cập.`);
    } else {
      setAuthError('Email hoặc mật khẩu không chính xác.');
    }
  };

  const handleLogout = () => {
    if (isFirebaseConnected && auth) {
      signOut(auth).catch(e => console.warn(e));
    }
    setCurrentUser(null);
    setUserRole('nhanvien');
    localStorage.removeItem('crm_current_user');
    showNotification("Đăng xuất thành công. Đã khóa phiên làm việc.");
  };

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
      showNotification("Ảnh vượt quá giới hạn 2MB!", "error");
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
        showNotification("Đã đính kèm chứng từ thành công!");
      };
    };
    reader.readAsDataURL(file);
  };

  const savePatient = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification("Họ & Tên khách hàng không được để trống!", "error");
      return;
    }
    if (!formData.pid.trim()) {
      showNotification("Mã PID là bắt buộc!", "error");
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
    setActiveTab('register');
  };

  const handleUpdateStatus = async (patientId, newStatus) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    if (userRole === 'nhanvien') {
      const currentStatus = patient.status || 'Waiting';
      const isAllowed = 
        (currentStatus === 'Waiting' && newStatus === 'Examining') || 
        (currentStatus === 'Pharmacy' && newStatus === 'Completed');

      if (!isAllowed) {
        showNotification("Lỗi: Tài khoản nhân viên chỉ được phép chuyển trạng thái theo đúng luồng bàn giao quy định!", "error");
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
        triggerPushAlert("🔄 Cập nhật hành trình (Cục bộ)", `Khách hàng ${patient.name} đã được cập nhật trạng thái mới.`, "success");
      }
      showNotification("Đã cập nhật trạng thái hành trình khám!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi đồng bộ trạng thái lên database!", "error");
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      showNotification("Chỉ IT Admin mới được phép thao tác!", "error");
      return;
    }
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.uid.trim()) {
      showNotification("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    const created = {
      uid: newStaff.uid.trim(),
      name: newStaff.name.trim(),
      email: newStaff.email.trim(),
      role: newStaff.role,
      title: newStaff.title.trim() || 'Nhân viên chuyên ban'
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
    if (uid === currentUser.uid || uid === "acc_admin") {
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
    let updatedSpecialties = [...systemSettings.specialties];

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
    const updated = systemSettings.specialties.filter(s => s !== spec);
    saveSettingsOnDb({ ...systemSettings, specialties: updated });
    showNotification("Đã gỡ bỏ chuyên khoa.");
  };

  const handleFormulaCheckboxChange = (field) => {
    const updatedFormula = { 
      ...systemSettings.totalFormulaFields, 
      [field]: !systemSettings.totalFormulaFields[field] 
    };
    saveSettingsOnDb({ ...systemSettings, totalFormulaFields: updatedFormula });
    showNotification("Công thức tổng cộng đã được cập nhật!");
  };

  const handleDiscountFormulaChange = (type) => {
    saveSettingsOnDb({ ...systemSettings, discountFormulaType: type });
    showNotification("Phương thức tính miễn giảm đã thay đổi!");
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

  const kanbanPatients = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return patients.filter(p => {
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-indigo-50/20 to-slate-200 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden text-slate-800">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl translate-x-12 translate-y-12"></div>

        <div className="max-w-md w-full bg-white/95 backdrop-blur-md border border-slate-200 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-white p-2.5 shadow-sm border border-slate-200 mx-auto">
              <img 
                src="https://iili.io/F66acRs.png" 
                alt="Hospital Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                QL KH VIP-VVIP
              </h1>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">Phòng Chăm Sóc Khách Hàng</p>
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email </label>
              <input 
                type="email" 
                placeholder="nhập email tại đây"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm focus:outline-hidden text-slate-800 font-medium shadow-2xs"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mật khẩu</label>
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
              <Lock className="w-4 h-4" /> Xác thực
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased pb-20 md:pb-12 relative">
      
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button 
              onClick={() => setLightboxImage(null)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <img 
              src={lightboxImage} 
              alt="Chứng từ văn bản phê duyệt" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-scaleIn"
            />
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
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
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border border-slate-200 shadow-2xl animate-scaleIn">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center justify-center gap-1.5">
                <Scan className="w-4 h-4 text-indigo-600 animate-pulse" /> Trình quét mã camera
              </h4>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {scannerError ? "Lỗi truy cập thiết bị" : "Đặt mã vạch hoặc mã QR của bệnh nhân vào giữa khung hình"}
              </p>
            </div>

            {scannerError ? (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] text-rose-600 font-semibold space-y-2">
                <p>{scannerError}</p>
                <button 
                  type="button"
                  onClick={() => {
                    setScannerError('');
                    setIsScanning(false);
                    setTimeout(() => setIsScanning(true), 200);
                  }}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
                <div id="reader" className="absolute inset-0 w-full h-full"></div>
                
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-4 border-l-4 border-indigo-500 rounded-tl-xs"></div>
                    <div className="w-4 h-4 border-t-4 border-r-4 border-indigo-500 rounded-tr-xs"></div>
                  </div>
                  <div className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" style={{ top: '45%' }}></div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-4 border-l-4 border-indigo-500 rounded-bl-xs"></div>
                    <div className="w-4 h-4 border-b-4 border-r-4 border-indigo-500 rounded-br-xs"></div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={stopScanner}
              className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-[11px] font-bold rounded-xl transition w-full"
            >
              Hủy bỏ quét
            </button>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 pointer-events-none space-y-2 max-w-sm ml-auto">
        {activePushAlerts.map(alert => (
          <div 
            key={alert.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex gap-3 items-start transition-all transform duration-300 bg-white ${
              alert.type === 'success' ? 'border-emerald-100 bg-emerald-50/95' :
              alert.type === 'error' ? 'border-rose-100 bg-rose-50/95' : 'border-indigo-100 bg-indigo-50/95'
            }`}
          >
            <div className={`p-1.5 rounded-lg text-white ${
              alert.type === 'success' ? 'bg-emerald-500' :
              alert.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
            }`}>
              <BellRing className="w-4 h-4" />
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

      {confirmModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <h3 className="text-base font-extrabold text-slate-955">{confirmModal.title || "Xác nhận tác vụ"}</h3>
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

      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl transition-all transform duration-300 translate-y-0 bg-slate-900 text-white">
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span className="font-bold text-xs">{notification.message}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 bg-white p-1">
                <img 
                  src="https://iili.io/F66acRs.png" 
                  alt="Hospital Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  QL KH VIP-VVIP
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    {userRole}
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold">Tiếp nhận khách hàng VIP-VVIP</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => { resetForm(); setActiveTab('dashboard'); }}
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
                onClick={() => { resetForm(); setActiveTab('monitoring'); }}
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

            <div className="flex items-center gap-3 relative" ref={notificationCenterRef}>
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`}></span>
                {isFirebaseConnected ? 'Live' : 'Offline'}
              </div>

              <button 
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className={`p-2 rounded-xl transition-all relative border border-slate-200 ${
                  showNotificationCenter ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'text-slate-500 hover:bg-slate-100'
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

              {showNotificationCenter && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 p-4 space-y-3 animate-scaleIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
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
                            n.read ? 'border-slate-200 bg-slate-50/50' : 'border-indigo-100 bg-indigo-50/30'
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
                <div className="text-xs font-extrabold text-slate-955">{currentUser.name}</div>
                <div className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wide">{currentUser.title || userRole}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-200 transition-all"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around py-3 shadow-xl rounded-t-3xl">
        <button 
          onClick={() => { resetForm(); setActiveTab('dashboard'); }}
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
          onClick={() => { resetForm(); setActiveTab('monitoring'); }}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            
            {(userRole === 'admin' || userRole === 'lanhdao') && iosNotificationStatus !== 'granted' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl mt-0.5 border border-amber-200">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase">Chưa kích hoạt cảnh báo ngầm thiết bị</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-semibold leading-relaxed">
                      Để nhận thông báo báo cáo ca VVIP và duyệt chi phí ngay cả khi đóng ứng dụng hoặc khóa màn hình iPhone, bạn cần bấm kích hoạt dưới đây.
                    </p>
                  </div>
                </div>
                <button
                  onClick={requestIosNotificationPermission}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition shadow-xs whitespace-nowrap flex items-center justify-center gap-1"
                >
                  <BellRing className="w-3.5 h-3.5" /> Kích hoạt thông báo
                </button>
              </div>
            )}

            <div className="bg-gradient-to-tr from-[#1e293b] to-[#4f46e5] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-100 border border-slate-700">
              <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl opacity-10 translate-x-20 -translate-y-20"></div>
              <div className="relative z-10 space-y-4 max-w-2xl">
                <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Phòng Chăm Sóc Khách Hàng
                </span>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                  Chào, {currentUser.name}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                  Công cụ hỗ trợ quản lý và theo dõi việc tiếp đón và chi phí của nhóm Khách hàng VIP, VVIP, Ngoại giao của Ban giám đốc.
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

            {(userRole === 'admin' || userRole === 'lanhdao') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Những gì của ngày hôm nay
                  </h3>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full font-extrabold">
                    {isFirebaseConnected ? 'Live' : 'Offline'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition duration-200">
                    <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Khách hàng</span>
                      <span className="text-xl font-black text-slate-900">{metrics.totalPatients}</span>
                      <span className="text-[11px] text-slate-500 block">
                        VIP: {metrics.vipCount} | VVIP: {metrics.vvipCount}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition duration-200">
                    <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border-indigo-100">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Tổng chi phí</span>
                      <span className="text-xl font-black text-slate-900">{formatCurrency(metrics.totalRevenue)}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Tổng chi phí sử dụng
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition duration-200">
                    <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border-rose-100">
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
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                    Hành Trình Khách Hàng (Realtime Kanban)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Cập nhật tiến độ tiếp đón trong ngày của từng khách hàng.</p>
                </div>
                <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black rounded-lg">
                  Tổng lượt khám: {kanbanPatients.length}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
                {workflowStatuses.map(col => {
                  const colPatients = kanbanPatients.filter(p => (p.status || 'Waiting') === col.id);

                  return (
                    <div 
                      key={col.id} 
                      className="bg-slate-50/60 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[150px] min-h-[350px]"
                    >
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                          <span className="text-[10px] font-black text-slate-700 truncate">{col.label}</span>
                        </div>
                        <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-555">
                          {colPatients.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px]">
                        {colPatients.map(p => (
                          <div 
                            key={p.id}
                            className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition duration-150 space-y-2.5 relative group"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-[8px] text-indigo-600 font-mono font-black truncate">PID: {p.pid}</span>
                              <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase ${
                                p.tier === 'VVIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              }`}>
                                {p.tier}
                              </span>
                            </div>

                            <div className="font-extrabold text-[11px] text-slate-800 leading-tight truncate" title={p.name}>
                              {p.name}
                            </div>

                            <div className="flex flex-wrap gap-0.5">
                              {p.specialties?.slice(0, 2).map((spec, i) => (
                                <span key={i} className="text-[8px] bg-slate-50 text-slate-555 border border-slate-200 px-1 py-0.2 rounded font-semibold truncate max-w-[80px]">
                                  {spec}
                                </span>
                              ))}
                              {p.specialties?.length > 2 && (
                                <span className="text-[8px] text-slate-400 font-bold px-1">+{p.specialties.length - 2}</span>
                              )}
                            </div>

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

                            <div className="flex flex-col gap-0.5 text-[8px] text-slate-400 border-t border-slate-200 pt-1.5 font-semibold">
                              <span className="truncate">NV cập nhật: {p.updatedBy || 'Lễ tân'}</span>
                              <span className="flex-shrink-0 text-slate-300 font-mono">
                                {p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(p.updatedAt).toLocaleDateString('vi-VN', {day: 'numeric', month: 'numeric'}) : '---'}
                              </span>
                            </div>
                          </div>
                        ))}

                        {colPatients.length === 0 && (
                          <div className="text-center py-8 text-slate-300 text-[10px] font-bold border-2 border-dashed border-slate-200 rounded-xl">
                            Trống
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" /> Theo dõi hồ sơ
                </h4>
                <p className="text-xs text-slate-555 leading-relaxed font-semibold">
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
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" /> Cấu hình hệ thống
                  </h4>
                  <p className="text-xs text-slate-555 leading-relaxed font-semibold">
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

        {activeTab === 'register' && (
          <form onSubmit={savePatient} className="space-y-6 animate-fadeIn relative">
            
            <div className="sticky top-16 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-md">
              <div>
                <h2 className="text-base font-black text-slate-955 flex items-center gap-1.5">
                  {currentId ? "Cập Nhật Tiến Độ" : "Tạo lượt VIP/VVIP Mới"}
                </h2>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button 
                  type="button" 
                  onClick={() => { resetForm(); setActiveTab('monitoring'); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
                >
                  <Check className="w-4 h-4" /> {currentId ? "Cập nhật" : "Đăng ký"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Thông Tin Hành Chính
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Họ & Tên khách hàng *</label>
                      <input 
                        type="text" 
                        placeholder="Nhập họ và tên Khách hàng"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold bg-white text-slate-800 animate-fadeIn"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Mã PID *</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Nhập/Quét mã bệnh nhân PID..."
                          value={formData.pid}
                          onChange={(e) => handleInputChange('pid', e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-mono font-black bg-white text-slate-800 animate-fadeIn"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setScannerError('');
                            setIsScanning(true);
                          }}
                          className="px-3 bg-slate-100 hover:bg-slate-250 border border-slate-200 rounded-xl text-slate-600 transition flex items-center gap-1 text-[11px] font-bold shadow-2xs border border-slate-200/80"
                        >
                          <Scan className="w-4 h-4 text-slate-500" /> Quét mã
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Phân Hạng Tiếp Đón</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleInputChange('tier', 'VIP')}
                          className={`py-2 px-4 rounded-xl text-xs font-bold border transition ${
                            formData.tier === 'VIP' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-black' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          Hạng VIP
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('tier', 'VVIP')}
                          className={`py-2 px-4 rounded-xl text-xs font-bold border transition ${
                            formData.tier === 'VVIP' ? 'bg-amber-50 border-amber-200 text-amber-700 font-black' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          Hạng VVIP
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
                      <label className="text-xs font-bold text-slate-600 block">Trạng Thái (Vị Trí Kanban Ban Đầu)</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-bold text-slate-800 bg-white cursor-pointer"
                      >
                        {workflowStatuses.map(status => (
                          <option key={status.id} value={status.id}>{status.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600 block">HĐQT Phê Duyệt</label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {["Sếp Dũng", "Sếp Hoa", "Sếp Nga", "Sếp Thông"].map((boss) => (
                            <button
                              key={boss}
                              type="button"
                              onClick={() => handleInputChange('boardApproval', boss)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                formData.boardApproval === boss 
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-extrabold' 
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {boss}
                            </button>
                          ))}
                        </div>
                        <input 
                          type="text" 
                          placeholder="Thành viên hội đồng quản trị duyệt..."
                          value={formData.boardApproval}
                          onChange={(e) => handleInputChange('boardApproval', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-semibold bg-white text-slate-800 animate-fadeIn"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600 block">Ghi chú</label>
                      <textarea 
                        rows="2"
                        placeholder="Mô tả ghi chú nếu có..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-950 text-xs font-medium bg-white text-slate-800"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Chuyên khoa thăm khám
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
                            isSelected ? 'bg-slate-955 border-slate-955 text-white shadow-md shadow-slate-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Chi Phí Điều Trị & Lâm Sàng Thực Tế
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
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

              <div className="space-y-6">
                
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-5 relative overflow-hidden border border-slate-800">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500 rounded-full filter blur-2xl opacity-20 translate-x-10 -translate-y-10"></div>
                  
                  <h3 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 relative z-10">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                    Bảng tổng hợp chi phí
                  </h3>

                  <div className="space-y-1.5 pt-2 relative z-10">
                    <label className="text-[10px] font-bold text-slate-300 block">BHYT/BHTN/Tạm ứng (VNĐ)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.insuranceAdvance ? formData.insuranceAdvance.toLocaleString('vi-VN') : ''}
                        onChange={(e) => handleCurrencyChange('insuranceAdvance', e.target.value)}
                        placeholder="0"
                        className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-white placeholder-slate-500 font-mono"
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-slate-500 font-bold font-mono">VNĐ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 relative z-10">
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
                        <span className="absolute right-3 top-3 text-[10px] text-slate-500 font-bold font-mono">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 space-y-3 relative z-10">
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Tổng phí tự động:</span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="text"
                          value={formData.totalAmount ? formData.totalAmount.toLocaleString('vi-VN') : '0'}
                          onChange={(e) => handleCurrencyChange('totalAmount', e.target.value)}
                          className="w-32 bg-transparent text-right font-extrabold text-slate-100 border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:outline-hidden font-mono"
                        />
                        <span>đ</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Số tiền duyệt giảm tự động:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-rose-400">-</span>
                        <input 
                          type="text"
                          value={formData.approvedDiscountAmount ? formData.approvedDiscountAmount.toLocaleString('vi-VN') : '0'}
                          onChange={(e) => handleCurrencyChange('approvedDiscountAmount', e.target.value)}
                          className="w-32 bg-transparent text-right font-extrabold text-rose-400 border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:outline-hidden font-mono"
                        />
                        <span className="text-rose-400">đ</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Khấu trừ BHYT/Tạm ứng:</span>
                      <span className="font-extrabold text-indigo-400 font-mono">-{formatCurrency(formData.insuranceAdvance)}</span>
                    </div>

                    <div className="border-t border-dashed border-slate-800 pt-3 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-white">BỆNH NHÂN THỰC TRẢ:</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {formatCurrency(Math.max(0, formData.totalAmount - formData.approvedDiscountAmount - formData.insuranceAdvance))}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                    Ảnh Phê Duyệt Gửi Kèm
                  </h3>

                  <div className="space-y-4">
                    {formData.approvalImage ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                        <img src={formData.approvalImage} alt="Công văn" className="w-full h-48 object-cover animate-fadeIn" />
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
                      <label className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition duration-200">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700 text-center">Bấm để tải ảnh</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </form>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-955 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" /> Theo Dõi Hồ Sơ Khách Hàng VIP-VVIP
                </h2>
              </div>
              <button 
                onClick={() => { resetForm(); setActiveTab('register'); }}
                className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-850 rounded-xl text-xs font-black flex items-center gap-1.5 border border-slate-900 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" /> Tiếp nhận hồ sơ mới
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Tìm theo tên, mã PID, ghi chú..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-xs font-bold bg-white"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="">Tất cả</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                  </select>

                  <select 
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
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
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
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

            {isLoading ? (
              <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-semibold text-xs animate-pulse">Đang cập nhật...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy gì hết nè</h3>
                  <p className="text-slate-400 text-xs mt-1 font-medium">Hệ thống chưa ghi nhận hoặc từ khóa lọc không trùng khớp.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-black uppercase tracking-wider">
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
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {filteredPatients.map((p) => {
                          const realCollected = Math.max(0, (p.totalAmount || 0) - (p.approvedDiscountAmount || 0));
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition duration-150">
                              <td className="py-4 px-5">
                                <div className="font-extrabold text-slate-955 text-sm">{p.name}</div>
                                <div className="text-[10px] text-indigo-600 font-mono font-black mt-0.5">PID: {p.pid}</div>
                              </td>
                              <td className="py-4 px-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide ${
                                  p.tier === 'VVIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
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
                                    <span key={idx} className="text-[9px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-3">
                                <div className="font-bold text-slate-700">{p.boardApproval || '---'}</div>
                                {p.notes && <div className="text-[10px] text-slate-400 max-w-[150px] truncate" title={p.notes}>{p.notes}</div>}
                              </td>
                              <td className="py-4 px-3 text-right font-bold text-slate-900 font-mono">
                                {formatCurrency(p.totalAmount)}
                              </td>
                              <td className="py-4 px-3 text-right">
                                <div className="font-bold text-rose-600 font-mono">-{formatCurrency(p.approvedDiscountAmount)}</div>
                                <div className="text-[9px] text-slate-400 font-black">Tỷ lệ: {p.discountRate || 0}%</div>
                              </td>
                              <td className="py-4 px-3 text-right font-extrabold text-emerald-600 font-mono">
                                {formatCurrency(realCollected)}
                              </td>
                              <td className="py-4 px-5 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-1.5">
                                  {p.approvalImage && (
                                    <button 
                                      onClick={() => setLightboxImage(p.approvalImage)}
                                      className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition" 
                                      title="Ảnh duyệt"
                                    >
                                      <ImageIcon className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button onClick={() => initiateEdit(p)} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-955 hover:text-white rounded-xl transition" title="Sửa">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  
                                  {userRole !== 'nhanvien' ? (
                                    <button 
                                      onClick={() => {
                                        setConfirmModal({
                                          show: true,
                                          title: "Xác nhận xóa hồ sơ bệnh nhân VIP",
                                          message: "Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ này không? Toàn bộ chứng từ và số liệu đính kèm sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.",
                                          action: async () => {
                                            try {
                                              if (isFirebaseConnected && db) {
                                                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'patients', p.id));
                                                showNotification("Đã xóa hồ sơ thành công!");
                                              } else {
                                                const updated = patients.filter(item => item.id !== p.id);
                                                setPatients(updated);
                                                localStorage.setItem('local_patients', JSON.stringify(updated));
                                                showNotification("Đã xóa hồ sơ cục bộ!");
                                              }
                                              setConfirmModal({ show: false, action: null, message: '', title: '' });
                                            } catch (err) {
                                              console.error(err);
                                            }
                                          }
                                        });
                                      }} 
                                      className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition" 
                                      title="Xóa"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <span className="p-1.5 text-slate-300 cursor-not-allowed">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                  {filteredPatients.map((p) => {
                    const realCollected = Math.max(0, (p.totalAmount || 0) - (p.approvedDiscountAmount || 0));
                    return (
                      <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-indigo-600 font-mono font-black block">PID: {p.pid}</span>
                            <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 animate-fadeIn">
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
                            <span key={idx} className="text-[9px] bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded font-bold">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl text-[11px] border border-slate-200/60 space-y-1 text-slate-655">
                          <div>Phê duyệt: <strong className="text-slate-900">{p.boardApproval || '---'}</strong></div>
                          {p.notes && <div className="text-slate-555 italic">"{p.notes}"</div>}
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-200 py-3 text-center">
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Tổng phí</span>
                            <span className="text-[11px] font-bold text-slate-900 font-mono">{formatCurrency(p.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Duyệt giảm</span>
                            <span className="text-[11px] font-bold text-rose-600 font-mono font-bold">-{formatCurrency(p.approvedDiscountAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Thực Thu</span>
                            <span className="text-[11px] font-black text-emerald-600 font-mono">{formatCurrency(realCollected)}</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          {p.approvalImage && (
                            <button 
                              type="button"
                              onClick={() => setLightboxImage(p.approvalImage)}
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] rounded-xl font-bold flex items-center gap-1 transition animate-fadeIn"
                            >
                              <ImageIcon className="w-3.5 h-3.5" /> Ảnh duyệt
                            </button>
                          )}
                          <button onClick={() => initiateEdit(p)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] rounded-xl font-bold flex items-center gap-1 transition">
                            <Edit3 className="w-3.5 h-3.5" /> Sửa
                          </button>
                          
                          {userRole !== 'nhanvien' && (
                            <button 
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  title: "Xác nhận gỡ bỏ dữ liệu",
                                  message: "Bạn có chắc chắn muốn gỡ bỏ vĩnh viễn hồ sơ này không? Toàn bộ chứng từ và số liệu đính kèm sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.",
                                  show: true,
                                  action: async () => {
                                    try {
                                      if (isFirebaseConnected && db) {
                                        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'patients', p.id));
                                        showNotification("Đã xóa dữ liệu đám mây!");
                                      } else {
                                        const updated = patients.filter(item => item.id !== p.id);
                                        setPatients(updated);
                                        localStorage.setItem('local_patients', JSON.stringify(updated));
                                        showNotification("Đã xóa dữ liệu!");
                                      }
                                      setConfirmModal({ show: false, action: null, message: '', title: '' });
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                });
                              }}
                              className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] rounded-xl font-bold flex items-center gap-1 transition"
                            >
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

        {activeTab === 'settings' && (userRole === 'admin' || userRole === 'lanhdao') && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Cấu Hì̀nh Tham Số & Phân Quyền</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
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
                    <label key={field.key} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-150 hover:bg-slate-50 cursor-pointer transition">
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

                <div className="border-t border-slate-150 pt-6 space-y-4">
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

              <div className="space-y-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
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
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 border border-slate-900 transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Thêm
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {systemSettings.specialties.map((spec, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition animate-fadeIn">
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

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                      Quản Trị Phân Quyền Nhân Sự
                    </h3>
                  </div>

                  {userRole === 'admin' ? (
                    <form onSubmit={handleCreateStaff} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Họ tên nhân viên..." 
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold animate-fadeIn"
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Chức danh" 
                          value={newStaff.title}
                          onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <input 
                          type="email" 
                          placeholder="Email đăng nhập..." 
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Mã UID (Lấy từ Firebase Authentication)..." 
                          value={newStaff.uid}
                          onChange={(e) => setNewStaff({ ...newStaff, uid: e.target.value })}
                          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono font-bold animate-fadeIn"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-555 block uppercase tracking-wider">Vai trò phân quyền</label>
                        <select 
                          value={newStaff.role}
                          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-bold cursor-pointer"
                        >
                          <option value="nhanvien">nhanvien</option>
                          <option value="quanly">quanly</option>
                          <option value="lanhdao">lanhdao</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-850 border border-slate-900 transition flex items-center justify-center gap-1"
                      >
                        <UserPlus className="w-4 h-4" /> Đăng ký tài khoản nhân viên
                      </button>
                    </form>
                  ) : null}

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {staffList.map((staff) => (
                      <div key={staff.uid} className="flex justify-between items-center p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                        <div>
                          <div className="text-xs font-bold text-slate-800">{staff.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{staff.email}</div>
                          <div className="text-[9px] text-slate-400 italic">UID: {staff.uid} | {staff.title}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-sm uppercase">
                            {staff.role}
                          </span>
                          {userRole === 'admin' && staff.uid !== "acc_admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteStaff(staff.uid)}
                              className="p-1 border border-slate-200 text-slate-400 hover:text-red-500 rounded transition"
                              title="Xóa"
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

      <footer className="hidden md:block mt-12 py-8 bg-slate-100 text-center border-t border-t-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-400 space-y-1 font-semibold">
          <p className="text-slate-500">CÔNG CỤ NỘI BỘ - PHÒNG CSKH v2.9.2</p>
          <p>Phòng Chăm Sóc Khách Hàng © 2026.</p>
        </div>
      </footer>
    </div>
  );
}
