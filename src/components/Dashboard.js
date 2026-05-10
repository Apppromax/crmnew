"use client";

import React, { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import FocusCard from "@/components/FocusCard";
import RadarCard from "@/components/RadarCard";
import CompletionSheet from "@/components/CompletionSheet";
import InboxZero from "@/components/InboxZero";
import BottomNav from "@/components/BottomNav";
import {
  getSmartQueue,
  completeCustomerAction,
  snoozeCustomer,
  getCustomerCount,
} from "@/actions/customers";
import { Bell, Plus, X } from "lucide-react";

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

export default function Dashboard() {
  const [queue, setQueue] = useState([]);
  const [counts, setCounts] = useState({ total: 0, hot: 0, warm: 0 });
  const [loading, setLoading] = useState(true);
  const [sheetCustomer, setSheetCustomer] = useState(null);
  const [selectedRadarCustomer, setSelectedRadarCustomer] = useState(null);
  const [exitingId, setExitingId] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [isPending, startTransition] = useTransition();
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

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

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
          await snoozeCustomer(customer.id, 4);
        } catch (e) {
          console.error("Snooze failed", e);
          loadQueue(); // Revert on failure
        }
      });
    },
    [loadQueue]
  );

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-[#F4F8FB] dark:bg-slate-950 font-sans">
      {/* City Skyline Background */}
      <div 
        className="absolute top-0 right-0 w-full max-w-lg h-[400px] z-0 pointer-events-none opacity-90 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: "url('/bg-city.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          maskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)'
        }}
      />
      
      {/* Soft Wave Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[400px] rounded-full bg-blue-200/50 dark:bg-blue-900/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-[60%] h-[500px] rounded-full bg-blue-300/30 dark:bg-blue-800/20 blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="pt-safe px-6 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white">
              Hôm nay
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {queue.length > 0
                ? `${queue.length} khách hàng cần chăm sóc`
                : "Không có khách cần xử lý"}
            </p>
          </div>
          <button className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            {queue.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-2 mt-4">
          <div className="px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold">
            🔥 {counts.hot} nóng
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            🌡️ {counts.warm} ấm
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Tổng: {counts.total} khách
          </div>
        </div>
      </header>

      {/* Main Queue */}
      <main className="px-5 pt-5 max-w-lg mx-auto">
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
                <div className="grid grid-cols-2 gap-3">
                  {radarCustomers.map((c) => (
                    <RadarCard
                      key={c.id}
                      customer={c}
                      onClick={(customer) => setSelectedRadarCustomer(customer)}
                      animClass={exitingId === c.id ? "animate-fade-out-left" : "animate-fade-in-up"}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-20 right-5 z-30">
        <button 
          onClick={() => router.push("/add")}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>

      <BottomNav activeTab="home" />

      <CompletionSheet
        isOpen={!!sheetCustomer}
        customer={sheetCustomer}
        onComplete={handleComplete}
        onClose={() => setSheetCustomer(null)}
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
