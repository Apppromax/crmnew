"use client";

import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, User, Database, PieChart, Users, Star, LayoutDashboard, UserCheck } from "lucide-react";
import LeadDistribution from "./LeadDistribution";
import TeamAnalytics from "./TeamAnalytics";

export default function TeamDashboardClient({ team, role, members, customers, stats }) {
  const isLeader = role === "LEADER";
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'members', 'leads'

  if (!isLeader) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-24 md:pb-8">
        <div className="relative overflow-hidden rounded-2xl glass p-5 md:p-6 text-slate-800 dark:text-white shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/30 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm">
              {team.name}
            </h1>
          </div>
        </div>
        <div className="p-6 rounded-2xl glass shadow-sm text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-primary-500 drop-shadow-sm" />
          </div>
          <h2 className="text-xl font-black uppercase mb-2 text-slate-800 dark:text-slate-100">Bạn là Thành Viên</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-sm mx-auto">
            Bạn đang hoạt động trong team <span className="font-bold text-slate-800 dark:text-white">"{team.name}"</span>. 
            Trưởng nhóm có thể phân bổ khách hàng cho bạn từ hệ thống.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-24 md:pb-8 flex flex-col h-full min-h-[calc(100vh-100px)]">
      {/* HEADER BAR (Compact) */}
      <div className="relative overflow-hidden rounded-t-3xl glass p-5 text-slate-900 dark:text-white shadow-lg shrink-0">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">
                Quản trị
              </span>
              {team.isActive && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 backdrop-blur-sm">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> Active
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">{team.name}</h1>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Mã Mời</span>
            <span className="text-xl font-black tracking-[0.1em] text-primary-600 dark:text-primary-400 bg-white/50 dark:bg-white/10 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">{team.inviteCode}</span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex p-1.5 glass rounded-b-3xl shrink-0 shadow-inner rounded-t-none border-t-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-2xl transition-all ${
            activeTab === "overview" 
              ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Tổng Quan
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-2xl transition-all ${
            activeTab === "members" 
              ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Users className="w-4 h-4" /> Nhân Sự
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-2xl transition-all ${
            activeTab === "leads" 
              ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Database className="w-4 h-4" /> Điều Phối
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-4 flex-1 overflow-y-auto hide-scrollbar">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <TeamAnalytics stats={stats} members={members} />
          </div>
        )}

        {activeTab === "members" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                Quản lý thành viên ({members.length}/{team.maxMembers})
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3">
              {members.map((m) => {
                const memberStats = stats?.memberPerformance?.[m.userId] || { total: 0, closed: 0 };
                return (
                  <div key={m.id} className="group flex flex-col p-4 rounded-2xl glass hover:border-primary-400/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-white shadow-sm ${m.role === 'LEADER' ? 'bg-gradient-to-br from-primary-400 to-blue-600' : 'bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-700 dark:to-slate-800'}`}>
                          {m.role === 'LEADER' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{m.user.email.split('@')[0]}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Tham gia: {new Date(m.joinedAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${m.role === 'LEADER' ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                        {m.role}
                      </span>
                    </div>
                    
                    {/* Performance mini-stats */}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex-1 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg py-1.5">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Đang chăm</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{memberStats.total}</span>
                      </div>
                      <div className="flex-1 text-center bg-emerald-50 dark:bg-emerald-500/10 rounded-lg py-1.5">
                        <span className="block text-[9px] text-emerald-600/70 dark:text-emerald-400/70 font-bold uppercase">Đã chốt</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{memberStats.closed}</span>
                      </div>
                      <button className="flex-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-[11px] rounded-lg py-2 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <LeadDistribution members={members} initialCustomers={customers} teamId={team.id} />
          </div>
        )}
      </div>
    </div>
  );
}
