"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Check, Phone } from 'lucide-react';

function getQuickDates() {
  const now = new Date();
  const hour = now.getHours();
  const chips = [];

  if (hour < 14) {
    const afternoon = new Date(now);
    afternoon.setHours(15, 0, 0, 0);
    chips.push({ label: 'Chiều nay', date: afternoon });
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  chips.push({ label: 'Sáng mai', date: tomorrow });

  const in3days = new Date(now);
  in3days.setDate(in3days.getDate() + 3);
  in3days.setHours(9, 0, 0, 0);
  chips.push({ label: '3 ngày nữa', date: in3days });

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);
  chips.push({ label: 'Tuần sau', date: nextWeek });

  return chips;
}

export default function CompletionSheet({ isOpen, customer, onComplete, onClose }) {
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [sliderX, setSliderX] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const trackRef = useRef(null);
  const textareaRef = useRef(null);
  const quickDates = getQuickDates();

  useEffect(() => {
    if (isOpen) {
      setNote('');
      setSelectedDate(null);
      setSliderX(0);
      setIsCompleting(false);
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }, [isOpen, customer?.id]);

  if (!isOpen || !customer) return null;

  const trackWidth = trackRef.current?.offsetWidth || 300;
  const thumbSize = 56;
  const maxX = trackWidth - thumbSize - 8;
  const progress = maxX > 0 ? sliderX / maxX : 0;

  const handleThumbTouchStart = (e) => {
    e.stopPropagation();
    const startX = e.touches[0].clientX;
    const startSlider = sliderX;

    const move = (ev) => {
      const dx = ev.touches[0].clientX - startX;
      const newX = Math.max(0, Math.min(maxX, startSlider + dx));
      setSliderX(newX);
    };

    const end = () => {
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
      if (progress >= 0.8) {
        setIsCompleting(true);
        setSliderX(maxX);
        setTimeout(() => {
          onComplete?.({
            customerId: customer.id,
            note,
            nextFollowUp: selectedDate?.toISOString() || null,
          });
        }, 300);
      } else {
        setSliderX(0);
      }
    };

    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('touchend', end);
  };

  const handleClickComplete = () => {
    setIsCompleting(true);
    setSliderX(maxX);
    setTimeout(() => {
      onComplete?.({
        customerId: customer.id,
        note,
        nextFollowUp: selectedDate?.toISOString() || null,
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ghi chú nhanh</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{customer.name} - {customer.phone}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-5">
            <a href={`tel:${customer.phone?.replace(/\s/g, '')}`} className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 py-2 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border border-emerald-100 dark:border-emerald-500/20">
              <Phone className="w-3.5 h-3.5 fill-current" /> Gọi điện
            </a>
            <a href={`https://zalo.me/${customer.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 text-blue-600 dark:text-blue-400 py-2 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border border-blue-100 dark:border-blue-500/20">
              Zalo
            </a>
          </div>

          {/* Note Input */}
          <div className="relative mb-5">
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Khách bảo tuần sau vợ lên xem lại rồi chốt..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
            <button className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform" title="Thu âm">
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Chips */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wide">📅 Chăm tiếp khi nào?</p>
            <div className="flex gap-2 flex-wrap">
              {quickDates.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setSelectedDate(selectedDate?.getTime() === chip.date.getTime() ? null : chip.date)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedDate?.getTime() === chip.date.getTime()
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Swipe to Complete */}
          <div
            ref={trackRef}
            className={`swipe-track relative h-16 rounded-full transition-colors duration-300 ${
              isCompleting
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-primary-500 to-primary-600'
            }`}
          >
            {/* Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`text-sm font-bold text-white/80 transition-opacity ${progress > 0.3 ? 'opacity-0' : 'opacity-100'}`}>
                {isCompleting ? '✅ Hoàn thành!' : '→→→ Vuốt để hoàn thành'}
              </span>
            </div>

            {/* Thumb */}
            {!isCompleting && (
              <div
                className="absolute top-1 left-1 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-none"
                style={{ transform: `translateX(${sliderX}px)` }}
                onTouchStart={handleThumbTouchStart}
                onClick={handleClickComplete}
              >
                <Check className="w-6 h-6 text-primary-500" strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
