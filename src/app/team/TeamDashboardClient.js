"use client";
import Link from "next/link";
import React, { useState, useTransition } from "react";
import { ShieldAlert, ShieldCheck, User, Database, PieChart, Users, Star, LayoutDashboard, UserCheck, Settings, Loader2, ArrowLeft } from "lucide-react";
import LeadDistribution from "./LeadDistribution";
import TeamAnalytics from "./TeamAnalytics";
import MemberPerformanceModal from "./MemberPerformanceModal";
import { updateTeamProjectTags } from "@/actions/team";

export default function TeamDashboardClient({ team, role, members, customers, stats }) {
  const isLeader = role === "LEADER";
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'members', 'leads', 'settings'
  const [selectedMember, setSelectedMember] = useState(null);
  
  const [isPending, startTransition] = useTransition();
  const [tagsInput, setTagsInput] = useState(team.projectTags?.join(", ") || "");

  if (!isLeader) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-24 md:pb-8">
        <div className="relative overflow-hidden rounded-2xl glass p-5 md:p-6 text-slate-800 dark:text-white shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/30 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-white" />
            </Link>
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
      {/* HEADER EXACTLY LIKE MOCKUP */}
      <div className="flex items-center justify-between pt-1 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Team</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Tổng quan nhanh hiệu suất team hôm nay</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => window.location.reload()} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
          </button>
          <button onClick={() => alert(`Mã mời của team: ${team.inviteCode}`)} className="w-9 h-9 rounded-full bg-primary-500 shadow-lg shadow-primary-500/30 flex items-center justify-center text-white hover:bg-primary-600 transition-all active:scale-95 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all relative shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 border border-white dark:border-slate-800"></span>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION (Subtle) */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto hide-scrollbar pb-1">
        <button onClick={() => setActiveTab("overview")} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm'}`}>Tổng Quan</button>
        <button onClick={() => setActiveTab("members")} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeTab === 'members' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm'}`}>Nhân Sự (Mã: {team.inviteCode})</button>
        <button onClick={() => setActiveTab("leads")} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeTab === 'leads' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm'}`}>Điều Phối</button>
        <button onClick={() => setActiveTab("settings")} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${activeTab === 'settings' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm'}`}>
          <Settings className="w-3 h-3" /> Cài đặt
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <TeamAnalytics stats={stats} members={members} customers={customers} setActiveTab={setActiveTab} />
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
                const now = new Date();
                const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
                
                const hasClosingSoon = customers.some(c => c.userId === m.userId && (
                  c.heatLevel?.includes("Rất Nét") || 
                  c.heatLevel?.includes("Chốt Ngay") || 
                  c.journeyStage?.includes("Dồn Chốt") || 
                  c.journeyStage?.includes("Chốt Cọc")
                ));
                
                const hasUpcomingAppt = customers.some(c => c.userId === m.userId && c.nextFollowUp && new Date(c.nextFollowUp) > now && new Date(c.nextFollowUp) <= in48h);

                return (
                  <div key={m.id} className="group flex flex-col p-4 rounded-2xl glass hover:border-primary-400/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-white shadow-sm ${m.role === 'LEADER' ? 'bg-gradient-to-br from-primary-400 to-blue-600' : 'bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-700 dark:to-slate-800'}`}>
                          {m.role === 'LEADER' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                            {m.user.email.split('@')[0]}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">Tham gia: {new Date(m.joinedAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${m.role === 'LEADER' ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                        {m.role}
                      </span>
                    </div>

                    {(hasClosingSoon || hasUpcomingAppt) && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {hasClosingSoon && (
                           <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-bold uppercase tracking-widest border border-red-100 dark:border-red-500/20 flex items-center gap-1">
                             🔥 Đang có khách Sắp chốt
                           </span>
                        )}
                        {hasUpcomingAppt && (
                           <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-widest border border-amber-100 dark:border-amber-500/20 flex items-center gap-1">
                             ⏰ Sắp có hẹn
                           </span>
                        )}
                      </div>
                    )}
                    
                    {/* Performance mini-stats */}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex-1 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg py-1.5">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Đang chăm</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{memberStats.active}</span>
                      </div>
                      <div className="flex-1 text-center bg-emerald-50 dark:bg-emerald-500/10 rounded-lg py-1.5">
                        <span className="block text-[9px] text-emerald-600/70 dark:text-emerald-400/70 font-bold uppercase">Đã chốt</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{memberStats.closed}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedMember(m)}
                        className="flex-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-[11px] rounded-lg py-2 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
                      >
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

        {activeTab === "settings" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <div className="p-4 md:p-6 glass rounded-2xl">
              <h2 className="text-lg font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-500" />
                Cài đặt Team
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Cấu hình các tag dự án cho Team. Khi Sales chọn các tag này, dữ liệu khách hàng sẽ được đẩy về cho bạn (Trưởng phòng) xem và quản lý.
              </p>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tags Dự Án (Cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="VD: Vinhomes, Dự án A, BĐS Nghỉ dưỡng..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Nếu để trống, bạn sẽ thấy tất cả khách hàng của Sales trong team. Nếu nhập, bạn chỉ thấy khách có tag khớp với các tag này.
                  </p>
                </div>

                <button
                  onClick={() => {
                    startTransition(async () => {
                      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
                      try {
                        await updateTeamProjectTags(team.id, tags);
                        alert("Cập nhật tag dự án thành công!");
                      } catch (err) {
                        alert(err.message);
                      }
                    });
                  }}
                  disabled={isPending}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Lưu Cài Đặt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedMember && (
        <MemberPerformanceModal 
          member={selectedMember} 
          customers={customers} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </div>
  );
}
