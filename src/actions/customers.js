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

export async function snoozeCustomer(customerId, hours = 4) {
  const userId = await requireUser();
  const existing = await prisma.customer.findFirst({ where: { id: customerId, userId } });
  if (!existing) throw new Error("Not found or unauthorized");

  const snoozedUntil = new Date(Date.now() + hours * 3600000);

  await prisma.customer.update({
    where: { id: customerId },
    data: { snoozedUntil },
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

export async function getCustomerCount() {
  const userId = await requireUser();
  const total = await prisma.customer.count({
    where: { userId, status: { notIn: ["Closed", "Lost"] } },
  });
  const hot = await prisma.customer.count({ where: { userId, heatLevel: "Hot" } });
  const warm = await prisma.customer.count({ where: { userId, heatLevel: "Warm" } });

  return { total, hot, warm };
}

export async function getOverdueCustomers() {
  const userId = await requireUser();
  const now = new Date();
  const customers = await prisma.customer.findMany({
    where: {
      userId,
      status: { notIn: ["Closed", "Lost"] },
      nextFollowUp: { lt: now },
    },
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
    where: {
      userId,
      status: { notIn: ["Closed", "Lost"] },
      nextFollowUp: { gte: now },
    },
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
