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
    <div className="space-y-6">
      {/* Khối KPI Chính */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 border-2 border-slate-900 dark:border-slate-100 bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          <div className="flex items-center gap-2 mb-2 text-slate-300 dark:text-slate-600">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Tổng Lead</span>
          </div>
          <p className="text-4xl font-black">{stats.totalLeads}</p>
        </div>

        <div className="p-5 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Đang Chăm</span>
          </div>
          <p className="text-4xl font-black">{stats.statusCount.Active + stats.statusCount.Waiting}</p>
        </div>

        <div className="p-5 border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/10">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Đã Chốt</span>
          </div>
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{stats.statusCount.Closed}</p>
        </div>

        <div className="p-5 border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Khách Nóng</span>
          </div>
          <p className="text-4xl font-black text-red-600 dark:text-red-400">{stats.heatCount.Hot}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Phân bổ Heat Level */}
        <div className="p-6 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            Nhiệt Độ Khách Hàng
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm font-bold text-red-500">HOT</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${stats.totalLeads ? (stats.heatCount.Hot / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-sm font-bold">{stats.heatCount.Hot}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm font-bold text-amber-500">WARM</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${stats.totalLeads ? (stats.heatCount.Warm / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-sm font-bold">{stats.heatCount.Warm}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm font-bold text-slate-500">COLD</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400" style={{ width: `${stats.totalLeads ? (stats.heatCount.Cold / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-sm font-bold">{stats.heatCount.Cold}</span>
            </div>
          </div>
        </div>

        {/* Bảng Xếp Hạng Thành Viên */}
        <div className="p-6 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Bảng Vàng (Leaderboard)
          </h3>
          <div className="space-y-3">
            {leaderboard.map((member, idx) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center text-xs font-black rounded-full ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  <div className="font-bold text-sm">
                    {member.user.email.split('@')[0]}
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="text-xs">
                    <p className="text-slate-400 uppercase tracking-widest font-bold text-[10px]">Đang cầm</p>
                    <p className="font-bold">{member.total}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold text-[10px]">Đã chốt</p>
                    <p className="font-black text-emerald-600 dark:text-emerald-400">{member.closed}</p>
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
