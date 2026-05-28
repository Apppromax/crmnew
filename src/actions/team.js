"use server";

import prisma from "@/lib/prisma";
import { createClient, requireUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { enrichStatus } from "./customers";

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Lấy thông tin Team hiện tại của user (Dù là Leader hay Member)
// Khi includeData=true (leader dashboard), fetch members + customers song song để tránh 3x auth calls
export async function getTeamContext({ includeData = false } = {}) {
  const userId = await requireUser();
  
  // Kiểm tra xem có đang sở hữu team nào không
  const ownedTeam = await prisma.team.findUnique({
    where: { ownerId: userId },
    include: {
      _count: { select: { members: true } }
    }
  });

  if (ownedTeam) {
    const result = {
      hasTeam: true,
      role: "LEADER",
      team: {
        ...ownedTeam,
        createdAt: ownedTeam.createdAt?.toISOString() || null,
        updatedAt: ownedTeam.updatedAt?.toISOString() || null,
        validUntil: ownedTeam.validUntil?.toISOString() || null,
      }
    };

    // Fetch members + customers in parallel if requested (avoids 2 extra requireUser calls)
    if (includeData) {
      const hasProjectTags = ownedTeam.projectTags && ownedTeam.projectTags.length > 0;
      
      const [members, customers, interactions] = await Promise.all([
        prisma.teamMember.findMany({
          where: { teamId: ownedTeam.id },
          include: { user: { select: { email: true, fullName: true, role: true } } },
          orderBy: { joinedAt: "asc" }
        }),
        prisma.customer.findMany({
          where: {
            OR: [
              { 
                teamId: ownedTeam.id,
                userId: { not: userId },
                ...(hasProjectTags ? { tags: { hasSome: ownedTeam.projectTags } } : {})
              },
              { teamId: ownedTeam.id, userId },
              { userId, teamId: null }
            ]
          },
          select: {
            id: true, userId: true, name: true, phone: true,
            status: true, heatLevel: true, journeyStage: true,
            clarityScore: true, nextFollowUp: true, tags: true,
            snoozedUntil: true, lastContactAt: true, teamId: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" }
        }),
        prisma.interaction.findMany({
          where: {
            customer: {
              OR: [
                { teamId: ownedTeam.id },
                { userId }
              ]
            }
          },
          select: {
            createdAt: true,
            customer: {
              select: { userId: true }
            }
          }
        })
      ]);

      result.members = members.map(m => {
        const memberInteractions = interactions.filter(i => i.customer?.userId === m.userId);
        const totalInteractions = memberInteractions.length;
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const interactionsLast7Days = memberInteractions.filter(i => new Date(i.createdAt) >= sevenDaysAgo).length;
        
        const lastInteraction = memberInteractions.length > 0 
          ? new Date(Math.max(...memberInteractions.map(i => new Date(i.createdAt).getTime()))).toISOString()
          : null;

        return {
          ...m,
          joinedAt: m.joinedAt?.toISOString() || null,
          stats: {
            totalInteractions,
            interactionsLast7Days,
            lastInteraction
          }
        };
      });

      result.customers = customers.map(c => enrichStatus({
        ...c,
        nextFollowUp: c.nextFollowUp?.toISOString() || null,
        snoozedUntil: c.snoozedUntil?.toISOString() || null,
        lastContactAt: c.lastContactAt?.toISOString() || null,
        createdAt: c.createdAt?.toISOString() || null,
      }));
    }

    return result;
  }

  // Kiểm tra xem có đang là member của team nào không
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
    include: {
      team: {
        include: {
          owner: { select: { email: true } }
        }
      }
    }
  });

  if (membership) {
    return {
      hasTeam: true,
      role: membership.role,
      team: {
        ...membership.team,
        createdAt: membership.team.createdAt?.toISOString() || null,
        updatedAt: membership.team.updatedAt?.toISOString() || null,
        validUntil: membership.team.validUntil?.toISOString() || null,
      }
    };
  }

  return { hasTeam: false };
}

