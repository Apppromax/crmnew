"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upgradeToPro, updateProfileInfo, updateDefaultSnoozeHours } from "@/actions/user";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Settings, LogOut, Rocket, Users, Crown, Edit3, Moon, Sun, Image as ImageIcon, X, Palette } from "lucide-react";

export default function ProfileClient({ initialProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState(null);

  // Theme & BG State
  const [theme, setTheme] = useState("system");
  const [bgPattern, setBgPattern] = useState("none");

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.fullName || "");
  const [editSnoozeHours, setEditSnoozeHours] = useState(profile?.defaultSnoozeHours || 4);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  useEffect(() => {
    // Load preferences
    const savedTheme = localStorage.getItem("theme") || "system";
    const savedBg = localStorage.getItem("bgPattern") || "none";
    setTheme(savedTheme);
    setBgPattern(savedBg);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const changeBg = (newBg) => {
    setBgPattern(newBg);
    localStorage.setItem("bgPattern", newBg);
    // Áp dụng BG lên body (vì trong layout ko gài logic)
    if (newBg === "none") {
      document.body.style.backgroundImage = "none";
    } else if (newBg === "dots") {
      document.body.style.backgroundImage = "radial-gradient(circle, #cbd5e1 1px, transparent 1px)";
      document.body.style.backgroundSize = "20px 20px";
    } else if (newBg === "grid") {
      document.body.style.backgroundImage = "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)";
      document.body.style.backgroundSize = "20px 20px";
    }
  };

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

  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    try {
      await updateProfileInfo({ fullName: editName });
      await updateDefaultSnoozeHours(Number(editSnoozeHours));
      setProfile(p => ({ ...p, fullName: editName, defaultSnoozeHours: Number(editSnoozeHours) }));
      setIsEditing(false);
    } catch (err) {
      setError("Lỗi cập nhật thông tin.");
    } finally {
      setIsSavingInfo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/80 pb-24 md:pb-0 md:pl-64 font-sans relative transition-all duration-300">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cá nhân</h1>
        <button onClick={handleLogout} className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="px-4 pt-6 space-y-6 relative z-0 md:max-w-3xl md:mx-auto w-full">
        {profile ? (
          <>
            {/* User Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-3xl shadow-xl shadow-indigo-500/20 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-indigo-100 uppercase tracking-widest mb-1 flex items-center gap-2">
                    Hồ sơ 
                    <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  </h2>
                  <p className="font-bold text-2xl truncate">{profile.fullName || "Sales Master"}</p>
                  <p className="text-sm opacity-80 mt-0.5">{profile.email}</p>
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

            {/* Settings UI Section */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-500" /> Tùy chỉnh Giao diện
              </h3>
              
              <div className="space-y-4">
                {/* Theme Selector */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Chế độ sáng tối</p>
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button onClick={() => changeTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${theme === 'light' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700' : 'text-slate-500'}`}>
                      <Sun className="w-4 h-4" /> Sáng
                    </button>
                    <button onClick={() => changeTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>
                      <Moon className="w-4 h-4" /> Tối
                    </button>
                    <button onClick={() => changeTheme('system')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${theme === 'system' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>
                      Auto
                    </button>
                  </div>
                </div>

                {/* Pattern Selector */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Hình nền (Pattern)</p>
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button onClick={() => changeBg('none')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'none' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>
                      Trơn
                    </button>
                    <button onClick={() => changeBg('dots')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'dots' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>
                      Dấu chấm
                    </button>
                    <button onClick={() => changeBg('grid')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'grid' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>
                      Lưới
                    </button>
                  </div>
                </div>
              </div>
            </div>

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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sửa thông tin</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên hiển thị</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 dark:text-white"
                  placeholder="Nhập tên của bạn..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thời gian Tạm gác mặc định (Giờ)</label>
                <input 
                  type="number" 
                  min="1"
                  max="168"
                  value={editSnoozeHours}
                  onChange={(e) => setEditSnoozeHours(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 dark:text-white"
                  placeholder="Ví dụ: 4"
                />
              </div>

              <button 
                onClick={handleSaveInfo}
                disabled={isSavingInfo}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
              >
                {isSavingInfo ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  );
}
