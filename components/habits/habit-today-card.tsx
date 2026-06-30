"use client";

import { useState } from "react";
import Link from "next/link";
import { getHabitIcon } from "./habit-icon-picker";
import { HabitLogForm } from "./habit-log-form";
import { formatPersianNumber } from "@/lib/persian-numbers";
import type { HabitWithLog } from "@/lib/habits";

interface HabitTodayCardProps {
  habit: HabitWithLog;
}

export function HabitTodayCard({ habit }: HabitTodayCardProps) {
  const [showForm, setShowForm] = useState(false);
  const Icon = getHabitIcon(habit.icon);
  const log = habit.todayLog;

  const isDone = log?.status === "done";
  const isSkipped = log?.status === "skipped";

  const progressText = () => {
    if (!log) return null;
    if (isSkipped) return "رد شد";
    if (isDone) {
      if (habit.dailyGoal && log.value != null) {
        return `${formatPersianNumber(log.value)} از ${formatPersianNumber(habit.dailyGoal)} ${habit.unit || ""}`;
      }
      return "انجام شد";
    }
    return null;
  };

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_12px_40px_rgba(94,58,47,0.06)] transition-all duration-200"
    >
      {/* Accent bar */}
      <div className="absolute inset-y-0 right-0 w-1 rounded-l-full" style={{ backgroundColor: habit.color }} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ backgroundColor: habit.color }}
          >
            <Icon className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <Link href={`/habits/${habit.id}`} className="block truncate text-sm font-black text-foreground hover:text-primary">
              {habit.title}
            </Link>
            {habit.shortDescription && (
              <p className="mt-0.5 truncate text-xs text-muted">{habit.shortDescription}</p>
            )}

            {progressText() && (
              <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                isDone ? "bg-success/12 text-success" : "bg-card-soft text-muted"
              }`}>
                {isDone ? "✓" : "–"} {progressText()}
              </div>
            )}

            {habit.dailyGoal && !log && (
              <p className="mt-1 text-[11px] text-muted">
                هدف امروز: {formatPersianNumber(habit.dailyGoal)} {habit.unit || ""}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className={`shrink-0 rounded-2xl px-3 py-1.5 text-xs font-black transition-all duration-150 ${
              log
                ? "border border-border bg-card text-muted hover:border-primary-soft hover:text-primary"
                : "bg-primary text-white shadow-[0_8px_20px_rgba(138,90,68,0.25)] hover:bg-primary-dark"
            }`}
          >
            {log ? "ویرایش" : "ثبت"}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 border-t border-border pt-4">
            <HabitLogForm
              habit={habit}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
