"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Phone, X, MapPin, CheckCircle2, Clock, Target, FileText, ChevronDown, ChevronUp, AlertCircle, CalendarClock, Flame, Snowflake, Coffee } from "lucide-react";
import { completeCustomerAction, updateCustomer } from "@/actions/customers";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// Helper for heat colors
const getHeatStyle = (heatLevel) => {
  if (!heatLevel) return { bg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-300", icon: <Coffee className="w-4 h-4 text-slate-400" /> };
  if (heatLevel.includes("1 -") || heatLevel.includes("Chốt")) return { bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-900/30", text: "text-red-700 dark:text-red-400", icon: <Flame className="w-4 h-4 text-red-500 animate-pulse" /> };
  if (heatLevel.includes("2 -") || heatLevel.includes("Rất")) return { bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-900/30", text: "text-orange-700 dark:text-orange-400", icon: <Flame className="w-4 h-4 text-orange-500" /> };
  if (heatLevel.includes("3 -") || heatLevel.includes("Nóng")) return { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Flame className="w-4 h-4 text-amber-500" /> };
  if (heatLevel.includes("4 -") || heatLevel.includes("Ấm")) return { bg: "bg-yellow-50 dark:bg-yellow-950/20", border: "border-yellow-200 dark:border-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: <Coffee className="w-4 h-4 text-yellow-500" /> };
  if (heatLevel.includes("5 -") || heatLevel.includes("Lạnh")) return { bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <Snowflake className="w-4 h-4 text-blue-500" /> };
  return { bg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-300", icon: <Coffee className="w-4 h-4 text-slate-400" /> };
};

const SwipeableCard = ({ item, onClick, onComplete, onReschedule }) => {
  const x = useMotionValue(0);
  const opacityLeft = useTransform(x, [-100, -50, 0], [1, 0, 0]);
  const opacityRight = useTransform(x, [0, 50, 100], [0, 0, 1]);
  const heat = getHeatStyle(item.heatLevel);

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 80) {
      onComplete(item);
    } else if (info.offset.x < -80) {
      onReschedule(item, 1); // Delay 1 day
    }
  };

  return (
    <div className="relative mb-3 rounded-2xl overflow-hidden group">
      {/* Background Actions */}
      <div className="absolute inset-0 flex justify-between items-center px-6 rounded-2xl">
        <motion.div style={{ opacity: opacityRight }} className="flex items-center gap-2 text-emerald-600 font-bold">
          <CheckCircle2 className="w-5 h-5" /> Xong
        </motion.div>
        <motion.div style={{ opacity: opacityLeft }} className="flex items-center gap-2 text-orange-600 font-bold">
          Dời lịch <Clock className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={() => onClick(item)}
        className={`relative z-10 w-full p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border ${heat.border} flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform`}
      >
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-black text-lg truncate ${heat.text}`}>{item.name}</h3>
            {heat.icon}
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <span>{item.phone}</span>
            {item.demand && <span className="text-slate-300 dark:text-slate-700">•</span>}
            {item.demand && <span className="truncate">{item.demand}</span>}
          </div>
        </div>
        
        <div className="text-right shrink-0">
          <div className={`text-[10px] font-bold px-2 py-1 rounded-md border ${heat.bg} ${heat.border} ${heat.text} shadow-sm`}>
            {item.heatLevel || "Chưa phân loại"}
          </div>
          {item.nextFollowUp && (
             <p className="text-xs text-slate-400 mt-1.5 font-semibold">
               {format(new Date(item.nextFollowUp), 'HH:mm')}
             </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function ScheduleClient({ initialSchedule, initialOverdue }) {
  const router = useRouter();
  const [schedule] = useState(initialSchedule || []);
  const [overdue] = useState(initialOverdue || []);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleComplete = (item) => {
    startTransition(async () => {
      try {
        await completeCustomerAction({ customerId: item.id, note: "Đã liên hệ theo lịch trình" });
        if (selectedItem?.id === item.id) setSelectedItem(null);
        router.refresh();
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const handleReschedule = (item, days) => {
    startTransition(async () => {
      try {
        const nextFollowUp = addDays(new Date(), days).toISOString();
        await updateCustomer(item.id, { nextFollowUp, status: "Waiting" });
        if (selectedItem?.id === item.id) setSelectedItem(null);
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

  const groupedSchedules = useMemo(() => {
    const grouped = {};
    selectedDaySchedules.forEach(c => {
      const d = new Date(c.nextFollowUp);
      const h = format(d, 'HH:00');
      if (!grouped[h]) grouped[h] = [];
      grouped[h].push(c);
    });
    return Object.keys(grouped).sort().map(time => ({
      time,
      items: grouped[time]
    }));
  }, [selectedDaySchedules]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 md:pb-0 md:pl-64 font-sans transition-all duration-300">
      <header className="pt-safe px-6 pt-6 pb-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Lịch trình</h1>
           <CalendarClock className="w-6 h-6 text-indigo-500" />
        </div>
        
        {/* Horizontal Calendar Strip */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2">
          {calendarDays.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = idx === 0;
            const dayOfWeek = format(day, 'E', { locale: vi });
            const dayOfMonth = format(day, 'd');
            const hasEvent = hasSchedule(day);

            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center justify-center min-w-[4rem] py-3 rounded-2xl transition-all border relative overflow-hidden ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {isSelected && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />}
                <span className={`text-xs font-bold mb-1 z-10 ${isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {isToday ? 'Hôm nay' : dayOfWeek}
                </span>
                <span className="text-xl font-black z-10">{dayOfMonth}</span>
                <div className="h-1.5 flex items-center justify-center mt-1.5 z-10">
                  {hasEvent && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </header>

      <main className="px-5 pt-8 md:max-w-3xl md:mx-auto w-full relative">
        <AnimatePresence mode="popLayout">
          {/* Overdue Section */}
          {overdue.length > 0 && isSameDay(selectedDate, startOfDay(new Date())) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="mb-10"
            >
              <h2 className="text-sm font-black text-red-500 mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 w-max px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4 animate-pulse" />
                CẦN XỬ LÝ GẤP ({overdue.length})
              </h2>
              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-[2px] before:bg-red-200 dark:before:bg-red-900/50">
                {overdue.map(c => (
                  <div key={c.id} className="relative pl-10">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 z-10" />
                    <SwipeableCard item={c} onClick={setSelectedItem} onComplete={handleComplete} onReschedule={handleReschedule} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Timeline View */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider pl-10">
              {isSameDay(selectedDate, startOfDay(new Date())) ? 'Lịch trình hôm nay' : format(selectedDate, 'dd/MM/yyyy')}
            </h2>

            {groupedSchedules.length === 0 ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20 px-4">
                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Coffee className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Không có lịch trình</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Bạn có thể nghỉ ngơi, hoặc chủ động tìm thêm khách hàng mới nhé.</p>
              </motion.div>
            ) : (
              <div className="relative before:absolute before:left-3.5 before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                {groupedSchedules.map((group, gIdx) => (
                  <div key={group.time} className="relative pl-10 mb-8">
                    {/* Time node */}
                    <div className="absolute left-[-4px] top-1 bg-white dark:bg-slate-950 px-1 z-10">
                      <div className="font-black text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800">
                        {group.time}
                      </div>
                    </div>
                    
                    <div className="pt-8 space-y-3">
                      {group.items.map(c => (
                        <SwipeableCard key={c.id} item={c} onClick={setSelectedItem} onComplete={handleComplete} onReschedule={handleReschedule} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quick Action Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelectedItem(null); setIsDetailExpanded(false); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-full sm:w-[420px] bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl pb-safe z-10"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${getHeatStyle(selectedItem.heatLevel).bg} ${getHeatStyle(selectedItem.heatLevel).text}`}>
                    {selectedItem.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight">{selectedItem.name}</h3>
                    <p className="text-slate-500 font-medium">{selectedItem.phone}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedItem(null); setIsDetailExpanded(false); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <a href={`tel:${selectedItem.phone}`} className="bg-gradient-to-b from-emerald-400 to-emerald-600 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition-all active:scale-95 shadow-lg shadow-emerald-500/30 border border-emerald-500/50">
                  <Phone className="w-5 h-5 fill-current" /> Gọi Điện
                </a>
                <a href={`https://zalo.me/${selectedItem.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-b from-blue-500 to-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition-all active:scale-95 shadow-lg shadow-blue-500/30 border border-blue-600/50">
                  <span className="text-xs uppercase tracking-wider">Nhắn Zalo</span>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Trạng thái</p>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{selectedItem.status}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Độ nóng</p>
                  <p className={`font-bold text-xs ${getHeatStyle(selectedItem.heatLevel).text}`}>{selectedItem.heatLevel}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Thời gian</p>
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                     {selectedItem.nextFollowUp ? format(new Date(selectedItem.nextFollowUp), 'HH:mm') : '--'}
                  </p>
                </div>
              </div>

              {selectedItem.demand && (
                 <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl mb-6 border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Ghi chú / Nhu cầu</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{selectedItem.demand}</p>
                 </div>
              )}

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleComplete(selectedItem)}
                  disabled={isPending}
                  className="flex-1 py-4 bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-slate-900/20"
                >
                  <CheckCircle2 className="w-5 h-5" /> Đã xong
                </button>
                
                <div className="relative flex-1 group">
                  <button disabled={isPending} className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
                    <Clock className="w-5 h-5" /> Dời lịch
                  </button>
                  {/* Dropdown menu for Reschedule */}
                  <div className="absolute bottom-full left-0 right-0 mb-3 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 flex flex-col gap-1 z-10">
                    <button onClick={() => handleReschedule(selectedItem, 1)} className="p-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-left w-full transition-colors flex items-center justify-between">
                      Ngày mai <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-500">+1d</span>
                    </button>
                    <button onClick={() => handleReschedule(selectedItem, 3)} className="p-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-left w-full transition-colors flex items-center justify-between">
                      3 ngày sau <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-500">+3d</span>
                    </button>
                    <button onClick={() => handleReschedule(selectedItem, 7)} className="p-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-left w-full transition-colors flex items-center justify-between">
                      Tuần sau <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-500">+7d</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav activeTab="schedule" />
    </div>
  );
}
