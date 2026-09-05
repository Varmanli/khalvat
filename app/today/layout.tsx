import { PlannerShell } from "@/components/planner/planner-shell";
import { requireUser } from "@/lib/auth";

export default async function TodayLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <PlannerShell userId={user.userId}>{children}</PlannerShell>;
}
