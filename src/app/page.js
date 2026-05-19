import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/LandingPage";

import { getSmartQueue, getCustomerCount } from "@/actions/customers";
import { getTeamContext } from "@/actions/team";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const [queue, counts, teamCtx] = await Promise.all([
    getSmartQueue(),
    getCustomerCount(),
    getTeamContext(),
  ]);

  return <Dashboard initialQueue={queue} initialCounts={counts} hasTeam={teamCtx?.hasTeam} />;
}
