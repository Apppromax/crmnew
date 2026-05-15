"use client";

import React from "react";
import { X, Flame, CheckCircle2, User, TrendingUp, BarChart3, Database } from "lucide-react";

export default function MemberPerformanceModal({ member, customers, onClose }) {
  if (!member) return null;

  // Lọc danh sách khách hàng của Sale này
  const memberCustomers = customers.filter(c => c.userId === member.userId);

  // Tính toán KPI
  const totalLeads = memberCustomers.length;
  
  const statusCount = memberCustomers.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const heatCount = memberCustomers.reduce((acc, c) => {
    acc[c.heatLevel] = (acc[c.heatLevel] || 0) + 1;
    return acc;
  }, {});

  const activeLeads = (statusCount["Đang chăm"] || 0) + (statusCount["Đang chờ"] || 0);
  const closedLeads = statusCount["Đã chốt"] || 0;
  const lostLeads = statusCount["Mất khách"] || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative p-6 glass shrink-0 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                {member.user.email.split("@")[0]}
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Vai trò: <span className="uppercase text-primary-600">{member.role}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto hide-scrollbar space-y-6">
          
          {/* 3 KPI Blocks */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <Database className="w-5 h-5 mx-auto mb-2 text-slate-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Tổng Lead</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{totalLeads}</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-blue-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600/70 dark:text-blue-400/70 mb-1">Đang Chăm</p>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{activeLeads}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-1">Đã Chốt</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{closedLeads}</p>
            </div>
          </div>

          {/* Biểu đồ nhiệt */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-widest">
              <Flame className="w-4 h-4 text-amber-500" />
              Chất lượng Data
            </h3>
            <div className="space-y-3">
              {[
                { label: "Rất Nét", count: heatCount["Rất Nét"] || 0, color: "bg-red-500", from: "from-red-400", to: "to-red-600", text: "text-red-500" },
                { label: "Tiềm Năng", count: heatCount["Tiềm Năng"] || 0, color: "bg-orange-500", from: "from-orange-400", to: "to-orange-500", text: "text-orange-500" },
                { label: "Quan Tâm", count: heatCount["Quan Tâm"] || 0, color: "bg-amber-400", from: "from-amber-300", to: "to-amber-400", text: "text-amber-500" },
                { label: "Tham Khảo", count: heatCount["Tham Khảo"] || 0, color: "bg-blue-400", from: "from-blue-300", to: "to-blue-400", text: "text-blue-500" },
                { label: "Chưa Rõ", count: heatCount["Chưa Rõ"] || 0, color: "bg-slate-400", from: "from-slate-400", to: "to-slate-500", text: "text-slate-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`w-20 text-xs font-bold ${item.text}`}>{item.label}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${item.from} ${item.to} rounded-full`}
                      style={{ width: `${totalLeads ? (item.count / totalLeads) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-black text-slate-800 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tỉ lệ chuyển đổi */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-black text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tỉ lệ chốt deal</p>
                <p className="text-3xl font-black">
                  {totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0}<span className="text-lg text-slate-400">%</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Mất khách</p>
                <p className="text-xl font-bold text-red-400">{lostLeads}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
