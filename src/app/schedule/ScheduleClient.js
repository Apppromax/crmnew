"use client";

import { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Phone, X, MapPin, CheckCircle2, Clock, Target, FileText, ChevronDown, ChevronUp, AlertCircle, CalendarClock, Flame, Snowflake, ThermometerSun, Check, PenLine, ArrowLeft } from "lucide-react";
import { completeCustomerAction, updateCustomer } from "@/actions/customers";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import UpdateCareSheet from "@/components/UpdateCareSheet";

// Helper for heat colors strictly matching FocusCard.js
const heatConfig = {
  "1 - Chốt Ngay": { icon: Flame, label: 'Rất Nét', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  "2 - Rất Nóng": { icon: Flame, label: 'Rất Nét', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  "3 - Nóng": { icon: ThermometerSun, label: 'Tiềm Năng', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  "4 - Ấm": { icon: ThermometerSun, label: 'Tiềm Năng', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  "5 - Lạnh": { icon: Snowflake, label: 'Chưa Rõ', bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20' },
  "Rất Nét": { icon: Flame, label: 'Rất Nét', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  "Tiềm Năng": { icon: ThermometerSun, label: 'Tiềm Năng', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20' },
  "Quan Tâm": { icon: ThermometerSun, label: 'Quan Tâm', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  "Tham Khảo": { icon: Snowflake, label: 'Tham Khảo', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  "Chưa Rõ": { icon: Snowflake, label: 'Chưa Rõ', bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20' },
};

function getQuickDates() {
  const now = new Date();
  const hour = now.getHours();
  const chips = [];

  if (hour < 14) {
    const afternoon = new Date(now);
    afternoon.setHours(15, 0, 0, 0);
    chips.push({ label: 'Chiều nay', date: afternoon });
  } else {
    const tonight = new Date(now);
    tonight.setHours(20, 0, 0, 0);
    chips.push({ label: 'Tối nay', date: tonight });
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  chips.push({ label: 'Sáng mai', date: tomorrow });

  const tomorrowAfternoon = new Date(now);
  tomorrowAfternoon.setDate(tomorrowAfternoon.getDate() + 1);
  tomorrowAfternoon.setHours(15, 0, 0, 0);
  chips.push({ label: 'Chiều mai', date: tomorrowAfternoon });

  const in3days = new Date(now);
  in3days.setDate(in3days.getDate() + 3);
  in3days.setHours(9, 0, 0, 0);
  chips.push({ label: '3 ngày nữa', date: in3days });

  return chips;
}

function parseLocalToISO(dateTimeLocalString) {
  if (!dateTimeLocalString) return null;
  const [datePart, timePart] = dateTimeLocalString.split('T');
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  const d = new Date(year, month - 1, day, hour, minute);
  return d.toISOString();
}

const getHeatStyle = (level) => {
  if (!level) return heatConfig["Chưa Rõ"];
  for (const key in heatConfig) {
    if (level.includes(key)) return heatConfig[key];
  }
  return heatConfig["Chưa Rõ"];
};

const SwipeableCard = ({ item, onClick, onComplete, onReschedule, isCompleted }) => {
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
        className={`relative z-10 w-full p-5 backdrop-blur-md rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform ${isCompleted ? 'bg-slate-50/50 dark:bg-slate-900/30 opacity-60 grayscale-[0.5]' : 'bg-white/80 dark:bg-slate-900/80'}`}
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
  const [schedule, setSchedule] = useState(initialSchedule || []);
  const [overdue, setOverdue] = useState(initialOverdue || []);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [isCareSheetOpen, setIsCareSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDateStr, setRescheduleDateStr] = useState("");

  // Sync state when server props change after router.refresh()
  useEffect(() => { setSchedule(initialSchedule || []); }, [initialSchedule]);
  useEffect(() => { setOverdue(initialOverdue || []); }, [initialOverdue]);

  const handleComplete = (item) => {
    startTransition(async () => {
      try {
        await completeCustomerAction({ customerId: item.id, note: "Đã liên hệ theo lịch trình", nextFollowUp: null });
        setSchedule(prev => prev.filter(c => c.id !== item.id));
        setOverdue(prev => prev.filter(c => c.id !== item.id));
        setCompletedIds(prev => new Set([...prev, item.id]));
        setSelectedItem(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        router.refresh();
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const handleCareComplete = () => {
    setIsCareSheetOpen(false);
    if (selectedItem) {
      setCompletedIds(prev => new Set([...prev, selectedItem.id]));
    }
    setSelectedItem(null);
    router.refresh();
  };

  const handleReschedule = (item, days) => {
    startTransition(async () => {
      try {
        const nextFollowUp = addDays(new Date(), days).toISOString();
        await updateCustomer(item.id, { nextFollowUp, status: "Đang chờ" });
        // Remove from current view immediately
        setSchedule(prev => prev.filter(c => c.id !== item.id));
        setOverdue(prev => prev.filter(c => c.id !== item.id));
        setSelectedItem(null);
        router.refresh();
      } catch (err) {
        alert(err.message);
      }
    });
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleDateStr) return;
    startTransition(async () => {
      try {
        const nextFollowUp = parseLocalToISO(rescheduleDateStr);
        await updateCustomer(selectedItem.id, { nextFollowUp, status: "Đang chờ" });
        setSchedule(prev => prev.filter(c => c.id !== selectedItem.id));
        setOverdue(prev => prev.filter(c => c.id !== selectedItem.id));
        setSelectedItem(null);
        setIsRescheduling(false);
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
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/30 font-bold text-sm">
            <Check className="w-5 h-5" /> Đã hoàn thành lịch hẹn!
          </div>
        </div>
      )}
      <header className="pt-safe px-6 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
           <h1 className="text-3xl font-black text-slate-800 dark:text-white">Lịch hẹn</h1>
           <CalendarClock className="w-8 h-8 text-primary-500" />
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
                    <SwipeableCard item={c} onClick={(item) => { setSelectedItem(item); setIsCareSheetOpen(true); }} onComplete={handleComplete} onReschedule={handleReschedule} />
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
                        <SwipeableCard key={c.id} item={c} onClick={(item) => { setSelectedItem(item); setIsCareSheetOpen(true); }} onComplete={handleComplete} onReschedule={handleReschedule} isCompleted={completedIds.has(c.id)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bỏ Detail Modal, khi ấn vào khách sẽ mở UpdateCareSheet trực tiếp theo yêu cầu của user */}

      <BottomNav activeTab="schedule" />

      <UpdateCareSheet 
        isOpen={isCareSheetOpen}
        customer={selectedItem}
        onClose={() => setIsCareSheetOpen(false)}
        onComplete={handleCareComplete}
      />
    </div>
  );
}
