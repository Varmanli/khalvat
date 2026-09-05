import {
  getJalaliParts,
  jalaliToGregorianIso,
  daysInJalaliMonth,
  parseGregorianIso,
  toGregorianIso,
} from "./date";

// Date-only planning keys are Gregorian; display and month navigation are Jalali.
// Timestamp boundaries use Tehran explicitly, independent of the server timezone.
export const PLANNER_ZONE = "Asia/Tehran";
export function todayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PLANNER_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function validDateKey(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value >= "1900-01-01" &&
    value <= "2100-12-31" &&
    toGregorianIso(parseGregorianIso(value)) === value
  );
}
export function shiftDay(key: string, days: number): string {
  const date = parseGregorianIso(key);
  date.setDate(date.getDate() + days);
  return toGregorianIso(date);
}
export function dayBoundary(key: string): Date {
  return new Date(`${key}T00:00:00+03:30`);
}
export function timeInTehran(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PLANNER_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
export type CalendarView = "month" | "week" | "day";
export function calendarRange(key: string, view: CalendarView) {
  let start = key;
  let end = shiftDay(key, 1);
  if (view === "week") {
    start = shiftDay(key, -((parseGregorianIso(key).getDay() + 1) % 7));
    end = shiftDay(start, 7);
  } else if (view === "month") {
    const { jy, jm } = getJalaliParts(key);
    const first = jalaliToGregorianIso(jy, jm, 1);
    start = shiftDay(first, -((parseGregorianIso(first).getDay() + 1) % 7));
    const last = jalaliToGregorianIso(jy, jm, daysInJalaliMonth(jy, jm));
    end = shiftDay(last, 7 - ((parseGregorianIso(last).getDay() + 1) % 7));
  }
  return { start, end };
}
export function calendarStep(
  key: string,
  view: CalendarView,
  direction: number,
) {
  if (view !== "month")
    return shiftDay(key, direction * (view === "week" ? 7 : 1));
  const { jy, jm } = getJalaliParts(key);
  const total = jy * 12 + jm - 1 + direction;
  return jalaliToGregorianIso(Math.floor(total / 12), (total % 12) + 1, 1);
}
export function rangeDays(start: string, end: string): string[] {
  const days: string[] = [];
  for (let key = start; key < end; key = shiftDay(key, 1)) days.push(key);
  return days;
}
const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };
export function comparePriority(
  a: { priority: keyof typeof priorityRank; status: string },
  b: { priority: keyof typeof priorityRank; status: string },
) {
  return (
    Number(a.status === "done") - Number(b.status === "done") ||
    priorityRank[a.priority] - priorityRank[b.priority]
  );
}
export function tomorrowSchedule(now = new Date()) {
  return { scheduledDate: shiftDay(todayKey(now), 1) };
}
