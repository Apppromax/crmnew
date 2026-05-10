import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/LandingPage";

import { getSmartQueue, getCustomerCount, getDashboardStats } from "@/actions/customers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const [queue, counts, stats] = await Promise.all([
    getSmartQueue(),
    getCustomerCount(),
    getDashboardStats(),
  ]);

  return <Dashboard initialQueue={queue} initialCounts={counts} dashboardStats={stats} />;
}
