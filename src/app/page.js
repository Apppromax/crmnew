"use client";

import React, { useState, useCallback } from "react";
import FocusCard from "@/components/FocusCard";
import RadarCard from "@/components/RadarCard";
import CompletionSheet from "@/components/CompletionSheet";
import InboxZero from "@/components/InboxZero";
import BottomNav from "@/components/BottomNav";

const mockCustomers = [
  {
    id: '1', name: 'Nguyễn Văn Hùng', phone: '0901 234 567',
    status: 'Active', budget: '2-3 tỷ', demand: 'Căn hộ 2PN view sông',
    area: 'Quận 7', timeline: 'Quý 3/2026', finance: 'Vay 70%',
    clarityScore: 85, heatLevel: 'Hot',
    nextFollowUp: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastContactAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    journeyStage: 'Viewed',
    reason: 'Lỡ hẹn 2 ngày, đã xem nhà tuần trước, khách đang rất nóng',
    nextStep: 'Gọi xác nhận lại lịch xem nhà',
  },
  {
    id: '2', name: 'Trần Thị Mai Anh', phone: '0938 765 432',
    status: 'Active', budget: '5-7 tỷ', demand: 'Nhà phố 3 tầng',
    area: 'Thủ Đức', timeline: 'Trong tháng', finance: 'Tiền mặt',
    clarityScore: 72, heatLevel: 'Hot',
    nextFollowUp: new Date(Date.now() + 3600000).toISOString(),
    lastContactAt: new Date(Date.now() - 86400000).toISOString(),
    journeyStage: 'Negotiating',
    reason: 'Đang thương lượng giá, cần chốt trong hôm nay',
    nextStep: 'Gửi bảng giá ưu đãi cuối cùng',
  },
  {
    id: '3', name: 'Lê Hoàng Nam', phone: '0912 345 678',
    status: 'New', budget: '1-2 tỷ', demand: 'Căn hộ studio',
    area: 'Bình Thạnh', timeline: 'Quý 4/2026', finance: null,
    clarityScore: 45, heatLevel: 'Warm',
    nextFollowUp: new Date(Date.now() + 18 * 3600000).toISOString(),
    lastContactAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    journeyStage: 'Lead',
    reason: 'Khách mới, cần tìm hiểu nhu cầu chi tiết hơn',
    nextStep: 'Nhắn tin follow-up hỏi ngân sách',
  },
  {
    id: '4', name: 'Phạm Minh Đức', phone: '0908 111 222',
    status: 'Waiting', budget: '3-4 tỷ', demand: 'Biệt thự mini',
    area: 'Quận 9', timeline: 'Quý 2/2026', finance: 'Vay 50%',
    clarityScore: 60, heatLevel: 'Warm',
    nextFollowUp: new Date(Date.now() + 2 * 86400000).toISOString(),
    lastContactAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    journeyStage: 'Contacted',
    reason: 'Đã liên hệ nhưng chưa hẹn được lịch xem nhà',
    nextStep: 'Gọi đặt lịch xem nhà cuối tuần',
  },
  {
    id: '5', name: 'Võ Thị Hồng', phone: '0977 888 999',
    status: 'Active', budget: null, demand: 'Đất nền',
    area: 'Long An', timeline: null, finance: null,
    clarityScore: 25, heatLevel: 'Cold',
    nextFollowUp: new Date(Date.now() + 7 * 86400000).toISOString(),
    lastContactAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    journeyStage: 'Lead',
    reason: 'Thông tin còn mơ hồ, cần khai thác thêm',
    nextStep: 'Gọi tìm hiểu ngân sách và khu vực',
  },
];

function getSmartQueue(customers, completedIds, snoozedIds) {
  return customers
    .filter((c) => !['Closed', 'Lost'].includes(c.status))
    .filter((c) => !completedIds.has(c.id))
    .filter((c) => !snoozedIds.has(c.id))
    .sort((a, b) => {
      const now = Date.now();
      const aOverdue = a.nextFollowUp && new Date(a.nextFollowUp) < now ? 0 : 1;
      const bOverdue = b.nextFollowUp && new Date(b.nextFollowUp) < now ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      if (b.clarityScore !== a.clarityScore) return b.clarityScore - a.clarityScore;
      const aLast = a.lastContactAt ? new Date(a.lastContactAt).getTime() : 0;
      const bLast = b.lastContactAt ? new Date(b.lastContactAt).getTime() : 0;
      if (aLast !== bLast) return aLast - bLast;
      const aNext = a.nextFollowUp ? new Date(a.nextFollowUp).getTime() : Infinity;
      const bNext = b.nextFollowUp ? new Date(b.nextFollowUp).getTime() : Infinity;
      return aNext - bNext;
    })
    .slice(0, 3);
}

export default function Home() {
  const [completedIds, setCompletedIds] = useState(new Set());
  const [snoozedIds, setSnoozedIds] = useState(new Set());
  const [sheetCustomer, setSheetCustomer] = useState(null);
  const [exitingId, setExitingId] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const queue = getSmartQueue(mockCustomers, completedIds, snoozedIds);
  const focusCustomer = queue[0] || null;
  const radarCustomers = queue.slice(1, 3);

  const handleAction = useCallback((customer) => {
    setSheetCustomer(customer);
  }, []);

  const handleComplete = useCallback((data) => {
    setSheetCustomer(null);
    setExitingId(data.customerId);
    setTimeout(() => {
      setCompletedIds((prev) => new Set([...prev, data.customerId]));
      setExitingId(null);
    }, 350);
  }, []);

  const handleSnooze = useCallback((customer) => {
    setExitingId(customer.id);
    setTimeout(() => {
      setSnoozedIds((prev) => new Set([...prev, customer.id]));
      setExitingId(null);
    }, 350);
  }, []);

  const totalActive = mockCustomers.filter((c) => !['Closed', 'Lost'].includes(c.status)).length;
  const todayCount = queue.length;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="pt-safe px-6 pt-6 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white">Hôm nay</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {todayCount > 0
                ? `${todayCount} khách hàng cần chăm sóc`
                : 'Không có khách cần xử lý'}
            </p>
          </div>
          <button className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center relative">
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">{todayCount}</span>
          </button>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2 mt-4">
          <div className="px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold">
            🔥 {mockCustomers.filter(c => c.heatLevel === 'Hot').length} nóng
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            🌡️ {mockCustomers.filter(c => c.heatLevel === 'Warm').length} ấm
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Tổng: {totalActive} khách
          </div>
        </div>
      </header>

      {/* Main Queue */}
      <main className="px-5 pt-5 max-w-lg mx-auto">
        {todayCount === 0 ? (
          <InboxZero />
        ) : (
          <div className="space-y-4">
            {/* Focus Card */}
            {focusCustomer && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">
                  ⚡ Ưu tiên số 1
                </p>
                <FocusCard
                  customer={focusCustomer}
                  onAction={handleAction}
                  onSnooze={handleSnooze}
                  animClass={exitingId === focusCustomer.id ? 'animate-fade-out-left' : 'animate-fade-in-up'}
                />
              </div>
            )}

            {/* Radar Cards */}
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
                      onClick={handleAction}
                      animClass={exitingId === c.id ? 'animate-fade-out-left' : ''}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FAB - Add Customer */}
      <div className="fixed bottom-20 right-5 z-30">
        <button className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/30 flex items-center justify-center active:scale-90 transition-transform">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Completion Sheet */}
      <CompletionSheet
        isOpen={!!sheetCustomer}
        customer={sheetCustomer}
        onComplete={handleComplete}
        onClose={() => setSheetCustomer(null)}
      />
    </div>
  );
}
