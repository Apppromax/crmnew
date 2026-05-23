import { getUser } from "@/lib/supabase/server";
import nextDynamic from "next/dynamic";
import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/actions/customers";

const LandingPage = nextDynamic(() => import("@/components/LandingPage"), {
  loading: () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-semibold">Đang tải...</div>
    </div>
  ),
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    return <LandingPage />;
  }

  // Single optimized call: 1 auth + 2 parallel queries (customers + hasTeam)
  const { queue, counts, hasTeam } = await getDashboardData();

  return <Dashboard initialQueue={queue} initialCounts={counts} hasTeam={hasTeam} />;
}
