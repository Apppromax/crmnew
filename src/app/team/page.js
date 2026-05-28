import { getTeamContext } from "@/actions/team";
import TeamDashboardClient from "./TeamDashboardClient";
import NoTeamView from "./NoTeamView";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/server";

export default async function TeamPage() {
  // Single call fetches everything — no duplicate auth/membership checks
  const context = await getTeamContext({ includeData: true });

  if (!context.hasTeam) {
    const userId = await requireUser();
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    });
    const isTrial = profile ? (new Date() < new Date(profile.createdAt.getTime() + 60 * 24 * 60 * 60 * 1000)) : false;

    return <NoTeamView isTrial={isTrial} />;
  }

  const { team, role, members = [], customers = [] } = context;
  const isLeader = role === "LEADER";

  // Compute stats in-memory for leader (no extra DB call)
  let stats = null;
  if (isLeader && customers.length > 0) {
    const statusCount = {};
    const heatCount = {};
    const journeyCount = {};
    const memberPerformance = {};

    for (const c of customers) {
      statusCount[c.status] = (statusCount[c.status] || 0) + 1;
      heatCount[c.heatLevel] = (heatCount[c.heatLevel] || 0) + 1;
      const stage = c.journeyStage || "Mới";
      journeyCount[stage] = (journeyCount[stage] || 0) + 1;
      if (c.userId) {
        if (!memberPerformance[c.userId]) memberPerformance[c.userId] = { total: 0, active: 0, closed: 0 };
        memberPerformance[c.userId].total += 1;
        if (c.status === "Đang chăm" || c.status === "Đang chờ") memberPerformance[c.userId].active += 1;
        if (c.status === "Đã chốt") memberPerformance[c.userId].closed += 1;
      }
    }

    stats = { totalLeads: customers.length, statusCount, heatCount, journeyCount, memberPerformance };
  }

  return (
    <TeamDashboardClient 
      team={team} 
      role={role} 
      members={members} 
      customers={customers} 
      stats={stats} 
    />
  );
}
