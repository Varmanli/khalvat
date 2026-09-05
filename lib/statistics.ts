import { and, eq, gte, lt, or } from "drizzle-orm";

import { db } from "@/db";
import { dailyCheckIns, entries, goalMilestones, goals, gratitudeEntries, habitLogs, habits, tasks } from "@/db/schema";
import { getJalaliParts, jalaliToGregorianIso } from "@/lib/date";
import { isHabitScheduledForDate, parseDateString } from "@/lib/habit-utils";
import { dayBoundary, rangeDays, shiftDay } from "@/lib/planner-dates";
import type { StatsRange } from "@/lib/statistics-range";

export { resolveStatsRange, statsRangeValues } from "@/lib/statistics-range";
export type { StatsRange, StatsRangeValue } from "@/lib/statistics-range";

function bucketKey(date: string, range: StatsRange) {
  if (range.granularity === "day") return date;
  if (range.granularity === "week") return shiftDay(date, -((parseDateString(date).getDay() + 1) % 7));
  const { jy, jm } = getJalaliParts(date);
  return jalaliToGregorianIso(jy, jm, 1);
}
function buckets(range: StatsRange) {
  const result: string[] = [];
  for (const date of rangeDays(range.start, range.end)) {
    const key = bucketKey(date, range);
    if (result.at(-1) !== key) result.push(key);
  }
  return result;
}
function timestampDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}
function countByDate(items: string[], range: StatsRange) {
  const counts = new Map<string, number>();
  for (const item of items) { const key = bucketKey(item, range); counts.set(key, (counts.get(key) ?? 0) + 1); }
  return buckets(range).map((date) => ({ date, value: counts.get(date) ?? 0 }));
}

