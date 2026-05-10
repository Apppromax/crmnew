import { getOverdueCustomers } from "@/actions/customers";
import CleanupClient from "./CleanupClient";

export const dynamic = "force-dynamic";

export default async function CleanupPage() {
  const data = await getOverdueCustomers();
  return <CleanupClient initialCustomers={data} />;
}
