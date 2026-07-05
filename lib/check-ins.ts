import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyCheckIns } from "@/db/schema";
import { getJalaliDateKey, shiftJalaliDateKey } from "@/lib/date";
import {
  type DailyCheckInMood,
} from "@/lib/check-in-options";
import type { DailyCheckInInput } from "@/lib/validations";

export function getTodayCheckInDateKey(): string {
  return getJalaliDateKey(new Date());
}

export async function getUserCheckInByDateKey(userId: string, dateKey: string) {
  const rows = await db
    .select()
    .from(dailyCheckIns)
    .where(and(eq(dailyCheckIns.userId, userId), eq(dailyCheckIns.dateKey, dateKey)))
    .limit(1);

  return rows[0] ?? null;
}

export async function deleteUserCheckInById(userId: string, checkInId: string) {
  const rows = await db
    .delete(dailyCheckIns)
    .where(and(eq(dailyCheckIns.id, checkInId), eq(dailyCheckIns.userId, userId)))
    .returning({ id: dailyCheckIns.id });

  return rows[0] ?? null;
}

export async function upsertUserCheckIn(userId: string, input: DailyCheckInInput) {
  const existing = await getUserCheckInByDateKey(userId, input.dateKey);

  if (existing) {
    const rows = await db
      .update(dailyCheckIns)
      .set({
        mood: input.mood,
        emoji: input.emoji,
        note: input.note ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(dailyCheckIns.userId, userId), eq(dailyCheckIns.dateKey, input.dateKey)))
      .returning();
    return rows[0];
  }

  const rows = await db
    .insert(dailyCheckIns)
    .values({
      userId,
      dateKey: input.dateKey,
      mood: input.mood,
      emoji: input.emoji,
      note: input.note ?? null,
    })
    .returning();

  return rows[0];
}

export async function getRecentCheckIns(userId: string, limit = 90) {
  return db
    .select()
    .from(dailyCheckIns)
    .where(eq(dailyCheckIns.userId, userId))
    .orderBy(desc(dailyCheckIns.dateKey))
    .limit(limit);
}

export interface DailyCheckInStats {
  totalCheckIns: number;
  currentStreak: number;
  mostRepeatedMood: DailyCheckInMood | null;
}

export async function getDailyCheckInStats(userId: string): Promise<DailyCheckInStats> {
  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dailyCheckIns)
    .where(eq(dailyCheckIns.userId, userId));

  const moodCounts = await db
    .select({
      mood: dailyCheckIns.mood,
      count: sql<number>`count(*)::int`,
    })
    .from(dailyCheckIns)
    .where(eq(dailyCheckIns.userId, userId))
    .groupBy(dailyCheckIns.mood)
    .orderBy(sql`count(*) desc`, dailyCheckIns.mood);

  const recent = await db
    .select({ dateKey: dailyCheckIns.dateKey })
    .from(dailyCheckIns)
    .where(eq(dailyCheckIns.userId, userId))
    .orderBy(desc(dailyCheckIns.dateKey))
    .limit(120);

  let streak = 0;
  if (recent.length > 0) {
    const dateSet = new Set(recent.map((entry) => entry.dateKey));
    let cursor = getTodayCheckInDateKey();

    if (!dateSet.has(cursor)) {
      cursor = shiftJalaliDateKey(cursor, -1);
    }

    while (dateSet.has(cursor)) {
      streak++;
      cursor = shiftJalaliDateKey(cursor, -1);
    }
  }

  return {
    totalCheckIns: totalRow?.count ?? 0,
    currentStreak: streak,
    mostRepeatedMood: (moodCounts[0]?.mood as DailyCheckInMood | undefined) ?? null,
  };
}
