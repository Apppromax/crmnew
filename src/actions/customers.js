"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

function enrichStatus(customer) {
  if (!customer) return customer;
  if (customer.status !== "Đang chăm" && customer.status !== "Đang chờ") return customer;
  if (!customer.lastContactAt) return customer;

  const now = new Date();
  const lastContact = new Date(customer.lastContactAt);
  const diffMinutes = (now - lastContact) / 60000;

  if (diffMinutes <= 30) {
    customer.status = "Đang chăm";
  } else if (customer.nextFollowUp) {
    customer.status = "Đang chờ";
  }

  return customer;
}

export async function getSmartQueue() {
  const userId = await requireUser();
  const now = new Date();

  const customers = await prisma.customer.findMany({
    where: {
      userId,
      status: { notIn: ["Đã chốt", "Mất khách"] },
      OR: [
        { snoozedUntil: null },
        { snoozedUntil: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { nextFollowUp: null },
            { nextFollowUp: { lte: now } }
          ]
        }
      ]
    },
    orderBy: [
      { clarityScore: "desc" },
      { lastContactAt: "asc" },
      { nextFollowUp: "asc" },
    ],
    take: 10,
  });

  // Re-sort: overdue first, then journeyStage
  const sorted = customers.sort((a, b) => {
    const aOverdue = a.nextFollowUp && a.nextFollowUp < now ? 0 : 1;
    const bOverdue = b.nextFollowUp && b.nextFollowUp < now ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    
    const aJourney = parseInt((a.journeyStage || "1.").split(".")[0]) || 1;
    const bJourney = parseInt((b.journeyStage || "1.").split(".")[0]) || 1;
    if (aJourney !== bJourney) return bJourney - aJourney;
    
    return b.clarityScore - a.clarityScore;
  });

  return sorted.slice(0, 10).map((c) => enrichStatus({
    ...c,
    nextFollowUp: c.nextFollowUp?.toISOString() || null,
    lastContactAt: c.lastContactAt?.toISOString() || null,
    snoozedUntil: c.snoozedUntil?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function getAllCustomers() {
  const userId = await requireUser();
  const customers = await prisma.customer.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((c) => enrichStatus({
    ...c,
    nextFollowUp: c.nextFollowUp?.toISOString() || null,
    lastContactAt: c.lastContactAt?.toISOString() || null,
    snoozedUntil: c.snoozedUntil?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function completeCustomerAction({ customerId, note, nextFollowUp, status, journeyStage, nextAction, journeyProgress }) {
  const userId = await requireUser();
  const now = new Date();

  // Validate ownership
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found or unauthorized");

  const fullNote = nextAction ? `${note || "Đã chăm sóc"}\n\nHành động tiếp theo: ${nextAction}` : (note || "Đã chăm sóc");

  let coldStreak = existing.coldStreak || 0;
  if (journeyProgress === "Lên mốc") {
    coldStreak = 0;
  } else if (journeyProgress === "Nguội đi" || journeyProgress === "Giữ nguyên") {
    coldStreak += 1;
  }

  const updateData = { lastContactAt: now, coldStreak };
  if (nextFollowUp !== undefined) updateData.nextFollowUp = nextFollowUp ? new Date(nextFollowUp) : null;
  
  if (status) {
    updateData.status = status;
  } else if (coldStreak >= 3 && journeyProgress === "Nguội đi") {
    updateData.status = "Ngủ đông";
  } else if (!existing.status || ["Mới", "Đang chăm", "Đang chờ"].includes(existing.status)) {
    updateData.status = "Đang chăm";
  }
  
  if (journeyStage) updateData.journeyStage = journeyStage;

  const transactionOps = [
    prisma.interaction.create({
      data: {
        customerId,
        type: "note",
        summary: fullNote,
      },
    })
  ];

  if (fullNote) {
    transactionOps.push(
      prisma.note.create({
        data: {
          customerId,
          rawText: fullNote,
        },
      })
    );
  }

  transactionOps.push(
    prisma.customer.update({
      where: { id: customerId },
      data: updateData,
    })
  );

  await prisma.$transaction(transactionOps);

  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath("/schedule");

  return { success: true };
}

export async function snoozeCustomer(customerId, hours = null) {
  const userId = await requireUser();
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found or unauthorized");

  let snoozeDuration = hours;
  if (!snoozeDuration) {
    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    snoozeDuration = profile?.defaultSnoozeHours || 4;
  }

  const snoozedUntil = new Date(Date.now() + snoozeDuration * 3600000);

  await prisma.customer.update({
    where: { id: customerId },
    data: { snoozedUntil },
  });

  revalidatePath("/");
  revalidatePath("/customers");

  return { success: true };
}

export async function clearAllSnoozes() {
  const userId = await requireUser();
  await prisma.customer.updateMany({
    where: { userId },
    data: { snoozedUntil: null },
  });
  revalidatePath("/");
  revalidatePath("/customers");
  return { success: true };
}

export async function createCustomer({ name, phone, note, budget, area, timeline, heatLevel, demand, tags, status, nextFollowUp, journeyStage }) {
  const userId = await requireUser();

  // Kiểm tra xem user có thuộc team nào không
  const membership = await prisma.teamMember.findUnique({
    where: { userId }
  });
  const teamId = membership ? membership.teamId : null;

  const customer = await prisma.customer.create({
    data: {
      userId,
      teamId,
      name,
      phone,
      budget,
      area,
      timeline,
      demand,
      status: status || "Mới",
      heatLevel: heatLevel || "Chưa Rõ",
      clarityScore: 0,
      journeyStage: journeyStage || "1. Phá băng và làm rõ nhu cầu",
      tags: tags || [],
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      notes: note ? {
        create: [{ rawText: note }]
      } : undefined
    },
  });

  revalidatePath("/");
  revalidatePath("/customers");

  return customer;
}

export async function updateCustomer(customerId, data) {
  const userId = await requireUser();
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found or unauthorized");

  const allowedFields = ["name", "phone", "status", "heatLevel", "budget", "area", "demand", "timeline", "journeyStage", "tags", "nextFollowUp", "snoozedUntil"];
  const dateFields = ["nextFollowUp", "snoozedUntil"];
  const updateData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      updateData[key] = dateFields.includes(key) && data[key] ? new Date(data[key]) : data[key];
    }
  }

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/customers");

  return enrichStatus({
    ...updated,
    nextFollowUp: updated.nextFollowUp?.toISOString() || null,
    lastContactAt: updated.lastContactAt?.toISOString() || null,
    snoozedUntil: updated.snoozedUntil?.toISOString() || null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function deleteCustomer(customerId) {
  const userId = await requireUser();
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found or unauthorized");

  await prisma.customer.delete({ where: { id: customerId } });

  revalidatePath("/");
  revalidatePath("/customers");

  return { success: true };
}

export async function getCustomerInteractions(customerId) {
  const userId = await requireUser();
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found or unauthorized");

  const [interactions, notes] = await Promise.all([
    prisma.interaction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.note.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  // Merge and sort by date
  const timeline = [
    ...interactions.map(i => ({
      id: i.id,
      type: "interaction",
      content: i.summary || i.type,
      outcome: i.outcome,
      createdAt: i.createdAt.toISOString(),
    })),
    ...notes.map(n => ({
      id: n.id,
      type: "note",
      content: n.rawText,
      createdAt: n.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return timeline;
}

export async function updateCustomerTags(customerId, tags) {
  const userId = await requireUser();
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found");

  await prisma.customer.update({
    where: { id: customerId },
    data: { tags },
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function getAllTags() {
  const userId = await requireUser();
  const customers = await prisma.customer.findMany({
    where: { userId },
    select: { tags: true },
  });
  const tagSet = new Set();
  customers.forEach(c => c.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export async function getCustomerCount() {
  const userId = await requireUser();
  const [total, hot, warm] = await Promise.all([
    prisma.customer.count({
      where: { userId, status: { notIn: ["Đã chốt", "Mất khách"] } },
    }),
    prisma.customer.count({ where: { userId, heatLevel: "Rất Nét" } }),
    prisma.customer.count({ where: { userId, heatLevel: "Tiềm Năng" } }),
  ]);
  return { total, hot, warm };
}

export async function getDashboardStats() {
  const userId = await requireUser();
  const now = new Date();

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);

  const activeFilter = { userId, status: { notIn: ["Đã chốt", "Mất khách"] } };

  // Run ALL queries in parallel (single round-trip)
  const [total, hot, warm, overdue, todaySchedule, closedThisMonth, ...funnelCounts] = await Promise.all([
    prisma.customer.count({ where: activeFilter }),
    prisma.customer.count({ where: { ...activeFilter, heatLevel: "Rất Nét" } }),
    prisma.customer.count({ where: { ...activeFilter, heatLevel: "Tiềm Năng" } }),
    prisma.customer.count({ where: { ...activeFilter, nextFollowUp: { lt: now } } }),
    prisma.customer.count({ where: { userId, nextFollowUp: { gte: todayStart, lte: todayEnd } } }),
    prisma.customer.count({ where: { userId, status: "Đã chốt", updatedAt: { gte: monthStart } } }),
    // Funnel stages (6 queries in parallel)
    ...["1. Phá băng và làm rõ nhu cầu", "2. Tư vấn sản phẩm", "3. Xây dựng lòng tin", "4. Hẹn gặp/xem", "5. Xử lý từ chối", "6. Chốt giao dịch"]
      .map(s => prisma.customer.count({ where: { userId, journeyStage: s, status: { notIn: ["Mất khách"] } } }))
  ]);

  const stages = ["1. Phá băng và làm rõ nhu cầu", "2. Tư vấn sản phẩm", "3. Xây dựng lòng tin", "4. Hẹn gặp/xem", "5. Xử lý từ chối", "6. Chốt giao dịch"];
  const funnel = stages.map((s, i) => ({ stage: s, count: funnelCounts[i] }));

  return { total, hot, warm, overdue, todaySchedule, closedThisMonth, funnel };
}

export async function getOverdueCustomers() {
  const userId = await requireUser();
  const now = new Date();
  const customers = await prisma.customer.findMany({
    where: { userId, status: { notIn: ["Đã chốt", "Mất khách"] }, nextFollowUp: { lt: now } },
    orderBy: { nextFollowUp: "asc" },
  });
  return customers.map((c) => enrichStatus({
    ...c,
    nextFollowUp: c.nextFollowUp?.toISOString() || null,
    lastContactAt: c.lastContactAt?.toISOString() || null,
    snoozedUntil: c.snoozedUntil?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function getUpcomingSchedule() {
  const userId = await requireUser();
  const now = new Date();
  const customers = await prisma.customer.findMany({
    where: { userId, status: { notIn: ["Đã chốt", "Mất khách"] }, nextFollowUp: { gte: now } },
    orderBy: { nextFollowUp: "asc" },
  });
  return customers.map((c) => enrichStatus({
    ...c,
    nextFollowUp: c.nextFollowUp?.toISOString() || null,
    lastContactAt: c.lastContactAt?.toISOString() || null,
    snoozedUntil: c.snoozedUntil?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}
