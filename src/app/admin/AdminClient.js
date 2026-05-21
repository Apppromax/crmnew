"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllUsers, topUpUser, getPendingTopUps, approveTopUp, rejectTopUp, updateSystemSetting, getSystemSettings } from "@/actions/admin";
import { ShieldAlert, ChevronLeft, Users, Banknote, CheckCircle, XCircle, Settings } from "lucide-react";

export default function AdminClient({ initialUsers, initialTopUps, initialSettings, initialError }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers || []);
  const [pendingTopUps, setPendingTopUps] = useState(initialTopUps || []);
  const [settings, setSettings] = useState(initialSettings || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || null);
  const [activeTab, setActiveTab] = useState("users");

  // Settings state
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Top-up Modal state
  const [topupUserId, setTopupUserId] = useState(null);
  const [amount, setAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, topUpsData, settingsData] = await Promise.all([
        getAllUsers(),
        getPendingTopUps(),
        getSystemSettings()
      ]);
      setUsers(usersData);
      setPendingTopUps(topUpsData);
      setSettings(settingsData);
      setError(null);
    } catch (err) {
      setError(err.message || "Bạn không có quyền truy cập trang này.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleManualTopup = async (e) => {
    e.preventDefault();
    if (!topupUserId || !amount || isNaN(amount)) return;

    setIsToppingUp(true);
    try {
      await topUpUser(topupUserId, parseInt(amount), "Admin nạp Credits thủ công");
      setTopupUserId(null);
      setAmount("");
      await loadData();
    } catch (err) {
      alert("Lỗi khi nạp tiền: " + err.message);
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm("Xác nhận duyệt khoản nạp tiền này?")) return;
    try {
      await approveTopUp(id);
      await loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Lý do từ chối (có thể để trống):");
    if (reason === null) return;
    try {
      await rejectTopUp(id, reason);
      await loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const formData = new FormData(e.target);
      const updates = [];
      for (const [key, value] of formData.entries()) {
        updates.push(updateSystemSetting(key, value));
      }
      await Promise.all(updates);
      await loadData();
      alert("Đã lưu cấu hình thành công!");
    } catch (err) {
      alert("Lỗi khi lưu cấu hình: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-red-500 mb-4 flex justify-center">
            <ShieldAlert className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Truy cập bị từ chối</h1>
          <p className="text-slate-500">{error}</p>
          <button onClick={() => router.push("/")} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => router.push('/profile')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
      </header>

      {/* TABS */}
      <div className="px-4 mt-4">
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "users" ? "bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Users className="w-4 h-4" /> Users
          </button>
          <button
            onClick={() => setActiveTab("topups")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "topups" ? "bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Banknote className="w-4 h-4" /> Nạp tiền ({pendingTopUps.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "settings" ? "bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Settings className="w-4 h-4" /> Cài đặt
          </button>
        </div>
      </div>

      <main className="px-4 pt-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl h-24 w-full" />
            ))}
          </div>
        ) : activeTab === "users" ? (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{u.email}</div>
                    <div className="text-xs text-slate-500 flex gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${u.isPro ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.isPro ? "PRO" : "FREE"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {new Intl.NumberFormat('vi-VN').format(u.balance)} <span className="text-xs text-slate-400 font-normal">CR</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{u._count?.customers || 0} khách hàng</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setTopupUserId(u.id)}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg transition-colors"
                  >
                    Nạp Credits
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "topups" ? (
          <div className="space-y-3">
            {pendingTopUps.length === 0 ? (
              <div className="text-center p-8 text-slate-500">
                Không có yêu cầu nạp tiền nào chờ duyệt.
              </div>
            ) : (
              pendingTopUps.map(t => (
                <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm text-slate-500">{t.profile?.email || 'Unknown User'}</div>
                      <div className="font-bold text-slate-800 dark:text-white">{t.profile?.fullName || 'No Name'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        +{new Intl.NumberFormat('vi-VN').format(t.amount)} <span className="text-xs text-slate-400 font-normal">CR</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(t.createdAt).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="font-semibold">Ghi chú:</span> {t.note}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReject(t.id)} className="flex-1 py-2 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100">
                      <XCircle className="w-4 h-4" /> Từ chối
                    </button>
                    <button onClick={() => handleApprove(t.id)} className="flex-1 py-2 flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                      <CheckCircle className="w-4 h-4" /> Duyệt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "settings" ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cấu hình Thanh toán</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Ngân hàng</label>
                <input
                  type="text"
                  name="bankName"
                  defaultValue={settings.bankName || ""}
                  placeholder="VD: Vietcombank (VCB)"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-transparent dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Chủ tài khoản</label>
                <input
                  type="text"
                  name="bankAccountName"
                  defaultValue={settings.bankAccountName || ""}
                  placeholder="VD: CONG TY TNHH SALESPUSH"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-transparent dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Số tài khoản</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  defaultValue={settings.bankAccountNumber || ""}
                  placeholder="VD: 999888777666"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-transparent dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors"
              >
                {isSavingSettings ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>
        ) : null}
      </main>

      {/* Top-up Modal */}
      {topupUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Nạp Credits Thủ Công</h3>
            <form onSubmit={handleManualTopup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Số lượng (1 CR = 1 VNĐ)
                </label>
                <input
                  type="number"
                  required
                  min="10000"
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-transparent dark:text-white"
                  placeholder="VD: 500000"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setTopupUserId(null)}
                  disabled={isToppingUp}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isToppingUp}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  {isToppingUp ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
