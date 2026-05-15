"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Lấy thông tin Team hiện tại của user (Dù là Leader hay Member)
export async function getTeamContext() {
  const userId = await requireUser();
  
  // Kiểm tra xem có đang sở hữu team nào không
  const ownedTeam = await prisma.team.findUnique({
    where: { ownerId: userId },
    include: {
      _count: { select: { members: true } }
    }
  });

  if (ownedTeam) {
    return {
      hasTeam: true,
      role: "LEADER",
      team: ownedTeam
    };
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
      role: membership.role, // Thường là "MEMBER"
      team: membership.team
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

      if (profile.balance < totalCost) {
        throw new Error("Số dư không đủ để mở Team. Vui lòng nạp thêm Credits.");
      }

      // Đảm bảo chưa có team
      const existingTeam = await tx.team.findUnique({ where: { ownerId: userId } });
      if (existingTeam) throw new Error("Bạn đã sở hữu một Team rồi.");

      const existingMembership = await tx.teamMember.findUnique({ where: { userId } });
      if (existingMembership) throw new Error("Bạn đang là thành viên của Team khác. Vui lòng rời Team trước.");

      const now = new Date();
      const validUntil = new Date();
      validUntil.setMonth(now.getMonth() + months);

      // Trừ tiền
      await tx.profile.update({
        where: { id: userId },
        data: { balance: profile.balance - totalCost },
      });

      // Tạo Transaction
      await tx.transaction.create({
        data: {
          userId,
          amount: -totalCost,
          type: "SPEND",
          note: `Đăng ký gói TEAM ${months} tháng`,
          status: "COMPLETED",
        },
      });

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

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { teamId },
        { userId: userId, teamId: null }
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
    },
    orderBy: { createdAt: "desc" }
  });

  return customers;
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
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) throw new Error("Customer not found");
  
  // Cập nhật userId mới (Người được phân công) và đảm bảo khách nằm trong teamId
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      userId: targetUserId,
      teamId: membership.teamId
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

  // 1. Lấy toàn bộ khách của team (Bao gồm cả khách cá nhân của Leader chưa phân bổ)
  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { teamId },
        { userId: userId, teamId: null }
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
