import { getUpcomingSchedule, getOverdueCustomers } from "@/actions/customers";
import ScheduleClient from "./ScheduleClient";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [upcomingData, overdueData] = await Promise.all([
    getUpcomingSchedule(),
    getOverdueCustomers()
  ]);

  return <ScheduleClient initialSchedule={upcomingData} initialOverdue={overdueData} />;
}
