"use client";

import React from 'react';
import { Clock } from 'lucide-react';

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

export default function RadarCard({ customer, onClick, onSnooze, animClass = '' }) {
  const heat = heatConfig[customer.heatLevel] || heatConfig.Cold;

  const [startX, setStartX] = useState(null);
  const [deltaX, setDeltaX] = useState(0);
  const dragging = startX !== null;

  const handleStart = (clientX) => setStartX(clientX);
  const handleMove = (clientX) => {
    if (startX === null) return;
    const d = clientX - startX;
    setDeltaX(d); // Allow both left and right swipe
  };
  const handleEnd = () => {
    if (deltaX < -80) {
      if (onSnooze) onSnooze(customer);
    } else if (deltaX > 80) {
      onClick?.(customer); // Using onClick to open the action modal for RadarCard
    } else if (deltaX === 0) {
      // If no drag, treat as click
      onClick?.(customer);
    }
    setStartX(null);
    setDeltaX(0);
  };

  return (
    <div
      className={`glass rounded-2xl p-4 select-none ${animClass} ${dragging ? 'cursor-grabbing' : 'cursor-pointer'} transition-all`}
      style={{
        transform: deltaX !== 0 ? `translateX(${deltaX}px) rotate(${deltaX * 0.03}deg)` : undefined,
        opacity: Math.abs(deltaX) > 50 ? 0.5 : 1,
        transition: dragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
      }}
      // Touch events
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      // Mouse events for Desktop
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={() => { if (dragging) handleEnd() }}
    >
      <div className="flex items-center gap-3 mb-3 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {customer.name?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{customer.name}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{customer.phone}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pointer-events-none">
        <div className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${heat.bg} ${heat.text} flex items-center gap-1`}>
          <span>{heat.emoji}</span> {customer.heatLevel}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Clock className="w-3 h-3" />
          <span className="font-medium">{formatFollowUp(customer.nextFollowUp)}</span>
        </div>
      </div>
    </div>
  );
}
