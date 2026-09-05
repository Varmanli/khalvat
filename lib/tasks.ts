import { db } from "@/db";
import { tasks, taskCategories, goals } from "@/db/schema";
import { and, desc, eq, ilike, isNull, lte, gte, or } from "drizzle-orm";
import { comparePriority } from "./planner-dates";
import type { TaskInput } from "@/lib/validations";
import type { TaskPriority, TaskStatus } from "@/lib/task-constants";
import { syncTaskNotification } from "@/lib/notifications";

export interface TaskFilters {
  q?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  due?: "today" | "upcoming" | "overdue" | "none";
  limit?: number;
}

export interface TaskWithCategory {
  id: string;
  userId: string;
  categoryId: string | null;
  goalId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  color: string | null;
  isPinned: boolean;
  dueAt: Date | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  scheduledEndTime: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; color: string } | null;
  goal: { id: string; title: string } | null;
}

async function attachCategories(rows: (typeof tasks.$inferSelect)[]): Promise<TaskWithCategory[]> {
  if (rows.length === 0) return [];

  const catIds = [...new Set(rows.map((r) => r.categoryId).filter(Boolean))] as string[];
  const cats = catIds.length
    ? await db
        .select({ id: taskCategories.id, name: taskCategories.name, color: taskCategories.color })
        .from(taskCategories)
        .where(
          catIds.length === 1
            ? eq(taskCategories.id, catIds[0])
            : or(...catIds.map((id) => eq(taskCategories.id, id)))!
        )
    : [];

  const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));
  const goalIds = [...new Set(rows.map((r) => r.goalId).filter(Boolean))] as string[];
  const goalRows = goalIds.length ? await db.select({ id: goals.id, title: goals.title }).from(goals).where(goalIds.length === 1 ? eq(goals.id, goalIds[0]) : or(...goalIds.map((id) => eq(goals.id, id)))!) : [];
  const goalMap = Object.fromEntries(goalRows.map((goal) => [goal.id, goal]));

  return rows.map((r) => ({
    ...r,
    priority: r.priority as TaskPriority,
    status: r.status as TaskStatus,
    category: r.categoryId ? (catMap[r.categoryId] ?? null) : null,
    goal: r.goalId ? (goalMap[r.goalId] ?? null) : null,
  }));
}

export async function getUserTasks(
  userId: string,
  filters?: TaskFilters
): Promise<TaskWithCategory[]> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000 - 1);

  const conditions = [eq(tasks.userId, userId)];

  if (filters?.q) {
    conditions.push(
      or(ilike(tasks.title, `%${filters.q}%`), ilike(tasks.description, `%${filters.q}%`))!
    );
  }
  if (filters?.status) conditions.push(eq(tasks.status, filters.status));
  if (filters?.priority) conditions.push(eq(tasks.priority, filters.priority));
  if (filters?.categoryId) conditions.push(eq(tasks.categoryId, filters.categoryId));

  if (filters?.due === "today") {
    conditions.push(gte(tasks.dueAt, startOfToday));
    conditions.push(lte(tasks.dueAt, endOfToday));
  } else if (filters?.due === "upcoming") {
    conditions.push(gte(tasks.dueAt, now));
  } else if (filters?.due === "overdue") {
    conditions.push(lte(tasks.dueAt, now));
    conditions.push(eq(tasks.status, "todo"));
  } else if (filters?.due === "none") {
    conditions.push(isNull(tasks.dueAt));
  }

  const rows = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.isPinned), desc(tasks.createdAt))
    .limit(filters?.limit ?? 100);

  return attachCategories(rows.sort(comparePriority));
}

export async function getUserTaskById(
  userId: string,
  taskId: string
): Promise<TaskWithCategory | null> {
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  if (!rows[0]) return null;
  const result = await attachCategories([rows[0]]);
  return result[0] ?? null;
}

