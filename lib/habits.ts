import { db } from "@/db";
import { habits, habitCategories, habitLogs } from "@/db/schema";
import { and, desc, eq, gte, lte, or } from "drizzle-orm";
import type { HabitInput, HabitLogInput, HabitCategoryInput } from "@/lib/validations";
import type { Habit, HabitLog, HabitCategory } from "@/db/schema";
import { isHabitScheduledForDate, toDateString } from "@/lib/habit-utils";
import { daysInJalaliMonth, jalaliToGregorianIso } from "@/lib/date";

export { isHabitScheduledForDate } from "@/lib/habit-utils";

// ── Types ────────────────────────────────────────────────────

export type HabitWithCategory = Habit & {
  category: Pick<HabitCategory, "id" | "name" | "color" | "icon"> | null;
};

export type HabitWithLog = HabitWithCategory & {
  todayLog: HabitLog | null;
};

// ── Category helpers ─────────────────────────────────────────

export async function getUserHabitCategories(userId: string): Promise<HabitCategory[]> {
  return db
    .select()
    .from(habitCategories)
    .where(eq(habitCategories.userId, userId))
    .orderBy(habitCategories.name);
}

export async function createHabitCategory(userId: string, data: HabitCategoryInput): Promise<HabitCategory> {
  const rows = await db
    .insert(habitCategories)
    .values({ userId, name: data.name, color: data.color ?? "#8A5A44", icon: data.icon ?? null })
    .returning();
  return rows[0];
}

// ── Habit helpers ────────────────────────────────────────────

async function attachCategoriesToHabits(rows: Habit[]): Promise<HabitWithCategory[]> {
  if (rows.length === 0) return [];

  const catIds = [...new Set(rows.map((r) => r.categoryId).filter(Boolean))] as string[];
  const cats = catIds.length
    ? await db
        .select()
        .from(habitCategories)
        .where(
          catIds.length === 1
            ? eq(habitCategories.id, catIds[0])
            : or(...catIds.map((id) => eq(habitCategories.id, id)))!
        )
    : [];

  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));

  return rows.map((r) => ({
    ...r,
    category: r.categoryId ? (catMap[r.categoryId] ?? null) : null,
  }));
}

export async function getUserHabits(userId: string): Promise<HabitWithCategory[]> {
  const rows = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
    .orderBy(desc(habits.createdAt));

  return attachCategoriesToHabits(rows);
}

export async function getUserHabitById(userId: string, habitId: string): Promise<HabitWithCategory | null> {
  const rows = await db
    .select()
    .from(habits)
    .where(
      and(
        eq(habits.id, habitId),
        eq(habits.userId, userId),
        eq(habits.isActive, true)
      )
    )
    .limit(1);

  if (!rows[0]) return null;
  const result = await attachCategoriesToHabits([rows[0]]);
  return result[0] ?? null;
}

export async function getTodayHabits(userId: string): Promise<HabitWithLog[]> {
  const today = new Date();
  const todayStr = toDateString(today);

  const allHabits = await getUserHabits(userId);
  const scheduled = allHabits.filter((h) => isHabitScheduledForDate(h, today));

  if (scheduled.length === 0) return [];

  const habitIds = scheduled.map((h) => h.id);
  const logs = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        eq(habitLogs.date, todayStr),
        habitIds.length === 1
          ? eq(habitLogs.habitId, habitIds[0])
          : or(...habitIds.map((id) => eq(habitLogs.habitId, id)))!
      )
    );

  const logMap = Object.fromEntries(logs.map((l) => [l.habitId, l]));

  return scheduled.map((h) => ({
    ...h,
    todayLog: logMap[h.id] ?? null,
  }));
}

export async function getHabitLogsForMonth(
  userId: string,
  habitId: string,
  year: number,
  month: number
): Promise<HabitLog[]> {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        eq(habitLogs.habitId, habitId),
        gte(habitLogs.date, start),
        lte(habitLogs.date, end)
      )
    )
    .orderBy(habitLogs.date);
}

export async function getHabitLogsForJalaliMonth(
  userId: string,
  habitId: string,
  jy: number,
  jm: number
): Promise<HabitLog[]> {
  const start = jalaliToGregorianIso(jy, jm, 1);
  const end = jalaliToGregorianIso(jy, jm, daysInJalaliMonth(jy, jm));

  return db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        eq(habitLogs.habitId, habitId),
        gte(habitLogs.date, start),
        lte(habitLogs.date, end)
      )
    )
    .orderBy(habitLogs.date);
}

