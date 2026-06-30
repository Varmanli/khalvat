import { db } from "@/db";
import { gratitudeEntries } from "@/db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { GratitudeInput } from "@/lib/validations";
import { jalaliToGregorianIso, getJalaliParts, toGregorianIso } from "@/lib/date";

export function getTodayKey(): string {
  return toGregorianIso(new Date());
}

export async function getUserGratitudeByDate(userId: string, date: string) {
  const rows = await db
    .select()
    .from(gratitudeEntries)
    .where(and(eq(gratitudeEntries.userId, userId), eq(gratitudeEntries.date, date)))
    .limit(1);
  return rows[0] ?? null;
}

/** Fetch entries for a Jalali month using Gregorian ISO range internally. */
export async function getUserGratitudeForJalaliMonth(userId: string, jy: number, jm: number) {
  const startIso = jalaliToGregorianIso(jy, jm, 1);
  // next Jalali month start
  const totalNext = jy * 12 + (jm - 1) + 1;
  const nextJy = Math.floor(totalNext / 12);
  const nextJm = (totalNext % 12) + 1;
  const endIso = jalaliToGregorianIso(nextJy, nextJm, 1);

  return db
    .select()
    .from(gratitudeEntries)
    .where(
      and(
        eq(gratitudeEntries.userId, userId),
        gte(gratitudeEntries.date, startIso),
        lte(gratitudeEntries.date, endIso),
      )
    )
    .orderBy(desc(gratitudeEntries.date));
}

export async function upsertUserGratitude(userId: string, input: GratitudeInput) {
  const items = input.items.filter((s) => s.trim().length > 0);

  const existing = await getUserGratitudeByDate(userId, input.date);
  if (existing) {
    const rows = await db
      .update(gratitudeEntries)
      .set({
        items,
        note: input.note ?? null,
        mood: input.mood ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(gratitudeEntries.userId, userId), eq(gratitudeEntries.date, input.date)))
      .returning();
    return rows[0];
  }

  const rows = await db
    .insert(gratitudeEntries)
    .values({
      userId,
      date: input.date,
      items,
      note: input.note ?? null,
      mood: input.mood ?? null,
    })
    .returning();
  return rows[0];
}

export async function deleteUserGratitude(userId: string, date: string) {
  return db
    .delete(gratitudeEntries)
    .where(and(eq(gratitudeEntries.userId, userId), eq(gratitudeEntries.date, date)));
}

export async function getRecentGratitudeEntries(userId: string, limit = 7) {
  return db
    .select()
    .from(gratitudeEntries)
    .where(eq(gratitudeEntries.userId, userId))
    .orderBy(desc(gratitudeEntries.date))
    .limit(limit);
}

export interface GratitudeStats {
  totalEntries: number;
  currentMonthCount: number;
  currentStreak: number;
  lastEntryDate: string | null;
}

export async function getGratitudeStats(userId: string): Promise<GratitudeStats> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gratitudeEntries)
    .where(eq(gratitudeEntries.userId, userId));

  const [monthRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(gratitudeEntries)
    .where(and(eq(gratitudeEntries.userId, userId), gte(gratitudeEntries.date, monthStart)));

  const recent = await db
    .select({ date: gratitudeEntries.date })
    .from(gratitudeEntries)
    .where(eq(gratitudeEntries.userId, userId))
    .orderBy(desc(gratitudeEntries.date))
    .limit(60);

  const today = getTodayKey();
  let streak = 0;
  if (recent.length > 0) {
    const cursor = new Date(today);
    const dateSet = new Set(recent.map((r) => r.date));

    // Start from today or yesterday
    if (!dateSet.has(today)) cursor.setDate(cursor.getDate() - 1);

    while (true) {
      const key = toGregorianIso(cursor);
      if (!dateSet.has(key)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return {
    totalEntries: totalRow?.count ?? 0,
    currentMonthCount: monthRow?.count ?? 0,
    currentStreak: streak,
    lastEntryDate: recent[0]?.date ?? null,
  };
}
