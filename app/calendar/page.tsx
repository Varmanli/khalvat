import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  PlusCircle,
  Quote,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { DateToolbar } from "@/components/planner/date-toolbar";
import { CalendarItem } from "@/components/planner/calendar-item";

import { requireUser } from "@/lib/auth";

import {
  calendarRange,
  rangeDays,
  todayKey,
  validDateKey,
} from "@/lib/planner-dates";

import { getPlannerRange } from "@/lib/planner";

import {
  formatJalaliDay,
  formatJalaliMonthTitle,
  getJalaliParts,
  parseGregorianIso,
} from "@/lib/date";

export const metadata = {
  title: "تقویم",
};

const WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
] as const;

type PlannerItems = Awaited<ReturnType<typeof getPlannerRange>>["items"];

type CalendarView = "month" | "week" | "day";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    view?: string;
  }>;
}) {
  const user = await requireUser();

  const query = await searchParams;

  const date = query.date && validDateKey(query.date) ? query.date : todayKey();

  const view: CalendarView =
    query.view === "week" || query.view === "day" ? query.view : "month";

  const { start, end } = calendarRange(date, view);

  const { items } = await getPlannerRange(user.userId, start, end);

  const days = rangeDays(start, end);

  const { jy, jm } = getJalaliParts(date);

  const pageTitle =
    view === "month" ? formatJalaliMonthTitle(jy, jm) : formatJalaliDay(date);

  const today = todayKey();

  const eventCount = items.filter((item) => item.kind === "event").length;

  const reminderCount = items.filter((item) => item.kind === "reminder").length;

  return (
      <div className="relative">
        <div className="pointer-events-none absolute -top-16 left-0 size-72 rounded-full bg-primary-soft/20 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-40 size-80 rounded-full bg-gold/10 blur-3xl" />

        <main className="relative space-y-6 lg:space-y-8">
          <CalendarHero
            date={date}
            pageTitle={pageTitle}
            itemCount={items.length}
            eventCount={eventCount}
            reminderCount={reminderCount}
          />

          <CalendarToolbar date={date} view={view} />

          <CalendarBody
            view={view}
            days={days}
            items={items}
            today={today}
            date={date}
            currentMonth={jm}
          />
        </main>
      </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

function CalendarHero({
  date,
  pageTitle,
  itemCount,
  eventCount,
  reminderCount,
}: {
  date: string;
  pageTitle: string;
  itemCount: number;
  eventCount: number;
  reminderCount: number;
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
              نمای زمانی خلوت
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              تقویمت رو
              <span className="mx-2 text-primary-dark">مرتب ببین</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              اول یک نمای ساده از ماه ببین؛ بعد هر روز رو که خواستی باز کن و
              جزئیات برنامه‌ات رو ببین.
            </p>

            <div className="mt-5 inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-bold text-muted">
              {pageTitle}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/events/new?date=${date}`}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-primary-dark via-primary to-primary px-5 py-3 text-sm font-black text-white shadow-[0_18px_44px_rgba(138,90,68,0.28)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <PlusCircle className="size-5" />
              رویداد جدید
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </Link>

            <Link
              href={`/calendar?date=${date}&view=day`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/75 px-5 py-3 text-sm font-black text-foreground shadow-sm transition hover:border-primary-soft hover:bg-card hover:text-primary-dark"
            >
              <ListTodo className="size-5 text-olive" />
              برنامه امروز
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-4 rounded-4xl bg-primary-soft/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card/80 p-5 shadow-[0_18px_60px_rgba(94,58,47,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted">خلاصه تقویم</p>

                <p className="mt-1 text-lg font-black text-foreground">
                  این بازه
                </p>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <CalendarDays className="size-5" />
              </div>
            </div>

            <div className="space-y-3">
              <HeroLine
                icon={<CalendarDays className="size-4" />}
                label="همه موارد"
                value={`${itemCount.toLocaleString("fa-IR")} مورد`}
              />

              <HeroLine
                icon={<CheckCircle2 className="size-4" />}
                label="رویداد"
                value={`${eventCount.toLocaleString("fa-IR")} مورد`}
              />

              <HeroLine
                icon={<Clock3 className="size-4" />}
                label="یادآور"
                value={`${reminderCount.toLocaleString("fa-IR")} مورد`}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-background/70 p-4">
              <Quote className="mb-2 size-4 text-gold" />

              <p className="text-sm leading-7 text-muted">
                تقویم فقط نمای کلی رو نشون می‌ده؛ جزئیات هر روز داخل خودش قرار
                داره.
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
  icon: ReactNode;
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
/*                                  TOOLBAR                                   */
/* -------------------------------------------------------------------------- */

function CalendarToolbar({ date, view }: { date: string; view: CalendarView }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card/80 shadow-[0_12px_35px_rgba(94,58,47,0.045)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-l from-card via-card to-primary-soft/10" />

      <div className="relative flex min-h-16 items-center px-3 py-2 sm:px-4">
        <DateToolbar date={date} view={view} calendar />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               CALENDAR BODY                                */
/* -------------------------------------------------------------------------- */

function CalendarBody({
  view,
  days,
  items,
  today,
  date,
  currentMonth,
}: {
  view: CalendarView;
  days: string[];
  items: PlannerItems;
  today: string;
  date: string;
  currentMonth: number;
}) {
  if (view === "day") {
    return <DayView date={date} days={days} items={items} today={today} />;
  }

  if (view === "week") {
    return <WeekView days={days} items={items} today={today} />;
  }

  return (
    <MonthView
      days={days}
      items={items}
      today={today}
      currentMonth={currentMonth}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                 MONTH VIEW                                 */
/* -------------------------------------------------------------------------- */

function MonthView({
  days,
  items,
  today,
  currentMonth,
}: {
  days: string[];
  items: PlannerItems;
  today: string;
  currentMonth: number;
}) {
  return (
    <section className="overflow-hidden rounded-4xl border border-border bg-card shadow-[0_18px_60px_rgba(94,58,47,0.05)]">
      <div className="overflow-x-auto">
        <div className="min-w-155">
          <WeekdayHeader />

          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayItems = items.filter((item) => item.date === day);

              return (
                <CompactMonthDay
                  key={day}
                  day={day}
                  items={dayItems}
                  isToday={day === today}
                  outsideMonth={getJalaliParts(day).jm !== currentMonth}
                  columnIndex={index % 7}
                />
              );
            })}
          </div>
        </div>
      </div>

      <CalendarLegend />
    </section>
  );
}

function WeekdayHeader() {
  return (
    <div className="grid grid-cols-7 border-b border-border/70 bg-card-soft/30">
      {WEEKDAYS.map((weekday, index) => (
        <div
          key={weekday}
          className={[
            "flex h-11 items-center justify-center border-l border-border/60",
            index === 6 ? "border-l-0" : "",
          ].join(" ")}
        >
          <span
            className={[
              "text-[11px] font-black",
              weekday === "جمعه" ? "text-primary" : "text-muted",
            ].join(" ")}
          >
            {weekday}
          </span>
        </div>
      ))}
    </div>
  );
}

function CompactMonthDay({
  day,
  items,
  isToday,
  outsideMonth,
  columnIndex,
}: {
  day: string;
  items: PlannerItems;
  isToday: boolean;
  outsideMonth: boolean;
  columnIndex: number;
}) {
  const { jd } = getJalaliParts(day);

  const eventCount = items.filter((item) => item.kind === "event").length;

  const reminderCount = items.filter((item) => item.kind === "reminder").length;

  const otherCount = Math.max(items.length - eventCount - reminderCount, 0);

  const hasItems = items.length > 0;

  return (
    <Link
              href={`/planner?date=${day}`}
      aria-label={`باز کردن ${formatJalaliDay(day)}`}
      className={[
        "group relative flex min-h-23 flex-col border-b border-l border-border/60 p-2.5 outline-none transition-all duration-200",
        columnIndex === 6 ? "border-l-0" : "",
        isToday
          ? "bg-primary-soft/20"
          : "bg-card hover:z-10 hover:bg-card-soft/40",
        outsideMonth ? "opacity-35" : "",
        "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35",
      ].join(" ")}
    >
      {isToday && (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
      )}

      <div className="flex items-start justify-between gap-2">
        <span
          className={[
            "flex size-8 items-center justify-center rounded-xl text-xs font-black transition-all duration-200",
            isToday
              ? "bg-primary/80 text-white shadow-[0_5px_14px_rgba(138,90,68,0.16)] ring-2 ring-primary/15"
              : "text-foreground group-hover:bg-background",
          ].join(" ")}
        >
          {jd.toLocaleString("fa-IR")}
        </span>

        {isToday && (
          <span className="pt-1 text-[9px] font-black text-primary">امروز</span>
        )}
      </div>

      <div className="mt-auto flex min-h-5 items-center gap-1.5 pt-3">
        {eventCount > 0 && (
          <CalendarIndicator type="event" count={eventCount} />
        )}

        {reminderCount > 0 && (
          <CalendarIndicator type="reminder" count={reminderCount} />
        )}

        {otherCount > 0 && (
          <CalendarIndicator type="other" count={otherCount} />
        )}

        {!hasItems && (
          <span className="size-1 rounded-full bg-border opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                INDICATORS                                  */
/* -------------------------------------------------------------------------- */

function CalendarIndicator({
  type,
  count,
}: {
  type: "event" | "reminder" | "other";
  count: number;
}) {
  const styles = {
    event: {
      dot: "bg-primary",
      text: "text-primary",
    },

    reminder: {
      dot: "bg-gold",
      text: "text-gold",
    },

    other: {
      dot: "bg-olive",
      text: "text-olive",
    },
  };

  const style = styles[type];

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-background/65 px-1.5 py-1">
      <span className={["size-2.5 rounded-full shadow-sm", style.dot].join(" ")} />

      {count > 1 && (
        <span
          className={["text-[11px] font-black leading-none", style.text].join(
            " ",
          )}
        >
          {count.toLocaleString("fa-IR")}
        </span>
      )}
    </span>
  );
}

function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 bg-card-soft/20 px-4 py-3">
      <LegendItem className="bg-primary" label="رویداد" />

      <LegendItem className="bg-gold" label="یادآور" />

      <LegendItem className="bg-olive" label="برنامه و وظیفه" />

      <p className="mr-auto hidden text-[10px] font-medium text-muted sm:block">
        برای دیدن جزئیات، روی یک روز کلیک کن.
      </p>
    </div>
  );
}

function LegendItem({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${className}`} />

      <span className="text-[10px] font-bold text-muted">{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  WEEK VIEW                                 */
/* -------------------------------------------------------------------------- */

function WeekView({
  days,
  items,
  today,
}: {
  days: string[];
  items: PlannerItems;
  today: string;
}) {
  return (
    <section className="overflow-hidden rounded-4xl border border-border bg-card shadow-[0_18px_60px_rgba(94,58,47,0.05)]">
      <div className="overflow-x-auto">
        <div className="min-w-180">
          <WeekdayHeader />

          <div className="grid grid-cols-7">
            {days.map((day, index) => (
              <CompactWeekDay
                key={day}
                day={day}
                items={items.filter((item) => item.date === day)}
                isToday={day === today}
                columnIndex={index % 7}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompactWeekDay({
  day,
  items,
  isToday,
  columnIndex,
}: {
  day: string;
  items: PlannerItems;
  isToday: boolean;
  columnIndex: number;
}) {
  const { jd } = getJalaliParts(day);

  const eventCount = items.filter((item) => item.kind === "event").length;

  const reminderCount = items.filter((item) => item.kind === "reminder").length;

  const otherCount = Math.max(items.length - eventCount - reminderCount, 0);

  return (
    <Link
      href={`/planner?date=${day}`}
      className={[
        "relative flex min-h-37.5 flex-col border-l border-border/60 p-3 transition",
        columnIndex === 6 ? "border-l-0" : "",
        isToday ? "bg-primary-soft/20" : "hover:bg-card-soft/30",
      ].join(" ")}
    >
      {isToday && <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />}

      <div className="flex items-center justify-between">
        <span
          className={[
            "flex size-9 items-center justify-center rounded-xl text-sm font-black",
            isToday
              ? "bg-primary/80 text-white shadow-sm ring-2 ring-primary/15"
              : "bg-card-soft text-foreground",
          ].join(" ")}
        >
          {jd.toLocaleString("fa-IR")}
        </span>

        {isToday && (
          <span className="text-[9px] font-black text-primary">امروز</span>
        )}
      </div>

      <div className="mt-auto space-y-2 pt-5">
        <WeekCount
          icon={<CalendarDays className="size-3" />}
          count={eventCount}
          label="رویداد"
        />

        <WeekCount
          icon={<Bell className="size-3" />}
          count={reminderCount}
          label="یادآور"
        />

        <WeekCount
          icon={<CheckCircle2 className="size-3" />}
          count={otherCount}
          label="برنامه"
        />
      </div>
    </Link>
  );
}

function WeekCount({
  icon,
  count,
  label,
}: {
  icon: ReactNode;
  count: number;
  label: string;
}) {
  if (!count) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
      {icon}

      <span>
        {count.toLocaleString("fa-IR")} {label}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   DAY VIEW                                 */
/* -------------------------------------------------------------------------- */

function DayView({
  days,
  items,
  today,
  date,
}: {
  days: string[];
  items: PlannerItems;
  today: string;
  date: string;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <main className="min-w-0 space-y-5">
        {days.map((day) => (
          <DetailedDay
            key={day}
            day={day}
            items={items.filter((item) => item.date === day)}
            isToday={day === today}
          />
        ))}
      </main>

      <aside className="min-w-0 xl:sticky xl:top-28 xl:self-start">
        <Link href={`/planner?date=${date}`} className="group block rounded-4xl border border-border bg-card p-6 shadow-[0_18px_60px_rgba(94,58,47,0.06)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-soft/10">
          <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark"><Clock3 className="size-5" /></span><div><h2 className="text-base font-black text-foreground">برنامه‌ریزی روز</h2><p className="mt-1 text-xs leading-6 text-muted">برای تنظیم ساعت‌ها و ساختن برنامه، وارد صفحهٔ زمان‌بندی شوید.</p></div></div>
          <span className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-black text-white transition group-hover:bg-primary-dark">ورود به زمان‌بندی روز <ArrowLeft className="size-4" /></span>
        </Link>
      </aside>
    </div>
  );
}

function DetailedDay({
  day,
  items,
  isToday,
}: {
  day: string;
  items: PlannerItems;
  isToday: boolean;
}) {
  const weekday = new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
  }).format(parseGregorianIso(day));

  const parts = getJalaliParts(day);

  const events = items.filter((item) => item.kind === "event");

  const reminders = items.filter((item) => item.kind === "reminder");

  const others = items.filter(
    (item) => item.kind !== "event" && item.kind !== "reminder",
  );

  return (
    <Card className="relative overflow-hidden rounded-4xl border border-border bg-card p-5 shadow-[0_18px_65px_rgba(94,58,47,0.06)] sm:p-6">
      {isToday && <div className="absolute inset-y-0 right-0 w-1 bg-primary" />}

      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={[
              "flex size-12 items-center justify-center rounded-2xl text-base font-black",
              isToday
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card-soft text-foreground",
            ].join(" ")}
          >
            {parts.jd.toLocaleString("fa-IR")}
          </span>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground">{weekday}</h2>

              {isToday && (
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-black text-primary">
                  امروز
                </span>
              )}
            </div>

            <p className="mt-1 text-xs font-medium text-muted">
              {formatJalaliDay(day)}
            </p>
          </div>
        </div>

        <Link
          href={`/events/new?date=${day}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 text-xs font-black text-primary-dark transition hover:border-primary-soft hover:bg-primary-soft/20"
        >
          <PlusCircle className="size-4" />
          افزودن
        </Link>
      </header>

      {items.length ? (
        <div className="space-y-7">
          {events.length > 0 && (
            <DaySection
              icon={<CalendarDays className="size-4" />}
              title="رویدادها"
              count={events.length}
            >
              {events.map((item) => (
                <CalendarItem key={item.id} item={item} />
              ))}
            </DaySection>
          )}

          {reminders.length > 0 && (
            <DaySection
              icon={<Bell className="size-4" />}
              title="یادآورها"
              count={reminders.length}
            >
              {reminders.map((item) => (
                <CalendarItem key={item.id} item={item} />
              ))}
            </DaySection>
          )}

          {others.length > 0 && (
            <DaySection
              icon={<CheckCircle2 className="size-4" />}
              title="وظایف و برنامه‌ها"
              count={others.length}
            >
              {others.map((item) => (
                <CalendarItem key={item.id} item={item} />
              ))}
            </DaySection>
          )}
        </div>
      ) : (
        <EmptyDay day={day} />
      )}
    </Card>
  );
}

function DaySection({
  icon,
  title,
  count,
  children,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft/55 text-primary-dark">
          {icon}
        </span>

        <h3 className="text-sm font-black text-foreground">{title}</h3>

        <span className="rounded-full bg-card-soft px-2 py-0.5 text-[10px] font-black text-muted">
          {count.toLocaleString("fa-IR")}
        </span>
      </header>

      <div className="space-y-2">{children}</div>
    </section>
  );
}

function EmptyDay({ day }: { day: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card-soft/20 px-5 text-center">
      <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-card-soft text-muted">
        <Circle className="size-4" />
      </span>

      <p className="text-sm font-black text-foreground">این روز فعلاً خلوته</p>

      <p className="mt-1 max-w-xs text-xs leading-6 text-muted">
        رویداد، یادآور یا برنامه‌ای برای این روز ثبت نشده.
      </p>

      <Link
        href={`/events/new?date=${day}`}
        className="mt-4 text-xs font-black text-primary transition hover:text-primary-dark"
      >
        اولین مورد رو اضافه کن
      </Link>
    </div>
  );
}
