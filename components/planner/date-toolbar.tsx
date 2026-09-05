"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JalaliDateTimePicker } from "@/components/ui/jalali-date-time-picker";

import { calendarStep, type CalendarView } from "@/lib/planner-dates";

import { toGregorianIso } from "@/lib/date";

export function DateToolbar({
  date,
  view = "day",
  calendar = false,
  basePath,
}: {
  date: string;
  view?: CalendarView;
  calendar?: boolean;
  basePath?: "/planner" | "/today";
}) {
  const router = useRouter();

  const url = (day: string, mode = view) =>
    `${calendar ? "/calendar" : basePath ?? "/planner"}?date=${day}${
      calendar ? `&view=${mode}` : ""
    }`;

  return (
    <nav
      aria-label="انتخاب تاریخ"
      className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
    >
      {/* Mobile: two intentional rows */}
      <div className="grid w-full gap-2 lg:hidden">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="min-w-0">
            <JalaliDateTimePicker
              value={`${date}T12:00:00`}
              onChange={(value) => {
                if (!value) return;
                router.push(url(toGregorianIso(new Date(value))));
              }}
              className="min-w-0"
            />
          </div>

          <Link
            href={calendar ? "/calendar" : basePath === "/today" ? "/today" : "/planner"}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-border bg-background/70 px-3 text-xs font-black text-primary-dark shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-primary-soft/25"
          >
            <RotateCcw className="size-3.5" />
            امروز
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(url(calendarStep(date, view, -1)))}
            className="h-10 w-full rounded-2xl border border-border bg-background/60 text-xs font-black text-muted shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-card hover:text-primary-dark"
          >
            <ChevronRight className="size-4" />
            قبلی
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(url(calendarStep(date, view, 1)))}
            className="h-10 w-full rounded-2xl border border-border bg-background/60 text-xs font-black text-muted shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-card hover:text-primary-dark"
          >
            بعدی
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </div>

      {/* Date navigation */}
      <div className="hidden min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap lg:flex">
        <Link
          href={calendar ? "/calendar" : basePath === "/today" ? "/today" : "/planner"}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 text-xs font-black text-primary-dark shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-primary-soft/25"
        >
          <RotateCcw className="size-3.5" />
          امروز
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="بازه قبل"
          onClick={() => router.push(url(calendarStep(date, view, -1)))}
          className="size-10 shrink-0 rounded-xl border border-border bg-background/60 text-muted shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-card hover:text-primary-dark"
        >
          <ChevronRight className="size-4" />
        </Button>

        <div className="min-w-45 flex-1 sm:w-56 sm:flex-none">
          <JalaliDateTimePicker
            value={`${date}T12:00:00`}
            onChange={(value) => {
              if (!value) return;
              router.push(url(toGregorianIso(new Date(value))));
            }}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="بازه بعد"
          onClick={() => router.push(url(calendarStep(date, view, 1)))}
          className="size-10 shrink-0 rounded-xl border border-border bg-background/60 text-muted shadow-sm transition-all duration-200 hover:border-primary-soft hover:bg-card hover:text-primary-dark"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {/* View switcher */}
      {calendar && (
        <div className="flex shrink-0 items-center gap-1 rounded-[1.15rem] border border-border bg-background/55 p-1 shadow-sm">
          {(
            [
              ["month", "ماه"],
              ["week", "هفته"],
              ["day", "روز"],
            ] as const
          ).map(([mode, label]) => {
            const active = view === mode;

            return (
              <Link
                key={mode}
                href={url(date, mode)}
                aria-current={active ? "page" : undefined}
                className={[
                  "inline-flex h-9 min-w-14 items-center justify-center rounded-xl px-3 text-xs font-black transition-all duration-200",
                  active
                    ? "bg-card text-primary-dark shadow-[0_5px_16px_rgba(94,58,47,0.08)]"
                    : "text-muted hover:bg-card/70 hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
