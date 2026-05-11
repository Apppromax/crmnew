"use client";

import React from 'react';
import Link from 'next/link';
import { Home, Users, Calendar, User, Sparkles, BrainCircuit } from 'lucide-react';

const tabs = [
  {
    id: 'home',
    href: '/',
    label: 'Hôm nay',
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: 'customers',
    href: '/customers',
    label: 'Khách hàng',
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: 'ai',
    href: '/ai',
    label: 'AI Engine',
    icon: <BrainCircuit className="w-6 h-6" />,
  },
  {
    id: 'schedule',
    href: '/schedule',
    label: 'Lịch hẹn',
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    id: 'profile',
    href: '/profile',
    label: 'Cá nhân',
    icon: <User className="w-6 h-6" />,
  },
];

export default function BottomNav({ activeTab = 'home' }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 md:inset-y-0 md:right-auto md:w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t md:border-t-0 md:border-r border-slate-200/60 dark:border-slate-800 pb-safe z-40 flex flex-col transition-all duration-300">
      
      {/* Desktop Logo - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-3 px-6 py-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">SalesPush</h2>
          <p className="text-[10px] font-bold text-primary-500 tracking-wider uppercase mt-1">Smart CRM</p>
        </div>
      </div>

      <div className="flex md:flex-col justify-around md:justify-start md:gap-2 items-center md:items-stretch px-2 md:px-4 py-1 md:py-0 w-full h-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              prefetch={true}
              className={`group flex flex-col md:flex-row items-center gap-0.5 md:gap-4 py-1 md:py-3.5 px-3 md:px-4 rounded-xl transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/10 md:bg-primary-50 md:dark:bg-primary-500/10'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 md:hover:bg-slate-50 md:dark:hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary-500" />
              )}
              
              <div className={`transition-transform duration-200 ${isActive ? 'md:scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </div>
              
              <span className={`text-[10px] md:text-sm font-semibold md:font-bold ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                {tab.label}
              </span>
              
              {isActive && (
                <div className="md:hidden w-1 h-1 rounded-full bg-primary-500 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
