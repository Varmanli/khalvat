import Link from "next/link";
import { htmlToPlainText } from "@/lib/html-utils";
import { Search, FileText, CheckSquare } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getUserEntries } from "@/lib/entries";
import { getUserTasks } from "@/lib/tasks";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ENTRY_TYPE_META } from "@/lib/constants";
import { TASK_PRIORITY_META } from "@/lib/task-constants";
import { formatJalaliDate } from "@/lib/date";
import { formatPersianNumber } from "@/lib/persian-numbers";
import { TaskPriorityBadge } from "@/components/task-priority-badge";

interface SearchParams {
  q?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireUser();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [userRows, entries, tasks] = await Promise.all([
    db.select({ name: users.name }).from(users).where(eq(users.id, session.userId)).limit(1),
    query
      ? getUserEntries(session.userId, { q: query }).then((r) => r.slice(0, 10))
      : Promise.resolve([]),
    query
      ? getUserTasks(session.userId, { q: query }).then((r) => r.slice(0, 10))
      : Promise.resolve([]),
  ]);

  const userName = userRows[0]?.name ?? "";
  const hasResults = entries.length > 0 || tasks.length > 0;

  return (
    <AppShell userName={userName}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">جستجو</h1>
        {query && (
          <p className="text-sm text-muted">
            نتایج برای: <span className="text-foreground font-medium">«{query}»</span>
          </p>
        )}
      </div>

      {!query && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-card-soft flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-muted" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">دنبال چی می‌گردی؟</p>
          <p className="text-sm text-muted">
            در کادر جستجوی بالا بنویس تا نوشته‌ها و وظایفت پیدا شوند.
          </p>
        </div>
      )}

      {query && !hasResults && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-card-soft flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-muted" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">چیزی پیدا نشد.</p>
          <p className="text-sm text-muted">عبارت دیگری امتحان کن.</p>
        </div>
      )}

      {/* Entries results */}
      {entries.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={15} className="text-muted" />
            <h2 className="text-sm font-semibold text-foreground">
              نوشته‌ها
              <span className="text-muted font-normal mr-1">({formatPersianNumber(entries.length)})</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {entries.map((entry) => {
              const meta = ENTRY_TYPE_META[entry.type];
              const Icon = meta.icon;
              return (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  className="block group bg-card border border-border rounded-2xl px-4 py-3 hover:border-primary-soft hover:shadow-sm transition-all duration-150"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-card-soft flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={14} className="text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {entry.title}
                      </p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-2 leading-relaxed">
                        {htmlToPlainText(entry.content)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted">{meta.label}</span>
                        <span className="text-border">·</span>
                        <span className="text-xs text-muted">
                          {formatJalaliDate(entry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Tasks results */}
      {tasks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={15} className="text-muted" />
            <h2 className="text-sm font-semibold text-foreground">
              وظایف
              <span className="text-muted font-normal mr-1">({formatPersianNumber(tasks.length)})</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => {
              const accent = task.color ?? TASK_PRIORITY_META[task.priority].dotColor;
              const isDone = task.status === "done";
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block group bg-card border border-border rounded-2xl px-4 py-3 hover:border-primary-soft hover:shadow-sm transition-all duration-150 relative overflow-hidden"
                >
                  <div
                    className="absolute top-2.5 bottom-2.5 right-0 w-1 rounded-full"
                    style={{ background: accent }}
                  />
                  <div className="pr-2">
                    <p
                      className={`text-sm font-medium group-hover:text-primary transition-colors line-clamp-1 ${
                        isDone ? "line-through text-muted" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <TaskPriorityBadge priority={task.priority} />
                      {task.dueAt && (
                        <span className="text-xs text-muted">
                          {formatJalaliDate(task.dueAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}

