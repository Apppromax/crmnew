"use client";

import React from 'react';

const statuses = ['New', 'Active', 'Waiting', 'Dormant', 'Closed', 'Lost'];

export default function StatusModal({ isOpen, onClose, customer, onUpdateStatus }) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 p-6 text-left shadow-2xl transition-all glass animate-slide-up sm:animate-none">
        <div className="absolute top-3 inset-x-0 flex justify-center sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        
        <div className="mt-4 sm:mt-0">
          <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white mb-1">
            Cập nhật trạng thái
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-1.5">
            Khách hàng: <span className="font-semibold text-slate-800 dark:text-slate-200">{customer.name}</span>
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => {
                  onUpdateStatus(customer.id, status);
                }}
                className={`flex justify-center items-center px-4 py-3 border rounded-xl text-sm font-semibold transition-all duration-200
                  ${customer.status === status 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500' 
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-3.5 text-sm font-bold text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-white active:scale-[0.98] transition-all"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
