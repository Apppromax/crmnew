import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F4F8FB] dark:bg-slate-950 flex flex-col items-center justify-center p-6 pb-24 transition-colors duration-300">
      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-primary-500/10 flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 bg-primary-500/20 rounded-3xl animate-ping"></div>
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400 relative z-10" />
      </div>
      
      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">SalesPush CRM</h2>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Đang nạp không gian làm việc...</p>
      
      {/* Skeleton preview to give a perception of fast layout load */}
      <div className="w-full max-w-md mt-16 space-y-4 opacity-40">
        <div className="flex gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse delay-75"></div>
          </div>
        </div>
        
        <div className="h-40 w-full bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse shadow-sm"></div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse delay-75 shadow-sm"></div>
          <div className="h-24 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse delay-100 shadow-sm"></div>
        </div>
      </div>
    </div>
  );
}
