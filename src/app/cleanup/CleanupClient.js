"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getOverdueCustomers, completeCustomerAction } from "@/actions/customers";
import { ChevronLeft, Phone, Trash2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function CleanupClient({ initialCustomers }) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers || []);

  const loadData = useCallback(async () => {
    try {
      const data = await getOverdueCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleClose = async (id) => {
    await completeCustomerAction({ customerId: id, note: "Đóng thẻ quá hạn do dọn dẹp.", nextFollowUp: null });
    await loadData();
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-0 md:pl-64 transition-all duration-300">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => router.push('/')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dọn dẹp Khách Quá Hạn</h1>
      </header>

      <main className="px-4 pt-4">
        {customers.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Sạch sẽ!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Tuyệt vời! Không có khách hàng nào bị bỏ quên.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-red-500 flex items-center gap-2 px-1 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {customers.length} khách quá hạn
            </p>
            {customers.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-red-200 dark:border-red-900/30 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                  <div className="text-sm text-slate-500">{c.phone}</div>
                  <div className="text-xs text-red-500 font-medium mt-1">
                    Quá hạn: {new Date(c.nextFollowUp).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${c.phone}`} className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg">
                    <Phone className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleClose(c.id)} className="p-2.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/10 text-slate-600 hover:text-red-600 dark:text-slate-400 rounded-lg transition-colors" title="Đóng thẻ">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav activeTab="home" />
    </div>
  );
}
