import webpush from "web-push";
import { and, desc, eq, gt, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyCheckIns, gratitudeEntries, habitLogs, notificationDeliveries, notificationPreferences, notificationSchedules, notificationSubscriptions, plannerEvents, tasks, userPreferences, users } from "@/db/schema";

export type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } };
const vapidReady = () => Boolean(process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
function configurePush() { if (vapidReady()) webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!); }

export function localDateTimeToUtc(date: string, time: string, timezone: string) {
  // Iteration makes the offset correct on the DST boundary without hard-coding a country.
  let stamp = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(stamp)) throw new Error("Invalid local notification time");
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(stamp));
    const value = (type: string) => parts.find(p => p.type === type)?.value ?? "00";
    const observed = Date.parse(`${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}:00Z`);
    stamp += Date.parse(`${date}T${time}:00:00Z`) - observed;
  }
  return new Date(stamp);
}
export function localDateInTimezone(at: Date, timezone: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at); }

export async function getNotificationPreferences(userId: string): Promise<typeof notificationPreferences.$inferSelect | null> {
  const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  return prefs ?? null;
}
export async function savePushSubscription(userId: string, subscription: PushSubscriptionInput, userAgent?: string) {
  await db.insert(notificationSubscriptions).values({ userId, endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, userAgent, active: true }).onConflictDoUpdate({ target: notificationSubscriptions.endpoint, set: { userId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, userAgent, active: true, lastUsedAt: new Date() } });
}
export async function updatePreferences(userId: string, data: Partial<typeof notificationPreferences.$inferInsert>) {
  await db.insert(notificationPreferences).values({ userId, ...data }).onConflictDoUpdate({ target: notificationPreferences.userId, set: { ...data, updatedAt: new Date() } });
  await ensureDailySchedules(userId);
}

function isNotificationKindEnabled(
  prefs: Awaited<ReturnType<typeof getNotificationPreferences>>,
  kind: "mood" | "gratitude" | "habit" | "task" | "event" | "manual",
) {
  if (prefs?.enabled === false) return false;
  const setting = {
    mood: prefs?.moodEnabled,
    gratitude: prefs?.gratitudeEnabled,
    habit: prefs?.habitsEnabled,
    task: prefs?.tasksEnabled,
    event: prefs?.eventsEnabled,
    manual: prefs?.manualEnabled,
  }[kind];
  return setting !== false;
}

export async function ensureDailySchedules(userId: string) {
  const [prefs, userPrefs] = await Promise.all([getNotificationPreferences(userId), db.select({ timezone: userPreferences.timezone }).from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1)]);
  const timezone = userPrefs[0]?.timezone ?? "Asia/Tehran";
  const now = new Date(); const date = localDateInTimezone(now, timezone);
  const specs = [
    ["mood", isNotificationKindEnabled(prefs, "mood"), prefs?.moodTime ?? "21:00", "حال امروزت چطوره؟", "چند ثانیه برای حال‌نگار وقت بذار.", "/check-ins"],
    ["gratitude", isNotificationKindEnabled(prefs, "gratitude"), prefs?.gratitudeTime ?? "22:00", "یه لحظه برای شکرگزاری", "امروز چه چیز کوچیکی حالت رو بهتر کرد؟", "/gratitude"],
  ] as const;
  for (const [kind, enabled, time, title, body, targetUrl] of specs) {
    const when = localDateTimeToUtc(date, time, timezone); if (when <= now) when.setUTCDate(when.getUTCDate() + 1);
    await db.delete(notificationSchedules).where(and(eq(notificationSchedules.userId, userId), eq(notificationSchedules.kind, kind), eq(notificationSchedules.recurrence, "daily")));
    if (enabled) await db.insert(notificationSchedules).values({ userId, kind, title, body, targetUrl, scheduledFor: when, recurrence: "daily" });
  }
}

export async function syncEntityNotification(kind: "task" | "event" | "habit" | "manual", userId: string, entityId: string, detail: { title: string; body?: string; targetUrl: string; scheduledFor: Date | null; recurrence?: string }) {
  const condition = and(eq(notificationSchedules.userId, userId), eq(notificationSchedules.entityId, entityId), eq(notificationSchedules.kind, kind));
  const [existing] = await db.select({ id: notificationSchedules.id }).from(notificationSchedules).where(condition).limit(1);
  const prefs = detail.scheduledFor ? await getNotificationPreferences(userId) : null;
  const scheduledFor = detail.scheduledFor && isNotificationKindEnabled(prefs, kind) ? detail.scheduledFor : null;
  if (!scheduledFor) {
    if (existing) await db.update(notificationSchedules).set({ enabled: false, cancelledAt: new Date(), updatedAt: new Date() }).where(eq(notificationSchedules.id, existing.id));
    return;
  }
  if (Number.isNaN(scheduledFor.getTime())) throw new Error("Notification schedule received an invalid timestamp");
  const values = { title: detail.title, body: detail.body ?? detail.title, targetUrl: detail.targetUrl, scheduledFor, recurrence: detail.recurrence ?? "once", enabled: true, cancelledAt: null, updatedAt: new Date() };
  if (existing) {
    await db.update(notificationSchedules).set(values).where(eq(notificationSchedules.id, existing.id));
  } else {
    await db.insert(notificationSchedules).values({ userId, entityId, kind, ...values });
  }
}

