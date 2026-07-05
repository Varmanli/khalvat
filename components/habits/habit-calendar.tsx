"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Minus,
  Plus,
  Sprout,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { HabitLogForm } from "@/components/habits/habit-log-form";
import {
  firstWeekdayOfJalaliMonth,
  formatJalaliDay,
  formatJalaliMonthTitle,
  getJalaliMonthGrid,
  toPersianDigits,
} from "@/lib/date";
import {
  canLogHabitOnDate,
  getTodayDateString,
  isHabitScheduledForDate,
  parseDateString,
} from "@/lib/habit-utils";
import type { Habit, HabitLog } from "@/db/schema";
import { cn } from "@/lib/utils";

const DAY_HEADERS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

type DayStatus =
  | "completed"
  | "growth"
  | "proud"
  | "loggable"
  | "planned"
  | "missed"
  | "not-planned"
  | "future";

interface HabitCalendarProps {
  habit: Habit;
  initialLogs: HabitLog[];
  year: number;
  month: number;
}

type CalendarFormHabit = Habit & {
  category: null;
  todayLog: HabitLog | null;
};

type CalendarCellState = {
  day: number;
  dateIso: string;
  status: DayStatus;
  isSelected: boolean;
  isToday: boolean;
  isLoggable: boolean;
  existingLog: HabitLog | null;
};

