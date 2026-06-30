export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPersianDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatPersianDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Returns midnight of a given date (start of day). */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return startOfDay(date).getTime() === startOfDay(now).getTime();
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return startOfDay(date).getTime() === startOfDay(tomorrow).getTime();
}

export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  // End of week = 7 days from start of today
  const endOfWeek = new Date(startOfDay(now));
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return date >= startOfDay(now) && date < endOfWeek;
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
