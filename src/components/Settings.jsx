import React from 'react';
import { Plus, Trash2, Edit3, X, UserPlus, Check, Lock } from 'lucide-react';

export default function SettingsTab({
  systemSettings,
  currentUser,
  userRole,
  staffList,
  newStaff,
  setNewStaff,
  editingStaffUid,
  setEditingStaffUid,
  newSpecialtyInput,
  setNewSpecialtyInput,
  handlePermissionChange,
  handleNotificationPermissionChange,
  handleFormulaCheckboxChange,
  handleDiscountFormulaChange,
  handleAddSpecialty,
  handleRemoveSpecialty,
  handleCreateStaff,
  handleEditStaff,
  handleDeleteStaff
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 font-sans">Cấu Hì̀nh Tham Số & Phân Quyền</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
            Ma Trận Phân Quyền Tác Vụ (Data Operations Matrix)
          </h3>
        </div>
        <div className="overflow-x-auto border border-slate-150 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-55 border-b border-slate-150 text-[10px] text-slate-404 font-black uppercase tracking-wider">
                <th className="p-4">Quyền hạn / Chức năng</th>
                <th className="p-4 text-center">nhanvien</th>
                <th className="p-4 text-center">quanly_site</th>
                <th className="p-4 text-center">quanly</th>
                <th className="p-4 text-center">lanhdao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {[
                { key: 'patients:view', label: 'Xem danh sách hồ sơ' },
                { key: 'patients:create', label: 'Đăng ký tiếp đón VIP' },
                { key: 'patients:update', label: 'Cập nhật hành trình' },
                { key: 'patients:delete', label: 'Xóa vĩnh viễn hồ sơ' },
                { key: 'billing:view', label: 'Xem chi phí VVIP' },
                { key: 'billing:discount', label: 'Duyệt % giảm chi phí' }
              ].map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{perm.label}</td>
                  {['nhanvien', 'quanly_site', 'quanly', 'lanhdao'].map((role) => (
                    <td key={role} className="p-4 text-center">
                      <select
                        value={systemSettings.permissions?.[perm.key]?.[role] || 'none'}
                        onChange={(e) => handlePermissionChange(perm.key, role, e.target.value)}
                        className="px-2 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold bg-white text-slate-700 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-505"
                      >
                        <option value="none">❌ Không quyền</option>
                        <option value="view_assigned">👁️ Xem Site gán</option>
                        <option value="write_assigned">📍 Ghi Site gán</option>
                        <option value="all">🌐 Toàn hệ thống</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-605 rounded-sm inline-block"></span>
            Ma Trận Cấp Quyền Nhận Thông Báo
          </h3>
        </div>
        <div className="overflow-x-auto border border-slate-150 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-55 border-b border-slate-150 text-[10px] text-slate-404 font-black uppercase tracking-wider">
                <th className="p-4">Sự kiện kích hoạt cảnh báo</th>
                <th className="p-4 text-center">nhanvien</th>
                <th className="p-4 text-center">quanly_site</th>
                <th className="p-4 text-center">quanly</th>
                <th className="p-4 text-center">lanhdao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {[
                { key: 'notify:create', label: 'Thông báo khi tiếp nhận ca mới' },
                { key: 'notify:status', label: 'Thông báo khi cập nhật trạng thái hành trình' }
              ].map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{perm.label}</td>
                  {['nhanvien', 'quanly_site', 'quanly', 'lanhdao'].map((role) => (
                    <td key={role} className="p-4 text-center">
                      <select
                        value={systemSettings.notificationPermissions?.[perm.key]?.[role] || 'none'}
                        onChange={(e) => handleNotificationPermissionChange(perm.key, role, e.target.value)}
                        className="px-2 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold bg-white text-slate-700 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-505"
                      >
                        <option value="none">❌ Không nhận</option>
                        <option value="assigned_only">👥 Chỉ ca được gán</option>
                        <option value="assigned_site">📍 Chỉ Site được gán</option>
                        <option value="all">🌐 Toàn hệ thống</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-sm inline-block"></span>
              Cấu Hinh Các Trường Cộng Tổng
            </h3>
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
                  checked={systemSettings.totalFormulaFields?.[field.key] || false}
                  onChange={() => handleFormulaCheckboxChange(field.key)}
                  className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-305"
                />
                <span className="text-xs font-bold text-slate-707">{field.label}</span>
              </label>
            ))}
          </div>

          <div className="border-t border-slate-150 pt-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Phương Thức Tính Số Tiền Duyệt Giảm</h3>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleDiscountFormulaChange('only_total')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3 ${systemSettings.discountFormulaType === 'only_total' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-55'}`}
              >
                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mt-0.5 ${systemSettings.discountFormulaType === 'only_total' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {systemSettings.discountFormulaType === 'only_total' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div>
                  <strong className="text-xs text-slate-800 block font-sans">Duyệt giảm trên tổng gốc</strong>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDiscountFormulaChange('total_minus_insurance_advance')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3 ${systemSettings.discountFormulaType === 'total_minus_insurance_advance' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-55'}`}
              >
                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mt-0.5 ${systemSettings.discountFormulaType === 'total_minus_insurance_advance' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {systemSettings.discountFormulaType === 'total_minus_insurance_advance' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div>
                  <strong className="text-xs text-slate-800 block font-sans">Khấu trừ bảo hiểm & tạm ứng trước khi giảm</strong>
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
              <input type="text" placeholder="Thêm chuyên khoa mới..." value={newSpecialtyInput} onChange={(e) => setNewSpecialtyInput(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-505" />
              <button type="button" onClick={handleAddSpecialty} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {systemSettings.specialties?.map((spec, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-55 transition">
                  <span className="text-xs font-bold text-slate-707">{spec}</span>
                  <button type="button" onClick={() => handleRemoveSpecialty(spec)} className="p-1 text-slate-405 hover:text-red-500 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-sm inline-block"></span>
              Quản Trị Phân Quyền Nhân Sự
            </h3>
            <form onSubmit={handleCreateStaff} className="space-y-3 bg-slate-55 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Họ tên nhân viên..." value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold" required />
                <input type="text" placeholder="Chức danh" value={newStaff.title} onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium" />
              </div>
              <input type="email" placeholder="Email..." value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium" required />
              <input type="text" placeholder="Mã UID..." value={newStaff.uid} disabled={editingStaffUid !== null} onChange={(e) => setNewStaff({ ...newStaff, uid: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono font-bold" required />
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-555 block uppercase">Site Giao Việc</label>
                <select value={newStaff.assignedSite || 'Tất cả'} onChange={(e) => setNewStaff({ ...newStaff, assignedSite: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold cursor-pointer">
                  <option value="Tất cả">Tất cả (Toàn hệ thống)</option>
                  <option value="BV Tâm Anh - Tân Sơn Hòa">BV Tâm Anh - Tân Sơn Hòa</option>
                  <option value="PK Tâm Anh - Tân Hưng">PK Tâm Anh - Tân Hưng</option>
                  <option value="BV Tâm Anh - Chánh Hưng">BV Tâm Anh - Chánh Hưng</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-555 block uppercase">Vai trò</label>
                <select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold cursor-pointer">
                  <option value="nhanvien">nhanvien</option>
                  <option value="quanly_site">quanly_site</option>
                  <option value="quanly">quanly</option>
                  <option value="lanhdao">lanhdao</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className="flex gap-2">
                {editingStaffUid && <button type="button" onClick={() => { setEditingStaffUid(null); setNewStaff({ name: '', email: '', role: 'nhanvien', uid: '', title: '', assignedSite: 'Tất cả' }); }} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-101 transition">Hủy</button>}
                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">{editingStaffUid ? "Cập nhật" : "Đăng ký"}</button>
              </div>
            </form>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {staffList.map((staff) => (
                <div key={staff.uid} className="flex justify-between items-center p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{staff.name}</div>
                    <div className="text-[9px] text-slate-404 font-mono">{staff.email}</div>
                    <div className="text-[9px] text-indigo-600 font-semibold mt-0.5">📍 Site: {staff.assignedSite || 'Tất cả'}</div>
                    <div className="text-[9px] text-slate-405 italic">UID: {staff.uid}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-sm uppercase">{staff.role}</span>
                    <button type="button" onClick={() => handleEditStaff(staff)} className="p-1 border border-slate-200 text-slate-404 hover:text-indigo-606 hover:border-indigo-202 rounded transition"><Edit3 className="w-3.5 h-3.5" /></button>
                    {staff.uid !== "acc_admin" && <button type="button" onClick={() => handleDeleteStaff(staff.uid)} className="p-1 border border-slate-200 text-slate-404 hover:text-red-500 hover:border-red-202 rounded transition"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
