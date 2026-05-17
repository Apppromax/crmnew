"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getNotifications() {
  try {
    const userId = await requireUser();

    // Chạy song song cả việc lấy thông báo và dọn rác để tăng tốc độ phản hồi
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const [notifications] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.deleteMany({
        where: { userId, createdAt: { lt: fiveDaysAgo } }
      })
    ]);
    return { notifications };
  } catch (err) {
    return { error: err.message };
  }
}

export async function markAsRead(notificationId = null) {
  try {
    const userId = await requireUser();
    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    }
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

// Logic thông minh tự động tạo Noti dựa trên Data của người dùng
export async function triggerSmartAlerts() {
  try {
    const userId = await requireUser();
    
    // 1. Khách Rất nét mà quá 3 ngày chưa cập nhật
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const [forgottenHotLeads, upcomingFollowups] = await Promise.all([
      prisma.customer.findMany({
        where: {
          userId,
          heatLevel: "Rất Nét",
          status: { notIn: ["Đã chốt", "Mất khách"] },
          updatedAt: { lt: threeDaysAgo },
        }
      }),
      prisma.customer.findMany({
        where: {
          userId,
          nextFollowUp: {
            gte: todayStart,
            lte: todayEnd
          }
        }
      })
    ]);

    let newCount = 0;

    if (forgottenHotLeads.length > 0) {
      const existingNotifs = await prisma.notification.findMany({
        where: { userId, type: "ALERT", createdAt: { gte: threeDaysAgo } }
      });
      const newNotifsData = forgottenHotLeads
        .filter(lead => !existingNotifs.some(n => n.body.includes(lead.name)))
        .map(lead => ({
          userId,
          title: "🔥 Khách Rất Nét đang bị bỏ quên!",
          body: `VIP ${lead.name} đã không có tương tác nào trong 3 ngày qua. Hãy nhấc máy gọi ngay!`,
          type: "ALERT",
          actionUrl: "/customers",
        }));
      if (newNotifsData.length > 0) {
        await prisma.notification.createMany({ data: newNotifsData });
        newCount += newNotifsData.length;
      }
    }

    if (upcomingFollowups.length > 0) {
      const existingReminders = await prisma.notification.findMany({
        where: { userId, type: "REMINDER", createdAt: { gte: todayStart } }
      });
      const newRemindersData = upcomingFollowups
        .filter(lead => !existingReminders.some(n => n.body.includes(lead.name)))
        .map(lead => ({
          userId,
          title: "⏰ Lịch hẹn hôm nay",
          body: `Tới giờ chăm sóc ${lead.name} rồi. Nhấn vào để xem chi tiết!`,
          type: "REMINDER",
          actionUrl: "/schedule",
        }));
      if (newRemindersData.length > 0) {
        await prisma.notification.createMany({ data: newRemindersData });
        newCount += newRemindersData.length;
      }
    }

    return { success: true, newCount };
  } catch (err) {
    return { error: err.message };
  }
}
