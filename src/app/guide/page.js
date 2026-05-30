"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Sparkles, BrainCircuit, Users, Target, Clock, 
  Calendar, CheckCircle2, ChevronRight, Play, BookOpen, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, ShieldAlert, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";

// Helper collapsible component to compress verbose text with a clean HUD design
function CollapsibleDetail({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden bg-slate-50/60 dark:bg-slate-900/40 transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 pt-1 text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed border-t border-slate-150 dark:border-slate-800/60 font-medium">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InteractiveScreenshot() {
  const hotspots = [
    {
      id: "smart-queue",
      x: "50%",
      y: "28%",
      number: "1",
      title: "⚡ Hàng chờ Smart Queue",
      shortDesc: "Tự động đẩy khách khẩn cấp lên đầu ngày.",
      desc: "Khách hàng nóng nhất tự động sắp xếp lên vị trí số 1 dựa trên Điểm Rõ Nét và lịch hẹn để sales tập trung xử lý lập tức."
    },
    {
      id: "next-action",
      x: "40%",
      y: "43%",
      number: "2",
      title: "📋 Gợi ý Hành động Tiếp Theo",
      shortDesc: "Luôn biết cần làm gì tiếp theo với khách hàng.",
      desc: "Hệ thống tự động đưa ra các gợi ý hành động thực tế tiếp theo (ví dụ: Gọi xác nhận cọc, gửi vị trí...) để sales không bị mất phương hướng."
    },
    {
      id: "one-tap-actions",
      x: "50%",
      y: "53%",
      number: "3",
      title: "📞 Tương tác 1-Chạm Siêu Tốc",
      shortDesc: "Cập nhật, gọi điện, nhắn Zalo chỉ với 1 chạm.",
      desc: "Hỗ trợ các nút gọi điện, gửi tin nhắn Zalo soạn sẵn và cập nhật trạng thái cực nhanh trực tiếp từ thẻ khách hàng."
    },
    {
      id: "overdue-badge",
      x: "83%",
      y: "34%",
      number: "4",
      title: "🔴 Cảnh báo Trễ Hẹn",
      shortDesc: "Phát hiện ngay các lịch hẹn bị bỏ lỡ.",
      desc: "Hộp cảnh báo đỏ hiển thị chính xác số giờ hoặc ngày trễ hẹn, giúp sales lập tức phát hiện và chăm sóc lại, tránh bỏ quên cơ hội."
    },
    {
      id: "snooze-restore",
      x: "76%",
      y: "15%",
      number: "5",
      title: "🔄 Khôi phục Tạm hoãn",
      shortDesc: "Đưa khách hàng tạm ẩn quay lại danh sách.",
      desc: "Chạm nút xoay tròn để khôi phục nhanh toàn bộ danh sách khách hàng đang tạm hoãn (Snooze) quay trở lại hàng chờ làm việc tức thời."
    },
    {
      id: "fab-add",
      x: "50%",
      y: "82%",
      number: "6",
      title: "➕ Thêm khách nhanh",
      shortDesc: "Mở form thêm nhanh ở bất cứ đâu.",
      desc: "Nút thêm khách hàng nổi bật ở góc dưới màn hình giúp bạn mở nhanh form nhập liệu tối giản bất cứ lúc nào."
    }
  ];

  const [activeSpotId, setActiveSpotId] = useState("smart-queue");
  const activeSpot = hotspots.find(s => s.id === activeSpotId) || hotspots[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start my-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors">
      
      {/* Visual Device Frame */}
      <div className="md:col-span-5 flex flex-col items-center w-full">
        <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 mb-3 uppercase tracking-wider text-center block">
          📱 Bản đồ tính năng trực quan:
        </span>
        
        {/* Responsive Scale Wrapper */}
        <div className="w-full flex justify-center py-2 overflow-visible">
          <div className="relative w-[240px] sm:w-[260px] aspect-[9/19.5] rounded-[32px] bg-slate-950 border-[5px] border-slate-850 shadow-lg p-1 overflow-hidden ring-1 ring-slate-800/40">
            {/* Dark Tint Overlay */}
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20 pointer-events-none z-10" />

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-slate-850 rounded-b-lg z-30 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-slate-950 rounded-full mb-0.5" />
            </div>

            <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-slate-55 select-none">
              {/* Mockup Image */}
              <Image 
                src="/images/dashboard-mobile.png" 
                alt="SalesPush Mobile Dashboard"
                fill
                sizes="(max-width: 768px) 240px, 260px"
                className="object-cover pointer-events-none"
                priority
              />

              {/* Hotspots Overlay */}
              {hotspots.map((spot) => {
                const isActive = activeSpotId === spot.id;
                return (
                  <div
                    key={spot.id}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: spot.x, top: spot.y }}
                  >
                    <button
                      onClick={() => setActiveSpotId(spot.id)}
                      className="relative w-6 h-6 flex items-center justify-center focus:outline-none"
                    >
                      {isActive && (
                        <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-primary-400" />
                      )}
                      <span className={`relative inline-flex rounded-full h-4.5 w-4.5 items-center justify-center shadow-md border transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary-500 text-white border-white scale-110 font-bold text-[9px]' 
                          : 'bg-emerald-500 text-white border-white hover:scale-105 font-semibold text-[8px]'
                      }`}>
                        {spot.number}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Touch-Friendly Feature Spotlights Accordion (Perfect for Mobile) */}
      <div className="md:col-span-7 space-y-2 w-full">
        <h3 className="font-black text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center md:text-left mb-2.5">
          💡 Chọn tính năng để xem chi tiết:
        </h3>
        
        <div className="space-y-2">
          {hotspots.map((spot) => {
            const isActive = activeSpotId === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => setActiveSpotId(spot.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border flex gap-3 focus:outline-none ${
                  isActive
                    ? "bg-slate-50 dark:bg-slate-900/60 border-slate-350 dark:border-slate-700 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-850/40"
                }`}
              >
                <div className={`w-5 h-5 rounded-lg font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 border ${
                  isActive 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white" 
                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-450 border-slate-200 dark:border-slate-800"
                }`}>
                  {spot.number}
                </div>
                <div className="space-y-1 flex-1">
                  <span className={`text-xs font-bold block ${isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                    {spot.title}
                  </span>
                  
                  {isActive ? (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.15 }}
                      className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-1.5 font-medium border-t border-slate-150 dark:border-slate-800/60"
                    >
                      {spot.desc}
                    </motion.p>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block line-clamp-1">
                      {spot.shortDesc}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

const CHAPTERS = [
  {
    id: "onboarding",
    title: "1. Nhập Liệu",
    icon: Sparkles,
    bgColor: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
  },
  {
    id: "queue",
    title: "2. Hàng Chờ",
    icon: BrainCircuit,
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "followup",
    title: "3. Lịch Hẹn",
    icon: Clock,
    bgColor: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
  },
  {
    id: "team",
    title: "4. Đồng Đội",
    icon: Users,
    bgColor: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
  }
];

export default function GuidePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("onboarding");

  // Playground simulated customer state
  const [simulatedCustomer, setSimulatedCustomer] = useState({
    name: "Anh Huy (Quận 2)",
    heat: "🌟 Rất Nét",
    lastContact: "Mới tạo lead",
    nextFollowUp: "Trễ hạn 2 ngày",
    displayStatus: "Lỡ hẹn"
  });
  const [simulationStep, setSimulationStep] = useState(0);

  const resetSimulation = () => {
    setSimulatedCustomer({
      name: "Anh Huy (Quận 2)",
      heat: "🌟 Rất Nét",
      lastContact: "Mới tạo lead",
      nextFollowUp: "Trễ hạn 2 ngày",
      displayStatus: "Lỡ hẹn"
    });
    setSimulationStep(0);
  };

  const handleSimulateCare = () => {
    setSimulatedCustomer({
      name: "Anh Huy (Quận 2)",
      heat: "🌟 Rất Nét",
      lastContact: "Vừa gọi điện tư vấn",
      nextFollowUp: "Ngày mai 09:00",
      displayStatus: "Đang chăm"
    });
    setSimulationStep(1);
  };

  const handleQuickLink = (tabId) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const el = document.getElementById("content-anchor");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 md:pb-8 md:pl-64 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors">
      
      {/* Header - Sharp & Pristine Styling */}
      <header className="pt-safe px-4 sm:px-6 pt-5 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 transition-colors shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-950 dark:hover:text-white transition-all active:scale-95"
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
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-6">
        
        {/* Core Breakthrough Section - Redesigned to snapping carousel */}
        <section className="bg-slate-900 dark:bg-slate-950 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="text-center sm:text-left">
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">⚡ BẬT MÍ CỐT LÕI</span>
              <h2 className="text-sm sm:text-base font-black text-white mt-1.5">
                3 Trụ Cột Bất Bại Tăng 300% Hiệu Suất
              </h2>
            </div>

            {/* Horizontal Swipe deck on mobile, structured grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
              
              {/* Card 1 */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shrink-0 w-[240px] snap-center md:w-auto hover:border-slate-700 transition-colors">
                <div className="space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-[10px] text-white uppercase tracking-wider">
                    Tự Đẩy Khách Nét
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Tự động đưa khách hàng có độ rõ nét cao và lịch hẹn khẩn cấp nhất lên hàng đầu Dashboard để xử lý lập tức.
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLink("queue")}
                  className="mt-3.5 text-[9px] font-black text-primary-400 hover:text-primary-300 flex items-center gap-1 active:scale-95 transition-all text-left"
                >
                  Xem hàng chờ ➔
                </button>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shrink-0 w-[240px] snap-center md:w-auto hover:border-slate-700 transition-colors">
                <div className="space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-[10px] text-white uppercase tracking-wider">
                    Nhập Liệu Di Động
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Loại bỏ gõ phím. Cập nhật tiến trình đàm phán 7 bước và ngân sách tài chính siêu tốc chỉ bằng vuốt chạm ngang.
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLink("onboarding")}
                  className="mt-3.5 text-[9px] font-black text-primary-400 hover:text-primary-300 flex items-center gap-1 active:scale-95 transition-all text-left"
                >
                  Xem cách nhập ➔
                </button>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between shrink-0 w-[240px] snap-center md:w-auto hover:border-slate-700 transition-colors">
                <div className="space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-[10px] text-white uppercase tracking-wider">
                    AI Cố Vấn & Đồng Đội
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Leader phân bổ lead 1-chạm. AI Engine tự động phân tích hành vi và đề xuất chiến lược bám sát mục tiêu.
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLink("team")}
                  className="mt-3.5 text-[9px] font-black text-primary-400 hover:text-primary-300 flex items-center gap-1 active:scale-95 transition-all text-left"
                >
                  Xem cách chia lead ➔
                </button>
              </div>

            </div>

            {/* Subtle swipe indicator dots for Mobile view */}
            <div className="flex justify-center gap-1.5 md:hidden pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
        </section>

        {/* Chapters Navigation - Modern Segmented Control Grid */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl">
          {CHAPTERS.map(ch => {
            const Icon = ch.icon;
            const isActive = activeTab === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveTab(ch.id)}
                className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-center ${
                  isActive 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm" 
                    : "text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white dark:text-slate-900" : "text-slate-500"}`} />
                <span className="text-[9px] font-bold tracking-tight block truncate w-full px-0.5">
                  {ch.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scroll Anchor */}
        <div id="content-anchor" className="scroll-mt-20" />

        {/* Content Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden min-h-[35vh] transition-colors">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              
              {activeTab === "onboarding" && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[8px] uppercase font-black tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded-md">Chương 1</span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white mt-1.5">Nhập Liệu 1-Chạm Siêu Tốc</h2>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                      Loại bỏ gõ phím rườm rà. Bạn chỉ cần chạm chọn các thuộc tính để lưu trữ chi tiết khách hàng trong 3 giây.
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/80" />

                  {/* Clean Visual Steps - Miller's Law Chunking */}
                  <div className="space-y-3.5">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary-500 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">Thiết lập tài khoản (Profile)</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                          Cấu hình nhanh thời gian tạm hoãn mặc định, số ngày hẹn gọi lại và cài đặt bộ nhớ thông minh để hệ thống phân bổ hàng chờ chuẩn xác nhất.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary-500 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">Nhập liệu 2 giai đoạn linh hoạt</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                          - **Sơ bộ**: Ghi nhanh Họ tên + SĐT + Nguồn khách trong 2 giây khi đang di chuyển trên đường.
                          <br />
                          - **Chi tiết**: Vuốt chọn nhanh ngân sách, khu vực, loại hình BĐS khi bắt đầu tư vấn.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary-500 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">Thao tác vuốt chọn trực quan</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                          Hỗ trợ thanh vuốt ngang các lựa chọn (Chips) giúp bạn chọn nhanh ngân sách và độ &quot;nét&quot; của khách mà không cần gõ bàn phím.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clean Visual representation of ScrollChips */}
                  <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-primary-500" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ví dụ Nhập Liệu 1-Chạm thực tế:</span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Mức độ nét của khách:</span>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                          <span className="px-2.5 py-1 rounded bg-rose-500 text-white text-[10px] font-bold shrink-0 shadow-sm">🌟 Rất Nét</span>
                          <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold shrink-0">🔥 Tiềm Năng</span>
                          <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold shrink-0">👀 Quan Tâm</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Ngân sách khách hàng:</span>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                          <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold shrink-0">Dưới 2 tỷ</span>
                          <span className="px-2.5 py-1 rounded bg-primary-500 text-white text-[10px] font-bold shrink-0 shadow-sm">2 - 3 tỷ</span>
                          <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold shrink-0">3 - 5 tỷ</span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible detail to minimize mobile text noise */}
                    <CollapsibleDetail title="Tìm hiểu sâu về Điểm Rõ Nét (Clarity Score)">
                      Khi bạn cập nhật đầy đủ các thông tin (Tài chính, BĐS quan tâm, Khu vực...), hệ thống tự động tính độ rõ nét của khách hàng (mỗi tiêu chí đóng góp 20%). Khách hàng có Điểm Rõ Nét càng cao sẽ tự động được ưu tiên đưa lên hàng đầu hàng chờ **Smart Queue** để xử lý trước.
                    </CollapsibleDetail>
                  </div>
                </div>
              )}

              {activeTab === "queue" && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[8px] uppercase font-black tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">Chương 2</span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white mt-1.5">Hàng Chờ Thông Minh & Trạng Thái Động</h2>
                    <p className="text-xs text-slate-555 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                      Loại bỏ hoàn toàn danh sách tĩnh. Trạng thái khách hàng tự động dịch chuyển theo thời gian thực giúp bạn làm việc thông suốt.
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/80" />

                  {/* Re-designed Interactive Spotlight mockup instead of simple hotspots */}
                  <InteractiveScreenshot />

                  {/* Concise Status Timeline */}
                  <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary-500" />
                      Cơ chế tự động chuyển đổi Trạng thái:
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Đang chăm</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold text-right">Khách mới tạo hoặc vừa cập nhật báo cáo</span>
                      </div>

                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Đang chờ</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold text-right">Chuyển sau 30 phút để chuẩn bị cho cuộc gọi tiếp</span>
                      </div>

                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Lỡ hẹn</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold text-right">Nhãn đỏ cảnh báo khi lịch hẹn bị quá 1 giờ</span>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Minimised Playground Widget */}
                  <div className="border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-primary-500 fill-current animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-450 uppercase tracking-wider">Khu Trải Nghiệm (Playground)</span>
                      </div>
                      {simulationStep > 0 && (
                        <button 
                          onClick={resetSimulation}
                          className="text-[9px] font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Đặt lại
                        </button>
                      )}
                    </div>

                    {/* Simulated Customer Row */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{simulatedCustomer.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white shrink-0 shadow-xs">{simulatedCustomer.heat}</span>
                        </div>
                        <p className="text-[10px] text-slate-450">Liên hệ cuối: <span className="font-bold text-slate-700 dark:text-slate-350">{simulatedCustomer.lastContact}</span></p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-450" />
                          Hẹn gọi: <span className="font-semibold text-slate-700 dark:text-slate-300">{simulatedCustomer.nextFollowUp}</span>
                        </p>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        simulatedCustomer.displayStatus === "Đang chăm" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        "bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/15 animate-pulse"
                      }`}>
                        {simulatedCustomer.displayStatus}
                      </span>
                    </div>

                    {/* Action button */}
                    <div className="flex gap-2">
                      {simulationStep === 0 ? (
                        <button
                          onClick={handleSimulateCare}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Bấm &quot;Chăm sóc ngay&quot; &amp; Lên lịch hẹn mới
                        </button>
                      ) : (
                        <div className="w-full text-center py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🎉 Tuyệt vời! Khách hàng đã chuyển sang màu xanh &quot;Đang chăm&quot;.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "followup" && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[8px] uppercase font-black tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md">Chương 3</span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white mt-1.5">Theo Dõi Lịch Hẹn & Chế Độ &quot;Tạm Hoãn&quot;</h2>
                    <p className="text-xs text-slate-555 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                      Kiểm soát thời gian chăm sóc khoa học. Tự động ẩn bớt việc để tránh ngập đầu trong thông báo trễ hẹn.
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/80" />

                  {/* Clean cards for follow-up steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl bg-white dark:bg-slate-900 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4.5 h-4.5 text-primary-500" />
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">Lên lịch hẹn nhanh qua Chips</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                        Khi lưu báo cáo, chạm chọn nhanh các mốc giờ có sẵn: **2 giờ, 4 giờ, ngày mai, tuần sau** để hệ thống tự động sắp xếp vào lịch hẹn nhắc nhở.
                      </p>
                    </div>

                    <div className="border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl bg-white dark:bg-slate-900 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4.5 h-4.5 text-amber-500" />
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">Tạm hoãn thông minh (Snooze)</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                        Nếu chưa rảnh để chăm sóc, chọn **Snooze** để tạm ẩn khách hàng khỏi Dashboard chính. Họ sẽ tự động hiển thị lại khi hết thời gian tạm ẩn.
                      </p>
                    </div>
                  </div>

                  {/* Alert panel for cold streak warnings */}
                  <div className="border border-amber-250 dark:border-amber-900/30 p-4 bg-amber-500/5 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-2 w-full">
                      <div>
                        <h4 className="font-bold text-xs text-amber-800 dark:text-amber-400">Bảo vệ bộ nhớ: Kháng liên lạc &amp; Nguội lạnh</h4>
                        <p className="text-[10px] text-amber-750 dark:text-amber-500/80 mt-0.5 font-semibold">CRM thông minh tự động dọn dẹp lead ảo để giải phóng năng lượng.</p>
                      </div>
                      
                      <CollapsibleDetail title="Xem chi tiết cách hoạt động của cơ chế bảo vệ">
                        - **Kháng liên lạc (Unreachable Streak):** Nếu bạn lưu báo cáo là &quot;Chưa liên lạc được&quot; liên tục quá 5 lần, hệ thống tự động đưa khách vào trạng thái **&quot;Ngủ đông&quot;** và giãn lịch hẹn về sau 7 ngày.
                        <br />
                        - **Nguội lạnh (Cold Streak):** Nếu 3 lần chăm sóc liên tiếp không ghi nhận tiến triển đàm phán, khách cũng sẽ chuyển sang **&quot;Ngủ đông&quot;** để bạn tập trung cho lead mới tốt hơn.
                      </CollapsibleDetail>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "team" && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[8px] uppercase font-black tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded-md">Chương 4</span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white mt-1.5">Bán Hàng Đồng Đội (Team Mode)</h2>
                    <p className="text-xs text-slate-555 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                      Giải pháp quản lý tối ưu cho đội nhóm lớn. Kết nối nhịp nhàng giữa Trưởng phòng (Leader) và nhân viên Sales.
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800/80" />

                  {/* Clean Visual Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-xs text-slate-950 dark:text-white">Bàn giao Lead 1-chạm</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                        Leader duyệt danh sách khách chưa bàn giao, chạm chọn thành viên trong phòng để giao lead. Lead lập tức xuất hiện trên Dashboard của sales đó.
                      </p>
                    </div>

                    <div className="border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-xs text-slate-950 dark:text-white">Bảng phân tích realtime</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                        Tự động tổng hợp số liệu về số khách đang chăm, lượng giao dịch chốt cọc của từng nhân viên hàng ngày/hàng tuần mà không làm giảm tốc độ app.
                      </p>
                    </div>
                  </div>

                  {/* Privacy shield card */}
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-2 w-full">
                      <div>
                        <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-400">Bảo mật thông tin tối đa (Least Privilege)</h4>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-500/80 mt-0.5 font-semibold">Tôn trọng quyền riêng tư của sales và bảo vệ dữ liệu khách hàng tuyệt đối.</p>
                      </div>

                      <CollapsibleDetail title="Xem chi tiết nguyên lý bảo mật Least Privilege">
                        Áp dụng nguyên tắc **Quyền Tối Thiểu (Least Privilege)**: Trưởng phòng sau khi đã bàn giao khách hàng cho sales phụ trách sẽ không nhìn thấy số điện thoại hay chi tiết lịch sử cuộc gọi/tương tác cá nhân của khách đó nữa. Giúp sales an tâm chăm sóc khách hàng và tránh rò rỉ dữ liệu ngoài ý muốn.
                      </CollapsibleDetail>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Action */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-[11px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Bạn đã sẵn sàng ứng dụng để bứt phá doanh số?</p>
          <div className="flex justify-center">
            <Link 
              href="/"
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md block border border-slate-900 dark:border-white"
            >
              Bắt đầu chăm sóc khách hàng ngay
            </Link>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
