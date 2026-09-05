import { DailyWorkspace } from "@/components/planner/daily-workspace";
import { requireUser } from "@/lib/auth";
import { todayKey, validDateKey } from "@/lib/planner-dates";
export const metadata = { title: "امروز" };
export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser();
  const { date } = await searchParams;
  const selectedDate = date && validDateKey(date) ? date : todayKey();
  return <DailyWorkspace userId={user.userId} date={selectedDate} showTimeline />;
}
