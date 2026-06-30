// Pure, client-safe habit utilities (no DB imports)
import type { Habit } from "@/db/schema";

// Persian week: 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
// JS getDay():  0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const JS_TO_PERSIAN_DAY = [1, 2, 3, 4, 5, 6, 0] as const;

function getPersianWeekday(date: Date): number {
  return JS_TO_PERSIAN_DAY[date.getDay()];
}

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  if (!habit.isActive || habit.archivedAt) return false;

  const dateStr = toDateString(date);
  if (dateStr < habit.startDate) return false;
  if (habit.endDate && dateStr > habit.endDate) return false;

  if (habit.repeatType === "daily") return true;

  const weekday = getPersianWeekday(date);
  return Array.isArray(habit.weeklyDays) && habit.weeklyDays.includes(weekday);
}
