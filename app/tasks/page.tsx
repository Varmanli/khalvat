import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Clock3,
  Feather,
  ListChecks,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { eq } from "drizzle-orm";

import { AppShell } from "@/components/app-shell";
import { TaskCard } from "@/components/task-card";
import { TaskFilters } from "@/components/task-filters";
import { DailyGuideCard } from "@/components/sidebar/daily-guide-card";
import { DailyTasksCard } from "@/components/sidebar/daily-tasks-card";
import { DailyVerseCard } from "@/components/sidebar/daily-verse-card";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { TaskPriority, TaskStatus } from "@/lib/task-constants";
import { getUserTaskCategories } from "@/lib/task-categories";
import {
  getUserTasks,
  getUserTaskStats,
  type TaskFilters as TFilters,
} from "@/lib/tasks";
import { formatPersianNumber } from "@/lib/persian-numbers";

interface SearchParams {
  q?: string;
  status?: string;
  priority?: string;
  categoryId?: string;
  due?: string;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireUser();
  const sp = await searchParams;

  const [userRows, taskList, stats, categories] = await Promise.all([
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),
    getUserTasks(session.userId, {
      q: sp.q,
      status: sp.status as TaskStatus,
      priority: sp.priority as TaskPriority,
      categoryId: sp.categoryId,
      due: sp.due as TFilters["due"],
    }),
    getUserTaskStats(session.userId),
    getUserTaskCategories(session.userId),
  ]);

  const userName = userRows[0]?.name ?? "";
  const hasFilters = Boolean(
    sp.q || sp.status || sp.priority || sp.categoryId || sp.due,
  );

  return (
    <AppShell userName={userName}>
      <div className="relative">
        <div className="pointer-events-none absolute -top-12 right-0 size-72 rounded-full bg-primary-soft/20 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <TasksHero userName={userName} stats={stats} />

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatChip
              label="همه وظایف"
              value={stats.total}
              icon={<ClipboardList className="size-4" />}
              href="/tasks"
              description="همه چیزهایی که باید یادت بماند"
            />
            <StatChip
              label="برای امروز"
              value={stats.dueToday}
              icon={<Clock3 className="size-4" />}
              href="/tasks?due=today"
              description="چیزهایی که امروز منتظر تو هستند"
            />
            <StatChip
              label="عقب‌افتاده"
              value={stats.overdue}
              icon={<AlertCircle className="size-4" />}
              href="/tasks?due=overdue"
              description="کارهایی که بهتره برگردن روی میز"
              warn={stats.overdue > 0}
            />
            <StatChip
              label="انجام‌شده"
              value={stats.done}
              icon={<Check className="size-4" />}
              href="/tasks?status=done"
              description="کارهایی که از ذهنت سبک شدند"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="min-w-0 space-y-5">
              <section className="relative z-30 overflow-visible rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_24px_90px_rgba(94,58,47,0.07)] sm:p-6">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.25rem]">
                  <div className="absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/18" />
                  <div className="absolute -left-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" />
                </div>

                <div className="relative">
                  <div className="mb-5 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark shadow-[0_12px_32px_rgba(94,58,47,0.1)]">
                        <ListChecks className="size-5" />
                      </span>

                      <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
                          <Sparkles className="size-3.5 text-gold" />
                          چیزهایی که نباید گم شوند
                        </div>

                        <h2 className="text-lg font-black text-foreground">
                          دفتر وظایف
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
                          کارهای کوچک و بزرگت را اینجا نگه دار؛ یکی‌یکی، آرام‌تر
                          و مرتب‌تر.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/tasks/new"
                      className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
                    >
                      وظیفه جدید
                      <PlusCircle className="size-4" />
                    </Link>
                  </div>

                  <TaskFilters
                    initialQ={sp.q}
                    initialStatus={sp.status}
                    initialPriority={sp.priority}
                    initialCategoryId={sp.categoryId}
                    initialDue={sp.due}
                    categories={categories}
                  />
                </div>
              </section>

              {taskList.length === 0 ? (
                <EmptyState hasFilters={hasFilters} />
              ) : (
                <section className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-bold text-muted">
                      {formatPersianNumber(taskList.length)} وظیفه پیدا شد
                    </p>

                    {hasFilters && (
                      <Link
                        href="/tasks"
                        className="text-xs font-black text-primary transition-colors hover:text-primary-dark"
                      >
                        پاک کردن فیلترها
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {taskList.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </section>
              )}
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <DailyGuideCard
                title="راهنمای دفتر وظایف"
                subtitle="کارهای کوچک، قدم‌های واقعی"
                tips={[
                  {
                    icon: <PlusCircle className="size-3.5" />,
                    text: "وظایف را کوچک و قابل انجام بنویس",
                  },
                  {
                    icon: <CheckSquare className="size-3.5" />,
                    text: "یک اولویت امروز انتخاب کن",
                  },
                  {
                    icon: <AlertCircle className="size-3.5" />,
                    text: "عقب‌افتاده‌ها را اول مرتب کن",
                  },
                  {
                    icon: <Bell className="size-3.5" />,
                    text: "تاریخ بگذار تا ذهنت خلوت‌تر بشه",
                  },
                ]}
              />

              <DailyTasksCard userId={session.userId} />

              <DailyVerseCard />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TasksHero({
  userName,
  stats,
}: {
  userName: string;
  stats: Awaited<ReturnType<typeof getUserTaskStats>>;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.1)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/20" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-tl-[8rem] bg-primary/8" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-8">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <Link
              href="/dashboard"
              className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
            >
              <ArrowLeft className="size-3.5 rotate-180" />
              داشبورد
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              {userName ? `سلام ${userName}` : "دفتر کارهای امروز"}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              کارهایی که باید یادت بماند
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              هر کاری که توی ذهنت مانده، اینجا جایش امن است؛ بنویسش تا ذهنت کمی
              خلوت‌تر شود.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniHeroStat
              icon={<CheckSquare className="size-4" />}
              label="امروز"
              text={`${formatPersianNumber(stats.dueToday)} کار روی میزته`}
            />
            <MiniHeroStat
              icon={<AlertCircle className="size-4" />}
              label="جا مانده"
              text={`${formatPersianNumber(stats.overdue)} کار منتظرته`}
              warn={stats.overdue > 0}
            />
            <MiniHeroStat
              icon={<CheckCircle2 className="size-4" />}
              label="سبک شده"
              text={`${formatPersianNumber(stats.done)} کار انجام شده`}
            />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/82 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">
                  برنامه کوچک امروز
                </p>
                <p className="mt-1 text-lg font-black text-foreground">
                  سه قدم آرام
                </p>
              </div>

              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
                <ListChecks className="size-5" />
              </span>
            </div>

            <div className="space-y-3">
              <HeroPrompt text="یک کار کوچیک که امروز جلو می‌بری" />
              <HeroPrompt text="چیزی که بهتره دیگه توی ذهنت نمونه" />
              <HeroPrompt text="کاری که انجام دادنش دلت رو سبک می‌کنه" />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Feather className="mb-2 size-4 text-gold" />
              <p className="text-sm leading-7 text-muted">
                لازم نیست همه‌چیز امروز تمام شود؛ همین که یک قدم روشن برداری،
                کافی‌ست.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatChip({
  label,
  value,
  icon,
  href,
  description,
  warn,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  href: string;
  description: string;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-4 shadow-[0_14px_50px_rgba(94,58,47,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_18px_60px_rgba(94,58,47,0.08)]"
    >
      <div className="pointer-events-none absolute -left-10 -top-10 size-28 rounded-full bg-primary-soft/14 blur-2xl" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span
            className={
              warn
                ? "flex size-11 items-center justify-center rounded-2xl bg-danger/10 text-danger"
                : "flex size-11 items-center justify-center rounded-2xl bg-card-soft text-primary"
            }
          >
            {icon}
          </span>

          <span className="text-3xl font-black text-foreground">
            {formatPersianNumber(value)}
          </span>
        </div>

        <p className="text-sm font-black text-foreground">{label}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
          {description}
        </p>
      </div>
    </Link>
  );
}

function MiniHeroStat({
  icon,
  label,
  text,
  warn,
}: {
  icon: ReactNode;
  label: string;
  text: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-card/75 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={
            warn
              ? "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger"
              : "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark"
          }
        >
          {icon}
        </span>

        <div>
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="mt-1 text-sm font-black text-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

function HeroPrompt({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-3 py-3 text-sm font-bold text-foreground">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        <CheckCircle2 className="size-4" />
      </span>
      {text}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card p-8 text-center shadow-[0_24px_90px_rgba(94,58,47,0.07)] sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/16" />
      <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-md">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-card-soft text-primary shadow-sm">
          <CheckSquare className="size-7" />
        </div>

        <h2 className="text-lg font-black text-foreground">
          {hasFilters ? "چیزی پیدا نشد" : "هنوز وظیفه‌ای ننوشتی"}
        </h2>

        <p className="mt-2 text-sm leading-7 text-muted">
          {hasFilters
            ? "فیلترها را کمی تغییر بده؛ شاید کار موردنظرت پشت یک انتخاب دیگر پنهان شده."
            : "اولین کار کوچک را بنویس تا ذهنت کمی خلوت‌تر شود."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {hasFilters ? (
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2.5 text-xs font-black text-primary transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
            >
              پاک کردن فیلترها
            </Link>
          ) : (
            <Link
              href="/tasks/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              <PlusCircle className="size-4" />
              اولین وظیفه
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
