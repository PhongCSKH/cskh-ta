import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getMessaging, getToken } from 'firebase/messaging';
import { LayoutDashboard, Plus, ClipboardList, Settings, Bell, BellRing, LogOut, Check, X, ShieldAlert, History, Copy, ArrowRightLeft } from 'lucide-react';

import { defaultFirebaseConfig, mockStaffAccounts, defaultSystemSettings, workflowStatuses, WEBPUSH_VAPID_KEY } from './utils/constants';
import { formatCurrency, formatDateVN, maskName, maskPID } from './utils/helpers';
import Dashboard from './components/Dashboard';
import PatientForm from './components/PatientForm';
import Monitoring from './components/Monitoring';
import SettingsTab from './components/Settings';

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

  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'nhanvien', uid: '', title: '', assignedSite: 'Tất cả' });
  const [editingStaffUid, setEditingStaffUid] = useState(null);

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

  const [dashFilterMode, setDashFilterMode] = useState('today'); 
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
    specialtyConfigs: {},
    site: 'BV Tâm Anh - Tân Sơn Hòa',
    examinationArea: '',
    ngoaiTru: true,
    capCuu: false,
    noiTru: false,
    ngoaiVien: false,
    treatmentType: 'Ngoại trú',
    phiKham: 0,
    clsCdha: 0,
    thuocVacxin: 0,
    insuranceAdvance: 0,
    discountType: 'percent',
    discountRate: 0,
    approvedDiscountAmount: 0,
    totalAmount: 0,
    approvalImages: [],
    status: 'Waiting',
    recipients: [],
    history: [],
    roundingLogs: [],
    sessionGroupId: ''
  });

  const [newRoundingLog, setNewRoundingLog] = useState({ status: 'Ổn định', notes: '' });
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');
  const [notification, setNotification] = useState(null);
  const [iosNotificationStatus, setIosNotificationStatus] = useState('unknown');
  const [notifications, setNotifications] = useState([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const isInitialMount = useRef(true);
  const notificationCenterRef = useRef(null);
  const [specSearch, setSpecSearch] = useState('');
  const [isSpecDropdownOpen, setIsSpecDropdownOpen] = useState(false);
  const specRef = useRef(null);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const appStartTime = useRef(new Date());
  const patientsRef = useRef([]);

  useEffect(() => { patientsRef.current = patients; }, [patients]);

  const canShowTab = (tabName) => {
    if (!currentUser) return false;
    const role = currentUser.role || 'nhanvien';
    if (role === 'admin') return true;
    if (role === 'lanhdao') return ['dashboard', 'monitoring'].includes(tabName);
    return ['dashboard', 'register', 'monitoring'].includes(tabName);
  };

  const hasAccessToPatient = (patient, action) => {
    if (!currentUser) return false;
    const role = currentUser.role || 'nhanvien';
    if (role === 'admin') return true;
    const userSite = currentUser.assignedSite || 'Tất cả';
    const permLevel = systemSettings?.permissions?.[action]?.[role] || 'none';
    if (permLevel === 'none') return false;
    if (permLevel === 'all') return true;
    if (permLevel === 'write_assigned' || permLevel === 'view_assigned') {
      if (userSite === 'Tất cả') return true;
      return patient?.site === userSite;
    }
    return false;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const checkIosPermissionStatus = () => {
    if ('Notification' in window) setIosNotificationStatus(Notification.permission);
  };

  const handleCopyText = (e, text, label) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text) return;
    const textStr = String(text);
    const textArea = document.createElement("textarea");
    textArea.value = textStr;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showNotification(`Đã sao chép ${label} gốc vào bộ nhớ tạm!`);
    } catch (err) {
      console.warn(err);
    }
    document.body.removeChild(textArea);
  };

  const handleLogout = async () => {
    if (isFirebaseConnected && auth && currentUser) {
      signOut(auth).catch(e => console.warn(e));
    }
    setCurrentUser(null);
    setUserRole('nhanvien');
    localStorage.removeItem('crm_current_user');
    showNotification("Đăng xuất thành công. Đã khóa phiên làm việc.");
  };

  const resetForm = () => {
    setCurrentId(null);
    setFormRightTab('billing');
    setIsHistoryPanelExpanded(false);
    setIsReadOnly(false);
    const userSite = currentUser?.assignedSite || 'Tất cả';
    const defaultSite = userSite !== 'Tất cả' ? userSite : 'BV Tâm Anh - Tân Sơn Hòa';
    setFormData({
      name: '', tier: 'VIP', boardApproval: '', notes: '', pid: '', date: new Date().toISOString().split('T')[0],
      specialties: [], specialtyConfigs: {}, site: defaultSite, examinationArea: '', ngoaiTru: true, capCuu: false,
      noiTru: false, ngoaiVien: false, treatmentType: 'Ngoại trú', phiKham: 0, clsCdha: 0, thuocVacxin: 0,
      insuranceAdvance: 0, discountType: 'percent', discountRate: 0, approvedDiscountAmount: 0, totalAmount: 0,
      approvalImages: [], status: 'Waiting', recipients: [], history: [], roundingLogs: [], sessionGroupId: ''
    });
  };

  useEffect(() => {
    checkIosPermissionStatus();
    if (auth && db && isFirebaseConfigured) {
      setIsFirebaseConnected(true);
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser(userData);
            setUserRole(userData?.role || 'nhanvien');
          }
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (isFirebaseConnected && db) {
      const patientsCol = collection(db, 'artifacts', appId, 'public', 'data', 'patients');
      const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
      const usersCol = collection(db, 'artifacts', appId, 'public', 'data', 'users');

      const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) setSystemSettings(docSnap.data());
      });
      const unsubscribeUsers = onSnapshot(usersCol, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => list.push({ uid: docSnap.id, ...docSnap.data() }));
        setStaffList(list);
      });
      const unsubscribePatients = onSnapshot(patientsCol, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => list.push({ id: docSnap.id, ...docSnap.data() }));
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPatients(list);
      });
      return () => {
        unsubscribeSettings();
        unsubscribeUsers();
        unsubscribePatients();
      };
    }
  }, [currentUser]);

  const visiblePatients = useMemo(() => {
    return patients.filter(p => hasAccessToPatient(p, 'patients:view'));
  }, [patients, currentUser, systemSettings]);

  const filteredPatients = useMemo(() => {
    return visiblePatients.filter(p => {
      const matchSearch = p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p?.pid?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSpecialty = !filterSpecialty || p?.specialties?.includes(filterSpecialty);
      const matchTier = !filterTier || p?.tier === filterTier;
      const matchDate = !filterDate || p?.date === filterDate;
      const matchSite = !filterSite || p?.site === filterSite;
      return matchSearch && matchSpecialty && matchTier && matchDate && matchSite;
    });
  }, [visiblePatients, searchTerm, filterSpecialty, filterTier, filterDate, filterSite]);

  const kanbanPatients = useMemo(() => {
    return visiblePatients.filter(p => {
      const isToday = p?.date === todayStr;
      const matchSite = !filterSite || p?.site === filterSite;
      return isToday && matchSite;
    });
  }, [visiblePatients, filterSite]);

  const todayStr = new Date().toISOString().split('T')[0];

  const dashMetrics = useMemo(() => {
    const filtered = visiblePatients.filter(p => p?.date === todayStr);
    let totalPatients = filtered.length;
    let vipCount = filtered.filter(p => p?.tier === 'VIP').length;
    let vvipCount = filtered.filter(p => p?.tier === 'VVIP').length;
    let totalRevenue = filtered.reduce((sum, p) => sum + (p?.totalAmount || 0), 0);
    let totalDiscount = filtered.reduce((sum, p) => sum + (p?.approvedDiscountAmount || 0), 0);
    return { totalPatients, vipCount, vvipCount, totalRevenue, totalDiscount };
  }, [visiblePatients]);

  const briefingStats = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const tomorrowPatients = visiblePatients.filter(p => p?.date === tomorrowStr);
    return {
      tomorrowPatients,
      nextWeekCount: visiblePatients.filter(p => p?.date > tomorrowStr).length,
      tomorrowDateFormatted: tomorrow.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
    };
  }, [visiblePatients]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased pb-20 md:pb-12">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 bg-white p-1">
                <img src="https://iili.io/F66acRs.png" alt="Hospital Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900">QL KH VIP-VVIP <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{userRole}</span></h1>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {canShowTab('dashboard') && <button onClick={() => { resetForm(); setActiveTab('dashboard'); }} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Bảng điều khiển</button>}
              {canShowTab('register') && <button onClick={() => { resetForm(); setActiveTab('register'); }} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'register' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Tiếp nhận</button>}
              {canShowTab('monitoring') && <button onClick={() => { resetForm(); setActiveTab('monitoring'); }} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'monitoring' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Theo dõi</button>}
              {userRole === 'admin' && <button onClick={() => setActiveTab('settings')} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Cấu hình</button>}
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="p-2 text-slate-404 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-200 transition"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && canShowTab('dashboard') && (
          <Dashboard 
            currentUser={currentUser} userRole={userRole} systemSettings={systemSettings} kanbanPatients={kanbanPatients}
            dashMetrics={dashMetrics} dashFilterMode={dashFilterMode} setDashFilterMode={setDashFilterMode}
            dashStartDate={dashStartDate} setDashStartDate={setDashStartDate} dashEndDate={dashEndDate} setDashEndDate={setDashEndDate}
            filterSite={filterSite} setFilterSite={setFilterSite} filterDate={filterDate} setFilterDate={setFilterDate}
            initiateView={initiateEdit} handleCopyText={handleCopyText} handleUpdateStatus={handleUpdateStatus}
            briefingStats={briefingStats} setFilterDateGlobal={setFilterDate} setCalendarModeGlobal={setCalendarMode}
            setActiveTabGlobal={setActiveTab} resetForm={resetForm}
          />
        )}

        {activeTab === 'register' && canShowTab('register') && (
          <PatientForm 
            currentUser={currentUser} userRole={userRole} currentId={currentId} isReadOnly={isReadOnly} setIsReadOnly={setIsReadOnly}
            formData={formData} setFormData={setFormData} newRoundingLog={newRoundingLog} setNewRoundingLog={setNewRoundingLog}
            isScanning={isScanning} setIsScanning={setIsScanning} scannerError={scannerError} setScannerError={setScannerError}
            specSearch={specSearch} setSpecSearch={setSpecSearch} isSpecDropdownOpen={isSpecDropdownOpen} setIsSpecDropdownOpen={setIsSpecDropdownOpen}
            leftFormTab={leftFormTab} setLeftFormTab={setLeftFormTab} isHistoryPanelExpanded={isHistoryPanelExpanded} setIsHistoryPanelExpanded={setIsHistoryPanelExpanded}
            handleInputChange={handleInputChange} handleCurrencyChange={handleCurrencyChange} toggleSpecialtySelection={toggleSpecialtySelection}
            handleMultipleImagesUpload={handleMultipleImagesUpload} handleToggleRecipient={handleToggleRecipient}
            handleAddRoundingLog={handleAddRoundingLog} handleDeleteRoundingLog={handleDeleteRoundingLog} savePatient={savePatient}
            resetForm={resetForm} setActiveTab={setActiveTab} initiateView={initiateView} handleCopyText={handleCopyText}
            setCopyConfirmModal={setCopyConfirmModal} registrableStaffList={registrableStaffList} patientVisitHistory={patientVisitHistory}
            linkedVisits={linkedVisits} hasAccessToPatient={hasAccessToPatient} stopScanner={stopScanner} filteredSpecialties={filteredSpecialties}
          />
        )}

        {activeTab === 'monitoring' && canShowTab('monitoring') && (
          <Monitoring 
            patients={patients} currentUser={currentUser} userRole={userRole} systemSettings={systemSettings}
            calendarMode={calendarMode} setCalendarMode={setCalendarMode} currentCalendarDate={currentCalendarDate} setCurrentCalendarDate={setCurrentCalendarDate}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterTier={filterTier} setFilterTier={setFilterTier}
            filterSpecialty={filterSpecialty} setFilterSpecialty={setFilterSpecialty} filterSite={filterSite} setFilterSite={setFilterSite}
            filterDate={filterDate} setFilterDate={setFilterDate} visiblePatients={visiblePatients} filteredPatients={filteredPatients}
            isLoading={isLoading} initiateView={initiateEdit} handleCopyText={handleCopyText} setConfirmModal={setConfirmModal}
            setLightboxImages={setLightboxImages} setLightboxIndex={setLightboxIndex} hasAccessToPatient={hasAccessToPatient}
          />
        )}

        {activeTab === 'settings' && userRole === 'admin' && (
          <SettingsTab 
            systemSettings={systemSettings} currentUser={currentUser} userRole={userRole} staffList={staffList}
            newStaff={newStaff} setNewStaff={setNewStaff} editingStaffUid={editingStaffUid} setEditingStaffUid={setEditingStaffUid}
            newSpecialtyInput={newSpecialtyInput} setNewSpecialtyInput={setNewSpecialtyInput}
          />
        )}
      </main>
    </div>
  );
}
