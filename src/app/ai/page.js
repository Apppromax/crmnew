import { getAiReports } from "@/actions/ai";
import { getCustomerCount } from "@/actions/customers";
import AiClient from "./AiClient";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const [reports, counts] = await Promise.all([
    getAiReports(),
    getCustomerCount(),
  ]);

  return <AiClient initialReports={reports} customerCounts={counts} />;
}
