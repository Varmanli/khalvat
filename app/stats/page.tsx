import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Heart,
  Leaf,
  ListTodo,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ActivityChart, EmptyChart } from "@/components/stats/activity-chart";
import { StatsRangeSelector } from "@/components/stats/range-selector";

import { requireUser } from "@/lib/auth";
import { formatJalaliDay } from "@/lib/date";
import { formatPersianNumber } from "@/lib/persian-numbers";
import { getStatistics, resolveStatsRange } from "@/lib/statistics";
import type { StatsRangeValue } from "@/lib/statistics";

const weekdayNames = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

const moodLabels: Record<string, string> = {
  great: "عالی",
  good: "خوب",
  normal: "معمولی",
  hard: "سخت",
  bad: "بد",
  tired: "خسته",
};

type Props = {
  searchParams: Promise<{
    range?: string | string[];
  }>;
};

export default async function StatsPage({ searchParams }: Props) {
  const session = await requireUser();
  const params = await searchParams;

  const range = resolveStatsRange(
    typeof params.range === "string" ? params.range : undefined,
  );

  const data = await getStatistics(session.userId, range);

  const rangeTitle =
    range.key === "week"
      ? "این هفته"
      : range.key === "month"
        ? "این ماه"
        : range.key === "3m"
          ? "سه ماه اخیر"
          : range.key === "6m"
            ? "شش ماه اخیر"
            : range.key === "year"
              ? "امسال"
              : "همه مسیر";

  return (
    <AppShell>
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 left-0 size-72 rounded-full bg-primary-soft/25 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 size-80 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <StatsHero
            rangeTitle={rangeTitle}
            rangeKey={range.key}
            completedTasks={data.overview.completedTasks}
            completionRate={data.overview.completionRate}
            activeDays={data.overview.activeDays}
          />

          <section
            aria-label="خلاصه بازه"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          >
            <StatCard
              icon={<CheckCircle2 className="size-5" />}
              value={data.overview.completedTasks}
              label="وظیفه انجام‌شده"
            />

            <StatCard
              icon={<TrendingUp className="size-5" />}
              value={`${data.overview.completionRate}٪`}
              label="نرخ انجام برنامه‌ها"
            />

            <StatCard
              icon={<Activity className="size-5" />}
              value={data.overview.activeDays}
              label="روز فعال"
            />

            <StatCard
              icon={<Leaf className="size-5" />}
              value={`${data.overview.habitRate}٪`}
              label="پایبندی به عادت‌ها"
            />

            <StatCard
              icon={<Target className="size-5" />}
              value={data.overview.goalsProgressed}
              label="هدف در حال حرکت"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <main className="min-w-0 space-y-7">
              <JournalSection
                icon={<Activity className="size-4" />}
                title="رد فعالیت"
                subtitle={`تصویری از کارها و عادت‌هایی که در ${rangeTitle} انجام داده‌ای.`}
              >
                <ActivityChart
                  data={data.activitySeries}
                  title="کارهای انجام‌شده"
                  description="هر نقطه مجموع وظیفه‌ها و عادت‌های انجام‌شده در همان بازه است."
                />
              </JournalSection>

              <JournalSection
                icon={<ListTodo className="size-4" />}
                title="وظیفه‌ها"
                subtitle="آنچه ساخته‌ای، برنامه‌ریزی کرده‌ای و واقعاً به پایان رسانده‌ای."
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MiniStat value={data.task.created} label="ساخته‌شده" />

                  <MiniStat value={data.task.completed} label="انجام‌شده" />

                  <MiniStat value={data.task.planned} label="برنامه‌ریزی‌شده" />

                  <MiniStat
                    value={data.task.averagePerActiveDay}
                    label="میانگین روز فعال"
                  />
                </div>

                <div className="mt-5">
                  <ActivityChart
                    data={data.task.series}
                    title="روند انجام وظیفه"
                    description="فقط زمانی که یک وظیفه واقعاً تکمیل شده، در این نمودار حساب می‌شود."
                  />
                </div>
              </JournalSection>

              <JournalSection
                icon={<Leaf className="size-4" />}
                title="عادت‌ها"
                subtitle="پایبندی به عادت‌ها بر اساس برنامه واقعی هر عادت محاسبه شده."
              >
                {data.habits.rows.length ? (
                  <div className="grid gap-3">
                    {data.habits.rows.slice(0, 6).map((habit) => (
                      <div
                        key={habit.id}
                        className="rounded-3xl border border-border bg-background/55 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black text-foreground">
                              {habit.title}
                            </h3>

                            <p className="mt-1 text-xs text-muted">
                              {formatPersianNumber(habit.completed)} از{" "}
                              {formatPersianNumber(habit.planned)} نوبت انجام
                              شده
                            </p>
                          </div>

                          <span className="rounded-full bg-primary-soft/45 px-3 py-1.5 text-xs font-black text-primary-dark">
                            {formatPersianNumber(habit.adherence)}٪
                          </span>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-card-soft">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(habit.adherence, 100)}%`,
                              backgroundColor: habit.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyChart text="در این بازه عادتی برای پیگیری ثبت نشده است." />
                )}
              </JournalSection>

              <JournalSection
                icon={<Target className="size-4" />}
                title="هدف‌ها"
                subtitle="حرکت هدف‌ها از کارهای تکمیل‌شده، عادت‌ها و نقطه‌عطف‌ها ساخته می‌شود."
              >
                {data.goals.rows.length ? (
                  <div className="grid gap-3">
                    {data.goals.rows.map((goal) => (
                      <Link
                        href={`/goals/${goal.id}`}
                        key={goal.id}
                        className="group block rounded-3xl border border-border bg-background/55 p-4 transition-all duration-200 hover:border-primary-soft hover:bg-background/80"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-black text-foreground transition-colors group-hover:text-primary-dark">
                              {goal.title}
                            </h3>

                            <p className="mt-2 text-xs leading-6 text-muted">
                              {[
                                goal.completedTasks &&
                                  `${formatPersianNumber(
                                    goal.completedTasks,
                                  )} وظیفه`,
                                goal.habitSessions &&
                                  `${formatPersianNumber(
                                    goal.habitSessions,
                                  )} جلسه عادت`,
                                goal.milestones &&
                                  `${formatPersianNumber(
                                    goal.milestones,
                                  )} نقطه‌عطف`,
                              ]
                                .filter(Boolean)
                                .join(" · ") ||
                                "هنوز اجرای قابل‌اتکایی در این بازه ثبت نشده است."}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-primary-soft/45 px-3 py-1.5 text-xs font-black text-primary-dark">
                            {formatPersianNumber(Math.round(goal.progress))}٪
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyChart text="هنوز داده کافی برای نشان‌دادن حرکت هدف‌ها در این بازه نیست." />
                )}
              </JournalSection>
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <JournalSection
                icon={<TrendingUp className="size-4" />}
                title="ریتم تو"
                subtitle="رد ساده‌ای از زمان‌هایی که در خلوت فعال بوده‌ای."
              >
                <div className="space-y-1">
                  <Rhythm
                    label="فعال‌ترین روز هفته"
                    value={
                      data.rhythm.mostActiveWeekday === null
                        ? "—"
                        : weekdayNames[data.rhythm.mostActiveWeekday]
                    }
                  />

                  <Rhythm
                    label="روزهای فعال"
                    value={`${formatPersianNumber(data.rhythm.activeDays)} روز`}
                  />

                  <Rhythm
                    label="میانگین وظیفه در روز فعال"
                    value={formatPersianNumber(data.rhythm.averageTasks)}
                  />

                  {data.rhythm.bestWeek?.value ? (
                    <Rhythm
                      label="بهترین هفته"
                      value={formatJalaliDay(data.rhythm.bestWeek.date)}
                      detail={`${formatPersianNumber(
                        data.rhythm.bestWeek.value,
                      )} عمل تکمیل‌شده`}
                    />
                  ) : null}
                </div>
              </JournalSection>

              <JournalSection
                icon={<Heart className="size-4" />}
                title="حال و قدردانی"
                subtitle="فقط چیزهایی که خودت در خلوت ثبت کرده‌ای."
              >
                <div className="space-y-1">
                  <Rhythm
                    label="ثبت‌های حال"
                    value={`${formatPersianNumber(data.mood.entries)} بار`}
                  />

                  {data.mood.mostFrequent && (
                    <Rhythm
                      label="حال پرتکرار"
                      value={
                        moodLabels[data.mood.mostFrequent] ??
                        data.mood.mostFrequent
                      }
                    />
                  )}

                  <Rhythm
                    label="روزهای شکرگزاری"
                    value={`${formatPersianNumber(data.gratitude.days)} روز`}
                  />

                  <Rhythm
                    label="صفحه‌های نوشته‌شده"
                    value={`${formatPersianNumber(data.writing.entries)} صفحه`}
                  />
                </div>
              </JournalSection>

              <section className="relative overflow-hidden rounded-4xl border border-border bg-card/72 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
                <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-primary-soft/20 blur-3xl" />

                <div className="relative">
                  <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-primary-soft/55 text-primary-dark">
                    <BookOpen className="size-4" />
                  </span>

                  <h3 className="text-sm font-black text-foreground">
                    روز فعال یعنی چی؟
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted">
                    روزی که حداقل یک وظیفه یا عادت تکمیل شده، نوشته‌ای ثبت
                    کرده‌ای یا برای حال و شکرگزاری وقت گذاشته‌ای.
                  </p>
                </div>
              </section>
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

function StatsHero({
  rangeTitle,
  rangeKey,
  completedTasks,
  completionRate,
  activeDays,
}: {
  rangeTitle: string;
  rangeKey: StatsRangeValue;
  completedTasks: number;
  completionRate: number;
  activeDays: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.09)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/25" />

      <div className="pointer-events-none absolute -left-16 -top-16 size-60 rounded-full bg-gold/15 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-tl-[7rem] bg-primary/10" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:p-8">
        <div className="flex flex-col justify-between gap-6">
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
              {rangeTitle}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              رد قدم‌هات رو
              <span className="mx-2 text-primary-dark">آروم ببین</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              این‌جا فقط چیزهایی رو می‌بینی که واقعاً ثبت کردی؛ بدون مقایسه و
              بدون قضاوت، فقط برای اینکه مسیرت روشن‌تر باشه.
            </p>

            <div className="mt-6 max-w-sm">
              <StatsRangeSelector value={rangeKey} />
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/80 p-5 shadow-[0_18px_60px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">خلاصه مسیر</p>

                <p className="mt-1 text-lg font-black text-foreground">
                  {rangeTitle}
                </p>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <Activity className="size-5" />
              </div>
            </div>

            <div className="space-y-3">
              <HeroLine
                icon={<CheckCircle2 className="size-4" />}
                label="وظیفه انجام‌شده"
                value={formatPersianNumber(completedTasks)}
              />

              <HeroLine
                icon={<TrendingUp className="size-4" />}
                label="نرخ انجام"
                value={`${formatPersianNumber(completionRate)}٪`}
              />

              <HeroLine
                icon={<Activity className="size-4" />}
                label="روز فعال"
                value={`${formatPersianNumber(activeDays)} روز`}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Quote className="mb-2 size-4 text-gold" />

              <p className="text-sm leading-7 text-muted">
                قرار نیست عددها قضاوتت کنن؛ فقط کمک می‌کنن ببینی چه مسیری رو طی
                کردی.
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

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
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
          {formatPersianNumber(value)}
        </strong>
      </div>

      <p className="mt-4 text-sm font-black text-foreground">{label}</p>
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

        <div className="min-w-0">
          <h2 className="text-base font-black text-foreground">{title}</h2>

          <p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  MINI STAT                                 */
/* -------------------------------------------------------------------------- */

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-background/55 p-3.5">
      <strong className="text-lg font-black text-foreground">
        {formatPersianNumber(value)}
      </strong>

      <p className="mt-1 text-[11px] font-bold leading-5 text-muted">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   RHYTHM                                   */
/* -------------------------------------------------------------------------- */

function Rhythm({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-transparent px-3 py-3 transition-colors hover:border-border hover:bg-background/55">
      <p className="text-[11px] font-bold text-muted">{label}</p>

      <p className="mt-1 text-sm font-black text-foreground">{value}</p>

      {detail && (
        <p className="mt-1 text-[11px] leading-5 text-muted">{detail}</p>
      )}
    </div>
  );
}
