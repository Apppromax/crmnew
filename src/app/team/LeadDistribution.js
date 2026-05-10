"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignCustomer } from "@/actions/team";
import { Loader2, ArrowRight } from "lucide-react";

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
      <div className="p-8 border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center text-slate-500 font-medium">
        Kho dữ liệu Team hiện tại đang trống. Bạn cần thêm khách hàng vào Team để phân bổ.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialCustomers.map((customer) => {
        const currentAssignee = members.find(m => m.userId === customer.userId);

        return (
          <div key={customer.id} className="border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-500 transition-colors">
            {/* Customer Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${customer.heatLevel === 'Hot' ? 'bg-red-500' : customer.heatLevel === 'Warm' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                <h3 className="text-xl font-black">{customer.name}</h3>
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">{customer.phone}</p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>{customer.journeyStage}</span>
                <span>•</span>
                <span>Clarity: {customer.clarityScore}</span>
              </div>
            </div>

            {/* Distribution Controls */}
            <div className="flex flex-col md:items-end gap-2 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                Phụ trách hiện tại
              </span>
              
              <div className="flex items-center gap-2">
                <select
                  disabled={isPending && assigningId === customer.id}
                  value={customer.userId || ""}
                  onChange={(e) => handleAssign(customer.id, e.target.value)}
                  className="bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-bold p-3 focus:outline-none focus:border-primary-500 min-w-[200px]"
                >
                  <option value="" disabled>-- Chọn người phụ trách --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.userId}>
                      {m.user.email} {m.role === 'LEADER' ? '(Leader)' : ''}
                    </option>
                  ))}
                </select>

                {isPending && assigningId === customer.id && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                )}
              </div>
              {currentAssignee && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  Đang giao cho: {currentAssignee.user.email.split('@')[0]}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
