import { getTeamMembers, getTeamCustomers, getTeamStats } from "@/actions/team";
import { ShieldAlert, ShieldCheck, User, Database, PieChart } from "lucide-react";
import LeadDistribution from "./LeadDistribution";
import TeamAnalytics from "./TeamAnalytics";

export default async function TeamDashboard({ context }) {
  const { team, role } = context;
  const isLeader = role === "LEADER";

  // Lấy danh sách thành viên, khách hàng và thống kê nếu là Leader
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
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-900 dark:border-white pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold uppercase tracking-widest">
              {role}
            </span>
            {team.isActive ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            ) : (
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Expired
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">{team.name}</h1>
        </div>
        
        {isLeader && (
          <div className="bg-slate-100 dark:bg-slate-900 p-3 flex flex-col items-end border border-slate-200 dark:border-slate-800 shrink-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Mã Mời (Invite Code)</span>
            <span className="text-2xl font-black tracking-[0.2em] text-primary-600 dark:text-primary-400">{team.inviteCode}</span>
          </div>
        )}
      </div>

      {/* MEMBER VIEW vs LEADER VIEW */}
      {!isLeader ? (
        <div className="p-8 border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-black uppercase mb-2">Bạn là Thành Viên</h2>
          <p className="text-slate-500 font-medium">
            Bạn đang hoạt động trong team "{team.name}". 
            Trưởng nhóm có thể phân bổ khách hàng cho bạn từ hệ thống.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* ANALYTICS SECTION */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-500 text-white flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Hiệu Suất Đội Nhóm</h2>
            </div>
            <TeamAnalytics stats={stats} members={members} />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* MEMBERS LIST */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase">Thành viên ({members.length}/{team.maxMembers})</h2>
              </div>
          
          <div className="grid gap-4">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center font-bold text-white ${m.role === 'LEADER' ? 'bg-primary-500' : 'bg-slate-400 dark:bg-slate-700'}`}>
                    {m.role === 'LEADER' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold">{m.user.email}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                      Gia nhập: {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 ${m.role === 'LEADER' ? 'text-primary-600 bg-primary-50' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                    {m.role}
                  </span>
                </div>
              </div>
            </div>

            {/* LEAD DISTRIBUTION (MỘT NỬA MÀN HÌNH NẾU ĐỦ RỘNG) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Trung Tâm Điều Phối Lead</h2>
              </div>
              
              <LeadDistribution members={members} initialCustomers={customers} teamId={team.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
