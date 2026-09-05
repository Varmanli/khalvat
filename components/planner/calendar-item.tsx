import Link from "next/link";
import { Bell, CalendarDays, CheckSquare, Clock3, Milestone } from "lucide-react";
import type { CalendarItem as Item } from "@/lib/planner";
import { toPersianDigits } from "@/lib/date";
import { GoalContextLink } from "@/components/goals/goal-context-link";
export const ITEM_LABELS = {
  task: "وظیفه",
  event: "رویداد",
  reminder: "یادآور",
  deadline: "مهلت",
  milestone: "نقطه عطف",
};
const icons = {
  task: CheckSquare,
  event: CalendarDays,
  reminder: Bell,
  deadline: Clock3,
  milestone: Milestone,
};
export function CalendarItem({ item }: { item: Item }) {
  const Icon = icons[item.kind];
  return (
    <Link
      href={item.href}
      aria-label={item.kind === "milestone" && item.goal ? `نقطه عطف ${item.title} برای هدف ${item.goal.title}` : undefined}
      className={`flex min-w-0 items-start gap-2 rounded-xl border border-border/70 p-2 text-sm transition-colors hover:bg-card-soft focus-visible:outline-2 focus-visible:outline-primary ${item.kind === "event" ? "bg-primary-soft/20" : item.kind === "reminder" ? "bg-olive/10" : item.kind === "milestone" ? "bg-gold/8 border-gold/20" : "bg-background/60"}`}
    >
      <Icon size={15} className="mt-1 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block text-[11px] text-muted">
          {ITEM_LABELS[item.kind]} ·{" "}
          {item.time
            ? toPersianDigits(
                item.time + (item.endTime ? ` – ${item.endTime}` : ""),
              )
            : "تمام روز"}
        </span>
        <span
          className={`wrap-break-word leading-6 ${item.done ? "line-through text-muted" : ""}`}
        >
          {item.title}
        </span>
        {item.goal && <span className="mt-1 block"><GoalContextLink goal={item.goal} /></span>}
      </span>
    </Link>
  );
}
