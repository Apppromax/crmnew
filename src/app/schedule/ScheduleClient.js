"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Phone, X, MapPin } from "lucide-react";

export default function ScheduleClient({ initialSchedule, initialOverdue }) {
  const router = useRouter();
  const [schedule] = useState(initialSchedule || []);
  const [overdue] = useState(initialOverdue || []);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedItem, setSelectedItem] = useState(null);

  const calendarDays = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  }, []);

  const selectedDaySchedules = useMemo(() => {
    return schedule.filter(c => c.nextFollowUp && isSameDay(new Date(c.nextFollowUp), selectedDate));
  }, [schedule, selectedDate]);

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
        {/* Overdue Section */}
        {overdue.length > 0 && isSameDay(selectedDate, startOfDay(new Date())) && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-red-500 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              QUÁ HẠN ({overdue.length})
            </h2>
            <div className="space-y-3">
              {overdue.map(c => (
                <div key={c.id} onClick={() => setSelectedItem(c)} className="bg-red-50/50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
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

        {selectedDaySchedules.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌴</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Ngày trống</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Bạn không có lịch hẹn nào vào ngày này.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDaySchedules.map(c => {
              const timeStr = format(new Date(c.nextFollowUp), 'HH:mm');
              return (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedItem(c)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                >
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

      {/* Quick Action Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div 
            className="w-full sm:w-[400px] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hành động nhanh</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl">
                {selectedItem.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedItem.name}</h3>
                <p className="text-sm text-slate-500">{selectedItem.phone}</p>
                {selectedItem.area && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {selectedItem.area}
                  </p>
                )}
              </div>
            </div>

            {selectedItem.demand && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-5 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Nhu cầu</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{selectedItem.demand}</p>
              </div>
            )}

            <div className="flex gap-3 mb-4">
              <a href={`tel:${selectedItem.phone}`} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                <Phone className="w-4 h-4 fill-current" /> Gọi Điện
              </a>
              <a href={`https://zalo.me/${selectedItem.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                <span className="font-black text-sm">Zalo</span> Nhắn Tin
              </a>
            </div>

            <button 
              onClick={() => { setSelectedItem(null); router.push('/customers'); }}
              className="w-full py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 active:scale-95 transition-all"
            >
              Xem chi tiết khách hàng
            </button>
          </div>
        </div>
      )}

      <BottomNav activeTab="schedule" />
    </div>
  );
}
