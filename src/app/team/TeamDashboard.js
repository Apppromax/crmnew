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
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 md:pb-8">
      {/* HEADER BAR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-black p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                {role}
              </span>
              {team.isActive ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Active
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Expired
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">
              {team.name}
            </h1>
          </div>
          
          {isLeader && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-end shrink-0 shadow-inner">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" /> Mã Mời (Invite Code)
              </span>
              <span className="text-3xl font-black tracking-[0.25em] text-white drop-shadow-md">{team.inviteCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* MEMBER VIEW vs LEADER VIEW */}
      {!isLeader ? (
        <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-none text-center transform transition-all hover:scale-[1.01]">
          <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-primary-500 drop-shadow-sm" />
          </div>
          <h2 className="text-2xl font-black uppercase mb-3 text-slate-800 dark:text-slate-100">Bạn là Thành Viên</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
            Bạn đang hoạt động trong team <span className="font-bold text-slate-800 dark:text-white">"{team.name}"</span>. 
            Trưởng nhóm có thể phân bổ khách hàng cho bạn từ hệ thống.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* ANALYTICS SECTION */}
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                <PieChart className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Hiệu Suất Đội Nhóm</h2>
            </div>
            <TeamAnalytics stats={stats} members={members} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start animate-in slide-in-from-bottom-4 duration-500 delay-200">
            {/* MEMBERS LIST */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">Thành viên ({members.length}/{team.maxMembers})</h2>
                </div>
              </div>
          
              <div className="grid gap-4">
                {members.map((m) => (
                  <div key={m.id} className="group relative flex items-center justify-between p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-white shadow-md ${m.role === 'LEADER' ? 'bg-gradient-to-br from-primary-400 to-blue-600' : 'bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-700 dark:to-slate-800'}`}>
                        {m.role === 'LEADER' ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-base">{m.user.email}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                          Gia nhập: {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${m.role === 'LEADER' ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                        {m.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAD DISTRIBUTION */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Trung Tâm Điều Phối Lead</h2>
              </div>
              
              <LeadDistribution members={members} initialCustomers={customers} teamId={team.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
