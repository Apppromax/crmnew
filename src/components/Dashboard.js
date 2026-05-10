"use client";

import React, { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import FocusCard from "@/components/FocusCard";
import RadarCard from "@/components/RadarCard";
import CompletionSheet from "@/components/CompletionSheet";
import InboxZero from "@/components/InboxZero";
import BottomNav from "@/components/BottomNav";
import {
  completeCustomerAction,
  snoozeCustomer,
  getCustomerCount,
  clearAllSnoozes,
  getSmartQueue,
} from "@/actions/customers";
import { getNotifications, triggerSmartAlerts } from "@/actions/notifications";
import NotificationSheet from "@/components/NotificationSheet";
import { Bell, Plus, X, TrendingUp, CalendarCheck, AlertTriangle, Trophy } from "lucide-react";

// Fallback reasons/next steps based on data
function enrichCustomer(c) {
  const now = Date.now();
  const overdueDays = c.nextFollowUp
    ? Math.floor((now - new Date(c.nextFollowUp).getTime()) / 86400000)
    : 0;

  let reason = "Khách mới, cần tìm hiểu thêm";
  let nextStep = "Gọi tìm hiểu nhu cầu";

  if (overdueDays > 0) {
    reason = `Lỡ hẹn ${overdueDays} ngày, cần liên hệ lại ngay`;
    nextStep = "Gọi xác nhận lại lịch hẹn";
  } else if (c.journeyStage === "Negotiating") {
    reason = "Đang thương lượng, cần chốt sớm";
    nextStep = "Gửi bảng giá ưu đãi";
  } else if (c.journeyStage === "Viewed") {
    reason = "Đã xem nhà, cần follow-up";
    nextStep = "Hỏi cảm nhận và đề xuất bước tiếp";
  } else if (c.journeyStage === "Contacted") {
    reason = "Đã liên hệ, chưa hẹn xem nhà";
    nextStep = "Đặt lịch xem nhà";
  } else if (c.heatLevel === "Hot") {
    reason = "Khách nóng, thông tin rõ ràng";
    nextStep = "Gọi tư vấn chi tiết";
  } else if (c.heatLevel === "Warm") {
    reason = "Khách ấm, cần nuôi dưỡng";
    nextStep = "Nhắn tin follow-up";
  } else if (c.heatLevel === "Cold") {
    reason = "Thông tin còn mơ hồ, cần khai thác";
    nextStep = "Gọi tìm hiểu ngân sách";
  }

  return { ...c, reason, nextStep };
}

export default function Dashboard({ initialQueue = [], initialCounts = { total: 0, hot: 0, warm: 0 }, dashboardStats }) {
  const [queue, setQueue] = useState(initialQueue.map(enrichCustomer));
  const [counts, setCounts] = useState(initialCounts);
  const [loading, setLoading] = useState(false);
  const [sheetCustomer, setSheetCustomer] = useState(null);
  const [selectedRadarCustomer, setSelectedRadarCustomer] = useState(null);
  const [exitingId, setExitingId] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [isPending, startTransition] = useTransition();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const router = useRouter();

  const loadQueue = useCallback(async () => {
    try {
      const [data, countData] = await Promise.all([
        getSmartQueue(),
        getCustomerCount(),
      ]);
      setQueue(data.map(enrichCustomer));
      setCounts(countData);
    } catch (err) {
      console.error("Failed to load queue:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    // Kích hoạt thông minh AI Alert ngầm
    await triggerSmartAlerts();
    const res = await getNotifications();
    if (res.notifications) {
      setUnreadNotifCount(res.notifications.filter(n => !n.isRead).length);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    loadNotifications();
  }, [loadQueue, loadNotifications]);

  const focusCustomer = queue[0] || null;
  const radarCustomers = queue.slice(1, 3);

  const handleAction = useCallback((customer) => {
    setSheetCustomer(customer);
  }, []);

  const handleComplete = useCallback(
    (data) => {
      setSheetCustomer(null);
      setExitingId(data.customerId);

      // Optimistically remove from queue after animation finishes
      setTimeout(() => {
        setQueue((prev) => prev.filter((c) => c.id !== data.customerId));
        setExitingId(null);
        loadQueue(); // Fetch silently in background
      }, 350);

      startTransition(async () => {
        try {
          await completeCustomerAction(data);
        } catch (e) {
          console.error("Action failed", e);
          loadQueue(); // Revert on failure
        }
      });
    },
    [loadQueue]
  );

  const handleSnooze = useCallback(
    (customer) => {
      setExitingId(customer.id);

      // Optimistically remove from queue after animation finishes
      setTimeout(() => {
        setQueue((prev) => prev.filter((c) => c.id !== customer.id));
        setExitingId(null);
        loadQueue(); // Fetch silently in background
      }, 350);

      startTransition(async () => {
        try {
          await snoozeCustomer(customer.id);
        } catch (e) {
          console.error("Snooze failed", e);
          loadQueue(); // Revert on failure
        }
      });
    },
    [loadQueue]
  );

  const handleRestoreQueue = useCallback(() => {
    startTransition(async () => {
      try {
        await clearAllSnoozes();
        loadQueue();
      } catch (e) {
        console.error("Restore failed", e);
      }
    });
  }, [loadQueue]);

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 relative overflow-hidden bg-[#F4F8FB] dark:bg-slate-950 font-sans transition-all duration-300">
      {/* City Skyline Background */}
      <div 
        className="absolute top-0 right-0 w-full max-w-2xl h-[500px] z-0 pointer-events-none opacity-90 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: "url('/bg-city.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          maskImage: 'radial-gradient(100% 100% at 100% 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(100% 100% at 100% 0%, black 20%, transparent 100%)'
        }}
      />
      
      {/* Soft Wave Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[400px] rounded-full bg-blue-200/50 dark:bg-blue-900/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-[60%] h-[500px] rounded-full bg-blue-300/30 dark:bg-blue-800/20 blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-slate-800 dark:text-white">
                Hôm nay
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {queue.length > 0
                  ? `${queue.length} khách hàng cần chăm sóc`
                  : "Không có khách cần xử lý"}
              </p>
              <button 
                onClick={handleRestoreQueue}
                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                title="Khôi phục toàn bộ thẻ đang tạm gác"
              >
                Khôi phục
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/add")}
              className="h-11 px-4 rounded-full bg-primary-600 text-white shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-primary-700 font-bold text-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Thêm khách</span>
            </button>
            <button 
              onClick={() => setIsNotifOpen(true)}
              className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center relative active:scale-95 transition-transform"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar">
          <div className="px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold shrink-0">🔥 {counts.hot} nóng</div>
          <div className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold shrink-0">🌡️ {counts.warm} ấm</div>
          <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 text-xs font-semibold shrink-0">Tổng: {counts.total}</div>
        </div>
      </header>

      {/* Extended Stats Panel */}
      {dashboardStats && (
        <div className="px-5 pt-5 max-w-lg md:max-w-4xl mx-auto w-full space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Quá hạn</p><p className="text-lg font-black text-slate-900 dark:text-white">{dashboardStats.overdue}</p></div>
            </div>
            <div className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center"><CalendarCheck className="w-4 h-4 text-blue-500" /></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Hẹn hôm nay</p><p className="text-lg font-black text-slate-900 dark:text-white">{dashboardStats.todaySchedule}</p></div>
            </div>
            <div className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center"><Trophy className="w-4 h-4 text-emerald-500" /></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Chốt tháng</p><p className="text-lg font-black text-slate-900 dark:text-white">{dashboardStats.closedThisMonth}</p></div>
            </div>
            <div className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary-500" /></div>
              <div><p className="text-[10px] font-bold uppercase text-slate-400">Tổng active</p><p className="text-lg font-black text-slate-900 dark:text-white">{dashboardStats.total}</p></div>
            </div>
          </div>

          {/* Sales Funnel */}
          {dashboardStats.funnel && (
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📊 Phễu bán hàng</p>
              <div className="space-y-2">
                {dashboardStats.funnel.map((item, idx) => {
                  const maxCount = Math.max(...dashboardStats.funnel.map(f => f.count), 1);
                  const pct = (item.count / maxCount) * 100;
                  const colors = ['bg-slate-400', 'bg-blue-400', 'bg-cyan-400', 'bg-amber-400', 'bg-orange-400', 'bg-emerald-500'];
                  return (
                    <div key={item.stage} className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-24 shrink-0 truncate">{item.stage}</span>
                      <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[idx] || 'bg-primary-500'} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 4)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Queue */}
      <main className="px-5 pt-5 max-w-lg md:max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse glass rounded-2xl h-28 w-full" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <InboxZero />
        ) : (
          <div className="space-y-4">
            {focusCustomer && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
                  ⚡ Ưu tiên số 1
                </p>
                <FocusCard
                  key={focusCustomer.id}
                  customer={focusCustomer}
                  onAction={handleAction}
                  onSnooze={handleSnooze}
                  animClass={exitingId === focusCustomer.id ? "animate-fade-out-left" : "animate-fade-in-up"}
                />
              </div>
            )}

            {radarCustomers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
                  📡 Tiếp theo
                </p>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                  {radarCustomers.map((c) => (
                    <RadarCard
                      key={c.id}
                      customer={c}
                      onClick={(customer) => setSelectedRadarCustomer(customer)}
                      onSnooze={handleSnooze}
                      animClass={exitingId === c.id ? "animate-fade-out-left" : "animate-fade-in-up"}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FAB removed - moved to header */}

      <BottomNav activeTab="home" />

      <CompletionSheet
        isOpen={!!sheetCustomer}
        customer={sheetCustomer}
        onComplete={handleComplete}
        onClose={() => setSheetCustomer(null)}
      />

      <NotificationSheet 
        isOpen={isNotifOpen} 
        onClose={() => {
          setIsNotifOpen(false);
          loadNotifications();
        }} 
      />

      {/* Radar Details Modal */}
      {selectedRadarCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setSelectedRadarCustomer(null)}
          />
          <div className="relative w-full max-w-sm animate-slide-up">
            <FocusCard 
              customer={selectedRadarCustomer}
              onAction={(c) => {
                setSelectedRadarCustomer(null);
                handleAction(c);
              }}
              onSnooze={(c) => {
                setSelectedRadarCustomer(null);
                handleSnooze(c);
              }}
            />
            <button 
              onClick={() => setSelectedRadarCustomer(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg border-2 border-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