// Tạo Team mới (Trừ tiền)
export async function createTeam(name, months = 1) {
  try {
    const userId = await requireUser();
    const PRICE_PER_MONTH = 299000; // 299k/tháng cho 5 members
    const totalCost = PRICE_PER_MONTH * months;

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({ where: { id: userId } });
      if (!profile) throw new Error("User not found");

      const now = new Date();
      const trialEndDate = new Date(profile.createdAt.getTime() + 60 * 24 * 60 * 60 * 1000);
      const isTrial = now < trialEndDate;

      const actualCost = isTrial ? 0 : totalCost;

      if (profile.balance < actualCost) {
        throw new Error("Số dư không đủ để mở Team. Vui lòng nạp thêm Credits.");
      }

      // Đảm bảo chưa có team
      const existingTeam = await tx.team.findUnique({ where: { ownerId: userId } });
      if (existingTeam) throw new Error("Bạn đã sở hữu một Team rồi.");

      const existingMembership = await tx.teamMember.findUnique({ where: { userId } });
      if (existingMembership) throw new Error("Bạn đang là thành viên của Team khác. Vui lòng rời Team trước.");

      const validUntil = isTrial ? trialEndDate : new Date();
      if (!isTrial) {
        validUntil.setMonth(now.getMonth() + months);
      }

      // Chỉ trừ tiền và tạo giao dịch nếu có phát sinh chi phí
      if (actualCost > 0) {
        await tx.profile.update({
          where: { id: userId },
          data: { balance: profile.balance - actualCost },
        });

        await tx.transaction.create({
          data: {
            userId,
            amount: -actualCost,
            type: "SPEND",
            note: `Đăng ký gói TEAM ${months} tháng`,
            status: "COMPLETED",
          },
        });
      } else {
        // Giao dịch miễn phí cho Free Trial
        await tx.transaction.create({
          data: {
            userId,
            amount: 0,
            type: "SPEND",
            note: "Đăng ký gói TEAM (Dùng thử miễn phí)",
            status: "COMPLETED",
          },
        });
      }

      // Tạo Team
      let inviteCode = generateInviteCode();
      
      const team = await tx.team.create({
        data: {
          name,
          ownerId: userId,
          inviteCode,
          isActive: true,
          validUntil,
          maxMembers: 5,
        }
      });

      // Tự động thêm owner vào bảng TeamMember với quyền LEADER
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: userId,
          role: "LEADER"
        }
      });

      return team;
    });

    return { success: true, team: result };
  } catch (err) {
    return { error: err.message || "Có lỗi xảy ra khi tạo team." };
  }
}

// Tham gia team
export async function joinTeam(inviteCode) {
  try {
    const userId = await requireUser();
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if user already in a team
      const membership = await tx.teamMember.findUnique({ where: { userId } });
      if (membership) throw new Error("Bạn đã thuộc về một Team khác.");

      // 2. Find Team
      const team = await tx.team.findUnique({ 
        where: { inviteCode },
        include: {
          _count: { select: { members: true } }
        }
      });
      
      if (!team) throw new Error("Mã mời không hợp lệ.");
      if (!team.isActive || (team.validUntil && team.validUntil < new Date())) {
        throw new Error("Team này đã hết hạn gói đăng ký.");
      }

      if (team._count.members >= team.maxMembers) {
        throw new Error("Team đã đạt giới hạn thành viên.");
      }

      // 3. Create membership
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: userId,
          role: "MEMBER"
        }
      });

      return team;
    });

    return { success: true, team: result };
  } catch (err) {
    return { error: err.message || "Mã mời không hợp lệ hoặc có lỗi xảy ra." };
  }
}

// Lấy danh sách thành viên (Dành cho Leader)
export async function getTeamMembers(teamId) {
  const userId = await requireUser();
  
  // Xác thực quyền truy cập
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
  });
  if (!membership || membership.teamId !== teamId) {
    throw new Error("Unauthorized access to team");
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: { email: true, role: true }
      }
    },
    orderBy: { joinedAt: "asc" }
  });

  return members;
}

