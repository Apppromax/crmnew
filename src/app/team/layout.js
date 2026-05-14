import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export const metadata = {
  title: "Team Management - SalesPush",
};

export default function TeamLayout({ children }) {
  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 dark:text-slate-100">
      {/* City Skyline Background */}
      <div 
        className="dashboard-bg-illustration fixed top-0 right-0 w-full max-w-2xl h-[500px] z-0 pointer-events-none opacity-90 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          maskImage: 'radial-gradient(100% 100% at 100% 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(100% 100% at 100% 0%, black 20%, transparent 100%)'
        }}
      />
      
      {/* Soft Wave Gradients */}
      <div className="fixed top-[-10%] left-[-20%] w-[70%] h-[400px] rounded-full bg-blue-200/50 dark:bg-blue-900/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[5%] right-[-10%] w-[60%] h-[500px] rounded-full bg-blue-300/30 dark:bg-blue-800/20 blur-[120px] pointer-events-none z-0"></div>

      <header className="px-6 py-4 border-b border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold drop-shadow-sm">
            <Users className="w-5 h-5" />
            <span>Quản Trị Đội Nhóm</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
