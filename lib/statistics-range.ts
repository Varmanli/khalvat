import { getJalaliParts, jalaliToGregorianIso } from "@/lib/date";
import { parseDateString } from "@/lib/habit-utils";
import { rangeDays, shiftDay, todayKey } from "@/lib/planner-dates";

export const statsRangeValues = ["week", "month", "3m", "6m", "year", "all"] as const;
export type StatsRangeValue = (typeof statsRangeValues)[number];
export type StatsRange = { key: StatsRangeValue; start: string; end: string; previous?: { start: string; end: string }; granularity: "day" | "week" | "month" };

/** Resolves analytics boundaries as canonical Gregorian date keys in Asia/Tehran. */
export function resolveStatsRange(value?: string | null, now = new Date()): StatsRange {
  const key = statsRangeValues.includes(value as StatsRangeValue) ? value as StatsRangeValue : "month";
  const end = shiftDay(todayKey(now), 1);
  const today = todayKey(now); const jalali = getJalaliParts(today);
  const jalaliMonthStart = (monthsBack: number) => { const index = jalali.jy * 12 + jalali.jm - 1 - monthsBack; return jalaliToGregorianIso(Math.floor(index / 12), (index % 12) + 1, 1); };
  const start = key === "week" ? shiftDay(today, -((parseDateString(today).getDay() + 1) % 7)) : key === "month" ? jalaliMonthStart(0) : key === "3m" ? jalaliMonthStart(2) : key === "6m" ? jalaliMonthStart(5) : key === "year" ? jalaliToGregorianIso(jalali.jy, 1, 1) : "2000-01-01";
  const granularity = key === "week" || key === "month" ? "day" : key === "year" || key === "all" ? "month" : "week";
  return { key, start, end, granularity, previous: key === "all" ? undefined : { start: shiftDay(start, -rangeDays(start, end).length), end: start } };
}
