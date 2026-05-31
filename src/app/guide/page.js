"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Sparkles, BrainCircuit, Users, Target, Clock, 
  Calendar, CheckCircle2, ChevronRight, Play, BookOpen, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, ShieldAlert, Award, ArrowRight, Flame, BarChart3, TrendingUp, AlertTriangle, ShieldCheck, UserCheck, Mail, Phone, PhoneCall, Check, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function GuidePage() {
  const router = useRouter();

  // --- CHAPTER 1: Smart Update States ---
  const [formStep, setFormStep] = useState(0); // 0: Basic info, 1: Nhu cầu, 2: Hành trình, 3: Success
  const [selectedSource, setSelectedSource] = useState("Facebook");
  const [selectedBudget, setSelectedBudget] = useState("2 - 3 tỷ");
  const [selectedType, setSelectedType] = useState("Căn hộ chung cư");
  const [selectedTimeline, setSelectedTimeline] = useState("Mua ngay (trong tháng)");

  // --- CHAPTER 2: Team Dashboard States ---
  const [teamHoveredFeature, setTeamHoveredFeature] = useState(null); // 'needs', 'deals', 'risks', 'perf'

  // --- CHAPTER 3: AI Coach States ---
  const [selectedCoachAction, setSelectedCoachAction] = useState(null); // id of action to show AI advisor speech

  const coachRecommendations = [
    { id: "action1", name: "Ngô Quốc Mai", status: "Rủi ro cao", desc: "Khách đã không phản hồi 5 ngày.", suggestion: "Gọi điện ngay lập tức hỏi thăm về tiến độ pháp lý dự án Masterise.", icon: <PhoneCall className="w-3.5 h-3.5" />, btnLabel: "Gọi ngay", badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
    { id: "action2", name: "Dương Mạnh Đức", status: "Cơ hội cao", desc: "Budget phù hợp, quan tâm dự án.", suggestion: "Gửi thông tin mặt bằng tòa căn hộ mới ra mắt qua Zalo.", icon: <Mail className="w-3.5 h-3.5" />, btnLabel: "Gửi thông tin", badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    { id: "action3", name: "Võ Hoàng Bảo", status: "Cơ hội cao", desc: "Đã xem bảng giá 3 lần.", suggestion: "Đặt lịch hẹn cafe trực tiếp để tư vấn chính sách chiết khấu.", icon: <Calendar className="w-3.5 h-3.5" />, btnLabel: "Đặt lịch hẹn", badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    { id: "action4", name: "Tuấn Linh 1", status: "Chăm sóc", desc: "Đến hạn follow-up hôm nay.", suggestion: "Nhắc lịch gửi tài liệu tiến độ xây dựng mới nhất cho khách.", icon: <Clock className="w-3.5 h-3.5" />, btnLabel: "Nhắc lịch", badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 md:pb-8 md:pl-64 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors duration-300">
      
      {/* Header - Sharp & Clean Premium Styling */}
      <header className="pt-safe px-4 sm:px-6 pt-5 pb-4 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 transition-colors shadow-sm backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/")}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-950 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                <BookOpen className="w-4.5 h-4.5 text-primary-500" />
                Bí Kíp Bán Hàng 1-Chạm
              </h1>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Làm chủ SalesPush CRM trong 3 phút</p>
            </div>
          </div>
          <Link 
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-sm border border-slate-900 dark:border-white"
          >
            Vào App ngay <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-primary-500/10"
          >
            <Zap className="w-3.5 h-3.5 animate-pulse" /> SỔ TAY TÀI LIỆU SỐ
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight"
          >
            Chinh Phục <span className="bg-gradient-to-r from-primary-500 to-blue-600 bg-clip-text text-transparent">SalesPush CRM</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed"
          >
            Khám phá quy trình quản lý khách hàng thông minh bằng AI, theo dõi chỉ số đội nhóm thời gian thực và tương tác trực quan 1-Chạm mượt mà.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }} 
            className="pt-6 flex justify-center"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest animate-bounce">Cuộn xuống để khám phá</span>
              <div className="w-4 h-7 rounded-full border border-slate-300 dark:border-slate-700 flex justify-center p-0.5">
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-primary-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Showcase Chapters */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-24">
        
        {/* ========================================================
            CHƯƠNG 1: Cập nhật khách hàng thông minh (Smart Update)
            ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text / Features column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/20 px-3 py-1 rounded-lg border border-primary-500/10 inline-block">
                Chương 1
              </span>
              <h2 className="text-2xl sm:text-4.5xl font-black text-slate-900 dark:text-white leading-tight">
                Cập nhật 1 lần<br/>AI tự quản lý khách hàng
              </h2>
              <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
                Loại bỏ việc gõ phím rườm rà. Bạn chỉ cần chạm chọn các thuộc tính, hệ thống tự động ghi nhớ hành trình, đo độ nóng và nhắc chăm sóc đúng thời điểm.
              </p>
            </div>

            <hr className="border-slate-200/60 dark:border-slate-800/80" />

            {/* Steps Visual Timeline Stepper */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quy trình nhập liệu 4 bước:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { step: 0, title: "1. Thêm khách hàng", desc: "Nhập nhanh họ tên, SĐT và nguồn khách chỉ trong 2 giây." },
                  { step: 1, title: "2. Ghi nhận nhu cầu", desc: "Chọn nhanh ngân sách tài chính, loại hình BĐS và tiến độ." },
                  { step: 2, title: "3. Chọn bước hành trình", desc: "AI định vị chính xác giai đoạn đàm phán và tương tác." },
                  { step: 3, title: "4. Đặt lịch chăm tiếp", desc: " CRM nhắc hẹn đúng ngày giờ, bảo mật thông tin tối đa." }
                ].map((item) => (
                  <button 
                    key={item.step}
                    onClick={() => setFormStep(item.step)}
                    className={`text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden active:scale-98 cursor-pointer ${
                      formStep === item.step 
                        ? "bg-white dark:bg-slate-900 border-primary-500 shadow-md shadow-primary-500/5" 
                        : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                    }`}
                  >
                    {formStep === item.step && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                    )}
                    <h3 className={`font-bold text-xs ${formStep === item.step ? "text-primary-600 dark:text-primary-400" : "text-slate-800 dark:text-slate-200"}`}>
                      {item.title}
                    </h3>
                    <p className="text-[10.5px] text-slate-450 dark:text-slate-500 mt-1 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick simulated controls explanation */}
            <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/40 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 animate-pulse" />
              <p className="text-[11px] text-slate-500 dark:text-slate-450 font-semibold">
                 Hãy click thử các bước giới thiệu ở trên để xem màn hình điện thoại bên cạnh tương tác thay đổi trực tiếp!
              </p>
            </div>
          </div>

          {/* Right Mobile Form Mockup column */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            
            {/* Visual Phone Frame Wrapper */}
            <div className="relative w-[280px] sm:w-[310px] aspect-[9/19] rounded-[44px] bg-slate-950 border-[7px] border-slate-800/90 shadow-2xl p-1.5 overflow-hidden ring-4 ring-slate-800/20 transition-all select-none">
              
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800/90 rounded-b-xl z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-black/60 mr-1.5" />
                <div className="w-10 h-1 bg-slate-950 rounded-full" />
              </div>

              {/* Status Bar inside screen */}
              <div className="absolute top-4 inset-x-0 px-6 flex justify-between items-center text-[10px] font-bold text-slate-500 z-20">
                <span>16:02</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-slate-400 rounded-xs p-0.2"><div className="h-full bg-slate-500 w-3/4 rounded-3xs" /></div>
                </div>
              </div>

              {/* Simulated Screen Container */}
              <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-slate-50 dark:bg-slate-900 flex flex-col pt-9 pb-4 px-3.5 transition-colors duration-300">
                
                {/* Form header inside iPhone */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-slate-800 shrink-0">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-primary-500" />
                    Thêm khách hàng
                  </h3>
                  <button className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[8px] flex items-center justify-center font-bold text-slate-505">✕</button>
                </div>

                {/* Form Content Steps Body */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3.5 custom-scrollbar relative">
                  <AnimatePresence mode="wait">
                    
                    {/* Step 0: Basic Info Form */}
                    {formStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3.5"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400 block">Họ và tên *</label>
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
                            A Hùng
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400 block">Số điện thoại *</label>
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-2xs">
                            09864326656
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400 block">Nguồn khách</label>
                          <div className="flex gap-1.5">
                            {["Facebook", "Zalo", "Tự khai thác"].map((src) => (
                              <button
                                key={src}
                                onClick={() => setSelectedSource(src)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all ${
                                  selectedSource === src
                                    ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {src}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Financial & Demand */}
                    {formStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3.5"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400 block">Phân khúc tài chính</label>
                          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                            {["Dưới 2 tỷ", "2 - 3 tỷ", "3 - 5 tỷ"].map((b) => (
                              <button
                                key={b}
                                onClick={() => setSelectedBudget(b)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black border shrink-0 transition-all ${
                                  selectedBudget === b
                                    ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400 block">Loại hình quan tâm</label>
                          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                            {["Căn hộ chung cư", "Nhà phố / Liền kề"].map((t) => (
                              <button
                                key={t}
                                onClick={() => setSelectedType(t)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black border shrink-0 transition-all ${
                                  selectedType === t
                                    ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400 block">Thời gian dự kiến mua</label>
                          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                            {["Mua ngay (trong tháng)", "Đang tìm hiểu"].map((tm) => (
                              <button
                                key={tm}
                                onClick={() => setSelectedTimeline(tm)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black border shrink-0 transition-all ${
                                  selectedTimeline === tm
                                    ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {tm}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Journey & Scheduling */}
                    {formStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3.5"
                      >
                        <div className="space-y-1 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xs">
                          <h4 className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Tiến độ hành trình</h4>
                          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                            <span>3. Xây dựng lòng tin</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>

                        <div className="space-y-1 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xs">
                          <h4 className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Hẹn giờ chăm tiếp theo</h4>
                          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary-500" />
                              Sáng mai • 09:00
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-500/10">Đã chọn</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Saved Success State */}
                    {formStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                        className="h-full flex flex-col items-center justify-center text-center py-6 space-y-4"
                      >
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white animate-bounce">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Đã lưu & Đặt lịch</h4>
                          <p className="text-[10px] text-slate-450 dark:text-slate-505 font-semibold max-w-[160px] mx-auto leading-relaxed">
                            Lịch nhắc hẹn chăm tiếp theo tự động kích hoạt vào:
                          </p>
                          <div className="inline-block px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold text-[10.5px] mt-2">
                            09:00 - 31/05/2026
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Form Bottom Interactive Button */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 shrink-0">
                  {formStep < 3 ? (
                    <button 
                      onClick={() => setFormStep(prev => prev + 1)}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-black rounded-xl active:scale-95 transition-all shadow-md shadow-primary-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {formStep === 2 ? "Xác nhận & Lưu" : "Tiếp tục thiết lập"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setFormStep(0)}
                      className="w-full py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[11px] font-black rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} /> Nhập lại từ đầu
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Quick Features Row at the bottom of Section */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-[340px] mt-6">
              {[
                { label: "Theo dõi", icon: <Target className="w-4 h-4" />, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
                { label: "Độ nóng", icon: <Flame className="w-4 h-4" />, color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
                { label: "Nhắc nhở", icon: <Clock className="w-4 h-4" />, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
                { label: "Đẩy khách", icon: <TrendingUp className="w-4 h-4" />, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" }
              ].map((iconItem, i) => (
                <div key={i} className="flex flex-col items-center text-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                  <div className={`p-1.5 rounded-lg ${iconItem.color} mb-1 shrink-0`}>
                    {iconItem.icon}
                  </div>
                  <span className="text-[8.5px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{iconItem.label}</span>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ========================================================
            CHƯƠNG 2: Quản lý cả team trên một màn hình
            ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Simulated Desktop/Mobile Team Dashboard */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center order-2 lg:order-1">
            
            {/* Visual device wrapper - iPhone frame representation */}
            <div className="relative w-[280px] sm:w-[310px] aspect-[9/19] rounded-[44px] bg-slate-950 border-[7px] border-slate-800/90 shadow-2xl p-1.5 overflow-hidden ring-4 ring-slate-800/20 transition-all select-none">
              
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800/90 rounded-b-xl z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-black/60 mr-1.5" />
                <div className="w-10 h-1 bg-slate-950 rounded-full" />
              </div>

              {/* Status Bar */}
              <div className="absolute top-4 inset-x-0 px-6 flex justify-between items-center text-[10px] font-bold text-slate-505 z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>LTE</span>
                  <div className="w-4 h-2 border border-slate-400 rounded-xs p-0.2"><div className="h-full bg-slate-500 w-4/5 rounded-3xs" /></div>
                </div>
              </div>

              {/* Simulated Screen Body */}
              <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-slate-55 dark:bg-slate-900 flex flex-col pt-9 pb-4 px-3.5 transition-colors duration-300">
                
                {/* Header Section from Team Dashboard */}
                <div className="flex justify-between items-center pb-2.5 shrink-0">
                  <div className="text-left">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white leading-none">Dashboard Team</h3>
                    <span className="text-[7.5px] text-slate-455 dark:text-slate-500 font-bold block mt-0.5">Tổng quan hiệu suất team hôm nay</span>
                  </div>
                  
                  {/* Icons row */}
                  <div className="flex items-center gap-1 shrink-0 scale-90">
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-3xs flex items-center justify-center text-slate-550"><RefreshCw className="w-2.5 h-2.5" /></div>
                    <div className="w-7 h-7 rounded-full bg-primary-500 shadow-md text-white flex items-center justify-center text-[12px] font-black">+</div>
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-3xs flex items-center justify-center text-slate-550 relative">
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-505" />
                      <span className="text-[9px]">🔔</span>
                    </div>
                  </div>
                </div>

                {/* Sub tabs selector simulation */}
                <div className="flex gap-1 mb-2.5 shrink-0">
                  {["Tổng quan", "Nhân sự (12)", "Điều phối"].map((tabLabel, i) => (
                    <span key={i} className={`px-2 py-1 rounded-md text-[8px] font-black ${i === 0 ? 'bg-primary-500 text-white shadow-2xs' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>
                      {tabLabel}
                    </span>
                  ))}
                </div>

                {/* Simulated Widgets */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-0.5">
                  
                  {/* 4 Summary Stats row grid */}
                  <div className={`grid grid-cols-2 gap-2 p-1 border rounded-2xl transition-all duration-300 ${
                    teamHoveredFeature === 'needs' ? 'border-amber-400 bg-amber-50/10 shadow-sm scale-98' :
                    teamHoveredFeature === 'deals' ? 'border-emerald-400 bg-emerald-50/10 shadow-sm scale-98' :
                    'border-transparent'
                  }`}>
                    <div className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 relative shadow-3xs">
                      <div className="w-6.5 h-6.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center"><Flame className="w-3.5 h-3.5 fill-current" /></div>
                      <div>
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 block leading-tight">Cần chăm</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11.5px] font-black dark:text-white">44</span>
                          <span className="text-[7.5px] font-bold text-red-505">+4</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 shadow-3xs">
                      <div className="w-6.5 h-6.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">📅</div>
                      <div>
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 block leading-tight">Lịch hẹn</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11.5px] font-black dark:text-white">0</span>
                          <span className="text-[7.5px] font-bold text-blue-505">+1</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 shadow-3xs">
                      <div className="w-6.5 h-6.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">🎯</div>
                      <div>
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 block leading-tight">Gắn chốt</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11.5px] font-black dark:text-white">18</span>
                          <span className="text-[7.5px] font-bold text-emerald-505">+2</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 shadow-3xs">
                      <div className="w-6.5 h-6.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-505 flex items-center justify-center">⚙️</div>
                      <div>
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 block leading-tight">Follow-up</span>
                        <span className="text-[11.5px] font-black block dark:text-white">2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Urgently need handling members list */}
                  <div className={`p-2.5 bg-white dark:bg-slate-855 rounded-2xl border transition-all duration-300 shadow-3xs space-y-2 ${
                    teamHoveredFeature === 'risks' ? 'border-red-400 bg-red-50/5 scale-98 shadow-sm' : 'border-slate-100 dark:border-slate-800'
                  }`}>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                      <span className="text-[8.5px] font-black text-slate-850 dark:text-slate-200">Ưu tiên xử lý nhân sự</span>
                      <span className="text-[7.5px] font-bold text-primary-505">Xem tất cả</span>
                    </div>

                    {/* Member rows mockup */}
                    <div className="space-y-1.5">
                      {[
                        { name: "tuanlinh.hoang28", count: 19 },
                        { name: "tuanhoang.samrealty", count: 10 },
                        { name: "Tuấn Linh 1", count: 9 }
                      ].map((member, idx) => (
                        <div key={idx} className="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-medium border border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-[8px] text-slate-655 dark:text-slate-300">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[80px]">{member.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[7.5px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/10 shrink-0">{member.count} quá hạn</span>
                            <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 shrink-0">Xem ngay ➔</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulated timeline mini chart widget */}
                  <div className={`p-2.5 bg-white dark:bg-slate-855 rounded-2xl border transition-all duration-300 shadow-3xs space-y-1.5 ${
                    teamHoveredFeature === 'perf' ? 'border-primary-400 bg-primary-50/5 scale-98 shadow-sm' : 'border-slate-100 dark:border-slate-800'
                  }`}>
                    <span className="text-[8.5px] font-black text-slate-855 dark:text-slate-200 block">Theo hành trình</span>
                    
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {[
                        { label: "Phá băng", val: 10 },
                        { label: "Tư vấn", val: 7 },
                        { label: "Lòng tin", val: 10 },
                        { label: "Hẹn gặp", val: 8 },
                        { label: "Dẫn chốt", val: 4 }
                      ].map((col, idx) => (
                        <div key={idx} className="flex flex-col items-center space-y-0.5">
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-10 rounded-lg flex items-end overflow-hidden">
                            <div 
                              className={`w-full rounded-b-lg transition-all duration-500 ${
                                idx === 4 ? "bg-emerald-500" : "bg-primary-500"
                              }`} 
                              style={{ height: `${col.val * 10}%` }} 
                            />
                          </div>
                          <span className="text-[7px] font-bold text-slate-400 truncate w-full text-center leading-none mt-1">{col.label}</span>
                          <span className="text-[8px] font-black text-slate-700 dark:text-slate-300">{col.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Text and explanation list cards */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-lg border border-emerald-500/10 inline-block">
                Chương 2
              </span>
              <h2 className="text-2xl sm:text-4.5xl font-black text-slate-900 dark:text-white leading-tight">
                Quản lý cả team<br/>trên một màn hình
              </h2>
              <p className="text-xs sm:text-sm text-slate-555 dark:text-slate-400 font-semibold leading-relaxed">
                Bao quát toàn bộ hoạt động bán hàng của từng nhân viên theo thời gian thực. Phát hiện điểm nghẽn tức thì để tối ưu hiệu suất đội ngũ mà không cần các buổi họp báo cáo rườm rà.
              </p>
            </div>

            <hr className="border-slate-200/60 dark:border-slate-800/80" />

            {/* Glowing Interactive explanation cards list */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tính năng quản lý cốt lõi (Hover/Click thử để xem highlight):</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: "needs",
                    title: "🔥 44 khách cần chăm",
                    desc: "Tự động phát hiện và cảnh báo các cơ hội bị lãng quên để trưởng nhóm đôn đốc kịp thời."
                  },
                  {
                    id: "deals",
                    title: "🎯 18 deal gần chốt",
                    desc: "Định vị và tập trung cao độ nguồn lực vào các thương vụ có xác suất chốt cọc cao nhất phòng."
                  },
                  {
                    id: "risks",
                    title: "⚠️ Ưu tiên xử lý nhân sự",
                    desc: "Biết chính xác nhân sự nào đang quá hạn follow-up hoặc bị ngập đầu trong lượng lead ảo."
                  },
                  {
                    id: "perf",
                    title: "📊 Theo dõi hiệu suất",
                    desc: "Đo lường tiến độ chuyển đổi theo từng giai đoạn bán hàng để đề ra chiến lược bám đuổi phù hợp."
                  }
                ].map((feature) => (
                  <div
                    key={feature.id}
                    onMouseEnter={() => setTeamHoveredFeature(feature.id)}
                    onMouseLeave={() => setTeamHoveredFeature(null)}
                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                      teamHoveredFeature === feature.id
                        ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/5 translate-y-[-2px]"
                        : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800"
                    }`}
                  >
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between">
                      {feature.title}
                      {teamHoveredFeature === feature.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-400">Bảo mật Least Privilege tuyệt đối</h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Trưởng phòng sau khi bàn giao khách cho Sales phụ trách sẽ không thể thấy thông tin liên hệ chi tiết hay lịch sử tương tác riêng tư của lead đó nữa. Sales an tâm chăm sóc và nâng cao bảo mật dữ liệu.
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================
            CHƯƠNG 3: AI Coach - Trợ lý thông minh của Sales
            ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text / Features column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-lg border border-amber-500/10 inline-block">
                Chương 3
              </span>
              <h2 className="text-2xl sm:text-4.5xl font-black text-slate-900 dark:text-white leading-tight">
                AI Coach<br/>Trợ lý thông minh của Sales
              </h2>
              <p className="text-xs sm:text-sm text-slate-555 dark:text-slate-400 font-semibold leading-relaxed">
                Tích hợp AI Engine thông minh phân tích toàn diện dữ liệu tương tác để gợi ý hành động ưu tiên bám đuổi, cảnh báo rủi ro lãng quên và chỉ đường chốt giao dịch.
              </p>
            </div>

            <hr className="border-slate-200/60 dark:border-slate-800/80" />

            <div className="space-y-3.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">4 sứ mệnh đột phá của AI Coach:</p>
              
              <div className="space-y-3">
                {[
                  { label: "Phát hiện cơ hội:", text: "Tự động phát hiện các lead có tín hiệu chốt cọc cao để sales dồn 100% sự tập trung." },
                  { label: "Cảnh báo rủi ro:", text: "Cảnh báo sớm các trường hợp bỏ bê, nguội lạnh hoặc liên lạc thất bại liên tục." },
                  { label: "Đề xuất hành động:", text: "Gợi ý chính xác sales nên làm gì tiếp theo (gửi bảng giá, hẹn cafe, gọi lại...)." },
                  { label: "Đo lường hiệu quả:", text: "Lập biểu đồ theo dõi hiệu suất, đo lường điểm nghẽn phễu bán hàng hàng tuần." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-850 dark:text-slate-100">{item.label}</h4>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: AI Coach Dashboard Mockup */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            
            {/* Visual device tablet/screen mockup wrapper */}
            <div className="w-full max-w-[430px] rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-lg relative transition-all duration-300 select-none">
              
              {/* Header inside Coach */}
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-850 dark:text-white leading-none">AI Coach</h3>
                    <span className="text-[7.5px] text-slate-455 dark:text-slate-500 font-bold block mt-0.5">Tổng quan thông minh • Hôm nay, 24/05/2026</span>
                  </div>
                </div>
                
                <span className="text-[7px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.8 rounded-lg">Bản xem trước ➔</span>
              </div>

              {/* 4 KPIs grid mockups */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3">
                {[
                  { label: "Cơ hội", val: "32", pct: "+18%", color: "text-emerald-500" },
                  { label: "Rủi ro", val: "17", pct: "+12%", color: "text-amber-500" },
                  { label: "Việc làm", val: "26", pct: "+8%", color: "text-blue-500" },
                  { label: "Tỉ lệ chốt", val: "24.6%", pct: "Ổn định", color: "text-slate-900 dark:text-white" }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                    <span className="text-[7px] uppercase font-bold text-slate-400 block mb-0.5 leading-none">{kpi.label}</span>
                    <div className="flex items-baseline justify-between gap-1.5 mt-1">
                      <span className={`text-[11.5px] font-black ${kpi.color}`}>{kpi.val}</span>
                      <span className="text-[6.5px] font-bold text-emerald-500 shrink-0 leading-none">{kpi.pct}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Actions columns layout inside Coach */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1.5">
                
                {/* Actions list column (Left-ish) */}
                <div className="sm:col-span-7 space-y-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider mb-1">🔥 Gợi ý hành động ưu tiên:</span>
                  
                  <div className="space-y-1.5">
                    {coachRecommendations.map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => setSelectedCoachAction(selectedCoachAction === rec.id ? null : rec.id)}
                        className={`w-full text-left p-2 rounded-xl transition-all border flex items-center justify-between gap-2 focus:outline-none cursor-pointer ${
                          selectedCoachAction === rec.id
                            ? "bg-slate-50 dark:bg-slate-800/60 border-amber-400 shadow-2xs"
                            : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-slate-850 dark:text-slate-100 truncate">{rec.name}</span>
                            <span className={`text-[6.5px] font-black uppercase tracking-wider px-1.5 rounded-sm border shrink-0 ${rec.badgeColor}`}>
                              {rec.status}
                            </span>
                          </div>
                          <span className="text-[7.5px] text-slate-455 dark:text-slate-500 font-semibold block truncate">{rec.desc}</span>
                        </div>

                        <span className="text-[8px] font-bold text-primary-500 border border-primary-500/10 px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/20 shrink-0">
                          {rec.btnLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Funnel / Heat levels chart column (Right-ish) */}
                <div className="sm:col-span-5 space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider">🌡️ Nhiệt độ khách hàng:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Rất nóng", count: 12, color: "bg-red-500/10 text-red-500 border-red-500/10" },
                        { label: "Nóng", count: 28, color: "bg-orange-500/10 text-orange-500 border-orange-500/10" },
                        { label: "Ấm", count: 36, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/10" },
                        { label: "Lạnh", count: 64, color: "bg-blue-500/10 text-blue-500 border-blue-500/10" }
                      ].map((h, i) => (
                        <div key={i} className={`p-1 border rounded-lg flex flex-col items-center justify-center shrink-0 ${h.color}`}>
                          <span className="text-[7px] font-bold uppercase leading-none">{h.label}</span>
                          <span className="text-[10px] font-black mt-0.5 leading-none">{h.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tiny simulated funnel chart */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider">📊 Tỷ lệ phễu chuyển đổi:</span>
                    <div className="flex flex-col gap-0.8 scale-90 origin-left">
                      {[
                        { pct: "100%", label: "Phá băng", w: "w-28", bg: "bg-slate-400" },
                        { pct: "60%", label: "Tư vấn", w: "w-24", bg: "bg-blue-400" },
                        { pct: "35%", label: "Lòng tin", w: "w-20", bg: "bg-amber-400" },
                        { pct: "20%", label: "Hẹn gặp", w: "w-14", bg: "bg-orange-400" },
                        { pct: "10%", label: "Dẫn cọc", w: "w-10", bg: "bg-emerald-500" }
                      ].map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-[7px] font-bold">
                          <span className={`${f.w} ${f.bg} text-white rounded-r px-1 py-0.2 truncate text-right font-black`}>{f.pct}</span>
                          <span className="text-slate-400 leading-none truncate max-w-[40px]">{f.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Coach speech bubble pop-up simulation details */}
              <AnimatePresence>
                {selectedCoachAction && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute inset-x-4 bottom-4 bg-slate-900 text-white rounded-2xl p-3 border border-slate-700 shadow-xl z-20 flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-white shrink-0 flex items-center justify-center font-bold">💡</div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-wide">
                          AI khuyên làm cho {coachRecommendations.find(r => r.id === selectedCoachAction)?.name}:
                        </h4>
                        <button onClick={() => setSelectedCoachAction(null)} className="text-slate-400 hover:text-white text-[9px] font-bold p-0.5">✕</button>
                      </div>
                      <p className="text-[10px] text-slate-200 leading-relaxed font-semibold">
                        {coachRecommendations.find(r => r.id === selectedCoachAction)?.suggestion}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Simulated Coach Speech bubble trigger indicator */}
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-4 text-center">
              💡 Hãy click chọn một dòng tên trong mục &quot;Gợi ý hành động&quot; để lắng nghe AI đề xuất chiến thuật bám đuổi!
            </p>

          </div>
        </section>

        {/* Footer CTA & Action to Main Dashboard */}
        <section className="text-center bg-gradient-to-r from-primary-500/10 via-blue-500/5 to-emerald-500/10 dark:from-primary-500/5 dark:via-transparent dark:to-emerald-500/5 border border-primary-500/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <span className="text-[9px] uppercase font-black tracking-widest text-primary-500 bg-primary-500/10 px-3 py-1 rounded-lg">Ứng dụng thực tiễn</span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Bạn đã sẵn sàng ứng dụng<br/>để bứt phá doanh số?
          </h2>
          <p className="text-xs text-slate-555 dark:text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
            Hệ thống CRM thông minh đã sẵn sàng bám đuổi từng giao dịch, hỗ trợ đội nhóm đắc lực và mở khóa trợ lý AI Coach.
          </p>

          <div className="flex justify-center pt-2">
            <Link 
              href="/"
              className="px-8 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg border border-slate-900 dark:border-white cursor-pointer"
            >
              Bắt đầu chăm sóc khách hàng ngay
            </Link>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
