"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { isHabitScheduledForDate } from "@/lib/habit-utils";
import { formatPersianNumber } from "@/lib/persian-numbers";
import type { Habit, HabitLog } from "@/db/schema";

// Persian weekday headers (Sat-first)
const DAY_HEADERS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// JS getDay() => Persian weekday index (0=Sat)
const JS_TO_PERSIAN = [1, 2, 3, 4, 5, 6, 0];

function getPersianWeekday(date: Date) {
  return JS_TO_PERSIAN[date.getDay()];
}

type DayStatus = "done" | "skipped" | "missed" | "scheduled" | "no-schedule" | "future";

interface HabitCalendarProps {
  habit: Habit;
  initialLogs: HabitLog[];
  year: number;
  month: number;
}

export function HabitCalendar({ habit, initialLogs, year: initialYear, month: initialMonth }: HabitCalendarProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const logMap: Record<string, HabitLog> = {};
  for (const log of logs) {
    logMap[log.date] = log;
  }

  // Build month grid
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = getPersianWeekday(firstDay);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  function getDateStr(day: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getDayStatus(day: number): DayStatus {
    const dateStr = getDateStr(day);
    const date = new Date(dateStr);

    if (dateStr > todayStr) return "future";

    const scheduled = isHabitScheduledForDate(habit, date);
    if (!scheduled) return "no-schedule";

    const log = logMap[dateStr];
    if (!log) return "missed";
    return log.status as "done" | "skipped";
  }

  async function navigate(dir: -1 | 1) {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }

    setLoading(true);
    const res = await fetch(`/api/habits/${habit.id}?year=${newYear}&month=${newMonth}`);
    // Fetch logs for new month
    const logsRes = await fetch(`/api/habits/${habit.id}/log?year=${newYear}&month=${newMonth}`);
    const logsJson = await logsRes.json().catch(() => ({ ok: false }));
    setLoading(false);

    setYear(newYear);
    setMonth(newMonth);
    if (logsJson.ok) setLogs(logsJson.data);
  }

  const monthName = new Date(year, month - 1, 1).toLocaleString("fa-IR", { month: "long", year: "numeric" });

  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="flex size-8 items-center justify-center rounded-xl border border-border text-muted hover:border-primary-soft hover:text-primary disabled:opacity-50"
        >
          <ChevronRight className="size-4" />
        </button>
        <p className="text-sm font-black text-foreground">{monthName}</p>
        <button
          type="button"
          onClick={() => navigate(1)}
          disabled={loading || (year === today.getFullYear() && month >= today.getMonth() + 1)}
          className="flex size-8 items-center justify-center rounded-xl border border-border text-muted hover:border-primary-soft hover:text-primary disabled:opacity-50"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {DAY_HEADERS.map((h) => (
          <p key={h} className="text-[10px] font-bold text-muted">{h}</p>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const status = getDayStatus(day);
          const dateStr = getDateStr(day);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={day}
              title={`${formatPersianNumber(day)} — ${STATUS_LABELS[status]}`}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl text-[11px] font-bold transition-all",
                isToday && "ring-2 ring-primary",
                STATUS_STYLES[status]
              )}
            >
              {formatPersianNumber(day)}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-muted">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1">
            <span className={cn("inline-block size-3 rounded-sm", STATUS_DOT[key as DayStatus])} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<DayStatus, string> = {
  done: "bg-success/20 text-success",
  skipped: "bg-card-soft text-muted",
  missed: "bg-danger/12 text-danger",
  scheduled: "bg-primary-soft/30 text-primary",
  "no-schedule": "bg-transparent text-muted/50",
  future: "text-muted/40",
};

const STATUS_DOT: Record<DayStatus, string> = {
  done: "bg-success/50",
  skipped: "bg-card-soft",
  missed: "bg-danger/30",
  scheduled: "bg-primary-soft",
  "no-schedule": "bg-muted/20",
  future: "bg-muted/10",
};

const STATUS_LABELS: Record<DayStatus, string> = {
  done: "انجام شد",
  skipped: "رد شد",
  missed: "جا افتاد",
  scheduled: "برنامه‌ریزی‌شده",
  "no-schedule": "برنامه‌ای نبود",
  future: "آینده",
};
