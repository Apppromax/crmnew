"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateCustomer, deleteCustomer, getCustomerInteractions, updateCustomerTags, completeCustomerAction } from "@/actions/customers";
import BottomNav from "@/components/BottomNav";
import UpdateCareSheet from "@/components/UpdateCareSheet";
import { Search, Plus, X, Calendar, Phone, MapPin, Target, Clock, Activity, FileText, Edit3, Save, ChevronDown, Trash2, History, MessageSquare, Tag, Map } from "lucide-react";

const STATUS_OPTIONS = ["Mới", "Chưa liên lạc được", "Đang chăm", "Đang chờ", "Ngủ đông", "Đã chốt", "Mất khách"];
const HEAT_OPTIONS = ["Rất Nét", "Tiềm Năng", "Quan Tâm", "Tham Khảo", "Chưa Rõ"];
const JOURNEY_OPTIONS = [
  "1. Phá băng và tư vấn ban đầu",
  "2. Tư vấn chuyên sâu lần 1",
  "3. Xây dựng lòng tin",
  "4. Hẹn gặp khách",
  "5. Dồn Chốt",
  "6. Chốt Cọc",
  "7. Xây dựng mối quan hệ"
];

const JOURNEY_DETAILS = {
  "1. Phá băng và tư vấn ban đầu": {
    hints: "• Khách rụt rè, chưa cung cấp đủ thông tin.\n• Khách hỏi giá xong im lặng, khách nói 'để xem đã'.",
    actions: ["Gọi điện làm quen", "Gửi tin nhắn gợi mở nhu cầu", "Hỏi thêm về khu vực/tài chính", "Gửi 1-2 dự án mẫu để đo lường phản ứng"]
  },
  "2. Tư vấn chuyên sâu lần 1": {
    hints: "• Khách bắt đầu hỏi sâu về pháp lý, giá, chính sách.\n• So sánh với dự án khác, chê giá cao.",
    actions: ["Gửi thông tin chi tiết dự án", "Làm bảng tính dòng tiền", "Gửi video/hình ảnh thực tế", "Phân tích ưu/nhược điểm so với đối thủ"]
  },
  "3. Xây dựng lòng tin": {
    hints: "• Khách đã ưng nhưng còn lưỡng lự về CĐT hoặc môi giới.\n• Khách muốn xin thêm chiết khấu, 'cần bàn với gia đình'.",
    actions: ["Chia sẻ các case study thành công", "Gửi thông tin uy tín của CĐT", "Cập nhật tiến độ dự án hàng tuần", "Hỏi thăm cá nhân/Tặng quà nhỏ"]
  },
  "4. Hẹn gặp khách": {
    hints: null,
    actions: ["Lên lịch hẹn xem nhà mẫu", "Gọi điện chốt lịch hẹn", "Gửi vị trí định vị/hướng dẫn đường đi", "Gợi ý đưa đón khách"]
  },
  "5. Dồn Chốt": {
    hints: "• Khách im lặng sau khi xem, báo 'không hợp hướng', 'xa quá'.\n• Sợ rủi ro pháp lý, ngân hàng không duyệt vay đủ.",
    actions: ["Gọi điện hỏi thăm cảm nhận sau khi xem", "Đưa ra giải pháp thay thế (căn khác/dự án khác)", "Gửi chính sách thanh toán giãn tiến độ", "Hỗ trợ check CIC/ngân hàng", "Tạo khan hiếm căn đẹp"]
  },
  "6. Chốt Cọc": {
    hints: null,
    actions: ["Soạn thảo hợp đồng cọc", "Hướng dẫn thủ tục ngân hàng", "Chúc mừng và xin feedback"]
  },
  "7. Xây dựng mối quan hệ": {
    hints: null,
    actions: ["Xin lời giới thiệu khách hàng mới (Referral)", "Mời tham gia event tri ân", "Cập nhật tiến độ xây dựng", "Hỗ trợ tìm khách thuê"]
  }
};