export async function createTask(userId: string, data: TaskInput): Promise<TaskWithCategory> {
  await validateTaskRelations(userId, data);
  const rows = await db
    .insert(tasks)
    .values({
      userId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority,
      status: data.status,
      categoryId: data.categoryId ?? null,
      goalId: data.goalId ?? null,
      color: data.color ?? null,
      isPinned: data.isPinned ?? false,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      scheduledDate: data.scheduledDate ?? null,
      scheduledTime: data.scheduledTime ?? null,
      scheduledEndTime: data.scheduledEndTime ?? null,
      completedAt: data.status === "done" ? new Date() : null,
    })
    .returning();

  const result = await attachCategories([rows[0]]);
  await syncTaskNotification(rows[0]);
  return result[0];
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: Partial<TaskInput>
): Promise<TaskWithCategory | null> {
  const existing = await getUserTaskById(userId, taskId);
  if (!existing) return null;
  await validateTaskRelations(userId, { ...existing, ...data });
  const rows = await db
    .update(tasks)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.status !== undefined && { completedAt: data.status === "done" ? (existing.completedAt ?? new Date()) : null }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.goalId !== undefined && { goalId: data.goalId }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      ...(data.dueAt !== undefined && { dueAt: data.dueAt ? new Date(data.dueAt) : null }),
      ...(data.scheduledDate !== undefined && { scheduledDate: data.scheduledDate }),
      ...(data.scheduledTime !== undefined && { scheduledTime: data.scheduledTime }),
      ...(data.scheduledEndTime !== undefined && { scheduledEndTime: data.scheduledEndTime }),
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!rows[0]) return null;
  const result = await attachCategories([rows[0]]);
  await syncTaskNotification(rows[0]);
  return result[0] ?? null;
}

export async function deleteTask(userId: string, taskId: string) {
  const { syncEntityNotification } = await import("@/lib/notifications");
  await syncEntityNotification("task", userId, taskId, { title: "", targetUrl: `/tasks/${taskId}`, scheduledFor: null });
  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

export class TaskValidationError extends Error {}
async function validateTaskRelations(userId: string, data: { categoryId?: string | null; goalId?: string | null; scheduledDate?: string | null; scheduledTime?: string | null; scheduledEndTime?: string | null }) {
  if (data.scheduledTime && !data.scheduledDate) throw new TaskValidationError("ابتدا روز برنامه را انتخاب کنید.");
  if (data.scheduledEndTime && (!data.scheduledTime || data.scheduledEndTime <= data.scheduledTime)) throw new TaskValidationError("پایان باید بعد از شروع باشد.");
  if (data.categoryId) {
    const [category] = await db.select({ id: taskCategories.id }).from(taskCategories).where(and(eq(taskCategories.id, data.categoryId), eq(taskCategories.userId, userId))).limit(1);
    if (!category) throw new TaskValidationError("دسته‌بندی معتبر نیست.");
  }
  if (data.goalId) { const [goal] = await db.select({ id: goals.id }).from(goals).where(and(eq(goals.id, data.goalId), eq(goals.userId, userId))).limit(1); if (!goal) throw new TaskValidationError("هدف معتبر نیست."); }
}

export async function toggleTaskDone(
  userId: string,
  taskId: string
): Promise<TaskWithCategory | null> {
  const existing = await getUserTaskById(userId, taskId);
  if (!existing) return null;

  const isDone = existing.status === "done";
  const rows = await db
    .update(tasks)
    .set({
      status: isDone ? "todo" : "done",
      completedAt: isDone ? null : new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!rows[0]) return null;
  const result = await attachCategories([rows[0]]);
  await syncTaskNotification(rows[0]);
  return result[0] ?? null;
}

export async function getUserTaskStats(userId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000 - 1);

  const all = await db.select().from(tasks).where(eq(tasks.userId, userId));

  const total = all.length;
  const done = all.filter((t) => t.status === "done").length;
  const todo = all.filter((t) => t.status === "todo" || t.status === "in_progress").length;
  const dueToday = all.filter(
    (t) => t.dueAt && t.dueAt >= startOfToday && t.dueAt <= endOfToday && t.status !== "done"
  ).length;
  const overdue = all.filter(
    (t) => t.dueAt && t.dueAt < now && t.status !== "done" && t.status !== "archived"
  ).length;

  return { total, done, todo, dueToday, overdue };
}
