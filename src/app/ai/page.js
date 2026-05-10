import { getAiReports } from "@/actions/ai";
import { getCustomerCount, getDashboardStats } from "@/actions/customers";
import AiClient from "./AiClient";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const [reports, counts, stats] = await Promise.all([
    getAiReports(),
    getCustomerCount(),
    getDashboardStats(),
  ]);

  return <AiClient initialReports={reports} customerCounts={counts} dashboardStats={stats} />;
}
