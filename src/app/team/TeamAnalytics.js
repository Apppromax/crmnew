"use client";

import { BarChart3, Users, Flame, CheckCircle2, TrendingUp, Trophy } from "lucide-react";

export default function TeamAnalytics({ stats, members }) {
  if (!stats) return null;

  // Sắp xếp leaderboard (Nhiều Closed nhất -> Nhiều Total nhất)
  const leaderboard = members.map(m => {
    const p = stats.memberPerformance[m.userId] || { total: 0, closed: 0 };
    return { ...m, ...p };
  }).sort((a, b) => b.closed - a.closed || b.total - a.total);

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-6 duration-700">
      {/* Khối KPI Chính */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="group relative p-4 md:p-5 rounded-2xl overflow-hidden shadow-sm border border-slate-800 bg-gradient-to-br from-slate-900 to-black hover:-translate-y-0.5 transition-all duration-300 text-white">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Users className="w-4 h-4 text-primary-400" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Tổng Lead</span>
            </div>
            <p className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">{stats.totalLeads}</p>
          </div>
        </div>

        <div className="group relative p-4 md:p-5 rounded-2xl overflow-hidden shadow-sm border border-blue-200/50 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900 hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Đang Chăm</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white">{(stats.statusCount["Đang chăm"] || 0) + (stats.statusCount["Đang chờ"] || 0)}</p>
          </div>
        </div>

        <div className="group relative p-4 md:p-5 rounded-2xl overflow-hidden shadow-sm border border-emerald-200/50 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Đã Chốt</span>
            </div>
            <p className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600">{stats.statusCount["Đã chốt"] || 0}</p>
          </div>
        </div>

        <div className="group relative p-4 md:p-5 rounded-2xl overflow-hidden shadow-sm border border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500">
              <Flame className="w-4 h-4" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Rất Nét</span>
            </div>
            <p className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600">{stats.heatCount["Rất nét"] || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        {/* Phân bổ Heat Level */}
        <div className="p-5 md:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md shadow-sm">
          <h3 className="text-lg font-black tracking-tight mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            Độ Nét Khách Hàng
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-red-500">Rất nét</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out relative" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Rất nét"] || 0) / stats.totalLeads) * 100 : 0}%` }}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Rất nét"] || 0}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-orange-500">Tiềm năng</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Tiềm năng"] || 0) / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Tiềm năng"] || 0}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-amber-500">Tìm hiểu</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Đang tìm hiểu"] || 0) / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Đang tìm hiểu"] || 0}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-slate-400">Mờ</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Mờ"] || 0) / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Mờ"] || 0}</span>
            </div>
          </div>
        </div>

        {/* Bảng Xếp Hạng Thành Viên */}
        <div className="p-5 md:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md shadow-sm">
          <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            Bảng Vàng
          </h3>
          <div className="space-y-3">
            {leaderboard.map((member, idx) => (
              <div key={member.id} className="group relative flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all duration-300 overflow-hidden">
                <div className="relative flex items-center gap-3">
                  <span className={`w-8 h-8 flex items-center justify-center text-xs font-black rounded-lg shadow-inner ${idx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-500/30' : idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-slate-400/30' : idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-orange-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    #{idx + 1}
                  </span>
                  <div className="font-bold text-sm text-slate-800 dark:text-white">
                    {member.user.email.split('@')[0]}
                  </div>
                </div>
                <div className="relative text-right flex items-center gap-4">
                  <div className="text-xs">
                    <p className="text-slate-400 uppercase tracking-widest font-bold text-[9px] mb-0.5">Đang chăm</p>
                    <p className="font-bold text-sm">{member.total}</p>
                  </div>
                  <div className="text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                    <p className="text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold text-[9px] mb-0.5">Đã chốt</p>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-base leading-none">{member.closed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
