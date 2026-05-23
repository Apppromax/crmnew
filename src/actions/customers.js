"use server";

import prisma from "@/lib/prisma";
import { createClient, requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

// OPTIMIZED: Gộp getSmartQueue + getCustomerCount + hasTeam vào 1 function
// Trước: 3 function × requireUser() + riêng DB queries = 6+ round trips
// Sau: 1 requireUser() + 2 parallel queries = 3 round trips
export async function getDashboardData() {
  const userId = await requireUser();
  const now = new Date();

  // 2 queries chạy SONG SONG thay vì tuần tự
  const [customers, teamInfo] = await Promise.all([
    // Query 1: Lấy TẤT CẢ active customers — dùng chung cho cả queue + counts
    prisma.customer.findMany({
      where: {
        userId,
        status: { notIn: ["Mất khách"] }
      },
      orderBy: { createdAt: "desc" }
    }),
    // Query 2: Check hasTeam nhẹ nhất có thể — chỉ cần biết có/không
    prisma.teamMember.findUnique({
      where: { userId },
      select: { teamId: true }
    })
  ]);

  // Tính counts từ data đã có (RAM, không query thêm)
  let total = 0, hot = 0, warm = 0;
  for (const c of customers) {
    if (c.status !== "Đã chốt" && c.status !== "Mất khách") total++;
    if (c.heatLevel === "Rất Nét") hot++;
    if (c.heatLevel === "Tiềm Năng") warm++;
  }

  // Tính queue từ data đã có (filter + sort trong RAM)
  const queueCandidates = customers.filter(c => {
    if (c.status === "Đã chốt" || c.status === "Mất khách") return false;
    if (c.snoozedUntil && c.snoozedUntil > now) return false;
    if (c.nextFollowUp && c.nextFollowUp > now) return false;
    return true;
  });

  // Sort: clarityScore desc → lastContactAt asc → nextFollowUp asc
  queueCandidates.sort((a, b) => {
    const cs = (b.clarityScore || 0) - (a.clarityScore || 0);
    if (cs !== 0) return cs;
    const la = (a.lastContactAt?.getTime() || 0) - (b.lastContactAt?.getTime() || 0);
    if (la !== 0) return la;
    return (a.nextFollowUp?.getTime() || 0) - (b.nextFollowUp?.getTime() || 0);
  });

  // Re-sort: overdue first, then journeyStage
  const top10 = queueCandidates.slice(0, 10);
  top10.sort((a, b) => {
    const aOverdue = a.nextFollowUp && a.nextFollowUp < now ? 0 : 1;
    const bOverdue = b.nextFollowUp && b.nextFollowUp < now ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    const aJ = parseInt((a.journeyStage || "1.").split(".")[0]) || 1;
    const bJ = parseInt((b.journeyStage || "1.").split(".")[0]) || 1;
    if (aJ !== bJ) return bJ - aJ;
    return (b.clarityScore || 0) - (a.clarityScore || 0);
  });

  const queue = top10.map(c => enrichStatus({
    ...c,
    nextFollowUp: c.nextFollowUp?.toISOString() || null,
    lastContactAt: c.lastContactAt?.toISOString() || null,
    snoozedUntil: c.snoozedUntil?.toISOString() || null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  // hasTeam: true nếu user có teamMember record HOẶC sở hữu team
  let hasTeam = !!teamInfo;
  if (!hasTeam) {
    // Fallback: check nếu user là owner
    const owned = await prisma.team.findUnique({ where: { ownerId: userId }, select: { id: true } });
    hasTeam = !!owned;
  }

  return { queue, counts: { total, hot, warm }, hasTeam };
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
  
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
    include: { team: true }
  });

  let whereClause = { userId };

  if (membership && membership.role === "LEADER") {
    const team = membership.team;
    const hasProjectTags = team.projectTags && team.projectTags.length > 0;
    whereClause = {
      OR: [
        // Khách trong team pool (của các member khác)
        { 
          teamId: team.id,
          userId: { not: userId },
          ...(hasProjectTags ? { tags: { hasSome: team.projectTags } } : {})
        },
        // Khách của chính leader (cả cá nhân lẫn team)
        { userId }
      ]
    };
  }

  const customers = await prisma.customer.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { email: true, fullName: true } }
    }
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

  // FAST PATH: Lightweight profile check — chỉ select fields cần cho pro/trial check, KHÔNG join team
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { isPro: true, proUntil: true, createdAt: true }
  });

  const now = new Date();
  const isTrial = now < new Date(profile.createdAt.getTime() + 60 * 24 * 60 * 60 * 1000);
  const isProfilePro = profile.isPro && (!profile.proUntil || new Date(profile.proUntil) > now);

  // Fast pro check: nếu user đã pro hoặc trial → skip mọi check nặng
  if (!isProfilePro && !isTrial) {
    // Chỉ free user mới cần check team pro + count — chạy song song
    const [teamProInfo, customerCount] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: userId },
        select: {
          ownedTeam: { select: { isActive: true, validUntil: true } },
          teamMembership: { select: { team: { select: { isActive: true, validUntil: true } } } }
        }
      }),
      prisma.customer.count({ where: { userId } })
    ]);

    const isOwnedTeamActive = teamProInfo?.ownedTeam?.isActive && (!teamProInfo.ownedTeam.validUntil || new Date(teamProInfo.ownedTeam.validUntil) > now);
    const isMemberTeamActive = teamProInfo?.teamMembership?.team?.isActive && (!teamProInfo.teamMembership.team.validUntil || new Date(teamProInfo.teamMembership.team.validUntil) > now);

    if (!isOwnedTeamActive && !isMemberTeamActive && customerCount >= 10) {
      throw new Error("FREE_LIMIT_REACHED");
    }
  }

  // Tạo customer ngay lập tức — không chờ team assignment
  const customer = await prisma.customer.create({
    data: {
      userId,
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

  // BACKGROUND: Team tag assignment — chạy async, không block response
  if (tags?.length > 0) {
    assignTeamInBackground(userId, customer.id, tags).catch(() => {});
  }

  return { id: customer.id };
}

// Helper: gán teamId dựa trên projectTags — chạy background sau khi response đã trả
async function assignTeamInBackground(userId, customerId, tags) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      ownedTeam: { select: { id: true, projectTags: true } },
      teamMembership: { select: { team: { select: { id: true, projectTags: true } } } }
    }
  });
  const team = profile?.teamMembership?.team || profile?.ownedTeam;
  if (team?.projectTags?.length > 0 && tags.some(t => team.projectTags.includes(t))) {
    await prisma.customer.update({ where: { id: customerId }, data: { teamId: team.id } });
  }
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

  // Tự động gán/hủy teamId nếu có sự thay đổi về tags hoặc nhãn trùng khớp
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    include: {
      ownedTeam: true,
      teamMembership: { include: { team: true } }
    }
  });

  const team = profile?.teamMembership?.team || profile?.ownedTeam;
  if (team) {
    const checkTags = data.tags !== undefined ? data.tags : existing.tags;
    const hasMatchingTag = checkTags && team.projectTags && team.projectTags.length > 0 && checkTags.some(t => team.projectTags.includes(t));
    if (hasMatchingTag) {
      updateData.teamId = team.id;
    } else {
      updateData.teamId = null;
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

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    include: {
      ownedTeam: true,
      teamMembership: { include: { team: true } }
    }
  });

  const team = profile?.teamMembership?.team || profile?.ownedTeam;
  let teamId = existing.teamId;

  if (team) {
    const hasMatchingTag = tags && team.projectTags && team.projectTags.length > 0 && tags.some(t => team.projectTags.includes(t));
    if (hasMatchingTag) {
      teamId = team.id;
    } else {
      teamId = null;
    }
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { tags, teamId },
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
  const personalTags = Array.from(tagSet).sort();

  let teamTags = [];
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
    include: { team: { select: { projectTags: true } } }
  });
  
  if (membership?.team?.projectTags) {
    teamTags = membership.team.projectTags;
  }

  const ownedTeam = await prisma.team.findUnique({
    where: { ownerId: userId },
    select: { projectTags: true }
  });
  
  if (ownedTeam?.projectTags) {
    teamTags = [...new Set([...teamTags, ...ownedTeam.projectTags])];
  }

  return { personalTags, teamTags };
}

