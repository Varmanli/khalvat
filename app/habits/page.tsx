import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Leaf,
  PlusCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { eq } from "drizzle-orm";

import { AppShell } from "@/components/app-shell";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitTodayCard } from "@/components/habits/habit-today-card";
import { DailyGuideCard } from "@/components/sidebar/daily-guide-card";
import { DailyVerseCard } from "@/components/sidebar/daily-verse-card";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getTodayHabits, getUserHabits, getUserHabitStats } from "@/lib/habits";
import { formatPersianNumber } from "@/lib/persian-numbers";

export default async function HabitsPage() {
  const session = await requireUser();

  const [userRows, todayHabits, allHabits, stats] = await Promise.all([
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),
    getTodayHabits(session.userId),
    getUserHabits(session.userId),
    getUserHabitStats(session.userId),
  ]);

  const userName = userRows[0]?.name ?? "";

  const todayDoneIds = new Set(
    todayHabits
      .filter((habit) => habit.todayLog?.status === "done")
      .map((habit) => habit.id),
  );

  const scheduledToday = stats.scheduledToday || todayHabits.length;
  const doneToday = stats.doneToday;
  const remainingToday = Math.max(scheduledToday - doneToday, 0);

  return (
    <AppShell userName={userName}>
      <div className="relative">
        <div className="pointer-events-none absolute -top-12 right-0 size-72 rounded-full bg-primary-soft/22 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 size-80 rounded-full bg-gold/12 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <HabitsHero
            userName={userName}
            activeHabits={stats.activeHabits}
            doneToday={doneToday}
            scheduledToday={scheduledToday}
            todayHabitsCount={todayHabits.length}
          />

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Activity className="size-4" />}
              label="عادت‌های فعال"
              value={formatPersianNumber(stats.activeHabits)}
              description="چیزهایی که داری آرام‌آرام می‌سازی"
            />
            <StatCard
              icon={<CheckCircle2 className="size-4" />}
              label="انجام‌شده امروز"
              value={`${formatPersianNumber(doneToday)} از ${formatPersianNumber(scheduledToday)}`}
              description="قدم‌هایی که امروز برداشتی"
            />
            <StatCard
              icon={<Target className="size-4" />}
              label="مانده برای امروز"
              value={formatPersianNumber(remainingToday)}
              description="بدون فشار؛ یکی‌یکی جلو برو"
            />
            <StatCard
              icon={<Flame className="size-4" />}
              label="برنامه امروز"
              value={`${formatPersianNumber(todayHabits.length)} عادت`}
              description="عادت‌هایی که امروز روی میز هستند"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="min-w-0 space-y-6">
              <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.08)]">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/16" />
                <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-gold/10 blur-3xl" />

                <div className="relative p-5 sm:p-6">
                  <SectionHeader
                    icon={<Target className="size-5" />}
                    eyebrow="امروز، همین چند قدم"
                    title="عادت‌های امروز"
                    subtitle="عادت‌هایی که برای امروز برنامه‌ریزی شده‌اند؛ نه برای فشار، برای یادآوری مسیر."
                    action={
                      <span className="rounded-full bg-background/70 px-3 py-1.5 text-xs font-black text-muted">
                        {formatPersianNumber(doneToday)} از{" "}
                        {formatPersianNumber(scheduledToday)} انجام شد
                      </span>
                    }
                  />

                  {todayHabits.length === 0 ? (
                    <EmptyTodayHabits />
                  ) : (
                    <div className="mt-5 space-y-3">
                      {todayHabits.map((habit) => (
                        <HabitTodayCard key={habit.id} habit={habit} />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.07)]">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-gold/10" />
                <div className="pointer-events-none absolute bottom-0 right-0 size-48 rounded-tl-[7rem] bg-primary-soft/16" />

                <div className="relative p-5 sm:p-6">
                  <SectionHeader
                    icon={<Leaf className="size-5" />}
                    eyebrow="رد چیزهایی که می‌سازی"
                    title="همه عادت‌ها"
                    subtitle="همه قدم‌های کوچکی که تصمیم گرفتی آرام‌آرام ادامه‌شان بدهی."
                    action={
                      <Link
                        href="/habits/new"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2.5 text-xs font-black text-primary shadow-sm transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
                      >
                        <PlusCircle className="size-4" />
                        عادت جدید
                      </Link>
                    }
                  />

                  {allHabits.length === 0 ? (
                    <EmptyAllHabits />
                  ) : (
                    <div className="mt-5 space-y-3">
                      {allHabits.map((habit) => (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          doneToday={todayDoneIds.has(habit.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <DailyGuideCard
                title="راهنمای عادت‌سازی"
                subtitle="کوچیک، واقعی، ادامه‌دار"
                tips={[
                  {
                    icon: <PlusCircle className="size-3.5" />,
                    text: "عادت خوب از یه قدم کوچیک شروع می‌شه",
                  },
                  {
                    icon: <CheckCircle2 className="size-3.5" />,
                    text: "اگر امروز کم بود هم، هنوز ارزش ثبت کردن داره",
                  },
                  {
                    icon: <Flame className="size-3.5" />,
                    text: "زنجیره خوبه، اما مهربون موندن مهم‌تره",
                  },
                  {
                    icon: <Activity className="size-3.5" />,
                    text: "پیشرفت رو ببین؛ نه فقط جاهایی که نشد",
                  },
                ]}
              />

              <DailyVerseCard />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function HabitsHero({
  userName,
  activeHabits,
  doneToday,
  scheduledToday,
  todayHabitsCount,
}: {
  userName: string;
  activeHabits: number;
  doneToday: number;
  scheduledToday: number;
  todayHabitsCount: number;
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
              {userName ? `سلام ${userName}` : "قدم‌های کوچک امروز"}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              رد عادت‌های کوچک
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              چیزهایی که آرام‌آرام می‌سازندت، همین‌جا نرم و بی‌فشار دنبال کن.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniHeroStat
              icon={<Activity className="size-4" />}
              label="فعال"
              text={`${formatPersianNumber(activeHabits)} عادت در جریان`}
            />
            <MiniHeroStat
              icon={<CheckCircle2 className="size-4" />}
              label="امروز"
              text={`${formatPersianNumber(doneToday)} از ${formatPersianNumber(scheduledToday)} انجام شد`}
            />
            <MiniHeroStat
              icon={<Flame className="size-4" />}
              label="روی میز"
              text={`${formatPersianNumber(todayHabitsCount)} عادت امروز`}
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
                  سه قدم کافی‌ست
                </p>
              </div>

              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
                <Leaf className="size-5" />
              </span>
            </div>

            <div className="space-y-3">
              <HeroPrompt text="یک عادت کوچیک که امروز انجامش می‌دی" />
              <HeroPrompt text="مقداری که واقعاً از پسش برمیای" />
              <HeroPrompt text="ثبت کردنش، حتی اگر کامل نبود" />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Sparkles className="mb-2 size-4 text-gold" />
              <p className="text-sm leading-7 text-muted">
                عادت‌ها با سخت گرفتن ساخته نمی‌شن؛ با برگشتن‌های کوچیک ساخته
                می‌شن.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-4 shadow-[0_14px_50px_rgba(94,58,47,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_18px_60px_rgba(94,58,47,0.08)]">
      <div className="pointer-events-none absolute -left-10 -top-10 size-28 rounded-full bg-primary-soft/14 blur-2xl" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-card-soft text-primary">
            {icon}
          </span>

          <span className="text-2xl font-black text-foreground">{value}</span>
        </div>

        <p className="text-sm font-black text-foreground">{label}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

function MiniHeroStat({
  icon,
  label,
  text,
}: {
  icon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-card/75 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
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

function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark shadow-[0_12px_32px_rgba(94,58,47,0.1)]">
          {icon}
        </span>

        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
            <Sparkles className="size-3.5 text-gold" />
            {eyebrow}
          </div>

          <h2 className="text-lg font-black text-foreground">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
            {subtitle}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

function EmptyTodayHabits() {
  return (
    <div className="mt-5 rounded-[1.75rem] border border-dashed border-border bg-background/60 p-8 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-card-soft text-primary">
        <Leaf className="size-6" />
      </div>

      <p className="text-sm font-black text-foreground">
        امروز عادتی برنامه‌ریزی نشده
      </p>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-muted">
        اگر چیزی هست که دوست داری آرام‌آرام ادامه‌اش بدهی، یک عادت کوچک بساز.
      </p>

      <Link
        href="/habits/new"
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
      >
        <PlusCircle className="size-4" />
        ساخت عادت
      </Link>
    </div>
  );
}

function EmptyAllHabits() {
  return (
    <div className="mt-5 rounded-[1.75rem] border border-dashed border-border bg-background/60 p-10 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-card-soft text-primary">
        <TrendingUp className="size-6" />
      </div>

      <p className="text-sm font-black text-foreground">هنوز عادتی نساختی</p>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-muted">
        با یک قدم کوچیک شروع کن؛ چیزی که واقعاً بشه ادامه‌اش داد.
      </p>

      <Link
        href="/habits/new"
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
      >
        <PlusCircle className="size-4" />
        اولین عادت
      </Link>
    </div>
  );
}
