"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllUsers, topUpUser } from "@/actions/admin";
import { ShieldAlert, ChevronLeft } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Top-up Modal state
  const [topupUserId, setTopupUserId] = useState(null);
  const [amount, setAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Bạn không có quyền truy cập trang này.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupUserId || !amount || isNaN(amount)) return;

    setIsToppingUp(true);
    try {
      await topUpUser(topupUserId, parseInt(amount), "Admin nạp Credits thủ công");
      setTopupUserId(null);
      setAmount("");
      await loadData(); // Reload to see new balances
    } catch (err) {
      alert("Lỗi khi nạp tiền: " + err.message);
    } finally {
      setIsToppingUp(false);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => router.push('/')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
      </header>

      <main className="px-4 pt-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Quản lý người dùng ({users.length})</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl h-24 w-full" />
            ))}
          </div>
        ) : (
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
                    <div className="text-xs text-slate-500 mt-1">{u._count.customers} khách hàng</div>
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
        )}
      </main>

      {/* Top-up Modal */}
      {topupUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Nạp Credits</h3>
            <form onSubmit={handleTopup}>
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
Bottom              </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
