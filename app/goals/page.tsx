import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Flag,
  PlusCircle,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";

import { requireUser } from "@/lib/auth";
import { getUserGoals } from "@/lib/goals";
import { formatJalaliDate } from "@/lib/date";
import { toPersianDigits } from "@/lib/persian-numbers";

const labels: Record<string, string> = {
  short_term: "کوتاه‌مدت",
  medium_term: "میان‌مدت",
  long_term: "بلندمدت",

  planning: "در حال طراحی",
  active: "فعال",
  paused: "مکث",
  completed: "تکمیل‌شده",
  cancelled: "لغو شده",
  archived: "بایگانی",
};

export default async function GoalsPage() {
  const user = await requireUser();

  const goals = await getUserGoals(user.userId);

  const activeGoals = goals.filter((goal) => goal.status === "active").length;

  const completedGoals = goals.filter(
    (goal) => goal.status === "completed",
  ).length;

  const averageProgress = goals.length
    ? Math.round(
        goals.reduce((sum, goal) => sum + goal.calculatedProgress, 0) /
          goals.length,
      )
    : 0;

  return (
    <AppShell>
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 left-0 size-72 rounded-full bg-primary-soft/25 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-32 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <GoalsHero
            totalGoals={goals.length}
            activeGoals={activeGoals}
            completedGoals={completedGoals}
            averageProgress={averageProgress}
          />

          {goals.length === 0 ? (
            <EmptyGoals />
          ) : (
            <>
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <GoalStatCard
                  icon={<Target className="size-5" />}
                  value={goals.length}
                  label="همه هدف‌ها"
                />

                <GoalStatCard
                  icon={<Flag className="size-5" />}
                  value={activeGoals}
                  label="در حال پیشرفت"
                />

                <GoalStatCard
                  icon={<CheckCircle2 className="size-5" />}
                  value={completedGoals}
                  label="تکمیل‌شده"
                />

                <GoalStatCard
                  icon={<TrendingUp className="size-5" />}
                  value={`${toPersianDigits(averageProgress)}٪`}
                  label="میانگین پیشرفت"
                />
              </section>

              <section>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-muted">مسیرهای تو</p>

                    <h2 className="mt-1 text-lg font-black text-foreground">
                      هدف‌ها
                    </h2>
                  </div>

                  <Link
                    href="/goals/new"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/65 px-3 py-1.5 text-xs font-black text-primary transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
                  >
                    هدف تازه
                    <PlusCircle className="size-3.5" />
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

function GoalsHero({
  totalGoals,
  activeGoals,
  averageProgress,
}: {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  averageProgress: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.09)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/25" />

      <div className="pointer-events-none absolute -left-16 -top-16 size-60 rounded-full bg-gold/15 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-tl-[7rem] bg-primary/10" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-8">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              نیت تا عمل
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              مسیرهایی که
              <span className="mx-2 text-primary-dark">واقعاً برات مهمن</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              چیزهایی که می‌خوای بهشون برسی رو به قدم‌های کوچک، روشن و
              قابل‌انجام وصل کن.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/goals/new"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-primary-dark via-primary to-primary px-5 py-3 text-sm font-black text-white shadow-[0_18px_44px_rgba(138,90,68,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(138,90,68,0.34)]"
            >
              <PlusCircle className="size-5" />
              هدف تازه
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/80 p-5 shadow-[0_18px_60px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">خلاصه مسیر</p>

                <p className="mt-1 text-lg font-black text-foreground">
                  هدف‌های تو
                </p>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <Target className="size-5" />
              </div>
            </div>

            <div className="space-y-3">
              <HeroLine
                icon={<Target className="size-4" />}
                label="همه هدف‌ها"
                value={`${toPersianDigits(totalGoals)} هدف`}
              />

              <HeroLine
                icon={<Flag className="size-4" />}
                label="فعال"
                value={`${toPersianDigits(activeGoals)} هدف`}
              />

              <HeroLine
                icon={<TrendingUp className="size-4" />}
                label="میانگین پیشرفت"
                value={`${toPersianDigits(averageProgress)}٪`}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Quote className="mb-2 size-4 text-gold" />

              <p className="text-sm leading-7 text-muted">
                هدف خوب فقط مقصد نیست؛ باید بتونی قدم بعدیش رو هم ببینی.
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

        <p className="mt-0.5 text-sm font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  STAT CARD                                 */
/* -------------------------------------------------------------------------- */

function GoalStatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.65rem] border border-border bg-card p-4 shadow-[0_16px_50px_rgba(94,58,47,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_24px_70px_rgba(94,58,47,0.1)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary-soft" />

      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
          {icon}
        </span>

        <strong className="text-left text-3xl font-black text-foreground">
          {typeof value === "number" ? toPersianDigits(value) : value}
        </strong>
      </div>

      <p className="mt-4 text-sm font-black text-foreground">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  GOAL CARD                                 */
/* -------------------------------------------------------------------------- */

function GoalCard({
  goal,
}: {
  goal: Awaited<ReturnType<typeof getUserGoals>>[number];
}) {
  const progress = Math.max(
    0,
    Math.min(100, Math.round(goal.calculatedProgress)),
  );

  return (
    <Link
      href={`/goals/${goal.id}`}
      className="group relative flex min-h-61.25 flex-col overflow-hidden rounded-[1.85rem] border border-border bg-card p-5 shadow-[0_16px_55px_rgba(94,58,47,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_24px_70px_rgba(94,58,47,0.1)]"
    >
      <div className="pointer-events-none absolute -left-12 -top-12 size-36 rounded-full bg-primary-soft/15 blur-3xl" />

      <div className="relative flex h-full flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-soft/45 px-2.5 py-1 text-[11px] font-black text-primary-dark">
              {labels[goal.type]}
            </span>

            <span className="rounded-full border border-border bg-background/65 px-2.5 py-1 text-[11px] font-bold text-muted">
              {labels[goal.status]}
            </span>
          </div>

          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted transition-all duration-300 group-hover:bg-primary-soft/45 group-hover:text-primary-dark">
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </span>
        </div>

        <h2 className="mt-5 text-lg font-black leading-7 text-foreground transition-colors group-hover:text-primary-dark">
          {goal.title}
        </h2>

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-foreground">
                {toPersianDigits(progress)}٪
              </p>

              <p className="mt-1 text-[11px] font-bold text-muted">
                {goal.health.label}
              </p>
            </div>

            {goal.targetDate && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/65 px-2.5 py-1.5 text-[11px] font-bold text-muted">
                <CalendarDays className="size-3.5 text-primary" />
                {formatJalaliDate(goal.targetDate)}
              </span>
            )}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-card-soft">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
            <p className="text-xs font-bold text-muted">
              {toPersianDigits(goal.completedMilestones)} از{" "}
              {toPersianDigits(goal.milestones)} مرحله
            </p>

            <span className="text-[11px] font-black text-primary">
              مشاهده مسیر
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                EMPTY STATE                                 */
/* -------------------------------------------------------------------------- */

function EmptyGoals() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-dashed border-border bg-card/72 p-8 text-center shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-12">
      <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-primary-soft/25 blur-3xl" />

      <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-primary-soft/55 text-primary-dark">
        <Target className="size-7" />
      </div>

      <h2 className="relative text-lg font-black text-foreground">
        اولین مسیرت رو بساز
      </h2>

      <p className="relative mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
        لازم نیست از اول همه‌چیز مشخص باشه؛ یک عنوان و یک جهت برای شروع کافیه.
      </p>

      <Link
        href="/goals/new"
        className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-primary-dark via-primary to-primary px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(138,90,68,0.24)] transition-all duration-200 hover:-translate-y-0.5"
      >
        <PlusCircle className="size-4" />
        هدف اول رو بساز
      </Link>
    </section>
  );
}