export async function getCustomerCount() {
  const userId = await requireUser();
  const customers = await prisma.customer.findMany({
    where: { userId },
    select: { status: true, heatLevel: true }
  });

  let total = 0;
  let hot = 0;
  let warm = 0;

  for (const c of customers) {
    if (c.status !== "Đã chốt" && c.status !== "Mất khách") {
      total++;
    }
    if (c.heatLevel === "Rất Nét") {
      hot++;
    }
    if (c.heatLevel === "Tiềm Năng") {
      warm++;
    }
  }

  return { total, hot, warm };
}

export async function getDashboardStats() {
  const userId = await requireUser();
  const now = new Date();

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);

  // Tối ưu N+1: Query 1 lần lấy data cần thiết, tính toán trên RAM
  const customers = await prisma.customer.findMany({
    where: { userId, status: { notIn: ["Mất khách"] } },
    select: { status: true, heatLevel: true, nextFollowUp: true, journeyStage: true, updatedAt: true }
  });

  let total = 0, hot = 0, warm = 0, overdue = 0, todaySchedule = 0, closedThisMonth = 0;
  const stages = ["1. Phá băng và làm rõ nhu cầu", "2. Tư vấn sản phẩm", "3. Xây dựng lòng tin", "4. Hẹn gặp/xem", "5. Xử lý từ chối", "6. Chốt giao dịch"];
  const funnelCounts = Object.fromEntries(stages.map(s => [s, 0]));

  for (const c of customers) {
    if (funnelCounts[c.journeyStage] !== undefined) {
      funnelCounts[c.journeyStage]++;
    }

    if (c.status === "Đã chốt") {
      if (c.updatedAt >= monthStart) closedThisMonth++;
      continue;
    }

    // Active customers
    total++;
    
    if (c.heatLevel === "Rất Nét") hot++;
    if (c.heatLevel === "Tiềm Năng") warm++;
    
    if (c.nextFollowUp) {
      if (c.nextFollowUp < now) overdue++;
      if (c.nextFollowUp >= todayStart && c.nextFollowUp <= todayEnd) todaySchedule++;
    }
  }

  const funnel = stages.map(s => ({ stage: s, count: funnelCounts[s] }));

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
