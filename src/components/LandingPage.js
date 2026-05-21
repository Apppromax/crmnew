"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Zap, ArrowRight, ClipboardList, Clock, Star, CheckCircle, Smartphone, LayoutDashboard, BrainCircuit } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Logo from "./Logo";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!mounted) return null;

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans selection:bg-indigo-200 selection:text-indigo-900">
      {/* Interactive Background */}
      <motion.div style={{ y: yBg }} className="absolute top-0 left-0 w-full h-[120vh] overflow-hidden z-0 pointer-events-none opacity-40">
        <Image
          src="/images/abstract-bg.png"
          alt="Abstract Background"
          fill
          priority
          sizes="100vw"
          className="object-cover mix-blend-multiply opacity-60"
        />
      </motion.div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Navigation */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 rounded-b-2xl mb-8 px-6"
        >
          <div className="flex items-center gap-3">
            <Logo size="md" className="text-indigo-600" />
            <span className="text-2xl font-black tracking-tight text-slate-900">SalesPush</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#features" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Tính năng</Link>
            <Link href="#pricing" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Bảng giá</Link>
            <Link href="/login" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
              Đăng nhập
            </Link>
          </div>
        </motion.header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center pt-12 pb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">CRM Thế Hệ Mới - Light Mode Premium</span>
          </motion.div>
          
          <motion.h1 
            initial="hidden" animate="visible" variants={fadeInUp}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight text-slate-900"
          >
            Chốt sales <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500">
              nhanh hơn bao giờ hết
            </span>
          </motion.h1>
          
          <motion.p 
            initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.2 }}
            className="max-w-2xl text-lg sm:text-xl text-slate-600 mb-12 font-medium leading-relaxed"
          >
            Quản lý khách hàng thông minh, tự động nhắc việc, và ưu tiên những cơ hội &quot;nóng&quot; nhất. Trải nghiệm tốc độ đỉnh cao với giao diện tối giản, sang trọng.
          </motion.p>

          <motion.div 
            initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20"
          >
            <Link 
              href="/login" 
              className="group relative inline-flex justify-center items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1 active:scale-95"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Bắt đầu dùng thử miễn phí</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
            
            <a 
              href="#how-it-works" 
              className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all hover:-translate-y-1 shadow-sm"
            >
              Cách hoạt động
            </a>
          </motion.div>

          {/* Graphic/Mockup Section */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring", bounce: 0.4 }}
            className="w-full max-w-5xl relative rounded-[2rem] p-2 bg-gradient-to-b from-slate-200 to-white shadow-2xl"
          >
            <div className="absolute inset-0 -z-10 bg-indigo-500/10 blur-[100px] rounded-full" />
            <Image
              src="/images/crm-mockup.png"
              alt="SalesPush CRM Dashboard"
              width={1024}
              height={1024}
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="w-full h-auto rounded-[1.5rem] border border-white shadow-lg object-cover"
            />
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 backdrop-blur-md hidden md:flex"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Chốt đơn thành công!</p>
                <p className="text-xs text-slate-500">+15.000.000đ</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 backdrop-blur-md hidden md:flex"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">AI Đề xuất</p>
                <p className="text-xs text-slate-500">Gọi ngay khách hàng nóng</p>
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* How It Works */}
        <section id="how-it-works" className="py-24">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4">Cách SalesPush Hoạt Động</h2>
            <p className="text-lg text-slate-600 font-medium">Quy trình tối giản giúp bạn tập trung 100% vào việc tư vấn.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { step: "01", title: "Nhập liệu siêu tốc", desc: "Thêm thông tin khách hàng chỉ trong vài giây. AI tự động phân tích và chấm điểm tiềm năng." },
              { step: "02", title: "Smart Queue Ưu tiên", desc: "Mỗi sáng thức dậy, hệ thống đã xếp sẵn danh sách những khách hàng 'Nóng' nhất cần gọi." },
              { step: "03", title: "Vuốt để Chốt đơn", desc: "Giao diện vuốt như Tinder. Vuốt phải để gọi lại, vuốt trái để bỏ qua. Chốt sales mượt mà." }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-8xl font-black text-slate-50 group-hover:text-indigo-50 transition-colors z-0 select-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 border-t border-slate-200/50">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4 text-center">Trải nghiệm khác biệt</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Feature 1 - Large */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Giao diện Dashboard Thông minh</h3>
                <p className="text-slate-600 leading-relaxed font-medium max-w-md">
                  Không còn những bảng tính Excel phức tạp. Mọi chỉ số KPI, tỷ lệ chuyển đổi và nhắc việc đều nằm gọn trên một màn hình thân thiện.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                 <LayoutDashboard className="w-64 h-64 translate-x-1/4 translate-y-1/4" />
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }}
              className="col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Mobile-First UI</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Thiết kế tối ưu hoàn toàn cho điện thoại. Bạn có thể chăm sóc khách hàng ở bất cứ đâu.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }}
              className="col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Nhắc nhở Zero-Drop</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Đảm bảo 100% khách hàng đều được liên hệ đúng thời điểm, không bỏ lỡ bất kỳ cơ hội nào.
              </p>
            </motion.div>

            {/* Feature 4 - Large */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.3 }}
              className="col-span-1 md:col-span-2 bg-gradient-to-br from-violet-50 to-white rounded-3xl p-8 border border-violet-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
            >
               <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-violet-600/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Smart Queue & Thao tác vuốt</h3>
                <p className="text-slate-600 leading-relaxed font-medium max-w-md">
                  Thay vì bấm hàng chục nút, hãy vuốt trái để bỏ qua, vuốt phải để đưa vào danh sách ưu tiên. Tốc độ xử lý tăng gấp 3 lần.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                 <Zap className="w-64 h-64 translate-x-1/4 translate-y-1/4" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 border-t border-slate-200/50 bg-slate-100/50 -mx-6 sm:-mx-12 lg:-mx-20 px-6 sm:px-12 lg:px-20">
           <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4">Được tin dùng bởi các Top Sales</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
               { name: "Hoàng Minh", role: "Chuyên viên Môi giới BĐS", quote: "Từ khi dùng SalesPush, tôi không còn lo bị quên lịch hẹn khách hàng. Thao tác trên điện thoại cực kỳ mượt, giống hệt app của Apple!" },
               { name: "Thu Trang", role: "Trưởng phòng Kinh doanh", quote: "Giao diện sáng sủa, sạch sẽ giúp đội nhóm của tôi làm việc cả ngày mà không mỏi mắt. Hiệu suất tăng lên rõ rệt." }
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.2 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-6 leading-relaxed">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div>
                    <h4 className="font-bold text-slate-900">{t.name}</h4>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing CTA */}
        <section id="pricing" className="py-24 border-t border-slate-200/50">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-6">Sẵn sàng bứt phá doanh số?</h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Bắt đầu hoàn toàn miễn phí, không yêu cầu thẻ tín dụng. Nâng cấp lên gói Pro khi đội ngũ của bạn lớn mạnh.
              </p>
              <Link 
                href="/login" 
                className="inline-flex justify-center items-center px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl"
              >
                Tạo tài khoản miễn phí
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-slate-500 text-sm font-medium">
          <p>© 2026 SalesPush CRM. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
