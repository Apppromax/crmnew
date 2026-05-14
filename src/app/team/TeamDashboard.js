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
    const [membersData, customersData, statsData] = await Promise.all([
      getTeamMembers(team.id),
      getTeamCustomers(team.id),
      getTeamStats(team.id)
    ]);
    members = membersData;
    customers = customersData;
    stats = statsData;
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