export async function syncTaskNotification(task: typeof tasks.$inferSelect) {
  const prefs = await getNotificationPreferences(task.userId); if (prefs?.tasksEnabled === false || prefs?.enabled === false || task.status === "done" || task.status === "archived" || !task.scheduledDate || !task.scheduledTime) return syncEntityNotification("task", task.userId, task.id, { title: task.title, targetUrl: `/tasks/${task.id}`, scheduledFor: null });
  const [row] = await db.select({ timezone: userPreferences.timezone }).from(userPreferences).where(eq(userPreferences.userId, task.userId));
  let when: Date; try { when = localDateTimeToUtc(task.scheduledDate, task.scheduledTime, row?.timezone ?? "Asia/Tehran"); } catch { return; } when.setMinutes(when.getMinutes() - (prefs?.taskOffsetMinutes ?? 30));
  return syncEntityNotification("task", task.userId, task.id, { title: `زمان وظیفه‌ات نزدیک است`, body: task.title, targetUrl: `/tasks/${task.id}`, scheduledFor: when });
}
export async function syncEventNotification(event: typeof plannerEvents.$inferSelect) {
  const prefs = await getNotificationPreferences(event.userId); if (prefs?.eventsEnabled === false || prefs?.enabled === false || event.allDay || !event.startTime) return syncEntityNotification("event", event.userId, event.id, { title: event.title, targetUrl: `/events/${event.id}/edit`, scheduledFor: null });
  const [row] = await db.select({ timezone: userPreferences.timezone }).from(userPreferences).where(eq(userPreferences.userId, event.userId)); let when: Date; try { when = localDateTimeToUtc(event.eventDate, event.startTime, row?.timezone ?? "Asia/Tehran"); } catch { return; } when.setMinutes(when.getMinutes() - (prefs?.eventOffsetMinutes ?? 15));
  return syncEntityNotification("event", event.userId, event.id, { title: "رویدادت نزدیک است", body: event.title, targetUrl: `/events/${event.id}/edit`, scheduledFor: when });
}

export async function processDueNotifications(now = new Date()) {
  configurePush(); const due = await db.select().from(notificationSchedules).where(and(eq(notificationSchedules.enabled, true), isNull(notificationSchedules.cancelledAt), lte(notificationSchedules.scheduledFor, now))).limit(100);
  let processed = 0;
  for (const schedule of due) {
    const occurrenceKey = `${schedule.id}:${schedule.scheduledFor.toISOString()}`;
    const claimed = await db.insert(notificationDeliveries).values({ scheduleId: schedule.id, userId: schedule.userId, occurrenceKey, title: schedule.title, body: schedule.kind === "manual" ? "" : schedule.body, targetUrl: schedule.targetUrl, status: "processing", attempts: 1 }).onConflictDoNothing().returning();
    if (!claimed[0]) continue; processed++;
    const prefs = await getNotificationPreferences(schedule.userId);
    const deliveryAllowed = isNotificationKindEnabled(prefs, schedule.kind);
    let status: "sent" | "failed" | "skipped" = deliveryAllowed ? "sent" : "skipped", reason: string | null = deliveryAllowed ? null : "disabled in notification preferences";
    const subscriptions = await db.select().from(notificationSubscriptions).where(and(eq(notificationSubscriptions.userId, schedule.userId), eq(notificationSubscriptions.active, true)));
    if (deliveryAllowed && !vapidReady()) { status = "failed"; reason = "VAPID configuration missing"; }
    for (const sub of deliveryAllowed && vapidReady() ? subscriptions : []) try { if (vapidReady()) await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify({ title: schedule.title, body: schedule.kind === "manual" ? "" : schedule.body, icon: "/icon.png", badge: "/icon.png", targetUrl: schedule.targetUrl, tag: occurrenceKey })); } catch (error) { const code = (error as { statusCode?: number }).statusCode; if (code === 404 || code === 410) await db.update(notificationSubscriptions).set({ active: false }).where(eq(notificationSubscriptions.id, sub.id)); else { status = "failed"; reason = "push delivery failed"; } }
    await db.update(notificationDeliveries).set({ status, sentAt: status === "sent" ? new Date() : null, failureReason: reason }).where(eq(notificationDeliveries.id, claimed[0].id));
    if (schedule.recurrence === "daily") { const next = new Date(schedule.scheduledFor); next.setUTCDate(next.getUTCDate() + 1); await db.update(notificationSchedules).set({ scheduledFor: next, updatedAt: new Date() }).where(eq(notificationSchedules.id, schedule.id)); } else await db.update(notificationSchedules).set({ enabled: false, updatedAt: new Date() }).where(eq(notificationSchedules.id, schedule.id));
  } return { processed };
}
export async function getInbox(userId: string) { return db.select().from(notificationDeliveries).where(eq(notificationDeliveries.userId, userId)).orderBy(desc(notificationDeliveries.createdAt)).limit(30); }
export async function markRead(userId: string, id?: string) { await db.update(notificationDeliveries).set({ readAt: new Date() }).where(id ? and(eq(notificationDeliveries.userId, userId), eq(notificationDeliveries.id, id)) : and(eq(notificationDeliveries.userId, userId), isNull(notificationDeliveries.readAt))); }
