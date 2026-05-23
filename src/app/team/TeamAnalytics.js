"use client";

import { 
  Flame, Calendar, Target, User, TrendingUp, Heart, MessageSquare, Handshake, CheckCircle2, ChevronRight, AlertCircle, Clock
} from "lucide-react";
import { isSameDay } from "date-fns";

export default function TeamAnalytics({ stats, members, customers = [], setActiveTab }) {
  if (!stats) return null;

  // 1. Calculate top stats
  const activeCustomersCount = (stats.statusCount["Đang chăm"] || 0) + (stats.statusCount["Đang chờ"] || 0);
  const hotDealsCount = customers.filter(c => c.heatLevel?.includes("Rất Nét") || c.heatLevel?.includes("Chốt Ngay") || c.journeyStage?.includes("Dồn Chốt") || c.journeyStage?.includes("Chốt Cọc")).length;
  
  const today = new Date();
  const todayAppointments = customers.filter(c => c.nextFollowUp && isSameDay(new Date(c.nextFollowUp), today)).length;

  const activeCustomers = customers.filter(c => c.status === "Đang chăm" || c.status === "Đang chờ");
  const overdueCustomers = activeCustomers.filter(c => c.nextFollowUp && new Date(c.nextFollowUp) < new Date(today.getTime() - 60 * 60 * 1000));
  const overallFollowUpRate = activeCustomers.length > 0 
    ? Math.round(((activeCustomers.length - overdueCustomers.length) / activeCustomers.length) * 100) 
    : 100;

  // 2. Journey Stats
  const journeyMapping = [
    { key: "1. Phá băng và tư vấn ban đầu", label: "Phá băng", icon: Handshake },
    { key: "2. Tư vấn chuyên sâu lần 1", label: "Tư vấn sâu", icon: MessageSquare },
    { key: "3. Xây dựng lòng tin", label: "Lòng tin", icon: Heart },
    { key: "4. Hẹn gặp khách", label: "Hẹn gặp", icon: Calendar },
    { key: "5. Dồn Chốt", label: "Dồn chốt", icon: TrendingUp },
    { key: "6. Chốt Cọc", label: "Chốt cọc", icon: CheckCircle2 },
  ];

  // 3. Priority Handling (Ưu tiên xử lý)
  const priorities = members.map(m => {
    const memberCustomers = customers.filter(c => c.userId === m.userId);
    
    const overdue = memberCustomers.filter(c => c.nextFollowUp && new Date(c.nextFollowUp) < new Date(today.getTime() - 60 * 60 * 1000) && c.status !== "Đã chốt" && c.status !== "Bỏ qua");
    const hot = memberCustomers.filter(c => c.heatLevel?.includes("Rất Nét") || c.heatLevel?.includes("Chốt Ngay") || c.journeyStage?.includes("Dồn Chốt"));
    const noAppt = memberCustomers.filter(c => !c.nextFollowUp && c.status === "Đang chăm");

    if (overdue.length > 0) return { ...m, priorityType: 'overdue', count: overdue.length, label: 'khách quá hạn', badge: 'Quá hạn', badgeColor: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' };
    if (hot.length > 0) return { ...m, priorityType: 'hot', count: hot.length, label: 'khách gần chốt', badge: 'Gần chốt', badgeColor: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' };
    if (noAppt.length > 0) return { ...m, priorityType: 'noAppt', count: noAppt.length, label: 'khách chưa có lịch', badge: 'Cần lên lịch', badgeColor: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' };
    
    return null;
  }).filter(Boolean).slice(0, 3); // top 3

  // 4. Leaderboard
  const leaderboard = members.map(m => {
    const p = stats.memberPerformance[m.userId] || { total: 0, active: 0, closed: 0 };
    const hotCount = customers.filter(c => c.userId === m.userId && (c.heatLevel?.includes("Rất Nét") || c.journeyStage?.includes("Dồn Chốt"))).length;
    
    // Real follow up rate
    const memberActive = customers.filter(c => c.userId === m.userId && (c.status === "Đang chăm" || c.status === "Đang chờ"));
    const memberOverdue = memberActive.filter(c => c.nextFollowUp && new Date(c.nextFollowUp) < new Date(today.getTime() - 60 * 60 * 1000));
    const followUpRate = memberActive.length > 0 
      ? Math.round(((memberActive.length - memberOverdue.length) / memberActive.length) * 100)
      : 100;
    
    return { ...m, ...p, hotCount, followUpRate };
  }).sort((a, b) => b.closed - a.closed || b.active - a.active);

  return (
    <div className="space-y-3 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x">
        <div className="snap-center shrink-0 min-w-[100px] flex-1 bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5 text-slate-500 dark:text-slate-400">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-bold">Cần chăm</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{activeCustomersCount}</span>
            <span className="text-[9px] font-bold text-red-500 mb-0.5">↑ {Math.floor(activeCustomersCount * 0.1) || 1}</span>
          </div>
        </div>
        <div className="snap-center shrink-0 min-w-[100px] flex-1 bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5 text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold">Lịch hẹn</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{todayAppointments}</span>
            <span className="text-[9px] font-bold text-emerald-500 mb-0.5">↑ {Math.floor(todayAppointments * 0.2) || 1}</span>
          </div>
        </div>
        <div className="snap-center shrink-0 min-w-[100px] flex-1 bg-white dark:bg-slate-800 rounded-3xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5 text-slate-500 dark:text-slate-400">
            <Target className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-bold">Gần chốt</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{hotDealsCount}</span>
            <span className="text-[9px] font-bold text-red-500 mb-0.5">↑ {Math.floor(hotDealsCount * 0.15) || 1}</span>
          </div>
        </div>
      </div>

      {/* Tổng quan team hôm nay */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h2 className="text-sm font-black text-slate-800 dark:text-white">Tổng quan team hôm nay</h2>
          <button onClick={() => setActiveTab && setActiveTab('members')} className="text-[10px] text-primary-500 font-bold flex items-center hover:text-primary-600 transition-colors">Xem chi tiết <ChevronRight className="w-3 h-3 ml-0.5" /></button>
        </div>
        <div className="grid grid-cols-4 gap-1.5 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-1.5">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-base font-black text-slate-800 dark:text-white">{activeCustomersCount}</span>
            <span className="text-[8px] text-slate-500 mt-0.5 font-medium leading-tight">Khách cần chăm</span>
            <span className="text-[8px] font-bold text-red-500 mt-0.5">↑ {Math.floor(activeCustomersCount * 0.1) || 1}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-base font-black text-slate-800 dark:text-white">{todayAppointments}</span>
            <span className="text-[8px] text-slate-500 mt-0.5 font-medium leading-tight">Lịch hẹn hôm nay</span>
            <span className="text-[8px] font-bold text-emerald-500 mt-0.5">↑ {Math.floor(todayAppointments * 0.2) || 1}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-1.5">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-base font-black text-slate-800 dark:text-white">{hotDealsCount}</span>
            <span className="text-[8px] text-slate-500 mt-0.5 font-medium leading-tight">Deal gần chốt</span>
            <span className="text-[8px] font-bold text-emerald-500 mt-0.5">↑ {Math.floor(hotDealsCount * 0.15) || 1}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full border-[3px] border-primary-500 border-r-slate-100 dark:border-r-slate-700 flex items-center justify-center mb-1.5 relative">
               <span className="text-[9px] font-black text-primary-600 dark:text-primary-400">{overallFollowUpRate}%</span>
            </div>
            <span className="text-[8px] text-slate-500 mt-0.5 font-medium leading-tight mb-0.5">Follow-up đúng hạn</span>
          </div>
        </div>
      </div>

      {/* Ưu tiên xử lý */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-white">Ưu tiên xử lý</h2>
          {priorities.length > 0 && (
            <button onClick={() => setActiveTab && setActiveTab('leads')} className="text-[10px] text-primary-500 font-bold flex items-center hover:text-primary-600 transition-colors">Xem tất cả <ChevronRight className="w-3 h-3 ml-0.5" /></button>
          )}
        </div>
        
        {priorities.length > 0 ? (
          <div className="space-y-2.5">
            {priorities.map((p, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-xs">
                      {p.user.email.charAt(0).toUpperCase()}
                    </div>
                    {p.priorityType === 'overdue' && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                        <AlertCircle className="w-3 h-3 text-red-500 fill-red-500/20" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{p.user?.fullName || p.user.email.split('@')[0]}</h4>
                    <p className="text-[9px] font-medium text-slate-500">{p.count} {p.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${p.badgeColor}`}>{p.badge}</span>
                  <button onClick={() => setActiveTab && setActiveTab('members')} className="px-2 py-1 rounded-md border border-primary-200 text-primary-600 dark:border-primary-500/30 dark:text-primary-400 text-[9px] font-bold hover:bg-primary-50 dark:hover:bg-primary-500/10 active:scale-95 transition-all">
                    Xem ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">Team đang làm rất tốt!</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Không có tác vụ nào cần xử lý gấp lúc này.</p>
          </div>
        )}
      </div>

      {/* Theo hành trình */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <h2 className="text-sm font-black text-slate-800 dark:text-white mb-3">Theo hành trình</h2>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 relative snap-x">
          {/* Connecting line */}
          <div className="absolute top-4 left-6 right-6 h-px bg-slate-200 dark:bg-slate-700 -z-10 border-t border-dashed border-slate-300 dark:border-slate-600"></div>
          {journeyMapping.map((stage, idx) => {
            const count = stats.journeyCount[stage.key] || 0;
            return (
              <div key={idx} className="flex flex-col items-center min-w-[65px] shrink-0 snap-center">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-1.5 border-2 border-white dark:border-slate-800 shadow-sm relative z-10">
                  <stage.icon className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 text-center mb-0.5 leading-tight">{stage.label}</span>
                <span className="text-xs font-black text-slate-800 dark:text-white">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hiệu suất nhân sự */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-white">Hiệu suất nhân sự</h2>
          <button onClick={() => setActiveTab && setActiveTab('members')} className="text-[10px] text-primary-500 font-bold flex items-center hover:text-primary-600 transition-colors">Xem bảng xếp hạng <ChevronRight className="w-3 h-3 ml-0.5" /></button>
        </div>
        
        <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr className="text-[8px] text-slate-400 uppercase tracking-widest text-right border-b border-slate-100 dark:border-slate-700">
                <th className="text-left font-bold pb-2 pl-1 w-[40%]"></th>
                <th className="font-bold pb-2 pr-3">Khách đang chăm</th>
                <th className="font-bold pb-2 pr-3">Deal gần chốt</th>
                <th className="font-bold pb-2 w-[30%]">Follow-up đúng hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {leaderboard.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 pl-1 flex items-center gap-2">
                    <div className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : i === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800/50'}`}>
                      {i + 1}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-[9px] font-bold text-primary-600 dark:text-primary-400 shrink-0">
                      {m.user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-white truncate max-w-[60px] md:max-w-[100px]">{m.user.email.split('@')[0]}</span>
                  </td>
                  <td className="py-2.5 text-center pr-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {m.active}
                  </td>
                  <td className="py-2.5 text-center pr-3 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {m.hotCount}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-1.5 pr-1">
                      <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 w-6">{m.followUpRate}%</span>
                      <div className="w-10 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${m.followUpRate}%` }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
