import Link from "next/link";
import { Bell } from "lucide-react";

import { getUpcomingReminders } from "@/lib/entries";
import { TypeBadge } from "@/components/type-badge";
import { formatReminderLabel, isToday } from "@/lib/utils";
import type { EntryType } from "@/lib/constants";

export async function DailyRemindersCard({ userId }: { userId: string }) {
  const reminders = await getUpcomingReminders(userId, 3);

  if (reminders.length === 0) return null;

  return (
    <section className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-card-soft text-primary">
            <Bell className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-foreground">یادآورهای امروز</h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              چیزهایی که نباید از ذهنت لیز بخورند.
            </p>
          </div>
        </div>

        <Link
          href="/reminders"
          className="shrink-0 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary-soft/45 hover:text-primary-dark"
        >
          همه
        </Link>
      </div>

      <div className="space-y-2">
        {reminders.map((entry) => (
          <ReminderItem key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function ReminderItem({
  entry,
}: {
  entry: {
    id: string;
    title: string;
    type: string;
    reminderAt: Date;
  };
}) {
  const todayReminder = isToday(entry.reminderAt);

  return (
    <Link href={`/entries/${entry.id}`} className="group block">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/55 p-3 transition-all duration-200 group-hover:border-primary-soft group-hover:bg-card">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
            todayReminder ? "bg-warning text-white" : "bg-warning/10 text-warning"
          }`}
        >
          <Bell className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
            {entry.title}
          </p>
          <p className="mt-1 text-xs text-muted">
            {formatReminderLabel(entry.reminderAt)}
          </p>
        </div>

        <TypeBadge type={entry.type as EntryType} />
      </div>
    </Link>
  );
}
