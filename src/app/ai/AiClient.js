"use client";

import { useState, useTransition } from "react";
import { generateWeeklyStrategy } from "@/actions/ai";
import BottomNav from "@/components/BottomNav";
import { Sparkles, BarChart3, Users, Flame, ThermometerSun, Snowflake, Loader2, Calendar, FileText, AlertTriangle, CalendarCheck, Trophy, TrendingUp } from "lucide-react";

function formatMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(<li key={i} className="ml-4 mb-1 list-disc" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />);
    } else if (line.trim().startsWith('### ')) {
      elements.push(<h4 key={i} className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-white" dangerouslySetInnerHTML={{ __html: line.substring(4) }} />);
    } else if (line.trim().startsWith('## ')) {
      elements.push(<h3 key={i} className="text-xl font-black mt-5 mb-3 text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: line.substring(3) }} />);
    } else if (line.trim().startsWith('# ')) {
      elements.push(<h2 key={i} className="text-2xl font-black mt-6 mb-3 text-primary-600 dark:text-primary-400" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="mb-2 text-slate-600 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: line }} />);
    }
  }
  return elements;
}

export default function AiClient({ initialReports, customerCounts, dashboardStats }) {
  const [reports, setReports] = useState(initialReports || []);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const coldCount = Math.max(0, customerCounts.total - customerCounts.hot - customerCounts.warm);

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await generateWeeklyStrategy();
        if (res.error) {
          setError(res.error);
        } else if (res.report) {
          setReports(prev => [res.report, ...prev].slice(0, 3));
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tạo báo cáo.");
      }
    });
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-0 md:pl-64 font-sans transition-all duration-300">
      <header className="pt-safe px-6 pt-6 pb-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" />
          AI ENGINE
        </h1>
      </header>

      <main className="px-4 pt-6 space-y-6 md:max-w-3xl md:mx-auto w-full">
        
        {/* Dashboard Section */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Tổng quan Khách hàng</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Tổng Leads</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{customerCounts.total}</p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase">Khách Nóng</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{customerCounts.hot}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ThermometerSun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase">Khách Ấm</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{customerCounts.warm}</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Khách Lạnh</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{coldCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Stats Panel */}
        {dashboardStats && (
          <div className="space-y-4">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
                <div><p className="text-[10px] font-bold uppercase text-slate-400">Quá hạn</p><p className="text-lg font-black text-slate-900 dark:text-white">{dashboardStats.overdue}</p></div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center"><CalendarCheck className="w-4 h-4 text-blue-500" /></div>
                <div><p className="text-[10px] font-bold uppercase text-slate-400">Hẹn hôm nay</p><p className="text-lg font-black text-slate-900 dark:text-white">{dashboardStats.todaySchedule}</p></div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center"><Trophy className="w-4 h-4 text-emerald-500" /></div>
                <div><p className="text-[10px] font-bold uppercase text-slate-400">Chốt tháng</p><p className="text-lg font-black text-slate-900 dark:text-white">{dashboardStats.closedThisMonth}</p></div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary-500" /></div>
                <div><p className="text-[10px] font-bold uppercase text-slate-400">Tổng active</p><p className="text-lg font-black text-slate-900 dark:text-white">{dashboardStats.total}</p></div>
              </div>
            </div>

            {/* Sales Funnel */}
            {dashboardStats.funnel && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">📊 Phễu bán hàng</p>
                <div className="space-y-3">
                  {dashboardStats.funnel.map((item, idx) => {
                    const maxCount = Math.max(...dashboardStats.funnel.map(f => f.count), 1);
                    const pct = (item.count / maxCount) * 100;
                    const colors = ['bg-slate-400', 'bg-blue-400', 'bg-cyan-400', 'bg-amber-400', 'bg-orange-400', 'bg-emerald-500'];
                    return (
                      <div key={item.stage} className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-24 shrink-0 truncate">{item.stage}</span>
                        <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[idx] || 'bg-primary-500'} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 4)}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Button Area */}
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-3xl blur-xl transition-all duration-1000 ${isPending ? 'opacity-80 animate-pulse' : 'opacity-40 group-hover:opacity-60'}`}></div>
          <button 
            onClick={handleGenerate}
            disabled={isPending}
            className="relative w-full bg-slate-900 dark:bg-slate-800 border border-slate-700 p-6 rounded-3xl text-center active:scale-95 transition-transform overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 opacity-10">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            <div className="flex flex-col items-center gap-3 relative z-10">
              {isPending ? (
                <>
                  <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                  <h3 className="text-xl font-black text-white">AI đang phân tích dữ liệu...</h3>
                  <p className="text-slate-400 text-sm">Vui lòng đợi vài giây để hệ thống quét toàn bộ khách hàng và đưa ra định hướng.</p>
                </>
              ) : (
                <>
                  <Sparkles className="w-10 h-10 text-primary-400" />
                  <h3 className="text-xl font-black text-white">Cố vấn Chiến lược Tuần Tới</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">Phân tích toàn bộ data khách hàng hiện tại và đề xuất hành động cụ thể để bạn đạt KPI chốt sale nhanh nhất.</p>
                </>
              )}
            </div>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        {/* Recent Reports */}
        {reports.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <FileText className="w-5 h-5 text-slate-500" />
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">Báo cáo gần nhất</h2>
            </div>
            
            {reports.map((report, idx) => (
              <div key={report.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {idx === 0 ? "Báo cáo mới nhất" : `Báo cáo ngày ${new Date(report.createdAt).toLocaleDateString('vi-VN')}`}
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {formatDate(report.createdAt)}
                  </span>
                </div>
                
                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                  {formatMarkdown(report.content)}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <BottomNav activeTab="ai" />
    </div>
  );
}
