"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, CheckCheck, Flame, Clock, AlertTriangle, Info } from "lucide-react";
import { getNotifications, markAsRead } from "@/actions/notifications";

export default function NotificationSheet({ isOpen, onClose }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (notifications.length === 0) setLoading(true);
    const res = await getNotifications();
    if (res.notifications) {
      setNotifications(res.notifications);
    }
    setLoading(false);
  }, [notifications.length]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        loadNotifications();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isOpen, loadNotifications]);

  const handleMarkAllRead = async () => {
    await markAsRead();
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
      setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    }
    
    if (notif.actionUrl) {
      onClose(); // Đóng sheet trước khi chuyển trang
      router.push(notif.actionUrl);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ALERT': return <Flame className="w-5 h-5 text-red-500" />;
      case 'REMINDER': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'TEAM': return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-primary-500" />;
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins || 1} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div 
        className="w-full sm:w-[400px] h-full bg-[#F4F8FB] dark:bg-slate-950 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        <div className="pt-safe px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-500" />
            Thông báo
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mới nhất</span>
          <button onClick={handleMarkAllRead} className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:text-primary-700 transition-colors">
            <CheckCheck className="w-4 h-4" /> Đánh dấu đã đọc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-safe">
          {loading ? (
            <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-10 text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Bạn không có thông báo nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 flex gap-3 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="mt-1 shrink-0 w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-sm ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-1 shrink-0 shadow-sm shadow-primary-500/50 animate-pulse"></span>}
                    </div>
                    <p className={`text-sm mt-1 leading-snug ${!n.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                      {n.body}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getTimeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
