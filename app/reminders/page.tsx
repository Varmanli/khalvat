import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CalendarClock,
  Clock,
  Feather,
  Plus,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { TypeBadge } from "@/components/type-badge";
import { requireUser } from "@/lib/auth";
import { getUserEntries } from "@/lib/entries";
import { formatPersianNumber } from "@/lib/persian-numbers";
import {
  REMINDER_GROUP_LABELS,
  REMINDER_GROUP_ORDER,
  formatPersianDate,
  formatReminderLabel,
  groupReminders,
  type ReminderGroup,
} from "@/lib/utils";

export const metadata = {
  title: "یادآورها — خلوت",
};

export default async function RemindersPage() {
  const session = await requireUser();

  const allEntries = await getUserEntries(session.userId);
  const withReminder = allEntries.filter((entry) => entry.reminderAt !== null);
  const groups = groupReminders(withReminder);

  const hasAny = withReminder.length > 0;
  const todayCount = groups.today?.length ?? 0;
  const upcomingCount =
    (groups.tomorrow?.length ?? 0) +
    (groups.this_week?.length ?? 0) +
    (groups.later?.length ?? 0);
  const pastCount = groups.past?.length ?? 0;

  return (
    <AppShell>
      <div className="relative">
        <div className="pointer-events-none absolute -top-16 right-0 size-80 rounded-full bg-warning/10 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-36 size-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative space-y-6 lg:space-y-8">
          <RemindersHero
            totalCount={withReminder.length}
            todayCount={todayCount}
            upcomingCount={upcomingCount}
            pastCount={pastCount}
          />

          {!hasAny ? (
            <EmptyRemindersState />
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <main className="min-w-0 space-y-5 xl:order-2">
                {REMINDER_GROUP_ORDER.map((group) => {
                  const items = groups[group];

                  if (!items.length) return null;

                  return (
                    <ReminderGroupSection
                      key={group}
                      group={group}
                      entries={items as Array<(typeof items)[0]>}
                    />
                  );
                })}
              </main>

              <aside className="xl:order-1 xl:sticky xl:top-28 xl:self-start">
                <ReminderSideCard
                  totalCount={withReminder.length}
                  todayCount={todayCount}
                  upcomingCount={upcomingCount}
                  pastCount={pastCount}
                />
              </aside>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function RemindersHero({
  totalCount,
  todayCount,
  upcomingCount,
  pastCount,
}: {
  totalCount: number;
  todayCount: number;
  upcomingCount: number;
  pastCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card shadow-[0_26px_100px_rgba(94,58,47,0.09)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-warning/10" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-56 rounded-tl-[7rem] bg-primary/7" />

      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
        <div>
          <Link
            href="/dashboard"
            className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted shadow-sm transition-colors hover:border-primary-soft hover:text-primary"
          >
            <ArrowLeft className="size-3.5 rotate-180" />
            داشبورد
          </Link>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/75 px-3 py-1.5 text-xs font-black text-muted shadow-sm">
            <Bell className="size-3.5 text-warning" />
            چیزهایی که نباید گم شوند
          </div>

          <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
            یادآورها
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-8 text-muted sm:text-base">
            نوشته‌هایی که برایشان زمان برگشتن گذاشتی؛ اینجا آرام و مرتب منتظر تو
            می‌مانند.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <HeroStat
            icon={<Bell className="size-4" />}
            label="همه یادآورها"
            value={totalCount}
          />
          <HeroStat
            icon={<Clock className="size-4" />}
            label="امروز"
            value={todayCount}
          />
          <HeroStat
            icon={<CalendarClock className="size-4" />}
            label="پیش رو"
            value={upcomingCount}
          />
          <HeroStat
            icon={<BellOff className="size-4" />}
            label="گذشته"
            value={pastCount}
          />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border bg-background/70 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-warning/10 text-warning">
          {icon}
        </span>

        <span className="text-xl font-black text-primary-dark">
          {formatPersianNumber(value)}
        </span>
      </div>

      <p className="mt-3 text-xs font-black text-muted">{label}</p>
    </div>
  );
}

function ReminderGroupSection({
  group,
  entries,
}: {
  group: ReminderGroup;
  entries: Array<{
    id: string;
    title: string;
    type: string;
    reminderAt: Date | null;
    createdAt: Date;
  }>;
}) {
  const isPastGroup = group === "past";
  const isTodayGroup = group === "today";

  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-4 shadow-[0_18px_70px_rgba(94,58,47,0.06)] sm:p-5">
      <div className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-primary-soft/10 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                isTodayGroup
                  ? "bg-warning text-white"
                  : isPastGroup
                    ? "bg-card-soft text-muted"
                    : "bg-primary-soft/45 text-primary-dark"
              }`}
            >
              {isTodayGroup ? (
                <Bell className="size-5" />
              ) : isPastGroup ? (
                <BellOff className="size-5" />
              ) : (
                <CalendarClock className="size-5" />
              )}
            </span>

            <div>
              <h2 className="text-base font-black text-foreground">
                {REMINDER_GROUP_LABELS[group]}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                {getGroupDescription(group)}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted">
            <Sparkles className="size-3.5 text-gold" />
            {formatPersianNumber(entries.length)} یادآور
          </span>
        </div>

        <div className="space-y-2.5">
          {entries.map((entry) => (
            <ReminderRow key={entry.id} entry={entry} isPast={isPastGroup} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReminderRow({
  entry,
  isPast,
}: {
  entry: {
    id: string;
    title: string;
    type: string;
    reminderAt: Date | null;
    createdAt: Date;
  };
  isPast: boolean;
}) {
  return (
    <Link href={`/entries/${entry.id}`} className="group block">
      <article
        className={`relative overflow-hidden rounded-[1.35rem] border bg-background/72 p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_42px_rgba(94,58,47,0.08)] ${
          isPast
            ? "border-border opacity-65"
            : "border-border group-hover:border-primary-soft"
        }`}
      >
        <div className="pointer-events-none absolute -left-10 -top-10 size-28 rounded-full bg-warning/7 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative flex items-center gap-3">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
              isPast ? "bg-card-soft text-muted" : "bg-warning/10 text-warning"
            }`}
          >
            <Bell className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`line-clamp-1 text-sm font-black transition-colors group-hover:text-primary ${
                isPast ? "text-muted line-through" : "text-foreground"
              }`}
            >
              {entry.title || "نوشته بدون عنوان"}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {entry.reminderAt
                  ? isPast
                    ? formatPersianDate(entry.reminderAt)
                    : formatReminderLabel(entry.reminderAt)
                  : "بدون زمان"}
              </span>
            </div>
          </div>

          <div className="hidden shrink-0 sm:block">
            <TypeBadge
              type={entry.type as Parameters<typeof TypeBadge>[0]["type"]}
            />
          </div>

          <ArrowLeft className="hidden size-4 shrink-0 text-muted transition-transform group-hover:-translate-x-1 group-hover:text-primary sm:block" />
        </div>

        <div className="mt-3 block sm:hidden">
          <TypeBadge
            type={entry.type as Parameters<typeof TypeBadge>[0]["type"]}
          />
        </div>
      </article>
    </Link>
  );
}

