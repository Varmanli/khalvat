import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Flame,
  HeartHandshake,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { TodayCheckInCard } from "@/components/check-ins/today-check-in-card";
import { DeleteCheckInButton } from "@/components/check-ins/delete-check-in-button";
import { DailyVerseCard } from "@/components/sidebar/daily-verse-card";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  getDailyCheckInStats,
  getRecentCheckIns,
  getTodayCheckInDateKey,
} from "@/lib/check-ins";
import { getMoodMeta } from "@/lib/check-in-options";
import { formatPersianNumber, toPersianDigits } from "@/lib/date";

export default async function CheckInsPage() {
  const session = await requireUser();
  const todayKey = getTodayCheckInDateKey();

  const [userRows, history, stats] = await Promise.all([
    db
      .select({
        name: users.name,
        avatarIcon: users.avatarIcon,
        avatarColor: users.avatarColor,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1),
    getRecentCheckIns(session.userId, 120),
    getDailyCheckInStats(session.userId),
  ]);

  const user = userRows[0];
  const todayEntry = history.find((entry) => entry.dateKey === todayKey) ?? null;
  const historyWithoutToday = history.filter((entry) => entry.dateKey !== todayKey);

  return (
    <AppShell
      userName={user?.name ?? ""}
      userAvatarIcon={user?.avatarIcon}
      userAvatarColor={user?.avatarColor}
    >
      <div className="relative">
        <div className="pointer-events-none absolute -top-12 right-0 size-72 rounded-full bg-primary-soft/18 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-44 size-80 rounded-full bg-gold/12 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <CheckInHero userName={user?.name ?? ""} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <main className="space-y-6">
              <section className="rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-6">
                <SectionHeader
                  icon={<HeartHandshake className="size-5" />}
                  eyebrow="ثبت امروز"
                  title="حال امروزت"
                  subtitle="امروز چه‌طور گذشت؟ اگر خواستی حال و چند خط یادداشتت را اینجا نگه دار."
                />

                <div className="mt-5">
                  <TodayCheckInCard
                    key={`${todayKey}-${todayEntry?.updatedAt ?? "new"}`}
                    dateKey={todayKey}
                    initialEntry={todayEntry}
                  />
                </div>
              </section>

              <section className="rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-6">
                <SectionHeader
                  icon={<NotebookPen className="size-5" />}
                  eyebrow="مرور روزها"
                  title="تاریخچه حال‌نگار"
                  subtitle="رد روزهایی که حالشان را ثبت کرده‌ای؛ برای نگاه کردن، نه قضاوت."
                />

                {historyWithoutToday.length === 0 ? (
                  <div className="mt-5 rounded-[1.75rem] border border-dashed border-border bg-background/70 p-6 text-sm leading-7 text-muted">
                    هنوز سابقه‌ای در حال‌نگار نداری. اولین ثبتت را از کارت امروز شروع کن.
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {historyWithoutToday.map((entry) => {
                      const meta = getMoodMeta(entry.mood);
                      return (
                        <div
                          key={entry.id}
                          className="rounded-[1.6rem] border border-border bg-background/70 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className="text-3xl leading-none">{entry.emoji}</span>
                              <div>
                                <p className="text-sm font-black text-foreground">
                                  {meta.label}
                                </p>
                                <p className="mt-1 text-xs text-muted">
                                  {toPersianDigits(entry.dateKey)}
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-black text-muted">
                              حال روز
                            </span>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-muted">
                            {entry.note?.trim()
                              ? entry.note
                              : "برای این روز یادداشتی ثبت نشده است."}
                          </p>

                          <div className="mt-4 flex justify-end">
                            <DeleteCheckInButton
                              checkInId={entry.id}
                              className="inline-flex items-center gap-2 rounded-2xl border border-danger/30 bg-danger/8 px-3 py-2 text-xs font-black text-danger transition-colors hover:bg-danger/14"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </main>

            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <section className="rounded-[2.25rem] border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft/45 text-primary-dark">
                    <CalendarDays className="size-5" />
                  </span>

                  <div>
                    <h2 className="text-sm font-black text-foreground">آمار حال‌نگار</h2>
                    <p className="mt-1 text-xs text-muted">یک نگاه کوتاه به ریتم روزها</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <StatPill
                    icon={<NotebookPen className="size-4" />}
                    label="کل ثبت‌ها"
                    value={formatPersianNumber(stats.totalCheckIns)}
                  />
                  <StatPill
                    icon={<Flame className="size-4" />}
                    label="رشته فعلی"
                    value={`${formatPersianNumber(stats.currentStreak)} روز`}
                  />
                  <StatPill
                    icon={<Sparkles className="size-4" />}
                    label="حال پرتکرار"
                    value={stats.mostRepeatedMood ? getMoodMeta(stats.mostRepeatedMood).label : "هنوز مشخص نیست"}
                  />
                </div>
              </section>

              <section className="rounded-[2.25rem] border border-border bg-background/70 p-5 shadow-[0_14px_50px_rgba(94,58,47,0.05)]">
                <p className="text-sm font-black text-foreground">چرا حال‌نگار؟</p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  برای اینکه بعضی روزها فقط لازم است دیده شوند. نه حل شوند، نه توضیح داده شوند.
                </p>
              </section>

              <DailyVerseCard />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function CheckInHero({ userName }: { userName: string }) {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.1)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/18" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/14 blur-3xl" />

      <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-8">
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
            {userName ? `سلام ${userName}` : "یک مکث برای حال امروز"}
          </div>

          <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
            حال‌نگار روزانه
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            اینجا می‌تونی حال هر روزت رو ثبت و مرور کنی.
          </p>
        </div>

        <div className="hidden lg:block">
          <div className="rounded-4xl border border-border bg-card/80 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">آیین امروز</p>
                <p className="mt-1 text-lg font-black text-foreground">حالت را ببین</p>
              </div>
              <span className="text-3xl">🙂</span>
            </div>

            <div className="space-y-3">
              <HeroPrompt text="فقط یک حال را انتخاب کن" />
              <HeroPrompt text="اگر خواستی چند خط بنویس" />
              <HeroPrompt text="بعداً برگرد و روزها را مرور کن" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPrompt({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-3 py-3 text-sm font-bold text-foreground">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        <Sparkles className="size-4" />
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

function StatPill({
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
