"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam, joinTeam } from "@/actions/team";
import { Crown, KeyRound, Loader2, Zap } from "lucide-react";

export default function NoTeamView() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");

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
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
          Tổ Đội Chốt Sales
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Làm việc đơn độc hay lãnh đạo một đội nhóm mạnh mẽ? Tùy bạn chọn.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold border-l-4 border-red-500">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* CREATE TEAM */}
        <div className="border-2 border-slate-900 dark:border-slate-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] bg-white dark:bg-slate-900 flex flex-col h-full">
          <div className="flex-1">
            <div className="w-12 h-12 bg-primary-500 text-white flex items-center justify-center mb-6 border-2 border-slate-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Crown className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black mb-2 uppercase">Lập Team Mới</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm font-medium">
              Trở thành Leader. Mời thành viên, chia khách hàng, quản lý pipeline chung.
              <br/><br/>
              <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs uppercase tracking-wider">
                Phí: 299,000 CR / Tháng
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Tên Team của bạn</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Vd: Sói Già Bất Động Sản"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 font-bold focus:border-primary-500 focus:outline-none transition-colors rounded-none"
                />
              </div>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t-2 border-slate-100 dark:border-slate-800">
            <button
              onClick={handleCreate}
              disabled={isPending}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-wider py-4 hover:bg-primary-600 dark:hover:bg-primary-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              Mở Team Ngay
            </button>
          </div>
        </div>

        {/* JOIN TEAM */}
        <div className="border-2 border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col h-full">
          <div className="flex-1">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-6">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black mb-2 uppercase text-slate-700 dark:text-slate-300">Tham Gia Team</h2>
            <p className="text-slate-500 mb-6 text-sm font-medium">
              Bạn có mã mời từ Leader? Nhập vào đây để gia nhập team miễn phí.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Mã Mời (Invite Code)</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="VD: X7A9K2"
                  maxLength={6}
                  className="w-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 p-3 font-black text-center text-xl tracking-[0.2em] uppercase focus:border-primary-500 focus:outline-none transition-colors rounded-none"
                />
              </div>
            </div>
          </div>
          <div className="pt-6 mt-6">
            <button
              onClick={handleJoin}
              disabled={isPending || !joinCode}
              className="w-full bg-transparent border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-black uppercase tracking-wider py-4 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Xác Nhận Tham Gia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
