"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Phone, X, MapPin, CheckCircle2, Clock, Calendar as CalendarIcon, Target, Activity, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { completeCustomerAction, updateCustomer } from "@/actions/customers";

export default function ScheduleClient({ initialSchedule, initialOverdue }) {
  const router = useRouter();
  const [schedule] = useState(initialSchedule || []);
  const [overdue] = useState(initialOverdue || []);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleComplete = (e) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await completeCustomerAction({ customerId: selectedItem.id, note: "Đã liên hệ theo lịch trình" });
        setSelectedItem(null);
        router.refresh();
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const handleReschedule = (e, days) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        const nextFollowUp = addDays(new Date(), days).toISOString();
        await updateCustomer(selectedItem.id, { nextFollowUp, status: "Waiting" });
        setSelectedItem(null);
        router.refresh();
      } catch (err) {
        alert(err.message);
      }
    });
  };

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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setSelectedItem(null); setIsDetailExpanded(false); }}>
          <div 
            className="w-full sm:w-[400px] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết lịch hẹn</h2>
              <button onClick={() => { setSelectedItem(null); setIsDetailExpanded(false); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
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

            {selectedItem.demand && !isDetailExpanded && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-5 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Nhu cầu</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{selectedItem.demand}</p>
              </div>
            )}

            {/* EXPANDABLE DETAILS */}
            <div className={`overflow-hidden transition-all duration-300 ${isDetailExpanded ? "max-h-[50vh] opacity-100 mb-5 overflow-y-auto custom-scrollbar" : "max-h-0 opacity-0"}`}>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3.5 border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="text-center">
                    <p className="text-[9px] uppercase text-slate-400 mb-0.5">Trạng thái</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{selectedItem.status}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] uppercase text-slate-400 mb-0.5">Độ nóng</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{selectedItem.heatLevel}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] uppercase text-slate-400 mb-0.5">Hành trình</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{selectedItem.journeyStage}</p>
                  </div>
                </div>

                {selectedItem.budget && (
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold text-sm w-4 text-center shrink-0">₫</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngân sách</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{selectedItem.budget}</p>
                    </div>
                  </div>
                )}
                {selectedItem.timeline && (
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thời gian mua</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedItem.timeline}</p>
                    </div>
                  </div>
                )}
                {selectedItem.demand && isDetailExpanded && (
                  <div className="flex items-start gap-2 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô tả nhu cầu</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white whitespace-pre-wrap">{selectedItem.demand}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setIsDetailExpanded(!isDetailExpanded)}
              className="w-full flex items-center justify-center gap-1.5 mb-5 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
            >
              {isDetailExpanded ? (
                <><ChevronUp className="w-4 h-4" /> Thu gọn thông tin</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Xem toàn bộ thông tin</>
              )}
            </button>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
              <a href={`tel:${selectedItem.phone}`} className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                <Phone className="w-4 h-4 fill-current" /> Gọi Điện
              </a>
              <a href={`https://zalo.me/${selectedItem.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                <span className="font-black text-sm">Zalo</span> Nhắn Tin
              </a>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={(e) => handleComplete(e)}
                disabled={isPending}
                className="flex-1 py-3 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-500/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Đã xong
              </button>
              
              <div className="relative flex-1 group">
                <button disabled={isPending} className="w-full py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 group-hover:border-primary-500 group-hover:text-primary-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  <Clock className="w-4 h-4" /> Dời lịch
                </button>
                {/* Dropdown menu for Reschedule */}
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 flex flex-col gap-1 z-10">
                  <button onClick={(e) => handleReschedule(e, 1)} className="p-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left w-full transition-colors">
                    Dời sang Ngày mai
                  </button>
                  <button onClick={(e) => handleReschedule(e, 3)} className="p-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left w-full transition-colors">
                    Dời thêm 3 ngày
                  </button>
                  <button onClick={(e) => handleReschedule(e, 7)} className="p-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left w-full transition-colors">
                    Dời sang Tuần sau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="schedule" />
    </div>
  );
}
