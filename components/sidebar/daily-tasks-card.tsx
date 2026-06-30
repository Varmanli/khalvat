import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  CheckSquare,
  Clock3,
} from "lucide-react";

import { getUserTasks } from "@/lib/tasks";
import { TASK_PRIORITY_META } from "@/lib/task-constants";
import { formatJalaliDate } from "@/lib/date";

export async function DailyTasksCard({ userId }: { userId: string }) {
  const [todayTasks, overdueTasks, upcomingTasks] = await Promise.all([
    getUserTasks(userId, { due: "today", status: undefined }).then((tasks) =>
      tasks
        .filter((t) => t.status !== "done" && t.status !== "archived")
        .slice(0, 3),
    ),
    getUserTasks(userId, { due: "overdue", status: undefined }).then((tasks) =>
      tasks.slice(0, 2),
    ),
    getUserTasks(userId, { due: "upcoming", status: undefined }).then((tasks) =>
      tasks
        .filter((t) => t.status !== "done" && t.status !== "archived")
        .slice(0, 2),
    ),
  ]);

  const empty =
    todayTasks.length === 0 &&
    overdueTasks.length === 0 &&
    upcomingTasks.length === 0;

  return (
    <section className="rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-card-soft text-primary">
            <CheckSquare className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-foreground">وظایف</h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              کارهای کوچک، قدم‌های واقعی.
            </p>
          </div>
        </div>

        <Link
          href="/tasks"
          className="shrink-0 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary-soft/45 hover:text-primary-dark"
        >
          همه
        </Link>
      </div>

      {empty ? (
        <div className="rounded-2xl border border-dashed border-border bg-background/55 p-4">
          <p className="text-sm font-semibold text-foreground">
            فعلاً وظیفه‌ای نداری.
          </p>
          <Link
            href="/tasks/new"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark"
          >
            اولین وظیفه را اضافه کن
            <ArrowLeft className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {overdueTasks.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-danger">
                <AlertCircle className="size-3.5" />
                عقب‌افتاده
              </p>
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <TaskMiniItem key={task.id} task={task} overdue />
                ))}
              </div>
            </div>
          )}

          {todayTasks.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-olive">
                <CalendarCheck className="size-3.5" />
                امروز
              </p>
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <TaskMiniItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-muted">
                <Clock3 className="size-3.5" />
                نزدیک
              </p>
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <TaskMiniItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function TaskMiniItem({
  task,
  overdue,
}: {
  task: {
    id: string;
    title: string;
    priority: keyof typeof TASK_PRIORITY_META;
    color: string | null;
    dueAt: Date | null;
  };
  overdue?: boolean;
}) {
  const accent = overdue
    ? "var(--danger)"
    : (task.color ?? TASK_PRIORITY_META[task.priority].dotColor);

  return (
    <Link href={`/tasks/${task.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background/55 p-3 transition-all duration-200 hover:border-primary-soft hover:bg-card">
        <span
          className="absolute bottom-0 right-0 top-0 w-1"
          style={{ background: accent }}
        />
        <div className="pr-2">
          <p className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary">
            {task.title}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <Clock3 className="size-3.5" />
            {task.dueAt ? formatJalaliDate(task.dueAt) : "بدون تاریخ"}
          </div>
        </div>
      </div>
    </Link>
  );
}
