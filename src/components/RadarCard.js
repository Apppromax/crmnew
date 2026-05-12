"use client";

import React, { useRef } from 'react';
import { Clock } from 'lucide-react';

const heatConfig = {
  "Rất Nét": { emoji: '🔥', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  "Tiềm Năng": { emoji: '🌡️', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  "Quan Tâm": { emoji: '🌡️', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  "Tham Khảo": { emoji: '❄️', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400' },
  "Chưa Rõ": { emoji: '❄️', bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400' },
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

export default function RadarCard({ customer, onClick, onSnooze }) {
  const heat = heatConfig[customer.heatLevel] || heatConfig["Chưa Rõ"];

  const cardRef = useRef(null);
  const dragState = useRef({ startX: null, startY: null, currentX: 0, isSwiping: null });

  const handleStart = (clientX, clientY) => {
    dragState.current.startX = clientX;
    dragState.current.startY = clientY;
    dragState.current.currentX = 0;
    dragState.current.isSwiping = null;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
      cardRef.current.style.cursor = 'grabbing';
    }
  };
  const handleMove = (clientX, clientY) => {
    if (dragState.current.startX === null) return;
    
    const deltaX = clientX - dragState.current.startX;
    const deltaY = clientY - dragState.current.startY;

    // Lock axis on first move (wait for 5px movement)
    if (dragState.current.isSwiping === null) {
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragState.current.isSwiping = Math.abs(deltaX) > Math.abs(deltaY);
      } else {
        return;
      }
    }

    // Abort if vertically scrolling
    if (dragState.current.isSwiping === false) return;

    dragState.current.currentX = deltaX;
    if (cardRef.current) {
      // Direct DOM manipulation for 60fps
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.03}deg)`;
      cardRef.current.style.opacity = Math.abs(deltaX) > 50 ? 0.5 : 1;
    }
  };
  const handleEnd = () => {
    if (dragState.current.startX === null) return;
    const deltaX = dragState.current.currentX;
    const isSwiping = dragState.current.isSwiping;
    
    dragState.current.startX = null;
    dragState.current.currentX = 0;
    dragState.current.isSwiping = null;
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      cardRef.current.style.cursor = 'pointer';
      
      if (isSwiping && deltaX < -80) {
        cardRef.current.style.transform = `translateX(-150%) rotate(-15deg)`;
        cardRef.current.style.opacity = '0';
        setTimeout(() => {
          if (onSnooze) onSnooze(customer);
        }, 150);
      } else if (isSwiping && deltaX > 80) {
        cardRef.current.style.transform = `translateX(150%) rotate(15deg)`;
        cardRef.current.style.opacity = '0';
        setTimeout(() => {
          onClick?.(customer);
        }, 150);
      } else {
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '1';
        if (deltaX === 0) {
          onClick?.(customer);
        }
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className={`glass rounded-2xl p-4 select-none cursor-pointer transition-all`}
      style={{ touchAction: 'pan-y' }}
      // Touch events
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      // Mouse events for Desktop
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={() => handleEnd()}
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
