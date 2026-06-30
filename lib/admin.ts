import { db } from "@/db";
import {
  users,
  entries,
  tasks,
  gratitudeEntries,
  habits,
  habitLogs,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { notFound } from "next/navigation";

// ── Admin check ───────────────────────────────────────────────────

function isAdminByEmail(email: string): boolean {
  const envEmails = process.env.ADMIN_EMAILS ?? "";
  if (!envEmails) return false;
  return envEmails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .includes(email);
}

export async function requireAdmin() {
  const session = await requireUser();

  const [row] = await db
    .select({ role: users.role, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const isAdmin =
    row?.role === "admin" || (row?.email && isAdminByEmail(row.email));

  if (!isAdmin) notFound();

  return { ...session, role: row?.role ?? "user", email: row?.email ?? "" };
}

// ── Date helpers ──────────────────────────────────────────────────

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Overview stats ────────────────────────────────────────────────

export async function getAdminOverviewStats() {
  const today = startOfToday();
  const sevenDaysAgo = startOfNDaysAgo(7);

  const [
    [totalUsersRow],
    [newUsersTodayRow],
    [newUsersWeekRow],
    [totalEntriesRow],
    [totalTasksRow],
    [totalGratitudeRow],
    [totalHabitsRow],
    [activeHabitsRow],
    [totalHabitLogsRow],
    // Active users: distinct userIds across all activity tables
    activeTodayEntries,
    activeTodayTasks,
    activeTodayGratitude,
    activeTodayHabits,
    activeTodayLogs,
    activeWeekEntries,
    activeWeekTasks,
    activeWeekGratitude,
    activeWeekHabits,
    activeWeekLogs,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(users).where(gte(users.createdAt, today)),
    db.select({ total: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
    db.select({ total: count() }).from(entries),
    db.select({ total: count() }).from(tasks),
    db.select({ total: count() }).from(gratitudeEntries),
    db.select({ total: count() }).from(habits),
    db.select({ total: count() }).from(habits).where(eq(habits.isActive, true)),
    db.select({ total: count() }).from(habitLogs),
    // active today
    db.selectDistinct({ userId: entries.userId }).from(entries).where(gte(entries.updatedAt, today)),
    db.selectDistinct({ userId: tasks.userId }).from(tasks).where(gte(tasks.updatedAt, today)),
    db.selectDistinct({ userId: gratitudeEntries.userId }).from(gratitudeEntries).where(gte(gratitudeEntries.updatedAt, today)),
    db.selectDistinct({ userId: habits.userId }).from(habits).where(gte(habits.updatedAt, today)),
    db.selectDistinct({ userId: habitLogs.userId }).from(habitLogs).where(gte(habitLogs.updatedAt, today)),
    // active this week
    db.selectDistinct({ userId: entries.userId }).from(entries).where(gte(entries.updatedAt, sevenDaysAgo)),
    db.selectDistinct({ userId: tasks.userId }).from(tasks).where(gte(tasks.updatedAt, sevenDaysAgo)),
    db.selectDistinct({ userId: gratitudeEntries.userId }).from(gratitudeEntries).where(gte(gratitudeEntries.updatedAt, sevenDaysAgo)),
    db.selectDistinct({ userId: habits.userId }).from(habits).where(gte(habits.updatedAt, sevenDaysAgo)),
    db.selectDistinct({ userId: habitLogs.userId }).from(habitLogs).where(gte(habitLogs.updatedAt, sevenDaysAgo)),
  ]);

  const activeUsersToday = new Set([
    ...activeTodayEntries.map((r) => r.userId),
    ...activeTodayTasks.map((r) => r.userId),
    ...activeTodayGratitude.map((r) => r.userId),
    ...activeTodayHabits.map((r) => r.userId),
    ...activeTodayLogs.map((r) => r.userId),
  ]).size;

  const activeUsersWeek = new Set([
    ...activeWeekEntries.map((r) => r.userId),
    ...activeWeekTasks.map((r) => r.userId),
    ...activeWeekGratitude.map((r) => r.userId),
    ...activeWeekHabits.map((r) => r.userId),
    ...activeWeekLogs.map((r) => r.userId),
  ]).size;

  return {
    totalUsers: totalUsersRow?.total ?? 0,
    newUsersToday: newUsersTodayRow?.total ?? 0,
    newUsersThisWeek: newUsersWeekRow?.total ?? 0,
    totalEntries: totalEntriesRow?.total ?? 0,
    totalTasks: totalTasksRow?.total ?? 0,
    totalGratitude: totalGratitudeRow?.total ?? 0,
    totalHabits: totalHabitsRow?.total ?? 0,
    activeHabits: activeHabitsRow?.total ?? 0,
    totalHabitLogs: totalHabitLogsRow?.total ?? 0,
    activeUsersToday,
    activeUsersLast7Days: activeUsersWeek,
  };
}

// ── Recent users (for overview) ───────────────────────────────────

export async function getAdminRecentUsers(limit = 8) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarIcon: users.avatarIcon,
      avatarColor: users.avatarColor,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

// ── Paginated users list ──────────────────────────────────────────

const PAGE_SIZE = 20;

export async function getAdminUsers({
  q,
  page = 1,
}: {
  q?: string;
  page?: number;
}) {
  const offset = (page - 1) * PAGE_SIZE;

  const whereClause = q
    ? or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`))
    : undefined;

  const [rows, [countRow]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarIcon: users.avatarIcon,
        avatarColor: users.avatarColor,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(users).where(whereClause),
  ]);

  const userIds = rows.map((r) => r.id);

  // Batch count per user
  let entryCounts: { userId: string; total: number }[] = [];
  let taskCounts: { userId: string; total: number }[] = [];
  let habitCounts: { userId: string; total: number }[] = [];
  let gratitudeCounts: { userId: string; total: number }[] = [];

  if (userIds.length > 0) {
    [entryCounts, taskCounts, habitCounts, gratitudeCounts] = await Promise.all([
      db
        .select({ userId: entries.userId, total: count() })
        .from(entries)
        .where(inArray(entries.userId, userIds))
        .groupBy(entries.userId),
      db
        .select({ userId: tasks.userId, total: count() })
        .from(tasks)
        .where(inArray(tasks.userId, userIds))
        .groupBy(tasks.userId),
      db
        .select({ userId: habits.userId, total: count() })
        .from(habits)
        .where(inArray(habits.userId, userIds))
        .groupBy(habits.userId),
      db
        .select({ userId: gratitudeEntries.userId, total: count() })
        .from(gratitudeEntries)
        .where(inArray(gratitudeEntries.userId, userIds))
        .groupBy(gratitudeEntries.userId),
    ]);
  }

  const toMap = (arr: { userId: string; total: number }[]) =>
    Object.fromEntries(arr.map((r) => [r.userId, r.total]));

  const eMap = toMap(entryCounts);
  const tMap = toMap(taskCounts);
  const hMap = toMap(habitCounts);
  const gMap = toMap(gratitudeCounts);

  const enriched = rows.map((u) => ({
    ...u,
    entriesCount: eMap[u.id] ?? 0,
    tasksCount: tMap[u.id] ?? 0,
    habitsCount: hMap[u.id] ?? 0,
    gratitudeCount: gMap[u.id] ?? 0,
  }));

  return {
    users: enriched,
    total: countRow?.total ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((countRow?.total ?? 0) / PAGE_SIZE),
  };
}

// ── Activity feed (privacy-safe) ──────────────────────────────────

export type ActivityType = "entry" | "task" | "gratitude" | "habit" | "habitLog" | "all";

export interface ActivityItem {
  id: string;
  type: Exclude<ActivityType, "all">;
  safeLabel: string;
  createdAt: Date;
  userId: string;
  userName: string | null;
  userEmail: string;
  userAvatarIcon: string | null;
  userAvatarColor: string | null;
}

export async function getAdminRecentActivity(
  limit = 30,
  filterType: ActivityType = "all"
): Promise<ActivityItem[]> {
  const perSource = Math.max(limit, 20);

  const results: ActivityItem[] = [];

  const needsType = (t: Exclude<ActivityType, "all">) =>
    filterType === "all" || filterType === t;

  await Promise.all([
    needsType("entry") &&
      db
        .select({
          id: entries.id,
          title: entries.title,
          createdAt: entries.createdAt,
          userId: entries.userId,
          userName: users.name,
          userEmail: users.email,
          userAvatarIcon: users.avatarIcon,
          userAvatarColor: users.avatarColor,
        })
        .from(entries)
        .leftJoin(users, eq(entries.userId, users.id))
        .orderBy(desc(entries.createdAt))
        .limit(perSource)
        .then((rows) => {
          rows.forEach((r) =>
            results.push({
              id: r.id,
              type: "entry",
              // Privacy: only safe title, no body/content
              safeLabel: r.title?.trim() ? r.title : "یک نوشته جدید ثبت شد",
              createdAt: r.createdAt,
              userId: r.userId,
              userName: r.userName ?? null,
              userEmail: r.userEmail ?? r.userId,
              userAvatarIcon: r.userAvatarIcon ?? null,
              userAvatarColor: r.userAvatarColor ?? null,
            })
          );
        }),

    needsType("task") &&
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          createdAt: tasks.createdAt,
          userId: tasks.userId,
          userName: users.name,
          userEmail: users.email,
          userAvatarIcon: users.avatarIcon,
          userAvatarColor: users.avatarColor,
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.userId, users.id))
        .orderBy(desc(tasks.createdAt))
        .limit(perSource)
        .then((rows) => {
          rows.forEach((r) =>
            results.push({
              id: r.id,
              type: "task",
              safeLabel: r.title?.trim() ? r.title : "یک وظیفه جدید ساخته شد",
              createdAt: r.createdAt,
              userId: r.userId,
              userName: r.userName ?? null,
              userEmail: r.userEmail ?? r.userId,
              userAvatarIcon: r.userAvatarIcon ?? null,
              userAvatarColor: r.userAvatarColor ?? null,
            })
          );
        }),

    needsType("gratitude") &&
      db
        .select({
          id: gratitudeEntries.id,
          date: gratitudeEntries.date,
          createdAt: gratitudeEntries.createdAt,
          userId: gratitudeEntries.userId,
          userName: users.name,
          userEmail: users.email,
          userAvatarIcon: users.avatarIcon,
          userAvatarColor: users.avatarColor,
        })
        .from(gratitudeEntries)
        .leftJoin(users, eq(gratitudeEntries.userId, users.id))
        .orderBy(desc(gratitudeEntries.createdAt))
        .limit(perSource)
        .then((rows) => {
          rows.forEach((r) =>
            results.push({
              id: r.id,
              type: "gratitude",
              // Privacy: never show items/content
              safeLabel: "یک شکرگزاری ثبت شد",
              createdAt: r.createdAt,
              userId: r.userId,
              userName: r.userName ?? null,
              userEmail: r.userEmail ?? r.userId,
              userAvatarIcon: r.userAvatarIcon ?? null,
              userAvatarColor: r.userAvatarColor ?? null,
            })
          );
        }),

    needsType("habit") &&
      db
        .select({
          id: habits.id,
          title: habits.title,
          createdAt: habits.createdAt,
          userId: habits.userId,
          userName: users.name,
          userEmail: users.email,
          userAvatarIcon: users.avatarIcon,
          userAvatarColor: users.avatarColor,
        })
        .from(habits)
        .leftJoin(users, eq(habits.userId, users.id))
        .orderBy(desc(habits.createdAt))
        .limit(perSource)
        .then((rows) => {
          rows.forEach((r) =>
            results.push({
              id: r.id,
              type: "habit",
              safeLabel: r.title?.trim() ? r.title : "یک عادت جدید ثبت شد",
              createdAt: r.createdAt,
              userId: r.userId,
              userName: r.userName ?? null,
              userEmail: r.userEmail ?? r.userId,
              userAvatarIcon: r.userAvatarIcon ?? null,
              userAvatarColor: r.userAvatarColor ?? null,
            })
          );
        }),

    needsType("habitLog") &&
      db
        .select({
          id: habitLogs.id,
          date: habitLogs.date,
          createdAt: habitLogs.createdAt,
          userId: habitLogs.userId,
          userName: users.name,
          userEmail: users.email,
          userAvatarIcon: users.avatarIcon,
          userAvatarColor: users.avatarColor,
        })
        .from(habitLogs)
        .leftJoin(users, eq(habitLogs.userId, users.id))
        .orderBy(desc(habitLogs.createdAt))
        .limit(perSource)
        .then((rows) => {
          rows.forEach((r) =>
            results.push({
              id: r.id,
              type: "habitLog",
              // Privacy: never show private notes
              safeLabel: "یک عادت ثبت شد",
              createdAt: r.createdAt,
              userId: r.userId,
              userName: r.userName ?? null,
              userEmail: r.userEmail ?? r.userId,
              userAvatarIcon: r.userAvatarIcon ?? null,
              userAvatarColor: r.userAvatarColor ?? null,
            })
          );
        }),
  ]);

  return results
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

// ── System health ─────────────────────────────────────────────────

export async function getAdminSystemHealth() {
  const [lastUserRow, lastEntryRow, lastLogRow] = await Promise.all([
    db
      .select({ name: users.name, email: users.email, createdAt: users.createdAt })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(1),
    db
      .select({ createdAt: entries.createdAt })
      .from(entries)
      .orderBy(desc(entries.createdAt))
      .limit(1),
    db
      .select({ createdAt: habitLogs.createdAt })
      .from(habitLogs)
      .orderBy(desc(habitLogs.createdAt))
      .limit(1),
  ]);

  const lastActivityAt =
    lastEntryRow[0]?.createdAt && lastLogRow[0]?.createdAt
      ? lastEntryRow[0].createdAt > lastLogRow[0].createdAt
        ? lastEntryRow[0].createdAt
        : lastLogRow[0].createdAt
      : (lastEntryRow[0]?.createdAt ?? lastLogRow[0]?.createdAt ?? null);

  return {
    databaseStatus: "connected" as const,
    lastUser: lastUserRow[0] ?? null,
    lastActivityAt,
    signupMode:
      process.env.ALLOW_SIGNUPS === "false" ? ("closed" as const) : ("open" as const),
  };
}

// ── Role update ───────────────────────────────────────────────────

export async function updateUserRole(
  adminUserId: string,
  targetUserId: string,
  role: "user" | "admin"
) {
  if (adminUserId === targetUserId) {
    return { ok: false, message: "نمی‌توانی نقش حساب فعلی خودت را از اینجا تغییر بدهی." };
  }

  const [target] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!target) return { ok: false, message: "کاربر پیدا نشد." };

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, targetUserId));

  return { ok: true };
}
