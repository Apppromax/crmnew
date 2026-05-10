"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upgradeToPro } from "@/actions/user";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Settings, LogOut, Rocket, Users, Crown } from "lucide-react";

export default function ProfileClient({ initialProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleUpgrade = async () => {
    if (!confirm("Xác nhận đăng ký gói PRO 1 tháng với giá 99,000 CR?")) return;
    
    setIsUpgrading(true);
    setError(null);
    try {
      await upgradeToPro(1);
      alert("Nâng cấp thành công! Chúc bạn chốt sale hiệu quả.");
      router.refresh(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cá nhân</h1>
        <button onClick={handleLogout} className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="px-4 pt-6 space-y-6">
        {profile ? (
          <>
            {/* User Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-3xl shadow-xl shadow-indigo-500/20 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-sm font-semibold text-indigo-100 uppercase tracking-widest mb-1">Tài khoản</h2>
                  <p className="font-bold text-lg truncate max-w-[200px]">{profile.email}</p>
                </div>
                {profile.isPro && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                    <Crown className="w-3.5 h-3.5" /> PRO
                  </span>
                )}
              </div>
              
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-xs text-indigo-100 uppercase tracking-wider mb-1">Số dư hiện tại</p>
                  <p className="text-4xl font-black tracking-tight">{new Intl.NumberFormat('vi-VN').format(profile.balance)} <span className="text-lg font-bold opacity-80">CR</span></p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            {/* Upgrade Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Rocket className="w-24 h-24" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-2 relative z-10">Gói SalesPush PRO</h3>
              
              {profile.isPro ? (
                <div className="relative z-10">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Bạn đang sử dụng gói Pro. Khách hàng không giới hạn, dùng AI thả ga.</p>
                  <div className="inline-block px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold mb-4">
                    Hạn dùng: {new Date(profile.proUntil).toLocaleDateString('vi-VN')}
                  </div>
                  <button onClick={handleUpgrade} disabled={isUpgrading} className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl transition-all active:scale-95">
                    {isUpgrading ? "Đang xử lý..." : "Gia hạn thêm 1 tháng (99K CR)"}
                  </button>
                </div>
              ) : (
                <div className="relative z-10">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">Mở khóa tính năng thêm khách hàng bằng AI, không giới hạn lưu trữ.</p>
                  <button onClick={handleUpgrade} disabled={isUpgrading} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all active:scale-95">
                    {isUpgrading ? "Đang xử lý..." : "Nâng cấp ngay (99K CR/tháng)"}
                  </button>
                </div>
              )}
            </div>

            {/* Team Module Link */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Users className="w-24 h-24" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-2 relative z-10">Đội Nhóm (B2B)</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 relative z-10">Làm việc nhóm, quản lý và phân bổ khách hàng với tính năng Team Mode.</p>
              <button onClick={() => router.push('/team')} className="relative z-10 w-full py-4 border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 text-slate-900 dark:text-white font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
                Truy cập Không Gian Team
              </button>
            </div>

            {/* Admin Link */}
            {profile.role === 'admin' && (
              <button onClick={() => router.push('/admin')} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl flex justify-center items-center gap-2 transition-transform active:scale-95">
                <Settings className="w-5 h-5" />
                Trang Quản trị Admin
              </button>
            )}
          </>
        ) : null}
      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
}