export function HabitCalendar({
  habit,
  initialLogs,
  year: initialYear,
  month: initialMonth,
}: HabitCalendarProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayIso = getTodayDateString();

  const logMap: Record<string, HabitLog> = {};
  for (const log of logs) {
    logMap[log.date] = log;
  }

  const monthCells = getJalaliMonthGrid(year, month);
  const firstDayOffset = firstWeekdayOfJalaliMonth(year, month);

  const calendarCells: CalendarCellState[] = monthCells.map(({ jalaliDay, gregorianIso }) => {
    const existingLog = logMap[gregorianIso] ?? null;
    const isToday = gregorianIso === todayIso;
    const isFuture = gregorianIso > todayIso;
    const isScheduled = isHabitScheduledForDate(habit, parseDateString(gregorianIso));
    const isLoggable = isScheduled && canLogHabitOnDate(gregorianIso, todayIso);

    let status: DayStatus;
    if (existingLog?.status === "done") {
      status =
        habit.dailyGoal != null &&
        existingLog.value != null &&
        existingLog.value < habit.dailyGoal
          ? "growth"
          : "completed";
    } else if (existingLog?.status === "skipped") {
      status = "proud";
    } else if (isFuture) {
      status = isScheduled ? "planned" : "future";
    } else if (isScheduled && isLoggable) {
      status = "loggable";
    } else if (isScheduled) {
      status = "missed";
    } else if (!isScheduled) {
      status = "not-planned";
    } else {
      status = "future";
    }

    return {
      day: jalaliDay,
      dateIso: gregorianIso,
      status,
      isSelected: selectedDate === gregorianIso,
      isToday,
      isLoggable,
      existingLog,
    };
  });

  const selectedCell =
    selectedDate == null
      ? null
      : calendarCells.find((cell) => cell.dateIso === selectedDate) ?? null;

  async function reloadLogs(nextYear = year, nextMonth = month) {
    const logsRes = await fetch(`/api/habits/${habit.id}/log?year=${nextYear}&month=${nextMonth}`);
    const logsJson = await logsRes.json().catch(() => ({ ok: false }));
    if (logsJson.ok) {
      setLogs(logsJson.data);
    }
  }

  async function navigate(dir: -1 | 1) {
    const total = year * 12 + (month - 1) + dir;
    const newYear = Math.floor(total / 12);
    const newMonth = (total % 12) + 1;

    setLoading(true);
    await reloadLogs(newYear, newMonth);
    setLoading(false);

    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
  }

  function handleDayClick(cell: CalendarCellState) {
    if (!cell.isLoggable) {
      toast.error("ثبت عادت فقط برای امروز، دیروز و دو روز قبل ممکن است.");
      return;
    }

    setSelectedDate((current) => (current === cell.dateIso ? null : cell.dateIso));
  }

  const canGoNext = (() => {
    const todayWindowStart = todayIso;
    const lastVisibleDate = monthCells[monthCells.length - 1]?.gregorianIso ?? todayWindowStart;
    return lastVisibleDate < todayWindowStart;
  })();

  const formHabit: CalendarFormHabit = {
    ...habit,
    category: null,
    todayLog: selectedCell?.existingLog ?? null,
  };

  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(1)}
          disabled={loading || !canGoNext}
          className="flex size-8 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary-soft hover:text-primary disabled:opacity-50"
          aria-label="ماه بعد"
        >
          <ChevronRight className="size-4" />
        </button>

        <p className="text-sm font-black text-foreground">
          {formatJalaliMonthTitle(year, month)}
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="flex size-8 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary-soft hover:text-primary disabled:opacity-50"
          aria-label="ماه قبل"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {DAY_HEADERS.map((header) => (
          <p key={header} className="text-[10px] font-bold text-muted">
            {header}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {calendarCells.map((cell) => (
          <button
            key={cell.dateIso}
            type="button"
            title={`${toPersianDigits(cell.day)} — ${STATUS_LABELS[cell.status]}`}
            onClick={() => handleDayClick(cell)}
            aria-pressed={cell.isSelected}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-xl border text-[11px] font-bold transition-all duration-150",
              cell.isLoggable
                ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(94,58,47,0.12)]"
                : "cursor-not-allowed",
              cell.isSelected ? SELECTED_DAY_STYLE : STATUS_STYLES[cell.status],
            )}
          >
            <span className="absolute left-1 top-1">
              <StatusMarker status={cell.status} selected={cell.isSelected} />
            </span>
            <span>{toPersianDigits(cell.day)}</span>
            {cell.isToday ? (
              <span
                className={cn(
                  "absolute bottom-1 right-1 size-1.5 rounded-full",
                  cell.isSelected ? "bg-[#8F5B46]" : "bg-current",
                )}
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-muted sm:grid-cols-3">
        {(
          [
            "completed",
            "growth",
            "proud",
            "loggable",
            "planned",
            "missed",
            "not-planned",
            "future",
          ] as DayStatus[]
        ).map((key) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn("inline-flex size-3.5 items-center justify-center rounded-sm border", STATUS_DOT[key])}>
              <StatusMarker status={key} />
            </span>
            {STATUS_LABELS[key]}
          </span>
        ))}
      </div>

      {selectedCell?.isLoggable ? (
        <div className="mt-4 rounded-[1.4rem] border border-border bg-background/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-foreground">
                ثبت برای {formatJalaliDay(selectedCell.dateIso)}
              </p>
              <p className="mt-1 text-xs text-muted">
                فقط امروز، دیروز و دو روز قبل قابل ثبت یا ویرایش هستند.
              </p>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-[11px] font-black", STATUS_BADGE[selectedCell.status])}>
              {STATUS_LABELS[selectedCell.status]}
            </span>
          </div>

          <HabitLogForm
            habit={formHabit}
            date={selectedCell.dateIso}
            existingLog={selectedCell.existingLog}
            onSuccess={() => {
              void reloadLogs();
              setSelectedDate(null);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

const STATUS_STYLES: Record<DayStatus, string> = {
  completed: "border-[#007A5A] bg-[#009E73] text-[#FFFFFF]",
  growth: "border-[#A84600] bg-[#D55E00] text-[#FFFFFF]",
  proud: "border-[#9E4F7C] bg-[#CC79A7] text-[#FFFFFF]",
  loggable: "border-[#B8A900] bg-[#F0E442] text-[#2A2200]",
  planned: "border-[#00527F] bg-[#0072B2] text-[#FFFFFF]",
  missed: "border-[#A11D33] bg-[#C8374E] text-[#FFFFFF]",
  "not-planned": "border-[#666666] bg-[#8A8A8A] text-[#FFFFFF]",
  future: "border-[#C9BFAF] bg-[#E6E0D6] text-[#8A8177]",
};

const STATUS_DOT: Record<DayStatus, string> = {
  completed: "border-[#007A5A] bg-[#009E73] text-[#FFFFFF]",
  growth: "border-[#A84600] bg-[#D55E00] text-[#FFFFFF]",
  proud: "border-[#9E4F7C] bg-[#CC79A7] text-[#FFFFFF]",
  loggable: "border-[#B8A900] bg-[#F0E442] text-[#2A2200]",
  planned: "border-[#00527F] bg-[#0072B2] text-[#FFFFFF]",
  missed: "border-[#A11D33] bg-[#C8374E] text-[#FFFFFF]",
  "not-planned": "border-[#666666] bg-[#8A8A8A] text-[#FFFFFF]",
  future: "border-[#C9BFAF] bg-[#E6E0D6] text-[#8A8177]",
};

const STATUS_BADGE: Record<DayStatus, string> = {
  completed: "border border-[#007A5A] bg-[#009E73] text-[#FFFFFF]",
  growth: "border border-[#A84600] bg-[#D55E00] text-[#FFFFFF]",
  proud: "border border-[#9E4F7C] bg-[#CC79A7] text-[#FFFFFF]",
  loggable: "border border-[#B8A900] bg-[#F0E442] text-[#2A2200]",
  planned: "border border-[#00527F] bg-[#0072B2] text-[#FFFFFF]",
  missed: "border border-[#A11D33] bg-[#C8374E] text-[#FFFFFF]",
  "not-planned": "border border-[#666666] bg-[#8A8A8A] text-[#FFFFFF]",
  future: "border border-[#C9BFAF] bg-[#E6E0D6] text-[#8A8177]",
};

const STATUS_LABELS: Record<DayStatus, string> = {
  completed: "انجام‌شده",
  growth: "در رشد",
  proud: "با افتخار",
  loggable: "قابل ثبت",
  planned: "برنامه‌ریزی‌شده",
  missed: "رد شده / انجام‌نشده",
  "not-planned": "بدون برنامه",
  future: "آینده",
};

const SELECTED_DAY_STYLE =
  "border-2 border-[#8F5B46] bg-[#FFFFFF] text-[#5A2F1F] shadow-[inset_0_0_0_1px_#E7D8CC]";

function StatusMarker({
  status,
  selected = false,
}: {
  status: DayStatus;
  selected?: boolean;
}) {
  const iconClass = cn(
    "size-2.5",
    selected ? "text-[#8F5B46]" : status === "loggable" ? "text-[#2A2200]" : "text-current",
  );

  switch (status) {
    case "completed":
      return <Check className={iconClass} strokeWidth={3} aria-hidden="true" />;
    case "growth":
      return <Sprout className={iconClass} strokeWidth={2.4} aria-hidden="true" />;
    case "proud":
      return <Star className={iconClass} strokeWidth={2.4} aria-hidden="true" />;
    case "loggable":
      return <Plus className={iconClass} strokeWidth={2.8} aria-hidden="true" />;
    case "planned":
      return <span className={cn("block size-1.5 rounded-full", selected ? "bg-[#8F5B46]" : "bg-current")} aria-hidden="true" />;
    case "missed":
      return <X className={iconClass} strokeWidth={2.8} aria-hidden="true" />;
    case "not-planned":
      return <Minus className={iconClass} strokeWidth={2.8} aria-hidden="true" />;
    case "future":
      return <span className={cn("block size-1.5 rounded-full border", selected ? "border-[#8F5B46]" : "border-current")} aria-hidden="true" />;
  }
}