/** A day is active after a task or habit completion, a written entry, check-in, or gratitude record. */
export async function getStatistics(userId: string, range: StatsRange) {
  const [completedTasks, createdTasks, plannedTasks, allHabits, doneLogs, milestones, userGoals, checkins, gratitude, writing] = await Promise.all([
    db.select({ id: tasks.id, completedAt: tasks.completedAt, goalId: tasks.goalId, priority: tasks.priority }).from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.status, "done"), gte(tasks.completedAt, dayBoundary(range.start)), lt(tasks.completedAt, dayBoundary(range.end)))),
    db.select({ id: tasks.id }).from(tasks).where(and(eq(tasks.userId, userId), gte(tasks.createdAt, dayBoundary(range.start)), lt(tasks.createdAt, dayBoundary(range.end)))),
    db.select({ id: tasks.id, scheduledDate: tasks.scheduledDate, dueAt: tasks.dueAt, status: tasks.status }).from(tasks).where(and(eq(tasks.userId, userId), or(and(gte(tasks.scheduledDate, range.start), lt(tasks.scheduledDate, range.end)), and(gte(tasks.dueAt, dayBoundary(range.start)), lt(tasks.dueAt, dayBoundary(range.end)))))),
    db.select().from(habits).where(eq(habits.userId, userId)),
    db.select({ habitId: habitLogs.habitId, date: habitLogs.date, status: habitLogs.status, goalId: habits.goalId }).from(habitLogs).innerJoin(habits, eq(habitLogs.habitId, habits.id)).where(and(eq(habitLogs.userId, userId), gte(habitLogs.date, range.start), lt(habitLogs.date, range.end))),
    db.select({ goalId: goalMilestones.goalId, completedAt: goalMilestones.completedAt }).from(goalMilestones).where(and(eq(goalMilestones.userId, userId), eq(goalMilestones.status, "completed"), gte(goalMilestones.completedAt, dayBoundary(range.start)), lt(goalMilestones.completedAt, dayBoundary(range.end)))),
    db.select().from(goals).where(eq(goals.userId, userId)),
    db.select().from(dailyCheckIns).where(and(eq(dailyCheckIns.userId, userId), gte(dailyCheckIns.dateKey, range.start), lt(dailyCheckIns.dateKey, range.end))),
    db.select().from(gratitudeEntries).where(and(eq(gratitudeEntries.userId, userId), gte(gratitudeEntries.date, range.start), lt(gratitudeEntries.date, range.end))),
    db.select().from(entries).where(and(eq(entries.userId, userId), gte(entries.createdAt, dayBoundary(range.start)), lt(entries.createdAt, dayBoundary(range.end)))),
  ]);
  const taskDates = completedTasks.flatMap((task) => task.completedAt ? [timestampDate(task.completedAt)] : []);
  const habitDone = doneLogs.filter((log) => log.status === "done");
  const activeDates = new Set([...taskDates, ...habitDone.map((log) => log.date), ...checkins.map((item) => item.dateKey), ...gratitude.map((item) => item.date), ...writing.map((item) => timestampDate(item.createdAt))]);
  const plannedHabitById = new Map<string, number>();
  for (const habit of allHabits) {
    let planned = 0;
    // `isActive` describes today; historical adherence keeps occurrences before archival.
    const archivedDate = habit.archivedAt ? timestampDate(habit.archivedAt) : null;
    const historicalHabit = { ...habit, isActive: true, archivedAt: null };
    for (const date of rangeDays(range.start, range.end)) {
      if ((!archivedDate || date < archivedDate) && isHabitScheduledForDate(historicalHabit, parseDateString(date))) planned++;
    }
    if (planned) plannedHabitById.set(habit.id, planned);
  }
  const habitRows = allHabits.map((habit) => {
    const planned = plannedHabitById.get(habit.id) ?? 0;
    const completed = habitDone.filter((log) => log.habitId === habit.id).length;
    return { id: habit.id, title: habit.title, color: habit.color, planned, completed, adherence: planned ? Math.round(completed / planned * 100) : 0 };
  }).filter((item) => item.planned > 0 || item.completed > 0).sort((a, b) => b.planned - a.planned);
  const habitPlanned = habitRows.reduce((sum, item) => sum + item.planned, 0);
  const taskPlanned = plannedTasks.filter((task) => (task.scheduledDate ?? (task.dueAt ? timestampDate(task.dueAt) : null))! < range.end).length;
  const goalIdsWithWork = new Set([...completedTasks.filter((task) => task.goalId).map((task) => task.goalId!), ...habitDone.filter((log) => log.goalId).map((log) => log.goalId!)]);
  const goalRows = userGoals.filter((goal) => goal.status !== "archived" && goal.status !== "cancelled").map((goal) => ({
    id: goal.id, title: goal.title, progress: goal.progress, status: goal.status,
    completedTasks: completedTasks.filter((task) => task.goalId === goal.id).length,
    habitSessions: habitDone.filter((log) => log.goalId === goal.id).length,
    milestones: milestones.filter((item) => item.goalId === goal.id).length,
    progressed: goalIdsWithWork.has(goal.id) || milestones.some((item) => item.goalId === goal.id),
  }));
  const moodCounts = new Map<string, number>(); checkins.forEach((item) => moodCounts.set(item.mood, (moodCounts.get(item.mood) ?? 0) + 1));
  const bestWeek = countByDate([...taskDates, ...habitDone.map((log) => log.date)], { ...range, granularity: "week" }).sort((a, b) => b.value - a.value)[0];
  const weekdayCounts = new Map<number, number>(); activeDates.forEach((date) => { const weekday = (parseDateString(date).getDay() + 1) % 7; weekdayCounts.set(weekday, (weekdayCounts.get(weekday) ?? 0) + 1); });
  return {
    overview: { completedTasks: completedTasks.length, completionRate: taskPlanned ? Math.round(completedTasks.length / taskPlanned * 100) : 0, activeDays: activeDates.size, habitRate: habitPlanned ? Math.round(habitDone.length / habitPlanned * 100) : 0, goalsProgressed: goalRows.filter((goal) => goal.progressed).length },
    task: { created: createdTasks.length, completed: completedTasks.length, planned: taskPlanned, averagePerActiveDay: activeDates.size ? Math.round(completedTasks.length / activeDates.size * 10) / 10 : 0, series: countByDate(taskDates, range) },
    habits: { planned: habitPlanned, completed: habitDone.length, adherence: habitPlanned ? Math.round(habitDone.length / habitPlanned * 100) : 0, rows: habitRows, series: countByDate(habitDone.map((log) => log.date), range) },
    goals: { active: goalRows.filter((goal) => goal.status === "active").length, completed: userGoals.filter((goal) => goal.completedAt && goal.completedAt >= dayBoundary(range.start) && goal.completedAt < dayBoundary(range.end)).length, milestones: milestones.length, rows: goalRows.filter((goal) => goal.progressed || goal.status === "active") },
    mood: { entries: checkins.length, mostFrequent: [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null, series: countByDate(checkins.map((item) => item.dateKey), range) },
    gratitude: { entries: gratitude.length, days: new Set(gratitude.map((item) => item.date)).size },
    writing: { entries: writing.length, days: new Set(writing.map((item) => timestampDate(item.createdAt))).size },
    activitySeries: countByDate([...taskDates, ...habitDone.map((log) => log.date)], range),
    rhythm: { mostActiveWeekday: [...weekdayCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null, bestWeek, activeDays: activeDates.size, averageTasks: activeDates.size ? Math.round(completedTasks.length / activeDates.size * 10) / 10 : 0 },
  };
}
