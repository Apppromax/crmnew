"use server";

import prisma from "@/lib/prisma";
import { createClient, requireUser } from "@/lib/supabase/server";

export async function getUserProfile() {
  const userId = await requireUser();
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    include: {
      ownedTeam: true,
      teamMembership: {
        include: {
          team: true
        }
      }
    }
  });
  return profile;
}

export async function upgradeToPro(months = 1) {
  const userId = await requireUser();
  const PRICE_PER_MONTH = 99000; // 99k / month
  const totalCost = PRICE_PER_MONTH * months;

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new Error("User not found");

    if (profile.balance < totalCost) {
      throw new Error("Số dư không đủ. Vui lòng nạp thêm Credits.");
    }

    // Calculate new pro date
    const now = new Date();
    let newProUntil = profile.proUntil && profile.proUntil > now ? new Date(profile.proUntil) : now;
    newProUntil.setMonth(newProUntil.getMonth() + months);

    // Deduct balance and update pro status
    const updated = await tx.profile.update({
      where: { id: userId },
      data: {
        balance: profile.balance - totalCost,
        isPro: true,
        proUntil: newProUntil,
      },
    });

    // Log transaction
    await tx.transaction.create({
      data: {
        userId,
        amount: -totalCost,
        type: "SPEND",
        note: `Đăng ký gói PRO ${months} tháng`,
        status: "COMPLETED",
      },
    });

    return updated;
  });

  return { success: true, proUntil: result.proUntil };
}

export async function updateProfileInfo({ fullName, phone }) {
  const userId = await requireUser();
  await prisma.profile.update({
    where: { id: userId },
    data: { fullName, phone }
  });
  return { success: true };
}

export async function updateProfileSettings(data) {
  const userId = await requireUser();
  await prisma.profile.update({
    where: { id: userId },
    data: {
      defaultSnoozeHours: data.defaultSnoozeHours,
      defaultFollowUpDays: data.defaultFollowUpDays,
      maxMissedCalls: data.maxMissedCalls,
      queueSize: data.queueSize,
      confirmSnooze: data.confirmSnooze,
      theme: data.theme,
      bgPattern: data.bgPattern
    }
  });
  return { success: true };
}

export async function getUserTransactions() {
  const userId = await requireUser();
  const tx = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return tx;
}

export async function upgradeTeamPro(months = 1, seats = 5) {
  const userId = await requireUser();
  const PRICE_PER_SEAT_MONTH = 99000;
  const totalCost = PRICE_PER_SEAT_MONTH * seats * months;

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { id: userId }, include: { ownedTeam: true } });
    if (!profile) throw new Error("User not found");
    if (!profile.ownedTeam) throw new Error("Bạn không phải là trưởng phòng");

    if (profile.balance < totalCost) {
      throw new Error("Số dư không đủ. Vui lòng nạp thêm Credits.");
    }

    const team = profile.ownedTeam;
    const now = new Date();
    let newValidUntil = team.validUntil && team.validUntil > now ? new Date(team.validUntil) : now;
    newValidUntil.setMonth(newValidUntil.getMonth() + months);

    await tx.profile.update({
      where: { id: userId },
      data: { balance: profile.balance - totalCost },
    });

    const updatedTeam = await tx.team.update({
      where: { id: team.id },
      data: {
        isActive: true,
        validUntil: newValidUntil,
        maxMembers: seats
      }
    });

    await tx.transaction.create({
      data: {
        userId,
        amount: -totalCost,
        type: "SPEND",
        note: `Đăng ký gói TEAM PRO ${months} tháng (${seats} users)`,
        status: "COMPLETED",
      },
    });

    return updatedTeam;
  });

  return { success: true, validUntil: result.validUntil };
}

export async function requestTopUp(amount, bankRef) {
  const userId = await requireUser();
  
  if (!amount || amount < 10000) {
    throw new Error("Số tiền nạp tối thiểu là 10,000đ");
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount,
      type: "TOPUP",
      note: `Yêu cầu nạp tiền: ${bankRef || "Chuyển khoản"}`,
      status: "PENDING",
    },
  });

  return { success: true, transactionId: transaction.id };
}
