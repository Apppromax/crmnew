"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Zap, ArrowRight, ClipboardList, Clock } from "lucide-react";
import Logo from "./Logo";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px]" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Navigation */}
        <header className="py-6 flex justify-between items-center animate-fade-in-up">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-2xl font-black tracking-tight text-white">SalesPush</span>
          </div>
          <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
            Đăng nhập
          </Link>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">CRM Thế Hệ Mới</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 animate-fade-in-up leading-tight" style={{ animationDelay: '0.2s' }}>
            Chốt sales <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400">
              nhanh hơn bao giờ hết
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg sm:text-xl text-slate-400 mb-12 animate-fade-in-up font-medium leading-relaxed" style={{ animationDelay: '0.3s' }}>
            Quản lý khách hàng thông minh, tự động nhắc việc, và ưu tiên những cơ hội "nóng" nhất. Tập trung chăm đúng khách, vào đúng thời điểm.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link 
              href="/login" 
              className="group relative inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Bắt đầu miễn phí</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
            
            <a 
              href="#features" 
              className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Tìm hiểu thêm
            </a>
          </div>
        </main>

        {/* Feature Highlights */}
        <section id="features" className="py-20 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {[
            {
              icon: Zap,
              title: "Smart Card Ưu Tiên",
              desc: "Thuật toán thông minh tự động đưa khách hàng tiềm năng nhất lên đầu danh sách của bạn mỗi ngày."
            },
            {
              icon: ClipboardList,
              title: "Quản Lý Đơn Giản",
              desc: "Thao tác vuốt, chạm mượt mà. Không còn cảm giác nặng nề của những phần mềm CRM truyền thống."
            },
            {
              icon: Clock,
              title: "Không Bao Giờ Lỡ Hẹn",
              desc: "Hệ thống nhắc nhở tự động giúp bạn luôn theo sát tiến trình của khách hàng mọi lúc, mọi nơi."
            }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/10">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-white/10 text-slate-500 text-sm font-medium">
          <p>© 2026 SalesPush CRM. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
