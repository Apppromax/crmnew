"use client";

import React from 'react';

const heatConfig = {
  Hot:  { emoji: '🔥', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  Warm: { emoji: '🌡️', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  Cold: { emoji: '❄️', bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400' },
};

function formatFollowUp(dateStr) {
  if (!dateStr) return 'Chưa hẹn';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const absH = Math.abs(Math.round(diffMs / 3600000));
  const absD = Math.abs(Math.round(diffMs / 86400000));
  if (diffMs < 0) return absD >= 1 ? `Lỡ ${absD} ngày` : `Lỡ ${absH}h`;
  if (absH < 1) return 'Sắp tới';
  if (absH < 24) return `${absH}h nữa`;
  return `${absD} ngày nữa`;
}

export default function RadarCard({ customer, onClick, animClass = '' }) {
  const heat = heatConfig[customer.heatLevel] || heatConfig.Cold;

  return (
    <div
      onClick={() => onClick?.(customer)}
      className={`glass rounded-2xl p-4 cursor-pointer active:scale-[0.97] transition-all duration-200 ${animClass}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {customer.name?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{customer.name}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{customer.phone}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${heat.bg} ${heat.text} flex items-center gap-1`}>
          <span>{heat.emoji}</span> {customer.heatLevel}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{formatFollowUp(customer.nextFollowUp)}</span>
        </div>
      </div>
    </div>
  );
}
