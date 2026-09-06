import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  PlusCircle,
  Sparkles,
  Target,
} from "lucide-react";

import { TaskToggleButton } from "@/components/task-toggle-button";

import { DateToolbar } from "./date-toolbar";
import { TimeBlocks } from "./time-blocks";
import { CalendarItem } from "./calendar-item";
import { TaskPlanningActions } from "./task-planning-actions";

import { getDailyPlanner } from "@/lib/planner";
import { getHabitsForDate, type HabitWithLog } from "@/lib/habits";
import { HabitTodayCard } from "@/components/habits/habit-today-card";
import { GoalContextLink } from "@/components/goals/goal-context-link";
import { DailyJournal } from "@/components/planner/daily-journal";
import { getUserCheckInByDateKey } from "@/lib/check-ins";

import {
  formatJalaliDay,
  getJalaliDateKey,
  parseGregorianIso,
  toPersianDigits,
} from "@/lib/date";

import { todayKey } from "@/lib/planner-dates";

type DailyPlannerResult = Awaited<ReturnType<typeof getDailyPlanner>>;
type DailyTasks = DailyPlannerResult["tasks"];
type DailyItems = DailyPlannerResult["items"];

export async function DailyWorkspace({
  userId,
  date,
  showTimeline = true,
  plannerOnly = false,
  basePath = plannerOnly ? "/planner" : "/today",
}: {
  userId: string;
  date: string;
  showTimeline?: boolean;
  plannerOnly?: boolean;
  basePath?: "/planner" | "/today";
}) {
  const isToday = date === todayKey();
  const dateKey = getJalaliDateKey(parseGregorianIso(date));
  const [{ tasks, items, dailyPlan }, habits, checkIn] = await Promise.all([
    getDailyPlanner(userId, date),
    getHabitsForDate(userId, date),
    getUserCheckInByDateKey(userId, dateKey),
  ]);

  const completedCount = tasks.filter((task) => task.status === "done").length;
  const completedHabitCount = habits.filter(
    (habit) => habit.todayLog?.status === "done",
  ).length;
  const totalCount = tasks.length + habits.length;
  const completedTotalCount = completedCount + completedHabitCount;
  const remainingCount = totalCount - completedTotalCount;

  const eventCount = items.filter((item) => item.kind === "event").length;

  const reminderCount = items.filter((item) => item.kind === "reminder").length;

  const scheduledTasks = tasks.filter((task) =>
    Boolean(task.scheduledTime && task.scheduledDate === date),
  );

  const weekday = new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
  }).format(parseGregorianIso(date));

  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tehran",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
  );

  const greeting =
    hour < 12 ? "صبح به‌خیر" : hour < 18 ? "روزت به‌خیر" : "عصرت به‌خیر";

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-12 left-0 size-72 rounded-full bg-primary-soft/20 blur-3xl" />

      <div className="pointer-events-none absolute right-0 top-40 size-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative space-y-5 lg:space-y-6">
        <DayHero
          date={date}
          weekday={weekday}
          isToday={isToday}
          greeting={greeting}
          tasksCount={totalCount}
          remainingCount={remainingCount}
          completedCount={completedTotalCount}
          eventCount={eventCount}
          reminderCount={reminderCount}
          plannerOnly={plannerOnly}
        />

        <DayDateToolbar date={date} basePath={basePath} />

        {plannerOnly ? (
          <main className="min-w-0">
            <DayTimeline
              date={date}
              items={items}
              tasks={scheduledTasks}
              plannerOnly
            />
          </main>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="order-2 min-w-0 space-y-4 xl:order-1 xl:sticky xl:top-28 xl:self-start">
              <DaySummary
                date={date}
                tasksCount={totalCount}
                remainingCount={remainingCount}
                completedCount={completedTotalCount}
                eventCount={eventCount}
                reminderCount={reminderCount}
              />
              <GoalDaySummary tasks={tasks} habits={habits} />
            </aside>

            <main className="order-1 min-w-0 space-y-5 xl:order-2">
              <TodayItems
                date={date}
                tasks={tasks}
                items={items}
                habits={habits}
                showTimeline={showTimeline}
                habitsReadOnly={!isToday}
              />

              <DailyJournal
                date={date}
                dateKey={dateKey}
                initial={{
                  journalContent: dailyPlan?.journalContent ?? "",
                  memorableMoment: dailyPlan?.memorableMoment ?? "",
                  reflectionGood: dailyPlan?.reflectionGood ?? "",
                  reflectionBetter: dailyPlan?.reflectionBetter ?? "",
                  reflectionRemember: dailyPlan?.reflectionRemember ?? "",
                  closedAt: dailyPlan?.closedAt ?? null,
                }}
                initialMood={checkIn?.mood}
                initialMoodNote={checkIn?.note}
                canReflect={date <= todayKey()}
                summary={dailySummary(tasks, habits)}
              />
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

function dailySummary(tasks: DailyTasks, habits: HabitWithLog[]) {
  const completed = tasks.filter((task) => task.status === "done").length;
  const habitsDone = habits.filter(
    (habit) => habit.todayLog?.status === "done",
  ).length;
  const goals = new Set([
    ...tasks
      .filter((task) => task.status === "done" && task.goal)
      .map((task) => task.goal!.id),
    ...habits
      .filter((habit) => habit.todayLog?.status === "done" && habit.goal)
      .map((habit) => habit.goal!.id),
  ]);
  return [
    tasks.length
      ? `${toPersianDigits(completed)} از ${toPersianDigits(tasks.length)} وظیفه انجام شد`
      : "",
    habits.length
      ? `${toPersianDigits(habitsDone)} از ${toPersianDigits(habits.length)} عادت انجام شد`
      : "",
    goals.size ? `${toPersianDigits(goals.size)} هدف جلو رفت` : "",
  ].filter(Boolean);
}

function TodayItems({
  date,
  tasks,
  items,
  habits,
  habitsReadOnly,
}: {
  date: string;
  tasks: DailyTasks;
  items: DailyItems;
  habits: HabitWithLog[];
  showTimeline: boolean;
  habitsReadOnly: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-4xl border border-border bg-card shadow-[0_18px_60px_rgba(94,58,47,0.055)]">
      <header className="border-b border-border px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-primary">تمرکز امروز</p>
            <h2 className="mt-1 text-xl font-black text-foreground">
              وظایف و یادآوری‌ها
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/planner?date=${date}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary/25 bg-primary-soft/25 px-3 text-xs font-black text-primary-dark transition hover:bg-primary-soft/45"
            >
              <Clock3 className="size-4" /> برنامه‌ریزی امروز
            </Link>
            <Link
              href={`/tasks/new?date=${date}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-xs font-black text-white transition hover:bg-primary-dark"
            >
              <PlusCircle className="size-4" /> افزودن وظیفه
            </Link>
          </div>
        </div>
      </header>
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <SectionLabel
            icon={<CheckSquare className="size-4" />}
            title="عادت‌ها"
            count={habits.length}
          />
          <div className="mt-3 space-y-2">
            {habits.length ? (
              habits.map((habit) => (
                <HabitTodayCard
                  key={habit.id}
                  habit={habit}
                  readOnly={habitsReadOnly}
                />
              ))
            ) : (
              <EmptyState
                icon={<CheckCircle2 className="size-4" />}
                title="عادتی برای این روز نیست"
                text="روزت سبک و خلوت است."
              />
            )}
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <SectionLabel
            icon={<CheckSquare className="size-4" />}
            title="وظایف امروز"
            count={tasks.length}
          />
          <div className="mt-3 space-y-2">
            {tasks.length ? (
              tasks.map((task) => (
                <ScheduledTaskRow key={task.id} task={task} />
              ))
            ) : (
              <EmptyState
                icon={<CheckCircle2 className="size-4" />}
                title="وظیفه‌ای برای امروز نیست"
                text="روزت سبک و خلوت است."
              />
            )}
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <SectionLabel
            icon={<Bell className="size-4" />}
            title="یادآوری‌ها و رویدادها"
            count={items.length}
          />
          <div className="mt-3 space-y-2">
            {items.length ? (
              items.map((item) => <CalendarItem key={item.id} item={item} />)
            ) : (
              <EmptyState
                icon={<Bell className="size-4" />}
                title="یادآوری یا رویدادی نیست"
                text="برای این روز چیزی ثبت نشده است."
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionLabel({
  icon,
  title,
  count,
}: {
  icon: ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-black text-foreground">
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft/50 text-primary">
        {icon}
      </span>
      {title}
      <span className="mr-auto rounded-full bg-card-soft px-2 py-1 text-[10px] text-muted">
        {toPersianDigits(count)} مورد
      </span>
    </div>
  );
}

function GoalDaySummary({
  tasks,
  habits,
}: {
  tasks: DailyTasks;
  habits: HabitWithLog[];
}) {
  const counts = new Map<
    string,
    { id: string; title: string; count: number }
  >();
  [...tasks, ...habits].forEach((item) => {
    if (item.goal) {
      const previous = counts.get(item.goal.id);
      counts.set(item.goal.id, {
        ...item.goal,
        count: (previous?.count ?? 0) + 1,
      });
    }
  });
  const values = [...counts.values()];
  if (!values.length) return null;
  return (
    <section className="rounded-[1.75rem] border border-border bg-card/75 p-4 shadow-[0_16px_50px_rgba(94,58,47,0.055)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft/50 text-primary-dark">
          <Target className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-black text-foreground">حرکت امروز</h2>
          <p className="mt-0.5 text-[10px] text-muted">
            امروز برای {toPersianDigits(values.length)} هدف،{" "}
            {toPersianDigits(values.reduce((sum, item) => sum + item.count, 0))}{" "}
            قدم داری.
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {values.map((goal) => (
          <Link
            key={goal.id}
            href={`/goals/${goal.id}`}
            className="flex items-center justify-between rounded-xl bg-background/55 px-3 py-2 text-xs font-bold text-foreground hover:bg-primary-soft/25"
          >
            <span className="truncate">{goal.title}</span>
            <span className="text-muted">
              {toPersianDigits(goal.count)} قدم
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    HERO                                    */
/* -------------------------------------------------------------------------- */

function DayHero({
  date,
  weekday,
  isToday,
  greeting,
  tasksCount,
  remainingCount,
  completedCount,
  eventCount,
  reminderCount,
  plannerOnly = false,
}: {
  date: string;
  weekday: string;
  isToday: boolean;
  greeting: string;
  tasksCount: number;
  remainingCount: number;
  completedCount: number;
  eventCount: number;
  reminderCount: number;
  plannerOnly?: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-border bg-card shadow-[0_20px_70px_rgba(94,58,47,0.07)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/18" />

      <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-gold/12 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-tl-[6rem] bg-primary/8" />

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/65 px-3 py-1.5 text-xs font-bold text-muted">
                <CalendarDays className="size-3.5 text-primary" />
                {weekday}، {formatJalaliDay(date)}
              </div>

              {isToday && (
                <span className="rounded-full bg-primary-soft/55 px-3 py-1.5 text-[11px] font-black text-primary-dark">
                  امروز
                </span>
              )}
            </div>

            <p className="mb-1 text-xs font-black text-primary">
              {plannerOnly ? "مرکز برنامه‌ریزی" : "برنامه روز"}
            </p>

            <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
              {plannerOnly
                ? "برنامه‌ریزی روزانه"
                : isToday
                  ? `${greeting}، امروزت رو آروم بچین`
                  : "برنامه این روز"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted sm:text-sm">
            <DayMeta value={remainingCount} label="باقی‌مانده" />

              <DayMeta value={eventCount} label="رویداد" />

              <DayMeta value={reminderCount} label="یادآور" />

              {completedCount > 0 && (
                <DayMeta value={completedCount} label="انجام‌شده" />
              )}
            </div>

            {tasksCount === 0 && eventCount === 0 && reminderCount === 0 && (
              <p className="mt-4 text-sm leading-7 text-muted">
                این روز هنوز خلوته؛ اگر چیزی برای انجام داری، همین‌جا اضافه‌اش
                کن.
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link
              href={`/tasks/new?date=${date}`}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-white shadow-[0_12px_30px_rgba(138,90,68,0.22)] transition hover:bg-primary-dark"
            >
              <PlusCircle className="size-4" />
              افزودن وظیفه
            </Link>

            <Link
              href={`/events/new?date=${date}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-4 text-sm font-black text-foreground transition hover:border-primary-soft hover:bg-primary-soft/20 hover:text-primary-dark"
            >
              <CalendarDays className="size-4" />
              افزودن رویداد
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function DayMeta({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <strong className="font-black text-foreground">
        {toPersianDigits(value)}
      </strong>

      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TOOLBAR                                   */
/* -------------------------------------------------------------------------- */

function DayDateToolbar({
  date,
  basePath,
}: {
  date: string;
  basePath: "/planner" | "/today";
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card/75 shadow-[0_10px_35px_rgba(94,58,47,0.04)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-l from-card via-card to-primary-soft/10" />

      <div className="relative flex min-h-16 items-center px-3 py-2 sm:px-4">
        <DateToolbar date={date} basePath={basePath} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TIMELINE                                  */
/* -------------------------------------------------------------------------- */

function DayTimeline({
  date,
  items,
  tasks,
  plannerOnly = false,
}: {
  date: string;
  items: DailyItems;
  tasks: DailyTasks;
  plannerOnly?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-4xl border border-border bg-card shadow-[0_18px_60px_rgba(94,58,47,0.055)]">
      <header className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/50 text-primary-dark">
            <Clock3 className="size-4" />
          </span>

          <div>
            <h2 className="text-base font-black text-foreground">
              {plannerOnly ? "برنامه‌ریزی و زمان‌بندی روز" : "برنامه زمانی روز"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted">
              هر چیزی که ساعت مشخص داره، اینجا کنار هم دیده می‌شه.
            </p>
          </div>
        </div>

        <Link
          href={`/calendar?date=${date}&view=day`}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-black text-primary transition hover:text-primary-dark"
        >
          تقویم
          <ArrowLeft className="size-3.5" />
        </Link>
      </header>

      <div className="p-4 sm:p-5">
        <div className="mb-5">
          <TimeBlocks date={date} items={items} />
        </div>

        {!tasks.length && !items.length && (
          <EmptyState
            icon={<Clock3 className="size-4" />}
            title="هنوز چیزی زمان‌بندی نشده"
            text="اگر کاری ساعت مشخصی داره، زمانش رو تعیین کن تا اینجا دیده بشه."
          />
        )}
      </div>
    </section>
  );
}

function ScheduledTaskRow({ task }: { task: DailyTasks[number] }) {
  return (
    <article className="group rounded-2xl border border-border bg-background/55 p-3 transition hover:bg-background/85">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <TaskToggleButton taskId={task.id} isDone={task.status === "done"} />

          <div className="min-w-0 flex-1 self-center">
            <Link
              href={`/tasks/${task.id}/edit`}
              className={[
                "block wrap-break-word text-sm font-bold leading-6 transition hover:text-primary",
                task.status === "done"
                  ? "text-muted line-through"
                  : "text-foreground",
              ].join(" ")}
            >
              {task.title}
            </Link>

            {task.scheduledTime && (
              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-muted">
                <Clock3 className="size-3" />
                {toPersianDigits(task.scheduledTime)}
              </div>
            )}
            {task.goal && (
              <div className="mt-1">
                <GoalContextLink goal={task.goal} />
              </div>
            )}
          </div>
        </div>

        <TaskPlanningActions
          id={task.id}
          priority={task.priority}
          done={task.status === "done"}
          className="w-full justify-end sm:w-auto"
        />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                DAY SUMMARY                                 */
/* -------------------------------------------------------------------------- */

function DaySummary({
  date,
  tasksCount,
  remainingCount,
  completedCount,
  eventCount,
  reminderCount,
}: {
  date: string;
  tasksCount: number;
  remainingCount: number;
  completedCount: number;
  eventCount: number;
  reminderCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card/75 p-4 shadow-[0_16px_50px_rgba(94,58,47,0.055)]">
      <div className="pointer-events-none absolute -left-10 -top-10 size-36 rounded-full bg-primary-soft/20 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft/50 text-primary-dark">
            <Sparkles className="size-4" />
          </span>

          <div>
            <h2 className="text-sm font-black text-foreground">
              امروز در یک نگاه
            </h2>

            <p className="mt-0.5 text-[10px] font-medium text-muted">
              خلاصه همین روز
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <SummaryRow
            icon={<CheckSquare className="size-3.5" />}
            label="کارها و عادت‌های باقی‌مانده"
            value={remainingCount}
          />

          <SummaryRow
            icon={<CheckCircle2 className="size-3.5" />}
            label="انجام‌شده"
            value={completedCount}
          />

          <SummaryRow
            icon={<CalendarDays className="size-3.5" />}
            label="رویداد"
            value={eventCount}
          />

          <SummaryRow
            icon={<Bell className="size-3.5" />}
            label="یادآور"
            value={reminderCount}
          />
        </div>

        {tasksCount > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-muted">
              <span>پیشرفت کارها و عادت‌ها</span>

              <span>
                {toPersianDigits(completedCount)} از{" "}
                {toPersianDigits(tasksCount)}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-card-soft">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${
                    tasksCount
                      ? Math.round((completedCount / tasksCount) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href={`/tasks/new?date=${date}`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-black text-white transition hover:bg-primary-dark"
          >
            <PlusCircle className="size-3.5" />
            وظیفه
          </Link>

          <Link
            href={`/events/new?date=${date}`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background/60 text-xs font-black text-foreground transition hover:border-primary-soft hover:bg-primary-soft/20"
          >
            <CalendarDays className="size-3.5" />
            رویداد
          </Link>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/55 px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card-soft text-primary">
        {icon}
      </span>

      <span className="min-w-0 flex-1 text-xs font-bold text-muted">
        {label}
      </span>

      <span className="text-sm font-black text-foreground">
        {toPersianDigits(value)}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                EMPTY STATE                                 */
/* -------------------------------------------------------------------------- */

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/35 px-5 text-center">
      <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-card-soft text-muted">
        {icon}
      </span>

      <p className="text-sm font-black text-foreground">{title}</p>

      <p className="mt-1 max-w-sm text-xs leading-6 text-muted">{text}</p>
    </div>
  );
}
