"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam, joinTeam } from "@/actions/team";
import { Crown, KeyRound, Loader2, Zap, Users, BarChart3, ShieldCheck, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function NoTeamView() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [activeTab, setActiveTab] = useState("create"); // "create" or "join"

  const handleCreate = () => {
    if (!teamName.trim()) {
      setError("Vui lòng nhập tên Team");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await createTeam(teamName, 1);
        router.refresh();
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tạo team.");
      }
    });
  };

  const handleJoin = () => {
    if (!joinCode.trim()) {
      setError("Vui lòng nhập mã mời");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await joinTeam(joinCode.trim().toUpperCase());
        router.refresh();
      } catch (err) {
        setError(err.message || "Mã mời không hợp lệ.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      {/* Hero Section */}
      <div className="relative bg-slate-900 overflow-hidden px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-12 rounded-b-[2.5rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Bản giới hạn cho B2B
          </div>
          
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Bứt phá doanh số cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">Team Mode</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Làm việc đơn độc có thể đi nhanh, nhưng làm việc nhóm sẽ đi xa. Quản lý, phân bổ và theo dõi hàng ngàn leads cùng đội ngũ của bạn ngay hôm nay.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <Users className="w-6 h-6 text-primary-400 mb-2" />
              <h3 className="text-white font-bold text-sm mb-1">Quản lý Tập trung</h3>
              <p className="text-slate-400 text-[10px] leading-tight">Mọi khách hàng quy về một mối, dễ dàng phân bổ.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <BarChart3 className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="text-white font-bold text-sm mb-1">Báo cáo Realtime</h3>
              <p className="text-slate-400 text-[10px] leading-tight">Theo dõi tỷ lệ chốt sale của từng nhân sự tức thì.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="px-5 mt-[-20px] relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-2 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1 mb-4">
            <button 
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'create' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              Lập Team Mới
            </button>
            <button 
              onClick={() => setActiveTab("join")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'join' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              Tham Gia
            </button>
          </div>

          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {/* Form Content */}
          <div className="px-4 pb-4">
            {activeTab === "create" ? (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Bạn là Trưởng Phòng?</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hãy tạo Team để bắt đầu mời nhân sự vào nhóm.</p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-500">Phí duy trì: 299,000 CR / tháng</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-600/80 mt-1">Đã bao gồm 5 tài khoản thành viên. Trưởng phòng trả phí.</p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Tên Team của bạn</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Vd: Sói Già Bất Động Sản"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-3.5 font-bold focus:border-primary-500 focus:outline-none transition-colors text-slate-900 dark:text-white placeholder:font-normal"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={isPending || !teamName}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  Thanh toán & Tạo Team
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Tham gia cùng đội nhóm</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nhập mã mời do Leader gửi cho bạn để gia nhập hoàn toàn miễn phí.</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block text-center">Mã Mời (Invite Code)</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="VD: X7A9K2"
                    maxLength={6}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-4 font-black text-center text-2xl tracking-[0.25em] uppercase focus:border-primary-500 focus:outline-none transition-colors text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleJoin}
                  disabled={isPending || !joinCode}
                  className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-500/20"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Xác nhận tham gia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
