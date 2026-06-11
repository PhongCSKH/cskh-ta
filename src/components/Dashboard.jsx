import React from 'react';
import { LayoutDashboard, ArrowRightLeft, Sparkles, ArrowRight, Activity, Users, CreditCard } from 'lucide-react';

const sites = [
  { id: 'tsh', label: 'BV Tâm Anh - Tân Sơn Hòa', bg: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500', cardBg: 'bg-[#f0f9ff] border-[#bae6fd] hover:border-[#7dd3fc]' },
  { id: 'th', label: 'PK Tâm Anh - Tân Hưng', bg: 'bg-violet-50 text-violet-700 border-violet-200/80', dot: 'bg-violet-500', cardBg: 'bg-[#faf5ff] border-[#e9d5ff] hover:border-[#d8b4fe]' },
  { id: 'ch', label: 'BV Tâm Anh - Chánh Hưng', bg: 'bg-teal-50 text-teal-700 border-teal-200/80', dot: 'bg-teal-500', cardBg: 'bg-[#f0fdf4] border-[#bbf7d0] hover:border-[#86efac]' }
];

const workflowStatuses = [
  { id: 'Scheduled', label: 'Đã lên lịch', color: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500' },
  { id: 'Preparing', label: 'Đang chuẩn bị', color: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  { id: 'ReceivedInfo', label: 'Đã nhận thông tin', color: 'bg-teal-50 text-teal-700 border-teal-200/80', dot: 'bg-teal-500' },
  { id: 'Waiting', label: 'Chờ Tiếp Đón', color: 'bg-slate-101 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  { id: 'Received', label: 'Đã Tiếp Đón', color: 'bg-indigo-50 text-indigo-707 border-indigo-200/80', dot: 'bg-indigo-500' },
  { id: 'Examining', label: 'Đang Khám', color: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' },
  { id: 'Testing', label: 'Đang Làm CLS/CĐHA', color: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  { id: 'Reviewing', label: 'Chờ Kết Luận', color: 'bg-purple-50 text-purple-700 border-purple-200/80', dot: 'bg-purple-500' },
  { id: 'Pharmacy', label: 'Đang Chờ Thuốc/Tiêm Ngừa', color: 'bg-yellow-50 text-yellow-850 border-yellow-200/80', dot: 'bg-yellow-500' },
  { id: 'Inpatient', label: 'Đang Nằm Viện', color: 'bg-rose-50 text-rose-707 border-rose-200/80', dot: 'bg-rose-500' },
  { id: 'Completed', label: 'Đã Hoàn Tất', color: 'bg-emerald-50 text-emerald-707 border-emerald-200/80', dot: 'bg-emerald-500' }
];

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

export default function Dashboard({
  currentUser,
  userRole,
  systemSettings,
  kanbanPatients,
  dashMetrics,
  dashFilterMode,
  setDashFilterMode,
  dashStartDate,
  setDashStartDate,
  dashEndDate,
  setDashEndDate,
  filterSite,
  setFilterSite,
  filterDate,
  setFilterDate,
  initiateView,
  handleCopyText,
  handleUpdateStatus,
  briefingStats,
  setFilterDateGlobal,
  setCalendarModeGlobal,
  setActiveTabGlobal,
  resetForm
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-tr from-[#312e81] via-[#4338ca] to-[#6d28d9] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-500/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl opacity-20 translate-x-24 -translate-y-24"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 bg-amber-400 text-[#1e1b4b] rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
              Trợ lý ảo đón tiếp VIP
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Kế Hoạch Chủ Động Cho Ngày Mai & Tuần Tới
            </h3>
            <div className="space-y-2 text-xs text-indigo-100 font-semibold pt-1">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Ngày mai ({briefingStats.tomorrowDateFormatted}): 
                <strong className="text-white ml-1"> {briefingStats.tomorrowPatients.length} ca tiếp đón </strong>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                Tuần tới: 
                <strong className="text-white ml-1"> {briefingStats.nextWeekCount} ca đón tiếp đã lên lịch </strong>
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setFilterDateGlobal(tomorrow.toISOString().split('T')[0]);
                setCalendarModeGlobal('list');
                setActiveTabGlobal('monitoring');
              }}
              className="flex-1 md:flex-none px-5 py-3 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-black rounded-xl shadow-md transition transform active:scale-95 whitespace-nowrap"
            >
              Xem lịch ngày mai
            </button>
            <button 
              onClick={() => {
                setFilterDateGlobal('');
                setCalendarModeGlobal('week');
                setActiveTabGlobal('monitoring');
              }}
              className="flex-1 md:flex-none px-5 py-3 bg-indigo-950/30 border border-indigo-400/30 hover:bg-indigo-950/50 text-white text-xs font-black rounded-xl transition transform active:scale-95"
            >
              Mở lịch tuần
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-tr from-[#1e293b] to-[#4f46e5] rounded-3xl p-5 text-white relative overflow-hidden shadow-md border border-slate-700/85 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl opacity-10 translate-x-20 -translate-y-20 pointer-events-none"></div>
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <span className="px-2.5 py-0.5 bg-amber-400 text-slate-955 rounded-md text-[9px] font-black uppercase tracking-wider inline-block">
            Phòng Chăm Sóc Khách Hàng
          </span>
          <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
            Chào, {currentUser?.name || ''}!
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 leading-normal font-semibold">
            Công cụ hỗ trợ quản lý và theo dõi việc tiếp đón và chi phí của nhóm Khách hàng VIP, VVIP, Ngoại giao của Ban giám đốc.
          </p>
        </div>
        {['admin', 'quanly', 'nhanvien', 'quanly_site'].includes(userRole) && (
          <div className="shrink-0 relative z-10">
            <button 
              onClick={() => { resetForm(); setActiveTabGlobal('register'); }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-955 hover:from-amber-500 hover:to-amber-400 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3px]" /> Tiếp nhận hồ sơ mới <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {(userRole === 'admin' || userRole === 'lanhdao' || userRole === 'quanly') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">
                {dashFilterMode === 'today' ? "Nhật ký chỉ số của ngày hôm nay" : "Chỉ số thống kê theo khoảng ngày"}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-101 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDashFilterMode('today')}
                  className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold transition ${
                    dashFilterMode === 'today' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-505 hover:text-slate-850'
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setDashFilterMode('range')}
                  className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                    dashFilterMode === 'range' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-505 hover:text-slate-855'
                  }`}
                >
                  Tùy chọn 📅
                </button>
              </div>
              {dashFilterMode === 'range' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 bg-slate-55 border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-655">
                  <div className="flex items-center gap-1">
                    <span>Từ:</span>
                    <input 
                      type="date" 
                      value={dashStartDate}
                      onChange={(e) => setDashStartDate(e.target.value)}
                      className="bg-transparent border-none text-[11px] font-black text-slate-800 focus:outline-hidden cursor-pointer"
                    />
                  </div>
                  <span className="hidden sm:inline text-slate-300">➔</span>
                  <div className="flex items-center gap-1">
                    <span>Đến:</span>
                    <input 
                      type="date" 
                      value={dashEndDate}
                      onChange={(e) => setDashEndDate(e.target.value)}
                      className="bg-transparent border-none text-[11px] font-black text-slate-800 focus:outline-hidden cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition duration-200">
              <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-101">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-404 font-black block uppercase tracking-wider">Khách hàng</span>
                <span className="text-xl font-black text-slate-900">{dashMetrics.totalPatients}</span>
                <span className="text-[11px] text-slate-500 block">
                  VIP: {dashMetrics.vipCount} | VVIP: {dashMetrics.vvipCount}
                </span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition duration-200">
              <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border-indigo-101">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-404 font-black block uppercase tracking-wider">Tổng chi phí</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(dashMetrics.totalRevenue)}</span>
                <span className="text-[11px] text-slate-500 block">Tổng chi phí sử dụng (VVIP)</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition duration-200">
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border-rose-101">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-404 font-black block uppercase tracking-wider">Tổng duyệt giảm</span>
                <span className="text-xl font-black text-rose-605">-{formatCurrency(dashMetrics.totalDiscount)}</span>
                <span className="text-[11px] text-rose-405 block font-bold">Ban lãnh đạo duyệt</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
              Hành Trình Khách Hàng (Realtime Kanban)
            </h3>
            <p className="text-[11px] text-slate-404 font-semibold mt-1">Cập nhật tiến độ tiếp đón trong ngày của từng khách hàng.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
            <span className="text-[10px] font-bold text-slate-404 uppercase">Lọc nhanh:</span>
            <select 
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-semibold bg-white cursor-pointer"
            >
              <option value="">Tất cả các Site</option>
              {sites.map(s => (
                <option key={s.id} value={s.label}>{s.label}</option>
              ))}
            </select>
            <input 
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-semibold bg-white cursor-pointer"
            />
            {(filterSite || filterDate) && (
              <button 
                onClick={() => { setFilterSite(''); setFilterDate(''); }}
                className="px-2.5 py-1 text-rose-500 hover:bg-rose-50 rounded-xl text-[11px] font-black transition"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 items-stretch select-none">
          {workflowStatuses.map(col => {
            const colPatients = kanbanPatients.filter(p => (p.status || 'Waiting') === col.id);
            if (colPatients.length === 0) {
              return (
                <div 
                  key={col.id} 
                  className="w-12 bg-slate-101/40 rounded-2xl py-3 px-1 border border-slate-200 flex flex-col items-center justify-start transition-all duration-300 shrink-0 cursor-pointer"
                  title={`Trống: ${col.label}`}
                >
                  <span className={`w-2 h-2 rounded-full ${col.dot} mb-2`}></span>
                  <span className="text-[10px] font-black bg-white px-1 py-0.5 rounded-md border border-slate-200 text-slate-555 mb-2 font-mono">
                    0
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-404 [writing-mode:vertical-lr] tracking-wider select-none mt-2 rotate-180">
                    {col.label}
                  </span>
                </div>
              );
            }

            return (
              <div 
                key={col.id} 
                className="bg-slate-50/60 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[180px] flex-1 transition-all duration-300 shrink-0"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                    <span className="text-[10px] font-black text-slate-700 truncate">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-555 font-mono">
                    {colPatients.length}
                  </span>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px]">
                  {colPatients.map(p => {
                    const patientSite = sites.find(s => s.label === p.site) || sites[0];
                    return (
                      <div 
                        key={p.id}
                        onClick={() => initiateView(p)}
                        className={`p-3 rounded-xl border shadow-2xs hover:shadow-xs transition duration-150 space-y-2.5 relative group cursor-pointer ${patientSite.cardBg}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span 
                            onClick={(e) => handleCopyText(e, p.pid, "Mã PID")}
                            className="text-[8px] text-slate-555 font-mono font-black truncate hover:text-indigo-600 cursor-copy"
                            title="Bấm để copy PID đầy đủ"
                          >
                            PID: {maskPID(p.pid)}
                          </span>
                          <div className="flex gap-1">
                            <span className={`px-1 py-0.5 rounded-xs text-[7px] font-bold uppercase ${
                              p.examinationArea === 'Khu VIP' ? 'bg-indigo-105 text-indigo-805' : 
                              p.examinationArea === 'Nội Trú/Cấp cứu/ICU' ? 'bg-rose-101 text-rose-805' : 'bg-teal-101 text-teal-805'
                            }`}>
                              {p.examinationArea === 'Khu VIP' ? 'VIP' : p.examinationArea === 'Nội Trú/Cấp cứu/ICU' ? 'NT/CC/ICU' : 'TC'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase ${
                              p.tier === 'VVIP' ? 'bg-amber-101 text-amber-808' : 'bg-indigo-50 text-indigo-707'
                            }`}>
                              {p.tier}
                            </span>
                          </div>
                        </div>
                        <div 
                          onClick={(e) => handleCopyText(e, p.name, "Họ và tên")}
                          className="font-extrabold text-[11px] text-slate-800 leading-tight truncate hover:text-indigo-600 cursor-copy" 
                          title="Bấm để copy Họ tên đầy đủ"
                        >
                          {maskName(p.name)}
                        </div>
                        <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={p.status || 'Waiting'}
                            onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                            className="w-full px-1.5 py-1 text-[9px] font-black border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-505 cursor-pointer"
                          >
                            {workflowStatuses.map(st => (
                              <option key={st.id} value={st.id}>{st.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
