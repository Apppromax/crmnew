"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upgradeToPro, updateProfileInfo, updateProfileSettings, requestTopUp, getUserTransactions, upgradeTeamPro } from "@/actions/user";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Settings, LogOut, Rocket, Users, Crown, Edit3, Moon, Sun, X, Palette, Timer, Bell, ListOrdered, ShieldCheck, Wallet, ArrowRight, Copy, ChevronDown, History, CheckCircle2, Clock } from "lucide-react";

export default function ProfileClient({ initialProfile, settings = {} }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState(null);

  // Theme & BG State
  const [theme, setTheme] = useState(profile?.theme || "system");
  const [bgPattern, setBgPattern] = useState(profile?.bgPattern || "none");

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.fullName || "");
  const [editPhone, setEditPhone] = useState(profile?.phone || "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Accordion State
  const [activeSection, setActiveSection] = useState(null);

  // Top Up State
  const [topUpAmount, setTopUpAmount] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [isRequestingTopUp, setIsRequestingTopUp] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Settings State (persisted in localStorage + DB)
  const [snoozeHours, setSnoozeHours] = useState(profile?.defaultSnoozeHours || 4);
  const [followUpDays, setFollowUpDays] = useState(profile?.defaultFollowUpDays || 3);
  const [queueSize, setQueueSize] = useState(profile?.queueSize || 10);
  const [confirmSnooze, setConfirmSnooze] = useState(profile?.confirmSnooze ?? false);
  const [settingsSaved, setSettingsSaved] = useState("");

  // Transaction Logs
  const [showTxLogs, setShowTxLogs] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Team Upgrade State
  const [teamSeats, setTeamSeats] = useState(profile?.ownedTeam?.maxMembers || 5);

  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const txs = await getUserTransactions();
      setTransactions(txs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    
    // Apply bg
    document.body.style.backgroundImage = "";
    document.body.style.backgroundSize = "";
    document.body.classList.remove("bg-dots", "bg-grid", "bg-building-1", "bg-building-2", "bg-building-3");
    if (bgPattern !== "none") {
      document.body.classList.add(`bg-${bgPattern}`);
    }
  }, [theme, bgPattern]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const changeBg = (newBg) => {
    setBgPattern(newBg);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleUpgrade = async () => {
    if (profile.ownedTeam) {
      if (!confirm(`Xác nhận đăng ký gói TEAM PRO 1 tháng cho ${teamSeats} nhân viên với giá ${new Intl.NumberFormat('vi-VN').format(teamSeats * 99000)} CR?`)) return;
      setIsUpgrading(true);
      setError(null);
      try {
        await upgradeTeamPro(1, teamSeats);
        alert("Nâng cấp Team thành công!");
        router.refresh();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsUpgrading(false);
      }
    } else {
      if (!confirm("Xác nhận đăng ký gói PRO 1 tháng với giá 99,000 CR?")) return;
      
      setIsUpgrading(true);
      setError(null);
      try {
        await upgradeToPro(1);
        alert("Nâng cấp thành công!");
        router.refresh(); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsUpgrading(false);
      }
    }
  };

  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    try {
      await updateProfileInfo({ fullName: editName, phone: editPhone });
      setProfile(p => ({ ...p, fullName: editName, phone: editPhone }));
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
      await updateProfileSettings({
        defaultSnoozeHours: Number(snoozeHours),
        defaultFollowUpDays: Number(followUpDays),
        queueSize: Number(queueSize),
        confirmSnooze: confirmSnooze,
        theme,
        bgPattern
      });
      setProfile(p => ({ 
        ...p, 
        defaultSnoozeHours: Number(snoozeHours),
        defaultFollowUpDays: Number(followUpDays),
        queueSize: Number(queueSize),
        confirmSnooze,
        theme,
        bgPattern
      }));
      setSettingsSaved("✓ Đã lưu cài đặt");
      setTimeout(() => setSettingsSaved(""), 2500);
    } catch (err) {
      setSettingsSaved("Lỗi khi lưu!");
    }
  };

  const SNOOZE_PRESETS = [1, 2, 4, 8, 12, 24, 48];
  const QUEUE_PRESETS = [5, 10, 15, 20];
  const FOLLOWUP_PRESETS = [1, 3, 5, 7, 14];

  const toggleSection = (id) => {
    setActiveSection(prev => prev === id ? null : id);
    if (id === 'topup' && activeSection !== 'topup') {
      setTimeout(() => {
        document.getElementById('topup-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const SectionItem = ({ id, icon: Icon, title, description, children, iconColor = "text-primary-500", iconBg = "bg-primary-50 dark:bg-primary-500/10" }) => {
    const isActive = activeSection === id;
    return (
      <div id={`${id}-container`} className={`overflow-hidden rounded-3xl transition-all duration-300 border ${isActive ? 'border-primary-500 shadow-md' : 'border-slate-100 dark:border-slate-800 shadow-sm'} bg-white dark:bg-slate-900 scroll-mt-24`}>
        <button 
          onClick={() => toggleSection(id)} 
          className="w-full flex items-center justify-between p-5 text-left active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isActive ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : `${iconBg} ${iconColor} dark:text-slate-300 dark:bg-slate-800`} transition-all`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-black ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white'} text-lg tracking-tight`}>{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{description}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
        </button>
        
        <div className={`transition-all duration-300 ease-in-out ${isActive ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-1">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const ActionItem = ({ icon: Icon, title, description, onClick, danger = false }) => (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center justify-between p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 active:scale-[0.98] transition-transform`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${danger ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-left">
          <h3 className={`font-black ${danger ? 'text-red-500' : 'text-slate-900 dark:text-white'} text-lg tracking-tight`}>{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{description}</p>
        </div>
      </div>
      <ArrowRight className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-slate-400'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-0 md:pl-64 font-sans relative transition-all duration-300">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white text-center">Cá nhân</h1>
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
                    {profile.ownedTeam ? "Trưởng phòng" : profile.teamMembership ? "Nhân viên Sale" : "Hồ sơ cá nhân"}
                    <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  </h2>
                  <p className="font-bold text-2xl truncate">{profile.fullName || "Chưa cập nhật tên"}</p>
                  <p className="text-sm opacity-80 mt-0.5">{profile.email}</p>
                  {(profile.ownedTeam || profile.teamMembership) && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-lg text-xs font-bold text-white">
                      <Users className="w-3.5 h-3.5" /> Thuộc Team: {profile.ownedTeam?.name || profile.teamMembership?.team?.name}
                    </div>
                  )}
                </div>
                {(profile.isPro || profile.ownedTeam?.isActive || profile.teamMembership?.team?.isActive) && (
                  <span className="flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-black px-3 py-1.5 rounded-full shadow-sm shrink-0">
                    <Crown className="w-3.5 h-3.5" /> PRO
                  </span>
                )}
              </div>
              
              <div className="relative z-10 flex justify-between items-end mt-4">
                <div onClick={() => { setShowTxLogs(true); fetchTransactions(); }} className="cursor-pointer group">
                  <p className="text-xs text-indigo-100 uppercase tracking-wider mb-1 flex items-center gap-1 group-hover:text-white transition-colors">Số dư hiện tại <History className="w-3 h-3" /></p>
                  <p className="text-4xl font-black tracking-tight">{new Intl.NumberFormat('vi-VN').format(profile.balance)} <span className="text-lg font-bold opacity-80">CR</span></p>
                </div>
                <button 
                  onClick={() => toggleSection('topup')}
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

            {(!profile.teamMembership || profile.role === 'admin') && (
              <SectionItem id="topup" icon={Wallet} title="Nạp Credits" description="Nạp tiền vào ví để dùng AI" iconColor="text-indigo-500" iconBg="bg-indigo-50">
              
              {topUpSuccess ? (
                <div className="text-center py-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-emerald-400 mb-1">Đã gửi yêu cầu!</h3>
                  <p className="text-slate-500 text-sm px-4">Yêu cầu nạp tiền của bạn đã được gửi. Admin sẽ duyệt và cộng tiền vào tài khoản của bạn trong vòng vài phút.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3">Thông tin chuyển khoản:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Ngân hàng:</span>
                        <span className="text-sm font-bold dark:text-white">{settings.bankName || "Vietcombank (VCB)"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Chủ tài khoản:</span>
                        <span className="text-sm font-bold dark:text-white">{settings.bankAccountName || "CONG TY TNHH SALESPUSH"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg mt-2">
                        <span className="text-xs text-slate-500">Số tài khoản:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{settings.bankAccountNumber || "999888777666"}</span>
                          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400" onClick={() => navigator.clipboard.writeText(settings.bankAccountNumber || "999888777666")}>
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
              </SectionItem>
            )}

            {/* ===== SETTINGS SECTION ===== */}
              <SectionItem id="settings" icon={Settings} title="Cài đặt CRM" description="Quy trình & thời gian chăm sóc" iconColor="text-blue-500" iconBg="bg-blue-50">
              
              <div className="space-y-6">
                {/* Snooze Time */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Thời gian Tạm hoãn mặc định</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Khi bạn tạm hoãn 1 khách, mặc định sẽ hoãn bao lâu</p>
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
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Xác nhận trước khi tạm hoãn</p>
                      <p className="text-xs text-slate-400">Hỏi lại khi bạn vuốt tạm hoãn khách</p>
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
              </SectionItem>

              {/* ===== THEME SECTION ===== */}
              <SectionItem id="theme" icon={Palette} title="Giao diện" description="Màu sắc & Chế độ Sáng/Tối" iconColor="text-fuchsia-500" iconBg="bg-fuchsia-50">
              
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
                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Hình nền minh họa (Góc phải)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button onClick={() => changeBg('none')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${bgPattern === 'none' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Tắt hình
                    </button>
                    <button onClick={() => changeBg('building-1')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${bgPattern === 'building-1' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Thành phố
                    </button>
                    <button onClick={() => changeBg('building-2')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${bgPattern === 'building-2' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Biệt thự
                    </button>
                    <button onClick={() => changeBg('building-3')} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${bgPattern === 'building-3' ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                      Kiến trúc
                    </button>
                  </div>
                </div>
              </div>
              </SectionItem>

              {/* ===== PRO UPGRADE SECTION ===== */}
              {(!profile.teamMembership || profile.role === 'admin') && (
                <SectionItem id="pro" icon={Rocket} title={profile.ownedTeam ? "Gói TEAM PRO" : "Gói Cá Nhân PRO"} description={profile.ownedTeam ? "Mở khóa AI cho toàn đội nhóm" : "Mở khóa AI cho cá nhân"} iconColor="text-amber-500" iconBg="bg-amber-50">
                
                {profile.ownedTeam ? (
                  <div className="relative z-10">
                    {profile.ownedTeam.isActive ? (
                      <>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Team đang sử dụng gói Pro cho {profile.ownedTeam.maxMembers} nhân sự.</p>
                        <div className="inline-block px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold mb-4">
                          Hạn dùng: {new Date(profile.ownedTeam.validUntil).toLocaleDateString('vi-VN')}
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">Đăng ký gói PRO để cấp quyền dùng AI cho tất cả nhân viên trong Team.</p>
                    )}
                    
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số lượng nhân sự (Seats)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="50" 
                        value={teamSeats}
                        onChange={(e) => setTeamSeats(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                      />
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Thành tiền: {new Intl.NumberFormat('vi-VN').format(teamSeats * 99000)} CR / tháng</p>
                    </div>

                    <button onClick={handleUpgrade} disabled={isUpgrading} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all active:scale-95">
                      {isUpgrading ? "Đang xử lý..." : profile.ownedTeam.isActive ? "Gia hạn thêm 1 tháng" : "Nâng cấp Team ngay"}
                    </button>
                  </div>
                ) : profile.isPro ? (
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
                </SectionItem>
              )}

              {/* ===== MENU ACTIONS ===== */}

              <div className="space-y-4">
                {profile.ownedTeam && (
                  <ActionItem 
                    icon={Users} 
                    title="Quản lý Đội nhóm" 
                    description="Quản lý nhân viên, chiến dịch" 
                    onClick={() => router.push('/team')} 
                  />
                )}
                {profile.role === 'admin' && (
                  <ActionItem 
                    icon={ShieldCheck} 
                    title="Trang Quản trị Admin" 
                    description="Duyệt tiền và hệ thống" 
                    onClick={() => router.push('/admin')} 
                  />
                )}

              <ActionItem 
                icon={LogOut} 
                title="Đăng xuất" 
                description="Thoát khỏi tài khoản hiện tại" 
                onClick={handleLogout} 
                danger={true}
              />
            </div>
          </>
        ) : null}
      </main>

      {/* Transaction Logs Modal */}
      {showTxLogs && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowTxLogs(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lịch sử giao dịch</h2>
              <button onClick={() => setShowTxLogs(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-3">
              {loadingTx ? (
                <div className="text-center py-10 text-slate-500">Đang tải...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">Chưa có giao dịch nào</div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${tx.type === 'TOPUP' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {tx.type === 'TOPUP' ? <Wallet className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{tx.note || tx.type}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>{tx.status}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-black text-sm ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-700 dark:text-white'}`}>
                      {tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(tx.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
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
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số điện thoại</label>
                <input 
                  type="text" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 dark:text-white"
                  placeholder="0901234567"
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
