import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  User, 
  Phone, 
  Smartphone, 
  LogOut, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Edit, 
  Eye, 
  Plus, 
  Grid, 
  List,
  X,
  FileSpreadsheet,
  UserPlus
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  collection, 
  onSnapshot, 
  writeBatch 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0Y8Ub38jO7VGqxB57DcXdJqVcz8kUSvs",
  authDomain: "cskh-tahcm.firebaseapp.com",
  projectId: "cskh-tahcm",
  storageBucket: "cskh-tahcm.firebasestorage.app",
  messagingSenderId: "443698020583",
  appId: "1:443698020583:web:618766cb1bb69aa63da242"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "cskh-tahcm";
const APP_VERSION = "v1.2.3";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const [currentTab, setCurrentTab] = useState("profile");
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPresence, setFilterPresence] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  const [previewData, setPreviewData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [xlsxReady, setXlsxReady] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [customAlert, setCustomAlert] = useState(null);

  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newGender, setNewGender] = useState("Nữ");
  const [newRole, setNewRole] = useState("Nhân viên CSKH");
  const [newPresence, setNewPresence] = useState("Tân Bình hiện hữu");
  const [newDept, setNewDept] = useState("Khu Tiêu Chuẩn (Tầng 1 Tầng 2A B)");
  const [newGroup, setNewGroup] = useState("KHU A TẦNG 1 - TIÊU HÓA");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newHireDate, setNewHireDate] = useState("");

  useEffect(() => {
    if (window.XLSX) {
      setXlsxReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    script.async = true;
    script.onload = () => {
      setXlsxReady(true);
    };
    script.onerror = () => {
      console.error("Lỗi tải CDN XLSX");
    };
    document.head.appendChild(script);
  }, []);

  const formatDate = (val) => {
    if (!val) return "";
    if (typeof val === "number") {
      const date = new Date((val - 25569) * 86400 * 1000);
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    }
    const str = String(val).trim();
    if (str.includes("/")) {
      return str; 
    }
    if (str.includes("-")) {
      const parts = str.split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
        }
        return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[2]}`;
      }
    }
    return str;
  };

  const convertToDDMMYYYY = (yyyyMMdd) => {
    if (!yyyyMMdd) return "";
    const parts = yyyyMMdd.split("-");
    if (parts.length !== 3) return yyyyMMdd;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const calculateSeniority = (hireDateStr) => {
    if (!hireDateStr) return "Chưa rõ";
    let day, month, year;
    if (hireDateStr.includes("/")) {
      const parts = hireDateStr.split("/");
      if (parts.length === 3) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    } else if (hireDateStr.includes("-")) {
      const parts = hireDateStr.split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          day = parseInt(parts[2], 10);
        } else {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          year = parseInt(parts[2], 10);
        }
      }
    }
    if (day === undefined || month === undefined || year === undefined) return "Chưa rõ";
    const hireDate = new Date(year, month, day);
    if (isNaN(hireDate.getTime())) return "Chưa rõ";
    
    const today = new Date();
    let diffYears = today.getFullYear() - hireDate.getFullYear();
    let diffMonths = today.getMonth() - hireDate.getMonth();
    
    if (diffMonths < 0) {
      diffYears--;
      diffMonths += 12;
    }
    
    if (diffYears > 0) {
      return `${diffYears} năm ${diffMonths} tháng`;
    }
    return `${diffMonths} tháng`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "artifacts", appId, "public", "data", "users", currentUser.uid);
        let userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists() && currentUser.email) {
          const emailKey = currentUser.email.toLowerCase().trim();
          const tempDocRef = doc(db, "artifacts", appId, "public", "data", "users", emailKey);
          const tempDoc = await getDoc(tempDocRef);
          
          if (tempDoc.exists()) {
            const data = tempDoc.data();
            data.uid = currentUser.uid;
            if (data.systemAuth) {
              data.systemAuth.uid = currentUser.uid;
            }
            await setDoc(userDocRef, data);
            try {
              await deleteDoc(tempDocRef);
            } catch (e) {
              console.error(e);
            }
            userDoc = await getDoc(userDocRef);
          }
        }

        if (userDoc.exists()) {
          setUser({ uid: currentUser.uid, ...userDoc.data() });
        } else {
          const isDomainAllowed = currentUser.email && (
            currentUser.email.includes("cuongngq") || 
            currentUser.email.includes("admin") || 
            currentUser.email.endsWith("tahospital.vn") || 
            currentUser.email.endsWith("tamanhhospital.vn")
          );
          if (isDomainAllowed) {
            const bootstrapData = {
              uid: currentUser.uid,
              systemAuth: {
                email: currentUser.email,
                role: "admin",
                uid: currentUser.uid
              },
              personalInfo: {
                fullName: currentUser.email.split("@")[0].toUpperCase(),
                employeeId: "TA-BOOTSTRAP",
                gender: "Nam",
                phone: "0909000000",
                birthDate: "24/12/1997"
              },
              orgStructure: {
                department: "Ban Giám Đốc",
                division: "Ban Giám Đốc",
                group: "VĂN PHÒNG"
              },
              jobInfo: {
                roleTitle: "Quản trị hệ thống khởi tạo",
                competencyLevel: "O",
                legalEntity: "Bệnh viện Đa khoa Tâm Anh",
                specialization: "Hành chính"
              },
              employmentLifecycle: {
                status: "working",
                presenceStatus: "Tân Bình hiện hữu",
                onboardingBatch: "O",
                hireDate: "09/03/2021"
              }
            };
            await setDoc(userDocRef, bootstrapData);
            setUser({ uid: currentUser.uid, ...bootstrapData });
          } else {
            setAuthError("Email này chưa được phê duyệt kích hoạt Whitelist. Vui lòng liên hệ Admin.");
            await signOut(auth);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const usersCollection = collection(db, "artifacts", appId, "public", "data", "users");
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersList = [];
      snapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setAllUsers(usersList);
    }, (error) => {
      console.error(error);
    });
    return () => unsubscribe();
  }, [user]);

  const showNotification = (title, message, type = "info") => {
    setCustomAlert({ title, message, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch (err) {
      setAuthError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    
    if (authPassword !== registerConfirmPassword) {
      setAuthError("Mật khẩu nhập lại không khớp.");
      setAuthLoading(false);
      return;
    }

    const emailKey = authEmail.toLowerCase().trim();
    try {
      const tempDocRef = doc(db, "artifacts", appId, "public", "data", "users", emailKey);
      const tempDoc = await getDoc(tempDocRef);
      
      if (!tempDoc.exists()) {
        setAuthError("Email của bạn không nằm trong danh sách Whitelist của bệnh viện. Vui lòng liên hệ Admin.");
        setAuthLoading(false);
        return;
      }

      await createUserWithEmailAndPassword(auth, emailKey, authPassword);
      showNotification("Thành công", "Tài khoản của bạn đã được kích hoạt thành công trên hệ thống!", "success");
      setAuthMode("login");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setAuthError("Email này đã được kích hoạt tài khoản trước đó.");
      } else {
        setAuthError("Lỗi đăng ký kích hoạt: " + err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentTab("profile");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newEmployeeId || !newFullName || !newEmail) {
      showNotification("Cảnh báo", "Vui lòng điền đầy đủ các trường thông tin bắt buộc.", "error");
      return;
    }
    const emailKey = newEmail.toLowerCase().trim();
    try {
      const userDocRef = doc(db, "artifacts", appId, "public", "data", "users", emailKey);
      const payload = {
        uid: emailKey,
        systemAuth: {
          email: emailKey,
          role: newRole.includes("Admin") || newRole.includes("Quản trị") ? "admin" : "user",
          uid: emailKey
        },
        personalInfo: {
          fullName: newFullName,
          employeeId: newEmployeeId,
          gender: newGender,
          phone: newPhone,
          birthDate: convertToDDMMYYYY(newBirthDate)
        },
        orgStructure: {
          department: newDept,
          division: "Phòng Chăm Sóc Khách Hàng",
          group: newGroup
        },
        jobInfo: {
          roleTitle: newRole,
          competencyLevel: "O",
          legalEntity: "Bệnh viện Đa khoa Tâm Anh TP Hồ Chí Minh",
          specialization: "CSKH"
        },
        employmentLifecycle: {
          status: "working",
          presenceStatus: newPresence,
          onboardingBatch: "O",
          hireDate: convertToDDMMYYYY(newHireDate)
        }
      };
      await setDoc(userDocRef, payload);
      showNotification("Thành công", "Đã thêm thành công nhân viên vào danh sách Whitelist!", "success");
      setNewEmployeeId("");
      setNewFullName("");
      setNewEmail("");
      setNewPhone("");
      setNewBirthDate("");
      setNewHireDate("");
    } catch (err) {
      showNotification("Lỗi", "Lỗi khi thêm nhân viên: " + err.message, "error");
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const userDocRef = doc(db, "artifacts", appId, "public", "data", "users", userId);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedData = {
          ...userData,
          employmentLifecycle: {
            ...userData.employmentLifecycle,
            status: newStatus
          }
        };
        await setDoc(userDocRef, updatedData);
        setIsEditModalOpen(false);
        showNotification("Thành công", "Đã cập nhật trạng thái nhân viên thành công.", "success");
      }
    } catch (err) {
      showNotification("Lỗi", "Lỗi cập nhật: " + err.message, "error");
    }
  };

  const downloadTemplate = () => {
    const XLSXLib = window.XLSX;
    if (!XLSXLib) {
      showNotification("Thông báo", "Thư viện Excel đang được tải. Vui lòng đợi trong giây lát.", "info");
      return;
    }
    const headers = [
      ["Mã Nhân Viên", "Họ Và Tên", "Email", "Số Điện Thoại", "Giới Tính", "Ngày Sinh", "Ngày Nhận Việc", "Vai Trò Hệ Thống", "Hiện Hữu", "Đơn Vị", "Nhóm Trực"]
    ];
    const sampleData = [
      ["TA2.1421", "Nguyễn Quốc Cường", "cuongnq@tahospital.vn", "0376317501", "Nam", "24/12/1997", "09/03/2021", "Quản trị hệ thống", "Tân Bình hiện hữu", "Phòng Chăm Sóc Khách Hàng", "Khu Tiêu chuẩn Tòa D"],
      ["TA2.3005", "Trần Thị Mai", "maitt@tahospital.vn", "0909123456", "Nữ", "15/08/1995", "01/06/2026", "Nhân viên CSKH", "Tân Bình hiện hữu", "Khu Tiêu Chuẩn (Tầng 1 Tầng 2A B)", "KHU A TẦNG 1 - TIÊU HÓA"]
    ];
    const ws = XLSXLib.utils.aoa_to_sheet([...headers, ...sampleData]);
    const wb = XLSXLib.utils.book_new();
    XLSXLib.utils.book_append_sheet(wb, ws, "Danh_Sach_Nhan_Su");
    XLSXLib.writeFile(wb, "File_Mau_Import_Nhan_Su.xlsx");
  };

  const handleFileUpload = (e) => {
    const XLSXLib = window.XLSX;
    if (!XLSXLib) {
      setImportStatus({ type: "error", message: "Hệ thống đang tải nạp thư viện bổ trợ. Vui lòng thử lại." });
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSXLib.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSXLib.utils.sheet_to_json(worksheet, { header: 1 });
        if (rawJson.length <= 1) {
          setImportStatus({ type: "error", message: "File rỗng hoặc không đúng định dạng mẫu." });
          return;
        }
        const rows = rawJson.slice(1);
        const parsedRows = rows.map((row) => {
          return {
            employeeId: row[0] ? String(row[0]).trim() : "",
            fullName: row[1] ? String(row[1]).trim() : "",
            email: row[2] ? String(row[2]).trim() : "",
            phone: row[3] ? String(row[3]).trim() : "",
            gender: row[4] ? String(row[4]).trim() : "Nữ",
            birthDate: formatDate(row[5]),
            hireDate: formatDate(row[6]),
            role: row[7] ? String(row[7]).trim() : "Nhân viên CSKH",
            presence: row[8] ? String(row[8]).trim() : "Tân Bình hiện hữu",
            dept: row[9] ? String(row[9]).trim() : "Phòng Chăm Sóc Khách Hàng",
            group: row[10] ? String(row[10]).trim() : "VĂN PHÒNG"
          };
        }).filter(item => item.email && item.employeeId && item.fullName);
        setPreviewData(parsedRows);
        setImportStatus({ type: "info", message: `Đã đọc thành công ${parsedRows.length} dòng dữ liệu hợp lệ. Vui lòng kiểm tra lại bảng xem trước.` });
      } catch (err) {
        setImportStatus({ type: "error", message: "Đọc file lỗi: " + err.message });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBatchImport = async () => {
    if (previewData.length === 0) {
      showNotification("Cảnh báo", "Không có dữ liệu xem trước để nạp.", "error");
      return;
    }
    setImportLoading(true);
    setImportStatus({ type: "info", message: "Đang tiến hành nạp dữ liệu lên Firestore..." });
    try {
      const batchSize = 100;
      let count = 0;
      for (let i = 0; i < previewData.length; i += batchSize) {
        const chunk = previewData.slice(i, i + batchSize);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          const emailKey = item.email.toLowerCase().trim();
          const userDocRef = doc(db, "artifacts", appId, "public", "data", "users", emailKey);
          const payload = {
            uid: emailKey,
            systemAuth: {
              email: emailKey,
              role: item.role.includes("Admin") || item.role.includes("Quản trị") ? "admin" : "user",
              uid: emailKey
            },
            personalInfo: {
              fullName: item.fullName,
              employeeId: item.employeeId,
              gender: item.gender,
              phone: item.phone,
              birthDate: item.birthDate
            },
            orgStructure: {
              department: item.dept,
              division: "Phòng Chăm Sóc Khách Hàng",
              group: item.group
            },
            jobInfo: {
              roleTitle: item.role,
              competencyLevel: "O",
              legalEntity: "Bệnh viện Đa khoa Tâm Anh TP Hồ Chí Minh",
              specialization: "CSKH"
            },
            employmentLifecycle: {
              status: "working",
              presenceStatus: item.presence,
              onboardingBatch: "O",
              hireDate: item.hireDate
            }
          };
          batch.set(userDocRef, payload);
          count++;
        });
        await batch.commit();
      }
      setImportStatus({ type: "success", message: `Đồng bộ thành công ${count} nhân sự lên hệ thống Cloud Firestore!` });
      setPreviewData([]);
      showNotification("Thành công", `Đã nạp thành công ${count} nhân viên mới vào danh sách Whitelist. Nhân viên có thể tự kích hoạt tài khoản của họ ngay bây giờ.`, "success");
    } catch (err) {
      setImportStatus({ type: "error", message: "Lỗi đồng bộ hàng loạt: " + err.message });
      showNotification("Lỗi", "Không thể nạp dữ liệu hàng loạt: " + err.message, "error");
    } finally {
      setImportLoading(false);
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    const fullName = u.personalInfo?.fullName || "";
    const empId = u.personalInfo?.employeeId || "";
    const email = u.systemAuth?.email || "";
    const matchesSearch = 
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    const presence = u.employmentLifecycle?.presenceStatus || "";
    const matchesPresence = filterPresence === "all" || presence === filterPresence;

    const role = u.systemAuth?.role || "";
    const matchesRole = filterRole === "all" || role === filterRole;

    const status = u.employmentLifecycle?.status || "";
    const matchesStatus = filterStatus === "all" || status === filterStatus;

    const dept = u.orgStructure?.department || "";
    const matchesDept = filterDept === "all" || dept === filterDept;

    return matchesSearch && matchesPresence && matchesRole && matchesStatus && matchesDept;
  });

  const totalEmployees = allUsers.length;
  const workingEmployees = allUsers.filter(u => u.employmentLifecycle?.status === "working").length;
  const leaveEmployees = allUsers.filter(u => u.employmentLifecycle?.status === "leave").length;
  const trainingEmployees = allUsers.filter(u => u.employmentLifecycle?.status === "training").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Đang kết nối hệ thống bảo mật...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 p-4 rounded-full border border-blue-100">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-1">Bệnh Viện Tâm Anh</h2>
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">Portal CSKH - Xác thực nội bộ</p>
          
          <div className="flex border-b border-slate-200 mb-6">
            <button 
              type="button"
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition ${authMode === "login" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
            >
              Đăng Nhập
            </button>
            <button 
              type="button"
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition ${authMode === "register" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
            >
              Đăng Ký Kích Hoạt
            </button>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start space-x-3 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email của bạn</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400" 
                  placeholder="nhanvien@tahospital.vn"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mật khẩu</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400" 
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex justify-center items-center space-x-2 transition disabled:opacity-50"
              >
                <span>Xác Thực Truy Cập</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                Nhân viên mới chỉ cần nhập email bệnh viện đã được duyệt, hệ thống sẽ tự động kích hoạt tài khoản Whitelist.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email công vụ của bạn *</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400" 
                  placeholder="cuongnq@tahospital.vn"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tạo mật khẩu đăng nhập *</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400" 
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nhập lại mật khẩu *</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400" 
                  placeholder="••••••••"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 flex justify-center items-center space-x-2 transition disabled:opacity-50"
              >
                <UserPlus className="h-5 w-5" />
                <span>Kích Hoạt Tài Khoản</span>
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center items-center space-x-2 text-slate-400 text-xs font-medium">
            <Shield className="h-4 w-4" />
            <span>Hệ thống kiểm duyệt an toàn đa thiết bị.</span>
          </div>
        </div>
        <footer className="mt-8 text-center text-xs text-slate-500 font-semibold space-y-1">
          <p>Phòng Chăm Sóc Khách Hàng © 2026</p>
          <p className="text-slate-400">CSKH PORTAL - {APP_VERSION}</p>
        </footer>
      </div>
    );
  }

  const userRole = user.systemAuth?.role || "user";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">CSKH PORTAL</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bệnh viện Tâm Anh</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user.personalInfo?.fullName || "NHÂN VIÊN"}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{userRole === "admin" ? "IT / QUẢN TRỊ HỆ THỐNG" : "NHÂN VIÊN CSKH"}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-xl font-semibold transition text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Thoát</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-3">
            <button 
              onClick={() => setCurrentTab("profile")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-semibold transition text-sm ${currentTab === "profile" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10" : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"}`}
            >
              <User className="h-5 w-5" />
              <span>Hồ sơ cá nhân</span>
            </button>
            <button 
              onClick={() => setCurrentTab("phone")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-semibold transition text-sm ${currentTab === "phone" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10" : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"}`}
            >
              <Phone className="h-5 w-5" />
              <span>Sửa số điện thoại</span>
            </button>
            {userRole === "admin" && (
              <button 
                onClick={() => setCurrentTab("users")}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-semibold transition text-sm ${currentTab === "users" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10" : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"}`}
              >
                <Users className="h-5 w-5" />
                <span>Quản lý nhân sự</span>
              </button>
            )}
            <button 
              onClick={() => setCurrentTab("device")}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-semibold transition text-sm ${currentTab === "device" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10" : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"}`}
            >
              <Smartphone className="h-5 w-5" />
              <span>Định danh thiết bị</span>
            </button>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mt-6">
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">An toàn hệ thống</h3>
              <p className="text-xs text-blue-600 leading-relaxed">Mã thiết bị và Token truyền tin của bạn được liên kết trực tiếp trên máy chủ.</p>
            </div>
          </aside>

          <main className="lg:col-span-3">
            {currentTab === "profile" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
                  <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Thông Tin Hồ Sơ Cá Nhân</h2>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Dữ liệu gốc đồng bộ từ hệ thống nhân sự</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Họ và tên</p>
                    <p className="text-sm font-bold text-slate-900">{user.personalInfo?.fullName || "Không rõ"}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mã nhân viên</p>
                    <p className="text-sm font-bold text-slate-900">{user.personalInfo?.employeeId || "Không rõ"}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email hệ thống</p>
                    <p className="text-sm font-bold text-slate-900">{user.systemAuth?.email || "Không rõ"}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Số điện thoại liên hệ</p>
                    <p className="text-sm font-bold text-slate-900">{user.personalInfo?.phone || "Không rõ"}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Địa điểm làm việc hiện hữu</p>
                    <p className="text-sm font-bold text-slate-900">{user.employmentLifecycle?.presenceStatus || "Không rõ"}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bộ phận / Đơn vị</p>
                    <p className="text-sm font-bold text-slate-900">{user.orgStructure?.department || "Không rõ"}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Thâm niên công tác</p>
                    <p className="text-sm font-bold text-blue-600">{calculateSeniority(user.employmentLifecycle?.hireDate)}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 md:col-span-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nhóm trực / Vị trí phân công chi tiết</p>
                    <p className="text-sm font-bold text-slate-900">{user.orgStructure?.group || "Không rõ"}</p>
                  </div>
                </div>
              </div>
            )}

            {currentTab === "phone" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
                  <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Thay Đổi Số Điện Thoại</h2>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Cập nhật thông tin khẩn cấp liên hệ</p>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 flex items-start space-x-3 text-yellow-800 text-xs">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-yellow-600" />
                  <span>Việc đổi số điện thoại sẽ yêu cầu máy chủ quét lại mã định danh thiết bị ở phiên làm việc tiếp theo. Bạn hãy điền chính xác số đang sử dụng trên máy.</span>
                </div>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Số điện thoại hiện tại</label>
                    <input type="text" disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-semibold" value={user.personalInfo?.phone || "Chưa thiết lập"} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Số điện thoại mới</label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 rounded-xl font-semibold placeholder-slate-400" placeholder="Nhập 10 số di động mới" />
                  </div>
                  <button className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition">
                    <span>Xác Nhận Thay Đổi</span>
                  </button>
                </div>
              </div>
            )}

            {currentTab === "device" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
                  <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Mã Định Danh Thiết Bị (PWA Link)</h2>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Xác thực rào cản đa thiết bị</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start space-x-3 text-blue-800 text-xs">
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
                  <span>Thiết bị của bạn đã được kiểm duyệt và ghi nhận mã bảo vệ an toàn. Mọi dữ liệu thao tác trên máy tính này đều được mã hóa bằng chữ ký số định danh.</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200/80 rounded-xl p-5 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hệ điều hành thiết bị</p>
                    <p className="text-sm font-bold text-slate-900">Chrome Browser - Windows 10/11</p>
                  </div>
                  <div className="border border-slate-200/80 rounded-xl p-5 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mã Token liên kết</p>
                    <p className="text-sm font-mono font-bold text-slate-900">tok_946a_3df5_c2ef</p>
                  </div>
                </div>
              </div>
            )}

            {currentTab === "users" && userRole === "admin" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng nhân sự</p>
                    <p className="text-2xl font-extrabold text-slate-900">{totalEmployees}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Đang làm việc</p>
                    <p className="text-2xl font-extrabold text-green-600">{workingEmployees}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nghỉ phép/Thai sản</p>
                    <p className="text-2xl font-extrabold text-yellow-600">{leaveEmployees}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Đang đào tạo</p>
                    <p className="text-2xl font-extrabold text-blue-600">{trainingEmployees}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                  <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-bold text-slate-950">Đồng Bộ Nhập Dữ Liệu Lớn Hàng Loạt (Excel / CSV)</h3>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 leading-relaxed space-y-2">
                    <p className="font-bold text-slate-900">Cách sử dụng trình Import thông minh:</p>
                    <p>1. Tải file mẫu cấu hình sẵn tiêu đề cột bằng cách bấm nút <span className="font-semibold text-blue-600">"Tải File Excel Mẫu"</span>.</p>
                    <p>2. Điền thông tin nhân viên (Lưu ý: <span className="font-semibold text-slate-900">Mã Nhân Viên</span>, <span className="font-semibold text-slate-900">Họ Và Tên</span> và <span className="font-semibold text-red-600">Email</span> là các trường bắt buộc để tự động kích hoạt tài khoản Whitelist).</p>
                    <p>3. Kéo thả file Excel đã lưu vào vùng tải lên dưới đây để kiểm tra dữ liệu trước khi đẩy lên mây.</p>
                  </div>
                  {importStatus && (
                    <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${importStatus.type === "error" ? "bg-red-50 border-red-100 text-red-700" : importStatus.type === "success" ? "bg-green-50 border-green-100 text-green-700" : "bg-blue-50 border-blue-100 text-blue-700"}`}>
                      {importStatus.type === "error" ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" /> : <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />}
                      <span>{importStatus.message}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={downloadTemplate}
                      disabled={!xlsxReady}
                      className="flex items-center space-x-2 px-5 py-3 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 font-bold rounded-xl transition text-xs disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>{xlsxReady ? "Tải File Excel Mẫu" : "Đang tải thư viện..."}</span>
                    </button>
                    <label className={`flex items-center space-x-2 px-5 py-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold rounded-xl cursor-pointer transition text-xs ${!xlsxReady ? "opacity-50 pointer-events-none" : ""}`}>
                      <Upload className="h-4 w-4" />
                      <span>Chọn file từ máy tính</span>
                      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} disabled={!xlsxReady} className="hidden" />
                    </label>
                  </div>
                  {previewData.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xem trước danh sách chuẩn bị nạp ({previewData.length} người)</p>
                        <button 
                          onClick={handleBatchImport}
                          disabled={importLoading}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/10 flex items-center space-x-2 disabled:opacity-50"
                        >
                          {importLoading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>}
                          <span>Bắt Đầu Nạp Hàng Loạt</span>
                        </button>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-64">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider">Mã NV</th>
                              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider">Họ và Tên</th>
                              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider">Email</th>
                              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider">Điện thoại</th>
                              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider">Ngày Sinh</th>
                              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider">Ngày Nhận Việc</th>
                              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider">Vai Trò</th>
                              <th className="p-3 font-bold text-slate-700 uppercase tracking-wider">Địa Điểm</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-900">{item.employeeId}</td>
                                <td className="p-3 font-bold text-slate-900">{item.fullName}</td>
                                <td className="p-3 text-slate-600">{item.email}</td>
                                <td className="p-3 text-slate-600">{item.phone}</td>
                                <td className="p-3 text-slate-600 font-semibold">{item.birthDate}</td>
                                <td className="p-3 text-blue-600 font-bold">{item.hireDate}</td>
                                <td className="p-3 text-slate-600">{item.role}</td>
                                <td className="p-3 text-slate-600">{item.presence}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                  <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-950">Thêm Mới Nhân Sự Whitelist Đăng Nhập</h3>
                  </div>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Mã nhân viên *</label>
                      <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium" placeholder="TA2.xxxx" value={newEmployeeId} onChange={(e) => setNewEmployeeId(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Họ và tên *</label>
                      <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Nhập họ và tên" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Email xác thực đăng nhập *</label>
                      <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium" placeholder="nhanvien@tahospital.vn" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Số điện thoại</label>
                      <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Nhập số điện thoại liên hệ" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Ngày sinh</label>
                      <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium" value={newBirthDate} onChange={(e) => setNewBirthDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Ngày nhận việc</label>
                      <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium" value={newHireDate} onChange={(e) => setNewHireDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Giới tính</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-semibold" value={newGender} onChange={(e) => setNewGender(e.target.value)}>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Vai trò hệ thống (Phân quyền)</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-semibold" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                        <option value="Nhân viên CSKH">Nhân viên CSKH</option>
                        <option value="Quản lý CSKH">Quản lý CSKH</option>
                        <option value="Lãnh đạo phòng (Phó Giám Đốc)">Lãnh đạo phòng (Phó Giám Đốc)</option>
                        <option value="Quản trị hệ thống">Quản trị hệ thống</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Hiện hữu (Cơ sở trực chiến)</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-semibold" value={newPresence} onChange={(e) => setNewPresence(e.target.value)}>
                        <option value="Tân Bình hiện hữu">Tân Bình hiện hữu</option>
                        <option value="Quận 2 dự kiến">Quận 2 dự kiến</option>
                        <option value="Tòa D làm việc">Tòa D làm việc</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Đơn vị (Phân khu lớn)</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-semibold" value={newDept} onChange={(e) => setNewDept(e.target.value)}>
                        <option value="Phòng Chăm Sóc Khách Hàng">Phòng Chăm Sóc Khách Hàng</option>
                        <option value="Khu Tiêu Chuẩn (Tầng 1 Tầng 2A B)">Khu Tiêu Chuẩn (Tầng 1 Tầng 2A B)</option>
                        <option value="Khu VIP (Tầng 3 Tầng 4 Tòa B)">Khu VIP (Tầng 3 Tầng 4 Tòa B)</option>
                        <option value="Khu Quốc Tế">Khu Quốc Tế</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Nhóm trực (Điểm trực chi tiết)</label>
                      <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Nhập điểm trực cụ thể" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} />
                    </div>
                    <div className="md:col-span-3">
                      <button type="submit" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition text-xs">
                        <Plus className="h-4 w-4" />
                        <span>Thêm và Kích hoạt Whitelist</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-slate-950">Danh Sách Nhân Sự Thực Tế</h3>
                    </div>
                    <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50/50">
                      <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg transition ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><List className="h-4 w-4" /></button>
                      <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><Grid className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tìm tên, mã, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterPresence} onChange={(e) => setFilterPresence(e.target.value)}>
                        <option value="all">Mọi cơ sở</option>
                        <option value="Tân Bình hiện hữu">Tân Bình hiện hữu</option>
                        <option value="Quận 2 dự kiến">Quận 2 dự kiến</option>
                        <option value="Tòa D làm việc">Tòa D làm việc</option>
                      </select>
                    </div>
                    <div>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Mọi trạng thái</option>
                        <option value="working">Đang làm việc</option>
                        <option value="leave">Nghỉ phép/Thai sản</option>
                        <option value="training">Đang đào tạo</option>
                      </select>
                    </div>
                    <div>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                        <option value="all">Mọi Đơn vị</option>
                        <option value="Phòng Chăm Sóc Khách Hàng">Phòng CSKH</option>
                        <option value="Khu Tiêu Chuẩn (Tầng 1 Tầng 2A B)">Khu Tiêu Chuẩn</option>
                        <option value="Khu VIP (Tầng 3 Tầng 4 Tòa B)">Khu VIP</option>
                        <option value="Khu Quốc Tế">Khu Quốc Tế</option>
                      </select>
                    </div>
                  </div>

                  {viewMode === "table" ? (
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-wider">Mã NV</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-wider">Họ và Tên</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-wider">Email</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-wider">Cơ sở / Đơn vị</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-wider">Trạng thái</th>
                            <th className="p-4 font-bold text-slate-700 uppercase tracking-wider text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-4 font-bold text-slate-900">{u.personalInfo?.employeeId || "Chưa rõ"}</td>
                              <td className="p-4 font-bold text-slate-900">{u.personalInfo?.fullName || "Chưa rõ"}</td>
                              <td className="p-4 text-slate-600">{u.systemAuth?.email || "Chưa rõ"}</td>
                              <td className="p-4">
                                <p className="font-bold text-slate-900">{u.employmentLifecycle?.presenceStatus || "Chưa rõ"}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{u.orgStructure?.department || "Chưa rõ"}</p>
                                <p className="text-[10px] text-blue-600 font-semibold">Thâm niên: {calculateSeniority(u.employmentLifecycle?.hireDate)}</p>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.employmentLifecycle?.status === "working" ? "bg-green-50 text-green-700" : u.employmentLifecycle?.status === "leave" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-700"}`}>
                                  {u.employmentLifecycle?.status === "working" ? "Đang làm việc" : u.employmentLifecycle?.status === "leave" ? "Nghỉ phép" : "Đào tạo"}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button onClick={() => { setSelectedUser(u); setIsDetailModalOpen(true); }} className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 inline-flex items-center"><Eye className="h-3.5 w-3.5" /></button>
                                <button onClick={() => { setSelectedUser(u); setIsEditModalOpen(true); }} className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-blue-600 inline-flex items-center"><Edit className="h-3.5 w-3.5" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredUsers.map((u) => (
                        <div key={u.id} className="bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 transition space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{u.personalInfo?.fullName || "Chưa rõ"}</p>
                              <p className="text-xs text-slate-500 font-semibold">Mã NV: {u.personalInfo?.employeeId || "Chưa rõ"} | Thâm niên: {calculateSeniority(u.employmentLifecycle?.hireDate)}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${u.systemAuth?.role === "admin" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}>
                              {u.systemAuth?.role === "admin" ? "ADMIN" : "MEMBER"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đơn vị</p>
                              <p className="font-bold text-slate-900 line-clamp-1">{u.orgStructure?.department || "Chưa rõ"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trực chiến</p>
                              <p className="font-bold text-slate-900">{u.employmentLifecycle?.presenceStatus || "Chưa rõ"}</p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                            <button onClick={() => { setSelectedUser(u); setIsDetailModalOpen(true); }} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-lg text-[10px] flex items-center space-x-1"><Eye className="h-3.5 w-3.5" /><span>Xem chi tiết</span></button>
                            <button onClick={() => { setSelectedUser(u); setIsEditModalOpen(true); }} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 font-bold rounded-lg text-[10px] flex items-center space-x-1"><Edit className="h-3.5 w-3.5" /><span>Sửa đổi</span></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><User className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Chi Tiết Hồ Sơ Nhân Viên</h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mã NV: {selectedUser.personalInfo?.employeeId}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Họ và tên</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.personalInfo?.fullName}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Email đăng nhập</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.systemAuth?.email}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Số điện thoại</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.personalInfo?.phone || "Chưa đăng ký"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Giới tính</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.personalInfo?.gender}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Ngày sinh</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.personalInfo?.birthDate || "Chưa cập nhật"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Ngày nhận việc</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.employmentLifecycle?.hireDate || "Chưa cập nhật"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Thâm niên hiện tại</p>
                <p className="font-bold text-blue-600 text-sm">{calculateSeniority(selectedUser.employmentLifecycle?.hireDate)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Cơ sở hiện hữu</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.employmentLifecycle?.presenceStatus}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Vai trò hệ thống</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.jobInfo?.roleTitle}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1 md:col-span-2">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Đơn vị (Phân khu lớn)</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.orgStructure?.department}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1 md:col-span-2">
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Nhóm trực (Địa điểm trực chi tiết)</p>
                <p className="font-bold text-slate-900 text-sm">{selectedUser.orgStructure?.group}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition">Đóng hộp thoại</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 border border-slate-200 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Cập Nhật Trạng Thái Làm Việc</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 text-xs">
              <p className="text-slate-600 font-semibold">Cập nhật trạng thái công tác của nhân viên <span className="font-bold text-slate-900">{selectedUser.personalInfo?.fullName}</span> (Mã NV: {selectedUser.personalInfo?.employeeId}):</p>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleUpdateUserStatus(selectedUser.id, "working")} className={`py-3 rounded-xl font-bold transition border ${selectedUser.employmentLifecycle?.status === "working" ? "bg-green-50 border-green-200 text-green-700" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"}`}>Đang làm việc</button>
                <button onClick={() => handleUpdateUserStatus(selectedUser.id, "leave")} className={`py-3 rounded-xl font-bold transition border ${selectedUser.employmentLifecycle?.status === "leave" ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"}`}>Nghỉ phép</button>
                <button onClick={() => handleUpdateUserStatus(selectedUser.id, "training")} className={`py-3 rounded-xl font-bold transition border ${selectedUser.employmentLifecycle?.status === "training" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"}`}>Đang đào tạo</button>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <p className="font-bold text-red-600">Bảo mật thiết bị:</p>
                <button className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold rounded-xl transition">Xóa liên kết thiết bị hiện tại</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {customAlert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              {customAlert.type === "error" ? (
                <AlertCircle className="h-6 w-6 text-red-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
              <h4 className="text-sm font-extrabold text-slate-900">{customAlert.title}</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">{customAlert.message}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setCustomAlert(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
          <p>Phòng Chăm Sóc Khách Hàng © 2026</p>
          <p className="text-slate-400">CSKH PORTAL - {APP_VERSION}</p>
        </div>
      </footer>
    </div>
  );
}
