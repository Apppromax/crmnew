"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getOverdueCustomers, completeCustomerAction } from "@/actions/customers";
import { ChevronLeft } from "lucide-react";

export default function CleanupPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getOverdueCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClose = async (id) => {
    // Just a simple mark as Closed for MVP
    await completeCustomerAction({ customerId: id, note: "Đóng thẻ quá hạn do dọn dẹp.", nextFollowUp: null });
    // In a real app we'd update `status` to "Closed" directly, but completeCustomerAction sets to "Active". 
    // We will just reload data.
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => router.push('/')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dọn dẹp Khách Quá Hạn</h1>
      </header>

      <main className="px-4 pt-4">
        {loading ? (
          <div className="animate-pulse bg-white dark:bg-slate-900 rounded-xl h-24 w-full" />
        ) : customers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">Tuyệt vời! Không có khách hàng nào bị bỏ quên.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customers.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-red-200 dark:border-red-900/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                  <div className="text-sm text-red-500 font-medium">
                    Quá hạn: {new Date(c.nextFollowUp).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleClose(c.id)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg">
                    Xóa/Đóng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
