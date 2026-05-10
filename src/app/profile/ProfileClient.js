"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upgradeToPro, updateProfileInfo, updateDefaultSnoozeHours, requestTopUp } from "@/actions/user";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Settings, LogOut, Rocket, Users, Crown, Edit3, Moon, Sun, X, Palette, Timer, Bell, ListOrdered, ShieldCheck, Wallet, ArrowRight, Copy } from "lucide-react";

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
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Top Up State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [isRequestingTopUp, setIsRequestingTopUp] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Settings State (persisted in localStorage + DB)
  const [snoozeHours, setSnoozeHours] = useState(profile?.defaultSnoozeHours || 4);
  const [followUpDays, setFollowUpDays] = useState(3);
  const [queueSize, setQueueSize] = useState(10);
  const [confirmSnooze, setConfirmSnooze] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    const savedBg = localStorage.getItem("bgPattern") || "none";
    const savedFollowUp = localStorage.getItem("defaultFollowUpDays");
    const savedQueue = localStorage.getItem("queueSize");
    const savedConfirm = localStorage.getItem("confirmSnooze");

    setTheme(savedTheme);
    setBgPattern(savedBg);
    if (savedFollowUp) setFollowUpDays(Number(savedFollowUp));
    if (savedQueue) setQueueSize(Number(savedQueue));
    if (savedConfirm) setConfirmSnooze(savedConfirm === "true");
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
    
    // Clear old inline styles if any
    document.body.style.backgroundImage = "";
    document.body.style.backgroundSize = "";
    
    // Remove existing background classes
    document.body.classList.remove("bg-dots", "bg-grid", "bg-building-1", "bg-building-2", "bg-building-3");
    
    // Add new background class if not none
    if (newBg !== "none") {
      document.body.classList.add(`bg-${newBg}`);
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
      setProfile(p => ({ ...p, fullName: editName }));
      setIsEditing(false);
    } catch (err) {
      setError("Lỗi cập nhật thông tin.");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleRequestTopUp = async (e) => {
    e.preventDefault();
    if (!topUpAmount || isNaN(topUpAmount) || topUpAmount < 10000) {
      alert("Số tiền nạp tối thiểu là 10,000đ");
      return;
    }
    setIsRequestingTopUp(true);
    try {
      await requestTopUp(parseInt(topUpAmount), bankRef);
      setTopUpSuccess(true);
      setTimeout(() => {
        setShowTopUpModal(false);
        setTopUpSuccess(false);
        setTopUpAmount("");
        setBankRef("");
      }, 3000);
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsRequestingTopUp(false);
    }
  };

  const saveSettings = async () => {
    setSettingsSaved("");
    try {
      await updateDefaultSnoozeHours(Number(snoozeHours));
      localStorage.setItem("defaultFollowUpDays", String(followUpDays));
      localStorage.setItem("queueSize", String(queueSize));
      localStorage.setItem("confirmSnooze", String(confirmSnooze));
      setProfile(p => ({ ...p, defaultSnoozeHours: Number(snoozeHours) }));
      setSettingsSaved("✓ Đã lưu cài đặt");
      setTimeout(() => setSettingsSaved(""), 2500);
    } catch (err) {
      setSettingsSaved("Lỗi khi lưu!");
    }
  };

  const SNOOZE_PRESETS = [1, 2, 4, 8, 12, 24, 48];
  const QUEUE_PRESETS = [5, 10, 15, 20];
  const FOLLOWUP_PRESETS = [1, 3, 5, 7, 14];

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
                <button 
                  onClick={() => setShowTopUpModal(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <Wallet className="w-4 h-4" /> Nạp tiền
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            {/* ===== SETTINGS SECTION ===== */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-5 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-500" /> Cài đặt sử dụng
              </h3>
              
              <div className="space-y-6">
                {/* Snooze Time */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Thời gian Tạm gác mặc định</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Khi bạn gác 1 khách, mặc định sẽ gác bao lâu</p>
                  <div className="flex flex-wrap gap-2">
                    {SNOOZE_PRESETS.map(h => (
                      <button
                        key={h}
                        onClick={() => setSnoozeHours(h)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          snoozeHours === h
                            ? "bg-primary-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {h < 24 ? `${h}h` : `${h / 24}d`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Follow-up Days */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Follow-up mặc định</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Khi hoàn thành chăm sóc, mặc định hẹn lại sau bao nhiêu ngày</p>
                  <div className="flex flex-wrap gap-2">
                    {FOLLOWUP_PRESETS.map(d => (
                      <button
                        key={d}
                        onClick={() => setFollowUpDays(d)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          followUpDays === d
                            ? "bg-primary-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {d} ngày
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue Size */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ListOrdered className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Số khách trong Smart Queue</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Hiển thị bao nhiêu thẻ khách trên trang chính</p>
                  <div className="flex flex-wrap gap-2">
                    {QUEUE_PRESETS.map(s => (
                      <button
                        key={s}
                        onClick={() => setQueueSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          queueSize === s
                            ? "bg-primary-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {s} khách
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm Before Snooze */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Xác nhận trước khi gác</p>
                      <p className="text-xs text-slate-400">Hỏi lại khi bạn vuốt gác khách</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmSnooze(!confirmSnooze)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${confirmSnooze ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-700"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${confirmSnooze ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                {/* Save Button */}
                <button onClick={saveSettings} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
                  Lưu cài đặt
                </button>
                {settingsSaved && (
                  <p className={`text-center text-sm font-bold ${settingsSaved.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{settingsSaved}</p>
                )}
              </div>
            </div>

            {/* Theme UI Section */}
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
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-2">
                    <button onClick={() => changeBg('none')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'none' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Trơn
                    </button>
                    <button onClick={() => changeBg('dots')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'dots' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Dấu chấm
                    </button>
                    <button onClick={() => changeBg('grid')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'grid' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Lưới
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button onClick={() => changeBg('building-1')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'building-1' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Cao ốc
                    </button>
                    <button onClick={() => changeBg('building-2')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'building-2' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Biệt thự
                    </button>
                    <button onClick={() => changeBg('building-3')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${bgPattern === 'building-3' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Kiến trúc
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

      {/* Edit Profile Modal - Only Name */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sửa hồ sơ</h2>
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

      {/* Top Up Request Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-6 h-6 text-indigo-500" /> Nạp Credits
              </h2>
              <button onClick={() => setShowTopUpModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {topUpSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Đã gửi yêu cầu!</h3>
                <p className="text-slate-500 text-sm">Yêu cầu nạp tiền của bạn đã được gửi. Admin sẽ duyệt và cộng tiền vào tài khoản của bạn trong vòng vài phút.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3">Thông tin chuyển khoản:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Ngân hàng:</span>
                      <span className="text-sm font-bold dark:text-white">Vietcombank (VCB)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Chủ tài khoản:</span>
                      <span className="text-sm font-bold dark:text-white">NGUYEN VAN A</span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg mt-2">
                      <span className="text-xs text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-400">10123456789</span>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400" onClick={() => navigator.clipboard.writeText("10123456789")}>
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRequestTopUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Số tiền bạn đã chuyển</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        min="10000"
                        step="10000"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg text-slate-900 dark:text-white pr-12"
                        placeholder="Ví dụ: 100000"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">đ</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">1,000đ = 1,000 CR</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Mã tham chiếu / Nội dung CK</label>
                    <input 
                      type="text" 
                      required
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-sm"
                      placeholder="VD: Email của bạn hoặc mã giao dịch"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isRequestingTopUp}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                  >
                    {isRequestingTopUp ? "Đang gửi yêu cầu..." : (
                      <>
                        Xác nhận đã chuyển tiền <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  );
}
