"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return user.id;
}

export async function getAllUsers() {
  await requireAdmin();

  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { customers: true }
      }
    }
  });

  return users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    proUntil: u.proUntil?.toISOString() || null,
  }));
}

export async function topUpUser(userId, amount, note) {
  const adminId = await requireAdmin();

  // Create transaction and update balance in a Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new Error("User not found");

    const newBalance = profile.balance + amount;

    // Update profile
    await tx.profile.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    // Log transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        amount,
        type: "TOPUP",
        note: note || `Admin topup by ${adminId}`,
        status: "COMPLETED",
      },
    });

    return transaction;
  });

  return { success: true, newBalance: result.balance };
}

export async function getPendingTopUps() {
  await requireAdmin();

  const transactions = await prisma.transaction.findMany({
    where: {
      type: "TOPUP",
      status: "PENDING"
    },
    include: {
      profile: {
        select: { email: true, fullName: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return transactions.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString()
  }));
}

export async function approveTopUp(transactionId) {
  const adminId = await requireAdmin();

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.status !== "PENDING") {
      throw new Error("Transaction not found or already processed");
    }

    // Update transaction status
    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: "COMPLETED", note: transaction.note + ` (Duyệt bởi Admin ${adminId})` }
    });

    // Add balance to user
    const profile = await tx.profile.findUnique({ where: { id: transaction.userId } });
    await tx.profile.update({
      where: { id: transaction.userId },
      data: { balance: profile.balance + transaction.amount }
    });

    return true;
  });

  return { success: result };
}

export async function rejectTopUp(transactionId, reason) {
  await requireAdmin();

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { 
      status: "REJECTED",
      note: reason ? `Từ chối: ${reason}` : "Admin từ chối nạp tiền"
    }
  });

  return { success: true };
}

export async function getSystemSettings() {
  const settings = await prisma.systemSetting.findMany();
  const settingsMap = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }
  return settingsMap;
}

export async function updateSystemSetting(key, value) {
  await requireAdmin();
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
  return { success: true };
}