export default function CustomerClient({ initialCustomers, allTagsData }) {
  const router = useRouter();
  const [localCustomers, setLocalCustomers] = useState(initialCustomers);
  const teamTags = allTagsData?.teamTags || [];

  useEffect(() => {
    setLocalCustomers(initialCustomers);
  }, [initialCustomers]);

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
  const [activeHintStage, setActiveHintStage] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Tag state
  const [filterTag, setFilterTag] = useState("All");
  const [newTag, setNewTag] = useState("");
  // Sort state
  const [sortBy, setSortBy] = useState("newest");
  // Care state
  const [careNote, setCareNote] = useState("");
  const [careFollowUpOption, setCareFollowUpOption] = useState("1d");
  const [isCaring, setIsCaring] = useState(false);
  const [isUpdateCareOpen, setIsUpdateCareOpen] = useState(false);
  const filteredCustomers = localCustomers.filter((c) => {
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

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case "nameAsc":
        return (a.name || "").localeCompare(b.name || "");
      case "nameDesc":
        return (b.name || "").localeCompare(a.name || "");
      case "heat":
        const heatWeight = { "Rất Nét": 5, "Tiềm Năng": 4, "Quan Tâm": 3, "Tham Khảo": 2, "Chưa Rõ": 1 };
        return (heatWeight[b.heatLevel] || 0) - (heatWeight[a.heatLevel] || 0);
      case "recentActivity":
        return new Date(b.lastInteraction || b.updatedAt || 0) - new Date(a.lastInteraction || a.updatedAt || 0);
      default:
        return 0;
    }
  });

  // Collect all unique tags for filter dropdown
  const allTags = [...new Set(localCustomers.flatMap(c => c.tags || []))].sort();

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
      status: selectedCustomer.status || "Mới",
      heatLevel: selectedCustomer.heatLevel || "Chưa Rõ",
      budget: selectedCustomer.budget || "",
      area: selectedCustomer.area || "",
      demand: selectedCustomer.demand || "",
      timeline: selectedCustomer.timeline || "",
      journeyStage: selectedCustomer.journeyStage || "1. Phá băng và tư vấn ban đầu",
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
      setLocalCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
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
    setActiveHintStage(null);
    setTimeline([]);
    setShowDeleteConfirm(false);
    setCareNote("");
    setCareFollowUpOption("1d");
  };

  const handleCare = async () => {
    if (!careNote.trim()) {
      setSaveMsg("Vui lòng nhập nội dung chăm sóc");
      return;
    }
    setIsCaring(true);
    setSaveMsg("");
    try {
      const nextDate = new Date();
      if (careFollowUpOption.endsWith('h')) {
        nextDate.setHours(nextDate.getHours() + parseInt(careFollowUpOption));
      } else {
        nextDate.setDate(nextDate.getDate() + parseInt(careFollowUpOption));
      }
      
      await completeCustomerAction({
        customerId: selectedCustomer.id,
        note: careNote,
        nextFollowUp: nextDate.toISOString(),
      });
      setSaveMsg("✓ Đã cập nhật trạng thái");
      setCareNote("");
      // Refresh timeline if loaded
      if (timeline.length > 0) {
        loadHistory(selectedCustomer.id);
      }
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (err) {
      setSaveMsg("Lỗi: " + err.message);
    } finally {
      setIsCaring(false);
    }
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
      setLocalCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
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
    <div className="min-h-screen bg-transparent pb-24 md:pb-0 md:pl-64 transition-all duration-300">
      {/* Header */}
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">Kho khách hàng</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500 hidden sm:inline">{localCustomers.length} người</span>
            <button 
              onClick={() => router.push("/add")}
              className="h-9 px-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/30 font-bold text-sm"
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
        
        {/* Filters and Sorting */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-primary-700 dark:text-primary-400 outline-none focus:border-primary-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="recentActivity">Tương tác gần đây</option>
            <option value="heat">Rõ nét nhất</option>
            <option value="nameAsc">Tên A-Z</option>
            <option value="nameDesc">Tên Z-A</option>
          </select>
          <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-primary-500"
          >
            <option value="All">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={filterHeat}
            onChange={(e) => setFilterHeat(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-primary-500"
          >
            <option value="All">Mọi mức độ nét</option>
            {HEAT_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:border-primary-500"
            >
              <option value="All">Mọi dự án/khu vực</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          )}
        </div>
      </header>

      {/* Main List */}
      <main className="px-4 pt-4">
        {sortedCustomers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy khách hàng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {sortedCustomers.map((c) => (
              <div 
                key={c.id} 
                onClick={() => { setSelectedCustomer(c); setIsEditing(false); setSaveMsg(""); setModalTab("info"); setTimeline([]); setShowDeleteConfirm(false); }}
                className={`bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-sm border ${
                  c.snoozedUntil && new Date(c.snoozedUntil) > new Date() 
                  ? 'border-purple-200 dark:border-purple-900/50 opacity-80' 
                  : 'border-slate-100 dark:border-slate-800'
                } flex flex-col gap-1.5 cursor-pointer active:scale-[0.98] transition-transform`}
              >
                {/* Row 1: Name + Heat + Status */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                    {c.name}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      c.heatLevel === 'Rất Nét' ? 'bg-red-100 text-red-700' :
                      c.heatLevel === 'Tiềm Năng' ? 'bg-orange-100 text-orange-700' :
                      c.heatLevel === 'Quan Tâm' ? 'bg-amber-100 text-amber-700' :
                      c.heatLevel === 'Tham Khảo' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {c.heatLevel}
                    </span>
                  </h3>
                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      c.status === 'Mới' ? 'bg-indigo-50 text-indigo-700' :
                      c.status === 'Chưa liên lạc được' ? 'bg-orange-50 text-orange-700' :
                      c.status === 'Đang chăm' ? 'bg-emerald-50 text-emerald-700' :
                      c.status === 'Đang chờ' ? 'bg-amber-50 text-amber-700' :
                      c.status === 'Ngủ đông' ? 'bg-slate-100 text-slate-600' :
                      c.status === 'Đã chốt' ? 'bg-blue-50 text-blue-700' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Row 2: Phone + Demand */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="shrink-0 font-medium">{c.phone}</span>
                  {c.demand && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-400 truncate">{c.demand}</span>
                    </>
                  )}
                </div>
                
                {/* Row 3: Journey + Tags */}
                <div className="flex items-center justify-between gap-3 mt-1">
                  <div className="flex flex-1 items-center gap-1.5 w-full max-w-[140px]">
                    <div className="flex-1 flex h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden gap-0.5">
                      {JOURNEY_OPTIONS.map((_, idx) => {
                        const currentIdx = Math.max(0, JOURNEY_OPTIONS.findIndex(s => s.startsWith((c.journeyStage || "1.").split(".")[0])));
                        const opacities = ['opacity-20', 'opacity-30', 'opacity-40', 'opacity-60', 'opacity-80', 'opacity-90', 'opacity-100'];
                        return (
                          <div 
                            key={idx} 
                            className={`h-full flex-1 ${idx <= currentIdx ? 'bg-primary-500 ' + (opacities[idx] || 'opacity-100') : 'bg-transparent'}`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 shrink-0 truncate max-w-[90px]">
                      {(c.journeyStage || "1.").split(". ")[1]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {c.snoozedUntil && new Date(c.snoozedUntil) > new Date() && (
                      <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-500/20 mr-1">
                        Hoãn
                      </span>
                    )}
                    {c.tags && c.tags.slice(0, 2).map(t => {
                      const isTeamTag = teamTags.includes(t);
                      return (
                        <span key={t} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate max-w-[65px] ${isTeamTag ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-500/20'}`}>
                          {t}
                        </span>
                      )
                    })}
                    {c.tags && c.tags.length > 2 && <span className="text-[9px] font-bold text-slate-400">+{c.tags.length - 2}</span>}
                  </div>
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
              <div className="flex gap-2 mx-6 mb-3 shrink-0">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button onClick={() => setModalTab('info')} className={`px-2 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-colors ${modalTab === 'info' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    <FileText className="w-3.5 h-3.5" /> Thông tin
                  </button>
                  <button onClick={() => { setModalTab('history'); if (timeline.length === 0) loadHistory(selectedCustomer.id); }} className={`px-2 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-colors ${modalTab === 'history' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    <History className="w-3.5 h-3.5" /> Lịch sử
                  </button>
                </div>
                <button 
                  onClick={() => setIsUpdateCareOpen(true)}
                  className="flex-1 px-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-primary-500/30 active:scale-95 transition-all whitespace-nowrap"
                >
                  <Activity className="w-3.5 h-3.5" /> Cập nhật chăm khách
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
                    <SelectField label="Độ nét" field="heatLevel" options={HEAT_OPTIONS} />
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
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl shrink-0">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">{selectedCustomer.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-sm text-slate-500 flex items-center gap-1 shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                            {selectedCustomer.phone}
                          </p>
                          {selectedCustomer.snoozedUntil && new Date(selectedCustomer.snoozedUntil) > new Date() && (
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-500/20 whitespace-nowrap">
                              Tạm hoãn đến: {new Date(selectedCustomer.snoozedUntil).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <a 
                        href={selectedCustomer.phone ? `tel:${selectedCustomer.phone.replace(/[^0-9+]/g, '')}` : '#'} 
                        onClick={(e) => {
                          if (!selectedCustomer.phone) {
                            e.preventDefault();
                            alert('Khách hàng này chưa có số điện thoại!');
                          }
                        }}
                        className="w-10 h-10 shrink-0 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center transition-all active:scale-95"
                      >
                        <Phone className="w-4 h-4 fill-current" />
                      </a>
                      <a 
                        href={selectedCustomer.phone ? `https://zalo.me/${selectedCustomer.phone.replace(/[^0-9]/g, '').replace(/^84/, '0')}` : '#'} 
                        target={selectedCustomer.phone ? "_blank" : "_self"} 
                        rel="noopener noreferrer" 
                        onClick={(e) => {
                          if (!selectedCustomer.phone) {
                            e.preventDefault();
                            alert('Khách hàng này chưa có số điện thoại!');
                          }
                        }}
                        className="w-10 h-10 shrink-0 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center transition-all font-black text-[10px] active:scale-95"
                      >
                        Zalo
                      </a>
                    </div>
                  </div>
                  {/* Status and Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Trạng thái</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedCustomer.status || "Mới"}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Hành trình</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={selectedCustomer.journeyStage}>{selectedCustomer.journeyStage ? selectedCustomer.journeyStage.split(". ")[1] || selectedCustomer.journeyStage : "Mới"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 px-1">
                      <p className="text-[10px] uppercase text-slate-400">Mức độ nét:</p>
                      <p className="font-bold text-xs text-slate-600 dark:text-slate-300">{selectedCustomer.heatLevel || "Chưa Rõ"}</p>
                  </div>

                  {/* Journey Component */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-4 shadow-sm">
                    <p className="text-sm font-bold mb-3 flex items-center justify-between text-slate-800 dark:text-white">
                      Hành trình khách hàng
                      <span className="text-xs font-bold text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-md">
                        {Math.max(0, JOURNEY_OPTIONS.indexOf(selectedCustomer.journeyStage || JOURNEY_OPTIONS[0])) + 1}/{JOURNEY_OPTIONS.length}
                      </span>
                    </p>
                    <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
                      {JOURNEY_OPTIONS.map((stage, idx) => {
                        const currentIdx = Math.max(0, JOURNEY_OPTIONS.findIndex(s => s.startsWith((selectedCustomer.journeyStage || "1.").split(".")[0])));
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        const hasHint = JOURNEY_DETAILS[stage]?.hints;
                        return (
                          <div 
                            key={stage} 
                            onClick={() => hasHint && setActiveHintStage(activeHintStage === stage ? null : stage)}
                            className={`shrink-0 w-[100px] flex flex-col gap-1.5 ${hasHint ? 'cursor-pointer hover:opacity-80' : ''}`}
                          >
                            <div className={`w-full h-2 rounded-full transition-colors ${isPast ? 'bg-emerald-500' : isCurrent ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            <span className={`text-[10px] font-bold leading-tight ${isPast ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                              {stage.split('. ')[1]}
                            </span>
                            {hasHint && (
                              <div className={`text-[9px] px-1 py-0.5 rounded w-max border ${activeHintStage === stage ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-400' : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'} mt-auto transition-colors`}>
                                Xem gợi ý
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {activeHintStage && JOURNEY_DETAILS[activeHintStage]?.hints && (
                      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-900/30 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">Gợi ý: {activeHintStage.split('. ')[1]}</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 whitespace-pre-wrap leading-relaxed">{JOURNEY_DETAILS[activeHintStage].hints}</p>
                      </div>
                    )}
                    
                    {JOURNEY_DETAILS[selectedCustomer.journeyStage || JOURNEY_OPTIONS[0]]?.actions?.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Hành động đề xuất tiếp theo
                        </label>
                        <div className="relative">
                          <select 
                            className="w-full text-sm p-3 pr-8 rounded-xl border border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none shadow-sm"
                            onChange={(e) => {
                              if (e.target.value) {
                                setIsUpdateCareOpen(true);
                                e.target.value = "";
                              }
                            }}
                          >
                            <option value="">-- Chọn để ghi nhận --</option>
                            {JOURNEY_DETAILS[selectedCustomer.journeyStage || JOURNEY_OPTIONS[0]].actions.map(action => (
                              <option key={action} value={action}>{action}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-primary-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}
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

                    {/* Info Fields - Table Layout */}
                    <div className="space-y-3 pt-2">
                      {selectedCustomer.budget && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="text-slate-400 font-bold w-4 text-center">₫</span> Ngân sách dự kiến
                          </p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">{selectedCustomer.budget}</p>
                        </div>
                      )}

                      {selectedCustomer.area && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Khu vực quan tâm
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white text-right">{selectedCustomer.area}</p>
                        </div>
                      )}

                      {selectedCustomer.timeline && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-slate-400" /> Thời gian dự kiến
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white text-right">{selectedCustomer.timeline}</p>
                        </div>
                      )}

                      {selectedCustomer.finance && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-slate-400" /> Tình trạng tài chính
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white text-right">{selectedCustomer.finance}</p>
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
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1"><Map className="w-3 h-3" /> Dự án / Khu vực (Tags)</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(selectedCustomer.tags || []).map(tag => {
                        const isTeamTag = teamTags.includes(tag);
                        return (
                          <span key={tag} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${isTeamTag ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm' : 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-500/20'}`}>
                            {tag}
                            <button onClick={async () => {
                              const newTags = (selectedCustomer.tags || []).filter(t => t !== tag);
                              await updateCustomerTags(selectedCustomer.id, newTags);
                              setSelectedCustomer({ ...selectedCustomer, tags: newTags });
                              setLocalCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, tags: newTags } : c));
                            }} className={`transition-colors ml-0.5 ${isTeamTag ? 'hover:text-white/70' : 'hover:text-red-500'}`}><X className="w-3 h-3" /></button>
                          </span>
                        );
                      })}
                      {(!selectedCustomer.tags || selectedCustomer.tags.length === 0) && (
                        <span className="text-xs text-slate-400 italic">Chưa gắn vào dự án nào</span>
                      )}
                    </div>

                    {teamTags.filter(t => !(selectedCustomer.tags || []).includes(t)).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {teamTags.filter(t => !(selectedCustomer.tags || []).includes(t)).map(tag => (
                          <button
                            key={tag}
                            onClick={async () => {
                              const updated = [...new Set([...(selectedCustomer.tags || []), tag])];
                              await updateCustomerTags(selectedCustomer.id, updated);
                              setSelectedCustomer({ ...selectedCustomer, tags: updated });
                              setLocalCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, tags: updated } : c));
                            }}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 dark:text-indigo-400 rounded border border-indigo-200 dark:border-indigo-500/30 text-[10px] font-bold transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    )}
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
                            setLocalCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, tags: updated } : c));
                            setNewTag("");
                          }
                        }}
                        placeholder="Nhập tên dự án / khu vực mới..."
                        className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                      />
                      <button
                        onClick={async () => {
                          if (!newTag.trim()) return;
                          const updated = [...new Set([...(selectedCustomer.tags || []), newTag.trim()])];
                          await updateCustomerTags(selectedCustomer.id, updated);
                          setSelectedCustomer({ ...selectedCustomer, tags: updated });
                          setLocalCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, tags: updated } : c));
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

      <UpdateCareSheet
        isOpen={isUpdateCareOpen}
        customer={selectedCustomer}
        onClose={() => setIsUpdateCareOpen(false)}
        onComplete={async (data) => {
          try {
            await completeCustomerAction(data);
            setIsUpdateCareOpen(false);
            setSaveMsg("✓ Đã lưu thông tin chăm sóc");
            setTimeout(() => setSaveMsg(""), 3000);
            
            // Update local state
            setSelectedCustomer(prev => ({
              ...prev,
              status: data.status || prev.status,
              journeyStage: data.journeyStage || prev.journeyStage,
              nextFollowUp: data.nextFollowUp || prev.nextFollowUp,
            }));
            
            // Reload history if on history tab
            if (modalTab === 'history') {
              loadHistory(selectedCustomer.id);
            }
          } catch (err) {
            console.error(err);
            setSaveMsg("❌ Có lỗi xảy ra, vui lòng thử lại");
          }
        }}
      />
    </div>
  );
}
