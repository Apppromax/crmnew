"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUpcomingSchedule, getOverdueCustomers } from "@/actions/customers";
import BottomNav from "@/components/BottomNav";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";

export default function SchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));

  const loadData = useCallback(async () => {
    try {
      const [upcomingData, overdueData] = await Promise.all([
        getUpcomingSchedule(),
        getOverdueCustomers()
      ]);
      setSchedule(upcomingData);
      setOverdue(overdueData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate 14 days starting from today for the calendar strip
  const calendarDays = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  }, []);

  // Filter schedules for the selected date
  const selectedDaySchedules = useMemo(() => {
    return schedule.filter(c => c.nextFollowUp && isSameDay(new Date(c.nextFollowUp), selectedDate));
  }, [schedule, selectedDate]);

  // Check if a date has any schedules (for the dot indicator)
  const hasSchedule = useCallback((date) => {
    return schedule.some(c => c.nextFollowUp && isSameDay(new Date(c.nextFollowUp), date));
  }, [schedule]);

  return (
    <div className="min-h-screen bg-[#F4F8FB] dark:bg-slate-950 pb-24 md:pb-0 md:pl-64 font-sans transition-all duration-300">
      <header className="pt-[max(2rem,env(safe-area-inset-top))] px-6 pb-2 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-20">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Lịch hẹn</h1>
        
        {/* Horizontal Calendar Strip */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2">
          {calendarDays.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = idx === 0;
            const dayOfWeek = format(day, 'E', { locale: vi });
            const dayOfMonth = format(day, 'd');
            const hasEvent = hasSchedule(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center justify-center min-w-[3.5rem] py-3 rounded-2xl transition-all border ${
                  isSelected 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/30' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-primary-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {isToday ? 'Hôm nay' : dayOfWeek}
                </span>
                <span className="text-lg font-bold">{dayOfMonth}</span>
                {/* Dot indicator */}
                <div className="h-1.5 flex items-center justify-center mt-1">
                  {hasEvent && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-500'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-5 pt-6 md:max-w-3xl md:mx-auto w-full">
        {/* Overdue Section (only show if overdue exists) */}
        {overdue.length > 0 && isSameDay(selectedDate, startOfDay(new Date())) && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-red-500 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              QUÁ HẠN ({overdue.length})
            </h2>
            <div className="space-y-3">
              {overdue.map(c => (
                <div key={c.id} className="bg-red-50/50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">{c.name}</div>
                    <div className="text-sm text-slate-500">{c.phone}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {c.nextFollowUp ? format(new Date(c.nextFollowUp), 'dd/MM') : ''}
                    </span>
                    <div className="text-[10px] font-bold px-2 py-0.5 mt-1 rounded-md bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700 shadow-sm">
                      {c.heatLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
          {isSameDay(selectedDate, startOfDay(new Date())) ? 'Hôm nay' : format(selectedDate, 'dd/MM/yyyy')}
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-800/50 rounded-2xl h-24 w-full" />
            ))}
          </div>
        ) : selectedDaySchedules.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌴</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Ngày trống</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Bạn không có lịch hẹn nào vào ngày này. Có thể nghỉ ngơi hoặc đi tìm kiếm khách hàng mới!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDaySchedules.map(c => {
              const timeStr = format(new Date(c.nextFollowUp), 'HH:mm');
              return (
                <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-500" />
                  <div className="pl-2">
                    <div className="font-bold text-slate-800 dark:text-white text-lg">{c.name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                      {c.phone}
                      {c.demand && <span className="text-slate-300">•</span>}
                      {c.demand && <span className="truncate max-w-[120px]">{c.demand}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-primary-600 dark:text-primary-400">{timeStr}</span>
                    <div className="text-[10px] font-bold px-2 py-0.5 mt-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {c.heatLevel}
                    </div>
                  </div>
                </div>
              );
            })}
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