function EmptyRemindersState() {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-border bg-card p-8 text-center shadow-[0_24px_90px_rgba(94,58,47,0.08)] sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-warning/10" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/12 blur-3xl" />

      <div className="relative mx-auto max-w-lg">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-[1.75rem] bg-card-soft text-muted shadow-sm">
          <BellOff className="size-7" />
        </div>

        <h2 className="text-xl font-black text-foreground">
          هنوز هیچ یادآوری نداری
        </h2>

        <p className="mt-3 text-sm leading-8 text-muted">
          وقتی برای نوشته‌ای زمان یادآوری بگذاری، اینجا ظاهر می‌شود تا چیزی که
          مهم بوده، بین شلوغی روز گم نشود.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/entries/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <Plus className="size-4" />
            نوشتن با یادآور
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-5 py-3 text-sm font-black text-foreground transition-colors hover:border-primary-soft hover:bg-primary-soft/20"
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReminderSideCard({
  totalCount,
  todayCount,
  upcomingCount,
  pastCount,
}: {
  totalCount: number;
  todayCount: number;
  upcomingCount: number;
  pastCount: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_70px_rgba(94,58,47,0.06)]">
      <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <Feather className="size-5" />
          </span>

          <div>
            <p className="text-sm font-black text-foreground">دفتر یادآورها</p>
            <p className="mt-1 text-xs leading-6 text-muted">
              چیزهایی که قرار است در زمان درست دوباره به آن‌ها برگردی.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <SideStat label="همه" value={totalCount} />
          <SideStat label="امروز" value={todayCount} />
          <SideStat label="پیش رو" value={upcomingCount} />
          <SideStat label="گذشته" value={pastCount} />
        </div>

        <div className="mt-5 rounded-3xl border border-border bg-background/65 p-4">
          <p className="text-xs font-black text-foreground">یک یادآوری آرام</p>
          <p className="mt-2 text-xs leading-6 text-muted">
            یادآورها برای فشار آوردن نیستند؛ فقط کمک می‌کنند چیزهای مهم، بی‌صدا
            فراموش نشوند.
          </p>
        </div>
      </div>
    </div>
  );
}

function SideStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-background/65 px-3 py-2.5">
      <span className="text-xs font-bold text-muted">{label}</span>
      <span className="text-sm font-black text-foreground">
        {formatPersianNumber(value)}
      </span>
    </div>
  );
}

function getGroupDescription(group: ReminderGroup) {
  switch (group) {
    case "past":
      return "زمانشان گذشته؛ شاید بخواهی دوباره به آن‌ها سر بزنی.";
    case "today":
      return "چیزهایی که امروز باید جلوی چشم باشند.";
    case "tomorrow":
      return "برای فردا، وقتی روز تازه شروع می‌شود.";
    case "this_week":
      return "یادآورهایی که همین هفته به سراغت می‌آیند.";
    case "later":
      return "برای بعدتر؛ آرام و مرتب نگه‌داشته شده‌اند.";
    default:
      return "یادآورهای ثبت‌شده.";
  }
}
