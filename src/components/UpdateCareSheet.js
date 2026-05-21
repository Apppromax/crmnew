"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Check, Phone, ArrowRight, Activity, Calendar, Square } from 'lucide-react';

function getQuickDates() {
  const now = new Date();
  const hour = now.getHours();
  const chips = [];

  if (hour < 14) {
    const afternoon = new Date(now);
    afternoon.setHours(15, 0, 0, 0);
    chips.push({ label: 'Chiều nay', date: afternoon });
  } else {
    const tonight = new Date(now);
    tonight.setHours(20, 0, 0, 0);
    chips.push({ label: 'Tối nay', date: tonight });
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  chips.push({ label: 'Sáng mai', date: tomorrow });

  const tomorrowAfternoon = new Date(now);
  tomorrowAfternoon.setDate(tomorrowAfternoon.getDate() + 1);
  tomorrowAfternoon.setHours(15, 0, 0, 0);
  chips.push({ label: 'Chiều mai', date: tomorrowAfternoon });

  const in3days = new Date(now);
  in3days.setDate(in3days.getDate() + 3);
  in3days.setHours(9, 0, 0, 0);
  chips.push({ label: '3 ngày nữa', date: in3days });

  return chips;
}

const LOCAL_JOURNEY_OPTIONS = [
  "1. Phá băng và tư vấn ban đầu",
  "2. Tư vấn chuyên sâu lần 1",
  "3. Xây dựng lòng tin",
  "4. Hẹn gặp khách",
  "5. Dồn Chốt",
  "6. Chốt Cọc",
  "7. Xây dựng mối quan hệ"
];

const LOCAL_JOURNEY_DETAILS = {
  "1. Phá băng và tư vấn ban đầu": { actions: ["Gọi điện làm quen", "Gửi tin nhắn gợi mở nhu cầu", "Hỏi thêm về khu vực/tài chính", "Gửi 1-2 dự án mẫu để đo lường phản ứng"] },
  "2. Tư vấn chuyên sâu lần 1": { actions: ["Gửi thông tin chi tiết dự án", "Làm bảng tính dòng tiền", "Gửi video/hình ảnh thực tế", "Phân tích ưu/nhược điểm so với đối thủ"] },
  "3. Xây dựng lòng tin": { actions: ["Chia sẻ các case study thành công", "Gửi thông tin uy tín của CĐT", "Cập nhật tiến độ dự án hàng tuần", "Hỏi thăm cá nhân/Tặng quà nhỏ"] },
  "4. Hẹn gặp khách": { actions: ["Lên lịch hẹn xem nhà mẫu", "Gọi điện chốt lịch hẹn", "Gửi vị trí định vị/hướng dẫn đường đi", "Gợi ý đưa đón khách"] },
  "5. Dồn chốt": { actions: ["Gọi điện hỏi thăm cảm nhận sau khi xem", "Đưa ra giải pháp thay thế (căn khác/dự án khác)", "Gửi chính sách thanh toán giãn tiến độ", "Hỗ trợ check CIC/ngân hàng", "Tạo khan hiếm căn đẹp"] },
  "6. Chốt cọc": { actions: ["Soạn thảo hợp đồng cọc", "Hướng dẫn thủ tục ngân hàng", "Chúc mừng và xin feedback"] },
  "7. Xây dựng mối quan hệ": { actions: ["Xin lời giới thiệu khách hàng mới (Referral)", "Mời tham gia event tri ân", "Cập nhật tiến độ xây dựng", "Hỗ trợ tìm khách thuê"] }
};

export default function UpdateCareSheet({ isOpen, customer, onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [note, setNote] = useState('');
  const [journeyStage, setJourneyStage] = useState('');
  const [journeyProgress, setJourneyProgress] = useState(null); // 'Nguội đi', 'Giữ nguyên', 'Lên mốc'
  const [statusAction, setStatusAction] = useState(null); // 'Chưa liên lạc được' | 'Đã Tư Vấn'
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [nextAction, setNextAction] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [prevCustomerId, setPrevCustomerId] = useState(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const textareaRef = useRef(null);
  const quickDates = getQuickDates();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setNote(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói (khuyên dùng Chrome/Safari).");
      }
    }
  };
  if (isOpen !== prevIsOpen || (customer && customer.id !== prevCustomerId)) {
    setPrevIsOpen(isOpen);
    setPrevCustomerId(customer ? customer.id : null);
    if (isOpen && customer) {
      setStep(1);
      setNote('');
      setJourneyStage(customer.journeyStage || LOCAL_JOURNEY_OPTIONS[0]);
      setJourneyProgress(null);
      setStatusAction(null);
      setSelectedDate(null);
      setNextAction('');
      setIsCompleting(false);
    }
  }

  useEffect(() => {
    if (isOpen && customer) {
      const isNew = customer.status === 'Mới' || customer.status === 'Chưa liên lạc được';
      if (!isNew) {
        const t = setTimeout(() => textareaRef.current?.focus(), 400);
        return () => clearTimeout(t);
      }
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const isNewOrUnreachable = customer.status === 'Mới' || customer.status === 'Chưa liên lạc được';

  const handleNextStep = (action) => {
    if (action) {
      setStatusAction(action);
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleProgressClick = (progress) => {
    setJourneyProgress(progress);
    if (progress === 'Lên mốc') {
      const currentIndex = LOCAL_JOURNEY_OPTIONS.findIndex(s => s.startsWith((journeyStage || "1.").split(".")[0]));
      if (currentIndex >= 0 && currentIndex < LOCAL_JOURNEY_OPTIONS.length - 1) {
        setJourneyStage(LOCAL_JOURNEY_OPTIONS[currentIndex + 1]);
      }
    }
  };

  const handleComplete = () => {
    setIsCompleting(true);
    // Fire callback immediately — no artificial delay. Animation runs in parallel.
    onComplete?.({
      customerId: customer.id,
      note,
      nextFollowUp: selectedDate?.toISOString() || null,
      status: statusAction === 'Chưa liên lạc được' ? 'Chưa liên lạc được' : (statusAction === 'Đã Tư Vấn' ? 'Đang chăm' : undefined),
      journeyStage: isNewOrUnreachable ? undefined : journeyStage,
      journeyProgress: isNewOrUnreachable ? undefined : journeyProgress,
      nextAction,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="px-5 pb-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Cập nhật chăm khách</h3>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">{customer.name} - {customer.phone}</p>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <a 
                  href={customer.phone ? `tel:${customer.phone.replace(/[^0-9+]/g, '')}` : '#'} 
                  onClick={(e) => {
                    if (!customer.phone) {
                      e.preventDefault();
                      alert('Khách hàng này chưa có số điện thoại!');
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center gap-1.5 font-bold text-xs border border-emerald-100 dark:border-emerald-500/20"
                >
                  <Phone className="w-3 h-3 fill-current" /> Gọi điện
                </a>
                <a 
                  href={customer.phone ? `https://zalo.me/${customer.phone.replace(/[^0-9]/g, '').replace(/^84/, '0')}` : '#'} 
                  target={customer.phone ? "_blank" : "_self"}
                  rel="noopener noreferrer" 
                  onClick={(e) => {
                    if (!customer.phone) {
                      e.preventDefault();
                      alert('Khách hàng này chưa có số điện thoại!');
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs border border-blue-100 dark:border-blue-500/20"
                >
                  Nhắn Zalo
                </a>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {isNewOrUnreachable ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Trạng thái hiện tại: <strong className="text-slate-900 dark:text-white">{customer.status}</strong></p>
                  
                  <button 
                    onClick={() => handleNextStep('Đã Tư Vấn')}
                    className="w-full py-5 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 flex flex-col items-center justify-center gap-1 hover:bg-primary-100 transition-colors active:scale-95"
                  >
                    <Check className="w-8 h-8 text-primary-500 mb-1" />
                    <span className="font-bold text-lg">Đã Tư Vấn</span>
                    <span className="text-xs opacity-80">Chuyển sang Đang Chăm</span>
                  </button>

                  <button 
                    onClick={() => handleNextStep('Chưa liên lạc được')}
                    className="w-full py-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center gap-1 hover:bg-amber-100 transition-colors active:scale-95"
                  >
                    <Phone className="w-8 h-8 text-amber-500 mb-1 opacity-50" />
                    <span className="font-bold text-lg">Chưa Liên Lạc Được</span>
                    <span className="text-xs opacity-80">Gọi không bắt máy / Thuê bao</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Nội dung chăm sóc</label>
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Khách phản hồi như thế nào? Cần note lại ý gì quan trọng?"
                        rows={6}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                      />
                      <button 
                        onClick={toggleListening}
                        className={`absolute bottom-3 right-3 w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 transition-transform ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary-500'}`}
                      >
                        {isListening ? <Square className="w-3.5 h-3.5" fill="currentColor" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNextStep()}
                    disabled={!note.trim()}
                    className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                  >
                    Tiếp tục đánh giá <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && !isNewOrUnreachable && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Đánh giá khách hàng</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleProgressClick('Nguội đi')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${journeyProgress === 'Nguội đi' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    ❄️ Nguội đi
                  </button>
                  <button
                    onClick={() => handleProgressClick('Giữ nguyên')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${journeyProgress === 'Giữ nguyên' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    ➖ Giữ nguyên
                  </button>
                  <button
                    onClick={() => handleProgressClick('Lên mốc')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${journeyProgress === 'Lên mốc' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    🔥 Lên mốc
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Tiến độ hành trình</label>
                <select
                  value={journeyStage}
                  onChange={(e) => setJourneyStage(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all appearance-none"
                >
                  {LOCAL_JOURNEY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!journeyProgress}
                  className="flex-1 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                >
                  Tiếp tục lên lịch <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 mb-3">
                  <Calendar className="w-4 h-4" /> Hẹn giờ chăm tiếp theo
                </label>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-2 -mx-1 px-1">
                  {quickDates.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => setSelectedDate(selectedDate?.getTime() === chip.date.getTime() ? null : chip.date)}
                      className={`shrink-0 whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        selectedDate?.getTime() === chip.date.getTime()
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    value={selectedDate ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${selectedDate ? 'text-slate-900 dark:text-white' : 'text-transparent'}`}
                  />
                  {!selectedDate && (
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 font-medium">
                      Chọn ngày giờ...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 mb-3">
                  <Activity className="w-4 h-4" /> Đề xuất hành động tiếp theo
                </label>
                <select
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 text-sm font-semibold text-primary-700 dark:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all appearance-none mb-2"
                >
                  <option value="">-- Chọn hành động (Tùy chọn) --</option>
                  {(LOCAL_JOURNEY_DETAILS[journeyStage]?.actions || []).map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
                <input 
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="Hoặc tự nhập hành động tiếp theo..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(isNewOrUnreachable ? 1 : 2)}
                  className="px-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isCompleting || !selectedDate}
                  className={`flex-1 py-4 rounded-2xl text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                    isCompleting
                      ? 'bg-emerald-500 shadow-emerald-500/25 scale-95'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-500/25 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100'
                  }`}
                >
                  {isCompleting ? (
                    <>✅ Đã lưu thành công!</>
                  ) : (
                    <><Check className="w-5 h-5" /> Hoàn tất lưu</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
