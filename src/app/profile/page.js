"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, upgradeToPro } from "@/actions/user";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cá nhân</h1>
        <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
          Đăng xuất
        </button>
      </header>

      <main className="px-4 pt-6 space-y-6">
        {loading ? (
          <div className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl h-40 w-full" />
        ) : profile ? (
          <>
            {/* User Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-lg text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold opacity-90">Tài khoản</h2>
                  <p className="font-bold text-xl truncate max-w-[200px]">{profile.email}</p>
                </div>
                {profile.isPro && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                    PRO
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm opacity-80 mb-1">Số dư hiện tại</p>
                  <p className="text-3xl font-black">{new Intl.NumberFormat('vi-VN').format(profile.balance)} <span className="text-base font-medium opacity-80">CR</span></p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Upgrade Section */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Gói SalesPush PRO 🚀</h3>
              
              {profile.isPro ? (
                <div>
                  <p className="text-slate-500 text-sm mb-4">Bạn đang sử dụng gói Pro. Khách hàng không giới hạn, dùng AI thả ga.</p>
                  <p className="text-sm font-semibold text-emerald-600 mb-4">Hạn dùng: {new Date(profile.proUntil).toLocaleDateString('vi-VN')}</p>
                  <button onClick={handleUpgrade} disabled={isUpgrading} className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-semibold rounded-xl transition-all">
                    {isUpgrading ? "Đang xử lý..." : "Gia hạn thêm 1 tháng (99K CR)"}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-500 text-sm mb-4">Mở khóa tính năng thêm khách hàng bằng AI, không giới hạn dung lượng lưu trữ với gói Pro.</p>
                  <button onClick={handleUpgrade} disabled={isUpgrading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all">
                    {isUpgrading ? "Đang xử lý..." : "Nâng cấp ngay (99,000 CR/tháng)"}
                  </button>
                </div>
              )}
            </div>

            {/* Admin Link */}
            {profile.role === 'admin' && (
              <button onClick={() => router.push('/admin')} className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Trang Quản trị Admin
              </button>
            )}
          </>
        ) : null}
      </main>

      <BottomNav activeTab="profile" onTabChange={(tab) => {
        if (tab === 'home') router.push('/');
        else if (tab === 'customers') router.push('/customers');
        else if (tab === 'schedule') router.push('/schedule');
        else if (tab === 'profile') router.push('/profile');
      }} />
    </div>
  );
}
