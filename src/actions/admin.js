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
