"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateCustomer, deleteCustomer, getCustomerInteractions, updateCustomerTags } from "@/actions/customers";
import BottomNav from "@/components/BottomNav";
import { Search, Plus, X, Calendar, Phone, MapPin, Target, Clock, Activity, FileText, Edit3, Save, ChevronDown, Trash2, History, MessageSquare, Tag } from "lucide-react";

const STATUS_OPTIONS = ["New", "Active", "Waiting", "Dormant", "Closed", "Lost"];
const HEAT_OPTIONS = ["Hot", "Warm", "Cold"];
const JOURNEY_OPTIONS = ["Lead", "Contacted", "Viewed", "Negotiating", "Deposited", "Closed"];

export default function CustomerClient({ initialCustomers }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterHeat, setFilterHeat] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  // New state
  const [modalTab, setModalTab] = useState("info"); // "info" | "history"
  const [timeline, setTimeline] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Tag state
  const [filterTag, setFilterTag] = useState("All");
  const [newTag, setNewTag] = useState("");

  const filteredCustomers = initialCustomers.filter((c) => {
    const term = search.toLowerCase();
    const matchSearch = 
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.demand && c.demand.toLowerCase().includes(term));
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchHeat = filterHeat === "All" || c.heatLevel === filterHeat;
    const matchTag = filterTag === "All" || (c.tags && c.tags.includes(filterTag));
    return matchSearch && matchStatus && matchHeat && matchTag;
  });

  // Collect all unique tags for filter dropdown
  const allTags = [...new Set(initialCustomers.flatMap(c => c.tags || []))].sort();

  const formatDate = (isoString) => {
    if (!isoString) return "Chưa cập nhật";
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN", {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const startEdit = () => {
    setEditData({
      name: selectedCustomer.name || "",
      phone: selectedCustomer.phone || "",
      status: selectedCustomer.status || "New",
      heatLevel: selectedCustomer.heatLevel || "Cold",
      budget: selectedCustomer.budget || "",
      area: selectedCustomer.area || "",
      demand: selectedCustomer.demand || "",
      timeline: selectedCustomer.timeline || "",
      journeyStage: selectedCustomer.journeyStage || "Lead",
    });
    setIsEditing(true);
    setSaveMsg("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateCustomer(selectedCustomer.id, editData);
      setSelectedCustomer(updated);
      setIsEditing(false);
      setSaveMsg("✓ Đã lưu");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (err) {
      setSaveMsg("Lỗi: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setIsEditing(false);
    setSaveMsg("");
    setModalTab("info");
    setTimeline([]);
    setShowDeleteConfirm(false);
  };

  const loadHistory = useCallback(async (customerId) => {
    setLoadingHistory(true);
    try {
      const data = await getCustomerInteractions(customerId);
      setTimeline(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(selectedCustomer.id);
      closeModal();
      router.refresh();
    } catch (err) {
      setSaveMsg("Lỗi xóa: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const EditField = ({ label, field, type = "text", placeholder }) => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={editData[field] || ""}
          onChange={(e) => setEditData(d => ({ ...d, [field]: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white resize-none"
          rows={3} placeholder={placeholder}
        />
      ) : (
        <input
          type={type} value={editData[field] || ""}
          onChange={(e) => setEditData(d => ({ ...d, [field]: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
          placeholder={placeholder}
        />
      )}
    </div>
  );

  const SelectField = ({ label, field, options }) => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={editData[field] || ""}
          onChange={(e) => setEditData(d => ({ ...d, [field]: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white appearance-none"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 md:pb-0 md:pl-64 transition-all duration-300">
      {/* Header */}
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kho khách hàng</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500 hidden sm:inline">{initialCustomers.length} người</span>
            <button 
              onClick={() => router.push("/add")}
              className="h-9 px-3 rounded-full bg-primary-600 text-white shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform hover:bg-primary-700 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm khách</span>
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 sm:text-sm transition-colors text-slate-900 dark:text-slate-100"
            placeholder="Tìm theo tên, SĐT, nhu cầu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-primary-500"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="New">Mới (New)</option>
            <option value="Active">Đang chăm (Active)</option>
            <option value="Waiting">Chờ (Waiting)</option>
            <option value="Dormant">Ngủ đông (Dormant)</option>
            <option value="Closed">Đã chốt (Closed)</option>
            <option value="Lost">Rớt (Lost)</option>
          </select>
          <select 
            value={filterHeat}
            onChange={(e) => setFilterHeat(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-primary-500"
          >
            <option value="All">Mọi mức độ</option>
            <option value="Hot">Khách Nóng (Hot)</option>
            <option value="Warm">Khách Ấm (Warm)</option>
            <option value="Cold">Khách Lạnh (Cold)</option>
          </select>
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-primary-500"
            >
              <option value="All">Mọi tag</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          )}
        </div>
      </header>

      {/* Main List */}
      <main className="px-4 pt-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy khách hàng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredCustomers.map((c) => (
              <div 
                key={c.id} 
                onClick={() => { setSelectedCustomer(c); setIsEditing(false); setSaveMsg(""); setModalTab("info"); setTimeline([]); setShowDeleteConfirm(false); }}
                className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border ${
                  c.snoozedUntil && new Date(c.snoozedUntil) > new Date() 
                  ? 'border-purple-200 dark:border-purple-900/50 opacity-80' 
                  : 'border-slate-100 dark:border-slate-800'
                } flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform`}
              >
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {c.name}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.heatLevel === 'Hot' ? 'bg-red-100 text-red-700' :
                      c.heatLevel === 'Warm' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {c.heatLevel}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{c.phone}</p>
                  {c.demand && <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{c.demand}</p>}
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {c.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">{t}</span>
                      ))}
                      {c.tags.length > 3 && <span className="text-[9px] font-bold text-slate-400">+{c.tags.length - 3}</span>}
                    </div>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                    c.status === 'New' ? 'bg-indigo-50 text-indigo-700' :
                    c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                    c.status === 'Waiting' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                  {c.snoozedUntil && new Date(c.snoozedUntil) > new Date() && (
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-500/20">
                      Đang gác
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail / Edit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closeModal}>
          <div 
            className="w-full sm:w-[420px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 pb-4 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? "Chỉnh sửa khách hàng" : "Chi tiết khách hàng"}
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button onClick={startEdit} className="p-2 bg-primary-50 dark:bg-primary-500/10 rounded-full text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors" title="Chỉnh sửa">
                    <Edit3 className="w-4.5 h-4.5" />
                  </button>
                )}
                <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Save message */}
            {saveMsg && (
              <div className={`mx-6 mb-2 px-3 py-2 rounded-lg text-sm font-bold ${saveMsg.startsWith("✓") ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}>
                {saveMsg}
              </div>
            )}
            
            {/* Tab Switcher (only in non-edit mode) */}
            {!isEditing && (
              <div className="flex gap-1 mx-6 mb-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                <button onClick={() => setModalTab('info')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-colors ${modalTab === 'info' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500'}`}>
                  <FileText className="w-3.5 h-3.5" /> Thông tin
                </button>
                <button onClick={() => { setModalTab('history'); if (timeline.length === 0) loadHistory(selectedCustomer.id); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-colors ${modalTab === 'history' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500'}`}>
                  <History className="w-3.5 h-3.5" /> Lịch sử
                </button>
              </div>
            )}
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-6 pb-6 custom-scrollbar">
              {isEditing ? (
                /* ===== EDIT MODE ===== */
                <div className="space-y-4">
                  <EditField label="Tên khách hàng" field="name" placeholder="Nguyễn Văn A" />
                  <EditField label="Số điện thoại" field="phone" placeholder="0901234567" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Trạng thái" field="status" options={STATUS_OPTIONS} />
                    <SelectField label="Độ nóng" field="heatLevel" options={HEAT_OPTIONS} />
                  </div>
                  
                  <SelectField label="Hành trình" field="journeyStage" options={JOURNEY_OPTIONS} />
                  <EditField label="Ngân sách" field="budget" placeholder="2-3 tỷ" />
                  <EditField label="Khu vực quan tâm" field="area" placeholder="Quận 7, Quận 2..." />
                  <EditField label="Thời gian dự kiến" field="timeline" placeholder="3 tháng tới" />
                  <EditField label="Nhu cầu chi tiết" field="demand" type="textarea" placeholder="Mô tả nhu cầu..." />

                  {/* Delete confirm */}
                  {showDeleteConfirm && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-900/30">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">Xác nhận xóa vĩnh viễn khách hàng này?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-600 border border-slate-200 dark:border-slate-700">Hủy</button>
                        <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2 bg-red-500 rounded-lg text-sm font-bold text-white disabled:opacity-50">{isDeleting ? 'Đang xóa...' : 'Xóa luôn'}</button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 pb-safe">
                    <button onClick={() => setShowDeleteConfirm(true)} className="p-3 border-2 border-red-200 dark:border-red-900/30 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 transition-all" title="Xóa khách hàng">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-transform">
                      Hủy
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {isSaving ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </div>
              ) : modalTab === 'info' ? (
                /* ===== VIEW MODE ===== */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{selectedCustomer.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedCustomer.phone}
                        </p>
                        {selectedCustomer.snoozedUntil && new Date(selectedCustomer.snoozedUntil) > new Date() && (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-500/20 whitespace-nowrap">
                            Gác đến: {new Date(selectedCustomer.snoozedUntil).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a href={`tel:${selectedCustomer.phone}`} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                      <Phone className="w-4 h-4 fill-current" /> Gọi Điện
                    </a>
                    <a href={`https://zalo.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                      <span className="font-black text-sm">Zalo</span> Nhắn Tin
                    </a>
                  </div>

                  {/* Status and Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Trạng thái</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedCustomer.status}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Độ nóng</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedCustomer.heatLevel}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Hành trình</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={selectedCustomer.journeyStage}>{selectedCustomer.journeyStage}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3.5 border border-slate-100 dark:border-slate-800 max-h-[40vh] overflow-y-auto custom-scrollbar">
                    {/* Timings */}
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/50">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lịch hẹn tiếp theo</p>
                          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            {selectedCustomer.nextFollowUp ? formatDate(selectedCustomer.nextFollowUp) : "Chưa lên lịch"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tương tác cuối</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {selectedCustomer.lastContactAt ? formatDate(selectedCustomer.lastContactAt) : "Chưa có"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Info Fields */}
                    <div className="space-y-3 pt-1">
                      {selectedCustomer.area && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khu vực quan tâm</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedCustomer.area}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedCustomer.budget && (
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 font-bold text-sm w-4 text-center shrink-0">₫</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngân sách dự kiến</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{selectedCustomer.budget}</p>
                          </div>
                        </div>
                      )}

                      {selectedCustomer.finance && (
                        <div className="flex items-start gap-2">
                          <Activity className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tình trạng tài chính</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedCustomer.finance}</p>
                          </div>
                        </div>
                      )}

                      {selectedCustomer.timeline && (
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thời gian dự kiến mua</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedCustomer.timeline}</p>
                          </div>
                        </div>
                      )}

                      {selectedCustomer.demand && (
                        <div className="flex items-start gap-2 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                          <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô tả nhu cầu chi tiết</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white whitespace-pre-wrap">{selectedCustomer.demand}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Additional info block */}
                      <div className="flex flex-col gap-1 pt-2">
                        <p className="text-[10px] text-slate-400">
                          Tạo ngày: {formatDate(selectedCustomer.createdAt)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          ID Khách hàng: {selectedCustomer.id.substring(0, 8).toUpperCase()}
                        </p>
                        {(selectedCustomer.channel || selectedCustomer.source) && (
                          <p className="text-[10px] font-bold text-primary-500">
                            Nguồn: {selectedCustomer.channel || selectedCustomer.source}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tag Manager */}
                  <div className="mt-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(selectedCustomer.tags || []).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">
                          {tag}
                          <button onClick={async () => {
                            const newTags = (selectedCustomer.tags || []).filter(t => t !== tag);
                            await updateCustomerTags(selectedCustomer.id, newTags);
                            setSelectedCustomer({ ...selectedCustomer, tags: newTags });
                          }} className="hover:text-red-500 transition-colors ml-0.5"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                      {(!selectedCustomer.tags || selectedCustomer.tags.length === 0) && (
                        <span className="text-xs text-slate-400 italic">Chưa có tag</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && newTag.trim()) {
                            const updated = [...new Set([...(selectedCustomer.tags || []), newTag.trim()])];
                            await updateCustomerTags(selectedCustomer.id, updated);
                            setSelectedCustomer({ ...selectedCustomer, tags: updated });
                            setNewTag("");
                          }
                        }}
                        placeholder="Thêm tag..."
                        className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                      />
                      <button
                        onClick={async () => {
                          if (!newTag.trim()) return;
                          const updated = [...new Set([...(selectedCustomer.tags || []), newTag.trim()])];
                          await updateCustomerTags(selectedCustomer.id, updated);
                          setSelectedCustomer({ ...selectedCustomer, tags: updated });
                          setNewTag("");
                        }}
                        className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-bold hover:bg-primary-600 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : modalTab === 'history' ? (
                /* ===== HISTORY TAB ===== */
                <div className="space-y-3">
                  {loadingHistory ? (
                    <div className="flex justify-center py-10"><div className="w-7 h-7 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : timeline.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Chưa có lịch sử tương tác nào</p>
                    </div>
                  ) : (
                    timeline.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'note' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-500' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500'}`}>
                            {item.type === 'note' ? <FileText className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                          </div>
                          <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1"></div>
                        </div>
                        <div className="pb-4 flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-400 mb-1">
                            {new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{item.content}</p>
                          {item.outcome && <p className="text-xs text-primary-500 font-medium mt-1">→ {item.outcome}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* FAB removed - moved to header */}

      <BottomNav activeTab="customers" />
    </div>
  );
}
