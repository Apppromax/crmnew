"use client";

import React from 'react';

const statusColors = {
  New: 'bg-blue-500',
  Active: 'bg-emerald-500',
  Waiting: 'bg-amber-500',
  Dormant: 'bg-gray-500',
  Closed: 'bg-purple-500',
  Lost: 'bg-red-500'
};

export default function SmartCard({ customer, onClick }) {
  const badgeColor = statusColors[customer.status] || 'bg-gray-500';

  return (
    <div 
      onClick={() => onClick(customer)}
      className="glass rounded-2xl p-4 mb-4 cursor-pointer transform transition duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
    >
      {/* Accent line on left */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${badgeColor} transition-all duration-300 group-hover:w-2`} />
      
      <div className="flex justify-between items-start pl-3">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{customer.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 flex items-center gap-1.5">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            {customer.phone}
          </p>
        </div>
        <div className={`px-2.5 py-1 text-xs font-semibold text-white rounded-full ${badgeColor} shadow-sm`}>
          {customer.status}
        </div>
      </div>
      
      {customer.next_follow_up && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center pl-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lịch chăm sóc</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded">
            {new Date(customer.next_follow_up).toLocaleDateString('vi-VN')}
          </span>
        </div>
      )}
    </div>
  );
}