export async function getHabitStats(userId: string, habitId: string) {
  const habit = await getUserHabitById(userId, habitId);
  if (!habit) return null;

  const allLogs = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), eq(habitLogs.habitId, habitId)))
    .orderBy(desc(habitLogs.date));

  const today = new Date();
  const todayStr = toDateString(today);

  const thisMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const thisMonthEnd = todayStr;

  const doneLogs = allLogs.filter((l) => l.status === "done");
  const totalDone = doneLogs.length;

  // This month
  const doneThisMonth = doneLogs.filter(
    (l) => l.date >= thisMonthStart && l.date <= thisMonthEnd
  ).length;

  // Scheduled this month
  let scheduledThisMonth = 0;
  const startD = new Date(thisMonthStart);
  const endD = new Date(todayStr);
  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
    if (isHabitScheduledForDate(habit, new Date(d))) scheduledThisMonth++;
  }

  const completionRateThisMonth =
    scheduledThisMonth > 0 ? Math.round((doneThisMonth / scheduledThisMonth) * 100) : 0;

  // Streaks — only count scheduled days
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const logMap = Object.fromEntries(allLogs.map((l) => [l.date, l]));

  // Walk back from today
  const cursor = new Date(today);
  for (let i = 0; i < 365; i++) {
    const dateStr = toDateString(cursor);
    if (isHabitScheduledForDate(habit, new Date(cursor))) {
      const log = logMap[dateStr];
      if (log?.status === "done") {
        if (i === currentStreak) currentStreak++;
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  // Best streak — walk through all scheduled days from startDate
  const walkStart = new Date(habit.startDate);
  for (let d = new Date(walkStart); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = toDateString(d);
    if (isHabitScheduledForDate(habit, new Date(d))) {
      const log = logMap[dateStr];
      if (log?.status === "done") {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else if (dateStr <= todayStr) {
        tempStreak = 0;
      }
    }
  }

  return {
    totalDone,
    currentStreak,
    bestStreak,
    doneThisMonth,
    scheduledThisMonth,
    completionRateThisMonth,
  };
}

export async function createHabit(userId: string, data: HabitInput): Promise<HabitWithCategory> {
  const endDate = computeEndDate(data.startDate, data.durationDays ?? null, data.endDate ?? null);

  const rows = await db
    .insert(habits)
    .values({
      userId,
      categoryId: data.categoryId ?? null,
      title: data.title,
      shortDescription: data.shortDescription ?? null,
      color: data.color ?? "#8A5A44",
      icon: data.icon ?? "star",
      dailyGoal: data.dailyGoal ?? null,
      unit: data.unit ?? null,
      reminderTime: data.reminderTime ?? null,
      isActive: data.isActive ?? true,
      repeatType: data.repeatType,
      weeklyDays: data.repeatType === "weekly" ? (data.weeklyDays ?? []) : null,
      durationDays: data.durationDays ?? null,
      startDate: data.startDate,
      endDate: endDate,
    })
    .returning();

  const result = await attachCategoriesToHabits([rows[0]]);
  return result[0];
}

export async function updateHabit(
  userId: string,
  habitId: string,
  data: Partial<HabitInput>
): Promise<HabitWithCategory | null> {
  const existing = await getUserHabitById(userId, habitId);
  if (!existing) return null;

  const startDate = data.startDate ?? existing.startDate;
  const durationDays = data.durationDays !== undefined ? data.durationDays : existing.durationDays;
  const endDate = computeEndDate(startDate, durationDays ?? null, data.endDate ?? existing.endDate);

  const rows = await db
    .update(habits)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.color != null && { color: data.color }),
      ...(data.icon != null && { icon: data.icon }),
      ...(data.dailyGoal !== undefined && { dailyGoal: data.dailyGoal }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.reminderTime !== undefined && { reminderTime: data.reminderTime }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.repeatType !== undefined && { repeatType: data.repeatType }),
      ...(data.repeatType !== undefined && {
        weeklyDays: data.repeatType === "weekly" ? (data.weeklyDays ?? []) : null,
      }),
      ...(data.durationDays !== undefined && { durationDays: data.durationDays }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      endDate,
      updatedAt: new Date(),
    })
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();

  if (!rows[0]) return null;
  const result = await attachCategoriesToHabits([rows[0]]);
  return result[0] ?? null;
}

export async function archiveHabit(userId: string, habitId: string): Promise<void> {
  await db
    .update(habits)
    .set({ archivedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(
      and(eq(habits.id, habitId), eq(habits.userId, userId), eq(habits.isActive, true))
    );
}

export async function upsertHabitLog(
  userId: string,
  habitId: string,
  data: HabitLogInput
): Promise<HabitLog> {
  const existing = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        eq(habitLogs.habitId, habitId),
        eq(habitLogs.date, data.date)
      )
    )
    .limit(1);

  if (existing[0]) {
    const rows = await db
      .update(habitLogs)
      .set({
        status: data.status,
        value: data.value ?? null,
        note: data.note ?? null,
        updatedAt: new Date(),
      })
      .where(eq(habitLogs.id, existing[0].id))
      .returning();
    return rows[0];
  }

  const rows = await db
    .insert(habitLogs)
    .values({
      habitId,
      userId,
      date: data.date,
      status: data.status,
      value: data.value ?? null,
      note: data.note ?? null,
    })
    .returning();
  return rows[0];
}

export async function getUserHabitStats(userId: string) {
  const today = new Date();
  const todayStr = toDateString(today);

  const allHabits = await db.select().from(habits).where(eq(habits.userId, userId));
  const activeHabits = allHabits.filter((h) => h.isActive && !h.archivedAt);

  const todayLogs = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, todayStr)));

  const doneToday = todayLogs.filter((l) => l.status === "done").length;
  const scheduledToday = activeHabits.filter((h) => isHabitScheduledForDate(h, today)).length;

  return {
    activeHabits: activeHabits.length,
    doneToday,
    scheduledToday,
  };
}

function computeEndDate(
  startDate: string,
  durationDays: number | null,
  endDate: string | null | undefined
): string | null {
  if (durationDays && durationDays > 0) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + durationDays - 1);
    return toDateString(d);
  }
  return endDate ?? null;
}
