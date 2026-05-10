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

export async function getSmartQueue() {
  const userId = await requireUser();
  const now = new Date();

  const customers = await prisma.customer.findMany({
    where: {
      userId,
      status: { notIn: ["Closed", "Lost"] },
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

  // Re-sort: overdue first, then clarity score
  const sorted = customers.sort((a, b) => {
    const aOverdue = a.nextFollowUp && a.nextFollowUp < now ? 0 : 1;
    const bOverdue = b.nextFollowUp && b.nextFollowUp < now ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return b.clarityScore - a.clarityScore;
  });

  return sorted.slice(0, 10).map((c) => ({
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

  return customers.map((c) => ({
    ...c,
    nextFollowUp: c.nextFollowUp?.toISOString() || null,
    lastContactAt: c.lastContactAt?.toISOString() || null,
    snoozedUntil: c.snoozedUntil?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function completeCustomerAction({ customerId, note, nextFollowUp }) {
  const userId = await requireUser();
  const now = new Date();

  // Validate ownership
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found or unauthorized");

  // Create interaction
  await prisma.interaction.create({
    data: {
      customerId,
      type: "note",
      summary: note || "Đã chăm sóc",
    },
  });

  // Create note if provided
  if (note) {
    await prisma.note.create({
      data: {
        customerId,
        rawText: note,
      },
    });
  }

  // Update customer
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      lastContactAt: now,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      status: nextFollowUp ? "Waiting" : "Active",
    },
  });

  revalidatePath("/");
  revalidatePath("/customers");

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

export async function createCustomer({ name, phone, note, budget, area, timeline, heatLevel, demand }) {
  const userId = await requireUser();

  const customer = await prisma.customer.create({
    data: {
      userId,
      name,
      phone,
      budget,
      area,
      timeline,
      demand,
      status: "New",
      heatLevel: heatLevel || "Cold",
      clarityScore: 0,
      journeyStage: "Lead",
    },
  });

  if (note) {
    await prisma.note.create({
      data: {
        customerId: customer.id,
        rawText: note,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/customers");

  return customer;
}

export async function updateCustomer(customerId, data) {
  const userId = await requireUser();
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found or unauthorized");

  const allowedFields = ["name", "phone", "status", "heatLevel", "budget", "area", "demand", "timeline", "journeyStage", "tags"];
  const updateData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  }

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/customers");

  return {
    ...updated,
    nextFollowUp: updated.nextFollowUp?.toISOString() || null,
    lastContactAt: updated.lastContactAt?.toISOString() || null,
    snoozedUntil: updated.snoozedUntil?.toISOString() || null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
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
  const total = await prisma.customer.count({
    where: { userId, status: { notIn: ["Closed", "Lost"] } },
  });
  const hot = await prisma.customer.count({ where: { userId, heatLevel: "Hot" } });
  const warm = await prisma.customer.count({ where: { userId, heatLevel: "Warm" } });
  return { total, hot, warm };
}

export async function getDashboardStats() {
  const userId = await requireUser();
  const now = new Date();

  // Basic counts
  const [total, hot, warm, overdue] = await Promise.all([
    prisma.customer.count({ where: { userId, status: { notIn: ["Closed", "Lost"] } } }),
    prisma.customer.count({ where: { userId, heatLevel: "Hot", status: { notIn: ["Closed", "Lost"] } } }),
    prisma.customer.count({ where: { userId, heatLevel: "Warm", status: { notIn: ["Closed", "Lost"] } } }),
    prisma.customer.count({ where: { userId, status: { notIn: ["Closed", "Lost"] }, nextFollowUp: { lt: now } } }),
  ]);

  // Today schedule
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
  const todaySchedule = await prisma.customer.count({
    where: { userId, nextFollowUp: { gte: todayStart, lte: todayEnd } },
  });

  // Closed this month
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const closedThisMonth = await prisma.customer.count({
    where: { userId, status: "Closed", updatedAt: { gte: monthStart } },
  });

  // Journey funnel
  const stages = ["Lead", "Contacted", "Viewed", "Negotiating", "Deposited", "Closed"];
  const funnelPromises = stages.map(s =>
    prisma.customer.count({ where: { userId, journeyStage: s, status: { notIn: ["Lost"] } } })
  );
  const funnelCounts = await Promise.all(funnelPromises);
  const funnel = stages.map((s, i) => ({ stage: s, count: funnelCounts[i] }));

  return { total, hot, warm, overdue, todaySchedule, closedThisMonth, funnel };
}

export async function getOverdueCustomers() {
  const userId = await requireUser();
  const now = new Date();
  const customers = await prisma.customer.findMany({
    where: { userId, status: { notIn: ["Closed", "Lost"] }, nextFollowUp: { lt: now } },
    orderBy: { nextFollowUp: "asc" },
  });
  return customers.map((c) => ({
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
    where: { userId, status: { notIn: ["Closed", "Lost"] }, nextFollowUp: { gte: now } },
    orderBy: { nextFollowUp: "asc" },
  });
  return customers.map((c) => ({
    ...c,
    nextFollowUp: c.nextFollowUp?.toISOString() || null,
    lastContactAt: c.lastContactAt?.toISOString() || null,
    snoozedUntil: c.snoozedUntil?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}
