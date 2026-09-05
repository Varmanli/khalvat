import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  ListTodo,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { MilestoneToggle } from "@/components/goals/milestone-toggle";
import { AddMilestone } from "@/components/goals/add-milestone";

import { requireUser } from "@/lib/auth";
import { getUserGoalById } from "@/lib/goals";
import {
  getGoalNextAction,
  getGoalUpcoming,
  getGoalWeekSummary,
} from "@/lib/goal-execution";
import { formatJalaliDate } from "@/lib/date";
import { toPersianDigits } from "@/lib/persian-numbers";

export default async function GoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const goal = await getUserGoalById(user.userId, id);

  if (!goal) {
    notFound();
  }

  const next = getGoalNextAction(
    goal.linkedTasks,
    goal.linkedHabits,
    goal.milestones,
    goal.habitLogs,
  );

  const week = getGoalWeekSummary(
    goal.linkedTasks,
    goal.linkedHabits,
    goal.milestones,
    goal.habitLogs,
  );

  const upcoming = getGoalUpcoming(goal.linkedTasks, goal.milestones);

  const hasPlan =
    goal.linkedTasks.length +
      goal.linkedHabits.length +
      goal.milestones.length >
    0;

  const progress = Math.max(
    0,
    Math.min(100, Math.round(goal.calculatedProgress)),
  );

  return (
    <AppShell>
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 left-0 size-72 rounded-full bg-primary-soft/25 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl space-y-6 lg:space-y-8">
          <GoalHero goal={goal} progress={progress} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <main className="min-w-0 space-y-7">
              <JournalSection
                icon={<Target className="size-4" />}
                title="قدم بعدی"
                subtitle="کوچک‌ترین کار روشن برای ادامه مسیر."
              >
                {next ? (
                  <Link
                    href={next.href}
                    className="group flex items-center justify-between gap-4 rounded-3xl border border-border bg-background/55 p-4 transition-all hover:border-primary-soft hover:bg-background/80"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-foreground transition-colors group-hover:text-primary-dark">
                        {next.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted">
                        {next.date
                          ? formatJalaliDate(next.date)
                          : next.metadata}
                      </p>
                    </div>

                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft/45 text-primary-dark">
                      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                    </span>
                  </Link>
                ) : (
                  <PlanActions goalId={goal.id} />
                )}
              </JournalSection>

              {(week.taskPlanned ||
                week.habitPlanned ||
                week.milestonesDue > 0) && (
                <JournalSection
                  icon={<CalendarDays className="size-4" />}
                  title="این هفته"
                  subtitle="فقط چیزهایی که همین حالا نزدیک‌اند."
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    {week.taskPlanned > 0 && (
                      <MiniStat
                        value={`${toPersianDigits(
                          week.taskCompleted,
                        )} از ${toPersianDigits(week.taskPlanned)}`}
                        label="وظیفه"
                      />
                    )}

                    {week.habitPlanned > 0 && (
                      <MiniStat
                        value={`${toPersianDigits(
                          week.habitCompleted,
                        )} از ${toPersianDigits(week.habitPlanned)}`}
                        label="جلسه عادت"
                      />
                    )}

                    {week.milestonesDue > 0 && (
                      <MiniStat
                        value={toPersianDigits(week.milestonesDue)}
                        label="نقطه عطف نزدیک"
                      />
                    )}
                  </div>
                </JournalSection>
              )}

              {upcoming.length > 0 && (
                <JournalSection
                  icon={<CalendarDays className="size-4" />}
                  title="پیش رو"
                  subtitle="چیزهایی که در ادامه مسیر بهت نزدیک می‌شن."
                >
                  <div className="space-y-2">
                    {upcoming.map((item) => (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={item.href}
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/55 px-4 py-3 transition-colors hover:border-primary-soft hover:bg-background/80"
                      >
                        <span className="min-w-0 text-sm font-bold text-foreground">
                          {item.type === "milestone" ? "نقطه عطف · " : ""}
                          {item.title}
                        </span>

                        <span className="shrink-0 text-xs font-bold text-muted">
                          {formatJalaliDate(item.date)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </JournalSection>
              )}

              <JournalSection
                icon={<CheckCircle2 className="size-4" />}
                title="مرحله‌ها"
                subtitle="ایستگاه‌های روشن این مسیر."
              >
                <div id="milestones" className="space-y-2.5">
                  {goal.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-3 rounded-3xl border border-border bg-background/55 p-4"
                    >
                      <MilestoneToggle
                        goalId={goal.id}
                        id={milestone.id}
                        done={milestone.status === "completed"}
                      />

                      <div className="min-w-0 flex-1">
                        <p
                          className={
                            milestone.status === "completed"
                              ? "text-sm font-black text-muted line-through"
                              : "text-sm font-black text-foreground"
                          }
                        >
                          {milestone.title}
                        </p>

                        {milestone.targetDate && (
                          <p className="mt-1 text-[11px] text-muted">
                            {formatJalaliDate(milestone.targetDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <AddMilestone goalId={goal.id} />
                </div>
              </JournalSection>

              <JournalSection
                icon={<ListTodo className="size-4" />}
                title="برنامه اجرایی"
                subtitle="کارها و عادت‌هایی که به این هدف وصل کردی."
              >
                {hasPlan ? (
                  <>
                    <div className="space-y-2.5">
                      {goal.linkedHabits.map((habit) => (
                        <Link
                          key={habit.id}
                          href={`/habits/${habit.id}`}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-background/55 px-4 py-3 text-sm font-bold text-foreground transition hover:border-primary-soft hover:bg-background/80"
                        >
                          <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft/45 text-primary-dark">
                            ↻
                          </span>

                          {habit.title}
                        </Link>
                      ))}

                      {goal.linkedTasks.map((task) => (
                        <Link
                          key={task.id}
                          href={`/tasks/${task.id}`}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-background/55 px-4 py-3 text-sm font-bold text-foreground transition hover:border-primary-soft hover:bg-background/80"
                        >
                          <span className="flex size-8 items-center justify-center rounded-xl bg-card-soft text-primary">
                            {task.status === "done" ? "✓" : "•"}
                          </span>

                          <span
                            className={
                              task.status === "done"
                                ? "text-muted line-through"
                                : ""
                            }
                          >
                            {task.title}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <PlanLinks goalId={goal.id} />
                  </>
                ) : (
                  <PlanActions goalId={goal.id} />
                )}
              </JournalSection>
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <JournalSection
                icon={<Target className="size-4" />}
                title="چرای این مسیر"
                subtitle="چیزی که باعث می‌شه ادامه بدی."
              >
                {goal.motivation ? (
                  <p className="text-sm leading-7 text-muted">
                    {goal.motivation}
                  </p>
                ) : (
                  <p className="text-sm text-muted">هنوز چرایش را ننوشته‌ای.</p>
                )}
              </JournalSection>

              <JournalSection
                icon={<CalendarDays className="size-4" />}
                title="تاریخچه"
                subtitle="تغییرهای مهم این هدف."
              >
                <div className="space-y-1">
                  {goal.activities.slice(0, 6).map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-[1.25rem] px-3 py-3 transition-colors hover:bg-background/55"
                    >
                      <p className="text-xs leading-6 text-muted">
                        {activity.detail || activity.type}
                      </p>
                    </div>
                  ))}
                </div>
              </JournalSection>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

function GoalHero({
  goal,
  progress,
}: {
  goal: Awaited<ReturnType<typeof getUserGoalById>>;
  progress: number;
}) {
  if (!goal) return null;

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.09)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/25" />
      <div className="pointer-events-none absolute -left-16 -top-16 size-60 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-tl-[7rem] bg-primary/10" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-8">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <Link
              href="/goals"
              className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
            >
              <ArrowLeft className="size-3.5 rotate-180" />
              همه هدف‌ها
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              {goal.health.label}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {goal.title}
            </h1>

            {goal.description && (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                {goal.description}
              </p>
            )}
          </div>

          <div className="max-w-xl">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted">
              <span>پیشرفت مسیر</span>

              <span className="font-black text-primary-dark">
                {toPersianDigits(progress)}٪
              </span>
            </div>

            <div
              className="h-2.5 overflow-hidden rounded-full bg-card-soft"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/80 p-5 shadow-[0_18px_60px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">وضعیت مسیر</p>

                <p className="mt-1 text-lg font-black text-foreground">
                  {toPersianDigits(progress)}٪ پیشرفت
                </p>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <Target className="size-5" />
              </div>
            </div>

            <div className="space-y-3">
              <HeroLine
                icon={<TrendingUp className="size-4" />}
                label="پیشرفت"
                value={`${toPersianDigits(progress)}٪`}
              />

              <HeroLine
                icon={<CheckCircle2 className="size-4" />}
                label="مرحله‌ها"
                value={`${toPersianDigits(
                  goal.completedMilestones,
                )} از ${toPersianDigits(goal.milestones.length)}`}
              />

              <HeroLine
                icon={<CalendarDays className="size-4" />}
                label="تاریخ هدف"
                value={
                  goal.targetDate
                    ? formatJalaliDate(goal.targetDate)
                    : "بدون تاریخ"
                }
              />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Quote className="mb-2 size-4 text-gold" />

              <p className="text-sm leading-7 text-muted">
                مسیر وقتی روشن‌تر می‌شه که قدم بعدی رو بتونی ببینی.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/55 px-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-bold text-muted">{label}</p>

        <p className="mt-0.5 truncate text-sm font-black text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  SECTION                                   */
/* -------------------------------------------------------------------------- */

function JournalSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-4xl border border-border bg-card/72 p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
          {icon}
        </span>

        <div>
          <h2 className="text-base font-black text-foreground">{title}</h2>

          <p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-background/55 p-3.5">
      <strong className="text-lg font-black text-foreground">{value}</strong>

      <p className="mt-1 text-[11px] font-bold text-muted">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               PLAN ACTIONS                                 */
/* -------------------------------------------------------------------------- */

function PlanLinks({ goalId }: { goalId: string }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link
        href={`/tasks/new?goalId=${goalId}`}
        className="inline-flex items-center rounded-2xl border border-border bg-background/65 px-3.5 py-2 text-xs font-black text-primary transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
      >
        + وظیفه
      </Link>

      <Link
        href={`/habits/new?goalId=${goalId}`}
        className="inline-flex items-center rounded-2xl border border-border bg-background/65 px-3.5 py-2 text-xs font-black text-primary transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
      >
        + عادت
      </Link>
    </div>
  );
}

function PlanActions({ goalId }: { goalId: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-background/45 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft/45 text-primary-dark">
          <CircleDot className="size-4" />
        </span>

        <div>
          <p className="text-sm font-black text-foreground">
            هنوز قدمی تعریف نشده
          </p>

          <p className="mt-1 text-xs leading-6 text-muted">
            یک وظیفه یا عادت اضافه کن تا مسیر شروع بشه.
          </p>
        </div>
      </div>

      <PlanLinks goalId={goalId} />
    </div>
  );
}
