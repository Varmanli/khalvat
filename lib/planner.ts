import { db } from "@/db";
import { tasks, entries, plannerEvents, dailyPlans, goals, goalMilestones } from "@/db/schema";
import { and, eq, gte, lt, ne, or } from "drizzle-orm";
import {
  comparePriority,
  dayBoundary,
  shiftDay,
  timeInTehran,
  todayKey,
} from "./planner-dates";
import type { EventInput } from "./planner-validation";
import { syncEntityNotification, syncEventNotification } from "./notifications";

export function taskRangeCondition(userId: string, start: string, end: string) {
  return and(
    eq(tasks.userId, userId),
    ne(tasks.status, "archived"),
    or(
      and(gte(tasks.scheduledDate, start), lt(tasks.scheduledDate, end)),
      and(
        gte(tasks.dueAt, dayBoundary(start)),
        lt(tasks.dueAt, dayBoundary(end)),
      ),
    ),
  );
}
export function eventOwnerCondition(userId: string, id: string) {
  return and(eq(plannerEvents.userId, userId), eq(plannerEvents.id, id));
}
export async function getPlannerRange(
  userId: string,
  start: string,
  end: string,
) {
  const [taskRows, eventRows, reminders, eventReminders, milestoneRows] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(taskRangeCondition(userId, start, end)),
    db
      .select()
      .from(plannerEvents)
      .where(
        and(
          eq(plannerEvents.userId, userId),
          gte(plannerEvents.eventDate, start),
          lt(plannerEvents.eventDate, end),
        ),
      ),
    db
      .select({
        id: entries.id,
        title: entries.title,
        reminderAt: entries.reminderAt,
      })
      .from(entries)
      .where(
        and(
          eq(entries.userId, userId),
          ne(entries.status, "archived"),
          ne(entries.status, "done"),
          gte(entries.reminderAt, dayBoundary(start)),
          lt(entries.reminderAt, dayBoundary(end)),
        ),
      ),
    db
      .select()
      .from(plannerEvents)
      .where(
        and(
          eq(plannerEvents.userId, userId),
          gte(plannerEvents.reminderAt, dayBoundary(start)),
          lt(plannerEvents.reminderAt, dayBoundary(end)),
        ),
      ),
    db.select({ id: goalMilestones.id, title: goalMilestones.title, targetDate: goalMilestones.targetDate, status: goalMilestones.status, goalId: goals.id, goalTitle: goals.title, goalStatus: goals.status })
      .from(goalMilestones)
      .innerJoin(goals, eq(goalMilestones.goalId, goals.id))
      .where(and(eq(goalMilestones.userId, userId), gte(goalMilestones.targetDate, start), lt(goalMilestones.targetDate, end), ne(goals.status, "cancelled"), ne(goals.status, "archived"))),
  ]);
  const goalIds = [...new Set(taskRows.map((task) => task.goalId).filter(Boolean))] as string[];
  const goalRows = goalIds.length ? await db.select({ id: goals.id, title: goals.title }).from(goals).where(goalIds.length === 1 ? eq(goals.id, goalIds[0]) : or(...goalIds.map((id) => eq(goals.id, id)))!) : [];
  const goalMap = Object.fromEntries(goalRows.map((goal) => [goal.id, goal]));
  const enrichedTasks = taskRows.map((task) => ({ ...task, goal: task.goalId ? goalMap[task.goalId] ?? null : null }));
  const items: CalendarItem[] = [];
  for (const task of taskRows) {
    if (
      task.scheduledDate &&
      task.scheduledDate >= start &&
      task.scheduledDate < end
    )
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        date: task.scheduledDate,
        time: task.scheduledTime,
        endTime: task.scheduledEndTime,
        kind: "task",
        href: `/tasks/${task.id}/edit`,
        done: task.status === "done",
        goal: task.goalId ? goalMap[task.goalId] ?? null : null,
      });
    if (task.dueAt) {
      const date = todayKey(task.dueAt);
      if (date >= start && date < end)
        items.push({
          id: `deadline-${task.id}`,
          title: task.title,
          date,
          time: timeInTehran(task.dueAt),
          endTime: null,
          kind: "deadline",
          href: `/tasks/${task.id}/edit`,
          done: task.status === "done",
          goal: task.goalId ? goalMap[task.goalId] ?? null : null,
        });
    }
  }
  for (const event of eventRows)
    items.push({
      id: `event-${event.id}`,
      title: event.title,
      date: event.eventDate,
      time: event.allDay ? null : event.startTime,
      endTime: event.allDay ? null : event.endTime,
      kind: "event",
      href: `/events/${event.id}/edit`,
    });
  for (const reminder of reminders)
    if (reminder.reminderAt)
      items.push({
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        date: todayKey(reminder.reminderAt),
        time: timeInTehran(reminder.reminderAt),
        endTime: null,
        kind: "reminder",
        href: `/entries/${reminder.id}/edit`,
      });
  for (const event of eventReminders)
    if (event.reminderAt)
      items.push({
        id: `event-reminder-${event.id}`,
        title: event.title,
        date: todayKey(event.reminderAt),
        time: timeInTehran(event.reminderAt),
        endTime: null,
        kind: "reminder",
        href: `/events/${event.id}/edit`,
        });
  for (const milestone of milestoneRows) if (milestone.targetDate) items.push({
    id: `milestone-${milestone.id}`, title: milestone.title, date: milestone.targetDate, time: null, endTime: null,
    kind: "milestone", href: `/goals/${milestone.goalId}#milestones`, done: milestone.status === "completed", goal: { id: milestone.goalId, title: milestone.goalTitle },
  });
  items.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time ?? "").localeCompare(b.time ?? "") ||
      a.title.localeCompare(b.title),
  );
  return { tasks: enrichedTasks.sort(comparePriority), items };
}
export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  time: string | null;
  endTime: string | null;
  kind: "task" | "event" | "reminder" | "deadline" | "milestone";
  href: string;
  done?: boolean;
  goal?: { id: string; title: string } | null;
}
export async function getDailyPlanner(userId: string, date: string) {
  const [range, [plan]] = await Promise.all([
    getPlannerRange(userId, date, shiftDay(date, 1)),
    db
      .select()
      .from(dailyPlans)
      .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, date)))
      .limit(1),
  ]);
  return { ...range, focus: plan?.focus ?? "", dailyPlan: plan ?? null };
}
export async function saveFocus(userId: string, date: string, focus: string) {
  await db
    .insert(dailyPlans)
    .values({ userId, date, focus })
    .onConflictDoUpdate({
      target: [dailyPlans.userId, dailyPlans.date],
      set: { focus, updatedAt: new Date() },
    });
}
export async function saveDailyJournal(userId: string, input: import("@/lib/validations").DailyJournalInput) {
  const values = { journalContent: input.journalContent, memorableMoment: input.memorableMoment, reflectionGood: input.reflectionGood, reflectionBetter: input.reflectionBetter, reflectionRemember: input.reflectionRemember, updatedAt: new Date() };
  await db.insert(dailyPlans).values({ userId, date: input.date, focus: "", ...values, closedAt: input.close ? new Date() : null }).onConflictDoUpdate({ target: [dailyPlans.userId, dailyPlans.date], set: { ...values, ...(input.close === undefined ? {} : { closedAt: input.close ? new Date() : null }) } });
}
export async function getEvent(userId: string, id: string) {
  const [event] = await db
    .select()
    .from(plannerEvents)
    .where(eventOwnerCondition(userId, id))
    .limit(1);
  if (event) await syncEventNotification(event);
  return event ?? null;
}
export async function saveEvent(
  userId: string,
  input: EventInput,
  id?: string,
) {
  const values = {
    ...input,
    startTime: input.allDay ? null : input.startTime,
    endTime: input.allDay ? null : input.endTime,
    reminderAt: input.reminderAt ? new Date(input.reminderAt) : null,
    updatedAt: new Date(),
  };
  const [event] = id
    ? await db
        .update(plannerEvents)
        .set(values)
        .where(eventOwnerCondition(userId, id))
        .returning()
    : await db
        .insert(plannerEvents)
        .values({ ...values, userId })
        .returning();
  return event ?? null;
}
export async function deleteEvent(userId: string, id: string) {
  await syncEntityNotification("event", userId, id, { title: "", targetUrl: `/events/${id}/edit`, scheduledFor: null });
  const rows = await db
    .delete(plannerEvents)
    .where(eventOwnerCondition(userId, id))
    .returning({ id: plannerEvents.id });
  return rows.length > 0;
}