// Lấy danh sách Khách hàng của Team (Dành cho Leader)
export async function getTeamCustomers(teamId) {
  const userId = await requireUser();
  
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
  });
  if (!membership || membership.teamId !== teamId || membership.role !== "LEADER") {
    throw new Error("Unauthorized access to team customers");
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { projectTags: true }
  });

  const hasProjectTags = team?.projectTags && team.projectTags.length > 0;

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { 
          teamId,
          userId: { not: userId },
          ...(hasProjectTags ? { tags: { hasSome: team.projectTags } } : {})
        },
        { 
          teamId, 
          userId: userId 
        },
        { 
          userId: userId, 
          teamId: null 
        }
      ]
    },
    select: {
      id: true,
      userId: true,
      name: true,
      phone: true,
      status: true,
      heatLevel: true,
      journeyStage: true,
      clarityScore: true,
      nextFollowUp: true,
      lastContactAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return customers.map(c => enrichStatus(c));
}

// Phân bổ Khách hàng cho Thành viên (Dành cho Leader)
export async function assignCustomer(customerId, targetUserId) {
  const userId = await requireUser();
  
  // Kiểm tra quyền Leader
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
  });
  
  if (!membership || membership.role !== "LEADER") {
    throw new Error("Chỉ Leader mới có quyền phân bổ khách hàng.");
  }

  // Kiểm tra xem khách hàng có thuộc team không (hoặc là khách của Leader nhưng chưa vào Team)
  const customer = await prisma.customer.findFirst({
    where: { 
      id: customerId,
      OR: [
        { teamId: membership.teamId },
        { userId: userId, teamId: null }
      ]
    }
  });

  if (!customer) throw new Error("Customer not found or you don't have permission to assign this customer.");

  // Lấy projectTags của Team
  const team = await prisma.team.findUnique({
    where: { id: membership.teamId },
    select: { name: true, projectTags: true }
  });

  let updatedTags = customer.tags || [];
  let teamProjectTags = team?.projectTags || [];

  if (teamProjectTags.length === 0) {
    // Nếu chưa cấu hình nhãn dự án, tự động tạo từ tên Team hoặc mặc định là "Chung"
    const defaultTag = team?.name ? team.name.trim() : "Chung";
    teamProjectTags = [defaultTag];

    // Cập nhật projectTags của Team trong database để đồng bộ
    await prisma.team.update({
      where: { id: membership.teamId },
      data: { projectTags: teamProjectTags }
    });
  }

  const hasMatchingTag = updatedTags.some(tag => teamProjectTags.includes(tag));
  if (!hasMatchingTag) {
    updatedTags = [...updatedTags, teamProjectTags[0]];
  }
  
  // Cập nhật userId mới (Người được phân công) và đảm bảo khách nằm trong teamId
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      userId: targetUserId,
      teamId: membership.teamId,
      tags: updatedTags
    }
  });

  return { success: true };
}

