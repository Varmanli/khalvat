import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { goalActivities, goalMilestones, goalReviews, goals, habitLogs, habits, tasks, type Goal } from "@/db/schema";
import type { GoalInput } from "@/lib/validations";
import { calculateGoalProgress, expectedProgress, goalHealth } from "@/lib/goal-progress";

export type GoalWithSummary = Goal & { milestones: number; completedMilestones: number; linkedTasks: number; completedTasks: number; calculatedProgress: number; expectedProgress: number | null; health: ReturnType<typeof goalHealth> };

async function log(userId: string, goalId: string, type: string, detail?: string) { await db.insert(goalActivities).values({ userId, goalId, type, detail: detail ?? null }); }
export async function getUserGoals(userId: string): Promise<GoalWithSummary[]> {
  const rows = await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(asc(goals.targetDate), desc(goals.createdAt));
  return Promise.all(rows.map((goal) => summarize(userId, goal)));
}
async function summarize(userId: string, goal: Goal): Promise<GoalWithSummary> {
  const [milestones, linkedTasks, linkedHabits] = await Promise.all([
    db.select().from(goalMilestones).where(and(eq(goalMilestones.goalId, goal.id), eq(goalMilestones.userId, userId))),
    db.select().from(tasks).where(and(eq(tasks.goalId, goal.id), eq(tasks.userId, userId))),
    db.select().from(habits).where(and(eq(habits.goalId, goal.id), eq(habits.userId, userId))),
  ]);
  let completed = 0, total = 0;
  if (goal.progressMethod === "milestones") { total = milestones.length; completed = milestones.filter(m => m.status === "completed").length; }
  if (goal.progressMethod === "tasks") { total = linkedTasks.length; completed = linkedTasks.filter(t => t.status === "done").length; }
  if (goal.progressMethod === "habits") { total = linkedHabits.length; completed = 0; if (linkedHabits.length) { const logs = await db.select().from(habitLogs).where(and(eq(habitLogs.userId, userId), inArray(habitLogs.habitId, linkedHabits.map(h => h.id)))); completed = logs.filter(l => l.status === "done").length; total = Math.max(total, completed || total); } }
  const calculatedProgress = calculateGoalProgress({ method: goal.progressMethod, manual: goal.progress, completed, total, current: goal.currentValue, target: goal.targetValue });
  const expected = expectedProgress(goal.startDate, goal.targetDate);
  return { ...goal, milestones: milestones.length, completedMilestones: milestones.filter(m => m.status === "completed").length, linkedTasks: linkedTasks.length, completedTasks: linkedTasks.filter(t => t.status === "done").length, calculatedProgress, expectedProgress: expected, health: goalHealth(calculatedProgress, expected, goal.status === "completed") };
}
export async function getUserGoalById(userId: string, id: string) {
  const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).limit(1); if (!goal) return null;
  const [summary, milestones, linkedTasks, linkedHabits, reviews, activities] = await Promise.all([summarize(userId, goal), db.select().from(goalMilestones).where(and(eq(goalMilestones.goalId, id), eq(goalMilestones.userId, userId))).orderBy(asc(goalMilestones.order)), db.select().from(tasks).where(and(eq(tasks.goalId, id), eq(tasks.userId, userId))).orderBy(desc(tasks.createdAt)), db.select().from(habits).where(and(eq(habits.goalId, id), eq(habits.userId, userId))), db.select().from(goalReviews).where(and(eq(goalReviews.goalId, id), eq(goalReviews.userId, userId))).orderBy(desc(goalReviews.createdAt)), db.select().from(goalActivities).where(and(eq(goalActivities.goalId, id), eq(goalActivities.userId, userId))).orderBy(desc(goalActivities.createdAt))]);
  const habitLogsForGoal = linkedHabits.length ? await db.select().from(habitLogs).where(and(eq(habitLogs.userId, userId), inArray(habitLogs.habitId, linkedHabits.map((habit) => habit.id)))) : [];
  return { ...summary, milestones, linkedTasks, linkedHabits, habitLogs: habitLogsForGoal, reviews, activities };
}
export async function createGoal(userId: string, data: GoalInput) { const [goal] = await db.insert(goals).values({ ...data, userId, description: data.description ?? null, motivation: data.motivation ?? null, targetValue: data.targetValue ?? null, currentValue: data.currentValue ?? null, unit: data.unit ?? null, startDate: data.startDate ?? null, targetDate: data.targetDate ?? null, scheduleType: data.scheduleType ?? null, weeklyDays: data.weeklyDays ?? [], sessionsPerWeek: null, customDaysPerMonth: data.customDaysPerMonth ?? null }).returning(); await log(userId, goal.id, "created", "هدف ساخته شد"); return goal; }
export async function updateGoal(userId: string, id: string, data: Partial<GoalInput>) { const old = await getUserGoalById(userId, id); if (!old) return null; const status = data.status ?? old.status; const [goal] = await db.update(goals).set({ ...data, completedAt: status === "completed" ? (old.completedAt ?? new Date()) : null, archivedAt: status === "archived" ? (old.archivedAt ?? new Date()) : null, updatedAt: new Date() }).where(and(eq(goals.id, id), eq(goals.userId, userId))).returning(); if (data.status && data.status !== old.status) await log(userId, id, data.status, `وضعیت به ${data.status} تغییر کرد`); if (data.progress !== undefined || data.currentValue !== undefined) await log(userId, id, "progress_updated", "پیشرفت به‌روزرسانی شد"); return goal; }
export async function addMilestone(userId: string, goalId: string, data: { title: string; description?: string | null; targetDate?: string | null; order?: number; status?: "pending" | "completed" }) { const goal = await getUserGoalById(userId, goalId); if (!goal) return null; const [milestone] = await db.insert(goalMilestones).values({ userId, goalId, title: data.title, description: data.description ?? null, targetDate: data.targetDate ?? null, order: data.order ?? goal.milestones.length, status: data.status ?? "pending", completedAt: data.status === "completed" ? new Date() : null }).returning(); await log(userId, goalId, "milestone_added", milestone.title); return milestone; }
export async function toggleMilestone(userId: string, goalId: string, milestoneId: string) { const [item] = await db.select().from(goalMilestones).where(and(eq(goalMilestones.id, milestoneId), eq(goalMilestones.goalId, goalId), eq(goalMilestones.userId, userId))).limit(1); if (!item) return null; const completed = item.status !== "completed"; const [updated] = await db.update(goalMilestones).set({ status: completed ? "completed" : "pending", completedAt: completed ? new Date() : null, updatedAt: new Date() }).where(eq(goalMilestones.id, milestoneId)).returning(); await log(userId, goalId, completed ? "milestone_completed" : "milestone_reopened", item.title); return updated; }
export async function addReview(userId: string, goalId: string, data: { progressNote?: string | null; worked?: string | null; blocked?: string | null; nextStep?: string | null }) { const goal = await getUserGoalById(userId, goalId); if (!goal) return null; const [review] = await db.insert(goalReviews).values({ userId, goalId, ...data }).returning(); await log(userId, goalId, "review_added", "یک بازبینی ثبت شد"); return review; }
