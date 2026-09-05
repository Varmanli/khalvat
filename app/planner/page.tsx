import { DailyWorkspace } from "@/components/planner/daily-workspace";
import { requireUser } from "@/lib/auth";
import { todayKey, validDateKey } from "@/lib/planner-dates";
export const metadata = { title: "برنامه روزانه" };
export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser();
  const { date } = await searchParams;
  return <DailyWorkspace userId={user.userId} date={date && validDateKey(date) ? date : todayKey()} plannerOnly />;
}
