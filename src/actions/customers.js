"use server";

import prisma from "@/lib/prisma";

export async function getSmartQueue() {
  const now = new Date();

  const customers = await prisma.customer.findMany({
    where: {
      status: { notIn: ["Closed", "Lost"] },
      OR: [
        { snoozedUntil: null },
        { snoozedUntil: { lte: now } },
      ],
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

  return sorted.slice(0, 3).map((c) => ({
    ...c,
    nextFollowUp: c.nextFollowUp?.toISOString() || null,
    lastContactAt: c.lastContactAt?.toISOString() || null,
    snoozedUntil: c.snoozedUntil?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function getAllCustomers() {
  const customers = await prisma.customer.findMany({
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
  const now = new Date();

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

  return { success: true };
}

export async function snoozeCustomer(customerId, hours = 4) {
  const snoozedUntil = new Date(Date.now() + hours * 3600000);

  await prisma.customer.update({
    where: { id: customerId },
    data: { snoozedUntil },
  });

  return { success: true };
}

export async function createCustomer({ name, phone, note }) {
  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      status: "New",
      heatLevel: "Cold",
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

  return customer;
}

export async function getCustomerCount() {
  const total = await prisma.customer.count({
    where: { status: { notIn: ["Closed", "Lost"] } },
  });
  const hot = await prisma.customer.count({ where: { heatLevel: "Hot" } });
  const warm = await prisma.customer.count({ where: { heatLevel: "Warm" } });

  return { total, hot, warm };
}
