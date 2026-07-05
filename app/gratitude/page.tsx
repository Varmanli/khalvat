import { AppShell } from "@/components/app-shell";
import { GratitudeCalendar } from "@/components/gratitude/gratitude-calendar";
import { GratitudeForm } from "@/components/gratitude/gratitude-form";
import { GratitudeStatsCard } from "@/components/gratitude/gratitude-stats";
import { RandomVerseCard } from "@/components/poems/random-verse-card";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatJalaliDay, getJalaliParts } from "@/lib/date";
import { formatPersianNumber } from "@/lib/persian-numbers";
import {
  getGratitudeStats,
  getRecentGratitudeEntries,
  getTodayKey,
  getUserGratitudeByDate,
  getUserGratitudeForJalaliMonth,
} from "@/lib/gratitude";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Heart,
  Leaf,
  PenLine,
  Quote,
  Sparkles,
  Sun,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function GratitudePage({ searchParams }: PageProps) {
  const session = await requireUser();
  const params = await searchParams;

  const today = getTodayKey();
  const requestedDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : today;
  // Silently clamp future dates to today
  const selectedDate = requestedDate > today ? today : requestedDate;

  const { jy: selectedJalaliYear, jm: selectedJalaliMonth } =
    getJalaliParts(selectedDate);

  const [userRows, entry, monthEntries, recent, stats] =
    await Promise.all([
      db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1),
      getUserGratitudeByDate(session.userId, selectedDate),
      getUserGratitudeForJalaliMonth(
        session.userId,
        selectedJalaliYear,
        selectedJalaliMonth,
      ),
      getRecentGratitudeEntries(session.userId, 6),
      getGratitudeStats(session.userId),
    ]);

  const userName = userRows[0]?.name ?? "";
  const filledDates = monthEntries.map((item) => item.date);
  const isSelectedToday = selectedDate === today;

  const dateLabel = isSelectedToday
    ? `امروز — ${formatJalaliDay(selectedDate)}`
    : formatJalaliDay(selectedDate);

  return (
    <AppShell userName={userName}>
      <div className="relative">
        <div className="pointer-events-none absolute -top-10 right-0 size-72 rounded-full bg-gold/12 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 size-80 rounded-full bg-primary-soft/20 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <GratitudeHero userName={userName} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            {/* Main column */}
            <main className="min-w-0 space-y-6">
              <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.08)]">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-gold/10" />
                <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold/12 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 size-48 rounded-tr-[6rem] bg-primary-soft/18" />

                <div className="relative p-5 sm:p-7">
                  <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-gold/25 via-primary-soft/45 to-card-soft text-primary-dark shadow-[0_12px_32px_rgba(196,154,90,0.16)]">
                        <PenLine className="size-5" />
                      </span>

                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          {isSelectedToday
                            ? "شکرگزاری امروز"
                            : "شکرگزاری این روز"}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {dateLabel}
                        </p>
                      </div>
                    </div>

                    {!isSelectedToday && (
                      <Link
                        href="/gratitude"
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2.5 text-xs font-black text-primary transition-colors hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
                      >
                        بازگشت به امروز
                        <ArrowLeft className="size-3.5" />
                      </Link>
                    )}
                  </div>

                  {!entry && !isSelectedToday && (
                    <div className="mb-5 rounded-3xl border border-dashed border-border bg-background/65 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card-soft text-primary">
                          <CalendarDays className="size-4" />
                        </span>

                        <div>
                          <p className="text-sm font-black text-foreground">
                            برای این روز هنوز چیزی ثبت نشده.
                          </p>
                          <p className="mt-1 text-xs leading-6 text-muted">
                            می‌توانی حتی برای روزهای گذشته هم چند چیز کوچک برای
                            قدردانی ثبت کنی.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <GratitudeForm
                    key={selectedDate}
                    initialEntry={entry}
                    date={selectedDate}
                    dateLabel={dateLabel}
                  />
                </div>
              </section>

              {recent.length > 0 && (
                <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-card shadow-[0_24px_90px_rgba(94,58,47,0.08)]">
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-gold/10" />
                  <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-gold/12 blur-3xl" />
                  <div className="pointer-events-none absolute bottom-0 right-0 size-44 rounded-tl-[6rem] bg-primary-soft/18" />

                  <div className="relative p-5 sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-gold/20 via-primary-soft/45 to-card-soft text-primary-dark shadow-[0_12px_32px_rgba(196,154,90,0.16)]">
                          <Leaf className="size-5" />
                        </span>

                        <div>
                          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-black text-muted">
                            <Sparkles className="size-3.5 text-gold" />
                            چیزهایی که خوب ماندند
                          </div>

                          <h2 className="text-lg font-black text-foreground">
                            صفحه‌های قدردانی
                          </h2>

                          <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
                            چند لحظه کوچک از روزهای اخیر؛ همان چیزهایی که شاید
                            ساده بودند، اما دل را گرم کردند.
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/gratitude"
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2.5 text-xs font-black text-primary shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-primary-soft/35 hover:text-primary-dark"
                      >
                        امروز را بنویس
                        <ArrowLeft className="size-3.5" />
                      </Link>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {recent.map((item, index) => (
                        <RecentGratitudeCard key={item.id} entry={item} index={index} />
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </main>

            {/* Sidebar */}
            <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <GratitudeCalendar
                filledDates={filledDates}
                selectedDate={selectedDate}
              />

              <GratitudeStatsCard stats={stats} />

              <RitualCard />

              <GuideCard />
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function GratitudeHero({ userName }: { userName: string }) {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.1)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-gold/12" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/15 blur-3xl" />
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
              {userName ? `سلام ${userName}` : "یک لحظه برای قدردانی"}
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              دفتر شکرگزاری
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              چند چیز کوچک را که امروز برایشان قدردانی، آرام نگه دار.
            </p>

            <RandomVerseCard
              variant="inline"
              title="بیتی برای قدردانی"
              className="mt-6 max-w-md"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniHeroStat
              icon={<Heart className="size-4" />}
              label="امروز"
              text="یک دلیل کوچیک برای لبخند"
            />
            <MiniHeroStat
              icon={<Leaf className="size-4" />}
              label="روزها"
              text="رد چیزهای خوبی که موندن"
            />
            <MiniHeroStat
              icon={<Sun className="size-4" />}
              label="حال دلت"
              text="آروم‌تر، حتی کمی"
            />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-gold/10 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/82 p-5 shadow-[0_18px_70px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">آیین امروز</p>
                <p className="mt-1 text-lg font-black text-foreground">
                  سه چیز کوچک
                </p>
              </div>

              <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <Heart className="size-5" />
              </span>
            </div>

            <div className="space-y-3">
              <HeroPrompt text="امروز چی باعث شد لبخند بزنی؟" />
              <HeroPrompt text="چی امروز یکم آرومت کرد؟" />
              <HeroPrompt text="بودنِ چی دلت رو گرم کرد؟" />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Quote className="mb-2 size-4 text-gold" />
              <p className="text-sm leading-7 text-muted">
                حتی توی روزهای معمولی هم یه چیز کوچیک پیدا می‌شه که بشه بابتش
                لبخند زد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
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
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gold/12 text-gold">
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

function RitualCard() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-gold/12 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-gold/20 to-primary-soft/45 text-primary-dark">
            <BookOpen className="size-5" />
          </span>

          <div>
            <h3 className="text-sm font-black text-foreground">
              یه مکث کوچیک برای دل
            </h3>
            <p className="mt-1 text-xs text-muted">
              چند خط برای چیزهایی که قشنگ بودن
            </p>
          </div>
        </div>

        <p className="rounded-2xl bg-background/65 p-4 text-sm leading-7 text-muted">
          لازم نیست اتفاق خاصی افتاده باشه؛ گاهی همین که چیزی آرومت کرده، ارزش
          نوشتن داره.
        </p>
      </div>
    </section>
  );
}

function GuideCard() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-background/70 p-5 shadow-[0_14px_50px_rgba(94,58,47,0.05)]">
      <Heart className="mb-3 size-5 text-gold" />

      <p className="text-sm leading-7 text-muted">
        لازم نیست چیز بزرگی باشد؛ یک لبخند، یک چای گرم، یا یک قدم کوچک هم
        کافی‌ست.
      </p>
    </section>
  );
}

type RecentEntry = Awaited<ReturnType<typeof getRecentGratitudeEntries>>[number];

function getEntryItems(entry: RecentEntry): string[] {
  const raw = entry.items;
  if (!Array.isArray(raw)) return [];
  return (raw as string[]).filter((s) => typeof s === "string" && s.trim().length > 0);
}

function RecentGratitudeCard({ entry, index }: { entry: RecentEntry; index: number }) {
  const items = getEntryItems(entry);
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;

  return (
    <Link
      href={`/gratitude?date=${entry.date}`}
      className="group relative block overflow-hidden rounded-[1.75rem] border border-border bg-background/60 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-soft hover:bg-card hover:shadow-[0_18px_55px_rgba(94,58,47,0.08)]"
    >
      <div className="pointer-events-none absolute -left-8 -top-8 size-24 rounded-full bg-gold/10 blur-2xl" />

      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-foreground">
              {formatJalaliDay(entry.date)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">صفحه‌ای از دفتر شکرگزاری</p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card-soft text-[11px] font-black text-muted">
            {formatPersianNumber(index + 1)}
          </span>
        </div>

        <div className="space-y-1.5">
          {shown.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Heart className="mt-0.5 size-3 shrink-0 text-gold/60" />
              <p className="line-clamp-1 text-sm text-foreground">{item}</p>
            </div>
          ))}
          {extra > 0 && (
            <p className="text-[11px] text-muted">
              + {formatPersianNumber(extra)} مورد دیگر
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-[11px] font-bold text-muted">برای دیدن کامل کلیک کن</span>
          <span className="text-xs font-black text-primary transition-colors group-hover:text-primary-dark">
            دیدن این روز
          </span>
        </div>
      </div>
    </Link>
  );
}
