import { getTeamMembers, getTeamCustomers, getTeamStats } from "@/actions/team";
import { ShieldAlert, ShieldCheck, User, Database, PieChart, Users, Star } from "lucide-react";
import LeadDistribution from "./LeadDistribution";
import TeamAnalytics from "./TeamAnalytics";

export default async function TeamDashboard({ context }) {
  const { team, role } = context;
  const isLeader = role === "LEADER";

  let members = [];
  let customers = [];
  let stats = null;
  
  if (isLeader) {
    const [membersData, customersData, statsData] = await Promise.all([
      getTeamMembers(team.id),
      getTeamCustomers(team.id),
      getTeamStats(team.id)
    ]);
    members = membersData;
    customers = customersData;
    stats = statsData;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 md:pb-8">
      {/* HEADER BAR */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-black p-5 md:p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-500/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                {role}
              </span>
              {team.isActive ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Expired
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">
              {team.name}
            </h1>
          </div>
          
          {isLeader && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col items-start md:items-end shrink-0 shadow-inner">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" /> Mã Mời
              </span>
              <span className="text-2xl font-black tracking-[0.15em] text-white drop-shadow-md">{team.inviteCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* MEMBER VIEW vs LEADER VIEW */}
      {!isLeader ? (
        <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md shadow-sm text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-primary-500 drop-shadow-sm" />
          </div>
          <h2 className="text-xl font-black uppercase mb-2 text-slate-800 dark:text-slate-100">Bạn là Thành Viên</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-sm mx-auto">
            Bạn đang hoạt động trong team <span className="font-bold text-slate-800 dark:text-white">"{team.name}"</span>. 
            Trưởng nhóm có thể phân bổ khách hàng cho bạn từ hệ thống.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* ANALYTICS SECTION */}
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                <PieChart className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Hiệu Suất Đội Nhóm</h2>
            </div>
            <TeamAnalytics stats={stats} members={members} />
          </div>

          <div className="grid md:grid-cols-2 gap-5 items-start animate-in slide-in-from-bottom-4 duration-500 delay-200">
            {/* MEMBERS LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">Thành viên ({members.length}/{team.maxMembers})</h2>
                </div>
              </div>
          
              <div className="grid gap-3">
                {members.map((m) => (
                  <div key={m.id} className="group relative flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 overflow-hidden">
                    <div className="relative flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-white shadow-sm ${m.role === 'LEADER' ? 'bg-gradient-to-br from-primary-400 to-blue-600' : 'bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-700 dark:to-slate-800'}`}>
                        {m.role === 'LEADER' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{m.user.email.split('@')[0]}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                          {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${m.role === 'LEADER' ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                        {m.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAD DISTRIBUTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Điều Phối Lead</h2>
              </div>
              
              <LeadDistribution members={members} initialCustomers={customers} teamId={team.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
