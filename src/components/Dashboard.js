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
import { Bell, Plus, X, TrendingUp, CalendarCheck, AlertTriangle, Trophy, RotateCcw } from "lucide-react";

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

  const dismissedIds = React.useRef(new Set());

  const loadQueue = useCallback(async () => {
    try {
      const [data, countData] = await Promise.all([
        getSmartQueue(),
        getCustomerCount(),
      ]);
      // Filter out items that were optimistically dismissed but might still be returned by a stale server response
      const enriched = data.map(enrichCustomer).filter(c => !dismissedIds.current.has(c.id));
      setQueue(enriched);
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
      dismissedIds.current.add(data.customerId);

      // Optimistically remove from queue after animation finishes
      setTimeout(() => {
        setQueue((prev) => prev.filter((c) => c.id !== data.customerId));
        setExitingId(null);
      }, 350);

      startTransition(async () => {
        try {
          await completeCustomerAction(data);
          // Background fetch only if queue is running low
          setQueue((prev) => {
            if (prev.length <= 3) loadQueue();
            return prev;
          });
        } catch (e) {
          console.error("Action failed", e);
          dismissedIds.current.delete(data.customerId);
          loadQueue(); // Revert on failure
        }
      });
    },
    [loadQueue]
  );

  const handleSnooze = useCallback(
    (customer) => {
      setExitingId(customer.id);
      dismissedIds.current.add(customer.id);

      // Optimistically remove from queue after animation finishes
      setTimeout(() => {
        setQueue((prev) => prev.filter((c) => c.id !== customer.id));
        setExitingId(null);
      }, 350);

      startTransition(async () => {
        try {
          await snoozeCustomer(customer.id);
          // Background fetch only if queue is running low
          setQueue((prev) => {
            if (prev.length <= 3) loadQueue();
            return prev;
          });
        } catch (e) {
          console.error("Snooze failed", e);
          dismissedIds.current.delete(customer.id);
          loadQueue(); // Revert on failure
        }
      });
    },
    [loadQueue]
  );

  const handleRestoreQueue = useCallback(() => {
    setLoading(true);
    setQueue([]);
    startTransition(async () => {
      try {
        await clearAllSnoozes();
        dismissedIds.current.clear(); // Clear local dismissals so restored items can show
        await loadQueue();
      } catch (e) {
        console.error("Restore failed", e);
        setLoading(false);
      }
    });
  }, [loadQueue]);

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 relative overflow-hidden bg-transparent font-sans transition-all duration-300">
      {/* City Skyline Background */}
      <div 
        className="dashboard-bg-illustration absolute top-0 right-0 w-full max-w-2xl h-[500px] z-0 pointer-events-none opacity-90 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
        style={{
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
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRestoreQueue}
              disabled={isPending}
              title="Khôi phục thẻ đang gác"
              className={`w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center relative transition-transform ${isPending ? 'opacity-70' : 'active:scale-95'}`}
            >
              <RotateCcw className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${isPending ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => router.push("/add")}
              className="w-11 h-11 rounded-full bg-primary-600 text-white shadow-sm flex items-center justify-center active:scale-95 transition-transform hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
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
                <div className={exitingId === focusCustomer.id ? "animate-fade-out-left" : "animate-fade-in-up"}>
                  <FocusCard
                    key={focusCustomer.id}
                    customer={focusCustomer}
                    onAction={handleAction}
                    onSnooze={handleSnooze}
                  />
                </div>
              </div>
            )}

            {radarCustomers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
                  📡 Tiếp theo
                </p>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                  {radarCustomers.map((c) => (
                    <div key={c.id} className={exitingId === c.id ? "animate-fade-out-left" : "animate-fade-in-up"}>
                      <RadarCard
                        customer={c}
                        onClick={(customer) => setSelectedRadarCustomer(customer)}
                        onSnooze={handleSnooze}
                      />
                    </div>
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
