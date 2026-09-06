export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const APP_TIME_ZONE = "Asia/Tehran";

function tehranDateKey(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function formatPersianDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatPersianDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatPersianTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function isToday(date: Date): boolean {
  return tehranDateKey(date) === tehranDateKey(new Date());
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date(`${tehranDateKey(new Date())}T12:00:00+03:30`);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tehranDateKey(date) === tehranDateKey(tomorrow);
}

export function isThisWeek(date: Date): boolean {
  const start = new Date(`${tehranDateKey(new Date())}T00:00:00+03:30`);
  const endOfWeek = new Date(start);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return date >= start && date < endOfWeek;
}

export function isPast(date: Date): boolean {
  return date < new Date();
}

export type ReminderGroup = "today" | "tomorrow" | "this_week" | "later" | "past";

export function getReminderGroup(date: Date): ReminderGroup {
  if (isToday(date)) return "today";
  if (isPast(date)) return "past";
  if (isTomorrow(date)) return "tomorrow";
  if (isThisWeek(date)) return "this_week";
  return "later";
}

export const REMINDER_GROUP_LABELS: Record<ReminderGroup, string> = {
  today: "امروز",
  tomorrow: "فردا",
  this_week: "این هفته",
  later: "بعداً",
  past: "گذشته",
};

export const REMINDER_GROUP_ORDER: ReminderGroup[] = [
  "today",
  "tomorrow",
  "this_week",
  "later",
  "past",
];

export interface ReminderEntry {
  id: string;
  title: string;
  reminderAt: Date;
  type: string;
}

export function groupReminders<T extends { reminderAt: Date | null }>(
  entries: T[]
): Record<ReminderGroup, T[]> {
  const groups: Record<ReminderGroup, T[]> = {
    today: [],
    tomorrow: [],
    this_week: [],
    later: [],
    past: [],
  };

  for (const entry of entries) {
    if (!entry.reminderAt) continue;
    const group = getReminderGroup(entry.reminderAt);
    groups[group].push(entry);
  }

  return groups;
}

/** Short human label for a reminder date. */
export function formatReminderLabel(date: Date): string {
  if (isToday(date)) {
    return `امروز ساعت ${formatPersianTime(date)}`;
  }
  if (isTomorrow(date)) {
    return `فردا ساعت ${formatPersianTime(date)}`;
  }
  return formatPersianDateTime(date);
}
