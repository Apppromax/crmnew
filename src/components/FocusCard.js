"use client";

import React, { useRef } from 'react';
import { Phone, Flame, ThermometerSun, Snowflake, Lightbulb, ClipboardList, PenLine, ArrowLeft, Clock } from 'lucide-react';

const heatConfig = {
  "Rất Nét": { icon: Flame, label: 'Rất Nét', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
  "Tiềm Năng": { icon: ThermometerSun, label: 'Tiềm Năng', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20' },
  "Quan Tâm": { icon: ThermometerSun, label: 'Quan Tâm', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  "Tham Khảo": { icon: Snowflake, label: 'Tham Khảo', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  "Chưa Rõ": { icon: Snowflake, label: 'Chưa Rõ', bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20' },
};

// Journey options for UI logic if needed
const JOURNEY_OPTIONS = [
  "1. Phá băng và tư vấn ban đầu",
  "2. Tư vấn chuyên sâu lần 1",
  "3. Xây dựng lòng tin",
  "4. Hẹn gặp khách",
  "5. Dồn Chốt",
  "6. Chốt Cọc",
  "7. Xây dựng mối quan hệ"
];

const statusDot = {
  New: 'bg-blue-500', Active: 'bg-emerald-500', Waiting: 'bg-amber-500',
  Dormant: 'bg-slate-400', Closed: 'bg-teal-500', Lost: 'bg-red-500',
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
  if (absH < 24) {
    const t = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${t} hôm nay`;
  }
  return `${absD} ngày nữa`;
}

export default function FocusCard({ customer, onAction, onSnooze }) {
  const heat = heatConfig[customer.heatLevel] || heatConfig["Chưa Rõ"];
  const stage = (customer.journeyStage || "1. Phá băng").split(". ")[1] || customer.journeyStage;
  const dot = statusDot[customer.status] || 'bg-slate-400';

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
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.06}deg) scale(${1 - Math.abs(deltaX) * 0.0005})`;
      cardRef.current.style.opacity = Math.abs(deltaX) > 80 ? 0.5 : 1;
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
      cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
      cardRef.current.style.cursor = 'grab';
      
      if (isSwiping && deltaX < -100) {
        cardRef.current.style.transform = `translateX(-150%) rotate(-15deg)`;
        cardRef.current.style.opacity = '0';
        setTimeout(() => onSnooze?.(customer), 150);
      } else if (isSwiping && deltaX > 100) {
        cardRef.current.style.transform = `translateX(150%) rotate(15deg)`;
        cardRef.current.style.opacity = '0';
        setTimeout(() => onAction?.(customer), 150);
      } else {
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '1';
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className={`glass rounded-3xl overflow-hidden select-none cursor-grab`}
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
      {/* Top: Avatar + Name + Heat Badge */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-primary-500/20">
              {customer.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-white leading-tight">{customer.name}</h3>
              <a href={`tel:${customer.phone?.replace(/\s/g, '')}`} className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <Phone className="w-3.5 h-3.5" />
                {customer.phone}
              </a>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border shrink-0 ${
              customer.nextFollowUp && new Date(customer.nextFollowUp) < new Date() 
                ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20' 
                : 'text-slate-500 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-800/50 dark:border-slate-800'
            }`}>
            <Clock className="w-3 h-3" />
            <span>{formatFollowUp(customer.nextFollowUp)}</span>
          </div>
        </div>
      </div>

      {/* Reason + Next Step */}
      <div className="px-5 pb-3 space-y-2.5">
        <div className="flex items-start gap-2 text-sm">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-slate-600 dark:text-slate-300 leading-snug">{customer.reason}</p>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <ClipboardList className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
          <p className="text-primary-600 dark:text-primary-400 font-semibold leading-snug">{customer.nextStep}</p>
        </div>
      </div>

      {/* Journey Progress Bar */}
      <div className="px-5 pb-4">
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Hành trình</p>
            <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 truncate">
              {stage}
            </span>
          </div>
          <div className="flex h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden gap-0.5">
            {JOURNEY_OPTIONS.map((_, idx) => {
              const currentIdx = Math.max(0, JOURNEY_OPTIONS.findIndex(s => s.startsWith((customer.journeyStage || "1.").split(".")[0])));
              const opacities = ['opacity-20', 'opacity-30', 'opacity-40', 'opacity-60', 'opacity-80', 'opacity-90', 'opacity-100'];
              return (
                <div 
                  key={idx} 
                  className={`h-full flex-1 ${idx <= currentIdx ? 'bg-primary-500 ' + (opacities[idx] || 'opacity-100') : 'bg-transparent'}`}
                />
              );
            })}
          </div>
        </div>
      </div>



      {/* Action Button */}
      <div className="px-5 pb-5 pt-2 flex gap-2">
        <button
          onClick={() => onAction?.(customer)}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <PenLine className="w-4 h-4" />
          Cập nhật trạng thái
        </button>
        <a href={customer.phone ? `tel:${customer.phone.replace(/[^0-9+]/g, '')}` : '#'} onClick={(e) => e.stopPropagation()} className="w-12 h-[52px] shrink-0 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center transition-all">
          <Phone className="w-5 h-5 fill-current" />
        </a>
        <a 
          href={customer.phone ? `https://zalo.me/${customer.phone.replace(/[^0-9]/g, '').replace(/^84/, '0')}` : '#'} 
          target={customer.phone ? "_blank" : "_self"} 
          rel="noopener noreferrer" 
          onClick={(e) => {
            e.stopPropagation();
            if (!customer.phone) {
              e.preventDefault();
              alert('Khách hàng này chưa có số điện thoại!');
            }
          }} 
          className="w-12 h-[52px] shrink-0 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center transition-all font-black text-[11px]"
        >
          Zalo
        </a>
      </div>

      {/* Swipe Hint */}
      <div className="text-center pb-3 -mt-1 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500 gap-2">
        <div className="flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          <span>Tạm hoãn</span>
        </div>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
        <div className="flex items-center gap-1">
          <span>Cập nhật</span>
          <ArrowLeft className="w-3 h-3 rotate-180" />
        </div>
      </div>
    </div>
  );
}
