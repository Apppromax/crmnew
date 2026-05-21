import { createClient } from "@/lib/supabase/server";
import nextDynamic from "next/dynamic";

const Dashboard = nextDynamic(() => import("@/components/Dashboard"), {
  loading: () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-semibold">Đang tải...</div>
    </div>
  ),
});

const LandingPage = nextDynamic(() => import("@/components/LandingPage"), {
  loading: () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-semibold">Đang tải...</div>
    </div>
  ),
});

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
