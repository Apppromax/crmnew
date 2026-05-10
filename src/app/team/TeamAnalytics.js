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
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      {/* Khối KPI Chính */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="group relative p-6 rounded-3xl overflow-hidden shadow-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-black hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Users className="w-5 h-5 text-primary-400" />
              <span className="text-xs font-bold uppercase tracking-widest">Tổng Lead</span>
            </div>
            <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">{stats.totalLeads}</p>
          </div>
        </div>

        <div className="group relative p-6 rounded-3xl overflow-hidden shadow-lg border border-blue-200/50 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900 hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Đang Chăm</span>
            </div>
            <p className="text-5xl font-black text-slate-800 dark:text-white">{stats.statusCount.Active + stats.statusCount.Waiting}</p>
          </div>
        </div>

        <div className="group relative p-6 rounded-3xl overflow-hidden shadow-lg border border-emerald-200/50 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Đã Chốt</span>
            </div>
            <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600">{stats.statusCount.Closed}</p>
          </div>
        </div>

        <div className="group relative p-6 rounded-3xl overflow-hidden shadow-lg border border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 hover:shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-500">
              <Flame className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Khách Nóng</span>
            </div>
            <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600">{stats.heatCount.Hot}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Phân bổ Heat Level */}
        <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            Nhiệt Độ Khách Hàng
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <span className="w-16 text-sm font-black tracking-wider text-red-500 group-hover:scale-110 transition-transform">HOT</span>
              <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out relative" style={{ width: `${stats.totalLeads ? (stats.heatCount.Hot / stats.totalLeads) * 100 : 0}%` }}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <span className="w-10 text-right text-lg font-black text-slate-800 dark:text-white">{stats.heatCount.Hot}</span>
            </div>
            <div className="flex items-center gap-4 group">
              <span className="w-16 text-sm font-black tracking-wider text-amber-500 group-hover:scale-110 transition-transform">WARM</span>
              <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? (stats.heatCount.Warm / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-10 text-right text-lg font-black text-slate-800 dark:text-white">{stats.heatCount.Warm}</span>
            </div>
            <div className="flex items-center gap-4 group">
              <span className="w-16 text-sm font-black tracking-wider text-blue-400 dark:text-blue-500 group-hover:scale-110 transition-transform">COLD</span>
              <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-300 to-blue-400 dark:from-blue-500 dark:to-blue-600 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? (stats.heatCount.Cold / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-10 text-right text-lg font-black text-slate-800 dark:text-white">{stats.heatCount.Cold}</span>
            </div>
          </div>
        </div>

        {/* Bảng Xếp Hạng Thành Viên */}
        <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <Trophy className="w-6 h-6" />
            </div>
            Bảng Vàng Đội Nhóm
          </h3>
          <div className="space-y-4">
            {leaderboard.map((member, idx) => (
              <div key={member.id} className="group relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 hover:border-amber-200 dark:hover:border-amber-900/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-4">
                  <span className={`w-10 h-10 flex items-center justify-center text-sm font-black rounded-xl shadow-inner ${idx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-500/30' : idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-slate-400/30' : idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-orange-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    #{idx + 1}
                  </span>
                  <div className="font-bold text-base text-slate-800 dark:text-white">
                    {member.user.email.split('@')[0]}
                  </div>
                </div>
                <div className="relative text-right flex items-center gap-6">
                  <div className="text-xs">
                    <p className="text-slate-400 uppercase tracking-widest font-bold text-[10px] mb-0.5">Đang chăm</p>
                    <p className="font-bold text-base">{member.total}</p>
                  </div>
                  <div className="text-xs bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                    <p className="text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold text-[10px] mb-0.5">Đã chốt</p>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg leading-none">{member.closed}</p>
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
