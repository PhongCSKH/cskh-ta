import React from 'react';
import { Plus, Check, Scan, UserCheck, Lock, Unlock, Copy, History, ChevronDown, Image as ImageIcon, Upload, X, FileSpreadsheet, ArrowRightLeft, Edit3 } from 'lucide-react';

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

const formatDateVN = (dateStr) => {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
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

export default function PatientForm({
  currentUser,
  userRole,
  currentId,
  isReadOnly,
  setIsReadOnly,
  formData,
  setFormData,
  newRoundingLog,
  setNewRoundingLog,
  isScanning,
  setIsScanning,
  scannerError,
  setScannerError,
  specSearch,
  setSpecSearch,
  isSpecDropdownOpen,
  setIsSpecDropdownOpen,
  leftFormTab,
  setLeftFormTab,
  isHistoryPanelExpanded,
  setIsHistoryPanelExpanded,
  handleInputChange,
  handleCurrencyChange,
  toggleSpecialtySelection,
  handleMultipleImagesUpload,
  handleToggleRecipient,
  handleAddRoundingLog,
  handleDeleteRoundingLog,
  savePatient,
  resetForm,
  setActiveTab,
  initiateView,
  handleCopyText,
  setCopyConfirmModal,
  registrableStaffList,
  patientVisitHistory,
  linkedVisits,
  hasAccessToPatient,
  stopScanner,
  filteredSpecialties
}) {
  const canViewBilling = hasAccessToPatient(formData, 'billing:view');

  return (
    <form onSubmit={savePatient} className="space-y-6 animate-fadeIn relative">
      <div className="sticky top-16 z-35 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-base font-black text-slate-955 flex items-center gap-1.5">
            {currentId ? (isReadOnly ? "Chi tiết hồ sơ bệnh nhân" : "Cập Nhật Tiến Độ") : "Tạo lượt Tiếp Đón VIP/VVIP"}
          </h2>
          {currentId && isReadOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-105 border border-slate-200 text-slate-500 uppercase tracking-wider">
              <Lock className="w-3 h-3" /> Chế độ chỉ xem
            </span>
          )}
          {currentId && !isReadOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 border border-amber-200 text-amber-707 uppercase tracking-wider">
              <Unlock className="w-3 h-3 text-amber-600" /> Chế độ chỉnh sửa
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            type="button" 
            onClick={() => { resetForm(); setActiveTab('monitoring'); }}
            className="px-4 py-2 border border-slate-200 text-slate-605 hover:bg-slate-55 text-xs font-bold rounded-xl transition"
          >
            Hủy bỏ
          </button>
          {currentId && isReadOnly ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsReadOnly(false);
              }}
              className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
            >
              <Edit3 className="w-4 h-4" /> Sửa hồ sơ
            </button>
          ) : (
            <button 
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
            >
              <Check className="w-4 h-4" /> {currentId ? "Cập nhật" : "Đăng ký"}
            </button>
          )}
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
                <label className="text-xs font-bold text-slate-600 block">Mã PID *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nhập/Quét mã bệnh nhân PID..."
                    value={formData.pid}
                    disabled={isReadOnly}
                    onChange={(e) => handleInputChange('pid', e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-mono font-black bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                    required
                  />
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => { setScannerError(''); setIsScanning(true); }}
                      className="px-3 bg-slate-101 hover:bg-slate-250 border border-slate-200 rounded-xl text-slate-600 transition flex items-center gap-1 text-[11px] font-bold shadow-2xs"
                    >
                      <Scan className="w-4 h-4 text-slate-505" /> Quét mã
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Họ & Tên khách hàng *</label>
                <input 
                  type="text" 
                  placeholder="Nhập họ và tên Khách hàng"
                  value={formData.name}
                  disabled={isReadOnly}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-bold bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-605 block">Phân Hạng Tiếp Đón</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => { handleInputChange('tier', 'VIP'); setFormRightTab('timeline'); }}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 text-left flex flex-col justify-center h-16 disabled:opacity-80 ${
                      formData.tier === 'VIP' ? 'bg-indigo-50 border-indigo-505 text-indigo-707 shadow-2xs font-black' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-55'
                    }`}
                  >
                    <span className="font-black text-sm">VIP</span>
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => { handleInputChange('tier', 'VVIP'); setFormRightTab('billing'); }}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 text-left flex flex-col justify-center h-16 disabled:opacity-80 ${
                      formData.tier === 'VVIP' ? 'bg-amber-50 border-amber-505 text-amber-707 shadow-2xs font-black' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-55'
                    }`}
                  >
                    <span className="font-black text-sm text-amber-600">VVIP</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Ngày khám / Điều trị</label>
                <input 
                  type="date" 
                  value={formData.date}
                  disabled={isReadOnly}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-bold text-slate-800 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-605 block">Site thăm khám</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {sites.map(s => {
                    const isAssigned = (currentUser?.assignedSite || 'Tất cả') === 'Tất cả' || currentUser?.assignedSite === s.label;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!isAssigned || isReadOnly}
                        onClick={() => handleInputChange('site', s.label)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center disabled:opacity-80 ${
                          formData.site === s.label ? `${s.bg} border-slate-450 font-black` : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-55/50'
                        }`}
                      >
                        {s.label} {!isAssigned && '🔒'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-605 block">Khu Vực Khám *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleInputChange('examinationArea', 'Khu Tiêu Chuẩn')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition duration-150 text-center disabled:opacity-80 ${
                      formData.examinationArea === 'Khu Tiêu Chuẩn' ? 'bg-teal-50 border-teal-505 text-teal-755 font-black shadow-2xs' : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-55/50'
                    }`}
                  >
                    Khu Tiêu Chuẩn
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleInputChange('examinationArea', 'Khu VIP')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition duration-150 text-center disabled:opacity-80 ${
                      formData.examinationArea === 'Khu VIP' ? 'bg-indigo-50 border-indigo-505 text-indigo-755 font-black shadow-2xs' : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-55/50'
                    }`}
                  >
                    Khu VIP
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleInputChange('examinationArea', 'Nội Trú/Cấp cứu/ICU')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition duration-150 text-center disabled:opacity-80 ${
                      formData.examinationArea === 'Nội Trú/Cấp cứu/ICU' ? 'bg-rose-50 border-rose-500 text-rose-755 font-black shadow-2xs' : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-55/50'
                    }`}
                  >
                    Nội Trú/Cấp cứu/ICU
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-655 block">Hình thức điều trị</label>
                <select
                  value={formData.treatmentType || 'Ngoại trú'}
                  disabled={isReadOnly}
                  onChange={(e) => handleTreatmentTypeChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-bold bg-white text-slate-800 cursor-pointer disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="Ngoại trú">Ngoại trú</option>
                  <option value="Cấp cứu/Daycare">Cấp cứu/Daycare</option>
                  <option value="Nội trú/ICU">Nội trú/ICU</option>
                  <option value="Ngoài viện">Ngoài viện</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 block">Trạng thái</label>
                <select
                  value={formData.status}
                  disabled={isReadOnly}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-bold text-slate-800 bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {workflowStatuses.map(status => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
              </div>

              {['Scheduled', 'Preparing', 'ReceivedInfo'].includes(formData.status) && (
                <div className="space-y-2 md:col-span-2 p-4 bg-indigo-50/50 border border-indigo-101 rounded-2xl animate-fadeIn">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <UserCheck className="w-4.5 h-4.5 text-indigo-600" /> Nhân Sự Đón Tiếp Chỉ Định *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {registrableStaffList.map(staff => {
                      const isAssigned = (formData.recipients || []).includes(staff.uid);
                      return (
                        <button
                          key={staff.uid}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => handleToggleRecipient(staff.uid)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition disabled:opacity-80 ${
                            isAssigned ? 'bg-white border-indigo-600 text-indigo-900 shadow-2xs font-extrabold' : 'bg-white/40 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isAssigned ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                            {isAssigned && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs truncate">{staff.name}</div>
                            <div className="text-[9px] text-slate-404 font-medium truncate uppercase">{staff.role} • {staff.title}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 block">HĐQT Phê Duyệt/Chỉ đạo</label>
                <div className="space-y-2">
                  {!isReadOnly && (
                    <div className="flex flex-wrap gap-1.5">
                      {["Sếp Dũng", "Sếp Hoa", "Sếp Nga", "Sếp Thông"].map((boss) => (
                        <button
                          key={boss}
                          type="button"
                          onClick={() => handleInputChange('boardApproval', boss)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                            formData.boardApproval === boss ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {boss}
                        </button>
                      ))}
                    </div>
                  )}
                  <input 
                    type="text" 
                    placeholder="Thành viên hội đồng quản trị chỉ đạo..."
                    value={formData.boardApproval}
                    disabled={isReadOnly}
                    onChange={(e) => handleInputChange('boardApproval', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-semibold bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 block">Ghi chú</label>
                <textarea 
                  rows="5"
                  placeholder="Mô tả ghi chú nếu có..."
                  value={formData.notes}
                  disabled={isReadOnly}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-medium bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                ></textarea>
              </div>
            </div>
          </div>

          {currentId && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-101 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-600 rounded-sm inline-block"></span>
                  Nhật Ký Thăm Hỏi & Chăm Sóc Sức Khỏe Realtime
                </h3>
                <span className="bg-indigo-50 text-indigo-707 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border border-indigo-100 font-mono">
                  {(formData.roundingLogs || []).length} lượt thăm
                </span>
              </div>

              {['Nội trú/ICU', 'Cấp cứu/Daycare'].includes(formData.treatmentType) && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-101 text-[11px] text-emerald-800 rounded-2xl font-bold">
                  ℹ️ Khách hàng đang ở chế độ điều trị nội trú trọng điểm. Đề xuất nhân sự CSKH và Quản lý thực hiện đi buồng thăm hỏi định kỳ 2 lần/ngày.
                </div>
              )}

              {linkedVisits.length > 0 && (
                <div className="p-4 bg-indigo-50 border border-indigo-101 rounded-2xl flex flex-col gap-2">
                  <span className="text-[10px] font-black text-indigo-755 uppercase tracking-wider block">Các nhánh đón tiếp liên đới:</span>
                  <div className="flex flex-wrap gap-2">
                    {linkedVisits.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => initiateView(v)}
                        className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-707 hover:bg-indigo-50 rounded-lg text-[10px] font-black transition flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                        {v.tier} - Chuyên khoa: {v.specialties?.join(', ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isReadOnly && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-555 uppercase tracking-wide">Đánh giá nhanh tình trạng</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "🟢 Ổn định", value: "Ổn định" },
                        { label: "🟡 Cần theo dõi", value: "Cần theo dõi" },
                        { label: "🔴 Diễn biến xấu", value: "Diễn biến xấu" },
                        { label: "🔵 Có chỉ định mới", value: "Có chỉ định mới" }
                      ].map((statusItem) => (
                        <button
                          key={statusItem.value}
                          type="button"
                          onClick={() => setNewRoundingLog(prev => ({ ...prev, status: statusItem.value }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            newRoundingLog.status === statusItem.value ? 'bg-slate-900 border-slate-900 text-white font-extrabold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {statusItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-555 uppercase tracking-wide">Nội dung ghi nhận lâm sàng / Đề xuất của khách</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập tình trạng sức khỏe, mong muốn hoặc đề xuất điều trị..."
                        value={newRoundingLog.notes}
                        onChange={(e) => setNewRoundingLog(prev => ({ ...prev, notes: e.target.value }))}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-505"
                      />
                      <button
                        type="button"
                        onClick={handleAddRoundingLog}
                        className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition flex items-center gap-1.5 shrink-0"
                      >
                        <Check className="w-4 h-4 stroke-[3px]" /> Ghi nhận
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {(formData.roundingLogs || []).length === 0 ? (
                  <div className="text-center py-6 text-slate-404 text-xs font-semibold">Chưa có lượt thăm hỏi và theo dõi sức khỏe nào được ghi nhận.</div>
                ) : (
                  (formData.roundingLogs || []).map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50/60 border border-slate-150 rounded-2xl text-xs flex justify-between gap-3 items-start animate-fadeIn">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-slate-900">{log.visitor}</span>
                          <span className="text-[10px] font-mono text-slate-404 font-bold">
                            {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            log.status === 'Ổn định' ? 'bg-emerald-50 text-emerald-705 border border-emerald-200' :
                            log.status === 'Cần theo dõi' ? 'bg-amber-50 text-amber-705 border border-amber-200' :
                            log.status === 'Diễn biến xấu' ? 'bg-rose-50 text-rose-705 border border-rose-200' :
                            'bg-blue-50 text-blue-705 border border-blue-200'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-slate-655 font-medium leading-relaxed break-words">{log.notes}</p>
                      </div>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRoundingLog(log.id)}
                          className="p-1 text-slate-404 hover:text-rose-500 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {(patientVisitHistory.length > 0 || (formData.history && formData.history.length > 0)) && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
              <button
                type="button"
                onClick={() => setIsHistoryPanelExpanded(!isHistoryPanelExpanded)}
                className="w-full flex justify-between items-center text-xs font-black text-slate-800 hover:text-indigo-655 transition focus:outline-hidden"
              >
                <span className="flex items-center gap-2">
                  <History className="w-4.5 h-4.5 text-indigo-600" />
                  Lịch sử & Nhật ký hoạt động ({patientVisitHistory.length} lượt khám cũ)
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-404 font-bold">{isHistoryPanelExpanded ? "Thu nhỏ" : "Bấm để xem"}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-250 ${isHistoryPanelExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isHistoryPanelExpanded && (
                <div className="space-y-4 pt-4 border-t border-slate-101">
                  <div className="flex border-b border-slate-101 pb-2 overflow-x-auto gap-2">
                    {patientVisitHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setLeftFormTab('visitHistory')}
                        className={`py-2 text-xs font-black text-center transition border-b-2 whitespace-nowrap px-1.5 flex items-center gap-1 ${
                          leftFormTab === 'visitHistory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-404 hover:text-slate-655'
                        }`}
                      >
                        <History className="w-3.5 h-3.5" /> Lịch sử tiếp đón ({patientVisitHistory.length})
                      </button>
                    )}
                    {formData.history && formData.history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setLeftFormTab('timeline')}
                        className={`py-2 text-xs font-black text-center transition border-b-2 whitespace-nowrap px-1.5 ${
                          leftFormTab === 'timeline' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-404 hover:text-slate-655'
                        }`}
                      >
                        Lịch sử Timeline
                      </button>
                    )}
                  </div>

                  {leftFormTab === 'visitHistory' && patientVisitHistory.length > 0 && (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                      {patientVisitHistory.map((visit) => {
                        const vSite = sites.find(s => s.label === visit.site) || sites[0];
                        return (
                          <div key={visit.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 relative hover:shadow-xs transition duration-150">
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <div className="font-bold text-[11px] text-slate-900">{visit.date ? formatDateVN(visit.date) : "Lượt khám cũ"}</div>
                                <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[8px] font-bold border mt-1 ${vSite.bg}`}>{vSite.label}</span>
                              </div>
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => setCopyConfirmModal({ show: true, visitToCopy: visit })}
                                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-202 text-indigo-600 rounded-lg text-[9px] font-black flex items-center gap-1 transition shadow-2xs"
                                >
                                  <Copy className="w-3 h-3" /> Sao chép nhanh
                                </button>
                              )}
                            </div>
                            <div className="space-y-1 text-[10px] text-slate-655 font-semibold">
                              <div>Khu vực: <strong className="text-slate-800">{visit.examinationArea || 'Khu VIP'}</strong></div>
                              {visit.boardApproval && (
                                <div>Chỉ đạo: <span className="bg-slate-900 text-white font-black px-1.5 py-0.5 rounded-xs text-[8px]">{visit.boardApproval}</span></div>
                              )}
                              {visit.notes && <div className="italic text-slate-404 truncate">"{visit.notes}"</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {leftFormTab === 'timeline' && (
                    <div className="p-4 bg-slate-55 rounded-2xl border border-slate-202 max-h-[350px] overflow-y-auto pr-1">
                      <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4">
                        {formData.history?.map((log, index) => (
                          <div key={index} className="relative">
                            <span className="absolute -left-[22px] top-1 bg-indigo-60 text-indigo-655 w-2.5 h-2.5 rounded-full border-2 border-white ring-4 ring-indigo-50"></span>
                            <div className="text-xs font-black text-slate-800 leading-snug">{log.action}</div>
                            <div className="text-[9px] text-slate-404 mt-1 flex justify-between font-bold">
                              <span>Bởi: {log.user}</span>
                              <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString('vi-VN')} {new Date(log.timestamp).toLocaleDateString('vi-VN', {day: 'numeric', month: 'numeric'})}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4" ref={specRef}>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
              Chuyên khoa thăm khám
            </h3>
            {!isReadOnly && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyên khoa..."
                  value={specSearch}
                  onChange={(e) => { setSpecSearch(e.target.value); setIsSpecDropdownOpen(true); }}
                  onFocus={() => setIsSpecDropdownOpen(true)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-bold bg-white text-slate-800"
                />
                {isSpecDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                    {filteredSpecialties.length === 0 ? (
                      <div className="text-xs text-slate-405 font-bold text-center py-4">Không tìm thấy chuyên khoa phù hợp</div>
                    ) : (
                      filteredSpecialties.map((spec) => {
                        const isSelected = formData.specialties.includes(spec);
                        return (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => toggleSpecialtySelection(spec)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${isSelected ? 'bg-indigo-50 text-indigo-755' : 'hover:bg-slate-55 text-slate-700'}`}
                          >
                            <span>{spec}</span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-650" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {formData.specialties.map((spec) => {
                  const config = formData.specialtyConfigs?.[spec] || 'vvip_discount';
                  return (
                    <div key={spec} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
                      <span>{spec}</span>
                      {formData.tier === 'VVIP' && !isReadOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const newConfig = config === 'vvip_discount' ? 'vip_takecare' : 'vvip_discount';
                            setFormData(prev => ({
                              ...prev,
                              specialtyConfigs: { ...(prev.specialtyConfigs || {}), [spec]: newConfig }
                            }));
                          }}
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition ${config === 'vvip_discount' ? 'bg-amber-500 text-slate-955' : 'bg-indigo-500 text-white'}`}
                        >
                          {config === 'vvip_discount' ? 'Giảm VVIP' : 'Chăm sóc VIP'}
                        </button>
                      )}
                      {!isReadOnly && (
                        <button type="button" onClick={() => toggleSpecialtySelection(spec)} className="p-0.5 hover:bg-slate-800 rounded-full transition">
                          <X className="w-3 h-3 text-slate-404" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {formData.tier === 'VVIP' && canViewBilling && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
                Chi Phí Điều Trị & Lâm Sàng Thực Tế
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 block">Phí khám/Điều trị</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.phiKham ? formData.phiKham.toLocaleString('vi-VN') : ''}
                      disabled={isReadOnly}
                      onChange={(e) => handleCurrencyChange('phiKham', e.target.value)}
                      placeholder="0"
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-bold text-slate-900 bg-white"
                    />
                    <span className="absolute right-3 top-3 text-[10px] text-slate-404 font-bold">VNĐ</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-655 block">CLS/CDHA</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.clsCdha ? formData.clsCdha.toLocaleString('vi-VN') : ''}
                      disabled={isReadOnly}
                      onChange={(e) => handleCurrencyChange('clsCdha', e.target.value)}
                      placeholder="0"
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-bold text-slate-900 bg-white"
                    />
                    <span className="absolute right-3 top-3 text-[10px] text-slate-404 font-bold">VNĐ</span>
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-655 block">Thuốc/vacxin</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.thuocVacxin ? formData.thuocVacxin.toLocaleString('vi-VN') : ''}
                      disabled={isReadOnly}
                      onChange={(e) => handleCurrencyChange('thuocVacxin', e.target.value)}
                      placeholder="0"
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-955 text-xs font-bold text-slate-900 bg-white"
                    />
                    <span className="absolute right-3 top-3 text-[10px] text-slate-404 font-bold">VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {formData.tier === 'VVIP' && canViewBilling && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-5 relative overflow-hidden border border-slate-800">
                <h3 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 relative z-10">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> Bảng chi phí/duyệt giảm
                </h3>
                <div className="space-y-1.5 pt-2 relative z-10">
                  <label className="text-[10px] font-bold text-slate-300 block">BHYT/BHTN/Tạm ứng (VNĐ)</label>
                  <input 
                    type="text" 
                    value={formData.insuranceAdvance ? formData.insuranceAdvance.toLocaleString('vi-VN') : ''}
                    disabled={isReadOnly}
                    onChange={(e) => handleCurrencyChange('insuranceAdvance', e.target.value)}
                    placeholder="0"
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-850 border border-slate-750 focus:outline-hidden text-xs font-bold text-white font-mono"
                  />
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="flex bg-slate-850 p-0.5 rounded-xl border border-slate-750">
                    <button
                      type="button"
                      disabled={!hasAccessToPatient(formData, 'billing:discount') || isReadOnly}
                      onClick={() => setFormData(prev => ({ ...prev, discountType: 'percent', approvedDiscountAmount: 0 }))}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${(formData.discountType || 'percent') === 'percent' ? 'bg-slate-700 text-white shadow-2xs font-black' : 'text-slate-404 hover:text-slate-200'}`}
                    >
                      Giảm theo %
                    </button>
                    <button
                      type="button"
                      disabled={!hasAccessToPatient(formData, 'billing:discount') || isReadOnly}
                      onClick={() => setFormData(prev => ({ ...prev, discountType: 'fixed', discountRate: 0 }))}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${formData.discountType === 'fixed' ? 'bg-slate-700 text-white shadow-2xs font-black' : 'text-slate-404 hover:text-slate-200'}`}
                    >
                      Số tiền cố định
                    </button>
                  </div>
                  {formData.discountType === 'percent' ? (
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={formData.discountRate || ''}
                        disabled={!hasAccessToPatient(formData, 'billing:discount') || isReadOnly} 
                        onChange={(e) => handleInputChange('discountRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        placeholder="0"
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-black"
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-slate-555 font-bold font-mono">%</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.approvedDiscountAmount ? formData.approvedDiscountAmount.toLocaleString('vi-VN') : ''}
                        disabled={!hasAccessToPatient(formData, 'billing:discount') || isReadOnly} 
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(/\D/g, '');
                          const numValue = cleanValue === '' ? 0 : parseInt(cleanValue, 10);
                          handleInputChange('approvedDiscountAmount', numValue);
                        }}
                        placeholder="0"
                        className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-black"
                      />
                      <span className="absolute right-3 top-3 text-[10px] text-slate-555 font-bold font-mono">VNĐ</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-800/80 pt-4 space-y-3 relative z-10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-404">Tổng phí tự động:</span>
                    <span className="font-extrabold text-slate-105 font-mono">{formatCurrency(formData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-404">Số tiền duyệt giảm:</span>
                    <span className="font-extrabold text-rose-405 font-mono">-{formatCurrency(formData.approvedDiscountAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-404">Khấu trừ BHYT/Tạm ứng:</span>
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
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
              Ảnh Phê Duyệt Gửi Kèm
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {formData.approvalImages?.map((img, index) => (
                <div key={index} className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-50 animate-fadeIn">
                  <img src={img} alt="Công văn" className="w-full h-full object-cover" />
                  {!isReadOnly && (
                    <button 
                      type="button"
                      onClick={() => {
                        const updated = formData.approvalImages.filter((_, i) => i !== index);
                        handleInputChange('approvalImages', updated);
                      }}
                      className="absolute right-1.5 top-1.5 p-1 bg-red-655 hover:bg-red-705 text-white rounded-full transition shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <label className="border-2 border-dashed border-slate-202 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition duration-200 aspect-video">
                  <Upload className="w-5 h-5 text-slate-404" />
                  <span className="text-[10px] font-bold text-slate-700">Tải thêm ảnh</span>
                  <input type="file" accept="image/*" multiple onChange={handleMultipleImagesUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
