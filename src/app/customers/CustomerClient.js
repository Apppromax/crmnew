"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Search, Plus, X, Calendar, Phone, MapPin, Target, Clock, Activity, FileText } from "lucide-react";

export default function CustomerClient({ initialCustomers }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterHeat, setFilterHeat] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = initialCustomers.filter((c) => {
    const term = search.toLowerCase();
    const matchSearch = 
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.demand && c.demand.toLowerCase().includes(term));
      
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchHeat = filterHeat === "All" || c.heatLevel === filterHeat;
    
    return matchSearch && matchStatus && matchHeat;
  });

  const formatDate = (isoString) => {
    if (!isoString) return "Chưa cập nhật";
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN", {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
                onClick={() => setSelectedCustomer(c)}
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

      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
          <div 
            className="w-full sm:w-[400px] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết khách hàng</h2>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-4">
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


            </div>
          </div>
        </div>
      )}

      {/* FAB removed - moved to header */}

      <BottomNav activeTab="customers" />
    </div>
  );
}
