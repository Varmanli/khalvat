import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit2,
  Flame,
  Leaf,
  NotebookPen,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { eq } from "drizzle-orm";

import { AppShell } from "@/components/app-shell";
import { ArchiveHabitButton } from "@/components/habits/archive-habit-button";
import { HabitCalendar } from "@/components/habits/habit-calendar";
import { getHabitIcon } from "@/components/habits/habit-icons";
import { HabitStats } from "@/components/habits/habit-stats";
import { HabitTodayCard } from "@/components/habits/habit-today-card";
import { DailyVerseCard } from "@/components/sidebar/daily-verse-card";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getJalaliParts } from "@/lib/date";
import {
  getHabitLogsForJalaliMonth,
  getHabitStats,
  getTodayHabits,
  getUserHabitById,
} from "@/lib/habits";
import { formatPersianNumber } from "@/lib/persian-numbers";

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;

  const now = new Date();
  const { jy: year, jm: month } = getJalaliParts(now);

  const [userRows, habit, stats, monthLogs, todayHabits] = await Promise.all([
    db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),
    getUserHabitById(session.userId, id),
    getHabitStats(session.userId, id),
    getHabitLogsForJalaliMonth(session.userId, id, year, month),
    getTodayHabits(session.userId),
  ]);

  if (!habit) notFound();

  const userName = userRows[0]?.name ?? "";
  const todayHabit = todayHabits.find((item) => item.id === id) ?? null;
  const isArchived = Boolean(habit.archivedAt);

  const recentLogs = [...monthLogs]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  return (
    <AppShell userName={userName}>
      <div className="relative">
        <div className="pointer-events-none absolute -top-12 right-0 size-72 rounded-full bg-primary-soft/22 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 size-80 rounded-full bg-gold/12 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <HabitDetailHero habit={habit} iconType={habit.icon} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <main className="min-w-0 space-y-6">
              <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.09)]">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/16" />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-2"
                  style={{ backgroundColor: habit.color }}
                />
                <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-gold/12 blur-3xl" />

                <div className="relative p-5 pr-7 sm:p-7 sm:pr-9">
                  <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span
                        className="flex size-14 shrink-0 items-center justify-center rounded-3xl text-white shadow-[0_16px_42px_rgba(94,58,47,0.2)]"
                        style={{ backgroundColor: habit.color }}
                      >
                        <HabitIcon iconType={habit.icon} className="size-6" />
                      </span>

                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 text-[11px] font-black text-muted">
                            <Sparkles className="size-3.5 text-gold" />
                            صفحه‌ی یک عادت
                          </span>

                          {isArchived && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-card-soft px-3 py-1.5 text-[11px] font-black text-muted">
                              <Archive className="size-3.5" />
                              آرشیو شده
                            </span>
                          )}
                        </div>

                        <h1 className="text-2xl font-black leading-tight text-foreground sm:text-3xl">
                          {habit.title}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
                          {habit.shortDescription ||
                            "یک عادت کوچک برای ادامه دادن آرام و بی‌فشار."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/habits/${id}/edit`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
                      >
                        <Edit2 className="size-4" />
                        ویرایش
                      </Link>

                      {!habit.archivedAt && <ArchiveHabitButton habitId={id} />}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <InfoPill
                      icon={<Target className="size-4" />}
                      label="هدف روزانه"
                      value={
                        habit.dailyGoal
                          ? `${formatPersianNumber(habit.dailyGoal)} ${
                              habit.unit || "مقدار"
                            }`
                          : "تیکی ساده"
                      }
                    />
                    <InfoPill
                      icon={<CalendarDays className="size-4" />}
                      label="تکرار"
                      value={
                        habit.repeatType === "daily" ? "هر روز" : "روزهای هفته"
                      }
                    />
                    <InfoPill
                      icon={<Clock3 className="size-4" />}
                      label="یادآور"
                      value={
                        habit.reminderTime
                          ? formatTimeLabel(habit.reminderTime)
                          : "بدون یادآور"
                      }
                    />
                  </div>
                </div>
              </section>

              {todayHabit ? (
                <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_22px_80px_rgba(94,58,47,0.07)] sm:p-6">
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-gold/10" />
                  <div className="pointer-events-none absolute -left-14 -top-14 size-48 rounded-full bg-primary-soft/14 blur-3xl" />

                  <div className="relative">
                    <SectionHeader
                      icon={<CheckCircle2 className="size-5" />}
                      eyebrow="ثبت امروز"
                      title="امروز این عادت روی میزته"
                      subtitle="همین‌جا مقدار امروز را ثبت کن؛ حتی اگر کامل نبود، ثبتش ارزش دارد."
                    />

                    <div className="mt-5">
                      <HabitTodayCard habit={todayHabit} />
                    </div>
                  </div>
                </section>
              ) : (
                <section className="relative overflow-hidden rounded-[2.25rem] border border-dashed border-border bg-card/70 p-6 shadow-[0_18px_70px_rgba(94,58,47,0.05)]">
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
                      <Leaf className="size-5" />
                    </span>

                    <div>
                      <h2 className="text-sm font-black text-foreground">
                        امروز برای این عادت برنامه‌ای نیست
                      </h2>
                      <p className="mt-1 text-sm leading-7 text-muted">
                        این یعنی چیزی عقب نیفتاده؛ فقط امروز در ریتم این عادت
                        نیست.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {stats && (
                <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_22px_80px_rgba(94,58,47,0.07)] sm:p-6">
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/14" />

                  <div className="relative">
                    <SectionHeader
                      icon={<TrendingUp className="size-5" />}
                      eyebrow="رد پیشرفت"
                      title="آمار این عادت"
                      subtitle="نه برای قضاوت؛ فقط برای دیدن مسیر کوچکی که داری ادامه می‌دهی."
                    />

                    <div className="mt-5">
                      <HabitStats stats={stats} />
                    </div>
                  </div>
                </section>
              )}

              <RecentLogsSection logs={recentLogs} unit={habit.unit} />
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_24px_90px_rgba(94,58,47,0.08)]">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-gold/10" />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_12px_32px_rgba(94,58,47,0.16)]"
                      style={{ backgroundColor: habit.color }}
                    >
                      <CalendarDays className="size-5" />
                    </span>

                    <div>
                      <h2 className="text-sm font-black text-foreground">
                        تقویم این عادت
                      </h2>
                      <p className="mt-1 text-xs text-muted">
                        رد روزهایی که ثبت شده‌اند.
                      </p>
                    </div>
                  </div>

                  <HabitCalendar
                    habit={habit}
                    initialLogs={monthLogs}
                    year={year}
                    month={month}
                  />
                </div>
              </section>

              <HabitNoteCard
                archived={isArchived}
                color={habit.color}
                goal={
                  habit.dailyGoal
                    ? `${formatPersianNumber(habit.dailyGoal)} ${
                        habit.unit || "مقدار"
                      }`
                    : "یک انجام ساده"
                }
              />

              <DailyVerseCard />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function HabitDetailHero({
  habit,
  iconType,
}: {
  habit: NonNullable<Awaited<ReturnType<typeof getUserHabitById>>>;
  iconType: string;
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
              href="/habits"
              className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
            >
              <ArrowLeft className="size-3.5 rotate-180" />
              بازگشت به عادت‌ها
            </Link>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold text-muted shadow-sm">
              <Sparkles className="size-3.5 text-gold" />
              یک عادت در مسیر ساختن
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {habit.title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              اینجا رد روزهای این عادت را می‌بینی؛ آرام، واقعی و بدون فشار.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniHeroStat
              icon={<Target className="size-4" />}
              label="هدف"
              text={
                habit.dailyGoal
                  ? `${formatPersianNumber(habit.dailyGoal)} ${
                      habit.unit || "مقدار"
                    }`
                  : "تیکی ساده"
              }
            />
            <MiniHeroStat
              icon={<Flame className="size-4" />}
              label="ریتم"
              text={habit.repeatType === "daily" ? "هر روز" : "هفتگی"}
            />
            <MiniHeroStat
              icon={<Clock3 className="size-4" />}
              label="یادآور"
              text={
                habit.reminderTime
                  ? formatTimeLabel(habit.reminderTime)
                  : "ندارد"
              }
            />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div
            className="absolute -inset-4 rounded-4xl blur-2xl opacity-20"
            style={{ backgroundColor: habit.color }}
          />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/82 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">پرونده عادت</p>
                <p className="mt-1 text-lg font-black text-foreground">
                  قدم‌های کوچک
                </p>
              </div>

              <span
                className="flex size-12 items-center justify-center rounded-2xl text-white shadow-[0_12px_30px_rgba(94,58,47,0.18)]"
                style={{ backgroundColor: habit.color }}
              >
                <HabitIcon iconType={iconType} className="size-7" />
              </span>
            </div>

            <div className="space-y-3">
              <HeroPrompt text="امروز اگر برنامه دارد، ثبتش کن" />
              <HeroPrompt text="تقویم را برای دیدن مسیر نگاه کن" />
              <HeroPrompt text="اگر یک روز نشد، دوباره برگرد" />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <NotebookPen className="mb-2 size-4 text-gold" />
              <p className="text-sm leading-7 text-muted">
                عادت‌ها با کامل بودن ساخته نمی‌شوند؛ با برگشتن‌های کوچک ساخته
                می‌شوند.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentLogsSection({
  logs,
  unit,
}: {
  logs: Array<{
    id: string;
    date: string;
    status: string;
    value: number | null;
    note: string | null;
  }>;
  unit?: string | null;
}) {
  if (logs.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-[2.25rem] border border-dashed border-border bg-card/70 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
            <NotebookPen className="size-5" />
          </span>

          <div>
            <h2 className="text-sm font-black text-foreground">
              هنوز ثبت تازه‌ای نداری
            </h2>
            <p className="mt-1 text-sm leading-7 text-muted">
              وقتی این عادت را انجام بدهی، ردش اینجا نمایش داده می‌شود.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_22px_80px_rgba(94,58,47,0.07)] sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-gold/10" />

      <div className="relative">
        <SectionHeader
          icon={<NotebookPen className="size-5" />}
          eyebrow="ردهای تازه"
          title="ثبت‌های اخیر"
          subtitle="چند روز آخری که برای این عادت چیزی ثبت شده."
        />

        <div className="mt-5 space-y-2.5">
          {logs.map((log) => {
            const isDone = log.status === "done";

            return (
              <div
                key={log.id}
                className="group flex items-center justify-between gap-4 rounded-[1.45rem] border border-border bg-background/65 p-3 transition-colors hover:border-primary-soft hover:bg-card"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={
                      isDone
                        ? "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-success/14 text-success"
                        : "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-muted"
                    }
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Archive className="size-5" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground">
                      {formatHabitLogDate(log.date)}
                    </p>
                    {log.note ? (
                      <p className="mt-1 line-clamp-1 text-xs text-muted">
                        {log.note}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted">
                        {isDone ? "انجام شده" : "رد شده"}
                      </p>
                    )}
                  </div>
                </div>

                {log.value != null && (
                  <span className="shrink-0 rounded-full bg-card-soft px-3 py-1.5 text-xs font-black text-foreground">
                    {formatPersianNumber(log.value)} {unit || ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HabitNoteCard({
  archived,
  goal,
}: {
  archived: boolean;
  color: string;
  goal: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-primary-soft/18 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
            <Leaf className="size-5" />
          </span>

          <div>
            <h3 className="text-sm font-black text-foreground">
              {archived ? "این عادت آرشیو شده" : "آرام ادامه بده"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {archived ? "فعلاً از برنامه روزانه کنار گذاشته شده" : goal}
            </p>
          </div>
        </div>

        <p className="rounded-2xl bg-background/65 p-4 text-sm leading-7 text-muted">
          {archived
            ? "این عادت هنوز در دفترت مانده، اما فعلاً در برنامه روزانه نمایش داده نمی‌شود."
            : "لازم نیست هر روز کامل باشد؛ همین که به مسیر برگردی، یعنی عادت هنوز زنده است."}
        </p>
      </div>
    </section>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-background/65 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
          {icon}
        </span>

        <div>
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="mt-1 text-sm font-black text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border pb-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-soft via-card-soft to-gold/15 text-primary-dark shadow-[0_12px_32px_rgba(94,58,47,0.1)]">
        {icon}
      </span>

      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
          <Sparkles className="size-3.5 text-gold" />
          {eyebrow}
        </div>

        <h2 className="text-lg font-black text-foreground">{title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">{subtitle}</p>
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

function formatTimeLabel(value?: string | null) {
  if (!value) return "ندارد";

  const [hour = "", minute = ""] = value.split(":");

  if (!hour || !minute) return "ندارد";

  return `${formatPersianNumber(hour.padStart(2, "0"))}:${formatPersianNumber(
    minute.padStart(2, "0"),
  )}`;
}

function formatHabitLogDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function HabitIcon({
  iconType,
  className,
}: {
  iconType: string;
  className: string;
}) {
  const Icon = getHabitIcon(iconType);
  return <Icon className={className} />;
}
