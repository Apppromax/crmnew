"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getUserProfile() {
  const userId = await requireUser();
  const profile = await prisma.profile.findUnique({
    where: { id: userId }
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

export async function updateProfileInfo({ fullName }) {
  const userId = await requireUser();
  await prisma.profile.update({
    where: { id: userId },
    data: { fullName }
  });
  return { success: true };
}

export async function updateDefaultSnoozeHours(hours) {
  const userId = await requireUser();
  await prisma.profile.update({
    where: { id: userId },
    data: { defaultSnoozeHours: hours }
  });
  return { success: true };
}
