import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { eq } from "drizzle-orm";

import { AppShell } from "@/components/app-shell";
import { TaskPriorityBadge } from "@/components/task-priority-badge";
import { requireUser } from "@/lib/auth";
import { formatJalaliDate } from "@/lib/date";
import { htmlToPlainText } from "@/lib/html-utils";
import { getUserEntries } from "@/lib/entries";
import { getUserTasks } from "@/lib/tasks";
import { formatPersianNumber, toPersianDigits } from "@/lib/persian-numbers";
import { ENTRY_TYPE_META } from "@/lib/constants";
import { TASK_PRIORITY_META } from "@/lib/task-constants";
import { db } from "@/db";
import { users } from "@/db/schema";

interface SearchParams {
  q?: string;
}

export const metadata = {
  title: "جستجو — خلوت",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireUser();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [userRows, entries, tasks] = await Promise.all([
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),
    query
      ? getUserEntries(session.userId, { q: query }).then((result) =>
          result.slice(0, 10),
        )
      : Promise.resolve([]),
    query
      ? getUserTasks(session.userId, { q: query }).then((result) =>
          result.slice(0, 10),
        )
      : Promise.resolve([]),
  ]);

  const userName = userRows[0]?.name ?? "";
  const hasResults = entries.length > 0 || tasks.length > 0;

  return (
    <AppShell userName={userName}>
      <div className="relative">
        <div className="pointer-events-none absolute -top-16 right-0 size-80 rounded-full bg-primary-soft/22 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-36 size-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <SearchHero
            query={query}
            entriesCount={entries.length}
            tasksCount={tasks.length}
          />

          {!query && <EmptySearchState mode="idle" />}

          {query && !hasResults && (
            <EmptySearchState mode="empty" query={query} />
          )}

          {hasResults && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <main className="min-w-0 space-y-6 xl:order-2">
                {entries.length > 0 && (
                  <ResultSection
                    icon={<FileText className="size-4" />}
                    title="نوشته‌ها"
                    count={entries.length}
                    subtitle="چیزهایی که قبلاً نوشته بودی و با این جستجو پیدا شدند."
                  >
                    <div className="space-y-2.5">
                      {entries.map((entry) => {
                        const meta = ENTRY_TYPE_META[entry.type];
                        const Icon = meta.icon;
                        const excerpt = toPersianDigits(
                          htmlToPlainText(entry.content).trim(),
                        );

                        return (
                          <Link
                            key={entry.id}
                            href={`/entries/${entry.id}`}
                            className="group block"
                          >
                            <article className="relative overflow-hidden rounded-3xl border border-border bg-background/72 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_16px_54px_rgba(94,58,47,0.08)]">
                              <div className="pointer-events-none absolute -left-12 -top-12 size-36 rounded-full bg-primary-soft/12 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

                              <div className="relative flex items-start gap-3">
                                <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
                                  <Icon className="size-4" />
                                </span>

                                <div className="min-w-0 flex-1">
                                  <h3 className="line-clamp-1 text-sm font-black text-foreground transition-colors group-hover:text-primary sm:text-base">
                                    {entry.title || "نوشته بدون عنوان"}
                                  </h3>

                                  {excerpt && (
                                    <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-muted">
                                      {excerpt}
                                    </p>
                                  )}

                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-black text-muted">
                                      {meta.label}
                                    </span>

                                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted">
                                      {formatJalaliDate(entry.createdAt)}
                                    </span>
                                  </div>
                                </div>

                                <ArrowLeft className="mt-3 hidden size-4 shrink-0 text-muted transition-transform group-hover:-translate-x-1 group-hover:text-primary sm:block" />
                              </div>
                            </article>
                          </Link>
                        );
                      })}
                    </div>
                  </ResultSection>
                )}

                {tasks.length > 0 && (
                  <ResultSection
                    icon={<CheckSquare className="size-4" />}
                    title="وظایف"
                    count={tasks.length}
                    subtitle="کارهایی که با عبارت جستجو شده هماهنگ بودند."
                  >
                    <div className="space-y-2.5">
                      {tasks.map((task) => {
                        const accent =
                          task.color ??
                          task.category?.color ??
                          TASK_PRIORITY_META[task.priority].dotColor;
                        const isDone = task.status === "done";
                        const excerpt = task.description
                          ? toPersianDigits(
                              htmlToPlainText(task.description).trim(),
                            )
                          : "";

                        return (
                          <Link
                            key={task.id}
                            href={`/tasks/${task.id}`}
                            className="group block"
                          >
                            <article className="relative overflow-hidden rounded-3xl border border-border bg-background/72 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_16px_54px_rgba(94,58,47,0.08)]">
                              <div
                                className="pointer-events-none absolute bottom-3 right-0 top-3 w-1.5 rounded-l-full"
                                style={{ backgroundColor: accent }}
                              />

                              <div
                                className="pointer-events-none absolute -left-12 -top-12 size-36 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100"
                                style={{ backgroundColor: `${accent}22` }}
                              />

                              <div className="relative pr-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <h3
                                      className={[
                                        "line-clamp-1 text-sm font-black transition-colors group-hover:text-primary sm:text-base",
                                        isDone
                                          ? "text-muted line-through"
                                          : "text-foreground",
                                      ].join(" ")}
                                    >
                                      {task.title}
                                    </h3>

                                    {excerpt && (
                                      <p
                                        className={[
                                          "mt-1.5 line-clamp-2 text-xs leading-6 text-muted",
                                          isDone
                                            ? "line-through opacity-70"
                                            : "",
                                        ].join(" ")}
                                      >
                                        {excerpt}
                                      </p>
                                    )}
                                  </div>

                                  <ArrowLeft className="mt-1 hidden size-4 shrink-0 text-muted transition-transform group-hover:-translate-x-1 group-hover:text-primary sm:block" />
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <TaskPriorityBadge priority={task.priority} />

                                  {task.category && (
                                    <span
                                      className="rounded-full px-2.5 py-1 text-xs font-black text-white shadow-sm"
                                      style={{
                                        backgroundColor: task.category.color,
                                      }}
                                    >
                                      {task.category.name}
                                    </span>
                                  )}

                                  {task.dueAt && (
                                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted">
                                      {formatJalaliDate(task.dueAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </article>
                          </Link>
                        );
                      })}
                    </div>
                  </ResultSection>
                )}
              </main>

              <aside className="xl:order-1 xl:sticky xl:top-28 xl:self-start">
                <SearchSideCard
                  query={query}
                  entriesCount={entries.length}
                  tasksCount={tasks.length}
                />
              </aside>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function SearchHero({
  query,
  entriesCount,
  tasksCount,
}: {
  query: string;
  entriesCount: number;
  tasksCount: number;
}) {
  const total = entriesCount + tasksCount;

  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.09)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/14" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-56 rounded-tl-[7rem] bg-primary/7" />

      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/75 px-3 py-1.5 text-xs font-black text-muted shadow-sm">
            <Search className="size-3.5 text-primary" />
            پیدا کردن چیزهایی که قبلاً مانده‌اند
          </div>

          <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
            جستجو در خلوت
          </h1>

          {query ? (
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted sm:text-base">
              نتیجه‌ها برای{" "}
              <span className="font-black text-foreground">«{query}»</span> بین
              نوشته‌ها و وظیفه‌هایت.
            </p>
          ) : (
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted sm:text-base">
              یک کلمه، یک حس، یا بخشی از عنوان را بنویس تا خلوت بین نوشته‌ها و
              وظیفه‌هایت دنبالش بگردد.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <HeroStat label="کل نتیجه‌ها" value={total} />
          <HeroStat label="نوشته‌ها" value={entriesCount} />
          <HeroStat label="وظایف" value={tasksCount} />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.4rem] border border-border bg-background/70 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black text-muted">{label}</span>
        <span className="text-xl font-black text-primary-dark">
          {formatPersianNumber(value)}
        </span>
      </div>
    </div>
  );
}

function ResultSection({
  icon,
  title,
  subtitle,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-5">
      <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-primary-soft/10 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
              {icon}
            </span>

            <div>
              <h2 className="text-base font-black text-foreground">{title}</h2>
              <p className="mt-1 text-xs leading-6 text-muted">{subtitle}</p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted">
            <Sparkles className="size-3.5 text-gold" />
            {formatPersianNumber(count)} نتیجه
          </span>
        </div>

        {children}
      </div>
    </section>
  );
}

function EmptySearchState({
  mode,
  query,
}: {
  mode: "idle" | "empty";
  query?: string;
}) {
  const isIdle = mode === "idle";

  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card p-8 text-center shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/14" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/12 blur-3xl" />

      <div className="relative mx-auto max-w-lg">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-[1.75rem] bg-card-soft text-primary shadow-sm">
          <Search className="size-7" />
        </div>

        <h2 className="text-xl font-black text-foreground">
          {isIdle ? "دنبال چی می‌گردی؟" : "چیزی پیدا نشد"}
        </h2>

        <p className="mt-3 text-sm leading-8 text-muted">
          {isIdle
            ? "در کادر جستجوی بالای صفحه بنویس تا خلوت بین نوشته‌ها و وظیفه‌هایت بگردد."
            : `برای «${query ?? ""}» چیزی پیدا نشد. شاید با یک کلمه کوتاه‌تر نتیجه بهتری بگیری.`}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/entries/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <FileText className="size-4" />
            نوشتن جدید
          </Link>

          <Link
            href="/tasks/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-5 py-3 text-sm font-black text-foreground transition-colors hover:border-primary-soft hover:bg-primary-soft/20"
          >
            <CheckSquare className="size-4" />
            وظیفه جدید
          </Link>
        </div>
      </div>
    </section>
  );
}

function SearchSideCard({
  query,
  entriesCount,
  tasksCount,
}: {
  query: string;
  entriesCount: number;
  tasksCount: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
            <Search className="size-5" />
          </span>

          <div>
            <p className="text-sm font-black text-foreground">خلاصه جستجو</p>
            <p className="mt-1 text-xs leading-6 text-muted">
              نتیجه‌ها فقط از داده‌های شخصی خودت نمایش داده می‌شوند.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <SideStat label="عبارت" value={query || "—"} />
          <SideStat
            label="نوشته‌ها"
            value={formatPersianNumber(entriesCount)}
          />
          <SideStat label="وظایف" value={formatPersianNumber(tasksCount)} />
        </div>

        <div className="mt-5 rounded-3xl border border-border bg-background/65 p-4">
          <p className="text-xs font-black text-foreground">یک نکته کوچک</p>
          <p className="mt-2 text-xs leading-6 text-muted">
            اگر نتیجه‌ای پیدا نشد، بخشی از عنوان یا یک کلمه کوتاه‌تر را امتحان
            کن.
          </p>
        </div>
      </div>
    </div>
  );
}

function SideStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/65 px-3 py-2.5">
      <span className="text-xs font-bold text-muted">{label}</span>
      <span className="max-w-40 truncate text-sm font-black text-foreground">
        {value}
      </span>
    </div>
  );
}
