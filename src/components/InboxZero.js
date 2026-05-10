"use client";

import React from 'react';

export default function InboxZero() {
  return (
    <div className="animate-celebration flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-7xl mb-6">🎉</div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
        Tuyệt vời!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
        Bạn đã chăm sóc hết khách hàng cần xử lý hôm nay. Nghỉ ngơi hoặc kiểm tra kho khách nhé!
      </p>
      <div className="mt-8 flex gap-3">
        <div className="px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-semibold">
          0 khách chờ
        </div>
      </div>
    </div>
  );
}
