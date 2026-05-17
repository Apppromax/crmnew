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



      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
