"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUpcomingSchedule } from "@/actions/customers";
import BottomNav from "@/components/BottomNav";

export default function SchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getUpcomingSchedule();
      setSchedule(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group by Date
  const grouped = schedule.reduce((acc, c) => {
    const d = new Date(c.nextFollowUp);
    const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lịch hẹn sắp tới</h1>
      </header>

      <main className="px-4 pt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl h-24 w-full" />
            ))}
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">Chưa có lịch hẹn nào sắp tới.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateStr, customers]) => (
              <div key={dateStr}>
                <h2 className="text-sm font-semibold text-slate-500 mb-2 pl-1 capitalize">{dateStr}</h2>
                <div className="space-y-3">
                  {customers.map(c => {
                    const timeStr = new Date(c.nextFollowUp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-l-4 border-l-indigo-500 border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                          <div className="text-sm text-slate-500">{c.phone}</div>
                          {c.demand && <div className="text-xs text-slate-400 mt-1">{c.demand}</div>}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{timeStr}</span>
                          <div className="text-xs font-medium px-2 py-0.5 mt-1 rounded-md bg-slate-100 text-slate-600">
                            {c.heatLevel}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav activeTab="schedule" onTabChange={(tab) => {
        if (tab === 'home') router.push('/');
        else if (tab === 'customers') router.push('/customers');
        else if (tab === 'schedule') router.push('/schedule');
        else if (tab === 'cleanup') router.push('/cleanup');
      }} />
    </div>
  );
}
