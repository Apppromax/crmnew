"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllCustomers } from "@/actions/customers";
import BottomNav from "@/components/BottomNav";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getAllCustomers();
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

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.demand && c.demand.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kho khách hàng</h1>
          <div className="text-sm font-medium text-slate-500">{customers.length} người</div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors text-slate-900 dark:text-slate-100"
            placeholder="Tìm theo tên, SĐT, nhu cầu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Main List */}
      <main className="px-4 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl h-20 w-full" />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy khách hàng nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {c.name}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.heatLevel === 'Hot' ? 'bg-red-100 text-red-700' :
                      c.heatLevel === 'Warm' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {c.heatLevel}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{c.phone}</p>
                  {c.demand && <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{c.demand}</p>}
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                    c.status === 'New' ? 'bg-indigo-50 text-indigo-700' :
                    c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                    c.status === 'Waiting' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB (Add) */}
      <div className="fixed bottom-20 right-5 z-30">
        <button 
          onClick={() => router.push("/add")}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <BottomNav activeTab="customers" onTabChange={(tab) => {
        if (tab === 'home') router.push('/');
        if (tab === 'customers') router.push('/customers');
      }} />
    </div>
  );
}
