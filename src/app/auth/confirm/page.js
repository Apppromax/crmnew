"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

export default function ConfirmPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Fetch the verified user email
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setEmail(data.user.email);
      }
    });

    // Countdown and redirect logic
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRedirect = () => {
    setRedirecting(true);
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden font-sans">
      {/* Styles for custom drawing animations and progress bar */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes ring-pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-draw-check {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw-check 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s;
        }
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-ring-pulse {
          animation: ring-pulse 3s ease-in-out infinite;
        }
      `}} />

      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        {/* Branding header */}
        <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Logo size="lg" className="mb-4 mx-auto" />
          <h2 className="text-3xl font-black text-white tracking-tight">
            SalesPush
          </h2>
        </div>

        {/* Glassmorphic Success Card */}
        <div className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-3xl py-10 px-8 relative overflow-hidden text-center animate-scale-in">
          {/* Subtle top border shine */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

          {/* Success Icon */}
          <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ring-pulse" />
            <div className="absolute -inset-2 rounded-full border border-emerald-500/20" />
            <svg className="w-20 h-20 text-emerald-400 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" className="opacity-20" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" className="animate-draw-check" />
            </svg>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Xác thực thành công
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Chào mừng bạn tham gia!
            </h1>
            <p className="text-base text-slate-300 font-medium max-w-md mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Tài khoản của bạn <span className="text-emerald-400 font-semibold">{email || "của bạn"}</span> đã được xác nhận và đồng bộ thành công vào hệ thống SalesPush.
            </p>
          </div>

          {/* Progress bar / Countdown */}
          <div className="mt-10 mb-6 px-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2.5">
              <span>Đang chuyển hướng đến Dashboard...</span>
              <span className="text-indigo-400">{countdown}s</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Direct CTA */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={handleRedirect}
              disabled={redirecting}
              className="group w-full py-4 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2 overflow-hidden relative"
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-1.5">
                {redirecting ? "Đang chuyển hướng..." : "Đến Dashboard Ngay"}
                {!redirecting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-slate-500 font-medium animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          &copy; {new Date().getFullYear()} SalesPush. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}
