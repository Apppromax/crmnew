"use client";

import React, { useState, useEffect } from "react";
import SmartCard from "@/components/SmartCard";
import StatusModal from "@/components/StatusModal";
import { supabase } from "@/lib/supabaseClient";

// Mock data as fallback
const mockCustomers = [
  { id: 1, name: "Nguyễn Văn A", phone: "0901234567", status: "New", qualification_level: "Hot", next_follow_up: new Date(Date.now() + 86400000).toISOString() },
  { id: 2, name: "Trần Thị B", phone: "0987654321", status: "Active", qualification_level: "Warm", next_follow_up: new Date(Date.now() + 172800000).toISOString() },
  { id: 3, name: "Lê Văn C", phone: "0912345678", status: "Waiting", qualification_level: "Cold", next_follow_up: new Date(Date.now() + 259200000).toISOString() },
];

export default function Home() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('qualification_level', { ascending: false })
          .limit(10);
        
        if (error) {
          console.warn("Supabase fetch failed, using mock data:", error.message);
          setCustomers(mockCustomers);
        } else if (data && data.length > 0) {
          setCustomers(data);
        } else {
          setCustomers(mockCustomers);
        }
      } catch (err) {
        console.warn("Fetch error, using mock data", err);
        setCustomers(mockCustomers);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const handleCardClick = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    // Optimistic UI update
    setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating status in Supabase:", error);
        // Optionally revert UI here
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 pt-safe-top">
        <div className="px-5 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SalesPush</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Focus on what matters</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-6 max-w-lg mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Top ưu tiên hôm nay</h2>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{customers.length} khách</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse glass rounded-2xl h-28 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map(customer => (
              <SmartCard 
                key={customer.id} 
                customer={customer} 
                onClick={handleCardClick} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe-bottom z-30">
        <div className="flex justify-around items-center px-2 py-3">
          <button className="flex flex-col items-center gap-1 p-2 text-blue-600 dark:text-blue-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-[10px] font-semibold">Bảng điều khiển</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span className="text-[10px] font-semibold">Khách hàng</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span className="text-[10px] font-semibold">Cài đặt</span>
          </button>
        </div>
      </nav>

      <StatusModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        customer={selectedCustomer}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
