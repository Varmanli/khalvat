"use client";

import { cn } from "@/lib/utils";

export const PERSIAN_WEEKDAYS = [
  { value: 0, label: "شنبه" },
  { value: 1, label: "یکشنبه" },
  { value: 2, label: "دوشنبه" },
  { value: 3, label: "سه‌شنبه" },
  { value: 4, label: "چهارشنبه" },
  { value: 5, label: "پنجشنبه" },
  { value: 6, label: "جمعه" },
];

interface HabitRepeatPickerProps {
  repeatType: "daily" | "weekly";
  weeklyDays: number[];
  onRepeatTypeChange: (v: "daily" | "weekly") => void;
  onWeeklyDaysChange: (days: number[]) => void;
  error?: string;
}

export function HabitRepeatPicker({
  repeatType,
  weeklyDays,
  onRepeatTypeChange,
  onWeeklyDaysChange,
  error,
}: HabitRepeatPickerProps) {
  function toggleDay(day: number) {
    if (weeklyDays.includes(day)) {
      onWeeklyDaysChange(weeklyDays.filter((d) => d !== day));
    } else {
      onWeeklyDaysChange([...weeklyDays, day]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onRepeatTypeChange("daily")}
          className={cn(
            "rounded-2xl border px-4 py-2 text-sm font-bold transition-all duration-150",
            repeatType === "daily"
              ? "border-primary bg-primary text-white"
              : "border-border bg-card text-muted hover:border-primary-soft hover:text-primary"
          )}
        >
          هر روز
        </button>
        <button
          type="button"
          onClick={() => onRepeatTypeChange("weekly")}
          className={cn(
            "rounded-2xl border px-4 py-2 text-sm font-bold transition-all duration-150",
            repeatType === "weekly"
              ? "border-primary bg-primary text-white"
              : "border-border bg-card text-muted hover:border-primary-soft hover:text-primary"
          )}
        >
          روزهای هفته
        </button>
      </div>

      {repeatType === "weekly" && (
        <div className="flex flex-wrap gap-2">
          {PERSIAN_WEEKDAYS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleDay(value)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-sm font-bold transition-all duration-150",
                weeklyDays.includes(value)
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted hover:border-primary-soft hover:text-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
