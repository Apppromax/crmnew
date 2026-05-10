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
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
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
    
    // 1. Khách Nóng (Hot) mà quá 3 ngày chưa cập nhật
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const forgottenHotLeads = await prisma.customer.findMany({
      where: {
        userId,
        heatLevel: "Hot",
        status: { notIn: ["Closed", "Lost"] },
        updatedAt: { lt: threeDaysAgo },
      }
    });

    let newCount = 0;

    for (const lead of forgottenHotLeads) {
      const existing = await prisma.notification.findFirst({
        where: { 
          userId, 
          type: "ALERT", 
          body: { contains: lead.name },
          createdAt: { gte: threeDaysAgo } 
        }
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId,
            title: "🔥 Khách Nóng đang bị bỏ quên!",
            body: `VIP ${lead.name} đã không có tương tác nào trong 3 ngày qua. Hãy nhấc máy gọi ngay!`,
            type: "ALERT",
          }
        });
        newCount++;
      }
    }

    // 2. Lịch hẹn trong ngày hôm nay
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const upcomingFollowups = await prisma.customer.findMany({
      where: {
        userId,
        nextFollowUp: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    for (const lead of upcomingFollowups) {
      const existing = await prisma.notification.findFirst({
        where: { 
          userId, 
          type: "REMINDER", 
          body: { contains: lead.name },
          createdAt: { gte: todayStart } 
        }
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId,
            title: "⏰ Lịch hẹn hôm nay",
            body: `Tới giờ chăm sóc ${lead.name} rồi. Nhấn vào để xem chi tiết!`,
            type: "REMINDER",
          }
        });
        newCount++;
      }
    }

    return { success: true, newCount };
  } catch (err) {
    return { error: err.message };
  }
}
