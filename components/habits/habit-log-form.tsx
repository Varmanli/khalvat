"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatPersianNumber } from "@/lib/persian-numbers";
import { getTodayDateString } from "@/lib/habit-utils";
import type { Habit, HabitLog } from "@/db/schema";

type HabitLogFormHabit = Habit & {
  todayLog: HabitLog | null;
};

interface HabitLogFormProps {
  habit: HabitLogFormHabit;
  date?: string;
  existingLog?: HabitLog | null;
  onSuccess?: () => void;
}

export function HabitLogForm({
  habit,
  date,
  existingLog,
  onSuccess,
}: HabitLogFormProps) {
  const router = useRouter();
  const today = getTodayDateString();
  const logDate = date ?? today;

  const existing = existingLog ?? (date ? null : habit.todayLog);
  const [status, setStatus] = useState<"done" | "skipped">(existing?.status ?? "done");
  const [value, setValue] = useState<string>(
    existing?.value != null ? String(existing.value) : ""
  );
  const [note, setNote] = useState(existing?.note ?? "");
  const [loading, setLoading] = useState(false);

  const hasGoal = Boolean(habit.dailyGoal);
  const hasUnit = Boolean(habit.unit);
  const unitLabel = habit.unit || "مقدار";
  const goalLabel = hasGoal
    ? `هدف: ${formatPersianNumber(habit.dailyGoal!)} ${unitLabel}`
    : "";

  async function submit() {
    setLoading(true);
    const res = await fetch(`/api/habits/${habit.id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: logDate,
        status,
        value: value !== "" ? parseFloat(value) : null,
        note: note || null,
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.ok) {
      toast.error(json.error?.message ?? "خطایی رخ داد.");
      return;
    }

    toast.success(status === "done" ? "آفرین! ثبت شد." : "ثبت شد.");
    onSuccess?.();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Status toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStatus("done")}
          className={`flex-1 rounded-2xl border py-2.5 text-sm font-bold transition-all duration-150 ${
            status === "done"
              ? "border-success bg-success text-white"
              : "border-border bg-card text-muted hover:border-success/50"
          }`}
        >
          ✓ انجام شد
        </button>
        <button
          type="button"
          onClick={() => setStatus("skipped")}
          className={`flex-1 rounded-2xl border py-2.5 text-sm font-bold transition-all duration-150 ${
            status === "skipped"
              ? "border-muted bg-muted/20 text-foreground"
              : "border-border bg-card text-muted hover:border-muted/50"
          }`}
        >
          رد کردم
        </button>
      </div>

      {/* Value input */}
      {(hasGoal || hasUnit) && status === "done" && (
        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">
            {hasGoal ? `چقدر ${unitLabel} انجام دادی؟` : `مقدار ${unitLabel}`}
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={goalLabel || unitLabel}
            className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
          />
          {hasGoal && value && (
            <p className="mt-1 text-xs text-muted">
              {parseFloat(value) >= habit.dailyGoal!
                ? `🎯 هدف رسیدی! ${formatPersianNumber(value)} از ${formatPersianNumber(habit.dailyGoal!)} ${unitLabel}`
                : `${formatPersianNumber(value)} از ${formatPersianNumber(habit.dailyGoal!)} ${unitLabel}`}
            </p>
          )}
        </div>
      )}

      {/* Note */}
      <div>
        <label className="mb-1.5 block text-sm font-bold text-foreground">یادداشت (اختیاری)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="هر چیزی که می‌خوای یادت بمونه..."
          className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-soft/30"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="w-full rounded-2xl bg-primary py-3 text-sm font-black text-white shadow-[0_14px_36px_rgba(138,90,68,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark disabled:opacity-60"
      >
        {loading
          ? "در حال ذخیره..."
          : existing
            ? "ویرایش ثبت"
            : logDate === today
              ? "ثبت امروز"
              : "ثبت این روز"}
      </button>
    </div>
  );
}
