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
        {/* Total Leads Card */}
        <div className="group relative p-4 md:p-5 rounded-2xl overflow-hidden glass hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
              <Users className="w-4 h-4 text-primary-500" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Tổng Lead</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white drop-shadow-sm">{stats.totalLeads}</p>
          </div>
        </div>

        {/* Active Card */}
        <div className="group relative p-4 md:p-5 rounded-2xl overflow-hidden glass hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-4 h-4 text-blue-500 drop-shadow-sm" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Đang Chăm</span>
            </div>
            <p className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white drop-shadow-sm">{(stats.statusCount["Đang chăm"] || 0) + (stats.statusCount["Đang chờ"] || 0)}</p>
          </div>
        </div>

        {/* Closed Card */}
        <div className="group relative p-4 md:p-5 rounded-2xl overflow-hidden glass hover:-translate-y-0.5 transition-all duration-300 border-emerald-500/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 drop-shadow-sm" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Đã Chốt</span>
            </div>
            <p className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-300 dark:to-emerald-500 drop-shadow-sm">{stats.statusCount["Đã chốt"] || 0}</p>
          </div>
        </div>

        {/* Hot Card */}
        <div className="group relative p-4 md:p-5 rounded-2xl overflow-hidden glass hover:-translate-y-0.5 transition-all duration-300 border-amber-500/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 drop-shadow-sm" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Rất Nét</span>
            </div>
            <p className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-amber-600 to-amber-800 dark:from-amber-300 dark:to-amber-500 drop-shadow-sm">{stats.heatCount["Rất Nét"] || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        {/* Phân bổ Heat Level */}
        <div className="p-5 md:p-6 rounded-2xl glass shadow-sm">
          <h3 className="text-lg font-black tracking-tight mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            Độ Nét Gốc
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-red-500">Rất Nét</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out relative" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Rất Nét"] || 0) / stats.totalLeads) * 100 : 0}%` }}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Rất Nét"] || 0}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-orange-500">Tiềm Năng</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Tiềm Năng"] || 0) / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Tiềm Năng"] || 0}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-amber-500">Quan Tâm</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Quan Tâm"] || 0) / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Quan Tâm"] || 0}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-blue-500">Tham Khảo</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-300 to-blue-400 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Tham Khảo"] || 0) / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Tham Khảo"] || 0}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <span className="w-16 text-xs font-black tracking-wider text-slate-400">Chưa Rõ</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 transition-all duration-1000 ease-out" style={{ width: `${stats.totalLeads ? ((stats.heatCount["Chưa Rõ"] || 0) / stats.totalLeads) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{stats.heatCount["Chưa Rõ"] || 0}</span>
            </div>
          </div>
        </div>

        {/* Phân bổ Mốc Hành Trình */}
        <div className="p-5 md:p-6 rounded-2xl glass shadow-sm">
          <h3 className="text-lg font-black tracking-tight mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            Mốc Hành Trình
          </h3>
          <div className="space-y-4">
            {[
              "1. Phá băng và tư vấn ban đầu",
              "2. Tư vấn chuyên sâu lần 1",
              "3. Xây dựng lòng tin",
              "4. Hẹn gặp khách",
              "5. Dồn Chốt",
              "6. Chốt Cọc",
              "7. Xây dựng mối quan hệ"
            ].map((stage, idx) => {
              const count = stats.journeyCount[stage] || 0;
              if (count === 0 && stats.totalLeads > 0) return null;
              const shortStage = stage.split(". ")[1] || stage;
              return (
                <div key={stage} className="flex items-center gap-3 group">
                  <span className="w-24 text-xs font-black tracking-wider text-slate-600 dark:text-slate-300 truncate" title={shortStage}>
                    {shortStage}
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000 ease-out relative" 
                      style={{ width: `${stats.totalLeads ? (count / stats.totalLeads) * 100 : 0}%` }}
                    >
                      {idx === 0 && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                    </div>
                  </div>
                  <span className="w-8 text-right text-base font-black text-slate-800 dark:text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bảng Xếp Hạng Thành Viên */}
      <div className="p-5 md:p-6 rounded-2xl glass shadow-sm mt-4 md:mt-5">
        <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          Bảng Vàng
        </h3>
        <div className="space-y-3">
          {leaderboard.map((member, idx) => (
            <div key={member.id} className="group relative flex items-center justify-between p-3 rounded-xl bg-slate-100/30 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center text-xs font-black rounded-lg shadow-inner ${idx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-500/30' : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 shadow-slate-400/30' : idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/30' : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'}`}>
                  #{idx + 1}
                </span>
                <div className="font-bold text-sm text-slate-800 dark:text-white">
                  {member.user.email.split('@')[0]}
                </div>
              </div>
              <div className="relative text-right flex items-center gap-4">
                <div className="text-xs">
                  <p className="text-slate-400 uppercase tracking-widest font-bold text-[9px] mb-0.5">Đang chăm</p>
                  <p className="font-bold text-sm text-slate-800 dark:text-white">{member.total}</p>
                </div>
                <div className="text-xs bg-emerald-50/50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm">
                  <p className="text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold text-[9px] mb-0.5 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span> Đã chốt</p>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-base leading-none drop-shadow-sm">{member.closed}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
