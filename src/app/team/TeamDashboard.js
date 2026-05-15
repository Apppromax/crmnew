import { getTeamMembers, getTeamCustomers, getTeamStats } from "@/actions/team";
import { ShieldAlert, ShieldCheck, User, Database, PieChart, Users, Star } from "lucide-react";
import LeadDistribution from "./LeadDistribution";
import TeamAnalytics from "./TeamAnalytics";
import TeamDashboardClient from "./TeamDashboardClient";

export default async function TeamDashboard({ context }) {
  const { team, role } = context;
  const isLeader = role === "LEADER";

  let members = [];
  let customers = [];
  let stats = null;
  
  if (isLeader) {
    const [membersData, customersData] = await Promise.all([
      getTeamMembers(team.id),
      getTeamCustomers(team.id)
    ]);
    members = membersData;
    customers = customersData;

    // Compute stats in memory instead of fetching 600 rows from DB again
    const statusCount = customers.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    const heatCount = customers.reduce((acc, c) => {
      acc[c.heatLevel] = (acc[c.heatLevel] || 0) + 1;
      return acc;
    }, {});
    const memberPerformance = customers.reduce((acc, c) => {
      if (!c.userId) return acc;
      if (!acc[c.userId]) acc[c.userId] = { total: 0, active: 0, closed: 0 };
      acc[c.userId].total += 1;
      if (c.status === "Đang chăm" || c.status === "Đang chờ") acc[c.userId].active += 1;
      if (c.status === "Đã chốt") acc[c.userId].closed += 1;
      return acc;
    }, {});

    const journeyCount = customers.reduce((acc, c) => {
      const stage = c.journeyStage || "Mới";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    stats = {
      totalLeads: customers.length,
      statusCount,
      heatCount,
      journeyCount,
      memberPerformance
    };
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
