import Link from "next/link";
import {
  AlarmClock,
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Folder,
  Target,
} from "lucide-react";

import { getHabitIcon } from "./habit-icons";
import { formatPersianNumber } from "@/lib/persian-numbers";
import type { HabitWithCategory } from "@/lib/habits";

interface HabitCardProps {
  habit: HabitWithCategory;
  doneToday?: boolean;
}

function formatTimeLabel(value?: string | null) {
  if (!value) return "";

  const [hour = "", minute = ""] = value.split(":");

  if (!hour || !minute) return "";

  return `${formatPersianNumber(hour.padStart(2, "0"))}:${formatPersianNumber(
    minute.padStart(2, "0"),
  )}`;
}

function getRepeatLabel(habit: HabitWithCategory) {
  if (habit.repeatType === "daily") {
    return "هر روز";
  }

  const count = Array.isArray(habit.weeklyDays) ? habit.weeklyDays.length : 0;

  if (!count) {
    return "روزهای هفته";
  }

  return `${formatPersianNumber(count)} روز در هفته`;
}

export function HabitCard({ habit, doneToday }: HabitCardProps) {
  const Icon = getHabitIcon(habit.icon);
  const isArchived = Boolean(habit.archivedAt);
  const hasGoal = Boolean(habit.dailyGoal);
  const reminderLabel = formatTimeLabel(habit.reminderTime);

  return (
    <Link
      href={`/habits/${habit.id}`}
      className={
        isArchived
          ? "group relative block overflow-hidden rounded-[1.9rem] border border-border bg-card/58 p-4 opacity-75 shadow-[0_14px_48px_rgba(94,58,47,0.045)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-soft hover:bg-card hover:opacity-100 hover:shadow-[0_20px_70px_rgba(94,58,47,0.08)]"
          : "group relative block overflow-hidden rounded-[1.9rem] border border-border bg-card p-4 shadow-[0_16px_55px_rgba(94,58,47,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_22px_80px_rgba(94,58,47,0.1)]"
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/12 opacity-80" />
      <div
        className="pointer-events-none absolute inset-y-5 right-0 w-1.5 rounded-l-full"
        style={{ backgroundColor: habit.color }}
      />
      <div className="pointer-events-none absolute -left-14 -top-14 size-40 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative flex items-start gap-4 pr-2">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-3xl text-white shadow-[0_14px_35px_rgba(94,58,47,0.18)] transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: habit.color }}
        >
          <Icon className="size-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={
                isArchived
                  ? "min-w-0 truncate text-base font-black text-muted"
                  : "min-w-0 truncate text-base font-black text-foreground"
              }
            >
              {habit.title}
            </h3>

            {doneToday && !isArchived && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-[11px] font-black text-success">
                <CheckCircle2 className="size-3.5" />
                امروز انجام شد
              </span>
            )}

            {isArchived && (
              <span className="inline-flex items-center gap-1 rounded-full bg-card-soft px-2.5 py-1 text-[11px] font-black text-muted">
                <Archive className="size-3.5" />
                آرشیو شده
              </span>
            )}
          </div>

          {habit.shortDescription ? (
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">
              {habit.shortDescription}
            </p>
          ) : (
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">
              یک عادت کوچک برای ادامه دادن آرام و بی‌فشار.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {hasGoal && (
              <MetaPill
                icon={<Target className="size-3.5" />}
                text={`هدف: ${formatPersianNumber(habit.dailyGoal)} ${
                  habit.unit || "مقدار"
                }`}
              />
            )}

            <MetaPill
              icon={<CalendarDays className="size-3.5" />}
              text={getRepeatLabel(habit)}
            />

            {reminderLabel && (
              <MetaPill
                icon={<AlarmClock className="size-3.5" />}
                text={reminderLabel}
              />
            )}

            {habit.category && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black text-white shadow-sm"
                style={{ backgroundColor: habit.category.color }}
              >
                <Folder className="size-3.5" />
                {habit.category.name}
              </span>
            )}
          </div>
        </div>

        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-background/70 text-muted transition-all duration-200 group-hover:-translate-x-0.5 group-hover:bg-primary-soft/35 group-hover:text-primary-dark">
          <ChevronLeft className="size-4" />
        </span>
      </div>

      <div className="relative mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold text-muted">
            برای دیدن جزئیات و ثبت روزها کلیک کن
          </p>

          <span className="text-xs font-black text-primary transition-colors group-hover:text-primary-dark">
            باز کردن عادت
          </span>
        </div>
      </div>
    </Link>
  );
}

function MetaPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-[11px] font-black text-muted">
      {icon}
      {text}
    </span>
  );
}
