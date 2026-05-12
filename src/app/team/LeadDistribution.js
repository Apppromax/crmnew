"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignCustomer } from "@/actions/team";
import { Loader2, ArrowRight, UserCircle2 } from "lucide-react";

export default function LeadDistribution({ members, initialCustomers, teamId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [assigningId, setAssigningId] = useState(null);

  const handleAssign = (customerId, targetUserId) => {
    setAssigningId(customerId);
    startTransition(async () => {
      try {
        await assignCustomer(customerId, targetUserId);
        router.refresh();
      } catch (err) {
        alert(err.message);
      } finally {
        setAssigningId(null);
      }
    });
  };

  if (initialCustomers.length === 0) {
    return (
      <div className="p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md text-center text-slate-500 font-medium">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <UserCircle2 className="w-6 h-6 text-slate-400" />
        </div>
        Kho dữ liệu Team hiện tại đang trống.<br/>Bạn cần thêm khách hàng vào Team để phân bổ.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialCustomers.map((customer) => {
        const currentAssignee = members.find(m => m.userId === customer.userId);

        return (
          <div key={customer.id} className="group relative border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Customer Info */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full shadow-inner ${customer.heatLevel === 'Rất Nét' ? 'bg-red-500 shadow-red-500/50 animate-pulse' : (customer.heatLevel === 'Tiềm Năng' || customer.heatLevel === 'Quan Tâm') ? 'bg-amber-500 shadow-amber-500/50' : 'bg-blue-400 shadow-blue-400/50'}`} />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">{customer.name}</h3>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{customer.phone}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{customer.journeyStage}</span>
                <span className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">Clarity: {customer.clarityScore}</span>
              </div>
            </div>

            {/* Distribution Controls */}
            <div className="relative flex flex-col md:items-end gap-1.5 shrink-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
                Phụ trách
              </span>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <select
                    disabled={isPending && assigningId === customer.id}
                    value={customer.userId || ""}
                    onChange={(e) => handleAssign(customer.id, e.target.value)}
                    className="appearance-none w-full bg-transparent/50 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-white rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all md:min-w-[180px] cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled>-- Chọn người --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.userId}>
                        {m.user.email.split('@')[0]} {m.role === 'LEADER' ? '👑' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                {isPending && assigningId === customer.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                )}
              </div>
              {currentAssignee && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Giao: {currentAssignee.user.email.split('@')[0]}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
