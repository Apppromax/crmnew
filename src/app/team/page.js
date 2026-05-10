import { getTeamContext } from "@/actions/team";
import TeamDashboard from "./TeamDashboard";
import NoTeamView from "./NoTeamView";

export default async function TeamPage() {
  const context = await getTeamContext();

  if (context.hasTeam) {
    return <TeamDashboard context={context} />;
  }

  return <NoTeamView />;
}
