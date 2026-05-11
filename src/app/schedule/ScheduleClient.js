"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Phone, X, MapPin, CheckCircle2, Clock, Target, FileText, ChevronDown, ChevronUp, AlertCircle, CalendarClock, Flame, Snowflake, ThermometerSun, Check, PenLine, ArrowLeft } from "lucide-react";
import { completeCustomerAction, updateCustomer } from "@/actions/customers";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// Helper for heat colors strictly matching FocusCard.js
const heatConfig = {
  "1 - Chốt Ngay": { icon: Flame, label: 'Rất cao', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  "2 - Rất Nóng": { icon: Flame, label: 'Rất cao', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  "3 - Nóng": { icon: ThermometerSun, label: 'Cao', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  "4 - Ấm": { icon: ThermometerSun, label: 'Cao', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  "5 - Lạnh": { icon: Snowflake, label: 'Trung bình', bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20' },
  "Hot": { icon: Flame, label: 'Rất cao', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  "Warm": { icon: ThermometerSun, label: 'Cao', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  "Cold": { icon: Snowflake, label: 'Trung bình', bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20' },
};

const getHeatStyle = (level) => {
  if (!level) return heatConfig["Cold"];
  for (const key in heatConfig) {
    if (level.includes(key)) return heatConfig[key];
  }
  return heatConfig["Cold"];
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
    <div className="relative mb-3 rounded-[1.5rem] overflow-hidden group">
      {/* Background Actions */}
      <div className="absolute inset-0 flex justify-between items-center px-6 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800/50">
        <motion.div style={{ opacity: opacityRight }} className="flex flex-col items-center gap-1 text-emerald-600 font-bold text-xs">
          <CheckCircle2 className="w-6 h-6" /> Xong
        </motion.div>
        <motion.div style={{ opacity: opacityLeft }} className="flex flex-col items-center gap-1 text-amber-600 font-bold text-xs">
          <Clock className="w-6 h-6" /> Dời lịch
        </motion.div>
      </div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={() => onClick(item)}
        className={`relative z-10 w-full p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform`}
      >
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate leading-tight">{item.name}</h3>
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
            <span>{item.phone}</span>
            {item.demand && <span className="text-slate-300 dark:text-slate-700">•</span>}
            {item.demand && <span className="truncate">{item.demand}</span>}
          </div>
        </div>
        
        <div className="text-right shrink-0">
          <div className={`px-2 py-1 text-[10px] font-bold rounded-full border ${heat.bg} ${heat.text} ${heat.border} flex items-center justify-center gap-1`}>
            {heat.icon && <heat.icon className="w-3 h-3" />} 
            <span>{heat.label}</span>
          </div>
          {item.nextFollowUp && (
             <p className="text-xs text-slate-400 mt-2 font-semibold flex items-center justify-end gap-1">
               <Clock className="w-3 h-3" />
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
    <div className="min-h-screen bg-transparent pb-24 md:pb-0 md:pl-64 font-sans relative transition-all duration-300">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
           <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Lịch hẹn</h1>
           <CalendarClock className="w-6 h-6 text-primary-500" />
        </div>
        
        {/* Horizontal Calendar Strip */}
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar -mx-2 px-2">
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
                className={`flex flex-col items-center justify-center min-w-[3.5rem] py-3 rounded-[1rem] transition-all border relative overflow-hidden ${
                  isSelected 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/30' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {isSelected && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />}
                <span className={`text-[10px] font-semibold mb-1 z-10 uppercase tracking-wide ${isSelected ? 'text-primary-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {isToday ? 'Hôm nay' : dayOfWeek}
                </span>
                <span className="text-lg font-bold z-10">{dayOfMonth}</span>
                <div className="h-1 flex items-center justify-center mt-1.5 z-10">
                  {hasEvent && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-500'}`} />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </header>

      <main className="px-5 pt-6 md:max-w-3xl md:mx-auto w-full relative">
        <AnimatePresence mode="popLayout">
          {/* Overdue Section */}
          {overdue.length > 0 && isSameDay(selectedDate, startOfDay(new Date())) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <h2 className="text-[10px] font-bold text-red-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Cần xử lý gấp ({overdue.length})
              </h2>
              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-[1px] before:bg-red-200 dark:before:bg-red-900/50 before:-z-10">
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
            <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider pl-10">
              {isSameDay(selectedDate, startOfDay(new Date())) ? 'Lịch trình' : format(selectedDate, 'dd/MM/yyyy')}
            </h2>

            {groupedSchedules.length === 0 ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CalendarClock className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Trống lịch trình</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bạn có thể nghỉ ngơi, hoặc chủ động tìm thêm khách hàng mới nhé.</p>
              </motion.div>
            ) : (
              <div className="relative before:absolute before:left-3.5 before:top-2 before:bottom-0 before:w-[1px] before:bg-slate-200 dark:before:bg-slate-800 before:-z-10">
                {groupedSchedules.map((group, gIdx) => (
                  <div key={group.time} className="relative pl-10 mb-6">
                    {/* Time node */}
                    <div className="absolute left-[-2px] top-1 bg-white dark:bg-slate-950 px-1 z-10">
                      <div className="font-bold text-[10px] tracking-wide text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded border border-primary-100 dark:border-primary-800">
                        {group.time}
                      </div>
                    </div>
                    
                    <div className="pt-6 space-y-3">
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

      {/* Detail Modal (Aligned with CompletionSheet / FocusCard style) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Sheet Content */}
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl pb-safe z-10"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2 sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>

              <div className="px-5 pb-8">
                {/* Header Profile */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-primary-500/20">
                      {selectedItem.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-800 dark:text-white leading-tight">{selectedItem.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedItem.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status/Heat info row like FocusCard */}
                <div className="border-y border-slate-100 dark:border-slate-700/50 py-3 flex items-center justify-between mb-5">
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Trạng thái</p>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedItem.status}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-700/50" />
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Độ nóng</p>
                    <span className={`text-xs font-semibold ${getHeatStyle(selectedItem.heatLevel).text}`}>{getHeatStyle(selectedItem.heatLevel).label}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-700/50" />
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Thời gian hẹn</p>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                       {selectedItem.nextFollowUp ? format(new Date(selectedItem.nextFollowUp), 'HH:mm') : '--'}
                    </span>
                  </div>
                </div>

                {selectedItem.demand && (
                   <div className="flex items-start gap-2 text-sm mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                      <FileText className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">Ghi chú nhu cầu</p>
                        <p className="text-slate-600 dark:text-slate-300 leading-snug">{selectedItem.demand}</p>
                      </div>
                   </div>
                )}

                {/* Quick Actions identical to CompletionSheet */}
                <div className="flex gap-2 mb-4">
                  <a href={`tel:${selectedItem.phone?.replace(/\s/g, '')}`} className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border border-emerald-100 dark:border-emerald-500/20">
                    <Phone className="w-4 h-4 fill-current" /> Gọi điện
                  </a>
                  <a href={`https://zalo.me/${selectedItem.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-600 dark:text-blue-400 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border border-blue-100 dark:border-blue-500/20">
                    Nhắn Zalo
                  </a>
                </div>

                {/* Primary Action Button like FocusCard */}
                <div className="space-y-2">
                  <button 
                    onClick={() => handleComplete(selectedItem)}
                    disabled={isPending}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Đã xong lịch hẹn
                  </button>
                  
                  <div className="relative group">
                    <button disabled={isPending} className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm">
                      <Clock className="w-4 h-4" /> Dời lịch hẹn
                    </button>
                    {/* Dropdown menu for Reschedule */}
                    <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 flex flex-col gap-1 z-10">
                      <button onClick={() => handleReschedule(selectedItem, 1)} className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl text-left w-full transition-colors flex justify-between items-center">
                        Dời sang ngày mai <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">+1d</span>
                      </button>
                      <button onClick={() => handleReschedule(selectedItem, 3)} className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl text-left w-full transition-colors flex justify-between items-center">
                        Dời 3 ngày tới <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">+3d</span>
                      </button>
                    </div>
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
