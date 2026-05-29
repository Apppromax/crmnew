"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Sparkles, BrainCircuit, Users, Target, Clock, 
  Calendar, CheckCircle2, ChevronRight, Play, BookOpen, AlertCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

function InteractiveScreenshot() {
  const [selectedSpot, setSelectedSpot] = useState({
    id: "smart-queue",
    x: "50%",
    y: "28%",
    title: "⚡ Hàng chờ Smart Queue",
    desc: "Khách hàng khẩn cấp nhất tự động được sắp xếp ở vị trí số 1 dựa trên Điểm Rõ Nét và lịch hẹn để sales tập trung xử lý ngay đầu ngày."
  });

  const hotspots = [
    {
      id: "snooze-restore",
      x: "76%",
      y: "15%",
      title: "🔄 Khôi phục Tạm hoãn",
      desc: "Bấm nút xoay tròn để khôi phục nhanh tất cả các khách hàng đang tạm hoãn (Snooze) quay lại hàng chờ làm việc."
    },
    {
      id: "smart-queue",
      x: "50%",
      y: "28%",
      title: "⚡ Hàng chờ Smart Queue",
      desc: "Khách hàng khẩn cấp nhất tự động được sắp xếp ở vị trí số 1 dựa trên Điểm Rõ Nét và lịch hẹn để sales tập trung xử lý ngay đầu ngày."
    },
    {
      id: "overdue-badge",
      x: "83%",
      y: "34%",
      title: "🔴 Cảnh báo Lỡ Hẹn",
      desc: "Thẻ đỏ hiển thị số ngày/giờ bị lỡ hẹn để bạn lập tức gọi lại chăm sóc ngay, tránh bỏ rơi cơ hội."
    },
    {
      id: "next-action",
      x: "40%",
      y: "43%",
      title: "📋 Hành động tiếp theo",
      desc: "Gợi ý hành động chi tiết dựa trên tiến trình thực tế (ví dụ: Gọi xác nhận lịch hẹn, tư vấn chuyên sâu...) giúp sales luôn biết cần làm gì."
    },
    {
      id: "one-tap-actions",
      x: "50%",
      y: "53%",
      title: "📞 Tương tác 1-Chạm",
      desc: "Nút Cập nhật trạng thái, Gọi điện trực tiếp, hoặc nhắn tin Zalo nhanh chỉ với một chạm duy nhất."
    },
    {
      id: "fab-add",
      x: "50%",
      y: "82%",
      title: "➕ Thêm khách nhanh",
      desc: "Nút thêm khách hàng nổi bật ở cuối trang giúp bạn nhanh chóng mở form nhập liệu 2 giai đoạn bất kỳ lúc nào."
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-6 bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-3xl border border-slate-150 dark:border-slate-800/80">
      {/* Visual Device Frame */}
      <div className="lg:col-span-6 flex flex-col items-center">
        <span className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">📱 Bấm trực tiếp vào các điểm tròn phát sáng trên màn hình:</span>
        <div className="relative w-full max-w-[300px] aspect-[9/19.5] rounded-[42px] bg-slate-900 border-[8px] border-slate-800 shadow-2xl p-1 overflow-hidden ring-1 ring-slate-700/30">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
            <div className="w-10 h-0.5 bg-slate-900 rounded-full mb-0.5" />
          </div>

          <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-slate-100 select-none">
            {/* Screenshot */}
            <img 
              src="/images/dashboard-mobile.png" 
              alt="SalesPush Mobile Dashboard"
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Hotspots Overlay */}
            {hotspots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: spot.x, top: spot.y }}
                >
                  <button
                    onClick={() => setSelectedSpot(isSelected ? null : spot)}
                    className="relative w-7 h-7 flex items-center justify-center focus:outline-none"
                  >
                    {/* Pulsing ring */}
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isSelected ? 'bg-indigo-400' : 'bg-primary-400'}`} />
                    {/* Core dot */}
                    <span className={`relative inline-flex rounded-full h-4.5 w-4.5 items-center justify-center shadow-lg border border-white transition-all duration-200 ${isSelected ? 'bg-indigo-500 scale-110' : 'bg-primary-500 hover:scale-105'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </button>
                </div>
              );
            })}

            {/* Tooltip Popup inside phone screen */}
            <AnimatePresence>
              {selectedSpot && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-3 left-3 right-3 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      {selectedSpot.title}
                    </h4>
                    <button 
                      onClick={() => setSelectedSpot(null)}
                      className="text-[9px] text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-0.5"
                    >
                      Đóng
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {selectedSpot.desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Explanations Sidebar list */}
      <div className="lg:col-span-6 space-y-3 mt-4 lg:mt-0">
        <h3 className="font-black text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          💡 Chú thích chi tiết tính năng:
        </h3>
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {hotspots.map((spot, idx) => {
            const isSelected = selectedSpot?.id === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(isSelected ? null : spot)}
                className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-start gap-3 active:scale-[0.99] ${
                  isSelected 
                    ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className={`w-5 h-5 rounded-lg font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected 
                    ? "bg-indigo-500 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className={`text-xs font-black transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {spot.title}
                  </h4>
                  {isSelected && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold"
                    >
                      {spot.desc}
                    </motion.p>
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
    title: "1. Khởi đầu & Nhập liệu 1-Chạm",
    icon: Sparkles,
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
  },
  {
    id: "queue",
    title: "2. Hàng chờ & Trạng thái động",
    icon: BrainCircuit,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "followup",
    title: "3. Lịch hẹn & Tránh lỡ khách",
    icon: Clock,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
  },
  {
    id: "team",
    title: "4. Quản lý Đội nhóm (Team)",
    icon: Users,
    color: "from-blue-500 to-sky-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
  }
];

export default function GuidePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("onboarding");

  // Simulated Swipe Interaction State
  const [simulatedCustomer, setSimulatedCustomer] = useState({
    name: "Anh Huy",
    status: "Đang chăm",
    lastContact: "Mới tạo",
    nextFollowUp: "26/05/2026 (Quá hạn 2 ngày)",
    heat: "Rất Nét",
    displayStatus: "Đang chăm"
  });
  const [simulationStep, setSimulationStep] = useState(0); // 0: Initial, 1: 30m passed, 2: Simulated care completed

  const resetSimulation = () => {
    setSimulatedCustomer({
      name: "Anh Huy",
      status: "Đang chăm",
      lastContact: "Mới tạo",
      nextFollowUp: "26/05/2026 (Quá hạn 2 ngày)",
      heat: "Rất Nét",
      displayStatus: "Đang chăm"
    });
    setSimulationStep(0);
  };

  const handleSimulatePassTime = () => {
    setSimulatedCustomer(prev => ({
      ...prev,
      lastContact: "30 phút trước",
      displayStatus: "Lỡ hẹn"
    }));
    setSimulationStep(1);
  };

  const handleSimulateCare = () => {
    setSimulatedCustomer(prev => ({
      ...prev,
      lastContact: "Vừa tương tác",
      nextFollowUp: "Ngày mai",
      displayStatus: "Đang chăm"
    }));
    setSimulationStep(2);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 md:pb-8 md:pl-64 font-sans selection:bg-indigo-200 selection:text-indigo-900 transition-colors">
      
      {/* Header */}
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 border-b border-slate-150 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Hướng Dẫn Sử Dụng
            </h1>
            <p className="text-xs text-slate-400 font-medium">Bí kíp chốt sales đột phá cùng SalesPush CRM</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6">
        
        {/* 3 Core Breakthrough Features Highlight Panel */}
        <section className="mb-10 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 dark:from-indigo-950/10 dark:via-slate-900 dark:to-emerald-950/10 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          {/* Subtle decoration dots */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1 rounded-md">⚡ BẬT MÍ CỐT LÕI</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
                3 Tính Năng Bất Bại Của SalesPush
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                Được thiết kế tối ưu giúp tăng 300% hiệu suất bán hàng và không bao giờ bỏ sót bất kỳ cơ hội chốt giao dịch nào.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between shadow-sm relative group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                    Tự Đẩy Khách Thông Minh
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">
                    Hệ thống tự động đưa khách có lịch hẹn và khách **&quot;quan tâm sâu&quot; (Rất Nét)** lên màn hình chính. Bạn chỉ cần mở app là thấy ngay, không mất thời gian tìm kiếm hay lục lọi danh sách.
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLink("queue")}
                  className="mt-4 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 flex items-center gap-1 active:scale-95 transition-transform"
                >
                  Xem chi tiết & Thử tương tác ➔
                </button>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between shadow-sm relative group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                    Nhập Liệu & Tiến Trình Sales
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">
                    Biểu mẫu 1-chạm tối giản cho di động. Lưu vết phân khúc tài chính, nhu cầu và quản lý tiến trình sales chuẩn khoa học qua **Hành trình 7 Bước** trực quan.
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLink("onboarding")}
                  className="mt-4 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 flex items-center gap-1 active:scale-95 transition-transform"
                >
                  Xem cách hoạt động ➔
                </button>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between shadow-sm relative group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                    Quản Lý Phòng & Cố Vấn AI
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">
                    Leader nắm trọn thông số hoạt động của cả phòng theo thời gian thực. **AI Engine** tự động tổng hợp thông tin, đưa ra cố vấn chiến lược bám đuổi mục tiêu hàng tuần cực kỳ sắc bén.
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLink("team")}
                  className="mt-4 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 flex items-center gap-1 active:scale-95 transition-transform"
                >
                  Xem phân tích Team ➔
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Horizontal Navigation Chapters */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-hide shrink-0">
          {CHAPTERS.map(ch => {
            const Icon = ch.icon;
            const isActive = activeTab === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveTab(ch.id)}
                className={`px-4 py-3 rounded-2xl flex items-center gap-2.5 whitespace-nowrap text-xs font-bold transition-all border active:scale-95 shrink-0 ${
                  isActive 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md shadow-slate-950/10" 
                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <span className={`p-1.5 rounded-lg ${isActive ? "bg-white/10 dark:bg-slate-900/10 text-white dark:text-slate-900" : ch.bgColor}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {ch.title}
              </button>
            );
          })}
        </div>

        {/* Scroll Anchor */}
        <div id="content-anchor" className="scroll-mt-24" />

        {/* Content Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden min-h-[50vh] transition-colors">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {activeTab === "onboarding" && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-md">Chương 1</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Khởi Đầu & Nhập Liệu 1-Chạm Siêu Tốc</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      SalesPush loại bỏ hoàn toàn việc gõ phím rườm rà trên điện thoại. Bạn có thể vuốt ngang và chạm nhanh để điền đầy đủ thuộc tính khách hàng chỉ trong chớp mắt.
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {/* Visual Bento Step Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 relative group">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-extrabold flex items-center justify-center text-sm mb-4">1</div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thiết lập tài khoản</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        Vào trang **Cá Nhân (Profile)** để thiết lập cấu hình CRM riêng: Thời gian tạm hoãn mặc định, số ngày hẹn gọi lại tự động, và giới hạn cuộc gọi nhỡ trước khi đẩy khách ngủ đông.
                      </p>
                    </div>

                    <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 relative group">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-extrabold flex items-center justify-center text-sm mb-4">2</div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nhập liệu 2 giai đoạn linh hoạt</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        - **Bước 1 (Sơ bộ)**: Nhập nhanh Họ tên + SĐT và chạm chọn Nguồn khách. Phù hợp khi sales đang bận rộn trên đường.
                        <br />
                        - **Bước 2 (Chi tiết - khi chọn &quot;Đã Tư Vấn&quot;)**: Form mở rộng mượt mà cho phép vuốt ngang chọn nhanh Phân khúc tài chính, Loại hình BĐS, Khu vực quan tâm và Timeline mua.
                      </p>
                    </div>
                  </div>

                  {/* ScrollChipSelect Illustration Card */}
                  <div className="border border-indigo-100 dark:border-indigo-950/30 rounded-2xl p-5 bg-gradient-to-br from-indigo-50/30 to-white dark:from-indigo-950/10 dark:to-slate-900 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                      <Sparkles className="w-40 h-40 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <BrainCircuit className="w-5 h-5 text-indigo-500" />
                      <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">Giao diện Nhập liệu 1-Chạm (ScrollChipSelect) thực tế:</span>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Mức độ nét của khách:</span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white border border-red-600 shrink-0">🌟 Rất Nét</span>
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 shrink-0">🔥 Tiềm Năng</span>
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 shrink-0">👀 Quan Tâm</span>
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 shrink-0">❄️ Chưa Rõ</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Phân khúc tài chính:</span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 shrink-0">Dưới 2 tỷ</span>
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-500 text-white border border-primary-600 shrink-0">2 - 3 tỷ</span>
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 shrink-0">3 - 5 tỷ</span>
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 shrink-0">5 - 10 tỷ</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800/80 flex items-start gap-3">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-650 leading-relaxed">
                        **Điểm Rõ Nét (Clarity Score):** Khi sales bấm chọn đầy đủ thông tin (Ngân sách, Loại hình, Khu vực...), hệ thống tự động tính toán độ rõ nét của lead cực kỳ chuẩn xác (mỗi thông tin chi tiết đóng góp 20% vào điểm số tối đa 100%). Điểm rõ nét càng cao, khách hàng càng nóng sẽ tự động được ưu tiên đưa lên vị trí số 1 tại hàng chờ **Smart Queue** để bạn tập trung chăm sóc!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "queue" && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">Chương 2</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Hàng Chờ Thông Minh & Trạng Thái Động</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      SalesPush hoạt động dựa trên triết lý **"Không để leads bị bỏ rơi"**. Hệ thống quản lý trạng thái động thông minh theo thời gian thực (Compute on Read) giúp loại bỏ dữ liệu treo.
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {/* Interactive Screenshot Hotspot Tool */}
                  <InteractiveScreenshot />

                  {/* Overdue Concept Explain */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Cơ chế tự động chuyển "Lỡ hẹn" đặc biệt:</h3>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">A</div>
                        <p className="text-xs text-slate-650 leading-relaxed">
                          **Trạng thái "Đang chăm" (Màu xanh lục):** Chỉ hiển thị trong vòng **30 phút** kể từ thời điểm tương tác cuối cùng để báo hiệu sales đang tích cực đàm phán hoặc hỗ trợ.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">B</div>
                        <p className="text-xs text-slate-650 leading-relaxed">
                          **Tự động chuyển sang "Đang chờ":** Sau 30 phút, nếu sales chưa chốt khách nhưng đã lên lịch hẹn (`nextFollowUp`), hệ thống sẽ tự động cập nhật hiển thị sang trạng thái **"Đang chờ"**.
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">C</div>
                        <p className="text-xs text-slate-650 leading-relaxed">
                          **Chuyển đỏ "Lỡ hẹn":** Khi thời điểm hiện tại vượt quá mốc giờ hẹn `nextFollowUp` (quá 1 giờ), hệ thống sẽ lập tức chuyển màu hiển thị sang nhãn đỏ cảnh báo **"Lỡ hẹn"** tại tất cả các danh sách để sales gọi lại ngay lập tức!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SWIPE INTERACTIVE PLAYGROUND */}
                  <div className="bg-indigo-50/15 dark:bg-indigo-950/10 border-2 border-dashed border-indigo-200 dark:border-indigo-900 p-5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-indigo-500 fill-current" />
                        <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">Khu trải nghiệm thử (Playground)</span>
                      </div>
                      {simulationStep > 0 && (
                        <button 
                          onClick={resetSimulation}
                          className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          <RefreshCw className="w-3 h-3" /> Đặt lại mô phỏng
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">Bấm các nút hành động phía dưới để thử nghiệm luồng thời gian thực của thẻ khách hàng:</p>

                    {/* Simulated Customer Row */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{simulatedCustomer.name}</h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">{simulatedCustomer.heat}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Tương tác cuối: <span className="font-bold text-slate-650">{simulatedCustomer.lastContact}</span></p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Hẹn gọi lại: {simulatedCustomer.nextFollowUp}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          simulatedCustomer.displayStatus === "Đang chăm" ? "bg-emerald-50 text-emerald-600" :
                          simulatedCustomer.displayStatus === "Đang chờ" ? "bg-amber-50 text-amber-600" :
                          "bg-red-50 text-red-600 border border-red-200"
                        }`}>
                          {simulatedCustomer.displayStatus}
                        </span>
                      </div>
                    </div>

                    {/* Simulation Controller Buttons */}
                    <div className="flex gap-2">
                      {simulationStep === 0 && (
                        <button
                          onClick={handleSimulatePassTime}
                          className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Clock className="w-4 h-4" />
                          Giả lập Trôi qua 30 phút (Trễ hẹn)
                        </button>
                      )}
                      
                      {simulationStep === 1 && (
                        <button
                          onClick={handleSimulateCare}
                          className="flex-1 py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Bấm "Chăm sóc ngay" & Hẹn lịch mới
                        </button>
                      )}

                      {simulationStep === 2 && (
                        <div className="w-full text-center py-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">🎉 Tuyệt vời! Khách quay lại xanh "Đang chăm" trong 30 phút tiếp theo.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "followup" && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md">Chương 3</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Theo Dõi Lịch Hẹn & Chế Độ "Tạm Hoãn"</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      SalesPush cung cấp hai công cụ cực kỳ linh hoạt để bạn kiểm soát cuộc hẹn và thời gian chăm sóc hiệu quả mà không bị ngập đầu trong thông báo.
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {/* Grid System for Followup */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-950/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Lên lịch hẹn linh hoạt</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Khi lưu tương tác, bạn có thể hẹn nhanh thời gian liên hệ lại theo các mốc có sẵn dạng Chips: **2 giờ, 4 giờ, Ngày mai, Tuần sau...** Hệ thống sẽ xếp đúng ngày vào mục **Lịch Hẹn** của bạn.
                      </p>
                    </div>

                    <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-950/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Tạm hoãn thông minh (Snooze)</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Nếu đang bận và không muốn khách hiển thị ở danh sách ưu tiên trên Dashboard, hãy chọn **Tạm Hoãn (Snooze)**. Khách hàng sẽ bị ẩn đi một thời gian (ví dụ 4 tiếng, 8 tiếng) và chỉ xuất hiện lại khi thời gian tạm hoãn đã kết thúc.
                      </p>
                    </div>
                  </div>

                  {/* Streak Warning */}
                  <div className="border border-amber-200 dark:border-amber-900/30 p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-800 dark:text-amber-400">Tính năng bảo vệ thời gian: Kháng Liên Lạc & Nguội Lạnh</h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-500/80 mt-1 leading-relaxed">
                        - **Kháng liên lạc (Unreachable Streak):** Nếu bạn lưu báo cáo là *"Chưa liên lạc được"* liên tục quá số lần cấu hình (ví dụ 5 lần), hệ thống tự động chuyển khách sang **"Ngủ đông"** và giãn lịch hẹn về sau 7 ngày.
                        <br />
                        - **Nguội lạnh (Cold Streak):** Nếu 3 cuộc chăm sóc liên tiếp không mang lại tiến triển (giữ nguyên hoặc thụt lùi mốc hành trình), khách cũng sẽ bị đẩy sang **"Ngủ đông"** để bạn tập trung cho lead mới tốt hơn.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "team" && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-md">Chương 4</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">Bán Hàng Đồng Đội (Team Mode)</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      SalesPush cung cấp giải pháp B2B SaaS quản lý chuyên sâu dành cho đội nhóm lớn. Giao diện trực quan giúp phối hợp nhịp nhàng giữa Trưởng phòng (Leader) và Sales.
                    </p>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {/* Grid System for Team */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 space-y-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Target className="w-4 h-4" /></div>
                      <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Điều phối và chia Lead thông minh</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Trưởng phòng (Leader) có quyền xem toàn bộ lead của dự án chưa được bàn giao. Leader chỉ cần chọn một khách và chỉ định thành viên trong nhóm, khách hàng sẽ tự động xuất hiện tại Dashboard cá nhân của Sales đó ngay lập tức!
                      </p>
                    </div>

                    <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 space-y-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                      <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">Bảng phân tích hiệu suất nhóm</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Hệ thống tự động tổng hợp số liệu về số khách đang chăm, đang chờ, số giao dịch đã chốt và số tương tác của từng nhân sự hàng ngày/hàng tuần theo thời gian thực mà không làm giảm tốc độ của app.
                      </p>
                    </div>
                  </div>

                  {/* Least Privilege Mention */}
                  <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-400">Bảo mật thông tin khách hàng tuyệt đối</h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-500/80 mt-1 leading-relaxed">
                        Áp dụng nguyên tắc **Least Privilege (Quyền hạn tối thiểu)**: Trưởng phòng sau khi đã phân Lead cho nhân sự sẽ không nhìn thấy số điện thoại hay thông tin cuộc gọi chi tiết của khách hàng đó nữa, đảm bảo sự tôn trọng tính riêng tư của Sales và tránh rò rỉ dữ liệu.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Guidance */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-xs text-slate-400">Bạn đã sẵn sàng ứng dụng những kiến thức này để đột phá doanh thu?</p>
          <div className="flex justify-center gap-3">
            <Link 
              href="/"
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-transform shadow-sm"
            >
              Vào Dashboard làm việc ngay
            </Link>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}

// Simple fallback helper component for SVG icon
function ShieldCheck(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