// Lấy Báo cáo thống kê Team (Dành cho Leader)
export async function getTeamStats(teamId) {
  const userId = await requireUser();
  
  // Xác thực quyền Leader
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
  });
  if (!membership || membership.teamId !== teamId || membership.role !== "LEADER") {
    throw new Error("Unauthorized access to team stats");
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { projectTags: true }
  });

  const hasProjectTags = team?.projectTags && team.projectTags.length > 0;

  // 1. Lấy toàn bộ khách của team (Bao gồm cả khách cá nhân của Leader chưa phân bổ)
  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { 
          teamId,
          userId: { not: userId },
          ...(hasProjectTags ? { tags: { hasSome: team.projectTags } } : {})
        },
        { 
          teamId, 
          userId: userId 
        },
        { 
          userId: userId, 
          teamId: null 
        }
      ]
    },
    select: { status: true, heatLevel: true, userId: true }
  });

  const totalLeads = customers.length;
  
  // 2. Thống kê theo trạng thái
  const statusCount = customers.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // 3. Thống kê theo Heat Level
  const heatCount = customers.reduce((acc, c) => {
    acc[c.heatLevel] = (acc[c.heatLevel] || 0) + 1;
    return acc;
  }, {});

  // 4. Thống kê Lead theo từng thành viên (Leaderboard)
  const memberPerformance = customers.reduce((acc, c) => {
    if (!c.userId) return acc;
    if (!acc[c.userId]) {
      acc[c.userId] = { total: 0, closed: 0 };
    }
    acc[c.userId].total += 1;
    if (c.status === "Đã chốt") {
      acc[c.userId].closed += 1;
    }
    return acc;
  }, {});

  return {
    totalLeads,
    statusCount: {
      Mới: statusCount["Mới"] || 0,
      "Đang chăm": statusCount["Đang chăm"] || 0,
      "Đang chờ": statusCount["Đang chờ"] || 0,
      "Ngủ đông": statusCount["Ngủ đông"] || 0,
      "Đã chốt": statusCount["Đã chốt"] || 0,
      "Mất khách": statusCount["Mất khách"] || 0,
    },
    heatCount: {
      "Rất Nét": heatCount["Rất Nét"] || 0,
      "Tiềm Năng": heatCount["Tiềm Năng"] || 0,
      "Quan Tâm": heatCount["Quan Tâm"] || 0,
      "Tham Khảo": heatCount["Tham Khảo"] || 0,
      "Chưa Rõ": heatCount["Chưa Rõ"] || 0,
    },
    memberPerformance
  };
}

// Xóa thành viên khỏi Team (Dành cho Leader)
export async function removeTeamMember(targetUserId) {
  const userId = await requireUser();
  
  // Xác thực quyền Leader
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
  });
  if (!membership || membership.role !== "LEADER") {
    throw new Error("Chỉ Leader mới có quyền xóa thành viên.");
  }

  if (userId === targetUserId) {
    throw new Error("Không thể tự xóa chính mình khỏi team theo cách này.");
  }

  // Thu hồi toàn bộ khách hàng đang gán cho thành viên này về cho Leader
  await prisma.customer.updateMany({
    where: {
      userId: targetUserId,
      teamId: membership.teamId
    },
    data: {
      userId: userId // Gán lại cho Leader
    }
  });

  // Xóa member
  await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId: membership.teamId,
        userId: targetUserId
      }
    }
  });

  return { success: true };
}

// Tự rời Team (Dành cho Member)
export async function leaveTeam() {
  const userId = await requireUser();
  
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
  });
  
  if (!membership) {
    throw new Error("Bạn không thuộc team nào.");
  }

  if (membership.role === "LEADER") {
    throw new Error("Leader không thể rời team. Vui lòng giải tán team hoặc chuyển quyền (nếu có).");
  }

  // Lấy ownerId của Team để gán lại khách
  const team = await prisma.team.findUnique({
    where: { id: membership.teamId }
  });

  // Gán trả lại tất cả khách hàng (thuộc team) về cho Leader
  await prisma.customer.updateMany({
    where: {
      userId: userId,
      teamId: membership.teamId
    },
    data: {
      userId: team.ownerId
    }
  });

  // Xóa membership
  await prisma.teamMember.delete({
    where: { userId }
  });

  return { success: true };
}

// Cập nhật Tag Dự án cho Team (Dành cho Leader)
export async function updateTeamProjectTags(teamId, tags) {
  const userId = await requireUser();
  
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
  });
  
  if (!membership || membership.teamId !== teamId || membership.role !== "LEADER") {
    throw new Error("Chỉ Leader mới có quyền cập nhật tag dự án.");
  }

  await prisma.team.update({
    where: { id: teamId },
    data: { projectTags: tags }
  });

  revalidatePath("/team");
  return { success: true };
}
