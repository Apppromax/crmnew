"use client";

import React from 'react';
import Link from 'next/link';
import { Home, Users, Calendar, User } from 'lucide-react';

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
    <nav className="fixed bottom-0 inset-x-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800 pb-safe z-40">
      <div className="flex justify-around items-center px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              prefetch={true}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span className={`text-[10px] font-semibold ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary-500 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
