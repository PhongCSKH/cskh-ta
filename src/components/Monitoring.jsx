import React, { useMemo } from 'react';
import { Search, Sparkles, Calendar, ImageIcon, Edit3, Trash2, Lock, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';

const sites = [
  { id: 'tsh', label: 'BV Tâm Anh - Tân Sơn Hòa', bg: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500', cardBg: 'bg-[#f0f9ff] border-[#bae6fd] hover:border-[#7dd3fc]' },
  { id: 'th', label: 'PK Tâm Anh - Tân Hưng', bg: 'bg-violet-50 text-violet-700 border-violet-200/80', dot: 'bg-violet-500', cardBg: 'bg-[#faf5ff] border-[#e9d5ff] hover:border-[#d8b4fe]' },
  { id: 'ch', label: 'BV Tâm Anh - Chánh Hưng', bg: 'bg-teal-50 text-teal-700 border-teal-200/80', dot: 'bg-teal-500', cardBg: 'bg-[#f0fdf4] border-[#bbf7d0] hover:border-[#86efac]' }
];

const formatDateVN = (dateStr) => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const formatCurrency = (number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number || 0);
};

const maskName = (name) => {
  if (!name) return '---';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const maskedParts = parts.map((part, index) => {
    if (index === parts.length - 1) {
      return part;
    }
    if (part.length > 1) {
      return part[0] + '*'.repeat(part.length - 1);
    }
    return part;
  });
  return maskedParts.join(' ');
};

const maskPID = (pid) => {
  if (!pid) return '---';
  const cleanPid = pid.trim();
  if (cleanPid.length <= 6) {
    return cleanPid;
  }
  return cleanPid.slice(0, 2) + '*'.repeat(cleanPid.length - 6) + cleanPid.slice(-4);
};

export default function Monitoring({
  patients,
  currentUser,
  userRole,
  systemSettings,
  calendarMode,
  setCalendarMode,
  currentCalendarDate,
  setCurrentCalendarDate,
  searchTerm,
  setSearchTerm,
  filterTier,
  setFilterTier,
  filterSpecialty,
  setFilterSpecialty,
  filterSite,
  setFilterSite,
  filterDate,
  setFilterDate,
  visiblePatients,
  filteredPatients,
  isLoading,
  handleCalendarNavigate,
  initiateView,
  handleCopyText,
  setConfirmModal,
  setLightboxImages,
  setLightboxIndex,
  hasAccessToPatient,
  isFirebaseConnected,
  db,
  doc,
  deleteDoc,
  appId,
  showNotification
}) {
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
    for (let i = 0; i < adjustedFirstDayIndex; i++) days.push(null);
    for (let i = 1; i <= totalDaysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentCalendarDate]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-black text-slate-955 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" /> Theo Dõi Hồ Sơ Khách Hàng VIP-VVIP
        </h2>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center flex-wrap gap-3">
        <div className="flex bg-slate-101 p-1 rounded-xl">
          <button onClick={() => setCalendarMode('list')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${calendarMode === 'list' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-550 hover:text-slate-805'}`}>Dạng Danh Sách</button>
          <button onClick={() => { setCalendarMode('week'); setCurrentCalendarDate(new Date()); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${calendarMode === 'week' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-550 hover:text-slate-805'}`}>Lịch Tuần</button>
          <button onClick={() => { setCalendarMode('month'); setCurrentCalendarDate(new Date()); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${calendarMode === 'month' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-550 hover:text-slate-805'}`}>Lịch Tháng</button>
        </div>
        {calendarMode !== 'list' && (
          <div className="flex items-center gap-2">
            <button onClick={() => handleCalendarNavigate('prev')} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-extrabold text-slate-800 min-w-[120px] text-center">
              {calendarMode === 'week' ? `Tuần ${formatDateVN(weekDays[0].toISOString().split('T')[0])}` : `Tháng ${currentCalendarDate.getMonth() + 1} / ${currentCalendarDate.getFullYear()}`}
            </span>
            <button onClick={() => handleCalendarNavigate('next')} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {calendarMode === 'list' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-404" />
              <input type="text" placeholder="Tìm theo tên, mã PID, ghi chú..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden text-xs font-bold bg-white" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"><option value="">Tất cả hạng</option><option value="VIP">VIP</option><option value="VVIP">VVIP</option></select>
              <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"><option value="">Tất cả chuyên khoa</option>{systemSettings.specialties.map((spec, idx) => (<option key={idx} value={spec}>{spec}</option>))}</select>
              <select value={filterSite} onChange={(e) => setFilterSite(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"><option value="">Tất cả Site</option>{sites.map(s => (<option key={s.id} value={s.label}>{s.label}</option>))}</select>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white" />
              {(searchTerm || filterTier || filterSpecialty || filterDate || filterSite) && (
                <button onClick={() => { setSearchTerm(''); setFilterTier(''); setFilterSpecialty(''); setFilterDate(''); setFilterSite(''); }} className="px-3 py-2 text-rose-505 hover:bg-rose-50 rounded-xl text-xs font-bold transition">Xóa lọc</button>
              )}
            </div>
          </div>
        </div>
      )}

      {calendarMode === 'list' && (
        isLoading ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="text-slate-404 font-semibold text-xs animate-pulse">Đang cập nhật...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-404"><ClipboardList className="w-8 h-8" /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy hồ sơ nào phù hợp</h3>
              <p className="text-slate-404 text-xs mt-1 font-medium">Hệ thống chưa ghi nhận hoặc từ khóa lọc không trùng khớp.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-55 border-b border-slate-200 text-[10px] text-slate-404 font-black uppercase tracking-wider">
                    <th className="py-4 px-5">PID / Khách Hàng</th>
                    <th className="py-4 px-3">Phân hạng</th>
                    <th className="py-4 px-3">Ngày Khám / Site / Khu vực</th>
                    <th className="py-4 px-3">Chuyên Khoa</th>
                    <th className="py-4 px-3">HĐQT Chỉ Đạo</th>
                    <th className="py-4 px-3 text-right">Tổng Chi Phí</th>
                    <th className="py-4 px-3 text-right">Duyệt Giảm</th>
                    <th className="py-4 px-3 text-right">Thực Thu</th>
                    <th className="py-4 px-5 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredPatients.map((p) => {
                    const canViewBilling = hasAccessToPatient(p, 'billing:view');
                    const realCollected = Math.max(0, (p.totalAmount || 0) - (p.approvedDiscountAmount || 0));
                    const pSite = sites.find(s => s.label === p.site) || sites[0];
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition duration-150 cursor-pointer" onClick={() => initiateView(p)}>
                        <td className="py-4 px-5">
                          <div onClick={(e) => handleCopyText(e, p.name, "Họ và tên")} className="font-extrabold text-slate-955 text-sm hover:text-indigo-600 cursor-copy">{maskName(p.name)}</div>
                          <div onClick={(e) => handleCopyText(e, p.pid, "Mã PID")} className="text-[10px] text-indigo-600 font-mono font-black mt-0.5 hover:text-indigo-850 cursor-copy">PID: {maskPID(p.pid)}</div>
                        </td>
                        <td className="py-4 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide ${p.tier === 'VVIP' ? 'bg-amber-100 text-amber-808 border border-amber-200' : 'bg-indigo-50 text-indigo-707 border border-indigo-100'}`}>
                            <Sparkles className="w-3 h-3" /> {p.tier}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="text-slate-550 font-bold">{p.date ? formatDateVN(p.date) : 'Trong ngày'}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[8px] font-bold border ${pSite.bg}`}>{pSite.label}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[8px] font-bold border ${p.examinationArea === 'Khu VIP' ? 'bg-indigo-50 border-indigo-202 text-indigo-707' : p.examinationArea === 'Nội Trú/Cấp cứu/ICU' ? 'bg-rose-50 border-rose-202 text-rose-707' : 'bg-teal-50 border-teal-202 text-teal-707'}`}>{p.examinationArea || '---'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {p.specialties?.map((s, idx) => (
                              <span key={idx} className="text-[9px] bg-slate-50 text-slate-605 border border-slate-202 px-1.5 py-0.5 rounded font-bold">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="font-bold text-slate-700">{p.boardApproval || '---'}</div>
                          {p.notes && <div className="text-[10px] text-slate-404 max-w-[150px] truncate" title={p.notes}>{p.notes}</div>}
                        </td>
                        <td className="py-4 px-3 text-right font-bold text-slate-900 font-mono">
                          {p.tier === 'VIP' ? <span className="text-slate-404 font-sans text-[10px]">Thanh toán quầy</span> : canViewBilling ? formatCurrency(p.totalAmount) : <span className="text-slate-405">🔒 Khóa</span>}
                        </td>
                        <td className="py-4 px-3 text-right">
                          {p.tier === 'VIP' ? <span className="text-slate-404 font-sans text-[10px]">---</span> : canViewBilling ? (
                            <>
                              <div className="font-bold text-rose-600 font-mono font-black">-{formatCurrency(p.approvedDiscountAmount)}</div>
                              <div className="text-[9px] text-slate-404 font-black">Tỷ lệ: {p.discountRate || 0}%</div>
                            </>
                          ) : <span className="text-slate-405">🔒 Khóa</span>}
                        </td>
                        <td className="py-4 px-3 text-right font-extrabold text-emerald-600 font-mono">
                          {p.tier === 'VIP' ? <span className="text-slate-404 font-sans text-[10px]">Hóa đơn gốc</span> : canViewBilling ? formatCurrency(realCollected) : <span className="text-slate-405">🔒 Khóa</span>}
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            {((p.approvalImages && p.approvalImages.length > 0) || p.approvalImage) && (
                              <button onClick={() => { setLightboxImages(p.approvalImages || [p.approvalImage]); setLightboxIndex(0); }} className="p-1.5 bg-slate-50 border border-slate-202 text-slate-605 hover:bg-slate-100 rounded-xl transition"><ImageIcon className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => initiateView(p)} className="p-1.5 bg-slate-50 border border-slate-202 text-slate-600 hover:bg-slate-955 hover:text-white rounded-xl transition"><Edit3 className="w-4 h-4" /></button>
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
                                          localStorage.setItem('local_patients', JSON.stringify(updated));
                                          showNotification("Đã xóa hồ sơ cục bộ!");
                                        }
                                      } catch (err) {
                                        console.error(err);
                                      }
                                      setConfirmModal({ show: false, action: null, message: '', title: '' });
                                    }
                                  });
                                }} 
                                className="p-1.5 bg-rose-50 border border-rose-202 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : <span className="p-1.5 text-slate-305 cursor-not-allowed"><Lock className="w-4 h-4" /></span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {calendarMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto min-w-full">
          {weekDays.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayPatients = visiblePatients.filter(p => p.date === dateStr);
            const isCurrentToday = dateStr === todayStr;

            return (
              <div 
                key={idx} 
                className={`p-3 rounded-2xl border min-h-[220px] flex flex-col space-y-3 ${
                  isCurrentToday ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50/40 border-slate-150'
                }`}
              >
                <div className="text-center pb-2 border-b border-slate-250">
                  <span className="text-[10px] uppercase font-black text-slate-404 block">
                    {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </span>
                  <span className={`text-sm font-extrabold font-mono inline-block px-2 py-0.5 rounded-full ${
                    isCurrentToday ? 'bg-indigo-600 text-white' : 'text-slate-800'
                  }`}>
                    {day.getDate()}
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
                  {dayPatients.length === 0 ? (
                    <div className="text-center text-[10px] text-slate-305 font-bold pt-8">Không có ca</div>
                  ) : (
                    dayPatients.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => initiateView(p)}
                        className="p-2 bg-white border border-slate-200 rounded-xl shadow-3xs hover:border-indigo-400 transition cursor-pointer space-y-1 text-left"
                      >
                        <div 
                          onClick={(e) => handleCopyText(e, p.name, "Họ và tên")}
                          className="font-extrabold text-[10px] text-slate-800 truncate hover:text-indigo-600 cursor-copy"
                        >
                          {maskName(p.name)}
                        </div>
                        <div className="flex items-center justify-between gap-1 text-[8px] text-slate-455">
                          <span 
                            onClick={(e) => handleCopyText(e, p.pid, "Mã PID")}
                            className="font-mono hover:text-indigo-600 cursor-copy"
                          >
                            PID: {maskPID(p.pid)}
                          </span>
                          <span className={`px-1 rounded-sm uppercase font-black text-[7px] ${
                            p.tier === 'VVIP' ? 'bg-amber-101 text-amber-808' : 'bg-indigo-50 text-indigo-707'
                          }`}>
                            {p.tier}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {calendarMode === 'month' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-404 pb-2 border-b border-slate-101">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day, idx) => {
              if (!day) return <div key={idx} className="aspect-square bg-slate-50/20 rounded-xl border border-transparent"></div>;

              const dateStr = day.toISOString().split('T')[0];
              const dayPatients = visiblePatients.filter(p => p.date === dateStr);
              const isCurrentToday = dateStr === todayStr;

              return (
                <div 
                  key={idx}
                  onClick={() => {
                    if (dayPatients.length > 0) {
                      setFilterDate(dateStr);
                      setCalendarMode('list');
                    }
                  }}
                  className={`aspect-square p-2 rounded-2xl border flex flex-col justify-between transition-all relative ${
                    dayPatients.length > 0 ? 'cursor-pointer hover:border-indigo-400 shadow-3xs' : ''
                  } ${
                    isCurrentToday ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-150'
                  }`}
                >
                  <span className={`text-[11px] font-black font-mono leading-none ${
                    isCurrentToday ? 'text-indigo-600 font-black' : 'text-slate-550'
                  }`}>
                    {day.getDate()}
                  </span>

                  {dayPatients.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end">
                      {dayPatients.slice(0, 3).map((p, pIdx) => (
                        <span 
                          key={pIdx} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.tier === 'VVIP' ? 'bg-amber-400' : 'bg-indigo-500'
                          }`} 
                          title={`${p.name} (${p.tier})`}
                        />
                      ))}
                      {dayPatients.length > 3 && (
                        <span className="text-[7px] text-slate-404 font-bold">+{dayPatients.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
