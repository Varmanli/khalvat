import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { goals, habits } from "@/db/schema";
import { getUserEntries } from "@/lib/entries";
import { getUserTasks } from "@/lib/tasks";

export const searchTypes = ["all", "entries", "tasks", "reminders", "goals", "habits"] as const;
export type SearchType = (typeof searchTypes)[number];
export function normalizePersianSearch(value: string) { return value.trim().replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " "); }
function variants(value: string) { const normalized = normalizePersianSearch(value); return [...new Set([normalized, normalized.replace(/ی/g, "ي").replace(/ک/g, "ك"), normalized.replace(/ی/g, "ي"), normalized.replace(/ک/g, "ك")])]; }
const goalMatch = (query: string) => or(...variants(query).map((value) => ilike(goals.title, `%${value}%`)))!;
const habitMatch = (query: string) => or(...variants(query).map((value) => ilike(habits.title, `%${value}%`)))!;
export async function getGlobalSearch(userId: string, rawQuery: string) {
  const query = normalizePersianSearch(rawQuery); if (!query) return { entries: [], reminders: [], tasks: [], goals: [], habits: [] };
  const [entryRows, taskRows, goalRows, habitRows] = await Promise.all([
    getUserEntries(userId, { q: query, limit: 24 }), getUserTasks(userId, { q: query, limit: 12 }),
    db.select({ id: goals.id, title: goals.title, progress: goals.progress, type: goals.type }).from(goals).where(and(eq(goals.userId, userId), goalMatch(query))).limit(12),
    db.select({ id: habits.id, title: habits.title, repeatType: habits.repeatType }).from(habits).where(and(eq(habits.userId, userId), habitMatch(query))).limit(12),
  ]);
  return { entries: entryRows.filter((entry) => entry.type !== "reminder").slice(0, 12), reminders: entryRows.filter((entry) => entry.type === "reminder").slice(0, 12), tasks: taskRows, goals: goalRows, habits: habitRows };
}
