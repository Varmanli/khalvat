import { toJalaali, toGregorian, jalaaliMonthLength, isLeapJalaaliYear } from "jalaali-js";
export { toPersianDigits, toEnglishDigits, formatPersianNumber, formatPersianNumberWithSeparator } from "./persian-numbers";
import { toPersianDigits } from "./persian-numbers";

const JALALI_MONTHS = [
  "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور",
  "مهر","آبان","آذر","دی","بهمن","اسفند",
];

export function jalaliMonthName(jm: number): string {
  return JALALI_MONTHS[jm - 1] ?? "";
}

// ── Core conversion via jalaali-js (battle-tested) ───────────────

export type JalaliParts = { jy: number; jm: number; jd: number };

/** Gregorian year/month/day → Jalali parts. Month is 1-based. */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const { jy, jm, jd } = toJalaali(gy, gm, gd);
  return [jy, jm, jd];
}

/** Jalali year/month/day → Gregorian year/month/day. All 1-based. */
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return [gy, gm, gd];
}

// ── ISO date helpers ──────────────────────────────────────────────

/** Returns today's date as a local Gregorian ISO string YYYY-MM-DD (no UTC shift). */
export function toGregorianIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a YYYY-MM-DD string as a local Date (no timezone shift). */
export function parseGregorianIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns Jalali parts for a Gregorian ISO string or local Date. */
export function getJalaliParts(dateOrIso: Date | string): JalaliParts {
  if (typeof dateOrIso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateOrIso)) {
    const [gy, gm, gd] = dateOrIso.split("-").map(Number);
    const { jy, jm, jd } = toJalaali(gy, gm, gd);
    return { jy, jm, jd };
  }
  const d = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  const { jy, jm, jd } = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return { jy, jm, jd };
}

/** Converts Jalali date to Gregorian ISO string YYYY-MM-DD. */
export function jalaliToGregorianIso(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export function getJalaliDateKey(date: Date): string {
  const { jy, jm, jd } = getJalaliParts(date);
  return `${jy}-${String(jm).padStart(2, "0")}-${String(jd).padStart(2, "0")}`;
}

export function jalaliDateKeyToGregorianIso(dateKey: string): string {
  const [jy, jm, jd] = dateKey.split("-").map(Number);
  return jalaliToGregorianIso(jy, jm, jd);
}

export function shiftJalaliDateKey(dateKey: string, days: number): string {
  const gregorianIso = jalaliDateKeyToGregorianIso(dateKey);
  const date = parseGregorianIso(gregorianIso);
  date.setDate(date.getDate() + days);
  return getJalaliDateKey(date);
}

// ── Jalali month utilities ────────────────────────────────────────

export function isJalaliLeap(jy: number): boolean {
  return isLeapJalaaliYear(jy);
}

export function daysInJalaliMonth(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

/**
 * Returns 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
 * (Persian week starting Saturday)
 */
export function firstWeekdayOfJalaliMonth(jy: number, jm: number): number {
  const { gy, gm, gd } = toGregorian(jy, jm, 1);
  const jsDay = new Date(gy, gm - 1, gd).getDay(); // 0=Sun … 6=Sat
  return (jsDay + 1) % 7;
}

export type CalendarCell = {
  jalaliDay: number;
  gregorianIso: string;
};

/**
 * Returns an ordered array of calendar cells for the given Jalali month.
 * Each cell has the Jalali day number and its Gregorian ISO equivalent.
 */
export function getJalaliMonthGrid(jy: number, jm: number): CalendarCell[] {
  const count = daysInJalaliMonth(jy, jm);
  const cells: CalendarCell[] = [];
  for (let jd = 1; jd <= count; jd++) {
    cells.push({ jalaliDay: jd, gregorianIso: jalaliToGregorianIso(jy, jm, jd) });
  }
  return cells;
}

// ── Display helpers ───────────────────────────────────────────────

/** "تیر ۱۴۰۵" */
export function formatJalaliMonthTitle(jy: number, jm: number): string {
  return `${jalaliMonthName(jm)} ${toPersianDigits(jy)}`;
}

/** "۸ تیر ۱۴۰۵" */
export function formatJalaliDay(dateOrIso: Date | string): string {
  const { jy, jm, jd } = getJalaliParts(dateOrIso);
  return `${toPersianDigits(jd)} ${jalaliMonthName(jm)} ${toPersianDigits(jy)}`;
}

export function parseDateValue(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function formatJalaliDate(value: string | Date): string {
  const { jy, jm, jd } = getJalaliParts(
    typeof value === "string" ? value : toGregorianIso(value)
  );
  return toPersianDigits(
    `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`
  );
}

export function formatJalaliDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  const datePart = formatJalaliDate(d);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${datePart}  ${toPersianDigits(`${h}:${m}`)}`;
}

export function toISODateTime(date: Date): string {
  return date.toISOString();
}

// ── Time/reminder helpers (unchanged) ────────────────────────────

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
    groups[getReminderGroup(entry.reminderAt)].push(entry);
  }
  return groups;
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

export function formatReminderLabel(date: Date): string {
  if (isToday(date)) return `امروز ساعت ${formatPersianTime(date)}`;
  if (isTomorrow(date)) return `فردا ساعت ${formatPersianTime(date)}`;
  return formatPersianDateTime(date);
}
