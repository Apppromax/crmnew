import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/LandingPage";

import { getSmartQueue, getCustomerCount } from "@/actions/customers";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const [queue, counts] = await Promise.all([
    getSmartQueue(),
    getCustomerCount(),
  ]);

  return <Dashboard initialQueue={queue} initialCounts={counts} successParam={searchParams?.success} />;
}
